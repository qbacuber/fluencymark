import type { WordObject } from '$lib/types';

/**
 * Processes raw text into an array of WordObjects.
 * Splits text by whitespace boundaries (spaces, tabs, newlines),
 * filters out empty strings, and creates a WordObject for each token.
 * Each word starts unmarked (isMarked: false).
 */
export function processText(rawText: string): WordObject[] {
	if (!rawText) return [];

	const tokens = rawText.split(/\s+/).filter((token) => token.length > 0);

	return tokens.map((token, index) => ({
		id: `word-${index}`,
		text: token,
		isMarked: false
	}));
}
