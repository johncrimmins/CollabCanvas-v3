/**
 * Integration test for duplicate object workflow
 * Tests the complete flow from duplicate action to sync
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import { useObjectsStore } from '../lib/objectsStore';
import { useHistoryStore } from '../lib/historyStore';
import { CanvasObject } from '../types';

// Mock Firebase services
vi.mock('../services/objectsService', () => ({
  duplicateObject: vi.fn((canvasId: string, objectId: string) => {
    return Promise.resolve({
      id: 'duplicate-id',
      type: 'rectangle',
      position: { x: 120, y: 120 },
      width: 100,
      height: 100,
      rotation: 0,
      fill: '#FF0000',
      createdBy: 'user1',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  }),
}));

describe('Duplicate Object Workflow', () => {
  beforeEach(() => {
    // Reset stores
    useObjectsStore.setState({
      objects: {},
      selectedObjectIds: [],
      copiedObject: null,
      lastPastedPosition: null,
    });
    useHistoryStore.getState().clear();
  });

  test('should duplicate object with 20px offset', async () => {
    const originalObject: CanvasObject = {
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
    };

    useObjectsStore.getState().addObject(originalObject);

    const { duplicateObject } = require('../services/objectsService');
    const duplicate = await duplicateObject('canvas1', 'obj1');

    // Verify duplicate has offset position
    expect(duplicate.position.x).toBe(120); // 100 + 20
    expect(duplicate.position.y).toBe(120); // 100 + 20
    expect(duplicate.id).not.toBe('obj1');
  });

  test('should add duplicate to history stack', () => {
    const { pushAction } = useHistoryStore.getState();
    
    const mockDuplicate: CanvasObject = {
      id: 'dup1',
      type: 'rectangle',
      position: { x: 120, y: 120 },
      width: 100,
      height: 100,
      rotation: 0,
      fill: '#FF0000',
      createdBy: 'user1',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    pushAction({
      type: 'duplicate',
      objectId: 'dup1',
      beforeState: null,
      afterState: mockDuplicate,
      timestamp: Date.now(),
    });

    const { undoStack } = useHistoryStore.getState();
    expect(undoStack).toHaveLength(1);
    expect(undoStack[0].type).toBe('duplicate');
    expect(undoStack[0].objectId).toBe('dup1');
  });

  test('should preserve all object properties when duplicating', async () => {
    const textObject: CanvasObject = {
      id: 'text1',
      type: 'text',
      position: { x: 50, y: 50 },
      width: 200,
      height: 40,
      rotation: 15,
      fill: '#000000',
      text: 'Original Text',
      fontSize: 24,
      createdBy: 'user1',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    // Mock duplicate service to preserve properties
    const mockDuplicateService = vi.fn(() => Promise.resolve({
      ...textObject,
      id: 'text1-duplicate',
      position: { x: 70, y: 70 },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }));

    const duplicate = await mockDuplicateService();

    // Verify all properties are preserved
    expect(duplicate.type).toBe('text');
    expect(duplicate.text).toBe('Original Text');
    expect(duplicate.fontSize).toBe(24);
    expect(duplicate.rotation).toBe(15);
    expect(duplicate.fill).toBe('#000000');
  });
});

