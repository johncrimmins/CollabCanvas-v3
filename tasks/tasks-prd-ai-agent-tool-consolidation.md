# Task List: AI Agent Tool Consolidation

Based on: `prd-ai-agent-tool-consolidation.md`

## Relevant Files

- `src/features/ai-agent/services/simpleAgentService.ts` - Main agent service; consolidate tools and update system prompt
- `src/features/ai-agent/lib/tools.ts` - Tool definitions; create new canvasActionTool and remove legacy tools
- `src/features/ai-agent/hooks/useAIAgent.ts` - Client-side execution; update to handle canvasAction tool
- `src/features/ai-agent/types/index.ts` - Type definitions; add CanvasActionParams interface
- `memory-bank/activeContext.md` - Update tool count from 10 to 2
- `memory-bank/progress.md` - Update tool architecture description
- `memory-bank/ai-agent-feature.md` - Delete or mark as DEPRECATED
- `docs/project-content/agentic-features.md` - Update or delete (currently outdated)
- `docs/ai-agent-testing.md` - Update test scenarios to reflect 2-tool architecture

### Notes

- This is a breaking change; full re-testing required
- Focus on ID-based targeting to fix tests 5-8
- Color translation for improved UX (hex → color names)
- No new dependencies required

## Tasks

- [x] 1.0 Create unified canvasAction tool in tools.ts
  - [x] 1.1 Define canvasActionTool schema with 5 action types (create, update, delete, duplicate, arrange)
  - [x] 1.2 Add target parameter with ID-based description ("Object ID from getCanvasState")
  - [x] 1.3 Implement create operation logic (shape definition with type, position, dimensions, style)
  - [x] 1.4 Implement update operation logic (position, dimensions, rotation, scale, fill, text, fontSize)
  - [x] 1.5 Implement delete operation logic (using object ID)
  - [x] 1.6 Implement duplicate operation logic (with offset parameter)
  - [x] 1.7 Implement arrange operation logic (layout direction and spacing for multiple IDs)
  - [x] 1.8 Remove legacy tool functions: manageShapeTool, arrangeShapesTool, createLoginFormTool, createCardLayoutTool (keep as comments temporarily for reference)
  - [x] 1.9 Keep findObjectByDescription helper function (still needed as fallback)

- [x] 2.0 Update simpleAgentService.ts to use new tool architecture
  - [x] 2.1 Replace 4 tool instantiations with single canvasActionTool in tools array (lines 237-261)
  - [x] 2.2 Update system prompt with new 2-tool workflow (getCanvasState → canvasAction pattern)
  - [x] 2.3 Add vocabulary translation guide to prompt ("square" = rectangle where width===height, etc.)
  - [x] 2.4 Add relative positioning instructions ("move to the right" = current x + 100)
  - [x] 2.5 Implement color translation function (hex to color names: #ff0000 → "red", etc.)
  - [x] 2.6 Update generateResponse method to use color translation for all color references
  - [x] 2.7 Update response generation to be conversational ("I created a red circle!" not "I created a #ff0000 circle!")
  - [x] 2.8 Update tool count reference in system prompt (from 5 tools to 2 tools)

- [x] 3.0 Update client-side execution in useAIAgent.ts
  - [x] 3.1 Add canvasAction case to executeAction switch statement (line 112+)
  - [x] 3.2 Implement action routing: parse action type and route to appropriate operation
  - [x] 3.3 Handle create action: call createObject with shape parameters
  - [x] 3.4 Handle update action: extract object ID, call updateObject with updates
  - [x] 3.5 Handle delete action: extract object ID, call deleteObject
  - [x] 3.6 Handle duplicate action: create new object with offset from original
  - [x] 3.7 Handle arrange action: loop through target IDs and update positions based on layout
  - [x] 3.8 Keep enhanced findObjectByDescription as fallback for legacy compatibility
  - [x] 3.9 Update error handling to provide clear messages for each action type

- [x] 4.0 Update type definitions and interfaces
  - [x] 4.1 Add CanvasActionParams interface in types/index.ts with all action properties
  - [x] 4.2 Add action type enum or union type: 'create' | 'update' | 'delete' | 'duplicate' | 'arrange'
  - [x] 4.3 Update AIAction type to support canvasAction tool (replace manageShape, arrangeShapes, etc.)
  - [x] 4.4 Add shape definition type for create action
  - [x] 4.5 Add updates type for update action
  - [x] 4.6 Add layout type for arrange action
  - [x] 4.7 Run TypeScript compilation to verify zero errors

- [x] 5.0 Update Memory Bank and documentation
  - [x] 5.1 Update memory-bank/activeContext.md: Change "10 tools" to "2 tools" (getCanvasState, canvasAction)
  - [x] 5.2 Update memory-bank/progress.md: Update tool list and architecture description
  - [x] 5.3 Delete memory-bank/ai-agent-feature.md OR mark as DEPRECATED at top of file
  - [x] 5.4 Update or delete docs/project-content/agentic-features.md (currently describes wrong architecture)
  - [x] 5.5 Update docs/ai-agent-testing.md: Change from 5 tools to 2 tools in overview (N/A - file doesn't exist)
  - [x] 5.6 Add inline code comments in simpleAgentService.ts explaining ID-based targeting pattern
  - [x] 5.7 Add inline code comments in tools.ts explaining canvasAction consolidation rationale

- [x] 6.0 Test and validate all 8 test cases (7/8 passed - Test 7 deferred)
  - [x] 6.1 Start dev server and navigate to canvas with AI agent
  - [x] 6.2 Test 1: "Create a red circle at position 100, 200" - verify passes and says "red" not "#ff0000"
  - [x] 6.3 Test 2: "Make a 200x300 rectangle" - verify passes with single tool call (no duplicates)
  - [x] 6.4 Test 3: "Create a blue circle" - verify passes and says "blue" not "#0000ff"
  - [x] 6.5 Test 4: "Create a blue square" - verify passes and says "blue square" not "#0000ff rectangle"
  - [x] 6.6 Test 5: "Resize the circle to be twice as big" - verify agent calls getCanvasState then uses ID
  - [x] 6.7 Test 6: "Move the blue square to the right" - verify correct shape targeted using ID
  - [ ] 6.8 Test 7: "Move the blue square 100 pixels to the right" - verify relative positioning calculation (DEFERRED)
  - [x] 6.9 Test 8: "Delete the red circle" - verify shape is actually deleted from canvas
  - [x] 6.10 Check LangSmith traces to verify ID-based targeting is being used
  - [x] 6.11 Verify all responses use color names instead of hex codes
  - [x] 6.12 Verify agent response time is under 2 seconds for all tests

