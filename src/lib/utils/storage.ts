import type { DocumentState, DisfluencyType, Segment, WordObject } from '$lib/types';

const VALID_MODES = ['edit', 'interactive'] as const;
const VALID_DISFLUENCY_TYPES: DisfluencyType[] = ['block', 'repetition', 'prolongation'];

/**
 * Serializes the document state to localStorage.
 * Catches quota errors gracefully so the app continues operating in-memory.
 */
export function serialize(key: string, state: DocumentState): void {
	try {
		localStorage.setItem(key, JSON.stringify(state));
	} catch (e) {
		console.error('Failed to save state:', e);
	}
}

/**
 * Deserializes document state from localStorage.
 * Returns null if the key doesn't exist, JSON is invalid, or the data
 * doesn't conform to the DocumentState schema.
 */
export function deserialize(key: string): DocumentState | null {
	try {
		const raw = localStorage.getItem(key);
		if (!raw) return null;
		const parsed = JSON.parse(raw);
		if (!isValidDocumentState(parsed)) return null;
		return parsed;
	} catch {
		return null;
	}
}

/**
 * Type guard that validates the shape of deserialized data against
 * the DocumentState schema.
 */
export function isValidDocumentState(data: unknown): data is DocumentState {
	if (data === null || typeof data !== 'object') return false;

	const obj = data as Record<string, unknown>;

	// Validate mode
	if (!VALID_MODES.includes(obj.mode as (typeof VALID_MODES)[number])) return false;

	// Validate rawText
	if (typeof obj.rawText !== 'string') return false;

	// Validate words array
	if (!Array.isArray(obj.words)) return false;

	for (const word of obj.words) {
		if (!isValidWordObject(word)) return false;
	}

	return true;
}

function isValidWordObject(data: unknown): data is WordObject {
	if (data === null || typeof data !== 'object') return false;

	const obj = data as Record<string, unknown>;

	if (typeof obj.id !== 'string') return false;
	if (typeof obj.text !== 'string') return false;
	if (!Array.isArray(obj.segments)) return false;

	for (const segment of obj.segments) {
		if (!isValidSegment(segment)) return false;
	}

	return true;
}

function isValidSegment(data: unknown): data is Segment {
	if (data === null || typeof data !== 'object') return false;

	const obj = data as Record<string, unknown>;

	if (typeof obj.id !== 'string') return false;
	if (typeof obj.text !== 'string') return false;
	if (typeof obj.isMarked !== 'boolean') return false;

	// Optional type field — must be a valid DisfluencyType if present
	if ('type' in obj && obj.type !== undefined) {
		if (!VALID_DISFLUENCY_TYPES.includes(obj.type as DisfluencyType)) return false;
	}

	// Optional note field — must be a string if present
	if ('note' in obj && obj.note !== undefined) {
		if (typeof obj.note !== 'string') return false;
	}

	return true;
}
