import type { WordObject } from '$lib/types';
import type { ExportData } from '$lib/stores/documentStore.svelte';
import { processText } from '$lib/utils/textProcessor';

/**
 * Validates that a parsed JSON object conforms to the ExportData schema.
 * Returns the typed ExportData if valid, or null if invalid.
 */
export function validateExportData(data: unknown): ExportData | null {
	if (data === null || typeof data !== 'object') return null;
	const obj = data as Record<string, unknown>;
	if (obj.version !== 1) return null;
	if (typeof obj.rawText !== 'string') return null;
	if (!Array.isArray(obj.marks)) return null;
	// Validate each mark entry
	for (const mark of obj.marks) {
		if (typeof mark !== 'object' || mark === null) return null;
		const m = mark as Record<string, unknown>;
		if (typeof m.wordIndex !== 'number') return null;
		if (!Array.isArray(m.segments) || m.segments.length === 0) return null;
		for (const seg of m.segments as unknown[]) {
			if (typeof seg !== 'object' || seg === null) return null;
			const s = seg as Record<string, unknown>;
			if (typeof s.text !== 'string') return null;
			if (typeof s.isMarked !== 'boolean') return null;
		}
	}
	return data as ExportData;
}

/**
 * Reconstructs WordObject[] from a valid ExportData.
 * Uses processText to split rawText into words, then applies marks.
 */
export function reconstructWords(exportData: ExportData): WordObject[] {
	const words = processText(exportData.rawText);
	for (const mark of exportData.marks) {
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
	return words;
}

/**
 * Counts the number of words that have at least one marked segment.
 */
export function countMarkedWords(words: WordObject[]): number {
	return words.filter((w) => w.segments.some((s) => s.isMarked)).length;
}
