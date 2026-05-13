/**
 * AI Monitoring Service
 * 
 * Comprehensive monitoring for AI operations:
 * - Response time tracking
 * - Error rate monitoring
 * - CPU/Memory usage logging
 * - Recommendation acceptance tracking
 * - Performance dashboards
 * - Alerting system
 */

import mongoose from 'mongoose';

// =============================================================================
// IN-MEMORY METRICS (for real-time dashboard)
// =============================================================================

const metrics = {
  requests: {
    total: 0,
    successful: 0,
    failed: 0,
    fallbacks: 0,
  },
  performance: {
    totalResponseTime: 0,
    minResponseTime: Infinity,
    maxResponseTime: 0,
    responseTimeHistory: [], // Last 100 entries
  },
  validation: {
    passed: 0,
    failed: 0,
    warnings: 0,
    byErrorType: {},
  },
  model: {
    version: process.env.AI_MODEL_VERSION || '1.0.0',
    lastUpdated: new Date(),
    rollbackAvailable: false,
  },
  uptime: {
    startTime: new Date(),
    lastHealthCheck: null,
    isHealthy: true,
  },
};

// Circular buffer for response times
const MAX_HISTORY = 100;

// =============================================================================
// MONGODB SCHEMAS (if using DB persistence)
// =============================================================================

const AIPerformanceLogSchema = new mongoose.Schema({
  requestId: { type: String, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  timestamp: { type: Date, default: Date.now, index: true },
  responseTime: { type: Number },
  statusCode: { type: Number },
  success: { type: Boolean },
  errorType: { type: String },
  errorMessage: { type: String },
  validationPassed: { type: Boolean },
  validationErrors: [{ type: String }],
  confidenceScore: { type: Number },
  isFallback: { type: Boolean, default: false },
  memoryUsage: { type: Number },
  cpuUsage: { type: Number },
});

const AIAlertSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['AI_CRITICAL_FAILURE', 'AI_VALIDATION_FAILURE', 'HIGH_ERROR_RATE', 
           'SLOW_RESPONSE', 'LOW_CONFIDENCE', 'SERVICE_DOWN'],
    required: true 
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  message: { type: String },
  details: { type: mongoose.Schema.Types.Mixed },
  severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  acknowledged: { type: Boolean, default: false },
  acknowledgedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  acknowledgedAt: { type: Date },
  timestamp: { type: Date, default: Date.now, index: true },
});

const RecommendationTrackingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  recommendationId: { type: String, index: true },
  type: { type: String, enum: ['course', 'youtube', 'certification', 'project'] },
  title: { type: String },
  platform: { type: String },
  clicked: { type: Boolean, default: false },
  clickedAt: { type: Date },
  started: { type: Boolean, default: false },
  startedAt: { type: Date },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date },
  scoreBeforeRecommendation: { type: Number },
  scoreAfterCompletion: { type: Number },
  feedback: {
    rating: { type: Number, min: 1, max: 5 },
    helpful: { type: Boolean },
    comment: { type: String },
  },
  createdAt: { type: Date, default: Date.now },
});

const AIModelVersionSchema = new mongoose.Schema({
  version: { type: String, required: true, unique: true },
  description: { type: String },
  modelPath: { type: String },
  datasetVersion: { type: String },
  trainingMetadata: { type: mongoose.Schema.Types.Mixed },
  performanceMetrics: {
    accuracy: { type: Number },
    avgConfidence: { type: Number },
    validationPassRate: { type: Number },
    avgResponseTime: { type: Number },
  },
  isActive: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  activatedAt: { type: Date },
  deactivatedAt: { type: Date },
  rollbackReason: { type: String },
});

// Create models (check if they exist first)
let AIPerformanceLog, AIAlert, RecommendationTracking, AIModelVersion;

try {
  AIPerformanceLog = mongoose.model('AIPerformanceLog');
} catch {
  AIPerformanceLog = mongoose.model('AIPerformanceLog', AIPerformanceLogSchema);
}

try {
  AIAlert = mongoose.model('AIAlert');
} catch {
  AIAlert = mongoose.model('AIAlert', AIAlertSchema);
}

try {
  RecommendationTracking = mongoose.model('RecommendationTracking');
} catch {
  RecommendationTracking = mongoose.model('RecommendationTracking', RecommendationTrackingSchema);
}

try {
  AIModelVersion = mongoose.model('AIModelVersion');
} catch {
  AIModelVersion = mongoose.model('AIModelVersion', AIModelVersionSchema);
}

// =============================================================================
// LOGGING FUNCTIONS
// =============================================================================

/**
 * Log AI request performance
 */
