import { describe, it, expect } from 'vitest';
import {
	validateAndReconstructWords,
	validateRawTextMatch,
	countMarkedWords
} from './compareUtils';

describe('compareUtils', () => {
	describe('countMarkedWords', () => {
		it('should correctly count marked words', () => {
			const words = [
				{ id: '1', text: 'a', isMarked: true },
				{ id: '2', text: 'b', isMarked: false },
				{ id: '3', text: 'c', isMarked: true }
			];
			expect(countMarkedWords(words)).toBe(2);
		});
	});

	describe('validateRawTextMatch', () => {
		it('should succeed if texts are equal', () => {
			expect(validateRawTextMatch('hello', 'hello')).toEqual({ success: true });
		});

		it('should fail if texts differ', () => {
			const result = validateRawTextMatch('hello', 'world');
			expect(result.success).toBe(false);
			expect(result.error).toContain('różnią się');
		});
	});

	describe('validateAndReconstructWords', () => {
		it('should reject invalid object shapes', () => {
			expect(validateAndReconstructWords(null).success).toBe(false);
			expect(validateAndReconstructWords({}).success).toBe(false);
			expect(validateAndReconstructWords({ version: 1 }).success).toBe(false);
		});

		it('should reconstruct from valid v2 data', () => {
			const mockV2 = {
				version: 2,
				rawText: 'raz dwa trzy',
				markedIndices: [1]
			};
			const result = validateAndReconstructWords(mockV2);
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.rawText).toBe('raz dwa trzy');
				expect(result.words).toHaveLength(3);
				expect(result.words[0].isMarked).toBe(false);
				expect(result.words[1].isMarked).toBe(true);
				expect(result.words[2].isMarked).toBe(false);
			}
		});
	});
});
