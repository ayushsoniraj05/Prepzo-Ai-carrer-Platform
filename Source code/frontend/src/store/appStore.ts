import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useAuthStore } from './authStore';
import { getResumeAnalysis, analyzeResume as analyzeResumeAPI, reanalyzeResume as reanalyzeResumeAPI, AtsHistoryPoint } from '../api/resume';

// Resume analysis type (matches backend schema)
interface ResumeAnalysisPersist {
  overallScore: number;
  sections: { name: string; score: number; feedback: string[]; icon: string }[];
  keywords: string[];
  missingKeywords: string[];
  suggestions: string[];
  improvedLines?: { original: string; improved: string; reason: string }[];
  suggestedSummary?: string;
  jobMatch: {
    score?: number;
    jobTitle?: string;
    matchPercentage?: number;
    matchedSkills?: string[];
    missingSkills?: string[];
    requiredSkillsMatch?: { skill: string; found: boolean; importance: 'required' | 'preferred' }[];
    feedback?: string;
  };
  skillGaps?: {
    skill: string;
    importance: 'critical' | 'high' | 'medium';
    description: string;
    certifications: {
      name: string;
      provider: string;
      url: string;
      duration: string;
      difficulty: 'beginner' | 'intermediate' | 'advanced';
      skills: string[];
      price: string;
      rating: number;
    }[];
  }[];
  skillGapsDetailed?: {
    skill: string;
    importance: 'critical' | 'high' | 'medium';
    description: string;
    certifications: {
      name: string;
      provider: string;
      url: string;
      duration: string;
      difficulty: 'beginner' | 'intermediate' | 'advanced';
      skills: string[];
      price: string;
      rating: number;
    }[];
  }[];
  formatAnalysis: {
    category: string;
    status: 'good' | 'warning' | 'error';
    message: string;
    tip: string;
  }[];
  improvementPlan: {
    priority: number;
    action: string;
    impact: 'high' | 'medium' | 'low';
    timeToComplete: string;
    details: string;
  }[];
  industryComparison: {
    metric: string;
    yourScore: number;
    average: number;
    topPerformers: number;
  }[];
  strengthsSummary?: string[];
  weaknessesSummary?: string[];
  extractedData?: {
    skills: string[];
    experience: { company: string; role: string; duration: string }[];
    education: { degree: string; institution: string; year: string }[];
    projects: { name: string; description: string; technologies: string[] }[];
    certifications: string[];
  };
  analyzedAt?: string;
  analyzerVersion?: string;
  targetRoleUsed?: string;
  roleContext?: {
    targetRole?: string;
    jobDescriptionUsed?: string;
    demoJobId?: string | null;
    analyzedAgainst?: string;
  };
  keywordAnalysis?: {
    jdKeywords: string[];
    matchedKeywords: string[];
    missingKeywords: string[];
    keywordMatchRate: number;
    industryKeywordDensity: number;
  };
  skillGapAnalysis?: {
    currentSkills: string[];
    missingSkills: string[];
    recommendations: string[];
  };
  atsBreakdown?: {
    factors: Array<{ id: string; label: string; weight: number; score: number }>;
    weightedScore: number;
    baselineAIATS: number;
  };
  aiRecommendations?: {
    skillsToLearn: string[];
    projectsToBuild: string[];
    certificationsToPursue: string[];
    technologiesToAdd: string[];
    coursesToTake: string[];
    industryTools: string[];
  };
  resumeRewrite?: {
    beforeAfterPairs: Array<{ original: string; improved: string; reason: string }>;
    summaryRewrite: string;
  };
  recruiterSimulation?: {
    strengths: string[];
    concerns: string[];
    recommendation: string;
  };
  linkedinOptimization?: {
    optimizedHeadline: string;
    summarySuggestions: string[];
    skillHighlights: string[];
    networkingStrategies: string[];
    portfolioLinksSuggestions: string[];
  };
  resumeRanking?: {
    percentile: number;
    tier: string;
    rankingFactors: {
      atsScore: number;
      skillRelevance: number;
      projectQuality: number;
      experienceRelevance: number;
    };
  };
  interviewSuccess?: {
    probability: number;
    strengths: string[];
    weaknesses: string[];
    communicationReadiness: number;
    recommendations: string[];
  };
  scoreSimulation?: {
    currentScore: number;
    expectedScoreAfterImprovements: number;
    topActions: string[];
  };
  careerRoadmap?: {
    milestones: Array<{ week: string; goal: string; output: string }>;
  };
  mentorContextPrompts?: string[];
}

