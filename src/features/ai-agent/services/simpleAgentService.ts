// Simple AI Agent Service - Fully self-contained feature module with ReAct agent loop
// This file handles ALL AI agent logic, configuration, and validation
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import type { AIAction, AIAgentResponse } from '../types';

// Public API - Request/Response interfaces
interface CommandRequest {
  command: string;
  userName: string;
  canvasId: string;
  userId: string;
  objectCount?: number;  // Optional: client can send current object count
  objects?: unknown[];  // Optional: client can send current objects for agent context
}

// Main entry point - Feature is fully self-contained
export async function executeAICommand(request: CommandRequest): Promise<AIAgentResponse> {
  try {
    console.log('[AI Agent] Received request:', { 
      command: request.command, 
      userName: request.userName,
      objectCount: request.objects?.length || request.objectCount || 0
    });
    
    // Get OpenAI API key from environment (NOT LangChain/LangSmith key)
    const openAiApiKey = process.env.OPENAI_API_KEY;
    
    console.log('[AI Agent] OpenAI API key check:', {
      exists: !!openAiApiKey,
      keyPrefix: openAiApiKey?.slice(0, 7) || 'NOT_FOUND',
      keyEnding: openAiApiKey?.slice(-4) || 'NOT_FOUND',
    });
    
    if (!openAiApiKey) {
      throw new Error('OpenAI API key not configured. Add OPENAI_API_KEY to your .env.local file.');
    }
    
    // Validate request (feature's responsibility)
    if (!request.command?.trim()) {
      throw new Error('Missing required field: command');
    }
    
    if (!request.userName?.trim()) {
      throw new Error('Missing required field: userName');
    }
    
    if (!request.canvasId?.trim()) {
      throw new Error('Missing required field: canvasId');
    }
    
    if (!request.userId?.trim()) {
      throw new Error('Missing required field: userId');
    }
    
    console.log('[AI Agent] Configuration validated, creating service...');
    
    // Execute command using OpenAI API key
    const service = new SimpleAgentService(openAiApiKey, request.objects || []);
    const result = await service.executeCommand(request.command, {
      userName: request.userName,
      canvasId: request.canvasId,
      userId: request.userId,
      objectCount: request.objects?.length || request.objectCount || 0,
    });
    
    console.log('[AI Agent] Command executed successfully');
    
    return result;
    
  } catch (error) {
    // ⚠️ SECURITY: Log full error server-side only, never expose to client
    console.error('[AI Agent] Error (server-side only):', error);
    
    // Sanitize error message for client - never expose server details
    let clientMessage = 'An error occurred while processing your request.';
    
    if (error instanceof Error) {
      // Check for specific error types and provide safe, generic messages
      if (error.message.includes('API key')) {
        clientMessage = 'AI service is not properly configured. Please check server configuration.';
      } else if (error.message.includes('Missing required field')) {
        // This is safe to expose - it's input validation
        clientMessage = error.message;
      } else if (error.message.includes('rate limit')) {
        clientMessage = 'AI service is temporarily unavailable. Please try again in a moment.';
      } else if (error.message.includes('timeout')) {
        clientMessage = 'Request timed out. Please try again.';
      }
      // For all other errors, use generic message (don't leak server details)
    }
    
    return {
      message: clientMessage,
      success: false,
    };
  }
}

// Internal service class - Not exported, implementation detail
class SimpleAgentService {
  private openAiApiKey: string;
  private currentObjects: unknown[];
  private capturedActions: AIAction[] = [];
  
  constructor(openAiApiKey: string, currentObjects: unknown[] = []) {
    this.openAiApiKey = openAiApiKey;
    this.currentObjects = currentObjects;
  }
  
