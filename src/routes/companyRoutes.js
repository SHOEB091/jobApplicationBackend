const express = require('express');
const router = express.Router();
const {
  createCompany,
  getAllCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany
} = require('../controllers/companyController');
const { protect, requireRole } = require('../middlewares/authMiddleware');

// Admin and Superadmin routes
router.post('/', protect, requireRole('admin', 'superadmin'), createCompany);

// Superadmin only routes
router.get('/', protect, requireRole('superadmin'), getAllCompanies);
router.delete('/:id', protect, requireRole('superadmin'), deleteCompany);

// Accessible by authenticated users
router.get('/:id', protect, getCompanyById);

// Superadmin or company admin can update
router.put('/:id', protect, requireRole('superadmin', 'admin'), updateCompany);

module.exports = router;
