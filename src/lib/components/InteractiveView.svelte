<script lang="ts">
	import { documentStore } from '$lib/stores/documentStore.svelte';
	import { splitSegment, markSegment, unmarkSegment } from '$lib/utils/segmentUtils';
	import type { DisfluencyType } from '$lib/types';
	import WordDisplay from './WordDisplay.svelte';
	import ContextMenu from './ContextMenu.svelte';

	interface MenuState {
		visible: boolean;
		x: number;
		y: number;
		wordId: string;
		segmentId: string;
		isMarked: boolean;
		currentNote?: string;
	}

	let menu = $state<MenuState>({
		visible: false,
		x: 0,
		y: 0,
		wordId: '',
		segmentId: '',
		isMarked: false,
		currentNote: undefined
	});

	function handleWordClick(wordId: string, segmentId: string, element: HTMLElement) {
		const rect = element.getBoundingClientRect();
		const word = documentStore.words.find((w) => w.id === wordId);
		const segment = word?.segments.find((s) => s.id === segmentId);

		menu = {
			visible: true,
			x: rect.left,
			y: rect.bottom + 4,
			wordId,
			segmentId,
			isMarked: segment?.isMarked ?? false,
			currentNote: segment?.note
		};
	}

	function handleMark(type: DisfluencyType, note?: string) {
		const word = documentStore.words.find((w) => w.id === menu.wordId);
		if (!word) return;

		const updated = markSegment(word, menu.segmentId, type, note);
		documentStore.updateWord(menu.wordId, updated);
		closeMenu();
	}

	function handleRemove() {
		const word = documentStore.words.find((w) => w.id === menu.wordId);
		if (!word) return;

		const updated = unmarkSegment(word, menu.segmentId);
		documentStore.updateWord(menu.wordId, updated);
		closeMenu();
	}

	function closeMenu() {
		menu = { ...menu, visible: false };
	}

	function handleMouseUp() {
		const selection = window.getSelection();
		if (!selection || selection.isCollapsed) return;

		const range = selection.getRangeAt(0);

		// Find the WordDisplay container for start
		const startWordEl = findWordContainer(range.startContainer);
		if (!startWordEl) {
			selection.removeAllRanges();
			return;
		}

		// Find the WordDisplay container for end
		const endWordEl = findWordContainer(range.endContainer);
		if (!endWordEl) {
			selection.removeAllRanges();
			return;
		}

		// Reject cross-word selections
		if (startWordEl !== endWordEl) {
			selection.removeAllRanges();
			return;
		}

		const wordId = startWordEl.dataset.wordId;
		if (!wordId) {
			selection.removeAllRanges();
			return;
		}

		// Calculate character offsets within the word
		const { startOffset, endOffset } = calculateOffsets(startWordEl, range);
		if (startOffset === endOffset) {
			selection.removeAllRanges();
			return;
		}

		const word = documentStore.words.find((w) => w.id === wordId);
		if (!word) {
			selection.removeAllRanges();
			return;
		}

		// Find which segment and local offsets the selection falls into
		let charCount = 0;
		let targetSegmentIndex = -1;
		let localStart = 0;
		let localEnd = 0;

		for (let i = 0; i < word.segments.length; i++) {
			const segLen = word.segments[i].text.length;
			if (startOffset >= charCount && startOffset < charCount + segLen) {
				targetSegmentIndex = i;
				localStart = startOffset - charCount;
				localEnd = Math.min(endOffset - charCount, segLen);
				break;
			}
			charCount += segLen;
		}

		if (targetSegmentIndex === -1) {
			selection.removeAllRanges();
			return;
		}

		// Split the segment
		const updatedWord = splitSegment(word, targetSegmentIndex, localStart, localEnd);
		documentStore.updateWord(wordId, updatedWord);

		// Find the newly created segment (the selected portion)
		let newCharCount = 0;
		let newSegmentId = '';
		for (const seg of updatedWord.segments) {
			if (newCharCount === startOffset) {
				newSegmentId = seg.id;
				break;
			}
			newCharCount += seg.text.length;
		}

		// Show context menu at selection position
		const rect = startWordEl.getBoundingClientRect();
		menu = {
			visible: true,
			x: rect.left,
			y: rect.bottom + 4,
			wordId,
			segmentId: newSegmentId || updatedWord.segments[targetSegmentIndex]?.id || '',
			isMarked: false,
			currentNote: undefined
		};

		selection.removeAllRanges();
	}

	function findWordContainer(node: Node): HTMLElement | null {
		let current: Node | null = node;
		while (current) {
			if (current instanceof HTMLElement && current.dataset.wordId) {
				return current;
			}
			current = current.parentElement;
		}
		return null;
	}

	function calculateOffsets(
		wordElement: HTMLElement,
		range: Range
	): { startOffset: number; endOffset: number } {
		const treeWalker = document.createTreeWalker(wordElement, NodeFilter.SHOW_TEXT);

		let startOffset = 0;
		let endOffset = 0;
		let charCount = 0;
		let node: Node | null;

		while ((node = treeWalker.nextNode())) {
			if (node === range.startContainer) {
				startOffset = charCount + range.startOffset;
			}
			if (node === range.endContainer) {
				endOffset = charCount + range.endOffset;
				break;
			}
			charCount += (node.textContent?.length ?? 0);
		}

		return { startOffset, endOffset };
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="flex flex-col h-full p-6" onmouseup={handleMouseUp}>
	<div class="flex items-center justify-between mb-6">
		<h1 class="text-2xl font-bold text-gray-800">FluencyMark — Widok interaktywny</h1>
		<div class="flex gap-3">
			<button
				class="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 transition-colors"
				onclick={() => documentStore.returnToEdit()}
			>
				Wróć do edycji
			</button>
			<button
				class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
				onclick={() => window.print()}
			>
				Drukuj do PDF
			</button>
		</div>
	</div>

	<div class="flex flex-wrap gap-1 text-lg leading-relaxed select-text">
		{#each documentStore.words as word (word.id)}
			<WordDisplay {word} onWordClick={handleWordClick} />
		{/each}
	</div>

	{#if menu.visible}
		<ContextMenu
			x={menu.x}
			y={menu.y}
			wordId={menu.wordId}
			segmentId={menu.segmentId}
			isMarked={menu.isMarked}
			currentNote={menu.currentNote}
			onMark={handleMark}
			onRemove={handleRemove}
			onClose={closeMenu}
		/>
	{/if}
</div>
