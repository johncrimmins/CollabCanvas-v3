# PRD: AI Multi-User Testing & Validation

## Introduction/Overview

Validate that the AI agent works correctly when multiple users interact with it simultaneously in the same LookBook. This PRD focuses on testing and validation rather than new feature development, ensuring that: (1) multiple users can use the AI concurrently without conflicts, (2) each user has separate chat memory/context, and (3) AI-generated objects sync correctly across all users in real-time.

## Goals

1. Validate concurrent AI usage by 2+ users in same LookBook
2. Ensure each user maintains separate chat history/memory
3. Verify AI-generated objects sync to all users in real-time
4. Test conflict resolution when users issue conflicting AI commands
5. Validate that user-specific context (name, ID) is correctly maintained
6. Create comprehensive test scenarios and acceptance criteria
7. Document any issues found and resolution strategies

## User Stories

1. **As a photographer and stylist pair**, we want to both use the AI at the same time so that we can quickly build our LookBook together without waiting for each other.

2. **As a creative team**, we want each person's AI chat history to be separate so that our individual conversations with the AI don't get mixed up.

3. **As a model**, when the photographer asks the AI to create shapes, I want to see them appear on my screen immediately so that we can collaborate in real-time.

4. **As a designer**, if the stylist and I both ask the AI to modify the same object, we want the system to handle it gracefully without breaking.

## Functional Requirements

### FR1: Concurrent AI Usage
Support multiple users issuing AI commands simultaneously:
- User A and User B can both send commands at the same time
- Each command processed independently (separate API calls)
- No blocking or queuing - commands execute in parallel
- Results sync via existing Firebase real-time infrastructure

### FR2: Separate Chat Memory Per User
Each user maintains independent chat history:
- Chat history stored client-side in user's browser (Zustand store)
- Server does not persist conversation history between requests (stateless)
- User A's chat shows only their messages and AI responses
- User B's chat shows only their messages and AI responses
- No cross-contamination of chat histories

### FR3: Real-Time Object Sync
AI-generated objects sync to all users:
- User A: "Create a red circle" → Circle appears on User A's canvas
- User B: Sees circle appear on their canvas in <100ms (existing sync)
- User C: Also sees circle appear in real-time
- Uses existing objectsService real-time sync (RTDB + Firestore)

### FR4: User Context Isolation
Each AI command maintains correct user context:
- Command includes userId, userName, canvasId
- Objects created show correct createdBy field
- Presence system shows who created each object
- No attribution confusion (objects correctly attributed to creator)

### FR5: Conflict Resolution
Handle conflicting AI commands gracefully:
- **Scenario 1: Simultaneous Creation**
  - User A: "Create circle at 200, 200"
  - User B: "Create circle at 200, 200"
  - Result: Both circles created (no conflict)
  
- **Scenario 2: Conflicting Updates**
  - User A: "Move the circle to 300, 300"
  - User B: "Move the circle to 400, 400"
  - Result: Last-write-wins (existing conflict resolution)
  
- **Scenario 3: Delete While Updating**
  - User A: "Delete the circle"
  - User B: "Move the circle to 300, 300"
  - Result: Graceful handling (update fails silently or shows error)

