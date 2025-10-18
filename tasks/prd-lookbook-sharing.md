# PRD: LookBook Sharing

## Introduction/Overview

Enable LookBook owners to add collaborators (called "Designers") to their LookBooks, creating shared workspaces for creative teams. Designers can edit the LookBook with the same capabilities as the owner but cannot add or remove other users or delete the LookBook. This feature transforms LookBooks into true collaborative spaces where models, photographers, and stylists work together on photoshoot planning.

## Goals

1. Allow LookBook owners to add Designers by username or email
2. Implement role management: Owner vs. Designer
3. Show shared LookBooks in "Shared LookBooks" section on My LookBooks page
4. Provide UI for managing LookBook collaborators
5. Enforce permission rules (Owner can manage users, Designers cannot)
6. Sync collaborator changes in real-time
7. Enable multiple users to edit the same LookBook simultaneously

## User Stories

1. **As a photographer (Owner)**, I want to add my stylist to my LookBook so that we can collaborate on planning the shoot together.

2. **As a stylist (Designer)**, I want to see LookBooks I've been added to so that I can contribute to shoots I'm working on.

3. **As a creative director (Owner)**, I want to remove a team member from a LookBook so that access is limited to active contributors.

4. **As a model (Designer)**, I want to edit objects in a shared LookBook so that I can contribute my ideas to the shoot planning.

5. **As an owner**, I want to see who has access to my LookBook so that I can manage collaborators effectively.

## Functional Requirements

### FR1: Add Designer to LookBook
Owner can add collaborators to their LookBook:
- "Add Designer" button visible to owner (on LookBook page or in settings)
- Click opens modal with search/input field
- User can search by:
  - Username (exact match or partial match)
  - Email address (exact match)
- Display search results with user avatar, name, email
- Click user to add them as Designer
- On add:
  - Update LookBook's `designers` array in Firestore
  - Designer sees LookBook appear in their "Shared LookBooks" section
  - Send in-app notification to Designer (optional for MVP)

### FR2: Remove Designer from LookBook
Owner can remove Designers from their LookBook:
- "Manage Designers" section shows list of all Designers
- Each Designer has "Remove" button (visible to owner only)
- Click "Remove" shows confirmation: "Remove [Name] from this LookBook?"
- On confirm:
  - Remove Designer from `designers` array
  - Designer loses access to LookBook
  - LookBook disappears from Designer's "Shared LookBooks" section
  - If Designer is currently viewing LookBook, show notification and redirect to My LookBooks

### FR3: Role Permissions
**Owner Permissions:**
- Full edit access to LookBook content (create/edit/delete objects)
- Add Designers to LookBook
- Remove Designers from LookBook
- Rename LookBook
- Delete LookBook
- See all collaborators

**Designer Permissions:**
- Full edit access to LookBook content (create/edit/delete objects)
- See all collaborators
- **Cannot** add or remove Designers
- **Cannot** rename LookBook
- **Cannot** delete LookBook

### FR4: Shared LookBooks Section
On My LookBooks page, "Shared LookBooks" section displays:
- All LookBooks where user is a Designer (not owner)
- Each card shows:
  - LookBook name
  - Owner name (e.g., "Owned by Jane Smith")
  - Last modified timestamp
  - "Open" button (no rename or delete buttons for Designers)

### FR5: Collaborators List
On the LookBook page or in settings, show list of collaborators:
- Owner name (badge: "Owner")
- All Designers (badge: "Designer")
- For each user: Avatar, name, email, online status (from presence)
- Owner sees "Remove" button next to each Designer
- Designers see collaborators but no action buttons

### FR6: User Search/Lookup
To add Designers, implement user search:
- Search users in Firestore `/users` collection
- Query by username (case-insensitive, partial match)
- Query by email (exact match)
- Return up to 10 results
- Show "No users found" if search returns empty
- Cannot add user who is already a Designer or owner

