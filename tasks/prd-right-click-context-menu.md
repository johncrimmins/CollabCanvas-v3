# PRD: Right-Click Context Menu

## Introduction/Overview

Enable users to right-click on canvas objects to open a context menu with common actions and property editing options. This feature provides quick access to object manipulation without keyboard shortcuts or toolbars, making the LookBook more intuitive and accessible to users familiar with standard design tools.

## Goals

1. Provide a right-click context menu for all canvas objects
2. Allow users to edit object properties (color, dimensions, rotation)
3. Include common actions (duplicate, delete, copy, paste)
4. Create reusable context menu component
5. Support both single-object and multi-object contexts
6. Integrate with existing object manipulation functions

## User Stories

1. **As a photographer**, I want to right-click on a shape and change its color so that I can quickly adjust my visual palette without leaving the canvas.

2. **As a stylist**, I want to right-click on multiple selected objects and see bulk operations so that I can efficiently manage groups of elements.

3. **As a creative director**, I want to right-click on a text element and adjust its size so that I can fine-tune typography directly.

4. **As a model**, I want to right-click on an object to access common actions like duplicate and delete so that I don't need to remember keyboard shortcuts.

## Functional Requirements

### FR1: Context Menu Trigger
When a user right-clicks on a selected object:
- Context menu appears at cursor position
- Menu shows relevant actions for the object type
- Menu closes when user clicks elsewhere or presses Escape
- Only one context menu can be open at a time

### FR2: Single-Object Menu Options
When right-clicking on a single selected object, show:
- **Edit Properties** (submenu or modal)
  - Color picker (for fill color)
  - Width input (for rectangles, shapes with dimensions)
  - Height input (for rectangles, shapes with dimensions)
  - Radius input (for circles)
  - Rotation input (degrees, 0-360)
  - Font Size input (for text objects only)
  - Text Content input (for text objects only)
- **Duplicate** - Creates copy of object
- **Copy** - Copies object to clipboard
- **Paste** - Pastes from clipboard (if clipboard has object)
- **Delete** - Removes object
- **Divider line** (visual separator)
- **Cancel** - Closes menu

### FR3: Multi-Object Menu Options
When right-clicking with multiple objects selected, show:
- **Delete All** - Removes all selected objects
- **Duplicate All** (future enhancement - not in this version)
- **Divider line**
- **Cancel** - Closes menu

### FR4: Property Editing
When user selects "Edit Properties":
- Open a modal/popover with property inputs
- Show only relevant properties for object type:
  - Rectangle: Color, Width, Height, Rotation
  - Circle: Color, Radius, Rotation
  - Text: Color, Font Size, Text Content, Rotation
  - Arrow: Color, Stroke Width, Rotation
- Apply changes in real-time (live preview as user types)
- Sync property changes to all users via objectsService

### FR5: Menu Positioning
- Menu appears at cursor position (where user right-clicked)
- If menu would extend beyond viewport edges, adjust position to stay visible
- Menu stays open until user makes selection or clicks away

### FR6: Keyboard Support
- Arrow keys navigate menu items
- Enter key activates selected menu item
- Escape key closes menu
- Tab cycles through menu items

## Non-Goals (Out of Scope)

- Nested submenus (keep menu flat for MVP)
- Custom property presets or saved styles
- Advanced properties (opacity, blend modes, shadows)
- Bulk property editing for multi-selection (edit all selected objects at once)
- Layer order controls (bring to front / send to back) - Phase 4 feature
- Grouping/ungrouping - future feature

## Design Considerations

### UI/UX
- Clean, minimal menu design with clear labels
- Use icons alongside text for common actions (duplicate, delete, copy, paste)
- Group related actions with divider lines
- Property editor: Modal with form inputs, "Apply" and "Cancel" buttons
- Support light/dark mode (follow app theme)

### Menu Items
Priority order (top to bottom):
1. Edit Properties (most common action)
2. Duplicate
3. Copy
4. Paste (only if clipboard has object)
5. --- (divider) ---
6. Delete (destructive action at bottom)

### Property Editor Design
- Modal overlay (semi-transparent background)
- Form with labeled inputs
- Color picker: Standard HTML color input or custom picker
- Number inputs with validation (e.g., width > 0)
- Live preview: Changes apply immediately to object on canvas
- "Close" button or click outside to dismiss

## Technical Considerations

### Component Structure
Create new components:
- `ContextMenu.tsx` - Reusable context menu component
- `PropertyEditor.tsx` - Modal for editing object properties
- `ColorPicker.tsx` - Color selection input (may use native input for MVP)

### Integration Points
- `Canvas.tsx` - Detect right-click events on canvas objects
- `objectsService.ts` - Use existing `updateObject` for property changes
- Objects Zustand store - Get selected object(s) data

### Event Handling
- Detect right-click (contextmenu event) on Konva shapes
- Prevent default browser context menu: `event.preventDefault()`
- Track menu open/closed state
- Handle clicks outside menu to close

### Real-Time Sync
- Property changes use existing `updateObject` service
- Broadcast updates via RTDB
- All users see property changes in real-time

### State Management
- Track context menu state: `isOpen`, `position`, `targetObjectId`
- Store in local component state or create `contextMenuStore` if needed
- Property editor state: Current editing values, validation errors

### Validation
- Width/Height: Must be > 0, max 5000px
- Radius: Must be > 0, max 2500px
- Rotation: 0-360 degrees (or allow any number and normalize)
- Font Size: 8-200px
- Color: Valid hex color or use color picker to ensure validity

## Success Metrics

1. **Functionality**: Context menu appears on right-click with correct options
2. **Property Editing**: Changes apply and sync to all users in <100ms
3. **UX**: Menu is intuitive and responsive, no lag when opening
4. **Reliability**: Property changes persist correctly to Firestore
5. **Adoption**: Users prefer context menu over keyboard shortcuts for property editing

## Open Questions

- Should we use a library for the context menu (e.g., Radix UI) or build custom?
- Should property changes be real-time (as user types) or on "Apply" button click?
- Do we need undo for property changes in this PRD, or rely on global undo/redo feature?

## Implementation Notes

### Recommended Libraries
- Consider using **Radix UI Context Menu** or **Headless UI Menu** for accessibility
- Or build custom with Tailwind for full control

### Property Editor Approach
**Recommended**: Modal with live preview
- User sees changes immediately as they adjust properties
- No "Apply" button needed - changes sync on input change (debounced)
- "Close" button or click outside to dismiss

**Alternative**: Form with Apply/Cancel
- User makes all changes, then clicks Apply
- More traditional but requires extra click

### Files to Create/Modify
- Create: `src/shared/components/ContextMenu.tsx`
- Create: `src/shared/components/PropertyEditor.tsx`
- Modify: `src/features/canvas/components/Canvas.tsx` (add right-click handler)
- Modify: `src/features/objects/hooks/useObjects.ts` (add property update helpers)

### Testing Checklist
- Right-click opens context menu at cursor position
- Menu shows correct options for object type
- Property editor opens and displays current values
- Property changes sync to all users
- Menu closes on click outside, Escape, or action selection
- Keyboard navigation works
- Multi-select shows appropriate menu options
- Menu positioning handles viewport edges correctly

