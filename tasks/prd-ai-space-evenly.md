# PRD: AI Space Elements Evenly

## Introduction/Overview

Enable the AI agent to take user-selected objects and space them evenly with equal distance between each element. This feature extends the existing `canvasAction` tool's `arrange` functionality, requiring users to select objects first using the multi-select feature (Phase 1), then issue an explicit command to the AI. The agent will calculate optimal spacing and update object positions to achieve evenly-distributed layouts.

## Goals

1. Support "space evenly" command for user-selected objects
2. Require explicit multi-select before AI command (no ambiguity handling)
3. Use existing `canvasAction` tool with `action='arrange'` 
4. Calculate equal spacing between objects automatically
5. Support both horizontal (default) and vertical spacing
6. Provide clear feedback if insufficient objects selected (<2)
7. Maintain ID-based targeting pattern (use selected object IDs)

## User Stories

1. **As a photographer**, I want to select 5 color swatches and tell the AI to "space these evenly" so that they form a perfectly aligned palette.

2. **As a stylist**, I want to select text labels and ask the AI to "distribute these horizontally with equal spacing" so that my LookBook layout looks professional.

3. **As a creative director**, I want to select multiple shapes and say "space them out evenly" so that I can quickly create balanced compositions.

4. **As a model**, I want to select objects and tell the AI "arrange these with even spacing vertically" so that I can create organized column layouts.

## Functional Requirements

### FR1: Selection Requirement
User must select 2+ objects before issuing command:
- User selects objects using Ctrl+click (Phase 1 multi-select feature)
- Selection state tracked in objects store: `selectedObjectIds: string[]`
- AI receives selected object IDs in command context
- If <2 objects selected, agent responds: "Please select at least 2 objects first, then say 'Done' when ready."

### FR2: Explicit Command Pattern
AI recognizes explicit spacing commands (no semantic reconciliation):
- **Supported Commands:**
  - "Space these evenly"
  - "Distribute these horizontally"
  - "Space them out evenly"
  - "Arrange with equal spacing"
  - "Space these vertically"
  
- **Unsupported** (too ambiguous - reject with helpful message):
  - "Make it look better"
  - "Fix the layout"
  - "Organize these"

### FR3: Direction Detection
Agent determines spacing direction from command:
- **Horizontal (default):** "space evenly", "distribute horizontally", "space these"
- **Vertical:** "space vertically", "distribute vertically", "vertical spacing"
- If ambiguous, default to horizontal with message: "Spacing horizontally (default)"

### FR4: Spacing Calculation
Calculate equal spacing between objects:
```typescript
// For horizontal spacing of N objects
const totalObjects = selectedIds.length;
const objects = getSelectedObjects(selectedIds);

// Sort by current position
objects.sort((a, b) => a.position.x - b.position.x);

// Calculate total width of all objects
const totalWidth = objects.reduce((sum, obj) => sum + obj.width, 0);

// Calculate available space
const firstX = objects[0].position.x;
const lastX = objects[objects.length - 1].position.x + objects[objects.length - 1].width;
const availableSpace = lastX - firstX - totalWidth;

// Calculate equal spacing
const equalSpacing = availableSpace / (totalObjects - 1);

// Update positions
let currentX = firstX;
for (const obj of objects) {
  updateObject(obj.id, { position: { x: currentX, y: obj.position.y } });
  currentX += obj.width + equalSpacing;
}
```

### FR5: Use Existing canvasAction Tool
Leverage existing `action='arrange'` functionality:
```typescript
// Agent generates this action
{
  tool: 'canvasAction',
  params: {
    action: 'arrange',
    targets: ['id1', 'id2', 'id3', 'id4'],  // Selected object IDs
    layout: {
      direction: 'horizontal',  // or 'vertical'
      spacing: 'even'  // NEW: Calculate equal spacing
    }
  }
}
```

### FR6: Spacing Modes
Support two spacing calculation modes:
- **Even Spacing (default):** Equal distance between objects (based on current positions)
- **Fixed Spacing:** User specifies exact pixel spacing (e.g., "space these 50 pixels apart")

### FR7: Boundary Preservation
Maintain first and last object positions:
- First object position stays fixed
- Last object position stays fixed
- Objects in between distributed evenly
- Prevents layout from shifting unexpectedly

### FR8: Edge Case Handling
Handle edge cases gracefully:
- **0-1 objects selected:** "Please select at least 2 objects first."
- **All objects same position:** "Objects are already overlapping. Please spread them out first."
- **Insufficient space:** "Not enough space to distribute evenly. Try moving objects further apart."

