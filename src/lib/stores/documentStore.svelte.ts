import { type DocumentState, type WordObject } from '$lib/types';
import { serialize, deserialize } from '$lib/utils/storage';
import { processText } from '$lib/utils/textProcessor';

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
		get mode() {
			return state.mode;
		},
		get rawText() {
			return state.rawText;
		},
		get words() {
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

		updateWord(wordId: string, updatedWord: WordObject) {
			const index = state.words.findIndex((w) => w.id === wordId);
			if (index !== -1) state.words[index] = updatedWord;
		}
	};
}

export const documentStore = createDocumentStore();
