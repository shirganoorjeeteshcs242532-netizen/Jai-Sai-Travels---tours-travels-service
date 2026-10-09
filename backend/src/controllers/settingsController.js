const Settings = require('../models/Settings');

// Default initial settings
const defaultSettings = {
  theme: 'theme-default',
  siteTitle: 'Jai Sai Travels - Tours & Travels Car Rental Service',
  tagline: 'Premier Luxury Car Rental & Tours • Since 2005',
  contactPhone: '+91 9224395804',
  contactPhone2: '+917349521107',
  whatsappPhone: '+91 9224395804',
  whatsappPhone2: '+917349521107',
  contactEmail: 'info@jaisaitravels.com',
  address: '1, New Link Rd, Bhagat Singh Nagar 1, Goregaon West, Mumbai, Maharashtra 400104',
  socialLinks: {
    facebook: 'https://facebook.com/jaisaitravels',
    instagram: 'https://instagram.com/jaisaitravels',
    youtube: 'https://youtube.com/@jaisaitravels',
    whatsapp: 'https://wa.me/919224395804?text=Hello%20Jai%20Sai%20Travels,%20I%20would%20like%20to%20enquire%20about%20your%20car%20rental%20and%20tour%20packages.',
    whatsapp2: 'https://wa.me/917349521107?text=Hello%20Jai%20Sai%20Travels,%20I%20would%20like%20to%20enquire%20about%20your%20car%20rental%20and%20tour%20packages.'
  },
  businessHours: 'Monday - Sunday: 24 Hours Open (24/7 Dispatch)',
  googleReviewUrl: 'https://share.google/Al7nlldXLMbIoH9Ih'
};

let inMemorySettings = { ...defaultSettings };

// @desc    Get current site settings
// @route   GET /api/settings
// @access  Public
const getSettings = async (req, res, next) => {
  try {
    try {
      let settings = await Settings.findOne();
      if (!settings) {
        settings = await Settings.create(defaultSettings);
      }
      return res.status(200).json({
        success: true,
        data: settings
      });
    } catch (dbErr) {
      return res.status(200).json({
        success: true,
        data: inMemorySettings
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update site settings
// @route   PUT /api/settings
// @access  Private
const updateSettings = async (req, res, next) => {
  try {
    try {
      let settings = await Settings.findOne();
      if (!settings) {
        settings = await Settings.create({ ...defaultSettings, ...req.body });
      } else {
        settings = await Settings.findByIdAndUpdate(
          settings._id,
          { ...req.body, updatedAt: Date.now() },
          { new: true, runValidators: true }
        );
      }
      return res.status(200).json({
        success: true,
        message: 'Settings updated successfully',
        data: settings
      });
    } catch (dbErr) {
      inMemorySettings = { ...inMemorySettings, ...req.body };
      return res.status(200).json({
        success: true,
        message: 'Settings updated successfully (In-Memory)',
        data: inMemorySettings
      });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSettings,
  updateSettings,
  defaultSettings
};
