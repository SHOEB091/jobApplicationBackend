const express = require('express');
const router = express.Router();
const {
  authUser,
  registerUser,
  logoutUser,
} = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/register', registerUser);
router.post('/login', authUser);
router.post('/logout', logoutUser);

module.exports = router;
