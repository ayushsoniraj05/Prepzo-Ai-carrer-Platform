/**
 * AI Test API Client
 * Handles AI-generated test creation and evaluation
 */

import api from './axios';

// ===== Types =====

export interface StudentProfile {
  userId?: string;
  id?: string;
  name: string;
  degree?: string;
  stream?: string;
  year?: string;
  targetRole?: string;
  knownTechnologies?: string[];
  careerGoals?: string;
}

export interface AITestConfig {
  sections?: string[];
  questionsPerSection?: number;
  totalTime?: number;
  timePerSection?: number;
  company?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  includeCoding?: boolean;
  adaptive?: boolean;
  enableProctoring?: boolean;
  targetRole?: string;
}

export interface AIQuestion {
  id: string;
  question: string;
  type: 'mcq' | 'coding' | 'short_answer';
  options?: string[];
  correct?: number;
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
  estimated_time: number;
  // Coding specific
  examples?: { input: string; output: string; explanation?: string }[];
  constraints?: string[];
  hiddenTestCases?: { input: string; output: string }[];
  starterCode?: Record<string, string>;
  expectedComplexity?: { time: string; space: string };
  // Short answer specific
  expectedAnswer?: string;
  rubric?: Record<string, string[]>;
}

export interface AITestSection {
  id: string;
  name: string;
  description: string;
  questionCount: number;
  timeAllocation: number;
  questions: AIQuestion[];
}

export interface AIGeneratedTest {
  testId: string;
  studentId: string;
  targetRole: string;
  difficulty: string;
  totalQuestions: number;
  totalTime: number;
  createdAt: string;
  expiresAt: string;
  sections: AITestSection[];
  company?: string;
  adaptive: boolean;
}

export interface GenerateTestResponse {
  success: boolean;
  data: {
    sessionId: string;
    testId: string;
    test: AIGeneratedTest;
    message: string;
  };
}

export interface CompanyInfo {
  name: string;
  sections: string[];
  focus: string;
  style: string;
  difficultyDistribution: Record<string, number>;
}

export interface CodeEvaluationResult {
  status: 'Accepted' | 'Wrong Answer' | 'Time Limit Exceeded' | 'Memory Limit Exceeded' | 'Runtime Error' | 'Compilation Error';
  passed_test_cases: number;
  total_test_cases: number;
  score: number;
  execution_time: number;
  memory_used: number;
  test_case_results: {
    test_case_number: number;
    passed: boolean;
    input: string;
    expected_output: string;
    actual_output: string;
    execution_time: number;
    memory_used: number;
    error?: string;
    is_hidden: boolean;
  }[];
  complexity_analysis?: {
    time: string;
    space: string;
    optimal: boolean;
  };
  feedback: string[];
}

export interface AdaptiveQuestionResponse {
  success: boolean;
  data: {
    question: AIQuestion;
    difficulty: string;
    questionNumber: number;
  };
}

export interface PerformanceMetrics {
  totalAttempted: number;
  correctAnswers: number;
  accuracy: number;
  averageTime: number;
  consecutiveCorrect: number;
  consecutiveWrong: number;
  sectionScores: Record<string, number>;
  currentDifficulty?: string;
}

// ===== API Functions =====

/**
 * Generate a unique AI-powered test for the student
 */
export const generateAITest = async (testConfig?: AITestConfig): Promise<GenerateTestResponse> => {
  const response = await api.post('/api/ai-test/generate', { testConfig });
  return response.data;
};

/**
 * Generate a company-specific pattern test
 */
export const generateCompanyTest = async (company: string, testConfig?: AITestConfig): Promise<GenerateTestResponse> => {
  const response = await api.post('/api/ai-test/generate-company', { company, testConfig });
  return response.data;
};

/**
 * Get list of supported companies for pattern tests
 */
export const getSupportedCompanies = async (): Promise<{ success: boolean; data: CompanyInfo[] }> => {
  const response = await api.get('/api/ai-test/companies');
  return response.data;
};

/**
 * Get available sections for a stream
 */
export const getSectionsForStream = async (stream: string): Promise<{ success: boolean; data: { stream: string; sections: { name: string; topics: string[] }[] } }> => {
  const response = await api.get(`/api/ai-test/sections/${encodeURIComponent(stream)}`);
  return response.data;
};

/**
 * Get next adaptive question during test
 */