export const logAIRequest = async (data) => {
  const { attempt, success, responseTime, errors = [], warnings = [], confidenceScore } = data;

  // Update in-memory metrics
  metrics.requests.total++;
  if (success) {
    metrics.requests.successful++;
  } else {
    metrics.requests.failed++;
  }

  metrics.performance.totalResponseTime += responseTime || 0;
  if (responseTime) {
    metrics.performance.minResponseTime = Math.min(metrics.performance.minResponseTime, responseTime);
    metrics.performance.maxResponseTime = Math.max(metrics.performance.maxResponseTime, responseTime);
    
    // Add to history
    metrics.performance.responseTimeHistory.push({
      time: new Date(),
      value: responseTime,
      success,
    });
    
    // Keep only last 100
    if (metrics.performance.responseTimeHistory.length > MAX_HISTORY) {
      metrics.performance.responseTimeHistory.shift();
    }
  }

  // Track validation stats
  if (success) {
    metrics.validation.passed++;
  } else {
    metrics.validation.failed++;
    errors.forEach(err => {
      metrics.validation.byErrorType[err.code] = (metrics.validation.byErrorType[err.code] || 0) + 1;
    });
  }

  // Persist to DB (non-blocking)
  try {
    await AIPerformanceLog.create({
      timestamp: new Date(),
      responseTime,
      success,
      validationPassed: success,
      validationErrors: errors.map(e => e.message),
      confidenceScore,
      memoryUsage: process.memoryUsage().heapUsed,
    });
  } catch (err) {
    console.error('Failed to log AI request:', err.message);
  }
};

/**
 * Log validation result
 */
export const logValidation = async (data) => {
  const { userId, isValid, errors = [], warnings = [], metrics: validationMetrics } = data;

  if (warnings.length > 0) {
    metrics.validation.warnings += warnings.length;
  }

  try {
    await AIPerformanceLog.create({
      userId: userId ? new mongoose.Types.ObjectId(userId) : undefined,
      timestamp: new Date(),
      validationPassed: isValid,
      validationErrors: errors.map(e => e.message),
    });
  } catch (err) {
    console.error('Failed to log validation:', err.message);
  }
};

/**
 * Log error
 */
export const logError = async (data) => {
  const { type, error, stack, userId, requestBody } = data;

  console.error(`[AI Error] ${type}: ${error}`);

  try {
    await AIPerformanceLog.create({
      userId: userId ? new mongoose.Types.ObjectId(userId) : undefined,
      timestamp: new Date(),
      success: false,
      errorType: type,
      errorMessage: error,
    });
  } catch (err) {
    console.error('Failed to log error:', err.message);
  }
};

/**
 * Log performance metrics
 */
export const logPerformance = async (data) => {
  const { requestId, responseTime, statusCode, userId } = data;

  try {
    await AIPerformanceLog.create({
      requestId,
      userId: userId ? new mongoose.Types.ObjectId(userId) : undefined,
      timestamp: new Date(),
      responseTime,
      statusCode,
      success: statusCode >= 200 && statusCode < 300,
    });
  } catch (err) {
    console.error('Failed to log performance:', err.message);
  }
};

// =============================================================================
// ALERTING FUNCTIONS
// =============================================================================

/**
 * Send alert to admin
 */
export const alertAdmin = async (data) => {
  const { type, userId, errors = [], error, timestamp } = data;

  let severity = 'medium';
  if (type === 'AI_CRITICAL_FAILURE' || type === 'SERVICE_DOWN') {
    severity = 'critical';
  } else if (type === 'HIGH_ERROR_RATE') {
    severity = 'high';
  }

  const alert = {
    type,
    userId: userId ? new mongoose.Types.ObjectId(userId) : undefined,
    message: error || errors.map(e => e.message || e).join(', '),
    details: data,
    severity,
    timestamp: timestamp || new Date(),
  };

  console.warn(`[AI ALERT - ${severity.toUpperCase()}] ${type}: ${alert.message}`);

  try {
    await AIAlert.create(alert);
  } catch (err) {
    console.error('Failed to create alert:', err.message);
  }

  // Check for high error rate
  const errorRate = metrics.requests.total > 0 
    ? metrics.requests.failed / metrics.requests.total 
    : 0;
  
  if (errorRate > 0.2 && metrics.requests.total > 10) {
    console.error(`[AI HIGH ERROR RATE] ${(errorRate * 100).toFixed(1)}% of requests failing`);
  }
};

// =============================================================================
// RECOMMENDATION TRACKING
// =============================================================================

/**
 * Track when user clicks a recommendation
 */
