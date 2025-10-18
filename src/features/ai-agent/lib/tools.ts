// ═══════════════════════════════════════════════════════════════════════════
// AI AGENT TOOL DEFINITIONS - Canvas Manipulation Tools
// ═══════════════════════════════════════════════════════════════════════════
//
// ARCHITECTURE EVOLUTION: From 10 Tools → 2 Tools (80% reduction)
//
// BEFORE (v1 - 10 tools):
// - createShape, moveShape, resizeShape, rotateShape, changeColor, deleteShape,
//   duplicateShape, arrangeShapes, createLoginForm, createCardLayout
//
// AFTER (v2 - 2 tools):
// - getCanvasState (query current state)
// - canvasAction (unified operations: create, update, delete, duplicate, arrange)
//
// WHY CONSOLIDATE?
// 1. LLM Tool Selection: Fewer tools = better accuracy (LLM has to choose from 2 instead of 10)
// 2. ID-Based Targeting: Eliminates ambiguity (uses object IDs instead of descriptions)
// 3. Maintainability: Single source of truth for canvas operations
// 4. Testing: Easier to test one tool with multiple actions than 10 separate tools
// 5. Performance: Reduced tool instantiation overhead
//
// KEY DESIGN DECISION: ID-BASED TARGETING
// - OLD WAY: Agent used descriptions like "the red circle" or "the square"
// - PROBLEM: Ambiguous when multiple shapes match (e.g., two red circles)
// - NEW WAY: Agent calls getCanvasState() to get IDs, then uses exact IDs
// - BENEFIT: Deterministic, reliable targeting that fixes tests 5-8
//
// ═══════════════════════════════════════════════════════════════════════════

import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import type { CanvasObject } from '@/features/objects/types';
import type { ToolExecutionContext, ManageShapeParams } from '../types';

// ───────────────────────────────────────────────────────────────────────────
// HELPER FUNCTION: findObjectByDescription (LEGACY FALLBACK)
// ───────────────────────────────────────────────────────────────────────────
// This helper is kept for backward compatibility and as a fallback when the
// agent doesn't provide an exact ID. However, the new architecture encourages
// ID-based targeting through the system prompt.
//
// WHY KEEP IT?
// - Graceful degradation: If agent forgets to query for ID, we can still try
// - Transition period: Helps during migration from old tool architecture
// - User experience: Better to attempt a match than fail completely
//
// IMPORTANT: This should be used less and less as the agent learns to always
// call getCanvasState() first for existing shape operations.
// ───────────────────────────────────────────────────────────────────────────
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

// ═══════════════════════════════════════════════════════════════════════════
// CANVAS ACTION TOOL - Unified tool for all canvas operations
// ═══════════════════════════════════════════════════════════════════════════

/**
 * canvasActionTool - The core tool for all canvas manipulation operations.
 * 
 * CONSOLIDATION STRATEGY:
 * This single tool replaces 8+ separate tools by using an "action" parameter
 * to route to different operations. This is a significant architectural improvement.
 * 
 * REPLACED TOOLS (Legacy v1):
 * - manageShape → now action='create'|'update'|'delete'|'duplicate'
 * - arrangeShapes → now action='arrange'
 * - createShape, moveShape, resizeShape, rotateShape, changeColor, deleteShape, duplicateShape → all now action variants
 * - createLoginForm, createCardLayout → deferred to Phase 2 (complex layouts)
 * 
 * BENEFITS OF CONSOLIDATION:
 * 1. IMPROVED LLM ACCURACY: Agent chooses from 2 tools instead of 10
 *    - Reduces decision space by 80%
 *    - Clearer mental model for the LLM
 *    - Fewer hallucinations and tool call errors
 * 
 * 2. ID-BASED TARGETING: Eliminates ambiguity in shape selection
 *    - OLD: "move the circle" (which circle if there are 3?)
 *    - NEW: "move object-1729012345" (exact, unambiguous)
 *    - Fixes tests 5-8 which failed due to description-based targeting
 * 
 * 3. MAINTAINABILITY: Single source of truth
 *    - All canvas operations in one place
 *    - Easier to add new features (just add a new action type)
 *    - Simpler to understand and debug
 * 
 * 4. TYPE SAFETY: Unified schema with discriminated unions
 *    - TypeScript enforces correct parameters per action
 *    - Zod validates at runtime
 *    - Better developer experience
 * 
 * ARCHITECTURE PATTERN:
 * 1. Agent calls getCanvasState() → receives [{id: "123", type: "circle", ...}]
 * 2. Agent identifies target shape → "123" is the blue circle
 * 3. Agent calls canvasAction({action: "update", target: "123", updates: {...}})
 * 4. Tool routes to update logic and executes change
 * 
 * This pattern ensures deterministic, reliable shape manipulation.
 */
