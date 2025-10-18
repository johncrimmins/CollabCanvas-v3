// Objects feature types
import { Point } from '@/shared/types';

/**
 * Canvas object base
 */
export interface CanvasObject {
  id: string;
  type: 'rectangle' | 'circle' | 'text' | 'arrow';
  position: Point;
  width: number;
  height: number;
  rotation: number;
  fill: string;
  createdBy: string;
  createdAt: number;
  updatedAt: number;
  // Optional: tracks which user is currently transforming this object
  transformingBy?: string;
  // Optional: for circles
  radius?: number;
  // Optional: for text objects
  text?: string;
  fontSize?: number;
  // Optional: for arrows
  points?: [number, number, number, number]; // [x1, y1, x2, y2]
  stroke?: string;
  strokeWidth?: number;
  pointerLength?: number;
  pointerWidth?: number;
}

/**
 * Object update for real-time sync
 */
export interface ObjectUpdate {
  id: string;
  updates: Partial<CanvasObject>;
  timestamp: number;
  deleted?: boolean;
}

/**
 * Parameters for creating a new object
 */
export interface CreateObjectParams {
  type: 'rectangle' | 'circle' | 'text' | 'arrow';
  x: number;
  y: number;
  width?: number;
  height?: number;
  fill?: string;
}

/**
 * Shape preview for creation mode
 */
export interface ShapePreview {
  type: 'rectangle' | 'circle' | 'arrow';
  position: Point;
  width: number;
  height: number;
  fill: string;
  userId: string;
  userName?: string;
  // Optional: for arrow preview
  points?: [number, number, number, number];
}