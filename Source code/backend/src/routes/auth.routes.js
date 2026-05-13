import express from 'express';
import {
  register,
  login,
  refresh,
  getMe,
  logout,
  logoutAll,
  verifyEmail,
  resendOTP,
  forgotPassword,
  resetPassword,
  changePassword,
  getSessions,
  setupMFA,
  verifyAndEnableMFA,
  loginMFA,
  requestEmailOTP,
  verifyEmailOTP,
  sendSignupEmailOTP,
  verifySignupEmailOTP,
} from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authLimiter, registerLimiter, passwordResetLimiter, bruteForceProtection } from '../middleware/rateLimit.middleware.js';
import { validate, registerSchema, loginSchema, verifyOTPSchema, resendOTPSchema, forgotPasswordSchema, resetPasswordSchema, changePasswordSchema } from '../validators/schemas.js';

import passport from 'passport';
import { 
  generateAccessToken, 
  generateRefreshToken, 
  setTokenCookies 
} from '../middleware/auth.middleware.js';

const router = express.Router();

// Google OAuth Routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', 
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  async (req, res) => {
    try {
      const user = req.user;
      
      // Generate tokens
      const accessToken = generateAccessToken(user);
      const refreshTokenData = await generateRefreshToken(user, null, {
        ip: req.ip,
        userAgent: req.headers['user-agent'],
      });

      // Set cookies
      setTokenCookies(res, accessToken, refreshTokenData.token);

      // Redirect to frontend dashboard or onboarding
      // In production, use the environment variable for frontend URL
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const redirectPath = '/dashboard';
      
      res.redirect(`${frontendUrl}${redirectPath}?token=${accessToken}`);
    } catch (error) {
      console.error('Google Auth Callback Error:', error);
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=auth_failed`);
    }
  }
);

// Public routes with rate limiting
router.post('/register', registerLimiter, validate({ body: registerSchema }), register);
router.post('/login', authLimiter, bruteForceProtection, validate({ body: loginSchema }), login);
router.post('/send-otp', authLimiter, requestEmailOTP);
router.post('/verify-otp', authLimiter, verifyEmailOTP);
router.post('/send-signup-otp', authLimiter, sendSignupEmailOTP);
router.post('/verify-signup-otp', authLimiter, verifySignupEmailOTP);
router.post('/refresh', refresh);

// Email verification
router.post('/verify-email', validate({ body: verifyOTPSchema }), verifyEmail);
router.post('/resend-otp', validate({ body: resendOTPSchema }), resendOTP);

// Password reset
router.post('/forgot-password', passwordResetLimiter, validate({ body: forgotPasswordSchema }), forgotPassword);
router.post('/reset-password', passwordResetLimiter, validate({ body: resetPasswordSchema }), resetPassword);

// Protected routes
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);
router.post('/logout-all', protect, logoutAll);
router.post('/change-password', protect, validate({ body: changePasswordSchema }), changePassword);
router.get('/sessions', protect, getSessions);

// MFA Routes
router.post('/mfa/setup', protect, setupMFA);
router.post('/mfa/verify', protect, verifyAndEnableMFA);
router.post('/mfa/login', protect, loginMFA); // Needs protect because login returns partial token

export default router;
