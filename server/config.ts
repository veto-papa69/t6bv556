// Telegram Bot Configuration
export const TELEGRAM_CONFIG = {
  BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || "",
  CHAT_ID: process.env.TELEGRAM_CHAT_ID || "",
  WEBHOOK_SECRET: process.env.TELEGRAM_WEBHOOK_SECRET || ""
};

// Admin Panel Configuration - Super Secure with Telegram Approval
export const ADMIN_CONFIG = {
  USERNAME: process.env.ADMIN_USERNAME || "admin",
  PASSWORD: process.env.ADMIN_PASSWORD || "admin123",
  SECRET_TOKEN: process.env.ADMIN_SECRET_TOKEN || "admin_secret_token_2024",
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || "",
  TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID || "",
  // Enable Telegram approval - if false, direct login allowed
  REQUIRE_TELEGRAM_APPROVAL: process.env.REQUIRE_TELEGRAM_APPROVAL !== "false",
};

// App Configuration - Production Ready
export const APP_CONFIG = {
  SESSION_SECRET: process.env.SESSION_SECRET || "fallback-dev-secret-change-in-production",
  PORT: parseInt(process.env.PORT || "5000"),
  NODE_ENV: process.env.NODE_ENV || "development",
  DATABASE_URL: process.env.DATABASE_URL || ""
};
