const express = require('express');
const router = express.Router();
const {
  createCertification,
  getAllCertifications,
  deleteCertification
} = require('../controllers/certificationController');
const { protect, requireRole } = require('../middlewares/authMiddleware');

router.route('/')
  .post(protect, requireRole('superadmin'), createCertification)
  .get(protect, getAllCertifications);

router.route('/:id')
  .delete(protect, requireRole('superadmin'), deleteCertification);

module.exports = router;
