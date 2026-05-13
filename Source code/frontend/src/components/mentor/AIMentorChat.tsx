/**
 * AIMentorChat Component
 * AI-powered career guidance chatbot for personalized mentoring
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Loader2, Bot, User, X, Minimize2, Maximize2,
  BookOpen, Code, Target, Lightbulb, ExternalLink, Sparkles,
  ArrowRight, RefreshCw
} from 'lucide-react';
import { GlassCard, GlassButton } from '@/components/ui/GlassCard';
import {
  chatWithMentor,
  getMentorStatus,
  MentorResource
} from '@/api/mentor';
import { useAuthStore } from '@/store/authStore';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  resources?: MentorResource[];
  suggestions?: string[];
  intent?: string;
}

interface AIMentorChatProps {
  isOpen: boolean;
  onClose: () => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  initialContext?: {
    targetRole?: string;
    currentSkills?: string[];
    learningGoals?: string[];
  };
}

// Quick action suggestions
const quickActions = [
  { icon: Target, label: 'Career guidance', prompt: 'What career path should I choose based on my skills?' },
  { icon: Code, label: 'DSA help', prompt: 'Help me understand data structures and algorithms better' },
  { icon: BookOpen, label: 'Learning resources', prompt: 'Suggest learning resources for my skill gaps' },
  { icon: Lightbulb, label: 'Interview tips', prompt: 'Give me tips for technical interviews' },
];

export function AIMentorChat({
  isOpen,
  onClose,
  isExpanded = false,
  onToggleExpand,
  initialContext
}: AIMentorChatProps) {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Check mentor availability on mount
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const status = await getMentorStatus();
        setIsAvailable(status.available);
      } catch {
        setIsAvailable(false);
      }
    };
    checkStatus();
  }, []);

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

  // Add initial greeting if no messages
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const firstName = user?.fullName ? user.fullName.split(' ')[0] : '';
      const greeting: Message = {
        id: 'greeting',
        role: 'assistant',
        content: `Hi${firstName ? ' ' + firstName : ''}! 👋 I'm your AI Career Mentor. I can help you with:

• **Career guidance** based on your skills and goals
• **Learning resources** tailored to your skill gaps
• **Interview preparation** tips and practice
• **Technical concepts** explanation and clarification

How can I assist you today?`,
        timestamp: new Date(),
        suggestions: [
          'What career path should I choose?',
          'Suggest learning resources for my weaknesses',
          'Help me prepare for technical interviews'
        ]
      };
      setMessages([greeting]);
    }
  }, [isOpen, user?.fullName]);

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
        sessionId || undefined,
        {
          targetRole: initialContext?.targetRole || user?.targetRole || 'Software Engineer',
          currentSkills: initialContext?.currentSkills || user?.knownTechnologies || [],
          learningGoals: initialContext?.learningGoals || []
        }
      );

      if (response.sessionId && !sessionId) {
        setSessionId(response.sessionId);
      }

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.message,
        timestamp: new Date(),
        resources: response.resources,
        suggestions: response.suggestions,
        intent: response.intent
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: "I apologize, but I'm having trouble connecting right now. Please try again in a moment, or feel free to explore the learning resources in your dashboard.",
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

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  const resetChat = () => {
    setMessages([]);
    setSessionId(null);
    setShowQuickActions(true);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        className={`fixed ${isExpanded ? 'inset-4' : 'bottom-4 right-4 w-96 h-[600px]'} z-50 flex flex-col`}
      >
        <GlassCard className="flex flex-col h-full p-0 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white">AI Career Mentor</h3>
                <p className="text-xs text-gray-400">
                  {isAvailable ? (
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                      Online
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-yellow-400">
                      <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                      Limited mode
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={resetChat}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
                title="New conversation"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              {onToggleExpand && (
                <button
                  onClick={onToggleExpand}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
                  title={isExpanded ? 'Minimize' : 'Expand'}
                >
                  {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Quick Actions */}
            {showQuickActions && messages.length <= 1 && (
              <div className="grid grid-cols-2 gap-2 mb-4">
                {quickActions.map((action, idx) => (
                  <motion.button
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    onClick={() => handleQuickAction(action.prompt)}
                    className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/50 hover:bg-purple-500/10 transition-all text-left group"
                  >
                    <action.icon className="w-5 h-5 text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
                    <p className="text-sm font-medium text-white">{action.label}</p>
                  </motion.button>
                ))}
              </div>
            )}

            {/* Messages */}
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                  message.role === 'user'
                    ? 'bg-gradient-to-br from-blue-500 to-purple-500'
                    : 'bg-gradient-to-br from-purple-500/30 to-blue-500/30 border border-purple-500/30'
                }`}>
                  {message.role === 'user' ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-purple-400" />
                  )}
                </div>
                <div className={`flex-1 ${message.role === 'user' ? 'text-right' : ''}`}>
                  <div className={`inline-block p-3 rounded-xl max-w-[85%] ${
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-blue-500/30 to-purple-500/30 text-white'
                      : 'bg-white/5 text-gray-200'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">
                      {message.content.replace(/^#{1,6}\s+/gm, '').split('**').map((part, i) => 
                        i % 2 === 0 ? part : <strong key={i}>{part}</strong>
                      )}
                    </p>
                    
                    {/* Resources */}
                    {message.resources && message.resources.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
                        <p className="text-xs text-purple-400 font-medium">📚 Recommended Resources:</p>
                        {message.resources.map((resource, idx) => (
                          <a
                            key={idx}
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group"
                          >
                            <BookOpen className="w-4 h-4 text-blue-400" />
                            <span className="text-xs flex-1 truncate">{resource.title}</span>
                            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Suggestions */}
                  {message.suggestions && message.suggestions.length > 0 && message.role === 'assistant' && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {message.suggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="text-xs px-3 py-1.5 rounded-full bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors flex items-center gap-1"
                        >
                          {suggestion}
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      ))}
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-500 mt-1">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </motion.div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/30 to-blue-500/30 border border-purple-500/30 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                </div>
                <div className="bg-white/5 rounded-xl p-3 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                  <span className="text-sm text-gray-400">Thinking...</span>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-white/10">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about your career..."
                className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500/50 text-sm"
                disabled={isLoading}
              />
              <GlassButton
                variant="primary"
                onClick={() => handleSendMessage(inputValue)}
                disabled={!inputValue.trim() || isLoading}
                className="px-4"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </GlassButton>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </AnimatePresence>
  );
}

// Floating trigger button for mentor chat
export function MentorChatTrigger({
  onClick,
  hasUnread = false
}: {
  onClick: () => void;
  hasUnread?: boolean;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 shadow-2xl shadow-purple-500/30 flex items-center justify-center z-40 group"
    >
      <Bot className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
      {hasUnread && (
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-xs text-white">
          1
        </span>
      )}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 animate-ping opacity-20"></div>
    </motion.button>
  );
}

export default AIMentorChat;
