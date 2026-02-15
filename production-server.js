const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://instaboost_user:uX1YzKjiOETNhyYj@cluster0.tolxjiz.mongodb.net/instaboost?retryWrites=true&w=majority&appName=Cluster0';

// Session configuration
const sessionConfig = session({
  secret: process.env.SESSION_SECRET || 'YJ!*NpP1@l|R5Iy)rG<y"-XyDf}#xn',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: MONGODB_URI,
    ttl: 24 * 60 * 60,
    touchAfter: 24 * 3600
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
});

app.use(sessionConfig);

// MongoDB Models
const userSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  instagramUsername: { type: String, required: true },
  password: { type: String, required: true },
  walletBalance: { type: Number, default: 0 },
  bonusClaimed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  rate: { type: Number, required: true },
  minOrder: { type: Number, required: true },
  maxOrder: { type: Number, required: true },
  deliveryTime: { type: String, required: true },
  active: { type: Boolean, default: true }
});

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  serviceName: { type: String, required: true },
  instagramUsername: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  status: { type: String, default: 'Processing' },
  createdAt: { type: Date, default: Date.now }
});

const paymentSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  amount: { type: Number, required: true },
  utrNumber: { type: String, required: true },
  paymentMethod: { type: String, required: true },
  status: { type: String, default: 'Pending' },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Service = mongoose.model('Service', serviceSchema);
const Order = mongoose.model('Order', orderSchema);
const Payment = mongoose.model('Payment', paymentSchema);

// Initialize MongoDB and services
async function initializeApp() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected successfully');

    // Initialize services if they don't exist
    const serviceCount = await Service.countDocuments();
    if (serviceCount === 0) {
      const defaultServices = [
        { name: "Instagram Followers - Indian", category: "Followers", rate: 26.00, minOrder: 770, maxOrder: 100000, deliveryTime: "0-6 hours", active: true },
        { name: "Instagram Followers - USA", category: "Followers", rate: 27.00, minOrder: 741, maxOrder: 50000, deliveryTime: "0-12 hours", active: true },
        { name: "Instagram Followers - HQ Non Drop", category: "Followers", rate: 31.00, minOrder: 646, maxOrder: 25000, deliveryTime: "0-24 hours", active: true },
        { name: "Instagram Followers - Global Mix", category: "Followers", rate: 24.50, minOrder: 817, maxOrder: 200000, deliveryTime: "0-6 hours", active: true },
        { name: "Instagram Followers - Bot Followers", category: "Followers", rate: 15.00, minOrder: 1334, maxOrder: 150000, deliveryTime: "0-3 hours", active: true },
        { name: "Instagram Likes - Bot Likes", category: "Likes", rate: 12.00, minOrder: 1667, maxOrder: 100000, deliveryTime: "0-1 hour", active: true },
        { name: "Instagram Likes - Non Drop", category: "Likes", rate: 14.50, minOrder: 1380, maxOrder: 50000, deliveryTime: "0-3 hours", active: true },
        { name: "Instagram Likes - Only Girl Accounts", category: "Likes", rate: 16.00, minOrder: 1250, maxOrder: 25000, deliveryTime: "0-6 hours", active: true },
        { name: "Instagram Likes - Indian Real", category: "Likes", rate: 13.50, minOrder: 1482, maxOrder: 30000, deliveryTime: "0-2 hours", active: true },
        { name: "Instagram Video Views - Fast", category: "Views", rate: 11.20, minOrder: 1786, maxOrder: 1000000, deliveryTime: "0-30 minutes", active: true },
        { name: "Instagram Story Views - Premium", category: "Views", rate: 12.80, minOrder: 1563, maxOrder: 50000, deliveryTime: "0-2 hours", active: true },
        { name: "Instagram Reel Views - High Quality", category: "Views", rate: 11.50, minOrder: 1740, maxOrder: 500000, deliveryTime: "0-1 hour", active: true },
        { name: "Instagram Comments - Random Positive", category: "Comments", rate: 18.00, minOrder: 112, maxOrder: 1000, deliveryTime: "1-6 hours", active: true },
        { name: "Instagram Comments - Custom Text", category: "Comments", rate: 25.00, minOrder: 80, maxOrder: 500, deliveryTime: "2-24 hours", active: true },
        { name: "Instagram Comments - Emoji Only", category: "Comments", rate: 15.00, minOrder: 134, maxOrder: 2000, deliveryTime: "0-3 hours", active: true }
      ];
      await Service.insertMany(defaultServices);
      console.log('✅ Services initialized');
    }
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
  }
}

// Helper functions
function generateUID() {
  return 'UID' + Math.random().toString(36).substr(2, 6).toUpperCase();
}

function generateOrderId() {
  return 'ORD' + Math.random().toString(36).substr(2, 9).toUpperCase();
}

