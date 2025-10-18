# ⚠️ DEPRECATED - Agentic Canvas AI: Smart Object Resolution

**This document describes an OLD architecture with semantic resolution and is now DEPRECATED.**

**For current 2-tool architecture (getCanvasState + canvasAction with ID-based targeting), see:**
- `tasks/prd-ai-agent-tool-consolidation.md` - PRD for new architecture
- `src/features/ai-agent/services/simpleAgentService.ts` - Implementation
- `src/features/ai-agent/lib/tools.ts` - Tool definitions

**Key Changes:**
- OLD: Semantic resolution with findObjectByDescription
- NEW: ID-based targeting with getCanvasState → canvasAction workflow
- OLD: 10+ tools with complex matching
- NEW: 2 tools (getCanvasState, canvasAction) with 5 operations

---

## Overview (OUTDATED)
Collab Canvas features an AI agent that understands natural language and intelligently manipulates canvas objects without requiring users to know object IDs or specific syntax. The agent uses semantic understanding, spatial reasoning, and lazy state synchronization to provide an intuitive, conversational interface.

## Core Capabilities

- **Semantic Vocabulary**: Understands colloquial terms like "square" (rectangle with equal dimensions), "box" (rectangle), "oval" (circle)
- **Spatial Reasoning**: Interprets positional references like "left one", "big circle", "top rectangle"
- **Color & Attribute Matching**: Finds objects by color, size, or combined attributes
- **Lazy State Sync**: Only queries canvas state when needed (no polling overhead)
- **Cross-Session Awareness**: Detects manually-created objects even if not in AI's memory
- **10+ Edge Cases**: Handles ambiguous references, stale memory, missing objects, and more

## How It Works: Lazy Detection Pattern

The AI maintains a lightweight memory buffer of its last ~3 actions. When users reference unfamiliar objects, the AI automatically calls `getCanvasState()` to query the full canvas:

```
User manually creates: Blue 100×100 rectangle
User: "Move the square to the right"
  ↓
AI checks memory → "square" not found
  ↓
AI calls getCanvasState() automatically
  ↓
AI discovers rectangle where width === height
  ↓
AI executes move operation ✓
```

**Key Insight**: Memory only updates reactively, not proactively. Manual user creations are detected on-demand when referenced.

## Example Scenarios

### 1. Semantic Vocabulary Translation
```
User: "Make the box blue"
AI: Translates "box" → rectangle → changes fill color
```

### 2. Spatial Position Resolution
```
Canvas: 3 circles at x-positions 100, 300, 500
User: "Delete the left circle"
AI: Finds min(x) → deletes circle at x=100
```

### 3. Combined Attribute Matching
```
Canvas: Small blue circle, large blue circle, small red circle
User: "Make the small blue circle bigger"
AI: Matches type + color + size → scales correct object
```

### 4. Stale Memory Detection
```
AI creates blue circle
[User manually deletes it, creates green circle]
User: "Move the circle"
AI: Detects memory age > 60s → queries state → finds green circle → moves it
```

### 5. Cross-User Collaboration
```
User A (manual): Creates rectangle
User B (AI): "Move the rectangle to 500, 500"
AI: Queries canvas → discovers manually-created shape → executes move
```

## Architecture

**Client-Side Resolution Pattern**:
- AI decides actions on server (via LangChain + OpenAI)
- Object resolution happens on client (where full state exists)
- Actions execute via authenticated Firebase connection

**Key Components**:
- `getCanvasState` tool: AI calls when detecting unfamiliar references
- `findObjectByDescription()`: Multi-layer semantic matching algorithm
- System prompt: Vocabulary notes + decision tree for when to query state

**Implementation Files**:
- `src/features/ai-agent/services/simpleAgentService.ts` - getCanvasState tool, system prompt with decision logic
- `src/features/ai-agent/hooks/useAIAgent.ts` - findObjectByDescription() with semantic aliases + spatial reasoning
- `src/features/ai-agent/types/index.ts` - Type definitions for AIAction, ManageShapeParams
- `docs/ai-agent-testing.md` - Full test suite with semantic resolution scenarios

## Edge Cases Handled

1. **No Matching Object**: AI responds with clarification request
2. **Multiple Matches**: Defaults to most recent or asks for disambiguation
3. **Ambiguous References** ("it", "that"): Uses most recent from memory or queries state
4. **Stale Memory**: Auto-queries if >60s since last action
5. **Synonym Handling**: "square" → rectangle, "oval" → circle, "box" → rectangle
6. **Conflicting Properties**: Auto-corrects impossible combinations
7. **Manual Creations**: Detects objects user created without AI involvement
8. **Cross-User Changes**: Adapts to modifications by other collaborators
9. **Size Descriptors**: "big", "small", "tiny", "large" mapped to actual dimensions
10. **Positional Terms**: "left", "right", "top", "bottom" resolved via coordinate comparison

## Technical Highlights

**Semantic Alias Mapping**: 8+ vocabulary aliases translate user terms to system types
**Decision Tree**: AI determines when to query vs. use memory based on reference familiarity
**Multi-Layer Matching**: Checks aliases → types → colors → spatial attributes → size → fallback

See full implementation in the files listed above for detailed code examples.

---

**Built with**: LangChain, OpenAI GPT-4, TypeScript, Zod, Firebase  
**Phase**: 2 of 3 (Core intelligence + Smart resolution complete)  
**Status**: Production-ready
