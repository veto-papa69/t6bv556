// Telegram Bot Configuration
export const TELEGRAM_CONFIG = {
  BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || "",
  CHAT_ID: process.env.TELEGRAM_CHAT_ID || "",
  WEBHOOK_SECRET: process.env.TELEGRAM_WEBHOOK_SECRET || ""
};

// App Configuration - Production Ready
export const APP_CONFIG = {
  SESSION_SECRET: process.env.SESSION_SECRET || "fallback-dev-secret-change-in-production",
  PORT: parseInt(process.env.PORT || "5000"),
  NODE_ENV: process.env.NODE_ENV || "development",
  DATABASE_URL: process.env.DATABASE_URL || ""
};