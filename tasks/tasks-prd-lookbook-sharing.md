# Task List: LookBook Sharing Feature

## Relevant Files

- `src/features/mylookbooks/types/index.ts` - Update to include Designer interface if not already present
- `src/features/mylookbooks/services/lookbooksService.ts` - Add designer management functions
- `src/features/mylookbooks/services/usersService.ts` - New service for user search functionality
- `src/features/mylookbooks/components/AddDesignerModal.tsx` - Modal for adding collaborators
- `src/features/mylookbooks/components/CollaboratorsList.tsx` - Display owner and designers with badges
- `src/features/mylookbooks/components/UserSearchInput.tsx` - Search component for finding users
- `src/features/mylookbooks/components/RemoveDesignerModal.tsx` - Confirmation modal for removing designers
- `src/features/mylookbooks/components/DesignerBadge.tsx` - Visual badge component for Owner/Designer roles
- `src/features/mylookbooks/hooks/useCollaborators.ts` - Hook for managing collaborators
- `src/features/mylookbooks/lib/permissions.ts` - Utility functions for permission checking
- `app/lookbook/[id]/page.tsx` - Update to show collaborators list and Add Designer button
- `src/features/auth/services/authService.ts` - Update to create user document in Firestore on signup
- `firestore.rules` - Update security rules for designer permissions

### Notes

- This feature depends on My LookBooks feature being complete
- Users must be stored in Firestore `/users` collection for search functionality
- Security rules must enforce owner-only actions (add/remove designers, rename, delete)
- Real-time sync ensures all users see collaborator changes instantly

## Tasks

- [ ] 1.0 Ensure User Creation in Firestore
  - [ ] 1.1 Update `src/features/auth/services/authService.ts` to create user document on signup
  - [ ] 1.2 Create `/users/{userId}` document with fields: id, name, email, createdAt
  - [ ] 1.3 Test that new user registration creates Firestore user document
  - [ ] 1.4 Add migration script or manual process to backfill existing users to `/users` collection (if needed)

- [ ] 2.0 Build User Search Service
  - [ ] 2.1 Create `src/features/mylookbooks/services/usersService.ts`
  - [ ] 2.2 Implement `searchUsers(query)` - search by username (substring match) or email (exact match)
  - [ ] 2.3 Use Firestore query with `where` clauses or client-side filtering
  - [ ] 2.4 Limit results to 10 users
  - [ ] 2.5 Return user objects with id, name, email
  - [ ] 2.6 Test search with various queries (partial names, full emails, case-insensitive)

- [ ] 3.0 Add Designer Management Functions to LookBooks Service
  - [ ] 3.1 Update `src/features/mylookbooks/services/lookbooksService.ts`
  - [ ] 3.2 Implement `addDesigner(lookbookId, designer)` - adds Designer object to designers array
  - [ ] 3.3 Implement `removeDesigner(lookbookId, designerId)` - removes Designer from designers array
  - [ ] 3.4 Implement `getDesigners(lookbookId)` - returns array of Designers
  - [ ] 3.5 Implement `isOwner(lookbookId, userId)` - checks if userId matches ownerId
  - [ ] 3.6 Implement `isDesigner(lookbookId, userId)` - checks if userId is in designers array
  - [ ] 3.7 Update `updateLookBook` to handle designers array updates
  - [ ] 3.8 Test add/remove designer operations

- [ ] 4.0 Create Permission Utility Functions
  - [ ] 4.1 Create `src/features/mylookbooks/lib/permissions.ts`
  - [ ] 4.2 Implement `canManageDesigners(lookbook, userId)` - returns true if user is owner
  - [ ] 4.3 Implement `canEditLookBook(lookbook, userId)` - returns true if owner or designer
  - [ ] 4.4 Implement `canRenameLookBook(lookbook, userId)` - returns true if owner
  - [ ] 4.5 Implement `canDeleteLookBook(lookbook, userId)` - returns true if owner
  - [ ] 4.6 Export all permission functions for use in components and UI

