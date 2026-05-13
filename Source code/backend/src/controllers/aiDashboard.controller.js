/**
 * AI Dashboard Controller
 * 
 * API endpoints for AI monitoring dashboard.
 * Provides metrics, alerts, and management capabilities.
 */

import aiMonitoring from '../services/aiMonitoring.service.js';
import aiValidator from '../services/aiValidator.service.js';
import aiTests from '../tests/aiTests.js';

// =============================================================================
// DASHBOARD ENDPOINTS
// =============================================================================

/**
 * Get comprehensive dashboard data
 */
export const getDashboard = async (req, res) => {
  try {
    const dashboardData = await aiMonitoring.getDashboardData();
    res.json({
      success: true,
      data: dashboardData,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data',
      error: error.message,
    });
  }
};

/**
 * Get health status
 */
export const getHealth = (req, res) => {
  try {
    const health = aiMonitoring.getHealthStatus();
    const statusCode = health.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json({
      success: true,
      data: health,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Health check failed',
      error: error.message,
    });
  }
};

// =============================================================================
// ALERT ENDPOINTS
// =============================================================================

/**
 * Get all alerts
 */
export const getAlerts = async (req, res) => {
  try {
    const { severity, acknowledged, limit = 50 } = req.query;
    
    const filter = {};
    if (severity) filter.severity = severity;
    if (acknowledged !== undefined) filter.acknowledged = acknowledged === 'true';

    const alerts = await aiMonitoring.AIAlert.find(filter)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .lean();

    res.json({
      success: true,
      data: alerts,
      count: alerts.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch alerts',
      error: error.message,
    });
  }
};

/**
 * Acknowledge an alert
 */
export const acknowledgeAlert = async (req, res) => {
  try {
    const { alertId } = req.params;

    const alert = await aiMonitoring.AIAlert.findByIdAndUpdate(
      alertId,
      {
        $set: {
          acknowledged: true,
          acknowledgedBy: req.user.id,
          acknowledgedAt: new Date(),
        },
      },
      { new: true }
    );

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found',
      });
    }

    res.json({
      success: true,
      data: alert,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to acknowledge alert',
      error: error.message,
    });
  }
};

// =============================================================================
// PERFORMANCE ENDPOINTS
// =============================================================================

/**
 * Get performance logs
 */
export const getPerformanceLogs = async (req, res) => {
  try {
    const { startDate, endDate, limit = 100, success } = req.query;
    
    const filter = {};
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }
    if (success !== undefined) filter.success = success === 'true';

    const logs = await aiMonitoring.AIPerformanceLog.find(filter)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .lean();

    // Calculate aggregated stats
    const stats = {
      totalRequests: logs.length,
      successRate: logs.length > 0 
        ? ((logs.filter(l => l.success).length / logs.length) * 100).toFixed(2) + '%'
        : 'N/A',
      avgResponseTime: logs.length > 0
        ? Math.round(logs.reduce((sum, l) => sum + (l.responseTime || 0), 0) / logs.length) + 'ms'
        : 'N/A',
    };

    res.json({
      success: true,
      data: { logs, stats },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch performance logs',
      error: error.message,
    });
  }
};

/**
 * Get performance trends
 */
export const getPerformanceTrends = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const trends = await aiMonitoring.AIPerformanceLog.aggregate([
      { $match: { timestamp: { $gte: startDate } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$timestamp' },
          },
          totalRequests: { $sum: 1 },
          successfulRequests: { $sum: { $cond: ['$success', 1, 0] } },
          avgResponseTime: { $avg: '$responseTime' },
          avgConfidence: { $avg: '$confidenceScore' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      success: true,
      data: trends.map(t => ({
        date: t._id,
        totalRequests: t.totalRequests,
        successRate: ((t.successfulRequests / t.totalRequests) * 100).toFixed(1) + '%',
        avgResponseTime: Math.round(t.avgResponseTime || 0) + 'ms',
        avgConfidence: t.avgConfidence ? (t.avgConfidence * 100).toFixed(1) + '%' : 'N/A',
      })),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch trends',
      error: error.message,
    });
  }
};

// =============================================================================
// RECOMMENDATION TRACKING ENDPOINTS
// =============================================================================

/**
 * Get recommendation effectiveness stats
 */
export const getRecommendationStats = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const stats = await aiMonitoring.getRecommendationEffectiveness({ days: parseInt(days) });
    
    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recommendation stats',
      error: error.message,
    });
  }
};

/**
 * Track recommendation interaction
 */
