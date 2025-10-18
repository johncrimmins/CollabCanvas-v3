# PRD: AI Arrange Horizontally/Vertically

## Introduction/Overview

Enable the AI agent to arrange user-selected objects in horizontal rows or vertical columns with fixed spacing. This feature builds on the existing `canvasAction` tool's `arrange` functionality, enhancing it to support simple directional layouts. Users select objects with multi-select (Phase 1), then issue explicit commands like "arrange these horizontally" or "stack vertically" to create aligned layouts.

## Goals

1. Support horizontal and vertical arrangement commands
2. Require explicit multi-select before AI command (no ambiguity)
3. Use existing `canvasAction` tool with `action='arrange'`
4. Maintain consistent alignment (same Y for horizontal, same X for vertical)
5. Use fixed spacing between objects (default 20px, user-configurable)
6. Provide clear feedback if insufficient objects selected (<2)
7. Maintain ID-based targeting pattern with selected object IDs

## User Stories

1. **As a photographer**, I want to select 5 images and say "arrange horizontally" so that they form a neat row across my Look.

2. **As a stylist**, I want to select color swatches and tell the AI to "stack these vertically" so that I can create a vertical palette column.

3. **As a creative director**, I want to select text labels and say "arrange in a row" so that they line up perfectly without manual adjustment.

4. **As a model**, I want to select shapes and tell the AI "arrange vertically with 30 pixel spacing" so that I can create organized lists.

## Functional Requirements

### FR1: Selection Requirement
User must select 2+ objects before issuing command:
- User selects objects using Ctrl+click (Phase 1 multi-select feature)
- Selection state tracked: `selectedObjectIds: string[]`
- AI receives selected IDs in command context
- If <2 objects selected: "Please select at least 2 objects first, then say 'Done'."

### FR2: Explicit Command Pattern
AI recognizes explicit arrange commands (no semantic reconciliation):
- **Horizontal Commands:**
  - "Arrange these horizontally"
  - "Put these in a row"
  - "Line these up horizontally"
  - "Make a horizontal row"
  
- **Vertical Commands:**
  - "Arrange these vertically"
  - "Stack these vertically"
  - "Put these in a column"
  - "Line these up vertically"

- **Unsupported** (too ambiguous):
  - "Organize these" (unclear direction)
  - "Make them look nice" (too vague)
  - "Fix the layout" (unclear intent)

### FR3: Alignment Behavior
Objects aligned along primary axis:
- **Horizontal:** All objects share same Y position (aligned tops or centers)
- **Vertical:** All objects share same X position (aligned lefts or centers)
- Default alignment: Top-left corner of objects
- Spacing calculated from edge to edge

### FR4: Spacing Control
Support fixed spacing between objects:
- **Default Spacing:** 20 pixels
- **Custom Spacing:** User can specify (e.g., "arrange horizontally with 50 pixel spacing")
- **Minimum Spacing:** 5 pixels
- **Maximum Spacing:** 500 pixels

### FR5: Use Existing canvasAction Tool
Leverage existing `action='arrange'` with enhancements:
```typescript
// Agent generates this action
{
  tool: 'canvasAction',
  params: {
    action: 'arrange',
    targets: ['id1', 'id2', 'id3'],  // Selected object IDs
    layout: {
      direction: 'horizontal',  // or 'vertical'
      spacing: 20  // Fixed pixel spacing
    }
  }
}
```

### FR6: Starting Position
Use first selected object as anchor:
- First object position remains unchanged
- Subsequent objects positioned relative to first
- Preserves user's intended starting point

### FR7: Sorting Behavior
Sort objects before arranging:
- **Horizontal:** Sort by current X position (left to right)
- **Vertical:** Sort by current Y position (top to bottom)
- Maintains logical order when converting scattered objects to row/column

### FR8: Edge Case Handling
- **0-1 objects selected:** "Please select at least 2 objects first."
- **Objects already aligned:** Arrange anyway (may just adjust spacing)
- **Mixed shape sizes:** Calculate spacing edge-to-edge (not center-to-center)

