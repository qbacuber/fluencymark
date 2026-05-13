<script lang="ts">
	import { documentStore } from '$lib/stores/documentStore.svelte';

	/** Strip leading and trailing punctuation, then lowercase */
	function cleanText(text: string): string {
		return text.replace(/^[.,?!;:—–\-…\u2026"'„"«»()\[\]{}]+/, '')
			.replace(/[.,?!;:—–\-…\u2026"'„"«»()\[\]{}]+$/, '')
			.toLowerCase();
	}

	// Derive sorted list of marked word texts (cleaned)
	let markedWordTexts = $derived(
		documentStore.words
			.filter((w) => w.isMarked)
			.map((w) => cleanText(w.text))
			.filter((text) => text.length > 0)
			.sort((a, b) => a.localeCompare(b, 'pl'))
	);

	let markedCount = $derived(
		documentStore.words.filter((w) => w.isMarked).length
	);

	function handlePrint() {
		window.print();
	}
</script>

<div class="print-view">
	<h1>Podsumowanie</h1>

	{#if markedCount > 0}
		<p class="word-count">Liczba zaznaczonych słów: {markedCount}</p>

		<ul class="summary-list">
			{#each markedWordTexts as word, i (i)}
				<li>{word}</li>
			{/each}
		</ul>

		<button class="print-button" onclick={handlePrint}>Drukuj</button>
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
		font-size: 10pt;
		line-height: 1.5;
		letter-spacing: 0.02em;
	}

	.print-button {
		margin-top: var(--space-4);
		padding: var(--space-2) var(--space-4);
		font-size: 10pt;
		cursor: pointer;
	}

	@media print {
		.print-button {
			display: none;
		}
	}
</style>
