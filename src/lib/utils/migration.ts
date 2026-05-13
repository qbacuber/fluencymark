import type { WordObject } from '$lib/types';
import { processText } from './textProcessor';

export interface LegacyExportMark {
	wordIndex: number;
	segments: { text: string; isMarked: boolean; type?: string; note?: string }[];
}

export interface LegacyExportData {
	version: 1;
	rawText: string;
	marks: LegacyExportMark[];
}

export interface ExportDataV2 {
	version: 2;
	rawText: string;
	markedIndices: number[];
}

/**
 * Validates that parsed JSON conforms to legacy v1 format.
 * Returns the typed data if valid, or null if not.
 */
export function validateLegacyData(data: unknown): LegacyExportData | null {
	if (data === null || typeof data !== 'object') return null;

	const obj = data as Record<string, unknown>;

	if (obj.version !== 1) return null;
	if (typeof obj.rawText !== 'string') return null;
	if (!Array.isArray(obj.marks)) return null;

	for (const mark of obj.marks) {
		if (mark === null || typeof mark !== 'object') return null;
		const m = mark as Record<string, unknown>;
		if (typeof m.wordIndex !== 'number') return null;
		if (!Array.isArray(m.segments)) return null;

		for (const seg of m.segments) {
			if (seg === null || typeof seg !== 'object') return null;
			const s = seg as Record<string, unknown>;
			if (typeof s.text !== 'string') return null;
			if (typeof s.isMarked !== 'boolean') return null;
		}
	}

	return data as LegacyExportData;
}

/**
 * Validates that parsed JSON conforms to v2 format.
 * Returns the typed data if valid, or null if not.
 */
export function validateV2Data(data: unknown): ExportDataV2 | null {
	if (data === null || typeof data !== 'object') return null;

	const obj = data as Record<string, unknown>;

	if (obj.version !== 2) return null;
	if (typeof obj.rawText !== 'string') return null;
	if (!Array.isArray(obj.markedIndices)) return null;

	for (const index of obj.markedIndices) {
		if (typeof index !== 'number' || !Number.isInteger(index)) return null;
	}

	return data as ExportDataV2;
}

/**
 * Converts legacy v1 export data to a simplified word array.
 * A word is marked if ANY segment in the legacy data was marked.
 */
export function migrateLegacyToWords(legacy: LegacyExportData): WordObject[] {
	const words = processText(legacy.rawText);

	for (const mark of legacy.marks) {
		if (mark.wordIndex >= 0 && mark.wordIndex < words.length) {
			const hasAnyMarked = mark.segments.some((s) => s.isMarked);
			if (hasAnyMarked) {
				words[mark.wordIndex] = { ...words[mark.wordIndex], isMarked: true };
			}
		}
	}

	return words;
}

/**
 * Reconstructs word array from v2 export data.
 */
export function reconstructFromV2(data: ExportDataV2): WordObject[] {
	const words = processText(data.rawText);

	for (const index of data.markedIndices) {
		if (index >= 0 && index < words.length) {
			words[index] = { ...words[index], isMarked: true };
		}
	}

	return words;
}
