import React, { useEffect, useState } from 'react';
import AICareerResults from '../results/AICareerResults';
import { XCircle, Brain } from 'lucide-react';
import { motion } from 'framer-motion';

interface AIRecommendationsPanelProps {
  onClose?: () => void;
}

const AIRecommendationsPanel: React.FC<AIRecommendationsPanelProps> = ({ onClose }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recs, setRecs] = useState<any>(null);

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Try Local Storage first (fastest)
        const cachedRecs = localStorage.getItem('backendRecommendations');
        const cachedAnalysis = localStorage.getItem('testAnalysis');
        
        let sourceData = null;
        let analysisData = null;

        if (cachedRecs) {
          try {
            const parsed = JSON.parse(cachedRecs);
            sourceData = parsed.data || parsed.recommendation || parsed;
            analysisData = cachedAnalysis ? JSON.parse(cachedAnalysis) : null;
            console.log('✅ Loaded recommendations from cache');
          } catch (e) {
            console.warn('Failed to parse cached recommendations');
          }
        }

        // 2. Fallback to Backend if no cache or invalid cache
        if (!sourceData) {
          console.log('🔄 Fetching latest recommendations from backend...');
          const { getLatestRecommendations } = await import('@/api/recommendations');
          const response = await getLatestRecommendations();
          
          if (response.success && response.recommendation) {
            sourceData = response.recommendation;
            // Also update cache for next time
            localStorage.setItem('backendRecommendations', JSON.stringify(response.recommendation));
          }
        }

        if (sourceData) {
          // Robust mapping logic
          const backendData = sourceData;
          
          let sections = [];
          if (analysisData && analysisData.sections) {
            sections = analysisData.sections.map((s: any) => ({
              name: s.name || s.sectionName || 'Unknown',
              score: s.score || 0,
              total: s.totalQuestions || 0,
              correct: s.correctAnswers || s.correct || 0,
              percentage: s.score || 0,
              status: (s.score || 0) >= 70 ? 'strength' : (s.score || 0) >= 50 ? 'moderate' : 'weakness'
            }));
          } else if (backendData.sectionScores && Array.isArray(backendData.sectionScores)) {
            // Use section scores stored in the recommendation object itself
            sections = backendData.sectionScores.map((s: any) => ({
              name: s.name || s.sectionName || 'Unknown',
              score: s.score || 0,
              total: s.total || 0,
              correct: s.correct || 0,
              percentage: s.score || 0,
              status: s.score >= 70 ? 'strength' : s.score >= 50 ? 'moderate' : 'weakness'
            }));
          } else {
            sections = [{
              name: 'Overall',
              score: backendData.metadata?.inputScore || 0,
              total: 100,
              correct: backendData.metadata?.inputScore || 0,
              percentage: backendData.metadata?.inputScore || 0,
              status: 'moderate'
            }];
          }

          const mappedRecs = {
            sectionScores: sections,
            analysis: {
              strengthSummary: backendData.analysisInsights?.strengthSummary || backendData.analysisInsights?.strengths?.join('. ') || 'Strong fundamentals in core areas.',
              weaknessSummary: backendData.analysisInsights?.weaknessSummary || backendData.analysisInsights?.primaryWeaknesses?.join('. ') || 'Some areas require more focus.',
              skillGapAnalysis: (backendData.prioritySkillGaps || []).map((g: any) => g.skill).join(', ') || 'No major skill gaps detected.',
              improvementPriority: (backendData.prioritySkillGaps || []).map((g: any) => g.skill) || [],
              overallAssessment: backendData.analysisInsights?.overallAssessment || backendData.explanationSummary || 'Good performance overall.',
              careerReadinessScore: backendData.analysisInsights?.careerReadinessScore || backendData.improvementPrediction?.currentScore || 75,
              interviewConfidence: backendData.analysisInsights?.interviewConfidence || 70,
            },
            recommendations: {
              courses: backendData.recommendations?.courses || [],
              youtube: backendData.recommendations?.youtube || [],
              certifications: backendData.recommendations?.certifications || [],
              projects: backendData.recommendations?.projects || [],
              studyNotes: backendData.recommendations?.study_notes || backendData.recommendations?.studyNotes || [],
              interviewPrep: backendData.recommendations?.interview_prep || backendData.recommendations?.interviewPrep || [],
              practice: backendData.recommendations?.practice_platforms || backendData.recommendations?.practice || []
            },
            learningPath: backendData.learningPath || backendData.learning_path || { title: 'Strategic Growth Roadmap', phases: [] },
            improvementPrediction: backendData.improvementPrediction || backendData.improvement_prediction || {
                currentScore: backendData.metadata?.inputScore || 0,
                predictedScore: (backendData.metadata?.inputScore || 0) + 15,
                improvementPercentage: 15,
                timeToAchieve: '4-8 weeks',
                interviewConfidenceBoost: 10,
                placementReadinessBoost: 15
            },
            generatedAt: backendData.metadata?.generatedAt || new Date().toISOString(),
            metadata: backendData.metadata
          };
          
          setRecs(mappedRecs);
        } else {
          setError("No recent Prepzo AI Career Recommendation found. Please complete an assessment suite to generate your personalized roadmap.");
        }
      } catch (err: any) {
        console.error('Error loading recommendations:', err);
        setError(err?.message || 'Failed to connect to Prepzo AI satellite. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };

    loadRecommendations();
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
          <Brain className="w-16 h-16 text-cyan-400 mb-4" />
        </motion.div>
        <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 animate-pulse">
          Loading Prepzo AI Career Recommendation...
        </h3>
      </div>
    );
  }

  if (error || !recs) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <div className="p-8 bg-gray-900 border border-red-500/30 rounded-3xl max-w-md w-full text-center shadow-2xl">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-white mb-3">Recommendation Unavailable</h3>
          <p className="text-red-300/80 mb-8">{error}</p>
          <button 
            className="w-full px-6 py-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl font-semibold transition text-lg" 
            onClick={onClose}
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-[#0a0f1c] text-white">
      <div className="sticky top-0 z-[110] p-4 flex justify-end bg-gradient-to-b from-[#0a0f1c] to-transparent pointer-events-none">
        <button 
          onClick={onClose} 
          className="pointer-events-auto px-6 py-2.5 bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/40 rounded-full font-semibold transition-all text-gray-300 hover:text-white shadow-xl backdrop-blur-md flex items-center gap-2 group"
        >
          <XCircle className="w-5 h-5 group-hover:text-red-400" />
          Close Recommendations
        </button>
      </div>
      <div className="-mt-16">
        <AICareerResults recommendations={recs} />
      </div>
    </div>
  );
};

export default AIRecommendationsPanel;
