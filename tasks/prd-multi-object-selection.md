# PRD: Multi-Object Selection

## Introduction/Overview

Enable users to select multiple objects simultaneously on the LookBook canvas using Ctrl+click (Cmd+click on Mac). This feature is foundational for advanced operations like bulk transformations, layer management, and AI-powered layout commands. Users can build a selection set by clicking objects while holding the Ctrl/Cmd key.

## Goals

1. Allow users to select multiple objects by Ctrl+clicking (Cmd+click on Mac)
2. Provide clear visual feedback showing which objects are selected
3. Support selection and deselection of individual objects within a multi-selection
4. Enable bulk operations on selected objects (delete, move - future: transform)
5. Maintain selection state in Zustand store
6. Foundation for layer management and AI layout features

## User Stories

1. **As a photographer**, I want to select multiple text labels so that I can delete them all at once when reorganizing my Look.

2. **As a stylist**, I want to select several color swatches so that I can move them together to a different area of the LookBook.

3. **As a creative director**, I want to select a group of related elements so that I can ask the AI agent to space them evenly (Phase 3 feature).

4. **As a model**, I want to select multiple shapes and see clear visual indication of my selection so that I can confidently perform bulk actions.

## Functional Requirements

### FR1: Ctrl+Click Selection
When a user Ctrl+clicks (Cmd+click on Mac) on an object:
- If object is not selected, add it to the selection set
- If object is already selected, remove it from the selection set (toggle behavior)
- Preserve existing selections (don't clear them)
- Work with all object types (rectangles, circles, text, arrows)

### FR2: Regular Click Behavior
When a user clicks on an object WITHOUT Ctrl/Cmd:
- Clear all existing selections
- Select only the clicked object (single-selection mode)
- This maintains existing single-select behavior

### FR3: Click Empty Canvas
When a user clicks on empty canvas area:
- Clear all selections (deselect everything)
- Works whether Ctrl/Cmd is held or not

### FR4: Selection State Management
- Store selected object IDs in Zustand store as an array: `selectedObjectIds: string[]`
- Provide actions: `selectObject(id)`, `deselectObject(id)`, `clearSelection()`, `toggleObjectSelection(id)`
- Support querying: `isObjectSelected(id)` and `getSelectedCount()`

### FR5: Visual Feedback
Selected objects display visual indicators:
- Blue border/stroke around selected objects (existing Konva transformer behavior)
- All selected objects show borders simultaneously
- Selected objects remain visually distinct from non-selected objects

### FR6: Multi-Object Delete
When multiple objects are selected and user presses Delete/Backspace:
- Delete all selected objects
- Sync deletion to all users in real-time
- Clear selection after deletion

### FR7: Multi-Object Move (Drag)
When multiple objects are selected and user drags one of them:
- All selected objects move together, maintaining their relative positions
- Real-time sync shows all objects moving for other users
- Offset between objects preserved during drag

## Non-Goals (Out of Scope)

- Drag-to-select (rectangular selection box) - future enhancement
- Shift+click to select range - future enhancement
- Select all (Ctrl+A) - future enhancement
- Multi-object resize/rotate (requires advanced transformer) - future enhancement
- Grouped transformations with single transformer - future enhancement
- Copy/paste multiple objects - requires copy/paste feature first
- Layer selection in layer panel - part of layer management feature

## Design Considerations

### UI/UX
- Ctrl+click (Cmd+click on Mac) follows standard OS conventions
- Visual feedback: Blue borders on all selected objects (consistent with single-select)
- Number of selected objects could be shown in status bar (optional enhancement)
- Deselect individual objects by Ctrl+clicking them again

### Selection Limits
- No hard limit on number of objects that can be selected
- Practical limit: Performance with 50+ objects selected may degrade
- Recommend testing with 20-30 objects selected

### Interaction with Existing Features
- Delete: Works with multi-selection (already specified above)
- Move: Works with multi-selection (drag any selected object moves all)
- Duplicate: Only works on single selection (for now)
- Copy/Paste: Only works on single selection (for now)
- Right-click menu: Shows context menu for multi-selection (Phase 1 feature integration)

## Technical Considerations

### State Management (Zustand)
- Change `selectedObjectId: string | null` to `selectedObjectIds: string[]`
- Update all components reading selection state to handle array
- Maintain backward compatibility by providing `getSelectedObject()` for single-select checks

### Konva Integration
- Konva Transformer can attach to multiple shapes
- Use Konva's `nodes()` method to attach transformer to array of shapes
- Handle drag events for multiple shapes (Konva supports this natively)

### Event Handling
- Detect Ctrl/Cmd key state during click events
- Use `event.ctrlKey` or `event.metaKey` to check modifier keys
- Prevent event propagation issues between shapes and stage

### Real-Time Sync
- Broadcast selection state changes? NO - selection is local per user
- Only sync actual operations (delete, move) performed on selected objects
- Each user maintains their own selection state

### Performance
- Rendering multiple blue borders: Minimal performance impact
- Moving 10+ objects simultaneously: Test for frame rate degradation
- Optimize by grouping selected objects in Konva layer if needed

## Success Metrics

1. **Functionality**: Users can select 2+ objects using Ctrl+click
2. **Visual Clarity**: All selected objects show blue borders clearly
3. **Performance**: No lag when selecting/moving up to 20 objects
4. **Reliability**: Selection state remains consistent during interactions
5. **UX**: Ctrl+click behavior feels natural and familiar

## Open Questions

None - standard multi-select pattern well-established in design tools.

## Implementation Notes

### Migration Path
1. Update Zustand store: `selectedObjectIds: string[]` (breaking change)
2. Update all components reading `selectedObjectId` to use array
3. Add keyboard modifier detection to click handlers
4. Update Konva Transformer to handle multiple nodes
5. Update delete handler to delete multiple objects
6. Implement multi-object drag functionality
7. Test with various object counts (2, 5, 10, 20 objects)

### Files to Modify
- `src/features/objects/lib/objectsStore.ts` - Change selection state to array
- `src/features/canvas/components/Canvas.tsx` - Detect Ctrl/Cmd key on clicks
- `src/features/objects/hooks/useShapeInteractions.ts` - Handle multi-select in interactions
- `src/features/objects/services/objectsService.ts` - Add bulk delete function
- Konva Transformer usage - Attach to multiple shapes

### Testing Checklist
- Ctrl+click adds objects to selection
- Ctrl+click on selected object removes it
- Regular click clears multi-selection
- Click empty canvas clears selection
- Delete removes all selected objects
- Drag moves all selected objects together
- Visual feedback shows all selected objects with blue borders

