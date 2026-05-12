import type { WordObject } from '$lib/types';

export interface FootnoteEntry {
	segmentId: string;
	number: number;
	note: string;
}

/**
 * Collects all segments with notes across all words and assigns sequential footnote numbers.
 */
export function generateFootnotes(words: WordObject[]): FootnoteEntry[] {
	const footnotes: FootnoteEntry[] = [];
	let counter = 1;

	for (const word of words) {
		for (const segment of word.segments) {
			if (segment.note) {
				footnotes.push({
					segmentId: segment.id,
					number: counter,
					note: segment.note
				});
				counter++;
			}
		}
	}

	return footnotes;
}
