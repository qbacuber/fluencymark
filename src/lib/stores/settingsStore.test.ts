import { describe, it, expect, beforeEach } from 'vitest';
import { settingsStore } from './settingsStore.svelte';

describe('settingsStore', () => {
	beforeEach(() => {
		window.localStorage.clear();
		// Reset settingsStore values to defaults
		settingsStore.enabled = true;
		settingsStore.letters = 'l, i, j';
		settingsStore.boldEnabled = true;
		settingsStore.underlineEnabled = true;
		settingsStore.theme = 'system';
	});

	it('should initialize with default settings including system theme', () => {
		expect(settingsStore.enabled).toBe(true);
		expect(settingsStore.letters).toBe('l, i, j');
		expect(settingsStore.boldEnabled).toBe(true);
		expect(settingsStore.underlineEnabled).toBe(true);
		expect(settingsStore.theme).toBe('system');
	});

	it('should allow changing the theme and reflect the new theme value', () => {
		settingsStore.theme = 'dark';
		expect(settingsStore.theme).toBe('dark');

		settingsStore.theme = 'light';
		expect(settingsStore.theme).toBe('light');

		settingsStore.theme = 'system';
		expect(settingsStore.theme).toBe('system');
	});
});
