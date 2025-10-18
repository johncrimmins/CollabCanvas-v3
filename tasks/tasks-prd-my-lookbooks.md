# Task List: My LookBooks Feature

## Relevant Files

- `src/features/mylookbooks/types/index.ts` - Type definitions for LookBook, Designer, and related interfaces
- `src/features/mylookbooks/services/lookbooksService.ts` - Firebase service layer for LookBook CRUD operations
- `src/features/mylookbooks/lib/lookbooksStore.ts` - Zustand store for LookBooks state management
- `src/features/mylookbooks/components/MyLookBooksPage.tsx` - Main repository page component
- `src/features/mylookbooks/components/LookBookCard.tsx` - Individual LookBook card component
- `src/features/mylookbooks/components/CreateLookBookModal.tsx` - Modal for creating new LookBooks
- `src/features/mylookbooks/components/RenameLookBookModal.tsx` - Modal for renaming LookBooks
- `src/features/mylookbooks/components/DeleteLookBookModal.tsx` - Confirmation modal for deleting LookBooks
- `src/features/mylookbooks/hooks/useLookBooks.ts` - React hook for LookBooks functionality
- `src/features/mylookbooks/index.ts` - Barrel export for mylookbooks feature
- `app/mylookbooks/page.tsx` - Next.js page for My LookBooks
- `app/lookbook/[id]/page.tsx` - Dynamic route for individual LookBook canvas
- `app/layout.tsx` - Update root layout to redirect to mylookbooks
- `src/features/objects/services/objectsService.ts` - Update to use lookbookId instead of canvasId
- `src/features/presence/services/presenceService.ts` - Update to use lookbookId instead of canvasId
- `firestore.rules` - Update security rules for lookbooks collection

### Notes

- This feature introduces a major architectural change: moving from single canvas to multi-LookBook platform
- All existing features (objects, presence) must be updated to work with dynamic lookbookId
- Testing should focus on routing, data isolation between LookBooks, and real-time updates

## Tasks

- [ ] 1.0 Create LookBook Type Definitions and Data Structure
  - [ ] 1.1 Create `src/features/mylookbooks/types/index.ts` with LookBook and Designer interfaces
  - [ ] 1.2 Define LookBook interface with all required fields (id, name, ownerId, ownerName, designers, timestamps)
  - [ ] 1.3 Define Designer interface with userId, userName, userEmail, addedAt
  - [ ] 1.4 Export types for use across the application

- [ ] 2.0 Build LookBooks Service Layer
  - [ ] 2.1 Create `src/features/mylookbooks/services/lookbooksService.ts`
  - [ ] 2.2 Implement `createLookBook(name, ownerId, ownerName, ownerEmail)` - creates new LookBook in Firestore
  - [ ] 2.3 Implement `getLookBook(lookbookId)` - fetches single LookBook by ID
  - [ ] 2.4 Implement `getUserOwnedLookBooks(userId)` - queries LookBooks where ownerId equals userId
  - [ ] 2.5 Implement `getUserSharedLookBooks(userId)` - queries LookBooks where userId is in designers array
  - [ ] 2.6 Implement `updateLookBook(lookbookId, updates)` - updates LookBook metadata (name, timestamps)
  - [ ] 2.7 Implement `deleteLookBook(lookbookId)` - deletes LookBook and all nested objects
  - [ ] 2.8 Implement `subscribeToLookBook(lookbookId, callback)` - real-time listener for single LookBook changes
  - [ ] 2.9 Implement `subscribeToUserLookBooks(userId, callback)` - real-time listener for user's LookBooks

- [ ] 3.0 Create LookBooks Zustand Store
  - [ ] 3.1 Create `src/features/mylookbooks/lib/lookbooksStore.ts`
  - [ ] 3.2 Define store state: lookbooks array, currentLookBook, isLoading
  - [ ] 3.3 Implement setLookBooks action
  - [ ] 3.4 Implement setCurrentLookBook action
  - [ ] 3.5 Implement addLookBook action (for optimistic updates)
  - [ ] 3.6 Implement updateLookBook action
  - [ ] 3.7 Implement removeLookBook action
  - [ ] 3.8 Export store hook and selectors

- [ ] 4.0 Build My LookBooks Page UI Components
  - [ ] 4.1 Create `src/features/mylookbooks/components/LookBookCard.tsx` - displays LookBook with name, timestamp, thumbnail, actions
  - [ ] 4.2 Add Open button that navigates to `/lookbook/[id]`
  - [ ] 4.3 Add Rename button (visible only to owner)
  - [ ] 4.4 Add Delete button (visible only to owner)
  - [ ] 4.5 Display owner name for shared LookBooks
  - [ ] 4.6 Format timestamp as relative time (e.g., "Updated 2 hours ago")
  - [ ] 4.7 Create `src/features/mylookbooks/components/CreateLookBookModal.tsx` - modal with name input and create button
  - [ ] 4.8 Add form validation (1-50 characters, required field)
  - [ ] 4.9 Create `src/features/mylookbooks/components/RenameLookBookModal.tsx` - modal with name input pre-filled
  - [ ] 4.10 Create `src/features/mylookbooks/components/DeleteLookBookModal.tsx` - confirmation modal with warning message
  - [ ] 4.11 Create `src/features/mylookbooks/components/MyLookBooksPage.tsx` - main page component
  - [ ] 4.12 Add "LookBooks I Own" section with grid layout
  - [ ] 4.13 Add "Shared LookBooks" section with grid layout
  - [ ] 4.14 Add "Create New LookBook" button at top of page
  - [ ] 4.15 Implement empty states for no owned/shared LookBooks
  - [ ] 4.16 Add loading states while fetching LookBooks
  - [ ] 4.17 Style components with Tailwind CSS (grid layout, cards, buttons)

