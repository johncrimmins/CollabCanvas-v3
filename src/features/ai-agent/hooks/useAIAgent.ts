// AI Agent Hook - Calls API and executes actions client-side
import { useCallback } from 'react';
import { useAIAgentStore } from '../lib/aiAgentStore';
import { createObject } from '@/features/objects/services/objectsService';
import { useObjectsStore } from '@/features/objects/lib/objectsStore';
import type { AIAction, AIAgentResponse } from '../types';
import type { CanvasObject } from '@/features/objects/types';

interface UseAIAgentProps {
  canvasId: string;
  userId: string;
  userName: string;
}

// Helper function to execute actions client-side using existing services
async function executeAction(action: AIAction, canvasId: string, userId: string): Promise<void> {
  console.log('[executeAction] Executing action:', action.tool, action.params);
  
  switch (action.tool) {
    case 'createShape': {
      const { type, x, y, width, height, rotation, fill, radius, text, fontSize } = action.params;
      
      // Build object params matching CanvasObject structure
      const objectParams: Omit<CanvasObject, 'id' | 'createdAt' | 'updatedAt'> = {
        type,
        position: { x, y },
        width: width ?? 100,
        height: height ?? 100,
        rotation: rotation ?? 0,
        fill: fill ?? '#3b82f6',
        createdBy: userId,
      };
      
      // Add type-specific fields
      if (type === 'circle' && radius) {
        (objectParams as any).radius = radius;
      }
      if (type === 'text') {
        (objectParams as any).text = text ?? 'Text';
        (objectParams as any).fontSize = fontSize ?? 16;
      }
      
      await createObject(canvasId, objectParams);
      break;
    }
    
    // Future actions can be added here:
    // case 'moveShape': { ... }
    // case 'deleteShape': { ... }
    
    default:
      console.warn('[executeAction] Unknown action type:', action.tool);
  }
}

export function useAIAgent({ canvasId, userId, userName }: UseAIAgentProps) {
  const objects = useObjectsStore((state) => state.objects);
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
        
        // Call API with current object count
        const response = await fetch('/api/ai-agent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            command: input,
            canvasId,
            userId,
            userName,
            objectCount: objects.length,  // Send current count to avoid server fetching
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
            await executeAction(action, canvasId, userId);
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
