const express = require('express');
const router = express.Router();
const {
  getAdminRequests,
  approveAdminRequest,
  rejectAdminRequest
} = require('../controllers/adminRequestController');
const { protect, requireRole } = require('../middlewares/authMiddleware');

// All routes require Super Admin
router.use(protect);
router.use(requireRole('superadmin'));

router.get('/', getAdminRequests);
router.post('/:id/approve', approveAdminRequest);
router.post('/:id/reject', rejectAdminRequest);

module.exports = router;
