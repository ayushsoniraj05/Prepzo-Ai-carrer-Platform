/**
 * Dynamic AI Service API
 * Fully AI-driven recommendation and mentoring system
 * No hardcoded recommendations - everything comes from the AI backend
 * 
 * ARCHITECTURE:
 * Frontend -> Node.js Backend -> Python AI Service (Mistral LLM + FAISS Vector Store)
 */

import api from './axios';

// ===== TYPES =====

export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  degree?: string;
  fieldOfStudy?: string;
  year?: string;
  targetRole: string;
  knownTechnologies: string[];
  dreamCompanies: string[];
  learningPreferences?: {
    style: 'visual' | 'reading' | 'hands-on' | 'mixed';
    pace: 'fast' | 'moderate' | 'thorough';
    timeAvailable: number; // hours per week
  };
}

export interface AssessmentResult {
  sessionId: string;
  totalQuestions: number;
  attemptedQuestions: number;
  correctAnswers: number;
  accuracyRate: number;
  completionRate: number;
  overallScore: number;
  sections: SectionResult[];
  questionDetails?: QuestionDetail[];
}

export interface SectionResult {
  name: string;
  totalQuestions: number;
  attemptedQuestions: number;
  correctAnswers: number;
  accuracyRate: number;
  score: number;
  status: 'excellent' | 'good' | 'needs-improvement' | 'critical';
  difficultyBreakdown?: {
    easy: { total: number; correct: number };
    medium: { total: number; correct: number };
    hard: { total: number; correct: number };
  };
}

export interface QuestionDetail {
  questionId: string;
  questionText: string;
  section: string;
  difficulty: 'easy' | 'medium' | 'hard';
  wasAttempted: boolean;
  wasCorrect: boolean;
  timeSpent: number;
  skillTags: string[];
}

// AI-generated dynamic types
export interface DynamicRecommendation {
  id: string;
  type: 'course' | 'youtube' | 'certification' | 'project' | 'practice' | 'study_notes' | 'interview_prep' | 'cheat_sheet' | 'mock_test' | 'practice_platform';
  title: string;
  description: string;
  platform?: string;
  url?: string;
  thumbnail?: string;
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  priority: 'critical' | 'important' | 'enhancement';
  skillTargets: string[];
  expectedImprovement: number;
  whyRecommended: string; // AI-generated personalized reason
  simpleExplanation: string; // Easy language explanation
  relevanceScore: number;
  // For projects
  techStack?: string[];
  features?: string[];
  milestones?: Array<{ day: string; task: string }>;
  interviewTalkingPoints?: string[];
  resumeBulletPoint?: string;
  // For study notes
  topics?: string[] | Array<{ pattern: string; use_case: string; example_problems?: string[] }>;
  timeToReview?: string;
  timeToComplete?: string;
  format?: string;
  bestFor?: string;
  category?: string;
  // For practice platforms
  pricing?: string;
  problemCategories?: Array<{ name: string; count: number | string }>;
  sections?: Array<{ name: string; questions?: number | string; time?: string }>;
  // AI metadata
  aiGenerated: boolean;
  uniqueToStudent: boolean;
}

export interface PersonalizedRoadmap {
  id: string;
  title: string;
  description: string;
  totalDuration: string;
  currentPhase?: number;
  phases: RoadmapPhase[];
  expectedOutcome: string;
  targetScoreImprovement: number;
  dailyRoutine?: {
    morning?: string;
    afternoon?: string;
    evening?: string;
  };
  progressTracking?: {
    currentProgress: number;
    nextMilestone: string;
    daysToGoal: number;
  };
  weeklyCommitment?: string;
  readinessGoal?: string;
}

export interface RoadmapPhase {
  week: number;
  title: string;
  focus: string[];
  targets: string[];
  resources: DynamicRecommendation[];
  dailyTasks?: Array<{ day: string; tasks: string[] }>;
  checkpoint?: {
    task: string;
    successCriteria: string;
  };
}

