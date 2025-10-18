# Task List: Text Formatting Feature

## Relevant Files

- `src/features/objects/types/index.ts` - Update TextObject interface with format, fontWeight, rotation properties
- `src/features/objects/components/Text.tsx` - Update to apply format styles and rotation
- `src/features/canvas/components/CanvasToolbar.tsx` - Add text format selector UI
- `src/features/canvas/lib/canvasStore.ts` - Add selectedTextFormat state
- `src/features/objects/lib/textFormatting.ts` - New utility for format style mappings
- `src/features/canvas/components/TextFormatSelector.tsx` - New component for format dropdown/radio buttons
- `src/shared/components/PropertyEditor.tsx` - Add format dropdown and rotation input (if property editor exists from Phase 1)
- `src/features/ai-agent/services/simpleAgentService.ts` - Update canvasAction tool to support text format parameter
- `app/layout.tsx` - Add font import (e.g., Inter from Google Fonts)

### Notes

- Text formatting uses Konva.js canvas objects (not HTML layer)
- Format presets: Header (48px bold), Subheading (32px semibold), Paragraph (16px normal)
- Rotation uses Konva's built-in rotation property (0-360 degrees)
- Text format and rotation sync in real-time via existing objects service

## Tasks

- [ ] 1.0 Update Text Object Type Definitions
  - [ ] 1.1 Update `src/features/objects/types/index.ts`
  - [ ] 1.2 Add `format: 'header' | 'subheading' | 'paragraph'` property to TextObject interface
  - [ ] 1.3 Add `fontWeight?: 'bold' | 'semibold' | 'normal'` property to TextObject interface
  - [ ] 1.4 Add `rotation?: number` property to TextObject interface (0-360 degrees)
  - [ ] 1.5 Update TextObject interface to ensure fontSize is derived from format
  - [ ] 1.6 Export TextFormat type for use in components

- [ ] 2.0 Create Text Formatting Utility
  - [ ] 2.1 Create `src/features/objects/lib/textFormatting.ts`
  - [ ] 2.2 Define `FORMAT_STYLES` constant mapping format to fontSize and fontWeight
  - [ ] 2.3 Header: { fontSize: 48, fontWeight: 'bold' }
  - [ ] 2.4 Subheading: { fontSize: 32, fontWeight: '600' } // semibold
  - [ ] 2.5 Paragraph: { fontSize: 16, fontWeight: 'normal' }
  - [ ] 2.6 Create `getFormatStyles(format)` helper function that returns fontSize and fontWeight
  - [ ] 2.7 Create `DEFAULT_TEXT_FORMAT` constant set to 'paragraph'
  - [ ] 2.8 Export all constants and functions

- [ ] 3.0 Update Text Component for Format and Rotation
  - [ ] 3.1 Update `src/features/objects/components/Text.tsx`
  - [ ] 3.2 Import FORMAT_STYLES from textFormatting utility
  - [ ] 3.3 Get format styles using `getFormatStyles(object.format || 'paragraph')`
  - [ ] 3.4 Apply fontSize from format styles to Konva Text component
  - [ ] 3.5 Apply fontWeight to Konva Text using `fontStyle` property (Konva uses fontStyle for weight)
  - [ ] 3.6 Apply rotation from object.rotation (default to 0 if undefined)
  - [ ] 3.7 Ensure fontFamily is set (use default font like 'Inter, sans-serif')
  - [ ] 3.8 Test text renders with correct size, weight, and rotation

- [ ] 4.0 Add Text Format Selector to Canvas Toolbar
  - [ ] 4.1 Update `src/features/canvas/lib/canvasStore.ts` to add selectedTextFormat state
  - [ ] 4.2 Default selectedTextFormat to 'paragraph'
  - [ ] 4.3 Add setSelectedTextFormat action
  - [ ] 4.4 Create `src/features/canvas/components/TextFormatSelector.tsx`
  - [ ] 4.5 Build UI with three options: Header, Subheading, Paragraph (radio buttons or dropdown)
  - [ ] 4.6 Update canvasStore selectedTextFormat when user selects different format
  - [ ] 4.7 Update `src/features/canvas/components/CanvasToolbar.tsx`
  - [ ] 4.8 Add TextFormatSelector component visible when text tool is active
  - [ ] 4.9 Show currently selected format with visual feedback (e.g., highlighted button)
  - [ ] 4.10 Style with Tailwind CSS for clean, professional appearance

- [ ] 5.0 Apply Format When Creating Text Objects
  - [ ] 5.1 Update text creation logic in canvas page or objects service
  - [ ] 5.2 Read selectedTextFormat from canvasStore when creating new text object
  - [ ] 5.3 Get fontSize and fontWeight from FORMAT_STYLES[selectedTextFormat]
  - [ ] 5.4 Set format, fontSize, fontWeight properties on new TextObject
  - [ ] 5.5 Default rotation to 0 for new text objects
  - [ ] 5.6 Test creating text with each format (Header, Subheading, Paragraph)
  - [ ] 5.7 Verify text appears with correct size and weight on canvas

