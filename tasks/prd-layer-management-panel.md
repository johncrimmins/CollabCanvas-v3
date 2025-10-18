# PRD: Layer Management Panel

## Introduction/Overview

Add a layer management panel to the LookBook interface that displays all objects on the canvas in a hierarchical list. Users can view all layers, toggle visibility with an eye icon, select objects by clicking layer names, and understand the structure of their composition. This feature brings professional design tool functionality to the LookBook and provides a foundation for advanced layer operations.

## Goals

1. Display all canvas objects in a dedicated layer panel (sidebar or floating panel)
2. Show layer names based on object type and properties
3. Allow users to toggle layer visibility (show/hide) with eye icon
4. Enable layer selection by clicking layer name
5. Provide clear visual feedback for selected layers
6. Support multi-object selection awareness (show all selected layers)
7. Sync visibility state across all users in real-time

## User Stories

1. **As a photographer**, I want to see a list of all objects on my Look so that I can understand what elements I'm working with at a glance.

2. **As a stylist**, I want to hide certain color swatches temporarily so that I can focus on the current palette I'm considering without deleting elements.

3. **As a creative director**, I want to select an object by clicking its name in the layer panel so that I can manipulate objects that are hidden behind other elements.

4. **As a model**, I want to toggle visibility of multiple elements quickly so that I can compare different composition variations.

## Functional Requirements

### FR1: Layer Panel UI
- Display a vertical panel on the right side of the canvas (or left, configurable)
- Panel width: 250-300px
- Panel header: "Layers" title with object count (e.g., "Layers (12)")
- Panel can be collapsed/expanded with toggle button
- Panel persists across sessions (collapsed/expanded state saved to localStorage)

### FR2: Layer List Display
For each object on the canvas, display a layer item showing:
- **Eye icon** (visibility toggle) - Click to show/hide object
- **Object type icon** - Visual indicator (rectangle, circle, text, arrow icons)
- **Layer name** - Generated from object properties:
  - Rectangle: "Rectangle" or "Red Rectangle" (if colored)
  - Circle: "Circle" or "Blue Circle" (if colored)
  - Text: First 20 characters of text content or "Text"
  - Arrow: "Arrow"
- **Selection indicator** - Highlighted background if layer is selected

### FR3: Visibility Toggle
When user clicks the eye icon:
- Object visibility toggles (visible ↔ hidden)
- Eye icon changes: Open eye (visible) ↔ Closed eye (hidden)
- Hidden objects disappear from canvas but remain in layer list (grayed out)
- Visibility state syncs to all users in real-time
- Hidden objects cannot be selected on canvas but can be selected via layer list

### FR4: Layer Selection
When user clicks on a layer name:
- **Without Ctrl/Cmd**: Select only that object (clear other selections)
- **With Ctrl/Cmd**: Add object to multi-selection (or remove if already selected)
- Selected layers show highlighted background in layer list
- Canvas shows selected object(s) with blue borders (existing behavior)
- Clicking canvas objects updates layer panel selection state

### FR5: Layer Ordering
Display layers in creation order (or z-index order if implemented):
- Newest objects at the top of the list (most recently created)
- Or bottom-up rendering order (top of list = top of canvas)
- For MVP: Use creation timestamp order (newest first)

### FR6: Visibility Persistence
- Visibility state stored in object properties: `visible: boolean` (default: true)
- Persisted to Firestore alongside other object properties
- Broadcast visibility changes via RTDB for real-time sync
- Hidden objects remain hidden after page refresh

### FR7: Empty State
When no objects exist on canvas:
- Show message: "No layers yet. Create objects to see them here."
- Optionally show illustration or icon

## Non-Goals (Out of Scope)

- Drag-to-reorder layers (z-index management) - Phase 4 feature
- Layer renaming (custom names) - future enhancement
- Layer grouping/folders - future enhancement
- Layer locking (prevent editing) - future enhancement
- Layer opacity controls - future enhancement
- Nested layers or parent-child relationships - future enhancement
- Layer filtering or search - future enhancement
- Bring to front / send to back - Phase 4 feature

