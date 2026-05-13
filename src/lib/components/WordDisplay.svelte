<script lang="ts">
	import type { WordObject } from '$lib/types';

	let {
		word,
		onToggleMark
	}: {
		word: WordObject;
		onToggleMark: (wordId: string) => void;
	} = $props();

	function handleClick(event: MouseEvent) {
		const selection = window.getSelection();
		if (selection && !selection.isCollapsed) {
			selection.removeAllRanges();
			return;
		}
		onToggleMark(word.id);
	}
</script>

<span
	class="word-display"
	class:marked={word.isMarked}
	data-word-id={word.id}
	onclick={handleClick}
	role="button"
	tabindex="0"
	onkeydown={(e) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			onToggleMark(word.id);
		}
	}}
>{word.text}</span>

<style>
	.word-display {
		display: inline;
		cursor: pointer;
		border-radius: var(--radius-xs);
		padding: 0 3px;
		user-select: text;
	}

	.word-display:hover {
		outline: 1px solid var(--color-gray-300);
	}

	.word-display.marked {
		background-color: var(--color-primary-100, #dbeafe);
		border: 1px solid var(--color-primary-400, #60a5fa);
		border-radius: var(--radius-xs);
	}
</style>
