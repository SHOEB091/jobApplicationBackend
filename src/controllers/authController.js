const User = require('../models/User');
const AdminRequest = require('../models/AdminRequest');
const generateToken = require('../utils/generateToken');
const { registerSchema, loginSchema, adminRequestSchema } = require('../utils/validationSchemas');

// Helper to set cookie
const setCookie = (res, token) => {
  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const authUser = async (req, res) => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      const token = generateToken(user);
      setCookie(res, token);

      res.json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          company: user.company,
          adminApproved: user.adminApproved,
          token: token
        }
      });
    } else {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { error } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: 'user' // Default role
    });

    if (user) {
      const token = generateToken(user);
      setCookie(res, token);

      res.status(201).json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          token: token
        }
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid user data'
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Request admin role
// @route   POST /api/auth/request-admin
// @access  Private
const requestAdminRole = async (req, res) => {
  try {
    const { error } = adminRequestSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const { companyId, message } = req.body;

    // Check if user already has admin role
    if (req.user.role === 'admin' || req.user.role === 'superadmin') {
      return res.status(400).json({
        success: false,
        message: 'User already has admin privileges'
      });
    }

    // Check if there's already a pending request
    const existingRequest = await AdminRequest.findOne({
      user: req.user._id,
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending admin request'
      });
    }

    // Create admin request
    const adminRequest = await AdminRequest.create({
      user: req.user._id,
      company: companyId,
      message,
      status: 'pending'
    });

    // Update user's adminRequestedAt field
    await User.findByIdAndUpdate(req.user._id, {
      adminRequestedAt: new Date()
    });

    res.status(201).json({
      success: true,
      message: 'Admin request submitted successfully',
      data: adminRequest
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Public
const logoutUser = (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ 
    success: true,
    message: 'Logged out successfully' 
  });
};

module.exports = { authUser, registerUser, requestAdminRole, logoutUser };
