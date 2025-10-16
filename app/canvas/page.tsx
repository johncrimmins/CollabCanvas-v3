// Canvas page - main collaborative canvas
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ProtectedRoute, UserProfile, useAuthStore } from '@/features/auth';
import { Canvas, CanvasToolbar } from '@/features/canvas';
import { OnlineUsers, usePresenceStore } from '@/features/presence';
import { ObjectRenderer, useObjects, broadcastShapePreview, subscribeToShapePreviews } from '@/features/objects';
import { ShapePreview as ShapePreviewComponent } from '@/features/objects/components/ShapePreview';
import type { ShapePreview as ShapePreviewType } from '@/features/objects/types';
import { Point } from '@/shared/types';
import { throttle } from '@/shared/lib/utils';

// Tell Next.js not to prerender this page
export const dynamic = 'force-dynamic';

export default function CanvasPage() {
  const user = useAuthStore((state) => state.user);
  const presence = usePresenceStore((state) => state.presence);
  const [canvasId, setCanvasId] = useState<string | null>(null);
  const [showOnlineUsers, setShowOnlineUsers] = useState(false);
  const [tool, setTool] = useState<'select' | 'rectangle' | 'circle'>('select');
  const [deselectTrigger, setDeselectTrigger] = useState(0);
  const [cursorPosition, setCursorPosition] = useState<Point | null>(null);
  const [shapePreviews, setShapePreviews] = useState<Record<string, ShapePreviewType>>({});
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  
  const { 
    objects, 
    createObject, 
    updateObject, 
    deleteObject,
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
  
  // Subscribe to shape previews from other users
  useEffect(() => {
    if (!canvasId) return;
    
    const unsubscribe = subscribeToShapePreviews(canvasId, (previews) => {
      setShapePreviews(previews);
    });
    
    return unsubscribe;
  }, [canvasId]);
  
  // One-time cleanup of any stale previews on mount
  useEffect(() => {
    if (!canvasId || !user) return;
    
    // Clear our own preview on mount in case we left with a preview active
    const clearPreview = async () => {
      try {
        await broadcastShapePreview(canvasId, null, user.id);
        console.log('[Preview] Cleared stale preview on mount');
      } catch (error) {
        console.error('[Preview] Failed to clear preview on mount:', error);
      }
    };
    
    clearPreview();
  }, [canvasId, user]);
  
  // Throttled function to broadcast shape preview
  const throttledBroadcastPreview = useRef(
    throttle(async (canvasId: string, preview: ShapePreviewType | null, userId: string) => {
      try {
        await broadcastShapePreview(canvasId, preview, userId);
      } catch (error) {
        console.error('Failed to broadcast shape preview:', error);
      }
    }, 16) // 60fps
  ).current;
  
  // Broadcast shape preview when cursor moves in shape creation mode
  useEffect(() => {
    if (!canvasId || !user) return;
    
    // Clear preview if switching to select tool or no cursor position
    if (tool === 'select' || !cursorPosition) {
      // Use non-throttled immediate clear
      broadcastShapePreview(canvasId, null, user.id).then(() => {
        console.log('[Preview] Cleared preview (tool or cursor changed)');
      }).catch(console.error);
      return;
    }
    
    // Broadcast preview for rectangle or circle
    // Position should match where the shape will be placed (centered on cursor)
    const preview: ShapePreviewType = {
      type: tool,
      position: { x: cursorPosition.x - 50, y: cursorPosition.y - 50 },
      width: 100,
      height: 100,
      fill: '#3B82F6',
      userId: user.id,
      userName: user.displayName || user.email || 'Anonymous',
    };
    
    // Throttle the preview updates for performance
    throttledBroadcastPreview(canvasId, preview, user.id);
  }, [canvasId, user, tool, cursorPosition, throttledBroadcastPreview]);
  
  // Cleanup: Clear shape preview on unmount or when leaving the canvas
  useEffect(() => {
    return () => {
      if (canvasId && user) {
        broadcastShapePreview(canvasId, null, user.id).catch(console.error);
      }
    };
  }, [canvasId, user]);
  
  const handlePlaceShape = useCallback(async (position: Point) => {
    if (!canvasId || tool === 'select') return;
    
    // IMMEDIATELY clear the preview BEFORE creating object
    // This ensures no throttled updates come after
    if (user) {
      await broadcastShapePreview(canvasId, null, user.id);
      console.log('[Preview] Cleared preview before placing shape');
    }
    
    // Create shape at clicked position
    await createObject({
      type: tool,
      x: position.x - 50, // Center the shape on cursor
      y: position.y - 50,
      width: 100,
      height: 100,
      fill: '#3B82F6',
    });
    
    // Switch back to select tool after placing
    // The effect will handle clearing preview when tool changes
    setTool('select');
  }, [canvasId, tool, createObject, user]);
  
  const handleCanvasClick = useCallback((position?: Point) => {
    if (tool === 'select') {
      // Increment trigger to deselect all objects
      setDeselectTrigger(prev => prev + 1);
    } else if (position) {
      // Place the shape at the clicked position
      handlePlaceShape(position);
    }
  }, [tool, handlePlaceShape]);
  
  const handleCursorMove = useCallback((position: Point) => {
    setCursorPosition(position);
  }, []);
  
  const handleObjectSelect = useCallback((objectId: string | null) => {
    setSelectedObjectId(objectId);
  }, []);
  
  const handleDeleteSelected = useCallback(async () => {
    if (selectedObjectId && canvasId) {
      try {
        await deleteObject(selectedObjectId);
        setSelectedObjectId(null);
      } catch (error) {
        console.error('Failed to delete object:', error);
      }
    }
  }, [selectedObjectId, canvasId, deleteObject]);
  
  // Keyboard shortcuts for delete
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Delete or Backspace key
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedObjectId) {
        // Prevent backspace from navigating back in browser
        e.preventDefault();
        handleDeleteSelected();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedObjectId, handleDeleteSelected]);
  
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
                  onClick={() => {
                    setTool('select');
                    // Effect will clear preview when tool changes
                  }}
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
                  onClick={() => setTool('rectangle')}
                  className={`p-2 rounded-md transition-colors ${
                    tool === 'rectangle'
                      ? 'bg-blue-100 text-blue-700'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                  title="Rectangle - Click to place"
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
                  onClick={() => setTool('circle')}
                  className={`p-2 rounded-md transition-colors ${
                    tool === 'circle'
                      ? 'bg-blue-100 text-blue-700'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                  title="Circle - Click to place"
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
          <Canvas 
            canvasId={canvasId} 
            tool={tool} 
            onCanvasClick={handleCanvasClick}
            onCursorMove={handleCursorMove}
          >
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
              onObjectSelect={handleObjectSelect}
              currentUserId={user?.id}
              presenceUsers={presence}
              deselectTrigger={deselectTrigger}
            />
            
            {/* Render shape previews from all users */}
            {Object.entries(shapePreviews).map(([userId, preview]) => {
              return (
                <ShapePreviewComponent key={userId} preview={preview} />
              );
            })}
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

