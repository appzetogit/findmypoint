const jwt = require('jsonwebtoken');
const User = require('../models/User');
const smsService = require('../services/smsService');

// In-memory cache to store temporary OTPs
const otpCache = new Map();

const generateToken = (id) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('FATAL: JWT_SECRET environment variable is not set. Server cannot issue tokens.');
  }
  return jwt.sign({ id }, secret, {
    expiresIn: '30d',
  });
};

// @desc    Send OTP to a phone number
// @route   POST /api/auth/send-otp
// @access  Public
const sendOtp = async (req, res) => {
  const { phone } = req.body;
  if (!phone || typeof phone !== 'string' || phone.replace(/\D/g, '').length !== 10) {
    return res.status(400).json({ success: false, message: 'Please enter a valid 10-digit mobile number' });
  }

  // Generate 6-digit random OTP
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

  // Cache OTP with 5-minute expiry
  otpCache.set(phone, {
    code: otpCode,
    expires: Date.now() + 5 * 60 * 1000
  });

  console.log(`\n======================================================`);
  console.log(`📱 [AUTH OTP] Mobile: ${phone} | OTP Code: ${otpCode}`);
  console.log(`======================================================\n`);

  try {
    if (smsService.isConfigured()) {
      const smsResult = await smsService.sendOTP(phone, otpCode, 'register');
      console.log(`📡 SMS Service Result for ${phone}:`, smsResult);
      res.status(200).json({
        success: true,
        message: 'OTP code sent successfully via SMS.',
      });
    } else {
      console.warn(`⚠️ SMS Service credentials missing. OTP for ${phone}: ${otpCode}`);
      res.status(200).json({
        success: true,
        message: 'OTP sent successfully.',
      });
    }
  } catch (error) {
    console.error(`❌ Error sending SMS to ${phone} via SMS gateway:`, error.message);
    res.status(200).json({
      success: true,
      message: 'OTP sent successfully.',
    });
  }
};

// Helper function to attach or update FCM token on user model
const attachFcmTokenToUser = (user, fcmToken, device = 'web', platform = null) => {
  if (!fcmToken || typeof fcmToken !== 'string') return;
  const cleanToken = fcmToken.trim();
  if (!cleanToken) return;

  const targetDev = String(device || '').toLowerCase();
  const targetPlat = String(platform || '').toLowerCase();

  const isMobile = (
    targetDev.includes('apk') ||
    targetDev.includes('android') ||
    targetDev.includes('app') ||
    targetDev.includes('mobile') ||
    targetDev.includes('ios') ||
    targetPlat.includes('mobile') ||
    targetPlat.includes('apk') ||
    targetPlat.includes('android') ||
    targetPlat.includes('ios') ||
    targetPlat.includes('app')
  );

  // Set latest general active token
  user.fcmToken = cleanToken;

  // Set dedicated platform tokens so Web and Mobile/APK tokens never overwrite each other
  if (isMobile) {
    user.apkFcmToken = cleanToken;
  } else {
    user.webFcmToken = cleanToken;
  }

  if (!Array.isArray(user.fcmTokens)) {
    user.fcmTokens = [];
  }

  const effectiveDevice = device || (isMobile ? 'mobile' : 'web');
  const effectivePlatform = platform || (isMobile ? 'mobile' : 'web');

  const existingIdx = user.fcmTokens.findIndex(t => t.token === cleanToken);
  if (existingIdx >= 0) {
    user.fcmTokens[existingIdx].updatedAt = new Date();
    user.fcmTokens[existingIdx].device = effectiveDevice;
    user.fcmTokens[existingIdx].platform = effectivePlatform;
  } else {
    user.fcmTokens.push({
      token: cleanToken,
      device: effectiveDevice,
      platform: effectivePlatform,
      updatedAt: new Date()
    });
  }
};

