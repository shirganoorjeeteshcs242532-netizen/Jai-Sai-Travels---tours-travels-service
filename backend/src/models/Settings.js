const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  theme: {
    type: String,
    default: 'theme-default'
  },
  siteTitle: {
    type: String,
    default: 'Jai Sai Travels - Tours & Travels Car Rental Service'
  },
  tagline: {
    type: String,
    default: 'Premier Luxury Car Rental & Tours • Since 2005'
  },
  contactPhone: {
    type: String,
    default: '+91 9224395804'
  },
  contactPhone2: {
    type: String,
    default: '+917349521107'
  },
  whatsappPhone: {
    type: String,
    default: '+91 9224395804'
  },
  whatsappPhone2: {
    type: String,
    default: '+917349521107'
  },
  contactEmail: {
    type: String,
    default: 'info@jaisaitravels.com'
  },
  address: {
    type: String,
    default: '1, New Link Rd, Bhagat Singh Nagar 1, Goregaon West, Mumbai, Maharashtra 400104'
  },
  socialLinks: {
    facebook: {
      type: String,
      default: 'https://facebook.com/jaisaitravels'
    },
    instagram: {
      type: String,
      default: 'https://instagram.com/jaisaitravels'
    },
    youtube: {
      type: String,
      default: 'https://youtube.com/@jaisaitravels'
    },
    whatsapp: {
      type: String,
      default: 'https://wa.me/919224395804?text=Hello%20Jai%20Sai%20Travels,%20I%20would%20like%20to%20enquire%20about%20your%20car%20rental%20and%20tour%20packages.'
    }
  },
  businessHours: {
    type: String,
    default: 'Monday - Sunday: 24 Hours Open'
  },
  googleReviewUrl: {
    type: String,
    default: 'https://share.google/Al7nlldXLMbIoH9Ih'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Settings', settingsSchema);
