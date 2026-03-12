const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');

// Configure AWS SDK
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

// Create S3 instance
const s3 = new AWS.S3();

// File type validation
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

// Configure multer for S3 upload
const uploadToS3 = (folderName) => {
  return multer({
    storage: multerS3({
      s3: s3,
      bucket: process.env.AWS_S3_BUCKET,
      acl: 'public-read',
      metadata: function (req, file, cb) {
        cb(null, { fieldName: file.fieldname });
      },
      key: function (req, file, cb) {
        const fileName = `${folderName}/${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;
        cb(null, fileName);
      }
    }),
    limits: {
      fileSize: 10 * 1024 * 1024 // 10MB file size limit
    },
    fileFilter: fileFilter
  });
};

// Create upload middleware for different types of files
const uploadConfig = {
  resume: uploadToS3('resumes'),
  profileImage: uploadToS3('profile-images'),
  companyLogo: uploadToS3('company-logos'),
  jobImage: uploadToS3('job-images')
};

module.exports = {
  s3,
  uploadConfig,
  getFileUrl: (key) => `${process.env.AWS_S3_BASE_URL}/${key}`
};