export const trackRecommendationClick = async (userId, recommendationId, recommendationData) => {
  try {
    await RecommendationTracking.findOneAndUpdate(
      { userId, recommendationId },
      { 
        $set: {
          clicked: true,
          clickedAt: new Date(),
          ...recommendationData,
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true, new: true }
    );
  } catch (err) {
    console.error('Failed to track recommendation click:', err.message);
  }
};

/**
 * Track when user completes a recommendation
 */
export const trackRecommendationCompletion = async (userId, recommendationId, scoreAfter) => {
  try {
    await RecommendationTracking.findOneAndUpdate(
      { userId, recommendationId },
      { 
        $set: {
          completed: true,
          completedAt: new Date(),
          scoreAfterCompletion: scoreAfter,
        },
      }
    );
  } catch (err) {
    console.error('Failed to track recommendation completion:', err.message);
  }
};

/**
 * Get recommendation effectiveness stats
 */
export const getRecommendationEffectiveness = async (options = {}) => {
  const { days = 30 } = options;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  try {
    const stats = await RecommendationTracking.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: '$type',
          totalRecommendations: { $sum: 1 },
          totalClicked: { $sum: { $cond: ['$clicked', 1, 0] } },
          totalCompleted: { $sum: { $cond: ['$completed', 1, 0] } },
          avgScoreImprovement: {
            $avg: {
              $cond: [
                { $and: ['$completed', '$scoreAfterCompletion', '$scoreBeforeRecommendation'] },
                { $subtract: ['$scoreAfterCompletion', '$scoreBeforeRecommendation'] },
                null,
              ],
            },
          },
        },
      },
    ]);

    return stats.map(s => ({
      type: s._id,
      totalRecommendations: s.totalRecommendations,
      clickRate: s.totalRecommendations > 0 ? (s.totalClicked / s.totalRecommendations * 100).toFixed(1) + '%' : '0%',
      completionRate: s.totalClicked > 0 ? (s.totalCompleted / s.totalClicked * 100).toFixed(1) + '%' : '0%',
      avgScoreImprovement: s.avgScoreImprovement ? s.avgScoreImprovement.toFixed(1) + '%' : 'N/A',
    }));
  } catch (err) {
    console.error('Failed to get recommendation effectiveness:', err.message);
    return [];
  }
};

// =============================================================================
// MODEL VERSION MANAGEMENT
// =============================================================================

/**
 * Register new model version
 */
export const registerModelVersion = async (versionData) => {
  try {
    const version = await AIModelVersion.create(versionData);
    metrics.model.version = version.version;
    return version;
  } catch (err) {
    console.error('Failed to register model version:', err.message);
    throw err;
  }
};

/**
 * Activate model version
 */
export const activateModelVersion = async (version) => {
  try {
    // Deactivate current active version
    await AIModelVersion.updateMany(
      { isActive: true },
      { $set: { isActive: false, deactivatedAt: new Date() } }
    );

    // Activate new version
    const newVersion = await AIModelVersion.findOneAndUpdate(
      { version },
      { $set: { isActive: true, activatedAt: new Date() } },
      { new: true }
    );

    if (newVersion) {
      metrics.model.version = newVersion.version;
      metrics.model.lastUpdated = new Date();
      metrics.model.rollbackAvailable = true;
    }

    return newVersion;
  } catch (err) {
    console.error('Failed to activate model version:', err.message);
    throw err;
  }
};

/**
 * Rollback to previous model version
 */
export const rollbackModelVersion = async (reason) => {
  try {
    // Find current and previous active versions
    const versions = await AIModelVersion.find()
      .sort({ activatedAt: -1 })
      .limit(2);

    if (versions.length < 2) {
      throw new Error('No previous version available for rollback');
    }

    const [current, previous] = versions;

    // Deactivate current
    await AIModelVersion.findByIdAndUpdate(current._id, {
      $set: { isActive: false, deactivatedAt: new Date(), rollbackReason: reason },
    });

    // Reactivate previous
    await AIModelVersion.findByIdAndUpdate(previous._id, {
      $set: { isActive: true, activatedAt: new Date() },
    });

    metrics.model.version = previous.version;
    metrics.model.lastUpdated = new Date();

    await alertAdmin({
      type: 'MODEL_ROLLBACK',
      message: `Model rolled back from ${current.version} to ${previous.version}: ${reason}`,
    });

    return previous;
  } catch (err) {
    console.error('Failed to rollback model version:', err.message);
    throw err;
  }
};

// =============================================================================
// DASHBOARD DATA
// =============================================================================

/**
 * Get comprehensive dashboard data
 */
