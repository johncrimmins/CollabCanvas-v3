# PRD: Undo/Redo

## Introduction/Overview

Implement undo/redo functionality for the LookBook canvas, allowing users to reverse and restore their actions using standard keyboard shortcuts (Ctrl+Z / Ctrl+Y or Cmd+Z / Cmd+Shift+Z on Mac). This feature is essential for confident creative exploration, enabling users to experiment without fear of losing work or making irreversible mistakes.

## Goals

1. Implement undo (Ctrl+Z / Cmd+Z) and redo (Ctrl+Y / Cmd+Shift+Z) keyboard shortcuts
2. Support undoing/redoing all major object operations (create, update, delete, duplicate, move, property changes)
3. Maintain a history stack of user actions (last 50 actions)
4. Provide clear feedback when undo/redo is performed
5. Handle undo/redo in collaborative environment (per-user history)
6. Ensure undo/redo syncs correctly with real-time collaboration

## User Stories

1. **As a photographer**, I want to undo a shape I just created so that I can quickly correct a mistake without manually deleting it.

2. **As a stylist**, I want to undo multiple color changes I experimented with so that I can return to my original palette.

3. **As a creative director**, I want to redo an action I accidentally undid so that I don't have to recreate work.

4. **As a model**, I want to undo a bulk delete operation so that I can recover objects I removed by mistake.

## Functional Requirements

### FR1: Undo Functionality (Ctrl+Z / Cmd+Z)
When user presses Ctrl+Z (Cmd+Z on Mac):
- Reverse the most recent action in the user's history stack
- Restore object state to before the action was performed
- Move action to redo stack
- Update canvas to reflect undone state
- Sync undo operation to other users (they see the object state change)

### FR2: Redo Functionality (Ctrl+Y / Cmd+Shift+Z)
When user presses Ctrl+Y (Cmd+Shift+Z on Mac):
- Reapply the most recently undone action
- Move action from redo stack back to undo stack
- Update canvas to reflect redone state
- Sync redo operation to other users

### FR3: Supported Actions
Track and support undo/redo for these operations:
- **Create object** - Undo removes object, redo recreates it
- **Delete object** - Undo restores object, redo deletes it again
- **Update object properties** - Undo reverts to previous property values
- **Move object** - Undo restores previous position
- **Transform object** - Undo reverts rotation, scale, dimensions
- **Duplicate object** - Undo removes duplicate, redo recreates it
- **Paste object** - Undo removes pasted object, redo pastes again
- **Toggle visibility** - Undo reverts visibility state

### FR4: History Stack Management
- Maintain separate undo and redo stacks per user
- Undo stack: Store last 50 actions (FIFO - oldest actions drop off)
- Redo stack: Cleared when new action is performed
- Action structure: Store action type, object ID, before/after state
- Store in local state (not Firestore) - session-based history

### FR5: Multi-Step Undo
Users can undo multiple actions sequentially:
- Each Ctrl+Z press undoes one action
- History stack allows undoing up to 50 actions back
- Redo stack allows redoing all undone actions (until new action is performed)

### FR6: Undo/Redo Feedback
When undo/redo is performed:
- Object state changes immediately (optimistic update)
- No toast/notification required (action is self-evident)
- Optional: Status bar shows "Undid [action type]" briefly (future enhancement)

### FR7: Collaborative Undo Behavior
- Each user has their own undo/redo history stack
- User A's undo does not affect User B's ability to undo their own actions
- When User A undos an object change, User B sees the object state change in real-time (via existing sync)
- Conflicts handled via last-write-wins (existing conflict resolution strategy)

### FR8: History Limitations
- History clears on page refresh (session-based)
- Undo/redo only applies to current user's actions, not other users' actions
- Maximum 50 actions in undo stack (configurable constant)

## Non-Goals (Out of Scope)

