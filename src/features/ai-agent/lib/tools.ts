// AI Agent Tool Definitions
import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import type { CanvasObject } from '@/features/objects/types';
import type { ToolExecutionContext } from '../types';

// Helper function to find objects by description
function findObjectByDescription(
  objects: CanvasObject[],
  description: string
): CanvasObject | null {
  const lowerDesc = description.toLowerCase();
  
  // Try to find by type
  if (lowerDesc.includes('circle')) {
    return objects.find(obj => obj.type === 'circle') || null;
  }
  if (lowerDesc.includes('rectangle') || lowerDesc.includes('rect')) {
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
  
  // Return the most recently created object if no specific match
  if (objects.length > 0) {
    return objects[objects.length - 1];
  }
  
  return null;
}

// Helper function to generate unique ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Create Shape Tool
export function createShapeTool(
  context: ToolExecutionContext,
  createObject: (object: CanvasObject) => Promise<void>
) {
  return new DynamicStructuredTool({
    name: 'createShape',
    description: 'Create a new shape on the canvas. Supports rectangles, circles, and text.',
    schema: z.object({
      type: z.enum(['rectangle', 'circle', 'text']).describe('The type of shape to create'),
      x: z.number().describe('X position on the canvas'),
      y: z.number().describe('Y position on the canvas'),
      width: z.number().optional().describe('Width of the shape (for rectangles and text)'),
      height: z.number().optional().describe('Height of the shape (for rectangles and text)'),
      radius: z.number().optional().describe('Radius of the shape (for circles)'),
      fill: z.string().optional().describe('Fill color (e.g., "red", "#FF0000")'),
      text: z.string().optional().describe('Text content (for text objects)'),
      fontSize: z.number().optional().describe('Font size (for text objects)'),
    }),
    func: async (params) => {
      console.log('[createShapeTool] ✅ TOOL CALLED with params:', params);
      
      const { type, x, y, width, height, radius, fill, text, fontSize } = params;
      
      const newObject: CanvasObject = {
        id: generateId(),
        type,
        position: { x, y },
        width: width || (type === 'rectangle' ? 100 : type === 'text' ? 200 : 100),
        height: height || (type === 'rectangle' ? 100 : type === 'text' ? 50 : 100),
        rotation: 0,
        fill: fill || (type === 'rectangle' ? '#3b82f6' : type === 'circle' ? '#10b981' : '#000000'),
        ...(type === 'circle' && { radius: radius || 50 }),
        ...(type === 'text' && { text: text || 'Text', fontSize: fontSize || 16 }),
        createdBy: context.userId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      } as CanvasObject;
      
      console.log('[createShapeTool] Creating object:', newObject);
      
      try {
        await createObject(newObject);
        console.log('[createShapeTool] ✅ Object created successfully');
        return `Created ${type} at position (${x}, ${y}) with fill color ${newObject.fill}`;
      } catch (error) {
        console.error('[createShapeTool] ❌ Error creating object:', error);
        throw error;
      }
    },
  });
}

// Move Shape Tool
export function moveShapeTool(
  objects: CanvasObject[],
  updateObject: (id: string, updates: Partial<CanvasObject>) => Promise<void>
) {
  return new DynamicStructuredTool({
    name: 'moveShape',
    description: 'Move a shape to a new position or by a delta amount.',
    schema: z.object({
      targetDescription: z.string().describe('Description of the shape to move (e.g., "the circle", "red rectangle")'),
      x: z.number().optional().describe('New absolute X position'),
      y: z.number().optional().describe('New absolute Y position'),
      deltaX: z.number().optional().describe('Change in X position (relative move)'),
      deltaY: z.number().optional().describe('Change in Y position (relative move)'),
    }),
    func: async (params) => {
      const { targetDescription, x, y, deltaX, deltaY } = params;
      
      const targetObject = findObjectByDescription(objects, targetDescription);
      if (!targetObject) {
        return `Could not find shape matching: ${targetDescription}`;
      }
      
      const newX = x !== undefined ? x : targetObject.position.x + (deltaX || 0);
      const newY = y !== undefined ? y : targetObject.position.y + (deltaY || 0);
      
      await updateObject(targetObject.id, { position: { x: newX, y: newY } });
      
      return `Moved ${targetObject.type} to position (${newX}, ${newY})`;
    },
  });
}

// Resize Shape Tool
export function resizeShapeTool(
  objects: CanvasObject[],
  updateObject: (id: string, updates: Partial<CanvasObject>) => Promise<void>
) {
  return new DynamicStructuredTool({
    name: 'resizeShape',
    description: 'Resize a shape by setting new dimensions or scaling.',
    schema: z.object({
      targetDescription: z.string().describe('Description of the shape to resize'),
      width: z.number().optional().describe('New width (for rectangles and text)'),
      height: z.number().optional().describe('New height (for rectangles and text)'),
      radius: z.number().optional().describe('New radius (for circles)'),
      scale: z.number().optional().describe('Scale factor (e.g., 2 for twice as big, 0.5 for half size)'),
    }),
    func: async (params) => {
      const { targetDescription, width, height, radius, scale } = params;
      
      const targetObject = findObjectByDescription(objects, targetDescription);
      if (!targetObject) {
        return `Could not find shape matching: ${targetDescription}`;
      }
      
      const updates: Partial<CanvasObject> = {};
      
      if (scale !== undefined) {
        if (targetObject.type === 'circle' && targetObject.radius) {
          updates.radius = targetObject.radius * scale;
        } else {
          if (targetObject.width) updates.width = targetObject.width * scale;
          if (targetObject.height) updates.height = targetObject.height * scale;
        }
      } else {
        if (width !== undefined) updates.width = width;
        if (height !== undefined) updates.height = height;
        if (radius !== undefined) updates.radius = radius;
      }
      
      await updateObject(targetObject.id, updates);
      
      return `Resized ${targetObject.type}`;
    },
  });
}

// Rotate Shape Tool
export function rotateShapeTool(
  objects: CanvasObject[],
  updateObject: (id: string, updates: Partial<CanvasObject>) => Promise<void>
) {
  return new DynamicStructuredTool({
    name: 'rotateShape',
    description: 'Rotate a shape by a specified number of degrees.',
    schema: z.object({
      targetDescription: z.string().describe('Description of the shape to rotate'),
      degrees: z.number().describe('Degrees to rotate (positive for clockwise, negative for counter-clockwise)'),
    }),
    func: async (params) => {
      const { targetDescription, degrees } = params;
      
      const targetObject = findObjectByDescription(objects, targetDescription);
      if (!targetObject) {
        return `Could not find shape matching: ${targetDescription}`;
      }
      
      const newRotation = (targetObject.rotation || 0) + degrees;
      await updateObject(targetObject.id, { rotation: newRotation });
      
      return `Rotated ${targetObject.type} by ${degrees} degrees`;
    },
  });
}

// Change Color Tool
export function changeColorTool(
  objects: CanvasObject[],
  updateObject: (id: string, updates: Partial<CanvasObject>) => Promise<void>
) {
  return new DynamicStructuredTool({
    name: 'changeColor',
    description: 'Change the fill color of a shape.',
    schema: z.object({
      targetDescription: z.string().describe('Description of the shape to change color'),
      color: z.string().describe('New color (e.g., "red", "#FF0000", "rgb(255, 0, 0)")'),
    }),
    func: async (params) => {
      const { targetDescription, color } = params;
      
      const targetObject = findObjectByDescription(objects, targetDescription);
      if (!targetObject) {
        return `Could not find shape matching: ${targetDescription}`;
      }
      
      await updateObject(targetObject.id, { fill: color });
      
      return `Changed ${targetObject.type} color to ${color}`;
    },
  });
}

// Arrange Shapes Tool
export function arrangeShapesTool(
  objects: CanvasObject[],
  updateObject: (id: string, updates: Partial<CanvasObject>) => Promise<void>
) {
  return new DynamicStructuredTool({
    name: 'arrangeShapes',
    description: 'Arrange multiple shapes in a horizontal or vertical layout with even spacing.',
    schema: z.object({
      direction: z.enum(['horizontal', 'vertical']).describe('Direction to arrange shapes'),
      spacing: z.number().optional().describe('Space between shapes in pixels (default: 20)'),
      targetDescriptions: z.array(z.string()).optional().describe('Descriptions of specific shapes to arrange (if not provided, arranges all shapes)'),
    }),
    func: async (params) => {
      const { direction, spacing = 20, targetDescriptions } = params;
      
      let shapesToArrange = objects;
      
      if (targetDescriptions && targetDescriptions.length > 0) {
        shapesToArrange = targetDescriptions
          .map(desc => findObjectByDescription(objects, desc))
          .filter((obj): obj is CanvasObject => obj !== null);
      }
      
      if (shapesToArrange.length === 0) {
        return 'No shapes found to arrange';
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
          await updateObject(shape.id, { position: { x: currentPosition, y: shape.position.y } });
          const shapeWidth = shape.type === 'circle' && shape.radius ? shape.radius * 2 : shape.width;
          currentPosition += shapeWidth + spacing;
        } else {
          await updateObject(shape.id, { position: { x: shape.position.x, y: currentPosition } });
          const shapeHeight = shape.type === 'circle' && shape.radius ? shape.radius * 2 : shape.height;
          currentPosition += shapeHeight + spacing;
        }
      }
      
      return `Arranged ${shapesToArrange.length} shapes ${direction}ly with ${spacing}px spacing`;
    },
  });
}

