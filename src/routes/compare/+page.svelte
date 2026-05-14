<script lang="ts">
	import type { WordObject } from '$lib/types';
	import {
		validateAndReconstructWords,
		validateRawTextMatch,
		countMarkedWords
	} from '$lib/utils/compareUtils';
	import WordDisplay from '$lib/components/WordDisplay.svelte';

	interface AttemptState {
		words: WordObject[];
		rawText: string;
	}

	let attempt1 = $state<AttemptState | null>(null);
	let attempt2 = $state<AttemptState | null>(null);
	let error = $state<string>('');
	let errorTimeout: ReturnType<typeof setTimeout> | null = null;

	let markedCount1 = $derived(attempt1 ? countMarkedWords(attempt1.words) : 0);
	let markedCount2 = $derived(attempt2 ? countMarkedWords(attempt2.words) : 0);

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

				const result = validateAndReconstructWords(parsed);
				if (!result.success) {
					setError(result.error);
					return;
				}

				if (slot === 2 && attempt1) {
					const matchResult = validateRawTextMatch(attempt1.rawText, result.rawText);
					if (!matchResult.success) {
						setError(matchResult.error!);
						return;
					}
				}

				if (slot === 1) {
					attempt1 = { words: result.words, rawText: result.rawText };
				} else {
					attempt2 = { words: result.words, rawText: result.rawText };
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
		<a class="btn-secondary" href="/">Wróć do edycji</a>
	</div>

	{#if error}
		<p class="import-error">{error}</p>
	{/if}

	{#if attempt1 && attempt2}
		<div class="compare-columns">
			{#each [{ data: attempt1, count: markedCount1 }, { data: attempt2, count: markedCount2 }] as col}
				<div class="column">
					<div class="text-content">
						{#each col.data.words as word (word.id)}
							<WordDisplay {word} readonly={true} />{' '}
						{/each}
					</div>
					<p class="word-count-summary">Zaznaczone wyrazy: {col.count}</p>
				</div>
			{/each}
		</div>
	{/if}
</main>

<style>
	.compare-page {
		padding: var(--space-4);
		max-width: 100%;
		margin: 0 auto;
		overflow-x: hidden;
		page: landscape-page;
	}

	.import-section {
		display: flex;
		flex-wrap: wrap;
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
		overflow: hidden;
	}

	.text-content {
		text-align: justify;
		width: 100%;
		margin: 0 auto;
		padding: 0 var(--space-4);
		font-size: 1.2rem;
		line-height: 1.6;
		hyphens: auto;
		-webkit-hyphens: auto;
		-ms-hyphens: auto;
		text-justify: inter-word;
		letter-spacing: 0.05em;
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

	@media print {
		@page landscape-page {
			size: landscape;
			margin: 1cm;
		}

		.import-section,
		.import-error,
		button {
			display: none !important;
		}

		.compare-columns {
			grid-template-columns: 1fr 1fr;
		}

		.text-content {
			font-size: 0.8rem;
			line-height: 1.3;
			max-width: 18em;
			letter-spacing: 0.02em;
			break-inside: auto;
		}

		.column {
			break-inside: auto;
		}

		:global(.word-display) {
			page-break-inside: avoid;
			break-inside: avoid;
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
