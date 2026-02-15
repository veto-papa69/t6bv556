// Production MongoDB configuration - completely replaces PostgreSQL
import mongoose from 'mongoose';
import session from "express-session";
import MongoStore from 'connect-mongo';

// Force MongoDB URI for production
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://instaboost_user:uX1YzKjiOETNhyYj@cluster0.tolxjiz.mongodb.net/instaboost?retryWrites=true&w=majority&appName=Cluster0';

// Production MongoDB schemas
const userSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  instagramUsername: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  walletBalance: { type: Number, default: 0 },
  bonusClaimed: { type: Boolean, default: false }
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
});

const loginLogSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  instagramUsername: { type: String, required: true },
  loginCount: { type: Number, required: true }
}, { timestamps: true });

// Models
const User = mongoose.model('User', userSchema);
const Order = mongoose.model('Order', orderSchema);
const Payment = mongoose.model('Payment', paymentSchema);
const Service = mongoose.model('Service', serviceSchema);
const LoginLog = mongoose.model('LoginLog', loginLogSchema);

// Production MongoDB Storage
export class ProductionMongoStorage {
  private connected = false;

  async initializeDatabase(): Promise<void> {
    try {
      if (!this.connected) {
        console.log('🔄 Connecting to MongoDB (Production)...');
        await mongoose.connect(MONGODB_URI, {
          maxPoolSize: 10,
          serverSelectionTimeoutMS: 5000,
          socketTimeoutMS: 45000,
          bufferCommands: false
        });
        this.connected = true;
        console.log('✅ MongoDB Production connected successfully');
        await this.initializeServices();
      }
    } catch (error) {
      console.error('❌ MongoDB Production connection failed:', error);
      throw error;
    }
  }

  async getUser(id: string): Promise<any> {
    const user = await User.findById(id);
    return user ? { 
      id: user._id.toString(), 
      uid: user.uid, 
      instagramUsername: user.instagramUsername,
      walletBalance: user.walletBalance.toString(),
      bonusClaimed: user.bonusClaimed
    } : null;
  }

  async getUserByInstagramUsername(username: string): Promise<any> {
    const user = await User.findOne({ instagramUsername: username });
    return user ? { 
      id: user._id.toString(), 
      uid: user.uid, 
      instagramUsername: user.instagramUsername,
      walletBalance: user.walletBalance.toString(),
      bonusClaimed: user.bonusClaimed
    } : null;
  }

  async createUser(userData: any): Promise<any> {
    const user = new User(userData);
    const saved = await user.save();
    return { 
      id: saved._id.toString(), 
      uid: saved.uid, 
      instagramUsername: saved.instagramUsername,
      walletBalance: saved.walletBalance.toString(),
      bonusClaimed: saved.bonusClaimed
    };
  }

  async updateUserBalance(userId: string, newBalance: number): Promise<void> {
    await User.findByIdAndUpdate(userId, { walletBalance: newBalance });
  }

  async markBonusClaimed(userId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, { bonusClaimed: true });
  }

  async createOrder(orderData: any): Promise<any> {
    const order = new Order(orderData);
    const saved = await order.save();
    return {
      id: saved._id.toString(),
      orderId: saved.orderId,
      serviceName: saved.serviceName,
      quantity: saved.quantity,
      price: saved.price.toString(),
      status: saved.status,
      createdAt: saved.createdAt.toISOString()
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
      price: order.price.toString(),
      status: order.status,
      createdAt: order.createdAt.toISOString()
    }));
  }

  async createPayment(paymentData: any): Promise<any> {
    const payment = new Payment(paymentData);
    const saved = await payment.save();
    return {
      id: saved._id.toString(),
      amount: saved.amount.toString(),
      utrNumber: saved.utrNumber,
      paymentMethod: saved.paymentMethod,
      status: saved.status,
      createdAt: saved.createdAt.toISOString()
    };
  }

  async getUserPayments(userId: string): Promise<any[]> {
    const payments = await Payment.find({ userId }).sort({ createdAt: -1 });
    return payments.map(payment => ({
      id: payment._id.toString(),
      amount: payment.amount.toString(),
      utrNumber: payment.utrNumber,
      paymentMethod: payment.paymentMethod,
      status: payment.status,
      createdAt: payment.createdAt.toISOString()
    }));
  }

  async getPayment(id: string): Promise<any> {
    const payment = await Payment.findById(id);
    return payment ? {
      id: payment._id.toString(),
      userId: payment.userId,
      amount: payment.amount.toString(),
      utrNumber: payment.utrNumber,
      paymentMethod: payment.paymentMethod,
      status: payment.status,
      createdAt: payment.createdAt.toISOString()
    } : null;
  }

  async updatePaymentStatus(id: string, status: string): Promise<void> {
    await Payment.findByIdAndUpdate(id, { status });
  }

  async getServices(): Promise<any[]> {
    const services = await Service.find({ active: true }).sort({ category: 1, name: 1 });
    return services.map(service => ({
      id: service._id.toString(),
      name: service.name,
      category: service.category,
      rate: service.rate.toString(),
      minOrder: service.minOrder,
      maxOrder: service.maxOrder,
      deliveryTime: service.deliveryTime
    }));
  }

  async initializeServices(): Promise<void> {
    try {
      const existingServices = await Service.countDocuments();
      if (existingServices === 0) {
        console.log('🔧 Initializing default services...');
        const defaultService = new Service({
          name: 'Instagram Followers',
          category: 'Instagram',
          rate: 0.5,
          minOrder: 100,
          maxOrder: 10000,
          deliveryTime: '24 hours',
          active: true
        });
        await defaultService.save();
        console.log('✅ Default services created');
      } else {
        console.log(`✅ Services already exist (${existingServices} services)`);
      }
    } catch (error) {
      console.error('❌ Services initialization failed:', error);
    }
  }

  async logUserLogin(userId: string, instagramUsername: string): Promise<number> {
    const count = await this.getUserLoginCount(userId);
    const newCount = count + 1;
    
    const loginLog = new LoginLog({
      userId,
      instagramUsername,
      loginCount: newCount
    });
    
    await loginLog.save();
    return newCount;
  }

  async getUserLoginCount(userId: string): Promise<number> {
    return await LoginLog.countDocuments({ userId });
  }
}

// Production session configuration with MongoDB store
export function createProductionSessionConfig(mongoUri: string) {
  return session({
    secret: process.env.SESSION_SECRET || process.env.JWT_SECRET || 'YJ!*NpP1@l|R5Iy)rG<y"-XyDf}#xn',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: mongoUri,
      ttl: 24 * 60 * 60, // 1 day
    }),
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    }
  });
}

export const productionStorage = new ProductionMongoStorage();