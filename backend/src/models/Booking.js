const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true
  },
  email: {
    type: String,
    required: false,
    trim: true,
    lowercase: true,
    default: ''
  },
  phone: {
    type: String,
    required: [true, 'Contact phone is required'],
    trim: true
  },
  service: {
    type: String,
    required: [true, 'Service type is required']
  },
  date: {
    type: Date,
    required: [true, 'Travel date is required']
  },
  message: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed'],
    default: 'pending'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Booking', bookingSchema);
