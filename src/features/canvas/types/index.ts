// Canvas feature types

import { Point } from '@/shared/types';

export interface CanvasConfig {
  width: number;
  height: number;
  backgroundColor: string;
}

export interface DragState {
  isDragging: boolean;
  startPos: Point | null;
}

export interface CanvasInteraction {
  type: 'pan' | 'select' | 'draw';
  startPos?: Point;
  currentPos?: Point;
}

