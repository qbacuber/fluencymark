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
		documentStore.confirmText();
	}
</script>

<div class="flex flex-col items-center gap-6 p-6 h-full">
	<h1 class="text-2xl font-bold text-gray-800">FluencyMark — Edytor tekstu</h1>

	<textarea
		class="w-full max-w-4xl flex-1 min-h-[60vh] resize-none rounded-lg border border-gray-300 p-4 text-lg font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
		placeholder="Wklej lub wpisz tekst tutaj..."
		value={documentStore.rawText}
		oninput={handleInput}
	></textarea>

	<div class="flex flex-col items-center gap-4 w-full max-w-4xl">
		<div class="flex items-center gap-4 w-full">
			<label class="flex items-center gap-2 cursor-pointer text-gray-700">
				<span class="text-sm">Wczytaj plik .txt:</span>
				<input
					type="file"
					accept=".txt"
					onchange={handleFileUpload}
					class="text-sm file:mr-2 file:rounded file:border-0 file:bg-gray-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-200"
				/>
			</label>
		</div>

		{#if errorMessage}
			<p class="text-red-600 text-sm font-medium">{errorMessage}</p>
		{/if}

		<button
			onclick={handleConfirm}
			class="rounded-lg bg-blue-600 px-8 py-3 text-lg font-semibold text-white shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
		>
			Zatwierdź
		</button>
	</div>
</div>
