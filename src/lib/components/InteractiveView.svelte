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

	let importError = $state('');

	function handleExport() {
		const json = documentStore.exportToJson();
		const blob = new Blob([json], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'fluencymark-session.json';
		a.click();
		URL.revokeObjectURL(url);
	}

	function handleImport() {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = '.json';
		input.onchange = () => {
			const file = input.files?.[0];
			if (!file) return;
			const reader = new FileReader();
			reader.onload = () => {
				const text = reader.result as string;
				const success = documentStore.importFromJson(text);
				if (!success) {
					importError = 'Nieprawidłowy plik JSON. Sprawdź format.';
					setTimeout(() => (importError = ''), 4000);
				} else {
					importError = '';
				}
			};
			reader.readAsText(file);
		};
		input.click();
	}

	function handleToggleMark(wordId: string) {
		const word = documentStore.words.find((w) => w.id === wordId);
		if (!word) return;

		const hasMarked = word.segments.some((s) => s.isMarked);

		if (hasMarked) {
			// Unmark: merge all segments back into a single unmarked segment
			const fullText = word.segments.map((s) => s.text).join('');
			const updatedWord = {
				...word,
				segments: [
					{
						id: word.segments[0].id,
						text: fullText,
						isMarked: false
					}
				]
			};
			documentStore.updateWord(wordId, updatedWord);
		} else {
			// Mark: mark all segments as block disfluency
			const fullText = word.segments.map((s) => s.text).join('');
			const updatedWord = {
				...word,
				segments: [
					{
						id: word.segments[0].id,
						text: fullText,
						isMarked: true,
						type: 'block' as const
					}
				]
			};
			documentStore.updateWord(wordId, updatedWord);
		}
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
		// Resolve container/offset to a text-level position
		// When the browser sets the container to an Element (not a Text node),
		// the offset refers to the child index, not character offset.
		function resolveToTextPosition(container: Node, offset: number): { node: Node; offset: number } | null {
			if (container.nodeType === Node.TEXT_NODE) {
				return { node: container, offset };
			}
			// Container is an element — offset is child index
			const children = container.childNodes;
			if (offset < children.length) {
				// Find the first text node at or after this child
				const child = children[offset];
				const walker = document.createTreeWalker(child, NodeFilter.SHOW_TEXT);
				const firstText = walker.nextNode();
				if (firstText) return { node: firstText, offset: 0 };
			}
			// offset === children.length means "after all children" — find last text node
			if (children.length > 0) {
				const lastChild = children[children.length - 1];
				const walker = document.createTreeWalker(lastChild, NodeFilter.SHOW_TEXT);
				let lastText: Node | null = null;
				let n: Node | null;
				while ((n = walker.nextNode())) lastText = n;
				if (lastText) return { node: lastText, offset: lastText.textContent?.length ?? 0 };
			}
			return null;
		}

		const startPos = resolveToTextPosition(range.startContainer, range.startOffset);
		const endPos = resolveToTextPosition(range.endContainer, range.endOffset);

		if (!startPos || !endPos) return { startOffset: 0, endOffset: 0 };

		const treeWalker = document.createTreeWalker(wordElement, NodeFilter.SHOW_TEXT);

		let startCharOffset = 0;
		let endCharOffset = 0;
		let charCount = 0;
		let foundStart = false;
		let foundEnd = false;
		let node: Node | null;

		while ((node = treeWalker.nextNode())) {
			if (node === startPos.node) {
				startCharOffset = charCount + startPos.offset;
				foundStart = true;
			}
			if (node === endPos.node) {
				endCharOffset = charCount + endPos.offset;
				foundEnd = true;
				break;
			}
			charCount += node.textContent?.length ?? 0;
		}

		if (!foundStart || !foundEnd) return { startOffset: 0, endOffset: 0 };

		return { startOffset: startCharOffset, endOffset: endCharOffset };
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="interactive-container" onmouseup={handleMouseUp}>
	<div class="header-bar">
		<h1>FluencyMark — Widok interaktywny</h1>
		<div class="header-actions">
			<button
				class="btn-secondary"
				onclick={handleImport}
			>
				Importuj JSON
			</button>
			<button
				class="btn-secondary"
				onclick={handleExport}
			>
				Eksportuj JSON
			</button>
			<button
				class="btn-secondary"
				onclick={() => documentStore.returnToEdit()}
			>
				Wróć do edycji
			</button>
			<a
				class="btn-secondary"
				href="/compare"
			>
				Porównaj próby
			</a>
			<button
				class="btn-primary"
				onclick={() => window.print()}
			>
				Drukuj do PDF
			</button>
		</div>
	</div>

	{#if importError}
		<p class="import-error">{importError}</p>
	{/if}

	<div class="text-content">
		{#each documentStore.words as word (word.id)}
			<WordDisplay {word} onToggleMark={handleToggleMark} />
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

<style>
	.interactive-container {
		display: flex;
		flex-direction: column;
		height: 100%;
		padding: var(--space-6);
	}

	.header-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: var(--space-6);
	}

	.header-bar h1 {
		margin: 0;
	}

	.header-actions {
		display: flex;
		gap: var(--space-3);
	}

	.import-error {
		color: var(--color-danger);
		font-size: 0.875rem;
		font-weight: 500;
		margin: 0 0 var(--space-4) 0;
		text-align: center;
	}

	.btn-secondary {
		background-color: var(--color-gray-100);
		color: var(--color-gray-700);
		border: none;
		border-radius: var(--radius-sm);
		padding: var(--space-2) var(--space-4);
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: background-color 0.15s;
	}

	.btn-secondary:hover {
		background-color: var(--color-gray-300);
	}

	.btn-primary {
		background-color: var(--color-primary);
		color: var(--color-white);
		border: none;
		border-radius: var(--radius-sm);
		padding: var(--space-2) var(--space-4);
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: opacity 0.15s;
	}

	.btn-primary:hover {
		opacity: 0.9;
	}

	.text-content {
		text-align: justify;
		max-width: 72ch;
		margin: 0 auto;
		padding: 0 var(--space-6);
		font-size: 1.2rem;
		line-height: 1.6;
		hyphens: auto;
		-webkit-hyphens: auto;
		-ms-hyphens: auto;
		text-justify: inter-word;
		letter-spacing: 0.05em;
	}
</style>
