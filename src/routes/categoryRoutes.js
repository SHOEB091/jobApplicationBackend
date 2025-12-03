const express = require('express');
const router = express.Router();
const {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const { protect, requireRole } = require('../middlewares/authMiddleware');

// Public routes
router.get('/', getCategories);
router.get('/:id', getCategoryById);

// Superadmin only routes
router.post('/', protect, requireRole('superadmin'), createCategory);
router.put('/:id', protect, requireRole('superadmin'), updateCategory);
router.delete('/:id', protect, requireRole('superadmin'), deleteCategory);

module.exports = router;
