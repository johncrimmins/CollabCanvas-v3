# PRD: Text Formatting

## Introduction/Overview

Enhance the existing text object functionality with preset formatting options (Header, Subheading, Paragraph) and rotation capability. This feature enables designers to create structured, hierarchical text layouts on their LookBooks, making it easy to add titles, labels, and descriptions with consistent styling. Text objects remain fully compatible with the canvas-based approach using Konva.js.

## Goals

1. Add preset text formats: Header, Subheading, Paragraph
2. Define standard font sizes for each format
3. Enable text rotation (0-360 degrees)
4. Maintain text as canvas objects (Konva.js, not HTML layer)
5. Provide UI for selecting text format when creating text
6. Allow changing format of existing text objects
7. Sync text formatting across all users in real-time

## User Stories

1. **As a photographer**, I want to add large header text to label each Look so that my team can easily identify different concepts.

2. **As a stylist**, I want to use paragraph text for detailed descriptions so that I can document styling notes on the LookBook.

3. **As a creative director**, I want to rotate text labels so that I can create dynamic, angled compositions.

4. **As a model**, I want consistent text sizes for headers and subheadings so that my LookBook has a professional, structured appearance.

## Functional Requirements

### FR1: Text Format Presets
Define three text format types with standard sizes:
- **Header**: 48px font size, bold weight
- **Subheading**: 32px font size, semibold weight
- **Paragraph**: 16px font size, normal weight

### FR2: Text Format Property
Add `format` property to text objects:
```typescript
type TextFormat = 'header' | 'subheading' | 'paragraph';

interface TextObject extends CanvasObject {
  type: 'text';
  content: string;
  fontSize: number; // Derived from format
  format: TextFormat; // New property
  fontWeight?: string; // 'bold', 'semibold', 'normal'
  rotation?: number; // 0-360 degrees
  // ... existing properties (fill, position, etc.)
}
```

### FR3: Create Text with Format
When creating a new text object:
- Toolbar has "Text" tool with format selector dropdown
- User selects format (Header/Subheading/Paragraph) before placing text
- Default format: Paragraph
- User clicks canvas to place text, then types content
- Text appears with format's font size and weight

### FR4: Edit Text Format
Users can change the format of existing text:
- Select text object on canvas
- Right-click → "Edit Properties" → Format dropdown
- Or use dedicated text formatting toolbar when text is selected
- Change format updates fontSize and fontWeight automatically
- Changes sync to all users in real-time

### FR5: Text Rotation
Users can rotate text objects:
- Select text object, use Konva transformer rotation handle
- Or right-click → "Edit Properties" → Rotation input (0-360 degrees)
- Rotation syncs to all users in real-time
- Text remains readable (not mirrored or flipped)

### FR6: Text Editing
Text content editing works as before (existing functionality):
- Double-click text to edit content
- Type new content
- Click outside or press Enter to confirm
- Content changes sync to all users

### FR7: Toolbar UI
Update Canvas toolbar to include text options:
- "Text" button opens format selector
- Radio buttons or dropdown: Header / Subheading / Paragraph
- Selected format applies to next text object created
- Or show format selector in a floating panel when text tool is active

### FR8: Visual Feedback
Selected text shows its format:
- Status bar or property panel shows "Header (48px)" or "Paragraph (16px)"
- Format badge appears in layer panel next to text layer name

## Non-Goals (Out of Scope)

- Custom font sizes (users must use presets for MVP)
- Font family selection (use single default font for MVP)
- Text alignment (left/center/right) within text box
- Multi-line text with line height controls
- Text effects (shadow, stroke, gradient)
- Rich text formatting (bold/italic within single text object)
- Text on path or curved text
- Auto-sizing text boxes (fixed width based on content length)
- HTML layer for text (stick with Konva canvas objects)

## Design Considerations

### UI/UX
- **Format Selector**: Dropdown in toolbar when text tool is active
- **Visual Hierarchy**: Header = largest, Paragraph = smallest, clear visual difference
- **Font Weights**: Use bold/semibold/normal to reinforce hierarchy
- **Rotation**: Use Konva transformer handle (same as other objects)
- **Property Editor**: Show format in right-click context menu property editor

### Font Size Standards
Based on standard typographic scale:
- Header: 48px (3x base)
- Subheading: 32px (2x base)
- Paragraph: 16px (1x base)

Optional future enhancement: Add more levels (H1, H2, H3, etc.)

### Default Font
Use a clean, professional sans-serif font:
- **Recommended**: Inter, Open Sans, or Roboto
- Or use system font: `-apple-system, BlinkMacSystemFont, 'Segoe UI', ...`
- Consistent across all text formats

### Canvas vs. HTML Layer Decision
**Decision: Canvas objects (Konva.js)**
- Pros: Consistent with other objects, easier transforms, better performance
- Cons: Limited text rendering capabilities (no rich text)
- Trade-off: Acceptable for MVP - users can create multiple text objects for rich formatting

