import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.model.js';
import RefreshToken from '../models/RefreshToken.model.js';
import AuditLog from '../models/AuditLog.model.js';
import { securityConfig } from '../config/security.config.js';

/**
 * JWT Token Service
 * Handles access token and refresh token generation/validation
 */

/**
 * Generate Access Token
 * @param {Object} user - User object
 * @returns {string} JWT access token
 */
export const generateAccessToken = (user) => {
  const payload = {
    id: user._id || user.id,
    email: user.email,
    role: user.role || 'student',
    type: 'access',
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: securityConfig.jwt.accessTokenExpiry,
    issuer: securityConfig.jwt.issuer,
    audience: securityConfig.jwt.audience,
    algorithm: securityConfig.jwt.algorithm,
  });
};

/**
 * Generate Refresh Token
 * @param {Object} user - User object
 * @param {string} tokenFamily - Token family for rotation tracking
 * @param {Object} requestInfo - Request information for logging
 * @returns {Object} Refresh token data
 */
export const generateRefreshToken = async (user, tokenFamily = null, requestInfo = {}) => {
  // Generate token family if not provided (new login)
  const family = tokenFamily || crypto.randomBytes(16).toString('hex');
  
  const payload = {
    id: user._id || user.id,
    family,
    type: 'refresh',
  };

  const token = jwt.sign(payload, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, {
    expiresIn: securityConfig.jwt.refreshTokenExpiry,
    issuer: securityConfig.jwt.issuer,
    audience: securityConfig.jwt.audience,
  });

  // Calculate expiry date
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  // Parse user agent for device info
  const deviceInfo = parseUserAgent(requestInfo.userAgent || '');

  // Store refresh token in database
  const refreshTokenDoc = await RefreshToken.create({
    userId: user._id || user.id,
    token: hashToken(token),
    tokenFamily: family,
    expiresAt,
    createdByIp: requestInfo.ip || '',
    userAgent: requestInfo.userAgent || '',
    deviceInfo,
  });

  return {
    token,
    expiresAt,
    tokenId: refreshTokenDoc._id,
    tokenFamily: family,
  };
};

/**
 * Hash token for secure storage
 */
const hashToken = (token) => {
  return crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
};

/**
 * Parse user agent string
 */
const parseUserAgent = (userAgent) => {
  const result = {
    browser: 'Unknown',
    os: 'Unknown',
    device: 'Unknown',
  };

  if (!userAgent) return result;

  // Simple parsing
  if (userAgent.includes('Chrome')) result.browser = 'Chrome';
  else if (userAgent.includes('Firefox')) result.browser = 'Firefox';
  else if (userAgent.includes('Safari')) result.browser = 'Safari';
  else if (userAgent.includes('Edge')) result.browser = 'Edge';

  if (userAgent.includes('Windows')) result.os = 'Windows';
  else if (userAgent.includes('Mac')) result.os = 'MacOS';
  else if (userAgent.includes('Linux')) result.os = 'Linux';
  else if (userAgent.includes('Android')) result.os = 'Android';
  else if (userAgent.includes('iOS') || userAgent.includes('iPhone')) result.os = 'iOS';

  if (userAgent.includes('Mobile')) result.device = 'Mobile';
  else if (userAgent.includes('Tablet')) result.device = 'Tablet';
  else result.device = 'Desktop';

  return result;
};

/**
 * Verify Access Token
 */
export const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET, {
    issuer: securityConfig.jwt.issuer,
    audience: securityConfig.jwt.audience,
    algorithms: [securityConfig.jwt.algorithm],
  });
};

/**
 * Verify Refresh Token
 */
export const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, {
    issuer: securityConfig.jwt.issuer,
    audience: securityConfig.jwt.audience,
  });
};

/**
 * Refresh tokens - rotate refresh token and issue new access token
 */