interface AppState {
  darkMode: boolean;
  currentPage: string;
  dashboardTab: string;
  isGlobalLoading: boolean;
  globalLoadingText: string;
  setGlobalLoading: (loading: boolean, text?: string) => void;
  // Resume analysis - stored in backend, only cached locally
  resumeAnalysis: ResumeAnalysisPersist | null;
  atsHistory: AtsHistoryPoint[];
  resumeAnalysisLoading: boolean;
  resumeAnalysisError: string | null;
  analysisStep: 'upload' | 'selectJob' | 'analyzing' | 'results';
  selectedJobId: string | null;
  selectedNoteId: string | null;
  toggleDarkMode: () => void;
  setCurrentPage: (page: string) => void;
  setDashboardTab: (tab: string) => void;
  showFullRecommendations: boolean;
  setShowFullRecommendations: (show: boolean) => void;
  setResumeAnalysis: (analysis: ResumeAnalysisPersist | null) => void;
  setAnalysisStep: (step: 'upload' | 'selectJob' | 'analyzing' | 'results') => void;
  setSelectedJobId: (jobId: string | null) => void;
  setSelectedNoteId: (noteId: string | null) => void;
  resetResumeState: () => void;
  // New functions for backend integration
  loadResumeAnalysisFromBackend: () => Promise<void>;
  analyzeResume: (resumeText: string, targetRole?: string, jobDescription?: string, demoJobId?: string) => Promise<void>;
  reanalyzeWithRole: (targetRole: string, jobDescription?: string, demoJobId?: string) => Promise<void>;
  // AI Resume Maker
  generatedResume: { markdown: string; summary: string; tips: string[]; resume_data?: any } | null;
  resumeGenerationLoading: boolean;
  resumeGenerationError: string | null;
  generateResume: (targetRole?: string, jobDescription?: string, templateStyle?: string) => Promise<void>;
  setGeneratedResume: (resume: { markdown: string; summary: string; tips: string[]; resume_data?: any } | null) => void;
  autofillResumeText: () => string;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      darkMode: true,
      currentPage: 'landing',
      dashboardTab: 'home',
      isGlobalLoading: false,
      globalLoadingText: 'Synchronizing neural grid...',
      showFullRecommendations: false,
      resumeAnalysis: null,
      atsHistory: [],
      resumeAnalysisLoading: false,
      resumeAnalysisError: null,
      analysisStep: 'upload',
      selectedJobId: null,
      selectedNoteId: null,
      generatedResume: null,
      resumeGenerationLoading: false,
      resumeGenerationError: null,
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
      setCurrentPage: (page) => set({ currentPage: page }),
      setDashboardTab: (tab) => set({ dashboardTab: tab }),
      setGlobalLoading: (loading, text) => set({ 
        isGlobalLoading: loading, 
        globalLoadingText: text || 'Synchronizing neural grid...' 
      }),
      setShowFullRecommendations: (show) => set({ showFullRecommendations: show }),
      setResumeAnalysis: (analysis) => set({ resumeAnalysis: analysis }),
      setAnalysisStep: (step) => set({ analysisStep: step }),
      setSelectedJobId: (jobId) => set({ selectedJobId: jobId }),
      setSelectedNoteId: (noteId) => set({ selectedNoteId: noteId }),
      resetResumeState: () => set({ 
        resumeAnalysis: null, 
        atsHistory: [],
        analysisStep: 'upload', 
        selectedJobId: null,
        resumeAnalysisLoading: false,
        resumeAnalysisError: null,
        generatedResume: null,
        resumeGenerationLoading: false,
        resumeGenerationError: null,
      }),
      setGeneratedResume: (resume) => set({ generatedResume: resume }),
      
      // Load resume analysis from backend (user-specific!)
      loadResumeAnalysisFromBackend: async () => {
        set({ resumeAnalysisLoading: true, resumeAnalysisError: null });
        try {
          const response = await getResumeAnalysis();
          if (response.success && response.data.analysis) {
            set({ 
              resumeAnalysis: response.data.analysis as unknown as ResumeAnalysisPersist,
              atsHistory: response.data.atsHistory || [],
              analysisStep: 'results',
              resumeAnalysisLoading: false 
            });
          } else {
            set({ 
              resumeAnalysis: null,
              atsHistory: response.data.atsHistory || [],
              analysisStep: 'upload',
              resumeAnalysisLoading: false 
            });
          }
        } catch (error: unknown) {
          // Silently ignore 401 errors (expected when not authenticated)
          const axiosError = error as { response?: { status?: number } };
          if (axiosError?.response?.status !== 401) {
            console.error('Failed to load resume analysis:', error);
          }
          set({ 
            resumeAnalysisLoading: false, 
            resumeAnalysisError: null  // Don't set error for auth issues
          });
        }
      },
      
