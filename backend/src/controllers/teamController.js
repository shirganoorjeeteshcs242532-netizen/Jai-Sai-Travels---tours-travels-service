const mongoose = require('mongoose');
const TeamMember = require('../models/TeamMember');
const fs = require('fs');
const path = require('path');

// Default initial team members
const defaultTeamMembers = [
  {
    name: 'Jaykumar Sharma',
    role: 'Founder & Managing Director',
    experience: '21+ Years Experience (Since 2005)',
    bio: 'Visionary founder behind Jai Sai Travels, devoted to setting the highest industry standards for passenger safety, vehicle hygiene, and hospitality.',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80',
    order: 1,
    isActive: true
  },
  {
    name: 'Sangeeta Jaykumar',
    role: 'Operations & Customer Relations Head',
    experience: '16+ Years Experience',
    bio: 'Directs seamless daily dispatch operations, flight schedule tracking, and ensures 24/7 passenger comfort and customer delight.',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    order: 2,
    isActive: true
  },
  {
    name: 'Rajendra Verma',
    role: 'Fleet Maintenance & Safety Manager',
    experience: '18+ Years Experience',
    bio: 'Oversees rigorous Toyota mechanical inspections, preventative upkeep, and cabin sanitization protocols.',
    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80',
    order: 3,
    isActive: true
  },
  {
    name: 'Sunil Gaikwad',
    role: 'Senior Chauffeur & Route Strategist',
    experience: '15+ Years Experience',
    bio: 'Lead driver instructor specializing in highway safety, defensive driving protocols, and courteous customer hospitality.',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
    order: 4,
    isActive: true
  }
];

const normalizeMediaUrl = (url, baseUrl) => {
  if (!url) return '';
  if (url.startsWith('/uploads/')) return `${baseUrl}${url}`;
  if (url.includes('/uploads/')) return `${baseUrl}/uploads/${url.split('/uploads/')[1]}`;
  return url;
};

// @desc    Get all team members
// @route   GET /api/team
// @access  Public
const getTeamMembers = async (req, res, next) => {
  try {
    let members = await TeamMember.find({ isActive: true }).sort({ order: 1, createdAt: 1 });

    if (members.length === 0) {
      // Seed default team members if empty
      await TeamMember.insertMany(defaultTeamMembers);
      members = await TeamMember.find({ isActive: true }).sort({ order: 1, createdAt: 1 });
    }

    const host = req.get('host') || 'localhost:5000';
    const protocol = req.protocol || 'http';
    const baseUrl = `${protocol}://${host}`;

    const normalizedMembers = members.map(m => {
      const obj = m.toObject ? m.toObject() : { ...m };
      obj.image = normalizeMediaUrl(obj.image, baseUrl);
      return obj;
    });

    res.status(200).json({
      success: true,
      count: normalizedMembers.length,
      data: normalizedMembers
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single team member
// @route   GET /api/team/:id
// @access  Public
const getTeamMemberById = async (req, res, next) => {
  try {
    const member = await TeamMember.findById(req.params.id);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Team member not found'
      });
    }

    const host = req.get('host') || 'localhost:5000';
    const protocol = req.protocol || 'http';
    const baseUrl = `${protocol}://${host}`;

    const obj = member.toObject ? member.toObject() : { ...member };
    obj.image = normalizeMediaUrl(obj.image, baseUrl);

    res.status(200).json({
      success: true,
      data: obj
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new team member
// @route   POST /api/team
// @access  Private (Admin)
const createTeamMember = async (req, res, next) => {
  try {
    let { name, role, experience, bio, image, order, isActive } = req.body;

    if (req.file) {
      image = `/uploads/${req.file.filename}`;
    } else if (image && image.includes('/uploads/')) {
      image = '/uploads/' + image.split('/uploads/')[1];
    }

    if (!name || !role || !experience) {
      return res.status(400).json({
        success: false,
        message: 'Name, role, and experience are required'
      });
    }

    const newMember = await TeamMember.create({
      name,
      role,
      experience,
      bio: bio || '',
      image: image || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80',
      order: order ? Number(order) : 0,
      isActive: isActive !== undefined ? (isActive === true || isActive === 'true') : true
    });

    res.status(201).json({
      success: true,
      message: 'Team member created successfully',
      data: newMember
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update team member
// @route   PUT /api/team/:id
// @access  Private (Admin)
const updateTeamMember = async (req, res, next) => {
  try {
    let member = await TeamMember.findById(req.params.id);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Team member not found'
      });
    }

    if (req.file) {
      req.body.image = `/uploads/${req.file.filename}`;
    } else if (req.body.image && req.body.image.includes('/uploads/')) {
      req.body.image = '/uploads/' + req.body.image.split('/uploads/')[1];
    }

    if (req.body.order !== undefined) {
      req.body.order = Number(req.body.order);
    }
    if (req.body.isActive !== undefined) {
      req.body.isActive = req.body.isActive === true || req.body.isActive === 'true';
    }

    member = await TeamMember.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Team member updated successfully',
      data: member
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete team member
// @route   DELETE /api/team/:id
// @access  Private (Admin)
const deleteTeamMember = async (req, res, next) => {
  try {
    const member = await TeamMember.findById(req.params.id);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Team member not found'
      });
    }

    // Cleanup local uploaded photo if present
    if (member.image && member.image.includes('/uploads/')) {
      const filename = member.image.split('/uploads/')[1];
      if (filename) {
        const filePath = path.join(__dirname, '../../uploads', filename);
        if (fs.existsSync(filePath)) {
          try {
            fs.unlinkSync(filePath);
          } catch (e) {
            console.error('File cleanup error:', e.message);
          }
        }
      }
    }

    await TeamMember.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Team member deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTeamMembers,
  getTeamMemberById,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember
};
