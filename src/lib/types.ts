export interface WordObject {
	id: string;
	text: string;
	isMarked: boolean;
}

export type AppMode = 'edit' | 'interactive';

export interface DocumentState {
	mode: AppMode;
	rawText: string;
	words: WordObject[];
}
