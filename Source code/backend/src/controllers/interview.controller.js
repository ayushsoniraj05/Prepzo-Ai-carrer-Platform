import aiInterviewService from '../services/aiInterview.service.js';
import User from '../models/User.model.js';

/**
 * @desc    Start a new AI mock interview session based on resume
 * @route   POST /api/interview/start
 */
export const startInterview = async (req, res, next) => {
  console.log('--- START INTERVIEW REQUEST ---');
  console.log('User ID:', req.user?._id);
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Get the user's latest resume text from their profile
    let resumeText = user.resumeText;

    if (!resumeText && user.resumeAnalysis) {
      // Synthesize text from analysis if raw text is missing
      const extracted = user.resumeAnalysis.extractedData;
      if (extracted) {
        resumeText = [
          `Skills: ${(extracted.skills || []).join(', ')}`,
          `Experience: ${(extracted.experience || []).map(e => `${e.role} at ${e.company}`).join('; ')}`,
          `Education: ${(extracted.education || []).map(e => `${e.degree} from ${e.institution}`).join('; ')}`
        ].join('\n');
      }
    }

    if (!resumeText) {
      return res.status(400).json({
        success: false,
        message: 'No resume found. Please upload or paste your resume first.'
      });
    }

    const targetRole = user.targetRole || 'Software Engineer';

    // Generate questions using Groq
    const aiResponse = await aiInterviewService.getResumeInterviewQuestions(resumeText, targetRole);

    if (!aiResponse.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to generate interview questions'
      });
    }

    const questions = aiResponse.data.questions;

    // Start the interview with the first question using Groq
    const interviewSession = await aiInterviewService.resumeMockInterview(questions, 0);

    res.status(200).json({
      success: true,
      data: {
        questions,
        currentQuestion: interviewSession.data.question,
        questionNumber: interviewSession.data.question_number,
        totalQuestions: interviewSession.data.total_questions
      }
    });
  } catch (error) {
    console.error('Start interview error:', error);
    next(error);
  }
};

/**
 * @desc    Submit an answer to the current interview question
 * @route   POST /api/interview/submit
 */
export const submitAnswer = async (req, res, next) => {
  try {
    const { questions, questionIndex, answer } = req.body;

    if (!questions || questionIndex === undefined || !answer) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: questions, questionIndex, or answer'
      });
    }

    // Evaluate current answer and get next question using Groq
    const aiResponse = await aiInterviewService.resumeMockInterview(questions, questionIndex + 1, answer);

    if (!aiResponse.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to evaluate answer'
      });
    }

    res.status(200).json({
      success: true,
      data: aiResponse.data
    });
  } catch (error) {
    console.error('Submit answer error:', error);
    next(error);
  }
};

/**
 * @desc    Get the final results of an interview session
 * @route   GET /api/interview/results/:sessionId
 */
export const getInterviewResults = async (req, res, next) => {
  try {
    // This could be expanded to fetch from a database if we persist sessions
    // For now, results are handled in the final 'complete' response of submitAnswer
    res.status(501).json({ success: false, message: 'Not implemented yet' });
  } catch (error) {
    next(error);
  }
};
