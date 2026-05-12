export type DisfluencyType = 'block' | 'repetition' | 'prolongation';

export interface DisfluencyConfig {
	type: DisfluencyType;
	label: string; // Polish label
	color: string; // Hex color for border (semantic color)
	bgColor: string; // Hex color for light tinted background
}

export const DISFLUENCY_TYPES: Record<DisfluencyType, DisfluencyConfig> = {
	block: {
		type: 'block',
		label: 'Blokada',
		color: '#B04A4A', // danger
		bgColor: '#f5e0e0' // danger-tint
	},
	repetition: {
		type: 'repetition',
		label: 'Powtórzenie',
		color: '#C78E3F', // warning
		bgColor: '#faf0e0' // warning-tint
	},
	prolongation: {
		type: 'prolongation',
		label: 'Przedłużenie',
		color: '#5C7CA3', // info
		bgColor: '#e0eaf3' // info-tint
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
