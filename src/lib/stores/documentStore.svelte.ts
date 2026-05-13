import type { AppMode, DocumentState, WordObject } from '$lib/types';
import { serialize, deserialize } from '$lib/utils/storage';
import { processText } from '$lib/utils/textProcessor';
import {
	validateLegacyData,
	validateV2Data,
	migrateLegacyToWords,
	reconstructFromV2
} from '$lib/utils/migration';

const STORAGE_KEY = 'fluencymark-state';

function createDocumentStore() {
	let state = $state<DocumentState>(loadInitialState());

	function loadInitialState(): DocumentState {
		const saved = deserialize(STORAGE_KEY);
		if (saved) return saved;
		return { mode: 'edit', rawText: '', words: [] };
	}

	// Auto-persist on state changes (using $effect.root since this runs at module level)
	$effect.root(() => {
		$effect(() => {
			serialize(STORAGE_KEY, state);
		});
	});

	return {
		get mode(): AppMode {
			return state.mode;
		},
		get rawText(): string {
			return state.rawText;
		},
		get words(): WordObject[] {
			return state.words;
		},

		setRawText(text: string) {
			state.rawText = text;
		},

		confirmText() {
			state.words = processText(state.rawText);
			state.mode = 'interactive';
		},

		returnToEdit() {
			state.mode = 'edit';
			state.words = [];
		},

		toggleMark(wordId: string) {
			const index = state.words.findIndex((w) => w.id === wordId);
			if (index !== -1) {
				state.words[index] = {
					...state.words[index],
					isMarked: !state.words[index].isMarked
				};
			}
		},

		exportToJson(): string {
			const markedIndices: number[] = [];
			state.words.forEach((word, index) => {
				if (word.isMarked) {
					markedIndices.push(index);
				}
			});

			const data = {
				version: 2,
				rawText: state.rawText,
				markedIndices
			};
			return JSON.stringify(data, null, 2);
		},

		importFromJson(json: string): { success: boolean; error?: string } {
			try {
				const parsed = JSON.parse(json);
				const data = validateV2Data(parsed);
				if (!data) {
					return { success: false, error: 'Nieprawidłowy plik JSON. Sprawdź format.' };
				}

				const words = reconstructFromV2(data);
				state.rawText = data.rawText;
				state.words = words;
				state.mode = 'interactive';
				return { success: true };
			} catch {
				return { success: false, error: 'Nieprawidłowy plik JSON. Sprawdź format.' };
			}
		},

		importLegacyJson(json: string): { success: boolean; error?: string } {
			try {
				const parsed = JSON.parse(json);
				const legacy = validateLegacyData(parsed);
				if (!legacy) {
					return {
						success: false,
						error: 'Plik nie jest rozpoznanym formatem starszej wersji.'
					};
				}

				const words = migrateLegacyToWords(legacy);
				state.rawText = legacy.rawText;
				state.words = words;
				state.mode = 'interactive';
				return { success: true };
			} catch {
				return {
					success: false,
					error: 'Plik nie jest rozpoznanym formatem starszej wersji.'
				};
			}
		}
	};
}

export const documentStore = createDocumentStore();
