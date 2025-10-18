# The LookBook

## Project Overview

The LookBook is a real-time collaboration app purpose-built for models, photographers, and stylists to plan photoshoots together. Users can create and manipulate shapes with tools and AI, collaborating in real-time on shared LookBooks. Each LookBook is a workspace where creative teams prepare the visual "looks" they want to achieve before getting on set to shoot.



### Architecture

At minimum, you should have:

1. A backend (Firestore, Supabase, or custom WebSocket server) that broadcasts updates.  
2. A front-end listener that updates local canvas state and rebroadcasts deltas.  
3. A persistence layer that saves the current state on disconnects.

## Core Collaborative Canvas

### LookBook Features

The LookBook workspace is a large canvas with smooth pan and zoom functionality, featuring a professional grey background. At the center is a fixed 1000x1000px white square called a "Look" - this is where users compose their primary visual concepts. Users can add additional Looks (Look 2, Look 3, etc.) which appear 1000px below each previous Look, each numbered with black text in the top-left corner.

The workspace supports basic shapes (rectangles, circles, arrows) and text layers with formatting options (Header, Subheading, Paragraph). Objects can exist anywhere in the LookBook workspace - the grey area around Looks serves as a staging area where designers can organize elements before swapping them into a Look to visualize the composition.

Users can transform objects (move, resize, rotate), select single and multiple objects (ctrl-click for multi-select), manage layers with visibility controls, and perform operations like duplicate, delete, copy, and paste.

### Real-Time Collaboration 

Every user should see multiplayer cursors with names moving in real time. When someone creates or modifies an object, it appears instantly for everyone. Show clear presence awareness of who’s currently editing.

Handle conflict resolution when multiple users edit simultaneously. (A “last write wins” approach is acceptable, but document your choice.)

Manage disconnects and reconnects without breaking the experience. Canvas state must persist — if all users leave and come back, their work should still be there.


## AI Canvas Agent

### The AI Feature

Build an AI agent that manipulates your canvas through natural language using function calling.

When a user types “Create a blue rectangle in the center,” the AI agent calls your canvas API functions, and the rectangle appears on everyone’s canvas via real-time sync.

### Required Capabilities

Your AI agent must support at least 6 distinct commands showing a range of creation, manipulation, and layout actions.

#### Creation Commands:

* “Create a red circle at position 100, 200”  
* “Add a text layer that says ‘Hello World’”  
* “Make a 200x300 rectangle”

#### Manipulation Commands:

* “Move the blue rectangle to the center”  
* “Resize the circle to be twice as big”  
* “Rotate the text 45 degrees”

#### Layout Commands:

* “Arrange these shapes in a horizontal row”  
* “Create a grid of 3x3 squares”  
* “Space these elements evenly”

#### Complex Commands:

* “Create a login form with username and password fields”  
* “Build a navigation bar with 4 menu items”  
* “Make a card layout with title, image, and description”

#### Example Evaluation Criteria

When you say:

“Create a login form,” …We expect the AI to create at least three inputs (username, password, submit), arranged neatly, not just a text box.

### Technical Implementation

Define a tool schema that your AI can call, such as:

```ts
createShape(type, x, y, width, height, color)
moveShape(shapeId, x, y)
resizeShape(shapeId, width, height)
rotateShape(shapeId, degrees)
createText(text, x, y, fontSize, color)
getCanvasState() // returns current canvas objects for context
```

Use LangChain tools for interpretation.  
For complex operations (e.g. “create a login form”), your AI should plan steps upfront (create fields, align, group) and execute sequentially.

#### Shared AI State

All users must see the same AI-generated results. If one user asks the AI to create something, everyone should see it. Multiple users should be able to use the AI simultaneously without conflict.

#### AI Agent Performance Targets

* Latency: Responses under 2 seconds for single-step commands.  
* Breadth: Handles 6+ command types.  
* Complexity: Executes multi-step operations.  
* Reliability: Consistent and accurate execution.  
* UX: Natural interaction with visible, immediate feedback.


#### Technical Stack

Recommended:

* Backend: Firebase (Firestore, Realtime DB, Auth)
* Frontend: React with Konva.js
* AI Integration: LangChain with OpenAI model
* Deployment: Vercel 

