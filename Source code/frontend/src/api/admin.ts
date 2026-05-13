import api from './axios';

// Types
export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  college?: string;
  degree?: string;
  targetRole?: string;
  status: 'active' | 'suspended' | 'pending_verification' | 'deactivated';
  role: 'student' | 'admin' | 'superadmin';
  placementReadinessScore: number;
  isOnboarded: boolean;
  isAssessmentComplete: boolean;
  createdAt: string;
  lastActive?: string;
}

export interface UserDetails extends User {
  dateOfBirth?: string;
  gender?: string;
  collegeName?: string;
  fieldOfStudy?: string;
  yearOfStudy?: string;
  cgpa?: string;
  knownTechnologies?: string[];
  skillRatings?: Record<string, number>;
  placementTimeline?: string;
  expectedCtc?: string;
  preferredCompanies?: string[];
  linkedin?: string;
  github?: string;
  resumeUrl?: string;
  atsScore?: number;
  skillGaps?: string[];
  strengths?: string[];
  weaknesses?: string[];
  updatedAt?: string;
}

export interface TestSession {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
  testType: string;
  field: string;
  status: string;
  totalScore: number;
  violations: Violation[];
  violationsCount: number;
  startTime: string;
  endTime?: string;
  createdAt: string;
}
export interface Violation {
  id: string;
  type: string;
  description: string;
  severity: 'warning' | 'critical';
  timestamp: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  testField?: string;
}

export interface AuditLog {
  id: string;
  userId?: {
    id: string;
    fullName: string;
    email: string;
    role: string;
  };
  userEmail: string;
  action: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'success' | 'failure' | 'warning' | 'info';
  description: string;
  ipAddress: string;
  userAgent: string;
  method: string;
  endpoint: string;
  timestamp: string;
  metadata?: any;
}

export interface DashboardStats {
  users: {
    total: number;
    active: number;
    blocked: number;
    pending: number;
    admins: number;
    onboarded: number;
    assessmentCompleted: number;
    todayRegistrations: number;
    weekRegistrations: number;
    active24h: number;
  };
  tests: {
    total: number;
    completed: number;
    active: number;
  };
  performance: {
    avgPlacementScore: number;
    totalViolations: number;
  };
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// API Functions

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await api.get('/admin/stats');
  return response.data;
};

export const getAllUsers = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  role?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}): Promise<{ users: User[]; pagination: Pagination }> => {
  const response = await api.get('/admin/users', { params });
  return response.data;
};

export const getUserDetails = async (userId: string): Promise<{
  user: UserDetails;
  testSessions: Array<{
    id: string;
    testType: string;
    field: string;
    status: string;
    totalScore: number;
    violationsCount: number;
    startTime: string;
    endTime?: string;
  }>;
}> => {
  const response = await api.get(`/admin/users/${userId}`);
  return response.data;
};

export const updateUser = async (userId: string, data: Partial<UserDetails>): Promise<{
  message: string;
  user: Pick<User, 'id' | 'fullName' | 'email' | 'status' | 'role'>;
}> => {
  const response = await api.put(`/admin/users/${userId}`, data);
  return response.data;
};

export const deleteUser = async (userId: string): Promise<{ message: string }> => {
  const response = await api.delete(`/admin/users/${userId}`);
  return response.data;
};

export const toggleUserStatus = async (
  userId: string,
  status: 'active' | 'suspended' | 'pending_verification' | 'deactivated'
): Promise<{ message: string; user: { id: string; status: string } }> => {
  const response = await api.put(`/admin/users/${userId}/status`, { status });
  return response.data;
};

export const changeUserRole = async (
  userId: string,
  role: 'student' | 'admin' | 'superadmin'
): Promise<{ message: string; user: { id: string; role: string } }> => {
  const response = await api.put(`/admin/users/${userId}/role`, { role });
  return response.data;
};

export const getAllTestSessions = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
  hasViolations?: boolean;
}): Promise<{ tests: TestSession[]; pagination: Pagination }> => {
  const response = await api.get('/admin/tests', { params });
  return response.data;
};

export const getProctoringLogs = async (params?: {
  page?: number;
  limit?: number;
  severity?: 'warning' | 'critical';
}): Promise<{ violations: Violation[]; pagination: Pagination }> => {
  const response = await api.get('/admin/proctoring', { params });
  return response.data;
};

export const bulkUserAction = async (
  userIds: string[],
  action: 'block' | 'unblock' | 'delete' | 'changeRole',
  value?: string
): Promise<{ message: string; affectedCount: number }> => {
  const response = await api.post('/admin/users/bulk', { userIds, action, value });
  return response.data;
};

export const exportUsers = async (format: 'json' | 'csv' = 'json'): Promise<{ users: User[] } | string> => {
  const response = await api.get('/admin/users/export', { 
    params: { format },
    responseType: format === 'csv' ? 'text' : 'json'
  });
  return response.data;
};

export const seedSystemData = async (): Promise<{ success: boolean; message: string; data: any }> => {
  const response = await api.post('/admin/seed');
  return response.data;
};

export const sendAnnouncement = async (data: {
  title: string;
  message: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  targetRole?: 'all' | 'student' | 'admin';
}): Promise<{ success: boolean; message: string }> => {
  const response = await api.post('/admin/announcements', data);
  return response.data;
};

export const getAuditLogs = async (params?: {
  page?: number;
  limit?: number;
  category?: string;
  severity?: string;
  action?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}): Promise<{ logs: AuditLog[]; pagination: Pagination }> => {
  const response = await api.get('/admin/audit-logs', { params });
  return response.data;
};