export const trackRecommendation = async (req, res) => {
  try {
    const { recommendationId, action, data = {} } = req.body;
    const userId = req.user.id;

    switch (action) {
      case 'click':
        await aiMonitoring.trackRecommendationClick(userId, recommendationId, data);
        break;
      case 'complete':
        await aiMonitoring.trackRecommendationCompletion(userId, recommendationId, data.scoreAfter);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid action. Use: click, complete',
        });
    }

    res.json({
      success: true,
      message: `Recommendation ${action} tracked`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to track recommendation',
      error: error.message,
    });
  }
};

// =============================================================================
// MODEL VERSION ENDPOINTS
// =============================================================================

/**
 * Get all model versions
 */
export const getModelVersions = async (req, res) => {
  try {
    const versions = await aiMonitoring.AIModelVersion.find()
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: versions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch model versions',
      error: error.message,
    });
  }
};

/**
 * Register new model version
 */
export const registerModelVersion = async (req, res) => {
  try {
    const version = await aiMonitoring.registerModelVersion(req.body);
    
    res.status(201).json({
      success: true,
      data: version,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to register model version',
      error: error.message,
    });
  }
};

/**
 * Activate a model version
 */
export const activateModelVersion = async (req, res) => {
  try {
    const { version } = req.params;
    const activated = await aiMonitoring.activateModelVersion(version);

    if (!activated) {
      return res.status(404).json({
        success: false,
        message: 'Model version not found',
      });
    }

    res.json({
      success: true,
      message: `Model version ${version} activated`,
      data: activated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to activate model version',
      error: error.message,
    });
  }
};

/**
 * Rollback to previous model version
 */
export const rollbackModel = async (req, res) => {
  try {
    const { reason } = req.body;
    
    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Rollback reason is required',
      });
    }

    const previous = await aiMonitoring.rollbackModelVersion(reason);

    res.json({
      success: true,
      message: `Rolled back to version ${previous.version}`,
      data: previous,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to rollback model',
      error: error.message,
    });
  }
};

// =============================================================================
// TESTING ENDPOINTS
// =============================================================================

/**
 * Run AI validation tests
 */
export const runValidationTests = async (req, res) => {
  try {
    const results = aiTests.runValidationTests();
    
    res.json({
      success: true,
      data: results,
      message: results.failed === 0 ? 'All validation tests passed' : `${results.failed} tests failed`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to run validation tests',
      error: error.message,
    });
  }
};

/**
 * Run full AI test suite
 */
export const runFullTestSuite = async (req, res) => {
  try {
    const { verbose = false } = req.query;
    const results = await aiTests.runAllTests({ verbose: verbose === 'true' });
    
    res.json({
      success: true,
      data: results,
      message: results.failed === 0 
        ? 'All tests passed' 
        : `${results.failed}/${results.totalTests} tests failed`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to run test suite',
      error: error.message,
    });
  }
};

/**
 * Get test cases
 */
export const getTestCases = (req, res) => {
  res.json({
    success: true,
    data: aiTests.TEST_CASES.map(tc => ({
      id: tc.id,
      name: tc.name,
      description: tc.description,
      targetRole: tc.input.studentProfile.targetRole,
      overallScore: tc.input.assessmentResults.overallScore,
    })),
  });
};

// =============================================================================
// VALIDATION ENDPOINTS
// =============================================================================

/**
 * Get validation configuration
 */
export const getValidationConfig = (req, res) => {
  res.json({
    success: true,
    data: {
      config: aiValidator.CONFIG,
      roleSkillMatrix: aiValidator.ROLE_SKILL_MATRIX,
    },
  });
};

/**
 * Validate a sample response
 */
export const validateSampleResponse = (req, res) => {
  try {
    const { response, context = {} } = req.body;

    if (!response) {
      return res.status(400).json({
        success: false,
        message: 'Response object is required',
      });
    }

    const result = aiValidator.validateAIResponse(response, context);

    res.json({
      success: true,
      data: {
        isValid: result.isValid,
        errors: result.errors,
        warnings: result.warnings,
        metrics: result.validationMetrics,
        fixedIssues: result.fixedIssues,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Validation failed',
      error: error.message,
    });
  }
};

// =============================================================================
// EXPORTS
// =============================================================================

export default {
  // Dashboard
  getDashboard,
  getHealth,
  
  // Alerts
  getAlerts,
  acknowledgeAlert,
  
  // Performance
  getPerformanceLogs,
  getPerformanceTrends,
  
  // Recommendations
  getRecommendationStats,
  trackRecommendation,
  
  // Model versions
  getModelVersions,
  registerModelVersion,
  activateModelVersion,
  rollbackModel,
  
  // Testing
  runValidationTests,
  runFullTestSuite,
  getTestCases,
  
  // Validation
  getValidationConfig,
  validateSampleResponse,
};
