<script lang="ts">
	import type { WordObject } from '$lib/types';
	import { settingsStore } from '$lib/stores/settingsStore.svelte';

	let {
		word,
		onToggleMark,
		readonly = false,
		highlighted = false
	}: {
		word: WordObject;
		onToggleMark?: (wordId: string) => void;
		readonly?: boolean;
		highlighted?: boolean;
	} = $props();

	function handleClick(event: MouseEvent) {
		if (readonly) return;
		const selection = window.getSelection();
		if (selection && !selection.isCollapsed) {
			selection.removeAllRanges();
			return;
		}
		if (onToggleMark) onToggleMark(word.id);
	}

	// Dynamic segment calculation for text bolding/underlining helpers
	let segments = $derived.by(() => {
		const result: { text: string; isHighlight: boolean }[] = [];
		const activeLetters = settingsStore.activeLettersSet;
		if (activeLetters.size === 0) {
			return [{ text: word.text, isHighlight: false }];
		}

		let currentText = '';
		let currentHighlight = false;

		for (let i = 0; i < word.text.length; i++) {
			const char = word.text[i];
			const isHighlight = activeLetters.has(char.toLowerCase());

			if (i === 0) {
				currentText = char;
				currentHighlight = isHighlight;
			} else if (isHighlight === currentHighlight) {
				currentText += char;
			} else {
				result.push({ text: currentText, isHighlight: currentHighlight });
				currentText = char;
				currentHighlight = isHighlight;
			}
		}

		if (currentText) {
			result.push({ text: currentText, isHighlight: currentHighlight });
		}

		return result;
	});
</script>

<span
	class="word-display"
	class:marked={word.isMarked}
	class:highlighted
	class:readonly
	data-word-id={word.id}
	onclick={handleClick}
	role={readonly ? undefined : 'button'}
	tabindex={readonly ? undefined : 0}
	aria-pressed={readonly ? undefined : word.isMarked}
	onkeydown={(e) => {
		if (readonly) return;
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			if (onToggleMark) onToggleMark(word.id);
		}
	}}
>{#each segments as segment}{#if segment.isHighlight}<span class="styled-letter" class:bold={settingsStore.boldEnabled} class:underline={settingsStore.underlineEnabled}>{segment.text}</span>{:else}{segment.text}{/if}{/each}</span>

<style>
	.word-display {
		display: inline;
		position: relative;
		z-index: 0;
		cursor: pointer;
		border-radius: var(--radius-xs);
		padding: 0 3px;
		user-select: none;
		-webkit-user-select: none;
	}

	.word-display:not(.readonly):hover {
		outline: 1px solid var(--color-gray-300);
	}

	.word-display.readonly {
		cursor: text;
	}

	.word-display.marked::before {
		content: '';
		position: absolute;
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;
		background-color: var(--color-primary-100, #dbeafe);
		border: 1px solid var(--color-primary-400, #60a5fa);
		border-radius: var(--radius-xs);
		z-index: -1;
		pointer-events: none;
	}

	.word-display.highlighted::before {
		content: '';
		position: absolute;
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;
		background-color: var(--color-highlight-bg, #fff3e0);
		border: 1px solid var(--color-highlight-border, #fb8c00);
		border-radius: var(--radius-xs);
		z-index: -1;
		pointer-events: none;
	}

	.styled-letter.bold {
		font-weight: 800;
	}

	.styled-letter.underline {
		text-decoration: underline;
		text-decoration-thickness: 2px;
		text-underline-offset: 2px;
	}
</style>