### FR9: System Prompt Enhancement
Update AI agent system prompt:
```
ARRANGE HORIZONTALLY/VERTICALLY:
When user says "arrange horizontally" or "arrange vertically", create aligned row/column layouts.

WORKFLOW:
1. User selects 2+ objects with Ctrl+click
2. User says "arrange horizontally" or "arrange vertically"
3. Call getCanvasState() to verify selection
4. Call canvasAction with action='arrange', targets=[selectedIds], layout={direction, spacing}

COMMANDS:
- "Arrange horizontally" → Row layout with 20px spacing
- "Arrange vertically" → Column layout with 20px spacing
- "Put in a row with 30 pixel spacing" → Row with 30px spacing
- "Stack vertically with 50 pixel spacing" → Column with 50px spacing

ALIGNMENT:
- Horizontal: Objects aligned to same Y position (top edges)
- Vertical: Objects aligned to same X position (left edges)
- First selected object position is anchor

SORTING:
- Horizontal: Sort left-to-right by current X position
- Vertical: Sort top-to-bottom by current Y position

ERRORS:
- If <2 selected: "Please select at least 2 objects, then say 'Done'."
```

## Non-Goals (Out of Scope)

- Center alignment (align centers instead of edges) - future enhancement
- Right/bottom alignment - future enhancement
- Grid layouts (rows AND columns) - separate feature
- Wrapping (auto-wrap to next line) - future enhancement
- Even spacing distribution - covered by "Space Evenly" PRD
- Auto-select based on proximity - user must explicitly select

## Design Considerations

### UI/UX
- **Clear Feedback:** "Arranging 5 objects horizontally..."
- **Direction Indicator:** Show arrow (→ or ↓) during operation
- **Smooth Animation:** Objects move to positions with animation
- **Undo Support:** Can undo arrange (Phase 1 undo/redo)
- **Visual Alignment:** Show alignment guides during/after arrange

### Workflow
1. User selects 2+ objects
2. User says "arrange horizontally" or "arrange vertically"
3. AI verifies selection (getCanvasState)
4. AI generates arrange action with direction + spacing
5. Client executes arrange (existing code handles this)
6. Objects move to aligned positions
7. Changes sync to all users

### Layout Patterns

**Horizontal Arrangement:**
```
[Obj1]--20px--[Obj2]--20px--[Obj3]--20px--[Obj4]
  Y=100       Y=100       Y=100       Y=100
```

**Vertical Arrangement:**
```
[Obj1]  X=200
  |
20px
  |
[Obj2]  X=200
  |
20px
  |
[Obj3]  X=200
  |
20px
  |
[Obj4]  X=200
```

## Technical Considerations

### Integration with Multi-Select (Phase 1 Dependency)

**Prerequisites:**
- Multi-select complete with `selectedObjectIds` in store
- Client passes selection to AI agent

**Context Passing (same as Space Evenly PRD):**
```typescript
// In useAIAgent.ts
const response = await fetch('/api/ai-agent', {
  method: 'POST',
  body: JSON.stringify({
    command: input,
    selectedObjectIds: selectedObjectIds  // Pass selection
  })
});
```

### LangChain/LangGraph Integration

**Current Architecture (Maintained):**
- ReAct agent with GPT-4o-mini
- Existing `canvasAction` tool with `arrange` action
- ID-based targeting

**Changes Required:**

1. **System Prompt Update** in `simpleAgentService.ts`:
   - Add arrange horizontal/vertical examples
   - Include alignment and sorting behavior
   - Specify default spacing (20px)

2. **Existing Arrange Logic** in `tools.ts` (already implemented):
```typescript
// In canvasActionTool, arrange action
if (action === 'arrange') {
  const { direction, spacing = 20 } = params.layout;
  
  // Sort shapes by position
  shapesToArrange.sort((a, b) => {
    return direction === 'horizontal' 
      ? a.position.x - b.position.x
      : a.position.y - b.position.y;
  });
  
  // Arrange shapes
  let currentPosition = direction === 'horizontal' 
    ? shapesToArrange[0].position.x 
    : shapesToArrange[0].position.y;
  
  for (const shape of shapesToArrange) {
    if (direction === 'horizontal') {
      // Align Y position, space X
      await updateObject(shape.id, { 
        position: { 
          x: currentPosition, 
          y: shapesToArrange[0].position.y  // Align to first object's Y
        } 
      });
      currentPosition += getShapeWidth(shape) + spacing;
    } else {
      // Align X position, space Y
      await updateObject(shape.id, { 
        position: { 
          x: shapesToArrange[0].position.x,  // Align to first object's X
          y: currentPosition 
        } 
      });
      currentPosition += getShapeHeight(shape) + spacing;
    }
  }
}
```

