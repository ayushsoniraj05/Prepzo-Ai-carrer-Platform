import helmet from 'helmet';
import crypto from 'crypto';
import { securityConfig } from '../config/security.config.js';

/**
 * Configure Helmet with enterprise security headers
 */
export const helmetConfig = helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production' 
    ? securityConfig.helmet.contentSecurityPolicy 
    : false, // Disable CSP in development for easier debugging
  crossOriginEmbedderPolicy: securityConfig.helmet.crossOriginEmbedderPolicy,
  crossOriginOpenerPolicy: securityConfig.helmet.crossOriginOpenerPolicy,
  crossOriginResourcePolicy: securityConfig.helmet.crossOriginResourcePolicy,
  dnsPrefetchControl: securityConfig.helmet.dnsPrefetchControl,
  frameguard: securityConfig.helmet.frameguard,
  hidePoweredBy: securityConfig.helmet.hidePoweredBy,
  hsts: process.env.NODE_ENV === 'production' ? securityConfig.helmet.hsts : false,
  ieNoOpen: securityConfig.helmet.ieNoOpen,
  noSniff: securityConfig.helmet.noSniff,
  originAgentCluster: securityConfig.helmet.originAgentCluster,
  permittedCrossDomainPolicies: securityConfig.helmet.permittedCrossDomainPolicies,
  referrerPolicy: securityConfig.helmet.referrerPolicy,
  xssFilter: securityConfig.helmet.xssFilter,
});

/**
 * CSRF Token generation and validation
 * Using Double Submit Cookie pattern for stateless CSRF protection
 */
const CSRF_COOKIE_NAME = 'csrf-token';
const CSRF_HEADER_NAME = 'x-csrf-token';
const CSRF_SECRET = process.env.CSRF_SECRET || process.env.JWT_SECRET || 'csrf-secret-key';

// Generate CSRF token
export const generateCSRFToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Hash CSRF token for cookie storage
const hashCSRFToken = (token) => {
  return crypto
    .createHmac('sha256', CSRF_SECRET)
    .update(token)
    .digest('hex');
};

/**
 * CSRF token middleware - sets token in cookie
 */
export const csrfTokenMiddleware = (req, res, next) => {
  // Skip for GET, HEAD, OPTIONS requests (safe methods)
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    // Generate new token if not exists
    if (!req.cookies?.[CSRF_COOKIE_NAME]) {
      const token = generateCSRFToken();
      const hashedToken = hashCSRFToken(token);
      
      res.cookie(CSRF_COOKIE_NAME, hashedToken, {
        httpOnly: false, // Must be readable by JavaScript
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      });
      
      // Also set the plain token in a separate header for the client
      res.setHeader('X-CSRF-Token', token);
    }
  }
  next();
};

/**
 * CSRF protection middleware - validates token on state-changing requests
 */
export const csrfProtection = (req, res, next) => {
  // Skip for safe methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Skip CSRF for API requests with Bearer token (API clients)
  if (req.headers.authorization?.startsWith('Bearer')) {
    return next();
  }

  const cookieToken = req.cookies?.[CSRF_COOKIE_NAME];
  const headerToken = req.headers[CSRF_HEADER_NAME];

  if (!cookieToken || !headerToken) {
    return res.status(403).json({
      success: false,
      message: 'CSRF token missing',
      code: 'CSRF_MISSING',
    });
  }

  // Validate token
  const hashedHeaderToken = hashCSRFToken(headerToken);
  if (cookieToken !== hashedHeaderToken) {
    // Log CSRF violation
    const AuditLog = require('../models/AuditLog.model.js').default;
    AuditLog.log({
      userId: req.user?._id || null,
      action: 'csrf_violation',
      category: 'security',
      severity: 'high',
      status: 'failure',
      description: 'CSRF token validation failed',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      method: req.method,
      endpoint: req.originalUrl,
    });

    return res.status(403).json({
      success: false,
      message: 'Invalid CSRF token',
      code: 'CSRF_INVALID',
    });
  }

  next();
};

/**
 * Request ID middleware for tracking
 */
export const requestIdMiddleware = (req, res, next) => {
  const requestId = req.headers['x-request-id'] || crypto.randomUUID();
  req.requestId = requestId;
  res.setHeader('X-Request-ID', requestId);
  next();
};

/**
 * Security response headers middleware
 */