// Delete Shape Tool
export function deleteShapeTool(
  objects: CanvasObject[],
  deleteObject: (id: string) => Promise<void>
) {
  return new DynamicStructuredTool({
    name: 'deleteShape',
    description: 'Delete a shape from the canvas.',
    schema: z.object({
      targetDescription: z.string().describe('Description of the shape to delete'),
    }),
    func: async (params) => {
      const { targetDescription } = params;
      
      const targetObject = findObjectByDescription(objects, targetDescription);
      if (!targetObject) {
        return `Could not find shape matching: ${targetDescription}`;
      }
      
      await deleteObject(targetObject.id);
      
      return `Deleted ${targetObject.type}`;
    },
  });
}

// Duplicate Shape Tool
export function duplicateShapeTool(
  objects: CanvasObject[],
  createObject: (object: CanvasObject) => Promise<void>,
  context: ToolExecutionContext
) {
  return new DynamicStructuredTool({
    name: 'duplicateShape',
    description: 'Create a duplicate of an existing shape.',
    schema: z.object({
      targetDescription: z.string().describe('Description of the shape to duplicate'),
      offsetX: z.number().optional().describe('Horizontal offset from original (default: 50)'),
      offsetY: z.number().optional().describe('Vertical offset from original (default: 50)'),
    }),
    func: async (params) => {
      const { targetDescription, offsetX = 50, offsetY = 50 } = params;
      
      const targetObject = findObjectByDescription(objects, targetDescription);
      if (!targetObject) {
        return `Could not find shape matching: ${targetDescription}`;
      }
      
      const duplicate: CanvasObject = {
        ...targetObject,
        id: generateId(),
        position: {
          x: targetObject.position.x + offsetX,
          y: targetObject.position.y + offsetY
        },
        createdBy: context.userId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      
      await createObject(duplicate);
      
      return `Created duplicate of ${targetObject.type} at offset (${offsetX}, ${offsetY})`;
    },
  });
}

// Create Login Form Tool (Complex Command)
export function createLoginFormTool(
  context: ToolExecutionContext,
  createObject: (object: CanvasObject) => Promise<void>
) {
  return new DynamicStructuredTool({
    name: 'createLoginForm',
    description: 'Create a complete login form with username field, password field, and login button.',
    schema: z.object({
      x: z.number().describe('X position for the form (top-left corner)'),
      y: z.number().describe('Y position for the form (top-left corner)'),
      colorScheme: z.string().optional().describe('Color scheme for the form (e.g., "blue", "purple")'),
    }),
    func: async (params) => {
      const { x, y, colorScheme = 'blue' } = params;
      
      const primaryColor = colorScheme === 'blue' ? '#3b82f6' : 
                          colorScheme === 'purple' ? '#9333ea' :
                          colorScheme === 'green' ? '#10b981' : '#3b82f6';
      
      // Create form container
      await createObject({
        id: generateId(),
        type: 'rectangle',
        position: { x, y },
        width: 300,
        height: 250,
        rotation: 0,
        fill: '#ffffff',
        createdBy: context.userId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      } as CanvasObject);
      
      // Create "Login" title
      await createObject({
        id: generateId(),
        type: 'text',
        position: { x: x + 20, y: y + 20 },
        width: 260,
        height: 30,
        rotation: 0,
        fill: '#000000',
        text: 'Login',
        fontSize: 24,
        createdBy: context.userId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      } as CanvasObject);
      
      // Create username field background
      await createObject({
        id: generateId(),
        type: 'rectangle',
        position: { x: x + 20, y: y + 70 },
        width: 260,
        height: 40,
        rotation: 0,
        fill: '#f3f4f6',
        createdBy: context.userId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      } as CanvasObject);
      
      // Create username label
      await createObject({
        id: generateId(),
        type: 'text',
        position: { x: x + 30, y: y + 80 },
        width: 240,
        height: 20,
        rotation: 0,
        fill: '#6b7280',
        text: 'Username',
        fontSize: 14,
        createdBy: context.userId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      } as CanvasObject);
      
      // Create password field background
      await createObject({
        id: generateId(),
        type: 'rectangle',
        position: { x: x + 20, y: y + 125 },
        width: 260,
        height: 40,
        rotation: 0,
        fill: '#f3f4f6',
        createdBy: context.userId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      } as CanvasObject);
      
      // Create password label
      await createObject({
        id: generateId(),
        type: 'text',
        position: { x: x + 30, y: y + 135 },
        width: 240,
        height: 20,
        rotation: 0,
        fill: '#6b7280',
        text: 'Password',
        fontSize: 14,
        createdBy: context.userId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      } as CanvasObject);
      
      // Create login button
      await createObject({
        id: generateId(),
        type: 'rectangle',
        position: { x: x + 20, y: y + 185 },
        width: 260,
        height: 45,
        rotation: 0,
        fill: primaryColor,
        createdBy: context.userId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      } as CanvasObject);
      
      // Create button text
      await createObject({
        id: generateId(),
        type: 'text',
        position: { x: x + 115, y: y + 197 },
        width: 70,
        height: 20,
        rotation: 0,
        fill: '#ffffff',
        text: 'Login',
        fontSize: 16,
        createdBy: context.userId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      } as CanvasObject);
      
      return `Created a complete login form at position (${x}, ${y}) with ${colorScheme} color scheme`;
    },
  });
}

// Create Card Layout Tool (Complex Command)
export function createCardLayoutTool(
  context: ToolExecutionContext,
  createObject: (object: CanvasObject) => Promise<void>
) {
  return new DynamicStructuredTool({
    name: 'createCardLayout',
    description: 'Create a card layout with title, image placeholder, and description.',
    schema: z.object({
      x: z.number().describe('X position for the card (top-left corner)'),
      y: z.number().describe('Y position for the card (top-left corner)'),
      title: z.string().optional().describe('Title text for the card'),
      description: z.string().optional().describe('Description text for the card'),
    }),
    func: async (params) => {
      const { x, y, title = 'Card Title', description = 'Card description text goes here' } = params;
      
      // Create card container
      await createObject({
        id: generateId(),
        type: 'rectangle',
        position: { x, y },
        width: 280,
        height: 350,
        rotation: 0,
        fill: '#ffffff',
        createdBy: context.userId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      } as CanvasObject);
      
      // Create image placeholder
      await createObject({
        id: generateId(),
        type: 'rectangle',
        position: { x: x + 20, y: y + 20 },
        width: 240,
        height: 160,
        rotation: 0,
        fill: '#e5e7eb',
        createdBy: context.userId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      } as CanvasObject);
      
      // Create "Image" text in placeholder
      await createObject({
        id: generateId(),
        type: 'text',
        position: { x: x + 100, y: y + 90 },
        width: 80,
        height: 20,
        rotation: 0,
        fill: '#9ca3af',
        text: 'Image',
        fontSize: 16,
        createdBy: context.userId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      } as CanvasObject);
      
      // Create title
      await createObject({
        id: generateId(),
        type: 'text',
        position: { x: x + 20, y: y + 200 },
        width: 240,
        height: 30,
        rotation: 0,
        fill: '#000000',
        text: title,
        fontSize: 20,
        createdBy: context.userId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      } as CanvasObject);
      
      // Create description
      await createObject({
        id: generateId(),
        type: 'text',
        position: { x: x + 20, y: y + 245 },
        width: 240,
        height: 80,
        rotation: 0,
        fill: '#6b7280',
        text: description,
        fontSize: 14,
        createdBy: context.userId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      } as CanvasObject);
      
      return `Created a card layout at position (${x}, ${y}) with title "${title}"`;
    },
  });
}

// Export all tools factory
export function createAllTools(
  context: ToolExecutionContext,
  objects: CanvasObject[],
  createObject: (object: CanvasObject) => Promise<void>,
  updateObject: (id: string, updates: Partial<CanvasObject>) => Promise<void>,
  deleteObject: (id: string) => Promise<void>
) {
  console.log('[createAllTools] Creating tools for context:', {
    canvasId: context.canvasId,
    userId: context.userId,
    userName: context.userName,
    objectCount: objects.length,
  });
  
  const tools = [
    createShapeTool(context, createObject),
    moveShapeTool(objects, updateObject),
    resizeShapeTool(objects, updateObject),
    rotateShapeTool(objects, updateObject),
    changeColorTool(objects, updateObject),
    arrangeShapesTool(objects, updateObject),
    deleteShapeTool(objects, deleteObject),
    duplicateShapeTool(objects, createObject, context),
    createLoginFormTool(context, createObject),
    createCardLayoutTool(context, createObject),
  ];
  
  console.log('[createAllTools] Created', tools.length, 'tools:', tools.map(t => t.name).join(', '));
  
  return tools;
}

