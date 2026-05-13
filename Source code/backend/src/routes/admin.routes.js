import express from 'express';
import {
  getDashboardStats,
  getAllUsers,
  getUserDetails,
  updateUser,
  deleteUser,
  toggleUserStatus,
  changeUserRole,
  getAllTestSessions,
  getProctoringLogs,
  bulkUserAction,
  exportUsers,
  seedSystemData,
  sendAnnouncement,
  getAuditLogs,
} from '../controllers/admin.controller.js';
import { protect, admin } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication and admin role
router.use(protect);
router.use(admin);

// Dashboard
router.get('/stats', getDashboardStats);
router.post('/seed', seedSystemData);

// Users management
router.get('/users', getAllUsers);
router.get('/users/export', exportUsers);
router.post('/users/bulk', bulkUserAction);
router.get('/users/:id', getUserDetails);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/status', toggleUserStatus);
router.put('/users/:id/role', changeUserRole);

// Tests and proctoring
router.get('/tests', getAllTestSessions);
router.get('/proctoring', getProctoringLogs);

// Announcements
router.post('/announcements', sendAnnouncement);

// Audit Logs
router.get('/audit-logs', getAuditLogs);

export default router;
