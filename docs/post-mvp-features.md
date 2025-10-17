# Post-MVP Features: CollabCanvas v3

## Feature Checklist

### Phase 1: Complete Requirements.md (Foundation)
- [ ] Text formatting (bold, italic, font size, alignment)
- [ ] Multi-select (shift-click and drag-to-select)
- [ ] Duplicate operation (keyboard shortcut and context menu)
- [ ] Line/Arrow shape type

### Phase 2: Testing Infrastructure (Production Readiness)
- [ ] Vitest setup with unit test examples
- [ ] Chrome DevTools MCP integration for E2E testing
- [ ] Manual performance validation checklist

### Phase 3: Advanced Canvas Features (Figma-Inspired)
- [ ] Undo/redo with keyboard shortcuts
- [ ] Layers panel with reordering
- [ ] Object grouping/ungrouping
- [ ] Alignment tools (align left/right/center/top/bottom)
- [ ] Distribution tools (distribute horizontally/vertically)
- [ ] Auto-layout (flexbox-like)

### Phase 4: Image Support
- [ ] Firebase Storage integration
- [ ] Image object type with drag & drop
- [ ] Image upload and optimization
- [ ] CDN delivery

### Phase 5: AI Agent Enhancements
- [ ] Basic commands with explicit inputs (all canvas/object operations)
- [ ] Complex commands with explicit inputs (forms, layouts)
- [ ] Rate limiting and cost monitoring
- [ ] Security boundaries and validation
- [ ] LLM-based intent identification for natural commands

### Phase 6: Comments & Collaboration
- [ ] Comment threads feature
- [ ] Attach comments to shapes
- [ ] Comment UI with bubble indicators
- [ ] Real-time comment sync

### Phase 7: Polish & Branding ("The LookBook")
- [ ] UI/UX refinements across all features
- [ ] Professional design system
- [ ] Brand identity implementation
- [ ] Hover-pinnable toolbar

### Phase 8: Landing Page
- [ ] Landing page route and components
- [ ] Marketing content
- [ ] SEO optimization

### Phase 9: Business Model
- [ ] Stripe integration
- [ ] Freemium logic with 2-week trial
- [ ] Subscription management UI

### Phase 10: Advanced Integration
- [ ] Pinterest API search component
- [ ] AI-powered curation
- [ ] Reinforcement learning feedback

---

## Current Architecture (Extension Points)

### Existing Features
- **Auth** (`src/features/auth/`): User authentication and session management
- **Presence** (`src/features/presence/`): Cursor sync and online users
- **Canvas** (`src/features/canvas/`): Pan/zoom and viewport management
- **Objects** (`src/features/objects/`): Shape creation, manipulation, real-time sync
- **AI Agent** (`src/features/ai-agent/`): Natural language canvas manipulation

### Key Patterns to Extend
1. **useShapeInteractions**: Shared hook for all shape interaction logic
2. **Vertical Slicing**: Each feature has components/, hooks/, services/, types/
3. **Dual Database**: RTDB for ephemeral (cursors), Firestore for persistence (objects)
4. **Optimistic Updates**: Local state first, then broadcast + persist
5. **Service Layer**: Firebase interactions encapsulated in service files

---

## Phase 1: Complete Requirements.md (Foundation)

### 1.1 Text Formatting

**Purpose**: Enable text styling to satisfy requirements.md Section 2 (text with formatting)

**Prerequisites**: 
- Text component exists (`src/features/objects/components/Text.tsx`)
- Basic text rendering functional

**Architecture Extension**:
- Extends `src/features/objects/components/Text.tsx`
- Extends `src/features/objects/types/index.ts` (add formatting fields)
- No new feature slice required

**Module Interface**:
```typescript
// src/features/objects/types/index.ts
interface TextObject extends BaseObject {
  type: 'text';
  text: string;
  fontSize: number;
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  textAlign: 'left' | 'center' | 'right';
  fontFamily?: string;
}

// src/features/objects/components/TextFormatToolbar.tsx
interface TextFormatToolbarProps {
  selectedTextId: string;
  onFormatChange: (format: Partial<TextObject>) => void;
}
```

**Integration Points**:
- Toolbar UI in `app/canvas/page.tsx`
- useObjects hook for format updates
- AI Agent tools can set formatting in createShape

---

### 1.2 Multi-Select

