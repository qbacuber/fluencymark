# Implementation Plan: Simplify Word Marking

## Overview

This plan converts FluencyMark from a complex segment-based marking system to a minimal whole-word toggle. Work proceeds bottom-up: types and utilities first, then store, then components, then tests. Each step builds on the previous and leaves the app in a compilable state.

## Tasks

- [x] 1. Simplify core types and text processing
  - [x] 1.1 Rewrite `src/lib/types.ts` to remove all disfluency types and segments
    - Remove `DisfluencyType` enum, `DisfluencyConfig`, `DISFLUENCY_TYPES`, and `Segment` interface
    - Simplify `WordObject` to `{ id: string; text: string; isMarked: boolean }`
    - Keep `AppMode` and `DocumentState` types updated to use new `WordObject`
    - _Requirements: 2.1, 2.3, 4.3, 4.4, 5.1, 5.2_

  - [x] 1.2 Simplify `src/lib/utils/textProcessor.ts`
    - Change return type to produce `{ id, text, isMarked: false }` objects (no segments array)
    - Remove any segment-splitting logic
    - _Requirements: 1.3, 5.1_

  - [x] 1.3 Delete obsolete files
    - Delete `src/lib/components/ContextMenu.svelte`
    - Delete `src/lib/components/SegmentSpan.svelte`
    - Delete `src/lib/utils/segmentUtils.ts`
    - _Requirements: 3.1, 1.3, 2.2_

- [x] 2. Create migration utility and update storage
  - [x] 2.1 Create `src/lib/utils/migration.ts`
    - Implement `LegacyExportData` and `ExportDataV2` interfaces
    - Implement `validateLegacyData(data: unknown): LegacyExportData | null`
    - Implement `validateV2Data(data: unknown): ExportDataV2 | null`
    - Implement `migrateLegacyToWords(legacy: LegacyExportData): WordObject[]` — mark word if any segment was marked
    - Implement `reconstructFromV2(data: ExportDataV2): WordObject[]`
    - _Requirements: 7.3, 7.4, 7.6, 8.1, 8.2, 8.4_

  - [x] 2.2 Update `src/lib/utils/storage.ts` validator
    - Update the validator to accept the new `WordObject` shape (no segments)
    - If stored state has old shape (words with segments), discard it and return null
    - _Requirements: 5.1, 5.2_

- [x] 3. Checkpoint
  - Ensure the project compiles with `npm run check`. Ask the user if questions arise.

- [x] 4. Simplify document store
  - [x] 4.1 Rewrite `src/lib/stores/documentStore.svelte.ts`
    - Replace `updateWord` with `toggleMark(wordId: string)` that flips `word.isMarked`
    - Implement `exportToJson()` producing v2 format: `{ version: 2, rawText, markedIndices }`
    - Implement `importFromJson(json: string)` handling v2 imports with validation
    - Implement `importLegacyJson(json: string)` handling v1 migration using `migrateLegacyToWords`
    - Remove all segment-related logic (splitSegment, markSegment, unmarkSegment, etc.)
    - _Requirements: 1.1, 1.2, 2.1, 2.4, 5.3, 5.4, 7.3, 7.4, 7.5, 7.6, 7.7_

- [x] 5. Simplify components
  - [x] 5.1 Simplify `src/lib/components/WordDisplay.svelte`
    - Remove `SegmentSpan` iteration; render `word.text` directly in a single `<span>`
    - Apply `.marked` CSS class when `word.isMarked` is true
    - Accept `onToggleMark(wordId)` prop; call it on click/Enter/Space
    - Clear browser selection if user drag-selected text before clicking
    - Add `role="button"` and `tabindex="0"` for accessibility
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 3.2, 4.1, 4.2_

  - [x] 5.2 Simplify `src/lib/components/InteractiveView.svelte`
    - Remove all `ContextMenu` imports and state variables
    - Remove `handleMouseUp` / segment-splitting logic
    - Wire `WordDisplay` `onToggleMark` to `documentStore.toggleMark`
    - Add "Importuj stary JSON" button calling `handleLegacyImport` (file picker → `importLegacyJson`)
    - Clear browser selection on mouseup to prevent sub-word highlighting
    - Display timed error message on import failure
    - _Requirements: 1.4, 3.1, 3.2, 3.3, 7.1, 7.2, 7.5, 7.6_

  - [x] 5.3 Simplify `src/lib/components/PrintView.svelte`
    - Derive sorted list of marked word texts (lowercase, leading/trailing punctuation stripped)
    - Sort using Polish locale collation (`'pl'`)
    - Display flat list with total count of marked words
    - Remove type labels, color indicators, and notes
    - Show nothing if no words are marked
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 6. Checkpoint
  - Ensure the project compiles with `npm run check`. Ask the user if questions arise.

