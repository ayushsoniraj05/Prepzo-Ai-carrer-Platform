/**
 * AI Validation Middleware
 * 
 * Validates AI responses before sending to frontend.
 * Implements retry logic, failsafe mechanisms, and logging.
 */

import aiValidator from '../services/aiValidator.service.js';
import aiMonitoring from '../services/aiMonitoring.service.js';

// =============================================================================
// CONFIGURATION
// =============================================================================

const CONFIG = {
  MAX_RETRIES: 2,
  RETRY_DELAY_MS: 1000,
  FALLBACK_ENABLED: true,
  LOG_ALL_RESPONSES: true,
  BLOCK_INVALID_RESPONSES: true,
};

// =============================================================================
// FALLBACK RESPONSE
// =============================================================================

const generateFallbackResponse = (context = {}) => {
  const { studentProfile, assessmentResults } = context;
  const score = assessmentResults?.overallScore || assessmentResults?.score || 50;
  const targetRole = studentProfile?.targetRole || 'Software Engineer';

  return {
    strengths: ['Shows dedication to learning', 'Completed the assessment'],
    weaknesses: ['Areas identified for improvement based on assessment'],
    prioritySkillGaps: [
      {
        skill: 'Assessment-based skills',
        currentLevel: 'To be determined',
        requiredLevel: 'Industry standard',
        priority: 1,
        reasoning: 'Based on your assessment performance, we recommend focusing on the areas where you scored below 70%.',
      },
    ],
    recommendations: {
      courses: [
        {
          title: 'Fundamentals for Your Target Role',
          platform: 'Multiple platforms available',
          level: 'Based on your assessment',
          duration: '4-6 weeks',
          skillsTargeted: ['Core skills for ' + targetRole],
          whyThisCourse: 'This recommendation is based on your assessment results and target role requirements.',
          priority: 1,
        },
      ],
      youtube: [],
      certifications: [],
      projects: [
        {
          title: 'Portfolio Project',
          description: 'Build a project relevant to your target role to demonstrate your skills',
          techStack: ['Relevant technologies'],
          difficulty: score < 50 ? 'beginner' : score < 70 ? 'intermediate' : 'advanced',
          skillsGained: ['Practical application of concepts'],
          priority: 1,
        },
      ],
    },
    improvementPrediction: {
      currentScore: score,
      predictedScoreAfter: Math.min(score + 20, 95),
      timeToAchieve: '4-8 weeks',
      confidenceLevel: 'Estimated based on typical improvement rates',
    },
    summary: `Based on your assessment score of ${score}%, we've identified areas for improvement for your goal of becoming a ${targetRole}. The AI recommendation system encountered an issue generating personalized recommendations. Please try again or contact support for detailed guidance.`,
    confidenceScore: 0.5,
    isFallback: true,
    fallbackReason: 'AI service temporarily unavailable or validation failed',
    validatedAt: new Date(),
  };
};

// =============================================================================
// RETRY LOGIC
// =============================================================================

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Execute AI generation with retry logic
 */
export const executeWithRetry = async (aiFunction, context, maxRetries = CONFIG.MAX_RETRIES) => {
  let lastError = null;
  let lastValidationResult = null;

  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      const startTime = Date.now();
      
      // Call AI function
      const response = await aiFunction();
      
      const responseTime = Date.now() - startTime;

      // Validate the response
      const validationResult = aiValidator.validateAIResponse(response, context);

      // Log the attempt
      await aiMonitoring.logAIRequest({
        attempt,
        success: validationResult.isValid,
        responseTime,
        errors: validationResult.errors,
        warnings: validationResult.warnings,
        confidenceScore: response.confidenceScore,
      });

      if (validationResult.isValid) {
        // Success!
        return {
          success: true,
          response: validationResult.validatedResponse,
          validationResult,
          attempts: attempt,
        };
      }

      // Validation failed
      lastValidationResult = validationResult;
      lastError = new Error(`Validation failed: ${validationResult.errors.map(e => e.message).join(', ')}`);

      // Check if errors are critical (no point retrying)
      const criticalErrors = validationResult.errors.filter(e => 
        ['INVALID_RESPONSE', 'MISSING_FIELD'].includes(e.code)
      );

      if (criticalErrors.length > 0 && attempt < maxRetries + 1) {
        console.warn(`AI validation failed (attempt ${attempt}), retrying...`, criticalErrors);
        await delay(CONFIG.RETRY_DELAY_MS * attempt);
        continue;
      }

      // Low confidence - regenerate
      if (validationResult.errors.some(e => e.code === 'LOW_CONFIDENCE') && attempt < maxRetries + 1) {
        console.warn(`AI confidence too low (attempt ${attempt}), regenerating...`);
        await delay(CONFIG.RETRY_DELAY_MS * attempt);
        continue;
      }

    } catch (error) {
      lastError = error;
      console.error(`AI function error (attempt ${attempt}):`, error.message);
      
      if (attempt < maxRetries + 1) {
        await delay(CONFIG.RETRY_DELAY_MS * attempt);
      }
    }
  }

  // All retries exhausted
  return {
    success: false,
    error: lastError,
    validationResult: lastValidationResult,
    attempts: maxRetries + 1,
  };
};

// =============================================================================
// MIDDLEWARE FUNCTIONS
// =============================================================================

/**
 * Middleware to validate AI recommendations before sending to frontend
 */
