# Firebase Security Rules

## Overview

This document outlines the Firebase security rules for CollabCanvas v3. These rules control access to Firestore and Realtime Database.

⚠️ **CRITICAL**: The current development rules are permissive for testing. **BEFORE PRODUCTION DEPLOYMENT**, you MUST update these rules to require authentication.

## Firestore Security Rules

Location: `firestore.rules`

### Current Status: ⚠️ DEVELOPMENT MODE (INSECURE)

The current rules allow public read/write for development purposes.

### Production Rules (TO BE IMPLEMENTED)

Before deploying to production, update `firestore.rules` with authentication-required rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function to check if user owns the resource
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    
    // Canvas objects - authenticated users can read/write
    match /canvases/{canvasId}/objects/{objectId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update: if isAuthenticated();
      allow delete: if isAuthenticated();
    }
    
    // Deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### Rule Deployment

To deploy Firestore rules:
```bash
firebase deploy --only firestore:rules
```

## Realtime Database Security Rules

Location: `database.rules.json`

### Current Status: ⚠️ DEVELOPMENT MODE (INSECURE)

The current rules allow public read/write for development purposes.

### Production Rules (TO BE IMPLEMENTED)

Before deploying to production, update `database.rules.json` with authentication-required rules:

```json
{
  "rules": {
    "cursors": {
      "$canvasId": {
        "$userId": {
          ".read": "auth != null",
          ".write": "auth != null && auth.uid == $userId"
        }
      }
    },
    "presence": {
      "$canvasId": {
        "$userId": {
          ".read": "auth != null",
          ".write": "auth != null && auth.uid == $userId"
        }
      }
    },
    "deltas": {
      "$canvasId": {
        ".read": "auth != null",
        "$objectId": {
          ".write": "auth != null"
        }
      }
    }
  }
}
```

### Rule Deployment

To deploy Realtime Database rules:
```bash
firebase deploy --only database
```

## Testing Security Rules

### Firestore Rules Testing

Use the Firebase Emulator to test rules locally:

```bash
# Install emulators
firebase emulators:start --only firestore

# Run tests
npm test -- firestore.test.ts
```

### Realtime Database Rules Testing

```bash
# Install emulators
firebase emulators:start --only database

# Run tests
npm test -- database.test.ts
```

## Pre-Production Checklist

Before deploying to production:

- [ ] Update `firestore.rules` to require authentication
- [ ] Update `database.rules.json` to require authentication
- [ ] Test rules with Firebase Emulator
- [ ] Deploy rules to Firebase: `firebase deploy --only firestore:rules,database`
- [ ] Verify rules in Firebase Console
- [ ] Test authentication flow in production
- [ ] Confirm unauthenticated users cannot access data

## Data Structure

### Firestore

```
canvases/
  {canvasId}/
    objects/
      {objectId}
        - id: string
        - type: 'rectangle' | 'circle' | 'text'
        - position: { x: number, y: number }
        - width: number
        - height: number
        - rotation: number
        - fill: string
        - createdBy: string (userId)
        - createdAt: timestamp
        - updatedAt: timestamp
```

### Realtime Database

```
cursors/
  {canvasId}/
    {userId}
      - userId: string
      - userName: string
      - position: { x: number, y: number }
      - timestamp: number

presence/
  {canvasId}/
    {userId}
      - id: string
      - displayName: string
      - photoURL: string | null
      - joinedAt: timestamp
      - lastSeen: timestamp

deltas/
  {canvasId}/
    {objectId}
      - id: string
      - updates: object
      - timestamp: number
      - deleted?: boolean
```

## Security Best Practices

1. **Never expose Firebase config secrets** - Use environment variables
2. **Validate all user input** - Both client and server side
3. **Use least-privilege access** - Only grant necessary permissions
4. **Monitor Firebase usage** - Set up budget alerts
5. **Regular security audits** - Review rules and access patterns
6. **Rate limiting** - Implement Firebase App Check for abuse prevention

## Resources

- [Firestore Security Rules Documentation](https://firebase.google.com/docs/firestore/security/get-started)
- [Realtime Database Security Rules Documentation](https://firebase.google.com/docs/database/security)
- [Firebase Security Best Practices](https://firebase.google.com/docs/rules/best-practices)

---
*Last Updated: 2025-10-16*

