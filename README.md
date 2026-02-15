# SMM Panel - Social Media Marketing Platform

Professional SMM panel with React frontend and Node.js backend for social media marketing services.

## Features

- 🚀 Modern React.js frontend with responsive design
- ⚡ Fast Node.js/Express.js backend
- 🔐 Secure user authentication and wallet system
- 💰 Payment processing with UPI integration
- 📱 Telegram notifications for orders
- 🎯 Service ordering and management
- 📊 User dashboard with order tracking

## Quick Deployment on Render (Free)

### Step 1: GitHub Upload
1. Create new repository on GitHub
2. Upload all project files (drag & drop)
3. Commit with message: "Initial SMM Panel upload"

### Step 2: Database Setup
1. Create free PostgreSQL database on [Neon.tech](https://neon.tech)
2. Copy the connection string (postgres://...)

### Step 3: Deploy on Render
1. Connect GitHub repository to [Render.com](https://render.com)
2. Select "Web Service" 
3. Configure build command: `npm install && npm run build`
4. Configure start command: `npm run start`
5. Add environment variables (see below)

## Required Environment Variables

```bash
NODE_ENV=production
DATABASE_URL=your_postgres_connection_string
SESSION_SECRET=your_random_32_character_secret
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_CHAT_ID=your_telegram_chat_id
PORT=10000
```

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Set up database:
```bash
npm run db:push
```

3. Start development server:
```bash
npm run dev
```

## Production Build

```bash
npm run build
npm run start
```

## File Structure

```
├── client/          # React frontend
├── server/          # Express backend
├── shared/          # Shared types and schemas
├── render.yaml      # Render deployment config
├── DEPLOYMENT_GUIDE.md # Detailed deployment steps
└── package.json     # Dependencies and scripts
```

## Technology Stack

- **Frontend**: React.js, TypeScript, Tailwind CSS, Vite
- **Backend**: Node.js, Express.js, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Express Session
- **UI Components**: Radix UI, shadcn/ui
- **State Management**: TanStack Query

## Support

For detailed deployment instructions, see `DEPLOYMENT_GUIDE.md`