- [ ] 5.0 Implement LookBooks Hook
  - [ ] 5.1 Create `src/features/mylookbooks/hooks/useLookBooks.ts`
  - [ ] 5.2 Fetch user's owned LookBooks on mount
  - [ ] 5.3 Fetch user's shared LookBooks on mount
  - [ ] 5.4 Subscribe to real-time updates for owned LookBooks
  - [ ] 5.5 Subscribe to real-time updates for shared LookBooks
  - [ ] 5.6 Handle create LookBook flow (call service, update store, navigate to new LookBook)
  - [ ] 5.7 Handle rename LookBook flow (optimistic update, call service)
  - [ ] 5.8 Handle delete LookBook flow (confirmation, call service, update store)
  - [ ] 5.9 Return loading states and error handling

- [ ] 6.0 Update Routing Structure
  - [ ] 6.1 Create `app/mylookbooks/page.tsx` - My LookBooks page route
  - [ ] 6.2 Create `app/lookbook/[id]/page.tsx` - dynamic LookBook canvas route
  - [ ] 6.3 Move existing canvas page logic to `/lookbook/[id]` route
  - [ ] 6.4 Extract `id` parameter from route and pass to canvas components
  - [ ] 6.5 Update `app/layout.tsx` to redirect `/` to `/mylookbooks`
  - [ ] 6.6 Add protected route wrapper for `/mylookbooks` (require auth)
  - [ ] 6.7 Add protected route wrapper for `/lookbook/[id]` (require auth)
  - [ ] 6.8 Add breadcrumb or back button in LookBook canvas to return to My LookBooks
  - [ ] 6.9 Update auth redirect to go to `/mylookbooks` instead of `/canvas`

- [ ] 7.0 Update Objects Service for Multi-LookBook Support
  - [ ] 7.1 Update `src/features/objects/services/objectsService.ts`
  - [ ] 7.2 Change all `canvasId` parameters to `lookbookId`
  - [ ] 7.3 Update Firestore paths from `/canvases/{canvasId}/objects` to `/lookbooks/{lookbookId}/objects`
  - [ ] 7.4 Update RTDB paths from `/deltas/{canvasId}` to `/deltas/{lookbookId}`
  - [ ] 7.5 Update RTDB paths from `/shapePreviews/{canvasId}` to `/shapePreviews/{lookbookId}`
  - [ ] 7.6 Update all function signatures to use lookbookId
  - [ ] 7.7 Test object creation, updates, and deletion with dynamic lookbookId

- [ ] 8.0 Update Presence Service for Multi-LookBook Support
  - [ ] 8.1 Update `src/features/presence/services/presenceService.ts`
  - [ ] 8.2 Change all `canvasId` parameters to `lookbookId`
  - [ ] 8.3 Update RTDB paths from `/presence/{canvasId}` to `/presence/{lookbookId}`
  - [ ] 8.4 Update RTDB paths from `/cursors/{canvasId}` to `/cursors/{lookbookId}`
  - [ ] 8.5 Update all function signatures to use lookbookId
  - [ ] 8.6 Test presence tracking and cursor sync with dynamic lookbookId

- [ ] 9.0 Update Firestore Security Rules
  - [ ] 9.1 Add security rules for `/lookbooks/{lookbookId}` collection
  - [ ] 9.2 Allow read if user is owner or in designers array
  - [ ] 9.3 Allow create if authenticated user matches ownerId
  - [ ] 9.4 Allow update if user is owner
  - [ ] 9.5 Allow delete if user is owner
  - [ ] 9.6 Update rules for `/lookbooks/{lookbookId}/objects` to check owner or designer access
  - [ ] 9.7 Deploy updated security rules to Firebase

- [ ] 10.0 Create Feature Barrel Export and Integration
  - [ ] 10.1 Create `src/features/mylookbooks/index.ts` with all exports
  - [ ] 10.2 Export MyLookBooksPage component
  - [ ] 10.3 Export useLookBooks hook
  - [ ] 10.4 Export LookBook types
  - [ ] 10.5 Update canvas page to import and use lookbookId from route params

- [ ] 11.0 Testing and Validation
  - [ ] 11.1 Test creating new LookBook with custom name
  - [ ] 11.2 Test creating LookBook with empty name (should use default or show error)
  - [ ] 11.3 Test opening existing LookBook (navigate to canvas, objects load)
  - [ ] 11.4 Test renaming LookBook (optimistic update, syncs to all users viewing list)
  - [ ] 11.5 Test deleting LookBook (confirmation modal, removes from Firestore and UI)
  - [ ] 11.6 Test owned LookBooks appear in "LookBooks I Own" section
  - [ ] 11.7 Test shared LookBooks appear in "Shared LookBooks" section (after sharing feature)
  - [ ] 11.8 Test empty states display correctly
  - [ ] 11.9 Test LookBook list sorting (most recently updated first)
  - [ ] 11.10 Test routing: My LookBooks → LookBook canvas → back to My LookBooks
  - [ ] 11.11 Test objects are isolated per LookBook (objects in LookBook A don't appear in LookBook B)
  - [ ] 11.12 Test presence is isolated per LookBook (users in LookBook A don't appear in LookBook B)
  - [ ] 11.13 Test multiple users can view/edit different LookBooks simultaneously
  - [ ] 11.14 Test security rules prevent unauthorized access to LookBooks

