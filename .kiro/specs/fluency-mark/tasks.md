# Implementation Plan: FluencyMark

## Overview

Incremental implementation of the FluencyMark stuttering therapy tool. Tasks are ordered to build foundational data types first, then state management, then UI components layer by layer. Each task produces working, testable code that builds on previous steps.

## Tasks

- [x] 1. Define data types and constants
  - [x] 1.1 Create `src/lib/types.ts` with all TypeScript interfaces and types
    - Define `DisfluencyType`, `DisfluencyConfig`, `DISFLUENCY_TYPES` constant, `Segment`, `WordObject`, `AppMode`, `DocumentState`
    - Include the color/label mapping for all three disfluency types (block/red, repetition/yellow, prolongation/blue)
    - _Requirements: 4.2, 6.1, 8.3_

- [x] 2. Implement utility functions
  - [x] 2.1 Create `src/lib/utils/textProcessor.ts`
    - Implement `processText(rawText: string): WordObject[]` that splits text by whitespace
    - Use `crypto.randomUUID()` for unique IDs
    - Each word gets a single unmarked segment with the full word text
    - Handle edge cases: empty string, multiple spaces, newlines
    - _Requirements: 3.1, 3.2, 3.3, 1.4_

  - [x]* 2.2 Write property tests for text processor
    - **Property 3: Text Processing Content Preservation**
    - **Property 4: Text Processing Structural Invariants**
    - **Validates: Requirements 3.1, 3.2, 3.3, 1.4**

  - [x] 2.3 Create `src/lib/utils/segmentUtils.ts`
    - Implement `splitSegment(word, segmentId, startOffset, endOffset): WordObject`
    - Implement `markSegment(word, segmentId, type, note?): WordObject`
    - Implement `unmarkSegment(word, segmentId): WordObject`
    - Implement `mergeAdjacentUnmarked(segments): Segment[]`
    - All functions return new objects (immutable updates)
    - _Requirements: 5.2, 4.2, 6.6_

  - [x]* 2.4 Write property tests for segment utilities
    - **Property 5: Segment Text Invariant (Split and Merge)**
    - **Property 6: Marking Produces Correct Structure**
    - **Property 8: Fragment Selection Boundary Detection**
    - **Validates: Requirements 5.2, 6.6, 4.2, 5.1**

  - [x] 2.5 Create `src/lib/utils/storage.ts`
    - Implement `serialize(key, state): void` with try/catch for quota errors
    - Implement `deserialize(key): DocumentState | null` with JSON parse and schema validation
    - Implement `isValidDocumentState(data): data is DocumentState` type guard
    - _Requirements: 9.1, 9.2, 9.3_

  - [x]* 2.6 Write property tests for storage utilities
    - **Property 1: Serialization Round-Trip**
    - **Property 2: Invalid Data Graceful Handling**
    - **Validates: Requirements 9.4, 9.1, 9.2, 9.3**

- [x] 3. Checkpoint - Verify utility layer
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Implement state management
  - [x] 4.1 Create `src/lib/stores/documentStore.svelte.ts`
    - Use Svelte 5 runes (`$state`, `$effect`) for reactive state
    - Load initial state from localStorage via `deserialize()`
    - Auto-persist state changes via `$effect` calling `serialize()`
    - Expose: `mode`, `rawText`, `words` (getters)
    - Expose: `setRawText()`, `confirmText()`, `returnToEdit()`, `updateWord()`
    - _Requirements: 2.1, 2.2, 2.3, 7.1, 7.2, 7.3_

- [x] 5. Implement Editor view
  - [x] 5.1 Create `src/lib/components/EditorView.svelte`
    - Textarea bound to `documentStore.rawText` via `oninput` calling `setRawText()`
    - File upload input (`accept=".txt"`) with FileReader logic
    - Reject non-.txt files with Polish error message
    - "Zatwierdź" button calling `documentStore.confirmText()`
    - _Requirements: 1.1, 1.2, 1.3, 3.4, 3.5_

