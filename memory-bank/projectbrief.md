# Project Brief: CollabCanvas v3

## Project Overview
**Project Name:** CollabCanvas v3  
**Timeline:** Week 1 MVP, then AI Agent layer  
**Status:** Scaffolding Phase

## Core Purpose
CollabCanvas is a real-time collaboration app enabling users to login, create and manipulate shapes with tools and AI, and collaborate with each other on a shared canvas in real time.

**Build Strategy:** First build the core collaborative canvas with real-time sync for the MVP. Then layer on an AI agent that manipulates the canvas through natural language.

## Primary Goals
1. **Bulletproof Multiplayer Sync** - Sub-50ms cursor sync, sub-100ms object sync
2. **Solid Foundation** - Collaborative infrastructure that scales cleanly to AI features
3. **Production Ready** - Deployed, publicly accessible, supporting 5+ concurrent users

## MVP Requirements (Week 1 Checkpoint)
- [ ] Basic canvas with pan/zoom
- [ ] At least one shape type (rectangle, circle, or text)
- [ ] Ability to create and move objects
- [ ] Real-time sync between 2+ users
- [ ] Multiplayer cursors with name labels
- [ ] Presence awareness (who's online)
- [ ] User authentication (users have accounts/names)
- [ ] Deployed and publicly accessible

## Key Requirements

### Phase 1: Core Collaborative Infrastructure (MVP)
- Sub-100ms object sync, Sub-50ms cursor sync
- Conflict resolution (last-write-wins documented)
- Persistence & reconnection handling
- Clean connection status indicators

### Phase 2: AI Canvas Agent (Post-MVP)
- 8+ distinct command types (creation, manipulation, layout, complex)
- Sub-2 second response time
- Multi-step operation planning
- Shared AI state across all users

### Phase 3: Advanced Features (Future)
- Undo/redo with keyboard shortcuts
- Object grouping/ungrouping
- Layers panel with drag-to-reorder
- Alignment tools
- AI Agent advanced commands / improvements

## Success Criteria

### MVP Success
- Two cursors syncing smoothly with <50ms latency
- Objects sync across users with <100ms latency
- State persists through disconnects and page refreshes
- 5+ users can collaborate simultaneously
- Zero visible lag during rapid multi-user edits

### AI Agent Success (Post-MVP)
- 90%+ command accuracy
- Natural UX with immediate feedback
- Complex commands (pre-defined inputs) execute multi-step plans correctly
- Multiple users can use AI simultaneously without conflict

### Performance Targets
- Consistent performance with 500+ objects
- Smooth interactions at 60 FPS
- Fast load times (<3s initial)

## Constraints
- **Timeline:** MVP first (Week 1), then AI layer
- **Performance:** Sub-50ms cursor, sub-100ms objects, sub-2s AI responses
- **Scalability:** Must support 5+ concurrent users minimum
- **Architecture:** Vertical slicing by feature for clean separation

## Scope

### In Scope (MVP)
- User authentication (Firebase Auth)
- Real-time cursor sync (Firebase RTDB)
- Real-time object sync (Firebase RTDB + Firestore persistence)
- User presence awareness
- Basic canvas with pan/zoom (Konva.js)
- At least one shape type with move capability
- Connection status indicators
- Deployment (Vercel)

### In Scope (Post-MVP)
- AI Agent with LangChain + OpenAI
- 8+ command types (creation, manipulation, layout, complex)
- Multi-step complex operations
- LangSmith observability
- Additional shape types (rectangles, circles, text, lines)
- Transform operations (resize, rotate)
- Multi-select and layer management

### Out of Scope (Future)
- Undo/redo
- Object grouping
- Layers panel
- Alignment tools
- Auto-layout
- Agent enhancements

---
*Last Updated: 2025-10-16*

