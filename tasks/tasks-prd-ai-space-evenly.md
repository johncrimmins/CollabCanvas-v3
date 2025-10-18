# Task List: AI Space Elements Evenly

## Relevant Files

- `src/features/ai-agent/services/simpleAgentService.ts` - Update Zod schema to add "even" spacing option, update system prompt
- `src/features/ai-agent/lib/tools.ts` - Add calculateEvenSpacing helper, update arrange action logic
- `src/features/ai-agent/hooks/useAIAgent.ts` - Pass selectedObjectIds in API request
- `src/features/objects/lib/objectsStore.ts` - Ensure selectedObjectIds is accessible

### Notes

- Depends on Phase 1 multi-select feature being complete
- Uses existing `canvasAction` tool with `arrange` action
- Focus on spacing calculation algorithm
- No new tools required

## Tasks

- [ ] 1.0 Update Multi-Select to Pass Selected IDs to AI
  - [ ] 1.1 Open `src/features/ai-agent/hooks/useAIAgent.ts`
  - [ ] 1.2 Locate the API request body in `executeCommand()`
  - [ ] 1.3 Add `selectedObjectIds` from objects store to request payload
  - [ ] 1.4 Verify selectedObjectIds is available from Zustand store
  - [ ] 1.5 Test that selected IDs are correctly sent to API

- [ ] 2.0 Update Zod Schema for Even Spacing
  - [ ] 2.1 Open `src/features/ai-agent/services/simpleAgentService.ts`
  - [ ] 2.2 Locate the `layout` schema in `arrange` action
  - [ ] 2.3 Update `spacing` to accept: `z.union([z.number(), z.literal('even')])`
  - [ ] 2.4 Add description: "Spacing between shapes: number (pixels) or 'even' (equal distribution)"
  - [ ] 2.5 Verify TypeScript compilation with updated schema

- [ ] 3.0 Implement Even Spacing Calculation Algorithm
  - [ ] 3.1 Open `src/features/ai-agent/lib/tools.ts`
  - [ ] 3.2 Create `calculateEvenSpacing()` function
  - [ ] 3.3 Implement sorting shapes by position (horizontal or vertical)
  - [ ] 3.4 Calculate total dimensions of all shapes
  - [ ] 3.5 Calculate span from first to last object
  - [ ] 3.6 Calculate available space and divide by number of gaps
  - [ ] 3.7 Return calculated even spacing (minimum 10px)
  - [ ] 3.8 Add helper functions: `getShapeWidth()` and `getShapeHeight()`

- [ ] 4.0 Update System Prompt with Space Evenly Workflow
  - [ ] 4.1 Open `src/features/ai-agent/services/simpleAgentService.ts`
  - [ ] 4.2 Add "SPACE ELEMENTS EVENLY" section to system prompt
  - [ ] 4.3 Add workflow: selection → command → getCanvasState → arrange with spacing: 'even'
  - [ ] 4.4 Add command examples: "space these evenly", "distribute horizontally"
  - [ ] 4.5 Add error messages for < 2 objects selected
  - [ ] 4.6 Include selected object count in system message context

- [ ] 5.0 Update Arrange Action to Handle Even Spacing
  - [ ] 5.1 Open `src/features/ai-agent/lib/tools.ts`
  - [ ] 5.2 Locate arrange action logic in `canvasActionTool`
  - [ ] 5.3 Add check: if `spacing === 'even'`, call `calculateEvenSpacing()`
  - [ ] 5.4 Use calculated spacing for positioning shapes
  - [ ] 5.5 Preserve first and last object positions
  - [ ] 5.6 Update positions for objects in between

- [ ] 6.0 Testing and Validation
  - [ ] 6.1 Test: Select 3 objects → "space these evenly" → Equal horizontal spacing
  - [ ] 6.2 Test: Select 5 objects → "distribute vertically" → Equal vertical spacing
  - [ ] 6.3 Test: Select 10 objects → "space evenly" → Grid-like even spacing
  - [ ] 6.4 Test: Select 0 objects → Error: "Please select objects first"
  - [ ] 6.5 Test: Select 1 object → Error: "Need at least 2 objects"
  - [ ] 6.6 Test: Overlapping objects → Minimal spacing or error message
  - [ ] 6.7 Test: Mixed shape types (rectangles + circles)
  - [ ] 6.8 Test: Different sized shapes
  - [ ] 6.9 Verify changes sync to all users in real-time

