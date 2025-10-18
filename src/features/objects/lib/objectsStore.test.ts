import { describe, test, expect, beforeEach } from 'vitest';
import { useObjectsStore } from './objectsStore';
import { CanvasObject } from '../types';

describe('objectsStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useObjectsStore.setState({
      objects: {},
      selectedObjectIds: [],
      copiedObject: null,
      lastPastedPosition: null,
    });
  });

  describe('Multi-Object Selection', () => {
    test('selectObject should add object to selectedObjectIds array', () => {
      const { selectObject, selectedObjectIds } = useObjectsStore.getState();
      
      selectObject('obj1');
      expect(useObjectsStore.getState().selectedObjectIds).toEqual(['obj1']);
      
      selectObject('obj2');
      expect(useObjectsStore.getState().selectedObjectIds).toEqual(['obj1', 'obj2']);
    });

    test('deselectObject should remove object from selectedObjectIds', () => {
      useObjectsStore.setState({ selectedObjectIds: ['obj1', 'obj2', 'obj3'] });
      
      const { deselectObject } = useObjectsStore.getState();
      deselectObject('obj2');
      
      expect(useObjectsStore.getState().selectedObjectIds).toEqual(['obj1', 'obj3']);
    });

    test('toggleObjectSelection should add if not selected, remove if selected', () => {
      const { toggleObjectSelection } = useObjectsStore.getState();
      
      // Add obj1
      toggleObjectSelection('obj1');
      expect(useObjectsStore.getState().selectedObjectIds).toEqual(['obj1']);
      
      // Add obj2
      toggleObjectSelection('obj2');
      expect(useObjectsStore.getState().selectedObjectIds).toEqual(['obj1', 'obj2']);
      
      // Remove obj1 (toggle off)
      toggleObjectSelection('obj1');
      expect(useObjectsStore.getState().selectedObjectIds).toEqual(['obj2']);
    });

    test('clearSelection should empty selectedObjectIds array', () => {
      useObjectsStore.setState({ selectedObjectIds: ['obj1', 'obj2'] });
      
      const { clearSelection } = useObjectsStore.getState();
      clearSelection();
      
      expect(useObjectsStore.getState().selectedObjectIds).toEqual([]);
    });

    test('isObjectSelected should return true if object is in selection', () => {
      useObjectsStore.setState({ selectedObjectIds: ['obj1', 'obj3'] });
      
      const { isObjectSelected } = useObjectsStore.getState();
      
      expect(isObjectSelected('obj1')).toBe(true);
      expect(isObjectSelected('obj2')).toBe(false);
      expect(isObjectSelected('obj3')).toBe(true);
    });

    test('getSelectedCount should return number of selected objects', () => {
      useObjectsStore.setState({ selectedObjectIds: ['obj1', 'obj2', 'obj3'] });
      
      const { getSelectedCount } = useObjectsStore.getState();
      expect(getSelectedCount()).toBe(3);
    });

    test('getSelectedObject should return first selected object for backward compatibility', () => {
      useObjectsStore.setState({ selectedObjectIds: ['obj1', 'obj2'] });
      
      const { getSelectedObject } = useObjectsStore.getState();
      expect(getSelectedObject()).toBe('obj1');
      
      useObjectsStore.setState({ selectedObjectIds: [] });
      expect(getSelectedObject()).toBe(null);
    });
  });

  describe('Clipboard Management', () => {
    const mockObject: CanvasObject = {
      id: 'test-obj',
      type: 'rectangle',
      position: { x: 100, y: 100 },
      width: 150,
      height: 100,
      rotation: 45,
      fill: '#FF0000',
      createdBy: 'user1',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    test('copyObject should store object properties in copiedObject', () => {
      const { copyObject } = useObjectsStore.getState();
      
      copyObject(mockObject);
      
      const { copiedObject } = useObjectsStore.getState();
      expect(copiedObject).not.toBeNull();
      expect(copiedObject?.type).toBe('rectangle');
      expect(copiedObject?.width).toBe(150);
      expect(copiedObject?.height).toBe(100);
      expect(copiedObject?.rotation).toBe(45);
      expect(copiedObject?.fill).toBe('#FF0000');
      expect(copiedObject?.originalPosition).toEqual({ x: 100, y: 100 });
    });

    test('copyObject should reset lastPastedPosition', () => {
      useObjectsStore.setState({ lastPastedPosition: { x: 200, y: 200 } });
      
      const { copyObject } = useObjectsStore.getState();
      copyObject(mockObject);
      
      expect(useObjectsStore.getState().lastPastedPosition).toBeNull();
    });

    test('clearClipboard should clear copiedObject and lastPastedPosition', () => {
      const { copyObject, clearClipboard } = useObjectsStore.getState();
      
      copyObject(mockObject);
      useObjectsStore.setState({ lastPastedPosition: { x: 120, y: 120 } });
      
      clearClipboard();
      
      const state = useObjectsStore.getState();
      expect(state.copiedObject).toBeNull();
      expect(state.lastPastedPosition).toBeNull();
    });

    test('setLastPastedPosition should update lastPastedPosition', () => {
      const { setLastPastedPosition } = useObjectsStore.getState();
      
      setLastPastedPosition({ x: 150, y: 150 });
      expect(useObjectsStore.getState().lastPastedPosition).toEqual({ x: 150, y: 150 });
      
      setLastPastedPosition(null);
      expect(useObjectsStore.getState().lastPastedPosition).toBeNull();
    });
  });

  describe('Object Management', () => {
    const mockObject: CanvasObject = {
      id: 'obj1',
      type: 'circle',
      position: { x: 50, y: 50 },
      width: 100,
      height: 100,
      radius: 50,
      rotation: 0,
      fill: '#0000FF',
      createdBy: 'user1',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    test('addObject should add object to objects map', () => {
      const { addObject } = useObjectsStore.getState();
      
      addObject(mockObject);
      
      const { objects } = useObjectsStore.getState();
      expect(objects['obj1']).toEqual(mockObject);
    });

    test('updateObject should merge updates into existing object', () => {
      useObjectsStore.setState({ objects: { obj1: mockObject } });
      
      const { updateObject } = useObjectsStore.getState();
      updateObject('obj1', { fill: '#00FF00', rotation: 90 });
      
      const { objects } = useObjectsStore.getState();
      expect(objects['obj1'].fill).toBe('#00FF00');
      expect(objects['obj1'].rotation).toBe(90);
      expect(objects['obj1'].radius).toBe(50); // Other properties unchanged
    });

    test('removeObject should delete object from map', () => {
      useObjectsStore.setState({ objects: { obj1: mockObject, obj2: { ...mockObject, id: 'obj2' } } });
      
      const { removeObject } = useObjectsStore.getState();
      removeObject('obj1');
      
      const { objects } = useObjectsStore.getState();
      expect(objects['obj1']).toBeUndefined();
      expect(objects['obj2']).toBeDefined();
    });

    test('removeObject should also remove from selection', () => {
      useObjectsStore.setState({
        objects: { obj1: mockObject, obj2: { ...mockObject, id: 'obj2' } },
        selectedObjectIds: ['obj1', 'obj2'],
      });
      
      const { removeObject } = useObjectsStore.getState();
      removeObject('obj1');
      
      expect(useObjectsStore.getState().selectedObjectIds).toEqual(['obj2']);
    });
  });
});

