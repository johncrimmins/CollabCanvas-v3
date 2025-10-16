# System Patterns: CollabCanvas v3

## Architecture Overview

### High-Level Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                         Next.js App                          │
│  ┌────────────┐  ┌──────────┐  ┌─────────┐  ┌───────────┐  │
│  │    Auth    │  │ Presence │  │ Canvas  │  │ AI Agent  │  │
│  │  Feature   │  │ Feature  │  │ Feature │  │  Feature  │  │
│  └────────────┘  └──────────┘  └─────────┘  └───────────┘  │
│         │              │              │             │        │
│         └──────────────┴──────────────┴─────────────┘        │
│                         │                                     │
│                    Zustand Store                             │
└─────────────────────────┼───────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          │               │               │
    ┌─────▼─────┐  ┌─────▼──────┐  ┌────▼─────┐
    │ Firebase  │  │  Firebase  │  │ OpenAI/  │
    │   Auth    │  │    RTDB    │  │LangChain │
    └───────────┘  │ (Cursors,  │  └──────────┘
                   │ Presence)  │
                   └────────────┘
                   ┌────────────┐
                   │ Firestore  │
                   │ (Objects)  │
                   └────────────┘
```

### Data Flow Architecture
1. **User authenticates** → Firebase Auth → User session stored
2. **User joins canvas** → Presence written to RTDB → Other users see them online
3. **User moves cursor** → Throttled position sent to RTDB → Others see cursor in real-time
4. **User creates object** → Zustand store updates → Object written to Firestore → Broadcast to RTDB → Other users' stores update
5. **User moves object** → Optimistic local update → Debounced persist to Firestore → Broadcast delta to RTDB
6. **AI command** (future) → LangChain parses → Function tools called → Objects created/modified → Synced via existing flow

## Key Technical Decisions

### Decision 1: Vertical Slicing Architecture
- **Decision:** Organize code by feature, not by technical layer
- **Rationale:** 
  - Each feature is self-contained (components, hooks, services, types)
  - Easier to understand and maintain
  - Natural boundary for code splitting
  - Clear ownership and testing scope
- **Alternatives Considered:** 
  - Traditional layered (all components/, all hooks/, all services/)
  - Would create long import paths and scattered related code
- **Trade-offs:**
  - ✅ Better scalability and maintainability
  - ✅ Clear feature boundaries
  - ⚠️ Some code duplication (mitigated by shared/ folder)

### Decision 2: Dual Database Strategy
- **Decision:** Use Firebase RTDB for ephemeral data, Firestore for persistence
- **Rationale:**
  - RTDB optimized for low-latency real-time updates (cursors, presence)
  - Firestore optimized for structured data and complex queries (objects)
  - Leverage strengths of each database
- **Alternatives Considered:**
  - RTDB only: Poor for structured data, harder queries
  - Firestore only: Higher latency for real-time cursors
  - Custom WebSocket server: More infrastructure to manage
- **Trade-offs:**
  - ✅ Optimal performance for each use case
  - ✅ Firebase handles scaling and reliability
  - ⚠️ Two databases to manage
  - ⚠️ Slightly more complex data flow

### Decision 3: Zustand for State Management
- **Decision:** Use Zustand instead of Redux or Context API
- **Rationale:**
  - Lightweight and minimal boilerplate
  - Excellent performance (no unnecessary re-renders)
  - TypeScript support out of the box
  - Simple API, easy to learn
- **Alternatives Considered:**
  - Redux: Too much boilerplate for this use case
  - Context API: Performance issues with frequent updates
  - Jotai/Recoil: Less mature, similar benefits to Zustand
- **Trade-offs:**
  - ✅ Fast development velocity
  - ✅ Great performance with canvas updates
  - ✅ Small bundle size
  - ⚠️ Less ecosystem tooling than Redux

### Decision 4: Last-Write-Wins Conflict Resolution
- **Decision:** Use timestamp-based last-write-wins for conflicts
- **Rationale:**
  - Simple to implement and reason about
  - Acceptable for MVP with known trade-offs
  - Predictable behavior for users
- **Alternatives Considered:**
  - CRDT: Complex implementation, overkill for MVP
  - Operational Transform: High complexity
  - Locking: Poor UX, reduces collaboration
- **Trade-offs:**
  - ✅ Simple implementation
  - ✅ Fast performance
  - ⚠️ Can lose edits in race conditions (acceptable for MVP)
  - ⚠️ No true merge capability

### Decision 5: Konva.js for Canvas Rendering
- **Decision:** Use Konva.js instead of raw Canvas API or other libraries
- **Rationale:**
  - High-level API for shapes and transformations
  - Built-in event handling and hit detection
  - Good performance with many objects
  - React integration via react-konva
- **Alternatives Considered:**
  - Raw Canvas API: Too low-level, more work
  - Fabric.js: Heavier, less React-friendly
  - Paper.js: Vector focus, different paradigm
- **Trade-offs:**
  - ✅ Faster development
  - ✅ Good performance
  - ✅ React integration
  - ⚠️ Learning curve for advanced features

## Design Patterns

### Pattern 1: Feature Slice Pattern
- **Purpose:** Organize all related code for a feature in one place
- **Implementation:** Each feature has components/, hooks/, services/, types/
- **Example:**
```typescript
src/features/presence/
  ├── components/
  │   ├── PresenceIndicator.tsx
  │   └── UserCursor.tsx
  ├── hooks/
  │   ├── usePresence.ts
  │   └── useUserCursors.ts
  ├── services/
  │   └── presenceService.ts
  └── types/
      └── presence.types.ts
