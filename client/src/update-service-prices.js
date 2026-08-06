const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://instaboost_user:uX1YzKjiOETNhyYj@cluster0.tolxjiz.mongodb.net/instaboost?retryWrites=true&w=majority&appName=Cluster0';

async function updateServicePrices() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('instaboost');
    const servicesCollection = db.collection('services');
    
    // Update followers services - increase by ₹20
    const followersResult = await servicesCollection.updateMany(
      { category: { $regex: /followers/i } },
      { $inc: { rate: 20 } }
    );
    console.log(`Updated ${followersResult.modifiedCount} followers services`);
    
    // Update likes, comments, views services - increase by ₹10
    const otherResult = await servicesCollection.updateMany(
      { 
        category: { 
          $regex: /(likes|comments|views)/i 
        } 
      },
      { $inc: { rate: 10 } }
    );
    console.log(`Updated ${otherResult.modifiedCount} likes/comments/views services`);
    
    // Display updated services
    const updatedServices = await servicesCollection.find({}).toArray();
    console.log('\nUpdated Services:');
    updatedServices.forEach(service => {
      console.log(`${service.name} (${service.category}): ₹${service.rate}`);
    });
    
  } catch (error) {
    console.error('Error updating service prices:', error);
  } finally {
    await client.close();
  }
}

updateServicePrices();
