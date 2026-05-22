export interface WordObject {
	id: string;
	text: string;
	isMarked: boolean;
}

export const VALID_MODES = ['edit', 'interactive'] as const;
export type AppMode = typeof VALID_MODES[number];

export interface DocumentState {
	mode: AppMode;
	rawText: string;
	words: WordObject[];
}
