<script lang="ts">
	import type { WordObject } from '$lib/types';
	import SegmentSpan from './SegmentSpan.svelte';

	let {
		word,
		onToggleMark
	}: {
		word: WordObject;
		onToggleMark: (wordId: string) => void;
	} = $props();

	function handleClick(event: MouseEvent) {
		// Prevent triggering if user is selecting text (drag)
		const selection = window.getSelection();
		if (selection && !selection.isCollapsed) return;

		onToggleMark(word.id);
	}
</script>

<span
	class="word-display"
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
>
	{#each word.segments as segment (segment.id)}
		<SegmentSpan {segment} />
	{/each}
</span>

<style>
	.word-display {
		display: inline-block;
		cursor: pointer;
		border-radius: var(--radius-xs);
		padding: 0 2.7px;
		user-select: text;
	}

	.word-display:hover {
		outline: 1px solid var(--color-gray-300);
	}
</style>
