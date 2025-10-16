// Presence feature Zustand store
import { create } from 'zustand';
import { Cursor, PresenceUser } from '../types';

interface PresenceState {
  cursors: Record<string, Cursor>;
  setCursors: (cursors: Record<string, Cursor>) => void;
  updateCursor: (userId: string, cursor: Cursor) => void;
  removeCursor: (userId: string) => void;
  
  presence: Record<string, PresenceUser>;
  setPresence: (presence: Record<string, PresenceUser>) => void;
  updatePresence: (userId: string, user: PresenceUser) => void;
  removePresence: (userId: string) => void;
}

export const usePresenceStore = create<PresenceState>((set) => ({
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
}));