```

### Pattern 2: Service Layer Pattern
- **Purpose:** Encapsulate Firebase interactions and business logic
- **Implementation:** Each feature has a service file handling external calls
- **Example:**
```typescript
// features/presence/services/presenceService.ts
export const presenceService = {
  joinCanvas: (userId: string, canvasId: string) => {...},
  leaveCanvas: (userId: string, canvasId: string) => {...},
  updateCursor: (userId: string, position: Point) => {...},
  subscribeToCursors: (canvasId: string, callback) => {...}
};
```

### Pattern 3: Custom Hooks Pattern
- **Purpose:** Encapsulate stateful logic and side effects
- **Implementation:** Each feature exposes React hooks for components
- **Example:**
```typescript
// features/presence/hooks/usePresence.ts
export function usePresence(canvasId: string) {
  const user = useAuth();
  
  useEffect(() => {
    presenceService.joinCanvas(user.id, canvasId);
    return () => presenceService.leaveCanvas(user.id, canvasId);
  }, [canvasId, user.id]);
  
  // Handle cursor updates, online users, etc.
}
```

### Pattern 4: Optimistic Updates Pattern
- **Purpose:** Provide instant feedback before server confirmation
- **Implementation:** Update local state immediately, then sync to server
- **Example:**
```typescript
function moveObject(objectId: string, newPosition: Point) {
  // 1. Optimistic local update
  updateLocalStore(objectId, newPosition);
  
  // 2. Broadcast to other users via RTDB
  broadcastDelta(objectId, { position: newPosition });
  
  // 3. Persist to Firestore (debounced)
  debouncedPersist(objectId, newPosition);
}
```

### Pattern 5: Pub/Sub Pattern for Real-Time Updates
- **Purpose:** Decouple data producers from consumers
- **Implementation:** RTDB listeners trigger store updates
- **Example:**
```typescript
// Subscribe to object updates
rtdb.ref(`canvas/${canvasId}/objects`).on('child_changed', (snapshot) => {
  const objectUpdate = snapshot.val();
  store.updateObject(objectUpdate);
});
```

### Pattern 6: Shared Interaction Hook Pattern (DRY)
- **Purpose:** Eliminate code duplication across shape components
- **Implementation:** Single hook handles all interaction logic for any shape type
- **Benefits:** 
  - One place to update interaction logic
  - New shapes can be added in ~30 lines
  - Type-safe with TypeScript generics
  - Ready for AI agent integration
- **Example:**
```typescript
// features/objects/hooks/useShapeInteractions.ts
export function useShapeInteractions<T extends Konva.Shape>({
  objectId,
  isSelected,
  onSelect,
  onDragMove,
  onDragEnd,
  onTransformStart,
  onTransform,
  onTransformEnd,
  positionTransform,
  isBeingTransformedByOther,
  transformingUserName,
}) {
  // All interaction logic centralized here
  return { shapeRef, trRef, handlers, visualState };
}