**Purpose**: Enable selection of multiple objects (requirements.md Section 2)

**Prerequisites**:
- Single selection functional
- useObjects store manages selection state

**Architecture Extension**:
- Extends `src/features/objects/lib/objectsStore.ts` (selectedIds array)
- Extends `src/features/objects/hooks/useObjects.ts` (multi-select methods)
- Extends `src/features/canvas/components/Canvas.tsx` (shift-click, drag-select)

**Module Interface**:
```typescript
// src/features/objects/lib/objectsStore.ts
interface ObjectsState {
  selectedIds: string[]; // Changed from selectedId
  setSelectedIds: (ids: string[]) => void;
  toggleSelection: (id: string) => void; // Shift-click
  selectInArea: (bounds: Rectangle) => void; // Drag-select
}

// src/features/objects/components/SelectionBox.tsx
interface SelectionBoxProps {
  bounds: Rectangle;
  onComplete: (selectedIds: string[]) => void;
}
```

**Integration Points**:
- Transformer handles multiple shapes
- Delete/duplicate operations work on selection
- AI Agent can target "selected shapes"

---

### 1.3 Duplicate Operation

**Purpose**: Enable object duplication (requirements.md Section 2)

**Prerequisites**:
- Object creation functional
- Selection working

**Architecture Extension**:
- Extends `src/features/objects/services/objectsService.ts` (duplicateObject method)
- Extends `src/features/objects/hooks/useObjects.ts` (useDuplicate hook)

**Module Interface**:
```typescript
// src/features/objects/services/objectsService.ts
export const objectsService = {
  duplicateObject: async (
    canvasId: string,
    sourceId: string,
    offset: { x: number; y: number }
  ) => Promise<CanvasObject>;
};

// Keyboard shortcut: Cmd/Ctrl+D
// Context menu: "Duplicate" option
```

**Integration Points**:
- Canvas keyboard shortcuts
- AI Agent duplicateShape tool (already exists)
- Real-time sync via existing delta mechanism

---

### 1.4 Line/Arrow Shape Type

**Purpose**: Complete 3+ shape types requirement (requirements.md Section 2)

**Prerequisites**:
- Rectangle, Circle, Text components exist
- useShapeInteractions pattern established

**Architecture Extension**:
- New `src/features/objects/components/Line.tsx`
- New `src/features/objects/components/Arrow.tsx`
- Extends `src/features/objects/types/index.ts`

**Module Interface**:
```typescript
// src/features/objects/types/index.ts
interface LineObject extends BaseObject {
  type: 'line';
  points: [number, number, number, number]; // x1, y1, x2, y2
  stroke: string;
  strokeWidth: number;
}

interface ArrowObject extends LineObject {
  type: 'arrow';
  pointerLength?: number;
  pointerWidth?: number;
}

// src/features/objects/components/Line.tsx
export function Line({ object }: { object: LineObject }) {
  const { shapeRef, handlers } = useShapeInteractions<Konva.Line>({...});
  return <KonvaLine ref={shapeRef} {...handlers} />;
}
```

**Integration Points**:
- ObjectRenderer includes line/arrow cases
- Toolbar includes line/arrow tools
- AI Agent createShape supports line/arrow type

---

## Phase 2: Testing Infrastructure (Production Readiness)

### 2.1 Vitest Setup

**Purpose**: Enable unit testing for business logic and hooks

**Prerequisites**:
- Existing codebase functional

**Architecture Extension**:
- New `vitest.config.ts` at project root
- Test files co-located with source (e.g., `useObjects.test.ts`)

**Module Interface**:
```typescript
// Example test structure
describe('useObjects', () => {
  it('should add object to store', () => {...});
  it('should broadcast object to RTDB', () => {...});
});

// vitest.config.ts
export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts']
  }
});
```

**Integration Points**:
- Mock Firebase services
- Test Zustand stores in isolation
- Test hooks with @testing-library/react

---

### 2.2 Chrome DevTools MCP for E2E

**Purpose**: Enable end-to-end testing through browser automation

**Prerequisites**:
- Chrome DevTools MCP server available
- Application deployed or running locally

**Architecture Extension**:
- New `tests/e2e/` directory
- Test scenarios for multi-user collaboration

