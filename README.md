# CollabCanvas v3

A real-time collaborative canvas application with multiplayer cursors, object synchronization, and future AI agent capabilities.

## Features

### MVP (Week 1)
- ✅ **Authentication** - Firebase Auth with email/password
- ✅ **Real-time Cursors** - Sub-50ms cursor sync via Firebase RTDB
- ✅ **Object Sync** - Sub-100ms object sync via Firebase RTDB + Firestore
- ✅ **Presence Awareness** - See who's online
- ✅ **Canvas Controls** - Pan (space + drag) and zoom (scroll wheel)
- ✅ **Shape Creation** - Rectangles and circles
- ✅ **Shape Manipulation** - Drag to move, transform to resize/rotate

### Architecture

**Vertical Slicing by Feature:**
```
src/
├── features/
│   ├── auth/          # Firebase Auth, protected routes
│   ├── presence/      # Cursors, online users (RTDB)
│   ├── canvas/        # Konva.js rendering, pan/zoom
│   └── objects/       # Shapes, sync (RTDB + Firestore)
└── shared/
    ├── lib/           # Firebase, utilities, Zustand store
    └── types/         # Shared TypeScript types
```

**Performance Targets:**
- Cursor sync: <50ms latency
- Object sync: <100ms latency
- 60 FPS with 500+ objects
- Support 5+ concurrent users

## Tech Stack

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Canvas:** Konva.js + react-konva
- **State:** Zustand
- **Backend:** Firebase (Auth, RTDB, Firestore)
- **Deploy:** Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- Firebase project with Auth, Realtime Database, and Firestore enabled

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a Firebase project at [https://console.firebase.google.com](https://console.firebase.google.com)

4. Enable Firebase services:
   - **Authentication** → Email/Password provider
   - **Realtime Database** → Create database in test mode
   - **Firestore** → Create database in test mode

5. Copy `.env.local.example` to `.env.local` and fill in your Firebase credentials:
   ```bash
   cp .env.local.example .env.local
   ```

6. Run the development server:
   ```bash
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000)

## Usage

1. **Sign Up / Sign In** - Create an account or sign in
2. **Create Shapes** - Click rectangle or circle buttons
3. **Move Shapes** - Drag shapes to move them
4. **Transform Shapes** - Select a shape and use handles to resize/rotate
5. **Pan Canvas** - Hold space and drag, or use middle mouse button
6. **Zoom Canvas** - Scroll wheel to zoom in/out
7. **Collaborate** - Share the URL with others to collaborate in real-time

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication page
│   ├── canvas/            # Main canvas page
│   └── page.tsx           # Landing page
├── src/
│   ├── features/          # Feature modules (vertical slices)
│   │   ├── auth/         # Authentication feature
│   │   ├── canvas/       # Canvas rendering feature
│   │   ├── objects/      # Objects/shapes feature
│   │   └── presence/     # Presence/cursors feature
│   └── shared/           # Shared utilities and types
│       ├── lib/         # Firebase, utils, store
│       └── types/       # TypeScript types
├── memory-bank/          # Project documentation
└── .cursor/rules/        # Cursor AI rules
```

## Development

### Build for Production

```bash
npm run build
```

### Run Production Build

```bash
npm start
```

### Lint Code

```bash
npm run lint
```

## Deployment

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for complete deployment instructions.

### Quick Deploy to Vercel

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push to main

**Important:** Make sure to add all Firebase environment variables to Vercel before deploying.

### Firebase Security Rules

Before going to production, update Firebase security rules:

**Firestore Rules:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /canvases/{canvasId}/objects/{objectId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

**Realtime Database Rules:**
```json
{
  "rules": {
    "cursors": {
      "$canvasId": {
        ".read": "auth != null",
        "$userId": {
          ".write": "auth != null && auth.uid == $userId"
        }
      }
    },
    "presence": {
      "$canvasId": {
        ".read": "auth != null",
        "$userId": {
          ".write": "auth != null && auth.uid == $userId"
        }
      }
    },
    "deltas": {
      "$canvasId": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    }
  }
}
```

## Performance Optimization

- **Cursor throttling:** 16ms (60fps)
- **Object persistence debouncing:** 300ms
- **Optimistic updates:** Local state updated immediately
- **Separate Konva layers:** Cursors on separate layer
- **RTDB for ephemeral:** Cursors and presence
- **Firestore for persistence:** Objects and canvas state

## Conflict Resolution

**Strategy:** Last-Write-Wins (LWW)
- Each update includes timestamp
- Latest timestamp wins in conflicts
- Simple, predictable, acceptable for MVP

## Future Features (Post-MVP)

- [ ] AI Agent with LangChain + OpenAI
- [ ] Additional shape types (text, lines)
- [ ] Undo/redo functionality
- [ ] Object grouping
- [ ] Layers panel
- [ ] Alignment tools
- [ ] Export to PNG/SVG

## Contributing

This is a personal project for learning and demonstration purposes.

## License

MIT

---

Built with ❤️ using Next.js, Firebase, and Konva.js

