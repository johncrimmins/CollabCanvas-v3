/**
 * Integration test for multi-object selection workflow
 * Tests selection state management and bulk operations
 */

import { describe, test, expect, beforeEach } from 'vitest';
import { useObjectsStore } from '../lib/objectsStore';
import { CanvasObject } from '../types';

describe('Multi-Object Selection Workflow', () => {
  const mockObjects: CanvasObject[] = [
    {
      id: 'obj1',
      type: 'rectangle',
      position: { x: 100, y: 100 },
      width: 100,
      height: 100,
      rotation: 0,
      fill: '#FF0000',
      createdBy: 'user1',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: 'obj2',
      type: 'circle',
      position: { x: 200, y: 200 },
      width: 100,
      height: 100,
      radius: 50,
      rotation: 0,
      fill: '#0000FF',
      createdBy: 'user1',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: 'obj3',
      type: 'text',
      position: { x: 300, y: 300 },
      width: 200,
      height: 40,
      rotation: 0,
      fill: '#000000',
      text: 'Test',
      fontSize: 24,
      createdBy: 'user1',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  ];

  beforeEach(() => {
    useObjectsStore.setState({
      objects: {},
      selectedObjectIds: [],
      copiedObject: null,
      lastPastedPosition: null,
    });

    // Add mock objects to store
    mockObjects.forEach(obj => {
      useObjectsStore.getState().addObject(obj);
    });
  });

  describe('Single Selection', () => {
    test('setSelection should replace selection with single object', () => {
      const { setSelection } = useObjectsStore.getState();
      
      setSelection(['obj1']);
      expect(useObjectsStore.getState().selectedObjectIds).toEqual(['obj1']);
      
      setSelection(['obj2']);
      expect(useObjectsStore.getState().selectedObjectIds).toEqual(['obj2']);
    });

    test('single selectObject should add to empty selection', () => {
      const { selectObject } = useObjectsStore.getState();
      
      selectObject('obj1');
      expect(useObjectsStore.getState().selectedObjectIds).toEqual(['obj1']);
    });
  });

  describe('Multi-Selection with Ctrl+Click', () => {
    test('selectObject should add multiple objects to selection', () => {
      const { selectObject } = useObjectsStore.getState();
      
      selectObject('obj1');
      selectObject('obj2');
      selectObject('obj3');
      
      expect(useObjectsStore.getState().selectedObjectIds).toEqual(['obj1', 'obj2', 'obj3']);
    });

    test('toggleObjectSelection should add if not selected', () => {
      const { toggleObjectSelection } = useObjectsStore.getState();
      
      toggleObjectSelection('obj1');
      toggleObjectSelection('obj2');
      
      expect(useObjectsStore.getState().selectedObjectIds).toEqual(['obj1', 'obj2']);
    });

    test('toggleObjectSelection should remove if already selected', () => {
      useObjectsStore.setState({ selectedObjectIds: ['obj1', 'obj2', 'obj3'] });
      
      const { toggleObjectSelection } = useObjectsStore.getState();
      
      toggleObjectSelection('obj2');
      
      expect(useObjectsStore.getState().selectedObjectIds).toEqual(['obj1', 'obj3']);
    });

    test('should not add duplicate object IDs to selection', () => {
      const { selectObject } = useObjectsStore.getState();
      
      selectObject('obj1');
      selectObject('obj1');
      selectObject('obj1');
      
      expect(useObjectsStore.getState().selectedObjectIds).toEqual(['obj1']);
    });
  });

  describe('Bulk Operations', () => {
    test('should support removing multiple objects from selection', () => {
      useObjectsStore.setState({ selectedObjectIds: ['obj1', 'obj2', 'obj3'] });
      
      const { removeObject } = useObjectsStore.getState();
      
      // Remove obj2 - should also remove from selection
      removeObject('obj2');
      
      const { selectedObjectIds, objects } = useObjectsStore.getState();
      expect(selectedObjectIds).toEqual(['obj1', 'obj3']);
      expect(objects['obj2']).toBeUndefined();
    });

    test('clearSelection should deselect all objects', () => {
      useObjectsStore.setState({ selectedObjectIds: ['obj1', 'obj2', 'obj3'] });
      
      const { clearSelection } = useObjectsStore.getState();
      clearSelection();
      
      expect(useObjectsStore.getState().selectedObjectIds).toEqual([]);
    });
  });

  describe('Selection Queries', () => {
    test('isObjectSelected should work correctly with multiple selections', () => {
      useObjectsStore.setState({ selectedObjectIds: ['obj1', 'obj3'] });
      
      const { isObjectSelected } = useObjectsStore.getState();
      
      expect(isObjectSelected('obj1')).toBe(true);
      expect(isObjectSelected('obj2')).toBe(false);
      expect(isObjectSelected('obj3')).toBe(true);
    });

    test('getSelectedCount should return correct count', () => {
      useObjectsStore.setState({ selectedObjectIds: ['obj1', 'obj2', 'obj3'] });
      
      const { getSelectedCount } = useObjectsStore.getState();
      expect(getSelectedCount()).toBe(3);
      
      useObjectsStore.setState({ selectedObjectIds: [] });
      expect(getSelectedCount()).toBe(0);
    });

    test('getSelectedObject should return first selected for backward compatibility', () => {
      useObjectsStore.setState({ selectedObjectIds: ['obj2', 'obj3', 'obj1'] });
      
      const { getSelectedObject } = useObjectsStore.getState();
      expect(getSelectedObject()).toBe('obj2'); // First in array
    });
  });

  describe('Selection Edge Cases', () => {
    test('should handle selection when object is deleted', () => {
      useObjectsStore.setState({ selectedObjectIds: ['obj1', 'obj2'] });
      
      const { removeObject } = useObjectsStore.getState();
      removeObject('obj1');
      
      expect(useObjectsStore.getState().selectedObjectIds).toEqual(['obj2']);
    });

    test('should handle empty selection state', () => {
      const { isObjectSelected, getSelectedCount, getSelectedObject } = useObjectsStore.getState();
      
      expect(isObjectSelected('obj1')).toBe(false);
      expect(getSelectedCount()).toBe(0);
      expect(getSelectedObject()).toBeNull();
    });

    test('deselectObject on non-selected object should not error', () => {
      useObjectsStore.setState({ selectedObjectIds: ['obj1'] });
      
      const { deselectObject } = useObjectsStore.getState();
      
      expect(() => deselectObject('obj2')).not.toThrow();
      expect(useObjectsStore.getState().selectedObjectIds).toEqual(['obj1']);
    });
  });
});

