<script lang="ts">
	import { DISFLUENCY_TYPES, type Segment } from '$lib/types';

	let { segment, footnoteNumber }: { segment: Segment; footnoteNumber?: number } = $props();

	let isMarked = $derived(segment.isMarked && !!segment.type);
</script>

<span
	class="segment-span"
	class:marked={isMarked}
	style={isMarked
		? `--badge-bg: ${DISFLUENCY_TYPES[segment.type!].bgColor}; --badge-border: ${DISFLUENCY_TYPES[segment.type!].color};`
		: ''}
>{segment.text}{#if footnoteNumber}<sup class="footnote-number">{footnoteNumber}</sup>{/if}</span>

<style>
.segment-span {
	position: relative;
	z-index: 0;
}

.segment-span.marked {
	isolation: isolate;
}

.segment-span.marked::before {
	content: '';
	position: absolute;
	inset: -2px -4px;
	top: 3px;
	background-color: var(--badge-bg);
	border: 1.5px solid var(--badge-border);
	border-radius: var(--radius-sm);
	z-index: -1;
	pointer-events: none;
}

.footnote-number {
	font-size: 1em;
	font-weight: 700;
	color: var(--color-gray-500);
	margin-left: 2px;
}
</style>
