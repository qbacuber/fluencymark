# Requirements Document

## Introduction

FluencyMark is a client-side web application for speech therapy (stuttering) that enables interactive text analysis. Users paste or upload text, confirm it to enter an interactive marking mode, then mark disfluency moments on specific words or word fragments. The application supports categorizing disfluencies by type (block, repetition, prolongation) with color coding and notes, and produces a printable PDF report with a legend.

The application is built with SvelteKit (Svelte 5), Tailwind CSS v4, TypeScript, and uses browser localStorage for persistence. The UI is in Polish.

## Glossary

- **Editor**: The textarea component where users input or paste raw text before confirmation
- **Word_Object**: A data structure representing a single word, containing an ID, original text, and an array of Segments
- **Segment**: A sub-part of a Word_Object that can be independently marked with a disfluency type, color, and note
- **Disfluency_Type**: A classification of stuttering moment — one of: block (red), repetition (yellow), prolongation (blue)
- **Interactive_View**: The read-only display of processed text where users can click words or select fragments to mark disfluencies
- **Context_Menu**: A floating panel that appears after a word or fragment selection, allowing the user to choose a disfluency type and add a note
- **Document_State**: The complete application state including all Word_Objects and their Segments, persisted to localStorage
- **Text_Processor**: The module responsible for transforming raw text into a list of Word_Objects
- **Print_View**: The CSS-optimized layout for generating a PDF report with marked text, legend, and footnotes

## Requirements

### Requirement 1: Text Input and Editing

**User Story:** As a speech therapist, I want to paste or upload text into the application, so that I can prepare material for a stuttering analysis session.

#### Acceptance Criteria

1. WHEN the application loads in edit mode, THE Editor SHALL display a textarea for entering or pasting text
2. WHEN a user selects a .txt file via the file upload control, THE Editor SHALL read the file contents and populate the textarea with the file text
3. WHEN a user uploads a file that is not a .txt file, THE Editor SHALL reject the file and display an error message in Polish
4. THE Editor SHALL preserve all whitespace and line breaks from the original input text

### Requirement 2: Text Persistence

**User Story:** As a user, I want my text to be automatically saved, so that I do not lose my work if I accidentally close or refresh the browser.

#### Acceptance Criteria

1. WHEN the textarea content changes, THE Document_State SHALL persist the current text to localStorage within 1 second
2. WHEN the application loads and localStorage contains previously saved text, THE Editor SHALL restore the saved text into the textarea
3. WHEN the application loads and localStorage is empty, THE Editor SHALL display an empty textarea

### Requirement 3: Text Processing and Confirmation

**User Story:** As a user, I want to confirm my text to enter the interactive marking mode, so that I can begin analyzing disfluencies.

#### Acceptance Criteria

1. WHEN the user clicks the "Zatwierdź" button, THE Text_Processor SHALL split the raw text into a list of Word_Objects separated by whitespace boundaries
2. WHEN the text is processed, THE Text_Processor SHALL assign a unique identifier to each Word_Object
3. WHEN the text is processed, THE Text_Processor SHALL initialize each Word_Object with a single unmarked Segment containing the full word text
4. WHEN the text is confirmed, THE Interactive_View SHALL replace the Editor and display the processed words as clickable elements
5. WHEN the text is confirmed, THE Editor SHALL become read-only and the user SHALL NOT be able to modify the source text
6. WHEN the user clicks a "Wróć do edycji" (Return to editing) button in the Interactive_View, THE Editor SHALL restore the edit mode with the original text

### Requirement 4: Whole-Word Disfluency Marking

**User Story:** As a speech therapist, I want to click on a word to mark it as a disfluency, so that I can quickly annotate obvious stuttering moments.

#### Acceptance Criteria

1. WHEN a user clicks on an unmarked word in the Interactive_View, THE Context_Menu SHALL appear near the clicked word
2. WHEN the user selects a Disfluency_Type from the Context_Menu, THE Word_Object SHALL mark its entire text as a single marked Segment with the chosen type and corresponding color
3. WHEN a word is marked, THE Interactive_View SHALL display the word with a colored background corresponding to the Disfluency_Type
4. WHEN a user clicks on an already-marked word, THE Context_Menu SHALL appear allowing the user to change the type or remove the marking

