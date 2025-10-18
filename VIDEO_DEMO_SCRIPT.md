# CollabCanvas v3 - Video Demo Script
## 3-5 Minute Technical Demo

---

## **INTRO: The Hook** (15 seconds)
*[Screen: Show the canvas with 2-3 users actively collaborating]*

**"What if you could build a fully collaborative canvas app with sub-50ms cursor sync, real-time object manipulation, and AI-powered canvas control—all in one week? Let me show you CollabCanvas v3."**

---

## **PART 1: OVERVIEW** (30 seconds)
*[Screen: Show codebase in VS Code, then switch to live app]*

**"CollabCanvas is a real-time collaborative canvas built with performance-first architecture. Think Figma, but rebuilt from scratch with:**
- **Bulletproof multiplayer sync** - cursors under 50ms, objects under 100ms
- **Vertical-slice architecture** - each feature is a self-contained module
- **AI agent layer** - natural language canvas control using OpenAI function calling

**The entire MVP was built in week 1. Let's dive into how it works."**

---

## **PART 2: TECH STACK & KEY DECISIONS** (45 seconds)
*[Screen: Show systemPatterns.md or techContext.md file]*

**"The stack is purpose-built for real-time collaboration:**

**Frontend:** Next.js 14 with App Router, TypeScript, Konva.js for canvas rendering, Zustand for state management.

**Backend:** Firebase everywhere - Auth for users, Realtime Database for ephemeral data like cursors, Firestore for persistence.

**AI Layer:** Direct OpenAI function calling—no LangChain agent abstractions—with a 2-tool architecture.

**Three critical decisions made this fly:**
1. **Dual database strategy** - RTDB for speed, Firestore for persistence. Best of both worlds.
2. **60fps throttling** - cursor and transform broadcasts hit exactly 16ms intervals. Feels instant.
3. **Last-write-wins conflict resolution** - simple, predictable, and documented."

---

## **PART 3: DIRECTORY STRUCTURE** (30 seconds)
*[Screen: Show src/features/ directory in VS Code]*

**"Architecture is vertical slicing - every feature is isolated:**

```
src/features/
  auth/         - Firebase auth, protected routes
  presence/     - Real-time cursors, online users  
  canvas/       - Pan/zoom with Konva.js
  objects/      - Shape creation, sync, transforms
  ai-agent/     - OpenAI function calling, 2-tool system
```

**Each feature has:**
- `components/` - React UI
- `hooks/` - Business logic
- `services/` - External APIs (Firebase, OpenAI)
- `lib/` - Zustand stores
- `types/` - TypeScript definitions

**Zero coupling. Add features without touching existing code."**

---

## **PART 4: COOLEST TECH HIGHLIGHTS** (45 seconds)
*[Screen: Show code files as you reference them]*

**"Let me highlight the most impressive parts:**

### **1. Real-Time Cursor Sync** *(Show: presence/hooks/usePresence.ts)*
**"16ms throttled cursor broadcasts. Firebase RTDB listeners with optimistic updates. Result? Sub-50ms latency."**

### **2. Shared Interaction Hook** *(Show: objects/hooks/useShapeInteractions.ts)*
**"Every shape—rectangles, circles, text—shares ONE interaction hook. DRY architecture. Add a new shape? 30 lines of code."**

### **3. Visual Transform Feedback** *(Show: objects/components/Rectangle.tsx)*
**"When someone else transforms your object, it goes semi-transparent. You see WHO is moving WHAT in real-time. 60fps smooth."**

### **4. AI Agent - 2-Tool Architecture** *(Show: ai-agent/services/simpleAgentService.ts)*
**"Consolidated 10 tools into 2:**
- `getCanvasState` - AI queries the canvas
- `canvasAction` - Unified tool with 5 operations: create, update, delete, duplicate, arrange

**ID-based targeting. No ambiguity. OpenAI function calling returns actions, client executes them with authenticated Firebase. Sub-2 second responses."**

---

## **PART 5: LIVE DEMO** (90-120 seconds)
*[Screen: Split screen - two browser windows side by side]*

### **Setup** (10 seconds)
**"Two browser windows. Two users. Let's prove this works."**

*[Show both windows open to auth page]*

### **Authentication** (10 seconds)
**"User 1 signs in... User 2 signs in..."**

*[Both authenticate, land on canvas]*

### **Presence & Cursor Sync** (15 seconds)
**"User 1 moves their cursor—watch User 2's screen. See that? Sub-50ms. Name labels follow perfectly. This is real-time."**

*[Move cursor on User 1, show it appear instantly on User 2]*

**"Online users panel shows both active. Join/leave detection works automatically."**

### **Object Creation** (15 seconds)
**"User 1 creates a rectangle... boom, User 2 sees it instantly."**

*[User 1 clicks rectangle tool, draws a shape]*

**"User 2 creates a circle... same thing. Object sync under 100ms. No lag."**

*[User 2 clicks circle tool, draws a circle]*

