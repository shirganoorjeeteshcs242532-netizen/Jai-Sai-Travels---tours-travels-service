const express = require('express');
const router = express.Router();
const {
  getTeamMembers,
  getTeamMemberById,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember
} = require('../controllers/teamController');
const upload = require('../middleware/uploadMiddleware');
const { protect } = require('../middleware/authMiddleware');

// Public route to view team leadership
router.get('/', getTeamMembers);
router.get('/:id', getTeamMemberById);

// Admin-only routes to add, edit, or delete team leadership
router.post('/', protect, upload.single('imageFile'), createTeamMember);
router.put('/:id', protect, upload.single('imageFile'), updateTeamMember);
router.delete('/:id', protect, deleteTeamMember);

module.exports = router;
