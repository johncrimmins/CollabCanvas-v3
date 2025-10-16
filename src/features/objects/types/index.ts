// Objects feature types

import { CanvasObject } from '@/shared/types';

export type ShapeType = 'rectangle' | 'circle';

export interface ObjectUpdate {
  id: string;
  updates: Partial<CanvasObject>;
  timestamp: number;
}

export interface CreateObjectParams {
  type: ShapeType;
  x: number;
  y: number;
  width?: number;
  height?: number;
  fill?: string;
}

