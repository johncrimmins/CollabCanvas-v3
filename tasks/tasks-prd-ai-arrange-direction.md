# Task List: AI Arrange Horizontally/Vertically

## Relevant Files

- `src/features/ai-agent/services/simpleAgentService.ts` - Update system prompt with arrange examples
- `src/features/ai-agent/hooks/useAIAgent.ts` - Pass selectedObjectIds (if not already done in Space Evenly)
- `src/features/ai-agent/lib/tools.ts` - Verify existing arrange logic handles alignment correctly

### Notes

- Most functionality already exists from MVP arrange implementation
- Primarily system prompt updates and validation
- Depends on Phase 1 multi-select feature
- May require minimal code changes

## Tasks

- [ ] 1.0 Verify Selection Context is Passed to AI
  - [ ] 1.1 Open `src/features/ai-agent/hooks/useAIAgent.ts`
  - [ ] 1.2 Confirm `selectedObjectIds` is included in API request (from Space Evenly PRD)
  - [ ] 1.3 If not present, add selectedObjectIds to request payload
  - [ ] 1.4 Test that selection state is available to AI agent

- [ ] 2.0 Update System Prompt with Arrange Commands
  - [ ] 2.1 Open `src/features/ai-agent/services/simpleAgentService.ts`
  - [ ] 2.2 Add "ARRANGE HORIZONTALLY/VERTICALLY" section to system prompt
  - [ ] 2.3 Add command examples: "arrange horizontally", "stack vertically", "put in a row"
  - [ ] 2.4 Add direction detection: horizontal vs vertical keywords
  - [ ] 2.5 Add spacing extraction: "with 30 pixel spacing" → spacing: 30
  - [ ] 2.6 Add alignment behavior: horizontal aligns Y, vertical aligns X
  - [ ] 2.7 Add sorting behavior: horizontal sorts by X, vertical sorts by Y
  - [ ] 2.8 Add error handling for < 2 objects selected

- [ ] 3.0 Verify Existing Arrange Logic
  - [ ] 3.1 Open `src/features/ai-agent/lib/tools.ts`
  - [ ] 3.2 Locate existing `arrange` action implementation
  - [ ] 3.3 Verify shapes are sorted by position (X for horizontal, Y for vertical)
  - [ ] 3.4 Verify alignment: horizontal uses first object's Y, vertical uses first object's X
  - [ ] 3.5 Verify spacing is applied correctly (edge-to-edge, not center-to-center)
  - [ ] 3.6 If issues found, fix arrange logic implementation
  - [ ] 3.7 Verify getShapeWidth() and getShapeHeight() helpers exist

- [ ] 4.0 Add Command Parsing Examples to System Prompt
  - [ ] 4.1 Add direction keywords: "horizontal", "row", "across" → direction: 'horizontal'
  - [ ] 4.2 Add direction keywords: "vertical", "column", "stack" → direction: 'vertical'
  - [ ] 4.3 Add spacing extraction patterns: "30 pixel spacing", "50 pixels apart"
  - [ ] 4.4 Add validation: spacing between 5px and 500px
  - [ ] 4.5 Add default spacing: 20px if not specified

- [ ] 5.0 Testing and Validation
  - [ ] 5.1 Test: Select 3 rectangles → "arrange horizontally" → Aligned row, 20px spacing
  - [ ] 5.2 Test: Select 5 circles → "put in a row with 30 pixel spacing" → Row, 30px spacing
  - [ ] 5.3 Test: Select 4 shapes → "arrange vertically" → Aligned column, 20px spacing
  - [ ] 5.4 Test: Select 6 objects → "stack vertically with 50 pixel spacing" → Column, 50px spacing
  - [ ] 5.5 Test: Mixed shapes (rectangles + circles) → Arrange correctly
  - [ ] 5.6 Test: Select 0 objects → Error message
  - [ ] 5.7 Test: Select 1 object → Error message
  - [ ] 5.8 Test: Verify spacing respects shape dimensions (edge-to-edge)
  - [ ] 5.9 Verify changes sync to all users in real-time

