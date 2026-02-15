# Render Deployment Instructions

## Step 1: Environment Variables
Set these in your Render service dashboard:

```
NODE_ENV=production
MONGODB_URI=mongodb+srv://instaboost_user:uX1YzKjiOETNhyYj@cluster0.tolxjiz.mongodb.net/instaboost?retryWrites=true&w=majority&appName=Cluster0
TELEGRAM_BOT_TOKEN=7275717734:AAE6bq0Mdypn_wQL6F1wpphzEtLAco3_B3Y
TELEGRAM_CHAT_ID=6881713177
SESSION_SECRET=YJ!*NpP1@l|R5Iy)rG<y"-XyDf}#xn
JWT_SECRET=YJ!*NpP1@l|R5Iy)rG<y"-XyDf}#xn
```

## Step 2: Build & Start Commands
- **Build Command:** `npm install && npm run build`
- **Start Command:** `NODE_ENV=production tsx server/index.ts`

## Step 3: Service Configuration
- **Environment:** Node
- **Plan:** Free (or paid)
- **Auto-Deploy:** Yes
- **Health Check Path:** `/api/health`

## Step 4: Important Notes
- The application uses MongoDB exclusively (no PostgreSQL)
- All 14 Instagram services are pre-configured with your pricing
- Health check endpoint is configured for proper deployment monitoring
- Session storage uses MongoDB for production stability

## Troubleshooting
If you encounter deployment issues:
1. Check the build logs for npm installation errors
2. Verify all environment variables are set correctly
3. Ensure the health check endpoint returns 200 status
4. Monitor the application logs for MongoDB connection status

## Services Available
✅ Instagram Followers (Indian, USA, HQ Non Drop, Global Mix)
✅ Instagram Likes (Bot, Non Drop, Girl Accounts, Indian Real)
✅ Instagram Views (Video Fast, Story Premium, Reel HQ)
✅ Instagram Comments (Random, Custom Text, Emoji Only)

Total: 14 services with your custom pricing structure