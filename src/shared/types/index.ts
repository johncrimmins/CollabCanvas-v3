// Shared TypeScript types

/**
 * Point in 2D space
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * User information
 */
export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL: string | null;
}

/**
 * Cursor position with user info
 */
export interface Cursor {
  userId: string;
  userName: string;
  position: Point;
  timestamp: number;
}

/**
 * Presence user info
 */
export interface PresenceUser {
  id: string;
  displayName: string;
  photoURL: string | null;
  joinedAt: number;
  lastSeen: number;
}

/**
 * Canvas object base
 */
export interface CanvasObject {
  id: string;
  type: 'rectangle' | 'circle' | 'text';
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
}

/**
 * Canvas viewport state
 */
export interface Viewport {
  x: number;
  y: number;
  scale: number;
}

