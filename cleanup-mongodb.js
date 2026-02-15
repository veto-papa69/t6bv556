import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://instaboost_user:uX1YzKjiOETNhyYj@cluster0.tolxjiz.mongodb.net/instaboost?retryWrites=true&w=majority&appName=Cluster0';

async function cleanupDatabase() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Drop problematic collections to fix index issues
    const collections = ['users', 'orders', 'payments', 'services', 'loginlogs'];
    
    for (const collectionName of collections) {
      try {
        await mongoose.connection.db.collection(collectionName).drop();
        console.log(`✅ Dropped collection: ${collectionName}`);
      } catch (error) {
        console.log(`⚠️ Collection ${collectionName} doesn't exist or already dropped`);
      }
    }

    console.log('🔧 Recreating collections with proper schemas...');
    
    // Create clean schemas
    const userSchema = new mongoose.Schema({
      uid: { type: String, required: true, unique: true },
      instagramUsername: { type: String, required: true, unique: true },
      password: { type: String, required: true },
      walletBalance: { type: Number, default: 0 },
      bonusClaimed: { type: Boolean, default: false }
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

    // Create models
    const User = mongoose.model('User', userSchema);
    const Service = mongoose.model('Service', serviceSchema);

    // Create default service
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
    console.log('✅ Created default service');

    console.log('🎉 Database cleanup completed successfully');
    process.exit(0);

  } catch (error) {
    console.error('❌ Database cleanup failed:', error);
    process.exit(1);
  }
}

cleanupDatabase();