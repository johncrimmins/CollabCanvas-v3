# PRD: AI Bulk Creation

## Introduction/Overview

Enable the AI agent to create multiple shapes in a single command, supporting batch creation of any quantity (e.g., "create 100 rectangles"). This feature extends the existing `canvasAction` tool to handle bulk operations while maintaining the ID-based targeting pattern and client-side execution architecture. The agent will generate multiple create actions in a single response, improving efficiency for repetitive layout tasks.

## Goals

1. Support bulk creation commands (e.g., "create 50 circles", "make 100 red squares")
2. Extend existing `canvasAction` tool without breaking current functionality
3. Maintain client-side execution pattern for all bulk operations
4. Generate intelligent layouts when user doesn't specify positions
5. Create shapes instantaneously (appear all at once to user)
6. Limit bulk operations to reasonable quantities (max 100 shapes per command)
7. Maintain sub-2 second AI response time for bulk operations

## User Stories

1. **As a stylist**, I want to ask the AI to "create 50 color swatches" so that I can quickly build a palette grid for my LookBook.

2. **As a photographer**, I want to say "make 20 circles in a grid" so that I can create a pattern background for my Look composition.

3. **As a creative director**, I want to tell the AI "create 100 small squares" so that I can build a mosaic layout without manually placing each one.

4. **As a model**, I want to ask for "30 rectangles in different colors" so that I can experiment with various color combinations quickly.

## Functional Requirements

### FR1: Bulk Creation Tool Extension
Extend the existing `canvasAction` tool to support bulk creation:
- No new tool needed - leverage existing `action='create'` with quantity parameter
- Agent generates multiple create actions in single response
- Client executes actions with optimistic rendering (all appear instantly)
- Each shape gets unique ID and position

### FR2: Quantity Parameter
Add optional `quantity` parameter to create action schema:
```typescript
shape: {
  type: 'rectangle' | 'circle' | 'text',
  position: { x: number, y: number },
  // ... existing parameters
  quantity?: number  // NEW: Number of shapes to create (default: 1, max: 200)
}
```

### FR3: Intelligent Layout Generation
When user specifies quantity but not explicit positions, agent generates layouts:
- **Grid Layout** (default for quantity > 9): Arrange in square grid (e.g., 10x10 for 100 shapes)
- **Row Layout**: Arrange in horizontal rows (e.g., "20 circles in a row")
- **Column Layout**: Arrange in vertical columns
- **Random Scatter**: Distribute randomly across canvas area
- Auto-calculate spacing based on shape dimensions and quantity

### FR4: Quantity Limits
Enforce reasonable limits to prevent performance issues:
- Minimum: 1 shape (standard create)
- Maximum: 100 shapes per command
- Reject quantities > 100 with helpful message: "I can create up to 100 shapes at a time. Try breaking it into multiple commands."

### FR5: Batch Action Generation
Agent generates array of create actions for bulk operations:
```typescript
// Agent response for "create 10 circles"
{
  message: "I'll create 10 circles in a grid layout!",
  actions: [
    { tool: 'canvasAction', params: { action: 'create', shape: {...} } },
    { tool: 'canvasAction', params: { action: 'create', shape: {...} } },
    // ... 8 more create actions
  ]
}
```

### FR6: Instantaneous Creation
Client creates all shapes rapidly with optimistic updates:
- All shapes appear instantaneously on canvas (optimistic rendering)
- Backend processes creates sequentially but user sees immediate results
- No progress indicators needed - creation feels instant
- Success message: "Created 100 shapes successfully!" (in AI chat)

### FR7: Layout Algorithms
Implement layout algorithms for auto-positioning:

**Grid Layout:**
```typescript
// For quantity = 50, spacing = 60
const cols = Math.ceil(Math.sqrt(quantity));  // 8 cols
const rows = Math.ceil(quantity / cols);       // 7 rows
for (let i = 0; i < quantity; i++) {
  const col = i % cols;
  const row = Math.floor(i / cols);
  const x = startX + (col * spacing);
  const y = startY + (row * spacing);
  // Create shape at (x, y)
}
```

**Row Layout:** Single row, evenly spaced
**Column Layout:** Single column, evenly spaced
**Random Scatter:** Random positions within defined area

### FR8: Color Variation Support
Support color variations in bulk creation:
- "Create 10 circles in rainbow colors" → Each circle gets different color
- "Make 50 squares, half red and half blue" → Alternating colors
- "Create 20 rectangles in shades of blue" → Gradient from light to dark blue