**Module Interface**:
```typescript
// tests/e2e/multi-user-sync.test.ts
// Test scenarios:
// - Open two browser windows
// - User A creates shape, verify User B sees it
// - User A moves shape, verify User B sees movement
// - Measure latency between action and sync
```

**Integration Points**:
- Test deployed Vercel URL
- Validate <50ms cursor sync
- Validate <100ms object sync

---

### 2.3 Performance Validation Checklist

**Purpose**: Manual verification of requirements.md performance targets

**Architecture Extension**:
- New `docs/performance-checklist.md`

**Validation Steps**:
```markdown
Performance Checklist:
- [ ] Cursor sync <50ms (use browser DevTools Network tab)
- [ ] Object sync <100ms (use timestamps in console)
- [ ] 500+ objects at 60 FPS (use Konva.js performance monitor)
- [ ] 5+ concurrent users supported (manual testing)
- [ ] No visible lag during rapid edits
- [ ] Reconnection works within 30s network drop
- [ ] All users disconnect → state persists
```

---

## Phase 3: Advanced Canvas Features (Figma-Inspired)

### 3.1 Undo/Redo

**Purpose**: Enable undo/redo with keyboard shortcuts (requirements.md Section 6, Tier 1)

**Prerequisites**:
- All object operations functional
- Phase 1 features complete

**Architecture Extension**:
- New `src/features/history/` vertical slice
- Components: None (keyboard only)
- Hooks: useHistory
- Services: historyService
- Types: HistoryAction, HistoryState

**Module Interface**:
```typescript
// src/features/history/hooks/useHistory.ts
export function useHistory() {
  const undo = () => void;
  const redo = () => void;
  const addAction = (action: HistoryAction) => void;
  return { undo, redo, canUndo, canRedo };
}

// src/features/history/types/index.ts
interface HistoryAction {
  type: 'create' | 'update' | 'delete';
  objectId: string;
  before: CanvasObject | null;
  after: CanvasObject | null;
  timestamp: number;
}

// Keyboard shortcuts: Cmd/Ctrl+Z, Cmd/Ctrl+Shift+Z
```

**Integration Points**:
- Intercept all object mutations
- Store action history in local memory (not synced)
- Apply inverse operations on undo
- Limit history stack (e.g., 50 actions)

**Considerations**:
- Undo is local per user (not synced to other users)
- Conflicts possible if others edit during undo
- Consider disable undo for AI-generated actions

---

### 3.2 Layers Panel

**Purpose**: Enable layer management with reordering (requirements.md Section 6, Tier 2)

**Prerequisites**:
- Objects rendering with z-index
- Multi-select functional

**Architecture Extension**:
- Extends `src/features/objects/` (no new slice needed)
- New components: LayersPanel.tsx, LayerItem.tsx
- Extends objectsStore with layer order management

**Module Interface**:
```typescript
// src/features/objects/components/LayersPanel.tsx
export function LayersPanel() {
  const objects = useObjects();
  return (
    <div>
      {objects.map(obj => (
        <LayerItem key={obj.id} object={obj} />
      ))}
    </div>
  );
}

// src/features/objects/lib/objectsStore.ts
interface ObjectsState {
  moveToFront: (id: string) => void;
  moveToBack: (id: string) => void;
  moveUp: (id: string) => void;
  moveDown: (id: string) => void;
  reorderLayers: (ids: string[]) => void; // Drag-to-reorder
}
```

**Integration Points**:
- UI panel in canvas sidebar
- Konva.js zIndex property
- Real-time sync layer order via RTDB
- AI Agent can specify layer order

---

### 3.3 Object Grouping

**Purpose**: Enable grouping/ungrouping objects (requirements.md Section 6, Tier 1)

**Prerequisites**:
- Multi-select functional
- Transform operations working

**Architecture Extension**:
- Extends `src/features/objects/types/index.ts` (GroupObject type)
- Extends objectsService with group/ungroup methods

**Module Interface**:
```typescript
// src/features/objects/types/index.ts
interface GroupObject extends BaseObject {
  type: 'group';
  childIds: string[];
}

// src/features/objects/services/objectsService.ts
export const objectsService = {
  groupObjects: async (
    canvasId: string,
    objectIds: string[]
  ) => Promise<GroupObject>;
  
  ungroupObjects: async (
    canvasId: string,
    groupId: string
  ) => Promise<CanvasObject[]>;
};

// Keyboard shortcut: Cmd/Ctrl+G, Cmd/Ctrl+Shift+G
```

