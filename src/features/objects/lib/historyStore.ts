// History store for undo/redo functionality
import { create } from 'zustand';
import { CanvasObject } from '../types';

export interface HistoryAction {
  type: 'create' | 'delete' | 'update' | 'move' | 'transform' | 'duplicate' | 'paste' | 'visibility';
  objectId: string;
  beforeState: Partial<CanvasObject> | null; // null for create
  afterState: Partial<CanvasObject> | null; // null for delete
  timestamp: number;
}

interface HistoryState {
  undoStack: HistoryAction[];
  redoStack: HistoryAction[];
  maxStackSize: number;
  pushAction: (action: HistoryAction) => void;
  undo: () => HistoryAction | null;
  redo: () => HistoryAction | null;
  canUndo: () => boolean;
  canRedo: () => boolean;
  clear: () => void;
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  undoStack: [],
  redoStack: [],
  maxStackSize: 50,

  pushAction: (action) => {
    set((state) => {
      const newUndoStack = [...state.undoStack, action];
      
      // Limit stack size (FIFO - remove oldest)
      if (newUndoStack.length > state.maxStackSize) {
        newUndoStack.shift();
      }

      return {
        undoStack: newUndoStack,
        redoStack: [], // Clear redo stack when new action is performed
      };
    });
  },

  undo: () => {
    const state = get();
    if (state.undoStack.length === 0) return null;

    const action = state.undoStack[state.undoStack.length - 1];
    
    set({
      undoStack: state.undoStack.slice(0, -1),
      redoStack: [...state.redoStack, action],
    });

    return action;
  },

  redo: () => {
    const state = get();
    if (state.redoStack.length === 0) return null;

    const action = state.redoStack[state.redoStack.length - 1];
    
    set({
      redoStack: state.redoStack.slice(0, -1),
      undoStack: [...state.undoStack, action],
    });

    return action;
  },

  canUndo: () => get().undoStack.length > 0,
  canRedo: () => get().redoStack.length > 0,
  
  clear: () => set({ undoStack: [], redoStack: [] }),
}));

