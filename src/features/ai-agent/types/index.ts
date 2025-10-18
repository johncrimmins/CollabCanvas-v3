// AI Agent Types

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface AIAgentState {
  messages: AIMessage[];
  isProcessing: boolean;
  error: string | null;
}

export interface ToolExecutionContext {
  canvasId: string;
  userId: string;
  userName: string;
}

/**
 * Action types that the AI can request (executed client-side).
 * 
 * @remarks
 * Actions are captured server-side by the AI agent and sent to the client for execution.
 * This maintains the separation between AI decision-making and canvas manipulation.
 * 
 * Available tools (Phase 1 - Consolidated):
 * - getCanvasState: Query current canvas state with object IDs
 * - canvasAction: Unified tool for all canvas operations (create, update, delete, duplicate, arrange)
 * 
 * Legacy tools (deprecated but still supported):
 * - manageShape: Replaced by canvasAction
 * - arrangeShapes: Replaced by canvasAction with action='arrange'
 * - createLoginForm: Deferred to Phase 2
 * - createCardLayout: Deferred to Phase 2
 */
export interface AIAction {
  /**
   * The tool to execute. 
   * Phase 1: Use 'canvasAction' for all canvas operations
   * Legacy: 'manageShape', 'arrangeShapes', etc. still supported for backward compatibility
   */
  tool: 'getCanvasState' | 'canvasAction' | 'manageShape' | 'arrangeShapes' | 'createLoginForm' | 'createCardLayout';
  
  /**
   * Parameters for the tool execution.
   * Type varies based on the tool selected.
   */
  params: Record<string, unknown>;
}

export interface AIAgentResponse {
  message: string;           // Conversational response to show user
  actions?: AIAction[];      // Tool calls to execute client-side
  success: boolean;
}

export interface CreateShapeParams {
  type: 'rectangle' | 'circle' | 'text';
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  fill?: string;
  text?: string;
  fontSize?: number;
}

export interface MoveShapeParams {
  targetDescription: string;
  x?: number;
  y?: number;
  deltaX?: number;
  deltaY?: number;
}

export interface ResizeShapeParams {
  targetDescription: string;
  width?: number;
  height?: number;
  scale?: number;
}

export interface RotateShapeParams {
  targetDescription: string;
  degrees: number;
}

export interface ChangeColorParams {
  targetDescription: string;
  color: string;
}

export interface ArrangeShapesParams {
  direction: 'horizontal' | 'vertical';
  spacing?: number;
  targetDescriptions?: string[];
}

export interface DeleteShapeParams {
  targetDescription: string;
}

export interface DuplicateShapeParams {
  targetDescription: string;
  offsetX?: number;
  offsetY?: number;
}

export interface CreateLoginFormParams {
  x: number;
  y: number;
  colorScheme?: string;
}

export interface CreateCardLayoutParams {
  x: number;
  y: number;
  title?: string;
  description?: string;
}

/**
 * Type representing the operation to perform on a shape.
 * Used by the ManageShapeParams interface to determine the action type.
 * 
 * @remarks
 * - "create": Creates a new shape on the canvas
 * - "update": Modifies properties of an existing shape (position, size, rotation, color)
 * - "delete": Removes a shape from the canvas
 * - "duplicate": Creates a copy of an existing shape with an offset
 */
export type ManageShapeOperation = "create" | "update" | "delete" | "duplicate";

/**
 * Consolidated interface for all single-shape operations.
 * This interface replaces the separate CreateShapeParams, MoveShapeParams, 
 * ResizeShapeParams, RotateShapeParams, ChangeColorParams, DeleteShapeParams, 
 * and DuplicateShapeParams interfaces.
 * 
 * @example
 * // Create operation
 * { operation: "create", shapeType: "circle", position: {x: 300, y: 200}, style: {fill: "red"} }
 * 
 * @example
 * // Update operation (move and rotate)
 * { operation: "update", target: "circle", position: {x: 500, y: 500}, transform: {rotation: 45} }
 * 
 * @example
 * // Delete operation
 * { operation: "delete", target: "rectangle" }
 * 
 * @example
 * // Duplicate operation
 * { operation: "duplicate", target: "circle", offset: {x: 50, y: 50} }
 */
export interface ManageShapeParams {
  /**
   * The type of operation to perform on the shape.
   * - "create": Create a new shape
   * - "update": Modify an existing shape (move, resize, rotate, recolor)
   * - "delete": Remove a shape from the canvas
   * - "duplicate": Copy a shape with an offset
   */
  operation: ManageShapeOperation;

  /**
   * Description of the target shape for update/delete/duplicate operations.
   * Examples: "the circle", "red rectangle", "text at the top"
   * Not used for create operations.
   */
  target?: string;

  /**
   * The type of shape to create (only for create operations).
   * - "rectangle": Rectangular shape
   * - "circle": Circular shape
   * - "text": Text object
   */
  shapeType?: "rectangle" | "circle" | "text";

  /**
   * Position coordinates for create/update operations.
   * For create: Specifies initial position
   * For update: Moves shape to this position
   */
  position?: {
    /** X coordinate in pixels */
    x: number;
    /** Y coordinate in pixels */
    y: number;
  };

  /**
   * Dimensions for create/update operations.
   * Use width/height for rectangles and text.
   * Use radius for circles.
   */
  dimensions?: {
    /** Width in pixels (for rectangles and text) */
    width?: number;
    /** Height in pixels (for rectangles and text) */
    height?: number;
    /** Radius in pixels (for circles) */
    radius?: number;
  };

  /**
   * Transformation properties for create/update operations.
   */
  transform?: {
    /** Rotation angle in degrees (positive = clockwise) */
    rotation?: number;
    /** Scale factor for resize operations (e.g., 1.5 = 150% of original size) */
    scale?: number;
  };

