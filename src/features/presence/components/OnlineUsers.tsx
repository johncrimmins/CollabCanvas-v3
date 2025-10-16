// Online users component - displays list of users on canvas
'use client';

import { PresenceUser, generateUserColor, formatTimestamp } from '../types';

interface OnlineUsersProps {
  presence: Record<string, PresenceUser>;
  currentUserId?: string;
}

export function OnlineUsers({ presence, currentUserId }: OnlineUsersProps) {
  const users = Object.values(presence);
  
  if (users.length === 0) {
    return null;
  }
  
  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-xs">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">
        Online ({users.length})
      </h3>
      
      <div className="space-y-2">
        {users.map((user) => {
          const isCurrentUser = user.id === currentUserId;
          const color = generateUserColor(user.id);
          
          return (
            <div
              key={user.id}
              className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-50 transition-colors"
            >
              {user.photoURL ? (
                <div
                  className="w-8 h-8 rounded-full ring-2 overflow-hidden"
                  style={{ borderColor: color }}
                >
                  <img
                    src={user.photoURL}
                    alt={user.displayName}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium text-sm"
                  style={{ backgroundColor: color }}
                >
                  {user.displayName.charAt(0).toUpperCase()}
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.displayName}
                  {isCurrentUser && (
                    <span className="ml-1 text-xs text-gray-500">(you)</span>
                  )}
                </p>
                <p className="text-xs text-gray-500">
                  {formatTimestamp(user.joinedAt)}
                </p>
              </div>
              
              <div
                className="w-2 h-2 rounded-full bg-green-500"
                title="Online"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