      // Analyze resume using AI backend
      analyzeResume: async (resumeText: string, targetRole?: string, jobDescription?: string, demoJobId?: string) => {
        set({ resumeAnalysisLoading: true, resumeAnalysisError: null, analysisStep: 'analyzing' });
        try {
          const response = await analyzeResumeAPI(resumeText, targetRole, jobDescription, demoJobId);
          if (response.success) {
            set({ 
              resumeAnalysis: response.data.analysis as unknown as ResumeAnalysisPersist,
              analysisStep: 'results',
              resumeAnalysisLoading: false 
            });
          } else {
            throw new Error('Analysis failed');
          }
        } catch (error: unknown) {
          console.error('Resume analysis error:', error);
          const axiosError = error as { response?: { data?: { message?: string } } };
          const errorMessage =
            axiosError.response?.data?.message ||
            (error instanceof Error ? error.message : 'Resume analysis failed');
          set({ 
            resumeAnalysisLoading: false, 
            resumeAnalysisError: errorMessage,
            analysisStep: 'upload'
          });
          throw error;
        }
      },
      
      // Re-analyze with different target role
      reanalyzeWithRole: async (targetRole: string, jobDescription?: string, demoJobId?: string) => {
        set({ resumeAnalysisLoading: true, resumeAnalysisError: null });
        try {
          const response = await reanalyzeResumeAPI(targetRole, jobDescription, demoJobId);
          if (response.success) {
            set({ 
              resumeAnalysis: response.data.analysis as unknown as ResumeAnalysisPersist,
              resumeAnalysisLoading: false 
            });
          } else {
            throw new Error('Re-analysis failed');
          }
        } catch (error: unknown) {
          const axiosError = error as { response?: { status?: number; data?: { message?: string } } };
          if (axiosError.response?.status !== 400) {
            console.error('Resume re-analysis error:', error);
          }
          const errorMessage =
            axiosError.response?.data?.message ||
            (error instanceof Error ? error.message : 'Resume re-analysis failed');
          set({ 
            resumeAnalysisLoading: false, 
            resumeAnalysisError: errorMessage
          });
          throw error;
        }
      },

      generateResume: async (targetRole?: string, jobDescription?: string, templateStyle?: string) => {
        set({ resumeGenerationLoading: true, resumeGenerationError: null });
        try {
          const { generateResume: generateResumeAPI } = await import('../api/resume');
          const user = useAuthStore.getState().user;
          const response = await generateResumeAPI(user, targetRole || 'Software Engineer', jobDescription, templateStyle);
          if (response.success) {
            set({ 
              generatedResume: response.data,
              resumeGenerationLoading: false 
            });
          } else {
            throw new Error('Generation failed');
          }
        } catch (error: any) {
          console.error('Resume generation error:', error);
          const errorMessage = error.response?.data?.message || error.message || 'Resume generation failed';
          set({ 
            resumeGenerationLoading: false, 
            resumeGenerationError: errorMessage 
          });
          throw error;
        }
      },

      autofillResumeText: () => {
        const { resumeAnalysis } = get();
        if (!resumeAnalysis || !resumeAnalysis.extractedData) return '';
        
        const { extractedData } = resumeAnalysis;
        const sections = [];

        if (extractedData.experience?.length) {
          sections.push('EXPERIENCE:');
          extractedData.experience.forEach(exp => {
            sections.push(`${exp.role} at ${exp.company} (${exp.duration})`);
          });
        }

        if (extractedData.skills?.length) {
          sections.push('\nSKILLS:');
          sections.push(extractedData.skills.join(', '));
        }

        if (extractedData.education?.length) {
          sections.push('\nEDUCATION:');
          extractedData.education.forEach(edu => {
            sections.push(`${edu.degree} from ${edu.institution} (${edu.year})`);
          });
        }

        if (extractedData.projects?.length) {
          sections.push('\nPROJECTS:');
          extractedData.projects.forEach(proj => {
            sections.push(`${proj.name}: ${proj.description} (${(proj.technologies || []).join(', ')})`);
          });
        }

        return sections.join('\n');
      },
    }),
    {
      name: 'prepzo-app-storage',
      // Only persist settings, NOT resume analysis (that comes from backend)
      partialize: (state) => ({
        darkMode: state.darkMode,
        dashboardTab: state.dashboardTab,
        showFullRecommendations: state.showFullRecommendations,
        analysisStep: state.analysisStep,
        selectedJobId: state.selectedJobId,
        // Don't persist resumeAnalysis - it's user-specific and comes from backend
      }),
    }
  )
);
