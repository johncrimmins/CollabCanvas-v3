# PRD: My LookBooks

## Introduction/Overview

Transform the single-canvas application into a multi-LookBook platform where users can create, manage, and access multiple collaborative workspaces. The "My LookBooks" page becomes the default landing page after login, functioning as a project repository where users see LookBooks they own and LookBooks shared with them. This is a foundational architectural change that enables LookBook sharing and project organization.

## Goals

1. Enable users to create multiple LookBooks (workspaces)
2. Provide a repository-style interface to view and manage all LookBooks
3. Make "My LookBooks" the default landing page after authentication
4. Support LookBook operations: create, open, rename, delete
5. Separate owned LookBooks from shared LookBooks in the UI
6. Update routing from `/canvas` to `/lookbook/[id]`
7. Store LookBook metadata in Firestore
8. Create new vertical feature slice: `src/features/mylookbooks`

## User Stories

1. **As a photographer**, I want to create separate LookBooks for different photoshoots so that I can organize my projects independently.

2. **As a stylist**, I want to see all my LookBooks in one place so that I can quickly access any project I'm working on.

3. **As a creative director**, I want to rename LookBooks to reflect the shoot name so that my team can identify projects easily.

4. **As a model**, I want to delete old LookBooks I no longer need so that my workspace stays organized.

5. **As a designer**, I want to see which LookBooks I own versus which ones I've been added to so that I understand my permissions.

## Functional Requirements

### FR1: My LookBooks Page
Create a new page at `/mylookbooks` (or `/`) that displays:
- Page title: "My LookBooks"
- Two sections:
  - **"LookBooks I Own"** - LookBooks created by the current user
  - **"Shared LookBooks"** - LookBooks where current user is a Designer (collaborator)
- Each section shows LookBook cards/rows with:
  - LookBook name
  - Last modified timestamp (e.g., "Updated 2 hours ago")
  - Thumbnail preview (optional - can be placeholder for MVP)
  - Owner name (for shared LookBooks section)
  - Action buttons: Open, Rename (owner only), Delete (owner only)

### FR2: Create New LookBook
From My LookBooks page, user can create a new LookBook:
- "Create New LookBook" button prominently displayed
- Click opens modal/form asking for LookBook name
- Name input: Text field, required, 1-50 characters
- On submit:
  - Generate unique LookBook ID (UUID)
  - Create LookBook document in Firestore
  - Set current user as owner
  - Initialize empty objects collection
  - Redirect to `/lookbook/[id]` (new LookBook canvas)

### FR3: Open Existing LookBook
User can click on any LookBook card to open it:
- Navigate to `/lookbook/[id]`
- Load LookBook metadata and objects
- User joins presence session for that LookBook
- Canvas displays all objects for that LookBook
- Breadcrumb or back button to return to My LookBooks

### FR4: Rename LookBook
Owner can rename their LookBooks:
- "Rename" button/icon on LookBook card (only visible to owner)
- Click opens modal with current name pre-filled
- User edits name, clicks Save
- Update LookBook metadata in Firestore
- UI updates immediately (optimistic update)
- All users currently viewing that LookBook see updated name

### FR5: Delete LookBook
Owner can delete their LookBooks:
- "Delete" button/icon on LookBook card (only visible to owner)
- Click shows confirmation modal: "Delete [LookBook Name]? This cannot be undone."
- On confirm:
  - Delete LookBook document from Firestore
  - Delete all objects in LookBook's objects collection
  - Remove from all collaborators' access
  - Remove LookBook card from UI
  - Cannot be undone (hard delete)

### FR6: LookBook Metadata Structure
Store LookBook metadata in Firestore at `/lookbooks/[lookbookId]`:
```typescript
interface LookBook {
  id: string;
  name: string;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  designers: Designer[]; // Collaborators (added in sharing feature)
  createdAt: number;
  updatedAt: number;
  thumbnailUrl?: string; // Optional, future enhancement
}

interface Designer {
  userId: string;
  userName: string;
  userEmail: string;
  addedAt: number;
}
```

