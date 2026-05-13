/**
 * AI API Security Middleware
 * Protects AI service calls with rate limiting, usage tracking, and response validation
 */

import { securityConfig } from '../config/security.config.js';
import AuditLog from '../models/AuditLog.model.js';

// In-memory store for AI usage tracking (use Redis in production)
const aiUsageStore = new Map();

/**
 * Track AI API usage per user
 */
const trackAIUsage = (userId) => {
  const now = Date.now();
  const windowMs = 60 * 60 * 1000; // 1 hour window
  
  if (!aiUsageStore.has(userId)) {
    aiUsageStore.set(userId, { requests: [], tokens: 0 });
  }
  
  const userUsage = aiUsageStore.get(userId);
  
  // Remove expired entries
  userUsage.requests = userUsage.requests.filter(
    timestamp => now - timestamp < windowMs
  );
  
  // Add new request
  userUsage.requests.push(now);
  
  return userUsage;
};

/**
 * Check if user has exceeded AI rate limits
 */
const checkAIRateLimit = (userId) => {
  const usage = aiUsageStore.get(userId);
  if (!usage) return { allowed: true, remaining: 100 };
  
  const maxRequests = securityConfig.rateLimit.ai.max; // 10 per minute
  const hourlyMax = maxRequests * 6; // 60 per hour
  
  const remaining = hourlyMax - usage.requests.length;
  
  return {
    allowed: remaining > 0,
    remaining: Math.max(0, remaining),
    resetAt: new Date(Date.now() + 60 * 60 * 1000),
  };
};

/**
 * AI Rate Limiting Middleware
 */
export const aiRateLimiter = async (req, res, next) => {
  try {
    const userId = req.user?._id?.toString() || req.user?.id || req.ip;
    const rateLimit = checkAIRateLimit(userId);
    
    // Set rate limit headers
    res.setHeader('X-AI-RateLimit-Remaining', rateLimit.remaining);
    res.setHeader('X-AI-RateLimit-Reset', rateLimit.resetAt?.toISOString() || '');
    
    if (!rateLimit.allowed) {
      await AuditLog.log({
        userId: req.user?._id,
        userEmail: req.user?.email,
        action: 'ai_rate_limit_exceeded',
        category: 'security',
        severity: 'medium',
        status: 'failure',
        description: 'AI API rate limit exceeded',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        metadata: {
          endpoint: req.originalUrl,
          remaining: rateLimit.remaining,
        },
      });
      
      return res.status(429).json({
        success: false,
        message: 'AI API rate limit exceeded. Please try again later.',
        code: 'AI_RATE_LIMIT_EXCEEDED',
        retryAfter: rateLimit.resetAt,
      });
    }
    
    // Track usage
    trackAIUsage(userId);
    
    next();
  } catch (error) {
    console.error('AI rate limiter error:', error);
    next(error);
  }
};

/**
 * AI Request Validator
 * Validates and sanitizes AI request payloads
 */
export const validateAIRequest = (allowedFields = []) => {
  return (req, res, next) => {
    try {
      // Check for required fields
      if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Request body is required',
          code: 'INVALID_REQUEST',
        });
      }
      
      // Sanitize request body - remove any fields that shouldn't be there
      if (allowedFields.length > 0) {
        const sanitizedBody = {};
        for (const field of allowedFields) {
          if (req.body[field] !== undefined) {
            sanitizedBody[field] = req.body[field];
          }
        }
        req.body = sanitizedBody;
      }
      
      // Check for injection attempts in string fields
      const stringFields = Object.entries(req.body).filter(
        ([_, value]) => typeof value === 'string'
      );
      
      for (const [field, value] of stringFields) {
        // Check for prompt injection attempts
        const injectionPatterns = [
          /ignore\s+(previous|above|all)\s+instructions?/i,
          /disregard\s+(previous|above|all)\s+instructions?/i,
          /forget\s+(previous|above|all)\s+instructions?/i,
          /you\s+are\s+now\s+a\s+different\s+(ai|assistant|bot)/i,
          /act\s+as\s+if\s+you\s+have\s+no\s+restrictions/i,
          /pretend\s+you\s+are\s+jailbroken/i,
          /bypass\s+(your|the)\s+restrictions/i,
        ];
        
        for (const pattern of injectionPatterns) {
          if (pattern.test(value)) {
            AuditLog.log({
              userId: req.user?._id,
              userEmail: req.user?.email,
              action: 'ai_injection_attempt',
              category: 'security',
              severity: 'high',
              status: 'failure',
              description: 'Potential AI prompt injection detected',
              ipAddress: req.ip,
              userAgent: req.headers['user-agent'],
              metadata: {
                field,
                pattern: pattern.toString(),
              },
            }).catch(console.error);
            
            return res.status(400).json({
              success: false,
              message: 'Invalid request content',
              code: 'INVALID_CONTENT',
            });
          }
        }
        
        // Check for extremely long inputs
        const maxLength = 10000; // 10k characters
        if (value.length > maxLength) {
          return res.status(400).json({
            success: false,
            message: `Field ${field} exceeds maximum length`,
            code: 'INPUT_TOO_LONG',
          });
        }
      }
      
      next();
    } catch (error) {
      console.error('AI request validation error:', error);
      next(error);
    }
  };
};

/**
 * AI Response Sanitizer
 * Sanitizes AI responses before sending to client
 */
