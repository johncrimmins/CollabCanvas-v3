# PRD: Arrow Shape Type

## Introduction/Overview

Add a new Arrow shape type to CollabCanvas, following the same patterns and architecture as existing Rectangle and Circle shapes. This completes the "3+ shape types" requirement from requirements.md and provides users with a basic directional indicator tool.

**Problem:** Users currently can only create rectangles, circles, and text. They need a way to create arrows for showing direction, flow, or connections in their collaborative canvas.

**Goal:** Implement a single-ended arrow shape that behaves consistently with existing shapes, supporting the same creation, manipulation, styling, and real-time sync capabilities.

---

## Goals

1. Enable users to create single-ended arrow shapes on the canvas
2. Maintain performance targets (<50ms cursor sync, <100ms object sync)
3. Provide consistent interaction patterns with Rectangle and Circle shapes
4. Support real-time sync across all collaborators
5. Enable AI agent to create/manipulate arrows via existing tools
6. Complete implementation in a single development session

---

## User Stories

1. **As a user**, I want to create an arrow shape so that I can indicate direction or flow in my design.
2. **As a user**, I want to drag and resize arrows so that I can position them precisely.
3. **As a user**, I want to style arrows (color, stroke width) so that they match my design system.
4. **As a user**, I want arrows to sync in real-time so that my collaborators see them instantly.
5. **As a user**, I want to rotate arrows so that I can point them in any direction.
6. **As an AI agent user**, I want to create arrows via natural language commands.

---

## Functional Requirements

### Core Functionality

1. **FR-1:** The system must support a new `arrow` shape type in the object type system.
2. **FR-2:** Arrows must have configurable start point (x1, y1) and end point (x2, y2) coordinates.
3. **FR-3:** Arrows must render a line from start to end with an arrowhead at the end point.
4. **FR-4:** Arrows must support the following styling properties:
   - `stroke` (color)
   - `strokeWidth` (line thickness)
   - `fill` (arrowhead color, defaults to stroke)
   - `pointerLength` (arrowhead length, default: 10)
   - `pointerWidth` (arrowhead width, default: 10)

### Creation

5. **FR-5:** Users must be able to create arrows via the canvas toolbar (arrow tool button).
6. **FR-6:** Arrow creation should use click-drag interaction: click for start point, drag to end point, release to complete.
7. **FR-7:** Newly created arrows must be assigned a unique ID and persisted to Firestore.
8. **FR-8:** Default arrow styling: black stroke, 2px width, 10px pointer dimensions.

### Manipulation

9. **FR-9:** Users must be able to select arrows by clicking on them.
10. **FR-10:** Selected arrows must display selection indicators (highlight or transformer).
11. **FR-11:** Users must be able to drag arrows to move them.
12. **FR-12:** Users must be able to resize arrows using transform handles.
13. **FR-13:** Users must be able to rotate arrows using rotation handle.
14. **FR-14:** Users must be able to delete arrows using the Delete/Backspace key.
15. **FR-15:** All arrow manipulations must follow the optimistic update pattern (local first, then sync).

### Real-Time Sync

16. **FR-16:** Arrow creation must broadcast to all connected users within 100ms.
17. **FR-17:** Arrow movements must broadcast position deltas in real-time.
18. **FR-18:** Arrow transformations (resize, rotate) must sync across users.
19. **FR-19:** Arrow deletions must sync immediately to all users.
20. **FR-20:** Arrows must persist to Firestore and survive page refreshes.

### AI Agent Integration

21. **FR-21:** The existing `createShape` tool must support arrow type with parameters: startX, startY, endX, endY, stroke, strokeWidth.
22. **FR-22:** The existing `updateShape` tool must support updating arrow coordinates and styling.
23. **FR-23:** The existing `deleteShape` tool must support deleting arrows.

---

## Non-Goals (Out of Scope)

1. **Bi-directional arrows** (arrows on both ends) - future enhancement
2. **Curved arrows** - straight lines only for now
3. **Connection points or snap-to-shape** - arrows are free-floating
4. **Multiple arrowhead styles** (triangle, circle, diamond) - only standard triangle
5. **Dashed or dotted lines** - solid lines only
6. **Auto-routing or smart paths** - user controls exact path
7. **Text labels on arrows** - users can add separate text objects if needed

---

## Design Considerations

### Visual Design

- **Arrow Appearance:** Follow Konva.js `Arrow` component defaults
  - Straight line from start to end
  - Triangle arrowhead at end point
  - Smooth, anti-aliased rendering
  
- **Selection State:** Use same visual pattern as Rectangle/Circle
  - Highlight on hover
  - Transformer handles when selected
  - Respect current selection styling

- **Creation Feedback:** Show preview arrow while dragging during creation

### UX Patterns

- **Toolbar:** Add arrow icon button to canvas toolbar (between Circle and Text tools)
- **Cursor:** Show crosshair cursor when arrow tool is active
- **Creation Flow:** Click-drag-release (same as Rectangle/Circle creation)
- **Handles:** Show 2 circular handles at start/end points when selected, plus rotation handle

---

## Technical Considerations

### Architecture Extension

**Extends Existing Features:**
- `src/features/objects/types/index.ts` - Add `ArrowObject` type
- `src/features/objects/components/` - Add `Arrow.tsx` component
- `src/features/objects/components/ObjectRenderer.tsx` - Add arrow case
- `src/features/canvas/components/CanvasToolbar.tsx` - Add arrow tool button

