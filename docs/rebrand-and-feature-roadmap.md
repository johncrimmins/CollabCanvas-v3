# The LookBook - Rebrand & Feature Roadmap

## Rebrand Summary

**From:** CollabCanvas - general-purpose collaborative canvas  
**To:** The LookBook - photoshoot planning tool for creative teams

### Target Users
- Models
- Photographers  
- Stylists
- Creative directors
- Executive team members

### Use Case
Before a photoshoot, creative teams prepare a "LookBook" to define the visual aesthetic they want to achieve on set. The LookBook workspace lets them collaboratively plan, organize, and refine their creative vision.

---

## Terminology Changes

| Old Term | New Term | Description |
|----------|----------|-------------|
| Canvas | LookBook | The entire workspace area |
| N/A | Look | Fixed 1000x1000px white square where users compose visual concepts |
| Collaborator | Designer | Users added to a LookBook (same permissions as Owner except can't add/remove others) |
| Creator | Owner | User who creates the LookBook (full permissions) |

---

## Visual Structure

- **LookBook Workspace:** Large grey background area with pan/zoom
- **Look:** Fixed 1000x1000px white square in center
  - Locked position (not moveable)
  - Numbered with black text in top-left corner (1, 2, 3...)
  - Additional Looks appear 1000px below previous Look
  - Purely visual element (no constraints on object placement)
  - Can be deleted (removes visual only, not objects)
- **Staging Area:** Grey workspace around Looks where objects can live
  - Users organize elements here
  - Swap objects in/out of Look to visualize compositions

---

## Feature Roadmap

### Phase 1: LookBook Canvas Improvements
**Goal:** Enhance current canvas/LookBook functionality

1. **Right-click Context Menu** - Change object properties (color, dimensions, etc.)
2. **Duplicate Object** - Add to objectsService.ts (vertical slicing)
3. **Undo/Redo** - Keyboard shortcuts (Ctrl+Z / Ctrl+Y)
4. **Copy/Paste** - Keyboard shortcuts (Ctrl+C / Ctrl+V)
5. **Layer Management Panel** - Toolbar showing layers with visibility toggle (eye icon)
6. **Multi-Object Selection** - Ctrl+click to select multiple objects

**Dependencies:** None - all work with existing single-canvas architecture

---

### Phase 2: Multi-LookBook Support
**Goal:** Enable users to create, manage, and share multiple LookBooks

1. **My LookBooks Feature** (new vertical slice in `/features/mylookbooks`)
   - Create new LookBook
   - Save LookBook with name
   - Rename LookBook
   - Delete LookBook (owner only)
   - Open existing LookBook
   - New page: "My LookBooks" (default landing after login)
   - Two sections: "LookBooks I Own" and "Shared LookBooks"
   - Routing: `/lookbook/[id]` instead of `/canvas`

2. **LookBook Sharing**
   - Add Designers by username or email (no invite emails/links yet)
   - Role management: Owner vs Designer
   - Owner: Full permissions (add/remove Designers, delete LookBook)
   - Designer: Edit LookBook, cannot add/remove other users
   - Shared LookBooks appear in "Shared LookBooks" section

3. **Text Formatting**
   - Text already exists (Text.tsx) but might need to add ability for user to add it by adding it to toolbar
   - Add formatting: Header, Subheading, Paragraph (preset sizes)
   - Add rotation capability for text
   - Implementation decision: Canvas objects vs HTML layer

**Dependencies:** Requires multi-LookBook data model (LookBook metadata, new routing)

---

### Phase 3: AI Agent Enhancements
**Goal:** Extend AI capabilities with advanced commands

1. **AI: Bulk Creation** - Create any number of shapes (e.g., "create 100 rectangles")

2. **AI: Space Elements Evenly** - Layout selected objects with equal spacing
   - Requires multi-select working (Phase 1)
   - Horizontal spacing (default)
   - User selects objects, asks AI to space them
   - Use explicit command for testing; do not attempt to optimize for semantic reconciliation if user is ambiguous

3. **AI: Arrange Horizontally/Vertically** - Layout selected objects in rows/columns
   - Separate PRD from spacing feature
   - Requires multi-select working (Phase 1)
   - Use explicit command for testing; do not attempt to optimize for semantic reconciliation if user is ambiguous

4. **AI: Create Styleguide** - Generate styleguide object
   - Rectangle with text inside
   - Theme (Header), Guidelines (Subheading), Description (Paragraph)
   - Positioned above canvas area for creative direction
   - Use explicit command for testing; do not attempt to optimize for semantic reconciliation if user is ambiguous

5. **AI: Multi-User Testing** - Validate shared state with concurrent AI usage
   - No conflicts between users
   - Separate chat memory per user

6. **AI Chat UX** - Fix condensed chat window (the area user types in should be 2 lines of text by default and expand if they need more room for more lines of inputs)

**Dependencies:** Requires multi-select (Phase 1)

---

### Phase 4: Production Readiness
**Goal:** Harden security, resilience, and validate production quality

1. **Security Hardening**
   - No exposed credentials
   - Protected routes
   - Proper session handling
   - Secure user management

2. **Network Resilience**
   - Disconnect/reconnect handling
   - Local edits saved during disconnect (localStorage or better solution)
   - Clear UI indicators for connection status
   - Disconnected users shown to others (30s grace period)
   - Auto-reconnect without manual refresh

3. **Documentation** - Conflict resolution strategy (may already exist)

4. **UX Improvements** - Overall app polish (user to provide design inspiration)
    - Review docs/overview.md to deeply understand user intentions and workflows
    - Ask user how to handle horizontal Look planes within Lookbooks (user will specify what they want)

5. **Testing & Validation**
   - 5+ concurrent users
   - 100+ objects performance
   - AI command validation
   - Conflict resolution testing
   - Network disconnect scenarios

**Absolutely Must Complete:** All Phase 1, Phase 2, Phase 3, and Phase 4 features validated and working


## Current State

✅ **Completed:**
- Authentication (Firebase)
- Real-time cursor sync (<50ms)
- Real-time object sync (<100ms)
- Shapes: Rectangle, Circle, Text
- Transform operations (move, resize, rotate)
- Delete objects
- AI Agent (8+ commands, LangChain integration)
- Deployed to Vercel

🔄 **Ready to Build:**
- Phase 1 features (canvas improvements)
- Phase 2 features (multi-LookBook support)