  /**
   * Visual styling properties for create/update operations.
   */
  style?: {
    /** Fill color (hex, rgb, or color name like "red", "blue") */
    fill?: string;
    /** Font size in pixels (for text objects only) */
    fontSize?: number;
    /** Text content (for text objects only) */
    text?: string;
  };

  /**
   * Offset for duplicate operations.
   * Specifies how far from the original shape to place the duplicate.
   * Defaults to {x: 50, y: 50} if not specified.
   */
  offset?: {
    /** Horizontal offset in pixels */
    x: number;
    /** Vertical offset in pixels */
    y: number;
  };
}

// ============================================================================
// CANVAS ACTION TOOL - Unified Interface (Phase 1)
// ============================================================================

/**
 * Canvas action types for the unified canvasAction tool.
 * Consolidates all canvas manipulation operations into a single tool.
 * 
 * @remarks
 * This replaces the previous 5-tool architecture with a 2-tool architecture:
 * - getCanvasState (query)
 * - canvasAction (all operations)
 */
export type CanvasActionType = 'create' | 'update' | 'delete' | 'duplicate' | 'arrange';

/**
 * Shape definition for create actions.
 */
export interface ShapeDefinition {
  /** Shape type to create */
  type: 'rectangle' | 'circle' | 'text';
  
  /** Position on canvas */
  position: {
    x: number;
    y: number;
  };
  
  /** Dimensions (optional, uses defaults if not specified) */
  dimensions?: {
    width?: number;
    height?: number;
    radius?: number;
  };
  
  /** Visual styling (optional) */
  style?: {
    fill?: string;
    fontSize?: number;
    text?: string;
  };
}

/**
 * Update parameters for update actions.
 */
export interface ShapeUpdates {
  /** New position (absolute coordinates) */
  position?: {
    x: number;
    y: number;
  };
  
  /** New dimensions */
  dimensions?: {
    width?: number;
    height?: number;
    radius?: number;
  };
  
  /** Rotation in degrees (additive) */
  rotation?: number;
  
  /** Scale factor (multiplicative, e.g., 2 = twice as big) */
  scale?: number;
  
  /** New fill color */
  fill?: string;
  
  /** New text content (text shapes only) */
  text?: string;
  
  /** New font size (text shapes only) */
  fontSize?: number;
}

/**
 * Layout configuration for arrange actions.
 */
export interface LayoutConfig {
  /** Direction to arrange shapes */
  direction: 'horizontal' | 'vertical';
  
  /** Spacing between shapes in pixels (default: 20) */
  spacing?: number;
}

/**
 * Unified interface for all canvas operations.
 * 
 * This interface consolidates the previous tool-specific interfaces into a single,
 * action-based interface that supports all canvas manipulation operations.
 * 
 * @remarks
 * Key Design Principles:
 * - ID-based targeting: Use exact object IDs from getCanvasState, not descriptions
 * - Action-based routing: Single 'action' field determines operation type
 * - Type safety: All parameters are strongly typed based on action type
 * 
 * @example
 * // Create a new shape
 * {
 *   action: 'create',
 *   shape: {
 *     type: 'circle',
 *     position: { x: 300, y: 200 },
 *     dimensions: { radius: 50 },
 *     style: { fill: '#ff0000' }
 *   }
 * }
 * 
 * @example
 * // Update existing shape (using ID from getCanvasState)
 * {
 *   action: 'update',
 *   target: '1729012345-abc123',
 *   updates: {
 *     position: { x: 400, y: 300 },
 *     scale: 2
 *   }
 * }
 * 
 * @example
 * // Delete shape
 * {
 *   action: 'delete',
 *   target: '1729012345-abc123'
 * }
 * 
 * @example
 * // Duplicate shape
 * {
 *   action: 'duplicate',
 *   target: '1729012345-abc123',
 *   offset: { x: 50, y: 50 }
 * }
 * 
 * @example
 * // Arrange multiple shapes
 * {
 *   action: 'arrange',
 *   targets: ['id1', 'id2', 'id3'],
 *   layout: { direction: 'horizontal', spacing: 20 }
 * }
 */
export interface CanvasActionParams {
  /**
   * The canvas action to perform.
   * Determines which other parameters are required.
   */
  action: CanvasActionType;
  
  /**
   * Target object ID for update/delete/duplicate actions.
   * 
   * CRITICAL: Must be exact object ID from getCanvasState (e.g., "1729012345-abc123"),
   * NOT a description like "the circle" or "red rectangle".
   * 
   * Required for: update, delete, duplicate
   * Not used for: create, arrange
   */
  target?: string;
  
  /**
   * Array of target object IDs for arrange action.
   * 
   * CRITICAL: Must be exact object IDs from getCanvasState.
   * 
   * Required for: arrange
   * Not used for: create, update, delete, duplicate
   */
  targets?: string[];
  
  /**
   * Shape definition for create action.
   * 
   * Required for: create
   * Not used for: update, delete, duplicate, arrange
   */
  shape?: ShapeDefinition;
  
  /**
   * Updates to apply for update action.
   * 
   * Required for: update
   * Not used for: create, delete, duplicate, arrange
   */
  updates?: ShapeUpdates;
  
  /**
   * Layout configuration for arrange action.
   * 
   * Required for: arrange
   * Not used for: create, update, delete, duplicate
   */
  layout?: LayoutConfig;
  
  /**
   * Offset for duplicate action.
   * Defaults to { x: 50, y: 50 } if not specified.
   * 
   * Optional for: duplicate
   * Not used for: create, update, delete, arrange
   */
  offset?: {
    x?: number;
    y?: number;
  };
}

