# Render Build Fix Instructions

## Issue Found:
Render build fail ho rahi thi because `vite` command not found error aa raha tha.

## Fixed Files:
1. **render.yaml** - Build command updated to `npm install && npm run build`

## New Steps for GitHub Update:

### Quick Fix (if already deployed):
1. GitHub repository me jaiye
2. `render.yaml` file edit kariye
3. Line 6 me change kare:
   - **Old:** `buildCommand: npm ci && npm run build`
   - **New:** `buildCommand: npm install && npm run build`
4. Commit changes
5. Render dashboard me "Manual Deploy" trigger kare

### Complete Reupload (Recommended):
1. Replit se fresh project ZIP download kare (with fixed render.yaml)
2. GitHub me existing files delete kare ya new repository banaye
3. Fixed files upload kare
4. Render redeploy kare

## Root Cause:
- `npm ci` command strict dependency installation karta hai
- `npm install` more flexible hai aur dev dependencies bhi install karta hai
- Production build ke liye vite dev dependency chahiye

## Expected Result After Fix:
```
==> Running build command 'npm install && npm run build'...
✅ Build successful
✅ Starting application
```