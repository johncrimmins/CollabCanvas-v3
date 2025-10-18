// Shape preview component - renders low-opacity preview of shape being created
'use client';

import { Rect, Circle, Arrow } from 'react-konva';
import { ShapePreview as ShapePreviewType } from '../types';

interface ShapePreviewProps {
  preview: ShapePreviewType;
}

export function ShapePreview({ preview }: ShapePreviewProps) {
  const commonProps = {
    x: preview.position.x,
    y: preview.position.y,
    width: preview.width,
    height: preview.height,
    fill: preview.fill,
    opacity: 0.3, // Low opacity to show it's a preview
    stroke: preview.fill,
    strokeWidth: 2,
    dash: [5, 5], // Dashed outline
    listening: false, // Preview should not be interactive
  };

  if (preview.type === 'rectangle') {
    return <Rect {...commonProps} />;
  }

  if (preview.type === 'circle') {
    // For circles, we need to adjust position to center
    const radius = Math.min(preview.width, preview.height) / 2;
    return (
      <Circle
        x={preview.position.x + preview.width / 2}
        y={preview.position.y + preview.height / 2}
        radius={radius}
        fill={preview.fill}
        opacity={0.3}
        stroke={preview.fill}
        strokeWidth={2}
        dash={[5, 5]}
        listening={false}
      />
    );
  }

  if (preview.type === 'arrow') {
    // For arrows, use the points array
    const points = preview.points || [0, 0, 100, 100];
    return (
      <Arrow
        x={preview.position.x}
        y={preview.position.y}
        points={points}
        stroke={preview.fill}
        strokeWidth={2}
        fill={preview.fill}
        opacity={0.5}
        dash={[5, 5]}
        pointerLength={10}
        pointerWidth={10}
        listening={false}
      />
    );
  }

  return null;
}

