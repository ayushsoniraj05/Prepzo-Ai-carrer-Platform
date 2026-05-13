/**
 * AnswerReviewPanel
 * Displays all questions with correct answers, explanations, and user's responses
 * after test completion
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check, X, ChevronDown, ChevronUp, BookOpen,
  Filter, Search, AlertCircle, CheckCircle2, XCircle, Target
} from 'lucide-react';
import { GlassCard, GlassButton } from '@/components/ui/GlassCard';
import { QuestionAnalysis, SectionAnalysis } from '@/data/intelligentAIEngine';

interface AnswerReviewPanelProps {
  questionDetails: QuestionAnalysis[];
  sections: SectionAnalysis[];
  onClose: () => void;
}

type FilterType = 'all' | 'correct' | 'incorrect' | 'unattempted';
type SectionFilter = 'all' | string;

export const AnswerReviewPanel = ({
  questionDetails,
  sections,
  onClose
}: AnswerReviewPanelProps) => {
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [sectionFilter, setSectionFilter] = useState<SectionFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllExpanded, setShowAllExpanded] = useState(false);

  // Filter questions
  const filteredQuestions = questionDetails.filter((q: QuestionAnalysis) => {
    // Filter by type
    if (filterType === 'correct' && !q.wasCorrect) return false;
    if (filterType === 'incorrect' && (q.wasCorrect || !q.wasAttempted)) return false;
    if (filterType === 'unattempted' && q.wasAttempted) return false;

    // Filter by section
    if (sectionFilter !== 'all' && q.section !== sectionFilter) return false;

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        q.questionText.toLowerCase().includes(query) ||
        q.section.toLowerCase().includes(query) ||
        q.options.some((opt: string) => opt.toLowerCase().includes(query))
      );
    }

    return true;
  });

  // Group questions by section for display
  const questionsBySection = filteredQuestions.reduce((acc, q) => {
    if (!acc[q.section]) acc[q.section] = [];
    acc[q.section].push(q);
    return acc;
  }, {} as Record<string, QuestionAnalysis[]>);

  // Calculate stats
  const stats = {
    total: questionDetails.length,
    attempted: questionDetails.filter(q => q.wasAttempted).length,
    correct: questionDetails.filter(q => q.wasCorrect).length,
    incorrect: questionDetails.filter(q => q.wasAttempted && !q.wasCorrect).length,
    unattempted: questionDetails.filter(q => !q.wasAttempted).length
  };

  const getAnswerLabel = (index: number) => String.fromCharCode(65 + index);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 overflow-y-auto">
      <div className="min-h-screen p-4 md:p-8">
        {/* Header */}
        <div className="max-w-6xl mx-auto mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Answer Review</h1>
                <p className="text-gray-400 text-sm">Review all questions with correct answers and explanations</p>
              </div>
            </div>
            <GlassButton variant="secondary" onClick={onClose}>
              Close
            </GlassButton>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <p className="text-xs text-gray-400">Total</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30">
              <p className="text-xs text-blue-400">Attempted</p>
              <p className="text-2xl font-bold text-blue-400">{stats.attempted}</p>
            </div>
            <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/30">
              <p className="text-xs text-green-400">Correct</p>
              <p className="text-2xl font-bold text-green-400">{stats.correct}</p>
            </div>
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30">
              <p className="text-xs text-red-400">Incorrect</p>
              <p className="text-2xl font-bold text-red-400">{stats.incorrect}</p>
            </div>
            <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
              <p className="text-xs text-yellow-400">Skipped</p>
              <p className="text-2xl font-bold text-yellow-400">{stats.unattempted}</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-6">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500/50"
              />
            </div>

            {/* Type Filter */}
            <div className="flex gap-2">
              {(['all', 'correct', 'incorrect', 'unattempted'] as FilterType[]).map(type => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    filterType === type
                      ? type === 'correct' ? 'bg-green-500/30 text-green-400 border border-green-500/50'
                        : type === 'incorrect' ? 'bg-red-500/30 text-red-400 border border-red-500/50'
                        : type === 'unattempted' ? 'bg-yellow-500/30 text-yellow-400 border border-yellow-500/50'
                        : 'bg-purple-500/30 text-purple-400 border border-purple-500/50'
                      : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  {type === 'all' ? 'All' : type === 'correct' ? '✓ Correct' : type === 'incorrect' ? '✗ Wrong' : '○ Skipped'}
                </button>
              ))}
            </div>

            {/* Section Filter */}
            <select
              value={sectionFilter}
              onChange={(e) => setSectionFilter(e.target.value)}
              className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500/50"
            >
              <option value="all">All Sections</option>
              {sections.map(sec => (
                <option key={sec.name} value={sec.name}>{sec.name}</option>
              ))}
            </select>

            {/* Expand/Collapse All */}
            <button
              onClick={() => setShowAllExpanded(!showAllExpanded)}
              className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 flex items-center gap-2"
            >
              {showAllExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {showAllExpanded ? 'Collapse All' : 'Expand All'}
            </button>
          </div>
        </div>

        {/* Questions List */}
        <div className="max-w-6xl mx-auto space-y-6">
          {Object.entries(questionsBySection).map(([sectionName, questions]) => (
            <GlassCard key={sectionName}>
              {/* Section Header */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/30 to-blue-500/30 flex items-center justify-center">
                    <Target className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">{sectionName}</h2>
                    <p className="text-sm text-gray-400">
                      {(questions as QuestionAnalysis[]).filter((q: QuestionAnalysis) => q.wasCorrect).length}/{(questions as QuestionAnalysis[]).length} correct
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className="px-2 py-1 rounded-lg bg-green-500/20 text-green-400 text-xs">
                    {(questions as QuestionAnalysis[]).filter((q: QuestionAnalysis) => q.wasCorrect).length} ✓
                  </span>
                  <span className="px-2 py-1 rounded-lg bg-red-500/20 text-red-400 text-xs">
                    {(questions as QuestionAnalysis[]).filter((q: QuestionAnalysis) => q.wasAttempted && !q.wasCorrect).length} ✗
                  </span>
                  <span className="px-2 py-1 rounded-lg bg-yellow-500/20 text-yellow-400 text-xs">
                    {(questions as QuestionAnalysis[]).filter((q: QuestionAnalysis) => !q.wasAttempted).length} ○
                  </span>
                </div>
              </div>

              {/* Questions */}
              <div className="space-y-4">
                {(questions as QuestionAnalysis[]).map((q: QuestionAnalysis, qIndex: number) => {
                  // Fallbacks for missing fields
                  const questionId = q.questionId || `${q.section}-${qIndex}`;
                  const difficulty = q.difficulty || 'medium';
                  const skillTags = Array.isArray(q.skillTags) ? q.skillTags : [];
                  const isExpanded = showAllExpanded || expandedQuestion === questionId;

                  return (
                    <motion.div
                      key={questionId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: qIndex * 0.05 }}
                      className={`p-4 rounded-xl border transition-all ${
                        q.wasCorrect 
                          ? 'bg-green-500/5 border-green-500/30'
                          : q.wasAttempted 
                          ? 'bg-red-500/5 border-red-500/30'
                          : 'bg-yellow-500/5 border-yellow-500/30'
                      }`}
                    >
                      {/* Question Header */}
                      <div 
                        className="flex items-start justify-between cursor-pointer"
                        onClick={() => setExpandedQuestion(isExpanded ? null : questionId)}
                      >
                        <div className="flex items-start gap-3 flex-1">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            q.wasCorrect 
                              ? 'bg-green-500/30 text-green-400'
                              : q.wasAttempted 
                              ? 'bg-red-500/30 text-red-400'
                              : 'bg-yellow-500/30 text-yellow-400'
                          }`}>
                            {q.wasCorrect ? (
                              <CheckCircle2 className="w-5 h-5" />
                            ) : q.wasAttempted ? (
                              <XCircle className="w-5 h-5" />
                            ) : (
                              <AlertCircle className="w-5 h-5" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-gray-400">
                                Q{qIndex + 1}
                              </span>
                              <span className={`text-xs px-2 py-0.5 rounded-full uppercase tracking-widest font-bold ${
                                difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
                                difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                difficulty === 'hard' ? 'bg-red-500/20 text-red-400' :
                                'bg-purple-500/20 text-purple-400 border border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.2)]'
                              }`}>
                                {difficulty}
                              </span>
                              {q.companyAskedIn && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center gap-1">
                                  <Target size={10} /> Asked at {q.companyAskedIn}
                                </span>
                              )}
                            </div>
                            <p className="text-white font-medium">{q.questionText}</p>
                          </div>
                        </div>
                        <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </button>
                      </div>

                      {/* Expanded Content */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-4 space-y-3 pt-4 border-t border-white/10">
                              {/* Options */}
                              <div className="space-y-2">
                                {q.options.map((option: string, optIndex: number) => {
                                  const isCorrect = optIndex === q.correctAnswer;
                                  const isUserAnswer = q.userAnswer === optIndex;
                                  
                                  return (
                                    <div
                                      key={optIndex}
                                      className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                                        isCorrect
                                          ? 'bg-green-500/20 border-green-500/50'
                                          : isUserAnswer
                                          ? 'bg-red-500/20 border-red-500/50'
                                          : 'bg-white/5 border-white/10'
                                      }`}
                                    >
                                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium ${
                                        isCorrect
                                          ? 'bg-green-500 text-white'
                                          : isUserAnswer
                                          ? 'bg-red-500 text-white'
                                          : 'bg-white/10 text-gray-400'
                                      }`}>
                                        {getAnswerLabel(optIndex)}
                                      </span>
                                      <span className={`flex-1 ${
                                        isCorrect ? 'text-green-400 font-medium' : 
                                        isUserAnswer ? 'text-red-400' : 'text-gray-300'
                                      }`}>
                                        {option}
                                      </span>
                                      {isCorrect && (
                                        <span className="flex items-center gap-1 text-xs text-green-400 bg-green-500/20 px-2 py-1 rounded-full">
                                          <Check className="w-3 h-3" /> Correct Answer
                                        </span>
                                      )}
                                      {isUserAnswer && !isCorrect && (
                                        <span className="flex items-center gap-1 text-xs text-red-400 bg-red-500/20 px-2 py-1 rounded-full">
                                          <X className="w-3 h-3" /> Your Answer
                                        </span>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Explanation */}
                              {q.explanation && (
                                <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                                  <div className="flex items-center gap-2 mb-2">
                                    <BookOpen className="w-4 h-4 text-blue-400" />
                                    <span className="text-sm font-medium text-blue-400">Explanation</span>
                                  </div>
                                  <div className="text-gray-300 text-sm whitespace-pre-wrap mt-2">
                                    {q.explanation.replace(/^#{1,6}\s+/gm, '').split('**').map((part: string, i: number) => 
                                      i % 2 === 0 ? part : <strong key={i} className="text-white">{part}</strong>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* User's Status */}
                              {!q.wasAttempted && (
                                <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                                  <p className="text-sm text-yellow-400 flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" />
                                    You did not attempt this question
                                  </p>
                                </div>
                              )}

                              {/* Skills Tags */}
                              {skillTags.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                  {skillTags.map((tag: string) => (
                                    <span key={tag} className="px-2 py-1 rounded-full bg-purple-500/20 text-purple-400 text-xs">
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            </GlassCard>
          ))}

          {filteredQuestions.length === 0 && (
            <GlassCard>
              <div className="text-center py-12">
                <Filter className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No questions found</h3>
                <p className="text-gray-400 text-sm">Try adjusting your filters</p>
              </div>
            </GlassCard>
          )}
        </div>

        {/* Footer */}
        <div className="max-w-6xl mx-auto mt-8 flex justify-center">
          <GlassButton variant="primary" onClick={onClose}>
            Close Review
          </GlassButton>
        </div>
      </div>
    </div>
  );
};

export default AnswerReviewPanel;
