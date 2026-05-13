/**
 * Enterprise Security Configuration Module
 * Handles all security-related configurations for the Prepzo platform
 */

const isProduction = process.env.NODE_ENV === 'production';

export const securityConfig = {
  // JWT Configuration
  jwt: {
    accessTokenExpiry: isProduction ? '15m' : '24h',  // 15 minutes in prod, 24 hours in dev
    refreshTokenExpiry: '7d',       // 7 days
    issuer: 'prepzo-platform',
    audience: 'prepzo-users',
    algorithm: 'HS256',
  },

  // Password Security
  password: {
    saltRounds: 12,                 // bcrypt salt rounds (12-14 recommended)
    minLength: 8,
    maxLength: 128,
    historyCount: 5,                // Number of previous passwords to remember
    lockoutThreshold: 5,            // Failed attempts before lockout
    lockoutDuration: 15 * 60 * 1000, // 15 minutes in milliseconds
    exponentialBackoff: {
      baseDelay: 1000,              // 1 second base delay
      maxDelay: 30000,              // 30 seconds max delay
      multiplier: 2,
    },
    rules: {
      minUppercase: 1,
      minLowercase: 1,
      minNumbers: 1,
      minSpecialChars: 1,
      noSpaces: true,
      noCommonWords: true,
      noUserInfo: false,             // Allowed for better user flexibility
    },
  },

  // Email Verification / OTP
  otp: {
    expiryMinutes: 5,
    length: 6,
    maxAttempts: 3,
    resendCooldown: 60 * 1000,      // 1 minute cooldown between resends
  },

  // Rate Limiting Configuration
  rateLimit: {
    general: {
      windowMs: 15 * 60 * 1000,     // 15 minutes
      max: isProduction ? 100 : 1000, // 1000 requests in dev
      message: 'Too many requests, please try again later.',
    },
    auth: {
      windowMs: 15 * 60 * 1000,     // 15 minutes
      max: isProduction ? 5 : 50,    // 50 login attempts in dev
      message: 'Too many login attempts, please try again later.',
    },
    register: {
      windowMs: 60 * 60 * 1000,     // 1 hour
      max: isProduction ? 3 : 20,    // 20 registration attempts in dev
      message: 'Too many registration attempts, please try again later.',
    },
    ai: {
      windowMs: 60 * 1000,          // 1 minute
      max: isProduction ? 10 : 100,  // 100 AI requests per minute in dev
      message: 'AI API rate limit exceeded, please wait.',
    },
    upload: {
      windowMs: 60 * 60 * 1000,     // 1 hour
      max: isProduction ? 10 : 50,   // 50 uploads per hour in dev
      message: 'Upload limit reached, please try again later.',
    },
    passwordReset: {
      windowMs: 60 * 60 * 1000,     // 1 hour
      max: isProduction ? 3 : 10,    // 10 password reset attempts in dev
      message: 'Too many password reset attempts, please try again later.',
    },
  },

  // CORS Configuration
  cors: {
    // Allow only specific origins in production
    allowedOrigins: process.env.NODE_ENV === 'production'
      ? [process.env.FRONTEND_URL, 'https://*.vercel.app'].filter(Boolean)
      : ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'X-CSRF-Token',
      'X-Request-ID',
    ],
    exposedHeaders: ['X-Request-ID', 'X-RateLimit-Remaining'],
    credentials: true,
    maxAge: 86400, // 24 hours
  },

  // Cookie Configuration
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    domain: process.env.COOKIE_DOMAIN || undefined,
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  },

  // Helmet Security Headers Configuration
  helmet: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
        mediaSrc: ["'self'", 'blob:'],
        connectSrc: ["'self'", process.env.FRONTEND_URL].filter(Boolean),  // External AI APIs removed - using internal AI only
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        frameAncestors: ["'none'"],
        upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
      },
    },
    crossOriginEmbedderPolicy: false, // May need to disable for certain features
    crossOriginOpenerPolicy: { policy: 'same-origin' },
    crossOriginResourcePolicy: { policy: 'same-site' },
    dnsPrefetchControl: { allow: false },
    frameguard: { action: 'deny' },
    hidePoweredBy: true,
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
    ieNoOpen: true,
    noSniff: true,
    originAgentCluster: true,
    permittedCrossDomainPolicies: { permittedPolicies: 'none' },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    xssFilter: true,
  },

  // File Upload Security
  upload: {
    maxFileSize: 5 * 1024 * 1024,   // 5MB
    allowedMimeTypes: {
      resume: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ],
      image: [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
      ],
    },
    allowedExtensions: {
      resume: ['.pdf', '.doc', '.docx'],
      image: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    },
    blockedExtensions: [
      '.exe', '.bat', '.cmd', '.sh', '.php', '.js', '.py',
      '.rb', '.pl', '.jar', '.war', '.dll', '.so', '.msi',
    ],
    scanForMalware: process.env.MALWARE_SCAN_ENABLED === 'true',
    storageType: process.env.FILE_STORAGE_TYPE || 'local', // 'local', 's3', 'cloudinary'
  },

  // Proctoring Security
  proctoring: {
    recordingRetentionDays: 30,
    encryptRecordings: true,
    maxViolationsBeforeTermination: 3,
    violationTypes: {
      multipleFaces: { severity: 'critical', description: 'Multiple faces detected' },
      noFace: { severity: 'warning', description: 'No face detected' },
      tabSwitch: { severity: 'warning', description: 'Tab/window switched' },
      fullscreenExit: { severity: 'warning', description: 'Fullscreen mode exited' },
      devToolsOpen: { severity: 'critical', description: 'Developer tools opened' },
      copyPaste: { severity: 'warning', description: 'Copy/paste detected' },
      rightClick: { severity: 'warning', description: 'Right-click detected' },
      backgroundNoise: { severity: 'warning', description: 'Excessive background noise' },
    },
    consentRequired: true,
    autoDeleteEnabled: true,
  },

  // Session Security
  session: {
    maxConcurrentSessions: 3,
    sessionTimeout: 30 * 60 * 1000,  // 30 minutes
    extendOnActivity: true,
    trackActivity: true,
  },

  // Audit Logging
  audit: {
    enabled: true,
    logLevel: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    sensitiveFields: [
      'password', 'oldPassword', 'newPassword', 'confirmPassword',
      'token', 'refreshToken', 'accessToken', 'otp', 'secret',
      'creditCard', 'ssn', 'apiKey',
    ],
    retentionDays: 90,
    alertThresholds: {
      failedLogins: 10,             // Alert after 10 failed logins from same IP
      suspiciousActivity: 5,         // Alert after 5 suspicious activities
      bruteForceAttempts: 20,        // Alert after 20 rapid requests
    },
  },

  // IP Security
  ip: {
    trustProxy: process.env.NODE_ENV === 'production',
    blacklist: [],                   // Blocked IPs
    whitelist: [],                   // Admin-only IPs (empty = allow all)
    geoBlocking: {
      enabled: false,
      blockedCountries: [],
    },
  },

  // Encryption Configuration
  encryption: {
    algorithm: 'aes-256-gcm',
    keyDerivation: 'pbkdf2',
    saltLength: 32,
    ivLength: 16,
    tagLength: 16,
    iterations: 100000,
    sensitiveFields: [
      'phone',
      'dateOfBirth',
      'proctoringLogs',
      'resumeMetadata',
      'otpSecret',
    ],
  },
};

