const SETTINGS_KEY = 'fluencymark-settings';

export interface SettingsState {
	enabled: boolean;
	letters: string;
	boldEnabled: boolean;
	underlineEnabled: boolean;
}

function loadInitialSettings(): SettingsState {
	if (typeof window === 'undefined') {
		return {
			enabled: true,
			letters: 'l, i, j',
			boldEnabled: true,
			underlineEnabled: true
		};
	}
	try {
		const saved = localStorage.getItem(SETTINGS_KEY);
		if (saved) {
			const parsed = JSON.parse(saved);
			return {
				enabled: parsed.enabled ?? true,
				letters: parsed.letters ?? 'l, i, j',
				boldEnabled: parsed.boldEnabled ?? true,
				underlineEnabled: parsed.underlineEnabled ?? true
			};
		}
	} catch (e) {
		console.error('Failed to load settings:', e);
	}
	return {
		enabled: true,
		letters: 'l, i, j',
		boldEnabled: true,
		underlineEnabled: true
	};
}

function createSettingsStore() {
	let state = $state<SettingsState>(loadInitialSettings());

	if (typeof window !== 'undefined') {
		$effect.root(() => {
			$effect(() => {
				try {
					localStorage.setItem(SETTINGS_KEY, JSON.stringify(state));
				} catch (e) {
					console.error('Failed to save settings:', e);
				}
			});
		});
	}

	return {
		get enabled(): boolean {
			return state.enabled;
		},
		set enabled(val: boolean) {
			state.enabled = val;
		},
		get letters(): string {
			return state.letters;
		},
		set letters(val: string) {
			state.letters = val;
		},
		get boldEnabled(): boolean {
			return state.boldEnabled;
		},
		set boldEnabled(val: boolean) {
			state.boldEnabled = val;
		},
		get underlineEnabled(): boolean {
			return state.underlineEnabled;
		},
		set underlineEnabled(val: boolean) {
			state.underlineEnabled = val;
		},

		get activeLettersSet(): Set<string> {
			const set = new Set<string>();
			if (!state.enabled || !state.letters) return set;
			const parts = state.letters.split(',');
			for (const part of parts) {
				const trimmed = part.trim();
				if (trimmed) {
					set.add(trimmed.toLowerCase());
				}
			}
			return set;
		}
	};
}

export const settingsStore = createSettingsStore();
