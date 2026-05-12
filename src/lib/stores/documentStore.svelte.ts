import { type DocumentState, type DisfluencyType, type WordObject } from '$lib/types';
import { serialize, deserialize } from '$lib/utils/storage';
import { processText } from '$lib/utils/textProcessor';

const STORAGE_KEY = 'fluencymark-state';

/** Lightweight export format — only stores original text + marked words */
export interface ExportMark {
	wordIndex: number;
	segments: { text: string; isMarked: boolean; type?: DisfluencyType; note?: string }[];
}

export interface ExportData {
	version: 1;
	rawText: string;
	marks: ExportMark[];
}

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
		},

		exportToJson(): string {
			const marks: ExportMark[] = [];
			state.words.forEach((word, index) => {
				const hasMarked = word.segments.some((s) => s.isMarked);
				if (hasMarked) {
					marks.push({
						wordIndex: index,
						segments: word.segments.map((s) => {
							const seg: ExportMark['segments'][number] = {
								text: s.text,
								isMarked: s.isMarked
							};
							if (s.isMarked && s.type) seg.type = s.type;
							if (s.isMarked && s.note) seg.note = s.note;
							return seg;
						})
					});
				}
			});

			const data: ExportData = {
				version: 1,
				rawText: state.rawText,
				marks
			};
			return JSON.stringify(data, null, 2);
		},

		importFromJson(json: string): boolean {
			try {
				const data = JSON.parse(json) as ExportData;
				if (data.version !== 1 || typeof data.rawText !== 'string' || !Array.isArray(data.marks)) {
					return false;
				}

				// Rebuild words from rawText
				const words = processText(data.rawText);

				// Apply marks
				for (const mark of data.marks) {
					if (mark.wordIndex < 0 || mark.wordIndex >= words.length) continue;
					if (!Array.isArray(mark.segments) || mark.segments.length === 0) continue;

					words[mark.wordIndex] = {
						...words[mark.wordIndex],
						segments: mark.segments.map((s) => ({
							id: crypto.randomUUID(),
							text: s.text,
							isMarked: s.isMarked,
							...(s.type ? { type: s.type } : {}),
							...(s.note ? { note: s.note } : {})
						}))
					};
				}

				state.rawText = data.rawText;
				state.words = words;
				state.mode = 'interactive';
				return true;
			} catch {
				return false;
			}
		}
	};
}

export const documentStore = createDocumentStore();
