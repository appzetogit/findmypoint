const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer')) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }

  const rawToken = req.headers.authorization.split(' ')[1];
  if (!rawToken || rawToken === 'null' || rawToken === 'undefined' || rawToken === '""') {
    return res.status(401).json({ success: false, message: 'Not authorized, invalid token' });
  }
  token = rawToken;

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.status(500).json({ success: false, message: 'Server configuration error: JWT secret missing' });
  }

  try {
    const decoded = jwt.verify(token, secret);

    // 1. Try User collection
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      // 2. Try Admin collection
      const Admin = require('../models/admin/Admin');
      const admin = await Admin.findById(decoded.id).select('-password');

      if (admin) {
        req.user = {
          _id: admin._id,
          firstName: admin.name,
          lastName: '',
          email: admin.email,
          isAdmin: true,
          isClient: true
        };
        req.admin = admin;
      } else {
        // 3. Try Business collection (client panel login)
        const Business = require('../models/Business');
        const business = await Business.findById(decoded.id).select('-password');

        if (business) {
          req.user = {
            _id: business._id,
            firstName: business.name,
            lastName: '',
            email: business.email,
            isAdmin: false,
            isBusiness: true,
            businessId: business.id
          };
          req.business = business;
        } else {
          return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
        }
      }
    }

    next();
  } catch (error) {
    console.error('Auth verification error:', error.message);
    return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
  }
};

const optionalProtect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    const rawToken = req.headers.authorization.split(' ')[1];
    if (rawToken && rawToken !== 'null' && rawToken !== 'undefined' && rawToken !== '""') {
      token = rawToken;
    }
  }

  if (!token) {
    req.user = null;
    return next();
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, secret);

    // 1. Try User collection
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      // 2. Try Admin collection
      const Admin = require('../models/admin/Admin');
      const admin = await Admin.findById(decoded.id).select('-password');

      if (admin) {
        req.user = {
          _id: admin._id,
          firstName: admin.name,
          lastName: '',
          email: admin.email,
          isAdmin: true,
          isClient: true
        };
        req.admin = admin;
      } else {
        // 3. Try Business collection
        const Business = require('../models/Business');
        const business = await Business.findById(decoded.id).select('-password');

        if (business) {
          req.user = {
            _id: business._id,
            firstName: business.name,
            lastName: '',
            email: business.email,
            isAdmin: false,
            isBusiness: true,
            businessId: business.id
          };
          req.business = business;
        }
      }
    }
    next();
  } catch (error) {
    // In optional protect, proceed gracefully as guest
    req.user = null;
    next();
  }
};

module.exports = { protect, optionalProtect };


