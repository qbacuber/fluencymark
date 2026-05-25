<script lang="ts">
	import { base } from '$app/paths';
	import type { WordObject } from '$lib/types';
	import {
		validateAndReconstructWords,
		validateRawTextMatch,
		countMarkedWords
	} from '$lib/utils/compareUtils';
	import { cleanText } from '$lib/utils/textUtils';
	import WordDisplay from '$lib/components/WordDisplay.svelte';

	interface AttemptState {
		words: WordObject[];
		rawText: string;
	}

	let attempt1 = $state<AttemptState | null>(null);
	let attempt2 = $state<AttemptState | null>(null);
	let error = $state<string>('');

	// Automatically clean up the error message after 5 seconds
	$effect(() => {
		if (!error) return;
		const id = setTimeout(() => {
			error = '';
		}, 5000);
		return () => clearTimeout(id);
	});

	let markedCount1 = $derived(attempt1 ? countMarkedWords(attempt1.words) : 0);
	let markedCount2 = $derived(attempt2 ? countMarkedWords(attempt2.words) : 0);

	let markedWords1 = $derived(
		attempt1
			? attempt1.words
					.filter((w) => w.isMarked)
					.map((w) => cleanText(w.text))
					.filter((t) => t.length > 0)
					.sort((a, b) => a.localeCompare(b, 'pl'))
			: []
	);

	let markedWords2 = $derived(
		attempt2
			? attempt2.words
					.filter((w) => w.isMarked)
					.map((w) => cleanText(w.text))
					.filter((t) => t.length > 0)
					.sort((a, b) => a.localeCompare(b, 'pl'))
			: []
	);

	function setError(message: string) {
		error = message;
	}

	function readFileAsText(file: File): Promise<string> {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => resolve(reader.result as string);
			reader.onerror = () => reject(new Error(`Błąd odczytu pliku ${file.name}`));
			reader.readAsText(file);
		});
	}

	function importFiles() {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = '.json';
		input.multiple = true;

		input.addEventListener('change', async () => {
			const files = input.files;
			if (!files || files.length === 0) return;

			if (files.length > 2) {
				setError('Wybierz maksymalnie 2 pliki.');
				return;
			}

			const fileArray = Array.from(files);

			try {
				const fileContents = await Promise.all(fileArray.map(readFileAsText));
				const loaded: { words: WordObject[]; rawText: string }[] = [];

				for (let i = 0; i < fileArray.length; i++) {
					const file = fileArray[i];
					const text = fileContents[i];

					let parsed: unknown;
					try {
						parsed = JSON.parse(text);
					} catch {
						throw new Error(`Nieprawidłowy plik (${file.name}). Nie udało się odczytać JSON.`);
					}

					const result = validateAndReconstructWords(parsed);
					if (!result.success) {
						throw new Error(`${file.name}: ${result.error}`);
					}

					loaded[i] = { words: result.words, rawText: result.rawText };
				}

				assignLoadedFiles(loaded);
			} catch (e: any) {
				setError(e.message || 'Wystąpił błąd podczas importowania plików.');
			}
		});

		input.click();
	}

	function assignLoadedFiles(loaded: { words: WordObject[]; rawText: string }[]) {
		if (loaded.length === 1) {
			// Single file - assign to first empty slot
			if (!attempt1) {
				attempt1 = loaded[0];
			} else if (!attempt2) {
				const matchResult = validateRawTextMatch(attempt1.rawText, loaded[0].rawText);
				if (!matchResult.success) {
					setError(matchResult.error!);
					return;
				}
				attempt2 = loaded[0];
			} else {
				// Both filled - replace both starting from slot 1
				attempt1 = loaded[0];
				attempt2 = null;
			}
		} else if (loaded.length === 2) {
			const matchResult = validateRawTextMatch(loaded[0].rawText, loaded[1].rawText);
			if (!matchResult.success) {
				setError(matchResult.error!);
				return;
			}
			attempt1 = loaded[0];
			attempt2 = loaded[1];
		}

		error = '';
	}

	/** Set of word indices marked in both attempts (repeated errors) */
	let repeatedIndices = $derived.by<Set<number>>(() => {
		if (!attempt1 || !attempt2) return new Set();
		const set = new Set<number>();
		for (let i = 0; i < attempt1.words.length; i++) {
			if (attempt1.words[i].isMarked && attempt2.words[i].isMarked) {
				set.add(i);
			}
		}
		return set;
	});

	function isRepeated(index: number): boolean {
		return repeatedIndices.has(index);
	}

	function swapAttempts() {
		const temp = attempt1;
		attempt1 = attempt2;
		attempt2 = temp;
	}
