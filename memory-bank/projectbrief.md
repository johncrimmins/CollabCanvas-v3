# Project Brief: The LookBook

## Project Overview
**Project Name:** The LookBook  
**Timeline:** MVP Complete ✅ → Enhancement Phases (1-4)  
**Status:** Rebrand & Feature Enhancement Phase

## Core Purpose
The LookBook is a real-time collaboration app purpose-built for models, photographers, and stylists to plan photoshoots together. Creative teams collaborate on shared LookBooks (workspaces), using shapes, text, and AI to visualize and refine the aesthetic they want to achieve before getting on set.

**Build Strategy:** MVP foundation complete with real-time sync and AI agent. Now enhancing with professional features (multi-LookBook management, advanced object manipulation, AI improvements) for production-ready photoshoot planning platform.

## Primary Goals
1. **Bulletproof Multiplayer Sync** - Sub-50ms cursor sync, sub-100ms object sync
2. **Solid Foundation** - Collaborative infrastructure that scales cleanly to AI features
3. **Production Ready** - Deployed, publicly accessible, supporting 5+ concurrent users

## MVP Requirements (Week 1 Checkpoint) - ✅ COMPLETE
- [x] Basic canvas with pan/zoom
- [x] Three shape types (rectangle, circle, text)
- [x] Ability to create and move objects
- [x] Real-time sync between 2+ users
- [x] Multiplayer cursors with name labels
- [x] Presence awareness (who's online)
- [x] User authentication (users have accounts/names)
- [x] Deployed and publicly accessible
- [x] AI Agent with 8+ command types (LangChain + OpenAI)
- [x] Database security rules (authentication required)

## Enhancement Roadmap

### Phase 1: LookBook Canvas Improvements ✅ COMPLETE (MVP)
- Sub-100ms object sync, Sub-50ms cursor sync ✅
- Conflict resolution (last-write-wins) ✅
- Persistence & reconnection handling ✅
- AI Agent with 8+ command types ✅

### Phase 1: Object Manipulation Features (Current Priority)
- Right-click context menu for property editing
- Duplicate object via objectsService
- Undo/redo with keyboard shortcuts (Ctrl+Z/Y)
- Copy/paste with keyboard shortcuts (Ctrl+C/V)
- Layer management panel with visibility toggles
- Multi-object selection (Ctrl+click)

### Phase 2: Multi-LookBook Platform
- My LookBooks feature (create, save, rename, delete LookBooks)
- LookBook sharing (Owner vs Designer roles)
- Text formatting (Header, Subheading, Paragraph presets)
- Repository-style LookBook management page

### Phase 3: AI Agent Enhancements
- Bulk creation (up to 100 shapes instantly)
- Space elements evenly (equal distribution)
- Arrange horizontally/vertically (alignment layouts)
- Create styleguide (visual guidelines panel)
- Multi-user AI testing & validation
- Chat UX improvements (2-line input, auto-expand)

### Phase 4: Production Readiness
- Security hardening
- Network resilience (disconnect/reconnect handling)
- Conflict resolution documentation
- UX improvements (design polish)
- Comprehensive testing (5+ users, 100+ objects)

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

## LookBook Concept

### Visual Structure
- **LookBook Workspace:** Grey background canvas with pan/zoom (entire workspace)
- **Look:** Fixed 1000x1000px white square in center for composing visual concepts
  - Multiple Looks can exist (Look 1, Look 2, etc.)
  - Numbered with black text in top-left corner
  - Spaced 1000px apart vertically
  - Purely visual guide (not a constraint)
- **Staging Area:** Grey workspace around Looks where objects can be organized

### Target Users
- Models
- Photographers
- Stylists
- Creative directors
- Executive team members

### Use Case
Creative teams use LookBooks to plan photoshoots before getting on set. They collaboratively build visual concepts, experiment with compositions, and define the aesthetic direction for the shoot.

### Roles
- **Owner:** Creates LookBook, full permissions (add/remove Designers, rename, delete)
- **Designer:** Added collaborator, can edit objects but cannot manage LookBook or users

---
*Last Updated: 2025-10-18*