**Integration Points**:
- Transform applies to all children
- Children maintain relative positions
- Groups can be nested
- Layers panel shows hierarchy

---

### 3.4 Alignment Tools

**Purpose**: Enable shape alignment (requirements.md Section 6, Tier 2)

**Prerequisites**:
- Multi-select functional
- Transform operations working

**Architecture Extension**:
- New `src/features/alignment/` vertical slice
- Components: AlignmentToolbar.tsx
- Hooks: useAlignment
- Services: alignmentService
- Types: AlignmentType

**Module Interface**:
```typescript
// src/features/alignment/services/alignmentService.ts
export const alignmentService = {
  alignLeft: (objects: CanvasObject[]) => CanvasObject[];
  alignRight: (objects: CanvasObject[]) => CanvasObject[];
  alignCenter: (objects: CanvasObject[]) => CanvasObject[];
  alignTop: (objects: CanvasObject[]) => CanvasObject[];
  alignBottom: (objects: CanvasObject[]) => CanvasObject[];
  alignMiddle: (objects: CanvasObject[]) => CanvasObject[];
  distributeHorizontally: (objects: CanvasObject[]) => CanvasObject[];
  distributeVertically: (objects: CanvasObject[]) => CanvasObject[];
};
```

**Integration Points**:
- Toolbar in canvas UI
- Works with selection
- Updates persisted via objectsService
- AI Agent can use alignment commands

---

### 3.5 Auto-Layout

**Purpose**: Enable flexbox-like automatic spacing (requirements.md Section 6, Tier 3)

**Prerequisites**:
- Alignment tools functional
- Grouping functional

**Architecture Extension**:
- Extends `src/features/alignment/` (no new slice)
- Extends GroupObject type with layout properties

**Module Interface**:
```typescript
// src/features/objects/types/index.ts
interface GroupObject extends BaseObject {
  type: 'group';
  childIds: string[];
  autoLayout?: {
    direction: 'horizontal' | 'vertical';
    spacing: number;
    padding: number;
    alignment: 'start' | 'center' | 'end';
  };
}

// src/features/alignment/services/alignmentService.ts
export const alignmentService = {
  enableAutoLayout: (groupId: string, config: AutoLayoutConfig) => void;
  disableAutoLayout: (groupId: string) => void;
};
```

**Integration Points**:
- Auto-adjusts child positions on add/remove
- Updates when children resize
- Properties panel shows auto-layout settings

---

## Phase 4: Image Support

### 4.1 Firebase Storage Integration

**Purpose**: Enable image upload and storage

**Prerequisites**:
- Firebase project configured
- Storage bucket created

**Architecture Extension**:
- Extends `src/features/objects/lib/firebase.ts`
- New storage service functions

**Module Interface**:
```typescript
// src/features/objects/services/storageService.ts
export const storageService = {
  uploadImage: (file: File, canvasId: string) => Promise<string>; // Returns URL
  deleteImage: (url: string) => Promise<void>;
  optimizeImage: (file: File) => Promise<File>; // Resize/compress
};
```

**Integration Points**:
- Firebase Storage rules (authenticated only)
- CDN URLs for fast delivery
- Image metadata in Firestore

---

### 4.2 Image Object Type

**Purpose**: Enable images on canvas with drag & drop

**Prerequisites**:
- Firebase Storage integrated
- useShapeInteractions pattern established

**Architecture Extension**:
- New `src/features/objects/components/Image.tsx`
- Extends `src/features/objects/types/index.ts`

**Module Interface**:
```typescript
// src/features/objects/types/index.ts
interface ImageObject extends BaseObject {
  type: 'image';
  src: string; // Firebase Storage URL
  width: number;
  height: number;
  originalWidth: number;
  originalHeight: number;
}

// src/features/objects/components/Image.tsx
export function Image({ object }: { object: ImageObject }) {
  const { shapeRef, handlers } = useShapeInteractions<Konva.Image>({...});
  const [image] = useImage(object.src);
  return <KonvaImage ref={shapeRef} image={image} {...handlers} />;
}
```

**Integration Points**:
- Drag & drop files onto canvas
- ObjectRenderer includes image case
- AI Agent can reference uploaded images
- Real-time sync image URLs