// @desc    Verify OTP and log in / notify if new user
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOtp = async (req, res) => {
  const { phone, otp, fcmToken, device, platform } = req.body;

  if (!phone || !otp || typeof phone !== 'string' || typeof otp !== 'string' || otp.length !== 6) {
    return res.status(200).json({ success: false, message: 'Please enter phone and 6-digit OTP' });
  }

  // Check OTP against in-memory cache
  let isOtpValid = false;
  const cachedOtp = otpCache.get(phone);
  if (cachedOtp && cachedOtp.code === otp && Date.now() <= cachedOtp.expires) {
    isOtpValid = true;
    otpCache.delete(phone); // Clear OTP after successful verification (one-time use)
    console.log(`✅ OTP verified for ${phone}`);
  }

  if (!isOtpValid) {
    return res.status(200).json({ success: false, message: 'Invalid or expired OTP code. Please enter the correct OTP.' });
  }

  try {
    // Check if user exists
    const user = await User.findOne({ mobile1: phone });

    if (user) {
      if (fcmToken) {
        attachFcmTokenToUser(user, fcmToken, device, platform);
        await user.save();
      }
      const token = generateToken(user._id);
      return res.status(200).json({
        success: true,
        isNewUser: false,
        token,
        user: {
          id: user._id,
          title: user.title,
          firstName: user.firstName,
          middleName: user.middleName,
          lastName: user.lastName,
          mobile1: user.mobile1,
          mobile2: user.mobile2,
          email: user.email,
          avatar: user.avatar,
          addresses: user.addresses,
          selectedFavorites: user.selectedFavorites,
          isAdmin: user.isAdmin,
          isClient: user.isClient,
        }
      });
    } else {
      // User doesn't exist, must register
      return res.status(200).json({
        success: true,
        isNewUser: true,
        message: 'OTP verified! Welcome new user. Please complete registration.'
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { title, firstName, middleName, lastName, mobile1, mobile2, email, fcmToken, device, platform } = req.body;

  if (!firstName || typeof firstName !== 'string' || !mobile1 || typeof mobile1 !== 'string' || !email || typeof email !== 'string') {
    return res.status(400).json({ success: false, message: 'First name, mobile number, and email are required' });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
  }

  try {
    // Check if user already exists
    const userExists = await User.findOne({ mobile1 });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this mobile number' });
    }

    const cleanFcmToken = (fcmToken && typeof fcmToken === 'string') ? fcmToken.trim() : null;
    const targetDev = String(device || '').toLowerCase();
    const targetPlat = String(platform || '').toLowerCase();
    const isMobile = (
      targetDev.includes('apk') ||
      targetDev.includes('android') ||
      targetDev.includes('app') ||
      targetDev.includes('mobile') ||
      targetDev.includes('ios') ||
      targetPlat.includes('mobile') ||
      targetPlat.includes('apk') ||
      targetPlat.includes('android') ||
      targetPlat.includes('ios') ||
      targetPlat.includes('app')
    );
    const effectiveDevice = device || (isMobile ? 'mobile' : 'web');
    const effectivePlatform = platform || (isMobile ? 'mobile' : 'web');

    const user = await User.create({
      title: title || 'Mr.',
      firstName,
      middleName: middleName || '',
      lastName: lastName || '',
      mobile1,
      mobile2: mobile2 || mobile1, // WhatsApp default
      email: email || '',
      avatar: '',
      addresses: [],
      selectedFavorites: [],
      fcmToken: cleanFcmToken,
      webFcmToken: (!isMobile && cleanFcmToken) ? cleanFcmToken : null,
      apkFcmToken: (isMobile && cleanFcmToken) ? cleanFcmToken : null,
      fcmTokens: cleanFcmToken ? [{
        token: cleanFcmToken,
        device: effectiveDevice,
        platform: effectivePlatform,
        updatedAt: new Date()
      }] : []
    });

    if (user) {
      res.status(201).json({
        success: true,
        token: generateToken(user._id),
        user: {
          id: user._id,
          title: user.title,
          firstName: user.firstName,
          middleName: user.middleName,
          lastName: user.lastName,
          mobile1: user.mobile1,
          mobile2: user.mobile2,
          email: user.email,
          avatar: user.avatar,
          addresses: user.addresses,
          selectedFavorites: user.selectedFavorites,
          isAdmin: user.isAdmin,
          isClient: user.isClient,
        }
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      res.status(200).json({
        success: true,
        user: {
          id: user._id,
          title: user.title,
          firstName: user.firstName,
          middleName: user.middleName,
          lastName: user.lastName,
          dobDD: user.dobDD,
          dobMM: user.dobMM,
          dobYYYY: user.dobYYYY,
          maritalStatus: user.maritalStatus,
          occupation: user.occupation,
          mobile1: user.mobile1,
          mobile2: user.mobile2,
          email: user.email,
          avatar: user.avatar,
          addresses: user.addresses,
          selectedFavorites: user.selectedFavorites,
          isAdmin: user.isAdmin,
          isClient: user.isClient,
        }
      });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.title = req.body.title !== undefined ? req.body.title : user.title;
      user.firstName = req.body.firstName !== undefined ? req.body.firstName : user.firstName;
      user.middleName = req.body.middleName !== undefined ? req.body.middleName : user.middleName;
      user.lastName = req.body.lastName !== undefined ? req.body.lastName : user.lastName;
      user.dobDD = req.body.dobDD !== undefined ? req.body.dobDD : user.dobDD;
      user.dobMM = req.body.dobMM !== undefined ? req.body.dobMM : user.dobMM;
      user.dobYYYY = req.body.dobYYYY !== undefined ? req.body.dobYYYY : user.dobYYYY;
      user.maritalStatus = req.body.maritalStatus !== undefined ? req.body.maritalStatus : user.maritalStatus;
      user.occupation = req.body.occupation !== undefined ? req.body.occupation : user.occupation;
      user.mobile2 = req.body.mobile2 !== undefined ? req.body.mobile2 : user.mobile2;
      user.email = req.body.email !== undefined ? req.body.email : user.email;
      user.avatar = req.body.avatar !== undefined ? req.body.avatar : user.avatar;

      if (req.body.addresses !== undefined) {
        user.addresses = req.body.addresses;
      }
      if (req.body.selectedFavorites !== undefined) {
        user.selectedFavorites = req.body.selectedFavorites;
      }

      const updatedUser = await user.save();

      res.status(200).json({
        success: true,
        user: {
          id: updatedUser._id,
          title: updatedUser.title,
          firstName: updatedUser.firstName,
          middleName: updatedUser.middleName,
          lastName: updatedUser.lastName,
          dobDD: updatedUser.dobDD,
          dobMM: updatedUser.dobMM,
          dobYYYY: updatedUser.dobYYYY,
          maritalStatus: updatedUser.maritalStatus,
          occupation: updatedUser.occupation,
          mobile1: updatedUser.mobile1,
          mobile2: updatedUser.mobile2,
          email: updatedUser.email,
          avatar: updatedUser.avatar,
          addresses: updatedUser.addresses,
          selectedFavorites: updatedUser.selectedFavorites,
          isAdmin: updatedUser.isAdmin,
          isClient: updatedUser.isClient,
        }
      });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add user address
// @route   POST /api/auth/address
// @access  Private
const addUserAddress = async (req, res) => {
  const { name, phone, email, address, pincode, city, landlineStd, landlineNum, tag } = req.body;

  if (!name || !phone || !address || !pincode || !city) {
    return res.status(400).json({ success: false, message: 'Please provide all required address details' });
  }

  try {
    const user = await User.findById(req.user._id);

    if (user) {
      const newAddress = {
        name,
        phone,
        email,
        address,
        pincode,
        city,
        landlineStd,
        landlineNum,
        tag: tag || 'Home'
      };

      user.addresses.push(newAddress);
      await user.save();

      res.status(201).json({
        success: true,
        addresses: user.addresses
      });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user address
// @route   PUT /api/auth/address/:addressId
// @access  Private
const updateUserAddress = async (req, res) => {
  const { addressId } = req.params;
  const { name, phone, email, address, pincode, city, landlineStd, landlineNum, tag } = req.body;

  try {
    const user = await User.findById(req.user._id);

    if (user) {
      const addr = user.addresses.id(addressId);
      if (!addr) {
        return res.status(404).json({ success: false, message: 'Address not found' });
      }

      addr.name = name || addr.name;
      addr.phone = phone || addr.phone;
      addr.email = email !== undefined ? email : addr.email;
      addr.address = address || addr.address;
      addr.pincode = pincode || addr.pincode;
      addr.city = city || addr.city;
      addr.landlineStd = landlineStd !== undefined ? landlineStd : addr.landlineStd;
      addr.landlineNum = landlineNum !== undefined ? landlineNum : addr.landlineNum;
      addr.tag = tag || addr.tag;

      await user.save();

      res.status(200).json({
        success: true,
        addresses: user.addresses
      });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete user address
// @route   DELETE /api/auth/address/:addressId
// @access  Private
const deleteUserAddress = async (req, res) => {
  const { addressId } = req.params;

  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.addresses = user.addresses.filter(addr => addr._id.toString() !== addressId);
      await user.save();

      res.status(200).json({
        success: true,
        addresses: user.addresses
      });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user favorites
// @route   PUT /api/auth/favorites
// @access  Private
const updateUserFavorites = async (req, res) => {
  const { favorites } = req.body;

  if (!Array.isArray(favorites)) {
    return res.status(400).json({ success: false, message: 'Favorites must be an array' });
  }

  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.selectedFavorites = favorites;
      await user.save();

      res.status(200).json({
        success: true,
        selectedFavorites: user.selectedFavorites
      });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Direct Login with Mobile Number + Name (No OTP required)
// @route   POST /api/auth/direct-login
// @access  Public
const directLogin = async (req, res) => {
  const { phone, name, fcmToken, device, platform } = req.body;

  if (!phone || typeof phone !== 'string' || phone.replace(/\D/g, '').length !== 10) {
    return res.status(400).json({ success: false, message: 'Please enter a valid 10-digit mobile number' });
  }

  const cleanedPhone = phone.replace(/\D/g, '');
  const trimmedName = (name && typeof name === 'string') ? name.trim() : '';

  if (!trimmedName || trimmedName.length < 2) {
    return res.status(400).json({ success: false, message: 'Please enter your full name (at least 2 characters)' });
  }

  try {
    let user = await User.findOne({ mobile1: cleanedPhone });

    if (user) {
      // Update name if changed
      if (trimmedName && user.firstName !== trimmedName) {
        user.firstName = trimmedName;
      }
      if (fcmToken) {
        attachFcmTokenToUser(user, fcmToken, device, platform);
      }
      await user.save();
    } else {
      // Create new user directly with optional FCM token (Web or Mobile)
      const cleanFcmToken = (fcmToken && typeof fcmToken === 'string') ? fcmToken.trim() : null;
      const targetDev = String(device || '').toLowerCase();
      const targetPlat = String(platform || '').toLowerCase();
      const isMobile = (
        targetDev.includes('apk') ||
        targetDev.includes('android') ||
        targetDev.includes('app') ||
        targetDev.includes('mobile') ||
        targetDev.includes('ios') ||
        targetPlat.includes('mobile') ||
        targetPlat.includes('apk') ||
        targetPlat.includes('android') ||
        targetPlat.includes('ios') ||
        targetPlat.includes('app')
      );
      const effectiveDevice = device || (isMobile ? 'mobile' : 'web');
      const effectivePlatform = platform || (isMobile ? 'mobile' : 'web');

      user = await User.create({
        title: 'Mr.',
        firstName: trimmedName,
        middleName: '',
        lastName: '',
        mobile1: cleanedPhone,
        mobile2: cleanedPhone,
        email: ``,
        avatar: '',
        addresses: [],
        selectedFavorites: [],
        fcmToken: cleanFcmToken,
        webFcmToken: (!isMobile && cleanFcmToken) ? cleanFcmToken : null,
        apkFcmToken: (isMobile && cleanFcmToken) ? cleanFcmToken : null,
        fcmTokens: cleanFcmToken ? [{
          token: cleanFcmToken,
          device: effectiveDevice,
          platform: effectivePlatform,
          updatedAt: new Date()
        }] : []
      });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        _id: user._id,
        title: user.title,
        firstName: user.firstName,
        middleName: user.middleName,
        lastName: user.lastName,
        dobDD: user.dobDD,
        dobMM: user.dobMM,
        dobYYYY: user.dobYYYY,
        maritalStatus: user.maritalStatus,
        occupation: user.occupation,
        mobile1: user.mobile1,
        mobile2: user.mobile2,
        email: user.email,
        avatar: user.avatar,
        addresses: user.addresses,
        selectedFavorites: user.selectedFavorites,
        isAdmin: user.isAdmin,
        isClient: user.isClient,
        fcmToken: user.fcmToken,
        webFcmToken: user.webFcmToken,
        apkFcmToken: user.apkFcmToken
      }
    });
  } catch (error) {
    console.error('direct-login error:', error);
    res.status(500).json({ success: false, message: error.message || 'Login failed' });
  }
};

// @desc    Refresh token / Validate session
// @route   POST /api/auth/refresh-token
// @access  Public
const refreshToken = async (req, res) => {
  try {
    let token = req.body.token;
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const secret = process.env.JWT_SECRET;
    const decoded = jwt.verify(token, secret);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const newToken = generateToken(user._id);
    res.status(200).json({
      success: true,
      token: newToken,
      user: {
        id: user._id,
        _id: user._id,
        title: user.title,
        firstName: user.firstName,
        middleName: user.middleName,
        lastName: user.lastName,
        dobDD: user.dobDD,
        dobMM: user.dobMM,
        dobYYYY: user.dobYYYY,
        maritalStatus: user.maritalStatus,
        occupation: user.occupation,
        mobile1: user.mobile1,
        mobile2: user.mobile2,
        email: user.email,
        avatar: user.avatar,
        addresses: user.addresses,
        selectedFavorites: user.selectedFavorites,
        isAdmin: user.isAdmin,
        isClient: user.isClient,
        fcmToken: user.fcmToken
      }
    });
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

// @desc    Update / Register FCM Token for logged-in user
// @route   POST /api/auth/fcm-token
// @access  Private
const updateFcmToken = async (req, res) => {
  const { fcmToken, device, platform } = req.body;
  if (!fcmToken || typeof fcmToken !== 'string') {
    return res.status(400).json({ success: false, message: 'Valid FCM token is required' });
  }

  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    attachFcmTokenToUser(user, fcmToken, device, platform);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'FCM token registered successfully',
      fcmToken: user.fcmToken,
      platform: platform || device || 'mobile',
      webFcmToken: user.webFcmToken,
      apkFcmToken: user.apkFcmToken
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Remove FCM Token on logout
// @route   DELETE /api/auth/fcm-token
// @access  Private
const removeFcmToken = async (req, res) => {
  const { fcmToken } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (fcmToken && typeof fcmToken === 'string') {
      const cleanToken = fcmToken.trim();
      user.fcmTokens = (user.fcmTokens || []).filter(t => t.token !== cleanToken);
      if (user.fcmToken === cleanToken) {
        user.fcmToken = user.fcmTokens.length > 0 ? user.fcmTokens[user.fcmTokens.length - 1].token : null;
      }
    } else {
      user.fcmToken = null;
    }

    await user.save();
    res.status(200).json({ success: true, message: 'FCM token removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  sendOtp,
  verifyOtp,
  registerUser,
  directLogin,
  refreshToken,
  getUserProfile,
  updateUserProfile,
  addUserAddress,
  updateUserAddress,
  deleteUserAddress,
  updateUserFavorites,
  updateFcmToken,
  removeFcmToken
};
