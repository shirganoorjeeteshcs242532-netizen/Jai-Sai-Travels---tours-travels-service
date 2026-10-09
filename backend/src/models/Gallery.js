const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Gallery item title is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['image', 'video'],
    default: 'image'
  },
  url: {
    type: String,
    required: [true, 'Media URL is required']
  },
  thumbnail: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    default: 'Fleet',
    trim: true
  },
  order: {
    type: Number,
    default: 0
  },
  isCover: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Gallery', gallerySchema);
