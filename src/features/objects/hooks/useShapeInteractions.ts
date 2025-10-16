// Shape interactions hook - shared interaction logic for all canvas objects
'use client';

import { useRef, useEffect, useCallback } from 'react';
import Konva from 'konva';

interface PositionTransform {
  toCanvas: (x: number, y: number) => { x: number; y: number };
  fromCanvas: (x: number, y: number) => { x: number; y: number };
}

interface UseShapeInteractionsProps {
  objectId: string;
  isSelected: boolean;
  onSelect?: () => void;
  onDragMove?: (position: { x: number; y: number }) => void;
  onDragEnd?: (position: { x: number; y: number }) => void;
  onTransformStart?: () => void;
  onTransform?: (updates: { 
    position: { x: number; y: number };
    width: number;
    height: number;
    rotation: number;
  }) => void;
  onTransformEnd?: (updates: { 
    position: { x: number; y: number };
    width: number;
    height: number;
    rotation: number;
  }) => void;
  // Optional position transform for shapes like Circle that need offset adjustment
  positionTransform?: PositionTransform;
  // Visual feedback for when another user is transforming this object
  isBeingTransformedByOther?: boolean;
  transformingUserName?: string;
}

/**
 * Custom hook for handling shape interactions (drag, transform, select)
 * Centralizes all interaction logic to avoid duplication across shape components
 * 
 * Generic type T allows for type-safe refs to specific Konva shape types
 * 
 * @example
 * ```tsx
 * const { shapeRef, trRef, handlers } = useShapeInteractions<Konva.Rect>({
 *   objectId: object.id,
 *   isSelected,
 *   onSelect,
 *   onDragMove,
 *   onDragEnd,
 *   onTransformEnd,
 * });
 * 
 * return <Rect ref={shapeRef} {...handlers} />;
 * ```
 */
export function useShapeInteractions<T extends Konva.Shape = Konva.Shape>({
  isSelected,
  onSelect,
  onDragMove,
  onDragEnd,
  onTransformStart,
  onTransform,
  onTransformEnd,
  positionTransform,
  isBeingTransformedByOther = false,
  transformingUserName,
}: UseShapeInteractionsProps) {
  const shapeRef = useRef<T>(null);
  const trRef = useRef<Konva.Transformer>(null);

  // Attach transformer when selected
  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  // Apply visual feedback when another user is transforming
  useEffect(() => {
    if (shapeRef.current) {
      if (isBeingTransformedByOther) {
        // Reduce opacity to show it's being transformed by someone else
        shapeRef.current.opacity(0.6);
        // Could add other visual effects here (outline, glow, etc.)
      } else {
        // Restore full opacity
        shapeRef.current.opacity(1);
      }
      shapeRef.current.getLayer()?.batchDraw();
    }
  }, [isBeingTransformedByOther]);

  // Handle drag move - broadcasts position in real-time
  const handleDragMove = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>) => {
      if (onDragMove) {
        const x = e.target.x();
        const y = e.target.y();
        const position = positionTransform?.toCanvas(x, y) ?? { x, y };
        onDragMove(position);
      }
    },
    [onDragMove, positionTransform]
  );

  // Handle drag end - persists final position
  const handleDragEnd = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>) => {
      if (onDragEnd) {
        const x = e.target.x();
        const y = e.target.y();
        const position = positionTransform?.toCanvas(x, y) ?? { x, y };
        onDragEnd(position);
      }
    },
    [onDragEnd, positionTransform]
  );

  // Handle transform start - called when user begins transforming
  const handleTransformStart = useCallback(() => {
    if (onTransformStart) {
      onTransformStart();
    }
  }, [onTransformStart]);

  // Handle transform - broadcasts during resize/rotate in real-time
  const handleTransform = useCallback(() => {
    if (onTransform && shapeRef.current) {
      const node = shapeRef.current;
      const scaleX = node.scaleX();
      const scaleY = node.scaleY();

      const x = node.x();
      const y = node.y();
      const position = positionTransform?.toCanvas(x, y) ?? { x, y };

      onTransform({
        position,
        width: Math.max(5, node.width() * scaleX),
        height: Math.max(5, node.height() * scaleY),
        rotation: node.rotation(),
      });
    }
  }, [onTransform, positionTransform]);

  // Handle transform end - handles resize/rotate
  const handleTransformEnd = useCallback(() => {
    if (onTransformEnd && shapeRef.current) {
      const node = shapeRef.current;
      const scaleX = node.scaleX();
      const scaleY = node.scaleY();

      // Reset scale and update width/height instead
      node.scaleX(1);
      node.scaleY(1);

      const x = node.x();
      const y = node.y();
      const position = positionTransform?.toCanvas(x, y) ?? { x, y };

      onTransformEnd({
        position,
        width: Math.max(5, node.width() * scaleX),
        height: Math.max(5, node.height() * scaleY),
        rotation: node.rotation(),
      });
    }
  }, [onTransformEnd, positionTransform]);

  return {
    shapeRef,
    trRef,
    handlers: {
      onClick: onSelect,
      onTap: onSelect,
      onDragMove: handleDragMove,
      onDragEnd: handleDragEnd,
      onTransformStart: handleTransformStart,
      onTransform: handleTransform,
      onTransformEnd: handleTransformEnd,
    },
    // Additional metadata for visual rendering
    visualState: {
      opacity: isBeingTransformedByOther ? 0.6 : 1,
      isBeingTransformed: isBeingTransformedByOther,
      transformingUserName,
    },
  };
}

