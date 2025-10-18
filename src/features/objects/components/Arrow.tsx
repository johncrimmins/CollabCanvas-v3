// Arrow component - renders a draggable arrow shape
'use client';

import { Arrow as KonvaArrow, Transformer } from 'react-konva';
import Konva from 'konva';
import { CanvasObject } from '../types';
import { useShapeInteractions } from '../hooks/useShapeInteractions';

interface ArrowProps {
  object: CanvasObject;
  isSelected?: boolean;
  onSelect?: () => void;
  onDragMove?: (position: { x: number; y: number }) => void;
  onDragEnd?: (position: { x: number; y: number }) => void;
  onTransformStart?: () => void;
  onTransform?: (updates: Partial<CanvasObject>) => void;
  onTransformEnd?: (updates: Partial<CanvasObject>) => void;
  isBeingTransformedByOther?: boolean;
  transformingUserName?: string;
}

export function Arrow({
  object,
  isSelected = false,
  onSelect,
  onDragMove,
  onDragEnd,
  onTransformStart,
  onTransform,
  onTransformEnd,
  isBeingTransformedByOther,
  transformingUserName,
}: ArrowProps) {
  const { shapeRef, trRef, handlers } = useShapeInteractions<Konva.Arrow>({
    objectId: object.id,
    isSelected,
    onSelect,
    onDragMove,
    onDragEnd,
    onTransformStart,
    onTransform,
    onTransformEnd,
    isBeingTransformedByOther,
    transformingUserName,
  });

  // Arrow properties with defaults
  const points = object.points || [0, 0, 100, 100];
  const stroke = object.stroke || '#000000';
  const strokeWidth = object.strokeWidth || 2;
  const fill = object.fill || stroke;
  const pointerLength = object.pointerLength || 10;
  const pointerWidth = object.pointerWidth || 10;

  return (
    <>
      <KonvaArrow
        ref={shapeRef}
        x={object.position.x}
        y={object.position.y}
        points={points}
        stroke={stroke}
        strokeWidth={strokeWidth}
        fill={fill}
        pointerLength={pointerLength}
        pointerWidth={pointerWidth}
        rotation={object.rotation}
        draggable
        {...handlers}
      />
      
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            // Limit resize
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
}

