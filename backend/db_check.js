require('dotenv').config();
const mongoose = require('mongoose');

const mongoUri = process.env.MONGO_URI;

async function checkDb() {
  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB.');

    // Get a list of businesses
    const businesses = await mongoose.connection.db.collection('businesses').find({}).toArray();
    console.log('\n--- BUSINESSES ---');
    console.log(businesses.map(b => ({ _id: b._id, id: b.id, name: b.name })));

    // Get product orders
    const productOrders = await mongoose.connection.db.collection('productorders').find({}).toArray();
    console.log('\n--- PRODUCT ORDERS ---');
    console.log(productOrders);

    // Get service submissions
    const submissions = await mongoose.connection.db.collection('serviceformsubmissions').find({}).toArray();
    console.log('\n--- SERVICE SUBMISSIONS ---');
    console.log(submissions);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkDb();
