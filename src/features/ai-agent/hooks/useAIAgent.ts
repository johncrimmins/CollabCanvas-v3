// AI Agent Hook - Calls API and executes actions client-side
import { useCallback } from 'react';
import { useAIAgentStore } from '../lib/aiAgentStore';
import { createObject, updateObject, deleteObject } from '@/features/objects/services/objectsService';
import { useObjectsStore } from '@/features/objects/lib/objectsStore';
import type { AIAction, AIAgentResponse } from '../types';
import type { CanvasObject } from '@/features/objects/types';

interface UseAIAgentProps {
  canvasId: string;
  userId: string;
  userName: string;
}

// Helper function to find object by description with semantic alias support
function findObjectByDescription(
  objects: CanvasObject[],
  description: string
): CanvasObject | null {
  const lowerDesc = description.toLowerCase();
  
  // Semantic alias mapping - handles common vocabulary variations
  const aliases: Record<string, (obj: CanvasObject) => boolean> = {
    'square': (obj) => obj.type === 'rectangle' && obj.width === obj.height,
    'box': (obj) => obj.type === 'rectangle',
    'rect': (obj) => obj.type === 'rectangle',
    'oval': (obj) => obj.type === 'circle',
    'dot': (obj) => obj.type === 'circle',
    'label': (obj) => obj.type === 'text',
    'word': (obj) => obj.type === 'text',
    'words': (obj) => obj.type === 'text',
  };
  
  // Check semantic aliases first
  for (const [alias, matcher] of Object.entries(aliases)) {
    if (lowerDesc.includes(alias)) {
      const match = objects.find(matcher);
      if (match) return match;
    }
  }
  
  // Try to find by type
  if (lowerDesc.includes('circle')) {
    return objects.find(obj => obj.type === 'circle') || null;
  }
  if (lowerDesc.includes('rectangle')) {
    return objects.find(obj => obj.type === 'rectangle') || null;
  }
  if (lowerDesc.includes('text')) {
    return objects.find(obj => obj.type === 'text') || null;
  }
  
  // Try to find by color
  const colorMatch = lowerDesc.match(/\b(red|blue|green|yellow|purple|orange|black|white|gray|grey)\b/);
  if (colorMatch) {
    const color = colorMatch[1];
    const obj = objects.find(o => o.fill?.toLowerCase().includes(color));
    if (obj) return obj;
  }
  
  // Try to find by size descriptors
  if (lowerDesc.includes('big') || lowerDesc.includes('large')) {
    return objects.reduce((largest, obj) => {
      const objSize = (obj.width || 0) * (obj.height || 0);
      const largestSize = (largest?.width || 0) * (largest?.height || 0);
      return objSize > largestSize ? obj : largest;
    }, objects[0] || null);
  }
  if (lowerDesc.includes('small') || lowerDesc.includes('tiny')) {
    return objects.reduce((smallest, obj) => {
      const objSize = (obj.width || 0) * (obj.height || 0);
      const smallestSize = (smallest?.width || 0) * (smallest?.height || 0);
      return objSize < smallestSize ? obj : smallest;
    }, objects[0] || null);
  }
  
  // Try to find by spatial position
  if (lowerDesc.includes('left')) {
    return objects.reduce((leftmost, obj) => 
      obj.position.x < leftmost.position.x ? obj : leftmost, objects[0] || null);
  }
  if (lowerDesc.includes('right')) {
    return objects.reduce((rightmost, obj) => 
      obj.position.x > rightmost.position.x ? obj : rightmost, objects[0] || null);
  }
  if (lowerDesc.includes('top')) {
    return objects.reduce((topmost, obj) => 
      obj.position.y < topmost.position.y ? obj : topmost, objects[0] || null);
  }
  if (lowerDesc.includes('bottom')) {
    return objects.reduce((bottommost, obj) => 
      obj.position.y > bottommost.position.y ? obj : bottommost, objects[0] || null);
  }
  
  // Return the most recently created object if no specific match
  if (objects.length > 0) {
    return objects[objects.length - 1];
  }
  
  return null;
}

