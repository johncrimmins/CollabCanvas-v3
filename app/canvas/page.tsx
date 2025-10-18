// Canvas page - main collaborative canvas
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ProtectedRoute, UserProfile, useAuthStore } from '@/features/auth';
import { Canvas, CanvasToolbar } from '@/features/canvas';
import { OnlineUsers, usePresenceStore } from '@/features/presence';
import { ObjectRenderer, useObjects, broadcastShapePreview, subscribeToShapePreviews, useObjectsStore } from '@/features/objects';
import { useHistory } from '@/features/objects/hooks/useHistory';
import { ShapePreview as ShapePreviewComponent } from '@/features/objects/components/ShapePreview';
import type { ShapePreview as ShapePreviewType } from '@/features/objects/types';
import { AIChat } from '@/features/ai-agent';
import { Point } from '@/shared/types';
import { throttle } from '@/shared/lib/utils';
import { ContextMenu, type ContextMenuItem } from '@/shared/components/ContextMenu';
import { PropertyEditor } from '@/shared/components/PropertyEditor';
import { LayerPanel } from '@/features/objects/components/LayerPanel';

// Tell Next.js not to prerender this page
export const dynamic = 'force-dynamic';

export default function CanvasPage() {
  const user = useAuthStore((state) => state.user);
  const presence = usePresenceStore((state) => state.presence);
  const [canvasId, setCanvasId] = useState<string | null>(null);
  const [showOnlineUsers, setShowOnlineUsers] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [tool, setTool] = useState<'select' | 'rectangle' | 'circle' | 'arrow'>('select');
  const [deselectTrigger, setDeselectTrigger] = useState(0);
  const [cursorPosition, setCursorPosition] = useState<Point | null>(null);
  const [shapePreviews, setShapePreviews] = useState<Record<string, ShapePreviewType>>({});
  
  // Context menu state
  const [contextMenuOpen, setContextMenuOpen] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [contextMenuObjectId, setContextMenuObjectId] = useState<string | null>(null);
  
  // Property editor state
  const [propertyEditorOpen, setPropertyEditorOpen] = useState(false);
  const [propertyEditorObject, setPropertyEditorObject] = useState<typeof objects[0] | null>(null);
  
  // Get selection state and actions from store
  const selectedObjectIds = useObjectsStore((state) => state.selectedObjectIds);
  const selectObject = useObjectsStore((state) => state.selectObject);
  const clearSelection = useObjectsStore((state) => state.clearSelection);
  const setSelection = useObjectsStore((state) => state.setSelection);
  
  // Arrow drawing state
  const [isDrawingArrow, setIsDrawingArrow] = useState(false);
  const [arrowStartPoint, setArrowStartPoint] = useState<Point | null>(null);
  
  const { 
    objects, 
    createObject, 
    updateObject, 
    deleteObject,
    duplicateObject,
    broadcastObjectMove,
    broadcastObjectTransformStart,
    broadcastObjectTransform,
    broadcastObjectTransformEnd,
  } = useObjects(canvasId);
  
  // History for undo/redo
  const { undo, redo, canUndo, canRedo } = useHistory({
    canvasId,
    createObject: (params) => createObject({ ...params, isUndoRedo: true }),
    updateObject: (objectId, updates) => updateObject(objectId, updates, true),
    deleteObject: (objectId) => deleteObject(objectId, true),
  });
  
  // Initialize canvas ID (in production, this would come from route params or creation flow)
  useEffect(() => {
    // For MVP, use a default canvas or generate one
    const defaultCanvasId = 'default-canvas';
    setCanvasId(defaultCanvasId);
  }, []);
  
  // Handle AI chat toggle
  const handleAIChatToggle = useCallback(() => {
    setShowAIChat(!showAIChat);
  }, [showAIChat]);
  
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
    
    // Handle arrow preview while drawing
    if (tool === 'arrow') {
      // Only show preview if actively drawing
      if (isDrawingArrow && arrowStartPoint) {
        const points: [number, number, number, number] = [
          0,
          0,
          cursorPosition.x - arrowStartPoint.x,
          cursorPosition.y - arrowStartPoint.y,
        ];
        
        const preview: ShapePreviewType = {
          type: 'arrow',
          position: { x: arrowStartPoint.x, y: arrowStartPoint.y },
          width: Math.abs(cursorPosition.x - arrowStartPoint.x),
          height: Math.abs(cursorPosition.y - arrowStartPoint.y),
          fill: '#3B82F6',
          userId: user.id,
          userName: user.displayName || user.email || 'Anonymous',
          points,
        };
        
        throttledBroadcastPreview(canvasId, preview, user.id);
      } else {
        // Clear preview if arrow tool selected but not drawing
        broadcastShapePreview(canvasId, null, user.id).catch(console.error);
      }
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
  }, [canvasId, user, tool, cursorPosition, isDrawingArrow, arrowStartPoint, throttledBroadcastPreview]);
  
  // Cleanup: Clear shape preview on unmount or when leaving the canvas
  useEffect(() => {
    return () => {
      if (canvasId && user) {
        broadcastShapePreview(canvasId, null, user.id).catch(console.error);
      }
    };
  }, [canvasId, user]);
  
  const handlePlaceShape = useCallback(async (position: Point) => {
    if (!canvasId || tool === 'select' || tool === 'arrow') return;
    
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
  
  // Arrow creation handlers
  const handleArrowMouseDown = useCallback((position: Point) => {
    if (tool !== 'arrow' || !canvasId) return;
    
    setIsDrawingArrow(true);
    setArrowStartPoint(position);
    console.log('[Arrow] Started drawing at', position);
  }, [tool, canvasId]);
  
  const handleArrowMouseUp = useCallback(async (position: Point) => {
    if (!isDrawingArrow || !arrowStartPoint || !canvasId || !user) return;
    
    console.log('[Arrow] Finishing arrow from', arrowStartPoint, 'to', position);
    
    // Calculate arrow points relative to position (0,0)
    const points: [number, number, number, number] = [
      0, 
      0, 
      position.x - arrowStartPoint.x, 
      position.y - arrowStartPoint.y
    ];
    
    // Don't create arrow if it's too small (less than 5 pixels)
    const length = Math.sqrt(
      Math.pow(position.x - arrowStartPoint.x, 2) + 
      Math.pow(position.y - arrowStartPoint.y, 2)
    );
    
    if (length < 5) {
      console.log('[Arrow] Arrow too small, canceling');
      setIsDrawingArrow(false);
      setArrowStartPoint(null);
      // Clear preview
      await broadcastShapePreview(canvasId, null, user.id);
      return;
    }
    
    // Clear preview before creating object
    await broadcastShapePreview(canvasId, null, user.id);
    
    // Create arrow object with all properties
    await createObject({
      type: 'arrow',
      x: arrowStartPoint.x,
      y: arrowStartPoint.y,
      width: Math.abs(position.x - arrowStartPoint.x),
      height: Math.abs(position.y - arrowStartPoint.y),
      fill: '#000000',
      points,
      stroke: '#000000',
      strokeWidth: 2,
      pointerLength: 10,
      pointerWidth: 10,
    });
    
    // Reset arrow drawing state
    setIsDrawingArrow(false);
    setArrowStartPoint(null);
    
    // Switch back to select tool
    setTool('select');
  }, [isDrawingArrow, arrowStartPoint, canvasId, user, createObject]);
  
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
    if (objectId) {
      setSelection([objectId]);
    } else {
      clearSelection();
    }
  }, [setSelection, clearSelection]);
  
  const handleObjectRightClick = useCallback((objectId: string, position: { x: number; y: number }) => {
    // If right-clicked object is not selected, select it
    if (!selectedObjectIds.includes(objectId)) {
      setSelection([objectId]);
    }
    
    setContextMenuObjectId(objectId);
    setContextMenuPosition(position);
    setContextMenuOpen(true);
  }, [selectedObjectIds, setSelection]);
  
  const handleDeleteSelected = useCallback(async () => {
    if (selectedObjectIds.length > 0 && canvasId) {
      try {
        // Delete all selected objects
        await Promise.all(selectedObjectIds.map(id => deleteObject(id)));
        clearSelection();
      } catch (error) {
        console.error('Failed to delete objects:', error);
      }
    }
  }, [selectedObjectIds, canvasId, deleteObject, clearSelection]);
  
  const handleDuplicateSelected = useCallback(async () => {
    // Only duplicate if exactly one object is selected
    if (selectedObjectIds.length === 1 && canvasId) {
      try {
        const duplicate = await duplicateObject(selectedObjectIds[0]);
        // Select the newly created duplicate
        setSelection([duplicate.id]);
      } catch (error) {
        console.error('Failed to duplicate object:', error);
      }
    }
  }, [selectedObjectIds, canvasId, duplicateObject, setSelection]);
  
  // Get clipboard functions from store
  const copyObject = useObjectsStore((state) => state.copyObject);
  const copiedObject = useObjectsStore((state) => state.copiedObject);
  const lastPastedPosition = useObjectsStore((state) => state.lastPastedPosition);
  const setLastPastedPosition = useObjectsStore((state) => state.setLastPastedPosition);
  
  const handleCopySelected = useCallback(() => {
    // Only copy if exactly one object is selected
    if (selectedObjectIds.length === 1 && canvasId) {
      const objectToCopy = objects.find(obj => obj.id === selectedObjectIds[0]);
      if (objectToCopy) {
        copyObject(objectToCopy);
        console.log('Copied object to clipboard');
      }
    }
  }, [selectedObjectIds, canvasId, objects, copyObject]);
  
  const handlePaste = useCallback(async () => {
    if (!copiedObject || !canvasId || !user) return;
    
    try {
      // Calculate paste position
      let pastePosition: { x: number; y: number };
      
      if (lastPastedPosition) {
        // Sequential paste: offset from last pasted position
        pastePosition = {
          x: lastPastedPosition.x + 20,
          y: lastPastedPosition.y + 20,
        };
      } else {
        // First paste: offset from original position
        pastePosition = {
          x: copiedObject.originalPosition.x + 20,
          y: copiedObject.originalPosition.y + 20,
        };
      }
      
      // Create new object with copied properties
      const pasted = await createObject({
        type: copiedObject.type,
        x: pastePosition.x,
        y: pastePosition.y,
        width: copiedObject.width,
        height: copiedObject.height,
        rotation: copiedObject.rotation,
        fill: copiedObject.fill,
        text: copiedObject.text,
        fontSize: copiedObject.fontSize,
        radius: copiedObject.radius,
        points: copiedObject.points,
        stroke: copiedObject.stroke,
        strokeWidth: copiedObject.strokeWidth,
        pointerLength: copiedObject.pointerLength,
        pointerWidth: copiedObject.pointerWidth,
      });
      
      // Update last pasted position for sequential pastes
      setLastPastedPosition(pastePosition);
      
      // Select the newly pasted object
      if (pasted) {
        setSelection([pasted.id]);
      }
      
      console.log('Pasted object from clipboard');
    } catch (error) {
      console.error('Failed to paste object:', error);
    }
  }, [copiedObject, lastPastedPosition, canvasId, user, createObject, setLastPastedPosition, setSelection]);
  
  // Context menu actions
  const handleEditProperties = useCallback(() => {
    if (contextMenuObjectId) {
      const obj = objects.find(o => o.id === contextMenuObjectId);
      if (obj) {
        setPropertyEditorObject(obj);
        setPropertyEditorOpen(true);
      }
    }
  }, [contextMenuObjectId, objects]);
  
  const handlePropertyUpdate = useCallback((updates: Partial<typeof objects[0]>) => {
    if (propertyEditorObject && canvasId) {
      updateObject(propertyEditorObject.id, updates);
    }
  }, [propertyEditorObject, canvasId, updateObject]);
  
  const handleToggleVisibility = useCallback((objectId: string) => {
    const obj = objects.find(o => o.id === objectId);
    if (obj && canvasId) {
      updateObject(objectId, { visible: !(obj.visible !== false) });
    }
  }, [objects, canvasId, updateObject]);
  
  const handleContextMenuDuplicate = useCallback(async () => {
    if (contextMenuObjectId && canvasId) {
      try {
        const duplicate = await duplicateObject(contextMenuObjectId);
        setSelection([duplicate.id]);
      } catch (error) {
        console.error('Failed to duplicate object:', error);
      }
    }
  }, [contextMenuObjectId, canvasId, duplicateObject, setSelection]);
  
  const handleContextMenuCopy = useCallback(() => {
    if (contextMenuObjectId) {
      const obj = objects.find(o => o.id === contextMenuObjectId);
      if (obj) {
        copyObject(obj);
      }
    }
  }, [contextMenuObjectId, objects, copyObject]);
  
  const handleContextMenuDelete = useCallback(async () => {
    if (selectedObjectIds.length > 0 && canvasId) {
      try {
        await Promise.all(selectedObjectIds.map(id => deleteObject(id)));
        clearSelection();
      } catch (error) {
        console.error('Failed to delete objects:', error);
      }
    }
  }, [selectedObjectIds, canvasId, deleteObject, clearSelection]);
  
  // Build context menu items
  const contextMenuItems: ContextMenuItem[] = selectedObjectIds.length > 1 ? [
    // Multi-select menu
    {
      label: `Delete ${selectedObjectIds.length} objects`,
      onClick: handleContextMenuDelete,
      danger: true,
    },
  ] : [
    // Single-select menu
    {
      label: 'Edit Properties',
      onClick: handleEditProperties,
    },
    { divider: true, label: '', onClick: () => {} },
    {
      label: 'Duplicate',
      onClick: handleContextMenuDuplicate,
    },
    {
      label: 'Copy',
      onClick: handleContextMenuCopy,
    },
    {
      label: 'Paste',
      onClick: handlePaste,
      disabled: !copiedObject,
    },
    { divider: true, label: '', onClick: () => {} },
    {
      label: 'Delete',
      onClick: handleContextMenuDelete,
      danger: true,
    },
  ];
  
  // Keyboard shortcuts for delete, duplicate, copy, paste, undo, and redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const hasSelection = selectedObjectIds.length > 0;
      const hasSingleSelection = selectedObjectIds.length === 1;
      
      // Undo: Ctrl+Z (Windows/Linux) or Cmd+Z (Mac)
      if ((e.key === 'z' || e.key === 'Z') && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
        e.preventDefault();
        if (canUndo) {
          undo();
        }
        return;
      }
      
      // Redo: Ctrl+Y (Windows/Linux) or Cmd+Shift+Z (Mac)
      if (
        ((e.key === 'y' || e.key === 'Y') && e.ctrlKey && !e.metaKey) ||
        ((e.key === 'z' || e.key === 'Z') && e.metaKey && e.shiftKey)
      ) {
        e.preventDefault();
        if (canRedo) {
          redo();
        }
        return;
      }
      
      // Delete or Backspace key
      if ((e.key === 'Delete' || e.key === 'Backspace') && hasSelection) {
        // Prevent backspace from navigating back in browser
        e.preventDefault();
        handleDeleteSelected();
      }
      
      // Ctrl+D (Windows/Linux) or Cmd+D (Mac) for duplicate
      if ((e.key === 'd' || e.key === 'D') && (e.ctrlKey || e.metaKey) && hasSingleSelection) {
        // Prevent default browser bookmark dialog
        e.preventDefault();
        handleDuplicateSelected();
      }
      
      // Ctrl+C (Windows/Linux) or Cmd+C (Mac) for copy
      if ((e.key === 'c' || e.key === 'C') && (e.ctrlKey || e.metaKey) && hasSingleSelection) {
        // Prevent default browser copy behavior
        e.preventDefault();
        handleCopySelected();
      }
      
      // Ctrl+V (Windows/Linux) or Cmd+V (Mac) for paste
      if ((e.key === 'v' || e.key === 'V') && (e.ctrlKey || e.metaKey)) {
        // Prevent default browser paste behavior
        e.preventDefault();
        handlePaste();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedObjectIds, handleDeleteSelected, handleDuplicateSelected, handleCopySelected, handlePaste, undo, redo, canUndo, canRedo]);
  
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
                
                <button
                  onClick={() => setTool('arrow')}
                  className={`p-2 rounded-md transition-colors ${
                    tool === 'arrow'
                      ? 'bg-blue-100 text-blue-700'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                  title="Arrow - Click and drag"
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
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={handleAIChatToggle}
                className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                  showAIChat
                    ? 'bg-purple-100 text-purple-700'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
                title="AI Assistant"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="text-sm font-medium">AI</span>
              </button>
              
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
        <div className="flex-1 relative flex">
          <div className="flex-1 relative">
          <Canvas 
            canvasId={canvasId} 
            tool={tool} 
            onCanvasClick={handleCanvasClick}
            onCursorMove={handleCursorMove}
            onArrowMouseDown={handleArrowMouseDown}
            onArrowMouseUp={handleArrowMouseUp}
          >
            <ObjectRenderer
              objects={objects.filter(obj => obj.visible !== false)}
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
              onObjectRightClick={handleObjectRightClick}
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
          
          {/* AI Chat Panel */}
          {showAIChat && user && canvasId && (
            <div className="absolute top-4 right-4 w-96 max-w-full">
              <AIChat
                canvasId={canvasId}
                userId={user.id}
                userName={user.displayName || user.email || 'Anonymous'}
                onClose={() => setShowAIChat(false)}
              />
            </div>
          )}
          
          {/* Context Menu */}
          <ContextMenu
            isOpen={contextMenuOpen}
            position={contextMenuPosition}
            items={contextMenuItems}
            onClose={() => setContextMenuOpen(false)}
          />
          
          {/* Property Editor */}
          <PropertyEditor
            isOpen={propertyEditorOpen}
            object={propertyEditorObject}
            onClose={() => setPropertyEditorOpen(false)}
            onUpdate={handlePropertyUpdate}
          />
          </div>
          
          {/* Layer Panel */}
          <LayerPanel
            objects={objects}
            onToggleVisibility={handleToggleVisibility}
          />
        </div>
      </div>
    </ProtectedRoute>
  );
}

