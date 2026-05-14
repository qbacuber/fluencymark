import type { WordObject } from '$lib/types';
import { processText } from './textProcessor';

export interface ExportDataV2 {
	version: 2;
	rawText: string;
	markedIndices: number[];
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
