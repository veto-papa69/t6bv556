
import mongoose from 'mongoose';

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://instaboost_user:uX1YzKjiOETNhyYj@cluster0.tolxjiz.mongodb.net/instaboost?retryWrites=true&w=majority&appName=Cluster0';

// Define schemas (but only if models don't exist)
const userSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true, index: true },
  instagramUsername: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  walletBalance: { type: Number, default: 0 },
  bonusClaimed: { type: Boolean, default: false },
  hasClaimedDiscount: { type: Boolean, default: false }
}, { timestamps: true });

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  serviceName: { type: String, required: true },
  instagramUsername: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  status: { type: String, default: 'Processing' }
}, { timestamps: true });

const paymentSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  amount: { type: Number, required: true },
  utrNumber: { type: String, required: true, unique: true },
  paymentMethod: { type: String, required: true },
  status: { type: String, default: 'Pending' }
}, { timestamps: true });

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  rate: { type: Number, required: true },
  minOrder: { type: Number, required: true },
  maxOrder: { type: Number, required: true },
  deliveryTime: { type: String, required: true },
  active: { type: Boolean, default: true }
}, { timestamps: true });

const loginLogSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  instagramUsername: { type: String, required: true },
  loginCount: { type: Number, required: true }
}, { timestamps: true });

const referralSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  referralCode: { type: String, required: true, unique: true },
  referredUserId: { type: String },
  isCompleted: { type: Boolean, default: false }
}, { timestamps: true });

// Check if models exist before creating them
let User, Order, Payment, Service, LoginLog, Referral;

try {
  User = mongoose.model('User');
} catch {
  User = mongoose.model('User', userSchema);
}

try {
  Order = mongoose.model('Order');
} catch {
  Order = mongoose.model('Order', orderSchema);
}

try {
  Payment = mongoose.model('Payment');
} catch {
  Payment = mongoose.model('Payment', paymentSchema);
}

try {
  Service = mongoose.model('Service');
} catch {
  Service = mongoose.model('Service', serviceSchema);
}

try {
  LoginLog = mongoose.model('LoginLog');
} catch {
  LoginLog = mongoose.model('LoginLog', loginLogSchema);
}

try {
  Referral = mongoose.model('Referral');
} catch {
  Referral = mongoose.model('Referral', referralSchema);
}

// Storage implementation
export class MongoDBStorage {
  private connected = false;

