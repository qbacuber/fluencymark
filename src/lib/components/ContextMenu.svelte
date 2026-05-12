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
	class="context-menu"
	style="top: {y}px; left: {x}px;"
	onclick={(e: MouseEvent) => e.stopPropagation()}
	onkeydown={(e: KeyboardEvent) => e.stopPropagation()}
>
	<div class="menu-content">
		<p class="menu-heading">Oznacz jako:</p>

		{#each Object.values(DISFLUENCY_TYPES) as config}
			<button
				class="type-button"
				onclick={() => handleMark(config.type)}
			>
				<span class="color-swatch" style="background-color: {config.bgColor}; border: 1.5px solid {config.color};"></span>
				{config.label}
			</button>
		{/each}

		<div class="note-section">
			<label for="context-menu-note" class="note-label">Notatka (opcjonalnie):</label>
			<input
				id="context-menu-note"
				type="text"
				class="note-input"
				placeholder="Dodaj notatkę..."
				bind:value={note}
			/>
		</div>

		{#if isMarked}
			<button
				class="remove-button"
				onclick={onRemove}
			>
				Usuń oznaczenie
			</button>
		{/if}
	</div>
</div>

<style>
	.context-menu {
		position: fixed;
		z-index: 50;
		background-color: var(--color-white);
		border: 1px solid var(--color-gray-300);
		border-radius: var(--radius-md);
		padding: var(--space-3);
		box-shadow: var(--shadow-lg);
	}

	.menu-content {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		min-width: 200px;
	}

	.menu-heading {
		font-size: 12px;
		font-weight: 600;
		color: var(--color-gray-500);
		text-transform: uppercase;
		margin: 0;
	}

	.type-button {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		border-radius: var(--radius-xs);
		padding: 6px var(--space-3);
		font-size: 14px;
		font-weight: 500;
		color: var(--color-gray-700);
		background: none;
		border: none;
		cursor: pointer;
		transition: background-color 0.15s;
		text-align: left;
		width: 100%;
	}

	.type-button:hover {
		background-color: var(--color-gray-100);
	}

	.color-swatch {
		display: inline-block;
		width: 16px;
		height: 16px;
		border-radius: var(--radius-xs);
		flex-shrink: 0;
	}

	.note-section {
		border-top: 1px solid var(--color-gray-300);
		padding-top: var(--space-2);
		margin-top: var(--space-1);
	}

	.note-label {
		font-size: 12px;
		color: var(--color-gray-500);
		display: block;
		margin-bottom: var(--space-1);
	}

	.note-input {
		width: 100%;
		border-radius: var(--radius-xs);
		border: 1px solid var(--color-gray-300);
		padding: var(--space-1) var(--space-2);
		font-size: 14px;
	}

	.note-input:focus {
		outline: none;
		box-shadow: 0 0 0 1px var(--color-info);
	}

	.remove-button {
		margin-top: var(--space-1);
		border-radius: var(--radius-xs);
		background-color: var(--color-danger-tint);
		padding: 6px var(--space-3);
		font-size: 14px;
		font-weight: 500;
		color: var(--color-danger);
		border: none;
		cursor: pointer;
		transition: background-color 0.15s;
	}

	.remove-button:hover {
		background-color: #ebc8c8;
	}
</style>
