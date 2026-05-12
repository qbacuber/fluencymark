# Implementation Plan: UI Redesign (Birchline Design System)

## Overview

Replace Tailwind CSS with a pure CSS architecture using Birchline design tokens, update the DisfluencyConfig type system, restyle all components with scoped CSS, change click interaction to toggle-mark behavior, and redesign PrintView with a streamlined summary layout. Implementation proceeds foundation-first: CSS tokens → types → components → interactions → print → cleanup.

## Tasks

- [x] 1. Remove Tailwind and set up CSS token system
  - [x] 1.1 Remove Tailwind from build configuration
    - Remove `@tailwindcss/vite` import and plugin from `vite.config.ts`
    - Remove `tailwindcss`, `@tailwindcss/vite`, and `prettier-plugin-tailwindcss` from `package.json` devDependencies
    - _Requirements: 1.1, 1.2_

  - [x] 1.2 Create global.css with Birchline design tokens
    - Create `src/routes/global.css` with all `:root` CSS custom properties (brand colors, neutrals, semantic colors, semantic tints, spacing, radius, shadows, typography)
    - Add base element styles (box-sizing, body, h1, h2)
    - Move print styles from `layout.css` into `global.css` (updated to use tokens)
    - Add `.print-view { display: none; }` screen rule
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 3.1, 3.2, 3.3, 3.4_

  - [x] 1.3 Update +layout.svelte to import global.css
    - Change `import './layout.css'` to `import './global.css'` in `src/routes/+layout.svelte`
    - _Requirements: 1.3_

- [x] 2. Update type system
  - [x] 2.1 Migrate DisfluencyConfig to hex colors
    - In `src/lib/types.ts`, replace `color: string` (Tailwind class) with `color: string` (hex border color)
    - Remove `printColor` field
    - Add `bgColor: string` field (hex tinted background)
    - Update `DISFLUENCY_TYPES` record: block → danger (#B04A4A / #f5e0e0), repetition → warning (#C78E3F / #faf0e0), prolongation → info (#5C7CA3 / #e0eaf3)
    - _Requirements: 9.1, 9.2, 8.1, 8.2, 8.3, 8.4_

- [x] 3. Restyle components with scoped CSS
  - [x] 3.1 Restyle EditorView.svelte
    - Replace all Tailwind utility classes with a `<style>` block using CSS custom properties
    - Centered card layout with `--shadow-md`, white background, `--radius-md`
    - Textarea with `--radius-sm`, `--color-gray-300` border
    - Confirm button with `--color-primary` background, white text, `--radius-sm`
    - Error message with `--color-danger` text
    - _Requirements: 1.4, 3.5, 3.6_

  - [x] 3.2 Restyle ContextMenu.svelte
    - Replace all Tailwind utility classes with scoped CSS
    - Card: white background, `--shadow-lg`, `--radius-md`, `--color-gray-300` border
    - Buttons: hover uses `--color-gray-100`
    - Color swatches use inline styles with `DisfluencyConfig.color` (border) and `DisfluencyConfig.bgColor` (fill)
    - Remove button uses `--color-danger` tint background
    - _Requirements: 1.4, 3.6_

  - [x] 3.3 Restyle SegmentSpan.svelte
    - Replace Tailwind color class with inline style using `DisfluencyConfig.bgColor` and `DisfluencyConfig.color`
    - Marked segments render with: `background-color`, `border: 1.5px solid`, `border-radius: var(--radius-xs)`
    - Footnote superscript uses scoped CSS instead of Tailwind
    - _Requirements: 1.4, 8.4, 9.3_

  - [ ]* 3.4 Write unit tests for SegmentSpan styling logic
    - **Property 4: Marked segments display correct colors from DisfluencyConfig**
    - **Validates: Requirements 8.1, 8.2, 8.3, 8.4, 9.3**

- [x] 4. Implement interaction behavior changes
  - [x] 4.1 Update WordDisplay.svelte with toggle-mark logic
    - Remove `onWordClick` prop
    - Add `onToggleMark: (wordId: string) => void` prop
    - Implement `onclick` handler: if word has any marked segment → unmark all; if unmarked → mark all as "block"
    - Replace Tailwind classes with scoped CSS (cursor pointer, `--radius-xs`, hover outline `--color-gray-300`)
    - _Requirements: 4.1, 4.2, 4.3, 1.4_

  - [x] 4.2 Update InteractiveView.svelte for new interaction model
    - Remove `handleWordClick` function
    - Add `handleToggleMark(wordId: string)` function that updates documentStore
    - Pass `onToggleMark` to WordDisplay instead of `onWordClick`
    - Replace all Tailwind classes with scoped CSS
    - Text container: `text-align: justify`, `max-width: 72ch`, centered, horizontal padding `--space-6`
    - Header bar and buttons styled with tokens
    - Context menu only triggers on non-collapsed selection (existing `handleMouseUp` logic preserved)
    - _Requirements: 4.1, 4.2, 4.3, 5.1, 5.2, 5.3, 5.4, 6.1, 6.2, 1.4_

  - [ ]* 4.3 Write property test for single-click toggle behavior
    - **Property 2: Single click toggles block marking**
    - **Validates: Requirements 4.1, 4.2**

  - [ ]* 4.4 Write property test for context menu trigger conditions
    - **Property 1: Single click never triggers context menu**
    - **Property 3: Text selection triggers context menu**
    - **Validates: Requirements 4.3, 5.1, 5.4**

- [x] 5. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Redesign PrintView
  - [x] 6.1 Rewrite PrintView.svelte with new structure
    - Remove legend section and footnotes system
    - Remove `generateFootnotes` import
    - Render single marked text block with inline styles from DisfluencyConfig (bgColor + color border)
    - Add Summary Section ("Podsumowanie") listing marked words as: `word → typeLabel` or `word → typeLabel + comment`
    - Use scoped CSS with tokens for layout (justified text, `max-width: 72ch`, summary border-top)
    - Replace all Tailwind classes
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 1.4_

  - [ ]* 6.2 Write property test for print summary correctness
    - **Property 5: Print summary lists all marked words with correct format**
    - **Validates: Requirements 7.2, 7.3**

- [x] 7. Cleanup
  - [x] 7.1 Delete unused files
    - Delete `src/lib/utils/footnotes.ts` (no longer imported anywhere)
    - Delete `src/routes/layout.css` (replaced by `global.css`)
    - _Requirements: 1.3, 1.4_

  - [x] 7.2 Verify no Tailwind remnants
    - Search all `.svelte` and `.css` files for any remaining Tailwind utility classes or `@import 'tailwindcss'` directives
    - Fix any remaining references
    - _Requirements: 1.3, 1.4_

- [ ] 8. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- The implementation language is TypeScript with Svelte 5 (runes mode) and SvelteKit
- All components use `<style>` blocks for scoped CSS referencing global CSS custom properties

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["1.3", "2.1"] },
    { "id": 2, "tasks": ["3.1", "3.2", "3.3"] },
    { "id": 3, "tasks": ["3.4", "4.1"] },
    { "id": 4, "tasks": ["4.2"] },
    { "id": 5, "tasks": ["4.3", "4.4", "6.1"] },
    { "id": 6, "tasks": ["6.2", "7.1"] },
    { "id": 7, "tasks": ["7.2"] }
  ]
}
```
