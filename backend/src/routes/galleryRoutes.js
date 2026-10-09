const express = require('express');
const router = express.Router();
const {
  getGallery,
  getGalleryItemById,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
  bulkDeleteGallery
} = require('../controllers/galleryController');
const upload = require('../middleware/uploadMiddleware');
const { protect } = require('../middleware/authMiddleware');

// Public route to view gallery
router.get('/', getGallery);
router.get('/:id', getGalleryItemById);

// Admin-only protected routes for adding, updating and deleting gallery items
router.post('/', protect, upload.single('mediaFile'), createGalleryItem);
router.post('/bulk-delete', protect, bulkDeleteGallery);
router.put('/:id', protect, upload.single('mediaFile'), updateGalleryItem);
router.delete('/:id', protect, deleteGalleryItem);

module.exports = router;
