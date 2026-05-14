<script lang="ts">
	import { documentStore } from '$lib/stores/documentStore.svelte';
	import WordDisplay from './WordDisplay.svelte';

	let importError = $state('');

	function handleExport() {
		const json = documentStore.exportToJson();
		const blob = new Blob([json], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'fluencymark-session.json';
		a.click();
		URL.revokeObjectURL(url);
	}

	function handleImport() {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = '.json';
		input.onchange = () => {
			const file = input.files?.[0];
			if (!file) return;
			const reader = new FileReader();
			reader.onload = () => {
				const result = documentStore.importFromJson(reader.result as string);
				if (!result.success) {
					importError = result.error ?? 'Nieprawidłowy plik JSON. Sprawdź format.';
					setTimeout(() => (importError = ''), 4000);
				} else {
					importError = '';
				}
			};
			reader.readAsText(file);
		};
		input.click();
	}



	function handleContainerMouseUp() {
		const selection = window.getSelection();
		if (selection && !selection.isCollapsed) {
			selection.removeAllRanges();
		}
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="interactive-container">
	<div class="header-bar">
		<h1>FluencyMark — Widok interaktywny</h1>
		<div class="header-actions">

			<button
				class="btn-secondary"
				onclick={handleImport}
			>
				Importuj JSON
			</button>
			<button
				class="btn-secondary"
				onclick={handleExport}
			>
				Eksportuj JSON
			</button>
			<button
				class="btn-secondary"
				onclick={() => documentStore.returnToEdit()}
			>
				Wróć do edycji
			</button>
			<a
				class="btn-secondary"
				href="/compare"
			>
				Porównaj próby
			</a>
			<button
				class="btn-primary"
				onclick={() => window.print()}
			>
				Drukuj do PDF
			</button>
		</div>
	</div>

	{#if importError}
		<p class="import-error">{importError}</p>
	{/if}

	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="text-content" onmouseup={handleContainerMouseUp}>
		{#each documentStore.words as word (word.id)}
			<WordDisplay {word} onToggleMark={(wordId) => documentStore.toggleMark(wordId)} />{' '}
		{/each}
	</div>
</div>

<style>
	.interactive-container {
		display: flex;
		flex-direction: column;
		height: 100%;
		padding: var(--space-6);
		max-width: 100%;
		overflow-x: hidden;
		page: portrait-page;
	}

	.header-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: var(--space-6);
		flex-wrap: wrap;
		gap: var(--space-3);
	}

	.header-bar h1 {
		margin: 0;
	}

	.header-actions {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-3);
	}

	.import-error {
		color: var(--color-danger);
		font-size: 0.875rem;
		font-weight: 500;
		margin: 0 0 var(--space-4) 0;
		text-align: center;
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

	.text-content {
		text-align: justify;
		width: 100%;
		max-width: 90ch;
		margin: 0 auto;
		padding: 0 var(--space-6);
		font-size: 1.2rem;
		line-height: 1.6;
		hyphens: auto;
		-webkit-hyphens: auto;
		-ms-hyphens: auto;
		text-justify: inter-word;
		letter-spacing: 0.05em;
		user-select: none;
		-webkit-user-select: none;
	}

	@media print {
		@page portrait-page {
			size: portrait;
			margin: 20mm 15mm;
		}
	}
</style>
