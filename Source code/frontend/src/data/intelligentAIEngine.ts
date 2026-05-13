// --- QuestionAnalysis & SectionAnalysis ---
export interface QuestionAnalysis {
  questionId: string;
  section: string;
  questionText: string;
  options: string[];
  correctAnswer: number;
  userAnswer: number | null;
  wasAttempted: boolean;
  wasCorrect: boolean;
  difficulty: 'easy' | 'medium' | 'hard' | 'advanced';
  explanation?: string;
  skillTags: string[];
  timeSpent?: number;
  companyAskedIn?: string;
}

export interface SectionAnalysis {
  name: string;
  totalQuestions: number;
  attemptedQuestions: number;
  correctAnswers: number;
  accuracyRate?: number;
  score?: number;
  status?: string;
}
// --- Type & Interface Definitions ---
// These should be imported from their respective files if available.
// For now, define them here to resolve errors.

export interface TestAnalysisResult {
  sections: SectionAnalysis[];
  totalQuestions: number;
  attemptedQuestions: number;
  correctAnswers: number;
  accuracyRate?: number;
  completionRate?: number;
  overallScore?: number;
  criticalWeaknesses?: string[];
  questionDetails: QuestionAnalysis[];
}

export interface AIRecommendation {
  id: string;
  type: 'course' | 'youtube' | 'certification' | 'project';
  title: string;
  description: string;
  platform?: string;
  url?: string;
  duration?: string;
  difficulty?: string;
  priority?: string;
  skillTargets?: string[];
  expectedImprovement?: number;
  personalizedReason?: string;
  tags?: string[];
  relevanceScore?: number;
  thumbnailUrl?: string;
  simpleExplanation?: string;
  aiGenerated?: boolean;
  uniqueToStudent?: boolean;
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  duration: string;
  milestones: Array<{ week: number; title: string }>;
  expectedOutcome?: string;
  targetScoreImprovement?: number;
  dailyRoutine?: string[];
}

export interface CareerInsight {
  type: 'strength' | 'opportunity' | 'risk' | 'action';
  title: string;
  description: string;
  priority: number;
  actionable: boolean;
  action?: string;
}

export interface AIAnalysisResult {
  personalizedSummary: string;
  detailedAnalysis?: string;
  skillAnalysis?: any;
  recommendations: {
    courses: any[];
    youtube: any[];
    certifications: any[];
    projects: any[];
    study_notes?: any[];
    interview_prep?: any[];
    practice_platforms?: any[];
  };
  roadmap: {
    id: string;
    title: string;
    description: string;
    totalDuration?: string;
    currentPhase?: number;
    phases?: any[];
    expectedOutcome?: string;
    targetScoreImprovement?: number;
    dailyRoutine?: {
      morning?: string;
      afternoon?: string;
      evening?: string;
    };
  };
  mentorGuidance?: {
    personalizedMessage: string;
    encouragement?: string;
    whenStuck: string[];
    nextStepsThisWeek: string[];
    commonMistakesToAvoid?: string[];
    interviewTips?: string[];
    motivationalQuote?: string;
  };
  readinessScore?: number;
  interviewConfidence?: number;
  careerReadinessScore?: number;
  improvementPrediction?: any;
  aiProvider?: string;
  modelVersion?: string;
  generatedAt?: string;
  personalizedFor?: string;
  uniqueSessionId?: string;
}



// --- Helper Functions ---
function transformDynamicRecs(recs: any[], type: AIRecommendation['type']): AIRecommendation[] {
  return recs.map((rec) => ({
    ...rec,
    type,
    relevanceScore: rec.relevanceScore || 0,
  }));
}

function generateLocalSummary(analysis: TestAnalysisResult, targetRole: string): string {
  const accuracyRate = analysis.accuracyRate || 0;
  const strengths = analysis.sections.filter(s => (s.accuracyRate || 0) > 70).map(s => s.name);
  const weaknesses = analysis.sections.filter(s => (s.accuracyRate || 0) < 50).map(s => s.name);
  let summary = `Assessment for ${targetRole}\n`;
  summary += `Accuracy Rate: ${accuracyRate}%\n`;
  if (strengths.length) summary += `Strengths: ${strengths.join(', ')}\n`;
  if (weaknesses.length) summary += `Focus Areas: ${weaknesses.join(', ')}\n`;
  return summary;
}

