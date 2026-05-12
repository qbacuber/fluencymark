<script lang="ts">
	import { DISFLUENCY_TYPES, type DisfluencyType } from '$lib/types';

	let {
		x,
		y,
		wordId,
		segmentId,
		isMarked,
		currentNote,
		onMark,
		onRemove,
		onClose
	}: {
		x: number;
		y: number;
		wordId: string;
		segmentId: string;
		isMarked: boolean;
		currentNote?: string;
		onMark: (type: DisfluencyType, note?: string) => void;
		onRemove: () => void;
		onClose: () => void;
	} = $props();

	let note = $state('');

	// Sync note with currentNote prop when the menu opens with a new value
	$effect(() => {
		note = currentNote ?? '';
	});

	function handleMark(type: DisfluencyType) {
		onMark(type, note.trim() || undefined);
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			onClose();
		}
	}

	function handleOutsideClick(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (!target.closest('.context-menu')) {
			onClose();
		}
	}

	// These props are used by the parent component for state tracking
	$effect(() => {
		// Reference derived values to suppress warnings
		void wordId;
		void segmentId;
	});
</script>

<svelte:window onkeydown={handleKeydown} onclick={handleOutsideClick} />

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="context-menu fixed z-50 rounded-lg border border-gray-200 bg-white p-3 shadow-xl"
	style="top: {y}px; left: {x}px;"
	onclick={(e: MouseEvent) => e.stopPropagation()}
	onkeydown={(e: KeyboardEvent) => e.stopPropagation()}
>
	<div class="flex flex-col gap-2 min-w-[200px]">
		<p class="text-xs font-semibold text-gray-500 uppercase">Oznacz jako:</p>

		{#each Object.values(DISFLUENCY_TYPES) as config}
			<button
				class="flex items-center gap-2 rounded px-3 py-1.5 text-sm font-medium text-gray-800 hover:bg-gray-100 transition-colors"
				onclick={() => handleMark(config.type)}
			>
				<span class="inline-block w-4 h-4 rounded {config.color}"></span>
				{config.label}
			</button>
		{/each}

		<div class="border-t border-gray-200 pt-2 mt-1">
			<label for="context-menu-note" class="text-xs text-gray-500 block mb-1">Notatka (opcjonalnie):</label>
			<input
				id="context-menu-note"
				type="text"
				class="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
				placeholder="Dodaj notatkę..."
				bind:value={note}
			/>
		</div>

		{#if isMarked}
			<button
				class="mt-1 rounded bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100 transition-colors"
				onclick={onRemove}
			>
				Usuń oznaczenie
			</button>
		{/if}
	</div>
</div>
