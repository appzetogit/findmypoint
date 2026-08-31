const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/findmypoint';
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    console.error(`⚠️ Atlas IP Whitelist Notice: Ensure your current IP is added to MongoDB Atlas Network Access (or 0.0.0.0/0 for all IPs).`);
    console.error(`⚠️ Guide: https://www.mongodb.com/docs/atlas/security-whitelist/`);
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

// Monitor MongoDB connection events
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB disconnected.');
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB reconnected.');
});

module.exports = connectDB;
