// Canvas hook - manages canvas state and interactions
'use client';

import { useCallback } from 'react';
import { useCanvasStore } from '../lib/canvasStore';
import { Point } from '@/shared/types';

/**
 * Hook to manage canvas viewport and interactions
 */
export function useCanvas() {
  const viewport = useCanvasStore((state) => state.viewport);
  const setViewport = useCanvasStore((state) => state.setViewport);
  
  // Pan the viewport
  const pan = useCallback(
    (deltaX: number, deltaY: number) => {
      setViewport({
        ...viewport,
        x: viewport.x + deltaX,
        y: viewport.y + deltaY,
      });
    },
    [viewport, setViewport]
  );
  
  // Zoom the viewport
  const zoom = useCallback(
    (delta: number, centerPoint?: Point) => {
      const scaleBy = 1.05;
      const newScale = delta > 0 ? viewport.scale * scaleBy : viewport.scale / scaleBy;
      
      // Clamp scale between 0.1 and 5
      const clampedScale = Math.max(0.1, Math.min(5, newScale));
      
      if (centerPoint && clampedScale !== viewport.scale) {
        // Zoom towards the center point
        const mousePointTo = {
          x: (centerPoint.x - viewport.x) / viewport.scale,
          y: (centerPoint.y - viewport.y) / viewport.scale,
        };
        
        const newPos = {
          x: centerPoint.x - mousePointTo.x * clampedScale,
          y: centerPoint.y - mousePointTo.y * clampedScale,
        };
        
        setViewport({
          x: newPos.x,
          y: newPos.y,
          scale: clampedScale,
        });
      } else {
        setViewport({
          ...viewport,
          scale: clampedScale,
        });
      }
    },
    [viewport, setViewport]
  );
  
  // Reset viewport to default
  const resetViewport = useCallback(() => {
    setViewport({ x: 0, y: 0, scale: 1 });
  }, [setViewport]);
  
  // Convert screen coordinates to canvas coordinates
  const screenToCanvas = useCallback(
    (screenPoint: Point): Point => {
      return {
        x: (screenPoint.x - viewport.x) / viewport.scale,
        y: (screenPoint.y - viewport.y) / viewport.scale,
      };
    },
    [viewport]
  );
  
  // Convert canvas coordinates to screen coordinates
  const canvasToScreen = useCallback(
    (canvasPoint: Point): Point => {
      return {
        x: canvasPoint.x * viewport.scale + viewport.x,
        y: canvasPoint.y * viewport.scale + viewport.y,
      };
    },
    [viewport]
  );
  
  return {
    viewport,
    pan,
    zoom,
    resetViewport,
    screenToCanvas,
    canvasToScreen,
  };
}

