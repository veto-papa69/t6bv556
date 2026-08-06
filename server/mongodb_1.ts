import mongoose from 'mongoose';

// MongoDB connection with your actual credentials
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://instaboost_user:uX1YzKjiOETNhyYj@cluster0.tolxjiz.mongodb.net/instaboost?retryWrites=true&w=majority&appName=Cluster0';

// User Schema
const userSchema = new mongoose.Schema({
  uid: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  instagramUsername: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  password: {
    type: String,
    required: true
  },
  walletBalance: {
    type: Number,
    default: 0,
    min: 0
  },
  bonusClaimed: {
    type: Boolean,
    default: false
  },
  hasClaimedDiscount: { type: Boolean, default: false },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Order Schema
const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  serviceName: {
    type: String,
    required: true
  },
  instagramUsername: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['Processing', 'Completed', 'Failed', 'Pending'],
    default: 'Processing'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Payment Schema
const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  utrNumber: {
    type: String,
    required: true,
    unique: true
  },
  paymentMethod: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Service Schema
const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    index: true
  },
  rate: {
    type: Number,
    required: true,
    min: 0
  },
  minOrder: {
    type: Number,
    required: true,
    min: 1
  },
  maxOrder: {
    type: Number,
    required: true,
    min: 1
  },
  deliveryTime: {
    type: String,
    required: true
  },
  active: {
    type: Boolean,
    default: true,
    index: true
  }
});

