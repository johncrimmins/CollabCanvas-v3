# PRD: AI Agent Tool Consolidation

## Introduction/Overview

The AI Agent currently uses 5 tools (getCanvasState, manageShape, arrangeShapes, createLoginForm, createCardLayout) but experiences significant failures in shape targeting and manipulation. Testing revealed that 50% of test cases fail (tests 5-8 out of 8) due to ambiguous shape targeting using descriptions instead of object IDs.

**Problem Statement**: The agent receives object IDs from `getCanvasState` but is instructed via schema descriptions to use text descriptions like "the circle" or "red rectangle" when targeting shapes. This causes wrong shape selection when multiple similar shapes exist on the canvas.

**Goal**: Consolidate AI agent tools from 5 to 2, implement ID-based targeting, fix response generation to use human-readable color names, and ensure all test cases pass with proper shape manipulation.

---

## Goals

1. **Reduce Tool Complexity**: Consolidate from 5 tools to 2 tools (60% reduction)
2. **Fix Shape Targeting**: Implement ID-based targeting to eliminate ambiguity
3. **Improve Response Quality**: Translate hex colors to human-readable names in agent responses
4. **Pass All Tests**: Achieve 100% test pass rate (currently 50%)
5. **Maintain Performance**: Keep agent response time under 2 seconds
6. **Improve Maintainability**: Reduce codebase complexity and duplication

---

## User Stories

### As an end user, I want to:
- **US-1**: Move a specific shape when multiple similar shapes exist on the canvas
  - **Current State**: "Move the blue square to the right" moves wrong shape or fails
  - **Desired State**: Agent correctly identifies and moves the intended blue square

- **US-2**: Receive natural language responses about shape operations
  - **Current State**: "I created a #ff0000 circle!"
  - **Desired State**: "I created a red circle!"

- **US-3**: Delete a specific shape when multiple shapes of the same type exist
  - **Current State**: "Delete the red circle" says it deleted but nothing happens
  - **Desired State**: Red circle is successfully deleted

- **US-4**: Resize shapes with relative scaling
  - **Current State**: "Make the circle twice as big" doesn't work when multiple circles exist
  - **Desired State**: Agent correctly identifies and resizes the intended circle

### As a developer, I want to:
- **US-5**: Maintain a simple, consolidated tool architecture
  - **Current State**: 5 different tools with overlapping schemas
  - **Desired State**: 2 clear tools with distinct purposes (query vs action)

- **US-6**: Debug agent decisions easily through clear tool call traces
  - **Current State**: Multiple tool variations make traces complex
  - **Desired State**: Clear action-based tool calls with explicit IDs

---

## Functional Requirements

### Core Architecture (Phase 1)

**FR-1**: Consolidate 4 action tools into single `canvasAction` tool
- `manageShape` (create/update/delete/duplicate operations) → `canvasAction`
- `arrangeShapes` (multi-shape layout) → `canvasAction` with `action: 'arrange'`
- Remove `createLoginForm` and `createCardLayout` (deferred to Phase 2)

**FR-2**: Maintain `getCanvasState` as separate query-only tool
- No changes to current implementation
- Continues to return array of objects with IDs, types, positions, colors, dimensions

### Tool Schema Design

**FR-3**: `canvasAction` tool must support 5 action types:
- `create`: Create new shape with type, position, dimensions, style
- `update`: Modify existing shape using object ID
- `delete`: Remove shape using object ID
- `duplicate`: Copy shape using object ID with offset
- `arrange`: Layout multiple shapes using array of object IDs

**FR-4**: Tool schema must enforce ID-based targeting:
- `target` parameter accepts object ID string (e.g., "1729012345-abc123")
- Schema description must explicitly state: "Object ID from getCanvasState"
- For `arrange` action, accept array of object IDs

**FR-5**: Tool schema must support all existing shape operations:
- Position updates (absolute coordinates)
- Dimension updates (width, height, radius)
- Rotation updates (degrees)
- Scale updates (factor, e.g., 2 = twice as big)
- Color updates (fill property)
- Text content updates (for text shapes)