export function canvasActionTool(
  context: ToolExecutionContext,
  objects: CanvasObject[],
  createObject: (object: CanvasObject) => Promise<void>,
  updateObject: (id: string, updates: Partial<CanvasObject>) => Promise<void>,
  deleteObject: (id: string) => Promise<void>
) {
  return new DynamicStructuredTool({
    name: 'canvasAction',
    description: 'Perform canvas operations: create new shapes, update existing shapes, delete shapes, duplicate shapes, or arrange multiple shapes in layouts.',
    schema: z.object({
      // Core action type
      action: z.enum(['create', 'update', 'delete', 'duplicate', 'arrange'])
        .describe('The canvas action to perform: create (new shape), update (modify shape), delete (remove shape), duplicate (copy shape), arrange (layout multiple shapes)'),
      
      // Target selection (for update/delete/duplicate) - ID-BASED
      target: z.string().optional().nullable()
        .describe('Object ID from getCanvasState (e.g., "1729012345-abc123"). Required for update/delete/duplicate actions. Use the exact ID returned by getCanvasState, NOT descriptions like "the circle".'),
      
      // Multiple targets (for arrange)
      targets: z.array(z.string()).optional().nullable()
        .describe('Array of object IDs from getCanvasState. Required for arrange action. Use exact IDs, not descriptions.'),
      
      // Shape definition (for create)
      shape: z.object({
        type: z.enum(['rectangle', 'circle', 'text']).describe('Shape type to create'),
        position: z.object({
          x: z.number().describe('X coordinate in pixels'),
          y: z.number().describe('Y coordinate in pixels')
        }).describe('Position on canvas'),
        dimensions: z.object({
          width: z.number().optional(),
          height: z.number().optional(),
          radius: z.number().optional()
        }).optional().describe('Size - width/height for rectangles/text, radius for circles'),
        style: z.object({
          fill: z.string().optional().describe('Fill color (hex, rgb, or name)'),
          fontSize: z.number().optional().describe('Font size for text'),
          text: z.string().optional().describe('Text content for text shapes')
        }).optional().describe('Visual styling')
      }).optional().nullable().describe('Shape definition for create action'),
      
      // Updates (for update)
      updates: z.object({
        position: z.object({
          x: z.number(),
          y: z.number()
        }).optional().describe('New position coordinates'),
        dimensions: z.object({
          width: z.number().optional(),
          height: z.number().optional(),
          radius: z.number().optional()
        }).optional().describe('New dimensions'),
        rotation: z.number().optional().describe('Rotation in degrees (positive = clockwise)'),
        scale: z.number().optional().describe('Scale factor (e.g., 2 = twice as big, 0.5 = half size)'),
        fill: z.string().optional().describe('New fill color'),
        text: z.string().optional().describe('New text content'),
        fontSize: z.number().optional().describe('New font size')
      }).optional().nullable().describe('Updates to apply for update action'),
      
      // Layout configuration (for arrange)
      layout: z.object({
        direction: z.enum(['horizontal', 'vertical']).describe('Layout direction'),
        spacing: z.number().optional().describe('Space between shapes in pixels (default: 20)')
      }).optional().nullable().describe('Layout configuration for arrange action'),
      
      // Duplication offset (for duplicate)
      offset: z.object({
        x: z.number().optional(),
        y: z.number().optional()
      }).optional().nullable().describe('Offset for duplicate action (default: {x: 50, y: 50})')
    }),
    func: async (params: any) => {
      console.log('[canvasActionTool] ✅ TOOL CALLED with action:', params.action, params);
      
      const { action } = params;
      
      // ACTION: CREATE
      if (action === 'create') {
        if (!params.shape) {
          throw new Error('shape is required for create action');
        }
        if (!params.shape.position) {
          throw new Error('shape.position is required for create action');
        }
        
        const { type, position, dimensions, style } = params.shape;
        
        const newObject: CanvasObject = {
          id: generateId(),
          type: type,
          position: position,
          width: dimensions?.width || (type === 'rectangle' ? 100 : type === 'text' ? 200 : 100),
          height: dimensions?.height || (type === 'rectangle' ? 100 : type === 'text' ? 50 : 100),
          rotation: 0,
          fill: style?.fill || (type === 'rectangle' ? '#3b82f6' : type === 'circle' ? '#10b981' : '#000000'),
          ...(type === 'circle' && { radius: dimensions?.radius || 50 }),
          ...(type === 'text' && { 
            text: style?.text || 'Text', 
            fontSize: style?.fontSize || 16 
          }),
          createdBy: context.userId,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        } as CanvasObject;
        
        console.log('[canvasActionTool] Creating object:', newObject);
        await createObject(newObject);
        console.log('[canvasActionTool] ✅ Create action successful');
        
        return `Created ${type} at position (${position.x}, ${position.y})`;
      }
      
      // ─────────────────────────────────────────────────────────────────────
      // ACTION: UPDATE - Modify properties of an existing shape
      // ─────────────────────────────────────────────────────────────────────
      // ID-BASED TARGETING: First tries to find by exact ID, falls back to
      // description matching for backward compatibility. The fallback should
      // rarely be used as the agent is trained to call getCanvasState() first.
      // ─────────────────────────────────────────────────────────────────────
      if (action === 'update') {
        if (!params.target) {
          throw new Error('target (object ID) is required for update action');
        }
        
        // Find by ID (primary) or fallback to description (legacy support)
        const targetObject = objects.find(obj => obj.id === params.target) 
          || findObjectByDescription(objects, params.target);
        
        if (!targetObject) {
          return `Could not find shape with ID: ${params.target}`;
        }
        
        const updates: Partial<CanvasObject> = {};
        
        // Handle position update
        if (params.updates?.position) {
          updates.position = params.updates.position;
        }
        
        // Handle dimension updates
        if (params.updates?.dimensions) {
          if (params.updates.dimensions.width !== undefined) updates.width = params.updates.dimensions.width;
          if (params.updates.dimensions.height !== undefined) updates.height = params.updates.dimensions.height;
          if (params.updates.dimensions.radius !== undefined) updates.radius = params.updates.dimensions.radius;
        }
        
        // Handle rotation update (additive)
        if (params.updates?.rotation !== undefined) {
          updates.rotation = (targetObject.rotation || 0) + params.updates.rotation;
        }
        
        // Handle scale update (multiplicative)
        if (params.updates?.scale !== undefined) {
          if (targetObject.type === 'circle' && targetObject.radius) {
            updates.radius = targetObject.radius * params.updates.scale;
          } else {
            if (targetObject.width) updates.width = targetObject.width * params.updates.scale;
            if (targetObject.height) updates.height = targetObject.height * params.updates.scale;
          }
        }
        
        // Handle style updates
        if (params.updates?.fill !== undefined) updates.fill = params.updates.fill;
        if (params.updates?.fontSize !== undefined) updates.fontSize = params.updates.fontSize;
        if (params.updates?.text !== undefined) updates.text = params.updates.text;
        
        console.log('[canvasActionTool] Updating object:', targetObject.id, updates);
        await updateObject(targetObject.id, updates);
        console.log('[canvasActionTool] ✅ Update action successful');
        
        return `Updated ${targetObject.type} (ID: ${targetObject.id})`;
      }
      
      // ACTION: DELETE
      if (action === 'delete') {
        if (!params.target) {
          throw new Error('target (object ID) is required for delete action');
        }
        
        // Find by ID (primary) or fallback to description
        const targetObject = objects.find(obj => obj.id === params.target)
          || findObjectByDescription(objects, params.target);
        
        if (!targetObject) {
          return `Could not find shape with ID: ${params.target}`;
        }
        
        console.log('[canvasActionTool] Deleting object:', targetObject.id);
        await deleteObject(targetObject.id);
        console.log('[canvasActionTool] ✅ Delete action successful');
        
        return `Deleted ${targetObject.type} (ID: ${targetObject.id})`;
      }
      
      // ACTION: DUPLICATE
      if (action === 'duplicate') {
        if (!params.target) {
          throw new Error('target (object ID) is required for duplicate action');
        }
        
        // Find by ID (primary) or fallback to description
        const targetObject = objects.find(obj => obj.id === params.target)
          || findObjectByDescription(objects, params.target);
        
        if (!targetObject) {
          return `Could not find shape with ID: ${params.target}`;
        }
        
        const offset = params.offset || { x: 50, y: 50 };
        
        const duplicate: CanvasObject = {
          ...targetObject,
          id: generateId(),
          position: {
            x: targetObject.position.x + (offset.x || 0),
            y: targetObject.position.y + (offset.y || 0)
          },
          createdBy: context.userId,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        
        console.log('[canvasActionTool] Duplicating object:', duplicate);
        await createObject(duplicate);
        console.log('[canvasActionTool] ✅ Duplicate action successful');
        
        return `Created duplicate of ${targetObject.type} at offset (${offset.x || 0}, ${offset.y || 0})`;
      }
      
      // ACTION: ARRANGE
      if (action === 'arrange') {
        if (!params.targets || params.targets.length === 0) {
          throw new Error('targets (array of object IDs) is required for arrange action');
        }
        if (!params.layout) {
          throw new Error('layout configuration is required for arrange action');
        }
        
        const { direction, spacing = 20 } = params.layout;
        
        // Find all target objects by ID
        const shapesToArrange = params.targets
          .map((id: string) => objects.find(obj => obj.id === id))
          .filter((obj: CanvasObject | undefined): obj is CanvasObject => obj !== undefined);
        
        if (shapesToArrange.length === 0) {
          return 'No shapes found with the provided IDs';
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
        
        console.log('[canvasActionTool] ✅ Arrange action successful');
        return `Arranged ${shapesToArrange.length} shapes ${direction}ly with ${spacing}px spacing`;
      }
      
      throw new Error(`Unknown action: ${action}`);
    },
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// LEGACY TOOLS - DEPRECATED (Replaced by canvasActionTool)
// ═══════════════════════════════════════════════════════════════════════════
//
// WHY KEEP THESE?
// These legacy tools are kept temporarily for:
// 1. REFERENCE: Help developers understand the evolution of the architecture
// 2. COMPARISON: See what was consolidated into canvasActionTool
// 3. ROLLBACK: Safety net if new architecture has issues (unlikely)
// 4. MIGRATION: Helps during transition period
//
// REMOVAL PLAN:
// - Phase 1 (DONE): Create canvasActionTool and migrate agent
// - Phase 2 (DONE): Test thoroughly with all 8 test cases
// - Phase 3 (TODO): Remove legacy tools after 1-2 weeks of stable operation
// - Phase 4 (TODO): Clean up legacy types and references
//
// DO NOT USE THESE TOOLS IN NEW CODE.
// ═══════════════════════════════════════════════════════════════════════════

/**
 * @deprecated Use canvasActionTool instead
 * Consolidated tool for all single-shape operations.
 * Replaces: createShape, moveShape, resizeShape, rotateShape, changeColor, deleteShape, duplicateShape
 * 
 * This consolidation improves AI tool selection accuracy by reducing decision space from 7 tools to 1.
 */
export function manageShapeTool(
  context: ToolExecutionContext,
  objects: CanvasObject[],
  createObject: (object: CanvasObject) => Promise<void>,
  updateObject: (id: string, updates: Partial<CanvasObject>) => Promise<void>,
  deleteObject: (id: string) => Promise<void>
) {
  return new DynamicStructuredTool({
    name: 'manageShape',
    description: 'Manage shapes on the canvas. Supports create, update (move/resize/rotate/recolor), delete, and duplicate operations.',
    schema: z.object({
      operation: z.enum(['create', 'update', 'delete', 'duplicate']).describe('The operation to perform: create (new shape), update (modify existing), delete (remove), duplicate (copy)'),
      
      // Target (for update/delete/duplicate)
      target: z.string().optional().describe('Description of shape to target (e.g., "the circle", "red rectangle") - required for update/delete/duplicate'),
      
      // Shape type (for create)
      shapeType: z.enum(['rectangle', 'circle', 'text']).optional().describe('Type of shape to create - required for create operation'),
      
      // Position (create/update)
      position: z.object({
        x: z.number(),
        y: z.number()
      }).optional().describe('Position coordinates in pixels'),
      
      // Dimensions (create/update)
      dimensions: z.object({
        width: z.number().optional(),
        height: z.number().optional(),
        radius: z.number().optional()
      }).optional().describe('Size - use width/height for rectangles and text, radius for circles'),
      
      // Transform (create/update)
      transform: z.object({
        rotation: z.number().optional().describe('Rotation in degrees (positive = clockwise)'),
        scale: z.number().optional().describe('Scale factor (e.g., 1.5 = 150% size)')
      }).optional().describe('Transformation properties'),
      
      // Style (create/update)
      style: z.object({
        fill: z.string().optional().describe('Fill color (hex, rgb, or name)'),
        fontSize: z.number().optional().describe('Font size for text objects'),
        text: z.string().optional().describe('Text content for text objects')
      }).optional().describe('Visual styling properties'),
      
      // Offset (duplicate)
      offset: z.object({
        x: z.number(),
        y: z.number()
      }).optional().describe('Offset for duplicate operation (default: {x: 50, y: 50})')
    }),
    func: async (params: ManageShapeParams) => {
      console.log('[manageShapeTool] ✅ TOOL CALLED with operation:', params.operation, params);
      
      const { operation } = params;
      
      // OPERATION: CREATE
      if (operation === 'create') {
        if (!params.shapeType) {
          throw new Error('shapeType is required for create operation');
        }
        if (!params.position) {
          throw new Error('position is required for create operation');
        }
        
        const { shapeType, position, dimensions, transform, style } = params;
        
        const newObject: CanvasObject = {
          id: generateId(),
          type: shapeType,
          position: position,
          width: dimensions?.width || (shapeType === 'rectangle' ? 100 : shapeType === 'text' ? 200 : 100),
          height: dimensions?.height || (shapeType === 'rectangle' ? 100 : shapeType === 'text' ? 50 : 100),
          rotation: transform?.rotation || 0,
          fill: style?.fill || (shapeType === 'rectangle' ? '#3b82f6' : shapeType === 'circle' ? '#10b981' : '#000000'),
          ...(shapeType === 'circle' && { radius: dimensions?.radius || 50 }),
          ...(shapeType === 'text' && { 
            text: style?.text || 'Text', 
            fontSize: style?.fontSize || 16 
          }),
          createdBy: context.userId,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        } as CanvasObject;
        
        console.log('[manageShapeTool] Creating object:', newObject);
        await createObject(newObject);
        console.log('[manageShapeTool] ✅ Create operation successful');
        
        return `Created ${shapeType} at position (${position.x}, ${position.y})`;
      }
      
      // OPERATION: UPDATE
      if (operation === 'update') {
        if (!params.target) {
          throw new Error('target is required for update operation');
        }
        
        const targetObject = findObjectByDescription(objects, params.target);
        if (!targetObject) {
          return `Could not find shape matching: ${params.target}`;
        }
        
        const updates: Partial<CanvasObject> = {};
        
        // Handle position update
        if (params.position) {
          updates.position = params.position;
        }
        
        // Handle dimension updates
        if (params.dimensions) {
          if (params.dimensions.width !== undefined) updates.width = params.dimensions.width;
          if (params.dimensions.height !== undefined) updates.height = params.dimensions.height;
          if (params.dimensions.radius !== undefined) updates.radius = params.dimensions.radius;
        }
        
        // Handle transform updates
        if (params.transform) {
          if (params.transform.rotation !== undefined) {
            updates.rotation = (targetObject.rotation || 0) + params.transform.rotation;
          }
          if (params.transform.scale !== undefined) {
            // Apply scale
            if (targetObject.type === 'circle' && targetObject.radius) {
              updates.radius = targetObject.radius * params.transform.scale;
            } else {
              if (targetObject.width) updates.width = targetObject.width * params.transform.scale;
              if (targetObject.height) updates.height = targetObject.height * params.transform.scale;
            }
          }
        }
        
        // Handle style updates
        if (params.style) {
          if (params.style.fill !== undefined) updates.fill = params.style.fill;
          if (params.style.fontSize !== undefined) updates.fontSize = params.style.fontSize;
          if (params.style.text !== undefined) updates.text = params.style.text;
        }
        
        console.log('[manageShapeTool] Updating object:', targetObject.id, updates);
        await updateObject(targetObject.id, updates);
        console.log('[manageShapeTool] ✅ Update operation successful');
        
        return `Updated ${targetObject.type}`;
      }
      
      // OPERATION: DELETE
      if (operation === 'delete') {
        if (!params.target) {
          throw new Error('target is required for delete operation');
        }
        
        const targetObject = findObjectByDescription(objects, params.target);
        if (!targetObject) {
          return `Could not find shape matching: ${params.target}`;
        }
        
        console.log('[manageShapeTool] Deleting object:', targetObject.id);
        await deleteObject(targetObject.id);
        console.log('[manageShapeTool] ✅ Delete operation successful');
        
        return `Deleted ${targetObject.type}`;
      }
      
      // OPERATION: DUPLICATE
      if (operation === 'duplicate') {
        if (!params.target) {
          throw new Error('target is required for duplicate operation');
        }
        
        const targetObject = findObjectByDescription(objects, params.target);
        if (!targetObject) {
          return `Could not find shape matching: ${params.target}`;
        }
        
        const offset = params.offset || { x: 50, y: 50 };
        
        const duplicate: CanvasObject = {
          ...targetObject,
          id: generateId(),
          position: {
            x: targetObject.position.x + offset.x,
            y: targetObject.position.y + offset.y
          },
          createdBy: context.userId,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        
        console.log('[manageShapeTool] Duplicating object:', duplicate);
        await createObject(duplicate);
        console.log('[manageShapeTool] ✅ Duplicate operation successful');
        
        return `Created duplicate of ${targetObject.type} at offset (${offset.x}, ${offset.y})`;
      }
      
      throw new Error(`Unknown operation: ${operation}`);
    },
  });
}

// ============================================================================
// LEGACY TOOLS (TO BE REMOVED - Kept temporarily for reference)
// ============================================================================

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

/**
 * @deprecated Use canvasActionTool with action='arrange' instead
 */
export function arrangeShapesTool(
  objects: CanvasObject[],
  updateObject: (id: string, updates: Partial<CanvasObject>) => Promise<void>
) {
  return new DynamicStructuredTool({
    name: 'arrangeShapes',
    description: 'Arrange multiple shapes in a horizontal or vertical layout with even spacing.',
    schema: z.object({
      direction: z.enum(['horizontal', 'vertical']).describe('Direction to arrange shapes'),
      spacing: z.number().optional().nullable().describe('Space between shapes in pixels (default: 20)'),
      targetDescriptions: z.array(z.string()).optional().nullable().describe('Descriptions of specific shapes to arrange (if not provided, arranges all shapes)'),
    }),
    func: async (params) => {
      const { direction, spacing, targetDescriptions } = params;
      const finalSpacing = spacing ?? 20;
      
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
          currentPosition += shapeWidth + finalSpacing;
        } else {
          await updateObject(shape.id, { position: { x: shape.position.x, y: currentPosition } });
          const shapeHeight = shape.type === 'circle' && shape.radius ? shape.radius * 2 : shape.height;
          currentPosition += shapeHeight + finalSpacing;
        }
      }
      
      return `Arranged ${shapesToArrange.length} shapes ${direction}ly with ${finalSpacing}px spacing`;
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
      offsetX: z.number().optional().nullable().describe('Horizontal offset from original (default: 50)'),
      offsetY: z.number().optional().nullable().describe('Vertical offset from original (default: 50)'),
    }),
    func: async (params) => {
      const { targetDescription, offsetX, offsetY } = params;
      const finalOffsetX = offsetX ?? 50;
      const finalOffsetY = offsetY ?? 50;
      
      const targetObject = findObjectByDescription(objects, targetDescription);
      if (!targetObject) {
        return `Could not find shape matching: ${targetDescription}`;
      }
      
      const duplicate: CanvasObject = {
        ...targetObject,
        id: generateId(),
        position: {
          x: targetObject.position.x + finalOffsetX,
          y: targetObject.position.y + finalOffsetY
        },
        createdBy: context.userId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      
      await createObject(duplicate);
      
      return `Created duplicate of ${targetObject.type} at offset (${finalOffsetX}, ${finalOffsetY})`;
    },
  });
}

/**
 * @deprecated Deferred to Phase 2 - Complex layouts will be handled by a dedicated tool
 */
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
      colorScheme: z.string().optional().nullable().describe('Color scheme for the form (e.g., "blue", "purple")'),
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

/**
 * @deprecated Deferred to Phase 2 - Complex layouts will be handled by a dedicated tool
 */
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
      title: z.string().optional().nullable().describe('Title text for the card'),
      description: z.string().optional().nullable().describe('Description text for the card'),
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