- [ ] 6.0 Add Format and Rotation to Property Editor
  - [ ] 6.1 Check if property editor exists from Phase 1 (Right-Click Context Menu feature)
  - [ ] 6.2 If property editor exists, update `src/shared/components/PropertyEditor.tsx` (or similar)
  - [ ] 6.3 Add format dropdown with options: Header, Subheading, Paragraph
  - [ ] 6.4 Show current format pre-selected when text object is selected
  - [ ] 6.5 Add rotation input field (number input, 0-360 range)
  - [ ] 6.6 Show current rotation value when text object is selected
  - [ ] 6.7 On format change, call updateObject with new format, fontSize, fontWeight
  - [ ] 6.8 On rotation change, call updateObject with new rotation value
  - [ ] 6.9 If property editor doesn't exist yet, note as future enhancement (edit format via toolbar only for now)

- [ ] 7.0 Enable Text Rotation via Konva Transformer
  - [ ] 7.1 Verify Konva Transformer is enabled for text objects (should already work from existing transform functionality)
  - [ ] 7.2 Ensure rotation handle is visible when text object is selected
  - [ ] 7.3 Test rotating text using transformer handle
  - [ ] 7.4 Verify rotation value syncs to Firestore and broadcasts to other users
  - [ ] 7.5 Verify rotated text renders correctly at all angles

- [ ] 8.0 Update Objects Service for Format Persistence
  - [ ] 8.1 Verify `src/features/objects/services/objectsService.ts` handles all TextObject properties
  - [ ] 8.2 Ensure format, fontWeight, and rotation properties are saved to Firestore
  - [ ] 8.3 Ensure format, fontWeight, and rotation properties are broadcast via RTDB deltas
  - [ ] 8.4 Test updating text format (change from Paragraph to Header)
  - [ ] 8.5 Test updating text rotation (change from 0 to 45 degrees)
  - [ ] 8.6 Verify changes sync to all users in real-time

- [ ] 9.0 Add Font to Application
  - [ ] 9.1 Update `app/layout.tsx` to import font (e.g., Inter from next/font/google)
  - [ ] 9.2 Apply font to body or canvas container
  - [ ] 9.3 Ensure Konva Text components use the same font family
  - [ ] 9.4 Test that text renders consistently across all formats with chosen font
  - [ ] 9.5 Alternative: Use system font stack if web font not needed

- [ ] 10.0 Integrate AI Agent Support for Text Format
  - [ ] 10.1 Update `src/features/ai-agent/services/simpleAgentService.ts`
  - [ ] 10.2 Add `format` parameter to canvasAction create operation for text objects
  - [ ] 10.3 Update tool description to mention format options (header, subheading, paragraph)
  - [ ] 10.4 Default to 'paragraph' if format not specified
  - [ ] 10.5 Test AI command: "Create header text that says 'Look 1'"
  - [ ] 10.6 Verify AI creates text with header format (48px bold)
  - [ ] 10.7 Test AI command: "Create subheading text that says 'Concept A'"
  - [ ] 10.8 Verify AI creates text with subheading format (32px semibold)

- [ ] 11.0 Add Visual Feedback for Selected Format
  - [ ] 11.1 Update canvas UI to show format of selected text object
  - [ ] 11.2 Display format in status bar or info panel (e.g., "Header (48px)")
  - [ ] 11.3 If layer panel exists (Phase 1), show format badge next to text layer name
  - [ ] 11.4 Update TextFormatSelector to highlight currently selected format when text tool is active

- [ ] 12.0 Testing and Validation
  - [ ] 12.1 Test creating Header text (48px bold)
  - [ ] 12.2 Test creating Subheading text (32px semibold)
  - [ ] 12.3 Test creating Paragraph text (16px normal)
  - [ ] 12.4 Test changing format of existing text via property editor or toolbar
  - [ ] 12.5 Test rotating text using Konva transformer handle
  - [ ] 12.6 Test rotating text via property editor rotation input (if implemented)
  - [ ] 12.7 Test text format displays correctly in layer panel or status bar
  - [ ] 12.8 Test format changes sync to all users in real-time (<100ms)
  - [ ] 12.9 Test rotation changes sync to all users in real-time (<100ms)
  - [ ] 12.10 Test text renders clearly at all sizes (48px, 32px, 16px)
  - [ ] 12.11 Test text renders correctly at various rotations (0°, 45°, 90°, 180°, etc.)
  - [ ] 12.12 Test multi-user collaboration: User A changes format, User B sees update instantly
  - [ ] 12.13 Test AI agent creates text with specified format
  - [ ] 12.14 Test default format (paragraph) is applied when format not specified
  - [ ] 12.15 Test text loads correctly from Firestore with format, fontWeight, rotation properties

