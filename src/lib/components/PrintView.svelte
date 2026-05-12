<script lang="ts">
	import { documentStore } from '$lib/stores/documentStore.svelte';
	import { DISFLUENCY_TYPES, type DisfluencyType } from '$lib/types';
	import { generateFootnotes } from '$lib/utils/footnotes';

	// Generate footnotes from current words
	let footnotes = $derived(generateFootnotes(documentStore.words));

	// Build a map of segmentId -> footnote number for inline references
	let footnoteMap = $derived(
		new Map(footnotes.map((f) => [f.segmentId, f.number]))
	);

	// Determine which disfluency types are actually used
	let usedTypes = $derived(() => {
		const types = new Set<DisfluencyType>();
		for (const word of documentStore.words) {
			for (const segment of word.segments) {
				if (segment.isMarked && segment.type) {
					types.add(segment.type);
				}
			}
		}
		return types;
	});
</script>

<div class="print-view hidden print:block p-8">
	<h1 class="text-xl font-bold mb-4">FluencyMark — Raport</h1>

	<div class="flex flex-wrap gap-1 text-base leading-relaxed mb-8">
		{#each documentStore.words as word (word.id)}
			<span class="inline-block">
				{#each word.segments as segment (segment.id)}
					<span
						style={segment.isMarked && segment.type
							? `background-color: ${DISFLUENCY_TYPES[segment.type].printColor};`
							: ''}
					>
						{segment.text}{#if footnoteMap.get(segment.id)}<sup class="text-xs font-bold"
								>{footnoteMap.get(segment.id)}</sup
							>{/if}
					</span>
				{/each}
			</span>
		{/each}
	</div>

	<!-- Color Legend -->
	{#if usedTypes().size > 0}
		<div class="border-t border-gray-300 pt-4 mt-8">
			<h2 class="text-lg font-semibold mb-2">Legenda</h2>
			<div class="flex gap-6">
				{#each Object.values(DISFLUENCY_TYPES) as config}
					{#if usedTypes().has(config.type)}
						<div class="flex items-center gap-2">
							<span
								class="inline-block w-4 h-4 rounded"
								style="background-color: {config.printColor};"
							></span>
							<span class="text-sm">{config.label}</span>
						</div>
					{/if}
				{/each}
			</div>
		</div>
	{/if}

	<!-- Footnotes -->
	{#if footnotes.length > 0}
		<div class="border-t border-gray-300 pt-4 mt-4">
			<h2 class="text-lg font-semibold mb-2">Przypisy</h2>
			<ol class="list-decimal list-inside text-sm space-y-1">
				{#each footnotes as footnote (footnote.segmentId)}
					<li><sup>{footnote.number}</sup> {footnote.note}</li>
				{/each}
			</ol>
		</div>
	{/if}
</div>
