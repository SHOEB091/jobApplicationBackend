const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  token = req.cookies.jwt;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select('-password');

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed'
      });
    }
  } else {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token'
    });
  }
};

// Middleware to check if user has required role
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}`
      });
    }

    // Additional check for admin role - must be approved
    if (req.user.role === 'admin' && !req.user.adminApproved) {
      return res.status(403).json({
        success: false,
        message: 'Admin access pending approval'
      });
    }

    next();
  };
};

// Middleware to verify company access for admins
const requireCompanyAccess = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    // Superadmin has access to all companies
    if (req.user.role === 'superadmin') {
      return next();
    }

    // Admin must have a company and it must match the resource company
    if (req.user.role === 'admin') {
      if (!req.user.company) {
        return res.status(403).json({
          success: false,
          message: 'No company associated with admin account'
        });
      }

      // The company ID to check will be set by the controller
      // This middleware just ensures the user has company access rights
      req.userCompanyId = req.user.company.toString();
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error during authorization'
    });
  }
};

module.exports = { protect, requireRole, requireCompanyAccess };
