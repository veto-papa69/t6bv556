import { 
  User, 
  Order, 
  Payment, 
  Service, 
  LoginLog,
  Referral,
  connectMongoDB,
  type IUser,
  type IOrder,
  type IPayment,
  type IService,
  type ILoginLog
} from "./mongodb";

export interface IMongoStorage {
  // Database initialization
  initializeDatabase(): Promise<void>;

  // User operations
  getUser(id: string): Promise<IUser | null>;
  getUserByUsername(username: string): Promise<IUser | null>;
  getUserByInstagramUsername(username: string): Promise<IUser | null>;
  createUser(userData: Omit<IUser, '_id' | 'createdAt'>): Promise<IUser>;
  updateUserBalance(userId: string, newBalance: number): Promise<void>;
  markBonusClaimed(userId: string): Promise<void>;

  // Order operations
  createOrder(orderData: Omit<IOrder, '_id' | 'createdAt'>): Promise<IOrder>;
  getUserOrders(userId: string): Promise<IOrder[]>;

  // Payment operations
  createPayment(paymentData: Omit<IPayment, '_id' | 'createdAt'>): Promise<IPayment>;
  getUserPayments(userId: string): Promise<IPayment[]>;
  getPayment(id: string): Promise<IPayment | null>;
  updatePaymentStatus(id: string, status: string): Promise<void>;

  // Service operations
  getServices(): Promise<IService[]>;
  initializeServices(): Promise<void>;

  // Login tracking operations
  logUserLogin(userId: string, instagramUsername: string): Promise<number>;
  getUserLoginCount(userId: string): Promise<number>;

  // Referral methods
  getUserReferralData(userId: string): Promise<any>;
  getReferralCount(userId: string): Promise<number>;
  createReferral(referralData: any): Promise<any>;
  getReferralByUserId(userId: string): Promise<any>;
  getReferralByCode(referralCode: string): Promise<any>;
  createReferralRecord(referrerId: string, referredUserId: string, referralCode: string): Promise<void>;
  updateUserDiscountStatus(userId: string, hasClaimedDiscount: boolean): Promise<void>;
}

export class MongoDBStorage implements IMongoStorage {
  async initializeDatabase(): Promise<void> {
    try {
      console.log('🔄 Initializing MongoDB database...');
      await connectMongoDB();
      console.log('✅ MongoDB database initialization completed');
    } catch (error) {
      console.error('❌ MongoDB database initialization failed:', error);
      throw error;
    }
  }

  async getUser(id: string): Promise<IUser | null> {
    try {
      const user = await User.findById(id).lean();
      if (!user) return null;
      return {
        ...user,
        _id: user._id.toString()
      } as IUser;
    } catch (error) {
      console.error('Error getting user by ID:', error);
      return null;
    }
  }

  async getUserByUsername(username: string): Promise<IUser | null> {
    try {
      const user = await User.findOne({ instagramUsername: username }).lean();
      if (!user) return null;
      return {
        ...user,
        _id: user._id.toString()
      } as IUser;
    } catch (error) {
      console.error('Error getting user by username:', error);
      return null;
    }
  }

  async getUserByInstagramUsername(username: string): Promise<IUser | null> {
    try {
      const user = await User.findOne({ instagramUsername: username }).lean();
      if (!user) return null;
      return {
        ...user,
        _id: user._id.toString()
      } as IUser;
    } catch (error) {
      console.error('Error getting user by Instagram username:', error);
      return null;
    }
  }