- Persistent undo/redo history across page refreshes (would require complex Firestore tracking)
- Undo/redo for other users' actions (only undo your own actions)
- Branching history (tree structure for alternate timelines)
- Undo/redo UI buttons (toolbar buttons) - keyboard shortcuts only for MVP
- Collaborative undo (reverting another user's action)
- Undo/redo for canvas pan/zoom or view state changes

## Design Considerations

### UI/UX
- **Keyboard Shortcuts Only**: No UI buttons required for MVP (can add toolbar buttons later)
- **Feedback**: Visual feedback is the object state change itself
- **Disabled State**: If undo stack is empty, Ctrl+Z does nothing (silent)
- **Clear Redo on New Action**: Standard undo/redo behavior (new action clears redo stack)

### Action Granularity
- **Move/Transform During Drag**: Treat entire drag operation as one action (not every frame)
- **Property Changes**: Each property change is one action (e.g., color change)
- **Batch Operations**: Deleting multiple selected objects = one action (delete all selected)

### History Stack Structure
Each history entry contains:
```typescript
interface HistoryAction {
  type: 'create' | 'delete' | 'update' | 'move' | 'transform' | 'duplicate' | 'paste' | 'visibility';
  objectId: string;
  beforeState: Partial<CanvasObject> | null; // null for create
  afterState: Partial<CanvasObject> | null; // null for delete
  timestamp: number;
}
```

## Technical Considerations

### State Management (Zustand)
Create new store: `historyStore.ts`
- `undoStack: HistoryAction[]`
- `redoStack: HistoryAction[]`
- `pushAction(action: HistoryAction)` - Add action to undo stack, clear redo stack
- `undo()` - Pop from undo stack, apply reverse action, push to redo stack
- `redo()` - Pop from redo stack, apply action, push to undo stack
- `canUndo()` - Check if undo stack is not empty
- `canRedo()` - Check if redo stack is not empty

### Integration with objectsService
Modify all object mutation functions to push actions to history stack:
- `createObject` - Push create action
- `updateObject` - Push update action with before/after state
- `deleteObject` - Push delete action
- `duplicateObject` - Push duplicate action

### Keyboard Event Handling
- Listen for Ctrl+Z, Ctrl+Y (Cmd+Z, Cmd+Shift+Z on Mac)
- Prevent default browser behavior (browser back, etc.)
- Only trigger when canvas is focused (not when typing in AI chat or inputs)

### Real-Time Sync
- Undo/redo operations use existing object sync mechanism
- When user undos a create action, delete the object (syncs via `deleteObject`)
- When user undos a delete action, recreate the object (syncs via `createObject`)
- Other users see the state change via existing RTDB sync, not as "undo" action

### Performance
- History stack limited to 50 actions (memory management)
- Store only changed properties in before/after state (not entire object)
- Use shallow cloning for state snapshots

### Edge Cases
- **Undo create then redo**: Recreate object with same ID (important for consistency)
- **Undo delete**: Restore object with exact same state (including ID, timestamps)
- **Conflict during undo**: Last-write-wins applies (existing strategy)
- **Other user deletes object user is about to undo**: Undo fails silently (object no longer exists)

## Success Metrics

1. **Functionality**: Undo/redo correctly reverses and restores all supported actions
2. **Performance**: Undo/redo executes in <50ms
3. **Sync**: Undone/redone state syncs to all users within 100ms
4. **UX**: Users can confidently experiment knowing they can undo mistakes
5. **Reliability**: History stack correctly maintains action order and state

## Open Questions

- Should we show undo/redo buttons in toolbar for discoverability? **Recommended: No for MVP, add later if needed**
- Should we show "Undid [action]" notification? **Recommended: No, visual feedback sufficient**
- How to handle undo when object was modified by another user after original action? **Recommended: Last-write-wins, potential conflict is acceptable**

## Implementation Notes

### Recommended Approach
1. Create `historyStore.ts` with undo/redo stacks and actions
2. Create middleware/wrapper for objectsService functions to capture actions
3. Implement undo/redo logic that calls objectsService to reverse actions
4. Add keyboard event listeners in Canvas component
5. Test each action type (create, delete, update, etc.)

### Action Capture Pattern
For each objectsService function, capture before/after state:
```typescript
// Example: updateObject with history
export async function updateObject(canvasId, objectId, updates) {
  const beforeState = await getObject(canvasId, objectId);
  
  // Perform update
  await actualUpdateObject(canvasId, objectId, updates);
  
  // Push to history
  historyStore.getState().pushAction({
    type: 'update',
    objectId,
    beforeState,
    afterState: { ...beforeState, ...updates },
    timestamp: Date.now(),
  });
}
```

### Files to Create/Modify
- Create: `src/features/objects/lib/historyStore.ts`
- Create: `src/features/objects/hooks/useHistory.ts` (keyboard shortcuts)
- Modify: `src/features/objects/services/objectsService.ts` (add history capture)
- Modify: `src/features/canvas/components/Canvas.tsx` (add keyboard listeners)

### Testing Checklist
- Undo create removes object
- Redo create restores object
- Undo delete restores object
- Undo update reverts property changes
- Undo move restores previous position
- Multiple undo/redo operations work sequentially
- New action clears redo stack
- History stack respects 50-action limit
- Keyboard shortcuts work (Ctrl+Z, Ctrl+Y, Cmd+Z, Cmd+Shift+Z)
- Undo/redo syncs to other users correctly
- Edge case: Undo when object no longer exists (fails gracefully)

