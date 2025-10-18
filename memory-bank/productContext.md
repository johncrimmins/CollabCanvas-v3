# Product Context: The LookBook

## Why This Exists
The LookBook enables photoshoot creative teams (models, photographers, stylists) to collaboratively plan shoots in real-time with AI assistance. It solves the problem of disconnected pre-production workflows and brings natural language control to visual planning, helping teams align on aesthetic direction before getting on set.

## Problems Solved

1. **Photoshoot Pre-Production Collaboration**
   - Creative teams work in silos before shoots (mood boards, sketches, scattered references)
   - No shared workspace to visualize and refine "looks" together
   - Difficult to align on aesthetic direction without physical meeting
   - Traditional design tools aren't purpose-built for photoshoot planning

2. **Visual Concept Development**
   - Creating mood boards and layout concepts manually is time-consuming
   - Repetitive positioning and organization of visual elements
   - Hard to experiment with different compositions quickly
   - AI agent allows natural language commands to build visual concepts rapidly

3. **State Persistence & Multi-Project Management**
   - Work shouldn't be lost on disconnects
   - Teams need separate LookBooks for different shoots
   - Need to share LookBooks with different collaborators per project
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
- **Models:** Visual planning, mood board creation, look composition
- **Photographers:** Shot planning, lighting concepts, composition layouts
- **Stylists:** Color palette development, styling direction, outfit concepts
- **Creative Directors:** Overall aesthetic vision, team alignment, shoot planning
- **Executive Team:** Review and approve shoot concepts before production

### User Journey (Current - Post-MVP)
1. User signs in with Firebase Auth
2. Lands on "My LookBooks" page (repository view) - **Phase 2 feature**
3. Creates new LookBook or opens existing one
4. Sees LookBook workspace: grey background with white Look square in center
5. Sees other Designers' cursors moving in real-time
6. Creates shapes, text, and uses AI to build visual concepts
7. Uses AI: "Create 50 color swatches in a grid" → Shapes appear instantly
8. Shares LookBook with team members (adds Designers) - **Phase 2 feature**
9. Refreshes page → returns to exact LookBook state
10. Collaborates seamlessly with 5+ Designers simultaneously

### User Journey (Enhanced - Future Phases)
1. Selects multiple objects → Uses AI: "Space these evenly" → Perfect alignment
2. Right-clicks object → Edits color/size directly - **Phase 1 feature**
3. Creates styleguide with AI → Team sees visual guidelines at top of LookBook
4. Uses Ctrl+Z to undo mistakes - **Phase 1 feature**
5. Manages layers panel to show/hide elements - **Phase 1 feature**

### Design Principles
1. **Performance First:** Sub-50ms cursor sync, sub-100ms object sync
2. **Reliability:** Never lose work, handle disconnects gracefully
3. **Simplicity:** MVP focuses on core multiplayer infrastructure
4. **Scalability:** Architecture supports future AI and advanced features
5. **Delight:** Smooth animations, clear feedback, professional feel

## Value Proposition

**For Creative Teams:** The LookBook is the first real-time collaborative platform purpose-built for photoshoot planning. Models, photographers, and stylists can work together on shared visual concepts with AI assistance, creating professional look boards that align the entire team before getting on set.

**Key Differentiators:**
- Purpose-built for photoshoot creative workflows (not generic design tool)
- Real-time collaboration with <100ms sync
- AI agent that understands photoshoot vocabulary and creates visual elements instantly
- Multi-LookBook management (separate projects for different shoots)
- Role-based sharing (Owner vs Designer permissions)
- Professional visual hierarchy (Looks, staging areas, styleguides)

---
*Last Updated: 2025-10-18*