**Uses Existing Patterns:**
- `useShapeInteractions` hook for all interaction logic
- Optimistic updates via `objectsStore`
- Real-time sync via existing delta mechanism
- Firestore persistence via `objectsService`

### Type Definition

```typescript
// src/features/objects/types/index.ts
interface ArrowObject extends BaseObject {
  type: 'arrow';
  points: [number, number, number, number]; // [x1, y1, x2, y2]
  stroke: string;
  strokeWidth: number;
  fill?: string; // Arrowhead color, defaults to stroke
  pointerLength?: number; // Default: 10
  pointerWidth?: number; // Default: 10
}
```

### Component Structure

```typescript
// src/features/objects/components/Arrow.tsx
export function Arrow({ 
  object, 
  isSelected, 
  onSelect, 
  onDragMove,
  onDragEnd,
  onTransform,
  onTransformEnd 
}: ArrowProps) {
  const { shapeRef, trRef, handlers } = useShapeInteractions<Konva.Arrow>({
    objectId: object.id,
    isSelected,
    onSelect,
    onDragMove,
    onDragEnd,
    onTransform,
    onTransformEnd,
  });

  return (
    <>
      <KonvaArrow
        ref={shapeRef}
        points={object.points}
        stroke={object.stroke}
        strokeWidth={object.strokeWidth}
        fill={object.fill || object.stroke}
        pointerLength={object.pointerLength || 10}
        pointerWidth={object.pointerWidth || 10}
        draggable={isSelected}
        {...handlers}
      />
      {isSelected && <Transformer ref={trRef} />}
    </>
  );
}
```

### Dependencies

- **Konva.js:** Already includes `Arrow` component
- **react-konva:** Already installed and in use
- **useShapeInteractions:** Existing hook, no changes needed
- **objectsStore:** Existing store, no changes needed
- **objectsService:** Existing service, handles any CanvasObject type

### Integration Points

1. **Toolbar:** Add arrow icon (use `ArrowRight` from lucide-react or similar)
2. **ObjectRenderer:** Add case for `type === 'arrow'`
3. **AI Tools:** `createShape` tool already supports any shape type via parameters
4. **Store:** No changes needed, stores handle objects generically
5. **Services:** No changes needed, services handle objects generically

---

## Success Metrics

### Functional Success

1. ✅ Arrow tool appears in canvas toolbar
2. ✅ User can create arrow by click-dragging on canvas
3. ✅ Arrow renders with proper arrowhead at end point
4. ✅ User can select, move, resize, rotate, and delete arrows
5. ✅ Arrows sync across multiple users in real-time (<100ms)
6. ✅ Arrows persist through page refresh
7. ✅ AI agent can create arrows via natural language commands

### Performance Success

1. ✅ Arrow creation syncs to other users within 100ms
2. ✅ Arrow movements show smooth real-time updates
3. ✅ Canvas maintains 60 FPS with 500+ objects including arrows
4. ✅ No performance degradation from adding arrow shape type

### Quality Success

1. ✅ Arrow interactions match Rectangle/Circle patterns
2. ✅ No console errors or warnings
3. ✅ TypeScript types are correct and complete
4. ✅ Code follows existing patterns (no special cases)

---

## Testing Checklist

### Manual Testing (Required)

**Creation:**
- [ ] Click arrow tool in toolbar, cursor changes
- [ ] Click-drag creates arrow from start to end
- [ ] Arrow appears with proper arrowhead
- [ ] Release creates arrow and selects it
- [ ] Arrow persists after creation

**Manipulation:**
- [ ] Click arrow to select (shows transformer)
- [ ] Drag arrow to move position
- [ ] Use corner handles to resize
- [ ] Use rotation handle to rotate
- [ ] Press Delete to remove arrow

**Multi-User Sync:**
- [ ] Open canvas in two browser windows
- [ ] Create arrow in window A, appears in window B within 100ms
- [ ] Move arrow in window A, updates in window B in real-time
- [ ] Delete arrow in window A, disappears in window B immediately

**Persistence:**
- [ ] Create arrow, refresh page, arrow still exists
- [ ] All arrow properties preserved (position, size, color)

**AI Agent:**
- [ ] Command: "Create an arrow from 100,100 to 300,200"
- [ ] Command: "Create a red arrow pointing right"
- [ ] AI-created arrows sync to all users

**Performance:**
- [ ] Create 50+ arrows, canvas still smooth
- [ ] Rapid arrow movements, no lag

---

## Implementation Checklist

1. [ ] Define `ArrowObject` type in `src/features/objects/types/index.ts`
2. [ ] Create `src/features/objects/components/Arrow.tsx` component
3. [ ] Add arrow case to `ObjectRenderer.tsx`
4. [ ] Add arrow tool button to `CanvasToolbar.tsx`
5. [ ] Add arrow icon (import from icon library)
6. [ ] Update toolbar state to handle arrow tool selection
7. [ ] Implement arrow creation logic in canvas onClick/onDrag handlers
8. [ ] Test arrow creation, manipulation, and deletion locally
9. [ ] Test multi-user sync with two browser windows
10. [ ] Test AI agent arrow creation commands
11. [ ] Verify performance with many arrows on canvas
12. [ ] Complete manual testing checklist above

---

## Open Questions

None - all requirements clarified.

---

## Timeline Estimate

**Estimated Time:** 1-2 hours

**Breakdown:**
- Type definition and component: 20 minutes
- Toolbar integration: 15 minutes
- Creation logic: 20 minutes
- Testing and refinement: 30-45 minutes

**Dependencies:** None - can start immediately

---

*PRD Created: 2025-10-18*  
*Status: Ready for Implementation*