### FR6: State Synchronization
AI agent receives current canvas state for all users:
- When User A sends command, agent sees latest canvas state (including User B's changes)
- getCanvasState tool returns up-to-date object list
- ID-based targeting works correctly even after concurrent modifications

### FR7: Performance Under Load
Maintain performance with concurrent usage:
- 2 users: No degradation
- 5 users: Acceptable performance (<3 second AI response)
- 10 users: Graceful degradation (may show "AI is busy" message)

## Non-Goals (Out of Scope)

- Persistent chat history across sessions (chat clears on refresh)
- Shared chat where users see each other's AI conversations
- Chat collaboration features (users responding in each other's chats)
- AI command queuing or orchestration across users
- Rate limiting per user (global rate limiting only)
- Multi-user AI commands ("we want to create a circle" - single user commands only)

## Design Considerations

### UI/UX
- **Clear Attribution:** Show who created each object (existing presence feature)
- **Chat Isolation:** Each user's chat panel shows only their conversation
- **Sync Indicators:** Show when objects appear from other users' AI commands
- **Conflict Feedback:** Show message if AI command conflicts with recent change

### Architecture
**Current Implementation (Validated):**
```
User A Browser ───┐
                  ├──→ API Route ──→ AI Agent Service (OpenAI)
User B Browser ───┘                        ↓
      ↓                            Returns Actions
      ↓                                    ↓
      └──→ objectsService (Firebase) ←────┘
                ↓
         RTDB + Firestore
                ↓
    Real-time Sync to All Users
```

### Testing Strategy
**1. Isolation Testing:**
- Verify chat histories don't mix
- Verify user context maintained (userId, userName)
- Verify objects attributed correctly

**2. Concurrency Testing:**
- Two users send commands simultaneously
- Five users send commands in quick succession
- Verify all commands execute successfully

**3. Conflict Testing:**
- Both users modify same object
- One user deletes while other updates
- Verify last-write-wins behavior

**4. Performance Testing:**
- Measure AI response time with multiple users
- Monitor Firebase usage (RTDB connections, Firestore reads/writes)
- Verify sync latency remains <100ms

## Technical Considerations

### Current Architecture (No Changes Required)

**Client-Side Execution Pattern:**
- Each user's browser executes AI actions independently
- Uses user's own Firebase auth credentials
- Changes sync via existing RTDB/Firestore mechanisms

**Stateless AI Service:**
- API route processes each request independently
- No conversation history stored server-side
- Each request contains full context (command, objects, selection)

**Chat Memory (Client-Side Only):**
```typescript
// In aiAgentStore.ts
interface AIAgentState {
  messages: AIMessage[];  // Stored per-user in browser
  isProcessing: boolean;
}

// Messages never sent to other users
// Each user maintains own chat history
```

### Validation Points

**1. Chat Isolation:**
```typescript
// VALIDATE: User A's messages array ≠ User B's messages array
// Each user's Zustand store is independent
// No shared state between browsers
```

**2. User Context:**
```typescript
// VALIDATE: Every API request includes:
{
  userId: 'user-A-id',
  userName: 'Alice',
  canvasId: 'lookbook-123'
}

// VALIDATE: Created objects have correct createdBy:
{
  id: '...',
  type: 'circle',
  createdBy: 'user-A-id',  // ← Matches requesting user
  ...
}
```

**3. Real-Time Sync:**
```typescript
// VALIDATE: When User A creates object via AI:
// - User A sees object immediately (optimistic update)
// - User B sees object within 100ms (RTDB broadcast)
// - User C sees object within 100ms (RTDB broadcast)

// Measured using timestamp comparison:
const latency = objectReceivedTime - objectCreatedTime;
assert(latency < 100, 'Sync latency too high');
```

**4. Conflict Resolution:**
```typescript
// VALIDATE: Last-write-wins behavior
// User A updates object at t=100ms
// User B updates same object at t=150ms
// Final state = User B's update (latest timestamp wins)

// This is existing behavior, just validating it works with AI
```

### Test Scenarios

**Scenario 1: Basic Concurrent Creation**
```
User A: "Create a red circle"
User B: "Create a blue square"

Expected:
- User A sees red circle immediately
- User A sees blue square appear (from User B)
- User B sees blue square immediately
- User B sees red circle appear (from User A)
- Both users see same final state (2 objects)
```

**Scenario 2: Chat Isolation**
```
User A Chat:
  A: "Create a circle"
  AI: "I've created a red circle!"

User B Chat:
  B: "Create a square"
  AI: "I've created a blue square!"

Expected:
- User A's chat shows only their conversation
- User B's chat shows only their conversation
- No mixing of messages
```

**Scenario 3: Conflicting Updates**
```
Canvas state: Circle at (200, 200)

User A (t=0ms): "Move the circle to 300, 300"
User B (t=50ms): "Move the circle to 400, 400"

Expected:
- Both commands execute
- Final position: (400, 400) [User B's command, latest]
- Last-write-wins applies (existing behavior)
```

**Scenario 4: Delete During Update**
```
Canvas state: Circle at (200, 200)

User A (t=0ms): "Delete the circle"
User B (t=50ms): "Move the circle to 300, 300"

Expected:
- User A's delete executes, circle removed
- User B's update fails (object no longer exists)
- User B sees error or command silently fails
- Final state: No circle
```

**Scenario 5: Bulk Creation Stress Test**
```
User A: "Create 100 circles"
User B: "Create 100 squares"

Expected:
- Both commands execute (200 objects created)
- All objects sync to both users
- No crashes or performance issues
- Sync completes within reasonable time (<10 seconds)
```

### Performance Benchmarks

**Target Metrics:**
- AI Response Time: <2 seconds per command (unchanged)
- Object Sync Latency: <100ms (existing target)
- Concurrent Users Supported: 5+ without degradation
- Chat Memory: <1MB per user (reasonable browser storage)

**Monitoring:**
- Firebase RTDB connection count
- Firestore read/write operations
- AI API response times
- Browser memory usage

### Testing Tools

**1. Manual Testing:**
- Open 2 browser windows (different users)
- Issue concurrent AI commands
- Verify chat isolation and object sync

**2. Automated Testing (Future):**
- Cypress or Playwright for multi-window testing
- Firebase Emulator for controlled environment
- Mock AI responses for deterministic testing

**3. Load Testing:**
- Use tools like Artillery or k6
- Simulate 5-10 concurrent users
- Measure response times and sync latency

## Success Metrics

1. **Chat Isolation:** Each user's chat history independent (0 cross-contamination)
2. **Object Sync:** AI-generated objects sync to all users in <100ms
3. **Conflict Handling:** Last-write-wins works correctly for concurrent updates
4. **Attribution:** All objects correctly attributed to creating user (100% accuracy)
5. **Performance:** Support 5+ concurrent users without degradation
6. **Reliability:** 0 critical bugs in multi-user scenarios

## Testing Checklist

### Test Set 1: Basic Concurrency
- [ ] Two users both create objects via AI → Both objects appear for both users
- [ ] User A creates object, User B immediately sees it
- [ ] User B creates object, User A immediately sees it
- [ ] Chat histories remain separate (User A doesn't see User B's chat)

### Test Set 2: User Context
- [ ] User A creates object via AI → object.createdBy === userAId
- [ ] User B creates object via AI → object.createdBy === userBId
- [ ] Presence system shows correct creator for each object
- [ ] User names displayed correctly in canvas

### Test Set 3: Conflict Resolution
- [ ] Both users update same object → Last command wins
- [ ] User A deletes, User B updates → Delete wins (object removed)
- [ ] User A moves object, User B colors it → Both changes apply (different properties)
- [ ] Concurrent bulk creation → All objects created correctly

### Test Set 4: State Synchronization
- [ ] User A creates object, User B's AI can reference it (getCanvasState sees it)
- [ ] User B modifies object, User A's AI sees updated state
- [ ] ID-based targeting works across users (User B can reference User A's object by ID)

### Test Set 5: Performance
- [ ] 2 users: AI response time <2 seconds
- [ ] 5 users: AI response time <3 seconds
- [ ] Object sync latency <100ms with concurrent usage
- [ ] No browser memory leaks after 50+ AI commands

### Test Set 6: Edge Cases
- [ ] User A disconnects while User B uses AI → User B continues working
- [ ] User A refreshes page → Chat history clears, canvas state persists
- [ ] Network lag (3G simulation) → Sync still works, just slower
- [ ] One user hits rate limit → Other users unaffected

## Implementation Notes

### Testing Approach
1. **Manual Testing First:** Use 2 browser windows, different user accounts
2. **Document Issues:** Create issue tracker for any bugs found
3. **Fix Critical Issues:** Address conflicts, attribution errors, sync failures
4. **Performance Testing:** Use Chrome DevTools to measure sync latency
5. **Load Testing:** Simulate 5-10 users if time permits

### No Code Changes Expected
This PRD is primarily testing/validation. Expected outcome:
- **Findings Report:** Document of test results, issues found, fixes applied
- **Bug Fixes:** Any critical issues discovered during testing
- **Performance Report:** Metrics on concurrent usage performance

### Files to Review (Not Modify)
- `src/features/ai-agent/services/simpleAgentService.ts` - Verify stateless design
- `src/features/ai-agent/hooks/useAIAgent.ts` - Verify user context passed correctly
- `src/features/ai-agent/lib/aiAgentStore.ts` - Verify chat history is client-side only
- `src/features/objects/services/objectsService.ts` - Verify sync mechanisms

### Deliverables
1. **Test Report:** Results of all test scenarios
2. **Issue Log:** Any bugs found with severity ratings
3. **Fix PRs:** Code fixes for any critical issues
4. **Performance Metrics:** Latency measurements, concurrent user limits
5. **Documentation Update:** Add multi-user behavior notes to README

## Open Questions

- What happens if 10+ users all use AI simultaneously? (Load testing will reveal)
- Should we add rate limiting per user to prevent abuse? (Future consideration)
- Do we need AI command queuing for very high concurrency? (Likely not for MVP)

## Acceptance Criteria

### Critical (Must Pass)
- ✅ Each user maintains separate chat history
- ✅ AI-generated objects sync to all users correctly
- ✅ User attribution correct (createdBy field)
- ✅ No chat cross-contamination between users
- ✅ Last-write-wins conflict resolution works

### Important (Should Pass)
- ✅ Support 5 concurrent users without errors
- ✅ Object sync latency <100ms
- ✅ AI response time <3 seconds under concurrent load
- ✅ No memory leaks or browser crashes

### Nice-to-Have (Optional)
- ✅ Support 10+ concurrent users
- ✅ Graceful degradation under extreme load
- ✅ User notification when AI is under heavy load