### System Prompt Updates

**FR-6**: System prompt must instruct agent on proper workflow:
```
CREATE operations (no query needed):
  User: "Create a red circle"
  → canvasAction({ action: "create", shape: {...} })

UPDATE/DELETE/DUPLICATE operations (MUST query first):
  User: "Move the blue square to the right"
  Step 1: getCanvasState() → get object IDs
  Step 2: canvasAction({ action: "update", target: "<ID>", updates: {...} })
```

**FR-7**: System prompt must include vocabulary translation guide:
- "square" = rectangle where width === height
- "box" = rectangle
- "move to the right" = increase x position by ~100px
- "twice as big" = scale: 2
- Color matching rules (blue → #0000ff or contains "blue")

**FR-8**: System prompt must instruct relative positioning calculations:
- "Move to the right" = CURRENT x + 100 (extract current from getCanvasState)
- "Move 100 pixels right" = CURRENT x + 100
- NOT absolute positions unless user specifies exact coordinates

### Response Generation

**FR-9**: Agent responses must translate hex colors to names:
- #ff0000 or #FF0000 → "red"
- #0000ff or #0000FF → "blue"  
- #00ff00 or #00FF00 → "green"
- #9333ea → "purple"
- #000000 → "black"
- #ffffff or #FFFFFF → "white"

**FR-10**: Agent responses must be conversational and clear:
- "I created a red circle!" (not "I created a #ff0000 circle!")
- "I moved the square to position (300, 200)" (not "I updated the rectangle")
- "I deleted the red circle!" (only if operation succeeded)

### Client-Side Execution

**FR-11**: Update `useAIAgent.ts` to handle `canvasAction` tool:
- Parse action type and route to appropriate operation
- For `create`: call `createObject` service
- For `update`: call `updateObject` service with ID and updates
- For `delete`: call `deleteObject` service with ID
- For `duplicate`: create new object with offset
- For `arrange`: update multiple object positions

**FR-12**: Maintain enhanced `findObjectByDescription` as fallback:
- Primary: Direct ID match (if agent uses ID)
- Secondary: Semantic matching (type + color + size modifiers)
- Tertiary: Spatial/size descriptors
- Keep existing edge case handling (left/right/top/bottom, big/small)

### Testing Requirements

**FR-13**: All 8 original test cases must pass:
1. ✅ "Create a red circle at position 100, 200" - PASS
2. ✅ "Make a 200x300 rectangle" - PASS (fix duplicate calls)
3. ✅ "Create a blue circle" - PASS
4. ✅ "Create a blue square" - PASS
5. 🔄 "Resize the circle to be twice as big" - FIX (currently fails)
6. 🔄 "Move the blue square to the right" - FIX (currently fails)
7. 🔄 "Move the blue square 100 pixels to the right" - FIX (currently fails)
8. 🔄 "Delete the red circle" - FIX (currently fails)

**FR-14**: Response quality improvements required:
- Test 1: Output "red circle" not "#ff0000 circle"
- Test 2: Single response, no repetition ("I created a black rectangle")
- Test 4: Output "blue square" not "#0000ff rectangle"

### Documentation Updates

**FR-15**: Update Memory Bank files:
- `activeContext.md`: Change "10 tools" → "2 tools" (getCanvasState, canvasAction)
- `progress.md`: Update tool count and architecture description
- `ai-agent-feature.md`: Delete or mark as DEPRECATED

**FR-16**: Update or create documentation:
- `docs/project-content/agentic-features.md`: Update or delete (currently outdated)
- `docs/ai-agent-testing.md`: Update to reflect 2-tool architecture
- Add inline code comments explaining ID-based targeting pattern

---

## Non-Goals (Out of Scope)

**NG-1**: Complex layout tools (`createLoginForm`, `createCardLayout`)
- Deferred to Phase 2
- Remove from current implementation entirely

**NG-2**: Advanced LangSmith observability enhancements
- Current tracing is sufficient
- No additional instrumentation needed

**NG-3**: Backward compatibility with old tool names
- Breaking change is acceptable
- Full re-testing is expected

**NG-4**: Extended color palette support
- Only support 6 basic colors: red, blue, green, purple, black, white
- Other colors remain as hex codes in responses

**NG-5**: Advanced semantic understanding
- Keep existing vocabulary aliases (square, box, oval)
- No AI-powered natural language processing beyond current pattern matching

**NG-6**: Multi-step operation planning
- Each command still triggers one agent invocation
- No persistent conversation memory across commands

---

## Design Considerations

### Tool Schema Structure

```typescript
// canvasAction Tool Schema
{
  action: 'create' | 'update' | 'delete' | 'duplicate' | 'arrange',
  
  // For update/delete/duplicate
  target?: string,  // Object ID from getCanvasState
  
  // For arrange
  targets?: string[],  // Array of object IDs
  
  // For create
  shape?: {
    type: 'rectangle' | 'circle' | 'text',
    position: { x: number, y: number },
    dimensions?: { width?, height?, radius? },
    style?: { fill?, fontSize?, text? }
  },
  
  // For update
  updates?: {
    position?: { x: number, y: number },
    dimensions?: { width?, height?, radius? },
    rotation?: number,
    scale?: number,
    fill?: string,
    text?: string,
    fontSize?: number
  },
  
  // For arrange
  layout?: {
    direction: 'horizontal' | 'vertical',
    spacing?: number
  },
  
  // For duplicate
  offset?: { x?: number, y?: number }
}
```

### Agent Decision Flow

```
User Command
    ↓
Does it reference existing shapes?
    ↓ YES                    ↓ NO
getCanvasState()         canvasAction(create)
    ↓
Identify object ID
    ↓
canvasAction(update/delete/duplicate)
```

### Color Translation Map

```typescript
const colorMap = {
  '#ff0000': 'red',
  '#0000ff': 'blue',
  '#00ff00': 'green',
  '#9333ea': 'purple',
  '#000000': 'black',
  '#ffffff': 'white'
};
```

---

## Technical Considerations

### File Modifications Required

1. **`src/features/ai-agent/services/simpleAgentService.ts`**
   - Lines 142-261: Replace 4 tool definitions with single `canvasActionTool`
   - Lines 273-330: Update system prompt with new workflow instructions
   - Lines 359-404: Update response generation with color translation

2. **`src/features/ai-agent/lib/tools.ts`**
   - Create new `canvasActionTool()` factory function
   - Remove `manageShapeTool`, `arrangeShapesTool`, `createLoginFormTool`, `createCardLayoutTool`
   - Keep `findObjectByDescription()` helper function

3. **`src/features/ai-agent/hooks/useAIAgent.ts`**
   - Update `executeAction()` to handle `canvasAction` tool (line 104+)
   - Keep enhanced `findObjectByDescription()` as fallback

4. **`src/features/ai-agent/types/index.ts`**
   - Update `AIAction` type to support new tool
   - Add `CanvasActionParams` interface

5. **Memory Bank Files**
   - `memory-bank/activeContext.md`
   - `memory-bank/progress.md`
   - `memory-bank/ai-agent-feature.md` (delete or deprecate)

6. **Documentation Files**
   - `docs/project-content/agentic-features.md` (update or delete)
   - `docs/ai-agent-testing.md` (update test scenarios)

### Dependencies

- No new npm packages required
- Uses existing: `@langchain/core`, `@langchain/langgraph`, `zod`
- Leverages existing services: `objectsService`, `objectsStore`

### Performance Impact

- **Positive**: Reduced tool count improves LLM decision time
- **Neutral**: Same number of API calls to OpenAI
- **Expected**: Response time remains under 2 seconds

### Edge Case Handling

Preserve all existing edge case handling from `findObjectByDescription`:
- Multiple matches → use most recent
- No matches → return helpful error message
- Semantic aliases → translate to system types
- Spatial descriptors → resolve via coordinate comparison
- Size descriptors → resolve via dimension calculation

---

## Success Metrics

### Primary Metrics (All Required)

1. **Test Pass Rate**: 100% (8/8 tests pass)
   - Currently: 50% (4/8 pass)
   - Target: 100% (8/8 pass)

2. **Agent Response Time**: <2 seconds per command
   - Measured from API request to response
   - Applies to all command types

3. **Code Maintainability**: Reduced complexity
   - Tool count: 5 → 2 (60% reduction)
   - Lines of code: ~800 lines in tools.ts → ~300 lines (estimate)
   - Tool schema duplication: eliminated

4. **Response Quality**: Natural language output
   - 100% of color references use names not hex codes
   - 0 redundant/repetitive responses
   - Clear confirmation messages for all operations

### Secondary Metrics

5. **Shape Targeting Accuracy**: 100%
   - When multiple shapes exist, correct shape always selected
   - Measured via test case 5-8 success

6. **Documentation Accuracy**: 100% alignment
   - Memory bank reflects actual implementation
   - No outdated tool references in docs

---

## Implementation Phases

### Phase 1: Core Consolidation (This PRD)
- ✅ Consolidate to 2 tools (getCanvasState + canvasAction)
- ✅ Implement ID-based targeting
- ✅ Fix color translation in responses
- ✅ Update memory bank documentation
- ✅ Pass all 8 test cases

### Phase 2: Complex Layouts (Future PRD)
- ⏳ Add 3rd tool: `createComplexLayout`
- ⏳ Support login forms, cards, dashboards
- ⏳ Multi-step template generation

---

## Open Questions

1. **Color Name Fallback**: If a shape has a hex color not in our 6-color map (e.g., #ff6600 orange), should the agent:
   - A) Output the hex code as-is
   - B) Output "orange-colored" or similar approximation
   - **Decision**: A - output hex code as-is for unmapped colors

