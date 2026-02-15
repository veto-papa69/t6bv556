// Production configuration - forces MongoDB usage only
export const PRODUCTION_CONFIG = {
  // Force MongoDB connection in production
  FORCE_MONGODB: true,
  
  // MongoDB connection string for production
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb+srv://instaboost_user:uX1YzKjiOETNhyYj@cluster0.tolxjiz.mongodb.net/instaboost?retryWrites=true&w=majority&appName=Cluster0',
  
  // Disable PostgreSQL in production
  DISABLE_POSTGRES: true,
  
  // Session configuration for production
  SESSION_SECRET: process.env.SESSION_SECRET || process.env.JWT_SECRET || 'YJ!*NpP1@l|R5Iy)rG<y"-XyDf}#xn',
  
  // Telegram configuration
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
  TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID,
  
  // Production environment check
  isProduction: () => process.env.NODE_ENV === 'production' || process.env.RENDER_EXTERNAL_URL,
};

// Override DATABASE_URL to prevent PostgreSQL connection attempts
if (PRODUCTION_CONFIG.isProduction() && PRODUCTION_CONFIG.FORCE_MONGODB) {
  // Remove any PostgreSQL connection strings
  delete process.env.DATABASE_URL;
  
  // Ensure MongoDB URI is set
  process.env.MONGODB_URI = PRODUCTION_CONFIG.MONGODB_URI;
  
  console.log('🚀 Production mode: Using MongoDB exclusively');
  console.log('❌ PostgreSQL disabled in production');
}