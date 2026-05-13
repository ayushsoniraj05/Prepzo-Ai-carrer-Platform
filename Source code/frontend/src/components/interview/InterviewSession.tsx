import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Bot, Mic, MicOff, Send, CheckCircle, AlertCircle, Loader2, Clock } from 'lucide-react';
import { useSpeech } from '@/hooks/useSpeech';
import { showError } from '@/utils/toastManager';
import api from '@/api/axios';

interface InterviewSessionProps {
  onComplete: (results: any) => void;
  role?: string;
  preFedQuestions?: string[];
}

export const InterviewSession: React.FC<InterviewSessionProps> = ({ onComplete, role, preFedQuestions }) => {
  const { speak, startListening, stopListening, isListening, transcript, isSpeaking } = useSpeech();
  
  const [questions, setQuestions] = useState<string[]>(preFedQuestions || []);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(preFedQuestions?.[0] || '');
  const [isSessionLoading, setIsSessionLoading] = useState(!preFedQuestions);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [answers, setAnswers] = useState<Array<{ question: string, answer: string, feedback: any }>>([]);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [timeLeft, setTimeLeft] = useState(90); // Max 90s per answer

  const silenceTimerRef = useRef<any>(null);
  const answerTimerRef = useRef<any>(null);
  const timeLeftIntervalRef = useRef<any>(null);

  const apiBase = '/interview';

  const clearTimers = useCallback(() => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (answerTimerRef.current) clearTimeout(answerTimerRef.current);
    if (timeLeftIntervalRef.current) clearInterval(timeLeftIntervalRef.current);
    silenceTimerRef.current = null;
    answerTimerRef.current = null;
    timeLeftIntervalRef.current = null;
  }, []);

  const handleNext = useCallback(async (autoSubmitAnswer?: string) => {
    const finalAnswer = autoSubmitAnswer !== undefined ? autoSubmitAnswer : transcript;

    // Only block if manually clicking and no answer
    if (autoSubmitAnswer === undefined && !finalAnswer && !isListening) {
      showError('Please provide an answer first.');
      return;
    }

    if (isListening) stopListening();
    clearTimers();

    setIsSubmitting(true);
    try {
      const res = await api.post(`${apiBase}/submit`, {
        questions,
        questionIndex: currentQuestionIndex,
        answer: finalAnswer || "No response provided."
      });

      if (res.data.success) {
        const evaluation = res.data.data;
        const newAnswers = [...answers, { question: currentQuestion, answer: finalAnswer || "No response.", feedback: evaluation }];
        setAnswers(newAnswers);
        
        if (evaluation.is_complete) {
          setSessionComplete(true);
          onComplete(newAnswers);
        } else {
          const nextQ = evaluation.nextQuestion;
          setCurrentQuestion(nextQ);
          setCurrentQuestionIndex(prev => prev + 1);
          
          speak(nextQ, () => {
            startListening();
          });
        }
      }
    } catch (error) {
      showError('Failed to submit answer.');
    } finally {
      setIsSubmitting(false);
    }
  }, [transcript, isListening, questions, currentQuestionIndex, currentQuestion, answers, onComplete, speak, startListening, stopListening, clearTimers]);

  // Silence and Answer Limit Logic
  useEffect(() => {
    if (isListening && !isSubmitting) {
      setTimeLeft(90);
      
      // 10s silence detection (if transcript stays empty)
      silenceTimerRef.current = setTimeout(() => {
        if (!transcript) {
          handleNext(""); // Move forward with empty answer
        }
      }, 10000);

      // 90s max answer duration
      answerTimerRef.current = setTimeout(() => {
        handleNext(); // Move forward with whatever transcript is present
      }, 90000);

      timeLeftIntervalRef.current = setInterval(() => {
        setTimeLeft(prev => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearTimers();
  }, [isListening, isSubmitting, handleNext, clearTimers, transcript]);

  // Reset silence timer when user starts speaking
  useEffect(() => {
    if (transcript && silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, [transcript]);

  const fetchQuestions = useCallback(async () => {
    if (preFedQuestions && preFedQuestions.length > 0) {
      setQuestions(preFedQuestions);
      setCurrentQuestion(preFedQuestions[0]);
      setCurrentQuestionIndex(0);
      setIsSessionLoading(false);
      
      setTimeout(() => {
        speak(preFedQuestions[0], () => {
          startListening();
        });
      }, 1000);
      return;
    }

    try {
      setIsSessionLoading(true);
      const res = await api.post(`${apiBase}/start`);
      if (res.data.success) {
        const qList = res.data.data.questions;
        const firstQ = res.data.data.currentQuestion;
        setQuestions(qList);
        setCurrentQuestion(firstQ);
        setCurrentQuestionIndex(0);
        
        setTimeout(() => {
          speak(firstQ, () => {
            startListening();
          });
        }, 500);
      }
    } catch (error: any) {
      showError(error.response?.data?.message || 'Failed to start session.');
    } finally {
      setIsSessionLoading(false);
    }
  }, [speak, startListening, preFedQuestions]);

  useEffect(() => {
    fetchQuestions();
  }, []);

  if (isSessionLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-6">
        <Loader2 className="w-12 h-12 text-[#5ed29c] animate-spin" />
        <p className="text-white/40 font-black uppercase tracking-[0.3em] text-xs">Initializing {role || 'AI'} Mock Environment...</p>
      </div>
    );
  }

  if (sessionComplete) {
    return (
      <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-20">
        <div className="text-center">
          <div className="w-24 h-24 bg-[#5ed29c]/10 rounded-[32px] flex items-center justify-center mx-auto mb-8 border border-[#5ed29c]/20 shadow-[0_0_50px_rgba(94,210,156,0.15)]">
            <CheckCircle className="w-12 h-12 text-[#5ed29c]" />
          </div>
          <h2 className="text-5xl font-[900] text-white uppercase tracking-tighter italic mb-4 leading-none">Interview <span className="text-white/20">Complete.</span></h2>
          <p className="text-[#5ed29c] font-black uppercase tracking-[0.4em] text-[10px] italic">Session signals synthesized successfully.</p>
        </div>

        <div className="grid gap-8">
          {answers.map((item, i) => (
            <div key={i} className="p-10 rounded-[48px] border border-white/5 bg-[#0a0c10] shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                 <Bot size={120} />
              </div>
              <div className="flex flex-col md:flex-row items-start gap-8 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-[#5ed29c] font-black italic">
                  {i + 1}
                </div>
                <div className="space-y-6 flex-1">
                  <p className="text-xl text-white font-[900] tracking-tight italic leading-tight">{item.question}</p>
                  
                  <div className="p-6 rounded-[32px] bg-black/40 border border-white/5 italic">
                    <p className="text-[10px] font-black text-[#5ed29c] uppercase tracking-widest mb-3">Your Response Signal</p>
                    <p className="text-white/60 text-lg leading-relaxed">"{item.answer}"</p>
                  </div>

                  <div className="p-6 rounded-[32px] bg-[#5ed29c]/5 border border-[#5ed29c]/10 italic">
                    <p className="text-[10px] font-black text-[#5ed29c] uppercase tracking-widest mb-3">AI Recommendation (Ideal Answer)</p>
                    <p className="text-white/60 text-lg leading-relaxed">{item.feedback.perfectAnswer}</p>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-white/5">
                    <div className="flex items-center gap-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-[#5ed29c]" />
                       <p className="text-[10px] font-black text-[#5ed29c] uppercase tracking-widest">AI Feedback & Insights</p>
                    </div>
                    <p className="text-sm text-white/50 leading-relaxed font-bold italic">
                      {item.feedback.feedback}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                   <div className="text-6xl font-[900] text-[#5ed29c] tracking-tighter italic leading-none">{item.feedback.score}<span className="text-lg opacity-20 ml-1">/10</span></div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <button 
          onClick={() => window.location.hash = 'dashboard'}
          className="group/btn relative w-full h-[70px] active:scale-95 transition-all mt-10"
        >
          <svg className="absolute inset-0 w-full h-full drop-shadow-xl" viewBox="0 0 800 70" preserveAspectRatio="none" fill="none">
             <path d="M0 0H800L785 70H15L0 0Z" fill="#0a0c10" stroke="rgba(94, 210, 156, 0.3)" strokeWidth="1" />
          </svg>
          <span className="relative z-10 flex items-center justify-center h-full text-[#5ed29c] font-rubik font-[900] text-sm uppercase tracking-[0.4em] italic group-hover/btn:tracking-[0.5em] transition-all">
             Return to Cockpit
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Progress & Timer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
           <p className="text-[11px] font-black text-white/20 uppercase tracking-[0.5em] italic">Signal {currentQuestionIndex + 1} <span className="opacity-40">OF</span> {questions.length}</p>
           <div className="flex gap-2">
             {questions.map((_, i) => (
               <div key={i} className={`h-1 w-10 rounded-full transition-all duration-700 ${i <= currentQuestionIndex ? 'bg-[#5ed29c]' : 'bg-white/5'}`} />
             ))}
           </div>
        </div>
        
        <div className="flex items-center gap-6">
           {isListening && (
             <div className="flex items-center gap-3 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full">
                <Clock size={14} className="text-red-500" />
                <span className="text-[10px] font-black text-red-500 uppercase tracking-widest italic">{timeLeft}s remaining</span>
             </div>
           )}
           <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-blue-500 animate-pulse' : 'bg-white/10'}`} />
              <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] italic">{isSpeaking ? 'AI Output Active' : 'AI Standby'}</span>
           </div>
        </div>
      </div>

      {/* AI Character Card */}
      <div className="p-12 md:p-16 rounded-[60px] border border-[#5ed29c]/20 bg-gradient-to-br from-[#13171d] to-black relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] rotate-12">
           <Bot size={280} className="text-[#5ed29c]" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
           <div className="relative">
              <div className={`w-40 h-40 rounded-[48px] border-4 ${isSpeaking ? 'border-blue-500/40 shadow-[0_0_50px_rgba(59,130,246,0.3)] scale-105' : 'border-[#5ed29c]/10'} flex items-center justify-center bg-black transition-all duration-700 overflow-hidden group`}>
                 <Bot size={80} className={`transition-all duration-500 ${isSpeaking ? 'text-blue-500' : 'text-[#5ed29c] opacity-40'}`} />
                 <div className="absolute inset-0 bg-gradient-to-t from-[#5ed29c]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              {isSpeaking && (
                <div className="absolute -inset-4 rounded-[56px] border border-blue-500/20 animate-ping opacity-10" />
              )}
           </div>
           
           <div className="flex-1 text-center md:text-left space-y-6">
              <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full w-fit mx-auto md:mx-0">
                 <span className="text-[9px] font-black text-white/30 uppercase tracking-widest italic">{role || 'AI'} Core Interface</span>
              </div>
              <h3 className="text-3xl md:text-5xl font-[900] text-white uppercase tracking-tighter italic leading-[1.1]">
                {currentQuestion}
              </h3>
           </div>
        </div>
      </div>

      {/* Input Section */}
      <div className="space-y-8">
        <div className="relative group">
           <textarea
             value={transcript}
             readOnly
             placeholder={isListening ? (transcript ? "Synthesizing your response signal..." : "Awaiting user voice signal (10s auto-skip)...") : "Awaiting user input signal..."}
             className={`w-full min-h-[240px] rounded-[48px] p-12 bg-[#0a0c10]/40 border ${isListening ? 'border-[#5ed29c] shadow-[0_0_40px_rgba(94,210,156,0.1)]' : 'border-white/5'} text-white/60 font-bold text-xl focus:outline-none transition-all duration-700 italic leading-relaxed backdrop-blur-xl`}
           />
           <div className="absolute top-8 right-12 flex gap-4">
              {isListening ? (
                <div className="flex items-center gap-3 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full animate-pulse">
                   <div className="w-2 h-2 rounded-full bg-red-500" />
                   <span className="text-[10px] font-black text-red-500 uppercase tracking-widest italic">Live Recording</span>
                </div>
              ) : (
                <div className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-full">
                   <span className="text-[10px] font-black text-white/20 uppercase tracking-widest italic">Buffer Empty</span>
                </div>
              )}
           </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
           <button
             onClick={isListening ? stopListening : startListening}
             disabled={isSubmitting || isSpeaking}
             className={`flex-1 h-[80px] rounded-[32px] flex items-center justify-center gap-4 font-[900] uppercase tracking-[0.2em] italic transition-all duration-500 ${isListening ? 'bg-red-500/10 border border-red-500/30 text-red-500 shadow-2xl shadow-red-500/10' : 'bg-white/5 border border-white/10 text-white/40 hover:bg-white/10 hover:text-white'}`}
           >
             {isListening ? <><MicOff size={24} /> Terminate Input</> : <><Mic size={24} /> Initiate Microphone</>}
           </button>
           
           <button
             onClick={() => handleNext()}
             disabled={isSubmitting || isListening || !transcript || isSpeaking}
             className="flex-[2] group/btn relative h-[80px] active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
           >
              <svg className="absolute inset-0 w-full h-full drop-shadow-2xl transition-transform group-hover/btn:scale-[1.01]" viewBox="0 0 600 80" preserveAspectRatio="none" fill="none">
                 <path d="M0 0H600L585 80H15L0 0Z" fill={isSubmitting ? "#0a0c10" : "#5ed29c"} />
              </svg>
              <span className={`relative z-10 flex items-center justify-center h-full font-rubik font-[900] text-lg uppercase tracking-[0.3em] italic ${isSubmitting ? 'text-white/40' : 'text-[#0a0c10]'}`}>
                 {isSubmitting ? (
                   <><Loader2 className="animate-spin mr-4" size={24} /> Syncing Response...</>
                 ) : (
                   <><Send size={24} className="mr-4" /> {currentQuestionIndex === questions.length - 1 ? 'Finalize Interview' : 'Transmit Response'}</>
                 )}
              </span>
           </button>
        </div>
      </div>
      
      {/* Platform Protocol */}
      <div className="flex items-center justify-center gap-12 opacity-10 group-hover:opacity-30 transition-all duration-700 pb-10">
         <div className="flex items-center gap-3"><AlertCircle size={16} /> <span className="text-[10px] font-black uppercase tracking-[0.3em] italic">Acoustic Clarity Required</span></div>
         <div className="flex items-center gap-3"><CheckCircle size={16} /> <span className="text-[10px] font-black uppercase tracking-[0.3em] italic">STAR Method Validation</span></div>
         <div className="flex items-center gap-3"><Bot size={16} /> <span className="text-[10px] font-black uppercase tracking-[0.3em] italic">AI Logic Evaluation Active</span></div>
      </div>
    </div>
  );
};
