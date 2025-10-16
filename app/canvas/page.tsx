// Canvas page - main collaborative canvas
'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute, UserProfile } from '@/features/auth';
import { Canvas, CanvasToolbar } from '@/features/canvas';
import { OnlineUsers } from '@/features/presence';
import { ObjectRenderer, useObjects } from '@/features/objects';
import { useStore } from '@/shared/lib/store';

export default function CanvasPage() {
  const user = useStore((state) => state.user);
  const presence = useStore((state) => state.presence);
  const [canvasId, setCanvasId] = useState<string | null>(null);
  const [showOnlineUsers, setShowOnlineUsers] = useState(false);
  const [tool, setTool] = useState<'select' | 'rectangle' | 'circle'>('select');
  
  const { 
    objects, 
    createObject, 
    updateObject, 
    broadcastObjectMove,
    broadcastObjectTransformStart,
    broadcastObjectTransform,
    broadcastObjectTransformEnd,
  } = useObjects(canvasId);
  
  // Initialize canvas ID (in production, this would come from route params or creation flow)
  useEffect(() => {
    // For MVP, use a default canvas or generate one
    const defaultCanvasId = 'default-canvas';
    setCanvasId(defaultCanvasId);
  }, []);
  
  const handleCreateShape = async (type: 'rectangle' | 'circle') => {
    if (!canvasId) return;
    
    // Create shape at center of viewport
    await createObject({
      type,
      x: 400,
      y: 300,
      width: 100,
      height: 100,
      fill: '#3B82F6',
    });
  };
  
  if (!canvasId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading canvas...</p>
        </div>
      </div>
    );
  }
  
  return (
    <ProtectedRoute>
      <div className="h-screen flex flex-col bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-gray-900">
                CollabCanvas
              </h1>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setTool('select')}
                  className={`p-2 rounded-md transition-colors ${
                    tool === 'select'
                      ? 'bg-blue-100 text-blue-700'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                  title="Select"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
                  </svg>
                </button>
                
                <button
                  onClick={() => {
                    setTool('rectangle');
                    handleCreateShape('rectangle');
                  }}
                  className={`p-2 rounded-md transition-colors ${
                    tool === 'rectangle'
                      ? 'bg-blue-100 text-blue-700'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                  title="Rectangle"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  </svg>
                </button>
                
                <button
                  onClick={() => {
                    setTool('circle');
                    handleCreateShape('circle');
                  }}
                  className={`p-2 rounded-md transition-colors ${
                    tool === 'circle'
                      ? 'bg-blue-100 text-blue-700'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                  title="Circle"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowOnlineUsers(!showOnlineUsers)}
                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-md transition-colors"
              >
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-sm font-medium text-gray-700">
                  {Object.keys(presence).length} online
                </span>
              </button>
              
              <UserProfile />
            </div>
          </div>
        </header>
        
        {/* Main Canvas Area */}
        <div className="flex-1 relative">
          <Canvas canvasId={canvasId} tool={tool}>
            <ObjectRenderer
              objects={objects}
              onObjectUpdate={(objectId, updates) => {
                updateObject(objectId, updates);
              }}
              onObjectDragMove={(objectId, position) => {
                broadcastObjectMove(objectId, position);
              }}
              onObjectTransformStart={(objectId) => {
                broadcastObjectTransformStart(objectId);
              }}
              onObjectTransform={(objectId, updates) => {
                broadcastObjectTransform(objectId, updates);
              }}
              onObjectTransformEnd={(objectId) => {
                broadcastObjectTransformEnd(objectId);
              }}
              currentUserId={user?.id}
              presenceUsers={presence}
            />
          </Canvas>
          
          {/* Floating Toolbar */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
            <CanvasToolbar />
          </div>
          
          {/* Online Users Panel */}
          {showOnlineUsers && (
            <div className="absolute top-4 right-4">
              <OnlineUsers presence={presence} currentUserId={user?.id} />
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

