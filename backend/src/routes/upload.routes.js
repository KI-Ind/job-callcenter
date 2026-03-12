const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { uploadFile, deleteFile } = require('../controllers/upload.controller');
const { protect } = require('../middlewares/auth.middleware');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for local storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create specific folders for different file types
    let folder = 'general';
    if (req.originalUrl.includes('/resume')) folder = 'resumes';
    if (req.originalUrl.includes('/profile-image')) folder = 'profile-images';
    if (req.originalUrl.includes('/company-logo')) folder = 'company-logos';
    if (req.originalUrl.includes('/job-image')) folder = 'job-images';
    
    const dir = path.join(uploadsDir, folder);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// File filter to allow only certain file types
const fileFilter = (req, file, cb) => {
  const allowedFileTypes = [
    'image/jpeg', 
    'image/jpg', 
    'image/png', 
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  if (allowedFileTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, PDF, and DOC/DOCX files are allowed.'), false);
  }
};

// Create upload middleware
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB file size limit
  },
  fileFilter: fileFilter
});

// Upload resume
router.post('/resume', protect, upload.single('resume'), uploadFile);

// Upload profile image
router.post('/profile-image', protect, upload.single('profileImage'), uploadFile);

// Upload company logo
router.post('/company-logo', protect, upload.single('companyLogo'), uploadFile);

// Upload job image
router.post('/job-image', protect, upload.single('jobImage'), uploadFile);

// Delete file
router.delete('/:key', protect, deleteFile);

module.exports = router;
