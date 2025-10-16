// Presence feature types

import { Point } from '@/shared/types';

export interface UserCursor {
  userId: string;
  userName: string;
  position: Point;
  color: string;
  timestamp: number;
}

export interface OnlineUser {
  userId: string;
  userName: string;
  photoURL?: string;
  color: string;
  joinedAt: number;
  lastSeen: number;
}

