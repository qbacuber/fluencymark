/**
 * Strips leading and trailing punctuation from a word token, then converts it to lowercase.
 * Used for preparing words for comparison and alphabetical listings.
 */
export function cleanText(text: string): string {
	return text
		.replace(/^[.,?!;:—–\-…\u2026"'„”’‘"«»()\[\]{}]+/, '')
		.replace(/[.,?!;:—–\-…\u2026"'„”’‘"«»()\[\]{}]+$/, '')
		.toLowerCase();
}
