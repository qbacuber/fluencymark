import type { WordObject } from '$lib/types';
import {
	validateLegacyData,
	validateV2Data,
	migrateLegacyToWords,
	reconstructFromV2
} from '$lib/utils/migration';

/**
 * Validates and reconstructs a WordObject array from imported data.
 * Supports both v1 (legacy) and v2 formats, detected via the `version` field.
 */
export function validateAndReconstructWords(
	data: unknown
): { success: true; words: WordObject[]; rawText: string } | { success: false; error: string } {
	if (data === null || typeof data !== 'object') {
		return { success: false, error: 'Nieprawidłowy format pliku.' };
	}
	const obj = data as Record<string, unknown>;

	if (obj.version === 1) {
		const legacy = validateLegacyData(data);
		if (!legacy) return { success: false, error: 'Nieprawidłowy format pliku v1.' };
		return { success: true, words: migrateLegacyToWords(legacy), rawText: legacy.rawText };
	}

	if (obj.version === 2) {
		const v2 = validateV2Data(data);
		if (!v2) return { success: false, error: 'Nieprawidłowy format pliku v2.' };
		return { success: true, words: reconstructFromV2(v2), rawText: v2.rawText };
	}

	return { success: false, error: 'Nierozpoznany format pliku.' };
}

/**
 * Validates that two rawText strings match.
 * Used on the compare page to ensure both imported files share the same source text.
 */
export function validateRawTextMatch(
	rawText1: string,
	rawText2: string
): { success: boolean; error?: string } {
	if (rawText1 !== rawText2) {
		return {
			success: false,
			error: 'Teksty w obu plikach różnią się. Porównanie wymaga tego samego tekstu źródłowego.'
		};
	}
	return { success: true };
}

/**
 * Counts the number of words that are marked.
 */
export function countMarkedWords(words: WordObject[]): number {
	return words.filter((w) => w.isMarked).length;
}