// --- API Function Implementation ---
/**
 * Calls the backend AI recommendations endpoint with the given payloads.
 * @param payload Test analysis and section data
 * @param studentProfilePayload User profile and preferences
 * @returns Promise resolving to { analysis: AIAnalysisResult }
 */
async function generateDynamicRecommendations(payload: any, studentProfilePayload: any): Promise<{ analysis: AIAnalysisResult }> {
  // Use the dynamicAI API which does not enforce a 30% threshold
  // and always returns recommendations based on the assessment result
  const { generateDynamicRecommendations } = await import('@/api/dynamicAI');
  // Merge payload and studentProfilePayload into the expected structure
  const assessmentResult = {
    ...payload,
    ...payload.sections && { sections: payload.sections },
    ...payload.questionDetails && { questionDetails: payload.questionDetails },
    sessionId: payload.sessionId || '',
  };
  const studentProfile = {
    ...studentProfilePayload,
  };
  const result = await generateDynamicRecommendations(assessmentResult, studentProfile);
  if (!result || !result.analysis) {
    throw new Error('No analysis returned from AI backend');
  }
  return { analysis: result.analysis };
}

// Exported stub for analyzeTestPerformance
export function analyzeTestPerformance(): any {
  // Implement or import real logic as needed
  return null;
}

// Alias for compatibility with old import
export function generatePersonalizedRecommendations(
  analysis: TestAnalysisResult,
  targetRole: string = 'Software Engineer',
  existingSkills: string[] = [],
  studentProfile?: {
    name?: string;
    dreamCompanies?: string[];
    learningPreferences?: {
      style: 'visual' | 'reading' | 'hands-on' | 'mixed';
      pace: 'fast' | 'moderate' | 'thorough';
      timeAvailable: number;
    };
  }
): Promise<{
  recommendations: AIRecommendation[];
  learningPath: LearningPath;
  insights: CareerInsight[];
  summary: string;
  mentorGuidance?: {
    personalizedMessage: string;
    whenStuck: string[];
    nextStepsThisWeek: string[];
  };
  aiAnalysis?: AIAnalysisResult;
}> {
  // Always call the real backend (no fallback)
  return generatePersonalizedRecommendationsAsync(
    analysis,
    targetRole,
    existingSkills,
    studentProfile
  );
}