export const securityHeaders = (req, res, next) => {
  // Additional security headers not covered by Helmet
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // Cache control for sensitive endpoints
  if (req.path.includes('/api/auth') || req.path.includes('/api/users')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }

  next();
};

/**
 * Input sanitization middleware
 * Removes potential XSS and injection attacks
 */
export const sanitizeInput = (req, res, next) => {
  const sanitize = (obj) => {
    if (typeof obj === 'string') {
      // Remove common XSS patterns
      return obj
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+=/gi, '')
        .replace(/data:/gi, '')
        .trim();
    }
    
    if (Array.isArray(obj)) {
      return obj.map(sanitize);
    }
    
    if (obj && typeof obj === 'object') {
      const sanitized = {};
      for (const [key, value] of Object.entries(obj)) {
        // Skip sanitization for specific fields
        if (['password', 'currentPassword', 'newPassword'].includes(key)) {
          sanitized[key] = value;
        } else {
          sanitized[key] = sanitize(value);
        }
      }
      return sanitized;
    }
    
    return obj;
  };

  if (req.body) {
    req.body = sanitize(req.body);
  }
  
  if (req.query) {
    req.query = sanitize(req.query);
  }
  
  if (req.params) {
    req.params = sanitize(req.params);
  }

  next();
};

/**
 * NoSQL Injection prevention middleware
 */
export const noSQLInjectionPrevention = (req, res, next) => {
  const checkForInjection = (obj, path = '') => {
    // Basic types that are safe
    if (obj === null || obj === undefined || typeof obj === 'boolean' || typeof obj === 'number') {
      return { found: false };
    }

    if (typeof obj === 'string') {
      // Exempt certain common fields that might contain technical chars or currency
      const exemptFields = ['careerGoals', 'targetRole', 'message', 'text', 'code', 'bio', 'description', 'prompt', 'question', 'explanation'];
      const fieldName = path.split('.').pop();
      
      if (exemptFields.includes(fieldName)) {
        return { found: false };
      }

      // Check for MongoDB operators in string values
      const dangerousPatterns = [
        /^\$/, // Starts with $
        /\{\s*\$/, // Contains {$
        /\[\s*\$/, // Contains [$
      ];
      
      for (const pattern of dangerousPatterns) {
        if (pattern.test(obj)) {
          return { found: true, path, value: obj };
        }
      }
    }
    
    if (obj && typeof obj === 'object') {
      for (const [key, value] of Object.entries(obj)) {
        // Skip specific common fields for performance and safety
        if (['password', 'token', 'refreshToken'].includes(key)) continue;

        // Check for MongoDB operators in keys
        if (typeof key === 'string' && key.startsWith('$')) {
          return { found: true, path: `${path}.${key}`, value: key };
        }
        
        const result = checkForInjection(value, `${path}.${key}`);
        if (result.found) return result;
      }
    }
    
    return { found: false };
  };

  const bodyCheck = checkForInjection(req.body, 'body');
  const queryCheck = checkForInjection(req.query, 'query');
  const paramsCheck = checkForInjection(req.params, 'params');

  if (bodyCheck.found || queryCheck.found || paramsCheck.found) {
    const injection = bodyCheck.found ? bodyCheck : (queryCheck.found ? queryCheck : paramsCheck);
    
    // Log injection attempt
    const AuditLog = require('../models/AuditLog.model.js').default;
    AuditLog.log({
      userId: req.user?._id || null,
      action: 'injection_attempt',
      category: 'security',
      severity: 'critical',
      status: 'failure',
      description: `NoSQL injection attempt detected at ${injection.path}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      method: req.method,
      endpoint: req.originalUrl,
      metadata: {
        path: injection.path,
        pattern: injection.value,
      },
    });

    return res.status(400).json({
      success: false,
      message: 'Invalid input detected',
      code: 'INVALID_INPUT',
    });
  }

  next();
};

/**
 * Prevent parameter pollution
 */
export const preventParamPollution = (req, res, next) => {
  // For query parameters, take only the last value if multiple are provided
  if (req.query) {
    for (const [key, value] of Object.entries(req.query)) {
      if (Array.isArray(value)) {
        req.query[key] = value[value.length - 1];
      }
    }
  }
  next();
};

export default {
  helmetConfig,
  csrfTokenMiddleware,
  csrfProtection,
  requestIdMiddleware,
  securityHeaders,
  sanitizeInput,
  noSQLInjectionPrevention,
  preventParamPollution,
};
