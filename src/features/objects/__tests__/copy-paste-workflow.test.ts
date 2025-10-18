/**
 * Integration test for copy/paste workflow
 * Tests clipboard state management and sequential paste behavior
 */

import { describe, test, expect, beforeEach } from 'vitest';
import { useObjectsStore } from '../lib/objectsStore';
import { CanvasObject } from '../types';

describe('Copy/Paste Workflow', () => {
  const mockObject: CanvasObject = {
    id: 'obj1',
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

  beforeEach(() => {
    useObjectsStore.setState({
      objects: {},
      selectedObjectIds: [],
      copiedObject: null,
      lastPastedPosition: null,
    });
  });

  describe('Copy Operation', () => {
    test('should copy object properties to clipboard', () => {
      const { copyObject } = useObjectsStore.getState();
      
      copyObject(mockObject);
      
      const { copiedObject } = useObjectsStore.getState();
      expect(copiedObject).not.toBeNull();
      expect(copiedObject?.type).toBe('rectangle');
      expect(copiedObject?.width).toBe(150);
      expect(copiedObject?.height).toBe(100);
      expect(copiedObject?.rotation).toBe(45);
      expect(copiedObject?.fill).toBe('#FF0000');
    });

    test('should store original position for paste offset calculation', () => {
      const { copyObject } = useObjectsStore.getState();
      
      copyObject(mockObject);
      
      const { copiedObject } = useObjectsStore.getState();
      expect(copiedObject?.originalPosition).toEqual({ x: 100, y: 100 });
    });

    test('should not copy id (generates new id on paste)', () => {
      const { copyObject } = useObjectsStore.getState();
      
      copyObject(mockObject);
      
      const { copiedObject } = useObjectsStore.getState();
      expect(copiedObject).not.toHaveProperty('id');
    });

    test('should reset lastPastedPosition when copying new object', () => {
      useObjectsStore.setState({ lastPastedPosition: { x: 200, y: 200 } });
      
      const { copyObject } = useObjectsStore.getState();
      copyObject(mockObject);
      
      expect(useObjectsStore.getState().lastPastedPosition).toBeNull();
    });
  });

  describe('Paste Position Calculation', () => {
    test('first paste should offset 20px from original position', () => {
      const { copyObject } = useObjectsStore.getState();
      copyObject(mockObject);
      
      const { copiedObject, lastPastedPosition } = useObjectsStore.getState();
      
      // Calculate paste position for first paste
      const pastePosition = lastPastedPosition 
        ? { x: lastPastedPosition.x + 20, y: lastPastedPosition.y + 20 }
        : { x: copiedObject!.originalPosition.x + 20, y: copiedObject!.originalPosition.y + 20 };
      
      expect(pastePosition).toEqual({ x: 120, y: 120 });
    });

    test('sequential pastes should cascade offsets', () => {
      const { copyObject, setLastPastedPosition } = useObjectsStore.getState();
      
      copyObject(mockObject);
      
      // First paste at 120, 120
      const firstPaste = { x: 120, y: 120 };
      setLastPastedPosition(firstPaste);
      
      // Second paste should be at 140, 140
      const { lastPastedPosition } = useObjectsStore.getState();
      const secondPaste = {
        x: lastPastedPosition!.x + 20,
        y: lastPastedPosition!.y + 20,
      };
      
      expect(secondPaste).toEqual({ x: 140, y: 140 });
      
      // Third paste should be at 160, 160
      setLastPastedPosition(secondPaste);
      const thirdPaste = {
        x: useObjectsStore.getState().lastPastedPosition!.x + 20,
        y: useObjectsStore.getState().lastPastedPosition!.y + 20,
      };
      
      expect(thirdPaste).toEqual({ x: 160, y: 160 });
    });
  });

  describe('Paste with Different Object Types', () => {
    test('should copy and paste text properties correctly', () => {
      const textObject: CanvasObject = {
        id: 'text1',
        type: 'text',
        position: { x: 50, y: 50 },
        width: 200,
        height: 40,
        rotation: 0,
        fill: '#000000',
        text: 'Test Content',
        fontSize: 24,
        createdBy: 'user1',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const { copyObject } = useObjectsStore.getState();
      copyObject(textObject);

      const { copiedObject } = useObjectsStore.getState();
      expect(copiedObject?.text).toBe('Test Content');
      expect(copiedObject?.fontSize).toBe(24);
    });

    test('should copy circle properties including radius', () => {
      const circleObject: CanvasObject = {
        id: 'circle1',
        type: 'circle',
        position: { x: 100, y: 100 },
        width: 100,
        height: 100,
        radius: 50,
        rotation: 0,
        fill: '#0000FF',
        createdBy: 'user1',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const { copyObject } = useObjectsStore.getState();
      copyObject(circleObject);

      const { copiedObject } = useObjectsStore.getState();
      expect(copiedObject?.radius).toBe(50);
    });

    test('should copy arrow properties including points', () => {
      const arrowObject: CanvasObject = {
        id: 'arrow1',
        type: 'arrow',
        position: { x: 0, y: 0 },
        width: 100,
        height: 50,
        rotation: 0,
        fill: '#000000',
        points: [0, 0, 100, 50],
        stroke: '#000000',
        strokeWidth: 2,
        pointerLength: 10,
        pointerWidth: 10,
        createdBy: 'user1',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const { copyObject } = useObjectsStore.getState();
      copyObject(arrowObject);

      const { copiedObject } = useObjectsStore.getState();
      expect(copiedObject?.points).toEqual([0, 0, 100, 50]);
      expect(copiedObject?.strokeWidth).toBe(2);
      expect(copiedObject?.pointerLength).toBe(10);
    });
  });

  describe('Clipboard Persistence', () => {
    test('clipboard should persist across multiple operations', () => {
      const { copyObject, addObject } = useObjectsStore.getState();
      
      copyObject(mockObject);
      
      // Perform other operations
      addObject({ ...mockObject, id: 'obj2' });
      
      // Clipboard should still contain copied object
      const { copiedObject } = useObjectsStore.getState();
      expect(copiedObject).not.toBeNull();
      expect(copiedObject?.type).toBe('rectangle');
    });

    test('clearClipboard should completely clear clipboard state', () => {
      const { copyObject, setLastPastedPosition, clearClipboard } = useObjectsStore.getState();
      
      copyObject(mockObject);
      setLastPastedPosition({ x: 150, y: 150 });
      
      clearClipboard();
      
      const state = useObjectsStore.getState();
      expect(state.copiedObject).toBeNull();
      expect(state.lastPastedPosition).toBeNull();
    });
  });
});