// Main async implementation
export async function generatePersonalizedRecommendationsAsync(
  analysis: TestAnalysisResult,
  targetRole: string = 'Software Engineer',
  existingSkills: string[] = [],
  studentProfile?: {
    name?: string;
    dreamCompanies?: string[];
    learningPreferences?: {
      style: 'visual' | 'reading' | 'hands-on' | 'mixed';
      pace: 'fast' | 'moderate' | 'thorough';
      timeAvailable: number;
    };
  }
): Promise<{
  recommendations: AIRecommendation[];
  learningPath: LearningPath;
  insights: CareerInsight[];
  summary: string;
  mentorGuidance?: {
    personalizedMessage: string;
    whenStuck: string[];
    nextStepsThisWeek: string[];
  };
  aiAnalysis?: AIAnalysisResult;
}> {
  try {
    // =========================
    // ✅ STRICT VALIDATION (NO MINIMUM ATTEMPTED THRESHOLD)
    // =========================
    if (!analysis) {
      throw new Error('Analysis data is missing');
    }

    if (!targetRole || targetRole.trim() === '') {
      throw new Error('Target role is required');
    }

    if (!analysis.sections || analysis.sections.length === 0) {
      throw new Error('No section data found. Test must be completed.');
    }

    if (!analysis.totalQuestions || analysis.totalQuestions <= 0) {
      throw new Error('Invalid test data (totalQuestions missing)');
    }

    // =========================
    // ✅ SAFE SECTION TRANSFORM
    // =========================
    const safeSections = analysis.sections.map((s) => {
      const total = s.totalQuestions || 1; // prevent division by 0
      const correct = s.correctAnswers || 0;

      const accuracy =
        typeof s.accuracyRate === 'number'
          ? s.accuracyRate
          : Math.round((correct / total) * 100);

      return {
        name: s.name || 'Unknown',
        totalQuestions: total,
        attemptedQuestions: s.attemptedQuestions || 0,
        correctAnswers: correct,
        accuracyRate: accuracy,
        score: Math.round((correct / total) * 100),
        status: ['critical', 'needs-improvement', 'excellent', 'good'].includes(
          s.status as string
        )
          ? (s.status as 'critical' | 'needs-improvement' | 'excellent' | 'good')
          : 'needs-improvement',
      };
    });

    // =========================
    // ✅ CLEAN PAYLOAD
    // =========================
    const payload = {
      sessionId: `session-${Date.now()}`,
      totalQuestions: analysis.totalQuestions,
      attemptedQuestions: analysis.attemptedQuestions || 0,
      correctAnswers: analysis.correctAnswers || 0,
      accuracyRate: analysis.accuracyRate || 0,
      completionRate: analysis.completionRate || 0,
      overallScore: analysis.overallScore || 0,
      sections: safeSections,
    };

    const studentProfilePayload = {
      targetRole,
      knownTechnologies: existingSkills || [],
      name: studentProfile?.name || '',
      dreamCompanies: studentProfile?.dreamCompanies || [],
      learningPreferences: studentProfile?.learningPreferences
        ? {
            style: studentProfile.learningPreferences.style,
            pace: studentProfile.learningPreferences.pace,
            timeAvailable: studentProfile.learningPreferences.timeAvailable,
          }
        : null,
    };

    // =========================
    // ✅ API CALL (STRICT)
    // =========================
    const result = await generateDynamicRecommendations(
      payload,
      studentProfilePayload
    );

    if (!result || !result.analysis) {
      throw new Error('Invalid AI response from backend');
    }

    const aiAnalysis = result.analysis;

    // =========================
    // ✅ SAFE TRANSFORMATION
    // =========================
    const recommendations: AIRecommendation[] = [
      ...transformDynamicRecs(aiAnalysis?.recommendations?.courses || [], 'course'),
      ...transformDynamicRecs(aiAnalysis?.recommendations?.youtube || [], 'youtube'),
      ...transformDynamicRecs(aiAnalysis?.recommendations?.certifications || [], 'certification'),
      ...transformDynamicRecs(aiAnalysis?.recommendations?.projects || [], 'project'),
    ].sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));

    // =========================
    // ✅ LEARNING PATH SAFE BUILD
    // =========================
    const learningPath: LearningPath = {
      id: aiAnalysis?.roadmap?.id || `roadmap-${Date.now()}`,
      title: aiAnalysis?.roadmap?.title || 'Personalized Roadmap',
      description: aiAnalysis?.roadmap?.description || '',
      duration: aiAnalysis?.roadmap?.totalDuration || '',
      milestones: Array.isArray(aiAnalysis?.roadmap?.phases)
        ? aiAnalysis.roadmap.phases.map((phase: any) => ({ week: phase.week, title: phase.title }))
        : [],
      expectedOutcome: aiAnalysis?.roadmap?.expectedOutcome || '',
      targetScoreImprovement: aiAnalysis?.roadmap?.targetScoreImprovement || 0,
      dailyRoutine: aiAnalysis?.roadmap?.dailyRoutine
        ? Object.values(aiAnalysis.roadmap.dailyRoutine).filter(Boolean)
        : [],
    };

    // =========================
    // ✅ INSIGHTS GENERATION
    // =========================
    const insights: CareerInsight[] = [];

    if (analysis.criticalWeaknesses?.length) {
      insights.push({
        type: 'risk',
        title: 'Critical Weaknesses',
        description: `Focus on: ${analysis.criticalWeaknesses.join(
          ', '
        )}. These are high-frequency interview topics.`,
        priority: 5,
        actionable: true,
        action: 'Start with AI recommended resources',
      });
    }

    insights.push({
      type: 'opportunity',
      title: 'Interview Readiness',
      description: `Current confidence: ${
        aiAnalysis?.interviewConfidence || 0
      }%. Follow the roadmap to improve.`,
      priority: 2,
      actionable: true,
      action: 'Complete weekly roadmap',
    });

    // =========================
    // ✅ FINAL RETURN
    // =========================
    return {
      recommendations,
      learningPath,
      insights,
      summary:
        aiAnalysis?.personalizedSummary ||
        generateLocalSummary(analysis, targetRole),
      mentorGuidance: aiAnalysis?.mentorGuidance,
      aiAnalysis,
    };
  } catch (error: any) {
    console.error('❌ AI Recommendation FAILED:', error?.message || error);

    // ❗ DO NOT silently fallback
    throw new Error(
      error?.message || 'AI Recommendation failed. Backend issue.'
    );
  }
}