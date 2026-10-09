const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const Gallery = require('../models/Gallery');

// Generate JWT token
const generateToken = (id, username, role) => {
  return jwt.sign(
    { id, username, role },
    process.env.JWT_SECRET || 'jai_sai_travels_super_secure_jwt_secret_key_2026',
    { expiresIn: '7d' }
  );
};

// @desc    Admin login
// @route   POST /api/admin/login
// @access  Public
const loginAdmin = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both username and password'
      });
    }

    // Find admin by username or email (case-insensitive)
    const trimmed = username.trim();
    const safeRegex = new RegExp(`^${trimmed.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}$`, 'i');

    const admin = await Admin.findOne({
      $or: [
        { username: safeRegex },
        { email: trimmed.toLowerCase() }
      ]
    });

    // Support default fallback admin if database is not yet seeded
    if (!admin && (username === 'admin' || username === 'admin@jaisaitravels.com') && password === 'Admin@12345') {
      const token = generateToken('fallback-admin-id', 'admin', 'admin');
      return res.status(200).json({
        success: true,
        message: 'Admin login successful (Default Admin)',
        token,
        admin: {
          id: 'fallback-admin-id',
          username: 'admin',
          email: 'admin@jaisaitravels.com',
          role: 'admin'
        }
      });
    }

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    const token = generateToken(admin._id, admin.username, admin.role);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Register admin (protected or initial setup)
// @route   POST /api/admin/register
// @access  Public or Protected
const registerAdmin = async (req, res, next) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide username, email and password'
      });
    }

    const adminExists = await Admin.findOne({
      $or: [{ username }, { email: email.toLowerCase() }]
    });

    if (adminExists) {
      return res.status(400).json({
        success: false,
        message: 'Admin with this username or email already exists'
      });
    }

    const admin = await Admin.create({
      username,
      email: email.toLowerCase(),
      password,
      role: role || 'admin'
    });

    const token = generateToken(admin._id, admin.username, admin.role);

    res.status(201).json({
      success: true,
      message: 'Admin registered successfully',
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get admin profile
// @route   GET /api/admin/profile
// @access  Private
const getAdminProfile = async (req, res, next) => {
  try {
    if (req.admin.id === 'fallback-admin-id') {
      return res.status(200).json({
        success: true,
        admin: req.admin
      });
    }

    const admin = await Admin.findById(req.admin._id).select('-password');
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    res.status(200).json({
      success: true,
      admin
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update admin profile
// @desc    Update admin profile
// @route   PUT /api/admin/profile
// @access  Private
const updateAdminProfile = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const mongoose = require('mongoose');

    let admin = null;
    const targetId = req.admin?._id || req.admin?.id;
    if (targetId && mongoose.Types.ObjectId.isValid(targetId)) {
      admin = await Admin.findById(targetId);
    }

    if (!admin && req.admin?.username) {
      admin = await Admin.findOne({
        $or: [
          { username: new RegExp(`^${req.admin.username}$`, 'i') },
          { email: req.admin.email ? req.admin.email.toLowerCase() : '' }
        ]
      });
    }

    if (!admin) {
      admin = await Admin.findOne();
    }

    if (!admin) {
      admin = new Admin({
        username: username ? username.trim() : 'admin',
        email: email ? email.trim().toLowerCase() : 'admin@jaisaitravels.com',
        password: password && password.trim() ? password.trim() : 'Admin@12345',
        role: 'admin'
      });
    } else {
      if (username && username.trim()) {
        const usernameExists = await Admin.findOne({
          username: new RegExp(`^${username.trim()}$`, 'i'),
          _id: { $ne: admin._id }
        });
        if (usernameExists) {
          return res.status(400).json({
            success: false,
            message: 'Username is already taken by another account.'
          });
        }
        admin.username = username.trim();
      }

      if (email && email.trim()) {
        const emailExists = await Admin.findOne({
          email: email.trim().toLowerCase(),
          _id: { $ne: admin._id }
        });
        if (emailExists) {
          return res.status(400).json({
            success: false,
            message: 'Email address is already used by another account.'
          });
        }
        admin.email = email.trim().toLowerCase();
      }

      if (password && password.trim()) {
        if (password.trim().length < 6) {
          return res.status(400).json({
            success: false,
            message: 'Password must be at least 6 characters long.'
          });
        }
        admin.password = password.trim();
      }
    }

    const updatedAdmin = await admin.save();
    const token = generateToken(updatedAdmin._id, updatedAdmin.username, updatedAdmin.role);

    return res.status(200).json({
      success: true,
      message: 'Admin profile and credentials updated successfully!',
      token,
      admin: {
        id: updatedAdmin._id,
        _id: updatedAdmin._id,
        username: updatedAdmin.username,
        email: updatedAdmin.email,
        role: updatedAdmin.role
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update admin profile.'
    });
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private
const getDashboardStats = async (req, res, next) => {
  try {
    const totalBookings = await Booking.countDocuments();
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });
    const confirmedBookings = await Booking.countDocuments({ status: 'confirmed' });
    const completedBookings = await Booking.countDocuments({ status: 'completed' });

    const totalServices = await Service.countDocuments();
    const activeServices = await Service.countDocuments({ isActive: true });

    const totalGallery = await Gallery.countDocuments();
    const totalImages = await Gallery.countDocuments({ type: 'image' });
    const totalVideos = await Gallery.countDocuments({ type: 'video' });

    const recentBookings = await Booking.find().sort({ createdAt: -1 }).limit(5);

    res.status(200).json({
      success: true,
      stats: {
        bookings: {
          total: totalBookings,
          pending: pendingBookings,
          confirmed: confirmedBookings,
          completed: completedBookings
        },
        services: {
          total: totalServices,
          active: activeServices
        },
        gallery: {
          total: totalGallery,
          images: totalImages,
          videos: totalVideos
        },
        recentBookings
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  loginAdmin,
  registerAdmin,
  getAdminProfile,
  updateAdminProfile,
  getDashboardStats
};