### FR7: Default Landing Page
After authentication:
- Redirect to `/mylookbooks` (not `/canvas`)
- If user was on a specific LookBook before logging out, redirect back to that LookBook (optional enhancement)
- Protected route: Requires authentication

### FR8: Routing Update
Change routing structure:
- Old: `/canvas` (single canvas)
- New: `/lookbook/[id]` (dynamic route for each LookBook)
- Update Canvas page to accept `id` param
- Load objects for specific LookBook ID
- Update presence system to use LookBook ID instead of hardcoded "canvas-1"

### FR9: Empty States
**No LookBooks Owned:**
- Message: "You haven't created any LookBooks yet."
- Prominent "Create Your First LookBook" button

**No Shared LookBooks:**
- Message: "No LookBooks have been shared with you yet."

**General Empty State:**
- If user has no owned or shared LookBooks, show welcome message with CTA to create first LookBook

### FR10: LookBook List Sorting
Display LookBooks sorted by:
- Most recently updated first (default)
- Alphabetical by name (optional toggle)
- For MVP: Always show most recently updated first

## Non-Goals (Out of Scope)

- LookBook templates or duplicating LookBooks
- LookBook search or filtering (add when >10 LookBooks)
- Thumbnail generation from canvas snapshot (placeholder images for MVP)
- Archive/trash (soft delete) - hard delete only for MVP
- LookBook tags or categories
- Favorites or pinning LookBooks
- Grid vs. list view toggle (use grid/card layout for MVP)
- Pagination (assume users have <50 LookBooks for MVP)
- LookBook permissions beyond owner vs. designer (e.g., view-only)

## Design Considerations

### UI/UX
- **Layout**: Grid of cards (3-4 columns on desktop, 1-2 on mobile)
- **Card Design**: Clean card with name, timestamp, thumbnail placeholder, action buttons
- **Sections**: Clear visual separation between "LookBooks I Own" and "Shared LookBooks"
- **Create Button**: Primary CTA, large and prominent at top of page
- **Actions**: Rename and Delete as icon buttons or dropdown menu on each card
- **Confirmation**: Always confirm destructive actions (delete)

### LookBook Naming
- Default name: "Untitled LookBook" with timestamp if user doesn't provide name
- Allow renaming at any time (owner only)
- Name validation: 1-50 characters, trim whitespace

### Navigation Flow
1. User logs in → My LookBooks page
2. Click "Create New LookBook" → Modal → Create → Redirect to LookBook canvas
3. Click existing LookBook → Open canvas at `/lookbook/[id]`
4. From canvas, breadcrumb/button returns to My LookBooks
5. Logout from anywhere preserves context

## Technical Considerations

### Vertical Feature Slice
Create new feature module: `src/features/mylookbooks/`
```
src/features/mylookbooks/
├── components/
│   ├── MyLookBooksPage.tsx
│   ├── LookBookCard.tsx
│   ├── CreateLookBookModal.tsx
│   ├── RenameLookBookModal.tsx
│   └── DeleteLookBookModal.tsx
├── hooks/
│   └── useLookBooks.ts
├── lib/
│   └── lookbooksStore.ts (Zustand)
├── services/
│   └── lookbooksService.ts
├── types/
│   └── index.ts
└── index.ts
```

### Firestore Data Structure
```
/lookbooks
  /{lookbookId}
    - id: string
    - name: string
    - ownerId: string
    - ownerName: string
    - designers: Designer[]
    - createdAt: timestamp
    - updatedAt: timestamp
    
  /{lookbookId}/objects
    /{objectId}
      - (existing object structure)
```

### Migration Strategy
**Existing canvas data:**
- Current app uses hardcoded canvas ID "canvas-1" (or similar)
- Option 1: Migrate existing objects to a default "My First LookBook"
- Option 2: Start fresh (users create new LookBooks, old data ignored)
- **Recommended**: Option 2 (start fresh) for simplicity

