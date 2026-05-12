export type DisfluencyType = 'block' | 'repetition' | 'prolongation';

export interface DisfluencyConfig {
	type: DisfluencyType;
	label: string; // Polish label
	color: string; // Tailwind color class for display
	printColor: string; // Hex color for print CSS
}

export const DISFLUENCY_TYPES: Record<DisfluencyType, DisfluencyConfig> = {
	block: { type: 'block', label: 'Blokada', color: 'bg-red-200', printColor: '#fecaca' },
	repetition: {
		type: 'repetition',
		label: 'Powtórzenie',
		color: 'bg-yellow-200',
		printColor: '#fef08a'
	},
	prolongation: {
		type: 'prolongation',
		label: 'Przedłużenie',
		color: 'bg-blue-200',
		printColor: '#bfdbfe'
	}
};

export interface Segment {
	id: string;
	text: string;
	isMarked: boolean;
	type?: DisfluencyType;
	note?: string;
}

export interface WordObject {
	id: string;
	text: string; // Original full word text
	segments: Segment[];
}

export type AppMode = 'edit' | 'interactive';

export interface DocumentState {
	mode: AppMode;
	rawText: string;
	words: WordObject[];
}
