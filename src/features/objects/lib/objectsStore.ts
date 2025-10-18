// Objects feature Zustand store
import { create } from 'zustand';
import { CanvasObject } from '../types';

interface CopiedObject {
  type: CanvasObject['type'];
  width?: number;
  height?: number;
  rotation?: number;
  fill?: string;
  text?: string;
  fontSize?: number;
  radius?: number;
  points?: [number, number, number, number];
  stroke?: string;
  strokeWidth?: number;
  pointerLength?: number;
  pointerWidth?: number;
  originalPosition: { x: number; y: number };
}

interface ObjectsState {
  objects: Record<string, CanvasObject>;
  selectedObjectIds: string[];
  copiedObject: CopiedObject | null;
  lastPastedPosition: { x: number; y: number } | null;
  setObjects: (objects: Record<string, CanvasObject>) => void;
  addObject: (object: CanvasObject) => void;
  updateObject: (objectId: string, updates: Partial<CanvasObject>) => void;
  removeObject: (objectId: string) => void;
  // Selection management
  selectObject: (objectId: string) => void;
  deselectObject: (objectId: string) => void;
  toggleObjectSelection: (objectId: string) => void;
  clearSelection: () => void;
  setSelection: (objectIds: string[]) => void;
  isObjectSelected: (objectId: string) => boolean;
  getSelectedCount: () => number;
  getSelectedObject: () => string | null; // Backward compatibility - returns first selected
  // Clipboard
  copyObject: (object: CanvasObject) => void;
  clearClipboard: () => void;
  setLastPastedPosition: (position: { x: number; y: number } | null) => void;
}

export const useObjectsStore = create<ObjectsState>((set, get) => ({
  objects: {},
  selectedObjectIds: [],
  copiedObject: null,
  lastPastedPosition: null,
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
      // Also remove from selection if it was selected
      const selectedObjectIds = state.selectedObjectIds.filter(id => id !== objectId);
      return { objects: rest, selectedObjectIds };
    }),
  // Selection management
  selectObject: (objectId) =>
    set((state) => {
      if (!state.selectedObjectIds.includes(objectId)) {
        return { selectedObjectIds: [...state.selectedObjectIds, objectId] };
      }
      return state;
    }),
  deselectObject: (objectId) =>
    set((state) => ({
      selectedObjectIds: state.selectedObjectIds.filter(id => id !== objectId),
    })),
  toggleObjectSelection: (objectId) =>
    set((state) => {
      if (state.selectedObjectIds.includes(objectId)) {
        return { selectedObjectIds: state.selectedObjectIds.filter(id => id !== objectId) };
      } else {
        return { selectedObjectIds: [...state.selectedObjectIds, objectId] };
      }
    }),
  clearSelection: () => set({ selectedObjectIds: [] }),
  setSelection: (objectIds) => set({ selectedObjectIds: objectIds }),
  isObjectSelected: (objectId) => get().selectedObjectIds.includes(objectId),
  getSelectedCount: () => get().selectedObjectIds.length,
  getSelectedObject: () => {
    const ids = get().selectedObjectIds;
    return ids.length > 0 ? ids[0] : null;
  },
  // Clipboard
  copyObject: (object) =>
    set({
      copiedObject: {
        type: object.type,
        width: object.width,
        height: object.height,
        rotation: object.rotation,
        fill: object.fill,
        text: object.text,
        fontSize: object.fontSize,
        radius: object.radius,
        points: object.points,
        stroke: object.stroke,
        strokeWidth: object.strokeWidth,
        pointerLength: object.pointerLength,
        pointerWidth: object.pointerWidth,
        originalPosition: object.position,
      },
      lastPastedPosition: null, // Reset last pasted position on new copy
    }),
  clearClipboard: () => set({ copiedObject: null, lastPastedPosition: null }),
  setLastPastedPosition: (position) => set({ lastPastedPosition: position }),
}));

// Selectors
export const getVisibleObjects = (state: ObjectsState) => 
  Object.values(state.objects).filter(obj => obj.visible !== false);

export const isObjectVisible = (state: ObjectsState, objectId: string) => 
  state.objects[objectId]?.visible !== false;

