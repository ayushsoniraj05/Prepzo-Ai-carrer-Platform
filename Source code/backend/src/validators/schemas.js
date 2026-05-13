import { z } from 'zod';
import { commonPasswords } from '../config/security.config.js';

/**
 * Custom password validation
 * Enforces 8-parameter strong password rule:
 * 1. Minimum length (8 characters)
 * 2. Maximum length (128 characters)
 * 3. At least one uppercase letter
 * 4. At least one lowercase letter
 * 5. At least one number
 * 6. At least one special character
 * 7. No spaces
 * 8. Not a common password
 */
const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters long')
  .max(128, 'Password must be at most 128 characters long')
  .refine((password) => /[A-Z]/.test(password), {
    message: 'Password must contain at least one uppercase letter',
  })
  .refine((password) => /[a-z]/.test(password), {
    message: 'Password must contain at least one lowercase letter',
  })
  .refine((password) => /[0-9]/.test(password), {
    message: 'Password must contain at least one number',
  })
  .refine((password) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password), {
    message: 'Password must contain at least one special character (!@#$%^&*()_+-=[]{};\':"|,.<>/?)',
  })
  .refine((password) => !/\s/.test(password), {
    message: 'Password cannot contain spaces',
  })
  .refine((password) => !commonPasswords.includes(password.toLowerCase()), {
    message: 'Password is too common. Please choose a stronger password',
  });

// Email schema with sanitization
const emailSchema = z.string()
  .email('Please provide a valid email address')
  .min(5, 'Email must be at least 5 characters')
  .max(255, 'Email must be at most 255 characters')
  .transform((email) => email.toLowerCase().trim());

// Phone schema
const phoneSchema = z.string()
  .min(10, 'Phone number must be at least 10 digits')
  .max(15, 'Phone number must be at most 15 digits')
  .regex(/^[\d\s\+\-\(\)]+$/, 'Please provide a valid phone number');

// Name schema with sanitization
const nameSchema = z.string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name must be at most 100 characters')
  .regex(/^[a-zA-Z\s\-'\.]+$/, 'Name can only contain letters, spaces, hyphens, apostrophes, and periods')
  .transform((name) => name.trim());

// URL schemas
const urlSchema = z.string()
  .url('Please provide a valid URL')
  .max(500, 'URL must be at most 500 characters')
  .optional()
  .or(z.literal(''));

const linkedinSchema = z.string()
  .max(500, 'LinkedIn URL must be at most 500 characters')
  .refine((url) => !url || url.includes('linkedin.com'), {
    message: 'Please provide a valid LinkedIn URL',
  })
  .optional()
  .or(z.literal(''));

const githubSchema = z.string()
  .max(500, 'GitHub URL must be at most 500 characters')
  .refine((url) => !url || url.includes('github.com'), {
    message: 'Please provide a valid GitHub URL',
  })
  .optional()
  .or(z.literal(''));

// Date schema
const dateOfBirthSchema = z.string()
  .regex(/^\d{4}-\d{2}-\d{2}$|^\d{2}\/\d{2}\/\d{4}$/, 'Please provide a valid date')
  .refine((date) => {
    const parsed = new Date(date);
    const now = new Date();
    const age = (now.getTime() - parsed.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
    return age >= 13 && age <= 120;
  }, {
    message: 'Please provide a valid date of birth (must be at least 13 years old)',
  });

// Gender schema
const genderSchema = z.enum(
  ['Male', 'Female', 'Non-binary', 'Prefer not to say', 'Other', 'male', 'female', 'non-binary', 'prefer not to say', 'other'],
  { errorMap: () => ({ message: 'Please select a valid gender option' }) }
);

// Sanitize string to prevent XSS and injection
const sanitizedString = (minLength = 1, maxLength = 255) =>
  z.string()
    .min(minLength, `Must be at least ${minLength} characters`)
    .max(maxLength, `Must be at most ${maxLength} characters`)
    .transform((str) => str.trim().replace(/[<>]/g, ''));

// ==================== AUTH SCHEMAS ====================

export const registerSchema = z.object({
  fullName: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  dateOfBirth: dateOfBirthSchema,
  gender: genderSchema,
  collegeName: sanitizedString(2, 200),
  degree: sanitizedString(2, 100),
  fieldOfStudy: sanitizedString(2, 100),
  yearOfStudy: sanitizedString(1, 50),
  targetRole: sanitizedString(2, 100),
  knownTechnologies: z.union([
    z.string().transform((str) => str.split(',').map((t) => t.trim()).filter(Boolean)),
    z.array(z.string()).max(50, 'Cannot have more than 50 technologies'),
  ]).optional(),
  linkedin: linkedinSchema,
  github: githubSchema,
  password: passwordSchema,
}).strict(); // Reject unknown fields

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional().default(false),
}).strict();

export const verifyOTPSchema = z.object({
  email: emailSchema,
  otp: z.string()
    .length(6, 'OTP must be exactly 6 digits')
    .regex(/^\d{6}$/, 'OTP must contain only numbers'),
  type: z.enum(['email_verification', 'password_reset', 'two_factor', 'login_verification']),
}).strict();

export const resendOTPSchema = z.object({
  email: emailSchema,
  type: z.enum(['email_verification', 'password_reset', 'two_factor', 'login_verification']),
}).strict();

export const forgotPasswordSchema = z.object({
  email: emailSchema,
}).strict();

export const resetPasswordSchema = z.object({
  email: emailSchema,
  otp: z.string().length(6, 'OTP must be exactly 6 digits'),
  newPassword: passwordSchema,
  confirmPassword: z.string(),
}).strict().refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
  confirmPassword: z.string(),
}).strict().refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: 'New password must be different from current password',
  path: ['newPassword'],
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().optional(), // Can come from cookie
}).strict();