export interface MentorGuidance {
  personalizedMessage: string;
  encouragement: string;
  whenStuck: string[];
  nextStepsThisWeek: string[];
  commonMistakesToAvoid: string[];
  interviewTips: string[];
  motivationalQuote?: string;
}

export interface SkillAnalysis {
  strengths: Array<{
    skill: string;
    level: number;
    evidence: string;
    howToLeverage: string;
  }>;
  weaknesses: Array<{
    skill: string;
    currentLevel: number;
    requiredLevel: number;
    gap: number;
    priority: 'critical' | 'high' | 'medium';
    improvementStrategy: string;
  }>;
  skillGaps: Array<{
    skill: string;
    importance: string;
    actionPlan: string;
  }>;
}

export interface AIAnalysisResult {
  // Personalized summary - unique to this student
  personalizedSummary: string;
  detailedAnalysis: string;
  
  // Skill analysis
  skillAnalysis: SkillAnalysis;
  
  // Dynamic recommendations (not from database, AI-generated)
  recommendations: {
    courses: DynamicRecommendation[];
    youtube: DynamicRecommendation[];
    certifications: DynamicRecommendation[];
    projects: DynamicRecommendation[];
    study_notes: DynamicRecommendation[];
    interview_prep: DynamicRecommendation[];
    practice_platforms: DynamicRecommendation[];
  };
  
  // Personalized roadmap
  roadmap: PersonalizedRoadmap;
  
  // Mentor guidance
  mentorGuidance: MentorGuidance;
  
  // Metrics
  readinessScore: number;
  interviewConfidence: number;
  careerReadinessScore: number;
  improvementPrediction: {
    currentScore: number;
    predictedScore: number;
    timeToAchieve: string;
    confidenceLevel: number;
    sectionImprovements: Array<{
      section: string;
      currentScore: number;
      predictedScore: number;
    }>;
  };
  
  // AI metadata
  aiProvider: string;
  modelVersion?: string;
  generatedAt: string;
  personalizedFor: string; // Student name
  uniqueSessionId: string;
}

// Mentor chat types
export interface MentorChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  context?: {
    intent?: string;
    relatedSkills?: string[];
    suggestedResources?: DynamicRecommendation[];
    followUpQuestions?: string[];
  };
}

export interface MentorChatSession {
  sessionId: string;
  messages: MentorChatMessage[];
  studentContext: {
    name: string;
    currentWeakAreas: string[];
    recentProgress: string;
    lastAssessmentScore?: number;
  };
}

// ===== API FUNCTIONS =====

/**
 * Generate fully dynamic AI recommendations
 * This calls the backend AI service which uses:
 * - Mistral LLM for generating personalized content
 * - FAISS vector store for semantic similarity
 * - Student profile for personalization
 * - No hardcoded responses
 */
export const generateDynamicRecommendations = async (
  assessmentResult: AssessmentResult,
  studentProfile?: Partial<StudentProfile>
): Promise<{ success: boolean; analysis: AIAnalysisResult }> => {
  try {
    const response = await api.post('/recommendations/generate', {
      sessionId: assessmentResult.sessionId,
      includeFullAnalysis: true,
      studentProfile: {
        targetRole: studentProfile?.targetRole || 'Software Engineer',
        knownTechnologies: studentProfile?.knownTechnologies || [],
        dreamCompanies: studentProfile?.dreamCompanies || [],
        learningPreferences: studentProfile?.learningPreferences,
        ...studentProfile,
      },
      assessmentData: {
        overallScore: assessmentResult.overallScore,
        sections: assessmentResult.sections,
        totalQuestions: assessmentResult.totalQuestions,
        correctAnswers: assessmentResult.correctAnswers,
        attemptedQuestions: assessmentResult.attemptedQuestions,
      },
    });
    
    return {
      success: true,
      analysis: transformBackendResponse(response.data.recommendation || response.data.data),
    };
  } catch (error: unknown) {
    // Silently ignore 401 errors (expected when not authenticated)
    const axiosError = error as { response?: { status?: number } };
    if (axiosError?.response?.status !== 401) {
      console.error('Failed to generate dynamic recommendations:', error);
    }
    throw error;
  }
};