---

## Phase 5: AI Agent Enhancements

### 5.1 Basic Commands with Explicit Inputs

**Purpose**: Ensure AI can handle all canvas operations users can perform

**Prerequisites**:
- Phase 1 complete (all canvas operations exist)
- Current AI agent functional

**Architecture Extension**:
- Extends `src/features/ai-agent/lib/tools.ts`
- Add tools for missing operations

**Module Interface**:
```typescript
// New tools to add if missing:
// - formatText (bold, italic, fontSize, alignment)
// - createLine, createArrow
// - alignShapes (left, right, center, top, bottom)
// - distributeShapes (horizontal, vertical)
// - groupShapes, ungroupShapes
// - moveToFront, moveToBack
// - uploadImage (if implemented)

// Each tool has explicit parameters, no ambiguity
```

**Integration Points**:
- All tools call existing services
- Tools return structured results
- Error handling for invalid inputs

---

### 5.2 Complex Commands with Explicit Inputs

**Purpose**: Ensure complex layouts work reliably (requirements.md Section 3)

**Prerequisites**:
- Basic commands functional
- Login form and card layout tools exist

**Architecture Extension**:
- Extends `src/features/ai-agent/lib/tools.ts`
- Add more complex layout tools

**Module Interface**:
```typescript
// Additional complex tools:
// - createNavigationBar(itemCount, width, labels?)
// - createDashboard(layout: 'grid' | 'sidebar', widgets: string[])
// - createFormLayout(fields: FormField[], colorScheme?)
// - createSettingsPanel(sections: SettingsSection[])

// All use explicit parameters for predictability
```

**Integration Points**:
- Multi-step generation with progress feedback
- Uses existing shape creation tools
- Applies alignment and grouping

---

### 5.3 Rate Limiting & Cost Monitoring

**Purpose**: Production-ready AI with cost controls

**Prerequisites**:
- AI agent in production use
- OpenAI API billing active

**Architecture Extension**:
- Extends `src/features/ai-agent/services/aiAgentService.ts`
- New middleware for rate limiting

**Module Interface**:
```typescript
// src/features/ai-agent/services/rateLimiter.ts
export const rateLimiter = {
  checkLimit: (userId: string) => Promise<boolean>;
  incrementUsage: (userId: string, tokens: number) => Promise<void>;
  getRemainingQuota: (userId: string) => Promise<number>;
};

// Config: Max 100 requests/hour per user, 50k tokens/day
```

**Integration Points**:
- Check before each AI request
- Display quota in UI
- Log usage to Firestore
- Admin dashboard for monitoring

---

### 5.4 Security Boundaries

**Purpose**: Prevent abuse and malicious commands

**Prerequisites**:
- Rate limiting functional

**Architecture Extension**:
- Extends `src/features/ai-agent/services/aiAgentService.ts`
- Input validation and sanitization

**Module Interface**:
```typescript
// src/features/ai-agent/lib/validator.ts
export const validator = {
  validateCommand: (command: string) => ValidationResult;
  sanitizeInput: (input: string) => string;
  checkObjectLimits: (count: number) => boolean;
};

// Limits:
// - Max 50 objects per command
// - Max command length: 500 chars
// - Block XSS/injection attempts
// - Validate tool parameters
```

**Integration Points**:
- Validate before sending to OpenAI
- Block suspicious patterns
- Log security events

---

### 5.5 LLM-Based Intent Identification

**Purpose**: Handle natural language without explicit parameters

**Prerequisites**:
- All explicit commands working
- Security boundaries in place

**Architecture Extension**:
- Extends AI Agent prompt engineering
- Add context-aware interpretation

**Module Interface**:
```typescript
// Enhanced agent behavior:
// "Make it bigger" → identifies last modified object, scales by 1.5x
// "Move to the center" → calculates canvas center, moves selected
// "Make them match" → identifies reference object, applies style
// "Fix the alignment" → detects misalignment, suggests correction

// Uses getCanvasState() for context
// Asks clarifying questions if ambiguous
```

**Integration Points**:
- Maintains conversation history
- References recent actions
- Suggests alternatives when uncertain
- Explains what it will do before acting

---

## Phase 6: Comments & Collaboration

### 6.1 Comment Threads Feature

**Purpose**: Enable user comments attached to shapes (future-features.md line 9)