// Security validation helper
export const validateSecurityConfig = () => {
  const issues = [];

  // Validate JWT secret
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    issues.push('JWT_SECRET must be at least 32 characters long');
  }

  // Validate refresh token secret
  if (!process.env.JWT_REFRESH_SECRET || process.env.JWT_REFRESH_SECRET.length < 32) {
    issues.push('JWT_REFRESH_SECRET must be at least 32 characters long');
  }

  // Validate encryption key
  if (!process.env.ENCRYPTION_KEY || process.env.ENCRYPTION_KEY.length < 32) {
    issues.push('ENCRYPTION_KEY must be at least 32 characters long');
  }

  // Production-specific validations
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.FRONTEND_URL) {
      issues.push('FRONTEND_URL must be set in production');
    }

    if (process.env.FRONTEND_URL && !process.env.FRONTEND_URL.startsWith('https://')) {
      issues.push('FRONTEND_URL must use HTTPS in production');
    }

    if (!securityConfig.cookie.secure) {
      issues.push('Secure cookies must be enabled in production');
    }
  }

  return {
    valid: issues.length === 0,
    issues,
  };
};

// Common password list (top 100 most common)
export const commonPasswords = [
  'password', '123456', '12345678', 'qwerty', 'abc123', 'monkey', '1234567',
  'letmein', 'trustno1', 'dragon', 'baseball', 'iloveyou', 'master', 'sunshine',
  'ashley', 'fuckme', '123123', 'shadow', '654321', 'superman', 'qazwsx',
  'michael', 'football', 'password1', 'password123', 'batman', 'login',
];

export default securityConfig;
