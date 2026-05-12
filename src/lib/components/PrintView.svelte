<script lang="ts">
	import { documentStore } from '$lib/stores/documentStore.svelte';
	import { DISFLUENCY_TYPES } from '$lib/types';

	// Derive summary of marked words
	let markedWords = $derived(
		documentStore.words
			.filter((w) => w.segments.some((s) => s.isMarked))
			.map((w) => {
				const markedSegment = w.segments.find((s) => s.isMarked);
				return {
					text: w.text,
					typeLabel: markedSegment?.type ? DISFLUENCY_TYPES[markedSegment.type].label : '',
					note: markedSegment?.note
				};
			})
	);
</script>

<div class="print-view">
	<h1>Podsumowanie</h1>

	
	{#if markedWords.length > 0}
			<ul class="summary-list">
				{#each markedWords as entry}
					<li>
						<strong>{entry.text}</strong> → {entry.typeLabel}{#if entry.note} + {entry.note}{/if}
					</li>
				{/each}
			</ul>
		
	{/if}
</div>

<style>
	h1 {
		margin-bottom: var(--space-6);
	}
	.summary-list {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.summary-list li {
		padding: var(--space-1) 0;
		font-size: 0.875rem;
	}
</style>