**Prerequisites**:
- Auth functional
- Presence functional
- Objects with stable IDs

**Architecture Extension**:
- New `src/features/comments/` vertical slice
- Components: CommentBubble.tsx, CommentThread.tsx, CommentInput.tsx
- Hooks: useComments
- Services: commentsService
- Types: Comment, CommentThread

**Module Interface**:
```typescript
// src/features/comments/types/index.ts
interface Comment {
  id: string;
  objectId: string; // Shape this comment is attached to
  userId: string;
  userName: string;
  text: string;
  createdAt: number;
  updatedAt?: number;
  parentId?: string; // For threaded replies
}

// src/features/comments/services/commentsService.ts
export const commentsService = {
  addComment: (objectId: string, text: string) => Promise<Comment>;
  updateComment: (commentId: string, text: string) => Promise<void>;
  deleteComment: (commentId: string) => Promise<void>;
  subscribeToComments: (objectId: string, callback) => Unsubscribe;
};

// src/features/comments/components/CommentBubble.tsx
// Shows comment count indicator on shape (e.g., "3" or "9+")
```

**Integration Points**:
- RTDB path: `comments/{canvasId}/{objectId}/`
- Firestore for persistence
- Visual indicator on shapes with comments
- Click to open modal with thread
- Real-time updates across users

---

## Phase 7: Polish & Branding ("The LookBook")

### 7.1 UI/UX Refinements

**Purpose**: Professional polish across all features (future-features.md line 10-12)

**Prerequisites**:
- All core features functional

**Architecture Extension**:
- No new slices, refinements across existing features
- New `src/shared/components/` for design system

**Refinements**:
- Smooth animations and transitions
- Consistent spacing and typography
- Professional color palette
- Micro-interactions and feedback
- Loading states and skeletons
- Empty states with guidance
- Error states with recovery options
- Hover-pinnable toolbar (shows on left hover, can be pinned)

**Integration Points**:
- Tailwind config with brand colors
- Shared component library
- Animation utilities

---

### 7.2 Brand Identity

**Purpose**: Transform to "The LookBook" brand

**Prerequisites**:
- UI refinements complete

**Branding Elements**:
- Model/fashion-inspired visual design
- High-fashion collaborative vibes
- Plenty of white space on canvas
- Elegant typography
- Sophisticated color palette
- Premium feel

**Considerations**:
- Consult with designer (Zaina mentioned in future-features.md)
- Balance aesthetics with performance
- Consider pinnable board with white papers and depth
- Or simple basic canvas for optimal performance

---

## Phase 8: Landing Page

### 8.1 Marketing Landing Page

**Purpose**: Professional landing page for The LookBook (future-features.md line 14-16)

**Prerequisites**:
- Brand identity defined
- App fully functional

**Architecture Extension**:
- New `app/landing/` Next.js route
- New `app/landing/page.tsx`
- Components for marketing sections

**Module Interface**:
```typescript
// app/landing/page.tsx
export default function LandingPage() {
  return (
    <>
      <Hero />
      <Features />
      <UseCases />
      <Testimonials />
      <Pricing />
      <CTA />
    </>
  );
}
```

**Integration Points**:
- Route: `/` (landing), `/canvas` (app)
- Sign up CTA links to auth
- SEO optimization with Next.js metadata
- Responsive design for all devices

**Resources**:
- Consider using Lovable or Bolt for landing page generation
- Follow brand guidelines from brand identity phase
- Model after Airbnb design system principles (simplified)

---

## Phase 9: Business Model

### 9.1 Stripe Integration & Freemium

**Purpose**: Monetization with 2-week trial (future-features.md line 17)

**Prerequisites**:
- Landing page live
- User base established

**Architecture Extension**:
- New `src/features/billing/` vertical slice
- Components: PricingCard.tsx, CheckoutButton.tsx, SubscriptionStatus.tsx
- Hooks: useBilling, useSubscription
- Services: billingService, stripeService
- Types: Subscription, Plan

**Module Interface**:
```typescript
// src/features/billing/types/index.ts
interface Subscription {
  userId: string;
  plan: 'free' | 'pro';
  status: 'trialing' | 'active' | 'canceled' | 'expired';
  trialEndsAt: number;
  currentPeriodEnd: number;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
}

// src/features/billing/services/billingService.ts
export const billingService = {
  checkAccess: (userId: string) => Promise<boolean>;
  getSubscription: (userId: string) => Promise<Subscription>;
  createCheckoutSession: (plan: string) => Promise<string>; // Stripe URL
  cancelSubscription: (userId: string) => Promise<void>;
};
```

