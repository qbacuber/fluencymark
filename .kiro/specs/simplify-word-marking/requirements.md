# Requirements Document

## Introduction

Simplification of the word marking system in FluencyMark. The current system supports partial word selection (fragment highlighting), disfluency type categorization (block, repetition, prolongation), color-coded marking, context menus, and notes. This feature removes all that complexity, leaving only a simple whole-word toggle (marked/unmarked) via click. Additionally, a migration tool is provided to import old JSON exports and convert them to the new simplified structure.

## Glossary

- **App**: The FluencyMark SvelteKit application
- **Interactive_View**: The main view where users mark words in the text
- **Word**: A whitespace-delimited token in the source text, displayed as a clickable unit
- **Marked_Word**: A Word that has been toggled to the marked state (highlighted)
- **Export_Data**: The JSON structure used to persist and share marking sessions
- **Legacy_Export_Data**: An Export_Data file produced by the old system (version 1), which may contain segments, disfluency types, colors, and notes
- **Migration_Tool**: A UI button that imports a Legacy_Export_Data file and converts it to the new simplified format

## Requirements

### Requirement 1: Remove Fragment Selection

**User Story:** As a speech therapist, I want only whole words to be selectable, so that the marking process is faster and simpler.

#### Acceptance Criteria

1. WHEN a user single-clicks (left mouse button) on a Word, THE App SHALL toggle the entire Word between marked and unmarked state
2. WHEN a user presses Enter or Space while a Word has keyboard focus, THE App SHALL toggle the entire Word between marked and unmarked state
3. THE App SHALL treat each Word as an atomic unit that cannot be partially selected
4. WHEN a user drag-selects text within the Interactive_View, THE App SHALL clear the browser selection and not create sub-word segments or trigger any marking action

### Requirement 2: Remove Disfluency Types

**User Story:** As a speech therapist, I want marking without categories, so that I can quickly identify problematic words without classifying them.

#### Acceptance Criteria

1. THE App SHALL store each Word with a single boolean marked state (true or false) and no additional classification properties
2. THE App SHALL not display any disfluency type selection controls (buttons, menus, dropdowns, or labels for block, repetition, or prolongation) in any view
3. THE App SHALL not store a type property or a note property on marked words
4. IF a Word is toggled to the marked state, THEN THE App SHALL record only the boolean marked state without prompting the user to select a disfluency category

### Requirement 3: Remove Context Menu

**User Story:** As a speech therapist, I want a simpler interaction model, so that marking requires only a single click without additional dialogs.

#### Acceptance Criteria

1. THE App SHALL NOT display a context menu, popup, or overlay when a Word is clicked, right-clicked, or text-selected
2. WHEN a Word is clicked, THE App SHALL toggle its marked state within the same user interaction frame without displaying intermediate UI or requiring further user input
3. WHEN a user selects text within a Word (mouse drag), THE App SHALL NOT open a context menu or marking dialog in response to the selection

### Requirement 4: Remove Color Coding

**User Story:** As a speech therapist, I want a uniform visual style for marked words, so that the display is clean and uncluttered.

#### Acceptance Criteria

1. THE App SHALL display all Marked_Words with the same background color and the same border style, regardless of how the word was marked or any legacy disfluency type
2. THE App SHALL not use different colors, border colors, or background colors to visually distinguish one Marked_Word from another
3. THE App SHALL not store or reference per-word color, bgColor, or disfluency type properties in the data model
4. THE App SHALL not define or use the DisfluencyType enumeration or the DISFLUENCY_TYPES color mapping in any rendering logic

### Requirement 5: Simplified Data Model

**User Story:** As a developer, I want a minimal data structure, so that the codebase is easier to maintain.

#### Acceptance Criteria

1. THE App SHALL represent each Word as an object containing a string id, the original text, and a boolean isMarked property with no additional properties
2. THE App SHALL not use a segments array, a type property, a note property, or a color property within a Word
3. THE Export_Data SHALL be a JSON object containing exactly three top-level keys: "version" with the integer value 2, "rawText" with the full source text as a string, and "markedIndices" with an array of 0-based integer indices identifying marked words by their position in the word list
4. WHEN exporting, THE App SHALL produce a JSON file containing only the Export_Data structure with no additional properties beyond version, rawText, and markedIndices

### Requirement 6: Simplified Print and Summary View

**User Story:** As a speech therapist, I want the print summary to list marked words without categories or colors, so that printed reports are clean.

#### Acceptance Criteria

1. THE Print_View SHALL display a list of all Marked_Words sorted alphabetically using Polish locale collation, with each occurrence listed individually (duplicate words appear once per marked instance in the text)
2. THE Print_View SHALL not display disfluency type labels, color indicators, or notes
3. THE Print_View SHALL display the total count of Marked_Words
4. THE Print_View SHALL display each Marked_Word in lowercase with leading and trailing punctuation removed
5. IF no words are marked, THEN THE Print_View SHALL not display the word list or the count

### Requirement 7: Legacy JSON Migration Tool

**User Story:** As a speech therapist, I want to import my old JSON files and convert them to the new format, so that I do not lose previous work.

#### Acceptance Criteria

1. THE Interactive_View SHALL provide a button labeled "Importuj stary JSON" (Import old JSON)
2. WHEN the user clicks the "Importuj stary JSON" button, THE Migration_Tool SHALL open a file picker dialog allowing the user to select a single JSON file
3. WHEN a user selects a Legacy_Export_Data file (version 1), THE Migration_Tool SHALL read the file and identify all words that had any marked segment
4. WHEN converting, THE Migration_Tool SHALL mark the entire word as marked if any segment within that word was marked in the legacy data, and mark the word as unmarked if none of its segments were marked
5. WHEN conversion is complete, THE Migration_Tool SHALL replace the current Interactive_View content with the converted data displayed in the new simplified format
6. IF the imported file is not valid JSON or does not conform to the Legacy_Export_Data structure (version field absent or not equal to 1, missing rawText, or missing marks array), THEN THE Migration_Tool SHALL display an error message indicating that the file is not a recognized legacy format
7. IF the imported file is valid JSON but contains zero marks entries, THEN THE Migration_Tool SHALL load the text with all words in the unmarked state

### Requirement 8: Compare Page Compatibility

**User Story:** As a speech therapist, I want the compare page to work with both old and new JSON formats, so that I can compare sessions across format versions.

#### Acceptance Criteria

1. WHEN a version 1 file is imported on the compare page, THE App SHALL convert it to the simplified display by marking the entire word as marked if any segment within that word was marked, discarding type and color information
2. WHEN a version 2 file is imported on the compare page, THE App SHALL display it directly in the simplified format using the marked word indices
3. THE Compare_Page SHALL display marked words with the same uniform highlight style used in the Interactive_View
4. THE Compare_Page SHALL determine the file format by reading the version field (1 or 2) from the imported JSON
5. IF the imported file does not contain a valid version field or does not conform to either the version 1 or version 2 schema, THEN THE Compare_Page SHALL display an error message indicating the file format is not recognized
6. IF the second imported file contains a different rawText than the first imported file, THEN THE Compare_Page SHALL display an error message indicating that both files must share the same source text
