// Objects hook - manages objects state and operations
'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useObjectsStore } from '../lib/objectsStore';
import { useHistoryStore } from '../lib/historyStore';
import { useAuth } from '@/features/auth';
import { CanvasObject, CreateObjectParams } from '../types';
import { Point } from '@/shared/types';
import { debounce, throttle } from '@/shared/lib/utils';
import {
  createObject as createObjectService,
  updateObject as updateObjectService,
  deleteObject as deleteObjectService,
  duplicateObject as duplicateObjectService,
  subscribeToObjectUpdates,
  subscribeToCanvasObjects,
  broadcastPositionUpdate,
  broadcastTransformUpdate,
  broadcastTransformStart,
  broadcastTransformEnd,
} from '../services/objectsService';

/**
 * Hook to manage canvas objects
 */
export function useObjects(canvasId: string | null) {
  const { user } = useAuth();
  const objects = useObjectsStore((state) => state.objects);
  const setObjects = useObjectsStore((state) => state.setObjects);
  const addObject = useObjectsStore((state) => state.addObject);
  const updateObject = useObjectsStore((state) => state.updateObject);
  const removeObject = useObjectsStore((state) => state.removeObject);
  const pushAction = useHistoryStore((state) => state.pushAction);
  
  // Subscribe to objects on mount
  useEffect(() => {
    if (!canvasId) return;
    
    let isSubscribed = true;
    
    // Subscribe to Firestore for initial load and persistence
    const unsubscribeFirestore = subscribeToCanvasObjects(canvasId, (fetchedObjects) => {
      if (isSubscribed) {
        console.log(`[Persistence] Loaded ${fetchedObjects.length} objects from Firestore for canvas: ${canvasId}`);
        const objectsMap = fetchedObjects.reduce((acc, obj) => {
          acc[obj.id] = obj;
          return acc;
        }, {} as Record<string, CanvasObject>);
        
        setObjects(objectsMap);
      }
    });
    
    // Subscribe to RTDB for real-time updates
    const unsubscribeRTDB = subscribeToObjectUpdates(canvasId, (update) => {
      if (isSubscribed) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ('deleted' in update && (update as any).deleted) {
          removeObject(update.id);
        } else {
          // Merge updates into existing object
          updateObject(update.id, update.updates);
        }
      }
    });
    
    return () => {
      isSubscribed = false;
      unsubscribeFirestore();
      unsubscribeRTDB();
    };
  }, [canvasId, setObjects, updateObject, removeObject]);
  
  // Create object
  const createObject = useCallback(
    async (params: CreateObjectParams & Partial<CanvasObject> & { isUndoRedo?: boolean; id?: string }) => {
      if (!canvasId || !user) return;
      
      const newObject: Omit<CanvasObject, 'id' | 'createdAt' | 'updatedAt'> = {
        type: params.type,
        position: { x: params.x, y: params.y },
        width: params.width || 100,
        height: params.height || 100,
        rotation: params.rotation || 0,
        fill: params.fill || '#3B82F6',
        createdBy: user.id,
        visible: params.visible !== undefined ? params.visible : true,
        // Include arrow-specific properties if provided
        ...(params.points && { points: params.points }),
        ...(params.stroke && { stroke: params.stroke }),
        ...(params.strokeWidth && { strokeWidth: params.strokeWidth }),
        ...(params.pointerLength && { pointerLength: params.pointerLength }),
        ...(params.pointerWidth && { pointerWidth: params.pointerWidth }),
        // Include text-specific properties if provided
        ...(params.text && { text: params.text }),
        ...(params.fontSize && { fontSize: params.fontSize }),
        ...(params.radius && { radius: params.radius }),
      };
      
      try {
        const object = await createObjectService(canvasId, newObject);
        console.log(`[Persistence] Created object ${object.id} in Firestore`);
        // Optimistically add to local state
        addObject(object);
        
        // Push to history (unless this is from undo/redo)
        if (!params.isUndoRedo) {
          pushAction({
            type: 'create',
            objectId: object.id,
            beforeState: null,
            afterState: object,
            timestamp: Date.now(),
          });
        }
        
        return object;
      } catch (error) {
        console.error('[Persistence] Failed to create object:', error);
        throw error;
      }
    },
    [canvasId, user, addObject, pushAction]
  );
  
  // Throttled broadcast for real-time position updates during drag (60fps = 16ms)
  const throttledBroadcast = useRef(
    throttle(async (canvasId: string, objectId: string, position: Point) => {
      try {
        await broadcastPositionUpdate(canvasId, objectId, position);
      } catch (error) {
        console.error('Failed to broadcast position:', error);
      }
    }, 16)
  ).current;

  // Throttled broadcast for real-time transform updates during resize/rotate (60fps = 16ms)
  const throttledTransformBroadcast = useRef(
    throttle(async (canvasId: string, objectId: string, updates: Partial<CanvasObject>) => {
      try {
        await broadcastTransformUpdate(canvasId, objectId, updates);
      } catch (error) {
        console.error('Failed to broadcast transform:', error);
      }
    }, 16)
  ).current;

  // Broadcast object position during drag (real-time, throttled)
  const broadcastObjectMove = useCallback(
    (objectId: string, position: Point) => {
      if (!canvasId) return;
      
      // Optimistic local update for smooth dragging
      updateObject(objectId, { position });
      
      // Broadcast to RTDB for other users (throttled to 60fps)
      throttledBroadcast(canvasId, objectId, position);
    },
    [canvasId, updateObject, throttledBroadcast]
  );

  // Broadcast transform start (user begins resizing/rotating)
  const broadcastObjectTransformStart = useCallback(
    async (objectId: string) => {
      if (!canvasId || !user) return;
      
      try {
        await broadcastTransformStart(canvasId, objectId, user.id);
      } catch (error) {
        console.error('Failed to broadcast transform start:', error);
      }
    },
    [canvasId, user]
  );

  // Broadcast transform updates during resize/rotate (real-time, throttled)
  const broadcastObjectTransform = useCallback(
    (objectId: string, updates: Partial<CanvasObject>) => {
      if (!canvasId) return;
      
      // Optimistic local update for smooth transforming
      updateObject(objectId, updates);
      
      // Broadcast to RTDB for other users (throttled to 60fps)
      throttledTransformBroadcast(canvasId, objectId, updates);
    },
    [canvasId, updateObject, throttledTransformBroadcast]
  );

  // Broadcast transform end (user finishes resizing/rotating)
  const broadcastObjectTransformEnd = useCallback(
    async (objectId: string) => {
      if (!canvasId) return;
      
      try {
        await broadcastTransformEnd(canvasId, objectId);
      } catch (error) {
        console.error('Failed to broadcast transform end:', error);
      }
    },
    [canvasId]
  );

  // Update object position (debounced for Firestore persistence)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const updateObjectPosition = useCallback(
    debounce(async (objectId: string, position: Point) => {
      if (!canvasId) return;
      
      try {
        await updateObjectService(canvasId, objectId, { position });
        console.log(`[Persistence] Updated object ${objectId} position in Firestore:`, position);
      } catch (error) {
        console.error('[Persistence] Failed to update object position:', error);
      }
    }, 300),
    [canvasId]
  );
  
  // Delete object
  const deleteObject = useCallback(
    async (objectId: string, isUndoRedo = false) => {
      if (!canvasId) return;
      
      try {
        // Capture before state for history (before deleting)
        const objectsMap = useObjectsStore.getState().objects;
        const beforeState = objectsMap[objectId];
        
        // Optimistically remove from local state
        removeObject(objectId);
        await deleteObjectService(canvasId, objectId);
        
        // Push to history (unless this is from undo/redo)
        if (!isUndoRedo && beforeState) {
          pushAction({
            type: 'delete',
            objectId,
            beforeState,
            afterState: null,
            timestamp: Date.now(),
          });
        }
      } catch (error) {
        console.error('Failed to delete object:', error);
        throw error;
      }
    },
    [canvasId, removeObject, pushAction]
  );
  
  // Duplicate object
  const duplicateObject = useCallback(
    async (objectId: string, isUndoRedo = false): Promise<CanvasObject> => {
      if (!canvasId) {
        throw new Error('Canvas ID is required');
      }
      
      try {
        // Call service to duplicate object (creates copy with 20px offset)
        const duplicate = await duplicateObjectService(canvasId, objectId);
        console.log(`[Persistence] Duplicated object ${objectId} as ${duplicate.id}`);
        
        // Optimistically add to local state
        addObject(duplicate);
        
        // Push to history (unless this is from undo/redo)
        if (!isUndoRedo) {
          pushAction({
            type: 'duplicate',
            objectId: duplicate.id,
            beforeState: null,
            afterState: duplicate,
            timestamp: Date.now(),
          });
        }
        
        return duplicate;
      } catch (error) {
        console.error('Failed to duplicate object:', error);
        throw error;
      }
    },
    [canvasId, addObject, pushAction]
  );
  
  return {
    objects: Object.values(objects),
    objectsMap: objects,
    createObject,
    updateObjectPosition,
    broadcastObjectMove,
    broadcastObjectTransformStart,
    broadcastObjectTransform,
    broadcastObjectTransformEnd,
    deleteObject,
    duplicateObject,
    updateObject: (objectId: string, updates: Partial<CanvasObject>, isUndoRedo = false) => {
      // Capture before state for history
      const objectsMap = useObjectsStore.getState().objects;
      const beforeState = objectsMap[objectId];
      
      // Optimistic local update
      updateObject(objectId, updates);
      
      // Persist to backend
      if (canvasId) {
        updateObjectService(canvasId, objectId, updates).catch(console.error);
      }
      
      // Push to history (unless this is from undo/redo)
      if (!isUndoRedo && beforeState) {
        pushAction({
          type: 'update',
          objectId,
          beforeState: { 
            fill: beforeState.fill,
            width: beforeState.width,
            height: beforeState.height,
            rotation: beforeState.rotation,
            visible: beforeState.visible,
            text: beforeState.text,
            fontSize: beforeState.fontSize,
            radius: beforeState.radius,
          },
          afterState: updates,
          timestamp: Date.now(),
        });
      }
    },
  };
}