  async createUser(userData: Omit<IUser, '_id' | 'createdAt'>): Promise<IUser> {
    try {
      const user = new User(userData);
      const savedUser = await user.save();
      return {
        ...savedUser.toObject(),
        _id: savedUser._id.toString()
      } as IUser;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async updateUserBalance(userId: string, newBalance: number): Promise<void> {
    try {
      await User.findByIdAndUpdate(userId, { walletBalance: newBalance });
    } catch (error) {
      console.error('Error updating user balance:', error);
      throw error;
    }
  }

  async markBonusClaimed(userId: string): Promise<void> {
    try {
      await User.findByIdAndUpdate(userId, { bonusClaimed: true });
    } catch (error) {
      console.error('Error marking bonus claimed:', error);
      throw error;
    }
  }

  async createOrder(orderData: Omit<IOrder, '_id' | 'createdAt'>): Promise<IOrder> {
    try {
      const order = new Order(orderData);
      const savedOrder = await order.save();
      return savedOrder.toObject() as IOrder;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  async getUserOrders(userId: string): Promise<IOrder[]> {
    try {
      const orders = await Order.find({ userId }).sort({ createdAt: -1 }).lean();
      return orders as IOrder[];
    } catch (error) {
      console.error('Error getting user orders:', error);
      return [];
    }
  }

  async createPayment(paymentData: Omit<IPayment, '_id' | 'createdAt'>): Promise<IPayment> {
    try {
      const payment = new Payment(paymentData);
      const savedPayment = await payment.save();
      return savedPayment.toObject() as IPayment;
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  }

  async getUserPayments(userId: string): Promise<IPayment[]> {
    try {
      const payments = await Payment.find({ userId }).sort({ createdAt: -1 }).lean();
      return payments as IPayment[];
    } catch (error) {
      console.error('Error getting user payments:', error);
      return [];
    }
  }

  async getPayment(id: string): Promise<IPayment | null> {
    try {
      const payment = await Payment.findById(id).lean();
      return payment as IPayment | null;
    } catch (error) {
      console.error('Error getting payment:', error);
      return null;
    }
  }

  async updatePaymentStatus(id: string, status: string): Promise<void> {
    try {
      await Payment.findByIdAndUpdate(id, { status });
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw error;
    }
  }

  async getServices(): Promise<IService[]> {
    try {
      const services = await Service.find({ active: true }).sort({ category: 1, name: 1 }).lean();
      return services as IService[];
    } catch (error) {
      console.error('Error getting services:', error);
      return [];
    }
  }

  async initializeServices(): Promise<void> {
    try {
      // Services are automatically initialized in the MongoDB connection
      console.log('✅ Services initialization completed (handled by MongoDB connection)');
    } catch (error) {
      console.error('Error initializing services:', error);
    }
  }

  async logUserLogin(userId: string, instagramUsername: string): Promise<number> {
    try {
      const currentCount = await this.getUserLoginCount(userId);
      const newCount = currentCount + 1;

      const loginLog = new LoginLog({
        userId,
        instagramUsername,
        loginCount: newCount
      });

      await loginLog.save();
      return newCount;
    } catch (error) {
      console.error('Error logging user login:', error);
      return 1;
    }
  }

  async getUserLoginCount(userId: string): Promise<number> {
    try {
      const count = await LoginLog.countDocuments({ userId });
      return count;
    } catch (error) {
      console.error('Error getting user login count:', error);
      return 0;
    }
  }

  async createReferral(data: any) {
    try {
      console.log('🎯 Creating referral with data:', data);

      // Convert userId to string
      const userIdStr = data.userId.toString();
      let referralCode = data.referralCode;

      // Check if referral code already exists and generate unique one if needed
      let attempts = 0;
      while (attempts < 5) {
        const existingReferral = await Referral.findOne({ referralCode });
        if (!existingReferral) {
          break; // Code is unique
        }
        
        console.log('⚠️ Referral code already exists, generating new one');
        const timestamp = Date.now().toString(36).toUpperCase();
        const randomSuffix = Math.random().toString(36).substr(2, 4).toUpperCase();
        referralCode = `REF-${data.referralCode.split('-')[1] || userIdStr}-${timestamp}-${randomSuffix}`;
        attempts++;
      }

      const referral = new Referral({
        userId: userIdStr,
        referralCode: referralCode,
        isCompleted: data.isCompleted || false,
        createdAt: new Date()
      });

      const savedReferral = await referral.save();
      console.log('✅ Referral created successfully:', savedReferral);

      return {
        id: savedReferral._id.toString(),
        userId: savedReferral.userId,
        referralCode: savedReferral.referralCode,
        isCompleted: savedReferral.isCompleted || false
      };
    } catch (error) {
      console.error('❌ Error creating referral:', error);
      
      // Return a fallback result instead of throwing
      return {
        id: 'error',
        userId: data.userId.toString(),
        referralCode: data.referralCode || `REF-ERROR-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        isCompleted: false
      };
    }
  }

  async getReferralByUserId(userId: string) {
    try {
      console.log('📋 Getting referral by user ID:', userId);

      // Find the user's main referral code (where they are the referrer, not the referred)
      const referral = await Referral.findOne({ 
        userId: userId,
        referredUserId: { $exists: false }
      }).lean();

      console.log('📋 Found referral record:', referral);

      return referral ? {
        id: referral._id.toString(),
        userId: referral.userId.toString(),
        referralCode: referral.referralCode,
        referredUserId: referral.referredUserId ? referral.referredUserId.toString() : null,
        isCompleted: referral.isCompleted || false
      } : null;
    } catch (error) {
      console.error('❌ Error getting referral by user ID:', error);
      return null;
    }
  }

  async getUserReferralData(userId: string) {
    try {
      console.log('📋 Getting referral data for user:', userId);

      // Convert ObjectId to string if needed
      const userIdStr = userId.toString();

      // First check if user has any referral code (as referrer) - only check for main referral code, not used ones
      let referral = await Referral.findOne({ 
        userId: userIdStr, 
        referredUserId: { $exists: false }
      }).lean();

      console.log('📋 Found existing referral:', referral);

      if (!referral) {
        // If no referral found, create one automatically
        const user = await this.getUser(userId);
        if (user) {
          const referralCode = `REF-${user.uid}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
          console.log('🎯 Creating new referral code:', referralCode);

          try {
            const newReferral = new Referral({
              userId: userIdStr,
              referralCode,
              isCompleted: false,
              createdAt: new Date()
            });
            await newReferral.save();
            referral = newReferral.toObject();
            console.log('✅ New referral created successfully:', referral);
          } catch (saveError) {
            console.error('❌ Error saving new referral:', saveError);
            // Return a basic structure even if save fails
            referral = {
              _id: 'temp',
              userId: userIdStr,
              referralCode,
              isCompleted: false
            };
          }
        }
      }

      // Get count of referred users - count all successful referrals where this user was the referrer
      const referredCount = await Referral.countDocuments({
        userId: userIdStr,
        referredUserId: { $exists: true, $ne: null },
        isCompleted: true
      });

      const result = referral ? {
        id: referral._id ? referral._id.toString() : 'temp',
        referralCode: referral.referralCode,
        referredCount: referredCount,
        totalEarnings: (referredCount * 5).toFixed(2) // $5 per referral
      } : {
        id: '',
        referralCode: 'Code not available',
        referredCount: 0,
        totalEarnings: '0.00'
      };

      console.log('📋 Final referral data:', result);
      return result;
    } catch (error) {
      console.error('❌ Error getting user referral data:', error);
      return {
        id: '',
        referralCode: 'Code not available',
        referredCount: 0,
        totalEarnings: '0.00'
      };
    }
  }

  async getReferralCount(userId: string): Promise<number> {
    try {
      const userIdStr = userId.toString();
      
      // Count all successful referrals where this user was the referrer
      const count = await Referral.countDocuments({
        userId: userIdStr,
        referredUserId: { $exists: true, $ne: null },
        isCompleted: true
      });

      console.log(`📊 Referral count for user ${userId}:`, count);
      return count;
    } catch (error) {
      console.error('❌ Error getting referral count:', error);
      return 0;
    }
  }

  async getReferralByCode(referralCode: string): Promise<any> {
    try {
      console.log('🔍 Looking for referral code:', referralCode);

      // Only find main referral codes (not used ones) and that are valid format
      const referral = await Referral.findOne({ 
        referralCode,
        referredUserId: { $exists: false }
      }).lean();

      console.log('📋 Found referral:', referral);

      return referral ? {
        id: referral._id.toString(),
        userId: referral.userId.toString(),
        referralCode: referral.referralCode,
        referredUserId: referral.referredUserId ? referral.referredUserId.toString() : null,
        isCompleted: referral.isCompleted
      } : null;
    } catch (error) {
      console.error('Error getting referral by code:', error);
      return null;
    }
  }

  async createReferralRecord(referrerId: string, referredUserId: string, referralCode: string): Promise<void> {
    try {
      console.log('🎯 Creating referral record:', { referrerId, referredUserId, referralCode });

      // Create a new referral record for the successful referral
      const referral = new Referral({
        userId: referrerId,
        referralCode: `USED-${referralCode}-${Date.now()}`, // Create unique code for this referral instance
        referredUserId,
        isCompleted: true
      });
      await referral.save();

      console.log('✅ Referral record created successfully');
    } catch (error) {
      console.error('❌ Error creating referral record:', error);
      throw error;
    }
  }

  async updateUserDiscountStatus(userId: string, hasClaimedDiscount: boolean): Promise<void> {
    try {
      await User.findByIdAndUpdate(userId, { hasClaimedDiscount });
      console.log(`✅ Updated discount status for user ${userId} to ${hasClaimedDiscount}`);
    } catch (error) {
      console.error('❌ Error updating user discount status:', error);
      throw error;
    }
  }
}

export const mongoStorage = new MongoDBStorage();
