const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const Booking = require('../models/Booking');
const Transaction = require('../models/Transaction');
const Business = require('../models/Business');
const User = require('../models/User');
const ProductOrder = require('../models/ProductOrder');
const ServiceBookingSubmission = require('../models/ServiceBookingSubmission');
const ServiceFormConfig = require('../models/ServiceFormConfig');

async function cleanup() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // 1. Delete QA Bookings
    const bookingRes = await Booking.deleteMany({
      $or: [
        { businessName: /QA Apex/i },
        { customerName: /Senior QA/i },
        { customerPhone: '9876543210' },
        { customerEmail: /qatestlead/i },
        { id: /^BK178731/ }
      ]
    });
    console.log(`Deleted ${bookingRes.deletedCount} QA Bookings`);

    // 2. Delete QA Transactions
    const txnRes = await Transaction.deleteMany({
      $or: [
        { businessName: /QA Apex/i },
        { customerName: /Senior QA/i },
        { bookingId: /^BK178731/ },
        { id: /^TXN-178731/ }
      ]
    });
    console.log(`Deleted ${txnRes.deletedCount} QA Transactions`);

    // 3. Delete QA Businesses
    const bizRes = await Business.deleteMany({
      $or: [
        { name: /QA Apex/i },
        { id: /^qa-biz/ }
      ]
    });
    console.log(`Deleted ${bizRes.deletedCount} QA Businesses`);

    // 4. Delete QA Product Orders
    const orderRes = await ProductOrder.deleteMany({
      $or: [
        { businessName: /QA Apex/i },
        { customerName: /Senior QA/i },
        { customerPhone: '9876543210' }
      ]
    });
    console.log(`Deleted ${orderRes.deletedCount} QA Product Orders`);

    // 5. Delete QA Users
    const userRes = await User.deleteMany({
      $or: [
        { email: /qatestlead/i },
        { name: /Senior QA/i },
        { phone: '9876543210' }
      ]
    });
    console.log(`Deleted ${userRes.deletedCount} QA Users`);

    // 6. Delete QA Service Form configs & Submissions
    const subRes = await ServiceBookingSubmission.deleteMany({
      $or: [
        { businessId: /^qa-biz/ },
        { businessName: /QA Apex/i }
      ]
    });
    console.log(`Deleted ${subRes.deletedCount} QA Submissions`);

    const cfgRes = await ServiceFormConfig.deleteMany({
      $or: [
        { businessId: /^qa-biz/ }
      ]
    });
    console.log(`Deleted ${cfgRes.deletedCount} QA Form Configs`);

    console.log('Cleanup completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Cleanup failed:', error);
    process.exit(1);
  }
}

cleanup();
