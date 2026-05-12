# Design Document: UI Redesign (Birchline Design System)

## Overview

This design replaces Tailwind CSS with a pure CSS architecture based on the Birchline design system. It introduces CSS custom properties as design tokens, changes interaction patterns for faster disfluency marking, streamlines the print layout, and adds bordered badges for visual clarity.

The programming language for this project is **TypeScript** with **Svelte 5** (runes mode) and **SvelteKit**.

---

## 1. CSS Architecture

### 1.1 Global Tokens File

A new file `src/routes/global.css` replaces `src/routes/layout.css`. It defines all Birchline design tokens as CSS custom properties on `:root` and provides base element styles.

```css
/* src/routes/global.css */
:root {
  /* Brand Colors */
  --color-primary: #D97757;
  --color-slate: #141413;
  --color-ivory: #FAF9F5;
  --color-oat: #E3DACC;

  /* Neutral Colors */
  --color-white: #FFFFFF;
  --color-gray-100: #F0EEE6;
  --color-gray-300: #D1CFC5;
  --color-gray-500: #87867F;
  --color-gray-700: #3D3D3A;

  /* Semantic Colors */
  --color-success: #788C5D;
  --color-warning: #C78E3F;
  --color-danger: #B04A4A;
  --color-info: #5C7CA3;

  /* Semantic Tints (light backgrounds for badges) */
  --color-danger-tint: #f5e0e0;
  --color-warning-tint: #faf0e0;
  --color-info-tint: #e0eaf3;

  /* Spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;
  --space-12: 48px;
  --space-16: 64px;

  /* Border Radius */
  --radius-xs: 4px;
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 20px;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.06);
  --shadow-md: 0 4px 10px rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 12px 28px rgba(0, 0, 0, 0.12);

  /* Typography */
  --font-size-body: 16px;
  --line-height-body: 1.55;
  --font-weight-body: 430;
  --font-size-h1: 32px;
  --line-height-h1: 1.2;
  --font-weight-h1: 500;
  --font-size-h2: 24px;
  --line-height-h2: 1.3;
  --font-weight-h2: 500;
}
```

### 1.2 Base Element Styles

The global CSS file also includes base styles applied to HTML elements:

```css
*, *::before, *::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  background-color: var(--color-ivory);
  color: var(--color-slate);
  font-size: var(--font-size-body);
  line-height: var(--line-height-body);
  font-weight: var(--font-weight-body);
  font-family: system-ui, -apple-system, sans-serif;
}

h1 {
  font-size: var(--font-size-h1);
  line-height: var(--line-height-h1);
  font-weight: var(--font-weight-h1);
}

h2 {
  font-size: var(--font-size-h2);
  line-height: var(--line-height-h2);
  font-weight: var(--font-weight-h2);
}
```

### 1.3 Print Styles

Print styles remain in the global CSS file:

```css
@media print {
  button, .context-menu, textarea, input[type='file'] {
    display: none !important;
  }
  .print-view {
    display: block !important;
  }
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  body {
    padding: 0;
    margin: 0;
    background-color: var(--color-white);
  }
}

.print-view {
  display: none;
}
```

### 1.4 Component Scoped Styles

Each Svelte component uses `<style>` blocks for component-specific styles, referencing global CSS custom properties. No Tailwind utility classes are used anywhere.

---

## 2. Type System Changes

### 2.1 DisfluencyConfig

The `DisfluencyConfig` interface changes its `color` field from a Tailwind class string to a hex color value. The `printColor` field is removed since the same hex value serves both screen and print.

```typescript
// src/lib/types.ts

export interface DisfluencyConfig {
  type: DisfluencyType;
  label: string;           // Polish label
  color: string;           // Hex color for border (semantic color)
  bgColor: string;         // Hex color for light tinted background
}

export const DISFLUENCY_TYPES: Record<DisfluencyType, DisfluencyConfig> = {
  block: {
    type: 'block',
    label: 'Blokada',
    color: '#B04A4A',      // danger
    bgColor: '#f5e0e0'     // danger-tint
  },
  repetition: {
    type: 'repetition',
    label: 'Powtórzenie',
    color: '#C78E3F',      // warning
    bgColor: '#faf0e0'     // warning-tint
  },
  prolongation: {
    type: 'prolongation',
    label: 'Przedłużenie',
    color: '#5C7CA3',      // info
    bgColor: '#e0eaf3'     // info-tint
  }
};
```

### 2.2 Other Types

The `Segment`, `WordObject`, `AppMode`, and `DocumentState` types remain unchanged. No structural changes to the data model are needed.

---

## 3. Component Changes

### 3.1 `+layout.svelte`

- Import `./global.css` instead of `./layout.css`

### 3.2 `EditorView.svelte`

**Styling changes:**
- Replace all Tailwind classes with scoped CSS
- Use a centered card layout with `--shadow-md`, white background, `--radius-md`
- Textarea uses `--radius-sm` border, `--color-gray-300` border color
- Confirm button uses `--color-primary` background, white text, `--radius-sm`
- File upload label uses `--color-gray-700` text
- Error message uses `--color-danger` text

