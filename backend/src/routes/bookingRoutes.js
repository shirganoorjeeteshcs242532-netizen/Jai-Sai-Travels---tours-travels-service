const express = require('express');
const router = express.Router();
const {
  createBooking,
  getBookings,
  updateBooking,
  deleteBooking
} = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getBookings)
  .post(createBooking);

router.route('/:id')
  .put(protect, updateBooking)
  .delete(protect, deleteBooking);

module.exports = router;
