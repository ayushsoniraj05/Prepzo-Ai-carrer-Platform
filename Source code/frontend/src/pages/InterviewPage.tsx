import React, { useState, useEffect } from 'react';
import { ArrowRight, ArrowLeft, Layout, Server, Layers, Database, Cloud, Briefcase, Zap, Cpu } from 'lucide-react';
import { GridBeam } from '../components/ui/background-grid-beam';
import { InterviewSession } from '../components/interview/InterviewSession';
import { getCategories, getQuestions } from '@/api/questionBank';

const ICON_MAP: Record<string, any> = {
  'Computer Science & IT': Server,
  'Technical Skills': Database,
  'Management & Business': Briefcase,
  'Mechanical & Civil': Layout,
  'Electronics & Electrical': Zap,
  'Field Specific': Cpu,
  'Non-Technical Skills': Layers,
  'Cross-Functional Skills': Cloud,
  'Default': Briefcase
};

export const InterviewPage: React.FC = () => {
  const [isStarted, setIsStarted] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [sessionQuestions, setSessionQuestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [launching, setLaunching] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes for mock session

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const { data } = await getCategories();
        setCategories(data);
      } catch (err) {
        console.error('Failed to load categories:', err);
      } finally {
        setLoading(false);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    let timer: any;
    if (isStarted && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isStarted, timeLeft]);

  return (
    <div className="relative min-h-screen w-full bg-[#0a0c10] overflow-hidden selection:bg-[#5ed29c] selection:text-[#0a0c10]">
      <div className="absolute inset-0 z-0">
        <GridBeam className="absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0c10]/50 to-[#0a0c10] pointer-events-none" />
      </div>

      <div className="relative z-10 p-6 md:p-12 max-w-7xl mx-auto space-y-12 font-rubik">
        {/* Navigation */}
        <button 
          onClick={() => window.location.hash = 'dashboard'}
          className="group flex items-center gap-3 text-white/20 hover:text-[#5ed29c] transition-all font-black uppercase tracking-[0.4em] text-[10px]"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Exit Environment
        </button>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
          <div className="space-y-6">
             <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-[#5ed29c] animate-pulse" />
                <span className="text-[10px] font-black text-[#5ed29c] uppercase tracking-[0.5em] italic">Stage 3 Verification</span>
             </div>
             <h1 className="text-5xl md:text-8xl font-[900] text-white uppercase tracking-tighter leading-[0.8] italic">
               AI Mock<br/>
               <span className="text-white/20">Interview.</span>
             </h1>
          </div>
          
          <div className="flex gap-4">
             <div className="px-8 py-6 rounded-[32px] bg-[#0a0c10] border border-white/5 backdrop-blur-3xl shadow-2xl">
                <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] mb-2 text-center">Session Clock</p>
                <p className="text-4xl font-[900] text-white tracking-tighter italic">
                  {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                </p>
             </div>
          </div>
        </div>

        {/* Content */}
        <div className="relative">
          {!isStarted ? (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
              <div className="text-center space-y-4">
                <h2 className="text-3xl md:text-5xl font-[900] text-white uppercase tracking-tighter italic">Select Your Domain</h2>
                <p className="text-white/40 font-medium tracking-tight uppercase text-xs tracking-[0.3em]">Choose a specialization to start your simulated interview environment</p>
              </div>

              {loading ? (
                <div className="flex justify-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#5ed29c]" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categories.map((cat) => {
                    const Icon = ICON_MAP[cat.category] || ICON_MAP['Default'];
                    const isSelected = selectedCategory?.category === cat.category;
                    
                    return (
                      <div 
                        key={cat.category}
                        onClick={() => setSelectedCategory(cat)}
                        className={`
                          group relative p-8 rounded-[40px] border transition-all duration-500 cursor-pointer overflow-hidden
                          ${isSelected ? 'bg-[#5ed29c] border-[#5ed29c] shadow-[0_0_50px_rgba(94,210,156,0.2)]' : 'bg-[#0a0c10]/40 border-white/5 hover:border-[#5ed29c]/50 hover:bg-[#0a0c10]/60'}
                        `}
                      >
                        <div className="relative z-10 flex flex-col h-full gap-6">
                          <div className={`
                            w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500
                            ${isSelected ? 'bg-[#0a0c10] text-[#5ed29c]' : 'bg-[#5ed29c]/10 text-[#5ed29c] group-hover:scale-110'}
                          `}>
                            <Icon size={32} />
                          </div>

                          <div className="space-y-2">
                            <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isSelected ? 'text-[#0a0c10]/60' : 'text-[#5ed29c]'}`}>
                              REPOSITORY
                            </span>
                            <h3 className={`text-2xl font-[900] uppercase italic tracking-tighter ${isSelected ? 'text-[#0a0c10]' : 'text-white'}`}>
                              {cat.category}
                            </h3>
                          </div>

                          <p className={`text-sm font-medium leading-relaxed ${isSelected ? 'text-[#0a0c10]/70' : 'text-white/40'}`}>
                            Focus on {cat.subSkills.slice(0, 3).join(', ')} and more.
                          </p>

                          <div className={`mt-auto pt-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] ${isSelected ? 'text-[#0a0c10]' : 'text-white/20'}`}>
                            {cat.subSkills.length} Sub-skills • AI Verified
                          </div>
                        </div>

                        {/* Geometric Decoration */}
                        <div className={`
                          absolute -right-10 -bottom-10 w-40 h-40 rounded-full blur-[80px] transition-opacity duration-700
                          ${isSelected ? 'bg-[#0a0c10]/20 opacity-100' : 'bg-[#5ed29c]/5 opacity-0 group-hover:opacity-100'}
                        `} />
                      </div>
                    );
                  })}
                </div>
              )}

              {selectedCategory && (
                <div className="flex justify-center pt-8">
                  <button 
                    disabled={launching}
                    onClick={async () => {
                      setLaunching(true);
                      try {
                        const questions = await getQuestions({ category: selectedCategory.category });
                        // Randomly pick 5 questions for the session
                        const shuffled = [...questions].sort(() => 0.5 - Math.random());
                        const selected = shuffled.slice(0, 5).map(q => q.question);
                        setSessionQuestions(selected);
                        setIsStarted(true);
                      } catch (err) {
                        console.error('Failed to launch session:', err);
                      } finally {
                        setLaunching(false);
                      }
                    }}
                    className="group/btn relative w-full md:w-[400px] h-[80px] active:scale-95 transition-all"
                  >
                    <svg className="absolute inset-0 w-full h-full drop-shadow-2xl transition-transform group-hover/btn:scale-[1.02]" viewBox="0 0 400 80" preserveAspectRatio="none" fill="none">
                       <path d="M0 0H400L385 80H15L0 0Z" fill="#5ed29c" />
                    </svg>
                    <span className="relative z-10 flex items-center justify-center h-full text-[#0a0c10] font-rubik font-[900] text-xl uppercase tracking-[0.2em] italic">
                       {launching ? 'Calibrating...' : <>Launch {selectedCategory.category} <ArrowRight className="ml-4 group-hover/btn:translate-x-2 transition-transform" /></>}
                    </span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="animate-in fade-in zoom-in duration-700">
              <InterviewSession 
                role={selectedCategory?.category} 
                preFedQuestions={sessionQuestions}
                onComplete={() => setIsStarted(false)} 
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InterviewPage;
