<script lang="ts">
	import { documentStore } from '$lib/stores/documentStore.svelte';

	let errorMessage = $state('');

	function handleInput(event: Event) {
		const textarea = event.target as HTMLTextAreaElement;
		documentStore.setRawText(textarea.value);
	}

	function handleFileUpload(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		if (!file.name.endsWith('.txt')) {
			errorMessage = 'Proszę wybrać plik .txt';
			input.value = '';
			return;
		}

		errorMessage = '';
		const reader = new FileReader();
		reader.onload = () => {
			const text = reader.result as string;
			documentStore.setRawText(text);
		};
		reader.onerror = () => {
			errorMessage = 'Nie udało się odczytać pliku';
		};
		reader.readAsText(file);
	}

	function handleConfirm() {
		if (!documentStore.rawText.trim()) return;
		documentStore.confirmText();
	}
</script>

<div class="editor-container">
	<h1 class="editor-title">FluencyMark — Edytor tekstu</h1>

	<textarea
		class="editor-textarea"
		placeholder="Wklej lub wpisz tekst tutaj..."
		value={documentStore.rawText}
		oninput={handleInput}
	></textarea>

	<div class="editor-controls">
		<div class="file-upload-row">
			<label class="file-upload-label">
				<span>Wczytaj plik .txt:</span>
				<input
					type="file"
					accept=".txt"
					onchange={handleFileUpload}
				/>
			</label>
		</div>

		{#if errorMessage}
			<p class="error-message">{errorMessage}</p>
		{/if}

		<button
			onclick={handleConfirm}
			class="btn-primary btn-lg"
		>
			Zatwierdź
		</button>
	</div>
</div>

<style>
	.editor-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-6);
		padding: var(--space-6);
		height: 100%;
	}

	.editor-title {
		color: var(--color-gray-700);
	}

	.editor-textarea {
		width: 100%;
		max-width: 56rem;
		flex: 1;
		min-height: 60vh;
		resize: none;
		border-radius: var(--radius-sm);
		border: 1px solid var(--color-gray-300);
		padding: var(--space-4);
		font-size: 1.125rem;
		font-family: ui-monospace, monospace;
		background-color: var(--color-white);
		box-shadow: var(--shadow-md);
	}

	.editor-textarea:focus {
		outline: none;
		border-color: var(--color-primary);
		box-shadow: 0 0 0 2px rgba(217, 119, 87, 0.25);
	}

	.editor-controls {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-4);
		width: 100%;
		max-width: 56rem;
	}

	.file-upload-row {
		display: flex;
		align-items: center;
		gap: var(--space-4);
		width: 100%;
	}

	.file-upload-label {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		cursor: pointer;
		color: var(--color-gray-700);
		font-size: 0.875rem;
	}

	.error-message {
		color: var(--color-danger);
		font-size: 0.875rem;
		font-weight: 500;
		margin: 0;
	}


</style>
