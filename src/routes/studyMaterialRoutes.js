const express = require('express');
const router = express.Router();
const {
  createStudyMaterial,
  getAllStudyMaterials,
  deleteStudyMaterial
} = require('../controllers/studyMaterialController');
const { protect, requireRole } = require('../middlewares/authMiddleware');

router
  .route('/')
  .post(protect, requireRole('superadmin'), createStudyMaterial)
  .get(getAllStudyMaterials);

router
  .route('/:id')
  .delete(protect, requireRole('superadmin'), deleteStudyMaterial);

module.exports = router;
