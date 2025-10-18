// AI Agent Zustand Store
import { create } from 'zustand';
import type { AIMessage, AIAgentState } from '../types';

interface AIAgentStore extends AIAgentState {
  addMessage: (message: Omit<AIMessage, 'id' | 'timestamp'>) => void;
  setProcessing: (isProcessing: boolean) => void;
  setError: (error: string | null) => void;
  clearMessages: () => void;
  clearError: () => void;
}

export const useAIAgentStore = create<AIAgentStore>((set) => ({
  // Initial state
  messages: [],
  isProcessing: false,
  error: null,
  
  // Actions
  addMessage: (message) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          ...message,
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now(),
        },
      ],
    })),
  
  setProcessing: (isProcessing) => set({ isProcessing }),
  
  setError: (error) => set({ error }),
  
  clearMessages: () => set({ messages: [] }),
  
  clearError: () => set({ error: null }),
}));

