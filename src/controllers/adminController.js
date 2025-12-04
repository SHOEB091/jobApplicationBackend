const AdminRequest = require('../models/AdminRequest');
const User = require('../models/User');
const Company = require('../models/Company');
const Job = require('../models/Job');
const Category = require('../models/Category');

// @desc    Get all pending admin requests
// @route   GET /api/admin/requests
// @access  Private/Superadmin
const getPendingAdminRequests = async (req, res) => {
  try {
    const requests = await AdminRequest.find({ status: 'pending' })
      .populate('user', 'name email')
      .populate('company', 'name location')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all admin requests (all statuses)
// @route   GET /api/admin/requests/all
// @access  Private/Superadmin
const getAllAdminRequests = async (req, res) => {
  try {
    const requests = await AdminRequest.find({})
      .populate('user', 'name email')
      .populate('company', 'name location')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Approve admin request
// @route   PUT /api/admin/requests/:id/approve
// @access  Private/Superadmin
const approveAdminRequest = async (req, res) => {
  try {
    const request = await AdminRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Admin request not found'
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Request already ${request.status}`
      });
    }

    // Update request status
    request.status = 'approved';
    request.reviewedBy = req.user._id;
    request.reviewedAt = new Date();
    await request.save();

    // Update user to admin role
    const user = await User.findById(request.user);
    user.role = 'admin';
    user.company = request.company;
    user.adminApproved = true;
    await user.save();

    // Update company's admin field
    await Company.findByIdAndUpdate(request.company, {
      admin: user._id
    });

    res.json({
      success: true,
      message: 'Admin request approved successfully',
      data: request
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Reject admin request
// @route   PUT /api/admin/requests/:id/reject
// @access  Private/Superadmin
const rejectAdminRequest = async (req, res) => {
  try {
    const request = await AdminRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Admin request not found'
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Request already ${request.status}`
      });
    }

    // Update request status
    request.status = 'rejected';
    request.reviewedBy = req.user._id;
    request.reviewedAt = new Date();
    await request.save();

    res.json({
      success: true,
      message: 'Admin request rejected',
      data: request
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get admins by company
// @route   GET /api/admin/company/:companyId
// @access  Private/Superadmin
const getAdminsByCompany = async (req, res) => {
  try {
    const admins = await User.find({
      company: req.params.companyId,
      role: 'admin',
      adminApproved: true
    }).select('-password');

    res.json({
      success: true,
      count: admins.length,
      data: admins
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get platform stats
// @route   GET /api/admin/stats
// @access  Private/Superadmin
const getPlatformStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalJobs = await Job.countDocuments();
    const totalCategories = await Category.countDocuments();

    res.json({
      success: true,
      data: {
        users: totalUsers,
        jobs: totalJobs,
        categories: totalCategories
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getPendingAdminRequests,
  getAllAdminRequests,
  approveAdminRequest,
  rejectAdminRequest,
  getAdminsByCompany,
  getPlatformStats
};
