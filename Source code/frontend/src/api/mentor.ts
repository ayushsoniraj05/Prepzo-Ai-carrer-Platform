/**
 * AI Mentor API
 * Handles chat and career guidance functionality
 */

import api from './axios';

// Types
export interface MentorMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  intent?: string;
  resources?: MentorResource[];
}

export interface MentorResource {
  title: string;
  url: string;
  type: 'course' | 'youtube' | 'article' | 'certification';
}

export interface MentorSession {
  id: string;
  startedAt: Date;
  lastMessageAt: Date;
  messageCount: number;
  topic?: string;
}

export interface ChatResponse {
  success: boolean;
  sessionId: string;
  message: string;
  status?: string;
  intent?: string;
  resources?: MentorResource[];
  suggestions?: string[];
}

export interface MentorStatus {
  success: boolean;
  available: boolean;
  ready: boolean;
  message: string;
}

/**
 * Check if AI mentor service is available
 */
export const getMentorStatus = async (): Promise<MentorStatus> => {
  const response = await api.get('/mentor/status');
  return response.data;
};

/**
 * Send a message to the AI mentor
 */
export const chatWithMentor = async (
  message: string,
  sessionId?: string,
  context?: {
    targetRole?: string;
    currentSkills?: string[];
    learningGoals?: string[];
  }
): Promise<ChatResponse> => {
  const response = await api.post('/mentor/chat', {
    message,
    sessionId,
    context
  });
  return response.data;
};

/**
 * Get conversation history for a session
 */
export const getSessionHistory = async (
  sessionId: string,
  limit = 50
): Promise<{ success: boolean; sessionId: string; messages: MentorMessage[] }> => {
  const response = await api.get(`/mentor/history/${sessionId}`, {
    params: { limit }
  });
  return response.data;
};

/**
 * Get all mentor sessions for current user
 */
export const getMentorSessions = async (): Promise<{
  success: boolean;
  sessions: MentorSession[];
}> => {
  const response = await api.get('/mentor/sessions');
  return response.data;
};

/**
 * Start a mock interview practice session
 */
export const startInterviewPractice = async (
  topic: string,
  difficulty: 'easy' | 'medium' | 'hard' = 'medium'
): Promise<{
  success: boolean;
  sessionId: string;
  question: string;
  topic: string;
  difficulty: string;
}> => {
  const response = await api.post('/mentor/interview/start', {
    topic,
    difficulty
  });
  return response.data;
};

/**
 * Get explanation for a concept
 */
export const explainConcept = async (
  concept: string,
  level: 'beginner' | 'intermediate' | 'advanced' = 'intermediate',
  relatedSkills: string[] = []
): Promise<{
  success: boolean;
  concept: string;
  explanation: string;
  resources?: MentorResource[];
  relatedConcepts?: string[];
}> => {
  const response = await api.post('/mentor/explain', {
    concept,
    level,
    relatedSkills
  });
  return response.data;
};
