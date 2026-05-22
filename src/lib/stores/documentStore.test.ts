import { describe, it, expect, beforeEach } from 'vitest';
import { documentStore } from './documentStore.svelte';

describe('documentStore', () => {
	beforeEach(() => {
		window.localStorage.clear();
		// Reset store state by calling returnToEdit and clearing text
		documentStore.returnToEdit();
		documentStore.setRawText('');
	});

	it('should initialize with default state', () => {
		expect(documentStore.mode).toBe('edit');
		expect(documentStore.rawText).toBe('');
		expect(documentStore.words).toEqual([]);
	});

	it('should update raw text', () => {
		documentStore.setRawText('Hello Svelte');
		expect(documentStore.rawText).toBe('Hello Svelte');
	});

	it('should transition to interactive mode and tokenize words', () => {
		documentStore.setRawText('raz dwa');
		documentStore.confirmText();

		expect(documentStore.mode).toBe('interactive');
		expect(documentStore.words).toHaveLength(2);
		expect(documentStore.words[0].text).toBe('raz');
		expect(documentStore.words[1].text).toBe('dwa');
		expect(documentStore.words[0].isMarked).toBe(false);
	});

	it('should toggle word marks', () => {
		documentStore.setRawText('raz dwa');
		documentStore.confirmText();

		const firstWordId = documentStore.words[0].id;
		documentStore.toggleMark(firstWordId);
		expect(documentStore.words[0].isMarked).toBe(true);

		documentStore.toggleMark(firstWordId);
		expect(documentStore.words[0].isMarked).toBe(false);
	});

	it('should return to edit mode', () => {
		documentStore.setRawText('test');
		documentStore.confirmText();
		expect(documentStore.mode).toBe('interactive');

		documentStore.returnToEdit();
		expect(documentStore.mode).toBe('edit');
		expect(documentStore.words).toEqual([]);
	});

	it('should export state to JSON v2 format', () => {
		documentStore.setRawText('raz dwa trzy');
		documentStore.confirmText();
		documentStore.toggleMark(documentStore.words[1].id); // Mark 'dwa'

		const json = documentStore.exportToJson();
		const parsed = JSON.parse(json);

		expect(parsed.version).toBe(2);
		expect(parsed.rawText).toBe('raz dwa trzy');
		expect(parsed.markedIndices).toEqual([1]);
	});

	it('should import state from valid JSON v2', () => {
		const mockExport = JSON.stringify({
			version: 2,
			rawText: 'cztery pięć',
			markedIndices: [0]
		});

		const result = documentStore.importFromJson(mockExport);
		expect(result.success).toBe(true);
		expect(documentStore.rawText).toBe('cztery pięć');
		expect(documentStore.words).toHaveLength(2);
		expect(documentStore.words[0].isMarked).toBe(true);
		expect(documentStore.words[1].isMarked).toBe(false);
		expect(documentStore.mode).toBe('interactive');
	});

	it('should fail importing invalid JSON format', () => {
		const result = documentStore.importFromJson('invalid json');
		expect(result.success).toBe(false);
		expect(result.error).toBeDefined();
	});
});