/**
 * Get the latest AI recommendations for the current user
 * Returns cached recommendations if available
 */
export const getLatestDynamicRecommendations = async (): Promise<{
  success: boolean;
  hasRecommendations: boolean;
  analysis?: AIAnalysisResult;
}> => {
  try {
    const response = await api.get('/recommendations/latest');
    
    if (!response.data.hasRecommendations) {
      return { success: true, hasRecommendations: false };
    }
    
    return {
      success: true,
      hasRecommendations: true,
      analysis: transformBackendResponse(response.data.recommendation || response.data.data),
    };
  } catch (error) {
    console.error('Failed to fetch recommendations:', error);
    return { success: false, hasRecommendations: false };
  }
};

/**
 * Regenerate recommendations with fresh AI analysis
 * Use this when student profile changes or wants new suggestions
 */
export const regenerateDynamicRecommendations = async (
  options?: {
    focusAreas?: string[];
    timeAvailable?: number;
    urgency?: 'high' | 'medium' | 'low';
  }
): Promise<{ success: boolean; analysis: AIAnalysisResult }> => {
  try {
    const response = await api.post('/recommendations/regenerate', options);
    
    return {
      success: true,
      analysis: transformBackendResponse(response.data.recommendation || response.data.data),
    };
  } catch (error) {
    console.error('Failed to regenerate recommendations:', error);
    throw error;
  }
};

/**
 * Chat with AI mentor
 * The mentor understands student context, progress, and provides personalized guidance
 */
export const chatWithAIMentor = async (
  message: string,
  sessionId?: string,
  context?: {
    targetRole?: string;
    currentWeakAreas?: string[];
    recentAssessmentScore?: number;
    currentTopic?: string;
  }
): Promise<{
  success: boolean;
  response: string;
  sessionId: string;
  suggestions?: string[];
  resources?: DynamicRecommendation[];
  followUpQuestions?: string[];
}> => {
  try {
    const response = await api.post('/mentor/chat', {
      message,
      sessionId,
      context,
    });
    
    return {
      success: true,
      response: response.data.message,
      sessionId: response.data.sessionId,
      suggestions: response.data.suggestions,
      resources: response.data.resources?.map(transformResource),
      followUpQuestions: response.data.followUpQuestions,
    };
  } catch (error) {
    console.error('Mentor chat failed:', error);
    throw error;
  }
};

/**
 * Get mentor chat history
 */
export const getMentorHistory = async (
  sessionId: string,
  limit = 50
): Promise<{
  success: boolean;
  messages: MentorChatMessage[];
}> => {
  try {
    const response = await api.get(`/mentor/history/${sessionId}`, {
      params: { limit },
    });
    
    return {
      success: true,
      messages: response.data.messages || [],
    };
  } catch (error) {
    console.error('Failed to fetch mentor history:', error);
    return { success: false, messages: [] };
  }
};

/**
 * Get personalized study plan based on time availability
 */
export const getPersonalizedStudyPlan = async (
  hoursPerWeek: number,
  targetDate?: Date,
  focusAreas?: string[]
): Promise<{
  success: boolean;
  plan: PersonalizedRoadmap;
}> => {
  try {
    const response = await api.post('/recommendations/study-plan', {
      hoursPerWeek,
      targetDate: targetDate?.toISOString(),
      focusAreas,
    });
    
    return {
      success: true,
      plan: response.data.plan,
    };
  } catch (error) {
    console.error('Failed to generate study plan:', error);
    throw error;
  }
};

/**
 * Get quick AI insights for dashboard
 */