HTML layer would add complexity (z-index management, cursor sync issues, transform complications).

## Technical Considerations

### Text Object Type Update
Update `CanvasObject` type in `src/features/objects/types/index.ts`:
```typescript
interface TextObject {
  type: 'text';
  content: string;
  fontSize: number;
  format: 'header' | 'subheading' | 'paragraph';
  fontWeight?: 'bold' | 'semibold' | 'normal';
  rotation?: number;
  fill: string; // Text color
  position: { x: number; y: number };
  // ... other common properties
}
```

### Text Component Update
Update `src/features/objects/components/Text.tsx`:
- Add `fontWeight` prop to Konva Text component
- Map format to fontSize and fontWeight:
  ```typescript
  const formatStyles = {
    header: { fontSize: 48, fontWeight: 'bold' },
    subheading: { fontSize: 32, fontWeight: '600' }, // semibold
    paragraph: { fontSize: 16, fontWeight: 'normal' },
  };
  ```
- Apply rotation via Konva `rotation` prop

### Toolbar State
Add to canvas or toolbar store:
- `selectedTextFormat: TextFormat` (default: 'paragraph')
- Update when user selects format from dropdown

### Property Editor Integration
Update Right-Click Context Menu (Phase 1 feature) to include:
- Format dropdown (Header/Subheading/Paragraph)
- Rotation input (0-360 degrees)
- Changes call `updateObject()` with new format/rotation

### Real-Time Sync
Text format and rotation changes use existing `updateObject` service:
- Update `format`, `fontSize`, `fontWeight`, or `rotation` properties
- Broadcast via RTDB deltas
- All users see text size/weight/rotation change in real-time

### Konva Text Configuration
Use Konva.Text properties:
- `fontSize`: Number
- `fontFamily`: String (use default font)
- `fontStyle`: String ('bold', 'normal', etc.) - Konva uses `fontStyle` for weight
- `rotation`: Number (degrees)

Note: Konva uses `fontStyle` for both style (italic) and weight (bold). Use space-separated values: `'bold'`, `'600'` (semibold), etc.

### AI Agent Integration
Update AI agent tools to support text format:
- `createShape` tool: Add `format` parameter for text objects
- Default to 'paragraph' if not specified
- Example prompt: "Create header text that says 'Look 1'"

## Success Metrics

1. **Functionality**: Users can create text in three formats with correct sizes
2. **UX**: Format selector is intuitive and accessible
3. **Visual Quality**: Text renders clearly at all sizes and rotations
4. **Sync**: Format and rotation changes sync to all users in <100ms
5. **Consistency**: Text formatting maintains visual hierarchy

## Open Questions

None - canvas-based approach with presets is well-defined.

## Implementation Notes

### Implementation Order
1. Update TextObject type with `format`, `fontWeight`, `rotation` properties
2. Create format mapping (format → fontSize + fontWeight)
3. Update Text.tsx component to apply format styles and rotation
4. Add format selector to Canvas toolbar (dropdown or radio buttons)
5. Update Right-Click Context Menu to include format and rotation options
6. Test text creation with each format (Header, Subheading, Paragraph)
7. Test text rotation using Konva transformer
8. Test format changes on existing text objects
9. Verify real-time sync of format and rotation changes
10. Update AI agent to support text format parameter (optional)

### Konva Text Rotation
Konva Text supports rotation natively:
```tsx
<Text
  text={object.content}
  fontSize={formatStyles[object.format].fontSize}
  fontStyle={formatStyles[object.format].fontWeight}
  rotation={object.rotation || 0}
  x={object.position.x}
  y={object.position.y}
  fill={object.fill}
/>
```

### Font Loading
Ensure font is loaded before rendering:
- Use web font (e.g., Google Fonts) or system font
- If using web font, add to `app/layout.tsx`:
  ```tsx
  import { Inter } from 'next/font/google';
  const inter = Inter({ subsets: ['latin'] });
  ```

### Files to Modify
- `src/features/objects/types/index.ts` - Add format, fontWeight, rotation to TextObject
- `src/features/objects/components/Text.tsx` - Apply format styles and rotation
- `src/features/canvas/components/CanvasToolbar.tsx` - Add text format selector
- `src/shared/components/PropertyEditor.tsx` - Add format dropdown and rotation input
- `src/features/ai-agent/lib/tools.ts` - Add format parameter to createShape tool (optional)

### Testing Checklist
- Create Header text, verify 48px bold
- Create Subheading text, verify 32px semibold
- Create Paragraph text, verify 16px normal
- Change format of existing text via property editor
- Rotate text using Konva transformer handle
- Rotate text via property editor rotation input
- Verify text format shows in layer panel
- Test real-time sync of format changes
- Test real-time sync of rotation changes
- Verify all text renders clearly at various rotations
- Test with multi-user collaboration (multiple users editing text formats)

