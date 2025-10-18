/**
 * Integration test for undo/redo workflow
 * Tests history stack management and action reversal
 */

import { describe, test, expect, beforeEach } from 'vitest';
import { useHistoryStore, HistoryAction } from '../lib/historyStore';
import { CanvasObject } from '../types';

describe('Undo/Redo Workflow', () => {
  beforeEach(() => {
    useHistoryStore.getState().clear();
  });

  describe('Create Action Undo/Redo', () => {
    test('undo create should remove action from undo stack', () => {
      const createAction: HistoryAction = {
        type: 'create',
        objectId: 'obj1',
        beforeState: null,
        afterState: {
          type: 'rectangle',
          position: { x: 100, y: 100 },
          width: 100,
          height: 100,
        },
        timestamp: Date.now(),
      };

      const { pushAction, undo, canUndo } = useHistoryStore.getState();
      
      pushAction(createAction);
      expect(canUndo()).toBe(true);
      
      const undoneAction = undo();
      
      expect(undoneAction).toEqual(createAction);
      expect(useHistoryStore.getState().undoStack).toHaveLength(0);
      expect(useHistoryStore.getState().redoStack).toHaveLength(1);
    });

    test('redo create should restore action to undo stack', () => {
      const createAction: HistoryAction = {
        type: 'create',
        objectId: 'obj1',
        beforeState: null,
        afterState: {
          type: 'rectangle',
          position: { x: 100, y: 100 },
        },
        timestamp: Date.now(),
      };

      const { pushAction, undo, redo, canRedo } = useHistoryStore.getState();
      
      pushAction(createAction);
      undo();
      
      expect(canRedo()).toBe(true);
      
      const redoneAction = redo();
      
      expect(redoneAction).toEqual(createAction);
      expect(useHistoryStore.getState().undoStack).toHaveLength(1);
      expect(useHistoryStore.getState().redoStack).toHaveLength(0);
    });
  });

  describe('Update Action Undo/Redo', () => {
    test('undo update should capture before and after states', () => {
      const updateAction: HistoryAction = {
        type: 'update',
        objectId: 'obj1',
        beforeState: {
          fill: '#FF0000',
          width: 100,
          height: 100,
        },
        afterState: {
          fill: '#0000FF',
          width: 150,
          height: 120,
        },
        timestamp: Date.now(),
      };

      const { pushAction, undo } = useHistoryStore.getState();
      
      pushAction(updateAction);
      const undoneAction = undo();
      
      expect(undoneAction?.beforeState).toEqual({
        fill: '#FF0000',
        width: 100,
        height: 100,
      });
    });
  });

  describe('Delete Action Undo/Redo', () => {
    test('undo delete should preserve full object state', () => {
      const fullObject: Partial<CanvasObject> = {
        id: 'obj1',
        type: 'circle',
        position: { x: 200, y: 200 },
        width: 100,
        height: 100,
        radius: 50,
        rotation: 30,
        fill: '#00FF00',
      };

      const deleteAction: HistoryAction = {
        type: 'delete',
        objectId: 'obj1',
        beforeState: fullObject,
        afterState: null,
        timestamp: Date.now(),
      };

      const { pushAction, undo } = useHistoryStore.getState();
      
      pushAction(deleteAction);
      const undoneAction = undo();
      
      expect(undoneAction?.beforeState).toEqual(fullObject);
      expect(undoneAction?.afterState).toBeNull();
    });
  });

  describe('History Stack Limits', () => {
    test('should respect 50 action limit in undo stack', () => {
      const { pushAction } = useHistoryStore.getState();

      // Push 60 actions
      for (let i = 0; i < 60; i++) {
        pushAction({
          type: 'create',
          objectId: `obj${i}`,
          beforeState: null,
          afterState: { id: `obj${i}` },
          timestamp: Date.now() + i,
        });
      }

      const { undoStack } = useHistoryStore.getState();
      
      // Should only keep last 50
      expect(undoStack).toHaveLength(50);
      
      // First action should be obj10 (obj0-obj9 removed)
      expect(undoStack[0].objectId).toBe('obj10');
      expect(undoStack[49].objectId).toBe('obj59');
    });
  });

  describe('Redo Stack Clearing', () => {
    test('new action should clear redo stack', () => {
      const { pushAction, undo } = useHistoryStore.getState();

      // Push and undo 3 actions
      for (let i = 0; i < 3; i++) {
        pushAction({
          type: 'create',
          objectId: `obj${i}`,
          beforeState: null,
          afterState: {},
          timestamp: Date.now(),
        });
      }

      undo();
      undo();
      
      // Redo stack should have 2 actions
      expect(useHistoryStore.getState().redoStack).toHaveLength(2);

      // Push new action
      pushAction({
        type: 'create',
        objectId: 'new-obj',
        beforeState: null,
        afterState: {},
        timestamp: Date.now(),
      });

      // Redo stack should be cleared
      expect(useHistoryStore.getState().redoStack).toHaveLength(0);
    });
  });

  describe('Multiple Undo/Redo Operations', () => {
    test('should handle sequential undo operations', () => {
      const { pushAction, undo } = useHistoryStore.getState();

      // Push 5 actions
      const actions = [];
      for (let i = 0; i < 5; i++) {
        const action = {
          type: 'create' as const,
          objectId: `obj${i}`,
          beforeState: null,
          afterState: {},
          timestamp: Date.now() + i,
        };
        actions.push(action);
        pushAction(action);
      }

      // Undo 3 times
      const undone1 = undo();
      const undone2 = undo();
      const undone3 = undo();

      expect(undone1?.objectId).toBe('obj4');
      expect(undone2?.objectId).toBe('obj3');
      expect(undone3?.objectId).toBe('obj2');

      expect(useHistoryStore.getState().undoStack).toHaveLength(2);
      expect(useHistoryStore.getState().redoStack).toHaveLength(3);
    });

    test('should handle sequential redo operations', () => {
      const { pushAction, undo, redo } = useHistoryStore.getState();

      // Setup: push 3 actions and undo all
      for (let i = 0; i < 3; i++) {
        pushAction({
          type: 'create',
          objectId: `obj${i}`,
          beforeState: null,
          afterState: {},
          timestamp: Date.now(),
        });
      }

      undo();
      undo();
      undo();

      // Redo twice
      const redone1 = redo();
      const redone2 = redo();

      expect(redone1?.objectId).toBe('obj2');
      expect(redone2?.objectId).toBe('obj1');

      expect(useHistoryStore.getState().undoStack).toHaveLength(2);
      expect(useHistoryStore.getState().redoStack).toHaveLength(1);
    });
  });

  describe('canUndo and canRedo', () => {
    test('canUndo should be false when stack is empty', () => {
      const { canUndo } = useHistoryStore.getState();
      expect(canUndo()).toBe(false);
    });

    test('canUndo should be true when stack has actions', () => {
      const { pushAction, canUndo } = useHistoryStore.getState();
      
      pushAction({
        type: 'create',
        objectId: 'obj1',
        beforeState: null,
        afterState: {},
        timestamp: Date.now(),
      });

      expect(canUndo()).toBe(true);
    });

    test('canRedo should be false when stack is empty', () => {
      const { canRedo } = useHistoryStore.getState();
      expect(canRedo()).toBe(false);
    });

    test('canRedo should be true after undo', () => {
      const { pushAction, undo, canRedo } = useHistoryStore.getState();
      
      pushAction({
        type: 'create',
        objectId: 'obj1',
        beforeState: null,
        afterState: {},
        timestamp: Date.now(),
      });

      expect(canRedo()).toBe(false);
      
      undo();
      
      expect(canRedo()).toBe(true);
    });
  });
});