3. **Spacing Extraction** from command:
```typescript
// In system prompt, teach agent to extract spacing
// "arrange horizontally with 30 pixel spacing" → spacing: 30
// "put in a row" → spacing: 20 (default)

// Agent learns pattern:
// - Look for numbers followed by "pixel", "px", or "pixels"
// - Default to 20 if not specified
```

### Validation Logic

**Selection Validation (in system prompt):**
```
Before arranging, verify:
1. User has selected 2+ objects (check selectedObjectIds.length)
2. All selected IDs exist in canvas (call getCanvasState to confirm)
3. If validation fails, provide clear error message

Example:
- 0 selected: "Please select objects first using Ctrl+click, then say 'Done'."
- 1 selected: "Please select at least one more object."
- 2+ selected: Proceed with arrange action
```

### Command Parsing

**Direction Detection (in system prompt):**
```
Detect direction from user command:
- "horizontal", "row", "across", "side by side" → direction: 'horizontal'
- "vertical", "column", "stack", "up and down" → direction: 'vertical'
- If unclear, ask: "Did you mean horizontal or vertical?"

Spacing Extraction:
- "with 30 pixel spacing" → spacing: 30
- "50 pixels apart" → spacing: 50
- No spacing mentioned → spacing: 20 (default)
- Validate: 5 <= spacing <= 500
```

### Client-Side Execution

**No changes needed** - existing arrange execution handles this:
```typescript
// In useAIAgent.ts (already implemented)
for (const action of data.actions || []) {
  if (action.tool === 'canvasAction' && action.params.action === 'arrange') {
    // Existing arrange logic in tools.ts handles the operation
    // No client-side changes required
  }
}
```

### AI Agent Patterns (LangChain Best Practices)

**1. Clear Command Recognition:**
- Explicit keywords for direction (horizontal/vertical)
- Pattern matching for spacing extraction
- No ambiguity - ask for clarification if unclear

**2. Validation Before Execution:**
- Check selection count >= 2
- Verify objects exist
- Validate spacing range

**3. Graceful Error Handling:**
- Clear error messages
- Helpful suggestions ("select at least 2 objects first")
- Fall back to defaults when appropriate

**4. Prompt Engineering:**
- Multiple examples of each command type
- Edge case handling instructions
- Default behavior specifications

## Success Metrics

1. **Functionality**: Agent correctly arranges objects in specified direction
2. **Alignment**: Objects perfectly aligned (same X or Y coordinate)
3. **Spacing**: Consistent spacing between objects (±1px tolerance)
4. **UX**: Clear feedback and error messages
5. **Performance**: Arrange operation completes in <1 second

## Open Questions

None - design aligns with existing architecture and explicit command pattern.

## Implementation Notes

### Implementation Order
1. Update system prompt in `simpleAgentService.ts` with arrange examples
2. Add command parsing examples (direction detection, spacing extraction)
3. Verify existing arrange logic in `tools.ts` handles alignment correctly
4. Test horizontal arrangement with various selections
5. Test vertical arrangement with various selections
6. Test custom spacing (30px, 50px, 100px)
7. Test edge cases (0 selected, 1 selected, mixed shapes)
8. Verify real-time sync

### Files to Modify
- `src/features/ai-agent/services/simpleAgentService.ts` - Update system prompt
- `src/features/ai-agent/hooks/useAIAgent.ts` - Pass selectedObjectIds (already done for Space Evenly)
- `src/features/ai-agent/lib/tools.ts` - Verify existing arrange logic (may not need changes)

### Testing Checklist
- Select 3 rectangles → "arrange horizontally" → Aligned row with 20px spacing
- Select 5 circles → "put in a row with 30 pixel spacing" → Row with 30px spacing
- Select 4 shapes → "arrange vertically" → Aligned column with 20px spacing
- Select 6 objects → "stack vertically with 50 pixel spacing" → Column with 50px spacing
- Select mixed shapes (rectangles + circles) → Arrange correctly
- Select 0 objects → Error message
- Select 1 object → Error message
- Undo arrange operation
- Changes sync to all users
- Spacing respects shape dimensions (edge-to-edge, not overlap)

