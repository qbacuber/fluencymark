<script lang="ts">
	import type { WordObject } from '$lib/types';
	import SegmentSpan from './SegmentSpan.svelte';

	let {
		word,
		onWordClick
	}: {
		word: WordObject;
		onWordClick?: (wordId: string, segmentId: string, element: HTMLElement) => void;
	} = $props();

	function handleClick(event: MouseEvent) {
		const target = event.currentTarget as HTMLElement;
		// Default to first segment for whole-word click
		const firstSegment = word.segments[0];
		if (firstSegment && onWordClick) {
			onWordClick(word.id, firstSegment.id, target);
		}
	}
</script>

<span
	class="inline-block cursor-pointer rounded px-0.5 hover:outline hover:outline-1 hover:outline-gray-400"
	data-word-id={word.id}
	onclick={handleClick}
	role="button"
	tabindex="0"
	onkeydown={(e) => {
		if (e.key === 'Enter' || e.key === ' ') handleClick(e as unknown as MouseEvent);
	}}
>
	{#each word.segments as segment (segment.id)}
		<SegmentSpan {segment} />
	{/each}
</span>
