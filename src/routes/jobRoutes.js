const express = require('express');
const router = express.Router();
const {
  getJobs,
  getJobById,
  getJobsByCompany,
  getJobsByCategory,
  createJob,
  updateJob,
  deleteJob,
} = require('../controllers/jobController');
const { protect, requireRole } = require('../middlewares/authMiddleware');

// Public routes
router.get('/', getJobs);
router.get('/company/:companyId', getJobsByCompany);
router.get('/category/:categoryId', getJobsByCategory);
router.get('/:id', getJobById);

// Admin and Superadmin routes
router.post('/', protect, requireRole('admin', 'superadmin'), createJob);
router.put('/:id', protect, requireRole('admin', 'superadmin'), updateJob);
router.delete('/:id', protect, requireRole('admin', 'superadmin'), deleteJob);

module.exports = router;