export const getNextAdaptiveQuestion = async (
  sessionId: string,
  section: string,
  currentPerformance: PerformanceMetrics,
  questionsAnswered: string[]
): Promise<AdaptiveQuestionResponse> => {
  const response = await api.post(`/api/ai-test/${sessionId}/next-question`, {
    section,
    currentPerformance,
    questionsAnswered
  });
  return response.data;
};

/**
 * Adapt difficulty based on performance
 */
export const adaptDifficulty = async (
  currentPerformance: PerformanceMetrics,
  currentDifficulty: string
): Promise<{ success: boolean; data: { previousDifficulty: string; newDifficulty: string } }> => {
  const response = await api.post('/api/ai-test/adapt-difficulty', {
    currentPerformance,
    currentDifficulty
  });
  return response.data;
};

/**
 * Evaluate code using LeetCode-style judge
 */
export const evaluateCode = async (
  code: string,
  language: string,
  testCases: { input: string; output: string }[],
  hiddenTestCases?: { input: string; output: string }[],
  options?: { timeLimit?: number; memoryLimit?: number; expectedComplexity?: { time: string; space: string } }
): Promise<{ success: boolean; data: CodeEvaluationResult }> => {
  const response = await api.post('/api/ai-test/evaluate-code', {
    code,
    language,
    testCases,
    hiddenTestCases,
    options
  });
  return response.data;
};

/**
 * Submit coding question during test
 */
export const submitCodingQuestion = async (
  sessionId: string,
  questionId: string,
  code: string,
  language: string,
  question: AIQuestion
): Promise<{ success: boolean; data: CodeEvaluationResult & { isAccepted: boolean } }> => {
  const response = await api.post(`/api/ai-test/${sessionId}/submit-code`, {
    questionId,
    code,
    language,
    question
  });
  return response.data;
};

/**
 * Validate answer in real-time
 */
export const validateAnswer = async (
  sessionId: string,
  questionId: string,
  questionType: 'mcq' | 'coding' | 'short_answer',
  question: AIQuestion,
  studentAnswer: string | number,
  timeTaken: number
): Promise<{ success: boolean; data: { questionId: string; isCorrect?: boolean; score?: number; correctAnswer?: number; explanation?: string; result?: CodeEvaluationResult; feedback?: string; timeTaken: number } }> => {
  const response = await api.post(`/api/ai-test/${sessionId}/validate`, {
    questionId,
    questionType,
    question,
    studentAnswer,
    timeTaken
  });
  return response.data;
};

/**
 * Complete AI-generated test
 */
export const completeAITest = async (
  sessionId: string,
  sections: {
    sectionId: string;
    answers: { questionId: string; selectedOption: number; isCorrect: boolean; timeTaken: number }[];
  }[],
  codingSubmissions?: { questionId: string; code: string; language: string; score: number }[]
): Promise<{
  success: boolean;
  data: {
    sessionId: string;
    testResultId: string;
    status: string;
    overallScore: number;
    scores: { mcq: number; coding: number; shortAnswer: number };
    totalQuestions: number;
    timeTaken: number;
    violations: number;
    recommendations?: unknown;
  };
}> => {
  const response = await api.post(`/api/ai-test/${sessionId}/complete`, {
    sections,
    codingSubmissions
  });
  return response.data;
};

/**
 * Get AI test results with detailed analysis
 */
export const getAITestResults = async (sessionId: string): Promise<{
  success: boolean;
  data: {
    result: unknown;
    generatedTest: AIGeneratedTest | null;
    violations: unknown[];
  };
}> => {
  const response = await api.get(`/api/ai-test/results/${sessionId}`);
  return response.data;
};

// ===== Admin API Functions =====

/**
 * Get all live test sessions (admin)
 */
export const getLiveTests = async (): Promise<{
  success: boolean;
  data: {
    activeSessions: number;
    tests: {
      sessionId: string;
      testId: string;
      testType: string;
      company: string;
      student: { id: string; name: string; email: string; college: string };
      startTime: string;
      elapsedTime: number;
      remainingTime: number;
      totalDuration: number;
      questionsAnswered: number;
      totalQuestions: number;
      violations: { total: number; warnings: number; critical: number; latest: unknown[] };
      proctoring: { enabled: boolean; status: string; cameraEnabled: boolean; fullscreenEnabled: boolean };
      aiGenerated: boolean;
    }[];
  };
}> => {
  const response = await api.get('/api/admin/proctoring/live');
  return response.data;
};

