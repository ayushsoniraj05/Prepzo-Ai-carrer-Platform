import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { securityConfig } from '../config/security.config.js';
import AuditLog from '../models/AuditLog.model.js';
import redisService from '../services/redis.service.js';

const redisClient = redisService.redisClient;

/**
 * Create a rate limiter with optional audit logging
 * @param {Object} config - Rate limit configuration
 * @param {string} name - Name of the rate limiter for logging
 * @returns {Function} Express middleware
 */
const createRateLimiter = (config, name = 'general') => {
  return rateLimit({
    windowMs: config.windowMs,
    max: config.max,
    store: redisClient?.isReady 
      ? new RedisStore({
          sendCommand: (...args) => redisClient.sendCommand(args),
          prefix: `rl:${name}:`,
        }) 
      : undefined,
    message: {
      success: false,
      message: config.message,
      retryAfter: Math.ceil(config.windowMs / 1000),
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
    keyGenerator: (req) => {
      // Use X-Forwarded-For header if behind a proxy, otherwise use IP
      return req.ip || req.headers['x-forwarded-for']?.split(',')[0] || 'unknown';
    },
    handler: async (req, res, next, options) => {
      // Log rate limit exceeded
      try {
        await AuditLog.log({
          userId: req.user?._id || null,
          userEmail: req.user?.email || req.body?.email || '',
          action: 'rate_limit_exceeded',
          category: 'security',
          severity: 'medium',
          status: 'warning',
          description: `Rate limit exceeded for ${name} endpoint`,
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
          method: req.method,
          endpoint: req.originalUrl,
          requestId: req.requestId,
          metadata: {
            limiterName: name,
            windowMs: config.windowMs,
            maxRequests: config.max,
          },
        });
      } catch (error) {
        console.error('Failed to log rate limit:', error);
      }

      res.status(429).json(options.message);
    },
    skip: (req) => {
      // Skip rate limiting for health checks
      if (req.path === '/api/health') return true;
      return false;
    },
  });
};

// General API rate limiter
export const generalLimiter = createRateLimiter(
  securityConfig.rateLimit.general,
  'general'
);

// Auth rate limiter (strict)
export const authLimiter = createRateLimiter(
  securityConfig.rateLimit.auth,
  'auth'
);

// Registration rate limiter
export const registerLimiter = createRateLimiter(
  securityConfig.rateLimit.register,
  'register'
);

// AI API rate limiter
export const aiLimiter = createRateLimiter(
  securityConfig.rateLimit.ai,
  'ai'
);

// File upload rate limiter
export const uploadLimiter = createRateLimiter(
  securityConfig.rateLimit.upload,
  'upload'
);

// Password reset rate limiter
export const passwordResetLimiter = createRateLimiter(
  securityConfig.rateLimit.passwordReset,
  'passwordReset'
);

// Brute force protection middleware
export const bruteForceProtection = async (req, res, next) => {
  const ip = req.ip;
  const email = req.body?.email?.toLowerCase();

  if (!email) {
    return next();
  }

  try {
    // Check for brute force patterns
    const recentFailures = await AuditLog.countDocuments({
      $or: [
        { ipAddress: ip },
        { userEmail: email },
      ],
      action: 'login_failed',
      timestamp: { $gte: new Date(Date.now() - 15 * 60 * 1000) }, // Last 15 minutes
    });

    if (recentFailures >= 10) {
      // Log brute force detection
      await AuditLog.log({
        userEmail: email,
        action: 'brute_force_detected',
        category: 'security',
        severity: 'critical',
        status: 'warning',
        description: `Potential brute force attack detected from IP ${ip}`,
        ipAddress: ip,
        userAgent: req.headers['user-agent'],
        method: req.method,
        endpoint: req.originalUrl,
        metadata: {
          failedAttempts: recentFailures,
          email,
        },
      });

      return res.status(429).json({
        success: false,
        message: 'Too many failed attempts. Please try again later or reset your password.',
        retryAfter: 900, // 15 minutes
      });
    }

    next();
  } catch (error) {
    console.error('Brute force protection error:', error);
    next();
  }
};

// IP blocking middleware
const blockedIPs = new Set();

export const ipBlocker = (req, res, next) => {
  const ip = req.ip;

  if (blockedIPs.has(ip)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied',
    });
  }

  next();
};

// Add IP to block list
export const blockIP = (ip, duration = 24 * 60 * 60 * 1000) => {
  blockedIPs.add(ip);
  setTimeout(() => {
    blockedIPs.delete(ip);
  }, duration);
};

// Dynamic rate limiting based on user behavior
export const dynamicRateLimiter = (req, res, next) => {
  // This can be enhanced with Redis for distributed systems
  const ip = req.ip;
  
  // Track request patterns
  if (!req.app.locals.requestTracker) {
    req.app.locals.requestTracker = new Map();
  }

  const tracker = req.app.locals.requestTracker;
  const now = Date.now();
  const windowStart = now - 60000; // 1 minute window

  if (!tracker.has(ip)) {
    tracker.set(ip, []);
  }

  const requests = tracker.get(ip).filter((time) => time > windowStart);
  requests.push(now);
  tracker.set(ip, requests);

  // If more than 200 requests per minute, slow down
  if (requests.length > 200) {
    return res.status(429).json({
      success: false,
      message: 'Request rate too high. Please slow down.',
    });
  }

  next();
};

export default {
  generalLimiter,
  authLimiter,
  registerLimiter,
  aiLimiter,
  uploadLimiter,
  passwordResetLimiter,
  bruteForceProtection,
  ipBlocker,
  blockIP,
  dynamicRateLimiter,
};
