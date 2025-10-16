// Presence feature types
import { Point } from '@/shared/types';

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
 * Generate a consistent color for a user based on their ID
 */
export function generateUserColor(userId: string): string {
  // Hash the user ID to get a consistent color
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Convert to HSL color with fixed saturation and lightness for vibrant colors
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 70%, 50%)`;
}

/**
 * Format timestamp to relative time (e.g., "2 minutes ago")
 */
export function formatTimestamp(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (seconds > 0) {
    return `${seconds} second${seconds > 1 ? 's' : ''} ago`;
  } else {
    return 'just now';
  }
}
