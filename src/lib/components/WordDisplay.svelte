<script lang="ts">
	import type { WordObject } from '$lib/types';

	let {
		word,
		onToggleMark,
		readonly = false
	}: {
		word: WordObject;
		onToggleMark?: (wordId: string) => void;
		readonly?: boolean;
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
</script>

<span
	class="word-display"
	class:marked={word.isMarked}
	class:readonly
	data-word-id={word.id}
	onclick={handleClick}
	role={readonly ? undefined : 'button'}
	tabindex={readonly ? undefined : 0}
	onkeydown={(e) => {
		if (readonly) return;
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			if (onToggleMark) onToggleMark(word.id);
		}
	}}
>{word.text}</span>

<style>
	.word-display {
		display: inline;
		position: relative;
		z-index: 0;
		cursor: pointer;
		border-radius: var(--radius-xs);
		padding: 0 3px;
		user-select: text;
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
</style>