### FR9: System Prompt Enhancement
Update AI agent system prompt to teach bulk creation pattern:
```
BULK CREATION:
When user requests multiple shapes (e.g., "create 50 circles"), generate multiple canvasAction calls.

Examples:
- "Create 100 small squares" → Generate 100 create actions in grid layout
- "Make 20 circles in a row" → Generate 20 create actions in horizontal row
- "Create 50 red and blue rectangles" → Generate 50 create actions with alternating colors

Use intelligent layouts when position not specified:
- quantity > 9: Grid layout (square grid)
- quantity <= 9: Row layout (horizontal)
- User says "grid": Grid layout
- User says "row" or "horizontal": Row layout
- User says "column" or "vertical": Column layout
- User says "random" or "scattered": Random scatter

Calculate spacing: shape_dimension + 10px minimum
```

## Non-Goals (Out of Scope)

- Server-side batch creation (maintain client-side execution pattern)
- Undo/redo for bulk operations (handled by general undo/redo feature)
- Bulk update/delete operations (separate PRD if needed)
- Templates or saved bulk patterns (future enhancement)
- Bulk creation with complex object relationships (e.g., grouped objects)
- Importing bulk shapes from external files

## Design Considerations

### UI/UX
- **Instantaneous Rendering**: All shapes appear at once (optimistic UI)
- **No Progress Indicators**: Creation is fast enough to not need them
- **Success/Error Messages**: Clear feedback when complete or if error occurs
- **Quantity Limit Enforcement**: Agent rejects requests > 100 shapes

### Performance
- Client-side execution ensures auth context maintained
- Firebase batch writes for better performance (group creates in batches of 10-20)
- Optimistic UI updates (show ALL shapes immediately, Firebase confirms in background)
- Sequential backend processing is transparent to user - feels instant

### Layout Intelligence
- Default spacing: shape width/height + 10px
- Grid dimensions: Aim for square grid (e.g., 10x10 for 100)
- Start position: Center of canvas or user-specified
- Bounds checking: Ensure shapes don't go off-canvas

## Technical Considerations

### LangChain/LangGraph Integration

**Current Architecture (Maintained):**
- ReAct agent with GPT-4o-mini
- 2-tool system: `getCanvasState` + `canvasAction`
- ID-based targeting pattern
- Client-side execution

**Changes Required:**
1. **Update Zod Schema** in `simpleAgentService.ts`:
```typescript
shape: z.object({
  type: z.enum(['rectangle', 'circle', 'text']),
  position: z.object({ x: z.number(), y: z.number() }),
  dimensions: z.object({...}).optional(),
  style: z.object({...}).optional(),
  quantity: z.number().min(1).max(100).optional()
    .describe('Number of shapes to create (default: 1, max: 100). Agent will generate multiple create actions.')
}).optional()
```

2. **Update System Prompt** with bulk creation examples and layout guidelines

3. **Agent Action Generation Logic:**
```typescript
// In simpleAgentService.ts, modify tool function
if (action === 'create' && shape.quantity && shape.quantity > 1) {
  // Generate multiple create actions
  for (let i = 0; i < shape.quantity; i++) {
    const position = calculateLayoutPosition(i, shape.quantity, layout, spacing);
    const color = calculateColorVariation(i, shape.quantity, colorScheme);
    
    this.capturedActions.push({
      tool: 'canvasAction',
      params: { 
        action: 'create', 
        shape: { 
          ...shape, 
          position, 
          style: { ...shape.style, fill: color },
          quantity: undefined  // Remove quantity from individual actions
        } 
      }
    });
  }
  return `Prepared to create ${shape.quantity} ${shape.type} shapes in ${layout} layout`;
}
```

### Client-Side Execution (useAIAgent.ts)

**Current Pattern (Maintained):**
```typescript
for (const action of data.actions) {
  if (action.tool === 'canvasAction' && action.params.action === 'create') {
    await createObject(canvasId, params);
  }
}
```

**No changes needed for bulk operations:**
```typescript
// Existing pattern handles bulk creation fine
// All shapes created sequentially but appear instantly via optimistic updates
for (const action of data.actions || []) {
  if (action.tool === 'canvasAction' && action.params.action === 'create') {
    await createObject(canvasId, params);
  }
}
```

### Layout Algorithm Implementation

