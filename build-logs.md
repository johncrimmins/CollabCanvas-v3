23:58:40.125 Running build in Washington, D.C., USA (East) – iad1
23:58:40.126 Build machine configuration: 2 cores, 8 GB
23:58:40.140 Cloning github.com/johncrimmins/CollabCanvas-v3 (Branch: main, Commit: 07d8f2d)
23:58:40.425 Cloning completed: 284.000ms
23:58:41.541 Restored build cache from previous deployment (8BiTqQDiPeh3DFKeSYUKfAGQWmhQ)
23:58:42.044 Running "vercel build"
23:58:42.437 Vercel CLI 48.2.9
23:58:42.762 Installing dependencies...
23:58:44.474 npm warn deprecated node-domexception@1.0.0: Use your platform's native DOMException instead
23:58:46.077 
23:58:46.078 added 58 packages in 3s
23:58:46.079 
23:58:46.079 164 packages are looking for funding
23:58:46.080   run `npm fund` for details
23:58:46.113 Detected Next.js version: 14.2.33
23:58:46.117 Running "npm run build"
23:58:46.222 
23:58:46.223 > collabcanvas-v3@0.1.0 build
23:58:46.223 > next build
23:58:46.223 
23:58:46.918   ▲ Next.js 14.2.33
23:58:46.918 
23:58:46.966    Creating an optimized production build ...
23:59:15.967  ✓ Compiled successfully
23:59:15.968    Linting and checking validity of types ...
23:59:21.860 
23:59:21.860 Failed to compile.
23:59:21.861 
23:59:21.861 ./src/features/ai-agent/hooks/useAIAgent.ts
23:59:21.861 610:5  Warning: React Hook useCallback has a missing dependency: 'objects'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
23:59:21.861 
23:59:21.861 ./src/features/ai-agent/services/simpleAgentService.ts
23:59:21.861 131:11  Error: '_toolContext' is assigned a value but never used.  @typescript-eslint/no-unused-vars
23:59:21.861 
23:59:21.861 ./src/features/auth/components/UserProfile.tsx
23:59:21.861 29:9  Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element
23:59:21.861 
23:59:21.861 ./src/features/canvas/components/Canvas.tsx
23:59:21.862 113:5  Warning: React Hook useCallback has a missing dependency: 'onArrowMouseDown'. Either include it or remove the dependency array. If 'onArrowMouseDown' changes too often, find the parent component that defines it and wrap that definition in useCallback.  react-hooks/exhaustive-deps
23:59:21.862 
23:59:21.862 ./src/features/presence/components/OnlineUsers.tsx
23:59:21.862 39:19  Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element
23:59:21.862 
23:59:21.862 info  - Need to disable some ESLint rules? Learn more here: https://nextjs.org/docs/basic-features/eslint#disabling-rules
23:59:21.952 Error: Command "npm run build" exited with 1