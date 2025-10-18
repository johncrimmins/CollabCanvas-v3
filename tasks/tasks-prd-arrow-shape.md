# Task List: Arrow Shape Type

Based on PRD: `prd-arrow-shape.md`

---

## Relevant Files

- `src/features/objects/types/index.ts` - Add ArrowObject type definition extending BaseObject
- `src/features/objects/components/Arrow.tsx` - New component for rendering arrow shapes using Konva Arrow
- `src/features/objects/components/ObjectRenderer.tsx` - Add arrow case to shape rendering logic
- `src/features/objects/components/ShapePreview.tsx` - Add arrow preview rendering support
- `src/features/objects/hooks/useObjects.ts` - Extended to accept arrow-specific properties
- `src/features/canvas/components/Canvas.tsx` - Add arrow mouse handlers (onArrowMouseDown, onArrowMouseUp)
- `app/canvas/page.tsx` - Arrow tool state, creation logic, and live preview broadcasting

### Notes

- This feature follows the existing pattern established by Rectangle and Circle components
- No new hooks or services needed - existing `useShapeInteractions` hook handles all interaction logic
- Real-time sync and persistence work automatically through existing infrastructure
- Testing will be done manually per the PRD testing checklist

---

## Tasks

- [x] 1.0 Define ArrowObject type in type system
  - [x] 1.1 Open `src/features/objects/types/index.ts` and examine BaseObject interface
  - [x] 1.2 Add ArrowObject interface extending BaseObject with properties: type='arrow', points (4-element array), stroke, strokeWidth, fill, pointerLength, pointerWidth
  - [x] 1.3 Add ArrowObject to the CanvasObject union type
  - [x] 1.4 Verify TypeScript compilation has no errors

- [x] 2.0 Create Arrow component following existing shape patterns
  - [x] 2.1 Read Rectangle.tsx and Circle.tsx to understand the component pattern
  - [x] 2.2 Create new file `src/features/objects/components/Arrow.tsx`
  - [x] 2.3 Import necessary dependencies: React, Konva types, react-konva Arrow, useShapeInteractions, ArrowObject type
  - [x] 2.4 Define ArrowProps interface matching Rectangle/Circle props pattern
  - [x] 2.5 Implement Arrow component function with useShapeInteractions hook
  - [x] 2.6 Render Konva Arrow with proper props (points, stroke, strokeWidth, fill, pointerLength, pointerWidth)
  - [x] 2.7 Add Transformer component for resize/rotate handles when selected
  - [x] 2.8 Export Arrow component

- [x] 3.0 Integrate arrow into ObjectRenderer
  - [x] 3.1 Open `src/features/objects/components/ObjectRenderer.tsx`
  - [x] 3.2 Import Arrow component at top of file
  - [x] 3.3 Add case for 'arrow' type in the rendering logic
  - [x] 3.4 Render Arrow component with proper props passed through
  - [x] 3.5 Verify TypeScript recognizes arrow type correctly

- [x] 4.0 Add arrow tool to canvas toolbar
  - [x] 4.1 Open `app/canvas/page.tsx` (actual location of tool buttons)
  - [x] 4.2 Add arrow SVG icon (inline arrow icon)
  - [x] 4.3 Add 'arrow' to the tool type options/state
  - [x] 4.4 Add arrow button to toolbar UI after circle tool
  - [x] 4.5 Wire up onClick handler to set active tool to 'arrow'
  - [x] 4.6 Apply active styling when arrow tool is selected

- [x] 5.0 Implement arrow creation logic
  - [x] 5.1 Open `app/canvas/page.tsx` and locate shape creation handlers
  - [x] 5.2 Read existing rectangle/circle creation logic to understand the pattern
  - [x] 5.3 Add state for tracking arrow creation (startPoint, isDrawing)
  - [x] 5.4 Implement onMouseDown handler for arrow tool: capture start point (x1, y1)
  - [x] 5.5 Implement onMouseMove handler for arrow tool: update preview with current point (x2, y2)
  - [x] 5.6 Implement onMouseUp handler for arrow tool: finalize arrow creation
  - [x] 5.7 Generate unique ID using existing ID generation pattern
  - [x] 5.8 Create arrow object with default properties (black stroke, 2px width, 10px pointer dimensions)
  - [x] 5.9 Call objectsService to persist arrow to Firestore and broadcast to other users
  - [x] 5.10 Clear creation state and select newly created arrow
  - [x] 5.11 Add arrow preview support to ShapePreview component
  - [x] 5.12 Broadcast live arrow preview while drawing (syncs to all users)
  - [x] 5.13 Clear preview when arrow creation completes or cancels

- [ ] 6.0 Test and validate arrow functionality
  - [ ] 6.1 Test: Click arrow tool in toolbar and verify it becomes active
  - [ ] 6.2 Test: Click-drag on canvas creates arrow from start to end point
  - [ ] 6.3 Test: Arrow renders with proper arrowhead pointing in correct direction
  - [ ] 6.4 Test: Click arrow to select it and verify transformer handles appear
  - [ ] 6.5 Test: Drag arrow to move it around canvas
  - [ ] 6.6 Test: Use resize handles to scale arrow
  - [ ] 6.7 Test: Use rotation handle to rotate arrow
  - [ ] 6.8 Test: Press Delete key to remove selected arrow
  - [ ] 6.9 Test: Refresh page and verify arrow persists
  - [ ] 6.10 Test: Open two browser windows, create arrow in one, verify it appears in other within 100ms
  - [ ] 6.11 Test: Move arrow in one window, verify real-time sync in other window
  - [ ] 6.12 Test: Use AI agent command "Create an arrow from 100,100 to 300,200" and verify it works

---

*Task list generated: 2025-10-18*