// Usage in any shape component:
export function Rectangle({ object, ...props }) {
  const { shapeRef, trRef, handlers } = useShapeInteractions<Konva.Rect>({
    objectId: object.id,
    ...props,
  });
  
  return <Rect ref={shapeRef} {...handlers} />;
}
```

## Component Relationships

### Core Features (MVP)

#### Auth Feature
- **Responsibilities:** User authentication, session management, protected routes
- **Exposes:** `useAuth()`, `<AuthProvider>`, `<ProtectedRoute>`
- **Dependencies:** Firebase Auth
- **Integration:** Required by all other features

#### Presence Feature
- **Responsibilities:** User online/offline status, cursor positions
- **Exposes:** `usePresence()`, `useUserCursors()`, `<UserCursor>`
- **Dependencies:** Firebase RTDB, Auth feature
- **Integration:** Canvas feature renders cursors

#### Canvas Feature
- **Responsibilities:** Canvas rendering, pan/zoom, viewport management
- **Exposes:** `<Canvas>`, `useCanvas()`, `useViewport()`
- **Dependencies:** Konva.js, Zustand
- **Integration:** Hosts objects and cursors

#### Objects Feature
- **Responsibilities:** Shape creation, manipulation, sync
- **Exposes:** `useObjects()`, shape components, object services
- **Dependencies:** Firestore, RTDB, Canvas feature
- **Integration:** Rendered within Canvas, synced via services

### Post-MVP Features

#### AI Agent Feature
- **Responsibilities:** Natural language parsing, canvas manipulation via tools
- **Exposes:** `<AIChat>`, `useAIAgent()`, tool functions
- **Dependencies:** LangChain, OpenAI, Objects feature
- **Integration:** Calls object services to create/manipulate shapes

## Data Flow Patterns

### Cursor Movement Flow
```
User moves mouse
  → Throttle to 60fps
  → Update local Zustand store
  → Broadcast to RTDB (`cursors/${canvasId}/${userId}`)
  → Other users' RTDB listeners fire
  → Update their Zustand stores
  → Re-render cursor components
  [Total latency: <50ms]
```

### Object Creation Flow
```
User creates object
  → Generate UUID
  → Optimistic: Add to local Zustand store
  → Persist: Write to Firestore (`canvases/${canvasId}/objects`)
  → Broadcast: Send to RTDB (`deltas/${canvasId}`)
  → Other users' RTDB listeners fire
  → Fetch from Firestore if needed
  → Update their Zustand stores
  → Re-render canvas
  [Total latency: <100ms]
```

### Object Movement Flow
```
User drags object
  → Optimistic: Update local position immediately
  → Throttle: Send position to RTDB every 16ms
  → Debounce: Persist to Firestore after drag ends (300ms)
  → Other users see smooth movement via RTDB deltas
  [Latency: <100ms, perceived as instant]
```

## Standards and Conventions

### Naming Conventions
- **Files:** PascalCase for components, camelCase for utilities
- **Components:** PascalCase (e.g., `UserCursor.tsx`)
- **Hooks:** camelCase with `use` prefix (e.g., `usePresence.ts`)
- **Services:** camelCase with Service suffix (e.g., `presenceService.ts`)
- **Types:** PascalCase with type/interface keyword (e.g., `User`, `CanvasObject`)

### File Organization
- One component per file
- Co-locate tests with implementation (e.g., `usePresence.test.ts`)
- Barrel exports from feature index files
- Shared utilities in `src/shared/`

### Code Style
- TypeScript strict mode enabled
- ESLint + Prettier for consistent formatting
- Functional components with hooks (no class components)
- Explicit return types for functions
- Descriptive variable names (avoid abbreviations)

### Documentation
- JSDoc comments for public APIs
- README in each feature folder explaining purpose
- Inline comments for complex logic
- Architecture decisions documented in this file

### Testing Strategy (Future)
- Unit tests for services and hooks
- Integration tests for feature interactions
- E2E tests for critical user flows
- Performance benchmarks for sync latency

---
*Last Updated: 2025-10-16 (Added Pattern 6: Shared Interaction Hook)*

