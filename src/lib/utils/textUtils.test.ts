import { describe, it, expect } from 'vitest';
import { cleanText } from './textUtils';

describe('cleanText', () => {
	it('converts to lowercase', () => {
		expect(cleanText('HELLO')).toBe('hello');
		expect(cleanText('Svelte')).toBe('svelte');
	});

	it('removes leading and trailing punctuation', () => {
		expect(cleanText('hello,')).toBe('hello');
		expect(cleanText('...world!')).toBe('world');
		expect(cleanText('„cytat”')).toBe('cytat');
		expect(cleanText('(nawias)')).toBe('nawias');
		expect(cleanText('[nawias]')).toBe('nawias');
		expect(cleanText('{nawias}')).toBe('nawias');
	});

	it('retains middle punctuation', () => {
		expect(cleanText('state-of-the-art')).toBe('state-of-the-art');
		expect(cleanText('o.o')).toBe('o.o');
	});

	it('handles empty and whitespace values', () => {
		expect(cleanText('')).toBe('');
		expect(cleanText('...')).toBe('');
	});
});
