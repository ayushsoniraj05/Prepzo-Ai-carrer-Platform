/**
 * Recommendations API
 * Handles fetching AI-generated recommendations from the backend
 */

import api from './axios';

// Types matching backend response
export interface SkillGap {
  skill: string;
  currentLevel: string;
  requiredLevel: string;
  importance: 'critical' | 'high' | 'medium';
  category: string;
}

export interface CourseRecommendation {
  title: string;
  platform: string;
  url: string;
  thumbnail?: string;
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  price: string;
  rating: number;
  skills: string[];
  whyRecommended: string;
  simpleExplanation?: string;
  expectedImprovement: number;
  priority: 'Critical Gap' | 'Strong Enhancement' | 'Competitive Advantage';
  completed: boolean;
  completedAt?: Date;
}

export interface YouTubeRecommendation {
  title: string;
  channel: string;
  url: string;
  thumbnail?: string;
  videoCount: number;
  totalDuration: string;
  views: string;
  skillFocus: string[];
  whyRecommended: string;
  simpleExplanation?: string;
  priority: 'Critical Gap' | 'Strong Enhancement' | 'Competitive Advantage';
}

export interface CertificationRecommendation {
  title: string;
  issuingAuthority: string;
  url: string;
  cost: string;
  isFree: boolean;
  duration: string;
  industryValue: 'high' | 'medium' | 'standard';
  resumeImpact: number;
  skills: string[];
  whyRecommended: string;
  priority: 'Critical Gap' | 'Strong Enhancement' | 'Competitive Advantage';
}

export interface ProjectRecommendation {
  title: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  techStack: string[];
  duration: string;
  category: string;
  description: string;
  thumbnail?: string;
  simpleExplanation?: string;
  realWorldUseCase: string;
  resumeImpact: string;
  keyFeatures: string[];
  learningOutcomes: string[];
  whyRecommended: string;
  priority: 'Critical Gap' | 'Strong Enhancement' | 'Competitive Advantage';
  completed: boolean;
  completedAt?: Date;
  githubUrl?: string;
}

export interface ImprovementPrediction {
  currentScore: number;
  predictedScore: number;
  improvementPercentage: number;
  timeToAchieve: string;
  confidenceLevel: number;
  sectionImprovements: Array<{
    section: string;
    currentScore: number;
    predictedScore: number;
    improvement: number;
  }>;
}

export interface LearningPath {
  phase: number;
  title: string;
  duration: string;
  focus: string[];
  milestones: string[];
  resources: string[];
}

export interface CareerAdvice {
  shortTermGoals: string[];
  longTermGoals: string[];
  interviewReadiness: string;
  marketPosition: string;
  uniqueAdvantages: string[];
  areasToHighlight: string[];
}

export interface StudyNotesRecommendation {
  id: string;
  title: string;
  type: string;
  category: string;
  url: string;
  topics: string[] | Array<{ pattern?: string; name?: string; use_case?: string }>;
  timeToReview: string;
  difficulty_level?: string;
  bestFor?: string;
  description?: string;
  whyRecommended?: string;
}

export interface InterviewPrepRecommendation {
  id: string;
  title: string;
  type: string;
  category: string;
  url: string;
  description?: string;
  topics?: string[] | Array<{ pattern?: string; name?: string }>;
  timeToComplete?: string;
  duration?: string;
  whyRecommended?: string;
}

export interface PracticePlatformRecommendation {
  id: string;
  title: string;
  type: string;
  category: string;
  url: string;
  description?: string;
  features?: string[];
  pricing?: string;
  bestFor?: string;
  whyRecommended?: string;
}

export interface AnalysisInsights {
  overallAssessment: string;
  strengthSummary: string;
  weaknessSummary: string;
  careerReadinessScore: number;
  interviewConfidence: number;
}

