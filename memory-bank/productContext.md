# Product Context: CollabCanvas v3

## Why This Exists
CollabCanvas enables teams to collaborate on visual design and planning in real-time with the power of AI assistance. It solves the problem of disconnected design workflows and brings natural language control to canvas manipulation.

## Problems Solved

1. **Multiplayer Design Collaboration**
   - Traditional design tools lack real-time collaboration infrastructure
   - Users need to see each other's cursors and edits instantly
   - Conflict resolution when multiple people edit simultaneously

2. **Complex Canvas Manipulation**
   - Creating layouts manually is time-consuming
   - Repetitive positioning and alignment tasks
   - AI agent allows natural language commands to manipulate canvas

3. **State Persistence & Reliability**
   - Work shouldn't be lost on disconnects
   - Canvas state must persist even when all users leave
   - Reconnection should be seamless and automatic

## How It Works

### Two-Phase Architecture
1. **Phase 1 (MVP):** Build bulletproof collaborative infrastructure
2. **Phase 2:** Layer AI agent on top for natural language control

### Technical Flow
1. User authenticates via Firebase Auth
2. Joins canvas session with presence tracking (Firebase RTDB)
3. Cursor movements broadcast in real-time (<50ms latency)
4. Object creation/manipulation syncs across users (<100ms latency)
5. State persists to Firestore on changes
6. AI agent (future) receives commands and manipulates canvas via function calls

### Core Features

#### MVP Features
- **Authentication:** Secure user accounts with Firebase Auth
- **Real-Time Cursors:** See all collaborators' cursors with name labels
- **Presence Awareness:** Know who's online and active
- **Canvas Operations:** Pan, zoom, create and move shapes
- **Object Sync:** Instant propagation of all canvas changes
- **State Persistence:** Canvas survives disconnects and page refreshes

#### Post-MVP Features
- **AI Agent:** Natural language canvas manipulation
  - Creation: "Create a red circle at position 100, 200"
  - Manipulation: "Move the blue rectangle to the center"
  - Layout: "Arrange these shapes in a horizontal row"
  - Complex: "Create a login form with username and password fields"
- **Advanced Shapes:** Rectangles, circles, text, lines with styling
- **Transformations:** Resize, rotate, duplicate, delete
- **Multi-Select:** Shift-click or drag-to-select multiple objects

## User Experience Goals

### Target Users
- Design teams collaborating on visual projects
- Product teams doing planning and wireframing
- Anyone needing real-time visual collaboration
- Users wanting to control design tools with natural language

### User Journey (MVP)
1. User signs in with Firebase Auth
2. Lands on canvas with smooth pan/zoom
3. Sees other users' cursors moving in real-time
4. Creates shapes that instantly appear for all users
5. Drags objects around with zero lag
6. Refreshes page → returns to exact canvas state
7. Collaborates seamlessly with 5+ users

### User Journey (With AI Agent)
1. Types "Create a login form" in AI chat
2. Sees AI plan the steps (username field, password field, submit button)
3. Watches elements appear on canvas in real-time
4. All collaborators see the same AI-generated results
5. Can refine with follow-up commands: "Make it larger"

### Design Principles
1. **Performance First:** Sub-50ms cursor sync, sub-100ms object sync
2. **Reliability:** Never lose work, handle disconnects gracefully
3. **Simplicity:** MVP focuses on core multiplayer infrastructure
4. **Scalability:** Architecture supports future AI and advanced features
5. **Delight:** Smooth animations, clear feedback, professional feel

## Value Proposition

**For MVP:** A rock-solid collaborative canvas that proves the multiplayer infrastructure works flawlessly. Simple but bulletproof beats feature-rich but broken.

**With AI Agent:** The first real-time collaborative canvas that responds to natural language commands, making complex layouts and repetitive tasks effortless while maintaining perfect sync across all users.

---
*Last Updated: 2025-10-16*

