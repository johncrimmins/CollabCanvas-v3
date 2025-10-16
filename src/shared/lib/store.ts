// Zustand global state store
import { create } from 'zustand';
import { CanvasObject, User, Cursor, PresenceUser } from '@/shared/types';

interface CanvasState {
  // Auth
  user: User | null;
  setUser: (user: User | null) => void;
  
  // Presence
  cursors: Record<string, Cursor>;
  setCursors: (cursors: Record<string, Cursor>) => void;
  updateCursor: (userId: string, cursor: Cursor) => void;
  removeCursor: (userId: string) => void;
  
  presence: Record<string, PresenceUser>;
  setPresence: (presence: Record<string, PresenceUser>) => void;
  updatePresence: (userId: string, user: PresenceUser) => void;
  removePresence: (userId: string) => void;
  
  // Canvas viewport
  viewport: {
    x: number;
    y: number;
    scale: number;
  };
  setViewport: (viewport: { x: number; y: number; scale: number }) => void;
  
  // Objects
  objects: Record<string, CanvasObject>;
  setObjects: (objects: Record<string, CanvasObject>) => void;
  addObject: (object: CanvasObject) => void;
  updateObject: (objectId: string, updates: Partial<CanvasObject>) => void;
  removeObject: (objectId: string) => void;
}

export const useStore = create<CanvasState>((set) => ({
  // Auth
  user: null,
  setUser: (user) => set({ user }),
  
  // Presence
  cursors: {},
  setCursors: (cursors) => set({ cursors }),
  updateCursor: (userId, cursor) =>
    set((state) => ({
      cursors: { ...state.cursors, [userId]: cursor },
    })),
  removeCursor: (userId) =>
    set((state) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [userId]: _, ...rest } = state.cursors;
      return { cursors: rest };
    }),
  
  presence: {},
  setPresence: (presence) => set({ presence }),
  updatePresence: (userId, user) =>
    set((state) => ({
      presence: { ...state.presence, [userId]: user },
    })),
  removePresence: (userId) =>
    set((state) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [userId]: _, ...rest } = state.presence;
      return { presence: rest };
    }),
  
  // Canvas viewport
  viewport: {
    x: 0,
    y: 0,
    scale: 1,
  },
  setViewport: (viewport) => set({ viewport }),
  
  // Objects
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

