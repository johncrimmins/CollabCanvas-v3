// Canvas feature Zustand store
import { create } from 'zustand';
import { Viewport } from '../types';

interface CanvasState {
  viewport: Viewport;
  setViewport: (viewport: Viewport) => void;
}

export const useCanvasStore = create<CanvasState>((set) => ({
  viewport: {
    x: 0,
    y: 0,
    scale: 1,
  },
  setViewport: (viewport) => set({ viewport }),
}));

