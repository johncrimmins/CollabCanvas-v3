// AI Agent API Route - Ultra-thin HTTP adapter
// All business logic lives in src/features/ai-agent/
import { NextRequest, NextResponse } from 'next/server';
import { executeAICommand } from '@/features/ai-agent/services/simpleAgentService';

export async function POST(request: NextRequest) {
  try {
    // 1. Parse request
    const body = await request.json();
    
    // 2. Delegate to feature (feature handles EVERYTHING)
    const result = await executeAICommand(body);
    
    // 3. Return response
    return NextResponse.json(result);
    
  } catch (error) {
    // ⚠️ SECURITY: Log full error server-side, send generic message to client
    console.error('[API Route] Unexpected error:', error);
    
    return NextResponse.json(
      { 
        message: 'An unexpected error occurred. Please try again.',
        success: false,
      },
      { status: 500 }
    );
  }
}
