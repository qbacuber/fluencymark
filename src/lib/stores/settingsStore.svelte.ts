const SETTINGS_KEY = 'fluencymark-settings';

export interface SettingsState {
	enabled: boolean;
	letters: string;
	boldEnabled: boolean;
	underlineEnabled: boolean;
	theme: 'light' | 'dark' | 'system';
}

function loadInitialSettings(): SettingsState {
	if (typeof window === 'undefined') {
		return {
			enabled: true,
			letters: 'l, i, j',
			boldEnabled: true,
			underlineEnabled: true,
			theme: 'system'
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
				underlineEnabled: parsed.underlineEnabled ?? true,
				theme: parsed.theme ?? 'system'
			};
		}
	} catch (e) {
		console.error('Failed to load settings:', e);
	}
	return {
		enabled: true,
		letters: 'l, i, j',
		boldEnabled: true,
		underlineEnabled: true,
		theme: 'system'
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

			$effect(() => {
				const theme = state.theme ?? 'system';
				const applyTheme = () => {
					let resolvedTheme: 'light' | 'dark' = 'light';
					if (theme === 'system') {
						resolvedTheme = (typeof window.matchMedia === 'function' && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
					} else {
						resolvedTheme = theme;
					}

					if (resolvedTheme === 'dark') {
						document.documentElement.classList.add('dark');
						document.documentElement.setAttribute('data-theme', 'dark');
					} else {
						document.documentElement.classList.remove('dark');
						document.documentElement.setAttribute('data-theme', 'light');
					}
				};

				applyTheme();

				if (theme === 'system' && typeof window.matchMedia === 'function') {
					const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
					const handler = () => applyTheme();
					mediaQuery.addEventListener('change', handler);
					return () => mediaQuery.removeEventListener('change', handler);
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
		get theme(): 'light' | 'dark' | 'system' {
			return state.theme ?? 'system';
		},
		set theme(val: 'light' | 'dark' | 'system') {
			state.theme = val;
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
