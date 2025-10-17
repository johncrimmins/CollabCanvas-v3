// Text component - renders a draggable text shape
'use client';

import { Text as KonvaText, Transformer } from 'react-konva';
import Konva from 'konva';
import { CanvasObject } from '../types';
import { useShapeInteractions } from '../hooks/useShapeInteractions';

interface TextProps {
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

export function Text({
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
}: TextProps) {
  const { shapeRef, trRef, handlers } = useShapeInteractions<Konva.Text>({
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

  return (
    <>
      <KonvaText
        ref={shapeRef}
        x={object.position.x}
        y={object.position.y}
        text={object.text || 'Text'}
        fontSize={object.fontSize || 16}
        fill={object.fill}
        width={object.width}
        height={object.height}
        rotation={object.rotation}
        draggable
        {...handlers}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          rotateEnabled
          enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
          boundBoxFunc={(oldBox, newBox) => {
            // Limit resize to prevent negative dimensions
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

