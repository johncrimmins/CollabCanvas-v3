00:01:31.652 Running build in Washington, D.C., USA (East) – iad1
00:01:31.652 Build machine configuration: 2 cores, 8 GB
00:01:31.669 Cloning github.com/johncrimmins/CollabCanvas-v3 (Branch: main, Commit: 230497c)
00:01:31.998 Cloning completed: 328.000ms
00:01:33.528 Restored build cache from previous deployment (8BiTqQDiPeh3DFKeSYUKfAGQWmhQ)
00:01:33.976 Running "vercel build"
00:01:34.341 Vercel CLI 48.2.9
00:01:34.638 Installing dependencies...
00:01:36.239 npm warn deprecated node-domexception@1.0.0: Use your platform's native DOMException instead
00:01:37.812 
00:01:37.813 added 58 packages in 3s
00:01:37.813 
00:01:37.814 164 packages are looking for funding
00:01:37.814   run `npm fund` for details
00:01:37.843 Detected Next.js version: 14.2.33
00:01:37.848 Running "npm run build"
00:01:37.946 
00:01:37.946 > collabcanvas-v3@0.1.0 build
00:01:37.946 > next build
00:01:37.946 
00:01:38.548   ▲ Next.js 14.2.33
00:01:38.549 
00:01:38.594    Creating an optimized production build ...
00:02:04.470  ✓ Compiled successfully
00:02:04.471    Linting and checking validity of types ...
00:02:10.396 
00:02:10.396 Failed to compile.
00:02:10.396 
00:02:10.396 ./src/features/ai-agent/hooks/useAIAgent.ts
00:02:10.397 610:5  Warning: React Hook useCallback has a missing dependency: 'objects'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
00:02:10.403 
00:02:10.403 ./src/features/ai-agent/services/simpleAgentService.ts
00:02:10.404 8:15  Error: 'ToolExecutionContext' is defined but never used.  @typescript-eslint/no-unused-vars
00:02:10.404 
00:02:10.404 ./src/features/auth/components/UserProfile.tsx
00:02:10.404 29:9  Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element
00:02:10.404 
00:02:10.404 ./src/features/canvas/components/Canvas.tsx
00:02:10.404 113:5  Warning: React Hook useCallback has a missing dependency: 'onArrowMouseDown'. Either include it or remove the dependency array. If 'onArrowMouseDown' changes too often, find the parent component that defines it and wrap that definition in useCallback.  react-hooks/exhaustive-deps
00:02:10.405 
00:02:10.405 ./src/features/presence/components/OnlineUsers.tsx
00:02:10.405 39:19  Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element
00:02:10.411 
00:02:10.411 info  - Need to disable some ESLint rules? Learn more here: https://nextjs.org/docs/basic-features/eslint#disabling-rules
00:02:10.491 Error: Command "npm run build" exited with 1