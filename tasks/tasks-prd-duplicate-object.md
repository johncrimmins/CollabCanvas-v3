# Task List: Duplicate Object Feature

## Relevant Files

- `src/features/objects/services/objectsService.ts` - Add duplicateObject function to handle object duplication logic
- `src/features/objects/lib/objectsStore.ts` - May need to update selection state management
- `src/features/objects/hooks/useObjects.ts` - Add hook for duplicate functionality
- `src/features/canvas/components/Canvas.tsx` - Add keyboard event listener for Ctrl+D shortcut
- `src/features/objects/types/index.ts` - Verify CanvasObject type supports all properties needed for duplication

### Notes

- Duplication leverages existing createObject and RTDB broadcast mechanisms
- 20px offset applied to X and Y coordinates
- Only works on single selected object for this feature
- Keyboard shortcut prevents default browser bookmark dialog behavior

## Tasks

- [x] 1.0 Add duplicateObject function to objectsService.ts
  - [x] 1.1 Create duplicateObject function that accepts canvasId and objectId parameters
  - [x] 1.2 Implement logic to retrieve source object from Firestore
  - [x] 1.3 Generate new UUID for the duplicate object
  - [x] 1.4 Clone all object properties (type, dimensions, color, text, rotation, scale, etc.)
  - [x] 1.5 Apply 20px offset to position (x + 20, y + 20)
  - [x] 1.6 Set new createdAt and updatedAt timestamps
  - [x] 1.7 Use existing createObject logic to persist duplicate to Firestore
  - [x] 1.8 Broadcast creation via RTDB for real-time sync
  - [x] 1.9 Return the new duplicate object

- [x] 2.0 Add keyboard shortcut handling for Ctrl+D / Cmd+D
  - [x] 2.1 Add keyboard event listener in Canvas component or create useKeyboardShortcuts hook
  - [x] 2.2 Detect Ctrl+D (Windows/Linux) and Cmd+D (Mac) key combinations
  - [x] 2.3 Prevent default browser behavior (bookmark dialog)
  - [x] 2.4 Check if exactly one object is selected before calling duplicate
  - [x] 2.5 Call duplicateObject service function with selected object ID
  - [x] 2.6 Handle edge cases (no selection, multiple selections)

- [x] 3.0 Implement selection behavior after duplication
  - [x] 3.1 Update objectsStore to deselect original object after duplication
  - [x] 3.2 Auto-select the newly created duplicate
  - [x] 3.3 Update Konva transformer to attach to new duplicate
  - [x] 3.4 Verify selection state updates correctly in Zustand store

- [x] 4.0 Add optimistic update for duplicate action
  - [x] 4.1 Immediately add duplicate to local Zustand store before Firestore write
  - [x] 4.2 Update local selection state optimistically
  - [x] 4.3 Ensure UI updates immediately (<100ms perceived latency)

- [ ] 5.0 Test duplicate functionality with all object types (MANUAL TESTING REQUIRED)
  - [ ] 5.1 Test duplication with rectangle objects
  - [ ] 5.2 Test duplication with circle objects
  - [ ] 5.3 Test duplication with text objects (verify text content is copied)
  - [ ] 5.4 Test duplication with arrow objects
  - [ ] 5.5 Verify all properties are correctly copied (color, rotation, dimensions, etc.)
  - [ ] 5.6 Test real-time sync with multiple users (duplicate appears for all users)
  - [ ] 5.7 Test keyboard shortcut on different operating systems (Windows, Mac)
  - [ ] 5.8 Test edge cases (no selection, multiple selections, rapid duplication)

## Implementation Complete ✅
All code for Duplicate Object feature has been implemented. Manual testing required to verify functionality.

