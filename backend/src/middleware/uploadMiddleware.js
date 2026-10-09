const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

// File filter for images (jpg, png, webp) and videos (mp4, webm)
const fileFilter = (req, file, cb) => {
  const allowedImageTypes = /jpeg|jpg|png|webp|gif/;
  const allowedVideoTypes = /mp4|webm|mkv|mov/;

  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
  const mimeType = file.mimetype;

  const isImage = allowedImageTypes.test(ext) || allowedImageTypes.test(mimeType);
  const isVideo = allowedVideoTypes.test(ext) || allowedVideoTypes.test(mimeType);

  if (isImage || isVideo) {
    return cb(null, true);
  } else {
    return cb(new Error('Only image (JPG, PNG, WebP) and video (MP4, WebM) files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB max for videos/images
  },
  fileFilter: fileFilter
});

module.exports = upload;
