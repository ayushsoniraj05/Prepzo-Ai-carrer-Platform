import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Eye, 
  EyeOff, 
  ChevronRight, 
  ChevronLeft, 
  Trophy, 
  AlertCircle,
  Sparkles,
  Filter,
  LayoutGrid,
  List as ListIcon,
  ChevronDown
} from 'lucide-react';
import { getCategories, getQuestions, InterviewQuestion, CategoryData } from '@/api/questionBank';

interface QuestionBankProps {
  limit?: number;
  showFilters?: boolean;
  showHeader?: boolean;
}

export const QuestionBank: React.FC<QuestionBankProps> = ({ 
  limit, 
  showFilters = true,
  showHeader = true 
}) => {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [totalQuestionsCount, setTotalQuestionsCount] = useState<number>(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSubSkill, setSelectedSubSkill] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [timeLeft, setTimeLeft] = useState(90);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'flashcard' | 'browse'>(limit ? 'browse' : 'browse');

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching categories...');
        const { data, totalQuestions } = await getCategories();
        console.log('Categories received:', data);
        setCategories(data);
        setTotalQuestionsCount(totalQuestions);
        setSelectedCategory('ALL');
        setSelectedSubSkill('');
        console.log('States updated to ALL repositories.');
      } catch (err: any) {
        console.error('Failed to fetch categories:', err);
        setError('Failed to load categories. Please check your connection to the neural repository.');
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Fetch questions when filters change
  const fetchQuestions = useCallback(async () => {
    // If no category is selected and categories are loaded, default to the first one
    // unless we explicitly want "All"
    const categoryFilter = selectedCategory === 'ALL' ? undefined : selectedCategory;
    
    try {
      setLoading(true);
      const data = await getQuestions({
        category: categoryFilter || undefined,
        subSkill: selectedSubSkill || undefined,
        difficulty: selectedLevel || undefined,
        search: searchQuery || undefined,
        limit: limit
      });
      setQuestions(data || []);
      setCurrentQuestionIndex(0);
      setShowAnswer(false);
      setTimeLeft(90);
    } catch (err: any) {
      console.error('Failed to fetch questions:', err);
      if (!error) setError('Neural uplink unstable. Failed to fetch requested data streams.');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, selectedSubSkill, selectedLevel, searchQuery, error, limit]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  // Timer logic for flashcard mode
  useEffect(() => {
    if (viewMode !== 'flashcard' || questions.length === 0 || showAnswer) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [questions.length, showAnswer, viewMode]);

  const currentQuestion = questions[currentQuestionIndex];

  const resetQuestion = () => {
    setTimeLeft(90);
    setShowAnswer(false);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      resetQuestion();
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      resetQuestion();
    }
  };

  // Grouped questions for browse mode
  const groupedQuestions = useMemo(() => {
    if (viewMode !== 'browse') return {};
    return questions.reduce((acc: any, q) => {
      const key = q.subSkill || 'General';
      if (!acc[key]) acc[key] = [];
      acc[key].push(q);
      return acc;
    }, {});
  }, [questions, viewMode]);

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-700 font-rubik">
      {/* Header with View Toggle */}
      {showHeader && (
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-4xl font-[900] text-white italic tracking-tighter uppercase mb-2">
              INTERVIEW <span className="text-[#5ed29c]">LIBRARY.</span>
            </h2>
            <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.4em] italic">
              {viewMode === 'flashcard' ? 'Neural Assessment Protocol Active' : 'Data Repository Browsing Mode'}
            </p>
          </div>
          
          <div className="flex bg-[#0a0c10] border border-white/5 p-1 rounded-xl">
            <button 
              onClick={() => setViewMode('flashcard')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'flashcard' ? 'bg-[#5ed29c] text-black shadow-lg shadow-[#5ed29c]/20' : 'text-white/40 hover:text-white/60'}`}
            >
              <LayoutGrid size={14} /> Flashcards
            </button>
            <button 
              onClick={() => setViewMode('browse')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'browse' ? 'bg-[#5ed29c] text-black shadow-lg shadow-[#5ed29c]/20' : 'text-white/40 hover:text-white/60'}`}
            >
              <ListIcon size={14} /> Browse All
            </button>
          </div>
        </div>
      )}

      {/* Search and Filter Row */}
      {showFilters && (
        <div className="flex flex-col xl:flex-row gap-6 items-center justify-between">
        <div className="relative w-full xl:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#5ed29c] transition-colors" size={18} />
          <input 
            type="text"
            placeholder="SEARCH REPOSITORY..."
            value={searchQuery}
            onChange={(e) => {setSearchQuery(e.target.value); setCurrentQuestionIndex(0);}}
            className="w-full bg-[#0a0c10] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-[11px] font-[900] text-white placeholder:text-white/10 focus:outline-none focus:border-[#5ed29c]/30 transition-all uppercase italic tracking-widest"
          />
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
          {/* Custom Dropdown */}
          <div className="relative w-full sm:w-80">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              disabled={categories.length === 0}
              className={`w-full flex items-center justify-between gap-3 px-5 py-4 bg-[#0a0c10] border rounded-2xl text-[11px] font-[900] text-white uppercase tracking-widest italic transition-all ${categories.length === 0 ? 'opacity-50 cursor-not-allowed border-white/5' : 'group hover:border-[#5ed29c]/30 border-white/5'}`}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <Filter size={14} className="text-[#5ed29c]/60 shrink-0" />
                <span className="truncate">
                  {selectedCategory === 'ALL' ? 'ALL REPOSITORIES' : selectedCategory ? `${selectedCategory} / ${selectedSubSkill}` : 'SELECT DOMAIN'}
                </span>
              </div>
              <ChevronDown size={14} className={`text-white/20 shrink-0 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute z-[100] mt-2 w-full bg-black border border-[#5ed29c]/20 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
                >
                  <div className="max-h-[400px] overflow-y-auto py-2">
                    {categories.length === 0 ? (
                      <div className="px-8 py-4 text-[10px] text-white/30 italic">No categories available.</div>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setSelectedCategory('ALL');
                            setSelectedSubSkill('');
                            setCurrentQuestionIndex(0);
                            resetQuestion();
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full px-8 py-3 text-left text-[10px] font-[900] uppercase tracking-widest italic transition-all hover:bg-[#5ed29c]/10 ${selectedCategory === 'ALL' ? 'text-[#5ed29c] bg-[#5ed29c]/5' : 'text-white/40'}`}
                        >
                          ALL REPOSITORIES ({totalQuestionsCount}+ ITEMS)
                        </button>

                        {categories.map(cat => (
                          <div key={cat.category} className="mb-2">
                          <div className="px-6 py-2 text-[8px] font-black text-[#5ed29c]/40 uppercase tracking-[0.3em] bg-white/[0.02]">
                            {cat.category}
                          </div>
                          {cat.subSkills.map(skill => (
                            <button
                              key={skill}
                              onClick={() => {
                                setSelectedCategory(cat.category);
                                setSelectedSubSkill(skill);
                                setCurrentQuestionIndex(0);
                                resetQuestion();
                                setIsDropdownOpen(false);
                              }}
                              className={`w-full px-8 py-3 text-left text-[10px] font-[900] uppercase tracking-widest italic transition-colors hover:bg-[#5ed29c]/10 ${selectedSubSkill === skill && selectedCategory === cat.category ? 'text-[#5ed29c] bg-[#5ed29c]/5' : 'text-white/40'}`}
                            >
                              {skill}
                            </button>
                          ))}
                        </div>
                      ))}
                    </>
                  )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div className="flex gap-2">
            {['Beginner', 'Intermediate', 'Advanced'].map(lvl => (
              <button 
                key={lvl}
                onClick={() => {
                  setSelectedLevel(selectedLevel === lvl ? null : lvl);
                  setCurrentQuestionIndex(0);
                }}
                className={`px-5 py-3 rounded-xl border text-[9px] font-[900] uppercase tracking-widest italic transition-all ${selectedLevel === lvl ? 'bg-[#5ed29c] border-[#5ed29c] text-black shadow-lg shadow-[#5ed29c]/20' : 'bg-[#0a0c10] border-white/5 text-white/20 hover:border-white/20'}`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>
      </div>
      )}

      {/* Content Area */}
      <div className="min-h-[500px]">
        {loading && questions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-6">
            <div className="relative w-16 h-16">
              <motion.div 
                className="absolute inset-0 border-t-2 border-r-2 border-[#5ed29c] rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <motion.div 
                className="absolute inset-2 border-b-2 border-l-2 border-[#5ed29c]/30 rounded-full"
                animate={{ rotate: -360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              />
            </div>
            <p className="text-[#5ed29c] text-[10px] font-black uppercase tracking-[0.3em] animate-pulse italic">
              Synchronizing with neural net...
            </p>
          </div>
        ) : error && questions.length === 0 ? (
          <div className="p-12 text-center border border-white/5 bg-black rounded-[32px] flex flex-col items-center justify-center min-h-[400px]">
            <AlertCircle className="mb-6 text-red-500/50" size={48} />
            <h3 className="text-xl font-[900] text-white mb-2 uppercase tracking-widest italic">Connection Error</h3>
            <p className="text-white/30 mb-8 italic text-sm">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-8 py-3 bg-red-500/20 text-red-500 border border-red-500/30 font-[900] text-[10px] uppercase tracking-widest rounded-xl hover:bg-red-500/30 transition-all italic"
            >
              Retry Connection
            </button>
          </div>
        ) : questions.length === 0 ? (
          <div className="p-12 text-center border border-white/5 bg-black rounded-[40px]">
            <AlertCircle className="mx-auto mb-6 text-[#5ed29c]/20" size={48} />
            <h3 className="text-xl font-[900] text-white mb-2 uppercase tracking-widest italic">No Questions Found</h3>
            <p className="text-white/30 mb-8 italic">Data stream returned zero results for this configuration.</p>
            <button 
              onClick={() => {setSearchQuery(''); setSelectedLevel(null); setSelectedCategory(categories[0]?.category || '');}}
              className="px-8 py-3 bg-[#5ed29c] text-black font-[900] text-[10px] uppercase tracking-widest rounded-xl hover:scale-105 transition-transform italic"
            >
              Reset Stream
            </button>
          </div>
        ) : viewMode === 'flashcard' ? (
          /* Flashcard View */
          <div className="relative p-8 md:p-14 bg-black border border-[#5ed29c]/20 rounded-[40px] shadow-[0_0_60px_rgba(0,0,0,0.8)] overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#5ed29c]/30 to-transparent" />
            
            <div className="relative z-10 flex flex-col lg:flex-row gap-12 items-start">
              {/* Left Column: Stats */}
              <div className="flex flex-col items-center gap-8 w-full lg:w-40 shrink-0">
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/5" />
                    <motion.circle 
                      cx="50" cy="50" r="45" fill="none" stroke="#5ed29c" strokeWidth="2" strokeDasharray="282.7"
                      initial={{ strokeDashoffset: 0 }}
                      animate={{ strokeDashoffset: 282.7 - (282.7 * timeLeft) / 90 }}
                      className="drop-shadow-[0_0_8px_rgba(94,210,156,0.5)]"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-2xl font-black text-white italic">{timeLeft}s</span>
                    <span className="text-[8px] text-white/20 font-black uppercase tracking-widest italic">Time Left</span>
                  </div>
                </div>

                <div className="w-full space-y-4">
                  <div className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl text-center">
                    <div className="text-[10px] text-white/20 font-black uppercase tracking-widest mb-1 italic">Index</div>
                    <div className="text-lg font-black text-white italic">{currentQuestionIndex + 1}<span className="text-white/20 text-xs">/{questions.length}</span></div>
                  </div>
                  <div className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl text-center">
                    <div className="text-[10px] text-white/20 font-black uppercase tracking-widest mb-1 italic">Difficulty</div>
                    <div className="text-[10px] font-black text-[#5ed29c] uppercase tracking-widest italic">{currentQuestion?.difficulty}</div>
                  </div>
                </div>
              </div>

              {/* Right Column: Question Content */}
              <div className="flex-1 space-y-8 min-h-[400px] flex flex-col">
                <div className="flex items-center gap-3">
                  <Sparkles size={16} className="text-[#5ed29c]" />
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] italic">{selectedSubSkill}</span>
                </div>

                <div className="flex-1">
                  <h4 className="text-2xl md:text-3xl font-black text-white italic leading-tight mb-8">
                    {currentQuestion?.question}
                  </h4>

                  <AnimatePresence mode="wait">
                    {showAnswer ? (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                        className="p-8 bg-white/[0.02] border border-[#5ed29c]/20 rounded-3xl"
                      >
                        <div className="flex items-center gap-2 mb-4">
                          <Eye size={14} className="text-[#5ed29c]" />
                          <span className="text-[10px] font-black text-[#5ed29c] uppercase tracking-widest italic">Neural Resolution</span>
                        </div>
                        <p className="text-lg text-white/70 leading-relaxed italic">{currentQuestion?.answer}</p>
                      </motion.div>
                    ) : (
                      <motion.button 
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={() => setShowAnswer(true)}
                        className="w-full py-12 border-2 border-dashed border-white/5 rounded-3xl group flex flex-col items-center justify-center gap-4 transition-colors hover:border-[#5ed29c]/20"
                      >
                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#5ed29c]/10 transition-colors">
                          <EyeOff size={20} className="text-white/20 group-hover:text-[#5ed29c] transition-colors" />
                        </div>
                        <span className="text-[10px] font-black text-white/20 uppercase tracking-widest italic group-hover:text-white/40">Initialize Resolution Stream</span>
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between pt-8 border-t border-white/5">
                  <div className="flex gap-4">
                    <button onClick={prevQuestion} disabled={currentQuestionIndex === 0} className="p-4 bg-white/5 rounded-2xl text-white/40 hover:text-[#5ed29c] hover:bg-[#5ed29c]/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all">
                      <ChevronLeft size={20} />
                    </button>
                    <button onClick={nextQuestion} disabled={currentQuestionIndex === questions.length - 1} className="p-4 bg-white/5 rounded-2xl text-white/40 hover:text-[#5ed29c] hover:bg-[#5ed29c]/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all">
                      <ChevronRight size={20} />
                    </button>
                  </div>

                  <button 
                    onClick={() => {setQuestions([]); fetchQuestions();}}
                    className="flex items-center gap-2 text-[10px] font-black text-white/20 uppercase tracking-widest italic hover:text-[#5ed29c] transition-colors"
                  >
                    <Trophy size={14} /> Mark as Complete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Browse All Mode */
          <div className="space-y-12">
            {Object.entries(groupedQuestions).map(([skill, skillQuestions]: [string, any]) => (
              <div key={skill} className="space-y-6">
                <div className="flex items-center gap-4">
                  <h3 className="text-xl font-black text-white italic uppercase tracking-widest">{skill}</h3>
                  <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                  <span className="text-[10px] font-black text-[#5ed29c] bg-[#5ed29c]/10 px-3 py-1 rounded-full uppercase tracking-widest italic">
                    {skillQuestions.length} Items
                  </span>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  {skillQuestions.map((q: InterviewQuestion, idx: number) => (
                    <motion.div 
                      key={q._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="group p-6 bg-[#0a0c10] border border-white/5 rounded-2xl hover:border-[#5ed29c]/20 transition-all"
                    >
                      <div className="flex justify-between items-start gap-4 mb-4">
                        <h4 className="text-lg font-black text-white italic group-hover:text-[#5ed29c] transition-colors">
                          {q.question}
                        </h4>
                        <span className={`shrink-0 text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded border ${q.difficulty === 'advanced' || q.difficulty === 'hard' ? 'text-red-400 border-red-400/20' : q.difficulty === 'intermediate' || q.difficulty === 'medium' ? 'text-yellow-400 border-yellow-400/20' : 'text-blue-400 border-blue-400/20'}`}>
                          {q.difficulty}
                        </span>
                      </div>
                      <div className="p-4 bg-white/[0.02] rounded-xl border border-white/5">
                        <p className="text-sm text-white/40 italic leading-relaxed">{q.answer}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
