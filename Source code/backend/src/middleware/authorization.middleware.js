import AuditLog from '../models/AuditLog.model.js';
import mongoose from 'mongoose';

/**
 * Role hierarchy and permissions
 */
const ROLES = {
  student: {
    level: 1,
    permissions: [
      'read:own_profile',
      'update:own_profile',
      'read:own_tests',
      'create:test_session',
      'upload:own_resume',
      'read:own_results',
    ],
  },
  admin: {
    level: 2,
    permissions: [
      'read:own_profile',
      'update:own_profile',
      'read:own_tests',
      'create:test_session',
      'upload:own_resume',
      'read:own_results',
      'read:all_users',
      'read:all_tests',
      'read:all_results',
      'update:user_status',
      'view:analytics',
      'view:audit_logs',
    ],
  },
  superadmin: {
    level: 3,
    permissions: [
      'read:own_profile',
      'update:own_profile',
      'read:own_tests',
      'create:test_session',
      'upload:own_resume',
      'read:own_results',
      'read:all_users',
      'read:all_tests',
      'read:all_results',
      'update:user_status',
      'view:analytics',
      'view:audit_logs',
      'create:admin',
      'delete:admin',
      'update:roles',
      'manage:system_config',
      'delete:users',
      'export:data',
    ],
  },
};

/**
 * Check if user has required role
 * @param {...string} allowedRoles - Roles that are allowed
 * @returns {Function} Express middleware
 */
export const requireRole = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
          code: 'AUTH_REQUIRED',
        });
      }

      const userRole = req.user.role || 'student';

      if (!allowedRoles.includes(userRole)) {
        // Log unauthorized access attempt
        await AuditLog.log({
          userId: req.user._id,
          userEmail: req.user.email,
          userRole: userRole,
          action: 'unauthorized_access',
          category: 'authorization',
          severity: 'medium',
          status: 'failure',
          description: `Attempted to access resource requiring roles: ${allowedRoles.join(', ')}`,
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
          method: req.method,
          endpoint: req.originalUrl,
          requestId: req.requestId,
        });

        return res.status(403).json({
          success: false,
          message: 'You do not have permission to perform this action',
          code: 'FORBIDDEN',
        });
      }

      next();
    } catch (error) {
      console.error('Role check error:', error);
      next(error);
    }
  };
};

/**
 * Check if user has required permission
 * @param {...string} requiredPermissions - Permissions required
 * @returns {Function} Express middleware
 */
export const requirePermission = (...requiredPermissions) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
          code: 'AUTH_REQUIRED',
        });
      }

      const userRole = req.user.role || 'student';
      const roleConfig = ROLES[userRole];

      if (!roleConfig) {
        return res.status(403).json({
          success: false,
          message: 'Invalid role configuration',
          code: 'INVALID_ROLE',
        });
      }

      const hasAllPermissions = requiredPermissions.every(
        (permission) => roleConfig.permissions.includes(permission)
      );

      if (!hasAllPermissions) {
        // Log unauthorized access attempt
        await AuditLog.log({
          userId: req.user._id,
          userEmail: req.user.email,
          userRole: userRole,
          action: 'unauthorized_access',
          category: 'authorization',
          severity: 'medium',
          status: 'failure',
          description: `Attempted to access resource requiring permissions: ${requiredPermissions.join(', ')}`,
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
          method: req.method,
          endpoint: req.originalUrl,
          requestId: req.requestId,
        });

        return res.status(403).json({
          success: false,
          message: 'You do not have permission to perform this action',
          code: 'FORBIDDEN',
        });
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      next(error);
    }
  };
};

/**
 * Prevent IDOR (Insecure Direct Object Reference)
 * Ensures user can only access their own resources
 * @param {string} paramName - URL parameter name containing resource ID
 * @param {string} resourceType - Type of resource being accessed
 * @param {Object} options - Additional options
 * @returns {Function} Express middleware
 */
