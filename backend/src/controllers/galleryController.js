const mongoose = require('mongoose');
const Gallery = require('../models/Gallery');
const fs = require('fs');
const path = require('path');

// Default initial gallery items fallback
const defaultGalleryItems = [
  {
    _id: 'default-gal-1',
    title: 'Toyota Innova Crysta Luxury Fleet',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=400&q=80',
    category: 'Fleet',
    order: 1,
    isCover: true,
    createdAt: new Date()
  },
  {
    _id: 'default-gal-2',
    title: 'Spacious Captain Seats Interior',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=400&q=80',
    category: 'Interior',
    order: 2,
    isCover: false,
    createdAt: new Date()
  },
  {
    _id: 'default-gal-3',
    title: 'Scenic Hill Station Outstation Tour',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=400&q=80',
    category: 'Tours',
    order: 3,
    isCover: false,
    createdAt: new Date()
  },
  {
    _id: 'default-gal-4',
    title: 'Premium Wedding Convoy Experience',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=400&q=80',
    category: 'Events',
    order: 4,
    isCover: false,
    createdAt: new Date()
  },
  {
    _id: 'default-gal-5',
    title: 'Airport Transfer On-Time Service',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=400&q=80',
    category: 'Airport',
    order: 5,
    isCover: false,
    createdAt: new Date()
  },
  {
    _id: 'default-gal-6',
    title: 'Jai Sai Travels Luxury Journey Experience',
    type: 'video',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=400&q=80',
    category: 'Videos',
    order: 6,
    isCover: false,
    createdAt: new Date()
  }
];

const normalizeMediaUrl = (url, baseUrl) => {
  if (!url) return '';
  if (url.startsWith('/uploads/')) return `${baseUrl}${url}`;
  if (url.includes('/uploads/')) return `${baseUrl}/uploads/${url.split('/uploads/')[1]}`;
  return url;
};