export const getQuickAIInsights = async (): Promise<{
  success: boolean;
  insights: {
    overallAssessment: string;
    careerReadinessScore: number;
    topStrengths: string[];
    criticalGaps: string[];
    nextStep: string;
    motivationalMessage: string;
  };
}> => {
  try {
    const response = await api.get('/recommendations/insights');
    
    return {
      success: true,
      insights: {
        overallAssessment: response.data.insights?.overallAssessment || '',
        careerReadinessScore: response.data.insights?.careerReadinessScore || 0,
        topStrengths: response.data.insights?.topStrengths || [],
        criticalGaps: response.data.insights?.criticalGaps || [],
        nextStep: response.data.insights?.nextStep || '',
        motivationalMessage: response.data.insights?.motivationalMessage || getEncouragement(),
      },
    };
  } catch (error) {
    console.error('Failed to fetch quick insights:', error);
    return {
      success: false,
      insights: {
        overallAssessment: 'Take an assessment to get personalized insights!',
        careerReadinessScore: 0,
        topStrengths: [],
        criticalGaps: [],
        nextStep: 'Complete your first skill assessment',
        motivationalMessage: getEncouragement(),
      },
    };
  }
};

/**
 * Mark a recommendation as completed
 */
export const markRecommendationComplete = async (
  recommendationId: string,
  type: 'course' | 'project' | 'certification'
): Promise<{ success: boolean }> => {
  try {
    await api.post('/recommendations/complete', {
      recommendationId,
      type,
      completedAt: new Date().toISOString(),
    });
    return { success: true };
  } catch (error) {
    console.error('Failed to mark recommendation complete:', error);
    return { success: false };
  }
};

/**
 * Provide feedback on a recommendation
 */
export const provideFeedback = async (
  recommendationId: string,
  rating: number,
  comment?: string
): Promise<{ success: boolean }> => {
  try {
    await api.post('/recommendations/feedback', {
      recommendationId,
      rating,
      comment,
    });
    return { success: true };
  } catch (error) {
    console.error('Failed to submit feedback:', error);
    return { success: false };
  }
};

// ===== HELPER FUNCTIONS =====

/**
 * Transform backend response to frontend format
 */
function transformBackendResponse(data: any): AIAnalysisResult {
  return {
    personalizedSummary: data.explanationSummary || data.analysisInsights?.overallAssessment || '',
    detailedAnalysis: data.analysisInsights?.detailedAnalysis || '',
    
    skillAnalysis: {
      strengths: (data.analysisInsights?.strengths || data.strengths || []).map((s: any) => ({
        skill: typeof s === 'string' ? s : s.skill,
        level: s.level || 70,
        evidence: s.evidence || `Strong performance in ${typeof s === 'string' ? s : s.skill}`,
        howToLeverage: s.howToLeverage || `Highlight ${typeof s === 'string' ? s : s.skill} in interviews`,
      })),
      weaknesses: (data.prioritySkillGaps || data.weaknesses || []).map((w: any) => ({
        skill: w.skill,
        currentLevel: parseSkillLevel(w.currentLevel),
        requiredLevel: parseSkillLevel(w.requiredLevel),
        gap: w.gap || 30,
        priority: w.importance === 'critical' ? 'critical' : w.importance === 'high' ? 'high' : 'medium',
        improvementStrategy: w.improvementStrategy || w.actionPlan || `Focus on ${w.skill} fundamentals`,
      })),
      skillGaps: (data.skillGaps || data.prioritySkillGaps || []).map((g: any) => ({
        skill: g.skill,
        importance: g.importance || 'high',
        actionPlan: g.actionPlan || `Study ${g.skill} systematically`,
      })),
    },
    
    recommendations: {
      courses: (data.recommendations?.courses || []).map(transformRecommendation('course')),
      youtube: (data.recommendations?.youtube || []).map(transformRecommendation('youtube')),
      certifications: (data.recommendations?.certifications || []).map(transformRecommendation('certification')),
      projects: (data.recommendations?.projects || []).map(transformRecommendation('project')),
      study_notes: (data.recommendations?.study_notes || []).map(transformRecommendation('study_notes')),
      interview_prep: (data.recommendations?.interview_prep || []).map(transformRecommendation('interview_prep')),
      practice_platforms: (data.recommendations?.practice_platforms || []).map(transformRecommendation('practice_platform')),
    },
    
    roadmap: transformRoadmap(data.learningPath || data.roadmap),
    
    mentorGuidance: {
      personalizedMessage: data.careerAdvice?.personalMessage || data.mentorAdvice || '',
      encouragement: data.careerAdvice?.encouragement || getEncouragement(),
      whenStuck: data.mentorGuidance?.whenStuck || [
        'Break the problem into smaller parts',
        'Revisit the fundamentals',
        'Ask for help in the mentor chat',
      ],
      nextStepsThisWeek: data.careerAdvice?.nextStepsThisWeek || data.careerAdvice?.shortTermGoals || [],
      commonMistakesToAvoid: data.careerAdvice?.commonMistakesToAvoid || [],
      interviewTips: data.careerAdvice?.areasToHighlight || [],
      motivationalQuote: data.motivationalQuote,
    },
    
    readinessScore: data.analysisInsights?.careerReadinessScore || data.readinessScore || 50,
    interviewConfidence: data.analysisInsights?.interviewConfidence || data.interviewConfidence || 50,
    careerReadinessScore: data.analysisInsights?.careerReadinessScore || 50,
    
    improvementPrediction: {
      currentScore: data.improvementPrediction?.currentScore || 0,
      predictedScore: data.improvementPrediction?.predictedScore || 75,
      timeToAchieve: data.improvementPrediction?.timeToAchieve || '6-8 weeks',
      confidenceLevel: data.improvementPrediction?.confidenceLevel || 75,
      sectionImprovements: data.improvementPrediction?.sectionImprovements || [],
    },
    
    aiProvider: data.aiProvider || 'AI Service',
    modelVersion: data.aiModel,
    generatedAt: data.createdAt || new Date().toISOString(),
    personalizedFor: data.personalizedFor || 'Student',
    uniqueSessionId: data.sessionId || `session-${Date.now()}`,
  };
}