/**
 * Get live session details (admin)
 */
export const getLiveSessionDetails = async (sessionId: string): Promise<{
  success: boolean;
  data: {
    session: unknown;
    student: unknown;
    progress: unknown;
    violations: unknown;
    proctoring: unknown;
  };
}> => {
  const response = await api.get(`/api/admin/proctoring/live/${sessionId}`);
  return response.data;
};

/**
 * Get all violations (admin)
 */
export const getAllViolations = async (filters?: {
  page?: number;
  limit?: number;
  violationType?: string;
  severity?: string;
  startDate?: string;
  endDate?: string;
  userId?: string;
}): Promise<{
  success: boolean;
  data: {
    violations: unknown[];
    typeBreakdown: { type: string; count: number }[];
    pagination: { page: number; limit: number; total: number; pages: number };
  };
}> => {
  const response = await api.get('/api/admin/proctoring/violations', { params: filters });
  return response.data;
};

/**
 * Terminate a test session (admin)
 */
export const terminateSession = async (sessionId: string, reason: string): Promise<{
  success: boolean;
  message: string;
  data: { sessionId: string; status: string; terminationReason: string };
}> => {
  const response = await api.post(`/api/admin/proctoring/${sessionId}/terminate`, { reason });
  return response.data;
};

/**
 * Allow retest (admin)
 */
export const allowRetest = async (sessionId: string, reason: string, clearViolations?: boolean): Promise<{
  success: boolean;
  message: string;
  data: { sessionId: string; studentId: string; retestApproved: boolean; violationsCleared: boolean };
}> => {
  const response = await api.post(`/api/admin/proctoring/${sessionId}/allow-retest`, { reason, clearViolations });
  return response.data;
};

/**
 * Get proctoring statistics (admin)
 */
export const getProctoringStats = async (filters?: { startDate?: string; endDate?: string }): Promise<{
  success: boolean;
  data: {
    overview: { totalTests: number; completedTests: number; terminatedTests: number; activeTests: number; completionRate: number; terminationRate: number };
    testTypes: { aiGenerated: number; proctored: number; withViolations: number };
    violations: { testsWithViolations: number; terminatedDueToViolations: number; breakdown: { type: string; count: number }[] };
    companies: { company: string; count: number }[];
    scores: { avgScore: number; maxScore: number; minScore: number };
    retests: { allowed: number };
  };
}> => {
  const response = await api.get('/api/admin/proctoring/stats', { params: filters });
  return response.data;
};

/**
 * Get admin test results (admin)
 */
export const getAdminTestResults = async (sessionId: string): Promise<{
  success: boolean;
  data: {
    session: unknown;
    student: unknown;
    results: unknown;
    proctoring: unknown;
    generatedTest: unknown;
    retestInfo: unknown;
  };
}> => {
  const response = await api.get(`/api/admin/proctoring/results/${sessionId}`);
  return response.data;
};

/**
 * Get student test history (admin)
 */
export const getStudentTestHistory = async (userId: string, page?: number, limit?: number): Promise<{
  success: boolean;
  data: {
    student: { id: string; name: string; email: string; college: string; degree: string };
    tests: {
      sessionId: string;
      testType: string;
      company: string;
      status: string;
      aiGenerated: boolean;
      score: number;
      startTime: string;
      endTime: string;
      timeTaken: number;
      violations: number;
      retestAllowed: boolean;
    }[];
    pagination: { page: number; limit: number; total: number; pages: number };
  };
}> => {
  const response = await api.get(`/api/admin/proctoring/student/${userId}/history`, { params: { page, limit } });
  return response.data;
};

export default {
  // Student APIs
  generateAITest,
  generateCompanyTest,
  getSupportedCompanies,
  getSectionsForStream,
  getNextAdaptiveQuestion,
  adaptDifficulty,
  evaluateCode,
  submitCodingQuestion,
  validateAnswer,
  completeAITest,
  getAITestResults,
  // Admin APIs
  getLiveTests,
  getLiveSessionDetails,
  getAllViolations,
  terminateSession,
  allowRetest,
  getProctoringStats,
  getAdminTestResults,
  getStudentTestHistory
};
