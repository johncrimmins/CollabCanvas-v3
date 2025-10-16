# Vercel Deployment Guide for CollabCanvas v3

This guide walks you through deploying your collaborative canvas application to Vercel.

## Prerequisites

- [Vercel account](https://vercel.com/signup) (free tier is fine)
- [Git installed](https://git-scm.com/downloads)
- Firebase project set up (you should already have this)
- GitHub/GitLab/Bitbucket account (recommended)

## Step 1: Prepare Your Project

### 1.1 Verify Your Environment Variables

You need these Firebase environment variables. Get them from [Firebase Console](https://console.firebase.google.com/):

1. Go to your Firebase project
2. Click the gear icon → Project settings
3. Scroll down to "Your apps" section
4. Copy the config values

Create a `.env.local` file in your project root (if you haven't already):

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your-project-id-default-rtdb.firebaseio.com
```

**Important:** `.env.local` is gitignored and won't be pushed to your repo. You'll add these to Vercel separately.

### 1.2 Test Your Build Locally

Before deploying, make sure your app builds successfully:

```bash
npm run build
```

If you see any errors, fix them before proceeding.

### 1.3 Create a Git Repository (if not already done)

```bash
# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit - ready for deployment"
```

## Step 2: Push to GitHub (Recommended Method)

### 2.1 Create a GitHub Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click the "+" icon → "New repository"
3. Name it (e.g., "collabcanvas-v3")
4. Choose "Private" or "Public"
5. **DO NOT** initialize with README (you already have files)
6. Click "Create repository"

### 2.2 Push Your Code

```bash
# Add GitHub remote (replace with your repository URL)
git remote add origin https://github.com/YOUR_USERNAME/collabcanvas-v3.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 3: Deploy to Vercel

### Method A: Deploy via Vercel Dashboard (Easiest)

1. **Go to Vercel:**
   - Visit [https://vercel.com](https://vercel.com)
   - Sign in (or create account)
   - Connect your GitHub account if prompted

2. **Import Project:**
   - Click "Add New..." → "Project"
   - Select "Import Git Repository"
   - Find your `collabcanvas-v3` repository
   - Click "Import"

3. **Configure Project:**
   - **Framework Preset:** Next.js (should auto-detect)
   - **Root Directory:** `./` (leave as default)
   - **Build Command:** `npm run build` (should auto-fill)
   - **Output Directory:** `.next` (should auto-fill)
   - **Install Command:** `npm install` (should auto-fill)

4. **Add Environment Variables:**
   - Click "Environment Variables" section
   - Add each variable from your `.env.local`:
     - `NEXT_PUBLIC_FIREBASE_API_KEY` = `your_api_key`
     - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` = `your-project.firebaseapp.com`
     - `NEXT_PUBLIC_FIREBASE_PROJECT_ID` = `your-project-id`
     - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` = `your-project.appspot.com`
     - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` = `your_sender_id`
     - `NEXT_PUBLIC_FIREBASE_APP_ID` = `your_app_id`
     - `NEXT_PUBLIC_FIREBASE_DATABASE_URL` = `https://your-project-rtdb.firebaseio.com`
   - **Important:** Make sure to add these for all environments (Production, Preview, Development)

5. **Deploy:**
   - Click "Deploy"
   - Wait for build to complete (usually 1-3 minutes)
   - You'll get a live URL like: `https://collabcanvas-v3.vercel.app`

### Method B: Deploy via Vercel CLI (Advanced)

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy (from project root)
vercel

# Follow the prompts:
# - Set up and deploy? Y
# - Which scope? (select your account)
# - Link to existing project? N
# - Project name? (accept default or customize)
# - Directory? ./ (press Enter)
# - Want to override settings? N

# Add environment variables
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY
# Enter your value when prompted
# Select Production, Preview, Development

# Repeat for each environment variable

# Deploy to production
vercel --prod
```

## Step 4: Configure Firebase for Vercel Domain

After deployment, you need to authorize your Vercel domain in Firebase:

1. **Get Your Vercel URL:**
   - From Vercel dashboard, copy your deployment URL (e.g., `https://collabcanvas-v3.vercel.app`)

2. **Add to Firebase Authorized Domains:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project
   - Go to **Authentication** → **Settings** → **Authorized domains**
   - Click "Add domain"
   - Paste your Vercel URL (without `https://`): `collabcanvas-v3.vercel.app`
   - Click "Add"

## Step 5: Test Your Deployment

1. **Open Your Vercel URL** in a browser
2. **Sign Up/Sign In** - Test authentication works
3. **Create Shapes** - Add rectangles and circles
4. **Refresh the Page** - Verify objects persist (this tests Firestore)
5. **Open in Multiple Tabs** - Test real-time sync:
   - Move objects in one tab
   - Watch them update in the other tab
   - Move cursor and see it in other tab
6. **Check Performance** - Objects should sync smoothly

## Step 6: Set Up Continuous Deployment (Automatic)

Good news! This is already done. Every time you push to GitHub:

```bash
git add .
git commit -m "Add new feature"
git push
```

Vercel will automatically:
- Detect the push
- Build your app
- Deploy to production
- Give you a new deployment URL

## Troubleshooting

### Build Fails

**Error:** "Module not found" or dependency errors
- **Solution:** Make sure all dependencies are in `package.json`
- Run: `npm install` locally and commit `package-lock.json`

**Error:** TypeScript errors
- **Solution:** Fix TypeScript errors shown in build log
- Test locally: `npm run build`

### Firebase Connection Issues

**Error:** "Firebase: Error (auth/unauthorized-domain)"
- **Solution:** Add your Vercel domain to Firebase Authorized domains (see Step 4)

**Error:** Objects don't persist
- **Solution:** 
  - Check environment variables are set correctly in Vercel
  - Make sure all `NEXT_PUBLIC_FIREBASE_*` variables are present
  - Check browser console for Firebase errors

**Error:** "Firebase not initialized"
- **Solution:** This usually means environment variables are missing
- Verify in Vercel Dashboard → Settings → Environment Variables

### Real-time Sync Not Working

**Issue:** Changes don't appear in other tabs
- **Solution:**
  - Check Firebase Realtime Database rules allow read/write
  - Open browser console and look for Firebase errors
  - Verify `NEXT_PUBLIC_FIREBASE_DATABASE_URL` is correct

## Custom Domain (Optional)

Want to use your own domain like `canvas.yourdomain.com`?

1. **In Vercel Dashboard:**
   - Go to your project
   - Click "Settings" → "Domains"
   - Click "Add"
   - Enter your domain (e.g., `canvas.yourdomain.com`)
   - Follow DNS configuration instructions

2. **Update Firebase:**
   - Add your custom domain to Firebase Authorized domains
   - Update any hardcoded URLs in your app (if any)

## Environment Variables Reference

All these must be set in Vercel:

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase API key | `AIzaSyC...` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase auth domain | `myapp.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID | `myapp-12345` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Storage bucket | `myapp.appspot.com` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Messaging sender ID | `123456789` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app ID | `1:123456:web:abc123` |
| `NEXT_PUBLIC_FIREBASE_DATABASE_URL` | Realtime Database URL | `https://myapp-rtdb.firebaseio.com` |

## Performance Monitoring

Once deployed, monitor your app:

1. **Vercel Analytics:**
   - Available in project dashboard
   - Shows page load times, user counts

2. **Firebase Console:**
   - Monitor Firestore usage (reads/writes)
   - Monitor RTDB connections
   - Check authentication statistics

## Next Steps

After successful deployment:

- [ ] Test with multiple users
- [ ] Validate performance targets (<100ms sync)
- [ ] Update Firebase security rules (currently in dev mode)
- [ ] Add error monitoring (Sentry, etc.)
- [ ] Set up custom domain (optional)
- [ ] Share the URL and start collaborating!

## Support

If you run into issues:

1. Check Vercel build logs: Project → Deployments → Click deployment → View logs
2. Check browser console for Firebase errors
3. Verify all environment variables are set
4. Test build locally: `npm run build && npm start`

---

**Your App URL:** `https://your-project.vercel.app`

🎉 Congratulations! Your collaborative canvas is now live!


