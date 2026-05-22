import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import WordDisplay from './WordDisplay.svelte';

describe('WordDisplay.svelte', () => {
	const mockWord = {
		id: 'word-0',
		text: 'Przykładowe',
		isMarked: false
	};

	it('should render the word text', () => {
		const { getByText } = render(WordDisplay, { props: { word: mockWord } });
		expect(getByText('Przykładowe')).toBeInTheDocument();
	});

	it('should render word class and aria-pressed when not marked', () => {
		const { container } = render(WordDisplay, { props: { word: mockWord } });
		const element = container.querySelector('.word-display');
		expect(element).toBeInTheDocument();
		expect(element).not.toHaveClass('marked');
		expect(element).toHaveAttribute('aria-pressed', 'false');
		expect(element).toHaveAttribute('role', 'button');
		expect(element).toHaveAttribute('tabindex', '0');
	});

	it('should render marked class and aria-pressed true when marked', () => {
		const markedWord = { ...mockWord, isMarked: true };
		const { container } = render(WordDisplay, { props: { word: markedWord } });
		const element = container.querySelector('.word-display');
		expect(element).toHaveClass('marked');
		expect(element).toHaveAttribute('aria-pressed', 'true');
	});

	it('should call onToggleMark on click when not readonly', async () => {
		const handleToggle = vi.fn();
		const { container } = render(WordDisplay, {
			props: {
				word: mockWord,
				onToggleMark: handleToggle
			}
		});
		const element = container.querySelector('.word-display')!;
		await fireEvent.click(element);
		expect(handleToggle).toHaveBeenCalledWith('word-0');
	});

	it('should not call onToggleMark on click when readonly', async () => {
		const handleToggle = vi.fn();
		const { container } = render(WordDisplay, {
			props: {
				word: mockWord,
				readonly: true,
				onToggleMark: handleToggle
			}
		});
		const element = container.querySelector('.word-display')!;
		expect(element).toHaveClass('readonly');
		expect(element).not.toHaveAttribute('role');
		expect(element).not.toHaveAttribute('tabindex');
		expect(element).not.toHaveAttribute('aria-pressed');

		await fireEvent.click(element);
		expect(handleToggle).not.toHaveBeenCalled();
	});

	it('should call onToggleMark on Enter or Space press', async () => {
		const handleToggle = vi.fn();
		const { container } = render(WordDisplay, {
			props: {
				word: mockWord,
				onToggleMark: handleToggle
			}
		});
		const element = container.querySelector('.word-display')!;
		await fireEvent.keyDown(element, { key: 'Enter' });
		expect(handleToggle).toHaveBeenCalledTimes(1);

		await fireEvent.keyDown(element, { key: ' ' });
		expect(handleToggle).toHaveBeenCalledTimes(2);
	});
});
