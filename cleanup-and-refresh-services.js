
import mongoose from 'mongoose';

async function cleanupAndRefreshServices() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://instaboost_user:uX1YzKjiOETNhyYj@cluster0.tolxjiz.mongodb.net/instaboost?retryWrites=true&w=majority&appName=Cluster0';
    
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Define the Service schema
    const serviceSchema = new mongoose.Schema({
      name: { type: String, required: true },
      category: { type: String, required: true },
      rate: { type: Number, required: true },
      minOrder: { type: Number, required: true },
      maxOrder: { type: Number, required: true },
      deliveryTime: { type: String, required: true },
      active: { type: Boolean, default: true }
    });

    const Service = mongoose.model('Service', serviceSchema);

    // Clear existing services
    console.log('🔄 Clearing existing services...');
    await Service.deleteMany({});
    console.log('✅ Existing services cleared');

    // Add new services with updated pricing
    console.log('🔄 Adding new services with updated pricing...');
    
    const newServices = [
      // Followers Services (increased by ₹20)
      {
        name: "Instagram Followers - Indian",
        category: "Followers",
        rate: 26.00, // 6 + 20
        minOrder: 770, // ₹20 worth (20*1000/26 = 769.23 rounded up)
        maxOrder: 100000,
        deliveryTime: "0-6 hours",
        active: true
      },
      {
        name: "Instagram Followers - USA",
        category: "Followers", 
        rate: 27.00, // 7 + 20
        minOrder: 741, // ₹20 worth (20*1000/27 = 740.74 rounded up)
        maxOrder: 50000,
        deliveryTime: "0-12 hours",
        active: true
      },
      {
        name: "Instagram Followers - HQ Non Drop",
        category: "Followers",
        rate: 31.00, // 11 + 20
        minOrder: 646, // ₹20 worth (20*1000/31 = 645.16 rounded up)
        maxOrder: 25000,
        deliveryTime: "0-24 hours",
        active: true
      },
      {
        name: "Instagram Followers - Global Mix",
        category: "Followers",
        rate: 24.50, // 4.50 + 20
        minOrder: 817, // ₹20 worth (20*1000/24.5 = 816.32 rounded up)
        maxOrder: 200000,
        deliveryTime: "0-6 hours", 
        active: true
      },
      {
        name: "Instagram Followers - Bot Followers",
        category: "Followers",
        rate: 15.00, // New service at ₹15 per 1k
        minOrder: 1334, // ₹20 worth (20*1000/15 = 1333.33 rounded up)
        maxOrder: 150000,
        deliveryTime: "0-3 hours",
        active: true
      },
      
      // Likes Services (increased by ₹10)
      {
        name: "Instagram Likes - Bot Likes",
        category: "Likes",
        rate: 12.00, // 2 + 10
        minOrder: 1667, // ₹20 worth (20*1000/12 = 1666.67 rounded up)
        maxOrder: 100000,
        deliveryTime: "0-1 hour",
        active: true
      },
      {
        name: "Instagram Likes - Non Drop",
        category: "Likes",
        rate: 14.50, // 4.50 + 10
        minOrder: 1380, // ₹20 worth (20*1000/14.5 = 1379.31 rounded up)
        maxOrder: 50000,
        deliveryTime: "0-3 hours",
        active: true
      },
      {
        name: "Instagram Likes - Only Girl Accounts",
        category: "Likes",
        rate: 16.00, // 6 + 10
        minOrder: 1250, // ₹20 worth (20*1000/16 = 1250)
        maxOrder: 25000,
        deliveryTime: "0-6 hours",
        active: true
      },
      {
        name: "Instagram Likes - Indian Real",
        category: "Likes",
        rate: 13.50, // 3.50 + 10
        minOrder: 1482, // ₹20 worth (20*1000/13.5 = 1481.48 rounded up)
        maxOrder: 30000,
        deliveryTime: "0-2 hours",
        active: true
      },
      
      // Views Services (increased by ₹10)
      {
        name: "Instagram Video Views - Fast",
        category: "Views",
        rate: 11.20, // 1.20 + 10
        minOrder: 1786, // ₹20 worth (20*1000/11.2 = 1785.71 rounded up)
        maxOrder: 1000000,
        deliveryTime: "0-30 minutes",
        active: true
      },
      {
        name: "Instagram Story Views - Premium",
        category: "Views",
        rate: 12.80, // 2.80 + 10
        minOrder: 1563, // ₹20 worth (20*1000/12.8 = 1562.5 rounded up)
        maxOrder: 50000,
        deliveryTime: "0-2 hours",
        active: true
      },
      {
        name: "Instagram Reel Views - High Quality",
        category: "Views",
        rate: 11.50, // 1.50 + 10
        minOrder: 1740, // ₹20 worth (20*1000/11.5 = 1739.13 rounded up)
        maxOrder: 500000,
        deliveryTime: "0-1 hour",
        active: true
      },
      
      // Comments Services (increased by ₹10)
      {
        name: "Instagram Comments - Random Positive",
        category: "Comments",
        rate: 18.00, // 8 + 10
        minOrder: 112, // ₹20 worth (20*1000/18 = 1111.11 rounded up, but minimum 5 comments practical)
        maxOrder: 1000,
        deliveryTime: "1-6 hours",
        active: true
      },
      {
        name: "Instagram Comments - Custom Text",
        category: "Comments",
        rate: 25.00, // 15 + 10
        minOrder: 80, // ₹20 worth (20*1000/25 = 800 rounded up, but minimum 5 comments practical)
        maxOrder: 500,
        deliveryTime: "2-24 hours",
        active: true
      },
      {
        name: "Instagram Comments - Emoji Only",
        category: "Comments",
        rate: 15.00, // 5 + 10
        minOrder: 134, // ₹20 worth (20*1000/15 = 1333.33 rounded up, but minimum 10 comments practical)
        maxOrder: 2000,
        deliveryTime: "0-3 hours",
        active: true
      }
    ];

    await Service.insertMany(newServices);
    console.log(`✅ Successfully added ${newServices.length} services`);

    // Verify the services
    const serviceCount = await Service.countDocuments();
    console.log(`✅ Total services in database: ${serviceCount}`);

    // Display all services with their updated prices
    console.log('\n📊 Updated Services List:');
    const allServices = await Service.find({});
    allServices.forEach(service => {
      console.log(`${service.name}: ₹${service.rate}/1000 (Min: ${service.minOrder}, Max: ${service.maxOrder})`);
    });

    await mongoose.disconnect();
    console.log('✅ Database connection closed');
    console.log('🎉 Services refresh completed successfully!');

  } catch (error) {
    console.error('❌ Error refreshing services:', error);
    process.exit(1);
  }
}

cleanupAndRefreshServices();
