import type { DisfluencyType, Segment, WordObject } from '$lib/types';

/**
 * Merges consecutive unmarked segments into a single segment.
 * Keeps the first segment's ID when combining.
 */
export function mergeAdjacentUnmarked(segments: Segment[]): Segment[] {
	if (segments.length === 0) return [];

	const result: Segment[] = [];
	let current: Segment = { ...segments[0] };

	for (let i = 1; i < segments.length; i++) {
		const seg = segments[i];
		if (!current.isMarked && !seg.isMarked) {
			// Merge: combine text, keep current's ID
			current = { ...current, text: current.text + seg.text };
		} else {
			result.push(current);
			current = { ...seg };
		}
	}
	result.push(current);

	return result;
}

/**
 * Splits a segment at the given character offsets within the segment's text.
 * Returns a new WordObject with the segment replaced by up to three segments:
 * - before (if startOffset > 0)
 * - selected (from startOffset to endOffset)
 * - after (if endOffset < segment text length)
 *
 * Edge cases:
 * - Offsets at boundaries (start=0 or end=text.length) produce fewer segments
 * - Invalid offsets are clamped to valid range [0, text.length]
 */
export function splitSegment(
	word: WordObject,
	segmentIndex: number,
	startOffset: number,
	endOffset: number
): WordObject {
	const segment = word.segments[segmentIndex];
	if (!segment) return { ...word, segments: [...word.segments] };

	const text = segment.text;
	const len = text.length;

	// Clamp offsets to valid range
	const start = Math.max(0, Math.min(startOffset, len));
	const end = Math.max(start, Math.min(endOffset, len));

	// If the selection covers the entire segment, no split needed
	if (start === 0 && end === len) {
		return { ...word, segments: [...word.segments] };
	}

	const newSegments: Segment[] = [];

	// Before portion
	if (start > 0) {
		newSegments.push({
			id: crypto.randomUUID(),
			text: text.slice(0, start),
			isMarked: false
		});
	}

	// Selected portion
	newSegments.push({
		id: crypto.randomUUID(),
		text: text.slice(start, end),
		isMarked: false
	});

	// After portion
	if (end < len) {
		newSegments.push({
			id: crypto.randomUUID(),
			text: text.slice(end),
			isMarked: false
		});
	}

	// Replace the original segment with the new segments
	const updatedSegments = [
		...word.segments.slice(0, segmentIndex),
		...newSegments,
		...word.segments.slice(segmentIndex + 1)
	];

	return { ...word, segments: updatedSegments };
}

/**
 * Marks a specific segment with a disfluency type.
 * Returns a new WordObject with the segment updated.
 */
export function markSegment(
	word: WordObject,
	segmentId: string,
	type: DisfluencyType,
	note?: string
): WordObject {
	const updatedSegments = word.segments.map((seg) => {
		if (seg.id === segmentId) {
			return {
				...seg,
				isMarked: true,
				type,
				note
			};
		}
		return seg;
	});

	return { ...word, segments: updatedSegments };
}

/**
 * Removes marking from a segment, then merges adjacent unmarked segments.
 * Returns a new WordObject with the updated segments array.
 */
export function unmarkSegment(word: WordObject, segmentId: string): WordObject {
	const updatedSegments = word.segments.map((seg) => {
		if (seg.id === segmentId) {
			return {
				id: seg.id,
				text: seg.text,
				isMarked: false
			};
		}
		return seg;
	});

	return { ...word, segments: mergeAdjacentUnmarked(updatedSegments) };
}