- [x] 6. Implement Interactive view (basic word display)
  - [x] 6.1 Create `src/lib/components/WordDisplay.svelte`
    - Render a single WordObject as a sequence of segment spans
    - Apply background color classes for marked segments
    - Add `data-word-id` attribute for selection detection
    - Handle click event to trigger context menu for whole-word marking
    - _Requirements: 4.1, 4.3_

  - [x] 6.2 Create `src/lib/components/SegmentSpan.svelte`
    - Render a single Segment with conditional Tailwind background class
    - Display footnote reference number if segment has a note
    - _Requirements: 4.3, 5.4, 8.5_

  - [x] 6.3 Create `src/lib/components/InteractiveView.svelte`
    - Render all WordObjects using WordDisplay components in a flowing text layout
    - "Wróć do edycji" button calling `documentStore.returnToEdit()`
    - "Drukuj do PDF" button calling `window.print()`
    - _Requirements: 3.4, 3.6, 8.1_

- [x] 7. Implement word click marking
  - [x] 7.1 Add click handler to WordDisplay for whole-word marking
    - On click of unmarked word: show context menu
    - On click of marked word: show context menu with remove option
    - Pass word ID and position to context menu
    - _Requirements: 4.1, 4.4_

- [x] 8. Implement Context Menu
  - [x] 8.1 Create `src/lib/components/ContextMenu.svelte`
    - Positioned absolutely near the target element
    - Three disfluency type buttons with colored indicators and Polish labels
    - Optional note text input field
    - "Usuń oznaczenie" button (shown only for marked segments)
    - Close on outside click or Escape key
    - On type selection: call `markSegment()` via store, close menu
    - On remove: call `unmarkSegment()` via store, close menu
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [x] 9. Implement fragment selection marking
  - [x] 9.1 Add mouseup selection handler to InteractiveView
    - Use `window.getSelection()` to detect text selection
    - Find the containing WordDisplay element via DOM traversal
    - Reject cross-word selections (start and end in different words)
    - Calculate character offsets within the word
    - Call `splitSegment()` then show context menu for the new segment
    - _Requirements: 5.1, 5.2, 5.3, 5.5_

- [x] 10. Checkpoint - Verify interactive marking flow
  - Ensure all tests pass, ask the user if questions arise.

- [x] 11. Implement Print/PDF view
  - [x] 11.1 Create `src/lib/components/PrintView.svelte`
    - Render all words with inline background colors for print
    - Generate color legend section listing used DisfluencyTypes with Polish labels
    - Generate numbered footnotes section for segments with notes
    - Add inline footnote reference numbers next to noted segments
    - _Requirements: 8.2, 8.3, 8.4, 8.5_

  - [x] 11.2 Create `src/lib/utils/footnotes.ts`
    - Implement `generateFootnotes(words: WordObject[]): { segmentId: string; number: number; note: string }[]`
    - Collect all segments with notes across all words, assign sequential numbers
    - _Requirements: 8.4, 8.5_

  - [x]* 11.3 Write property test for footnote generation
    - **Property 7: Footnote Consistency**
    - **Validates: Requirements 8.4, 8.5**

  - [x] 11.4 Add print CSS styles
    - `@media print` rules to hide UI controls (buttons, context menu)
    - Show PrintView content with proper colors and layout
    - Ensure legend and footnotes appear at document end
    - _Requirements: 8.1, 8.2_

- [x] 12. Wire up main page
  - [x] 12.1 Update `src/routes/+page.svelte`
    - Conditionally render EditorView or InteractiveView based on `documentStore.mode`
    - Import and use all components
    - Include PrintView (hidden on screen, visible in print)
    - _Requirements: 3.4, 7.3_

- [x] 13. Final checkpoint - Full integration verification
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional property-based tests and can be skipped for faster MVP
- All UI text is in Polish as specified in requirements
- The app uses Svelte 5 runes (`$state`, `$derived`, `$effect`) — no legacy stores
- Tailwind CSS v4 via `@tailwindcss/vite` plugin — no `tailwind.config` file needed
- All state flows through the single `documentStore` — components are stateless views
- Property tests use `fast-check` library with minimum 100 iterations each
