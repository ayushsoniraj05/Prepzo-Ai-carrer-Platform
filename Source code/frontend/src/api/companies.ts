/**
 * Companies API Service
 * Handles company directory and company-related operations
 */

import api from './axios';

// Types
export interface Company {
  _id: string;
  name: string;
  slug: string;
  logo?: string;
  coverImage?: string;
  industry: string;
  companyType: 'startup' | 'mnc' | 'mid_size' | 'government' | 'ngo' | 'other';
  companySize: string;
  description: string;
  shortDescription?: string;
  foundedYear?: number;
  website?: string;
  linkedin?: string;
  glassdoor?: string;
  
  // Location
  headquarters: {
    city: string;
    state?: string;
    country: string;
  };
  locations?: Array<{
    city: string;
    state?: string;
    country?: string;
    isHQ?: boolean;
  }>;
  
  // Hiring info
  hiringStatus: 'actively_hiring' | 'occasionally_hiring' | 'not_hiring';
  hiringProcess?: {
    description?: string;
    rounds?: string[];
    duration?: string;
    tips?: string[];
  };
  
  // Tech & Culture
  techStack?: string[];
  salaryRange?: {
    fresher?: { min: number; max: number };
    experienced?: { min: number; max: number };
    currency?: string;
  };
  benefits?: string[];
  workCulture?: {
    workLifeBalance?: number;
    learningOpportunities?: number;
    teamEnvironment?: number;
  };
  
  // Ratings
  ratings?: {
    overall?: number;
    workLifeBalance?: number;
    careerGrowth?: number;
    compensation?: number;
    culture?: number;
    reviewCount?: number;
  };
  
  // Counts
  followerCount?: number;
  jobCount?: number;
  isFollowing?: boolean;
  
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface CompanySearchParams {
  search?: string;
  industry?: string;
  city?: string;
  techStack?: string;
  companyType?: string;
  hiringStatus?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
}

// API Functions
export const companiesApi = {
  // Get companies list
  getCompanies: async (params: CompanySearchParams = {}) => {
    const response = await api.get('/companies', { params });
    return response.data;
  },

  // Get company by ID or slug
  getCompany: async (identifier: string) => {
    const response = await api.get(`/companies/${identifier}`);
    return response.data;
  },

  // Get featured companies
  getFeaturedCompanies: async () => {
    const response = await api.get('/companies/featured');
    return response.data;
  },

  // Get actively hiring companies
  getHiringCompanies: async () => {
    const response = await api.get('/companies/hiring');
    return response.data;
  },

  // Get industries list
  getIndustries: async () => {
    const response = await api.get('/companies/industries');
    return response.data;
  },

  // Suggest a new company
  suggestCompany: async (companyData: {
    name: string;
    website?: string;
    industry?: string;
    description?: string;
  }) => {
    const response = await api.post('/companies/suggest', companyData);
    return response.data;
  },

  // Toggle follow company
  toggleFollowCompany: async (companyId: string) => {
    const response = await api.post(`/companies/${companyId}/follow`);
    return response.data;
  },

  // Get followed companies
  getFollowedCompanies: async () => {
    const response = await api.get('/companies/user/following');
    return response.data;
  },

  // Admin: Create company
  createCompany: async (companyData: Partial<Company>) => {
    const response = await api.post('/companies', companyData);
    return response.data;
  },

  // Admin: Update company
  updateCompany: async (id: string, updates: Partial<Company>) => {
    const response = await api.put(`/companies/${id}`, updates);
    return response.data;
  },

  // Admin: Delete company
  deleteCompany: async (id: string) => {
    const response = await api.delete(`/companies/${id}`);
    return response.data;
  },

  // Admin: Get pending companies
  getPendingCompanies: async () => {
    const response = await api.get('/companies/admin/pending');
    return response.data;
  },

  // Admin: Approve company
  approveCompany: async (id: string) => {
    const response = await api.put(`/companies/${id}/approve`);
    return response.data;
  },

  // Admin: Reject company
  rejectCompany: async (id: string, reason: string) => {
    const response = await api.put(`/companies/${id}/reject`, { reason });
    return response.data;
  },
};

export default companiesApi;
