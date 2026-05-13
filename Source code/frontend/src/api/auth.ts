import api, { secureLogout, logoutAllDevices } from './axios';

export interface RegisterData {
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  collegeName: string;
  degree: string;
  fieldOfStudy: string;
  yearOfStudy: string;
  targetRole: string;
  knownTechnologies: string | string[];
  linkedin?: string;
  github?: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface OnboardingData {
  collegeName?: string;
  degree?: string;
  fieldOfStudy?: string;
  yearOfStudy?: string;
  cgpa?: string;
  targetRole?: string;
  skillRatings?: Record<string, number>;
  placementTimeline?: string;
  expectedCtc?: string;
  preferredCompanies?: string[];
}

export interface AssessmentData {
  placementReadinessScore?: number;
  atsScore?: number;
  skillGaps?: string[];
  strengths?: string[];
  weaknesses?: string[];
  isFieldTestComplete?: boolean;
  isSkillTestComplete?: boolean;
  isAssessmentComplete?: boolean;
  fieldAssessmentResults?: any;
  skillAssessmentResults?: any;
  lastAssessmentAt?: string;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  collegeName: string;
  degree: string;
  fieldOfStudy: string;
  yearOfStudy: string;
  targetRole: string;
  knownTechnologies: string[];
  linkedin: string;
  github: string;
  resumeUrl?: string;
  role: 'student' | 'admin' | 'superadmin';
  isOnboarded: boolean;
  isAssessmentComplete: boolean;
  isFieldTestComplete: boolean;
  isSkillTestComplete: boolean;
  isAssessmentLocked?: boolean;
  assessmentUnlockDate?: string;
  isEmailVerified?: boolean;
  placementReadinessScore: number;
  atsScore: number;

  skillGaps: string[];
  strengths: string[];
  weaknesses: string[];
  cgpa?: string;
  placementTimeline?: string;
  expectedCtc?: string;
  preferredCompanies?: string[];
  skillRatings?: Record<string, number>;
  testResults?: {
    totalQuestions: number;
    correctAnswers: number;
    score: number;
    sectionResults: {
      name: string;
      total: number;
      correct: number;
      score: number;
    }[];
    takenAt: string;
  };
  interviewScore?: number;
  skillsMatchedScore?: number;