// Helper function to execute actions client-side using existing services
async function executeAction(
  action: AIAction, 
  canvasId: string, 
  userId: string,
  allObjects: CanvasObject[]
): Promise<void> {
  console.log('[executeAction] Executing action:', action.tool, action.params);
  
  switch (action.tool) {
    case 'canvasAction': {
      const { action: actionType, target, targets, shape, updates, layout, offset } = action.params;
      
      console.log('[executeAction] canvasAction:', actionType, action.params);
      
      // ACTION: CREATE
      if (actionType === 'create') {
        if (!shape || !shape.position) {
          console.warn('[executeAction] canvasAction CREATE: missing required fields', action.params);
          return;
        }
        
        const objectParams: Omit<CanvasObject, 'id' | 'createdAt' | 'updatedAt'> = {
          type: shape.type,
          position: shape.position,
          width: shape.dimensions?.width ?? (shape.type === 'rectangle' ? 100 : shape.type === 'text' ? 200 : 100),
          height: shape.dimensions?.height ?? (shape.type === 'rectangle' ? 100 : shape.type === 'text' ? 50 : 100),
          rotation: 0,
          fill: shape.style?.fill ?? (shape.type === 'rectangle' ? '#3b82f6' : shape.type === 'circle' ? '#10b981' : '#000000'),
          createdBy: userId,
        };
        
        // Add type-specific fields
        if (shape.type === 'circle') {
          objectParams.radius = shape.dimensions?.radius ?? 50;
        }
        if (shape.type === 'text') {
          objectParams.text = shape.style?.text ?? 'Text';
          objectParams.fontSize = shape.style?.fontSize ?? 16;
        }
        
        await createObject(canvasId, objectParams);
        console.log('[executeAction] canvasAction CREATE: created object', objectParams);
        break;
      }
      
      // ACTION: UPDATE
      if (actionType === 'update') {
        if (!target) {
          console.warn('[executeAction] canvasAction UPDATE: missing target', action.params);
          return;
        }
        
        // Find by ID (primary) or fallback to description
        const targetObject = allObjects.find(obj => obj.id === target) 
          || findObjectByDescription(allObjects, target);
        
        if (!targetObject) {
          console.warn('[executeAction] canvasAction UPDATE: could not find object with ID or matching', target);
          return;
        }
        
        const updateData: Partial<CanvasObject> = {};
        
        // Handle position update
        if (updates?.position) {
          updateData.position = updates.position;
        }
        
        // Handle dimension updates
        if (updates?.dimensions) {
          if (updates.dimensions.width !== undefined) updateData.width = updates.dimensions.width;
          if (updates.dimensions.height !== undefined) updateData.height = updates.dimensions.height;
          if (updates.dimensions.radius !== undefined) updateData.radius = updates.dimensions.radius;
        }
        
        // Handle rotation update (additive)
        if (updates?.rotation !== undefined) {
          updateData.rotation = (targetObject.rotation || 0) + updates.rotation;
        }
        
        // Handle scale update (multiplicative)
        if (updates?.scale !== undefined) {
          if (targetObject.type === 'circle' && targetObject.radius) {
            updateData.radius = targetObject.radius * updates.scale;
          } else {
            if (targetObject.width) updateData.width = targetObject.width * updates.scale;
            if (targetObject.height) updateData.height = targetObject.height * updates.scale;
          }
        }
        
        // Handle style updates
        if (updates?.fill !== undefined) updateData.fill = updates.fill;
        if (updates?.fontSize !== undefined) updateData.fontSize = updates.fontSize;
        if (updates?.text !== undefined) updateData.text = updates.text;
        
        await updateObject(canvasId, targetObject.id, updateData);
        console.log('[executeAction] canvasAction UPDATE: updated object', targetObject.id, updateData);
        break;
      }
      
      // ACTION: DELETE
      if (actionType === 'delete') {
        if (!target) {
          console.warn('[executeAction] canvasAction DELETE: missing target', action.params);
          return;
        }
        
        // Find by ID (primary) or fallback to description
        const targetObject = allObjects.find(obj => obj.id === target)
          || findObjectByDescription(allObjects, target);
        
        if (!targetObject) {
          console.warn('[executeAction] canvasAction DELETE: could not find object with ID or matching', target);
          return;
        }
        
        await deleteObject(canvasId, targetObject.id);
        console.log('[executeAction] canvasAction DELETE: deleted object', targetObject.id);
        break;
      }
      
      // ACTION: DUPLICATE
      if (actionType === 'duplicate') {
        if (!target) {
          console.warn('[executeAction] canvasAction DUPLICATE: missing target', action.params);
          return;
        }
        
        // Find by ID (primary) or fallback to description
        const targetObject = allObjects.find(obj => obj.id === target)
          || findObjectByDescription(allObjects, target);
        
        if (!targetObject) {
          console.warn('[executeAction] canvasAction DUPLICATE: could not find object with ID or matching', target);
          return;
        }
        
        const duplicateOffset = offset || { x: 50, y: 50 };
        
        const duplicateParams: Omit<CanvasObject, 'id' | 'createdAt' | 'updatedAt'> = {
          ...targetObject,
          position: {
            x: targetObject.position.x + (duplicateOffset.x || 0),
            y: targetObject.position.y + (duplicateOffset.y || 0)
          },
          createdBy: userId,
        };
        
        await createObject(canvasId, duplicateParams);
        console.log('[executeAction] canvasAction DUPLICATE: created duplicate', duplicateParams);
        break;
      }
      
      // ACTION: ARRANGE
      if (actionType === 'arrange') {
        if (!targets || targets.length === 0) {
          console.warn('[executeAction] canvasAction ARRANGE: missing targets', action.params);
          return;
        }
        if (!layout) {
          console.warn('[executeAction] canvasAction ARRANGE: missing layout', action.params);
          return;
        }
        
        const { direction, spacing = 20 } = layout;
        
        // Find all target objects by ID
        const shapesToArrange = targets
          .map((id: string) => allObjects.find(obj => obj.id === id))
          .filter((obj: CanvasObject | undefined): obj is CanvasObject => obj !== undefined);
        
        if (shapesToArrange.length === 0) {
          console.warn('[executeAction] canvasAction ARRANGE: no shapes found with provided IDs');
          return;
        }
        
        // Sort by current position
        shapesToArrange.sort((a, b) => {
          if (direction === 'horizontal') {
            return a.position.x - b.position.x;
          } else {
            return a.position.y - b.position.y;
          }
        });
        
        // Arrange shapes
        let currentPosition = direction === 'horizontal' 
          ? shapesToArrange[0].position.x 
          : shapesToArrange[0].position.y;
        
        for (const shape of shapesToArrange) {
          if (direction === 'horizontal') {
            await updateObject(canvasId, shape.id, { position: { x: currentPosition, y: shape.position.y } });
            const shapeWidth = shape.type === 'circle' && shape.radius ? shape.radius * 2 : shape.width;
            currentPosition += shapeWidth + spacing;
          } else {
            await updateObject(canvasId, shape.id, { position: { x: shape.position.x, y: currentPosition } });
            const shapeHeight = shape.type === 'circle' && shape.radius ? shape.radius * 2 : shape.height;
            currentPosition += shapeHeight + spacing;
          }
        }
        
        console.log('[executeAction] canvasAction ARRANGE: arranged', shapesToArrange.length, 'shapes');
        break;
      }
      
      console.warn('[executeAction] canvasAction: unknown action type', actionType);
      break;
    }
    
    case 'manageShape': {
      const { operation, target, shapeType, position, dimensions, transform, style, offset } = action.params;
      
      console.log('[executeAction] manageShape:', operation, action.params);
      
      // OPERATION: CREATE
      if (operation === 'create') {
        if (!shapeType || !position) {
          console.warn('[executeAction] manageShape CREATE: missing required fields', action.params);
          return;
        }
        
        const objectParams: Omit<CanvasObject, 'id' | 'createdAt' | 'updatedAt'> = {
          type: shapeType,
          position: position,
          width: dimensions?.width ?? (shapeType === 'rectangle' ? 100 : shapeType === 'text' ? 200 : 100),
          height: dimensions?.height ?? (shapeType === 'rectangle' ? 100 : shapeType === 'text' ? 50 : 100),
          rotation: transform?.rotation ?? 0,
          fill: style?.fill ?? (shapeType === 'rectangle' ? '#3b82f6' : shapeType === 'circle' ? '#10b981' : '#000000'),
          createdBy: userId,
        };
        
        // Add type-specific fields
        if (shapeType === 'circle') {
          objectParams.radius = dimensions?.radius ?? 50;
        }
        if (shapeType === 'text') {
          objectParams.text = style?.text ?? 'Text';
          objectParams.fontSize = style?.fontSize ?? 16;
        }
        
        await createObject(canvasId, objectParams);
        console.log('[executeAction] manageShape CREATE: created object', objectParams);
        break;
      }
      
      // OPERATION: UPDATE
      if (operation === 'update') {
        if (!target) {
          console.warn('[executeAction] manageShape UPDATE: missing target', action.params);
          return;
        }
        
        // Find the target object by description
        const targetObject = findObjectByDescription(allObjects, target);
        if (!targetObject) {
          console.warn('[executeAction] manageShape UPDATE: could not find object matching', target);
          return;
        }
        
        const updates: Partial<CanvasObject> = {};
        
        // Handle position update
        if (position) {
          updates.position = position;
        }
        
        // Handle dimension updates
        if (dimensions) {
          if (dimensions.width !== undefined) updates.width = dimensions.width;
          if (dimensions.height !== undefined) updates.height = dimensions.height;
          if (dimensions.radius !== undefined) updates.radius = dimensions.radius;
        }
        
        // Handle transform updates
        if (transform) {
          if (transform.rotation !== undefined) {
            updates.rotation = (targetObject.rotation || 0) + transform.rotation;
          }
          if (transform.scale !== undefined) {
            // Apply scale
            if (targetObject.type === 'circle' && targetObject.radius) {
              updates.radius = targetObject.radius * transform.scale;
            } else {
              if (targetObject.width) updates.width = targetObject.width * transform.scale;
              if (targetObject.height) updates.height = targetObject.height * transform.scale;
            }
          }
        }
        
        // Handle style updates
        if (style) {
          if (style.fill !== undefined) updates.fill = style.fill;
          if (style.fontSize !== undefined) updates.fontSize = style.fontSize;
          if (style.text !== undefined) updates.text = style.text;
        }
        
        await updateObject(canvasId, targetObject.id, updates);
        console.log('[executeAction] manageShape UPDATE: updated object', targetObject.id, updates);
        break;
      }
      
      // OPERATION: DELETE
      if (operation === 'delete') {
        if (!target) {
          console.warn('[executeAction] manageShape DELETE: missing target', action.params);
          return;
        }
        
        const targetObject = findObjectByDescription(allObjects, target);
        if (!targetObject) {
          console.warn('[executeAction] manageShape DELETE: could not find object matching', target);
          return;
        }
        
        await deleteObject(canvasId, targetObject.id);
        console.log('[executeAction] manageShape DELETE: deleted object', targetObject.id);
        break;
      }
      
      // OPERATION: DUPLICATE
      if (operation === 'duplicate') {
        if (!target) {
          console.warn('[executeAction] manageShape DUPLICATE: missing target', action.params);
          return;
        }
        
        const targetObject = findObjectByDescription(allObjects, target);
        if (!targetObject) {
          console.warn('[executeAction] manageShape DUPLICATE: could not find object matching', target);
          return;
        }
        
        const duplicateOffset = offset || { x: 50, y: 50 };
        
        const duplicate: Omit<CanvasObject, 'id' | 'createdAt' | 'updatedAt'> = {
          ...targetObject,
          position: {
            x: targetObject.position.x + duplicateOffset.x,
            y: targetObject.position.y + duplicateOffset.y
          },
          createdBy: userId,
        };
        
        await createObject(canvasId, duplicate);
        console.log('[executeAction] manageShape DUPLICATE: created duplicate', duplicate);
        break;
      }
      
      console.warn('[executeAction] manageShape: unknown operation', operation);
      break;
    }
    
    case 'arrangeShapes': {
      const { position } = action.params;
      if (!position) {
        console.warn('[executeAction] arrangeShapes: missing position data');
        return;
      }
      
      // For now, just update the first object's position
      // TODO: Implement proper multi-object arrangement
      const targetObject = allObjects[0];
      if (!targetObject) {
        console.warn('[executeAction] arrangeShapes: no objects found');
        return;
      }
      
      await updateObject(canvasId, targetObject.id, { position });
      break;
    }
    
    case 'createLoginForm': {
      // This creates multiple shapes, so we need to execute each one
      const { type, x, y, width, height, rotation, fill, text, fontSize } = action.params;
      
      const objectParams: Omit<CanvasObject, 'id' | 'createdAt' | 'updatedAt'> = {
        type,
        position: { x, y },
        width: width ?? 100,
        height: height ?? 100,
        rotation: rotation ?? 0,
        fill: fill ?? '#ffffff',
        createdBy: userId,
      };
      
      if (type === 'text') {
        objectParams.text = text ?? 'Login';
        objectParams.fontSize = fontSize ?? 16;
      }
      
      await createObject(canvasId, objectParams);
      break;
    }
    
    case 'createCardLayout': {
      // This creates multiple shapes, so we need to execute each one
      const { type, x, y, width, height, rotation, fill, text, fontSize } = action.params;
      
      const objectParams: Omit<CanvasObject, 'id' | 'createdAt' | 'updatedAt'> = {
        type,
        position: { x, y },
        width: width ?? 100,
        height: height ?? 100,
        rotation: rotation ?? 0,
        fill: fill ?? '#ffffff',
        createdBy: userId,
      };
      
      if (type === 'text') {
        objectParams.text = text ?? 'Card Title';
        objectParams.fontSize = fontSize ?? 16;
      }
      
      await createObject(canvasId, objectParams);
      break;
    }
    
    case 'getCanvasState': {
      // This is a query-only tool used by the AI to understand canvas state
      // No client-side action needed - the AI has already queried and acted
      console.log('[executeAction] getCanvasState called - AI is querying canvas context');
      break;
    }
    
    default:
      console.warn('[executeAction] Unknown action type:', action.tool);
  }
}

