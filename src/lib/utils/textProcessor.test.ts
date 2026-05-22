import { describe, it, expect } from 'vitest';
import { processText } from './textProcessor';

describe('processText', () => {
	it('should return empty array for empty input', () => {
		expect(processText('')).toEqual([]);
		expect(processText('   ')).toEqual([]);
	});

	it('should tokenize text by whitespace', () => {
		const text = 'Svelte 5   runy są   super';
		const result = processText(text);
		expect(result).toHaveLength(5);
		expect(result.map((w) => w.text)).toEqual(['Svelte', '5', 'runy', 'są', 'super']);
	});

	it('should generate deterministic IDs based on index', () => {
		const text = 'raz dwa trzy';
		const result = processText(text);
		expect(result[0].id).toBe('word-0');
		expect(result[1].id).toBe('word-1');
		expect(result[2].id).toBe('word-2');
	});

	it('should set isMarked to false by default', () => {
		const text = 'test';
		const result = processText(text);
		expect(result[0].isMarked).toBe(false);
	});
});