**Integration Points**:
- Stripe webhook for subscription events
- Gate features after trial expires
- Show trial countdown in UI
- Checkout flow with Stripe
- Subscription management page

**Freemium Logic**:
- 2 weeks free trial (14 days from signup)
- After trial: redirect to checkout
- Allow viewing but block editing until subscribed

---

## Phase 10: Advanced Integration

### 10.1 Pinterest API Integration

**Purpose**: Embedded search for drag & droppable inspiration (future-features.md line 18-20)

**Prerequisites**:
- Image support functional
- Firebase Storage integrated

**Architecture Extension**:
- Extends `src/features/objects/` (no new slice)
- New components: PinterestSearch.tsx, ImagePicker.tsx
- New service: pinterestService

**Module Interface**:
```typescript
// src/features/objects/services/pinterestService.ts
export const pinterestService = {
  search: (query: string) => Promise<PinterestImage[]>;
  downloadImage: (url: string) => Promise<File>;
};

// src/features/objects/components/PinterestSearch.tsx
export function PinterestSearch() {
  const results = usePinterestSearch(query);
  return (
    <div>
      {results.map(img => (
        <DraggableImage key={img.id} src={img.url} />
      ))}
    </div>
  );
}
```

**Integration Points**:
- Sidebar panel with search
- Drag image onto canvas
- Auto-upload to Firebase Storage
- Create ImageObject on drop

---

### 10.2 AI-Powered Curation

**Purpose**: AI curates Pinterest results for user (future-features.md line 19)

**Prerequisites**:
- Pinterest API integrated
- AI Agent functional

**Architecture Extension**:
- Extends `src/features/ai-agent/lib/tools.ts`
- New curateImages tool

**Module Interface**:
```typescript
// AI command: "Find inspiration for a summer photoshoot"
// → AI searches Pinterest with relevant terms
// → Filters and ranks results
// → Displays curated selection
// → User sees choices appear in realtime on page

// User can thumbs up/down for reinforcement learning
```

**Integration Points**:
- AI Agent calls pinterestService
- Applies filters based on canvas context
- Shows curation in progress
- Learns from user feedback (thumbs up/down)

---

### 10.3 Reinforcement Learning Feedback

**Purpose**: Improve AI curation over time (future-features.md line 20)

**Prerequisites**:
- AI curation functional

**Architecture Extension**:
- New `src/features/ai-agent/lib/feedback.ts`
- Store feedback in Firestore

**Module Interface**:
```typescript
// src/features/ai-agent/types/index.ts
interface Feedback {
  userId: string;
  query: string;
  resultId: string;
  rating: 'up' | 'down';
  timestamp: number;
}

// src/features/ai-agent/services/feedbackService.ts
export const feedbackService = {
  recordFeedback: (feedback: Feedback) => Promise<void>;
  getAggregatedFeedback: (query: string) => Promise<FeedbackStats>;
};
```

**Integration Points**:
- Thumbs up/down UI on curated results
- Aggregate feedback for future queries
- Improve ranking algorithm
- Display confidence scores

---

## Implementation Notes

### Extensibility Principles

1. **Vertical Slicing**: Each major feature gets its own `src/features/{name}/` directory
2. **Extend Existing Features**: Small additions extend existing slices rather than creating new ones
3. **Service Layer**: All Firebase interactions go through service files
4. **Zustand Stores**: One store per feature for state management
5. **useShapeInteractions**: All new shape types use the shared interaction hook

### Development Order

Follow the phases in order. Each phase builds on previous phases. Don't skip prerequisites.

### Testing Strategy

- Unit tests for services and hooks (Phase 2)
- E2E tests for user flows (Phase 2)
- Manual testing for real-time sync
- Performance benchmarking before adding heavy features

### Performance Considerations

- Maintain <50ms cursor sync and <100ms object sync throughout
- Test with 500+ objects before marking phases complete
- Profile with 5+ concurrent users
- Monitor Firebase quota usage

---

*Last Updated: 2025-10-17*
*Status: Planning Document*

