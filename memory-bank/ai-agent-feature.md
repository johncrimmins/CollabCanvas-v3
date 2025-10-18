# ⚠️ DEPRECATED - AI Agent Feature: CollabCanvas v3

**This document describes the OLD 10-tool architecture and is now DEPRECATED.**

**For current 2-tool architecture (getCanvasState + canvasAction), see:**
- `tasks/prd-ai-agent-tool-consolidation.md` - PRD for new architecture
- `src/features/ai-agent/services/simpleAgentService.ts` - Implementation
- `src/features/ai-agent/lib/tools.ts` - Tool definitions

---

## Overview (OUTDATED)
The AI Agent feature enables users to create and manipulate canvas objects using natural language commands. Built with LangChain and OpenAI, it provides intelligent shape manipulation through a chat interface.

## Architecture

### Feature Structure (Vertical Slicing)
```
src/features/ai-agent/
├── components/
│   ├── AIChat.tsx                 # Main chat interface
│   ├── AIMessageBubble.tsx        # Individual message display
│   └── AICommandInput.tsx         # Command input field
├── hooks/
│   └── useAIAgent.ts              # React integration hook
├── lib/
│   ├── aiAgentStore.ts            # Zustand store for messages
│   └── tools.ts                   # LangChain tool definitions
├── services/
│   └── aiAgentService.ts          # LangChain agent service
├── types/
│   └── index.ts                   # TypeScript interfaces
└── index.ts                        # Feature exports
```

### Core Components

#### AIAgentService
- **Purpose**: Manages LangChain agent and OpenAI integration
- **Key Features**:
  - GPT-4 Turbo integration
  - Function calling with structured tools
  - Chat history management
  - Context-aware prompt engineering
  - LangSmith observability ready

#### Tools System
10 distinct tools across 4 categories:

**1. Creation Tools (3)**
- `createShape`: Create rectangles, circles, or text
  - Supports custom positions, sizes, colors
  - Defaults: rectangles (100x100, blue), circles (radius 50, green), text (200x50, black)

**2. Manipulation Tools (5)**
- `moveShape`: Move objects by absolute position or delta
- `resizeShape`: Resize by dimensions or scale factor
- `rotateShape`: Rotate by degrees (positive = clockwise)
- `changeColor`: Update fill color (hex, rgb, or name)
- `duplicateShape`: Create copy with offset

**3. Layout Tools (1)**
- `arrangeShapes`: Arrange multiple shapes horizontally or vertically with spacing

**4. Complex Tools (2)**
- `createLoginForm`: Multi-step form generation (8 shapes)
  - Container, title, username field with label, password field with label, button with text
  - Supports color schemes (blue, purple, green)
- `createCardLayout`: Multi-step card generation (5 shapes)
  - Container, image placeholder, title, description
  - Custom title and description support

### Integration with Canvas

#### Object Creation Flow
```
User: "Create a red circle"
  → AI Agent parses command
  → Calls createShape tool
  → Tool calls createObjectService(canvasId, object)
  → Object persisted to Firestore
  → Object added to Zustand store
  → Real-time broadcast via RTDB
  → All users see new shape
```

#### Object Manipulation Flow
```
User: "Move the circle to 200, 300"
  → AI Agent identifies target object
  → Calls moveShape tool
  → Tool calls updateObjectService(canvasId, id, updates)
  → Update persisted to Firestore
  → Update applied to Zustand store
  → Real-time broadcast via RTDB
  → All users see updated position
```

## Technical Implementation

### Dependencies
```json
{
  "langchain": "^0.3.x",
  "@langchain/openai": "^0.3.x",
  "@langchain/core": "^0.3.x",
  "zod": "^3.x"
}
```

### Key Features

#### 1. Tool Schema Definition
- Uses Zod for runtime validation
- DynamicStructuredTool for type-safe function calling
- Descriptive schema for better AI understanding

#### 2. Object Finder Algorithm
- Searches by type (rectangle, circle, text)
- Searches by color (red, blue, green, etc.)
- Falls back to most recent object
- Smart matching for natural language descriptions

#### 3. Chat Interface
- Real-time message updates
- Expandable/collapsible UI
- Error display with dismiss
- Processing indicators
- Empty state with examples

#### 4. API Key Management
- Environment variable support (`NEXT_PUBLIC_OPENAI_API_KEY`)
- localStorage fallback for development
- Secure input modal
- Persistent across sessions

### Prompt Engineering

