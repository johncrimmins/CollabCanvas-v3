// Canvas component - main canvas using Konva.js
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Stage, Layer } from 'react-konva';
import Konva from 'konva';
import { useCanvas } from '../hooks/useCanvas';
import { usePresence } from '@/features/presence';
import { UserCursor } from '@/features/presence';
import { Point } from '@/shared/types';

interface CanvasProps {
  canvasId: string;
  tool?: 'select' | 'rectangle' | 'circle';
  children?: React.ReactNode;
}

export function Canvas({ canvasId, tool = 'select', children }: CanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPos, setLastPos] = useState<Point | null>(null);
  const [isOverShape, setIsOverShape] = useState(false);
  
  const { viewport, pan, zoom } = useCanvas();
  const { cursors, broadcastCursor } = usePresence(canvasId);
  
  // Update dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);
  
  // Handle mouse wheel for zooming
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      
      const stage = e.currentTarget as HTMLDivElement;
      const rect = stage.getBoundingClientRect();
      
      const centerPoint: Point = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
      
      zoom(e.deltaY > 0 ? -1 : 1, centerPoint);
    },
    [zoom]
  );
  
  // Handle mouse down for panning
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // Get pointer position relative to stage
      const stage = stageRef.current;
      if (!stage) return;
      
      const pointerPosition = stage.getPointerPosition();
      if (!pointerPosition) return;
      
      // Check if clicking on a shape
      const clickedOnShape = stage.getIntersection(pointerPosition);
      
      // Allow panning if:
      // 1. Using select tool AND not clicking on a shape (left click)
      // 2. OR middle mouse button
      // 3. OR space key is pressed (we can add this later if needed)
      const shouldPan = 
        (tool === 'select' && e.button === 0 && !clickedOnShape) || // Left click on empty canvas with select tool
        e.button === 1; // Middle mouse button
      
      if (shouldPan) {
        setIsPanning(true);
        setLastPos({ x: e.clientX, y: e.clientY });
        e.preventDefault();
      }
    },
    [tool]
  );
  
  // Handle mouse move for panning and cursor broadcasting
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const stage = stageRef.current;
      const container = e.currentTarget as HTMLDivElement;
      const rect = container.getBoundingClientRect();
      
      const cursorPos: Point = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
      
      // Broadcast cursor position
      broadcastCursor(cursorPos);
      
      // Check if hovering over a shape (for cursor style)
      if (stage && tool === 'select' && !isPanning) {
        const pointerPosition = stage.getPointerPosition();
        if (pointerPosition) {
          const hoveredShape = stage.getIntersection(pointerPosition);
          setIsOverShape(!!hoveredShape);
        }
      }
      
      // Handle panning
      if (isPanning && lastPos) {
        const dx = e.clientX - lastPos.x;
        const dy = e.clientY - lastPos.y;
        pan(dx, dy);
        setLastPos({ x: e.clientX, y: e.clientY });
      }
    },
    [isPanning, lastPos, pan, broadcastCursor, tool]
  );
  
  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
    setLastPos(null);
  }, []);
  
  // Handle mouse leave
  const handleMouseLeave = useCallback(() => {
    setIsPanning(false);
    setLastPos(null);
    setIsOverShape(false);
  }, []);
  
  // Determine cursor style based on state
  const getCursorStyle = () => {
    if (isPanning) return 'grabbing';
    if (tool === 'select') {
      return isOverShape ? 'move' : 'grab';
    }
    return 'crosshair';
  };
  
  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-gray-100 overflow-hidden"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      style={{ cursor: getCursorStyle() }}
    >
      <Stage
        ref={stageRef}
        width={dimensions.width}
        height={dimensions.height}
        scaleX={viewport.scale}
        scaleY={viewport.scale}
        x={viewport.x}
        y={viewport.y}
      >
        <Layer>
          {/* Grid background */}
          {/* TODO: Add grid rendering */}
        </Layer>
        
        <Layer>
          {/* Objects will be rendered here */}
          {children}
        </Layer>
      </Stage>
      
      {/* Render other users' cursors */}
      {Object.values(cursors).map((cursor) => (
        <UserCursor key={cursor.userId} cursor={cursor} />
      ))}
      
      {/* Zoom indicator */}
      <div className="absolute bottom-4 right-4 bg-white px-3 py-2 rounded-lg shadow-lg text-sm font-medium text-gray-700">
        {Math.round(viewport.scale * 100)}%
      </div>
    </div>
  );
}