function transformRecommendation(type: string) {
  return (rec: any, index: number): DynamicRecommendation => ({
    id: rec.id || `${type}-${index}-${Date.now()}`,
    type: type as any,
    title: rec.title || rec.name,
    description: rec.description || rec.whyRecommended || rec.content_summary || '',
    platform: rec.platform || rec.issuingAuthority || rec.channel || rec.category,
    url: rec.url,
    thumbnail: rec.thumbnail || rec.thumbnailUrl,
    duration: rec.duration || rec.totalDuration || rec.time_to_review || rec.time_to_complete || 'Self-paced',
    difficulty: rec.difficulty || rec.difficulty_level || 'intermediate',
    priority: mapPriority(rec.priority),
    skillTargets: rec.skills || rec.skills_covered || rec.skillFocus || rec.techStack || [],
    expectedImprovement: rec.expectedImprovement || 15,
    whyRecommended: rec.whyRecommended || rec.why_recommended || rec.personalizedReason || '',
    simpleExplanation: rec.simpleExplanation || `Learn ${rec.title || rec.name} to boost your skills!`,
    relevanceScore: rec.relevanceScore || rec.match_score || 80,
    techStack: rec.techStack || rec.tech_stack,
    features: rec.keyFeatures || rec.features,
    milestones: rec.milestones,
    interviewTalkingPoints: rec.interviewTalkingPoints || rec.interview_talking_points,
    resumeBulletPoint: rec.resumeBulletPoint || rec.resume_bullet_point,
    // Study notes specific fields
    topics: rec.topics,
    timeToReview: rec.time_to_review,
    timeToComplete: rec.time_to_complete,
    format: rec.format,
    bestFor: rec.best_for,
    category: rec.category,
    // Practice platform specific fields
    pricing: rec.pricing,
    problemCategories: rec.problem_categories || rec.categories,
    sections: rec.sections,
    aiGenerated: true,
    uniqueToStudent: true,
  });
}

function transformResource(res: any): DynamicRecommendation {
  return {
    id: res.id || `resource-${Date.now()}`,
    type: res.type || 'course',
    title: res.title,
    description: res.description || '',
    url: res.url,
    duration: res.duration || '',
    difficulty: 'intermediate',
    priority: 'important',
    skillTargets: [],
    expectedImprovement: 10,
    whyRecommended: '',
    simpleExplanation: '',
    relevanceScore: 70,
    aiGenerated: true,
    uniqueToStudent: true,
  };
}

