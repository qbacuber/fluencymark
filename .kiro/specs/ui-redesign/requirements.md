# Requirements Document

## Introduction

FluencyMark is a SvelteKit-based tool for speech-language pathologists to mark disfluencies in transcribed text. This redesign replaces Tailwind CSS with the Birchline design system (pure CSS with design tokens), changes click interaction behavior for faster marking, improves text layout readability, streamlines print/PDF output, and adds bordered badges for disfluency type indicators.

## Glossary

- **Application**: The FluencyMark SvelteKit web application
- **Birchline_Design_System**: A pure CSS design system using CSS custom properties for colors, typography, spacing, radius, and shadows
- **Interactive_View**: The main view where users mark disfluencies in confirmed text
- **Editor_View**: The initial view where users input or upload text
- **Print_View**: The view rendered when the user prints or exports to PDF
- **Context_Menu**: A floating menu that appears on text selection, offering disfluency type choices and a comment field
- **Word_Display**: A component rendering a single word with its segments
- **Segment**: A portion of a word that can be independently marked with a disfluency type
- **Disfluency_Badge**: A visual indicator showing the disfluency type of a marked segment, styled with a border and semantic color
- **Summary_Section**: A section at the end of the print output listing all marked words with their types and comments
- **Design_Token**: A CSS custom property defining a reusable value (color, spacing, radius, shadow) from the Birchline design system

## Requirements

### Requirement 1: Remove Tailwind CSS Dependencies

**User Story:** As a developer, I want to remove all Tailwind CSS dependencies from the project, so that the application uses only pure CSS with Birchline design tokens.

#### Acceptance Criteria

1. WHEN the Application is built, THE Application SHALL compile without the @tailwindcss/vite plugin in vite.config.ts
2. THE Application SHALL have no Tailwind CSS packages (tailwindcss, @tailwindcss/vite, prettier-plugin-tailwindcss) listed in package.json devDependencies
3. THE Application SHALL contain no Tailwind @import directives in any CSS file
4. THE Application SHALL contain no Tailwind utility classes in any Svelte component template

### Requirement 2: Birchline Design Token System

**User Story:** As a developer, I want a centralized set of CSS custom properties defining the Birchline design system, so that all components use consistent visual values.

#### Acceptance Criteria