</script>

<main class="compare-page">
	<h1>Porównanie prób</h1>

	<div class="import-section">
		<button class="btn-secondary" onclick={importFiles}>Importuj pliki</button>
		{#if attempt1 && attempt2}
			<button class="btn-secondary" onclick={swapAttempts}>⇄ Zamień miejscami</button>
		{/if}
		<button class="btn-primary" onclick={() => window.print()}>Drukuj do PDF</button>
		<a class="btn-secondary" href="{base}/">Wróć do edycji</a>
	</div>

	{#if error}
		<p class="import-error">{error}</p>
	{/if}

	{#if attempt1 && attempt2}
		<div class="compare-columns">
			{#each [{ data: attempt1, count: markedCount1, label: 'Próba 1' }, { data: attempt2, count: markedCount2, label: 'Próba 2' }] as col}
				<div class="column">
					<h2 class="column-label">{col.label}</h2>
					<div class="text-content">
						{#each col.data.words as word, i (word.id)}
							<WordDisplay {word} readonly={true} highlighted={word.isMarked && isRepeated(i)} />{' '}
						{/each}
					</div>
					<p class="word-count-summary">Zaznaczone wyrazy: {col.count}</p>
				</div>
			{/each}
		</div>

		<!-- Print summary with marked word lists -->
		<div class="print-summary">
			<h2>Podsumowanie – lista zaznaczonych słów</h2>
			<div class="summary-columns">
				{#each [{ words: markedWords1, count: markedCount1, label: 'Próba 1' }, { words: markedWords2, count: markedCount2, label: 'Próba 2' }] as col}
					<div class="summary-column">
						<h3>{col.label} ({col.count} słów)</h3>
						<ul class="summary-list">
							{#each col.words as word, i (i)}
								<li>{word}</li>
							{/each}
						</ul>
					</div>
				{/each}
			</div>
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



	.compare-columns {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-8);
		overflow: hidden;
	}

	.column-label {
		font-size: 1rem;
		font-weight: 600;
		margin-bottom: var(--space-2);
		padding: 0 var(--space-4);
		color: var(--color-gray-600);
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
		color: var(--color-danger);
		font-weight: bold;
		margin-top: 1rem;
	}

	.word-count-summary {
		margin-top: var(--space-4);
		font-weight: bold;
		padding: 0 var(--space-4);
	}

	/* Print summary - hidden on screen, visible on print */
	.print-summary {
		display: none;
	}

	.print-summary h2 {
		font-size: 12pt;
		margin-bottom: 8pt;
	}

	.summary-columns {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-8);
	}

	.summary-column h3 {
		font-size: 10pt;
		font-weight: 600;
		margin-bottom: 4pt;
	}

	.summary-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		gap: 10pt;
	}

	.summary-list li {
		font-size: 9pt;
		line-height: 1.4;
		padding: 1px;
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

		.column-label {
			font-size: 9pt;
			margin-bottom: 4pt;
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

		.print-summary {
			display: block;
			margin-top: 16pt;
			page-break-before: auto;
			border-top: 1px solid #ccc;
			padding-top: 12pt;
		}
	}
</style>