### FR7: Access Control
Enforce permissions in Firestore security rules:
- Only owner can add/remove Designers
- Only owner can rename LookBook
- Only owner can delete LookBook
- Both owner and Designers can edit objects
- Users not in owner or designers list cannot access LookBook

### FR8: Real-Time Sync
When collaborators are added/removed:
- All users viewing the LookBook see updated collaborators list
- Designer sees LookBook appear/disappear in their "Shared LookBooks" section in real-time
- Presence system shows all active users (owner and Designers)

### FR9: Multi-User Collaboration
Multiple users (owner + Designers) can edit the same LookBook simultaneously:
- All users see each other's cursors (existing presence feature)
- All object changes sync in real-time (existing objects sync)
- No conflicts - last-write-wins (existing conflict resolution)
- All users have equal editing capabilities (regardless of role)

## Non-Goals (Out of Scope)

- Email invitations to non-registered users (Phase 5 feature)
- Shareable links (Phase 5 feature)
- View-only role (all Designers have edit access)
- Transfer ownership (owner is fixed as creator)
- Pending invitations (accept/decline flow)
- Notifications when LookBook is shared (optional enhancement)
- Activity log showing who edited what (future feature)

## Design Considerations

### UI/UX
- **Add Designer Flow**: Modal with search → select user → add
- **Collaborators Panel**: Show on LookBook page (sidebar or modal)
- **Shared LookBooks**: Clearly labeled section on My LookBooks page
- **Owner Badge**: Visual distinction for owner in collaborators list
- **Remove Confirmation**: Always confirm before removing Designer

### User Search UX
- Debounced search (wait 300ms after user stops typing)
- Show loading state while searching
- Display user avatar + name + email in results
- Highlight matching text in results
- "Already added" state for existing collaborators

### Permission Visibility
- Hide "Add Designer" button from Designers
- Hide "Rename" and "Delete" buttons for shared LookBooks
- Show role badges (Owner/Designer) clearly in UI
- Disabled states for actions Designers cannot perform

## Technical Considerations

### Firestore Data Structure
Update LookBook type (from My LookBooks PRD):
```typescript
interface LookBook {
  id: string;
  name: string;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  designers: Designer[]; // Array of collaborators
  createdAt: number;
  updatedAt: number;
}

interface Designer {
  userId: string;
  userName: string;
  userEmail: string;
  addedAt: number;
}
```

### Users Collection
Ensure users are stored in Firestore for search:
```
/users
  /{userId}
    - id: string
    - name: string
    - email: string
    - createdAt: number
```

User documents created during authentication signup.

### lookbooksService.ts Functions (Add to existing service)
```typescript
addDesigner(lookbookId: string, designer: Designer): Promise<void>
removeDesigner(lookbookId: string, designerId: string): Promise<void>
getDesigners(lookbookId: string): Promise<Designer[]>
searchUsers(query: string): Promise<User[]>
isOwner(lookbookId: string, userId: string): Promise<boolean>
isDesigner(lookbookId: string, userId: string): Promise<boolean>
```

### User Search Implementation
Search users in Firestore:
- Query `/users` collection by `name` (substring match) or `email` (exact match)
- Use Firestore queries: `where('name', '>=', query)` and `where('name', '<=', query + '\uf8ff')`
- Or use client-side filtering if Firestore doesn't support substring search efficiently
- Limit results to 10 users

### Permission Checking
Create utility functions:
```typescript
function canManageDesigners(lookbook: LookBook, userId: string): boolean {
  return lookbook.ownerId === userId;
}

function canEditLookBook(lookbook: LookBook, userId: string): boolean {
  return lookbook.ownerId === userId || 
    lookbook.designers.some(d => d.userId === userId);
}

function canDeleteLookBook(lookbook: LookBook, userId: string): boolean {
  return lookbook.ownerId === userId;
}
```

Use these in UI to show/hide buttons and in security rules to enforce permissions.