- [x] 7. Update compare page
  - [x] 7.1 Rewrite `src/lib/utils/compareUtils.ts`
    - Implement `validateAndReconstructWords(data: unknown)` supporting both v1 and v2 formats
    - Use `migrateLegacyToWords` for v1 files, `reconstructFromV2` for v2 files
    - Validate rawText match between two imports
    - _Requirements: 8.1, 8.2, 8.4, 8.5, 8.6_

  - [x] 7.2 Update `src/routes/compare/+page.svelte`
    - Use new `validateAndReconstructWords` for file imports
    - Display marked words with uniform highlight style (no colors/types)
    - Show appropriate error messages for invalid files or mismatched texts
    - _Requirements: 8.1, 8.2, 8.3, 8.5, 8.6_

- [ ] 8. Set up testing framework and add property-based tests
  - [ ] 8.1 Configure vitest and fast-check
    - Add `vitest`, `fast-check`, and `@testing-library/svelte` as dev dependencies in `package.json`
    - Create `vitest.config.ts` with SvelteKit alias resolution
    - Add `"test": "vitest --run"` script to `package.json`
    - _Requirements: (infrastructure for testing)_

  - [ ]* 8.2 Write property test: Toggle inverts marked state
    - Create `src/lib/utils/__tests__/toggle.test.ts`
    - **Property 1: Toggle inverts marked state**
    - Generate random `WordObject`, call `toggleMark`, assert `isMarked` flipped
    - **Validates: Requirements 1.1, 1.2, 2.4, 3.2**

  - [ ]* 8.3 Write property test: Word structure invariant
    - Create `src/lib/utils/__tests__/textProcessor.test.ts`
    - **Property 2: Word structure invariant**
    - Generate random strings, call `processText`, assert each word has exactly `{id, text, isMarked}` with `isMarked === false`
    - **Validates: Requirements 1.3, 2.1, 2.3, 4.3, 5.1, 5.2**

  - [ ]* 8.4 Write property test: Export produces valid v2 structure
    - Create `src/lib/utils/__tests__/export.test.ts`
    - **Property 3: Export produces valid v2 structure**
    - Generate random word arrays with random marks, export, parse, validate schema and sorted indices
    - **Validates: Requirements 5.3, 5.4**

  - [ ]* 8.5 Write property test: Export/Import round-trip
    - Add to `src/lib/utils/__tests__/export.test.ts`
    - **Property 4: Export/Import round-trip**
    - Generate random state, export to v2, import back, compare `isMarked` for each word
    - **Validates: Requirements 5.3, 8.2**

  - [ ]* 8.6 Write property test: Legacy migration marks word if any segment was marked
    - Create `src/lib/utils/__tests__/migration.test.ts`
    - **Property 5: Legacy migration marks word if any segment was marked**
    - Generate random v1 data with random segments, migrate, verify `isMarked === segments.some(s => s.isMarked)`
    - **Validates: Requirements 7.3, 7.4, 8.1**

  - [ ]* 8.7 Write property test: Invalid input rejection
    - Add to `src/lib/utils/__tests__/migration.test.ts`
    - **Property 6: Invalid input rejection**
    - Generate random non-conforming objects, verify validation returns null
    - **Validates: Requirements 7.6, 8.5**

  - [ ]* 8.8 Write property test: Print summary formatting
    - Create `src/lib/utils/__tests__/printSummary.test.ts`
    - **Property 7: Print summary formatting**
    - Generate random marked words, verify sort order matches Polish locale and text cleaning is correct
    - **Validates: Requirements 6.1, 6.4**

  - [ ]* 8.9 Write property test: Marked word count accuracy
    - Add to `src/lib/utils/__tests__/printSummary.test.ts`
    - **Property 8: Marked word count accuracy**
    - Generate random word arrays, verify count equals `words.filter(w => w.isMarked).length`
    - **Validates: Requirements 6.3**

  - [ ]* 8.10 Write property test: Compare page rejects mismatched texts
    - Add to `src/lib/utils/__tests__/migration.test.ts`
    - **Property 9: Compare page rejects mismatched texts**
    - Generate two different rawText strings, verify rejection
    - **Validates: Requirements 8.6**

- [ ] 9. Final checkpoint
  - Ensure all tests pass with `npm run test` and the project compiles with `npm run check`. Ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- The design uses TypeScript throughout (SvelteKit project)
- Files deleted in task 1.3 must be removed before components are simplified to avoid stale imports

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "1.3"] },
    { "id": 2, "tasks": ["2.1", "2.2"] },
    { "id": 3, "tasks": ["4.1"] },
    { "id": 4, "tasks": ["5.1", "5.2", "5.3"] },
    { "id": 5, "tasks": ["7.1"] },
    { "id": 6, "tasks": ["7.2"] },
    { "id": 7, "tasks": ["8.1"] },
    { "id": 8, "tasks": ["8.2", "8.3", "8.4", "8.6", "8.7", "8.8", "8.9", "8.10"] },
    { "id": 9, "tasks": ["8.5"] }
  ]
}
```
