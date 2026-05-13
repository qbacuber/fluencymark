<script lang="ts">
	import type { WordObject } from '$lib/types';
	import {
		validateAndReconstructWords,
		validateRawTextMatch,
		countMarkedWords
	} from '$lib/utils/compareUtils';

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
	</div>

	{#if error}
		<p class="import-error">{error}</p>
	{/if}

	{#if attempt1 && attempt2}
		<div class="compare-columns">
			<div class="column">
				<div class="column-content">
					{#each attempt1.words as word (word.id)}
						<span class="word-readonly" class:marked={word.isMarked}>{word.text}</span>
					{/each}
				</div>
				<p class="word-count-summary">Zaznaczone wyrazy: {markedCount1}</p>
			</div>
			<div class="column">
				<div class="column-content">
					{#each attempt2.words as word (word.id)}
						<span class="word-readonly" class:marked={word.isMarked}>{word.text}</span>
					{/each}
				</div>
				<p class="word-count-summary">Zaznaczone wyrazy: {markedCount2}</p>
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
		display: inline;
		padding: 0 3px;
		border-radius: var(--radius-xs);
	}

	.word-readonly.marked {
		background-color: var(--color-primary-100, #dbeafe);
		border: 1px solid var(--color-primary-400, #60a5fa);
		border-radius: var(--radius-xs);
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
