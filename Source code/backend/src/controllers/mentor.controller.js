/**
 * AI Mentor Controller
 * Handles AI mentor chat and career guidance functionality
 */

import { asyncHandler } from '../middleware/error.middleware.js';
import { v4 as uuidv4 } from 'uuid';
import * as aiServiceModule from '../services/aiService.js';

// AI service client
const aiService = aiServiceModule.default;

/**
 * @desc    Chat with AI mentor
 * @route   POST /api/mentor/chat
 * @access  Private
 */
export const chat = asyncHandler(async (req, res) => {
  const userId = req.user._id.toString();
  const { message, sessionId, context } = req.body;

  if (!message || message.trim().length === 0) {
    res.status(400);
    throw new Error('Message is required');
  }

  // Check if AI service is available (reachable)
  const isAvailable = await aiService.isServiceAvailable();
  if (!isAvailable) {
    res.status(503).json({
      success: false,
      message: 'AI Mentor is currently offline. Please wait a moment while it boots up on Render.',
      status: 'offline'
    });
    return;
  }

  // Check if models are loaded
  const isReady = await aiService.isServiceReady();
  if (!isReady) {
    return res.status(200).json({
      success: true,
      sessionId: sessionId || uuidv4(),
      message: "I'm currently warming up my AI brain (loading models). I'll be fully ready to chat in about 30-60 seconds! How can I help you in the meantime?",
      status: 'warming_up',
      suggestions: ["Check my progress", "What's new?", "Wait a moment"]
    });
  }

  // Generate session ID if not provided
  const activeSessionId = sessionId || uuidv4();

  // Get user context for personalization
  const userContext = {
    targetRole: req.user.targetRole || context?.targetRole || 'Software Engineer',
    currentSkills: req.user.skills || context?.currentSkills || [],
    learningGoals: context?.learningGoals || []
  };

  // Call AI mentor
  let response;
  try {
    response = await aiService.chatWithMentor(
      userId,
      activeSessionId,
      message,
      userContext
    );
  } catch (error) {
    console.error('Mentor chat call failed:', error.message);
    return res.status(200).json({
      success: true,
      sessionId: activeSessionId,
      message: "I hit a temporary connection issue. Ask again in a moment and I'll pick it back up.",
      status: 'error_fallback',
      suggestions: ["Try again", "What happened?", "Tell me a joke"]
    });
  }

  // Extract message from nested response structure
  const aiResponse = response.response || response;
  const actualMessage = typeof aiResponse === 'string' 
    ? aiResponse 
    : (aiResponse?.message || aiResponse?.response || "I'm processing your request. Could you please rephrase that?");

  res.status(200).json({
    success: true,
    sessionId: aiResponse?.session_id || activeSessionId,
    message: actualMessage,
    intent: aiResponse?.intent_detected || aiResponse?.intent || response?.intent,
    resources: aiResponse?.resources || response?.resources || [],
    suggestions: aiResponse?.suggestions || response?.suggestions || []
  });
});

/**
 * @desc    Get conversation history for a session
 * @route   GET /api/mentor/history/:sessionId
 * @access  Private
 */
export const getHistory = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const limit = parseInt(req.query.limit) || 50;

  if (!aiService) {
    res.status(503);
    throw new Error('AI mentor service not configured');
  }

  const history = await aiService.getSessionHistory(sessionId, limit);

  res.status(200).json({
    success: true,
    sessionId,
    messages: history.messages || []
  });
});

/**
 * @desc    Get all conversation sessions for current user
 * @route   GET /api/mentor/sessions
 * @access  Private
 */
export const getSessions = asyncHandler(async (req, res) => {
  const userId = req.user._id.toString();

  if (!aiService) {
    res.status(503);
    throw new Error('AI mentor service not configured');
  }

  const sessions = await aiService.getMentorSessions(userId);

  res.status(200).json({
    success: true,
    sessions: sessions.sessions || []
  });
});

/**
 * @desc    Start mock interview practice
 * @route   POST /api/mentor/interview/start
 * @access  Private
 */
export const startInterview = asyncHandler(async (req, res) => {
  const userId = req.user._id.toString();
  const { topic, difficulty } = req.body;

  if (!topic) {
    res.status(400);
    throw new Error('Interview topic is required');
  }

  if (!aiService) {
    res.status(503);
    throw new Error('AI mentor service not configured');
  }

  const isAvailable = await aiService.isServiceAvailable();
  if (!isAvailable) {
    res.status(503);
    throw new Error('AI mentor service temporarily unavailable');
  }

  const response = await aiService.startInterviewPractice(
    userId,
    topic,
    difficulty || 'medium'
  );

  res.status(200).json({
    success: true,
    sessionId: response.session_id,
    question: response.question,
    topic: response.topic,
    difficulty: response.difficulty
  });
});

/**
 * @desc    Get concept explanation
 * @route   POST /api/mentor/explain
 * @access  Private
 */
export const explainConcept = asyncHandler(async (req, res) => {
  const { concept, level, relatedSkills } = req.body;

  if (!concept) {
    res.status(400);
    throw new Error('Concept is required');
  }

  if (!aiService) {
    res.status(503);
    throw new Error('AI mentor service not configured');
  }

  const isAvailable = await aiService.isServiceAvailable();
  if (!isAvailable) {
    res.status(503);
    throw new Error('AI mentor service temporarily unavailable');
  }

  const response = await aiService.explainConcept(
    concept,
    level || 'intermediate',
    relatedSkills || []
  );

  res.status(200).json({
    success: true,
    concept,
    explanation: response.explanation,
    resources: response.resources || [],
    relatedConcepts: response.related_concepts || []
  });
});

/**
 * @desc    Check AI mentor service status
 * @route   GET /api/mentor/status
 * @access  Public
 */
export const getStatus = asyncHandler(async (req, res) => {
  if (!aiService) {
    return res.status(200).json({
      success: true,
      available: false,
      message: 'AI mentor service not configured'
    });
  }

  const isAvailable = await aiService.isServiceAvailable();
  const isReady = isAvailable ? await aiService.isServiceReady() : false;

  res.status(200).json({
    success: true,
    available: isAvailable,
    ready: isReady,
    message: isReady ? 'AI mentor is ready' : 'AI mentor is starting up'
  });
});