### **Drag & Transform** (20 seconds)
**"Now watch this—User 1 drags the rectangle..."**

*[User 1 drags rectangle around canvas]*

**"User 2's screen tracks it perfectly. 60 frames per second."**

**"User 2 resizes the circle... see User 1's screen? Semi-transparent while transforming. Clear visual feedback of WHO is editing WHAT."**

*[User 2 resizes/rotates circle, show opacity change on User 1's screen]*

### **Delete & Sync** (10 seconds)
**"User 1 selects and deletes their rectangle—Delete key..."**

*[User 1 selects rectangle, presses Delete]*

**"Gone from both screens instantly. Firestore and RTDB in perfect sync."**

### **AI Agent Commands** (30-40 seconds)
**"Now the magic—AI canvas control. User 1 opens AI chat..."**

*[User 1 clicks AI chat, opens panel]*

**"Command 1: 'Create a red rectangle at position 200, 200'**

*[Type and send command, watch shape appear on BOTH screens]*

**"OpenAI returns the action, client executes it. Both users see it instantly."**

**"Command 2: 'Get all objects on the canvas'**

*[Type and send command, show AI response listing objects with IDs]*

**"AI reads the canvas state, returns object IDs. ID-based targeting—no ambiguity."**

**"Command 3: 'Move the red rectangle to the center'**

*[Type and send command, watch rectangle move on BOTH screens]*

**"AI identifies the object by ID, calculates center position, executes the move. Real-time sync across all users."**

**"Under 2 seconds from prompt to action. Sub-100ms object sync across screens. This is production-ready."**

---

## **OUTRO: The Impact** (20 seconds)
*[Screen: Show both windows with canvas full of synced objects]*

**"Built in one week. Deployed to Vercel. Sub-50ms cursors. Sub-100ms objects. AI-powered canvas control with OpenAI function calling. All authenticated, secured, and scaled for 5+ concurrent users.**

**CollabCanvas v3—where real-time collaboration meets AI. The foundation is bulletproof. The architecture is extensible. The performance is unmatched."**

*[Fade to app URL or GitHub repo]*

---

## **TIMING BREAKDOWN**
- **Intro:** 15s
- **Overview:** 30s
- **Tech Stack:** 45s
- **Directory Structure:** 30s
- **Code Highlights:** 45s
- **Live Demo:** 90-120s
- **Outro:** 20s

**Total: 4:15 - 5:05** ✅

---

## **DEMO CHECKLIST**
### Before Recording
- [ ] Two browser windows open (User 1 & User 2)
- [ ] Both logged out (ready to show auth)
- [ ] Canvas cleared (fresh demo)
- [ ] OpenAI API key configured
- [ ] Screen recording software ready
- [ ] Browser zoom at 100% for clarity
- [ ] Firebase project responsive (check ping)

### During Demo
- [ ] Authenticate both users smoothly
- [ ] Show cursor sync immediately
- [ ] Create 1-2 shapes on each user
- [ ] Drag/transform with clear visual feedback
- [ ] Delete at least one object
- [ ] Execute 3 AI commands (create, query, update)
- [ ] Keep energy high—confidence is key

### After Demo
- [ ] Show final synced state
- [ ] Emphasize performance (sub-50ms, sub-100ms)
- [ ] Call out deployment status (Vercel URL)

---

## **PRO TIPS FOR RECORDING**
1. **Pace yourself** - Don't rush. Clarity > speed.
2. **Show, don't just tell** - Let the cursor sync speak for itself.
3. **Pause for impact** - After AI creates a shape, pause 1 second to let it land.
4. **Energy matters** - You're showing off incredible work. Sound excited.
5. **Backup plan** - If something lags, acknowledge it: "That's network latency, not the app."
6. **Practice the demo** - Run through it 2-3 times before recording.
7. **Highlight the wins** - Sub-50ms, sub-100ms, vertical slicing, AI function calling—these are BIG deals.

---

## **KEY TALKING POINTS TO EMPHASIZE**
✨ **"Sub-50ms cursor sync"** - Repeat this. It's impressive.  
✨ **"60fps throttled broadcasts"** - Technical precision.  
✨ **"Vertical slice architecture"** - Shows engineering maturity.  
✨ **"2-tool AI architecture"** - Simplified from 10 tools. Shows iteration.  
✨ **"ID-based targeting"** - No ambiguity. Reliable.  
✨ **"Built in one week"** - Speed + quality.  
✨ **"Production deployed on Vercel"** - Not a toy project.  

---

## **OPTIONAL: EXTENDED VERSION (5-7 min)**
If you want to go deeper, add:
- **Firebase security rules** - Show authentication enforcement
- **LangSmith traces** - Show AI decision-making process
- **useShapeInteractions hook** - Deep dive into DRY architecture
- **Performance benchmarks** - Show console timestamps for latency
- **5+ user stress test** - Open 5 tabs, show no degradation

---

**Good luck! You've built something incredible. Now show it off. 🚀**