  async executeCommand(
    command: string, 
    context: { userName: string; canvasId: string; userId: string; objectCount: number }
  ): Promise<AIAgentResponse> {
    console.log('[AI Agent Service] Initializing ReAct agent...');
    console.log('[AI Agent Service] Using OpenAI key ending in:', this.openAiApiKey.slice(-4));
    console.log('[AI Agent Service] Canvas objects available:', this.currentObjects.length);
    
    // Check LangSmith tracing status
    const tracingEnabled = process.env.LANGCHAIN_TRACING_V2 === 'true';
    console.log('[AI Agent Service] LangSmith tracing:', tracingEnabled ? 'enabled ✓' : 'disabled');
    
    // Reset captured actions
    this.capturedActions = [];
    
    // ═══════════════════════════════════════════════════════════════════════
    // ID-BASED TARGETING PATTERN - Phase 1: Query Canvas State
    // ═══════════════════════════════════════════════════════════════════════
    // This tool provides the agent with object IDs from the canvas.
    // IDs are the ONLY reliable way to target shapes (not descriptions/colors).
    //
    // Why ID-based targeting?
    // - Eliminates ambiguity when multiple shapes match a description
    // - Prevents targeting the wrong shape (e.g., "the red circle" when there are 2)
    // - Makes agent behavior deterministic and testable
    // - Fixes tests 5-8 which failed due to description-based targeting
    //
    // Workflow: getCanvasState() → identify target ID → use ID in canvasAction()
    // ═══════════════════════════════════════════════════════════════════════
    
    // Create getCanvasState tool that returns actual canvas data
    const getCanvasStateTool = new DynamicStructuredTool({
      name: 'getCanvasState',
      description: 'Query the current state of all shapes on the canvas. Use this when: 1) User references a shape not in your recent memory, 2) User references unfamiliar terms like "square" or spatial descriptions, 3) Multiple shapes might match and you need to disambiguate, 4) You are uncertain which shape the user means.',
      schema: z.object({}), // No parameters needed
      func: async () => {
        console.log('[AI Agent] getCanvasState called - returning actual canvas data');
        
        // Capture that we're querying (but don't execute client-side)
        this.capturedActions.push({
          tool: 'getCanvasState',
          params: {},
        });
        
        // Return actual canvas state formatted for LLM with unique IDs
        // Each object includes its ID which MUST be used for subsequent operations
        const formattedObjects = this.currentObjects.map((obj) => {
          const o = obj as Record<string, unknown>;
          return {
            id: o.id,  // ← CRITICAL: This ID must be used to target this shape
            type: o.type,
            position: o.position || { x: 0, y: 0 },
            fill: o.fill || 'none',
            width: o.width,
            height: o.height,
            radius: o.radius,
          };
        });
        
        return JSON.stringify({
          objects: formattedObjects,
          count: formattedObjects.length,
          summary: `Found ${formattedObjects.length} objects on canvas: ${formattedObjects.map(o => `${o.type} (${o.fill})`).join(', ')}`
        }, null, 2);
      },
    });
    
    // ═══════════════════════════════════════════════════════════════════════
    // ID-BASED TARGETING PATTERN - Phase 2: Execute Canvas Action with ID
    // ═══════════════════════════════════════════════════════════════════════
    // This unified tool handles ALL canvas operations using IDs from getCanvasState.
    //
    // Key principle: The 'target' parameter MUST be an exact ID, never a description.
    //
    // Example workflow for "Move the blue square to the right":
    // 1. Agent calls getCanvasState() → receives [{id: "1729012345-abc123", type: "rectangle", fill: "#0000ff", width: 100, height: 100, position: {x: 200, y: 200}}]
    // 2. Agent identifies blue square = ID "1729012345-abc123" (rectangle where width===height and fill is blue)
    // 3. Agent calculates new position (move right = x + 100 = 300)
    // 4. Agent calls canvasAction({ action: "update", target: "1729012345-abc123", updates: { position: {x: 300, y: 200} } })
    //
    // This pattern ensures the correct shape is targeted every time.
    // ═══════════════════════════════════════════════════════════════════════
    
    // Create unified canvasAction tool with capture mode
    // This tool consolidates all canvas operations (create, update, delete, duplicate, arrange)
    const canvasActionToolInstance = new DynamicStructuredTool({
      name: 'canvasAction',
      description: 'Perform canvas operations: create new shapes, update existing shapes, delete shapes, duplicate shapes, or arrange multiple shapes in layouts.',
      schema: z.object({
        action: z.enum(['create', 'update', 'delete', 'duplicate', 'arrange'])
          .describe('The canvas action to perform: create (new shape), update (modify shape), delete (remove shape), duplicate (copy shape), arrange (layout multiple shapes)'),
        target: z.string().optional().nullable()
          .describe('Object ID from getCanvasState (e.g., "1729012345-abc123"). Required for update/delete/duplicate actions. Use the exact ID returned by getCanvasState, NOT descriptions like "the circle".'),
        targets: z.array(z.string()).optional().nullable()
          .describe('Array of object IDs from getCanvasState. Required for arrange action. Use exact IDs, not descriptions.'),
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
        layout: z.object({
          direction: z.enum(['horizontal', 'vertical']).describe('Layout direction'),
          spacing: z.number().optional().describe('Space between shapes in pixels (default: 20)')
        }).optional().nullable().describe('Layout configuration for arrange action'),
        offset: z.object({
          x: z.number().optional(),
          y: z.number().optional()
        }).optional().nullable().describe('Offset for duplicate action (default: {x: 50, y: 50})')
      }),
      func: async (params: Record<string, unknown>) => {
        console.log('[AI Agent] canvasAction called:', params.action, params);
        
        // Capture action for client-side execution
        this.capturedActions.push({
          tool: 'canvasAction',
          params: params,
        });
        
        // Return descriptive result for LLM to understand what happened
        const { action, shape, target, targets } = params as {
          action: string;
          shape?: { style?: { fill?: string }; type?: string };
          target?: string;
          targets?: unknown[];
        };
        
        if (action === 'create') {
          const color = shape?.style?.fill || 'colored';
          return `Successfully prepared to create a ${color} ${shape?.type}. Client will execute.`;
        }
        if (action === 'update') {
          return `Successfully prepared to update shape (ID: ${target}). Client will execute.`;
        }
        if (action === 'delete') {
          return `Successfully prepared to delete shape (ID: ${target}). Client will execute.`;
        }
        if (action === 'duplicate') {
          return `Successfully prepared to duplicate shape (ID: ${target}). Client will execute.`;
        }
        if (action === 'arrange') {
          return `Successfully prepared to arrange ${targets?.length || 0} shapes. Client will execute.`;
        }
        
        return `Successfully prepared ${action} action`;
      },
    });
    
    // Create tools array with only 2 tools (reduced from 5)
    const tools = [
      getCanvasStateTool,
      canvasActionToolInstance,
    ];
    
    console.log('[AI Agent Service] Created', tools.length, 'tools:', tools.map(t => t.name).join(', '));
    
    // Create ChatOpenAI model
    const model = new ChatOpenAI({
      modelName: 'gpt-4o-mini',
      openAIApiKey: this.openAiApiKey,
      temperature: 0.7,
    });
    
    // ═══════════════════════════════════════════════════════════════════════
    // SYSTEM PROMPT - Teaches agent the ID-based targeting pattern
    // ═══════════════════════════════════════════════════════════════════════
    // This prompt is critical for ensuring the agent:
    // 1. Always calls getCanvasState() before targeting existing shapes
    // 2. Uses exact IDs (not descriptions) in the 'target' parameter
    // 3. Calculates positions correctly for relative movements
    // 4. Translates user vocabulary (e.g., "square" = rectangle where width===height)
    //
    // The prompt contains explicit examples and anti-patterns to guide the LLM.
    // ═══════════════════════════════════════════════════════════════════════
    
    // Create system message with ID-based targeting workflow
    const systemMessage = new SystemMessage(`You are a helpful AI assistant for a collaborative canvas application.

The user's name is ${context.userName}. You have access to 2 powerful tools that let you manipulate the canvas.

IMPORTANT: When users ask you to do something, you MUST use the appropriate tool. Do not just describe what you would do - actually call the tool.

Available Tools:
1. getCanvasState - Query current canvas state and get object IDs
2. canvasAction - Perform all canvas operations (create, update, delete, duplicate, arrange)

CRITICAL: ID-BASED TARGETING
When modifying existing shapes, you MUST use object IDs from getCanvasState, NOT descriptions.

✅ CORRECT: canvasAction({ action: "update", target: "1729012345-abc123", updates: {...} })
❌ WRONG: canvasAction({ action: "update", target: "the circle", updates: {...} })

WORKFLOW FOR EXISTING SHAPES:
Step 1: Call getCanvasState() to get object IDs
Step 2: Identify the target shape's ID from the returned data
Step 3: Call canvasAction() using that exact ID

Example:
User: "Move the blue square to the right"
Step 1: getCanvasState() returns:
  [{ id: "1729012345-abc123", type: "rectangle", fill: "#0000ff", width: 100, height: 100, position: {x: 200, y: 200} }]
Step 2: Identify blue square = ID "1729012345-abc123" (rectangle where width===height and fill is blue)
Step 3: Calculate new position (move right = current x + 100 = 300)
Step 4: canvasAction({ action: "update", target: "1729012345-abc123", updates: { position: {x: 300, y: 200} } })

VOCABULARY TRANSLATION:
- "square" = rectangle where width === height
- "box" = rectangle
- "oval" = circle
- "move to the right" = increase x position by ~100px
- "move left" = decrease x position by ~100px
- "move up" = decrease y position by ~100px
- "move down" = increase y position by ~100px
- "twice as big" = scale: 2
- "half the size" = scale: 0.5

RELATIVE POSITIONING:
When user says "move [direction]" or "move X pixels [direction]":
1. Call getCanvasState() to get current position
2. Calculate new position: current + offset
3. Use canvasAction with new absolute position

Examples:
- "Move 100 pixels to the right" → current x + 100
- "Move it down" → current y + 100
- "Shift left by 50" → current x - 50

canvasAction USAGE:

action="create" (no query needed):
  canvasAction({ 
    action: "create", 
    shape: { 
      type: "circle", 
      position: {x: 300, y: 200}, 
      dimensions: {radius: 50}, 
      style: {fill: "#ff0000"} 
    } 
  })

action="update" (query first for ID):
  canvasAction({ 
    action: "update", 
    target: "<ID from getCanvasState>", 
    updates: { position: {x: 400, y: 300} } 
  })

action="delete" (query first for ID):
  canvasAction({ 
    action: "delete", 
    target: "<ID from getCanvasState>" 
  })

action="duplicate" (query first for ID):
  canvasAction({ 
    action: "duplicate", 
    target: "<ID from getCanvasState>", 
    offset: {x: 50, y: 50} 
  })

action="arrange" (query first for IDs):
  canvasAction({ 
    action: "arrange", 
    targets: ["<ID1>", "<ID2>", "<ID3>"], 
    layout: { direction: "horizontal", spacing: 20 } 
  })

Guidelines:
- Default positions: 200-400 for x and y (center of typical canvas)
- Default sizes: rectangles 100x100, circles radius=50, text 200x50
- Colors: Use hex codes (#ff0000 for red, #0000ff for blue, #00ff00 for green, #9333ea for purple, #000000 for black, #ffffff for white)
- Always use IDs for targeting existing shapes
- Calculate relative movements based on current position from getCanvasState
- Be conversational and confirm what you did using natural language

The canvas currently has ${context.objectCount} object(s).`);
    
    // Create ReAct agent with LangGraph
    console.log('[AI Agent Service] Creating ReAct agent executor...');
    const agent = createReactAgent({
      llm: model,
      tools: tools,
    });
    
    // Invoke agent with messages
    console.log('[AI Agent Service] Invoking agent...');
    const result = await agent.invoke({
      messages: [systemMessage, new HumanMessage(command)],
    });
    
    console.log('[AI Agent Service] Agent execution complete');
    console.log('[AI Agent Service] Messages in result:', result.messages?.length || 0);
    console.log('[AI Agent Service] Actions captured:', this.capturedActions.length);
    
    // Generate final response from captured actions
    const finalResponse = this.generateResponse(this.capturedActions);
    
    return {
      message: finalResponse,
      actions: this.capturedActions,
      success: true,
    };
  }
  