  // Per-stage persistent results
  fieldAssessmentResults?: {
    score: number;
    sections: {
      name: string;
      score: number;
      correct: number;
      total: number;
    }[];
    completedAt: string;
  };
  skillAssessmentResults?: {
    score: number;
    sections: {
      name: string;
      score: number;
      correct: number;
      total: number;
    }[];
    completedAt: string;
  };
}

export interface AuthResponse {
  user: User;
  success: boolean;
  message?: string;
  accessToken?: string;
  token?: string; // Backwards compatibility
  refreshToken?: string;
}

export interface SessionInfo {
  id: string;
  deviceId: string;
  browser: string;
  os: string;
  ipAddress: string;
  lastUsed: string;
  createdAt: string;
  isCurrent: boolean;
}

// Auth API functions with HTTP-only cookie authentication
export const authApi = {
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    // Store tokens in localStorage as fallback for cookie issues
    const token = response.data.accessToken || response.data.token;
    if (token) {
      localStorage.setItem('prepzo-token', token);
    }
    const refreshToken = response.data.refreshToken;
    if (refreshToken) {
      localStorage.setItem('prepzo-refresh-token', refreshToken);
    }
    return response.data;
  },

  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    // Store tokens in localStorage as fallback for cookie issues
    const token = response.data.accessToken || response.data.token;
    if (token) {
      localStorage.setItem('prepzo-token', token);
    }
    const refreshToken = response.data.refreshToken;
    if (refreshToken) {
      localStorage.setItem('prepzo-refresh-token', refreshToken);
    }
    return response.data;
  },

  getMe: async (): Promise<{ user: User }> => {
    const response = await api.get<{ user: User }>('/auth/me');
    return response.data;
  },

  logout: async (): Promise<void> => {
    await secureLogout();
  },

  logoutAll: async (): Promise<void> => {
    await logoutAllDevices();
  },

  // Get active sessions
  getSessions: async (): Promise<{ sessions: SessionInfo[] }> => {
    const response = await api.get<{ sessions: SessionInfo[] }>('/auth/sessions');
    return response.data;
  },

  // Refresh token (called automatically by axios interceptor)
  refresh: async (): Promise<void> => {
    await api.post('/auth/refresh');
  },

  // Email verification
  verifyEmail: async (otp: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.post<{ success: boolean; message: string }>('/auth/verify-email', { otp });
    return response.data;
  },

  resendOTP: async (): Promise<{ success: boolean; message: string }> => {
    const response = await api.post<{ success: boolean; message: string }>('/auth/resend-otp');
    return response.data;
  },

  // Password management
  forgotPassword: async (email: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.post<{ success: boolean; message: string }>('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token: string, password: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.post<{ success: boolean; message: string }>('/auth/reset-password', { token, password });
    return response.data;
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.post<{ success: boolean; message: string }>('/auth/change-password', { currentPassword, newPassword });
    return response.data;
  },
  
  loginWithPhone: async (idToken: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login-phone', { idToken });
    const token = response.data.accessToken || response.data.token;
    if (token) {
      localStorage.setItem('prepzo-token', token);
    }
    const refreshToken = response.data.refreshToken;
    if (refreshToken) {
      localStorage.setItem('prepzo-refresh-token', refreshToken);
    }
    return response.data;
  },

  sendOTP: async (email: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.post<{ success: boolean; message: string }>('/auth/send-otp', { email });
    return response.data;
  },

  verifyOTP: async (email: string, otp: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/verify-otp', { email, otp });
    const token = response.data.accessToken || response.data.token;
    if (token) {
      localStorage.setItem('prepzo-token', token);
    }
    const refreshToken = response.data.refreshToken;
    if (refreshToken) {
      localStorage.setItem('prepzo-refresh-token', refreshToken);
    }
    return response.data;
  },

  // Pre-registration email verification (doesn't require existing account)
  sendSignupOTP: async (email: string, name?: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.post<{ success: boolean; message: string }>('/auth/send-signup-otp', { email, name });
    return response.data;
  },

  verifySignupOTP: async (email: string, otp: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.post<{ success: boolean; message: string }>('/auth/verify-signup-otp', { email, otp });
    return response.data;
  },
};

// User API functions
export const userApi = {
  getProfile: async (): Promise<{ user: User }> => {
    const response = await api.get<{ user: User }>('/users/profile');
    return response.data;
  },

  updateProfile: async (data: Partial<User>): Promise<{ user: User }> => {
    const response = await api.put<{ user: User }>('/users/profile', data);
    return response.data;
  },

  completeOnboarding: async (data: OnboardingData): Promise<{ user: User }> => {
    const response = await api.put<{ user: User }>('/users/onboarding', data);
    return response.data;
  },

  completeAssessment: async (data: AssessmentData): Promise<{ user: User }> => {
    const response = await api.put<{ user: User }>('/users/assessment', data);
    return response.data;
  },
};

// Upload API functions
export interface UploadResponse {
  message: string;
  resumeUrl: string;
  originalName: string;
  size: number;
}

export interface ResumeInfo {
  resumeUrl: string | null;
  originalName: string | null;
  uploadedAt: string | null;
}

export const uploadApi = {
  uploadResume: async (file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('resume', file);
    
    const response = await api.post<UploadResponse>('/upload/resume', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteResume: async (): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>('/upload/resume');
    return response.data;
  },

  getResumeInfo: async (): Promise<ResumeInfo> => {
    const response = await api.get<ResumeInfo>('/upload/resume');
    return response.data;
  },
};

export default { authApi, userApi, uploadApi };
