/**
 * PrepzoAIMentor Component
 * Global floating AI mentor for resume guidance and career advice
 * Available everywhere in the platform for authenticated users
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Loader2, Bot, User, X, Minimize2, Maximize2,
  FileText, Target, Lightbulb, Sparkles, CheckCircle2,
  RefreshCw, MessageCircle, Award, BookOpen
} from 'lucide-react';
import { chatWithMentor, getMentorSessions, getSessionHistory, MentorResource } from '@/api/mentor';
import { useAuthStore } from '@/store/authStore';
import { useAppStore } from '@/store/appStore';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  resources?: MentorResource[];
  intent?: string;
}

// Quick action suggestions for resume
const quickActions = [
  { icon: FileText, label: 'Improve ATS score', prompt: 'How can I improve my resume ATS score?' },
  { icon: Award, label: 'Add impact', prompt: 'How do I add quantifiable impact to my experience?' },
  { icon: Target, label: 'Target role', prompt: 'How should I tailor my resume for my target role?' },
  { icon: BookOpen, label: 'Skill gaps', prompt: 'What skills should I add to strengthen my resume?' },
  { icon: Lightbulb, label: 'Summary tips', prompt: 'Help me write a compelling professional summary' },
  { icon: CheckCircle2, label: 'Quick review', prompt: 'Give me a quick checklist to review my resume' },
];

export function PrepzoAIMentor() {
  const { user, isAuthenticated } = useAuthStore();
  const { resumeAnalysis } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [dailyTip, setDailyTip] = useState<string | null>(null);
  const [showTipBubble, setShowTipBubble] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get daily tip on mount (only when authenticated)
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const fetchTip = async () => {
      try {
        const response = await getQuickTip('general');
        if (response.success) {
          setDailyTip(response.data.tip);
          // Show tip bubble after 3 seconds
          setTimeout(() => setShowTipBubble(true), 3000);
          // Hide tip bubble after 10 seconds
          setTimeout(() => setShowTipBubble(false), 13000);
        }
      } catch {
        // Silent fail - tip is not critical
      }
    };
    fetchTip();
  }, [isAuthenticated]);

  // Don't render if not authenticated
  if (!isAuthenticated) return null;

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Add initial greeting when opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const firstName = user?.fullName ? user.fullName.split(' ')[0] : '';
      const hasAnalysis = resumeAnalysis !== null;
      const score = resumeAnalysis?.overallScore;
      
      let greeting = `Hi${firstName ? ' ' + firstName : ''}! 👋 I'm **Prepzo AI Mentor**, your personal resume and career guide.\n\n`;
      
      if (hasAnalysis && score !== undefined) {
        greeting += `I see your current ATS score is **${score}%**. `;
        if (score < 60) {
          greeting += `Let's work together to boost that score!\n\n`;
        } else if (score < 80) {
          greeting += `Good progress! Let's make it even better.\n\n`;
        } else {
          greeting += `Excellent work! Let's fine-tune the details.\n\n`;
        }
      }
      
      greeting += `I can help you with:\n\n`;
      greeting += `• **Mock Interviews** - Practice with real-time feedback\n`;
      greeting += `• **Technical Concepts** - Clear explanations of DSA, OOPS, and more\n`;
      greeting += `• **Career Roadmap** - Tailored advice for your target role\n`;
      greeting += `• **Resume & Profile** - Data-driven optimization tips\n\n`;
      greeting += `Ask me anything! "How do I implement a Trie?" or "Mock interview for Java".`;

      const greetingMessage: Message = {
        id: 'greeting',
        role: 'assistant',
        content: greeting,
        timestamp: new Date(),
      };
      setMessages([greetingMessage]);
    }
  }, [isOpen, user?.fullName, resumeAnalysis]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: content.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setShowQuickActions(false);
    setIsLoading(true);

    try {
      const response = await chatWithMentor(
        content.trim(), 
        sessionId,
        {
          targetRole: user?.targetRole,
          currentSkills: user?.knownTechnologies
        }
      );

      if (response.status === 'warming_up') {
        const warmingMsg: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: response.message,
          timestamp: new Date(),
          suggestions: response.suggestions
        };
        setMessages(prev => [...prev, warmingMsg]);
        return;
      }

      if (response.success) {
        const aiMsg: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: response.message,
          timestamp: new Date(),
          intent: response.intent,
          resources: response.resources,
          suggestions: response.suggestions
        };
        setMessages(prev => [...prev, aiMsg]);
        if (response.sessionId) setSessionId(response.sessionId);
      }
    } catch (error) {
      console.error('Mentor chat error:', error);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: "I'm having a slight technical hiccup. Please try again in a second!",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputValue);
    }
  };

  const handleQuickAction = (prompt: string) => {
    handleSendMessage(prompt);
  };

  const handleRelatedTopic = (topic: string) => {
    handleSendMessage(`Tell me more about ${topic}`);
  };

  const resetChat = () => {
    setMessages([]);
    setSessionId(undefined);
    setShowQuickActions(true);
  };

  const toggleOpen = () => {
    setIsOpen(!isOpen);
    setShowTipBubble(false);
  };

  return (
    <>
      {/* Floating Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: 'spring' }}
      >
        {/* Tip Bubble */}
        <AnimatePresence>
          {showTipBubble && dailyTip && !isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              className="absolute bottom-16 right-0 w-64 p-3 bg-gradient-to-br from-purple-600/90 to-indigo-600/90 
                         backdrop-blur-lg rounded-lg shadow-xl border border-white/20"
            >
              <button
                onClick={() => setShowTipBubble(false)}
                className="absolute top-1 right-1 p-1 text-white/60 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-yellow-300 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-white/90 mb-1">Quick Tip</p>
                  <p className="text-xs text-white/80">{dailyTip}</p>
                </div>
              </div>
              <div className="absolute -bottom-2 right-6 w-4 h-4 bg-indigo-600/90 transform rotate-45 border-r border-b border-white/20" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Button */}
        <motion.button
          onClick={toggleOpen}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`
            w-14 h-14 rounded-full shadow-lg flex items-center justify-center
            bg-gradient-to-br from-purple-600 to-indigo-600 text-white
            border border-white/20 hover:border-white/40 transition-all
            ${isOpen ? 'ring-2 ring-purple-400 ring-offset-2 ring-offset-slate-900' : ''}
          `}
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
              >
                <X className="w-6 h-6" />
              </motion.div>
            ) : (
              <motion.div
                key="open"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="relative"
              >
                <MessageCircle className="w-6 h-6" />
                <Sparkles className="w-3 h-3 absolute -top-1 -right-1 text-yellow-300" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </motion.div>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25 }}
            className={`
              fixed z-50 bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl
              border border-white/10 overflow-hidden
              ${isExpanded 
                ? 'bottom-4 right-4 left-4 top-4 md:left-auto md:w-[600px] md:h-[80vh]' 
                : 'bottom-24 right-6 w-[380px] h-[500px]'
              }
            `}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-gradient-to-r from-purple-600/20 to-indigo-600/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Prepzo AI Mentor</h3>
                  <p className="text-xs text-white/60">Your personal resume guide</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={resetChat}
                  className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  title="Reset chat"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  title={isExpanded ? 'Minimize' : 'Expand'}
                >
                  {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ height: 'calc(100% - 140px)' }}>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`
                    w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center
                    ${message.role === 'user' 
                      ? 'bg-gradient-to-br from-cyan-500 to-blue-500' 
                      : 'bg-gradient-to-br from-purple-500 to-indigo-500'
                    }
                  `}>
                    {message.role === 'user' ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <Bot className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div className={`
                    max-w-[80%] rounded-2xl px-4 py-3
                    ${message.role === 'user'
                      ? 'bg-gradient-to-br from-cyan-600/80 to-blue-600/80 text-white'
                      : 'bg-white/10 text-white/90'
                    }
                  `}>
                    <div className="prose prose-sm prose-invert max-w-none whitespace-pre-wrap">
                      {message.content.split('\n').map((line, i) => {
                        const cleanLine = line.replace(/^#{1,6}\s+/, '');
                        return (
                        <p key={i} className="mb-1 last:mb-0 text-sm leading-relaxed">
                          {cleanLine.replace(/\*\*(.*?)\*\*/g, (_, text) => `<strong>${text}</strong>`).split('<strong>').map((part, j) => {
                            if (part.includes('</strong>')) {
                              const [bold, rest] = part.split('</strong>');
                              return <span key={j}><strong className="text-white">{bold}</strong>{rest}</span>;
                            }
                            return part;
                          })}
                        </p>
                        );
                      })}
                    </div>
                    
                    {/* Resources */}
                    {message.resources && message.resources.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-white/10">
                        <p className="text-xs font-medium text-white/70 mb-2">Recommended Resources:</p>
                        <div className="space-y-2">
                          {message.resources.map((res, i) => (
                            <a
                              key={i}
                              href={res.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 p-2 rounded bg-white/5 hover:bg-white/10 transition-colors text-xs text-indigo-400"
                            >
                              <BookOpen className="w-3 h-3" />
                              <span className="flex-1 truncate">{res.title}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Suggestions */}
                    {message.suggestions && message.suggestions.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {message.suggestions.map((suggestion, i) => (
                          <button
                            key={i}
                            onClick={() => handleSendMessage(suggestion)}
                            className="px-2 py-1 text-xs bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 rounded-full text-indigo-300 transition-colors"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Loading indicator */}
              {isLoading && (
                <div className="flex items-center gap-2 text-purple-400 font-medium animate-pulse ml-14">
                  <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                  Thinking...
                </div>
              )}

              {/* Quick Actions */}
              {showQuickActions && messages.length <= 1 && (
                <div className="mt-4">
                  <p className="text-xs text-white/50 mb-3">Quick actions:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {quickActions.map((action, i) => (
                      <button
                        key={i}
                        onClick={() => handleQuickAction(action.prompt)}
                        className="flex items-center gap-2 p-2.5 bg-white/5 hover:bg-white/10 
                                 rounded-lg text-left transition-colors group"
                      >
                        <action.icon className="w-4 h-4 text-purple-400 group-hover:text-purple-300" />
                        <span className="text-xs text-white/70 group-hover:text-white/90">{action.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/10 bg-slate-900/50">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about your resume..."
                  className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl
                           text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50
                           focus:ring-2 focus:ring-purple-500/20 text-sm"
                  disabled={isLoading}
                />
                <button
                  onClick={() => handleSendMessage(inputValue)}
                  disabled={!inputValue.trim() || isLoading}
                  className="p-2.5 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl
                           text-white disabled:opacity-50 disabled:cursor-not-allowed
                           hover:from-purple-500 hover:to-indigo-500 transition-all"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default PrepzoAIMentor;