  /**
   * Translate hex color codes to human-readable color names
   */
  private translateColor(hexColor: string | undefined): string {
    if (!hexColor) return 'colored';
    
    // Color map for basic colors (case-insensitive)
    const colorMap: Record<string, string> = {
      '#ff0000': 'red',
      '#0000ff': 'blue',
      '#00ff00': 'green',
      '#9333ea': 'purple',
      '#000000': 'black',
      '#ffffff': 'white',
    };
    
    const lowerHex = hexColor.toLowerCase();
    return colorMap[lowerHex] || hexColor;
  }
  
  private generateResponse(actions: AIAction[]): string {
    // Filter out query-only tools
    const actionableTools = actions.filter(a => a.tool !== 'getCanvasState');
    
    if (actionableTools.length === 0) {
      return "I've checked the canvas. Let me know what you'd like me to do!";
    }
    
    const descriptions = actionableTools.map(action => {
      // Handle new canvasAction tool
      if (action.tool === 'canvasAction') {
        const { action: actionType, shape, targets } = action.params as {
          action: string;
          shape?: { style?: { fill?: string }; type?: string };
          targets?: unknown[];
        };
        
        if (actionType === 'create' && shape) {
          const color = this.translateColor(shape.style?.fill);
          return `created a ${color} ${shape.type}`;
        }
        if (actionType === 'update') {
          return `updated the shape`;
        }
        if (actionType === 'delete') {
          return `deleted the shape`;
        }
        if (actionType === 'duplicate') {
          return `duplicated the shape`;
        }
        if (actionType === 'arrange') {
          const count = targets?.length || 0;
          return `arranged ${count} shapes`;
        }
      }
      
      // Legacy tool support (for backward compatibility during transition)
      if (action.tool === 'manageShape') {
        const { operation, shapeType, style, target } = action.params as {
          operation: string;
          shapeType?: string;
          style?: { fill?: string };
          target?: string;
        };
        
        if (operation === 'create') {
          const color = this.translateColor(style?.fill);
          return `created a ${color} ${shapeType}`;
        }
        if (operation === 'update') {
          return `updated the ${target}`;
        }
        if (operation === 'delete') {
          return `deleted the ${target}`;
        }
        if (operation === 'duplicate') {
          return `duplicated the ${target}`;
        }
      }
      
      if (action.tool === 'arrangeShapes') {
        return 'arranged the shapes';
      }
      
      if (action.tool === 'createLoginForm') {
        return 'created a login form';
      }
      
      if (action.tool === 'createCardLayout') {
        return 'created a card layout';
      }
      
      return `executed ${action.tool}`;
    }).filter(Boolean);
    
    return descriptions.length > 0 
      ? `I've ${descriptions.join(' and ')}!`
      : "Done!";
  }
}
