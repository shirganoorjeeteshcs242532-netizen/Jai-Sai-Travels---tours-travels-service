const express = require('express');
const router = express.Router();
const {
  getFleet,
  updateFleet,
  uploadFleetPhoto
} = require('../controllers/fleetController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Public route to view fleet showcase
router.get('/', getFleet);

// Admin-only route to update fleet showcase
router.put('/', protect, updateFleet);

// Admin-only route to upload fleet photos
router.post('/upload', protect, upload.single('photo'), uploadFleetPhoto);

module.exports = router;