export const preventIDOR = (paramName = 'id', resourceType = 'resource', options = {}) => {
  const {
    allowAdmins = true,           // Allow admins to access any resource
    userIdField = 'userId',       // Field in resource containing owner ID
    model = null,                 // Mongoose model to check ownership
    checkOwnership = true,        // Whether to check ownership
  } = options;

  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
          code: 'AUTH_REQUIRED',
        });
      }

      const resourceId = req.params[paramName];
      const userRole = req.user.role || 'student';

      // Allow admins to bypass IDOR check if configured
      if (allowAdmins && (userRole === 'admin' || userRole === 'superadmin')) {
        return next();
      }

      // If model is provided, check ownership in database
      if (model && checkOwnership) {
        if (!mongoose.Types.ObjectId.isValid(resourceId)) {
          return res.status(400).json({
            success: false,
            message: 'Invalid resource ID',
            code: 'INVALID_ID',
          });
        }

        const resource = await model.findById(resourceId).select(userIdField);

        if (!resource) {
          return res.status(404).json({
            success: false,
            message: `${resourceType} not found`,
            code: 'NOT_FOUND',
          });
        }

        const ownerId = resource[userIdField]?.toString();
        const currentUserId = req.user._id.toString();

        if (ownerId !== currentUserId) {
          // Log IDOR attempt
          await AuditLog.log({
            userId: req.user._id,
            userEmail: req.user.email,
            userRole: userRole,
            action: 'unauthorized_access',
            category: 'authorization',
            severity: 'high',
            status: 'failure',
            description: `IDOR attempt: User tried to access ${resourceType} owned by another user`,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
            method: req.method,
            endpoint: req.originalUrl,
            requestId: req.requestId,
            metadata: {
              resourceId,
              resourceType,
              ownerId,
              attemptedByUserId: currentUserId,
            },
          });

          return res.status(403).json({
            success: false,
            message: 'You do not have permission to access this resource',
            code: 'FORBIDDEN',
          });
        }
      }

      // For user routes, check if accessing own profile
      if (resourceType === 'user' && resourceId) {
        const currentUserId = req.user._id.toString();
        
        if (resourceId !== currentUserId && resourceId !== 'me') {
          return res.status(403).json({
            success: false,
            message: 'You can only access your own profile',
            code: 'FORBIDDEN',
          });
        }
      }

      next();
    } catch (error) {
      console.error('IDOR prevention error:', error);
      next(error);
    }
  };
};

/**
 * Verify resource ownership before allowing action
 * @param {Function} getOwnerId - Function to get owner ID from resource
 * @returns {Function} Express middleware
 */
export const verifyOwnership = (getOwnerId) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
          code: 'AUTH_REQUIRED',
        });
      }

      const userRole = req.user.role || 'student';

      // Allow admins to bypass ownership check
      if (userRole === 'admin' || userRole === 'superadmin') {
        return next();
      }

      const ownerId = await getOwnerId(req);
      const currentUserId = req.user._id.toString();

      if (!ownerId || ownerId.toString() !== currentUserId) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to access this resource',
          code: 'FORBIDDEN',
        });
      }

      next();
    } catch (error) {
      console.error('Ownership verification error:', error);
      next(error);
    }
  };
};

/**
 * Admin-only middleware
 */
export const adminOnly = requireRole('admin', 'superadmin');

/**
 * Super Admin only middleware
 */
export const superAdminOnly = requireRole('superadmin');

/**
 * Get user's role configuration
 */
export const getRoleConfig = (role) => {
  return ROLES[role] || ROLES.student;
};

/**
 * Check if role has permission
 */
export const roleHasPermission = (role, permission) => {
  const roleConfig = ROLES[role];
  return roleConfig?.permissions.includes(permission) || false;
};

export default {
  requireRole,
  requirePermission,
  preventIDOR,
  verifyOwnership,
  adminOnly,
  superAdminOnly,
  getRoleConfig,
  roleHasPermission,
  ROLES,
};
