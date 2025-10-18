# PRD: Duplicate Object

## Introduction/Overview

Enable users to duplicate existing objects on the LookBook canvas with a single action. This feature allows designers to quickly replicate shapes, text, and other elements, streamlining the creative workflow when building repetitive layouts or variations of visual concepts.

## Goals

1. Provide a quick way to duplicate any object on the canvas
2. Maintain all properties of the original object (color, size, rotation, text content)
3. Offset duplicated objects slightly so they don't overlap the original
4. Sync duplicated objects across all users in real-time
5. Integrate seamlessly with existing objectsService.ts (vertical slicing architecture)

## User Stories

1. **As a photographer**, I want to duplicate a styled text element so that I can quickly create multiple labels with consistent formatting.

2. **As a stylist**, I want to duplicate a color swatch rectangle so that I can build a palette without recreating each shape manually.

3. **As a model**, I want to duplicate a shape I've positioned perfectly so that I can create a pattern or layout variation.

4. **As a creative director**, I want to duplicate an entire composition element so that I can test multiple versions side-by-side.

## Functional Requirements

### FR1: Duplicate Function in objectsService
Add a `duplicateObject(canvasId: string, objectId: string)` function to `objectsService.ts` that:
- Retrieves the source object from Firestore
- Generates a new UUID for the duplicate
- Creates a new object with identical properties (type, dimensions, color, text, rotation, etc.)
- Offsets the duplicate's position by 20px right and 20px down from the original
- Sets new `createdAt` and `updatedAt` timestamps
- Persists the duplicate to Firestore
- Broadcasts the creation via RTDB for real-time sync

### FR2: Keyboard Shortcut
Implement Ctrl+D (Cmd+D on Mac) keyboard shortcut to duplicate the currently selected object:
- Only works when exactly one object is selected
- Does nothing if no object is selected or multiple objects are selected
- Provides visual feedback (the duplicate appears and becomes selected)

### FR3: Real-Time Synchronization
When a user duplicates an object:
- The duplicate appears immediately for the user (optimistic update)
- The duplicate syncs to all other users via existing RTDB broadcast mechanism
- All users see the duplicate appear in real-time

### FR4: Selection Behavior
After duplication:
- The original object is deselected
- The newly created duplicate is automatically selected
- User can immediately move or modify the duplicate

### FR5: Support All Object Types
Duplication must work for all existing object types:
- Rectangles
- Circles
- Text (including text content)
- Arrows
- Any future object types

## Non-Goals (Out of Scope)

- Multi-object duplication (duplicating multiple selected objects at once) - will be added in a future feature
- Duplicate with custom offset (user choosing where the duplicate appears)
- "Duplicate in place" (exact same position)
- Undo/redo for duplication (will be handled by separate undo/redo feature)
- Right-click menu integration (will be added in right-click context menu feature)

## Design Considerations

### UI/UX
- Keyboard shortcut (Ctrl+D / Cmd+D) is the primary interaction
- No visual menu or button required for MVP (can be added to right-click menu later)
- Duplicate appears with 20px offset (visible but close to original)
- Immediate selection of duplicate allows for quick repositioning

### Offset Strategy
- Default offset: +20px X, +20px Y (down and to the right)
- If duplicate would go off-canvas (beyond viewport), still apply offset (user can pan to find it)
- Future enhancement: Smart positioning to avoid overlaps

## Technical Considerations

### Integration with objectsService.ts
- Add `duplicateObject` function alongside existing create/update/delete functions
- Reuse existing `createObject` logic internally
- Follow established patterns for Firestore writes and RTDB broadcasts

### State Management
- Use existing Zustand objects store
- Optimistic update: Add duplicate to local store immediately
- Server confirmation: Firestore write confirms persistence

### Real-Time Sync
- Use existing RTDB delta broadcasting mechanism
- No special handling needed - duplicate is just a new object creation

### Keyboard Event Handling
- Add keyboard listener in Canvas component or dedicated hook
- Check for Ctrl+D / Cmd+D when object is selected
- Prevent browser default behavior (bookmark dialog)

## Success Metrics

1. **Functionality**: Duplicate creates identical object with 20px offset
2. **Performance**: Duplication completes in <100ms locally
3. **Sync**: Duplicate appears for all users within 100ms
4. **Reliability**: All object properties copied correctly (100% accuracy)
5. **UX**: Users can duplicate objects without friction using keyboard shortcut

## Open Questions

None - feature is well-defined and straightforward.

## Implementation Notes

- Start with `objectsService.ts` - add `duplicateObject` function
- Add keyboard shortcut handler in Canvas or objects hook
- Leverage existing selection state from objects store
- Test with all object types (rectangle, circle, text, arrow)
- Verify real-time sync with multiple users

