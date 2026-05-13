import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi, userApi, RegisterData, LoginData, OnboardingData, SessionInfo, AssessmentData } from '@/api/auth';

export interface User {
  id: string;
  _id?: string;
  fullName: string;
  profileImage?: string;
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
  resumeText?: string;
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

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  sessions: SessionInfo[];
  // Sync actions (for local state updates)
  login: (user: User) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  completeOnboarding: () => void;
  completeAssessment: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  // Async actions (API calls)
  registerAsync: (data: RegisterData) => Promise<User>;
  loginAsync: (data: LoginData) => Promise<User>;
  logoutAsync: () => Promise<void>;
  logoutAllAsync: () => Promise<void>;
  fetchUser: () => Promise<User | null>;
  fetchSessions: () => Promise<SessionInfo[]>;
  completeOnboardingAsync: (data: OnboardingData) => Promise<User>;
  verifyEmailAsync: (otp: string) => Promise<void>;
  resendOTPAsync: () => Promise<void>;
  changePasswordAsync: (currentPassword: string, newPassword: string) => Promise<void>;
  completeAssessmentAsync: (data: AssessmentData) => Promise<User>;
  updateProfileAsync: (data: Partial<User>) => Promise<User>;
  loginWithPhoneAsync: (idToken: string) => Promise<User>;
  sendOTPAsync: (email: string) => Promise<void>;
  verifyOTPAsync: (email: string, otp: string) => Promise<User>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      sessions: [],
      
      // Sync actions
      login: (user) => set({ user, isAuthenticated: true, error: null }),
      logout: () => {
        // Clear all authentication tokens
        localStorage.removeItem('prepzo-token');
        localStorage.removeItem('prepzo-refresh-token');
        // Clear user-specific resume analysis data to prevent data leakage between users
        localStorage.removeItem('prepzo-app-storage');
        localStorage.removeItem('aiRecommendations');
        localStorage.removeItem('testAnalysis');
        localStorage.removeItem('latestTestResult');
        set({ user: null, isAuthenticated: false, error: null, sessions: [] });
      },
      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
      completeOnboarding: () =>
        set((state) => ({
          user: state.user ? { ...state.user, isOnboarded: true } : null,
        })),
      completeAssessment: () =>
        set((state) => ({
          user: state.user ? { ...state.user, isAssessmentComplete: true } : null,
        })),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
      
      // Async actions
      registerAsync: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.register(data);
          set({ user: response.user, isAuthenticated: true, isLoading: false });
          return response.user;
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 
            (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Registration failed';
          set({ isLoading: false, error: message });
          throw error;
        }
      },
      
      loginAsync: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.login(data);
          set({ user: response.user, isAuthenticated: true, isLoading: false });
          return response.user;
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 
            (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Login failed';
          set({ isLoading: false, error: message });
          throw error;
        }
      },
      
      logoutAsync: async () => {
        try {
          await authApi.logout();
        } finally {
          get().logout();
        }
      },

      logoutAllAsync: async () => {
        try {
          await authApi.logoutAll();
        } finally {
          get().logout();
        }
      },
      
      fetchUser: async () => {
        set({ isLoading: true });
        try {
          const response = await authApi.getMe();
          set({ user: response.user, isAuthenticated: true, isLoading: false });
          return response.user;
        } catch (error: unknown) {
          set({ isLoading: false });
          // Only logout if we get an explicit 401 (unauthorized) response
          // For network errors or other issues, keep using persisted auth data
          const axiosError = error as { response?: { status?: number } };
          if (axiosError?.response?.status === 401) {
            // Silent logout on 401 - this is expected when not logged in
            get().logout();
            return null;
          }
          // Return the persisted user if available (don't logout on network errors)
          return get().user;
        }
      },

      fetchSessions: async () => {
        try {
          const response = await authApi.getSessions();
          set({ sessions: response.sessions });
          return response.sessions;
        } catch {
          return [];
        }
      },
      
      completeOnboardingAsync: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await userApi.completeOnboarding(data);
          set({ user: response.user, isLoading: false });
          return response.user;
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 
            (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Onboarding failed';
          set({ isLoading: false, error: message });
          throw error;
        }
      },

      verifyEmailAsync: async (otp) => {
        set({ isLoading: true, error: null });
        try {
          await authApi.verifyEmail(otp);
          set((state) => ({
            isLoading: false,
            user: state.user ? { ...state.user, isEmailVerified: true } : null,
          }));
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 
            (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Verification failed';
          set({ isLoading: false, error: message });
          throw error;
        }
      },

      resendOTPAsync: async () => {
        set({ isLoading: true, error: null });
        try {
          await authApi.resendOTP();
          set({ isLoading: false });
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 
            (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to resend OTP';
          set({ isLoading: false, error: message });
          throw error;
        }
      },

      changePasswordAsync: async (currentPassword, newPassword) => {
        set({ isLoading: true, error: null });
        try {
          await authApi.changePassword(currentPassword, newPassword);
          set({ isLoading: false });
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 
            (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Password change failed';
          set({ isLoading: false, error: message });
          throw error;
        }
      },

      completeAssessmentAsync: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await userApi.completeAssessment(data);
          set({ user: response.user, isLoading: false });
          return response.user;
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 
            (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Assessment synchronization failed';
          set({ isLoading: false, error: message });
          throw error;
        }
      },

      updateProfileAsync: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await userApi.updateProfile(data);
          set({ user: response.user, isLoading: false });
          return response.user;
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 
            (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Profile update failed';
          set({ isLoading: false, error: message });
          throw error;
        }
      },

      loginWithPhoneAsync: async (idToken) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.loginWithPhone(idToken);
          set({ user: response.user, isAuthenticated: true, isLoading: false });
          return response.user;
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 
            (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Phone login failed';
          set({ isLoading: false, error: message });
          throw error;
        }
      },

      sendOTPAsync: async (email) => {
        set({ isLoading: true, error: null });
        try {
          await authApi.sendOTP(email);
          set({ isLoading: false });
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 
            (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to send code';
          set({ isLoading: false, error: message });
          throw error;
        }
      },

      verifyOTPAsync: async (email, otp) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.verifyOTP(email, otp);
          set({ user: response.user, isAuthenticated: true, isLoading: false });
          return response.user;
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 
            (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Verification failed';
          set({ isLoading: false, error: message });
          throw error;
        }
      },
    }),
    {
      name: 'prepzo-auth',
      // Only persist non-sensitive data
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      // Note: Session validation happens in App.tsx via fetchUser() on mount
      // which will properly log out the user if the session has expired
    }
  )
);
