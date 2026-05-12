<script lang="ts">
	import { DISFLUENCY_TYPES, type Segment } from '$lib/types';

	let { segment, footnoteNumber }: { segment: Segment; footnoteNumber?: number } = $props();
</script>

<span class={segment.isMarked && segment.type ? DISFLUENCY_TYPES[segment.type].color : ''}
	>{segment.text}{#if footnoteNumber}<sup class="text-xs font-bold text-gray-600 ml-0.5"
			>{footnoteNumber}</sup
		>{/if}</span
>