export const sanitizeAIResponse = (response) => {
  if (!response) return response;
  
  // Remove any system prompts or instructions that leaked
  const systemLeakPatterns = [
    /system\s*:\s*you\s+are/gi,
    /\[system\]/gi,
    /\[assistant\]/gi,
    /\[user\]/gi,
    /api[_\-]?key\s*[:=]/gi,
    /secret[_\-]?key\s*[:=]/gi,
    /password\s*[:=]/gi,
  ];
  
  let sanitized = response;
  for (const pattern of systemLeakPatterns) {
    sanitized = sanitized.replace(pattern, '[REDACTED]');
  }
  
  return sanitized;
};

/**
 * Log AI API usage
 */
export const logAIUsage = async (req, res, next) => {
  const startTime = Date.now();
  
  // Override res.json to log the response
  const originalJson = res.json.bind(res);
  res.json = (body) => {
    const duration = Date.now() - startTime;
    
    // Log AI usage asynchronously
    AuditLog.log({
      userId: req.user?._id,
      userEmail: req.user?.email,
      action: 'ai_api_request',
      category: 'ai',
      severity: 'low',
      status: res.statusCode >= 400 ? 'failure' : 'success',
      description: `AI API request to ${req.originalUrl}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      metadata: {
        endpoint: req.originalUrl,
        method: req.method,
        duration,
        statusCode: res.statusCode,
        requestSize: JSON.stringify(req.body || {}).length,
        responseSize: JSON.stringify(body || {}).length,
      },
    }).catch(console.error);
    
    return originalJson(body);
  };
  
  next();
};

/**
 * AI API Key Protection
 * Ensures API keys are never exposed to the client
 */
export const protectAPIKeys = (req, res, next) => {
  // Store original json method
  const originalJson = res.json.bind(res);
  
  res.json = (body) => {
    // Deep clone to avoid modifying original
    let sanitizedBody = JSON.parse(JSON.stringify(body));
    
    // Remove any potential API key leaks
    const sanitizeObject = (obj) => {
      if (!obj || typeof obj !== 'object') return obj;
      
      const sensitiveKeys = [
        'apiKey', 'api_key', 'apikey',
        'secretKey', 'secret_key', 'secretkey',
        'accessToken', 'access_token', 'accesstoken',
        'privateKey', 'private_key', 'privatekey',
        'password', 'pwd', 'passwd',
        'openaiKey', 'openai_key',
        'anthropicKey', 'anthropic_key',
        'geminiKey', 'gemini_key',
      ];
      
      for (const key of Object.keys(obj)) {
        if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk.toLowerCase()))) {
          obj[key] = '[REDACTED]';
        } else if (typeof obj[key] === 'object') {
          sanitizeObject(obj[key]);
        } else if (typeof obj[key] === 'string') {
          // Check for inline API keys (sk-..., key-..., etc.)
          obj[key] = obj[key].replace(
            /(sk-|key-|api-|secret-)[a-zA-Z0-9]{20,}/g,
            '[REDACTED]'
          );
        }
      }
      
      return obj;
    };
    
    sanitizedBody = sanitizeObject(sanitizedBody);
    
    return originalJson(sanitizedBody);
  };
  
  next();
};

/**
 * AI Service Health Check
 */
export const checkAIServiceHealth = async (serviceName = 'default') => {
  // This would typically ping the AI service to check availability
  // For now, return a simple health status
  return {
    service: serviceName,
    status: 'healthy',
    latency: 0,
    lastCheck: new Date(),
  };
};

/**
 * Verify API key for AI service-to-service communication
 */
import crypto from 'crypto';

const AI_API_KEY = process.env.AI_API_KEY || 'prepzo-ai-secret-key';

export const verifyAIServiceKey = (req, res, next) => {
  const apiKey = req.headers['x-ai-api-key'] || req.headers['x-api-key'];

  if (!apiKey) {
    return res.status(401).json({
      success: false,
      message: 'AI service API key required',
    });
  }

  try {
    // Constant-time comparison to prevent timing attacks
    const isValid = crypto.timingSafeEqual(
      Buffer.from(apiKey),
      Buffer.from(AI_API_KEY)
    );

    if (!isValid) {
      return res.status(403).json({
        success: false,
        message: 'Invalid AI service API key',
      });
    }
  } catch (err) {
    return res.status(403).json({
      success: false,
      message: 'Invalid AI service API key',
    });
  }

  next();
};

/**
 * Ensure AI service is only called from internal services
 */
export const internalServiceOnly = (req, res, next) => {
  const internalServiceHeader = req.headers['x-internal-service'];
  const isLocalhost = ['localhost', '127.0.0.1', '::1'].includes(req.hostname);
  const isFromBackend = internalServiceHeader === 'prepzo-backend';

  if (!isLocalhost && !isFromBackend) {
    console.warn(`Unauthorized AI service access attempt from: ${req.ip}`);
    return res.status(403).json({
      success: false,
      message: 'Access denied. AI service for internal use only.',
    });
  }

  next();
};

/**
 * Add API key header for outgoing AI service requests
 */
export const addAIServiceHeaders = (headers = {}) => {
  return {
    ...headers,
    'X-API-Key': AI_API_KEY,
    'X-Internal-Service': 'prepzo-backend',
    'Content-Type': 'application/json',
  };
};

/**
 * Combined AI Security Middleware Stack
 */
export const aiSecurityStack = [
  aiRateLimiter,
  validateAIRequest(),
  logAIUsage,
  protectAPIKeys,
];

export default {
  aiRateLimiter,
  validateAIRequest,
  sanitizeAIResponse,
  logAIUsage,
  protectAPIKeys,
  checkAIServiceHealth,
  aiSecurityStack,
};
