# Design Document: Compare Attempts

## Architecture Overview

The Compare Attempts feature adds a standalone `/compare` route to the SvelteKit application. It is fully independent of the main page's `documentStore` — all state lives in local component reactive variables (`$state`). The feature reuses the existing `processText` utility and `SegmentSpan` component for consistent word reconstruction and disfluency rendering.

```
/compare (route)
├── +page.svelte (CompareView)
│   ├── Local state: attempt1, attempt2, error
│   ├── Import logic (file picker + validation)
│   ├── Text comparison logic
│   ├── Two-column read-only display
│   ├── Word count summary
│   └── Print button + @media print styles
└── Uses:
    ├── $lib/utils/textProcessor.ts (processText)
    ├── $lib/components/SegmentSpan.svelte (rendering)
    └── $lib/types.ts (ExportData, WordObject, Segment)
```

## Components

### CompareView (`src/routes/compare/+page.svelte`)

The single page component for the `/compare` route. Manages all state locally using Svelte 5 runes.

**Responsibilities:**
- Render two import buttons (one per attempt)
- Validate imported JSON against ExportData schema
- Compare rawText between attempts
- Display two-column read-only text with disfluency highlights
- Compute and display marked word counts
- Trigger browser print dialog

### Reused Components

- **SegmentSpan** — renders individual segments with badge styling (colored background for marked segments). Used in read-only mode within the compare columns.

### Utility Module: `compareUtils.ts` (`src/lib/utils/compareUtils.ts`)

Pure functions extracted for testability:

```typescript
import type { WordObject } from '$lib/types';
import type { ExportData, ExportMark } from '$lib/stores/documentStore.svelte';
import { processText } from '$lib/utils/textProcessor';

/**
 * Validates that a parsed JSON object conforms to the ExportData schema.
 * Returns the typed ExportData if valid, or null if invalid.
 */
export function validateExportData(data: unknown): ExportData | null {
  if (data === null || typeof data !== 'object') return null;
  const obj = data as Record<string, unknown>;
  if (obj.version !== 1) return null;
  if (typeof obj.rawText !== 'string') return null;
  if (!Array.isArray(obj.marks)) return null;
  // Validate each mark entry
  for (const mark of obj.marks) {
    if (typeof mark !== 'object' || mark === null) return null;
    const m = mark as Record<string, unknown>;
    if (typeof m.wordIndex !== 'number') return null;
    if (!Array.isArray(m.segments) || m.segments.length === 0) return null;
    for (const seg of m.segments as unknown[]) {
      if (typeof seg !== 'object' || seg === null) return null;
      const s = seg as Record<string, unknown>;
      if (typeof s.text !== 'string') return null;
      if (typeof s.isMarked !== 'boolean') return null;
    }
  }
  return data as ExportData;
}

/**
 * Reconstructs WordObject[] from a valid ExportData.
 * Uses processText to split rawText into words, then applies marks.
 */
export function reconstructWords(exportData: ExportData): WordObject[] {
  const words = processText(exportData.rawText);
  for (const mark of exportData.marks) {
    if (mark.wordIndex < 0 || mark.wordIndex >= words.length) continue;
    if (!Array.isArray(mark.segments) || mark.segments.length === 0) continue;
    words[mark.wordIndex] = {
      ...words[mark.wordIndex],
      segments: mark.segments.map((s) => ({
        id: crypto.randomUUID(),
        text: s.text,
        isMarked: s.isMarked,
        ...(s.type ? { type: s.type } : {}),
        ...(s.note ? { note: s.note } : {})
      }))
    };
  }
  return words;
}

/**
 * Counts the number of words that have at least one marked segment.
 */
export function countMarkedWords(words: WordObject[]): number {
  return words.filter((w) => w.segments.some((s) => s.isMarked)).length;
}
```

## Interfaces & Data Models

### Local Component State

```typescript
interface AttemptState {
  exportData: ExportData;  // Original imported data (for rawText comparison)
  words: WordObject[];     // Reconstructed word objects with marks applied
}

// In +page.svelte
let attempt1 = $state<AttemptState | null>(null);
let attempt2 = $state<AttemptState | null>(null);
let error = $state<string>('');
```

### ExportData (existing, from documentStore)

```typescript
interface ExportMark {
  wordIndex: number;
  segments: { text: string; isMarked: boolean; type?: DisfluencyType; note?: string }[];
}

interface ExportData {
  version: 1;
  rawText: string;
  marks: ExportMark[];
}
```

