# Render Deployment Guide - SMM Panel

## Step 1: GitHub Repository Setup

1. **Create GitHub Repository:**
   - GitHub.com pe login kariye
   - "New Repository" button click kariye
   - Repository name: `smm-panel` (ya koi aur naam)
   - Public repository select kariye
   - "Create repository" click kariye

2. **Upload Project Files:**
   - Project folder se saare files select kariye
   - GitHub repository page pe drag & drop kariye
   - Commit message: "Initial project upload"
   - "Commit changes" click kariye

## Step 2: Database Setup (Important!)

**Option A - Neon Database (Recommended for Free Tier):**
1. https://neon.tech pe account banayiye
2. New project create kariye
3. Database connection string copy kariye (postgres://...)

**Option B - Supabase Database:**
1. https://supabase.com pe account banayiye
2. New project create kariye
3. Database URL copy kariye

## Step 3: Render Deployment

1. **Connect GitHub:**
   - https://render.com pe account banayiye
   - "New +" button click kariye
   - "Web Service" select kariye
   - "Connect a repository" me apna GitHub repo select kariye

2. **Basic Configuration:**
   - Name: `smm-panel`
   - Region: `Oregon (US West)`
   - Branch: `main`
   - Root Directory: (blank)
   - Runtime: `Node`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run start`

3. **Environment Variables (Very Important!):**
   ```
   NODE_ENV=production
   DATABASE_URL=your_database_connection_string_here
   SESSION_SECRET=your_random_secret_here_minimum_32_characters
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token
   TELEGRAM_CHAT_ID=your_telegram_chat_id
   PORT=10000
   ```

4. **Free Tier Settings:**
   - Plan: `Free`
   - Auto-Deploy: `Yes`

## Step 4: Post-Deployment Setup

1. **Database Schema Setup:**
   - Deployment successful hone ke baad
   - Render dashboard me "Shell" tab open kariye
   - Run: `npm run db:push`

2. **Test Your Application:**
   - Render dashboard me live URL copy kariye
   - Website open kariye
   - Registration/Login test kariye

## Environment Variables Explanation

- `DATABASE_URL`: Database connection string (Neon/Supabase se)
- `SESSION_SECRET`: Strong random string (minimum 32 characters)
- `TELEGRAM_BOT_TOKEN`: Telegram bot token (optional for notifications)
- `TELEGRAM_CHAT_ID`: Telegram chat ID (optional for notifications)
- `PORT`: Render automatically sets this to 10000

## Common Issues & Solutions

**Build Failed:**
- Check package.json scripts
- Verify all dependencies are in dependencies, not devDependencies

**Database Connection Error:**
- Verify DATABASE_URL format
- Check database server is running
- Ensure database allows external connections

**Session Issues:**
- Generate strong SESSION_SECRET (32+ characters)
- Use: `openssl rand -base64 32` for generating secret

**Free Tier Limitations:**
- Service sleeps after 15 minutes of inactivity
- 750 hours per month usage limit
- Slower cold starts

## Success Indicators

✅ Build completes without errors
✅ Service starts successfully
✅ Website loads without crashes
✅ User registration works
✅ Database operations successful

## Support

- Check Render logs for specific error messages
- Database issues: Check connection string format
- Build issues: Verify package.json scripts
- Environment variables: Double-check all required vars are set