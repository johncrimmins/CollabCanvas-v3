# Task List: AI Bulk Creation

## Relevant Files

- `src/features/ai-agent/services/simpleAgentService.ts` - Update Zod schema to add quantity parameter, update system prompt with bulk creation examples
- `src/features/ai-agent/lib/tools.ts` - Add layout algorithm helper functions (grid, row, column, scatter layouts)
- `src/features/objects/services/objectsService.ts` - Optional: Add batch create function for Firebase efficiency

### Notes

- This feature extends existing AI agent tools rather than creating new ones
- Focus on system prompt engineering and layout algorithms
- Client-side execution pattern remains unchanged
- No unit tests specified in PRD, but may add later for layout algorithms

## Tasks

- [ ] 1.0 Update Zod Schema for Quantity Parameter
  - [ ] 1.1 Open `src/features/ai-agent/services/simpleAgentService.ts`
  - [ ] 1.2 Locate the `shape` Zod schema definition for the `create` action
  - [ ] 1.3 Add optional `quantity` parameter: `z.number().min(1).max(100).optional()`
  - [ ] 1.4 Add description: "Number of shapes to create (default: 1, max: 100). Agent will generate multiple create actions."
  - [ ] 1.5 Verify TypeScript compilation passes with new schema

- [ ] 2.0 Implement Layout Algorithm Helper Functions
  - [ ] 2.1 Create or open `src/features/ai-agent/lib/tools.ts`
  - [ ] 2.2 Implement `calculateLayoutPosition()` function with grid, row, column, scatter modes
  - [ ] 2.3 Implement `calculateColorVariation()` function for rainbow, gradient, alternating color schemes
  - [ ] 2.4 Add helper functions: `getShapeWidth()` and `getShapeHeight()` for dimension calculations
  - [ ] 2.5 Test layout algorithms with various quantities (10, 50, 100 shapes)

- [ ] 3.0 Update System Prompt with Bulk Creation Guidelines
  - [ ] 3.1 Open `src/features/ai-agent/services/simpleAgentService.ts`
  - [ ] 3.2 Add "BULK CREATION" section to system prompt
  - [ ] 3.3 Include examples: "Create 100 small squares", "Make 20 circles in rainbow colors"
  - [ ] 3.4 Add layout selection logic: quantity > 9 → grid, quantity <= 9 → row
  - [ ] 3.5 Add quantity limit guidance: max 100 shapes, error message for > 100

- [ ] 4.0 Implement Batch Action Generation in Tool Function
  - [ ] 4.1 Locate the `canvasAction` tool function in `simpleAgentService.ts`
  - [ ] 4.2 Add logic to detect `shape.quantity > 1` in create action
  - [ ] 4.3 Generate loop to create multiple actions (one per shape)
  - [ ] 4.4 Calculate positions using layout algorithm helpers
  - [ ] 4.5 Calculate colors using color variation helpers
  - [ ] 4.6 Push each create action to `capturedActions` array
  - [ ] 4.7 Return descriptive message: "Prepared to create {quantity} {type} shapes in {layout} layout"

- [ ] 5.0 Testing and Validation
  - [ ] 5.1 Test: "Create 10 circles" → 10 circles appear in row
  - [ ] 5.2 Test: "Make 50 red squares in a grid" → 50 squares in 8x7 grid
  - [ ] 5.3 Test: "Create 100 small rectangles" → 100 rectangles in 10x10 grid
  - [ ] 5.4 Test: "Make 20 circles in rainbow colors" → 20 circles with color gradient
  - [ ] 5.5 Test: "Create 5 large squares vertically" → 5 squares in column
  - [ ] 5.6 Test: "Make 30 random circles" → 30 circles scattered randomly
  - [ ] 5.7 Test quantity limit: "Create 150 circles" → Error message
  - [ ] 5.8 Verify all shapes appear simultaneously (optimistic rendering)
  - [ ] 5.9 Verify shapes sync to other users in real-time

- [ ] 6.0 Optional: Firebase Batch Write Optimization
  - [ ] 6.1 Open `src/features/objects/services/objectsService.ts`
  - [ ] 6.2 Create `batchCreateObjects()` function
  - [ ] 6.3 Implement Firebase batch writes (500 operations per batch)
  - [ ] 6.4 Chunk large arrays if needed
  - [ ] 6.5 Test batch creation performance vs sequential creates

