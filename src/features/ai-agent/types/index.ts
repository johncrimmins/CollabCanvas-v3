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

// Action types that the AI can request (executed client-side)
export interface AIAction {
  tool: 'createShape' | 'moveShape' | 'resizeShape' | 'rotateShape' | 
        'changeColor' | 'arrangeShapes' | 'deleteShape' | 'duplicateShape';
  params: Record<string, any>;
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

