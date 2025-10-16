// Presence service - handles real-time cursor and user presence via Firebase RTDB
import { ref, set, onValue, onDisconnect, remove } from 'firebase/database';
import { getRTDB } from '../lib/firebase';
import { Cursor, PresenceUser } from '../types';
import { Point } from '@/shared/types';

/**
 * Join a canvas session - mark user as online
 */
export async function joinCanvas(
  canvasId: string,
  userId: string,
  userName: string,
  photoURL?: string | null
): Promise<void> {
  const rtdb = getRTDB();
  const presenceRef = ref(rtdb, `presence/${canvasId}/${userId}`);
  
  const presenceData: PresenceUser = {
    id: userId,
    displayName: userName,
    photoURL: photoURL || null,
    joinedAt: Date.now(),
    lastSeen: Date.now(),
  };
  
  // Set presence
  await set(presenceRef, presenceData);
  
  // Remove presence on disconnect
  onDisconnect(presenceRef).remove();
}

/**
 * Leave a canvas session - mark user as offline
 */
export async function leaveCanvas(canvasId: string, userId: string): Promise<void> {
  const rtdb = getRTDB();
  const presenceRef = ref(rtdb, `presence/${canvasId}/${userId}`);
  const cursorRef = ref(rtdb, `cursors/${canvasId}/${userId}`);
  
  await Promise.all([
    remove(presenceRef),
    remove(cursorRef),
  ]);
}

/**
 * Update user's cursor position
 * Note: This should be throttled to 60fps (16ms) by the caller
 */
export async function updateCursor(
  canvasId: string,
  userId: string,
  userName: string,
  position: Point
): Promise<void> {
  const rtdb = getRTDB();
  const cursorRef = ref(rtdb, `cursors/${canvasId}/${userId}`);
  
  const cursorData: Cursor = {
    userId,
    userName,
    position,
    timestamp: Date.now(),
  };
  
  await set(cursorRef, cursorData);
}

/**
 * Subscribe to cursor updates for all users
 * Returns unsubscribe function
 */
export function subscribeToCursors(
  canvasId: string,
  callback: (cursors: Record<string, Cursor>) => void
): () => void {
  const rtdb = getRTDB();
  const cursorsRef = ref(rtdb, `cursors/${canvasId}`);
  
  const unsubscribe = onValue(cursorsRef, (snapshot) => {
    const cursors = snapshot.val() || {};
    callback(cursors);
  });
  
  return unsubscribe;
}

/**
 * Subscribe to presence updates for all users
 * Returns unsubscribe function
 */
export function subscribeToPresence(
  canvasId: string,
  callback: (presence: Record<string, PresenceUser>) => void
): () => void {
  const rtdb = getRTDB();
  const presenceRef = ref(rtdb, `presence/${canvasId}`);
  
  const unsubscribe = onValue(presenceRef, (snapshot) => {
    const presence = snapshot.val() || {};
    callback(presence);
  });
  
  return unsubscribe;
}

/**
 * Update last seen timestamp (heartbeat)
 */
export async function updateLastSeen(canvasId: string, userId: string): Promise<void> {
  const rtdb = getRTDB();
  const lastSeenRef = ref(rtdb, `presence/${canvasId}/${userId}/lastSeen`);
  await set(lastSeenRef, Date.now());
}