export function useAIAgent({ canvasId, userId, userName }: UseAIAgentProps) {
  const objectsRecord = useObjectsStore((state) => state.objects);
  const objects = Object.values(objectsRecord); // Convert Record to Array
  const { messages, isProcessing, error, addMessage, setProcessing, setError, clearError } = useAIAgentStore();
  
  // Execute AI command by calling our secure API route
  const executeCommand = useCallback(
    async (input: string) => {
      console.log('[useAIAgent] Executing command:', input);
      
      clearError();
      setProcessing(true);
      
      // Add user message to chat
      addMessage({
        role: 'user',
        content: input,
      });
      
      try {
        console.log('[useAIAgent] Calling API route...');
        
        // Call API with current canvas state for agent context
        const response = await fetch('/api/ai-agent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            command: input,
            canvasId,
            userId,
            userName,
            objectCount: objects.length,
            objects: objects,  // Send full objects array for agent context
          }),
        });
        
        console.log('[useAIAgent] API response status:', response.status);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `API error: ${response.status}`);
        }
        
        const data = await response.json() as AIAgentResponse;
        console.log('[useAIAgent] API response data:', data);
        
        // Execute actions client-side using authenticated connection
        if (data.actions && data.actions.length > 0) {
          console.log('[useAIAgent] Executing', data.actions.length, 'action(s) client-side...');
          
          for (const action of data.actions) {
            await executeAction(action, canvasId, userId, objects);
          }
          
          console.log('[useAIAgent] All actions executed successfully');
        }
        
        // Add assistant response to chat
        addMessage({
          role: 'assistant',
          content: data.message,
        });
        
      } catch (err) {
        console.error('[useAIAgent] Error executing command:', err);
        const errorMessage = err instanceof Error ? err.message : 'An error occurred while processing your command.';
        setError(errorMessage);
        
        addMessage({
          role: 'assistant',
          content: `Sorry, I encountered an error: ${errorMessage}`,
        });
      } finally {
        setProcessing(false);
      }
    },
    [canvasId, userId, userName, objects.length, addMessage, setProcessing, setError, clearError]
  );
  
  return {
    messages,
    isProcessing,
    error,
    executeCommand,
    clearError,
  };
}
