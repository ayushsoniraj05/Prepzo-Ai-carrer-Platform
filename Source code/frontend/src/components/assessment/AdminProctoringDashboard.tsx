/**
 * Admin Proctoring Dashboard
 * Real-time monitoring of tests, violations, and proctoring data
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';
import {
  Activity,
  AlertTriangle,
  Users,
  Clock,
  Eye,
  Camera,
  Monitor,
  RefreshCw,
  Filter,
  XCircle,
  CheckCircle,
  Play,
  RotateCcw,
  BarChart3,
  TrendingUp,
  Shield,
  User
} from 'lucide-react';
import {
  getLiveTests,
  getAllViolations,
  getProctoringStats,
  terminateSession,
  allowRetest
} from '@/api/aiTest';
import toast from 'react-hot-toast';

// ===== Types =====

interface LiveTest {
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
}

interface ViolationEntry {
  sessionId: string;
  testType: string;
  company: string;
  status: string;
  violation: {
    type: string;
    timestamp: string;
    description: string;
    severity: string;
  };
  student: { id: string; name: string; email: string; college: string };
}

interface ProctoringStats {
  overview: { totalTests: number; completedTests: number; terminatedTests: number; activeTests: number; completionRate: number; terminationRate: number };
  testTypes: { aiGenerated: number; proctored: number; withViolations: number };
  violations: { testsWithViolations: number; terminatedDueToViolations: number; breakdown: { type: string; count: number }[] };
  companies: { company: string; count: number }[];
  scores: { avgScore: number; maxScore: number; minScore: number };
  retests: { allowed: number };
}

// ===== Components =====

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const formatDateTime = (dateStr: string): string => {
  return new Date(dateStr).toLocaleString();
};

const ViolationBadge = ({ type, severity }: { type: string; severity: string }) => {
  const colors = severity === 'critical' ? 'bg-red-500/20 text-red-300 border-red-500/30' : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
  return (
    <span className={`px-2 py-1 text-xs rounded border ${colors}`}>
      {type.replace(/_/g, ' ')}
    </span>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const colors: Record<string, string> = {
    in_progress: 'bg-green-500/20 text-green-300 border-green-500/30',
    completed: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    terminated: 'bg-red-500/20 text-red-300 border-red-500/30',
    active: 'bg-green-500/20 text-green-300 border-green-500/30'
  };
  return (
    <span className={`px-2 py-1 text-xs rounded border ${colors[status] || 'bg-gray-500/20 text-gray-300'}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
};

// ===== Main Component =====

export const AdminProctoringDashboard = () => {
  const [activeTab, setActiveTab] = useState<'live' | 'violations' | 'stats'>('live');
  const [liveTests, setLiveTests] = useState<LiveTest[]>([]);
  const [violations, setViolations] = useState<ViolationEntry[]>([]);
  const [stats, setStats] = useState<ProctoringStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [violationFilters, setViolationFilters] = useState({
    type: '',
    severity: '',
    page: 1
  });
  const [violationPagination, setViolationPagination] = useState({ total: 0, pages: 0 });
  const [violationBreakdown, setViolationBreakdown] = useState<{ type: string; count: number }[]>([]);

  // Fetch live tests
  const fetchLiveTests = useCallback(async () => {
    try {
      const response = await getLiveTests();
      if (response.success) {
        setLiveTests(response.data.tests);
      }
    } catch (error) {
      console.error('Error fetching live tests:', error);
    }
  }, []);

  // Fetch violations
  const fetchViolations = useCallback(async () => {
    try {
      const response = await getAllViolations({
        page: violationFilters.page,
        limit: 20,
        violationType: violationFilters.type || undefined,
        severity: violationFilters.severity || undefined
      });
      if (response.success) {
        setViolations(response.data.violations as ViolationEntry[]);
        setViolationPagination({ total: response.data.pagination.total, pages: response.data.pagination.pages });
        setViolationBreakdown(response.data.typeBreakdown);
      }
    } catch (error) {
      console.error('Error fetching violations:', error);
    }
  }, [violationFilters]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const response = await getProctoringStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, []);

  // Initial load and refresh
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchLiveTests(), fetchViolations(), fetchStats()]);
      setLoading(false);
    };
    loadData();
  }, [fetchLiveTests, fetchViolations, fetchStats]);

  // Auto-refresh live tests every 10 seconds
  useEffect(() => {
    if (activeTab === 'live') {
      const interval = setInterval(fetchLiveTests, 10000);
      return () => clearInterval(interval);
    }
  }, [activeTab, fetchLiveTests]);

  // Refresh data manually
  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchLiveTests(), fetchViolations(), fetchStats()]);
    setRefreshing(false);
    toast.success('Data refreshed');
  };

  // Terminate a session
  const handleTerminate = async (sessionId: string) => {
    const reason = prompt('Enter reason for termination:');
    if (!reason) return;

    try {
      const response = await terminateSession(sessionId, reason);
      if (response.success) {
        toast.success('Session terminated');
        fetchLiveTests();
      }
    } catch (error) {
      toast.error('Failed to terminate session');
    }
  };

  // Allow retest
  const handleAllowRetest = async (sessionId: string) => {
    const reason = prompt('Enter reason for allowing retest:');
    if (!reason) return;

    const clearViolations = confirm('Clear violations for this student?');

    try {
      const response = await allowRetest(sessionId, reason, clearViolations);
      if (response.success) {
        toast.success('Retest allowed');
        fetchStats();
      }
    } catch (error) {
      toast.error('Failed to allow retest');
    }
  };

  // Render tabs
  const renderTabs = () => (
    <div className="flex gap-2 mb-6">
      {[
        { id: 'live', label: 'Live Tests', icon: Activity, count: liveTests.length },
        { id: 'violations', label: 'Violations', icon: AlertTriangle, count: violationPagination.total },
        { id: 'stats', label: 'Statistics', icon: BarChart3 }
      ].map(tab => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id as 'live' | 'violations' | 'stats')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            activeTab === tab.id
              ? 'bg-indigo-500/30 text-white border border-indigo-400/30'
              : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
        >
          <tab.icon className="w-4 h-4" />
          {tab.label}
          {tab.count !== undefined && (
            <span className="px-2 py-0.5 text-xs bg-white/10 rounded-full">{tab.count}</span>
          )}
        </button>
      ))}
    </div>
  );

  // Render live tests
  const renderLiveTests = () => (
    <div className="space-y-4">
      {liveTests.length === 0 ? (
        <GlassCard className="p-8 text-center">
          <Activity className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-400">No active tests right now</p>
        </GlassCard>
      ) : (
        <div className="grid gap-4">
          {liveTests.map(test => (
            <motion.div
              key={test.sessionId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <GlassCard className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <User className="w-5 h-5 text-indigo-400" />
                      <span className="font-medium">{test.student.name}</span>
                      <StatusBadge status="in_progress" />
                      {test.aiGenerated && (
                        <span className="px-2 py-0.5 text-xs bg-purple-500/20 text-purple-300 rounded">AI Generated</span>
                      )}
                      {test.company && (
                        <span className="px-2 py-0.5 text-xs bg-blue-500/20 text-blue-300 rounded">{test.company}</span>
                      )}
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-sm text-gray-400 mb-3">
                      <div>
                        <span className="text-gray-500">Email:</span> {test.student.email}
                      </div>
                      <div>
                        <span className="text-gray-500">College:</span> {test.student.college}
                      </div>
                      <div>
                        <span className="text-gray-500">Progress:</span> {test.questionsAnswered}/{test.totalQuestions}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span className={test.remainingTime < 300 ? 'text-red-400' : ''}>
                          {formatTime(test.remainingTime)} remaining
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {/* Proctoring status */}
                      <div className="flex items-center gap-2">
                        <Camera className={`w-4 h-4 ${test.proctoring.cameraEnabled ? 'text-green-400' : 'text-red-400'}`} />
                        <Monitor className={`w-4 h-4 ${test.proctoring.fullscreenEnabled ? 'text-green-400' : 'text-red-400'}`} />
                      </div>
                      {/* Violations */}
                      {test.violations.total > 0 && (
                        <div className="flex items-center gap-2">
                          <AlertTriangle className={`w-4 h-4 ${test.violations.critical > 0 ? 'text-red-400' : 'text-yellow-400'}`} />
                          <span className="text-sm">
                            {test.violations.total} violations ({test.violations.warnings} warnings, {test.violations.critical} critical)
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toast('Session details view coming soon')}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                      title="View details"
                    >
                      <Eye className="w-5 h-5 text-blue-400" />
                    </button>
                    <button
                      onClick={() => handleTerminate(test.sessionId)}
                      className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                      title="Terminate test"
                    >
                      <XCircle className="w-5 h-5 text-red-400" />
                    </button>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );

  // Render violations
  const renderViolations = () => (
    <div className="space-y-4">
      {/* Filters */}
      <GlassCard className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-gray-400">
            <Filter className="w-4 h-4" />
            <span>Filter:</span>
          </div>
          <select
            value={violationFilters.type}
            onChange={(e) => setViolationFilters(prev => ({ ...prev, type: e.target.value, page: 1 }))}
            className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm"
          >
            <option value="">All Types</option>
            {violationBreakdown.map(v => (
              <option key={v.type} value={v.type}>{v.type.replace(/_/g, ' ')} ({v.count})</option>
            ))}
          </select>
          <select
            value={violationFilters.severity}
            onChange={(e) => setViolationFilters(prev => ({ ...prev, severity: e.target.value, page: 1 }))}
            className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm"
          >
            <option value="">All Severities</option>
            <option value="warning">Warning</option>
            <option value="critical">Critical</option>
          </select>
          <button
            onClick={fetchViolations}
            className="px-3 py-1.5 bg-indigo-500/20 text-indigo-300 rounded-lg text-sm hover:bg-indigo-500/30"
          >
            Apply
          </button>
        </div>
      </GlassCard>

      {/* Violations list */}
      <div className="space-y-2">
        {violations.map((v, idx) => (
          <GlassCard key={idx} className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-medium">{v.student.name}</span>
                  <ViolationBadge type={v.violation.type} severity={v.violation.severity} />
                  <StatusBadge status={v.status} />
                </div>
                <p className="text-sm text-gray-400 mb-1">{v.violation.description}</p>
                <p className="text-xs text-gray-500">{formatDateTime(v.violation.timestamp)}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleAllowRetest(v.sessionId)}
                  className="p-2 hover:bg-green-500/20 rounded-lg transition-colors"
                  title="Allow retest"
                >
                  <RotateCcw className="w-5 h-5 text-green-400" />
                </button>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Pagination */}
      {violationPagination.pages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: Math.min(5, violationPagination.pages) }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => setViolationFilters(prev => ({ ...prev, page }))}
              className={`px-3 py-1 rounded ${violationFilters.page === page ? 'bg-indigo-500/30 text-white' : 'bg-white/5 text-gray-400'}`}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  // Render stats
  const renderStats = () => (
    <div className="space-y-6">
      {/* Overview cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Tests', value: stats?.overview.totalTests || 0, icon: Activity, color: 'text-blue-400' },
          { label: 'Completed', value: stats?.overview.completedTests || 0, icon: CheckCircle, color: 'text-green-400' },
          { label: 'Terminated', value: stats?.overview.terminatedTests || 0, icon: XCircle, color: 'text-red-400' },
          { label: 'Active Now', value: stats?.overview.activeTests || 0, icon: Play, color: 'text-yellow-400' }
        ].map((stat, idx) => (
          <GlassCard key={idx} className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-white/5 ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-gray-400">{stat.label}</p>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Test type breakdown */}
      <div className="grid grid-cols-2 gap-4">
        <GlassCard className="p-4">
          <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-400" />
            Test Types
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">AI Generated</span>
              <span className="font-medium">{stats?.testTypes.aiGenerated || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Proctored</span>
              <span className="font-medium">{stats?.testTypes.proctored || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">With Violations</span>
              <span className="font-medium text-yellow-400">{stats?.testTypes.withViolations || 0}</span>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            Scores
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Average Score</span>
              <span className="font-medium">{(stats?.scores.avgScore || 0).toFixed(2)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Highest Score</span>
              <span className="font-medium text-green-400">{(stats?.scores.maxScore || 0).toFixed(2)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Lowest Score</span>
              <span className="font-medium text-red-400">{(stats?.scores.minScore || 0).toFixed(2)}%</span>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Violation breakdown */}
      <GlassCard className="p-4">
        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-400" />
          Violation Breakdown
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {stats?.violations.breakdown.slice(0, 9).map((v, idx) => (
            <div key={idx} className="flex justify-between items-center p-2 bg-white/5 rounded-lg">
              <span className="text-sm text-gray-400">{v.type.replace(/_/g, ' ')}</span>
              <span className="font-medium">{v.count}</span>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Company distribution */}
      {stats?.companies && stats.companies.length > 0 && (
        <GlassCard className="p-4">
          <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            Company Tests Distribution
          </h3>
          <div className="grid grid-cols-4 gap-4">
            {stats.companies.map((c, idx) => (
              <div key={idx} className="flex justify-between items-center p-2 bg-white/5 rounded-lg">
                <span className="text-sm font-medium">{c.company}</span>
                <span className="text-gray-400">{c.count}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Shield className="w-7 h-7 text-indigo-400" />
            Proctoring Dashboard
          </h1>
          <p className="text-gray-400 mt-1">Monitor live tests, violations, and proctoring analytics</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-500/20 text-indigo-300 rounded-lg hover:bg-indigo-500/30 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Tabs */}
      {renderTabs()}

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          {activeTab === 'live' && renderLiveTests()}
          {activeTab === 'violations' && renderViolations()}
          {activeTab === 'stats' && renderStats()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AdminProctoringDashboard;
