const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'jai_sai_travels_super_secure_jwt_secret_key_2026'
      );

      let admin = null;
      const mongoose = require('mongoose');

      // Try finding by MongoDB ObjectId first
      if (decoded.id && mongoose.Types.ObjectId.isValid(decoded.id)) {
        admin = await Admin.findById(decoded.id).select('-password');
      }

      // If not found by ID, try finding by username or email
      if (!admin && decoded.username) {
        admin = await Admin.findOne({
          $or: [
            { username: new RegExp(`^${decoded.username}$`, 'i') },
            { email: decoded.username.toLowerCase() }
          ]
        }).select('-password');
      }

      // If still not found and decoded was fallback admin, check if any DB admin exists
      if (!admin && decoded.id === 'fallback-admin-id') {
        admin = await Admin.findOne().select('-password');
      }

      if (admin) {
        req.admin = admin;
        req.admin.id = admin._id.toString();
        return next();
      }

      // Fallback in-memory admin support if no record in DB
      if (decoded.id === 'fallback-admin-id' || decoded.username === 'admin') {
        req.admin = {
          _id: 'fallback-admin-id',
          id: 'fallback-admin-id',
          username: 'admin',
          email: 'admin@jaisaitravels.com',
          role: 'admin'
        };
        return next();
      }

      return res.status(401).json({ success: false, message: 'User not found or authorization revoked' });
    } catch (error) {
      console.error('Auth verification error:', error.message);
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }
};

module.exports = { protect };
