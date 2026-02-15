import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'your-mongodb-url';

async function updateServicePrices() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db('instaboost');
    const servicesCollection = db.collection('services');

    const followersResult = await servicesCollection.updateMany(
      { category: { $regex: /followers/i } },
      { $inc: { rate: 20 } }
    );
    console.log(`Updated ${followersResult.modifiedCount} followers services`);

    const otherResult = await servicesCollection.updateMany(
      { category: { $regex: /(likes|comments|views)/i } },
      { $inc: { rate: 10 } }
    );
    console.log(`Updated ${otherResult.modifiedCount} likes/comments/views services`);

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

export { updateServicePrices };