### FR9: System Prompt Enhancement
Update AI agent system prompt:
```
SPACE ELEMENTS EVENLY:
When user says "space evenly" or "distribute evenly", they want equal spacing between selected objects.

WORKFLOW:
1. User selects objects using Ctrl+click (multi-select)
2. User says "space these evenly" or similar command
3. Call getCanvasState() to verify selection
4. Call canvasAction with action='arrange', targets=[selectedIds], layout={direction, spacing: 'even'}

COMMANDS:
- "Space these evenly" → Horizontal even spacing (default)
- "Distribute these horizontally" → Horizontal even spacing
- "Space vertically" → Vertical even spacing
- "Space these 50 pixels apart" → Fixed spacing of 50px

REQUIREMENTS:
- Minimum 2 objects must be selected
- Use exact object IDs from selection
- Preserve first and last object positions
- Calculate equal spacing based on available space

ERRORS:
- If <2 selected: "Please select at least 2 objects, then say 'Done'."
- If ambiguous: "Did you mean horizontal or vertical spacing?"
```

## Non-Goals (Out of Scope)

- Auto-select objects based on AI guessing (user must explicitly select)
- Semantic reconciliation of ambiguous commands (explicit commands only)
- "Space evenly" without pre-selection (always require selection first)
- Alignment (top/bottom/center) - separate from spacing
- Distribution with custom curves or patterns
- Grouping objects after spacing (separate feature)

## Design Considerations

### UI/UX
- **Selection First:** User must select objects before AI command
- **Clear Feedback:** "Selected 5 objects. Ready to space evenly."
- **Direction Indicator:** "Spacing horizontally..." or "Spacing vertically..."
- **Visual Preview:** Objects move smoothly to new positions (animated)
- **Undo Support:** Can undo spacing operation (general undo/redo feature)

### Workflow
1. User selects 2+ objects with Ctrl+click
2. User says "space these evenly" to AI
3. AI verifies selection (calls getCanvasState)
4. AI generates arrange action with selected IDs
5. Client executes arrange with even spacing calculation
6. Objects move to evenly-spaced positions
7. Changes sync to all users in real-time

### Spacing Algorithm
**Horizontal Even Spacing:**
```
[Obj1]---equal---[Obj2]---equal---[Obj3]---equal---[Obj4]
  ↑ fixed                                         ↑ fixed
```

**Vertical Even Spacing:**
```
[Obj1]  ↑ fixed
  |
equal
  |
[Obj2]
  |
equal
  |
[Obj3]
  |
equal
  |
[Obj4]  ↑ fixed
```

## Technical Considerations

### Integration with Multi-Select (Phase 1 Dependency)

**Prerequisites:**
- Multi-select feature must be complete (Phase 1)
- `selectedObjectIds: string[]` available in objects store
- Client can send selected IDs to AI agent

**Context Passing:**
```typescript
// In useAIAgent.ts, update command request
const response = await fetch('/api/ai-agent', {
  method: 'POST',
  body: JSON.stringify({
    command: input,
    canvasId,
    userId,
    userName,
    objects: objects,  // All canvas objects
    selectedObjectIds: selectedObjectIds  // NEW: Pass selection
  })
});
```

### LangChain/LangGraph Integration

**Current Architecture (Maintained):**
- ReAct agent with GPT-4o-mini
- 2-tool system: `getCanvasState` + `canvasAction`
- Existing `arrange` action already supports layout

**Changes Required:**

1. **Update Zod Schema** in `simpleAgentService.ts`:
```typescript
layout: z.object({
  direction: z.enum(['horizontal', 'vertical']),
  spacing: z.union([
    z.number(),  // Fixed spacing in pixels
    z.literal('even')  // NEW: Even spacing mode
  ]).optional().describe('Spacing between shapes: number (pixels) or "even" (equal distribution)')
})
```

2. **Update System Prompt** with spacing examples and workflow

3. **Extend Arrange Tool Logic** in `tools.ts`:
```typescript
// In canvasActionTool, modify arrange action
if (action === 'arrange') {
  const { direction, spacing = 20 } = params.layout;
  
  // NEW: Calculate even spacing if requested
  const actualSpacing = spacing === 'even' 
    ? calculateEvenSpacing(shapesToArrange, direction)
    : spacing;
  
  // Arrange shapes with calculated spacing
  let currentPosition = direction === 'horizontal' 
    ? shapesToArrange[0].position.x 
    : shapesToArrange[0].position.y;
  
  for (const shape of shapesToArrange) {
    if (direction === 'horizontal') {
      await updateObject(shape.id, { position: { x: currentPosition, y: shape.position.y } });
      currentPosition += getShapeWidth(shape) + actualSpacing;
    } else {
      await updateObject(shape.id, { position: { x: shape.position.x, y: currentPosition } });
      currentPosition += getShapeHeight(shape) + actualSpacing;
    }
  }
}
```

### Even Spacing Algorithm Implementation

