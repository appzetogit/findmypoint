const mongoose = require('mongoose');

let isConnected = false;
let isDisconnectedLogged = false;

const connectDB = async (retryCount = 0) => {
  const MAX_RETRIES = 5;
  const RETRY_DELAY_MS = 5000;

  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/findmypoint';

    // Best-practice connection options for MongoDB Atlas & cloud VPS
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      maxPoolSize: 25,             // Prevent connection exhaustion
      minPoolSize: 2,              // Keep minimum 2 warm connections
      socketTimeoutMS: 45000,      // Close inactive sockets cleanly
      connectTimeoutMS: 10000,
      heartbeatFrequencyMS: 10000, // Send heartbeat every 10s to keep NAT/firewalls alive
      family: 4,                   // Force IPv4 to prevent IPv6 DNS hangs on Linux VPS
    });

    isConnected = true;
    isDisconnectedLogged = false;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    isConnected = false;
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    console.error(`⚠️ Atlas IP Whitelist Notice: Ensure your VPS IP is added to MongoDB Atlas Network Access (or 0.0.0.0/0 for all IPs).`);
    console.error(`⚠️ Guide: https://www.mongodb.com/docs/atlas/security-whitelist/`);

    if (retryCount < MAX_RETRIES) {
      console.warn(`⏳ Retrying MongoDB connection in ${RETRY_DELAY_MS / 1000}s (Attempt ${retryCount + 1}/${MAX_RETRIES})...`);
      setTimeout(() => connectDB(retryCount + 1), RETRY_DELAY_MS);
    } else {
      console.error(`❌ All ${MAX_RETRIES} MongoDB connection attempts failed.`);
      if (process.env.NODE_ENV === 'production') {
        process.exit(1);
      }
    }
  }
};

// Monitor MongoDB connection events
mongoose.connection.on('disconnected', () => {
  isConnected = false;
  // Debounce duplicate disconnect logs caused by multiple pool sockets closing together
  if (!isDisconnectedLogged) {
    console.warn('⚠️ MongoDB disconnected. Driver will attempt automatic reconnection...');
    isDisconnectedLogged = true;
  }
});

mongoose.connection.on('reconnected', () => {
  isConnected = true;
  isDisconnectedLogged = false;
  console.log('✅ MongoDB reconnected successfully.');
});

mongoose.connection.on('error', (err) => {
  console.error(`❌ MongoDB connection error: ${err.message}`);
});

module.exports = connectDB;