### Firestore Security Rules
```javascript
match /lookbooks/{lookbookId} {
  allow read: if isOwnerOrDesigner(lookbookId, request.auth.uid);
  allow create: if request.auth.uid == request.resource.data.ownerId;
  allow update: if isOwner(lookbookId, request.auth.uid);
  allow delete: if isOwner(lookbookId, request.auth.uid);
  
  match /objects/{objectId} {
    allow read, write: if isOwnerOrDesigner(lookbookId, request.auth.uid);
  }
}

function isOwner(lookbookId, userId) {
  return get(/databases/$(database)/documents/lookbooks/$(lookbookId)).data.ownerId == userId;
}

function isOwnerOrDesigner(lookbookId, userId) {
  let lookbook = get(/databases/$(database)/documents/lookbooks/$(lookbookId)).data;
  return lookbook.ownerId == userId || userId in lookbook.designers.map(d => d.userId);
}
```

### Real-Time Sync
Subscribe to LookBook changes:
- When `designers` array changes, update UI
- When user is removed, show notification and redirect if they're currently viewing
- Use existing Firestore snapshot listeners

### Integration with My LookBooks
Update `getUserSharedLookBooks()` query:
```typescript
async function getUserSharedLookBooks(userId: string): Promise<LookBook[]> {
  const snapshot = await getDocs(
    query(
      collection(db, 'lookbooks'),
      where('designers', 'array-contains-any', [{ userId }]) // Query by designers array
    )
  );
  return snapshot.docs.map(doc => doc.data() as LookBook);
}
```

Note: May need to denormalize and store `designerIds` array for efficient Firestore querying.

### Component Structure
Add to `src/features/mylookbooks/`:
```
components/
├── AddDesignerModal.tsx
├── CollaboratorsList.tsx
├── UserSearchInput.tsx
├── RemoveDesignerModal.tsx
└── DesignerBadge.tsx
```

## Success Metrics

1. **Functionality**: Owners can add/remove Designers successfully
2. **UX**: Search finds users by username/email accurately
3. **Permissions**: Designers cannot perform owner-only actions
4. **Real-Time**: Shared LookBooks appear/disappear instantly for Designers
5. **Collaboration**: Multiple users can edit same LookBook without conflicts

## Open Questions

None - role model and sharing mechanism are well-defined.

## Implementation Notes

### Implementation Order
1. Add `designers` array to LookBook type and Firestore
2. Create user search functionality (query `/users` collection)
3. Build Add Designer modal with user search
4. Implement `addDesigner()` and `removeDesigner()` in lookbooksService
5. Update My LookBooks page to query and display shared LookBooks
6. Build Collaborators List component (show owner + Designers)
7. Implement permission checks (canManageDesigners, canEditLookBook, etc.)
8. Add Remove Designer functionality with confirmation
9. Update Firestore security rules to enforce permissions
10. Test multi-user collaboration (owner + Designers editing simultaneously)

### User Creation
Ensure users are added to `/users` collection during signup:
- Modify auth service to create user document in Firestore on registration
- Store: `id`, `name`, `email`, `createdAt`
- Use this for user search

### Edge Cases
- **User removed while viewing LookBook**: Show notification, redirect to My LookBooks
- **Owner deletes LookBook**: All Designers lose access, LookBook removed from their list
- **Adding user who doesn't exist**: Show "User not found" message
- **Network error during add/remove**: Show error message, retry option

### Testing Checklist
- Owner can add Designer by username
- Owner can add Designer by email
- Designer sees LookBook in "Shared LookBooks" section
- Owner can remove Designer
- Removed Designer loses access to LookBook
- Designer can edit objects but cannot manage collaborators
- Designer cannot rename or delete LookBook
- Owner can see all collaborators (owner + Designers)
- Multiple users (owner + Designers) can edit simultaneously
- Real-time updates when collaborators change
- Firestore security rules enforce permissions correctly
- User search returns accurate results
- Cannot add same user twice

