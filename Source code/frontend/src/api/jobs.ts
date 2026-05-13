/**
 * Jobs API Service
 * Handles job search, recommendations, and saved jobs
 */

import api from './axios';

// Types
export interface Job {
  _id: string;
  title: string;
  company: {
    _id: string;
    name: string;
    logo?: string;
    industry?: string;
  };
  description: string;
  responsibilities?: string[];
  jobType: 'full_time' | 'part_time' | 'contract' | 'internship' | 'freelance';
  workMode: 'onsite' | 'remote' | 'hybrid';
  experienceLevel: 'fresher' | 'entry' | 'mid' | 'senior' | 'lead' | 'executive';
  requiredSkills: Array<{ skill: string; importance?: string }>;
  educationRequired?: string;
  salary?: {
    min?: number;
    max?: number;
    currency?: string;
    isNegotiable?: boolean;
  };
  locations: Array<{ city: string; state?: string; country?: string }>;
  applicationDeadline?: string;
  department?: string;
  roleCategory?: string;
  hiringProcess?: string[];
  applicationCount?: number;
  viewCount?: number;
  createdAt: string;
  isSaved?: boolean;
  isApproved?: boolean;
}

export interface JobSearchParams {
  search?: string;
  company?: string;
  location?: string;
  skills?: string;
  experienceLevel?: string;
  jobType?: string;
  workMode?: string;
  department?: string;
  roleCategory?: string;
  salaryMin?: number;
  salaryMax?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SavedJob {
  _id: string;
  job: Job;
  company: { _id: string; name: string; logo?: string };
  notes?: string;
  tags?: string[];
  priority: 'low' | 'medium' | 'high';
  workflowStatus: string;
  reminderDate?: string;
  createdAt: string;
}

export interface JobFilters {
  locations: string[];
  skills: string[];
  experienceLevels: string[];
  jobTypes: string[];
  workModes: string[];
  departments: string[];
  roleCategories: string[];
}

export interface JobRecommendation {
  job: Job;
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
}

// API Functions
export const jobsApi = {
  // Search jobs
  searchJobs: async (params: JobSearchParams = {}) => {
    const response = await api.get('/jobs', { params });
    return response.data;
  },

  // Get job by ID
  getJob: async (id: string) => {
    const response = await api.get(`/jobs/${id}`);
    return response.data;
  },

  // Get jobs by company
  getJobsByCompany: async (companyId: string, page = 1, limit = 20) => {
    const response = await api.get(`/jobs/company/${companyId}`, {
      params: { page, limit },
    });
    return response.data;
  },

  // Get job filters
  getFilters: async (): Promise<{ success: boolean; data: JobFilters }> => {
    const response = await api.get('/jobs/filters');
    return response.data;
  },

  // Get trending jobs
  getTrendingJobs: async () => {
    const response = await api.get('/jobs/trending');
    return response.data;
  },

  // Get urgent jobs (deadline soon)
  getUrgentJobs: async () => {
    const response = await api.get('/jobs/urgent');
    return response.data;
  },

  // Get AI job recommendations
  getRecommendations: async (limit = 10) => {
    const response = await api.get('/jobs/user/recommendations', {
      params: { limit },
    });
    return response.data;
  },

  // Save/Unsave a job
  toggleSaveJob: async (jobId: string, notes?: string, priority?: string) => {
    const response = await api.post(`/jobs/${jobId}/save`, { notes, priority });
    return response.data;
  },

  // Get saved jobs
  getSavedJobs: async (params: {
    page?: number;
    limit?: number;
    priority?: string;
    workflowStatus?: string;
    sortBy?: string;
  } = {}) => {
    const response = await api.get('/jobs/user/saved', { params });
    return response.data;
  },

  // Update saved job
  updateSavedJob: async (savedJobId: string, updates: Partial<SavedJob>) => {
    const response = await api.put(`/jobs/saved/${savedJobId}`, updates);
    return response.data;
  },

  // Admin: Create job
  createJob: async (jobData: Partial<Job>) => {
    const response = await api.post('/jobs', jobData);
    return response.data;
  },

  // Admin: Update job
  updateJob: async (id: string, updates: Partial<Job>) => {
    const response = await api.put(`/jobs/${id}`, updates);
    return response.data;
  },

  // Admin: Delete job
  deleteJob: async (id: string) => {
    const response = await api.delete(`/jobs/${id}`);
    return response.data;
  },

  // Admin: Get all jobs
  getAllJobsAdmin: async (page = 1, limit = 20, status?: string, isApproved?: boolean) => {
    const response = await api.get('/jobs/admin/all', {
      params: { page, limit, status, isApproved },
    });
    return response.data;
  },
  
  // Admin: Approve job
  approveJob: async (id: string, isApproved: boolean) => {
    const response = await api.put(`/jobs/${id}/approve`, { isApproved });
    return response.data;
  },
};

export default jobsApi;
