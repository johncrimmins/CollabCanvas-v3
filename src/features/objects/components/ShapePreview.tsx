// Shape preview component - renders low-opacity preview of shape being created
'use client';

import { Rect, Circle } from 'react-konva';
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

  return null;
}