// ==================== USER SCHEMAS ====================

export const updateProfileSchema = z.object({
  fullName: nameSchema.optional(),
  phone: phoneSchema.optional(),
  collegeName: sanitizedString(2, 200).optional(),
  degree: sanitizedString(2, 100).optional(),
  fieldOfStudy: sanitizedString(2, 100).optional(),
  yearOfStudy: sanitizedString(1, 50).optional(),
  cgpa: z.string().max(10).optional(),
  targetRole: sanitizedString(2, 100).optional(),
  knownTechnologies: z.array(z.string().max(50)).max(50).optional(),
  skillRatings: z.record(z.number().min(1).max(10)).optional(),
  placementTimeline: z.string().max(50).optional(),
  expectedCtc: z.string().max(50).optional(),
  preferredCompanies: z.array(z.string().max(100)).max(20).optional(),
  linkedin: linkedinSchema,
  github: githubSchema,
}).strict();

export const onboardingSchema = z.object({
  collegeName: sanitizedString(2, 200).optional(),
  degree: sanitizedString(2, 100).optional(),
  fieldOfStudy: sanitizedString(2, 100).optional(),
  yearOfStudy: sanitizedString(1, 50).optional(),
  cgpa: z.string().max(10).optional(),
  targetRole: sanitizedString(2, 100).optional(),
  skillRatings: z.record(z.number().min(1).max(10)).optional(),
  placementTimeline: z.string().max(50).optional(),
  expectedCtc: z.string().max(50).optional(),
  preferredCompanies: z.array(z.string().max(100)).max(20).optional(),
}).strict();

// ==================== TEST SCHEMAS ====================

export const startTestSchema = z.object({
  testType: z.enum(['field_based', 'role_based', 'custom']).optional(),
  field: sanitizedString(2, 100).optional(),
  degree: sanitizedString(2, 100).optional(),
  targetRole: sanitizedString(2, 100).optional(),
  totalDuration: z.number().min(1).max(300).optional(),
  totalQuestions: z.number().min(1).max(500).optional(),
  sections: z.array(z.object({
    id: z.string(),
    name: z.string(),
  })).optional(),
  isProctoringEnabled: z.boolean().optional(),
}).strict();

export const submitAnswerSchema = z.object({
  sectionId: z.string().min(1),
  questionId: z.string().min(1),
  answer: z.union([z.string(), z.number(), z.array(z.string())]),
  timeTaken: z.number().min(0).optional(),
}).strict();

export const addViolationSchema = z.object({
  type: z.enum([
    'multiple_faces', 'no_face', 'tab_switch', 'fullscreen_exit',
    'devtools_open', 'copy_paste', 'right_click', 'background_noise',
    'camera_blocked', 'microphone_blocked', 'screen_share_stopped',
  ]),
  description: z.string().max(500).optional(),
  severity: z.enum(['warning', 'critical']).optional(),
}).strict();

// ==================== ADMIN SCHEMAS ====================

export const adminUserSearchSchema = z.object({
  search: z.string().max(100).optional(),
  role: z.enum(['student', 'admin', 'superadmin']).optional(),
  isOnboarded: z.boolean().optional(),
  isAssessmentComplete: z.boolean().optional(),
  page: z.number().min(1).optional().default(1),
  limit: z.number().min(1).max(100).optional().default(20),
  sortBy: z.string().optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
}).strict();

export const adminUpdateUserSchema = z.object({
  role: z.enum(['student', 'admin', 'superadmin']).optional(),
  isAccountLocked: z.boolean().optional(),
  isEmailVerified: z.boolean().optional(),
}).strict();

// ==================== MONGODB OBJECT ID SCHEMA ====================

export const objectIdSchema = z.string().regex(/^[a-fA-F0-9]{24}$/, 'Invalid ID format');

export const objectIdParamSchema = z.object({
  id: objectIdSchema,
});

export const sessionIdParamSchema = z.object({
  sessionId: objectIdSchema,
});

// ==================== VALIDATION HELPER ====================

/**
 * Middleware factory for validating request data
 * @param {Object} schemas - Object containing body, query, params schemas
 * @returns {Function} Express middleware
 */
export const validate = (schemas) => {
  return async (req, res, next) => {
    try {
      const errors = [];

      // Validate body
      if (schemas.body) {
        const result = schemas.body.safeParse(req.body);
        if (!result.success) {
          errors.push(...result.error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
            location: 'body',
          })));
        } else {
          req.body = result.data;
        }
      }

      // Validate query
      if (schemas.query) {
        const result = schemas.query.safeParse(req.query);
        if (!result.success) {
          errors.push(...result.error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
            location: 'query',
          })));
        } else {
          req.query = result.data;
        }
      }

      // Validate params
      if (schemas.params) {
        const result = schemas.params.safeParse(req.params);
        if (!result.success) {
          errors.push(...result.error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
            location: 'params',
          })));
        } else {
          req.params = result.data;
        }
      }

      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors,
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default {
  registerSchema,
  loginSchema,
  verifyOTPSchema,
  resendOTPSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  refreshTokenSchema,
  updateProfileSchema,
  onboardingSchema,
  startTestSchema,
  submitAnswerSchema,
  addViolationSchema,
  adminUserSearchSchema,
  adminUpdateUserSchema,
  objectIdSchema,
  objectIdParamSchema,
  sessionIdParamSchema,
  validate,
};
