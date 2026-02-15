import mongoose from 'mongoose';

// This script fixes deployment issues for Render by ensuring MongoDB connection works properly
async function fixRenderDeployment() {
  try {
    console.log('🔄 Testing MongoDB connection for Render deployment...');
    
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://instaboost_user:uX1YzKjiOETNhyYj@cluster0.tolxjiz.mongodb.net/instaboost?retryWrites=true&w=majority&appName=Cluster0';
    
    // Test connection with production settings
    await mongoose.connect(mongoUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: false
    });
    
    console.log('✅ MongoDB connection successful for production');

    // Test essential collections
    const collections = ['users', 'services', 'orders', 'payments'];
    for (const collection of collections) {
      const count = await mongoose.connection.db.collection(collection).countDocuments();
      console.log(`✅ ${collection} collection: ${count} documents`);
    }

    // Verify services are properly configured
    const Service = mongoose.model('Service', new mongoose.Schema({
      name: String,
      category: String,
      rate: Number,
      minOrder: Number,
      maxOrder: Number,
      deliveryTime: String,
      active: Boolean
    }));

    const serviceCount = await Service.countDocuments();
    console.log(`✅ Total services available: ${serviceCount}`);

    if (serviceCount < 10) {
      console.log('⚠️ Warning: Low service count, may need to refresh services');
    }

    await mongoose.disconnect();
    console.log('✅ MongoDB connection test completed successfully');
    console.log('🚀 Application is ready for Render deployment');

  } catch (error) {
    console.error('❌ MongoDB connection test failed:', error);
    console.error('🔧 Check your MONGODB_URI environment variable');
    process.exit(1);
  }
}

fixRenderDeployment();