2. **Arrange Action Position Calculation**: When arranging shapes, should we:
   - A) Preserve y-coordinates for horizontal layout (current behavior)
   - B) Align all shapes to a common baseline
   - **Decision**: A - preserve current behavior

3. **Delete Confirmation**: Should agent responses confirm what was deleted:
   - A) "I deleted the red circle!"
   - B) "I deleted a circle at position (100, 200) with red fill"
   - **Decision**: A - keep responses concise

---

## Acceptance Criteria

**AC-1**: All 8 test cases pass without errors
- Tests 1-4: Continue passing with improved responses
- Tests 5-8: Fixed to pass with correct targeting

**AC-2**: Agent uses object IDs for all update/delete/duplicate operations
- Verified via LangSmith trace inspection
- No description-based targeting for modification operations

**AC-3**: Agent responses use color names instead of hex codes
- "red" not "#ff0000"
- "blue" not "#0000ff"
- Applied to all 6 mapped colors

**AC-4**: System prompt correctly instructs two-step workflow
- Step 1: getCanvasState for existing shape references
- Step 2: canvasAction with object ID

**AC-5**: Memory bank documentation updated
- activeContext.md: Tool count corrected to 2
- progress.md: Tool list updated
- ai-agent-feature.md: Deprecated or deleted

**AC-6**: Code compiles with zero TypeScript errors
- All type definitions updated
- No breaking changes to existing Firebase integration

**AC-7**: Agent response time remains under 2 seconds
- Measured across all test cases
- Average response time ≤ 2 seconds

---

## Timeline Estimate

**Total Estimated Time**: 4-6 hours

- Tool consolidation: 2 hours
- System prompt updates: 1 hour
- Response generation fixes: 1 hour
- Client-side execution updates: 1 hour
- Testing and validation: 1-2 hours
- Documentation updates: 30 minutes

---

## Risk Assessment

### Low Risk
- Tool consolidation (well-understood pattern)
- Color translation (simple mapping)

### Medium Risk
- ID-based targeting adoption by LLM (depends on prompt engineering)
- Relative positioning calculations (agent must extract current position correctly)

### Mitigation Strategies
- Extensive prompt testing with example commands
- Clear schema descriptions with explicit examples
- Comprehensive test coverage across all action types

---

**Document Version**: 1.0  
**Created**: 2025-10-18  
**Author**: AI Agent (Cursor)  
**Status**: Ready for Implementation