- [ ] 5.0 Build Add Designer UI Components
  - [ ] 5.1 Create `src/features/mylookbooks/components/UserSearchInput.tsx` - debounced search input
  - [ ] 5.2 Add loading state while searching
  - [ ] 5.3 Display search results with user avatar placeholder, name, email
  - [ ] 5.4 Show "No users found" message for empty results
  - [ ] 5.5 Show "Already added" state for existing collaborators
  - [ ] 5.6 Highlight matching text in results
  - [ ] 5.7 Create `src/features/mylookbooks/components/AddDesignerModal.tsx`
  - [ ] 5.8 Add modal with UserSearchInput component
  - [ ] 5.9 Handle user selection from search results
  - [ ] 5.10 Call `addDesigner` service when user clicks to add
  - [ ] 5.11 Show success message and close modal
  - [ ] 5.12 Handle errors (user not found, network error)

- [ ] 6.0 Build Collaborators List Component
  - [ ] 6.1 Create `src/features/mylookbooks/components/DesignerBadge.tsx` - displays "Owner" or "Designer" badge
  - [ ] 6.2 Style badges with distinct colors (e.g., gold for Owner, blue for Designer)
  - [ ] 6.3 Create `src/features/mylookbooks/components/CollaboratorsList.tsx`
  - [ ] 6.4 Display owner first with "Owner" badge
  - [ ] 6.5 Display all designers with "Designer" badge
  - [ ] 6.6 Show user avatar placeholder, name, email for each collaborator
  - [ ] 6.7 Show online status badge from presence system (optional enhancement)
  - [ ] 6.8 Add "Remove" button next to each Designer (visible only to owner)
  - [ ] 6.9 Hide action buttons for non-owners viewing collaborators list

- [ ] 7.0 Build Remove Designer UI
  - [ ] 7.1 Create `src/features/mylookbooks/components/RemoveDesignerModal.tsx`
  - [ ] 7.2 Show confirmation message: "Remove [Name] from this LookBook?"
  - [ ] 7.3 Add Cancel and Remove buttons
  - [ ] 7.4 Call `removeDesigner` service on confirm
  - [ ] 7.5 Show success message after removal
  - [ ] 7.6 Handle edge case: Designer currently viewing LookBook gets notification and redirect

- [ ] 8.0 Integrate Collaborators UI into LookBook Page
  - [ ] 8.1 Update `app/lookbook/[id]/page.tsx` to include CollaboratorsList component
  - [ ] 8.2 Add "Add Designer" button visible only to owner (use `canManageDesigners` permission)
  - [ ] 8.3 Add "Manage Designers" or "Collaborators" panel (sidebar or modal)
  - [ ] 8.4 Fetch current LookBook data including designers array
  - [ ] 8.5 Subscribe to real-time updates for designers array changes
  - [ ] 8.6 Show AddDesignerModal when "Add Designer" button clicked
  - [ ] 8.7 Show RemoveDesignerModal when "Remove" button clicked for a designer

- [ ] 9.0 Update My LookBooks Page for Shared LookBooks
  - [ ] 9.1 Update `getUserSharedLookBooks` query in lookbooksService
  - [ ] 9.2 Query Firestore for LookBooks where userId is in designers array
  - [ ] 9.3 Consider denormalizing data: add `designerIds` array field for efficient querying
  - [ ] 9.4 Display shared LookBooks in "Shared LookBooks" section
  - [ ] 9.5 Show owner name on shared LookBook cards (e.g., "Owned by Jane Smith")
  - [ ] 9.6 Hide Rename and Delete buttons for shared LookBooks (use permission checks)
  - [ ] 9.7 Test that shared LookBooks appear/disappear in real-time when added/removed as designer

