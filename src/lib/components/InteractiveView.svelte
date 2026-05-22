<script lang="ts">
	import { base } from '$app/paths';
	import { documentStore } from '$lib/stores/documentStore.svelte';
	import WordDisplay from './WordDisplay.svelte';
	import SettingsPanel from './SettingsPanel.svelte';

	let importError = $state('');
	let isSettingsOpen = $state(false);

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



	/**
	 * Clears any active text selection after mouseup.
	 * This prevents browser text selection highlighting from lingering when the user clicks or drags,
	 * providing a cleaner interactive highlighting experience.
	 */
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
				href="{base}/compare"
			>
				Porównaj próby
			</a>
			<button
				class="btn-secondary settings-toggle-btn"
				onclick={() => (isSettingsOpen = true)}
				aria-label="Otwórz ustawienia"
			>
				<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="gear-icon"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
				<span>Ustawienia</span>
			</button>
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

	<SettingsPanel isOpen={isSettingsOpen} onClose={() => (isSettingsOpen = false)} />
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



	.settings-toggle-btn {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.gear-icon {
		transition: transform 0.3s ease;
	}

	.settings-toggle-btn:hover .gear-icon {
		transform: rotate(45deg);
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