// @desc    Get all gallery items
// @route   GET /api/gallery
// @access  Public
const getGallery = async (req, res, next) => {
  try {
    const { category, type } = req.query;
    const filter = {};

    if (category && category !== 'All') {
      filter.category = new RegExp(category, 'i');
    }
    if (type && type !== 'All') {
      filter.type = type;
    }

    const host = req.get('host') || 'localhost:5000';
    const protocol = req.protocol || 'http';
    const baseUrl = `${protocol}://${host}`;

    let items = await Gallery.find(filter).sort({ order: 1, createdAt: -1 });

    if (items.length === 0 && (!category || category === 'All') && (!type || type === 'All')) {
      items = defaultGalleryItems;
    }

    const normalizedItems = items.map(item => {
      const obj = item.toObject ? item.toObject() : { ...item };
      obj.url = normalizeMediaUrl(obj.url, baseUrl);
      obj.thumbnail = normalizeMediaUrl(obj.thumbnail || obj.url, baseUrl);
      return obj;
    });

    res.status(200).json({
      success: true,
      count: normalizedItems.length,
      data: normalizedItems
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single gallery item
// @route   GET /api/gallery/:id
// @access  Public
const getGalleryItemById = async (req, res, next) => {
  try {
    const item = await Gallery.findById(req.params.id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Gallery item not found'
      });
    }

    const host = req.get('host') || 'localhost:5000';
    const protocol = req.protocol || 'http';
    const baseUrl = `${protocol}://${host}`;

    const obj = item.toObject ? item.toObject() : { ...item };
    obj.url = normalizeMediaUrl(obj.url, baseUrl);
    obj.thumbnail = normalizeMediaUrl(obj.thumbnail || obj.url, baseUrl);

    res.status(200).json({
      success: true,
      data: obj
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create gallery item (upload or URL)
// @route   POST /api/gallery
// @access  Private
const createGalleryItem = async (req, res, next) => {
  try {
    let { title, type, url, thumbnail, category, order, isCover } = req.body;

    // Handle file upload if present
    if (req.file) {
      const relativeUrl = `/uploads/${req.file.filename}`;
      url = relativeUrl;
      const isVideo = req.file.mimetype.startsWith('video');
      type = isVideo ? 'video' : 'image';
      if (!thumbnail && !isVideo) {
        thumbnail = relativeUrl;
      }
    }

    if (!title || !url) {
      return res.status(400).json({
        success: false,
        message: 'Title and Media URL / file are required'
      });
    }

    // If marked as cover, unmark existing covers
    if (isCover === true || isCover === 'true') {
      await Gallery.updateMany({}, { isCover: false });
    }

    const newItem = await Gallery.create({
      title,
      type: type || 'image',
      url,
      thumbnail: thumbnail || url,
      category: category || 'Fleet',
      order: order ? Number(order) : 0,
      isCover: isCover === true || isCover === 'true'
    });

    res.status(201).json({
      success: true,
      message: 'Gallery item created successfully',
      data: newItem
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update gallery item
// @route   PUT /api/gallery/:id
// @access  Private
const updateGalleryItem = async (req, res, next) => {
  try {
    let item = await Gallery.findById(req.params.id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Gallery item not found'
      });
    }

    // Handle file upload if replaced
    if (req.file) {
      const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
      req.body.url = fileUrl;
      const isVideo = req.file.mimetype.startsWith('video');
      req.body.type = isVideo ? 'video' : 'image';
      if (!isVideo) {
        req.body.thumbnail = fileUrl;
      }

      // Cleanup old uploaded file if it was a local upload
      if (item.url && item.url.includes('/uploads/')) {
        const oldFilename = item.url.split('/uploads/')[1];
        if (oldFilename && oldFilename !== req.file.filename) {
          const oldFilePath = path.join(__dirname, '../../uploads', oldFilename);
          if (fs.existsSync(oldFilePath)) {
            try {
              fs.unlinkSync(oldFilePath);
            } catch (e) {
              console.error('File cleanup error:', e.message);
            }
          }
        }
      }
    } else if (req.body.url) {
      const isVideo = req.body.type === 'video' || (!req.body.type && item.type === 'video');
      if (!isVideo) {
        req.body.thumbnail = req.body.url;
      }
    }

    if (req.body.isCover === true || req.body.isCover === 'true') {
      await Gallery.updateMany({ _id: { $ne: req.params.id } }, { isCover: false });
    }

    item = await Gallery.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Gallery item updated successfully',
      data: item
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete single gallery item
// @route   DELETE /api/gallery/:id
// @access  Public / Admin
const deleteGalleryItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    let item = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      item = await Gallery.findById(id);
    } else {
      item = await Gallery.findOne({ _id: id });
    }

    if (!item) {
      // In case it's a fallback item not present in database
      return res.status(200).json({
        success: true,
        message: 'Gallery item removed'
      });
    }

    // If local uploaded file, delete from filesystem
    if (item.url && item.url.includes('/uploads/')) {
      const filename = item.url.split('/uploads/')[1];
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

    if (mongoose.Types.ObjectId.isValid(id)) {
      await Gallery.findByIdAndDelete(id);
    } else {
      await Gallery.deleteOne({ _id: id });
    }

    res.status(200).json({
      success: true,
      message: 'Gallery item deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk delete gallery items
// @route   POST /api/gallery/bulk-delete
// @access  Public / Admin
const bulkDeleteGallery = async (req, res, next) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of gallery IDs to delete'
      });
    }

    const validObjectIds = ids.filter(id => mongoose.Types.ObjectId.isValid(id));

    // Clean up local files
    if (validObjectIds.length > 0) {
      const itemsToDelete = await Gallery.find({ _id: { $in: validObjectIds } });
      itemsToDelete.forEach(item => {
        if (item.url && item.url.includes('/uploads/')) {
          const filename = item.url.split('/uploads/')[1];
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
      });

      const result = await Gallery.deleteMany({ _id: { $in: validObjectIds } });

      return res.status(200).json({
        success: true,
        message: `${result.deletedCount || ids.length} gallery items deleted successfully`,
        deletedCount: result.deletedCount
      });
    }

    res.status(200).json({
      success: true,
      message: `${ids.length} gallery items deleted successfully`,
      deletedCount: ids.length
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getGallery,
  getGalleryItemById,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
  bulkDeleteGallery
};
