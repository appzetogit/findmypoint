const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

const fs = require('fs');
const path = require('path');
const base64UploadMiddleware = require('./middleware/base64UploadMiddleware');

// Load environment variables
dotenv.config();

// Abort startup if critical env vars are missing
if (!process.env.JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET is not set in environment variables. Exiting.');
  process.exit(1);
}

// Connect to Database
connectDB();

const app = express();

// Trust reverse proxy (Nginx) for accurate IP rate limiting and X-Forwarded-For headers
app.set('trust proxy', 1);

// ─── CORS Configuration ─────────────────────────────────────────────────────
const rawFrontendUrls = process.env.FRONTEND_URL 
  ? process.env.FRONTEND_URL.split(',').map(s => s.trim()) 
  : [];

const ALLOWED_ORIGINS = [
  'http://localhost:5173',  // Vite dev server
  'http://localhost:4173',  // Vite preview
  'http://localhost:3000',  // Alternative dev port
  'https://findmypoint.app',
  'https://www.findmypoint.app',
  'http://findmypoint.app',
  'http://www.findmypoint.app',
  ...rawFrontendUrls
].filter(Boolean);

const isOriginAllowed = (origin) => {
  if (!origin) return true;
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  try {
    const parsed = new URL(origin);
    if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
      return true;
    }
    if (parsed.hostname === 'findmypoint.app' || parsed.hostname.endsWith('.findmypoint.app')) {
      return true;
    }
  } catch {
    // Ignore URL parse errors
  }
  return false;
};

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: origin ${origin} not allowed`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
};

// Initialize HTTP server and Socket.io server
const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      callback(null, isOriginAllowed(origin));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
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

// ─── Rate Limiters ───────────────────────────────────────────────────────────
// OTP send: max 5 requests per 5 minutes per IP
const otpSendLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many OTP requests. Please wait 5 minutes before retrying.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// OTP verify + login: max 10 requests per 5 minutes per IP
const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many attempts. Please wait 5 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// General API limiter: allow generous operational throughput and skip authenticated tokens
const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 1000 : 5000,
  message: { success: false, message: 'Too many requests. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip general rate limiting for healthchecks and authenticated admin/client/user calls
    if (req.path === '/api/health' || req.headers.authorization) {
      return true;
    }
    return false;
  }
});

app.set('otpSendLimiter', otpSendLimiter);
app.set('authLimiter', authLimiter);

// ─── Uploads Static & Remote Fallback Serving ─────────────────────────────────
const uploadsBaseDir = process.env.UPLOADS_DIR || 
  (process.platform === 'linux' && fs.existsSync('/var/www/uploads') ? '/var/www/uploads' : path.join(__dirname, 'public', 'uploads'));
const isProduction = process.env.NODE_ENV === 'production';
const productionUploadsUrl = (process.env.PRODUCTION_UPLOADS_URL || 
  (process.env.PRODUCTION_URL ? `${process.env.PRODUCTION_URL}/uploads` : 'https://findmypoint.app/uploads')).replace(/\/$/, '');

// Static asset caching options (30 days cache with stale-while-revalidate for fast rendering)
const staticCacheOptions = {
  maxAge: isProduction ? '30d' : '7d',
  etag: true,
  lastModified: true,
  setHeaders: (res, filePath) => {
    res.setHeader('Cache-Control', 'public, max-age=2592000, stale-while-revalidate=86400');
  }
};

// Serve local uploads if present with strong caching
if (isProduction || fs.existsSync(uploadsBaseDir)) {
  app.use('/uploads', express.static(uploadsBaseDir, staticCacheOptions));
}

// In local development: redirect any missing upload request to the live server
app.use('/uploads', (req, res, next) => {
  const localFilePath = path.join(uploadsBaseDir, req.path);
  if (fs.existsSync(localFilePath) && fs.statSync(localFilePath).isFile()) {
    res.setHeader('Cache-Control', 'public, max-age=2592000, stale-while-revalidate=86400');
    return res.sendFile(localFilePath);
  }
  if (productionUploadsUrl) {
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.redirect(302, `${productionUploadsUrl}${req.path}`);
  }
  next();
});

// Serve general static assets with caching
app.use(express.static(path.join(__dirname, 'public'), staticCacheOptions));


// ─── Security & Core Middleware ──────────────────────────────────────────────
const mongoSanitize = require('mongo-sanitize');

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow serving uploaded images cross-origin
}));
app.use(cors(corsOptions));
app.use(generalLimiter);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: false }));

// Sanitize user inputs against NoSQL injection
app.use((req, res, next) => {
  if (req.body) req.body = mongoSanitize(req.body);
  if (req.params) req.params = mongoSanitize(req.params);
  if (req.query) {
    for (const key in req.query) {
      if (Object.prototype.hasOwnProperty.call(req.query, key)) {
        req.query[key] = mongoSanitize(req.query[key]);
      }
    }
  }
  next();
});

// Skip base64 middleware on GET/DELETE requests or direct upload sync requests
app.use((req, res, next) => {
  if (req.method === 'GET' || req.method === 'DELETE' || req.method === 'HEAD') {
    return next();
  }
  if (req.path === '/api/upload/direct' || req.originalUrl?.includes('/api/upload/direct')) {
    return next();
  }
  return base64UploadMiddleware(req, res, next);
});

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
const seoRoutes = require('./routes/seoRoutes');
const withdrawalRoutes = require('./routes/withdrawalRoutes');

// API Healthcheck
const mongoose = require('mongoose');
app.get('/api/health', (req, res) => {
  const dbStates = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const dbStatus = dbStates[mongoose.connection.readyState] || 'unknown';
  res.status(200).json({
    status: 'healthy',
    message: 'FindmyPoint Backend API is running properly.',
    database: dbStatus,
    timestamp: new Date()
  });
});

// Root-level SEO routes for sitemap.xml and robots.txt
app.use('/', seoRoutes);

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
app.use('/api/withdrawals', withdrawalRoutes);


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
