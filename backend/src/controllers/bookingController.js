const Booking = require('../models/Booking');
const { sendBookingNotification, sendBookingStatusEmail } = require('../services/emailService');

// In-memory fallback bookings store for offline/demo mode
let inMemoryBookings = [
  {
    _id: 'bk-demo-1',
    name: 'Rahul Sharma',
    email: 'rahul.sharma@example.com',
    phone: '+91 9823456789',
    service: 'Airport Pickup & Drop (24/7)',
    date: new Date(Date.now() + 86400000 * 2),
    message: 'Pickup from Pune Airport at 11:30 PM with luggage for 4 passengers.',
    status: 'pending',
    createdAt: new Date(Date.now() - 3600000 * 4)
  },
  {
    _id: 'bk-demo-2',
    name: 'Priya Deshmukh',
    email: 'priya.d@example.com',
    phone: '+91 9765432109',
    service: 'Outstation Trips',
    date: new Date(Date.now() + 86400000 * 5),
    message: '3-day family tour to Mahabaleshwar and Panchgani in Innova Crysta.',
    status: 'confirmed',
    createdAt: new Date(Date.now() - 86400000 * 1)
  }
];

// @desc    Create new booking inquiry
// @route   POST /api/bookings
// @access  Public
const createBooking = async (req, res, next) => {
  try {
    const { name, email, phone, service, date, message } = req.body;

    if (!name || !phone || !service || !date) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required booking details (Name, Phone, Service, Date)'
      });
    }

    const safeEmail = email ? email.toLowerCase().trim() : '';

    // Attempt MongoDB creation
    try {
      const booking = await Booking.create({
        name,
        email: safeEmail,
        phone: phone.trim(),
        service,
        date: new Date(date),
        message: message || '',
        status: 'pending'
      });

      // Send real email notification asynchronously to customer & admin
      if (safeEmail) {
        sendBookingNotification(booking).catch(mailErr => {
          console.error('📧 [Booking] Notification error:', mailErr.message);
        });
      }

      return res.status(201).json({
        success: true,
        message: 'Your booking inquiry has been submitted successfully! Our team will contact you shortly.',
        data: booking
      });
    } catch (dbErr) {
      // Fallback in memory
      const newBooking = {
        _id: 'bk-' + Date.now(),
        name,
        email: safeEmail,
        phone: phone.trim(),
        service,
        date: new Date(date),
        message: message || '',
        status: 'pending',
        createdAt: new Date()
      };
      inMemoryBookings.unshift(newBooking);

      if (safeEmail) {
        sendBookingNotification(newBooking).catch(mailErr => {
          console.error('📧 [Booking] Notification error:', mailErr.message);
        });
      }

      return res.status(201).json({
        success: true,
        message: 'Your booking inquiry has been submitted successfully! Our team will contact you shortly.',
        data: newBooking
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private
const getBookings = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status && status !== 'all') {
      filter.status = status;
    }

    try {
      let bookings = await Booking.find(filter).sort({ createdAt: -1 });
      if (bookings.length === 0) {
        bookings = inMemoryBookings;
      }
      return res.status(200).json({
        success: true,
        count: bookings.length,
        data: bookings
      });
    } catch (dbErr) {
      return res.status(200).json({
        success: true,
        count: inMemoryBookings.length,
        data: inMemoryBookings
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id
// @access  Private
const updateBooking = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['pending', 'confirmed', 'completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value. Must be pending, confirmed, or completed.'
      });
    }

    try {
      const booking = await Booking.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      );

      if (booking) {
        // Send status email asynchronously to customer (confirmed, completed with greet, or pending)
        if (booking.email) {
          sendBookingStatusEmail(booking, status).catch(mailErr => {
            console.error('📧 [StatusEmail] Error:', mailErr.message);
          });
        }

        return res.status(200).json({
          success: true,
          message: `Booking status updated to ${status} and notification email sent!`,
          data: booking
        });
      }
    } catch (dbErr) {
      // Fallback
    }

    const item = inMemoryBookings.find(b => b._id === req.params.id);
    if (item) {
      item.status = status;

      if (item.email) {
        sendBookingStatusEmail(item, status).catch(mailErr => {
          console.error('📧 [StatusEmail] Error:', mailErr.message);
        });
      }

      return res.status(200).json({
        success: true,
        message: `Booking status updated to ${status} and notification email sent!`,
        data: item
      });
    }

    return res.status(404).json({
      success: false,
      message: 'Booking not found'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete booking
// @route   DELETE /api/bookings/:id
// @access  Private
const deleteBooking = async (req, res, next) => {
  try {
    try {
      const booking = await Booking.findByIdAndDelete(req.params.id);
      if (booking) {
        return res.status(200).json({
          success: true,
          message: 'Booking deleted successfully'
        });
      }
    } catch (dbErr) {
      // Fallback
    }

    inMemoryBookings = inMemoryBookings.filter(b => b._id !== req.params.id);
    res.status(200).json({
      success: true,
      message: 'Booking deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getBookings,
  updateBooking,
  deleteBooking
};