export const validateAIRecommendations = (options = {}) => {
  return async (req, res, next) => {
    // Store original json method
    const originalJson = res.json.bind(res);

    // Override json to intercept AI responses
    res.json = async (data) => {
      // Check if this is an AI recommendation response
      if (data && (data.recommendations || data.prioritySkillGaps || data.analysisInsights)) {
        try {
          const context = {
            targetRole: req.body?.studentProfile?.targetRole || 
                       req.user?.profile?.targetRole ||
                       data.targetRole,
            assessmentResults: req.body?.assessmentResults || data.assessmentResults,
            knowledgeBase: null, // Could be loaded from DB
          };

          const validationResult = aiValidator.validateAIResponse(data, context);

          // Log validation
          if (CONFIG.LOG_ALL_RESPONSES) {
            await aiMonitoring.logValidation({
              userId: req.user?.id,
              isValid: validationResult.isValid,
              errors: validationResult.errors,
              warnings: validationResult.warnings,
              metrics: validationResult.validationMetrics,
            });
          }

          if (!validationResult.isValid && CONFIG.BLOCK_INVALID_RESPONSES) {
            // Alert admin for critical issues
            if (validationResult.errors.length > 2) {
              await aiMonitoring.alertAdmin({
                type: 'AI_VALIDATION_FAILURE',
                userId: req.user?.id,
                errors: validationResult.errors,
              });
            }

            // Return fallback if enabled
            if (CONFIG.FALLBACK_ENABLED) {
              const fallbackResponse = generateFallbackResponse(context);
              return originalJson({
                ...fallbackResponse,
                _validationFailed: true,
                _validationErrors: validationResult.errors.map(e => e.message),
              });
            }

            // Otherwise return error
            return res.status(422).json({
              success: false,
              message: 'AI response validation failed',
              errors: validationResult.errors.map(e => e.message),
            });
          }

          // Add validation metadata
          data._validated = true;
          data._validationWarnings = validationResult.warnings.map(w => w.message);
          data._validationMetrics = validationResult.validationMetrics;

        } catch (validationError) {
          console.error('Validation middleware error:', validationError);
          // Don't block response on validation errors, just log
          await aiMonitoring.logError({
            type: 'VALIDATION_MIDDLEWARE_ERROR',
            error: validationError.message,
            userId: req.user?.id,
          });
        }
      }

      return originalJson(data);
    };

    next();
  };
};

/**
 * Middleware to handle AI service failures gracefully
 */
export const aiFailsafe = (options = {}) => {
  return async (err, req, res, next) => {
    // Check if error is AI-related
    const isAIError = err.message?.includes('AI') || 
                      err.message?.includes('recommendation') ||
                      err.code === 'AI_SERVICE_ERROR';

    if (isAIError) {
      console.error('AI Failsafe triggered:', err.message);

      // Log critical error
      await aiMonitoring.logError({
        type: 'AI_CRITICAL_FAILURE',
        error: err.message,
        stack: err.stack,
        userId: req.user?.id,
        requestBody: req.body,
      });

      // Alert admin
      await aiMonitoring.alertAdmin({
        type: 'AI_CRITICAL_FAILURE',
        error: err.message,
        userId: req.user?.id,
        timestamp: new Date(),
      });

      // Return safe fallback
      const context = {
        studentProfile: req.body?.studentProfile,
        assessmentResults: req.body?.assessmentResults,
      };

      // Check if it's a test generation request
      if (req.originalUrl?.includes('/ai-test/generate')) {
        return res.status(200).json({
          success: true,
          message: 'AI Service bottleneck. Falling back to comprehensive practice bank.',
          data: {
            sessionId: `recovery_${Date.now()}`,
            test: {
              testId: `recovery_${Date.now()}`,
              sections: [], // Frontend will catch this and inject fallback bank
              totalQuestions: 0,
              totalTime: 0
            }
          },
          _fallback: true
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Using fallback recommendations due to temporary service issue',
        data: generateFallbackResponse(context),
        _fallback: true,
        _originalError: process.env.NODE_ENV === 'development' ? err.message : undefined,
      });
    }

    // Not an AI error, pass to next error handler
    next(err);
  };
};

/**
 * Middleware to add request context for AI operations
 */
export const aiRequestContext = () => {
  return (req, res, next) => {
    // Attach AI context to request
    req.aiContext = {
      requestId: `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      startTime: Date.now(),
      userId: req.user?.id,
      targetRole: req.body?.studentProfile?.targetRole || req.user?.profile?.targetRole,
    };

    // Track response time
    res.on('finish', async () => {
      const responseTime = Date.now() - req.aiContext.startTime;
      
      if (req.aiContext.isAIRequest) {
        await aiMonitoring.logPerformance({
          requestId: req.aiContext.requestId,
          responseTime,
          statusCode: res.statusCode,
          userId: req.aiContext.userId,
        });
      }
    });

    next();
  };
};

/**
 * Mark request as AI request for tracking
 */
export const markAIRequest = () => {
  return (req, res, next) => {
    if (req.aiContext) {
      req.aiContext.isAIRequest = true;
    }
    next();
  };
};

// =============================================================================
// EXPORTS
// =============================================================================

export default {
  validateAIRecommendations,
  aiFailsafe,
  aiRequestContext,
  markAIRequest,
  executeWithRetry,
  generateFallbackResponse,
  CONFIG,
};