export const getDashboardData = async () => {
  const avgResponseTime = metrics.requests.total > 0 
    ? Math.round(metrics.performance.totalResponseTime / metrics.requests.total)
    : 0;

  const errorRate = metrics.requests.total > 0
    ? (metrics.requests.failed / metrics.requests.total * 100).toFixed(2)
    : 0;

  const validationPassRate = (metrics.validation.passed + metrics.validation.failed) > 0
    ? (metrics.validation.passed / (metrics.validation.passed + metrics.validation.failed) * 100).toFixed(2)
    : 100;

  // Get recent alerts
  let recentAlerts = [];
  try {
    recentAlerts = await AIAlert.find()
      .sort({ timestamp: -1 })
      .limit(10)
      .lean();
  } catch (err) {
    console.error('Failed to fetch alerts:', err.message);
  }

  // Get recommendation effectiveness
  const recommendationEffectiveness = await getRecommendationEffectiveness();

  // Get error breakdown
  let errorBreakdown = [];
  try {
    errorBreakdown = await AIPerformanceLog.aggregate([
      { $match: { success: false, errorType: { $exists: true } } },
      { $group: { _id: '$errorType', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);
  } catch (err) {
    console.error('Failed to get error breakdown:', err.message);
  }

  return {
    overview: {
      totalRequests: metrics.requests.total,
      successfulRequests: metrics.requests.successful,
      failedRequests: metrics.requests.failed,
      fallbacksUsed: metrics.requests.fallbacks,
      errorRate: `${errorRate}%`,
      validationPassRate: `${validationPassRate}%`,
    },
    performance: {
      avgResponseTime: `${avgResponseTime}ms`,
      minResponseTime: `${metrics.performance.minResponseTime === Infinity ? 0 : metrics.performance.minResponseTime}ms`,
      maxResponseTime: `${metrics.performance.maxResponseTime}ms`,
      recentResponseTimes: metrics.performance.responseTimeHistory.slice(-20),
    },
    validation: {
      passed: metrics.validation.passed,
      failed: metrics.validation.failed,
      warnings: metrics.validation.warnings,
      errorsByType: metrics.validation.byErrorType,
    },
    model: {
      currentVersion: metrics.model.version,
      lastUpdated: metrics.model.lastUpdated,
      rollbackAvailable: metrics.model.rollbackAvailable,
    },
    system: {
      uptime: formatUptime(Date.now() - metrics.uptime.startTime.getTime()),
      memoryUsage: formatBytes(process.memoryUsage().heapUsed),
      isHealthy: metrics.uptime.isHealthy,
      lastHealthCheck: metrics.uptime.lastHealthCheck,
    },
    recommendations: recommendationEffectiveness,
    recentAlerts: recentAlerts.map(a => ({
      type: a.type,
      severity: a.severity,
      message: a.message,
      timestamp: a.timestamp,
      acknowledged: a.acknowledged,
    })),
    errorBreakdown: errorBreakdown.map(e => ({
      type: e._id,
      count: e.count,
    })),
  };
};

/**
 * Get health check status
 */
export const getHealthStatus = () => {
  metrics.uptime.lastHealthCheck = new Date();
  
  const errorRate = metrics.requests.total > 0
    ? metrics.requests.failed / metrics.requests.total
    : 0;

  const isHealthy = errorRate < 0.3 && // Less than 30% error rate
                    metrics.performance.maxResponseTime < 30000; // Less than 30s max response

  metrics.uptime.isHealthy = isHealthy;

  return {
    status: isHealthy ? 'healthy' : 'degraded',
    uptime: Date.now() - metrics.uptime.startTime.getTime(),
    metrics: {
      totalRequests: metrics.requests.total,
      errorRate: `${(errorRate * 100).toFixed(2)}%`,
      avgResponseTime: metrics.requests.total > 0 
        ? Math.round(metrics.performance.totalResponseTime / metrics.requests.total)
        : 0,
    },
    model: {
      version: metrics.model.version,
      lastUpdated: metrics.model.lastUpdated,
    },
  };
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function formatUptime(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// =============================================================================
// EXPORTS
// =============================================================================

export default {
  // Logging
  logAIRequest,
  logValidation,
  logError,
  logPerformance,
  
  // Alerting
  alertAdmin,
  
  // Recommendation tracking
  trackRecommendationClick,
  trackRecommendationCompletion,
  getRecommendationEffectiveness,
  
  // Model versioning
  registerModelVersion,
  activateModelVersion,
  rollbackModelVersion,
  
  // Dashboard
  getDashboardData,
  getHealthStatus,
  
  // Models for external use
  AIPerformanceLog,
  AIAlert,
  RecommendationTracking,
  AIModelVersion,
  
  // Raw metrics
  metrics,
};