1. THE Application SHALL define CSS custom properties for primary color (#D97757), slate (#141413), ivory (#FAF9F5), and oat (#E3DACC) on the :root element
2. THE Application SHALL define CSS custom properties for neutral colors: white (#FFFFFF), gray-100 (#F0EEE6), gray-300 (#D1CFC5), gray-500 (#87867F), gray-700 (#3D3D3A) on the :root element
3. THE Application SHALL define CSS custom properties for semantic colors: success (#788C5D), warning (#C78E3F), danger (#B04A4A), info (#5C7CA3) on the :root element
4. THE Application SHALL define CSS custom properties for spacing values: 4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px on the :root element
5. THE Application SHALL define CSS custom properties for border-radius values: xs (4px), sm (8px), md (12px), lg (20px) on the :root element
6. THE Application SHALL define CSS custom properties for box-shadow values: sm (0 1px 2px rgba(0,0,0,0.06)), md (0 4px 10px rgba(0,0,0,0.08)), lg (0 12px 28px rgba(0,0,0,0.12)) on the :root element
7. THE Application SHALL define CSS custom properties for typography: body (16px/1.55/weight 430), h1 (32px/1.2/weight 500), h2 (24px/1.3/weight 500) on the :root element

### Requirement 3: Global Visual Styling

**User Story:** As a user, I want the application to have a clean, minimal aesthetic matching the Birchline design system, so that the interface is visually pleasant and consistent.

#### Acceptance Criteria

1. THE Application SHALL render the page background using the ivory color (#FAF9F5)
2. THE Application SHALL render body text using the slate color (#141413) at 16px size with line-height 1.55 and font-weight 430
3. THE Application SHALL render h1 headings at 32px with line-height 1.2 and font-weight 500
4. THE Application SHALL render h2 headings at 24px with line-height 1.3 and font-weight 500
5. THE Application SHALL render primary action buttons using the primary color (#D97757) as background with white text and border-radius sm (8px)
6. THE Application SHALL render card and panel containers with the md box-shadow (0 4px 10px rgba(0,0,0,0.08)) and white background

### Requirement 4: Single-Click Word Marking

**User Story:** As a speech-language pathologist, I want to single-click a word to immediately mark it as a block disfluency, so that I can mark text faster without navigating a menu.

#### Acceptance Criteria

1. WHEN the user single-clicks an unmarked word in the Interactive_View, THE Word_Display SHALL mark the entire word with disfluency type "block" (Blokada)
2. WHEN the user single-clicks a word that is already marked, THE Word_Display SHALL remove the marking from the entire word (toggle off)
3. WHEN the user single-clicks a word, THE Application SHALL NOT display the Context_Menu

### Requirement 5: Text Selection Context Menu

**User Story:** As a speech-language pathologist, I want to select text within a word by dragging to choose a specific disfluency type and add a comment, so that I can precisely annotate partial-word disfluencies.

#### Acceptance Criteria

1. WHEN the user selects text by mouse drag within a word in the Interactive_View, THE Application SHALL display the Context_Menu at the selection position
2. THE Context_Menu SHALL present options to choose a disfluency type (block, repetition, prolongation) and enter a comment
3. WHEN the user selects a disfluency type from the Context_Menu, THE Application SHALL mark the selected text segment with the chosen type and optional comment
4. THE Context_Menu SHALL only appear as a result of text selection (mouse drag), not as a result of a single click

### Requirement 6: Justified Text Layout

**User Story:** As a user, I want the text in the interactive view to be justified with comfortable margins, so that the text is easy to read.

#### Acceptance Criteria

1. THE Interactive_View SHALL render the text content with text-align set to justify
2. THE Interactive_View SHALL constrain the text content within a max-width container with comfortable horizontal padding using Birchline spacing tokens

### Requirement 7: Streamlined Print Output

**User Story:** As a speech-language pathologist, I want the printed PDF to show a single marked text followed by a summary of marked words, so that the report is concise and not duplicated.

#### Acceptance Criteria

1. WHEN the user prints the document, THE Print_View SHALL render exactly one copy of the marked text (not separate "Interactive View" and "Report" sections)
2. THE Print_View SHALL render a Summary_Section after the marked text containing only the list of marked words with their disfluency types and comments
3. THE Summary_Section SHALL format each entry as: word → type + comment (if a comment exists)
4. THE Print_View SHALL NOT render any duplicate text views or redundant sections

### Requirement 8: Disfluency Badges with Borders

**User Story:** As a user, I want disfluency type indicators to have visible borders using semantic colors, so that marked segments are clearly distinguishable.

#### Acceptance Criteria

1. THE Disfluency_Badge for type "block" SHALL display with a visible border using the danger color (#B04A4A)
2. THE Disfluency_Badge for type "repetition" SHALL display with a visible border using the warning color (#C78E3F)
3. THE Disfluency_Badge for type "prolongation" SHALL display with a visible border using the info color (#5C7CA3)
4. THE Disfluency_Badge SHALL use a light tinted background derived from the respective semantic color for readability

### Requirement 9: DisfluencyConfig Migration to CSS Properties

**User Story:** As a developer, I want the DisfluencyConfig type to reference CSS custom property names or hex values instead of Tailwind utility classes, so that the type system aligns with the new styling approach.

#### Acceptance Criteria

1. THE Application SHALL define DisfluencyConfig.color as a CSS custom property reference or hex color value instead of a Tailwind utility class string
2. THE Application SHALL use the danger color (#B04A4A) for block type, warning color (#C78E3F) for repetition type, and info color (#5C7CA3) for prolongation type in the DisfluencyConfig
3. WHEN a Segment is marked, THE Word_Display SHALL apply the corresponding color from DisfluencyConfig using inline styles or CSS custom properties (not Tailwind classes)
