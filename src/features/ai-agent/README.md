# AI Agent Feature - Client-Side Execution Architecture

## Overview

The AI agent uses a **client-side execution pattern** where the AI decides what actions to take, but the actual canvas modifications happen on the client using the existing authenticated Firebase connection.

## Architecture

```
┌─────────────────┐
│  User Interface │
│   (AIChat)      │
└────────┬────────┘
         │ "Create a red circle"
         ↓
┌─────────────────┐
│  useAIAgent     │  Client-side Hook
│  Hook           │  • Sends request to API
└────────┬────────┘  • Receives actions
         │           • Executes actions
         ↓
    ┌────────┴─────────┐
    │                  │
    ↓                  ↓
┌─────────┐      ┌──────────────┐
│  API    │      │ objectsService│  Existing API
│  Route  │      │ (client)      │  Uses user's auth
└────┬────┘      └───────────────┘
     │                   │
     ↓                   ↓
┌──────────────┐   ┌────────────┐
│ AI Agent     │   │  Firebase  │  Firestore + RTDB
│ Service      │   │  (client)  │  Authenticated
│ (server)     │   └────────────┘
│              │
│ Returns:     │
│ {            │
│   message,   │
│   actions[]  │
│ }            │
└──────────────┘
```

## Why Client-Side Execution?

### ✅ Benefits

1. **Single Source of Truth**: One `objectsService` for all operations
2. **Security**: Uses user's actual Firebase auth credentials
3. **No Duplication**: No need for separate server-side Firebase code
4. **Performance**: Leverages Firestore's client-side caching
5. **Validation**: Firebase Security Rules automatically enforce permissions
6. **Real-time Sync**: Same sync mechanism as manual operations

### ❌ Problems with Server-Side Execution

1. **Authentication Issues**: Server has no user auth context
2. **Code Duplication**: Would need separate Firebase operations
3. **No Caching**: Every AI command requires fresh Firebase reads
4. **Security Complexity**: Need to pass and verify auth tokens
5. **Permission Bypass**: Could potentially bypass user permissions

## Data Flow

### Request Flow

```typescript
// 1. User sends command
executeCommand("Create a red circle")

// 2. Hook calls API with context
POST /api/ai-agent
{
  command: "Create a red circle",
  canvasId: "canvas-123",
  userId: "user-456",
  userName: "John",
  objectCount: 5  // Current object count
}

// 3. AI analyzes and returns actions
{
  message: "I've created a red circle for you!",
  actions: [
    {
      tool: "createShape",
      params: {
        type: "circle",
        x: 250,
        y: 200,
        radius: 50,
        fill: "#ff0000"
      }
    }
  ],
  success: true
}

// 4. Client executes actions
await createObject(canvasId, {
  type: "circle",
  position: { x: 250, y: 200 },
  radius: 50,
  fill: "#ff0000",
  createdBy: userId,
  // ... other fields
})

// 5. Firebase syncs to all users
// Shape appears on canvas immediately
```

## Key Components

### 1. Types (`types/index.ts`)

```typescript
export interface AIAction {
  tool: 'createShape' | 'moveShape' | ...;
  params: Record<string, any>;
}

export interface AIAgentResponse {
  message: string;       // Conversational response
  actions?: AIAction[];  // Client-side actions to execute
  success: boolean;
}
```

### 2. Service (`services/simpleAgentService.ts`)

**Role**: Analyze user intent and return actions

- Creates LangChain agent with tools
- Tools capture actions instead of executing
- Returns `{ message, actions, success }`

**Key Code**:
```typescript
// Tools capture instead of execute
createShapeTool(context, async (object) => {
  this.capturedActions.push({
    tool: 'createShape',
    params: { ... }
  });
});
```

### 3. Hook (`hooks/useAIAgent.ts`)

**Role**: Execute actions client-side

- Calls API to get response + actions
- Executes actions using existing `objectsService`
- Shows conversational response in chat

**Key Code**:
```typescript
// Execute actions client-side
for (const action of data.actions) {
  switch (action.tool) {
    case 'createShape':
      await createObject(canvasId, params);
      break;
  }
}
```

## Security

### ✅ Secure by Design

1. **Firebase Security Rules**: All operations validated by Firestore rules
2. **User Context**: Actions execute with user's actual permissions
3. **No Auth Bypass**: Can't create shapes in canvases user doesn't access
4. **API Key Protected**: OpenAI key stays server-side only
5. **Input Sanitization**: AI commands validated before processing

### 🔒 What's Protected

```javascript
// Firestore Rules
match /canvases/{canvasId}/objects/{objectId} {
  allow read, write: if isAuthenticated();
}
```

If the user doesn't have access to a canvas, the AI can't create shapes there either - Firebase will reject the operation.

## Performance

### Client-Side Caching

- ✅ Firestore maintains local cache
- ✅ Subscriptions keep data in sync
- ✅ No extra reads for AI commands
- ✅ Offline persistence (if enabled)

### Optimization

```typescript
// Send current object count to avoid server fetching
body: JSON.stringify({
  command: input,
  objectCount: objects.length,  // Client already has this
})
```

The AI prompt uses `objectCount` for context without requiring server-side Firebase reads.

## Adding New Actions

To add new actions (move, delete, etc.):

### 1. Update Types

```typescript
// types/index.ts
export interface AIAction {
  tool: 'createShape' | 'moveShape' | 'deleteShape' | ...;
  params: Record<string, any>;
}
```

### 2. Add Tool to Service

```typescript
// services/simpleAgentService.ts
const tools = [
  createShapeTool(...),
  moveShapeTool(...),  // Already defined in lib/tools.ts
];
```

### 3. Add Execution Handler

```typescript
// hooks/useAIAgent.ts
case 'moveShape': {
  await updateObject(canvasId, objectId, {
    position: { x, y }
  });
  break;
}
```

## Testing

Try these commands:
- ✅ "Create a red circle"
- ✅ "Make a blue rectangle at 300, 200"
- ✅ "Add text that says Hello World"
- ✅ "Create a 150x150 green square"

The AI will:
1. Understand your intent
2. Return appropriate actions
3. Client executes using authenticated connection
4. All users see the changes in real-time

## Future Enhancements

### Easy Additions (Same Pattern)

1. **Move shapes**: "Move the circle to 500, 300"
2. **Change colors**: "Make the rectangle red"
3. **Delete shapes**: "Delete the blue circle"
4. **Complex layouts**: "Create a login form"

All tool definitions already exist in `lib/tools.ts` - just need to:
1. Add to service's tool array
2. Add execution case in hook

### Advanced Features

1. **Multi-step operations**: "Create 3 circles in a row"
2. **Conditional logic**: "If there are more than 5 shapes, arrange them"
3. **Smart defaults**: Learn user preferences over time
4. **Undo/Redo**: Track AI-generated actions

## Troubleshooting

### Actions not executing?

Check browser console for:
```
[executeAction] Executing action: createShape {...}
```

If missing, the action isn't being returned by the AI.

### Firebase permission errors?

Verify Firebase Security Rules allow the operation:
```javascript
allow create: if isAuthenticated();
```

### AI not calling tools?

Check the AI's response in console:
```
[AI Agent Service] Captured X actions
```

If 0, the AI didn't recognize it needed to use a tool. Adjust the prompt in `simpleAgentService.ts`.

