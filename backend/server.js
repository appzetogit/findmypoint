const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

const path = require('path');
const base64UploadMiddleware = require('./middleware/base64UploadMiddleware');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Initialize HTTP server and Socket.io server
const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

const activeSockets = new Map(); // userId -> Set of socketIds
app.set('io', io);
app.set('activeSockets', activeSockets);

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on('register_user', (userId) => {
    if (!userId) return;
    console.log(`Registering user ${userId} to socket ${socket.id}`);
    socket.userId = userId;
    if (!activeSockets.has(userId)) {
      activeSockets.set(userId, new Set());
    }
    activeSockets.get(userId).add(socket.id);
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
    if (socket.userId && activeSockets.has(socket.userId)) {
      const sockets = activeSockets.get(socket.userId);
      sockets.delete(socket.id);
      if (sockets.size === 0) {
        activeSockets.delete(socket.userId);
      }
    }
  });
});

// Serve static assets using strict absolute path
app.use(express.static(path.join(__dirname, 'public')));

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: false }));
app.use(base64UploadMiddleware);

// Import Routes
const authRoutes = require('./routes/authRoutes');
const businessRoutes = require('./routes/businessRoutes');
const touristPlaceRoutes = require('./routes/touristPlaceRoutes');
const articleRoutes = require('./routes/articleRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const adminRoutes = require('./routes/admin/adminRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const serviceFormRoutes = require('./routes/serviceFormRoutes');
const productOrderRoutes = require('./routes/productOrderRoutes');
const razorpayRoutes = require('./routes/razorpayRoutes');
const policyRoutes = require('./routes/policyRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const bannerRoutes = require('./routes/bannerRoutes');
const footerRoutes = require('./routes/footerRoutes');
const aboutRoutes = require('./routes/aboutRoutes');
const placeReviewRoutes = require('./routes/placeReviewRoutes');
const heroSectionRoutes = require('./routes/heroSectionRoutes');
const popularServiceRoutes = require('./routes/popularServiceRoutes');
const advertiseConfigRoutes = require('./routes/advertiseConfigRoutes');
const advertiseRequestRoutes = require('./routes/advertiseRequestRoutes');
const helpRoutes = require('./routes/helpRoutes');
const businessCommissionRoutes = require('./routes/businessCommissionRoutes');
const businessRequestRoutes = require('./routes/businessRequestRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const faqRoutes = require('./routes/faqRoutes');

// API Healthcheck
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    message: 'FindmyPoint Backend API is running properly.',
    timestamp: new Date()
  });
});

// Register Router Middlewares
app.use('/api/auth', authRoutes);
app.use('/api/businesses', businessRoutes);
app.use('/api/tourist-places', touristPlaceRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/service-forms', serviceFormRoutes);
app.use('/api/product-orders', productOrderRoutes);
app.use('/api/razorpay', razorpayRoutes);
app.use('/api/policies', policyRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/footer', footerRoutes);
app.use('/api/about', aboutRoutes);
app.use('/api/place-reviews', placeReviewRoutes);
app.use('/api/hero-sections', heroSectionRoutes);
app.use('/api/popular-services', popularServiceRoutes);
app.use('/api/advertise-config', advertiseConfigRoutes);
app.use('/api/advertise-requests', advertiseRequestRoutes);
app.use('/api/help', helpRoutes);
app.use('/api/business-commissions', businessCommissionRoutes);
app.use('/api/business-requests', businessRequestRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/faqs', faqRoutes);


// Fallback Route
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Resource API endpoint not found.' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running in development mode on port ${PORT}`);
});
