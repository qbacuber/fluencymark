# Requirements Document

## Introduction

The Compare Attempts feature adds a dedicated route (`/compare`) to FluencyMark that allows a speech therapist to import two separately-marked JSON sessions of the same text and view them side-by-side. The view displays both attempts with full disfluency highlighting (read-only), shows a word count summary for each attempt, and supports PDF printing. The existing main page remains untouched.

## Glossary

- **Compare_View**: The new SvelteKit page rendered at the `/compare` route that provides the two-attempt comparison interface.
- **Attempt**: A single exported FluencyMark session represented as an `ExportData` JSON object containing `version`, `rawText`, and `marks`.
- **Import_Button**: A UI button that triggers a file picker allowing the user to select a JSON file for import.
- **Raw_Text**: The `rawText` field of an `ExportData` object — the original unprocessed text that was marked.
- **Marked_Word**: A word that has at least one segment with `isMarked` set to `true`.
- **Word_Count_Summary**: A numeric count of Marked_Words displayed for a given Attempt.
- **Column**: One half of the side-by-side layout that displays a single Attempt's full text with disfluency highlights.
- **Disfluency_Highlight**: The badge-style visual indicator (colored background) applied to marked segments, using the same styling as SegmentSpan in the interactive view.

## Requirements

### Requirement 1: Route Availability

**User Story:** As a speech therapist, I want to access the comparison view at a dedicated URL, so that the existing marking workflow is not affected.

#### Acceptance Criteria

1. THE Compare_View SHALL be accessible at the `/compare` route.
2. WHEN a user navigates to `/compare`, THE Compare_View SHALL render independently of the main page state.
3. THE Compare_View SHALL not modify or depend on the documentStore used by the main page.

### Requirement 2: Attempt Import

**User Story:** As a speech therapist, I want to import two JSON session files, so that I can compare the disfluency markings between two attempts.

#### Acceptance Criteria

1. THE Compare_View SHALL display two Import_Buttons labeled for the first and second Attempt respectively.
2. WHEN the user clicks an Import_Button, THE Compare_View SHALL open a file picker restricted to `.json` files.
3. WHEN a valid `ExportData` JSON file is selected, THE Compare_View SHALL parse the file and store the Attempt data in local component state.
4. IF the selected file does not conform to the `ExportData` schema (version, rawText, marks), THEN THE Compare_View SHALL display an error message in Polish and reject the file.

### Requirement 3: Text Validation

**User Story:** As a speech therapist, I want the system to verify both files contain the same text, so that I only compare attempts of the same passage.

#### Acceptance Criteria

1. WHEN the second Attempt is imported, THE Compare_View SHALL compare the Raw_Text of the second Attempt to the Raw_Text of the first Attempt using exact character-for-character equality.
2. IF the Raw_Text values do not match, THEN THE Compare_View SHALL display an error message in Polish indicating the texts are different and reject the second Attempt.
3. IF the Raw_Text values do not match, THEN THE Compare_View SHALL retain the first Attempt data unchanged.

### Requirement 4: Side-by-Side Display

**User Story:** As a speech therapist, I want to see both attempts displayed next to each other, so that I can visually compare disfluency patterns.

#### Acceptance Criteria

1. WHEN both Attempts are successfully imported, THE Compare_View SHALL display the full text of each Attempt in a two-Column layout (left column for Attempt 1, right column for Attempt 2).
2. THE Compare_View SHALL render each word's segments using Disfluency_Highlight styling identical to the SegmentSpan component (colored background badges for block, repetition, and prolongation types).
3. THE Compare_View SHALL be read-only with no click or selection interactions on words.
4. THE Compare_View SHALL apply the same text styling as the interactive view text-content area (font size, line height, letter spacing, text justification, max-width per column).

### Requirement 5: Word Count Summary

**User Story:** As a speech therapist, I want to see how many words were marked in each attempt, so that I can quickly assess progress.

#### Acceptance Criteria

1. WHEN both Attempts are displayed, THE Compare_View SHALL show a Word_Count_Summary below each Column.
2. THE Word_Count_Summary SHALL display the total number of Marked_Words for the corresponding Attempt.
3. THE Word_Count_Summary SHALL update if an Attempt is re-imported with a different file.

### Requirement 6: PDF Print

**User Story:** As a speech therapist, I want to print the comparison view to PDF, so that I can archive or share the comparison.

#### Acceptance Criteria

1. THE Compare_View SHALL display a print button labeled in Polish.
2. WHEN the user clicks the print button, THE Compare_View SHALL invoke the browser print dialog via `window.print()`.
3. WHILE the browser is in print mode, THE Compare_View SHALL hide all buttons and non-content UI elements using `@media print` CSS rules.
4. WHILE the browser is in print mode, THE Compare_View SHALL preserve the two-Column layout and Disfluency_Highlight colors using `print-color-adjust: exact`.
5. WHILE the browser is in print mode, THE Compare_View SHALL display the Word_Count_Summary for each Column.

### Requirement 7: Polish UI Language

**User Story:** As a Polish-speaking user, I want all labels and messages in Polish, so that the interface is consistent with the rest of the application.

#### Acceptance Criteria

1. THE Compare_View SHALL display all button labels, headings, error messages, and summary text in Polish.
2. THE Compare_View SHALL use terminology consistent with the existing FluencyMark interface (e.g., "Importuj", "Drukuj do PDF").
