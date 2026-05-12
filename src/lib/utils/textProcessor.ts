import type { WordObject } from '$lib/types';

/**
 * Processes raw text into an array of WordObjects.
 * Splits text by whitespace boundaries (spaces, tabs, newlines),
 * filters out empty strings, and creates a WordObject for each token.
 * Each word starts with a single unmarked segment containing the full word text.
 */
export function processText(rawText: string): WordObject[] {
	if (!rawText) return [];

	const tokens = rawText.split(/\s+/).filter((token) => token.length > 0);

	return tokens.map((token) => ({
		id: crypto.randomUUID(),
		text: token,
		segments: [
			{
				id: crypto.randomUUID(),
				text: token,
				isMarked: false
			}
		]
	}));
}