- [ ] 10.0 Implement Real-Time Collaboration Sync
  - [ ] 10.1 Subscribe to LookBook changes in useLookBooks hook
  - [ ] 10.2 When designers array changes, update collaborators list in UI
  - [ ] 10.3 If current user is removed from designers, show notification
  - [ ] 10.4 Redirect removed designer to My LookBooks page
  - [ ] 10.5 Show toast/alert: "You have been removed from this LookBook"
  - [ ] 10.6 Update shared LookBooks list in real-time when user is added/removed
  - [ ] 10.7 Test multi-user scenario: Owner adds Designer, Designer sees LookBook appear instantly

- [ ] 11.0 Update Firestore Security Rules for Permissions
  - [ ] 11.1 Update `firestore.rules` for `/lookbooks/{lookbookId}` collection
  - [ ] 11.2 Create helper function `isOwner(lookbookId, userId)` in rules
  - [ ] 11.3 Create helper function `isOwnerOrDesigner(lookbookId, userId)` in rules
  - [ ] 11.4 Allow read if `isOwnerOrDesigner`
  - [ ] 11.5 Allow update (add/remove designers, rename) only if `isOwner`
  - [ ] 11.6 Allow delete only if `isOwner`
  - [ ] 11.7 Update rules for `/lookbooks/{lookbookId}/objects` to allow read/write if `isOwnerOrDesigner`
  - [ ] 11.8 Add security rules for `/users` collection (read-only for authenticated users)
  - [ ] 11.9 Deploy updated security rules to Firebase
  - [ ] 11.10 Test rules: Designer cannot add/remove users, rename, or delete LookBook

- [ ] 12.0 Implement Collaborators Hook
  - [ ] 12.1 Create `src/features/mylookbooks/hooks/useCollaborators.ts`
  - [ ] 12.2 Fetch designers array from current LookBook
  - [ ] 12.3 Subscribe to real-time updates for designers array
  - [ ] 12.4 Implement `addDesigner` function (calls service, updates state)
  - [ ] 12.5 Implement `removeDesigner` function (calls service, updates state)
  - [ ] 12.6 Return collaborators list (owner + designers) with role badges
  - [ ] 12.7 Return permission checks (canManageDesigners, canEdit, etc.)
  - [ ] 12.8 Handle loading and error states

- [ ] 13.0 Handle Edge Cases
  - [ ] 13.1 Prevent adding same user twice (check if already in designers array)
  - [ ] 13.2 Prevent owner from adding themselves as designer
  - [ ] 13.3 Show error message if user search returns no results
  - [ ] 13.4 Handle network errors gracefully (show retry option)
  - [ ] 13.5 Handle case where Designer is removed while viewing LookBook (show notification, redirect)
  - [ ] 13.6 Handle case where Owner deletes LookBook while Designers are viewing (show notification, redirect all users)
  - [ ] 13.7 Test adding user who doesn't exist (should show "User not found")

- [ ] 14.0 Testing and Validation
  - [ ] 14.1 Test owner can add Designer by username
  - [ ] 14.2 Test owner can add Designer by email
  - [ ] 14.3 Test Designer sees LookBook appear in "Shared LookBooks" section instantly
  - [ ] 14.4 Test owner can remove Designer
  - [ ] 14.5 Test removed Designer loses access (LookBook disappears from list)
  - [ ] 14.6 Test Designer can edit objects (create, move, delete)
  - [ ] 14.7 Test Designer cannot add or remove other designers (button hidden, rules enforce)
  - [ ] 14.8 Test Designer cannot rename LookBook (button hidden, rules enforce)
  - [ ] 14.9 Test Designer cannot delete LookBook (button hidden, rules enforce)
  - [ ] 14.10 Test multiple users (owner + designers) can edit simultaneously
  - [ ] 14.11 Test real-time collaborator list updates when designers added/removed
  - [ ] 14.12 Test Firestore security rules block unauthorized actions
  - [ ] 14.13 Test user search accuracy (partial names, emails, case-insensitive)
  - [ ] 14.14 Test cannot add same user twice
  - [ ] 14.15 Test removed Designer gets redirected if currently viewing LookBook

