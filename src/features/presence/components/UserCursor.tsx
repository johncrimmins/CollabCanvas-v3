// User cursor component - renders other users' cursors on canvas
'use client';

import { memo } from 'react';
import { Cursor, generateUserColor } from '../types';

interface Viewport {
  x: number;
  y: number;
  scale: number;
}

interface UserCursorProps {
  cursor: Cursor;
  viewport: Viewport;
}

export const UserCursor = memo(function UserCursor({ cursor, viewport }: UserCursorProps) {
  const color = generateUserColor(cursor.userId);
  
  // Convert canvas coordinates to screen coordinates
  // (cursor.position is now in canvas/world space)
  const screenX = cursor.position.x * viewport.scale + viewport.x;
  const screenY = cursor.position.y * viewport.scale + viewport.y;
  
  return (
    <div
      className="pointer-events-none absolute z-50 transition-transform duration-75"
      style={{
        left: screenX,
        top: screenY,
        transform: 'translate(-2px, -2px)',
      }}
    >
      {/* Cursor SVG */}
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M5.65376 12.3673L5.46026 12.4975L5.56866 12.6903L7.55086 16.2143L7.65466 16.4011L7.85916 16.3243L8.76926 15.9647L8.97176 15.8887L9.02316 15.6775L10.1053 11.6545L11.4456 13.4841L11.5878 13.6629L11.8086 13.5761L12.7187 13.2165L12.9382 13.1287L12.8554 12.9007L10.3649 6.67926L10.2819 6.45086L10.0539 6.53476L8.63016 7.12986L8.40196 7.21363L8.48573 7.44183L9.25855 9.65745L6.98056 12.1401L6.82756 12.3039L6.62146 12.3673H6.6218L5.65376 12.3673Z"
          fill={color}
          stroke="white"
          strokeWidth="1.5"
        />
      </svg>
      
      {/* User name label */}
      <div
        className="mt-1 px-2 py-1 rounded text-xs font-medium text-white whitespace-nowrap shadow-lg"
        style={{ backgroundColor: color }}
      >
        {cursor.userName}
      </div>
    </div>
  );
});

