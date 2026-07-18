const jwt = require('jsonwebtoken');
const User = require('../models/User');
const smsService = require('../services/smsService');

// In-memory cache to store temporary OTPs
const otpCache = new Map();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_key_12345', {
    expiresIn: '30d',
  });
};

// @desc    Send OTP to a phone number
// @route   POST /api/auth/send-otp
// @access  Public
const sendOtp = async (req, res) => {
  const { phone } = req.body;
  if (!phone || phone.replace(/\D/g, '').length !== 10) {
    return res.status(400).json({ success: false, message: 'Please enter a valid 10-digit mobile number' });
  }

  // Generate 6-digit random OTP
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

  // Cache OTP with 5-minute expiry
  otpCache.set(phone, {
    code: otpCode,
    expires: Date.now() + 5 * 60 * 1000
  });

  console.log(`📱 Generated OTP for ${phone}: ${otpCode}`);

  try {
    if (smsService.isConfigured()) {
      await smsService.sendOTP(phone, otpCode, 'register');
      res.status(200).json({
        success: true,
        message: 'OTP code sent successfully via SMS.',
      });
    } else {
      console.warn(`⚠️ SMS Service credentials missing. Dynamic OTP code is ${otpCode}`);
      res.status(200).json({
        success: true,
        message: `OTP sent successfully. (Testing mode enabled. Dynamic OTP: ${otpCode})`,
      });
    }
  } catch (error) {
    console.error('Error sending SMS via gateway:', error.message);
    res.status(200).json({
      success: true,
      message: `OTP sent successfully. (Gateway failure fallback. Dynamic OTP: ${otpCode})`,
    });
  }
};

// @desc    Verify OTP and log in / notify if new user
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOtp = async (req, res) => {
  const { phone, otp } = req.body;
  
  if (!phone || !otp || otp.length !== 6) {
    return res.status(400).json({ success: false, message: 'Please enter phone and 6-digit OTP' });
  }

  // Check OTP (allow 110211 as a default bypass OTP)
  let isOtpValid = false;
  if (otp === "110211") {
    isOtpValid = true;
    console.log(`✅ OTP verified via bypass code (110211) for ${phone}`);
  } else {
    const cachedOtp = otpCache.get(phone);
    if (cachedOtp && cachedOtp.code === otp && Date.now() <= cachedOtp.expires) {
      isOtpValid = true;
      otpCache.delete(phone); // Clear OTP on successful verification
      console.log(`✅ OTP verified dynamically from cache for ${phone}`);
    }
  }

  if (!isOtpValid) {
    return res.status(400).json({ success: false, message: 'Invalid or expired OTP code.' });
  }

  try {
    // Check if user exists
    const user = await User.findOne({ mobile1: phone });

    if (user) {
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
  const { title, firstName, middleName, lastName, mobile1, mobile2, email } = req.body;

  if (!firstName || !mobile1 || !email) {
    return res.status(400).json({ success: false, message: 'First name, mobile number, and email are required' });
  }

  try {
    // Check if user already exists
    const userExists = await User.findOne({ mobile1 });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this mobile number' });
    }

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

module.exports = {
  sendOtp,
  verifyOtp,
  registerUser,
  getUserProfile,
  updateUserProfile,
  addUserAddress,
  updateUserAddress,
  deleteUserAddress,
  updateUserFavorites
};