**No behavioral changes.**

### 3.3 `InteractiveView.svelte`

**Styling changes:**
- Replace all Tailwind classes with scoped CSS
- Text container: `text-align: justify`, `max-width: 72ch`, centered with `margin: 0 auto`, horizontal padding `--space-6`
- Header bar: flex layout with gap, margin-bottom
- Buttons: primary uses `--color-primary`, secondary uses `--color-gray-100` background

**Behavioral changes:**
- Remove `handleWordClick` callback (no longer passed to WordDisplay)
- Single click on a word now toggles "block" marking directly (handled in WordDisplay)
- Context menu only appears on `mouseup` when `selection.isCollapsed === false` (text selection)
- The `handleMouseUp` function remains but the context menu trigger logic is already correct (only shows on non-collapsed selection)

**Updated event flow:**
1. Single click on word → WordDisplay handles toggle internally, no event bubbles to InteractiveView
2. Mouse drag (text selection) → `handleMouseUp` fires, detects non-collapsed selection, splits segment, shows context menu

### 3.4 `WordDisplay.svelte`

**Styling changes:**
- Replace Tailwind classes with scoped CSS
- Cursor pointer, `--radius-xs` border-radius
- Hover: outline `1px solid var(--color-gray-300)`

**Behavioral changes:**
- `onWordClick` prop is removed
- New `onclick` handler implements toggle logic:
  - If word has any marked segment → unmark all segments (set `isMarked: false`, clear `type`)
  - If word is fully unmarked → mark all segments as `block`
- Dispatches update via a new `onToggleMark` prop: `(wordId: string, marked: boolean) => void`

```typescript
// WordDisplay props
{
  word: WordObject;
  onToggleMark: (wordId: string) => void;
}
```

### 3.5 `SegmentSpan.svelte`

**Styling changes:**
- Replace Tailwind color class with inline style using `DisfluencyConfig.bgColor` and `DisfluencyConfig.color`
- Marked segments render with: `background-color: {config.bgColor}; border: 1.5px solid {config.color}; border-radius: var(--radius-xs);`
- Footnote superscript uses scoped CSS instead of Tailwind

### 3.6 `ContextMenu.svelte`

**Styling changes:**
- Replace all Tailwind classes with scoped CSS
- Card: white background, `--shadow-lg`, `--radius-md`, `--color-gray-300` border
- Buttons: hover uses `--color-gray-100`
- Color swatches use inline styles with `DisfluencyConfig.color` (border) and `DisfluencyConfig.bgColor` (fill)
- Remove button uses `--color-danger` tint background

**No behavioral changes** (still receives same props, still shows type options + note field).

### 3.7 `PrintView.svelte`

**Structural changes:**
- Remove the "Legenda" (legend) section
- Remove footnotes system entirely
- Replace with a single text block followed by a Summary Section

**New structure:**

```svelte
<div class="print-view">
  <h1>FluencyMark — Raport</h1>

  <!-- Single marked text -->
  <div class="print-text">
    {#each documentStore.words as word}
      <span class="print-word">
        {#each word.segments as segment}
          <span style={segment style if marked}>
            {segment.text}
          </span>
        {/each}
      </span>
    {/each}
  </div>

  <!-- Summary Section -->
  {#if markedWords.length > 0}
    <div class="summary-section">
      <h2>Podsumowanie</h2>
      <ul>
        {#each markedWords as entry}
          <li>{entry.text} → {entry.typeLabel}{#if entry.note} + {entry.note}{/if}</li>
        {/each}
      </ul>
    </div>
  {/if}
</div>
```

**Data derivation for summary:**

```typescript
let markedWords = $derived(
  documentStore.words
    .filter(w => w.segments.some(s => s.isMarked))
    .map(w => ({
      text: w.text,
      typeLabel: DISFLUENCY_TYPES[w.segments.find(s => s.isMarked)!.type!].label,
      note: w.segments.find(s => s.isMarked)?.note
    }))
);
```

---

## 4. Interaction Flow Changes

### 4.1 Single Click (Toggle Mark)

```
User clicks word
  → WordDisplay.onclick fires
  → Check if word has any marked segment
    → YES: unmark all segments (isMarked=false, type=undefined)
    → NO: mark all segments as type "block"
  → Call onToggleMark(wordId) 
  → InteractiveView.handleToggleMark updates documentStore
  → Context menu is NOT shown
```

### 4.2 Text Selection (Context Menu)

```
User drags to select text within a word
  → mouseup event fires on InteractiveView container
  → window.getSelection() returns non-collapsed selection
  → Validate selection is within a single word
  → Split the target segment at selection boundaries
  → Show ContextMenu at selection position
  → User picks type → markSegment called → store updated
  → Context menu closes
```

### 4.3 Key Difference from Current Behavior

| Action | Current | New |
|--------|---------|-----|
| Single click on word | Opens context menu | Toggles block mark |
| Text selection (drag) | Opens context menu | Opens context menu (unchanged) |
| Right-click | Browser default | Browser default (no custom menu) |