  async initializeDatabase(): Promise<void> {
    try {
      if (!this.connected) {
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI, {
          maxPoolSize: 10,
          serverSelectionTimeoutMS: 5000,
          socketTimeoutMS: 45000,
          bufferCommands: false
        });
        this.connected = true;
        console.log('✅ MongoDB connected successfully');
      }
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error);
      throw error;
    }
  }

  async initializeServices(): Promise<void> {
    try {
      const serviceCount = await Service.countDocuments();
      
      if (serviceCount === 0) {
        console.log('🔄 Initializing default services...');
        
        const defaultServices = [
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
            name: "Instagram Likes - Bot Likes",
            category: "Likes",
            rate: 12.00,
            minOrder: 1667,
            maxOrder: 100000,
            deliveryTime: "0-1 hour",
            active: true
          },
          {
            name: "Instagram Views - Fast",
            category: "Views",
            rate: 11.20,
            minOrder: 1786,
            maxOrder: 1000000,
            deliveryTime: "0-30 minutes",
            active: true
          }
        ];

        await Service.insertMany(defaultServices);
        console.log('✅ Default services initialized');
      }
    } catch (error) {
      console.error('❌ Failed to initialize services:', error);
    }
  }

  async getUser(id: string): Promise<any> {
    const user = await User.findById(id);
    return user ? { 
      id: user._id.toString(), 
      uid: user.uid, 
      instagramUsername: user.instagramUsername,
      walletBalance: user.walletBalance.toString(),
      bonusClaimed: user.bonusClaimed,
      hasClaimedDiscount: user.hasClaimedDiscount || false
    } : null;
  }

  async getUserByInstagramUsername(username: string): Promise<any> {
    const user = await User.findOne({ instagramUsername: username });
    return user ? { 
      id: user._id.toString(), 
      uid: user.uid, 
      instagramUsername: user.instagramUsername,
      walletBalance: user.walletBalance.toString(),
      bonusClaimed: user.bonusClaimed,
      hasClaimedDiscount: user.hasClaimedDiscount || false
    } : null;
  }

  async createUser(userData: any): Promise<any> {
    const user = new User(userData);
    await user.save();
    return { 
      id: user._id.toString(), 
      uid: user.uid, 
      instagramUsername: user.instagramUsername,
      walletBalance: user.walletBalance.toString(),
      bonusClaimed: user.bonusClaimed,
      hasClaimedDiscount: user.hasClaimedDiscount || false
    };
  }

  async updateUserBalance(userId: string, newBalance: number): Promise<void> {
    await User.findByIdAndUpdate(userId, { walletBalance: newBalance });
  }

  async markBonusClaimed(userId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, { bonusClaimed: true });
  }

  async updateUserDiscountStatus(userId: string, hasClaimedDiscount: boolean): Promise<void> {
    await User.findByIdAndUpdate(userId, { hasClaimedDiscount });
  }

  async getServices(): Promise<any[]> {
    const services = await Service.find({ active: true });
    return services.map(service => ({
      id: service._id.toString(),
      name: service.name,
      category: service.category,
      rate: service.rate,
      minOrder: service.minOrder,
      maxOrder: service.maxOrder,
      deliveryTime: service.deliveryTime,
      active: service.active
    }));
  }

  async createOrder(orderData: any): Promise<any> {
    const order = new Order(orderData);
    await order.save();
    return {
      id: order._id.toString(),
      orderId: order.orderId,
      userId: order.userId,
      serviceName: order.serviceName,
      instagramUsername: order.instagramUsername,
      quantity: order.quantity,
      price: order.price,
      status: order.status
    };
  }

  async getUserOrders(userId: string): Promise<any[]> {
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    return orders.map(order => ({
      id: order._id.toString(),
      orderId: order.orderId,
      serviceName: order.serviceName,
      instagramUsername: order.instagramUsername,
      quantity: order.quantity,
      price: order.price,
      status: order.status,
      createdAt: order.createdAt
    }));
  }

  async createPayment(paymentData: any): Promise<any> {
    const payment = new Payment(paymentData);
    await payment.save();
    return {
      id: payment._id.toString(),
      userId: payment.userId,
      amount: payment.amount,
      utrNumber: payment.utrNumber,
      paymentMethod: payment.paymentMethod,
      status: payment.status
    };
  }

  async getUserPayments(userId: string): Promise<any[]> {
    const payments = await Payment.find({ userId }).sort({ createdAt: -1 });
    return payments.map(payment => ({
      id: payment._id.toString(),
      amount: payment.amount,
      utrNumber: payment.utrNumber,
      paymentMethod: payment.paymentMethod,
      status: payment.status,
      createdAt: payment.createdAt
    }));
  }

  async getPayment(id: string): Promise<any> {
    const payment = await Payment.findById(id);
    return payment ? {
      id: payment._id.toString(),
      userId: payment.userId,
      amount: payment.amount,
      utrNumber: payment.utrNumber,
      paymentMethod: payment.paymentMethod,
      status: payment.status
    } : null;
  }

  async updatePaymentStatus(id: string, status: string): Promise<void> {
    await Payment.findByIdAndUpdate(id, { status });
  }

  async logUserLogin(userId: string, instagramUsername: string): Promise<number> {
    const existingLog = await LoginLog.findOne({ userId });
    
    if (existingLog) {
      existingLog.loginCount += 1;
      await existingLog.save();
      return existingLog.loginCount;
    } else {
      const newLog = new LoginLog({
        userId,
        instagramUsername,
        loginCount: 1
      });
      await newLog.save();
      return 1;
    }
  }

  async getUserReferralData(userId: string): Promise<any> {
    const referral = await Referral.findOne({ userId });
    return referral ? {
      id: referral._id.toString(),
      userId: referral.userId,
      referralCode: referral.referralCode,
      referredUserId: referral.referredUserId,
      isCompleted: referral.isCompleted
    } : null;
  }

  async createUserReferral(userId: string, referralCode: string): Promise<any> {
    const referral = new Referral({
      userId,
      referralCode
    });
    await referral.save();
    return {
      id: referral._id.toString(),
      userId: referral.userId,
      referralCode: referral.referralCode,
      referredUserId: referral.referredUserId,
      isCompleted: referral.isCompleted
    };
  }

  async getReferralCount(userId: string): Promise<number> {
    return await Referral.countDocuments({ 
      userId, 
      isCompleted: true
    });
  }

  async getReferralByCode(referralCode: string): Promise<any> {
    const referral = await Referral.findOne({ referralCode });
    return referral ? {
      id: referral._id.toString(),
      userId: referral.userId,
      referralCode: referral.referralCode,
      referredUserId: referral.referredUserId,
      isCompleted: referral.isCompleted
    } : null;
  }

  async getUserByReferralCode(referralCode: string): Promise<any> {
    const referral = await Referral.findOne({ referralCode });
    if (referral) {
      return await this.getUser(referral.userId);
    }
    return null;
  }

  async createReferralRecord(referrerId: string, referredUserId: string, referralCode: string): Promise<void> {
    const referral = new Referral({
      userId: referrerId,
      referralCode,
      referredUserId,
      isCompleted: true
    });
    await referral.save();
  }
}

// Export a singleton instance
export const storage = new MongoDBStorage();
