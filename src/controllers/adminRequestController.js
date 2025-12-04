const AdminRequest = require('../models/AdminRequest');
const User = require('../models/User');

// @desc    Get all admin requests
// @route   GET /api/admin/requests
// @access  Private/SuperAdmin
const getAdminRequests = async (req, res) => {
  try {
    const { status } = req.query;
    
    const filter = status ? { status } : {};
    
    const requests = await AdminRequest.find(filter)
      .populate('user', 'name email')
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Approve admin request
// @route   POST /api/admin/requests/:id/approve
// @access  Private/SuperAdmin
const approveAdminRequest = async (req, res) => {
  try {
    const { reviewMessage } = req.body;
    
    const request = await AdminRequest.findById(req.params.id).populate('user');
    
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Admin request not found'
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'This request has already been processed'
      });
    }

    // Update request status
    request.status = 'approved';
    request.reviewedBy = req.user._id;
    request.reviewedAt = new Date();
    request.reviewMessage = reviewMessage;
    await request.save();

    // Update user role and company
    await User.findByIdAndUpdate(request.user._id, {
      role: 'admin',
      adminApproved: true,
      company: request.companyName
    });

    res.json({
      success: true,
      message: `Admin request approved for ${request.user.name}`,
      data: request
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Reject admin request
// @route   POST /api/admin/requests/:id/reject
// @access  Private/SuperAdmin
const rejectAdminRequest = async (req, res) => {
  try {
    const { reviewMessage } = req.body;
    
    const request = await AdminRequest.findById(req.params.id).populate('user');
    
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Admin request not found'
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'This request has already been processed'
      });
    }

    // Update request status
    request.status = 'rejected';
    request.reviewedBy = req.user._id;
    request.reviewedAt = new Date();
    request.reviewMessage = reviewMessage || 'Request rejected by Super Admin';
    await request.save();

    // Clear user's adminRequestedAt
    await User.findByIdAndUpdate(request.user._id, {
      adminRequestedAt: null
    });

    res.json({
      success: true,
      message: `Admin request rejected for ${request.user.name}`,
      data: request
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getAdminRequests,
  approveAdminRequest,
  rejectAdminRequest
};