### Requirement 5: Fragment Selection and Marking

**User Story:** As a speech therapist, I want to select a specific fragment of a word (e.g., the first syllable) and mark only that fragment, so that I can precisely indicate where the disfluency occurred within a word.

#### Acceptance Criteria

1. WHEN a user selects a text fragment within a single word using mouse selection, THE Interactive_View SHALL detect the selection boundaries within that Word_Object
2. WHEN a fragment is selected, THE Word_Object SHALL split into multiple Segments: the selected portion and the remaining portions
3. WHEN the word is split into Segments, THE Context_Menu SHALL appear allowing the user to assign a Disfluency_Type to the selected Segment only
4. WHEN a Segment is marked, THE Interactive_View SHALL display only that Segment with the colored background while adjacent unmarked Segments remain unstyled
5. IF the user selection spans across multiple Word_Objects, THEN THE Interactive_View SHALL ignore the selection and take no action

### Requirement 6: Context Menu Interaction

**User Story:** As a user, I want a context menu to appear after selecting text, so that I can choose the disfluency type and optionally add a note.

#### Acceptance Criteria

1. WHEN the Context_Menu is displayed, THE Context_Menu SHALL show buttons for each Disfluency_Type: "Blokada" (block/red), "Powtórzenie" (repetition/yellow), "Przedłużenie" (prolongation/blue)
2. WHEN the user selects a Disfluency_Type, THE Context_Menu SHALL apply the type to the target Segment and close
3. WHEN the Context_Menu is displayed, THE Context_Menu SHALL include a text input field for adding an optional note to the Segment
4. WHEN the user clicks outside the Context_Menu without selecting a type, THE Context_Menu SHALL close without making changes
5. WHEN the Context_Menu is displayed for an already-marked Segment, THE Context_Menu SHALL show a "Usuń oznaczenie" (Remove marking) button
6. WHEN the user clicks "Usuń oznaczenie", THE Context_Menu SHALL remove the disfluency marking from the target Segment and merge adjacent unmarked Segments back together

### Requirement 7: State Persistence in Interactive Mode

**User Story:** As a user, I want my markings to be saved automatically, so that I do not lose my analysis progress.

#### Acceptance Criteria

1. WHEN a marking is added or modified in the Interactive_View, THE Document_State SHALL persist the complete Word_Object list to localStorage within 1 second
2. WHEN the application loads and localStorage contains a saved Interactive_View state, THE Interactive_View SHALL restore all Word_Objects with their Segments and markings
3. WHEN the application loads with saved Interactive_View state, THE application SHALL display the Interactive_View directly without requiring re-confirmation

### Requirement 8: Print and PDF Export

**User Story:** As a speech therapist, I want to print or export the marked text as a PDF, so that I can use it during therapy sessions or share it with colleagues.

#### Acceptance Criteria

1. WHEN the user clicks the "Drukuj do PDF" button, THE Print_View SHALL trigger the browser print dialog with print-optimized CSS
2. WHEN the Print_View is rendered, THE Print_View SHALL display all marked Segments with their corresponding background colors
3. WHEN the Print_View is rendered, THE Print_View SHALL generate a color legend at the end of the document listing each Disfluency_Type with its color and Polish label
4. WHEN any Segments have notes attached, THE Print_View SHALL display the notes as numbered footnotes at the end of the document
5. WHEN the Print_View is rendered, THE Print_View SHALL use footnote reference numbers inline next to the marked Segments that have notes

### Requirement 9: Data Model Serialization

**User Story:** As a developer, I want the application state to be reliably serialized and deserialized, so that localStorage persistence works correctly across sessions.

#### Acceptance Criteria

1. THE Document_State SHALL serialize the complete list of Word_Objects to JSON format for localStorage storage
2. WHEN deserializing from localStorage, THE Document_State SHALL reconstruct all Word_Objects with their Segments, types, colors, and notes intact
3. IF localStorage contains corrupted or invalid JSON data, THEN THE Document_State SHALL discard the corrupted data and start with an empty state
4. FOR ALL valid Document_State objects, serializing then deserializing SHALL produce an equivalent Document_State (round-trip property)
