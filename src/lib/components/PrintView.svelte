<script lang="ts">
	import { documentStore } from '$lib/stores/documentStore.svelte';
	import { DISFLUENCY_TYPES } from '$lib/types';

	/** Strip punctuation: . , ? ! — – … and trim */
	function cleanText(text: string): string {
		return text.replace(/[.,?!;:—–\-…\u2026]+/g, '').trim();
	}

	// Derive summary of marked words with full segment info
	let markedWords = $derived(
		documentStore.words
			.filter((w) => w.segments.some((s) => s.isMarked))
			.map((w) => {
				const markedSegment = w.segments.find((s) => s.isMarked)!;
				return {
					segments: w.segments.map((s) => ({
						...s,
						text: cleanText(s.text).toLowerCase()
					})).filter((s) => s.text.length > 0),
					typeLabel: markedSegment.type ? DISFLUENCY_TYPES[markedSegment.type].label : '',
					color: markedSegment.type ? DISFLUENCY_TYPES[markedSegment.type].color : '',
					bgColor: markedSegment.type ? DISFLUENCY_TYPES[markedSegment.type].bgColor : '',
					note: markedSegment.note,
					sortKey: cleanText(w.segments.map((s) => s.text).join('')).toLowerCase()
				};
			})
			.filter((entry) => entry.sortKey.length > 0)
			.sort((a, b) => a.sortKey.localeCompare(b.sortKey, 'pl'))
	);
</script>

<div class="print-view">
	<h1>Podsumowanie</h1>

	{#if markedWords.length > 0}
		<p class="word-count">Liczba zaznaczonych słów: {markedWords.length}</p>

		<ul class="summary-list">
			{#each markedWords as entry, i (i)}
				<li>
					<span class="word-with-badge">
						{#each entry.segments as segment (segment.id)}
							{#if segment.isMarked}
								<span
									class="segment-span marked"
									style="--badge-bg: {entry.bgColor}; --badge-border: {entry.color};"
								>{segment.text}</span>
							{:else}
								<span class="segment-span">{segment.text}</span>
							{/if}
						{/each}
					</span>
					<span>
						- {entry.typeLabel}
					</span>
					{#if entry.note}
						<span class="note">{entry.note}</span>
					{/if}
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.print-view {
		padding: var(--space-6) var(--space-8);
	}

	h1 {
		font-size: 16pt;
		margin-bottom: 12pt;
	}

	.word-count {
		font-size: 11pt;
		font-weight: 600;
		margin: 0 0 8pt 0;
		color: var(--color-gray-700);
	}

	.summary-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 2pt;
	}

	.summary-list li {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		font-size: 10pt;
		line-height: 1.5;
		letter-spacing: 0.02em;
	}

	.segment-span {
		position: relative;
		z-index: 5;
	}

	.segment-span.marked {
		isolation: isolate;
		z-index: 0;
	}

	.segment-span.marked::before {
		content: '';
		position: absolute;
		inset: -2px -4px;
		top: 3px;
		background-color: var(--badge-bg);
		opacity: 1;
		border-radius: var(--radius-xs);
		z-index: -4;
		pointer-events: none;
	}

	.note {
		font-size: 8pt;
	}
</style>
