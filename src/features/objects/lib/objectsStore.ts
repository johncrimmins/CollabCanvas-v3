// Objects feature Zustand store
import { create } from 'zustand';
import { CanvasObject } from '../types';

interface ObjectsState {
  objects: Record<string, CanvasObject>;
  setObjects: (objects: Record<string, CanvasObject>) => void;
  addObject: (object: CanvasObject) => void;
  updateObject: (objectId: string, updates: Partial<CanvasObject>) => void;
  removeObject: (objectId: string) => void;
}

export const useObjectsStore = create<ObjectsState>((set) => ({
  objects: {},
  setObjects: (objects) => set({ objects }),
  addObject: (object) =>
    set((state) => ({
      objects: { ...state.objects, [object.id]: object },
    })),
  updateObject: (objectId, updates) =>
    set((state) => ({
      objects: {
        ...state.objects,
        [objectId]: {
          ...state.objects[objectId],
          ...updates,
        },
      },
    })),
  removeObject: (objectId) =>
    set((state) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [objectId]: _, ...rest } = state.objects;
      return { objects: rest };
    }),
}));