### lookbooksService.ts Functions
```typescript
createLookBook(name: string, ownerId: string, ownerName: string): Promise<LookBook>
getLookBook(lookbookId: string): Promise<LookBook | null>
getUserOwnedLookBooks(userId: string): Promise<LookBook[]>
getUserSharedLookBooks(userId: string): Promise<LookBook[]>
updateLookBook(lookbookId: string, updates: Partial<LookBook>): Promise<void>
deleteLookBook(lookbookId: string): Promise<void>
subscribeToLookBook(lookbookId: string, callback): () => void
```

### State Management (Zustand)
Create `lookbooksStore.ts`:
- `lookbooks: LookBook[]` - All LookBooks user has access to
- `currentLookBook: LookBook | null` - Currently open LookBook
- `isLoading: boolean`
- Actions: `setLookBooks()`, `setCurrentLookBook()`, `createLookBook()`, etc.

### Routing Implementation
Update Next.js App Router structure:
```
app/
├── mylookbooks/
│   └── page.tsx (My LookBooks page)
├── lookbook/
│   └── [id]/
│       └── page.tsx (Canvas page with dynamic ID)
└── layout.tsx (redirect / to /mylookbooks)
```

### Integration with Objects Feature
Update objects service to use LookBook ID:
- Change `canvasId: string` parameter to `lookbookId: string`
- Update Firestore paths: `/lookbooks/{lookbookId}/objects/`
- Update RTDB paths: `/deltas/{lookbookId}/`, `/shapePreviews/{lookbookId}/`

### Integration with Presence Feature
Update presence service to use LookBook ID:
- Change `canvasId` to `lookbookId` in all presence functions
- Update RTDB paths: `/presence/{lookbookId}/users/`

### Authentication Integration
Update auth flow:
- After login, redirect to `/mylookbooks` instead of `/canvas`
- Protect `/lookbook/[id]` route (requires auth)
- Fetch user's LookBooks on login

### Real-Time Updates
- Subscribe to user's owned LookBooks (Firestore query)
- Subscribe to user's shared LookBooks (Firestore query)
- Real-time updates when LookBook is renamed, deleted, or shared

## Success Metrics

1. **Functionality**: Users can create, view, rename, and delete LookBooks
2. **Performance**: My LookBooks page loads in <1 second with 10 LookBooks
3. **UX**: Clear separation between owned and shared LookBooks
4. **Reliability**: LookBook metadata persists correctly to Firestore
5. **Navigation**: Smooth routing between My LookBooks and individual LookBooks

## Open Questions

None - architectural approach is well-defined based on rebrand discussion.

## Implementation Notes

### Implementation Order
1. Create LookBook type and Firestore structure
2. Build lookbooksService.ts with CRUD operations
3. Create lookbooksStore.ts (Zustand)
4. Build My LookBooks page UI (cards, create modal, etc.)
5. Update routing structure (`/lookbook/[id]`)
6. Update objects and presence services to use lookbookId
7. Update auth redirect to My LookBooks page
8. Test create, open, rename, delete flows
9. Test real-time updates to LookBook list

### Security Rules (Firestore)
```
// User can read LookBooks they own or are shared with
match /lookbooks/{lookbookId} {
  allow read: if request.auth.uid == resource.data.ownerId 
    || request.auth.uid in resource.data.designers.map(d => d.userId);
  allow create: if request.auth.uid == request.resource.data.ownerId;
  allow update: if request.auth.uid == resource.data.ownerId;
  allow delete: if request.auth.uid == resource.data.ownerId;
}
```

### Testing Checklist
- Create new LookBook with custom name
- Create LookBook with default name
- Open existing LookBook, verify objects load correctly
- Rename LookBook as owner
- Delete LookBook as owner (with confirmation)
- Verify owned LookBooks appear in "LookBooks I Own" section
- Verify shared LookBooks appear in "Shared LookBooks" section (after sharing feature)
- Test empty states (no owned, no shared LookBooks)
- Verify default landing page is My LookBooks
- Test routing: `/mylookbooks` → `/lookbook/[id]` → back to `/mylookbooks`
- Verify LookBook list updates in real-time when changes occur