#### System Prompt
```
You are an AI assistant that helps users create and manipulate 
shapes on a collaborative canvas.

Available capabilities:
- Create shapes (rectangles, circles, text)
- Move shapes to specific positions or by delta amounts
- Resize shapes by dimensions or scale factor
- Rotate shapes by degrees
- Change shape colors
- Arrange multiple shapes in layouts (horizontal/vertical)
- Delete shapes
- Duplicate shapes

When users ask for complex layouts, break down the task into 
multiple shape creation and arrangement steps.

Guidelines:
- Default colors: rectangles blue, circles green, text black
- Default sizes: rectangles 100x100, circles radius 50, text 200x50
- Use descriptive fills and clear positioning
- For complex commands, create multiple shapes and arrange logically
- Consider visual hierarchy and spacing
```

## Usage Examples

### Simple Commands
```
"Create a red circle"
→ Creates circle at center with red fill

"Move the circle to 300, 400"
→ Moves circle to absolute position

"Make the rectangle twice as big"
→ Scales rectangle by 2x

"Rotate the text 45 degrees"
→ Rotates text clockwise

"Change the circle to purple"
→ Updates fill color
```

### Layout Commands
```
"Arrange these shapes horizontally"
→ Arranges all shapes in horizontal row with 20px spacing

"Space these elements evenly in a vertical column"
→ Arranges selected shapes vertically with even spacing
```

### Complex Commands
```
"Create a login form"
→ Generates complete login UI:
  - White container (300x250)
  - "Login" title (24px)
  - Username input field with label
  - Password input field with label
  - Blue login button with text

"Make a card layout with title 'Product Card' and description 
'This is a sample product'"
→ Generates card UI:
  - White card container (280x350)
  - Gray image placeholder
  - Title "Product Card"
  - Description text
```

## Performance Considerations

### Optimization Strategies
1. **Tool Re-initialization**: Agent re-initializes with latest objects before each command
2. **Optimistic Updates**: Local store updates immediately for responsiveness
3. **Firebase Integration**: Leverages existing real-time sync infrastructure
4. **Throttling**: AI responses naturally throttled by OpenAI API latency
5. **Message History**: Limited to prevent token overflow

### Performance Targets
- **AI Response Time**: <2s for single-step commands
- **Complex Commands**: <5s for multi-step operations
- **Sync Latency**: Inherits canvas sync (<100ms)
- **Concurrent Users**: All users can use AI simultaneously

## Testing Strategy

### Command Categories to Test
1. **Creation**: Verify all shape types can be created
2. **Manipulation**: Test move, resize, rotate, color change
3. **Layout**: Test horizontal and vertical arrangement
4. **Complex**: Verify login form and card layout generation
5. **Edge Cases**: Empty canvas, multiple objects, ambiguous descriptions

### Validation Checklist
- [ ] Simple shape creation works
- [ ] Shape manipulation (move, resize, rotate) works
- [ ] Color changes apply correctly
- [ ] Layout commands arrange shapes properly
- [ ] Login form generates all 8 shapes
- [ ] Card layout generates all 5 shapes
- [ ] Multiple users can use AI simultaneously
- [ ] Real-time sync works with AI-created objects
- [ ] Error handling displays correctly
- [ ] API key management works (env + localStorage)

## Future Enhancements

### Planned Features
1. **More Complex Layouts**: Dashboard, settings panel, navigation menu
2. **Shape Selection**: "Select all circles", "Select shapes on the left"
3. **Batch Operations**: "Make all rectangles red", "Resize all shapes by 50%"
4. **Smart Positioning**: "Place circle next to rectangle", "Center the text"
5. **Style Inheritance**: "Make this look like that", "Copy the style"
6. **Undo Support**: "Undo last change", "Revert to before"

### Technical Improvements
1. **Streaming Responses**: Show AI thinking in real-time
2. **Tool Call Visibility**: Display which tools are being called
3. **Command Suggestions**: Context-aware autocomplete
4. **Voice Input**: Speech-to-text for commands
5. **Multi-language Support**: Commands in multiple languages

## Troubleshooting

### Common Issues

**"AI agent not initialized"**
- Ensure OpenAI API key is set
- Check environment variables or localStorage
- Verify API key is valid

**"Could not find shape matching"**
- Be more specific in descriptions
- Use shape type (rectangle, circle, text)
- Use color in description
- Check if shape exists on canvas

**"Complex command not generating all shapes"**
- Check console for errors
- Verify Firebase connection
- Ensure sufficient API rate limits

### Debug Mode
Enable verbose logging in AIAgentService:
```typescript
verbose: true  // In AgentExecutor configuration
```

## Resources
- [LangChain Documentation](https://js.langchain.com/docs)
- [OpenAI Function Calling](https://platform.openai.com/docs/guides/function-calling)
- [LangSmith Observability](https://smith.langchain.com/)

---
*Last Updated: 2025-10-16*
*Status: Implemented and building successfully*