export const refreshTokens = async (refreshToken, requestInfo = {}) => {
  try {
    const decoded = verifyRefreshToken(refreshToken);
    const hashedToken = hashToken(refreshToken);
    const tokenDoc = await RefreshToken.findOne({
      token: hashedToken,
      userId: decoded.id,
    });

    if (!tokenDoc) {
      // Token not found - possible token reuse attack
      if (decoded.family) {
        await RefreshToken.revokeTokenFamily(decoded.family, 'security_breach');
        
        await AuditLog.log({
          userId: decoded.id,
          action: 'token_revoked',
          category: 'security',
          severity: 'critical',
          status: 'warning',
          description: 'Possible refresh token reuse detected - all sessions revoked',
          ipAddress: requestInfo.ip,
          userAgent: requestInfo.userAgent,
          metadata: { tokenFamily: decoded.family },
        });
      }
      throw new Error('Invalid refresh token');
    }

    if (!tokenDoc.isValid()) {
      throw new Error('Refresh token expired or revoked');
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.isAccountLocked) {
      throw new Error('Account is locked');
    }

    // Revoke current refresh token (rotation)
    await tokenDoc.revoke('token_rotation');

    // Generate new tokens
    const accessToken = generateAccessToken(user);
    const newRefreshToken = await generateRefreshToken(user, decoded.family, requestInfo);

    await AuditLog.log({
      userId: user._id,
      userEmail: user.email,
      action: 'token_refresh',
      category: 'authentication',
      severity: 'low',
      status: 'success',
      description: 'Access token refreshed',
      ipAddress: requestInfo.ip,
      userAgent: requestInfo.userAgent,
    });

    return {
      accessToken,
      refreshToken: newRefreshToken.token,
      expiresAt: newRefreshToken.expiresAt,
      user: user.toJSON(),
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Revoke refresh token
 */
export const revokeRefreshToken = async (token, reason = 'logout') => {
  const hashedToken = hashToken(token);
  const tokenDoc = await RefreshToken.findOne({ token: hashedToken });
  
  if (tokenDoc) {
    await tokenDoc.revoke(reason);
    return true;
  }
  
  return false;
};

/**
 * Revoke all user tokens (logout from all devices)
 */
export const revokeAllUserTokens = async (userId, reason = 'logout') => {
  return RefreshToken.revokeAllUserTokens(userId, reason);
};

/**
 * Enhanced authentication middleware
 */
export const protect = async (req, res, next) => {
  let token;

  try {
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token provided',
        code: 'NO_TOKEN',
      });
    }

    const decoded = verifyAccessToken(token);

    if (decoded.type !== 'access') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token type',
        code: 'INVALID_TOKEN_TYPE',
      });
    }

    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
        code: 'USER_NOT_FOUND',
      });
    }

    if (user.isAccountLocked) {
      return res.status(403).json({
        success: false,
        message: 'Account is locked. Please contact support.',
        code: 'ACCOUNT_LOCKED',
      });
    }

    req.user = user;
    
    // Update lastActivityAt if more than 5 minutes have passed since last update
    const now = new Date();
    if (!user.lastActivityAt || (now.getTime() - new Date(user.lastActivityAt).getTime()) > 5 * 60 * 1000) {
      User.findByIdAndUpdate(user._id, { lastActivityAt: now }).exec();
    }

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      // Attempt seamless recovery using refresh token cookie/body.
      // This prevents user-facing failures when only the short-lived access token expired.
      try {
        const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

        if (refreshToken) {
          const tokens = await refreshTokens(refreshToken, {
            ip: req.ip,
            userAgent: req.headers['user-agent'],
          });

          setTokenCookies(res, tokens.accessToken, tokens.refreshToken);

          const refreshedUser = await User.findById(tokens.user?._id || tokens.user?.id).select('-password');
          if (refreshedUser && !refreshedUser.isAccountLocked) {
            req.user = refreshedUser;
            return next();
          }
        }
      } catch (refreshError) {
        // Refresh failed; clear stale cookies and return session-expired response.
        clearTokenCookies(res);
      }

      return res.status(401).json({
        success: false,
        message: 'Session expired. Please sign in again.',
        code: 'SESSION_EXPIRED',
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
        code: 'INVALID_TOKEN',
      });
    }

    console.error('Auth middleware error:', error);

    return res.status(401).json({
      success: false,
      message: 'Not authorized',
      code: 'AUTH_FAILED',
    });
  }
};

/**
 * Optional authentication
 */
export const optionalAuth = async (req, res, next) => {
  let token;

  try {
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (token) {
      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.id).select('-password');
      if (user && !user.isAccountLocked) {
        req.user = user;
      }
    }
  } catch (error) {
    // Silently ignore auth errors for optional auth
  }

  next();
};

/**
 * Admin middleware
 */
export const admin = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'superadmin')) {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Admin access required',
      code: 'ADMIN_REQUIRED',
    });
  }
};

/**
 * Authorize user based on roles
 * @param  {...string} roles - Allowed roles
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role(s): ${roles.join(', ')}`,
      });
    }

    next();
  };
};

/**
 * Set secure cookies for tokens
 * @param {Object} res - Express response object
 * @param {string} accessToken - JWT access token
 * @param {string} refreshToken - Refresh token
 * @param {boolean} rememberMe - Whether to extend cookie lifetime (30 days vs 7 days)
 */
export const setTokenCookies = (res, accessToken, refreshToken, rememberMe = false) => {
  // Use centralized cookie configuration when possible
  const cookieConfig = securityConfig.cookie || {};

  // In development, use 'lax' to allow cookies without requiring HTTPS
  // SameSite='none' requires Secure=true which won't work over HTTP
  const isProduction = process.env.NODE_ENV === 'production';
  const sameSite = isProduction ? (cookieConfig.sameSite || 'strict') : 'lax';
  const secure = isProduction ? !!cookieConfig.secure : false;

  // Remember Me: 30 days, otherwise 7 days
  const refreshTokenMaxAge = rememberMe 
    ? 30 * 24 * 60 * 60 * 1000  // 30 days
    : (cookieConfig.maxAge || 7 * 24 * 60 * 60 * 1000); // 7 days default

  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure,
    sameSite,
    maxAge: 15 * 60 * 1000,
    path: cookieConfig.path || '/',
    domain: cookieConfig.domain,
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure,
    sameSite,
    path: '/', // Changed from '/api/auth/refresh' to allow seamless recovery in 'protect' middleware
    maxAge: refreshTokenMaxAge,
    domain: cookieConfig.domain,
  });
};

/**
 * Clear token cookies
 */
export const clearTokenCookies = (res) => {
  res.clearCookie('accessToken', { path: '/' });
  res.clearCookie('refreshToken', { path: '/' });
};

export default {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  refreshTokens,
  revokeRefreshToken,
  revokeAllUserTokens,
  protect,
  optionalAuth,
  admin,
  authorize,
  setTokenCookies,
  clearTokenCookies,
};
