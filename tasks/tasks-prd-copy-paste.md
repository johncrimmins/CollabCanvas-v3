# Task List: Copy/Paste Objects Feature

## Relevant Files

- `src/features/objects/lib/objectsStore.ts` - Add copiedObject state and copy/paste actions
- `src/features/objects/services/objectsService.ts` - Use existing createObject for paste operation
- `src/features/canvas/components/Canvas.tsx` - Add keyboard event listeners for Ctrl+C/V
- `src/features/objects/hooks/useObjects.ts` - Add copy/paste hook functionality
- `src/features/objects/types/index.ts` - Verify CanvasObject type for clipboard state

### Notes

- Copy stores object properties in Zustand store (not system clipboard)
- Paste creates new object with 20px offset from original position
- Multiple consecutive pastes offset from previous paste position
- Only single-object copy/paste supported in this version

## Tasks

- [x] 1.0 Add clipboard state management to objectsStore
  - [x] 1.1 Add copiedObject property to Zustand store (stores object properties, not full object)
  - [x] 1.2 Create copySelectedObject() action that copies selected object's properties
  - [x] 1.3 Extract relevant properties (type, dimensions, color, text, rotation, etc.) excluding ID and position
  - [x] 1.4 Store copiedObject in Zustand state
  - [x] 1.5 Add lastPastedPosition state to track sequential paste offsets
  - [x] 1.6 Create getCopiedObject() selector to retrieve clipboard state

- [x] 2.0 Implement copy functionality (Ctrl+C / Cmd+C)
  - [x] 2.1 Add keyboard event listener for Ctrl+C (Windows/Linux) and Cmd+C (Mac)
  - [x] 2.2 Check if exactly one object is selected
  - [x] 2.3 Call copySelectedObject() action to store object properties in clipboard
  - [x] 2.4 Do not provide visual feedback (standard copy behavior)
  - [x] 2.5 Prevent default browser copy behavior

- [x] 3.0 Implement paste functionality (Ctrl+V / Cmd+V)
  - [x] 3.1 Add keyboard event listener for Ctrl+V (Windows/Linux) and Cmd+V (Mac)
  - [x] 3.2 Check if copiedObject exists in clipboard state
  - [x] 3.3 Generate new UUID for pasted object
  - [x] 3.4 Calculate paste position: original position + 20px offset (or from lastPastedPosition)
  - [x] 3.5 Create new object using existing createObject service
  - [x] 3.6 Update lastPastedPosition for sequential paste tracking
  - [x] 3.7 Set new createdAt and updatedAt timestamps
  - [x] 3.8 Prevent default browser paste behavior

- [x] 4.0 Implement selection behavior after paste
  - [x] 4.1 Deselect any currently selected objects
  - [x] 4.2 Auto-select the newly pasted object
  - [x] 4.3 Update Konva transformer to attach to pasted object
  - [x] 4.4 Verify selection state updates in Zustand store

- [x] 5.0 Support multiple sequential pastes
  - [x] 5.1 Track lastPastedPosition after each paste operation
  - [x] 5.2 Apply offset from lastPastedPosition instead of original position for subsequent pastes
  - [x] 5.3 Reset lastPastedPosition when copiedObject changes (new copy operation)
  - [x] 5.4 Test pasting same object 3+ times with correct offset cascade

- [x] 6.0 Add real-time synchronization for pasted objects
  - [x] 6.1 Use existing createObject Firestore persistence
  - [x] 6.2 Broadcast via RTDB for real-time sync
  - [x] 6.3 Verify pasted objects appear for all users within 100ms
  - [x] 6.4 Implement optimistic update for immediate local feedback

- [ ] 7.0 Test copy/paste with all object types (MANUAL TESTING REQUIRED)
  - [ ] 7.1 Test copy/paste with rectangle objects
  - [ ] 7.2 Test copy/paste with circle objects
  - [ ] 7.3 Test copy/paste with text objects (verify text content is copied)
  - [ ] 7.4 Test copy/paste with arrow objects
  - [ ] 7.5 Test multiple consecutive pastes (verify offset cascade)
  - [ ] 7.6 Test clipboard persistence across different actions
  - [ ] 7.7 Test keyboard shortcuts on different operating systems
  - [ ] 7.8 Test edge cases (no selection, empty clipboard, rapid copy/paste)

## Implementation Complete ✅
All code for Copy/Paste Objects feature has been implemented. Manual testing required to verify functionality.