// Login Log Schema
const loginLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  instagramUsername: {
    type: String,
    required: true
  },
  loginCount: {
    type: Number,
    required: true,
    min: 1
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Referral Schema
const referralSchema = new mongoose.Schema({
  userId: { 
    type: String, 
    required: true,
    index: true
  },
  referralCode: { 
    type: String, 
    required: true, 
    unique: true 
  },
  referredUserId: { 
    type: String, 
    default: null,
    index: true
  },
  isCompleted: { 
    type: Boolean, 
    default: false,
    index: true
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Create compound indexes for better performance and uniqueness
referralSchema.index({ userId: 1, referredUserId: 1 }, { unique: true });
referralSchema.index({ referralCode: 1 }, { unique: true });

// Ensure referral code uniqueness
referralSchema.pre('save', async function(next) {
  if (this.isNew && this.referralCode) {
    const existing = await this.constructor.findOne({ referralCode: this.referralCode });
    if (existing) {
      const timestamp = Date.now().toString(36).toUpperCase();
      this.referralCode = `${this.referralCode}-${timestamp}`;
    }
  }
  next();
});

const discountRewardSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  hasClaimedDiscount: { type: Boolean, default: false },
  claimedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

// Create Models - Prevent overwrite errors
export const User = mongoose.models.User || mongoose.model('User', userSchema);
export const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
export const Payment = mongoose.models.Payment || mongoose.model('Payment', paymentSchema);
export const Service = mongoose.models.Service || mongoose.model('Service', serviceSchema);
export const LoginLog = mongoose.models.LoginLog || mongoose.model('LoginLog', loginLogSchema);
export const Referral = mongoose.models.Referral || mongoose.model('Referral', referralSchema);
export const DiscountReward = mongoose.models.DiscountReward || mongoose.model('DiscountReward', discountRewardSchema);

// MongoDB Connection Function
export async function connectMongoDB() {
  try {
    if (mongoose.connection.readyState === 0) {
      console.log('🔄 Connecting to MongoDB...');

      await mongoose.connect(MONGODB_URI, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        bufferCommands: false
      });

      console.log('✅ MongoDB connected successfully');
      console.log(`📊 Database: ${mongoose.connection.name}`);

      // Ensure all indexes are created
      try {
        await User.createIndexes();
        await Referral.createIndexes();
        await Order.createIndexes();
        await Payment.createIndexes();
        await Service.createIndexes();
        console.log('✅ Database indexes created successfully');
      } catch (indexError) {
        console.log('⚠️ Index creation warning (this is normal):', indexError.message);
      }

      // Initialize default services if collection is empty
      await initializeServices();

    } else {
      console.log('✅ MongoDB already connected');
    }
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    throw error;
  }
}

// Initialize default services
async function initializeServices() {
  try {
    const serviceCount = await Service.countDocuments();

    if (serviceCount === 0) {
      console.log('🔄 Initializing default services...');

      const defaultServices = [
        // Followers Services (increased by ₹20)
        {
          name: "Instagram Followers - Indian",
          category: "Followers",
          rate: 26.00,
          minOrder: 770,
          maxOrder: 100000,
          deliveryTime: "0-6 hours",
          active: true
        },
        {
          name: "Instagram Followers - USA",
          category: "Followers", 
          rate: 27.00,
          minOrder: 741,
          maxOrder: 50000,
          deliveryTime: "0-12 hours",
          active: true
        },
        {
          name: "Instagram Followers - HQ Non Drop",
          category: "Followers",
          rate: 31.00,
          minOrder: 646,
          maxOrder: 25000,
          deliveryTime: "0-24 hours",
          active: true
        },
        {
          name: "Instagram Followers - Global Mix",
          category: "Followers",
          rate: 24.50,
          minOrder: 817,
          maxOrder: 200000,
          deliveryTime: "0-6 hours", 
          active: true
        },
        {
          name: "Instagram Followers - Bot Followers",
          category: "Followers",
          rate: 15.00,
          minOrder: 1334,
          maxOrder: 150000,
          deliveryTime: "0-3 hours",
          active: true
        },

        // Likes Services (increased by ₹10)
        {
          name: "Instagram Likes - Bot Likes",
          category: "Likes",
          rate: 12.00,
          minOrder: 1667,
          maxOrder: 100000,
          deliveryTime: "0-1 hour",
          active: true
        },
        {
          name: "Instagram Likes - Non Drop",
          category: "Likes",
          rate: 14.50,
          minOrder: 1380,
          maxOrder: 50000,
          deliveryTime: "0-3 hours",
          active: true
        },
        {
          name: "Instagram Likes - Only Girl Accounts",
          category: "Likes",
          rate: 16.00,
          minOrder: 1250,
          maxOrder: 25000,
          deliveryTime: "0-6 hours",
          active: true
        },
        {
          name: "Instagram Likes - Indian Real",
          category: "Likes",
          rate: 13.50,
          minOrder: 1482,
          maxOrder: 30000,
          deliveryTime: "0-2 hours",
          active: true
        },

        // Views Services (increased by ₹10)
        {
          name: "Instagram Video Views - Fast",
          category: "Views",
          rate: 11.20,
          minOrder: 1786,
          maxOrder: 1000000,
          deliveryTime: "0-30 minutes",
          active: true
        },
        {
          name: "Instagram Story Views - Premium",
          category: "Views",
          rate: 12.80,
          minOrder: 1563,
          maxOrder: 50000,
          deliveryTime: "0-2 hours",
          active: true
        },
        {
          name: "Instagram Reel Views - High Quality",
          category: "Views",
          rate: 11.50,
          minOrder: 1740,
          maxOrder: 500000,
          deliveryTime: "0-1 hour",
          active: true
        },

        // Comments Services (increased by ₹10)
        {
          name: "Instagram Comments - Random Positive",
          category: "Comments",
          rate: 18.00,
          minOrder: 112,
          maxOrder: 1000,
          deliveryTime: "1-6 hours",
          active: true
        },
        {
          name: "Instagram Comments - Custom Text",
          category: "Comments",
          rate: 25.00,
          minOrder: 80,
          maxOrder: 500,
          deliveryTime: "2-24 hours",
          active: true
        },
        {
          name: "Instagram Comments - Emoji Only",
          category: "Comments",
          rate: 15.00,
          minOrder: 134,
          maxOrder: 2000,
          deliveryTime: "0-3 hours",
          active: true
        }
      ];

      await Service.insertMany(defaultServices);
      console.log('✅ Default services initialized successfully');
    } else {
      console.log(`✅ Services already exist (${serviceCount} services)`);
    }
  } catch (error) {
    console.error('❌ Failed to initialize services:', error);
  }
}

// Disconnect function
export async function disconnectMongoDB() {
  try {
    await mongoose.disconnect();
    console.log('✅ MongoDB disconnected');
  } catch (error) {
    console.error('❌ MongoDB disconnect error:', error);
  }
}

// Type definitions for better TypeScript support
export interface IUser {
  _id?: string;
  uid: string;
  instagramUsername: string;
  password: string;
  walletBalance: number;
  bonusClaimed: boolean;
  hasClaimedDiscount: boolean;
  createdAt?: Date;
}

export interface IOrder {
  _id?: string;
  orderId: string;
  userId: string;
  serviceName: string;
  instagramUsername: string;
  quantity: number;
  price: number;
  status: 'Processing' | 'Completed' | 'Failed' | 'Pending';
  createdAt?: Date;
}

export interface IPayment {
  _id?: string;
  userId: string;
  amount: number;
  utrNumber: string;
  paymentMethod: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt?: Date;
}

export interface IService {
  _id?: string;
  name: string;
  category: string;
  rate: number;
  minOrder: number;
  maxOrder: number;
  deliveryTime: string;
  active: boolean;
}

export interface ILoginLog {
  _id?: string;
  userId: string;
  instagramUsername: string;
  loginCount: number;
  createdAt?: Date;
}