**Helper Function (add to tools.ts):**
```typescript
function calculateEvenSpacing(
  shapes: CanvasObject[],
  direction: 'horizontal' | 'vertical'
): number {
  if (shapes.length < 2) return 20; // Default fallback
  
  // Sort by position
  shapes.sort((a, b) => {
    return direction === 'horizontal' 
      ? a.position.x - b.position.x
      : a.position.y - b.position.y;
  });
  
  // Calculate total dimensions
  const totalDimension = shapes.reduce((sum, shape) => {
    return sum + (direction === 'horizontal' ? getShapeWidth(shape) : getShapeHeight(shape));
  }, 0);
  
  // Calculate span from first to last object
  const firstPos = direction === 'horizontal' ? shapes[0].position.x : shapes[0].position.y;
  const lastShape = shapes[shapes.length - 1];
  const lastPos = direction === 'horizontal'
    ? lastShape.position.x + getShapeWidth(lastShape)
    : lastShape.position.y + getShapeHeight(lastShape);
  
  const totalSpan = lastPos - firstPos;
  
  // Calculate available space for gaps
  const availableSpace = totalSpan - totalDimension;
  
  // Calculate equal spacing
  const numberOfGaps = shapes.length - 1;
  const evenSpacing = availableSpace / numberOfGaps;
  
  // Ensure positive spacing
  return Math.max(evenSpacing, 10); // Minimum 10px spacing
}

function getShapeWidth(shape: CanvasObject): number {
  if (shape.type === 'circle' && shape.radius) {
    return shape.radius * 2;
  }
  return shape.width || 100;
}

function getShapeHeight(shape: CanvasObject): number {
  if (shape.type === 'circle' && shape.radius) {
    return shape.radius * 2;
  }
  return shape.height || 100;
}
```

### Selection State Access

**In simpleAgentService.ts:**
```typescript
interface CommandRequest {
  command: string;
  userName: string;
  canvasId: string;
  userId: string;
  objectCount?: number;
  objects?: unknown[];
  selectedObjectIds?: string[];  // NEW: Pass selected IDs
}

// In system prompt, add context
const systemMessage = new SystemMessage(`You are a helpful AI assistant...

The user currently has ${context.selectedObjectIds?.length || 0} object(s) selected.
Selected object IDs: ${context.selectedObjectIds?.join(', ') || 'none'}

SPACE EVENLY WORKFLOW:
1. User must select 2+ objects first
2. User says "space these evenly" or similar
3. You call canvasAction with action='arrange', targets=[selected IDs], layout={spacing: 'even'}
...`);
```

### Client-Side Execution

**No changes needed** - existing arrange execution in `useAIAgent.ts` handles even spacing:
```typescript
// Existing code already handles arrange action
if (action.tool === 'canvasAction' && action.params.action === 'arrange') {
  // Tool function calculates even spacing and updates positions
  // No client-side changes needed
}
```

### AI Agent Patterns (LangChain Best Practices)

**1. Explicit Commands Only:**
- Clear command recognition ("space evenly", "distribute horizontally")
- No semantic guessing or ambiguity resolution
- If unclear, ask user to clarify

**2. Validation Before Execution:**
- Check selectedObjectIds.length >= 2
- Validate objects exist using getCanvasState
- Provide helpful error messages if validation fails

**3. Graceful Degradation:**
- If even spacing calculation fails, fall back to fixed 20px spacing
- If not enough space, suggest moving objects further apart
- Always provide clear feedback to user

**4. Prompt Engineering:**
- Clear examples of supported commands
- Explicit workflow steps
- Edge case handling instructions
- Error message templates

## Success Metrics

1. **Functionality**: Agent correctly spaces selected objects evenly
2. **Accuracy**: Spacing calculation produces equal gaps (±1px tolerance)
3. **UX**: Clear feedback when selection insufficient or command ambiguous
4. **Performance**: Spacing operation completes in <1 second
5. **Reliability**: Works consistently with 2-20 selected objects

## Open Questions

None - design aligns with existing architecture and explicit command pattern.

## Implementation Notes

### Implementation Order
1. Update multi-select to pass `selectedObjectIds` to AI agent
2. Update Zod schema in `simpleAgentService.ts` (add `spacing: 'even'` option)
3. Update system prompt with spacing workflow and examples
4. Implement `calculateEvenSpacing` helper function in tools.ts
5. Update arrange action logic to handle `spacing: 'even'`
6. Test with various object counts (2, 5, 10, 20)
7. Test horizontal and vertical spacing
8. Test edge cases (0 selected, 1 selected, overlapping objects)
9. Verify real-time sync to other users

### Files to Modify
- `src/features/ai-agent/services/simpleAgentService.ts` - Update schema, system prompt
- `src/features/ai-agent/lib/tools.ts` - Add calculateEvenSpacing helper, update arrange logic
- `src/features/ai-agent/hooks/useAIAgent.ts` - Pass selectedObjectIds in request
- `src/features/objects/lib/objectsStore.ts` - Ensure selectedObjectIds accessible

### Testing Checklist
- Select 3 objects → "space these evenly" → Equal horizontal spacing
- Select 5 objects → "distribute vertically" → Equal vertical spacing
- Select 10 objects → "space evenly" → Grid-like spacing
- Select 0 objects → "space evenly" → Error: "Please select objects first"
- Select 1 object → "space evenly" → Error: "Need at least 2 objects"
- Select 4 objects (overlapping) → "space evenly" → Error or minimal spacing
- Spacing with mixed shape types (rectangles + circles)
- Spacing with different sized shapes
- Undo spacing operation (Phase 1 undo feature)
- Changes sync to all users in real-time

