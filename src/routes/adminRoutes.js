const express = require('express');
const router = express.Router();
const {
  getPendingAdminRequests,
  getAllAdminRequests,
  approveAdminRequest,
  rejectAdminRequest,
  getAdminsByCompany,
  getPlatformStats
} = require('../controllers/adminController');
const { protect, requireRole } = require('../middlewares/authMiddleware');

// All routes are superadmin only
router.get('/requests', protect, requireRole('superadmin'), getPendingAdminRequests);
router.get('/requests/all', protect, requireRole('superadmin'), getAllAdminRequests);
router.put('/requests/:id/approve', protect, requireRole('superadmin'), approveAdminRequest);
router.put('/requests/:id/reject', protect, requireRole('superadmin'), rejectAdminRequest);
router.get('/company/:companyId', protect, requireRole('superadmin'), getAdminsByCompany);
router.get('/stats', protect, requireRole('superadmin'), getPlatformStats);

module.exports = router;
