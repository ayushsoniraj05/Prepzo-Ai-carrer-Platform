/**
 * QuickInsightsWidget
 * Displays a preview of AI recommendations on the dashboard
 */

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Brain, TrendingUp, ChevronRight,
  Sparkles, AlertTriangle, CheckCircle2, Loader2
} from 'lucide-react';
import { getQuickInsights, QuickInsights } from '../../api/recommendations';
import { useAuthStore } from '../../store/authStore';

interface QuickInsightsWidgetProps {
  onViewFull: () => void;
}

export default function QuickInsightsWidget({ onViewFull }: QuickInsightsWidgetProps) {
  const { isAuthenticated } = useAuthStore();
  const [insights, setInsights] = useState<QuickInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasFetched = useRef(false);

  useEffect(() => {
    // Don't fetch if not authenticated
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    
    // Prevent multiple fetches
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchInsights = async () => {
      try {
        setLoading(true);
        const data = await getQuickInsights();
        if (data.success) {
          setInsights(data.insights);
        }
      } catch (err: any) {
        // Silently fail if no recommendations yet or unauthorized
        if (err.response?.status !== 404 && err.response?.status !== 401) {
          setError('Unable to load insights');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, [isAuthenticated]);

  if (loading) {
    return (
      <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/5 border border-blue-500/20 backdrop-blur-xl">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !insights) {
    return (
      <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-500/10 to-gray-500/5 border border-gray-500/20 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gray-500/20 rounded-xl">
            <Brain className="w-6 h-6 text-gray-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-white">Prepzo AI Career Recommendation</h3>
            <p className="text-sm text-gray-400">Complete an assessment to unlock personalized AI recommendations</p>
          </div>
          <button
            onClick={onViewFull}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-xl text-blue-400 text-sm font-medium hover:bg-blue-500/30 transition-colors"
          >
            Take Assessment <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/10 border border-blue-500/30 backdrop-blur-xl"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded-xl">
            <Sparkles className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Prepzo AI Career Recommendation</h3>
            <p className="text-xs text-gray-400">
              {insights.source === 'ai' ? 'Powered by AI Analysis' : 'Based on your assessment'}
            </p>
          </div>
        </div>
        <button
          onClick={onViewFull}
          className="flex items-center gap-1 text-blue-400 text-sm font-medium hover:underline"
        >
          View Full Report <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-3 bg-white/5 rounded-xl">
          <p className="text-xs text-gray-400">Career Readiness</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-blue-400">{(insights.careerReadinessScore || 0).toFixed(2)}%</span>
            {insights.improvementPotential > 0 && (
              <span className="flex items-center text-xs text-green-400">
                <TrendingUp className="w-3 h-3 mr-0.5" />
                +{(insights.improvementPotential || 0).toFixed(2)}% potential
              </span>
            )}
          </div>
        </div>
        <div className="p-3 bg-white/5 rounded-xl">
          <p className="text-xs text-gray-400">Next Step</p>
          <p className="text-sm text-white font-medium line-clamp-2">{insights.nextStep}</p>
        </div>
      </div>

      {/* Strengths & Gaps */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <div className="flex items-center gap-1 mb-2">
            <CheckCircle2 className="w-4 h-4 text-green-400" />
            <span className="text-xs text-gray-400">Top Strengths</span>
          </div>
          <div className="space-y-1">
            {insights.topStrengths.slice(0, 2).map((strength, i) => (
              <div
                key={i}
                className="px-2 py-1 bg-green-500/10 border border-green-500/20 rounded-lg text-xs text-green-300 truncate"
                title={strength}
              >
                {strength}
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="flex items-center gap-1 mb-2">
            <AlertTriangle className="w-4 h-4 text-orange-400" />
            <span className="text-xs text-gray-400">Focus Areas</span>
          </div>
          <div className="space-y-1">
            {insights.criticalGaps.slice(0, 2).map((gap, i) => (
              <div
                key={i}
                className="px-2 py-1 bg-orange-500/10 border border-orange-500/20 rounded-lg text-xs text-orange-300 truncate"
                title={gap}
              >
                {gap}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Assessment Summary */}
      <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
        <p className="text-sm text-blue-200 line-clamp-2">{insights.overallAssessment}</p>
      </div>

      <button
        onClick={onViewFull}
        className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl text-white font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all"
      >
        <Brain className="w-5 h-5" />
        View Full Prepzo AI Career Recommendation
      </button>
    </motion.div>
  );
}
