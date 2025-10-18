// History hook - manages undo/redo with keyboard shortcuts
'use client';

import { useCallback } from 'react';
import { useHistoryStore, HistoryAction } from '../lib/historyStore';
import { CanvasObject } from '../types';

interface UseHistoryProps {
  canvasId: string | null;
  createObject: (params: any) => Promise<CanvasObject | undefined>;
  updateObject: (objectId: string, updates: Partial<CanvasObject>) => void;
  deleteObject: (objectId: string) => Promise<void>;
}

export function useHistory({ canvasId, createObject, updateObject, deleteObject }: UseHistoryProps) {
  const pushAction = useHistoryStore((state) => state.pushAction);
  const undoFromStack = useHistoryStore((state) => state.undo);
  const redoFromStack = useHistoryStore((state) => state.redo);
  const canUndo = useHistoryStore((state) => state.canUndo);
  const canRedo = useHistoryStore((state) => state.canRedo);

  // Execute undo operation
  const undo = useCallback(async () => {
    if (!canUndo() || !canvasId) return;

    const action = undoFromStack();
    if (!action) return;

    console.log('[History] Undoing action:', action.type, action.objectId);

    try {
      switch (action.type) {
        case 'create':
        case 'duplicate':
        case 'paste':
          // Undo create: delete the object
          await deleteObject(action.objectId);
          break;

        case 'delete':
          // Undo delete: recreate the object with original state
          if (action.beforeState) {
            await createObject({
              ...action.beforeState,
              id: action.objectId, // Preserve original ID
            });
          }
          break;

        case 'update':
        case 'move':
        case 'transform':
        case 'visibility':
          // Undo update: restore before state
          if (action.beforeState) {
            updateObject(action.objectId, action.beforeState);
          }
          break;
      }
    } catch (error) {
      console.error('[History] Failed to undo action:', error);
      // If undo fails, remove from redo stack to maintain consistency
    }
  }, [canUndo, canvasId, undoFromStack, createObject, updateObject, deleteObject]);

  // Execute redo operation
  const redo = useCallback(async () => {
    if (!canRedo() || !canvasId) return;

    const action = redoFromStack();
    if (!action) return;

    console.log('[History] Redoing action:', action.type, action.objectId);

    try {
      switch (action.type) {
        case 'create':
        case 'duplicate':
        case 'paste':
          // Redo create: recreate the object with after state
          if (action.afterState) {
            await createObject({
              ...action.afterState,
              id: action.objectId, // Preserve original ID
            });
          }
          break;

        case 'delete':
          // Redo delete: delete the object again
          await deleteObject(action.objectId);
          break;

        case 'update':
        case 'move':
        case 'transform':
        case 'visibility':
          // Redo update: apply after state
          if (action.afterState) {
            updateObject(action.objectId, action.afterState);
          }
          break;
      }
    } catch (error) {
      console.error('[History] Failed to redo action:', error);
    }
  }, [canRedo, canvasId, redoFromStack, createObject, updateObject, deleteObject]);

  return {
    pushAction,
    undo,
    redo,
    canUndo: canUndo(),
    canRedo: canRedo(),
  };
}