## Design Considerations

### UI/UX
- **Panel Position**: Right sidebar (common in design tools like Figma, Photoshop)
- **Panel Style**: Clean, minimal design with Tailwind CSS
- **Icons**: 
  - Eye open: 👁️ or custom SVG
  - Eye closed: 🚫👁️ or custom SVG
  - Object types: Small icons for rectangle, circle, text, arrow
- **Hover States**: Layer items highlight on hover
- **Scrolling**: Panel scrolls if layer list exceeds viewport height

### Layer Naming Convention
- Keep names concise (max 30 characters)
- Include color if it's distinctive (e.g., "Red Circle")
- For text objects, show content preview
- Add object ID or number if multiple identical objects exist (e.g., "Circle 1", "Circle 2")

### Visibility vs. Deletion
- Hidden objects are NOT deleted - they still exist in Firestore
- Hidden objects can be made visible again
- Users should understand hidden ≠ deleted (use clear icons)

## Technical Considerations

### Data Model Changes
Add `visible` property to `CanvasObject` type:
```typescript
interface CanvasObject {
  // ... existing properties
  visible?: boolean; // Default: true
}
```

### State Management (Zustand)
- Objects store already has all objects
- Add `toggleObjectVisibility(objectId: string)` action
- Filter visible objects in Canvas rendering: `objects.filter(obj => obj.visible !== false)`

### Component Structure
Create new components:
- `LayerPanel.tsx` - Main panel container
- `LayerItem.tsx` - Individual layer row
- `LayerPanelHeader.tsx` - Panel title and controls

### Integration Points
- `Canvas.tsx` - Render only visible objects
- `objectsService.ts` - Update visibility property
- Objects Zustand store - Filter visible objects for rendering

### Real-Time Sync
- Visibility changes use existing `updateObject` service
- Broadcast via RTDB deltas
- All users see visibility changes in real-time

### Performance
- Rendering 100+ layers: Use virtualization if needed (react-window or similar)
- For MVP: Support up to 50 layers without virtualization

### Keyboard Shortcuts (Optional Enhancement)
- Toggle visibility of selected object: H key
- Show all layers: Ctrl+Shift+H
- Not required for MVP but easy to add

## Success Metrics

1. **Functionality**: Panel displays all objects with correct names and visibility states
2. **Performance**: Panel updates in <50ms when objects are added/removed
3. **Sync**: Visibility changes sync to all users within 100ms
4. **UX**: Users can easily identify and manage layers
5. **Reliability**: Visibility state persists correctly after page refresh

## Open Questions

- Should panel be on left or right side? **Recommended: Right side**
- Should panel be collapsible? **Recommended: Yes, with localStorage state**
- Should layer order be newest-first or oldest-first? **Recommended: Newest-first (easier to find recent objects)**

## Implementation Notes

### Vertical Slice Consideration
Layer panel is a shared UI component, not a feature module. Place in:
- `src/features/objects/components/LayerPanel.tsx` (part of objects feature)
- Or `src/shared/components/LayerPanel.tsx` (if considered shared UI)

**Recommended**: Keep in `objects` feature since it's tightly coupled to object management.

### Files to Create/Modify
- Create: `src/features/objects/components/LayerPanel.tsx`
- Create: `src/features/objects/components/LayerItem.tsx`
- Modify: `src/features/objects/types/index.ts` (add `visible` property)
- Modify: `src/features/objects/lib/objectsStore.ts` (add visibility toggle action)
- Modify: `src/features/canvas/components/Canvas.tsx` (render only visible objects)
- Modify: `app/canvas/page.tsx` (add LayerPanel to canvas layout)

### Testing Checklist
- Layer panel displays all objects
- Eye icon toggles visibility correctly
- Hidden objects disappear from canvas but remain in layer list
- Clicking layer name selects object on canvas
- Ctrl+click on layer adds to multi-selection
- Visibility changes sync to all users
- Visibility state persists after page refresh
- Panel collapse/expand state saves to localStorage
- Empty state shows when no objects exist
- Panel scrolls when layer list is long