export interface AIRecommendation {
  _id: string;
  userId: string;
  sessionId?: string;
  analysisInsights: AnalysisInsights;
  prioritySkillGaps: SkillGap[];
  recommendations: {
    courses: CourseRecommendation[];
    youtube: YouTubeRecommendation[];
    certifications: CertificationRecommendation[];
    projects: ProjectRecommendation[];
    study_notes?: StudyNotesRecommendation[];
    interview_prep?: InterviewPrepRecommendation[];
    practice_platforms?: PracticePlatformRecommendation[];
  };
  improvementPrediction: ImprovementPrediction;
  learningPath: LearningPath[];
  careerAdvice: CareerAdvice;
  explanationSummary: string;
  aiProvider: string;
  aiModel?: string;
  promptVersion: string;
  isLatest: boolean;
  userEngagement: {
    viewedAt?: Date;
    coursesClicked: number;
    projectsStarted: number;
    feedbackRating?: number;
    feedbackComment?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface QuickInsights {
  overallAssessment: string;
  careerReadinessScore: number;
  topStrengths: string[];
  criticalGaps: string[];
  nextStep: string;
  improvementPotential: number;
  source: 'ai' | 'calculated';
}

export interface RecommendationProgress {
  totalCourses: number;
  completedCourses: number;
  totalProjects: number;
  completedProjects: number;
  courseCompletionRate: number;
  projectCompletionRate: number;
  overallProgress: number;
}

// API Functions

/**
 * Generate AI recommendations (typically called after test submission)
 * @param analysis - Complete test analysis with sections, scores, etc.
 * @param targetRole - User's target job role for personalization
 * @param studentProfile - Additional profile data
 */
export const generateRecommendations = async (
  analysis: TestAnalysisResult,
  targetRole: string = 'Software Engineer',
  studentProfile: Partial<{
    name: string;
    dreamCompanies: string[];
    knownTechnologies: string[];
  }> = {}
): Promise<{
  success: boolean;
  recommendation: AIRecommendation;
  message: string;
}> => {
  // Clean payload matching backend expectations (prevents NaN/undefined)
  const assessmentData = {
    totalQuestions: analysis.totalQuestions || 0,
    attemptedQuestions: analysis.attemptedQuestions || 0,
    correctAnswers: analysis.correctAnswers || 0,
    accuracyRate: analysis.accuracyRate || 0,
    overallScore: analysis.overallScore || 0,
    sections: (analysis.sections || []).map(s => ({
      name: s.name || 'Unknown',
      totalQuestions: s.totalQuestions || 0,
      attemptedQuestions: s.attemptedQuestions || 0,
      correctAnswers: s.correctAnswers || 0,
      score: s.totalQuestions > 0 
        ? Math.round((s.correctAnswers / s.totalQuestions) * 100)
        : 0
    }))
  };

  const payload = {
    assessmentData,
    targetRole,
    studentProfile
  };

  const response = await api.post<{
    success: boolean;
    recommendation: AIRecommendation;
    message: string;
  }>('/recommendations/generate', payload);

  return response.data;
};

/**
 * Regenerate recommendations with updated profile/resume
 */
export const regenerateRecommendations = async (sessionId?: string) => {
  const response = await api.post<{
    success: boolean;
    recommendation: AIRecommendation;
    message: string;
  }>('/recommendations/regenerate', { sessionId });
  return response.data;
};

/**
 * Get the latest recommendations for the current user
 */
export const getLatestRecommendations = async () => {
  const response = await api.get<{
    success: boolean;
    recommendation: AIRecommendation;
    hasRecommendations: boolean;
  }>('/recommendations/latest');
  return response.data;
};

/**
 * Get quick insights for dashboard preview
 */
export const getQuickInsights = async () => {
  const response = await api.get<{
    success: boolean;
    insights: QuickInsights;
    hasFullRecommendations: boolean;
  }>('/recommendations/insights');
  return response.data;
};

/**
 * Get recommendation history
 */
export const getRecommendationHistory = async (page = 1, limit = 10) => {
  const response = await api.get<{
    success: boolean;
    recommendations: AIRecommendation[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  }>('/recommendations/history', { params: { page, limit } });
  return response.data;
};

/**
 * Get recommendation by ID
 */
export const getRecommendationById = async (id: string) => {
  const response = await api.get<{
    success: boolean;
    recommendation: AIRecommendation;
  }>(`/recommendations/${id}`);
  return response.data;
};

/**
 * Mark a course as completed
 */
export const markCourseCompleted = async (recommendationId: string, courseIndex: number) => {
  const response = await api.post<{
    success: boolean;
    progress: RecommendationProgress;
    message: string;
  }>(`/recommendations/${recommendationId}/course/${courseIndex}/complete`);
  return response.data;
};

/**
 * Mark a project as completed
 */
export const markProjectCompleted = async (
  recommendationId: string, 
  projectIndex: number, 
  githubUrl?: string
) => {
  const response = await api.post<{
    success: boolean;
    progress: RecommendationProgress;
    message: string;
  }>(`/recommendations/${recommendationId}/project/${projectIndex}/complete`, { githubUrl });
  return response.data;
};

/**
 * Get recommendation progress
 */
export const getRecommendationProgress = async (recommendationId: string) => {
  const response = await api.get<{
    success: boolean;
    progress: RecommendationProgress;
  }>(`/recommendations/${recommendationId}/progress`);
  return response.data;
};

/**
 * Submit feedback for recommendations
 */
export const submitFeedback = async (
  recommendationId: string, 
  rating: number, 
  comment?: string
) => {
  const response = await api.post<{
    success: boolean;
    message: string;
  }>(`/recommendations/${recommendationId}/feedback`, { rating, comment });
  return response.data;
};

import type { TestAnalysisResult } from '@/data/intelligentAIEngine';

// Helper functions for UI

export const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'Critical Gap':
      return 'text-red-400';
    case 'Strong Enhancement':
      return 'text-yellow-400';
    case 'Competitive Advantage':
      return 'text-green-400';
    default:
      return 'text-gray-400';
  }
};

export const getPriorityBgColor = (priority: string): string => {
  switch (priority) {
    case 'Critical Gap':
      return 'bg-red-500/20 border-red-500/30';
    case 'Strong Enhancement':
      return 'bg-yellow-500/20 border-yellow-500/30';
    case 'Competitive Advantage':
      return 'bg-green-500/20 border-green-500/30';
    default:
      return 'bg-gray-500/20 border-gray-500/30';
  }
};

export const getPriorityIcon = (priority: string): string => {
  switch (priority) {
    case 'Critical Gap':
      return '🔴';
    case 'Strong Enhancement':
      return '🟡';
    case 'Competitive Advantage':
      return '🟢';
    default:
      return '⚪';
  }
};

export const getDifficultyColor = (difficulty: string): string => {
  switch (difficulty) {
    case 'beginner':
      return 'text-green-400 bg-green-500/20';
    case 'intermediate':
      return 'text-yellow-400 bg-yellow-500/20';
    case 'advanced':
      return 'text-red-400 bg-red-500/20';
    default:
      return 'text-gray-400 bg-gray-500/20';
  }
};

/**
 * Generate AI-based study notes recommendations
 */
const generateStudyNotes = (
  weakSections: string[],
  _requiredGaps: string[],
  hasTestResults: boolean
): StudyNotesRecommendation[] => {
  const studyNotesDatabase: StudyNotesRecommendation[] = [
    {
      id: 'sn-1',
      title: 'DSA Cheat Sheet - Complete Guide',
      type: 'cheat_sheet',
      category: 'Data Structures & Algorithms',
      url: 'https://github.com/gibsjose/cpp-cheat-sheet/blob/master/Data%20Structures%20and%20Algorithms.md',
      topics: ['Arrays', 'Linked Lists', 'Trees', 'Graphs', 'Sorting', 'Searching'],
      timeToReview: '2 hours',
      difficulty_level: 'intermediate',
      bestFor: 'Quick revision before interviews',
      description: 'Comprehensive DSA cheat sheet with time complexities and code examples',
      whyRecommended: '📚 Perfect for last-minute revision! All key algorithms in one place.'
    },
    {
      id: 'sn-2',
      title: 'Big O Complexity Cheat Sheet',
      type: 'cheat_sheet',
      category: 'Algorithms',
      url: 'https://www.bigocheatsheet.com/',
      topics: ['Time Complexity', 'Space Complexity', 'Big O Notation'],
      timeToReview: '30 mins',
      difficulty_level: 'beginner',
      bestFor: 'Understanding algorithm efficiency',
      description: 'Visual guide to time and space complexity for common algorithms',
      whyRecommended: '⚡ Know exactly how fast your code runs - interviewers always ask this!'
    },
    {
      id: 'sn-3',
      title: 'SQL Quick Reference',
      type: 'cheat_sheet',
      category: 'Database',
      url: 'https://learnsql.com/blog/sql-basics-cheat-sheet/',
      topics: ['SELECT', 'JOINs', 'GROUP BY', 'Subqueries', 'Window Functions'],
      timeToReview: '1 hour',
      difficulty_level: 'beginner',
      bestFor: 'Database interview prep',
      description: 'All SQL commands you need for technical interviews',
      whyRecommended: '🔍 SQL is asked in 90% of tech interviews - master it fast!'
    },
    {
      id: 'sn-4',
      title: 'DBMS Interview Notes',
      type: 'study_notes',
      category: 'Database Management',
      url: 'https://www.geeksforgeeks.org/dbms/',
      topics: ['Normalization', 'ACID Properties', 'Indexing', 'Transactions', 'SQL vs NoSQL'],
      timeToReview: '3 hours',
      difficulty_level: 'intermediate',
      bestFor: 'Campus placements',
      description: 'Complete DBMS concepts for technical interviews',
      whyRecommended: '📊 DBMS is a favorite topic in TCS, Infosys, Wipro interviews!'
    },
    {
      id: 'sn-5',
      title: 'OOP Concepts Made Simple',
      type: 'study_notes',
      category: 'Object-Oriented Programming',
      url: 'https://www.javatpoint.com/java-oops-concepts',
      topics: ['Classes', 'Objects', 'Inheritance', 'Polymorphism', 'Encapsulation', 'Abstraction'],
      timeToReview: '2 hours',
      difficulty_level: 'beginner',
      bestFor: 'Programming fundamentals',
      description: 'OOP principles explained with real-world examples',
      whyRecommended: '🎯 Every interviewer asks OOP! Be ready with clear examples.'
    },
    {
      id: 'sn-6',
      title: 'Operating System Notes',
      type: 'study_notes',
      category: 'Operating Systems',
      url: 'https://www.geeksforgeeks.org/operating-systems/',
      topics: ['Process Management', 'Memory Management', 'Deadlocks', 'Scheduling', 'File Systems'],
      timeToReview: '4 hours',
      difficulty_level: 'intermediate',
      bestFor: 'Core CS interviews',
      description: 'OS concepts for campus placements and tech interviews',
      whyRecommended: '💻 OS questions are common in product company interviews!'
    },
    {
      id: 'sn-7',
      title: 'Computer Networks Quick Notes',
      type: 'study_notes',
      category: 'Computer Networks',
      url: 'https://www.geeksforgeeks.org/computer-network-tutorials/',
      topics: ['OSI Model', 'TCP/IP', 'HTTP/HTTPS', 'DNS', 'Routing', 'Subnetting'],
      timeToReview: '3 hours',
      difficulty_level: 'intermediate',
      bestFor: 'Network engineering roles',
      description: 'Networking fundamentals for technical interviews',
      whyRecommended: '🌐 Know how the internet works - essential for backend roles!'
    },
    {
      id: 'sn-8',
      title: 'System Design Study Guide',
      type: 'study_notes',
      category: 'System Design',
      url: 'https://github.com/donnemartin/system-design-primer',
      topics: ['Scalability', 'Load Balancing', 'Caching', 'Database Sharding', 'Microservices'],
      timeToReview: '6 hours',
      difficulty_level: 'advanced',
      bestFor: 'Senior developer interviews',
      description: 'Comprehensive system design concepts for tech interviews',
      whyRecommended: '🏗️ System design rounds filter candidates - be prepared!'
    },
    {
      id: 'sn-9',
      title: 'Java Interview Cheat Sheet',
      type: 'cheat_sheet',
      category: 'Programming Languages',
      url: 'https://www.javatpoint.com/java-interview-questions',
      topics: ['Core Java', 'Collections', 'Multithreading', 'JVM', 'Exception Handling'],
      timeToReview: '2 hours',
      difficulty_level: 'intermediate',
      bestFor: 'Java developer roles',
      description: 'Top 100 Java interview questions with answers',
      whyRecommended: '☕ Java is #1 enterprise language - nail these questions!'
    },
    {
      id: 'sn-10',
      title: 'Python Quick Reference',
      type: 'cheat_sheet',
      category: 'Programming Languages',
      url: 'https://www.pythoncheatsheet.org/',
      topics: ['Data Types', 'List Comprehensions', 'Functions', 'OOP in Python', 'Libraries'],
      timeToReview: '1.5 hours',
      difficulty_level: 'beginner',
      bestFor: 'Data science & backend roles',
      description: 'Python syntax and best practices cheat sheet',
      whyRecommended: '🐍 Python is the fastest growing language - start here!'
    },
    {
      id: 'sn-11',
      title: 'JavaScript ES6+ Cheat Sheet',
      type: 'cheat_sheet',
      category: 'Web Development',
      url: 'https://devhints.io/es6',
      topics: ['Arrow Functions', 'Promises', 'Async/Await', 'Destructuring', 'Modules'],
      timeToReview: '1 hour',
      difficulty_level: 'intermediate',
      bestFor: 'Frontend & fullstack roles',
      description: 'Modern JavaScript features every developer should know',
      whyRecommended: '⚡ Modern JS is a must for web development interviews!'
    },
    {
      id: 'sn-12',
      title: 'React.js Fundamentals Notes',
      type: 'study_notes',
      category: 'Web Development',
      url: 'https://react.dev/learn',
      topics: ['Components', 'Hooks', 'State Management', 'Props', 'Lifecycle'],
      timeToReview: '3 hours',
      difficulty_level: 'intermediate',
      bestFor: 'Frontend developer roles',
      description: 'Official React documentation and learning path',
      whyRecommended: '⚛️ React is used by Netflix, Instagram, Airbnb - learn it!'
    },
    {
      id: 'sn-13',
      title: 'Git & GitHub Cheat Sheet',
      type: 'cheat_sheet',
      category: 'Version Control',
      url: 'https://education.github.com/git-cheat-sheet-education.pdf',
      topics: ['Commands', 'Branching', 'Merging', 'Pull Requests', 'Git Flow'],
      timeToReview: '45 mins',
      difficulty_level: 'beginner',
      bestFor: 'All developer roles',
      description: 'Essential Git commands for daily development',
      whyRecommended: '📦 Every company uses Git - you MUST know this!'
    },
    {
      id: 'sn-14',
      title: 'Aptitude Formulas & Shortcuts',
      type: 'cheat_sheet',
      category: 'Aptitude',
      url: 'https://www.indiabix.com/aptitude/questions-and-answers/',
      topics: ['Percentages', 'Ratios', 'Time & Work', 'Profit & Loss', 'Probability'],
      timeToReview: '2 hours',
      difficulty_level: 'beginner',
      bestFor: 'Campus placement aptitude rounds',
      description: 'All aptitude formulas with shortcut methods',
      whyRecommended: '🧮 Clear aptitude round first - these shortcuts save time!'
    },
    {
      id: 'sn-15',
      title: 'HR Interview Questions Guide',
      type: 'study_notes',
      category: 'Interview Preparation',
      url: 'https://www.indiabix.com/hr-interview/questions-and-answers/',
      topics: ['Tell me about yourself', 'Strengths/Weaknesses', 'Why this company', 'Career goals'],
      timeToReview: '1.5 hours',
      difficulty_level: 'beginner',
      bestFor: 'Final HR round preparation',
      description: 'Common HR questions with impressive answer frameworks',
      whyRecommended: '🎯 HR round decides your offer - prepare these answers!'
    },
    {
      id: 'sn-16',
      title: 'Resume Building Guide',
      type: 'study_notes',
      category: 'Career Development',
      url: 'https://www.resumemaker.online/free-resume-guide',
      topics: ['ATS Optimization', 'Action Verbs', 'Quantifying Achievements', 'Format Tips'],
      timeToReview: '1 hour',
      difficulty_level: 'beginner',
      bestFor: 'Job applications',
      description: 'Create an ATS-friendly resume that gets interviews',
      whyRecommended: '📄 Your resume is your first impression - make it count!'
    }
  ];

  // Return notes based on weak sections or all notes if no test results
  const relevantNotes = hasTestResults && weakSections.length > 0
    ? studyNotesDatabase.filter(note => 
        weakSections.some(section => 
          note.category.toLowerCase().includes(section.toLowerCase()) ||
          note.topics.some(topic => 
            typeof topic === 'string' && topic.toLowerCase().includes(section.toLowerCase())
          )
        )
      )
    : studyNotesDatabase;

  // If not enough relevant notes, add some general ones
  const finalNotes = relevantNotes.length >= 5 
    ? relevantNotes 
    : [...relevantNotes, ...studyNotesDatabase.filter(n => !relevantNotes.includes(n))].slice(0, 12);

  return finalNotes.map(note => ({
    ...note,
    whyRecommended: hasTestResults 
      ? `📚 Recommended based on your assessment - focus area: ${weakSections[0] || 'Core concepts'}`
      : note.whyRecommended
  }));
};

/**
 * Generate AI-based interview preparation recommendations
 */
const generateInterviewPrep = (
  targetRole: string,
  weakSections: string[],
  hasTestResults: boolean
): InterviewPrepRecommendation[] => {
  const interviewPrepDatabase: InterviewPrepRecommendation[] = [
    {
      id: 'ip-1',
      title: '14 Coding Patterns to Master',
      type: 'pattern_guide',
      category: 'Coding Interviews',
      url: 'https://hackernoon.com/14-patterns-to-ace-any-coding-interview-question-c5bb3357f6ed',
      description: 'Master these 14 patterns and solve 80% of coding interview questions',
      topics: ['Two Pointers', 'Sliding Window', 'Fast & Slow Pointers', 'Merge Intervals', 'Cyclic Sort', 'BFS/DFS'],
      timeToComplete: '4 hours',
      whyRecommended: '🎯 These patterns appear in Google, Amazon, Microsoft interviews!'
    },
    {
      id: 'ip-2',
      title: 'Blind 75 LeetCode Questions',
      type: 'problem_list',
      category: 'Coding Interviews',
      url: 'https://leetcode.com/discuss/general-discussion/460599/blind-75-leetcode-questions',
      description: 'The essential 75 LeetCode problems every software engineer should solve',
      topics: ['Arrays', 'Binary', 'Dynamic Programming', 'Graphs', 'Trees', 'Heaps'],
      timeToComplete: '3-4 weeks',
      whyRecommended: '🔥 Created by an ex-Facebook engineer - the gold standard for prep!'
    },
    {
      id: 'ip-3',
      title: 'NeetCode 150 Roadmap',
      type: 'structured_path',
      category: 'Coding Interviews',
      url: 'https://neetcode.io/roadmap',
      description: 'Categorized problem set with video explanations for each pattern',
      topics: ['Arrays & Hashing', 'Two Pointers', 'Stack', 'Binary Search', 'Trees', 'Backtracking'],
      timeToComplete: '6-8 weeks',
      whyRecommended: '📈 Best structured approach - video + code for every problem!'
    },
    {
      id: 'ip-4',
      title: 'Striver\'s SDE Sheet',
      type: 'problem_list',
      category: 'Coding Interviews',
      url: 'https://takeuforward.org/interviews/strivers-sde-sheet-top-coding-interview-problems/',
      description: 'Curated 180 problems for Indian product company interviews',
      topics: ['Recursion', 'Backtracking', 'Binary Search', 'Linked List', 'Greedy', 'DP'],
      timeToComplete: '6-8 weeks',
      whyRecommended: '🇮🇳 Designed for Indian tech companies - Google, Amazon, Flipkart, Microsoft!'
    },
    {
      id: 'ip-5',
      title: 'Google Interview Preparation Guide',
      type: 'company_specific',
      category: 'Company Preparation',
      url: 'https://www.techinterviewhandbook.org/software-engineering-interview-guide/',
      description: 'Complete guide for Google software engineering interviews',
      topics: ['Coding', 'System Design', 'Behavioral', 'Google Culture'],
      timeToComplete: '4-6 weeks',
      whyRecommended: '🔴🟡🟢🔵 Dream of working at Google? Start here!'
    },
    {
      id: 'ip-6',
      title: 'Amazon Leadership Principles Guide',
      type: 'company_specific',
      category: 'Company Preparation',
      url: 'https://www.youtube.com/watch?v=CpcxVE5JIX4',
      description: 'Master Amazon\'s 16 Leadership Principles for behavioral interviews',
      topics: ['Customer Obsession', 'Ownership', 'Dive Deep', 'Deliver Results'],
      timeToComplete: '3 hours',
      whyRecommended: '📦 Amazon asks behavioral questions in EVERY round!'
    },
    {
      id: 'ip-7',
      title: 'Microsoft Interview Playbook',
      type: 'company_specific',
      category: 'Company Preparation',
      url: 'https://leetcode.com/discuss/interview-question/398023/Microsoft-Online-Assessment-Questions',
      description: 'Common Microsoft interview questions and preparation strategy',
      topics: ['Coding', 'Design', 'Problem Solving', 'Collaboration'],
      timeToComplete: '4 weeks',
      whyRecommended: '🪟 Microsoft values problem-solving AND soft skills!'
    },
    {
      id: 'ip-8',
      title: 'System Design Interview Roadmap',
      type: 'structured_path',
      category: 'System Design',
      url: 'https://www.youtube.com/c/SystemDesignInterview',
      description: 'Learn to design scalable systems step by step',
      topics: ['Load Balancing', 'Caching', 'Database Design', 'Microservices', 'Message Queues'],
      timeToComplete: '6-8 weeks',
      whyRecommended: '🏗️ System design rounds start at 2+ years experience!'
    },
    {
      id: 'ip-9',
      title: 'STAR Method for Behavioral Interviews',
      type: 'technique',
      category: 'Behavioral Interviews',
      url: 'https://www.themuse.com/advice/star-interview-method',
      description: 'Structure your answers for maximum impact using STAR format',
      topics: ['Situation', 'Task', 'Action', 'Result'],
      timeToComplete: '1 hour',
      whyRecommended: '⭐ STAR method = confident, structured answers!'
    },
    {
      id: 'ip-10',
      title: 'Mock Interview Practice - Pramp',
      type: 'mock_interview',
      category: 'Practice',
      url: 'https://www.pramp.com/',
      description: 'Free peer-to-peer mock interviews with real engineers',
      topics: ['Coding', 'Behavioral', 'System Design', 'Data Science'],
      timeToComplete: '1 hour per session',
      whyRecommended: '🎤 Practice with REAL people - reduce interview anxiety!'
    }
  ];

  // Prioritize based on role
  const roleSpecific = interviewPrepDatabase.filter(prep => {
    if (targetRole.toLowerCase().includes('frontend')) {
      return prep.category === 'Coding Interviews' || prep.topics?.includes('JavaScript');
    }
    if (targetRole.toLowerCase().includes('backend') || targetRole.toLowerCase().includes('system')) {
      return prep.category === 'System Design' || prep.category === 'Coding Interviews';
    }
    return true;
  });

  return hasTestResults
    ? roleSpecific.map(prep => ({
        ...prep,
        whyRecommended: `🎯 Based on your ${weakSections[0] || 'assessment'} performance - this will help you improve!`
      }))
    : roleSpecific;
};

/**
 * Generate AI-based practice platform recommendations
 */
const generatePracticePlatforms = (
  targetRole: string,
  weakSections: string[],
  hasTestResults: boolean
): PracticePlatformRecommendation[] => {
  const practiceDatabase: PracticePlatformRecommendation[] = [
    {
      id: 'pp-1',
      title: 'LeetCode',
      type: 'coding_practice',
      category: 'Coding Practice',
      url: 'https://leetcode.com/',
      description: 'The #1 platform for coding interview preparation with 2000+ problems',
      features: ['Company-tagged problems', 'Contest mode', 'Premium company questions', 'Discussion forums'],
      pricing: 'Free (Premium: $35/month)',
      bestFor: 'FAANG & product company interviews',
      whyRecommended: '💪 Used by millions - the gold standard for coding practice!'
    },
    {
      id: 'pp-2',
      title: 'HackerRank',
      type: 'coding_practice',
      category: 'Coding Practice',
      url: 'https://www.hackerrank.com/',
      description: 'Practice coding, prepare for interviews, and get hired',
      features: ['Skill certification', 'Interview prep kit', 'Company challenges', 'Multi-language support'],
      pricing: 'Free',
      bestFor: 'Service company assessments',
      whyRecommended: '🏆 TCS, Infosys, Wipro use HackerRank for hiring tests!'
    },
    {
      id: 'pp-3',
      title: 'Codeforces',
      type: 'competitive_programming',
      category: 'Competitive Programming',
      url: 'https://codeforces.com/',
      description: 'Competitive programming platform with weekly contests',
      features: ['Live contests', 'Problem archive', 'Rating system', 'Editorial solutions'],
      pricing: 'Free',
      bestFor: 'Competitive programming enthusiasts',
      whyRecommended: '🚀 Build problem-solving speed - great for timed tests!'
    },
    {
      id: 'pp-4',
      title: 'GeeksforGeeks Practice',
      type: 'coding_practice',
      category: 'Coding Practice',
      url: 'https://practice.geeksforgeeks.org/',
      description: 'India\'s largest programming community with curated problems',
      features: ['Company-wise problems', 'Topic-wise practice', 'IDE support', 'Free courses'],
      pricing: 'Free',
      bestFor: 'Indian campus placements',
      whyRecommended: '🇮🇳 Every Indian engineer uses GFG - covers all placement topics!'
    },
    {
      id: 'pp-5',
      title: 'InterviewBit',
      type: 'interview_prep',
      category: 'Interview Preparation',
      url: 'https://www.interviewbit.com/',
      description: 'Structured interview preparation with gamification',
      features: ['Streaks & rewards', 'Mock interviews', 'Company tracks', 'Resume builder'],
      pricing: 'Free',
      bestFor: 'Structured learning path',
      whyRecommended: '🎮 Gamified learning keeps you motivated - level up daily!'
    },
    {
      id: 'pp-6',
      title: 'CodeChef',
      type: 'competitive_programming',
      category: 'Competitive Programming',
      url: 'https://www.codechef.com/',
      description: 'Monthly contests with prizes and learning resources',
      features: ['Long challenges', 'Cook-offs', 'Certificate courses', 'Problem setting'],
      pricing: 'Free',
      bestFor: 'Building competitive programming profile',
      whyRecommended: '🏅 Good rating = better job opportunities!'
    },
    {
      id: 'pp-7',
      title: 'SQLZoo',
      type: 'topic_specific',
      category: 'Database Practice',
      url: 'https://sqlzoo.net/',
      description: 'Interactive SQL tutorial with hands-on exercises',
      features: ['Progressive difficulty', 'Real database', 'Instant feedback', 'Quiz mode'],
      pricing: 'Free',
      bestFor: 'SQL beginners and interview prep',
      whyRecommended: '🔍 Master SQL interactively - way better than just reading!'
    },
    {
      id: 'pp-8',
      title: 'StrataScratch',
      type: 'topic_specific',
      category: 'Data Science Practice',
      url: 'https://www.stratascratch.com/',
      description: 'Real interview questions from tech companies for data roles',
      features: ['Python & SQL problems', 'Company-specific questions', 'Solution videos'],
      pricing: 'Free tier available',
      bestFor: 'Data analyst & data science roles',
      whyRecommended: '📊 Actual questions asked at Netflix, Google, Amazon!'
    },
    {
      id: 'pp-9',
      title: 'IndiaBix Aptitude',
      type: 'aptitude_practice',
      category: 'Aptitude Practice',
      url: 'https://www.indiabix.com/',
      description: 'Comprehensive aptitude and reasoning practice',
      features: ['Quantitative aptitude', 'Logical reasoning', 'Verbal ability', 'GD topics'],
      pricing: 'Free',
      bestFor: 'Campus placement aptitude rounds',
      whyRecommended: '🧮 Most companies have aptitude as Round 1 - clear it first!'
    },
    {
      id: 'pp-10',
      title: 'PrepInsta',
      type: 'aptitude_practice',
      category: 'Placement Preparation',
      url: 'https://prepinsta.com/',
      description: 'Complete placement preparation with company-specific tests',
      features: ['Company papers', 'Video solutions', 'Mock tests', 'Interview experiences'],
      pricing: 'Free + Premium',
      bestFor: 'TCS, Infosys, Wipro, other service companies',
      whyRecommended: '🎯 Company-specific prep = higher success rate!'
    },
    {
      id: 'pp-11',
      title: 'Coding Ninjas',
      type: 'coding_practice',
      category: 'Learning Platform',
      url: 'https://www.codingninjas.com/codestudio',
      description: 'Structured DSA learning with guided paths',
      features: ['Video tutorials', 'Coding problems', 'Interview experiences', 'Doubt resolution'],
      pricing: 'Free practice section',
      bestFor: 'Beginners starting DSA journey',
      whyRecommended: '🥷 Great for beginners - learn concepts before jumping to LeetCode!'
    },
    {
      id: 'pp-12',
      title: 'AMCAT Mock Test',
      type: 'mock_test',
      category: 'Placement Tests',
      url: 'https://www.myamcat.com/',
      description: 'Industry-recognized employability test with job opportunities',
      features: ['Skill assessment', 'Job recommendations', 'Industry benchmark', 'Detailed report'],
      pricing: '₹1100 for full test',
      bestFor: 'Off-campus placements',
      whyRecommended: '📝 Good AMCAT score = direct job interviews from 4000+ companies!'
    },
    {
      id: 'pp-13',
      title: 'eLitmus pH Test',
      type: 'mock_test',
      category: 'Placement Tests',
      url: 'https://www.elitmus.com/',
      description: 'Aptitude test with job guarantee based on percentile',
      features: ['Problem solving', 'Quantitative aptitude', 'Verbal ability', 'Job interviews'],
      pricing: '₹600 per test',
      bestFor: 'Freshers looking for job opportunities',
      whyRecommended: '🎯 High percentile = interview calls from 100s of companies!'
    },
    {
      id: 'pp-14',
      title: 'TCS NQT Mock Test',
      type: 'mock_test',
      category: 'Company-Specific Tests',
      url: 'https://learning.tcsionhub.in/',
      description: 'Practice for TCS National Qualifier Test',
      features: ['Aptitude practice', 'Coding section', 'Previous year papers', 'Time management'],
      pricing: 'Free',
      bestFor: 'TCS recruitment preparation',
      whyRecommended: '🏢 TCS hires 40,000+ freshers yearly - prepare specifically!'
    },
    {
      id: 'pp-15',
      title: 'Infosys Certification Mock',
      type: 'mock_test',
      category: 'Company-Specific Tests',
      url: 'https://infyspringboard.onwingspan.com/',
      description: 'Free certification courses from Infosys for students',
      features: ['Python certification', 'Data Analytics', 'Cloud computing', 'Direct hiring'],
      pricing: 'Free',
      bestFor: 'Infosys recruitment',
      whyRecommended: '✨ Complete certification = fast-track Infosys hiring!'
    }
  ];

  // Filter based on role
  let relevantPlatforms = practiceDatabase;
  
  if (targetRole.toLowerCase().includes('data')) {
    relevantPlatforms = practiceDatabase.filter(p => 
      p.category.includes('Data') || p.category === 'Coding Practice'
    );
  }

  // Add recommendations based on weak sections
  return hasTestResults && weakSections.length > 0
    ? relevantPlatforms.map(platform => ({
        ...platform,
        whyRecommended: `💻 Perfect for improving your ${weakSections[0] || 'weak areas'} - practice daily!`
      }))
    : relevantPlatforms;
};

/**
 * Generate local AI recommendations based on user profile and test results
 * This is used when no backend recommendations exist (new users)
 * Provides truly personalized recommendations based on actual test performance
 */
export const generateLocalRecommendations = (userProfile: {
  targetRole: string;
  knownTechnologies: string[];
  degree?: string;
  fieldOfStudy?: string;
  testResults?: {
    sectionResults: Array<{
      name: string;
      total: number;
      correct: number;
      attempted?: number;
      score: number;
    }>;
    totalQuestions: number;
    correctAnswers: number;
    score: number;
  };
}): AIRecommendation => {
  const { targetRole, knownTechnologies, testResults } = userProfile;
  
  // Role-based skill requirements
  const roleSkillsMap: Record<string, { required: string[]; nice: string[] }> = {
    'Software Engineer': {
      required: ['Data Structures & Algorithms', 'Object Oriented Programming', 'System Design', 'Problem Solving'],
      nice: ['Cloud Computing', 'DevOps', 'Database Management']
    },
    'Backend Developer': {
      required: ['System Design', 'Database Management', 'API Development', 'Data Structures & Algorithms'],
      nice: ['Cloud Computing', 'Security', 'Message Queues']
    },
    'Frontend Developer': {
      required: ['JavaScript/TypeScript', 'React/Vue/Angular', 'HTML & CSS', 'Responsive Design'],
      nice: ['Testing', 'Performance Optimization', 'State Management']
    },
    'Full Stack Developer': {
      required: ['Frontend Development', 'Backend Development', 'Database Management', 'API Design'],
      nice: ['DevOps', 'Cloud Computing', 'System Design']
    },
    'Data Scientist': {
      required: ['Python', 'Machine Learning', 'Statistics', 'Data Analysis'],
      nice: ['Deep Learning', 'Big Data', 'Data Visualization']
    },
    'Data Analyst': {
      required: ['SQL', 'Excel', 'Data Visualization', 'Statistics'],
      nice: ['Python', 'Business Intelligence', 'Storytelling']
    },
    'DevOps Engineer': {
      required: ['Linux', 'CI/CD', 'Docker/Kubernetes', 'Cloud Platforms'],
      nice: ['Scripting', 'Monitoring', 'Infrastructure as Code']
    },
    'ML Engineer': {
      required: ['Machine Learning', 'Python', 'Deep Learning', 'MLOps'],
      nice: ['Distributed Systems', 'Data Engineering', 'Mathematics']
    },
  };

  const roleConfig = roleSkillsMap[targetRole] || roleSkillsMap['Software Engineer'];
  const knownLower = knownTechnologies.map(t => t.toLowerCase());
  
  // If test results exist, use them for personalized recommendations
  let weakSections: string[] = [];
  let moderateSections: string[] = [];
  let strongSections: string[] = [];
  let overallTestScore = 0;
  let hasTestResults = false;
  
  if (testResults && testResults.sectionResults && testResults.sectionResults.length > 0) {
    hasTestResults = true;
    overallTestScore = testResults.score;
    
    // Categorize sections by performance
    testResults.sectionResults.forEach(section => {
      if (section.score < 40) {
        weakSections.push(section.name);
      } else if (section.score < 70) {
        moderateSections.push(section.name);
      } else {
        strongSections.push(section.name);
      }
    });
    
    // Sort weak sections by score (lowest first)
    testResults.sectionResults
      .filter(s => s.score < 60)
      .sort((a, b) => a.score - b.score);
  }
  
  // Identify skill gaps - use test results if available, otherwise use role-based gaps
  let requiredGaps: string[];
  let niceGaps: string[];
  
  if (hasTestResults && weakSections.length > 0) {
    // Use weak sections from test as primary gaps
    requiredGaps = weakSections.slice(0, 3);
    niceGaps = moderateSections.slice(0, 2);
  } else {
    // Fall back to role-based gaps
    requiredGaps = roleConfig.required.filter(skill => 
      !knownLower.some(known => skill.toLowerCase().includes(known) || known.includes(skill.toLowerCase()))
    );
    niceGaps = roleConfig.nice.filter(skill => 
      !knownLower.some(known => skill.toLowerCase().includes(known) || known.includes(skill.toLowerCase()))
    );
  }

  // Generate skill gaps based on test performance or role requirements
  const prioritySkillGaps: SkillGap[] = [];
  
  if (hasTestResults && testResults?.sectionResults) {
    // Use actual test performance for skill gaps
    testResults.sectionResults
      .filter(s => s.score < 70)
      .sort((a, b) => a.score - b.score)
      .slice(0, 5)
      .forEach((section) => {
        prioritySkillGaps.push({
          skill: section.name,
          currentLevel: `${section.score}%`,
          requiredLevel: '70%+',
          importance: (section.score < 40 ? 'critical' : section.score < 60 ? 'high' : 'medium') as 'critical' | 'high' | 'medium',
          category: section.score < 40 ? 'Critical - Needs Immediate Attention' : 'Improvement Needed'
        });
      });
  } else {
    // Use role-based gaps
    prioritySkillGaps.push(
      ...requiredGaps.slice(0, 3).map((skill, i) => ({
        skill,
        currentLevel: 'Needs Development',
        requiredLevel: 'Proficient',
        importance: (i === 0 ? 'critical' : 'high') as 'critical' | 'high' | 'medium',
        category: 'Required for Role'
      })),
      ...niceGaps.slice(0, 2).map(skill => ({
        skill,
        currentLevel: 'Not Started',
        requiredLevel: 'Intermediate',
        importance: 'medium' as const,
        category: 'Nice to Have'
      }))
    );
  }

  // Course database for various skills with thumbnails and easy explanations
  const courseDatabase: Record<string, Array<{ 
    title: string; 
    platform: string; 
    url: string; 
    thumbnail: string;
    duration: string; 
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    simpleExplanation: string;
  }>> = {
    'Data Structures & Algorithms': [
      { title: 'DSA Made Easy with Animations', platform: 'Udemy', url: 'https://udemy.com/dsa-python', thumbnail: 'https://img.youtube.com/vi/8hly31xKli0/maxresdefault.jpg', duration: '50 hours', difficulty: 'intermediate', simpleExplanation: 'Learn how to organize data smartly and solve coding problems step by step. Think of it like learning how to arrange your room so you can find things quickly!' },
      { title: 'Algorithms for Beginners', platform: 'Coursera', url: 'https://coursera.org/algorithms', thumbnail: 'https://d3njjcbhbojbot.cloudfront.net/api/utilities/v1/imageproxy/https://coursera-course-photos.s3.amazonaws.com/83/e258e0532611e5a5072321239ff4d4/jhep-coursera-course4.png', duration: '4 months', difficulty: 'advanced', simpleExplanation: 'Master the art of solving problems efficiently. Like finding the fastest route on Google Maps - algorithms help computers make smart decisions!' },
      { title: 'Data Structures Visual Guide', platform: 'YouTube', url: 'https://youtube.com/freecodecamp', thumbnail: 'https://img.youtube.com/vi/RBSGKlAvoiM/maxresdefault.jpg', duration: '8 hours', difficulty: 'beginner', simpleExplanation: 'See how data structures work with cool animations. Perfect for visual learners who want to understand arrays, lists, and trees!' },
    ],
    'DBMS': [
      { title: 'Database Fundamentals Bootcamp', platform: 'Udemy', url: 'https://udemy.com/sql-bootcamp', thumbnail: 'https://img.youtube.com/vi/HXV3zeQKqGY/maxresdefault.jpg', duration: '25 hours', difficulty: 'beginner', simpleExplanation: 'Learn how apps like Instagram store millions of photos and Facebook stores billions of posts. Databases are like super-organized digital filing cabinets!' },
      { title: 'Database Design Masterclass', platform: 'Coursera', url: 'https://coursera.org/database', thumbnail: 'https://d3njjcbhbojbot.cloudfront.net/api/utilities/v1/imageproxy/https://coursera-course-photos.s3.amazonaws.com/fa/6926005ea411e490ff8d4c5e4cc78b/database.jpg', duration: '6 weeks', difficulty: 'intermediate', simpleExplanation: 'Design databases like a pro. Learn to structure data so apps run fast and never lose information!' },
    ],
    'SQL': [
      { title: 'SQL from Zero to Hero', platform: 'Coursera', url: 'https://coursera.org/sql', thumbnail: 'https://img.youtube.com/vi/7S_tz1z_5bA/maxresdefault.jpg', duration: '4 weeks', difficulty: 'beginner', simpleExplanation: 'SQL is like asking questions to a database. \"Show me all users from Delhi\" - simple commands that make you data-powerful!' },
      { title: 'Advanced SQL Analytics', platform: 'DataCamp', url: 'https://datacamp.com/sql', thumbnail: 'https://images.datacamp.com/image/upload/f_auto,q_auto:best/v1603718691/Marketing/Blog/SQL_Tutorial.png', duration: '15 hours', difficulty: 'advanced', simpleExplanation: 'Level up your SQL skills to analyze big data. Companies pay top salaries for people who can find insights in millions of rows!' },
    ],
    'Computer Networks': [
      { title: 'How the Internet Works', platform: 'Coursera', url: 'https://coursera.org/networking', thumbnail: 'https://img.youtube.com/vi/9SIf2pQpECw/maxresdefault.jpg', duration: '4 weeks', difficulty: 'intermediate', simpleExplanation: 'Ever wondered how your WhatsApp message reaches your friend instantly? Learn the magic behind the internet!' },
      { title: 'Network Basics Made Simple', platform: 'CompTIA', url: 'https://comptia.org', thumbnail: 'https://img.youtube.com/vi/3QhU9jd03a0/maxresdefault.jpg', duration: '3 months', difficulty: 'intermediate', simpleExplanation: 'Understand WiFi, routers, and how companies protect their networks. Essential knowledge for any tech career!' },
    ],
    'Operating Systems': [
      { title: 'OS Concepts Simplified', platform: 'OSTEP', url: 'https://ostep.org', thumbnail: 'https://img.youtube.com/vi/26QPDBe-NB8/maxresdefault.jpg', duration: '40 hours', difficulty: 'advanced', simpleExplanation: 'Learn how Windows/Mac/Linux manage your computer. Why does your laptop slow down with many apps? This course explains everything!' },
      { title: 'Linux for Beginners', platform: 'edX', url: 'https://edx.org/linux', thumbnail: 'https://img.youtube.com/vi/ROjZy1WbCIA/maxresdefault.jpg', duration: '8 weeks', difficulty: 'intermediate', simpleExplanation: 'Linux powers most of the internet! Learning it opens doors to cloud computing, DevOps, and high-paying tech jobs.' },
    ],
    'Object-Oriented Programming': [
      { title: 'OOP Made Fun with Java', platform: 'Udemy', url: 'https://udemy.com/java-oop', thumbnail: 'https://img.youtube.com/vi/pTB0EiLXUC8/maxresdefault.jpg', duration: '30 hours', difficulty: 'beginner', simpleExplanation: 'Think of OOP like building with LEGO blocks. Each block (object) has its own job, and together they create amazing things!' },
      { title: 'Design Patterns Visual Guide', platform: 'Pluralsight', url: 'https://pluralsight.com/patterns', thumbnail: 'https://img.youtube.com/vi/v9ejT8FO-7I/maxresdefault.jpg', duration: '10 hours', difficulty: 'advanced', simpleExplanation: 'Learn the secret recipes top developers use. These patterns make your code clean, reusable, and impressive in interviews!' },
    ],
    'Aptitude': [
      { title: 'Crack Any Aptitude Test', platform: 'Unacademy', url: 'https://unacademy.com/aptitude', thumbnail: 'https://img.youtube.com/vi/JeJLXTpGwP8/maxresdefault.jpg', duration: '40 hours', difficulty: 'beginner', simpleExplanation: 'Most companies test aptitude before coding! Learn shortcuts and tricks to solve math puzzles faster than a calculator.' },
      { title: 'Logical Reasoning Tricks', platform: 'PrepInsta', url: 'https://prepinsta.com/logical', thumbnail: 'https://img.youtube.com/vi/nZOV74s9JYg/maxresdefault.jpg', duration: '20 hours', difficulty: 'intermediate', simpleExplanation: 'Pattern recognition, puzzles, and brain teasers - master the logical reasoning that companies love to test!' },
    ],
    'Coding': [
      { title: 'LeetCode Patterns Decoded', platform: 'NeetCode', url: 'https://neetcode.io', thumbnail: 'https://img.youtube.com/vi/SVvr3ZjtjI8/maxresdefault.jpg', duration: '60 hours', difficulty: 'advanced', simpleExplanation: 'The secret patterns that repeat in 80% of coding interviews! Learn them once, solve hundreds of problems easily.' },
      { title: 'Problem Solving 101', platform: 'HackerRank', url: 'https://hackerrank.com', thumbnail: 'https://img.youtube.com/vi/H1qL3rrJkEo/maxresdefault.jpg', duration: '30 hours', difficulty: 'intermediate', simpleExplanation: 'Build your problem-solving muscle! Start easy, build confidence, and tackle harder problems step by step.' },
    ],
  };

  // YouTube database with thumbnails and simple explanations
  const youtubeDatabase: Record<string, Array<{ 
    title: string; 
    channel: string; 
    url: string; 
    thumbnail: string;
    videos: number; 
    duration: string;
    simpleExplanation: string;
  }>> = {
    'Data Structures & Algorithms': [
      { title: 'DSA Complete Playlist', channel: 'Abdul Bari', url: 'https://youtube.com/playlist?list=PLDN4rrl48XKpZkf03iYFl-O29szjTrs_O', thumbnail: 'https://img.youtube.com/vi/0IAPZzGSbME/maxresdefault.jpg', videos: 78, duration: '40h', simpleExplanation: 'FREE! The most loved DSA playlist on YouTube. Abdul Bari explains complex topics with real-life examples anyone can understand!' },
      { title: 'Striver A2Z DSA Course', channel: 'Take U Forward', url: 'https://youtube.com/c/takeUforward', thumbnail: 'https://img.youtube.com/vi/0bHoB32fuj0/maxresdefault.jpg', videos: 300, duration: '100h', simpleExplanation: 'The complete roadmap followed by students who cracked Google, Amazon & Microsoft! Step-by-step from zero to hero.' },
    ],
    'DBMS': [
      { title: 'DBMS Full Course', channel: 'Gate Smashers', url: 'https://youtube.com/playlist?list=PLxCzCOWd7aiFAN6I8CuViBuCdJgiOkT2Y', thumbnail: 'https://img.youtube.com/vi/kBdlM6hNDAE/maxresdefault.jpg', videos: 60, duration: '20h', simpleExplanation: 'FREE! Everything about databases explained in Hindi + English. Perfect for exams and interviews!' },
      { title: 'Database Systems', channel: 'Jenny\'s Lectures', url: 'https://youtube.com/jennys', thumbnail: 'https://img.youtube.com/vi/6Iu45VZGQDk/maxresdefault.jpg', videos: 45, duration: '15h', simpleExplanation: 'Clear, simple explanations of normalization, SQL, and transactions. Great for beginners!' },
    ],
    'SQL': [
      { title: 'SQL Tutorial for Beginners', channel: 'Programming with Mosh', url: 'https://youtube.com/watch?v=7S_tz1z_5bA', thumbnail: 'https://img.youtube.com/vi/7S_tz1z_5bA/maxresdefault.jpg', videos: 1, duration: '3h', simpleExplanation: 'One video, 3 hours, and you\'ll know SQL! Mosh makes coding feel like a friendly conversation.' },
      { title: 'SQL Complete Course', channel: 'freeCodeCamp', url: 'https://youtube.com/freecodecamp', thumbnail: 'https://img.youtube.com/vi/HXV3zeQKqGY/maxresdefault.jpg', videos: 1, duration: '4h', simpleExplanation: 'FREE comprehensive SQL course! From SELECT to complex JOINs - become job-ready in one sitting.' },
    ],
    'Computer Networks': [
      { title: 'Computer Networks Playlist', channel: 'Neso Academy', url: 'https://youtube.com/playlist?list=PLBlnK6fEyqRgMCUAG0XRw78UA8qnv6jEx', thumbnail: 'https://img.youtube.com/vi/VwN91x5i25g/maxresdefault.jpg', videos: 80, duration: '25h', simpleExplanation: 'FREE! From IP addresses to how WiFi works - everything explained with diagrams and examples!' },
      { title: 'Networking Fundamentals', channel: 'PowerCert', url: 'https://youtube.com/powercert', thumbnail: 'https://img.youtube.com/vi/9SIf2pQpECw/maxresdefault.jpg', videos: 25, duration: '8h', simpleExplanation: 'Beautiful animations make networking concepts crystal clear. One of the best channels for visual learners!' },
    ],
    'Operating Systems': [
      { title: 'OS Complete Course', channel: 'Jenny\'s Lectures', url: 'https://youtube.com/playlist?list=PLdo5W4Nhv31a5ucW_S1K3-x6ztBRD-PNa', thumbnail: 'https://img.youtube.com/vi/bkSWJJZNgf8/maxresdefault.jpg', videos: 100, duration: '30h', simpleExplanation: 'FREE! Jenny\'s calm teaching style makes even process scheduling and memory management easy to understand!' },
      { title: 'Operating Systems', channel: 'Gate Smashers', url: 'https://youtube.com/gatesmashers', thumbnail: 'https://img.youtube.com/vi/26QPDBe-NB8/maxresdefault.jpg', videos: 70, duration: '20h', simpleExplanation: 'Perfect for placements and GATE! Quick, to-the-point explanations with practice questions.' },
    ],
    'Object-Oriented Programming': [
      { title: 'OOP in Java', channel: 'Kunal Kushwaha', url: 'https://youtube.com/playlist?list=PL9gnSGHSqcno1G3XjUbwzXHL8_EttOuKk', thumbnail: 'https://img.youtube.com/vi/BSVKUk58K6U/maxresdefault.jpg', videos: 30, duration: '15h', simpleExplanation: 'FREE! Kunal teaches OOP like a friend explaining over coffee. Real examples, no boring theory!' },
      { title: 'OOP Concepts', channel: 'CodeWithHarry', url: 'https://youtube.com/codewithharry', thumbnail: 'https://img.youtube.com/vi/a199KZGMNxk/maxresdefault.jpg', videos: 20, duration: '10h', simpleExplanation: 'Hindi + English mix! Learn OOP the desi way with practical examples you can relate to.' },
    ],
    'Coding': [
      { title: 'LeetCode Problem Walkthroughs', channel: 'NeetCode', url: 'https://youtube.com/c/neetcode', thumbnail: 'https://img.youtube.com/vi/SVvr3ZjtjI8/maxresdefault.jpg', videos: 500, duration: '200h', simpleExplanation: 'The #1 channel for LeetCode! Every solution explained clearly with patterns you can reuse in interviews.' },
      { title: 'Coding Interview Prep', channel: 'Kevin Naughton Jr', url: 'https://youtube.com/KevinNaughtonJr', thumbnail: 'https://img.youtube.com/vi/2SUvWfNJSsM/maxresdefault.jpg', videos: 200, duration: '80h', simpleExplanation: 'A software engineer at big tech companies shares exact interview problems and how to solve them!' },
    ],
    'Aptitude': [
      { title: 'Aptitude Made Easy', channel: 'CareerRide', url: 'https://youtube.com/careerride', thumbnail: 'https://img.youtube.com/vi/JeJLXTpGwP8/maxresdefault.jpg', videos: 100, duration: '30h', simpleExplanation: 'FREE! Shortcuts and tricks that save time in aptitude tests. Watch before any placement exam!' },
      { title: 'Logical Reasoning', channel: 'Feel Free to Learn', url: 'https://youtube.com/feelfreetolearn', thumbnail: 'https://img.youtube.com/vi/nZOV74s9JYg/maxresdefault.jpg', videos: 50, duration: '15h', simpleExplanation: 'Puzzles and patterns explained step by step. Practice along and boost your logical thinking!' },
    ],
  };

  // Generate course recommendations based on weak areas - personalized for each user
  const courses: CourseRecommendation[] = [];
  const gapsToAddress = hasTestResults ? [...weakSections, ...moderateSections].slice(0, 4) : requiredGaps.slice(0, 4);
  
  // Helper to generate personalized improvement tips
  const getImprovementTip = (skill: string, score: number): string => {
    if (score < 30) {
      return `Don't worry! Everyone starts somewhere. This course breaks down ${skill} into small, easy pieces. You'll feel confident in no time! 🚀`;
    } else if (score < 50) {
      return `You've got the basics of ${skill}! This course will fill the gaps and make you interview-ready. Just a few weeks of practice! 💪`;
    } else if (score < 70) {
      return `Good foundation in ${skill}! Level up to stand out from the crowd. Companies love candidates who go the extra mile. ⭐`;
    }
    return `You're already strong in ${skill}! This advanced course will make you exceptional and boost your salary negotiations. 🎯`;
  };
  
  gapsToAddress.forEach((skill, i) => {
    const coursesForSkill = courseDatabase[skill] || courseDatabase['Coding'] || [];
    const course = coursesForSkill[i % coursesForSkill.length] || coursesForSkill[0];
    
    if (course) {
      const sectionResult = testResults?.sectionResults.find(s => s.name === skill);
      const sectionScore = sectionResult?.score || 0;
      
      courses.push({
        title: course.title,
        platform: course.platform,
        url: course.url,
        thumbnail: course.thumbnail,
        duration: course.duration,
        difficulty: sectionScore < 30 ? 'beginner' : sectionScore < 60 ? 'intermediate' : 'advanced',
        price: i === 0 ? 'Free' : '₹499',
        rating: 4.7 - i * 0.1,
        skills: [skill],
        whyRecommended: hasTestResults 
          ? `📊 Your ${skill} score: ${sectionScore}% → Target: 70%+`
          : `💼 Required skill for ${targetRole} positions`,
        simpleExplanation: course.simpleExplanation + '\n\n' + getImprovementTip(skill, sectionScore),
        expectedImprovement: Math.min(30, 70 - sectionScore + 10),
        priority: (sectionScore < 40 ? 'Critical Gap' : sectionScore < 60 ? 'Strong Enhancement' : 'Competitive Advantage') as CourseRecommendation['priority'],
        completed: false
      });
    }
  });

  // Generate YouTube recommendations - FREE resources for weak areas
  const youtube: YouTubeRecommendation[] = [];
  gapsToAddress.slice(0, 4).forEach((skill, i) => {
    const videosForSkill = youtubeDatabase[skill] || youtubeDatabase['Coding'] || [];
    const video = videosForSkill[i % videosForSkill.length] || videosForSkill[0];
    
    if (video) {
      const sectionScore = testResults?.sectionResults.find(s => s.name === skill)?.score || 0;
      const improvementNeeded = 70 - sectionScore;
      
      youtube.push({
        title: video.title,
        channel: video.channel,
        url: video.url,
        thumbnail: video.thumbnail,
        videoCount: video.videos,
        totalDuration: video.duration,
        views: `${(5 - i)}M+`,
        skillFocus: [skill],
        whyRecommended: hasTestResults
          ? `🆓 FREE! Improve ${skill} by ${improvementNeeded}% with this playlist`
          : `🆓 FREE comprehensive ${skill} tutorial from a top educator`,
        simpleExplanation: video.simpleExplanation,
        priority: (sectionScore < 40 ? 'Critical Gap' : 'Strong Enhancement') as YouTubeRecommendation['priority']
      });
    }
  });

  // Generate certification recommendations
  const certifications: CertificationRecommendation[] = [
    {
      title: `${targetRole} Professional Certificate`,
      issuingAuthority: 'Google',
      url: 'https://grow.google/certificates/',
      cost: 'Free',
      isFree: true,
      duration: '6 months',
      industryValue: 'high' as const,
      resumeImpact: 30,
      skills: roleConfig.required.slice(0, 3),
      whyRecommended: `Industry-recognized certification that validates your ${targetRole} skills to employers.`,
      priority: 'Strong Enhancement' as const
    },
    {
      title: 'AWS Cloud Practitioner',
      issuingAuthority: 'Amazon Web Services',
      url: 'https://aws.amazon.com/certification/',
      cost: '$100',
      isFree: false,
      duration: '2-3 months',
      industryValue: 'high' as const,
      resumeImpact: 25,
      skills: ['Cloud Computing', 'AWS Services'],
      whyRecommended: 'Cloud skills are in high demand. This certification boosts your resume significantly.',
      priority: 'Competitive Advantage' as const
    }
  ];

  // Generate project recommendations with thumbnails
  const projectThumbnails = {
    'Full Stack': 'https://img.youtube.com/vi/nu_pCVPKzTk/maxresdefault.jpg',
    'Collaboration': 'https://img.youtube.com/vi/RGOj5yH7evk/maxresdefault.jpg',
    'Data': 'https://img.youtube.com/vi/vmEHCJofslg/maxresdefault.jpg',
    'ML': 'https://img.youtube.com/vi/i_LwzRVP7bg/maxresdefault.jpg',
  };
  
  const projects: ProjectRecommendation[] = [
    {
      title: `${targetRole} Portfolio Project`,
      difficulty: 'intermediate' as const,
      techStack: knownTechnologies.slice(0, 3).length ? knownTechnologies.slice(0, 3) : ['JavaScript', 'Node.js', 'MongoDB'],
      duration: '2-3 weeks',
      category: 'Full Stack',
      thumbnail: projectThumbnails['Full Stack'],
      description: `Build a real-world application that showcases your ${targetRole} skills to potential employers.`,
      simpleExplanation: `🎯 Imagine showing an interviewer a live project YOU built! This is your chance to prove you can do the job, not just talk about it. Companies hire people who can BUILD things!`,
      realWorldUseCase: 'Used by companies to evaluate practical skills during interviews.',
      resumeImpact: 'High - demonstrates hands-on experience',
      keyFeatures: [
        'User authentication',
        'CRUD operations',
        'Responsive design',
        'API integration'
      ],
      learningOutcomes: [
        'End-to-end development',
        'Real-world problem solving',
        'Code organization',
        'Deployment experience'
      ],
      whyRecommended: `🏆 Portfolio projects are the #1 way to stand out! Shows you can actually build, not just solve LeetCode.`,
      priority: 'Critical Gap' as const,
      completed: false
    },
    {
      title: 'Open Source Contribution',
      difficulty: 'beginner' as const,
      techStack: ['Git', 'GitHub'],
      duration: '1 week',
      category: 'Collaboration',
      thumbnail: projectThumbnails['Collaboration'],
      description: 'Contribute to an open source project to gain real-world experience and networking.',
      simpleExplanation: `🌟 Even fixing a typo counts! Open source = working with teams worldwide. Recruiters LOVE seeing GitHub activity. It shows you care about coding beyond assignments.`,
      realWorldUseCase: 'Companies value open source contributions as proof of collaboration skills.',
      resumeImpact: 'Medium-High - shows community involvement',
      keyFeatures: [
        'Version control mastery',
        'Code review experience',
        'Team collaboration'
      ],
      learningOutcomes: [
        'Git workflow',
        'Code review skills',
        'Professional communication'
      ],
      whyRecommended: '🤝 Shows you can work in real teams! Many students skip this - be different.',
      priority: 'Strong Enhancement' as const,
      completed: false
    }
  ];

  // Current score - use actual test score if available
  const currentScore = hasTestResults ? overallTestScore : Math.min(40 + knownTechnologies.length * 5, 70);
  const predictedScore = Math.min(currentScore + 25, 95);

  // Generate analysis insights based on test performance
  const analysisInsights = hasTestResults ? {
    overallAssessment: currentScore >= 70 
      ? `Excellent performance! Your score of ${currentScore}% shows strong preparation for ${targetRole} roles.`
      : currentScore >= 50
      ? `Good foundation with ${currentScore}%. Focus on weak areas to become interview-ready.`
      : `Your score of ${currentScore}% indicates fundamental gaps. Prioritize the recommended resources.`,
    strengthSummary: strongSections.length > 0
      ? `Strong performance in: ${strongSections.join(', ')}.`
      : 'Complete more sections to identify your strengths.',
    weaknessSummary: weakSections.length > 0
      ? `Critical areas needing improvement: ${weakSections.join(', ')}. These are frequently tested in interviews.`
      : 'No critical weaknesses. Focus on depth over breadth.',
    careerReadinessScore: currentScore,
    interviewConfidence: Math.round(currentScore * 0.9)
  } : {
    overallAssessment: `Based on your profile targeting ${targetRole}, complete an assessment to get personalized recommendations.`,
    strengthSummary: knownTechnologies.length > 0 
      ? `You have experience with ${knownTechnologies.slice(0, 3).join(', ')}.`
      : 'Complete an assessment to identify your strengths.',
    weaknessSummary: requiredGaps.length > 0
      ? `Key areas to develop: ${requiredGaps.slice(0, 3).join(', ')}.`
      : 'Complete an assessment for detailed analysis.',
    careerReadinessScore: currentScore,
    interviewConfidence: Math.max(currentScore - 10, 25)
  };

  return {
    _id: 'local-' + Date.now(),
    userId: 'local',
    analysisInsights,
    prioritySkillGaps,
    recommendations: {
      courses,
      youtube,
      certifications,
      projects,
      // AI-generated study notes based on skill gaps
      study_notes: generateStudyNotes(weakSections, requiredGaps, hasTestResults),
      // AI-generated interview prep materials
      interview_prep: generateInterviewPrep(targetRole, weakSections, hasTestResults),
      // AI-generated practice platforms
      practice_platforms: generatePracticePlatforms(targetRole, weakSections, hasTestResults)
    },
    improvementPrediction: {
      currentScore,
      predictedScore,
      improvementPercentage: predictedScore - currentScore,
      timeToAchieve: hasTestResults 
        ? (currentScore < 40 ? '8-10 weeks' : currentScore < 60 ? '4-6 weeks' : '2-4 weeks')
        : '4-6 weeks',
      confidenceLevel: hasTestResults ? 85 : 70,
      sectionImprovements: hasTestResults && testResults?.sectionResults
        ? testResults.sectionResults
            .filter(s => s.score < 70)
            .slice(0, 4)
            .map(s => ({
              section: s.name,
              currentScore: s.score,
              predictedScore: Math.min(s.score + 25, 85),
              improvement: Math.min(25, 85 - s.score)
            }))
        : requiredGaps.slice(0, 3).map((skill, i) => ({
            section: skill,
            currentScore: 30 + i * 10,
            predictedScore: 70 + i * 5,
            improvement: 40 - i * 5
          }))
    },
    learningPath: [
      {
        phase: 1,
        title: hasTestResults ? 'Address Critical Gaps' : 'Foundation Building',
        duration: '2 weeks',
        focus: hasTestResults ? weakSections.slice(0, 2) : requiredGaps.slice(0, 2),
        milestones: ['Complete core concepts', 'Build first mini-project'],
        resources: courses.slice(0, 1).map(c => c.title)
      },
      {
        phase: 2,
        title: hasTestResults ? 'Strengthen Moderate Areas' : 'Skill Development',
        duration: '3 weeks',
        focus: hasTestResults ? moderateSections.slice(0, 2) : requiredGaps.slice(1, 3),
        milestones: ['Complete intermediate content', 'Start portfolio project'],
        resources: courses.slice(1, 2).map(c => c.title)
      },
      {
        phase: 3,
        title: 'Interview Preparation',
        duration: '2 weeks',
        focus: ['Problem Solving', 'Mock Interviews'],
        milestones: ['Complete portfolio project', 'Practice interview questions'],
        resources: ['LeetCode', 'Pramp Mock Interviews']
      }
    ],
    careerAdvice: {
      shortTermGoals: hasTestResults
        ? [
            `Improve ${weakSections[0] || 'weakest area'} to 60%+`,
            'Complete recommended courses',
            'Build one portfolio project'
          ]
        : [
            `Master ${requiredGaps[0] || 'core'} fundamentals`,
            'Build one impressive portfolio project',
            'Start applying to companies'
          ],
      longTermGoals: [
        `Become a senior ${targetRole}`,
        'Lead technical projects',
        'Mentor junior developers'
      ],
      interviewReadiness: currentScore >= 60 
        ? 'Good foundation. Focus on practice problems and mock interviews.'
        : 'Build fundamentals first using the recommended resources.',
      marketPosition: `With a ${currentScore}% score, focus on the learning path to improve your market readiness.`,
      uniqueAdvantages: hasTestResults && strongSections.length > 0
        ? [
            `Strong in ${strongSections[0]}`,
            'Identified clear improvement path',
            'Data-driven preparation approach'
          ]
        : ['Fresh perspective', 'High learning potential'],
      areasToHighlight: hasTestResults && strongSections.length > 0
        ? strongSections.slice(0, 3)
        : ['Problem-solving approach', 'Willingness to learn', 'Project work']
    },
    explanationSummary: `This personalized roadmap is designed for your goal of becoming a ${targetRole}. ${requiredGaps.length > 0 ? `Focus first on ${requiredGaps[0]} as it's critical for your target role.` : 'Continue strengthening your current skills.'} Complete the recommended courses and build the suggested projects to maximize your chances of landing your dream job.`,
    aiProvider: 'local-engine',
    promptVersion: '1.0',
    isLatest: true,
    userEngagement: {
      coursesClicked: 0,
      projectsStarted: 0
    },
    createdAt: new Date(),
    updatedAt: new Date()
  };
};
