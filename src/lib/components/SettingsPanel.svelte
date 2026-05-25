<script lang="ts">
	import { settingsStore } from '$lib/stores/settingsStore.svelte';
	import { fade, fly } from 'svelte/transition';

	let { isOpen = false, onClose }: { isOpen: boolean; onClose: () => void } = $props();

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			onClose();
		}
	}
</script>

{#if isOpen}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div class="backdrop" onclick={handleBackdropClick} transition:fade={{ duration: 200 }}>
		<div class="drawer" transition:fly={{ x: 300, duration: 250 }}>
			<div class="drawer-header">
				<h2>Ustawienia</h2>
				<button class="close-btn" onclick={onClose} aria-label="Zamknij">
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
				</button>
			</div>

			<div class="drawer-body">
				<div class="setting-item">
					<span class="setting-label-main">Motyw</span>
					<div class="theme-selector">
						<button
							class="theme-btn"
							class:active={settingsStore.theme === 'system'}
							onclick={() => (settingsStore.theme = 'system')}
						>
							<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="theme-icon"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
							Systemowy
						</button>
						<button
							class="theme-btn"
							class:active={settingsStore.theme === 'light'}
							onclick={() => (settingsStore.theme = 'light')}
						>
							<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="theme-icon"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
							Jasny
						</button>
						<button
							class="theme-btn"
							class:active={settingsStore.theme === 'dark'}
							onclick={() => (settingsStore.theme = 'dark')}
						>
							<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="theme-icon"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
							Ciemny
						</button>
					</div>
				</div>

				<div class="setting-item">
					<div class="setting-row">
						<span class="setting-label-main">Wizualne pomocniki czytania</span>
						<label class="switch">
							<input type="checkbox" bind:checked={settingsStore.enabled} />
							<span class="slider round"></span>
						</label>
					</div>
					<p class="setting-desc">Włącza wyróżnianie określonych znaków w tekście pomocne przy czytaniu.</p>
				</div>

				{#if settingsStore.enabled}
					<div class="setting-section" transition:fade={{ duration: 150 }}>
						<div class="setting-item">
							<label for="letters-textarea" class="setting-label">Litery do wyróżnienia (oddzielone przecinkami):</label>
							<textarea
								id="letters-textarea"
								class="letters-textarea"
								placeholder="np. l, i, j"
								bind:value={settingsStore.letters}
							></textarea>
						</div>

						<div class="setting-item">
							<span class="setting-label">Styl wyróżnienia</span>
							<div class="checkbox-group">
								<label class="checkbox-label">
									<input type="checkbox" bind:checked={settingsStore.boldEnabled} />
									<span class="checkbox-custom"></span>
									Pogrubienie
								</label>

								<label class="checkbox-label">
									<input type="checkbox" bind:checked={settingsStore.underlineEnabled} />
									<span class="checkbox-custom"></span>
									Podkreślenie
								</label>
							</div>
						</div>
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	.backdrop {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(20, 20, 19, 0.4);
		backdrop-filter: blur(4px);
		-webkit-backdrop-filter: blur(4px);
		z-index: 1000;
		display: flex;
		justify-content: flex-end;
	}

	.drawer {
		width: 100%;
		max-width: 400px;
		height: 100%;
		background-color: var(--color-ivory);
		box-shadow: var(--shadow-lg);
		display: flex;
		flex-direction: column;
		border-left: 1px solid var(--color-gray-300);
	}

	.drawer-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-4) var(--space-6);
		border-bottom: 1px solid var(--color-gray-100);
	}

	.drawer-header h2 {
		margin: 0;
		font-size: 1.5rem;
		color: var(--color-slate);
	}

	.close-btn {
		background: none;
		border: none;
		color: var(--color-gray-500);
		cursor: pointer;
		padding: var(--space-1);
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: var(--radius-xs);
		transition: background-color 0.15s, color 0.15s;
	}

	.close-btn:hover {
		background-color: var(--color-gray-100);
		color: var(--color-slate);
	}

	.drawer-body {
		flex: 1;
		padding: var(--space-6);
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
	}

	.setting-section {
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
	}

	.setting-item {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.setting-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.setting-label-main {
		font-weight: 600;
		font-size: 1.05rem;
		color: var(--color-slate);
	}

	.setting-label {
		font-weight: 500;
		font-size: 0.9rem;
		color: var(--color-gray-700);
	}

	.setting-desc {
		margin: 0;
		font-size: 0.8rem;
		color: var(--color-gray-500);
	}

	.letters-textarea {
		width: 100%;
		height: 80px;
		resize: none;
		border-radius: var(--radius-sm);
		border: 1px solid var(--color-gray-300);
		padding: var(--space-2) var(--space-3);
		font-size: 0.95rem;
		font-family: ui-monospace, monospace;
		background-color: var(--color-white);
		transition: border-color 0.15s, box-shadow 0.15s;
	}

	.letters-textarea:focus {
		outline: none;
		border-color: var(--color-primary);
		box-shadow: 0 0 0 2px rgba(217, 119, 87, 0.2);
	}

	.checkbox-group {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		margin-top: var(--space-1);
	}

	.checkbox-label {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		cursor: pointer;
		font-size: 0.95rem;
		color: var(--color-gray-700);
		user-select: none;
	}

	/* Switch Button Styles */
	.switch {
		position: relative;
		display: inline-block;
		width: 48px;
		height: 26px;
	}

	.switch input {
		opacity: 0;
		width: 0;
		height: 0;
	}

	.slider {
		position: absolute;
		cursor: pointer;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: var(--color-gray-300);
		transition: .2s;
		border-radius: 34px;
	}

	.slider:before {
		position: absolute;
		content: "";
		height: 18px;
		width: 18px;
		left: 4px;
		bottom: 4px;
		background-color: white;
		transition: .2s;
		border-radius: 50%;
	}

	input:checked + .slider {
		background-color: var(--color-primary);
	}

	input:focus + .slider {
		box-shadow: 0 0 1px var(--color-primary);
	}

	input:checked + .slider:before {
		transform: translateX(22px);
	}

	/* Theme Selector Styles */
	.theme-selector {
		display: flex;
		background-color: var(--color-gray-100);
		border-radius: var(--radius-sm);
		padding: var(--space-1);
		gap: var(--space-1);
		border: 1px solid var(--color-gray-300);
		margin-top: var(--space-1);
	}

	.theme-btn {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-2);
		background: none;
		border: none;
		padding: var(--space-2) var(--space-1);
		font-size: 0.85rem;
		font-weight: 500;
		color: var(--color-gray-700);
		cursor: pointer;
		border-radius: calc(var(--radius-sm) - 2px);
		transition: background-color 0.15s, color 0.15s, box-shadow 0.15s;
	}

	.theme-btn:hover {
		color: var(--color-slate);
	}

	.theme-btn.active {
		background-color: var(--color-white);
		color: var(--color-primary);
		box-shadow: var(--shadow-sm);
	}

	.theme-icon {
		flex-shrink: 0;
	}

	/* Print styling */
	@media print {
		.backdrop {
			display: none !important;
		}
	}
</style>
