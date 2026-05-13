/**
 * Resume API Module
 * Handles all resume analysis and AI mentor API calls
 */

import axiosInstance from './axios';

// Types
export interface ResumeSection {
  name: string;
  score: number;
  feedback: string[];
  icon: string;
}

export interface SkillGap {
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
}

export interface ResumeAnalysis {
  overallScore: number;
  sections: ResumeSection[];
  keywords: string[];
  missingKeywords: string[];
  suggestions: string[];
  improvedLines: { original: string; improved: string; reason: string }[];
  suggestedSummary: string;
  jobMatch: {
    score: number;
    matchedSkills: string[];
    missingSkills: string[];
    feedback: string;
  };
  skillGapsDetailed: SkillGap[];
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
  strengthsSummary: string[];
  weaknessesSummary: string[];
  extractedData: {
    skills: string[];
    experience: { company: string; role: string; duration: string }[];
    education: { degree: string; institution: string; year: string }[];
    projects: { name: string; description: string; technologies: string[] }[];
    certifications: string[];
  };
  analyzedAt: string;
  analyzerVersion: string;
  targetRoleUsed: string;
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
  parsedResume?: {
    name?: string;
    technicalSkills?: string[];
    projects?: Array<{ name?: string; description?: string }>;
    workExperience?: Array<{ role?: string; company?: string }>;
    certifications?: string[];
    technologiesUsed?: string[];
    achievements?: string[];
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
  projectQualityEvaluation?: {
    projectCount: number;
    score: number;
    notes: string;
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

export interface ResumeGenerationResult {
  markdown: string;
  summary: string;
  tips: string[];
}

export interface AtsHistoryPoint {
  score: number;
  targetRole?: string;
  analyzedAt: string;
  source?: 'analyze' | 'reanalyze';
}

export interface MentorResponse {
  answer: string;
  mentorName: string;
  relatedTopics: string[];
  actionItems: string[];
}

export interface QuickTip {
  tip: string;
  category: string;
  mentorName: string;
}

export interface Checklist {
  checklist: { item: string; completed: boolean; priority: number }[];
  priorityOrder: string[];
  mentorName: string;
}

// API Functions

/**
 * Analyze resume and store results in user profile
 */
export const analyzeResume = async (
  resumeText: string,
  targetRole?: string,
  jobDescription?: string,
  demoJobId?: string
): Promise<{ success: boolean; data: { analysis: ResumeAnalysis; userId: string } }> => {
  const response = await axiosInstance.post('/resume/analyze', {
    resumeText,
    targetRole,
    jobDescription,
    demoJobId,
  });
  return response.data;
};

/**
 * Get user's stored resume analysis
 */
export const getResumeAnalysis = async (): Promise<{
  success: boolean;
  data: {
    analysis: ResumeAnalysis | null;
    hasResume: boolean;
    targetRole: string;
    atsHistory?: AtsHistoryPoint[];
  };
}> => {
  const response = await axiosInstance.get('/resume/analysis');
  return response.data;
};

/**
 * Re-analyze resume with different target role
 */
export const reanalyzeResume = async (
  targetRole: string,
  jobDescription?: string,
  demoJobId?: string
): Promise<{ success: boolean; data: { analysis: ResumeAnalysis; newTargetRole: string } }> => {
  const response = await axiosInstance.post('/resume/reanalyze', { targetRole, jobDescription, demoJobId });
  return response.data;
};

/**
 * Clear user's resume analysis
 */
export const clearResumeAnalysis = async (): Promise<{ success: boolean; message: string }> => {
  const response = await axiosInstance.delete('/resume/analysis');
  return response.data;
};

/**
 * Ask AI Resume Mentor a question
 */
export const askResumeMentor = async (
  question: string,
  context?: string
): Promise<{ success: boolean; data: MentorResponse }> => {
  const response = await axiosInstance.post('/resume/mentor/ask', {
    question,
    context,
  });
  return response.data;
};

/**
 * Get quick tip from AI Mentor
 */
export const getQuickTip = async (
  category?: string
): Promise<{ success: boolean; data: QuickTip }> => {
  const response = await axiosInstance.get('/resume/mentor/quick-tip', {
    params: { category },
  });
  return response.data;
};

/**
 * Get improvement checklist from AI Mentor
 */
export const getMentorChecklist = async (): Promise<{
  success: boolean;
  data: Checklist;
}> => {
  const response = await axiosInstance.get('/resume/mentor/checklist');
  return response.data;
};

/**
 * Get role-specific skill requirements
 */
export const getRoleSkills = async (
  role: string
): Promise<{
  success: boolean;
  data: {
    role: string;
    required_skills: string[];
    preferred_skills: string[];
    keywords: string[];
  };
}> => {
  const response = await axiosInstance.get(`/resume/skills/${encodeURIComponent(role)}`);
  return response.data;
};

/**
 * Get action verb suggestions
 */
export const getActionVerbs = async (
  category?: string
): Promise<{
  success: boolean;
  data: {
    verbs: Record<string, string[]>;
    category?: string;
  };
}> => {
  const response = await axiosInstance.get('/resume/action-verbs', {
    params: { category },
  });
  return response.data;
};

/**
 * Generate a professional resume using pure AI
 */
export const generateResume = async (
  userProfile: any,
  targetRole: string,
  jobDescription?: string,
  templateStyle: string = "Standard Professional ATS"
): Promise<{ success: boolean; data: ResumeGenerationResult }> => {
  const response = await axiosInstance.post('/resume/generate', {
    userProfile,
    targetRole,
    jobDescription,
    templateStyle,
  });
  return response.data;
};

export default {
  analyzeResume,
  getResumeAnalysis,
  reanalyzeResume,
  clearResumeAnalysis,
  askResumeMentor,
  getQuickTip,
  getMentorChecklist,
  getRoleSkills,
  getActionVerbs,
  generateResume,
};
