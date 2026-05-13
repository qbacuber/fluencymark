<script lang="ts">
	import type { WordObject } from '$lib/types';
	import { DISFLUENCY_TYPES } from '$lib/types';
	import type { ExportData } from '$lib/stores/documentStore.svelte';
	import { validateExportData, reconstructWords } from '$lib/utils/compareUtils';
	import SegmentSpan from '$lib/components/SegmentSpan.svelte';

	interface AttemptState {
		exportData: ExportData;
		words: WordObject[];
	}

	let attempt1 = $state<AttemptState | null>(null);
	let attempt2 = $state<AttemptState | null>(null);
	let error = $state<string>('');
	let errorTimeout: ReturnType<typeof setTimeout> | null = null;

	let markedCount1 = $derived(
		attempt1 ? attempt1.words.filter((w) => w.segments.some((s) => s.isMarked)).length : 0
	);
	let markedCount2 = $derived(
		attempt2 ? attempt2.words.filter((w) => w.segments.some((s) => s.isMarked)).length : 0
	);

	function cleanText(text: string): string {
		return text.replace(/[.,?!;):—–\-…\u2026]+/g, '').trim();
	}

	function getMarkedWords(words: WordObject[]) {
		return words
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
			.sort((a, b) => a.sortKey.localeCompare(b.sortKey, 'pl'));
	}

	let markedWords1 = $derived(attempt1 ? getMarkedWords(attempt1.words) : []);
	let markedWords2 = $derived(attempt2 ? getMarkedWords(attempt2.words) : []);
	function setError(message: string) {
		error = message;
		if (errorTimeout) {
			clearTimeout(errorTimeout);
		}
		errorTimeout = setTimeout(() => {
			error = '';
			errorTimeout = null;
		}, 5000);
	}

	function importAttempt(slot: 1 | 2) {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = '.json';

		input.addEventListener('change', () => {
			const file = input.files?.[0];
			if (!file) return;

			const reader = new FileReader();
			reader.onload = () => {
				const text = reader.result as string;

				let parsed: unknown;
				try {
					parsed = JSON.parse(text);
				} catch {
					setError('Nieprawidłowy plik. Nie udało się odczytać JSON.');
					return;
				}

				const exportData = validateExportData(parsed);
				if (!exportData) {
					setError('Nieprawidłowy format pliku. Wymagane pola: version, rawText, marks.');
					return;
				}

				if (slot === 2 && attempt1) {
					if (exportData.rawText !== attempt1.exportData.rawText) {
						setError(
							'Teksty w obu plikach różnią się. Porównanie wymaga tego samego tekstu źródłowego.'
						);
						return;
					}
				}

				const words = reconstructWords(exportData);

				if (slot === 1) {
					attempt1 = { exportData, words };
				} else {
					attempt2 = { exportData, words };
				}

				error = '';
				if (errorTimeout) {
					clearTimeout(errorTimeout);
					errorTimeout = null;
				}
			};

			reader.readAsText(file);
		});

		input.click();
	}
</script>