---

## 5. Print Layout Changes

### 5.1 Current Structure (to be removed)

- Marked text with footnote superscripts
- Color legend section
- Footnotes section

### 5.2 New Structure

1. **Title**: "FluencyMark — Raport"
2. **Marked text**: Single continuous text block with colored/bordered segments (same visual as interactive view)
3. **Summary section** ("Podsumowanie"): A list of all marked words formatted as:
   - `word → type` (no comment)
   - `word → type + comment` (with comment)

### 5.3 Print CSS

```css
.print-text {
  text-align: justify;
  max-width: 72ch;
  margin: 0 auto;
  line-height: 1.8;
}

.summary-section {
  margin-top: var(--space-8);
  padding-top: var(--space-6);
  border-top: 1px solid var(--color-gray-300);
}

.summary-section ul {
  list-style: none;
  padding: 0;
}

.summary-section li {
  padding: var(--space-1) 0;
}
```

---

## 6. Build Configuration Changes

### 6.1 `vite.config.ts`

Remove `@tailwindcss/vite` import and plugin:

```typescript
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({ plugins: [sveltekit()] });
```

### 6.2 `package.json`

Remove from `devDependencies`:
- `tailwindcss`
- `@tailwindcss/vite`
- `prettier-plugin-tailwindcss`

---

## 7. Error Handling

- If `DisfluencyConfig` lookup fails for an unknown type, the segment renders without styling (graceful degradation)
- If text selection spans multiple words, the selection is discarded and no context menu appears (existing behavior preserved)
- If `documentStore.words` is empty, PrintView summary section is hidden

---

## 8. File Change Summary

| File | Change Type |
|------|-------------|
| `vite.config.ts` | Remove Tailwind plugin |
| `package.json` | Remove Tailwind packages |
| `src/routes/layout.css` | Delete (replaced by global.css) |
| `src/routes/global.css` | New — design tokens + base styles |
| `src/routes/+layout.svelte` | Import global.css |
| `src/lib/types.ts` | Update DisfluencyConfig (hex colors, bgColor field) |
| `src/lib/components/EditorView.svelte` | Replace Tailwind with scoped CSS |
| `src/lib/components/InteractiveView.svelte` | Replace Tailwind, change click handling |
| `src/lib/components/WordDisplay.svelte` | Replace Tailwind, implement toggle logic |
| `src/lib/components/SegmentSpan.svelte` | Replace Tailwind, use inline styles |
| `src/lib/components/ContextMenu.svelte` | Replace Tailwind with scoped CSS |
| `src/lib/components/PrintView.svelte` | Restructure to single text + summary |
| `src/lib/utils/footnotes.ts` | Can be removed (no longer used) |

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing the prework, the following redundancies were identified:
- 4.3 (no context menu on click) and 5.4 (context menu only on selection) are logically equivalent — consolidated into Property 1
- 4.1 (click unmarked → mark block) and 4.2 (click marked → unmark) are two sides of the same toggle — consolidated into Property 2
- 7.2 (summary lists marked words) and 7.3 (summary format) can be combined into a single summary correctness property — consolidated into Property 5
- 8.4 (light tinted background) and 9.3 (apply color from config) overlap on styling correctness — consolidated into Property 4

### Property 1: Single click never triggers context menu

*For any* word in the Interactive View, regardless of its marked/unmarked state, a single click event on that word SHALL NOT cause the context menu to become visible.

**Validates: Requirements 4.3, 5.4**

### Property 2: Single click toggles block marking

*For any* word in the Interactive View, if the word is unmarked then a single click marks all its segments as type "block", and if the word is already marked then a single click unmarks all its segments. After two consecutive single clicks on the same word, the word returns to its original state.

**Validates: Requirements 4.1, 4.2**

### Property 3: Text selection triggers context menu

*For any* valid non-collapsed text selection within a single word in the Interactive View, releasing the mouse (mouseup) SHALL cause the context menu to appear with options for all three disfluency types and a comment field.

**Validates: Requirements 5.1, 5.2**

### Property 4: Marked segments display correct colors from DisfluencyConfig

*For any* marked segment with a disfluency type, the rendered element SHALL have a background color equal to `DisfluencyConfig[type].bgColor` and a border color equal to `DisfluencyConfig[type].color`, applied via inline styles or CSS custom properties (not Tailwind classes).

**Validates: Requirements 8.1, 8.2, 8.3, 8.4, 9.3**

### Property 5: Print summary lists all marked words with correct format

*For any* document with marked words, the Print View summary section SHALL contain exactly one entry per marked word, formatted as "word → typeLabel" when no comment exists, or "word → typeLabel + comment" when a comment exists, with no duplicate entries and no omissions.

**Validates: Requirements 7.2, 7.3**

### Property 6: Context menu marking applies chosen type to selected segment

*For any* segment and any disfluency type selected from the context menu, after confirmation the segment SHALL have `isMarked: true` and `type` equal to the chosen disfluency type, with the optional comment preserved if provided.

**Validates: Requirements 5.3**
