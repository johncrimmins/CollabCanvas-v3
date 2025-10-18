import { describe, test, expect, beforeEach } from 'vitest';
import { useHistoryStore, HistoryAction } from './historyStore';

describe('historyStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useHistoryStore.setState({
      undoStack: [],
      redoStack: [],
    });
  });

  describe('pushAction', () => {
    test('should add action to undo stack', () => {
      const action: HistoryAction = {
        type: 'create',
        objectId: 'obj1',
        beforeState: null,
        afterState: { type: 'rectangle', position: { x: 0, y: 0 } },
        timestamp: Date.now(),
      };

      const { pushAction } = useHistoryStore.getState();
      pushAction(action);

      expect(useHistoryStore.getState().undoStack).toHaveLength(1);
      expect(useHistoryStore.getState().undoStack[0]).toEqual(action);
    });

    test('should clear redo stack when new action is pushed', () => {
      useHistoryStore.setState({
        redoStack: [
          { type: 'create', objectId: 'obj1', beforeState: null, afterState: {}, timestamp: Date.now() },
        ],
      });

      const { pushAction } = useHistoryStore.getState();
      pushAction({
        type: 'delete',
        objectId: 'obj2',
        beforeState: {},
        afterState: null,
        timestamp: Date.now(),
      });

      expect(useHistoryStore.getState().redoStack).toHaveLength(0);
    });

    test('should limit undo stack to maxStackSize (50 actions)', () => {
      const { pushAction } = useHistoryStore.getState();

      // Push 60 actions
      for (let i = 0; i < 60; i++) {
        pushAction({
          type: 'create',
          objectId: `obj${i}`,
          beforeState: null,
          afterState: {},
          timestamp: Date.now(),
        });
      }

      const { undoStack } = useHistoryStore.getState();
      expect(undoStack).toHaveLength(50);
      
      // Oldest actions should be removed (obj0-obj9 should be gone)
      expect(undoStack[0].objectId).toBe('obj10');
      expect(undoStack[49].objectId).toBe('obj59');
    });
  });

  describe('undo', () => {
    test('should pop action from undo stack and add to redo stack', () => {
      const action: HistoryAction = {
        type: 'create',
        objectId: 'obj1',
        beforeState: null,
        afterState: { type: 'rectangle', position: { x: 0, y: 0 } },
        timestamp: Date.now(),
      };

      useHistoryStore.setState({ undoStack: [action] });

      const { undo } = useHistoryStore.getState();
      const undoneAction = undo();

      expect(undoneAction).toEqual(action);
      expect(useHistoryStore.getState().undoStack).toHaveLength(0);
      expect(useHistoryStore.getState().redoStack).toHaveLength(1);
      expect(useHistoryStore.getState().redoStack[0]).toEqual(action);
    });

    test('should return null if undo stack is empty', () => {
      const { undo } = useHistoryStore.getState();
      const result = undo();

      expect(result).toBeNull();
    });

    test('should handle multiple undo operations', () => {
      const actions: HistoryAction[] = [
        { type: 'create', objectId: 'obj1', beforeState: null, afterState: {}, timestamp: 1 },
        { type: 'update', objectId: 'obj1', beforeState: {}, afterState: {}, timestamp: 2 },
        { type: 'delete', objectId: 'obj1', beforeState: {}, afterState: null, timestamp: 3 },
      ];

      useHistoryStore.setState({ undoStack: actions });

      const { undo } = useHistoryStore.getState();
      
      const first = undo();
      expect(first?.objectId).toBe('obj1');
      expect(first?.type).toBe('delete');
      expect(useHistoryStore.getState().undoStack).toHaveLength(2);
      
      const second = undo();
      expect(second?.type).toBe('update');
      expect(useHistoryStore.getState().undoStack).toHaveLength(1);
      
      const third = undo();
      expect(third?.type).toBe('create');
      expect(useHistoryStore.getState().undoStack).toHaveLength(0);
    });
  });

  describe('redo', () => {
    test('should pop action from redo stack and add to undo stack', () => {
      const action: HistoryAction = {
        type: 'create',
        objectId: 'obj1',
        beforeState: null,
        afterState: { type: 'rectangle', position: { x: 0, y: 0 } },
        timestamp: Date.now(),
      };

      useHistoryStore.setState({ redoStack: [action] });

      const { redo } = useHistoryStore.getState();
      const redoneAction = redo();

      expect(redoneAction).toEqual(action);
      expect(useHistoryStore.getState().redoStack).toHaveLength(0);
      expect(useHistoryStore.getState().undoStack).toHaveLength(1);
      expect(useHistoryStore.getState().undoStack[0]).toEqual(action);
    });

    test('should return null if redo stack is empty', () => {
      const { redo } = useHistoryStore.getState();
      const result = redo();

      expect(result).toBeNull();
    });
  });

  describe('canUndo and canRedo', () => {
    test('canUndo should return true when undo stack has actions', () => {
      useHistoryStore.setState({
        undoStack: [{ type: 'create', objectId: 'obj1', beforeState: null, afterState: {}, timestamp: 1 }],
      });

      const { canUndo } = useHistoryStore.getState();
      expect(canUndo()).toBe(true);
    });

    test('canUndo should return false when undo stack is empty', () => {
      const { canUndo } = useHistoryStore.getState();
      expect(canUndo()).toBe(false);
    });

    test('canRedo should return true when redo stack has actions', () => {
      useHistoryStore.setState({
        redoStack: [{ type: 'create', objectId: 'obj1', beforeState: null, afterState: {}, timestamp: 1 }],
      });

      const { canRedo } = useHistoryStore.getState();
      expect(canRedo()).toBe(true);
    });

    test('canRedo should return false when redo stack is empty', () => {
      const { canRedo } = useHistoryStore.getState();
      expect(canRedo()).toBe(false);
    });
  });

  describe('Undo/Redo workflow', () => {
    test('should handle complete undo/redo cycle', () => {
      const { pushAction, undo, redo } = useHistoryStore.getState();

      // Push 3 actions
      pushAction({ type: 'create', objectId: 'obj1', beforeState: null, afterState: {}, timestamp: 1 });
      pushAction({ type: 'update', objectId: 'obj1', beforeState: {}, afterState: {}, timestamp: 2 });
      pushAction({ type: 'delete', objectId: 'obj1', beforeState: {}, afterState: null, timestamp: 3 });

      expect(useHistoryStore.getState().undoStack).toHaveLength(3);
      expect(useHistoryStore.getState().redoStack).toHaveLength(0);

      // Undo twice
      undo();
      undo();

      expect(useHistoryStore.getState().undoStack).toHaveLength(1);
      expect(useHistoryStore.getState().redoStack).toHaveLength(2);

      // Redo once
      redo();

      expect(useHistoryStore.getState().undoStack).toHaveLength(2);
      expect(useHistoryStore.getState().redoStack).toHaveLength(1);

      // New action should clear redo stack
      pushAction({ type: 'create', objectId: 'obj2', beforeState: null, afterState: {}, timestamp: 4 });

      expect(useHistoryStore.getState().undoStack).toHaveLength(3);
      expect(useHistoryStore.getState().redoStack).toHaveLength(0);
    });
  });

  describe('clear', () => {
    test('should clear both undo and redo stacks', () => {
      useHistoryStore.setState({
        undoStack: [{ type: 'create', objectId: 'obj1', beforeState: null, afterState: {}, timestamp: 1 }],
        redoStack: [{ type: 'delete', objectId: 'obj2', beforeState: {}, afterState: null, timestamp: 2 }],
      });

      const { clear } = useHistoryStore.getState();
      clear();

      const state = useHistoryStore.getState();
      expect(state.undoStack).toHaveLength(0);
      expect(state.redoStack).toHaveLength(0);
    });
  });
});

