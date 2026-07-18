const Admin = require('../../models/admin/Admin');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_key_12345', {
    expiresIn: '30d',
  });
};

// @desc    Register a new admin
// @route   POST /api/admin/register
// @access  Public
const registerAdmin = async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
  }

  try {
    const adminExists = await Admin.findOne({ email });

    if (adminExists) {
      return res.status(400).json({ success: false, message: 'Admin already exists with this email.' });
    }

    const admin = await Admin.create({
      name,
      email,
      password,
      role: role || 'System Administrator'
    });

    if (admin) {
      res.status(201).json({
        success: true,
        token: generateToken(admin._id),
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role
        }
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid admin data' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Auth admin & get token
// @route   POST /api/admin/login
// @access  Public
const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide email and password.' });
  }

  try {
    const admin = await Admin.findOne({ email });

    if (admin && (await admin.matchPassword(password))) {
      res.status(200).json({
        success: true,
        token: generateToken(admin._id),
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role
        }
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get admin profile
// @route   GET /api/admin/profile
// @access  Private
const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id);
    if (admin) {
      res.status(200).json({
        success: true,
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role
        }
      });
    } else {
      res.status(404).json({ success: false, message: 'Admin not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update admin profile
// @route   PUT /api/admin/profile
// @access  Private
const updateAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id);

    if (admin) {
      admin.name = req.body.name || admin.name;
      admin.email = req.body.email || admin.email;
      
      if (req.body.password) {
        admin.password = req.body.password;
      }

      const updatedAdmin = await admin.save();

      res.status(200).json({
        success: true,
        admin: {
          id: updatedAdmin._id,
          name: updatedAdmin.name,
          email: updatedAdmin.email,
          role: updatedAdmin.role
        }
      });
      } else {
      res.status(404).json({ success: false, message: 'Admin not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const User = require('../../models/User');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    res.status(200).json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user profile by Admin
// @route   PUT /api/admin/users/:id
// @access  Private
const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.title = req.body.title !== undefined ? req.body.title : user.title;
    user.firstName = req.body.firstName !== undefined ? req.body.firstName : user.firstName;
    user.middleName = req.body.middleName !== undefined ? req.body.middleName : user.middleName;
    user.lastName = req.body.lastName !== undefined ? req.body.lastName : user.lastName;
    user.dobDD = req.body.dobDD !== undefined ? req.body.dobDD : user.dobDD;
    user.dobMM = req.body.dobMM !== undefined ? req.body.dobMM : user.dobMM;
    user.dobYYYY = req.body.dobYYYY !== undefined ? req.body.dobYYYY : user.dobYYYY;
    user.maritalStatus = req.body.maritalStatus !== undefined ? req.body.maritalStatus : user.maritalStatus;
    user.occupation = req.body.occupation !== undefined ? req.body.occupation : user.occupation;
    user.mobile1 = req.body.mobile1 !== undefined ? req.body.mobile1 : user.mobile1;
    user.mobile2 = req.body.mobile2 !== undefined ? req.body.mobile2 : user.mobile2;
    user.email = req.body.email !== undefined ? req.body.email : user.email;
    user.addresses = req.body.addresses !== undefined ? req.body.addresses : user.addresses;
    user.selectedFavorites = req.body.selectedFavorites !== undefined ? req.body.selectedFavorites : user.selectedFavorites;

    const updatedUser = await user.save();
    res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  registerAdmin,
  loginAdmin,
  getAdminProfile,
  updateAdminProfile,
  getAllUsers,
  deleteUser,
  updateUser
};
