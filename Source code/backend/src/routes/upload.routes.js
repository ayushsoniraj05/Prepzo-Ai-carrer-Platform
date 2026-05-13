import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { protect } from '../middleware/auth.middleware.js';
import { uploadLimiter } from '../middleware/rateLimit.middleware.js';
import { securityConfig } from '../config/security.config.js';
import AuditLog from '../models/AuditLog.model.js';
import User from '../models/User.model.js';

const router = express.Router();

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads/resumes');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

/**
 * Secure filename generator
 */
const generateSecureFilename = (userId, originalName) => {
  const timestamp = Date.now();
  const randomBytes = crypto.randomBytes(8).toString('hex');
  const ext = path.extname(originalName).toLowerCase();
  return `${userId}_${timestamp}_${randomBytes}${ext}`;
};

/**
 * Validate file extension matches content type
 */
const validateFileExtension = (filename, mimetype) => {
  const ext = path.extname(filename).toLowerCase();
  const mimeToExt = {
    'application/pdf': ['.pdf'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  };
  
  const allowedExts = mimeToExt[mimetype] || [];
  return allowedExts.includes(ext);
};

/**
 * Check for blocked file extensions
 */
const isBlockedExtension = (filename) => {
  const ext = path.extname(filename).toLowerCase();
  return securityConfig.upload.blockedExtensions.includes(ext);
};

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const userId = req.user?.id || 'unknown';
    const secureFilename = generateSecureFilename(userId, file.originalname);
    cb(null, secureFilename);
  },
});

// Enhanced file filter with security checks
const fileFilter = (req, file, cb) => {
  // Check for blocked extensions
  if (isBlockedExtension(file.originalname)) {
    return cb(new Error('File type not allowed for security reasons'), false);
  }

  // Check allowed MIME types
  const allowedTypes = securityConfig.upload.allowedMimeTypes.resume;
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error('Invalid file type. Only PDF, DOC, and DOCX files are allowed.'), false);
  }

  // Validate extension matches MIME type
  if (!validateFileExtension(file.originalname, file.mimetype)) {
    return cb(new Error('File extension does not match content type'), false);
  }

  cb(null, true);
};

// Configure multer with security settings
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: securityConfig.upload.maxFileSize,
    files: 1, // Only allow one file at a time
    fields: 5, // Limit form fields
  },
});

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: `File too large. Maximum size is ${securityConfig.upload.maxFileSize / 1024 / 1024}MB`,
        code: 'FILE_TOO_LARGE',
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected file field',
        code: 'UNEXPECTED_FILE',
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message,
      code: 'UPLOAD_ERROR',
    });
  }
  
  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
      code: 'UPLOAD_ERROR',
    });
  }
  
  next();
};

/**
 * @desc    Upload resume securely
 * @route   POST /api/upload/resume
 * @access  Private
 */
router.post('/resume', protect, uploadLimiter, (req, res, next) => {
  upload.single('resume')(req, res, (err) => handleMulterError(err, req, res, next));
}, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
        code: 'NO_FILE',
      });
    }

    // Additional security: Read first few bytes to verify file type
    const fileBuffer = fs.readFileSync(req.file.path);
    const fileSignature = fileBuffer.slice(0, 4).toString('hex');
    
    // PDF starts with %PDF (25 50 44 46)
    // DOC starts with D0 CF 11 E0
    // DOCX/ZIP starts with 50 4B 03 04
    const validSignatures = ['25504446', 'd0cf11e0', '504b0304'];
    const isValidSignature = validSignatures.some(sig => 
      fileSignature.toLowerCase().startsWith(sig.substring(0, fileSignature.length))
    );

    if (!isValidSignature) {
      // Delete the suspicious file
      fs.unlinkSync(req.file.path);
      
      await AuditLog.log({
        userId: req.user._id,
        userEmail: req.user.email,
        action: 'file_uploaded',
        category: 'security',
        severity: 'high',
        status: 'failure',
        description: 'Uploaded file failed signature verification',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        metadata: {
          originalName: req.file.originalname,
          mimetype: req.file.mimetype,
          signature: fileSignature,
        },
      });

      return res.status(400).json({
        success: false,
        message: 'Invalid file content',
        code: 'INVALID_FILE_CONTENT',
      });
    }

    // Generate the URL for the uploaded file
    const resumeUrl = `/uploads/resumes/${req.file.filename}`;

    // Update user's resume URL in database
    const user = await User.findById(req.user.id);
    if (!user) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({
        success: false,
        message: 'User not found',
        code: 'USER_NOT_FOUND',
      });
    }

    // Delete old resume file if exists
    if (user.resumeUrl) {
      const oldFilePath = path.join(__dirname, '../..', user.resumeUrl);
      if (fs.existsSync(oldFilePath)) {
        try {
          fs.unlinkSync(oldFilePath);
        } catch (e) {
          console.error('Failed to delete old resume:', e);
        }
      }
    }

    // Update user with new resume URL
    user.resumeUrl = resumeUrl;
    user.resumeOriginalName = req.file.originalname;
    user.resumeUploadedAt = new Date();
    await user.save();

    // Log successful upload
    await AuditLog.log({
      userId: req.user._id,
      userEmail: req.user.email,
      action: 'file_uploaded',
      category: 'data',
      severity: 'low',
      status: 'success',
      description: 'Resume uploaded successfully',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      metadata: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
      },
    });

    res.json({
      success: true,
      message: 'Resume uploaded successfully',
      resumeUrl,
      originalName: req.file.originalname,
      size: req.file.size,
    });
  } catch (error) {
    console.error('Resume upload error:', error);
    
    // Clean up uploaded file on error
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload resume',
      code: 'SERVER_ERROR',
    });
  }
});

/**
 * @desc    Delete resume
 * @route   DELETE /api/upload/resume
 * @access  Private
 */
router.delete('/resume', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        code: 'USER_NOT_FOUND',
      });
    }

    if (user.resumeUrl) {
      // Delete file from filesystem
      const filePath = path.join(__dirname, '../..', user.resumeUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      // Clear resume fields in database
      user.resumeUrl = '';
      user.resumeText = '';
      user.resumeOriginalName = '';
      user.resumeUploadedAt = null;
      await user.save();

      await AuditLog.log({
        userId: req.user._id,
        userEmail: req.user.email,
        action: 'file_deleted',
        category: 'data',
        severity: 'low',
        status: 'success',
        description: 'Resume deleted',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });
    }

    res.json({
      success: true,
      message: 'Resume deleted successfully',
    });
  } catch (error) {
    console.error('Resume delete error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete resume',
      code: 'SERVER_ERROR',
    });
  }
});

/**
 * @desc    Get resume info
 * @route   GET /api/upload/resume
 * @access  Private
 */
router.get('/resume', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        code: 'USER_NOT_FOUND',
      });
    }

    res.json({
      success: true,
      resumeUrl: user.resumeUrl || null,
      originalName: user.resumeOriginalName || null,
      uploadedAt: user.resumeUploadedAt || null,
    });
  } catch (error) {
    console.error('Get resume error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get resume info',
      code: 'SERVER_ERROR',
    });
  }
});

export default router;