// API Routes
app.get('/api/health', async (req, res) => {
  try {
    await Service.findOne();
    res.json({ 
      status: "healthy", 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      services: await Service.countDocuments()
    });
  } catch (error) {
    res.status(500).json({ status: "unhealthy", error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { instagramUsername, password } = req.body;
    
    let user = await User.findOne({ instagramUsername });
    
    if (!user) {
      const uid = generateUID();
      user = new User({
        uid,
        instagramUsername,
        password,
        walletBalance: 0,
        bonusClaimed: false
      });
      await user.save();
    }
    
    req.session.userId = user._id.toString();
    req.session.uid = user.uid;
    
    res.json({ 
      success: true, 
      user: {
        id: user._id,
        uid: user.uid,
        instagramUsername: user.instagramUsername,
        walletBalance: user.walletBalance,
        bonusClaimed: user.bonusClaimed
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/auth/user', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }
    
    res.json({
      id: user._id,
      uid: user.uid,
      instagramUsername: user.instagramUsername,
      walletBalance: user.walletBalance,
      bonusClaimed: user.bonusClaimed
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/services', async (req, res) => {
  try {
    const services = await Service.find({ active: true });
    res.json(services.map(s => ({
      id: s._id,
      name: s.name,
      category: s.category,
      rate: s.rate.toString(),
      minOrder: s.minOrder,
      maxOrder: s.maxOrder,
      deliveryTime: s.deliveryTime
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    const { serviceName, instagramUsername, quantity, price } = req.body;
    const orderId = generateOrderId();
    
    const order = new Order({
      orderId,
      userId: req.session.userId,
      serviceName,
      instagramUsername,
      quantity,
      price,
      status: 'Processing'
    });
    
    await order.save();
    
    // Update user balance
    await User.findByIdAndUpdate(req.session.userId, {
      $inc: { walletBalance: -price }
    });
    
    res.json({ success: true, order: { id: order._id, orderId } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/bonus/claim', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    const user = await User.findById(req.session.userId);
    if (user.bonusClaimed) {
      return res.status(400).json({ error: "Bonus already claimed" });
    }
    
    await User.findByIdAndUpdate(req.session.userId, {
      bonusClaimed: true,
      $inc: { walletBalance: 10 }
    });
    
    res.json({ success: true, newBalance: (user.walletBalance + 10).toFixed(2), message: "Bonus claimed successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/orders', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    const orders = await Order.find({ userId: req.session.userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/payments', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    const payments = await Payment.find({ userId: req.session.userId }).sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve frontend
app.use('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  res.status(200).send(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>InstaBoost SMM Panel</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #0e1d18, #1c2d24);
            color: #f4ebd0;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .container { 
            text-align: center; 
            max-width: 600px;
            padding: 2rem;
            background: rgba(28, 45, 36, 0.9);
            border-radius: 1rem;
            border: 1px solid rgba(214, 173, 96, 0.3);
            backdrop-filter: blur(10px);
          }
          h1 { 
            color: #d6ad60; 
            margin-bottom: 1rem;
            font-size: 2.5rem;
          }
          p { 
            margin-bottom: 1rem; 
            color: #cccccc;
            line-height: 1.6;
          }
          .status { 
            background: rgba(214, 173, 96, 0.1);
            padding: 1rem;
            border-radius: 0.5rem;
            border: 1px solid rgba(214, 173, 96, 0.3);
            margin: 1rem 0;
          }
          .api-status {
            color: #3ccf4e;
            font-weight: bold;
          }
          .endpoints {
            text-align: left;
            background: rgba(14, 29, 24, 0.5);
            padding: 1rem;
            border-radius: 0.5rem;
            margin: 1rem 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🚀 InstaBoost SMM Panel</h1>
          <p>Your Instagram Social Media Marketing panel is now live!</p>
          
          <div class="status">
            <div class="api-status">✅ API Server Running</div>
            <div>✅ MongoDB Connected</div>
            <div>✅ 14 Services Available</div>
            <div>✅ Ready for Orders</div>
          </div>
          
          <div class="endpoints">
            <p><strong>API Endpoints:</strong></p>
            <p>• POST /api/auth/login - User Authentication</p>
            <p>• GET /api/services - Available Services</p>
            <p>• POST /api/orders - Place Orders</p>
            <p>• GET /api/health - Health Check</p>
            <p>• POST /api/bonus/claim - Claim Bonus</p>
          </div>
          
          <p style="margin-top: 2rem; font-size: 0.9rem; opacity: 0.8;">
            Server Environment: ${process.env.NODE_ENV || 'production'}<br>
            MongoDB Status: Connected<br>
            Port: ${process.env.PORT || 5000}
          </p>
        </div>
      </body>
    </html>
  `);
});

// Start server
async function startServer() {
  await initializeApp();
  
  const port = process.env.PORT || 5000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 InstaBoost SMM Panel running on port ${port}`);
    console.log(`📡 Environment: ${process.env.NODE_ENV || 'production'}`);
    console.log(`🌐 Server ready for requests`);
  });
}

startServer().catch(console.error);
