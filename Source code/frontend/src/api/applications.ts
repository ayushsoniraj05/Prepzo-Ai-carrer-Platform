/**
 * Applications API Service
 * Handles job application operations
 */

import api from './axios';

// Types
export interface Application {
  _id: string;
  applicant: string;
  job: {
    _id: string;
    title: string;
    jobType?: string;
    locations?: Array<{ city: string }>;
    salary?: { min?: number; max?: number };
    applicationDeadline?: string;
  };
  company: {
    _id: string;
    name: string;
    logo?: string;
  };
  status: ApplicationStatus;
  resumeUrl?: string;
  coverLetter?: string;
  matchScore?: {
    overall: number;
    skillMatch: number;
    experienceMatch: number;
    educationMatch: number;
  };
  statusHistory: Array<{
    status: ApplicationStatus;
    changedBy?: { fullName?: string };
    note?: string;
    changedAt: string;
  }>;
  interviews?: Array<{
    _id: string;
    round: string;
    date: string;
    type: 'phone' | 'video' | 'onsite' | 'technical' | 'hr';
    interviewers?: string[];
    meetingLink?: string;
    status: 'scheduled' | 'completed' | 'cancelled';
    feedback?: string;
    score?: number;
  }>;
  offer?: {
    salary?: number;
    joiningDate?: string;
    position?: string;
    benefits?: string[];
    expiryDate?: string;
  };
  appliedAt?: string;
  withdrawnAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type ApplicationStatus =
  | 'applied'
  | 'viewed'
  | 'under_review'
  | 'shortlisted'
  | 'interview_scheduled'
  | 'interview_completed'
  | 'offer_extended'
  | 'offer_accepted'
  | 'offer_declined'
  | 'rejected'
  | 'withdrawn'
  | 'on_hold';

export interface ApplicationStats {
  totalApplications: number;
  statusBreakdown: Record<ApplicationStatus, number>;
  recentActivity: Application[];
}

// API Functions
export const applicationsApi = {
  // Apply for a job
  applyForJob: async (data: {
    jobId: string;
    coverLetter?: string;
    answers?: Record<string, string>;
  }) => {
    const response = await api.post('/applications', data);
    return response.data;
  },

  // Get user's applications
  getApplications: async (params: {
    status?: ApplicationStatus;
    page?: number;
    limit?: number;
  } = {}) => {
    const response = await api.get('/applications', { params });
    return response.data;
  },

  // Get single application
  getApplication: async (id: string) => {
    const response = await api.get(`/applications/${id}`);
    return response.data;
  },

  // Withdraw application
  withdrawApplication: async (id: string, reason?: string) => {
    const response = await api.put(`/applications/${id}/withdraw`, { reason });
    return response.data;
  },

  // Get application stats
  getStats: async (): Promise<{ success: boolean; data: ApplicationStats }> => {
    const response = await api.get('/applications/stats');
    return response.data;
  },

  // Admin: Get company applications
  getCompanyApplications: async (
    companyId: string,
    params: {
      status?: ApplicationStatus;
      jobId?: string;
      page?: number;
      limit?: number;
    } = {}
  ) => {
    const response = await api.get(`/applications/company/${companyId}`, { params });
    return response.data;
  },

  // Admin: Update application status
  updateStatus: async (id: string, status: ApplicationStatus, note?: string) => {
    const response = await api.put(`/applications/${id}/status`, { status, note });
    return response.data;
  },

  // Admin: Add interview
  addInterview: async (
    id: string,
    data: {
      round: string;
      date: string;
      type: 'phone' | 'video' | 'onsite' | 'technical' | 'hr';
      interviewers?: string[];
      meetingLink?: string;
      notes?: string;
    }
  ) => {
    const response = await api.post(`/applications/${id}/interview`, data);
    return response.data;
  },

  // Admin: Update interview
  updateInterview: async (
    applicationId: string,
    interviewId: string,
    data: {
      status?: 'scheduled' | 'completed' | 'cancelled';
      feedback?: string;
      score?: number;
    }
  ) => {
    const response = await api.put(
      `/applications/${applicationId}/interview/${interviewId}`,
      data
    );
    return response.data;
  },

  // Admin: Add recruiter note
  addNote: async (id: string, note: string) => {
    const response = await api.post(`/applications/${id}/notes`, { note });
    return response.data;
  },

  // Admin: Extend offer
  extendOffer: async (
    id: string,
    data: {
      salary?: number;
      joiningDate?: string;
      position?: string;
      benefits?: string[];
      expiryDate?: string;
    }
  ) => {
    const response = await api.post(`/applications/${id}/offer`, data);
    return response.data;
  },
};

export default applicationsApi;
