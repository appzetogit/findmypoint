const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_key_12345');

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
      console.error(error);
      res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }
};

module.exports = { protect };