**Helper Functions (add to tools.ts or new file):**
```typescript
function calculateLayoutPosition(
  index: number,
  total: number,
  layout: 'grid' | 'row' | 'column' | 'scatter',
  startPos: { x: number, y: number },
  spacing: number
): { x: number, y: number } {
  switch (layout) {
    case 'grid': {
      const cols = Math.ceil(Math.sqrt(total));
      const col = index % cols;
      const row = Math.floor(index / cols);
      return {
        x: startPos.x + (col * spacing),
        y: startPos.y + (row * spacing)
      };
    }
    case 'row': {
      return {
        x: startPos.x + (index * spacing),
        y: startPos.y
      };
    }
    case 'column': {
      return {
        x: startPos.x,
        y: startPos.y + (index * spacing)
      };
    }
    case 'scatter': {
      return {
        x: startPos.x + (Math.random() * 800),
        y: startPos.y + (Math.random() * 600)
      };
    }
  }
}

function calculateColorVariation(
  index: number,
  total: number,
  colorScheme: 'rainbow' | 'gradient' | 'alternating' | null,
  baseColor?: string
): string {
  if (!colorScheme) return baseColor || '#3b82f6';
  
  switch (colorScheme) {
    case 'rainbow': {
      const hue = (index / total) * 360;
      return `hsl(${hue}, 70%, 50%)`;
    }
    case 'gradient': {
      // Gradient from light to dark blue
      const lightness = 80 - (index / total) * 50;
      return `hsl(220, 70%, ${lightness}%)`;
    }
    case 'alternating': {
      return index % 2 === 0 ? '#ff0000' : '#0000ff';
    }
  }
}
```

### Firestore Batch Writes
Optimize Firebase operations for bulk creation:
```typescript
// In objectsService.ts, add batch create function
export async function batchCreateObjects(
  canvasId: string,
  objects: CanvasObject[]
): Promise<void> {
  const db = getFirestore();
  const batch = writeBatch(db);
  
  // Firebase batch limit: 500 operations
  const chunks = chunkArray(objects, 500);
  
  for (const chunk of chunks) {
    for (const object of chunk) {
      const objectRef = doc(db, 'canvases', canvasId, 'objects', object.id);
      batch.set(objectRef, object);
    }
    await batch.commit();
  }
}
```

### AI Agent Patterns (LangChain Best Practices)

**1. Tool Orchestration:**
- Maintain single `canvasAction` tool (no new tools)
- Agent generates array of actions for bulk operations
- Client executes actions with optimistic rendering (instant appearance)

**2. Prompt Engineering:**
- Clear examples of bulk creation commands
- Layout selection guidelines
- Color variation patterns
- Quantity limits and warnings

**3. Error Handling:**
- Graceful degradation: If layout algorithm fails, fall back to simple row
- Validate quantity limits in tool schema (Zod)
- Clear error messages for users

**4. Performance:**
- AI response time: <2 seconds (agent generates positions, doesn't execute)
- Client execution: Optimistic rendering (all shapes appear immediately)
- Firebase: Batch writes in background for efficiency

## Success Metrics

1. **Functionality**: Agent correctly generates bulk create actions for quantities 1-100
2. **AI Response Time**: <2 seconds for bulk creation commands
3. **Client Performance**: All 100 shapes appear instantaneously (optimistic rendering)
4. **Layout Quality**: Shapes arranged intelligently without overlap
5. **User Satisfaction**: Users find bulk creation intuitive and blazing fast

## Open Questions

None - design aligns with existing architecture and LangChain patterns.

## Implementation Notes

### Implementation Order
1. Update Zod schema in `simpleAgentService.ts` (add `quantity` parameter, max 100)
2. Update system prompt with bulk creation examples and layout guidelines
3. Implement layout algorithm helper functions
4. Add batch action generation logic to tool function
5. Test with various quantities (1, 10, 50, 100)
6. Test layout algorithms (grid, row, column, scatter)
7. Test color variations (rainbow, gradient, alternating)
8. Verify optimistic rendering shows all shapes instantly

### Files to Modify
- `src/features/ai-agent/services/simpleAgentService.ts` - Update schema (max 100), system prompt, tool function
- `src/features/ai-agent/lib/tools.ts` - Add layout algorithm helpers
- `src/features/objects/services/objectsService.ts` - Optional: Add batch create function for efficiency

### Testing Checklist
- "Create 10 circles" → 10 circles appear instantly in row
- "Make 50 red squares in a grid" → 50 squares appear instantly in 8x7 grid
- "Create 100 small rectangles" → 100 rectangles appear instantly in 10x10 grid
- "Make 20 circles in rainbow colors" → 20 circles with color gradient appear instantly
- "Create 5 large squares vertically" → 5 squares in column appear instantly
- "Make 30 random circles" → 30 circles scattered randomly appear instantly
- Quantity limit: "Create 150 circles" → Error message: "I can create up to 100 shapes at a time"
- All shapes appear simultaneously (optimistic rendering)
- Firebase batch writes working correctly in background
- All shapes sync to other users in real-time