### Derived State

```typescript
let markedCount1 = $derived(attempt1 ? countMarkedWords(attempt1.words) : 0);
let markedCount2 = $derived(attempt2 ? countMarkedWords(attempt2.words) : 0);
let bothLoaded = $derived(attempt1 !== null && attempt2 !== null);
```

## Component Behavior

### Import Flow

1. User clicks "Importuj próbę 1" or "Importuj próbę 2"
2. A hidden `<input type="file" accept=".json">` is created and clicked
3. On file selection, `FileReader.readAsText()` reads the content
4. JSON is parsed and validated via `validateExportData()`
5. If invalid → set `error` to Polish message, reject file
6. If valid and this is attempt 2 → compare `rawText` with attempt 1
7. If rawText mismatch → set `error` to Polish message, reject file, keep attempt 1
8. If valid → call `reconstructWords()` and store in `attempt1` or `attempt2`
9. Clear `error`

### Read-Only Display

Words are rendered using `SegmentSpan` without any click handlers or interactive roles. The word container is a plain `<span>` (no `role="button"`, no `tabindex`, no `onclick`).

```svelte
{#each attempt.words as word (word.id)}
  <span class="word-readonly">
    {#each word.segments as segment (segment.id)}
      <SegmentSpan {segment} />
    {/each}
  </span>
{/each}
```

### Print Behavior

- Print button calls `window.print()`
- `@media print` CSS hides buttons, import UI, and error messages
- Two-column layout is preserved with `print-color-adjust: exact`
- Word count summaries remain visible

## Styling

### Two-Column Layout

```css
.compare-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-8);
}

.column-content {
  text-align: justify;
  max-width: 72ch;
  margin: 0 auto;
  padding: 0 var(--space-4);
  font-size: 1.2rem;
  line-height: 1.6;
  hyphens: auto;
  letter-spacing: 0.05em;
}
```

### Print Styles

```css
@media print {
  .compare-header,
  .import-section,
  .import-error,
  button {
    display: none !important;
  }

  .compare-columns {
    grid-template-columns: 1fr 1fr;
  }

  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  .word-count-summary {
    display: block !important;
  }
}
```

### Read-Only Word Styling

```css
.word-readonly {
  display: inline-flex;
  padding: 0 3px;
}
```

## Error Handling

| Scenario | Error Message (Polish) |
|----------|----------------------|
| Invalid JSON parse | "Nieprawidłowy plik. Nie udało się odczytać JSON." |
| Missing ExportData fields | "Nieprawidłowy format pliku. Wymagane pola: version, rawText, marks." |
| rawText mismatch | "Teksty w obu plikach różnią się. Porównanie wymaga tego samego tekstu źródłowego." |

Errors are displayed in a `<p class="import-error">` element that auto-clears after 5 seconds or on next successful import.

## File Structure

```
src/
├── lib/
│   └── utils/
│       └── compareUtils.ts          # Pure validation & reconstruction functions
└── routes/
    └── compare/
        └── +page.svelte             # CompareView page component
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Valid ExportData round-trip reconstruction

For any valid ExportData object (with version=1, non-empty rawText, and well-formed marks where each mark's wordIndex is within bounds), calling `reconstructWords` SHALL produce a WordObject array where every mark's segments are correctly applied at the corresponding word index, and all unmarked words retain their original single-segment structure.

**Validates: Requirements 2.3**

### Property 2: Invalid ExportData rejection

For any JSON value that does not conform to the ExportData schema (missing version, non-string rawText, non-array marks, or malformed mark entries), `validateExportData` SHALL return null.

**Validates: Requirements 2.4**

### Property 3: Text mismatch rejection preserves first attempt

For any valid first attempt and any valid second attempt whose rawText differs from the first attempt's rawText (even by a single character), the import logic SHALL reject the second attempt and the first attempt's data SHALL remain unchanged.

**Validates: Requirements 3.1, 3.2, 3.3**

### Property 4: Marked word count accuracy

For any valid ExportData object, `countMarkedWords(reconstructWords(exportData))` SHALL equal the number of distinct word indices in `exportData.marks` that have at least one segment with `isMarked: true` and whose `wordIndex` is within the bounds of the word array produced by `processText(exportData.rawText)`.

**Validates: Requirements 5.2**

### Property 5: Text equality acceptance

For any two valid ExportData objects that share the same rawText value (character-for-character identical), the import logic SHALL accept both attempts regardless of differences in their marks arrays.

**Validates: Requirements 3.1**
