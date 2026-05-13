# Implementation Plan: Compare Attempts

## Overview

Implement a standalone `/compare` route in the SvelteKit app that allows importing two JSON session files, validating they share the same source text, displaying them side-by-side with disfluency highlights, showing marked word counts, and supporting PDF printing. All UI in Polish.

## Tasks

- [x] 1. Create utility module and route structure
  - [x] 1.1 Create `src/lib/utils/compareUtils.ts` with validation and reconstruction functions
    - Implement `validateExportData(data: unknown): ExportData | null`
    - Implement `reconstructWords(exportData: ExportData): WordObject[]`
    - Implement `countMarkedWords(words: WordObject[]): number`
    - Import types from `$lib/types` and `$lib/stores/documentStore.svelte`
    - Import `processText` from `$lib/utils/textProcessor`
    - _Requirements: 2.3, 2.4, 5.2_

  - [x] 1.2 Create `src/routes/compare/+page.svelte` with basic page skeleton
    - Set up the route file with `<script lang="ts">` using Svelte 5 runes
    - Define local state: `attempt1`, `attempt2`, `error` using `$state`
    - Define derived state: `markedCount1`, `markedCount2`, `bothLoaded` using `$derived`
    - Add basic HTML structure with Polish heading "Porównanie prób"
    - _Requirements: 1.1, 1.2, 1.3_

- [x] 2. Implement import logic and validation
  - [x] 2.1 Add file import functionality to `+page.svelte`
    - Create `importAttempt(slot: 1 | 2)` function that opens a file picker restricted to `.json`
    - Parse selected file with `FileReader.readAsText()`
    - Validate with `validateExportData()` — show Polish error on failure
    - For attempt 2: compare `rawText` with attempt 1 — show Polish error on mismatch, keep attempt 1
    - On success: call `reconstructWords()` and store in the appropriate state variable, clear error
    - Add auto-clear of error after 5 seconds
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3_

  - [x] 2.2 Render import buttons and error display
    - Add two buttons: "Importuj próbę 1" and "Importuj próbę 2"
    - Display error message in `<p class="import-error">` when `error` is non-empty
    - _Requirements: 2.1, 7.1, 7.2_

- [x] 3. Implement side-by-side display
  - [x] 3.1 Add two-column read-only text display in `+page.svelte`
    - When `bothLoaded` is true, render `.compare-columns` grid with two columns
    - Each column iterates over `attempt.words` and renders `SegmentSpan` for each segment
    - Use read-only word wrapper (`<span class="word-readonly">`) — no click handlers
    - Import and use `SegmentSpan` component from `$lib/components/SegmentSpan.svelte`
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [x] 3.2 Add word count summary below each column
    - Display "Zaznaczone wyrazy: {count}" below each column using derived `markedCount1`/`markedCount2`
    - Summary updates reactively when an attempt is re-imported
    - _Requirements: 5.1, 5.2, 5.3_

- [x] 4. Implement print support and styling
  - [x] 4.1 Add print button and `@media print` CSS rules
    - Add "Drukuj do PDF" button that calls `window.print()`
    - Add `@media print` rules: hide buttons, import section, error messages
    - Preserve two-column layout and disfluency colors with `print-color-adjust: exact`
    - Keep word count summaries visible in print
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [x] 4.2 Add component styling (layout, typography, read-only words)
    - Style `.compare-columns` as CSS grid with `1fr 1fr`
    - Style `.column-content` with text-justify, max-width 72ch, font-size 1.2rem, line-height 1.6, letter-spacing 0.05em
    - Style `.word-readonly` as inline-flex with padding
    - Style `.import-error` for error visibility
    - _Requirements: 4.4, 7.1_

- [x] 5. Checkpoint
  - Ensure the app builds without errors (`npm run check`), ask the user if questions arise.

- [ ] 6. Add testing infrastructure and property tests
  - [ ] 6.1 Set up Vitest testing framework
    - Install `vitest` as dev dependency
    - Add `test` script to `package.json`
    - Configure Vitest in `vite.config.ts` (or `vitest.config.ts`)
    - _Requirements: (infrastructure)_

  - [ ]* 6.2 Write property test: Valid ExportData round-trip reconstruction
    - **Property 1: Valid ExportData round-trip reconstruction**
    - Create `src/lib/utils/compareUtils.test.ts`
    - Generate arbitrary valid ExportData objects and verify `reconstructWords` applies marks correctly
    - **Validates: Requirements 2.3**

  - [ ]* 6.3 Write property test: Invalid ExportData rejection
    - **Property 2: Invalid ExportData rejection**
    - Generate arbitrary JSON values that violate the ExportData schema
    - Verify `validateExportData` returns null for all invalid inputs
    - **Validates: Requirements 2.4**

  - [ ]* 6.4 Write property test: Marked word count accuracy
    - **Property 4: Marked word count accuracy**
    - Generate valid ExportData with various mark configurations
    - Verify `countMarkedWords(reconstructWords(data))` equals expected count
    - **Validates: Requirements 5.2**

  - [ ]* 6.5 Write unit tests for text mismatch rejection and acceptance
    - **Property 3: Text mismatch rejection preserves first attempt**
    - **Property 5: Text equality acceptance**
    - Test that differing rawText rejects second attempt and preserves first
    - Test that identical rawText accepts both attempts regardless of marks
    - **Validates: Requirements 3.1, 3.2, 3.3**

- [ ] 7. Final checkpoint
  - Ensure all tests pass and `npm run check` succeeds, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- The compare route is fully independent of the main page's documentStore
- All UI text is in Polish per Requirement 7
- Vitest setup (task 6.1) is needed because no test framework currently exists in the project

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["2.1", "2.2"] },
    { "id": 2, "tasks": ["3.1", "3.2"] },
    { "id": 3, "tasks": ["4.1", "4.2"] },
    { "id": 4, "tasks": ["6.1"] },
    { "id": 5, "tasks": ["6.2", "6.3", "6.4", "6.5"] }
  ]
}
```
