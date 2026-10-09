const express = require('express');
const router = express.Router();
const {
  loginAdmin,
  registerAdmin,
  getAdminProfile,
  updateAdminProfile,
  getDashboardStats
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');

router.post('/login', loginAdmin);
router.post('/register', registerAdmin);
router.get('/profile', protect, getAdminProfile);
router.put('/profile', protect, updateAdminProfile);
router.get('/stats', protect, getDashboardStats);

module.exports = router;