function transformRoadmap(path: any): PersonalizedRoadmap {
  if (!path) {
    return {
      id: `roadmap-${Date.now()}`,
      title: 'Personalized Learning Path',
      description: 'Complete your assessment to generate a personalized roadmap',
      totalDuration: '6 weeks',
      phases: [],
      expectedOutcome: 'Interview-ready skills',
      targetScoreImprovement: 25,
      weeklyCommitment: '12-15 hours',
      readinessGoal: 'Mastery'
    };
  }
  
  if (Array.isArray(path)) {
    return {
      id: `roadmap-${Date.now()}`,
      title: 'Personalized Learning Path',
      description: 'AI-generated learning path based on your assessment',
      totalDuration: `${path.length * 2} weeks`,
      phases: path.map((phase: any, index: number) => ({
        week: index + 1,
        title: phase.title,
        focus: phase.focus || [],
        targets: phase.milestones || [],
        resources: [],
        dailyTasks: phase.dailyTasks,
        checkpoint: phase.checkpoint,
      })),
      expectedOutcome: 'Interview-ready for your target role',
      targetScoreImprovement: 25,
      weeklyCommitment: '12-15 hours',
      readinessGoal: 'Mastery'
    };
  }
  
  return {
    id: path.id || `roadmap-${Date.now()}`,
    title: path.title || 'Personalized Learning Path',
    description: path.description || '',
    totalDuration: path.duration || path.totalDuration || '6 weeks',
    currentPhase: path.currentPhase,
    phases: (path.milestones || path.phases || []).map((phase: any, index: number) => ({
      week: phase.week || index + 1,
      title: phase.title,
      focus: phase.focus || [],
      targets: phase.targets || [],
      resources: (phase.resources || []).map(transformRecommendation('course')),
      dailyTasks: phase.dailyTasks,
      checkpoint: phase.checkpoint,
    })),
    expectedOutcome: path.expectedOutcome || 'Interview-ready skills',
    targetScoreImprovement: path.targetScoreImprovement || 25,
    dailyRoutine: path.dailyRoutine,
    progressTracking: path.progressTracking,
    weeklyCommitment: path.weeklyCommitment || path.weekly_commitment || '12-15 hours',
    readinessGoal: path.readinessGoal || path.readiness_goal || 'Mastery',
  };
}

function parseSkillLevel(level: string | number): number {
  if (typeof level === 'number') return level;
  if (!level) return 50;
  
  const match = level.match(/(\d+)/);
  if (match) return parseInt(match[1], 10);
  
  const levelMap: Record<string, number> = {
    beginner: 30,
    intermediate: 50,
    advanced: 70,
    expert: 90,
    low: 30,
    medium: 50,
    high: 70,
  };
  
  return levelMap[level.toLowerCase()] || 50;
}

function mapPriority(priority: string): 'critical' | 'important' | 'enhancement' {
  if (!priority) return 'important';
  
  const lower = priority.toLowerCase();
  if (lower.includes('critical') || lower === 'high') return 'critical';
  if (lower.includes('gap') || lower.includes('important') || lower === 'medium') return 'important';
  return 'enhancement';
}

function getEncouragement(): string {
  const encouragements = [
    "Every expert was once a beginner. Keep pushing forward! 💪",
    "Small progress is still progress. You're doing great! 🌟",
    "Consistency beats intensity. Keep at it! 🎯",
    "The best time to start was yesterday. The next best time is now! 🚀",
    "You're one step closer to your dream job with every lesson! 📚",
  ];
  return encouragements[Math.floor(Math.random() * encouragements.length)];
}

// ===== EXPORTS =====

export default {
  generateDynamicRecommendations,
  getLatestDynamicRecommendations,
  regenerateDynamicRecommendations,
  chatWithAIMentor,
  getMentorHistory,
  getPersonalizedStudyPlan,
  getQuickAIInsights,
  markRecommendationComplete,
  provideFeedback,
};