<main class="compare-page">
	<h1>Porównanie prób</h1>

	<div class="import-section">
		<button class="btn-secondary" onclick={() => importAttempt(1)}>Importuj próbę 1</button>
		<button class="btn-secondary" onclick={() => importAttempt(2)}>Importuj próbę 2</button>
		<button class="btn-primary" onclick={() => window.print()}>Drukuj do PDF</button>
	</div>

	{#if error}
		<p class="import-error">{error}</p>
	{/if}

	{#if attempt1 && attempt2}
		<div class="compare-columns">
			<div class="column">
				<div class="column-content">
					{#each attempt1.words as word (word.id)}
						<span class="word-readonly">
							{#each word.segments as segment (segment.id)}
								<SegmentSpan {segment} />
							{/each}
						</span>
					{/each}
				</div>
				<p class="word-count-summary">Zaznaczone wyrazy: {markedCount1}</p>
			</div>
			<div class="column">
				<div class="column-content">
					{#each attempt2.words as word (word.id)}
						<span class="word-readonly">
							{#each word.segments as segment (segment.id)}
								<SegmentSpan {segment} />
							{/each}
						</span>
					{/each}
				</div>
				<p class="word-count-summary">Zaznaczone wyrazy: {markedCount2}</p>
			</div>
		</div>

		<div class="compare-columns summary-columns">
			<div class="column">
				<h2>Podsumowanie — Próba 1</h2>
				{#if markedWords1.length > 0}
					<ul class="summary-list">
						{#each markedWords1 as entry, i (i)}
							<li>
								<span class="word-with-badge">
									{#each entry.segments as segment (segment.id)}
										{#if segment.isMarked}
											<span
												class="segment-span marked"
											>{segment.text}</span>
										{:else}
											<span class="segment-span">{segment.text}</span>
										{/if}
									{/each}
								</span>											
							</li>
						{/each}
					</ul>
				{/if}
			</div>
			<div class="column">
				<h2>Podsumowanie — Próba 2</h2>
				{#if markedWords2.length > 0}
					<ul class="summary-list">
						{#each markedWords2 as entry, i (i)}
							<li>
								<span class="word-with-badge">
									{#each entry.segments as segment (segment.id)}
										{#if segment.isMarked}
											<span
												class="segment-span marked"
											>{segment.text}</span>
										{:else}
											<span class="segment-span">{segment.text}</span>
										{/if}
									{/each}
								</span>							
							</li>
						{/each}
					</ul>
				{/if}
			</div>
		</div>
	{/if}
</main>

<style>
	.compare-page {
		padding: var(--space-4);
		max-width: 1400px;
		margin: 0 auto;
	}

	.import-section {
		display: flex;
		gap: var(--space-3);
		margin-bottom: var(--space-4);
	}

	.btn-secondary {
		background-color: var(--color-gray-100);
		color: var(--color-gray-700);
		border: none;
		border-radius: var(--radius-sm);
		padding: var(--space-2) var(--space-4);
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: background-color 0.15s;
	}

	.btn-secondary:hover {
		background-color: var(--color-gray-300);
	}

	.btn-primary {
		background-color: var(--color-primary);
		color: var(--color-white);
		border: none;
		border-radius: var(--radius-sm);
		padding: var(--space-2) var(--space-4);
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: opacity 0.15s;
	}

	.btn-primary:hover {
		opacity: 0.9;
	}

	.compare-columns {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-8);
	}

	.summary-columns {
		margin-top: var(--space-8);
		border-top: 1px solid var(--color-gray-300);
		padding-top: var(--space-6);
	}

	.summary-columns h2 {
		font-size: 1rem;
		margin: 0 0 var(--space-3) 0;
	}

	.column-content {
		text-align: justify;
		max-width: 72ch;
		margin: 0 auto;
		padding: 0 var(--space-4);
		font-size: 1.2rem;
		line-height: 1.6;
		hyphens: auto;
		letter-spacing: 0.05em;
	}

	.word-readonly {
		display: inline-flex;
		padding: 0 3px;
	}

	.import-error {
		color: red;
		font-weight: bold;
		margin-top: 1rem;
	}

	.word-count-summary {
		margin-top: var(--space-4);
		font-weight: bold;
	}

	.summary-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		gap: 5px 20px;
	}

	.summary-list li {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		font-size: 0.85rem;
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

	@page {
		size: landscape;
		margin: 1cm;
	}

	@media print {
		.import-section,
		.import-error,
		button {
			display: none !important;
		}

		.compare-columns {
			grid-template-columns: 1fr 1fr;
		}

		.column-content {
			font-size: 0.8rem;
			line-height: 1.3;
			max-width: none;
			letter-spacing: 0.02em;
		}

		* {
			-webkit-print-color-adjust: exact !important;
			print-color-adjust: exact !important;
		}

		.word-count-summary {
			display: block !important;
		}
	}
</style>
