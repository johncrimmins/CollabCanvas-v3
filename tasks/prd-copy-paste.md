# PRD: Copy/Paste Objects

## Introduction/Overview

Enable users to copy and paste objects on the LookBook canvas using standard keyboard shortcuts. This feature allows designers to replicate objects with familiar Ctrl+C / Ctrl+V commands, enabling quick duplication and transfer of elements across different areas of the canvas or even between sessions.

## Goals

1. Implement standard copy/paste keyboard shortcuts (Ctrl+C, Ctrl+V / Cmd+C, Cmd+V)
2. Copy selected object properties to clipboard (internal app state)
3. Paste copied object at cursor position or with offset from original
4. Maintain all object properties during copy/paste
5. Sync pasted objects across all users in real-time
6. Support copying a single object (multi-object support in future feature)

## User Stories

1. **As a photographer**, I want to copy a styled text element and paste it in multiple locations so that I can quickly label different areas of my Look.

2. **As a stylist**, I want to copy a color swatch and paste it into a different section of the LookBook so that I can organize my palette systematically.

3. **As a creative director**, I want to copy an element from one Look and paste it into Look 2 so that I can maintain visual consistency across multiple Looks.

4. **As a model**, I want to copy and paste shapes using familiar keyboard shortcuts so that I can work efficiently without learning new commands.

## Functional Requirements

### FR1: Copy Functionality (Ctrl+C / Cmd+C)
When a user presses Ctrl+C (Cmd+C on Mac):
- If exactly one object is selected, copy its properties to clipboard state
- Store object type, dimensions, color, rotation, text content, and all other properties
- Do not copy object ID or position (these are unique per instance)
- Store in app state (Zustand), not system clipboard
- Provide no visual feedback (standard copy behavior)

### FR2: Paste Functionality (Ctrl+V / Cmd+V)
When a user presses Ctrl+V (Cmd+V on Mac):
- If clipboard state contains a copied object, create a new object
- Generate new UUID for the pasted object
- Apply 20px offset from the original object's position (+20px X, +20px Y)
- Set new `createdAt` and `updatedAt` timestamps
- Persist to Firestore and broadcast via RTDB
- Select the newly pasted object

### FR3: Clipboard State Management
- Add `copiedObject` property to objects Zustand store
- Store copied object properties (not full object with ID)
- Clipboard persists across actions until new copy or page refresh
- Only one object can be in clipboard at a time

### FR4: Paste Multiple Times
Users can paste the same copied object multiple times:
- Each paste creates a new object with unique ID
- Each paste applies offset from the last pasted object's position
- Example: Copy once, paste 3 times = 3 new objects, each offset by 20px

### FR5: Real-Time Synchronization
When a user pastes an object:
- The pasted object appears immediately for the user (optimistic update)
- The pasted object syncs to all other users via RTDB
- All users see the pasted object appear in real-time

### FR6: Support All Object Types
Copy/paste must work for all existing object types:
- Rectangles (with color, dimensions, rotation)
- Circles (with color, radius, rotation)
- Text (with content, fontSize, color, rotation)
- Arrows (with points, color, strokeWidth)

## Non-Goals (Out of Scope)

- Copy/paste multiple objects at once (requires multi-select feature first)
- Cross-canvas copy/paste (between different LookBooks)
- System clipboard integration (paste from external apps)
- Cut operation (Ctrl+X) - will be separate feature if needed
- Copy/paste with custom positioning (user picks exact paste location)
- Undo/redo for copy/paste (handled by separate undo/redo feature)

## Design Considerations

### UI/UX
- Standard keyboard shortcuts (Ctrl+C, Ctrl+V / Cmd+C, Cmd+V)
- No visual indication of copy action (follows OS conventions)
- Paste creates object with visible offset so user can distinguish it from original
- Newly pasted object is automatically selected for immediate editing

### Clipboard Scope
- Clipboard is per-user (not shared across users)
- Clipboard persists during session but clears on page refresh
- Future enhancement: Persist clipboard to localStorage

### Paste Positioning
- Default: Paste at +20px X, +20px Y offset from original position
- Multiple consecutive pastes: Each offset from the previous paste
- Example: Original at (100, 100), first paste at (120, 120), second paste at (140, 140)

## Technical Considerations

### Integration with objectsService.ts
- Use existing `createObject` function for paste operation
- Add `copyObject` helper function to extract properties for clipboard
- No new service functions needed - leverage existing create/update methods

### State Management (Zustand)
- Add `copiedObject` to objects store
- Add `copySelectedObject()` action
- Add `pasteObject()` action that calls `createObject` service
- Track last pasted position for sequential paste offsets

### Keyboard Event Handling
- Add keyboard listeners for Ctrl+C and Ctrl+V (Cmd+C, Cmd+V on Mac)
- Prevent default browser behavior (save page, etc.)
- Only trigger when canvas is focused (not when typing in AI chat)

### Real-Time Sync
- Pasted objects use existing object creation sync mechanism
- No special handling needed - paste is just a create operation

## Success Metrics

1. **Functionality**: Copy/paste creates identical object with correct offset
2. **Performance**: Paste completes in <100ms locally
3. **Sync**: Pasted object appears for all users within 100ms
4. **Reliability**: All object properties copied correctly (100% accuracy)
5. **UX**: Users can copy/paste without friction using familiar shortcuts

## Open Questions

None - feature builds on duplicate object functionality with clipboard management.

## Implementation Notes

- Add `copiedObject` state to objects Zustand store
- Add keyboard event listeners in Canvas component or dedicated hook
- Use existing `createObject` from objectsService.ts
- Track last pasted position for sequential pastes
- Test with all object types
- Verify clipboard persists across multiple paste operations
- Ensure pasted objects sync in real-time to all users

