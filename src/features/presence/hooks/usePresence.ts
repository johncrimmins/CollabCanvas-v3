// Presence hook - manages user presence and cursor broadcasting
'use client';

import { useEffect, useCallback, useRef } from 'react';
import { usePresenceStore } from '../lib/presenceStore';
import { useAuth } from '@/features/auth';
import { throttle } from '@/shared/lib/utils';
import { Point } from '@/shared/types';
import {
  joinCanvas,
  leaveCanvas,
  updateCursor,
  subscribeToCursors,
  subscribeToPresence,
  updateLastSeen,
} from '../services/presenceService';

/**
 * Hook to manage presence and cursor updates for a canvas
 */
export function usePresence(canvasId: string | null) {
  const { user } = useAuth();
  const setCursors = usePresenceStore((state) => state.setCursors);
  const setPresence = usePresenceStore((state) => state.setPresence);
  const cursors = usePresenceStore((state) => state.cursors);
  const presence = usePresenceStore((state) => state.presence);
  
  // Throttled cursor update function (60fps = 16ms)
  const throttledUpdateCursor = useRef(
    throttle(async (canvasId: string, userId: string, userName: string, position: Point) => {
      try {
        await updateCursor(canvasId, userId, userName, position);
      } catch (error) {
        console.error('Failed to update cursor:', error);
      }
    }, 16)
  ).current;
  
  // Join canvas on mount, leave on unmount
  useEffect(() => {
    if (!canvasId || !user) return;
    
    let isSubscribed = true;
    
    const init = async () => {
      try {
        // Join canvas
        await joinCanvas(canvasId, user.id, user.displayName, user.photoURL);
        
        if (!isSubscribed) return;
        
        // Subscribe to cursors
        const unsubscribeCursors = subscribeToCursors(canvasId, (cursors) => {
          if (isSubscribed) {
            // Remove own cursor from display
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { [user.id]: _, ...otherCursors } = cursors;
            setCursors(otherCursors);
          }
        });
        
        // Subscribe to presence
        const unsubscribePresence = subscribeToPresence(canvasId, (presence) => {
          if (isSubscribed) {
            setPresence(presence);
          }
        });
        
        // Heartbeat - update last seen every 30 seconds
        const heartbeatInterval = setInterval(() => {
          if (isSubscribed) {
            updateLastSeen(canvasId, user.id).catch(console.error);
          }
        }, 30000);
        
        // Cleanup
        return () => {
          isSubscribed = false;
          unsubscribeCursors();
          unsubscribePresence();
          clearInterval(heartbeatInterval);
          leaveCanvas(canvasId, user.id).catch(console.error);
        };
      } catch (error) {
        console.error('Failed to initialize presence:', error);
      }
    };
    
    const cleanup = init();
    
    return () => {
      isSubscribed = false;
      cleanup.then((fn) => fn?.());
    };
  }, [canvasId, user, setCursors, setPresence]);
  
  // Broadcast cursor position
  const broadcastCursor = useCallback(
    (position: Point) => {
      if (!canvasId || !user) return;
      throttledUpdateCursor(canvasId, user.id, user.displayName, position);
    },
    [canvasId, user, throttledUpdateCursor]
  );
  
  return {
    cursors,
    presence,
    broadcastCursor,
    onlineCount: Object.keys(presence).length,
  };
}

