// Simple AI Agent Service - Fully self-contained feature module
// This file handles ALL AI agent logic, configuration, and validation
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { createShapeTool } from '../lib/tools';
import type { ToolExecutionContext, AIAction, AIAgentResponse } from '../types';

// Public API - Request/Response interfaces
interface CommandRequest {
  command: string;
  userName: string;
  canvasId: string;
  userId: string;
  objectCount?: number;  // Optional: client can send current object count to avoid server fetching
}

// Main entry point - Feature is fully self-contained
export async function executeAICommand(request: CommandRequest): Promise<AIAgentResponse> {
  try {
    console.log('[AI Agent] Received request:', { 
      command: request.command, 
      userName: request.userName 
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
    const service = new SimpleAgentService(openAiApiKey);
    const result = await service.executeCommand(request.command, {
      userName: request.userName,
      canvasId: request.canvasId,
      userId: request.userId,
      objectCount: request.objectCount || 0,
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
  private capturedActions: AIAction[] = [];
  
  constructor(openAiApiKey: string) {
    this.openAiApiKey = openAiApiKey;
  }
  
  async executeCommand(
    command: string, 
    context: { userName: string; canvasId: string; userId: string; objectCount: number }
  ): Promise<AIAgentResponse> {
    console.log('[AI Agent Service] Initializing agent...');
    console.log('[AI Agent Service] Using OpenAI key ending in:', this.openAiApiKey.slice(-4));
    
    // Check LangSmith tracing status
    const tracingEnabled = process.env.LANGCHAIN_TRACING_V2 === 'true';
    console.log('[AI Agent Service] LangSmith tracing:', tracingEnabled ? 'enabled ✓' : 'disabled');
    
    // Reset captured actions
    this.capturedActions = [];
    
    // Create tool execution context
    const toolContext: ToolExecutionContext = {
      canvasId: context.canvasId,
      userId: context.userId,
      userName: context.userName,
    };
    
    // Create tools that capture actions instead of executing them
    // We pass a no-op async function - the tool will be called, we'll capture from intermediateSteps
    const tools = [
      createShapeTool(toolContext, async (object) => {
        // Capture the action - this WILL be called when tool executes
        console.log('[AI Agent] Tool executed, capturing action for:', object.type);
        this.capturedActions.push({
          tool: 'createShape',
          params: {
            type: object.type,
            x: object.position.x,
            y: object.position.y,
            width: object.width,
            height: object.height,
            rotation: object.rotation,
            fill: object.fill,
            ...(object.type === 'circle' && { radius: object.radius }),
            ...(object.type === 'text' && { 
              text: object.text, 
              fontSize: object.fontSize 
            }),
          },
        });
        // Return void - we're just capturing, not actually persisting
        return Promise.resolve();
      }),
    ];
    
    console.log('[AI Agent Service] Created', tools.length, 'tools:', tools.map(t => t.name).join(', '));
    
    // Create model and bind tools directly
    const model = new ChatOpenAI({
      modelName: 'gpt-4o-mini',
      openAIApiKey: this.openAiApiKey,
      temperature: 0.7,
    });
    
    // Bind tools to model for native OpenAI function calling
    // Must convert Zod schema to JSON Schema format for OpenAI
    const modelWithTools = model.bind({
      tools: [
        {
          type: 'function' as const,
          function: {
            name: 'createShape',
            description: 'Create a new shape on the canvas. Supports rectangles, circles, and text.',
            parameters: {
              type: 'object',
              properties: {
                type: {
                  type: 'string',
                  enum: ['rectangle', 'circle', 'text'],
                  description: 'The type of shape to create',
                },
                x: {
                  type: 'number',
                  description: 'X position on the canvas',
                },
                y: {
                  type: 'number',
                  description: 'Y position on the canvas',
                },
                width: {
                  type: 'number',
                  description: 'Width of the shape (for rectangles and text)',
                },
                height: {
                  type: 'number',
                  description: 'Height of the shape (for rectangles and text)',
                },
                radius: {
                  type: 'number',
                  description: 'Radius of the shape (for circles)',
                },
                fill: {
                  type: 'string',
                  description: 'Fill color (e.g., "red", "#FF0000")',
                },
                text: {
                  type: 'string',
                  description: 'Text content (for text objects)',
                },
                fontSize: {
                  type: 'number',
                  description: 'Font size (for text objects)',
                },
              },
              required: ['type', 'x', 'y'],
            },
          },
        },
      ],
    });
    
    // Create system message
    const systemMessage = new SystemMessage(`You are a helpful AI assistant for a collaborative canvas application.

The user's name is ${context.userName}. You have access to tools that let you create shapes on the canvas.

IMPORTANT: When users ask you to create shapes, you MUST use the createShape tool. Do not just describe what you would do - actually call the tool.

Examples of commands you should handle with the createShape tool:
- "Create a red circle at position 100, 200" → Use createShape with type='circle', x=100, y=200, fill='#ff0000'
- "Make a 200x300 rectangle" → Use createShape with type='rectangle', width=200, height=300
- "Add text that says Hello" → Use createShape with type='text', text='Hello'

Guidelines for using the createShape tool:
- Default positions: 200-400 for x and y (center of typical canvas)
- Default sizes: rectangles 100x100, circles radius=50, text 200x50
- Colors: Use hex codes (#ff0000 for red, #0000ff for blue, #00ff00 for green, etc.)
- Always be conversational and confirm what you created

The canvas currently has ${context.objectCount} object(s).`);
    
    // Call model with tools
    console.log('[AI Agent Service] Calling OpenAI with bound tools...');
    const response = await modelWithTools.invoke([
      systemMessage,
      new HumanMessage(command),
    ]);
    
    console.log('[AI Agent Service] OpenAI response received');
    console.log('[AI Agent Service] Response has tool_calls:', !!(response as any).additional_kwargs?.tool_calls);
    
    // Check if AI wants to call tools
    const toolCalls = (response as any).additional_kwargs?.tool_calls;
    
    if (toolCalls && toolCalls.length > 0) {
      console.log('[AI Agent Service] Processing', toolCalls.length, 'tool call(s)...');
      
      for (const toolCall of toolCalls) {
        const toolName = toolCall.function.name;
        const toolArgs = JSON.parse(toolCall.function.arguments);
        
        console.log('[AI Agent Service] Tool call:', toolName, toolArgs);
        
        // Find and execute the tool
        const tool = tools.find(t => t.name === toolName);
        if (tool) {
          try {
            await tool.func(toolArgs);
            console.log('[AI Agent Service] Tool executed successfully');
          } catch (error) {
            console.error('[AI Agent Service] Tool execution error:', error);
          }
        }
      }
      
      console.log('[AI Agent Service] Actions captured:', this.capturedActions.length);
      
      // Generate final response
      const finalResponse = `I've ${toolCalls.length === 1 ? 'created' : 'completed'} ${toolCalls.map((tc: any) => {
        const args = JSON.parse(tc.function.arguments);
        return `a ${args.fill || 'colored'} ${args.type}`;
      }).join(' and ')} on the canvas!`;
      
      return {
        message: finalResponse,
        actions: this.capturedActions,
        success: true,
      };
    }
    
    // No tools called - just return the AI's message
    console.log('[AI Agent Service] No tools called, returning conversational response');
    return {
      message: typeof response.content === 'string' ? response.content : String(response.content),
      success: true,
    };
  }
}

