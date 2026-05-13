import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Bot,
  Maximize2,
  MessageSquare,
  Minimize2,
  Send,
  Sparkles,
  User,
  X
} from 'lucide-react';
import { chatWithMentor, getMentorStatus } from '@/api/mentor';
import { useAuthStore } from '@/store/authStore';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  suggestions?: string[];
}

const starterPrompts = [
  'Build my interview roadmap',
  'Review my weak areas',
  'How should I improve my resume?',
  'Give me a 2-week placement plan',
];

export function GlobalAIMentor() {
  const { user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(true);
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [queuedPrompt, setQueuedPrompt] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadStatus = async () => {
      try {
        const status = await getMentorStatus();
        setIsReady(status.available && status.ready);
      } catch {
        setIsReady(false);
      }
    };

    void loadStatus();
  }, []);

  useEffect(() => {
    if (!isOpen || messages.length > 0) {
      return;
    }

    const firstName = user?.fullName?.split(' ')[0] || 'there';
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: `Hi ${firstName}. I’m Prepzo AI Mentor. I can help with your ${user?.targetRole || 'career'} roadmap, interview prep, resume strategy, and placement focus areas.`,
        suggestions: starterPrompts,
      },
    ]);
  }, [isOpen, messages.length, user?.fullName, user?.targetRole]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    const handlePrefill = (event: Event) => {
      const customEvent = event as CustomEvent<{ prompt?: string; autoSend?: boolean }>;
      const prompt = customEvent.detail?.prompt?.trim();
      if (!prompt) {
        return;
      }

      setIsOpen(true);
      setInputValue(prompt);
      if (customEvent.detail?.autoSend) {
        setQueuedPrompt(prompt);
      }
    };

    window.addEventListener('prepzo-mentor-prefill', handlePrefill as EventListener);
    return () => window.removeEventListener('prepzo-mentor-prefill', handlePrefill as EventListener);
  }, []);

  const headerLabel = useMemo(() => (isReady ? 'AI mentor online' : 'Limited mode'), [isReady]);

  const sendMessage = async (rawPrompt: string) => {
    const prompt = rawPrompt.trim();
    if (!prompt || isLoading) {
      return;
    }

    setMessages((current) => [...current, { id: `u-${Date.now()}`, role: 'user', content: prompt }]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await chatWithMentor(prompt, sessionId, {
        targetRole: user?.targetRole || 'Software Engineer',
        currentSkills: user?.knownTechnologies || [],
        learningGoals: user?.skillGaps || [],
      });

      if (response.status === 'warming_up') {
        setMessages((current) => [
          ...current,
          {
            id: `a-${Date.now()}`,
            role: 'assistant',
            content: response.message,
            suggestions: response.suggestions,
          },
        ]);
        return;
      }

      if (response.success) {
        if (response.sessionId) {
          setSessionId(response.sessionId);
        }

        setMessages((current) => [
          ...current,
          {
            id: `a-${Date.now()}`,
            role: 'assistant',
            content: typeof response.message === 'string' ? response.message : 'I received a response in an unexpected format.',
            suggestions: response.suggestions,
          },
        ]);
      }
    } catch {
      setMessages((current) => [
        ...current,
        {
          id: `e-${Date.now()}`,
          role: 'assistant',
          content: 'I hit a temporary connection issue. Ask again in a moment and I’ll pick it back up.',
          suggestions: starterPrompts.slice(0, 2),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!queuedPrompt || !isOpen || isLoading) {
      return;
    }

    void sendMessage(queuedPrompt);
    setQueuedPrompt(null);
  }, [queuedPrompt, isOpen, isLoading]);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 22, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            className={`fixed z-[70] ${isExpanded ? 'inset-4' : 'bottom-24 right-4 h-[640px] w-[calc(100vw-2rem)] max-w-[440px]'}`}
          >
            <div className="bg-[#0a0c10] border border-white/10 shadow-2xl backdrop-blur-xl flex h-full flex-col overflow-hidden rounded-[32px]">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-code-green/10 border border-code-green/20 text-code-green shadow-lg">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[13px] font-[800] uppercase tracking-widest text-white">Prepzo AI Mentor</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-code-green animate-pulse" />
                      <p className="text-[9px] font-black uppercase tracking-widest text-code-green">{headerLabel}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setIsExpanded((value) => !value)} className="bg-white/5 border border-white/10 flex h-10 w-10 items-center justify-center rounded-full text-white/60 hover:text-white transition-colors">
                    {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                  </button>
                  <button type="button" onClick={() => setIsOpen(false)} className="bg-white/5 border border-white/10 flex h-10 w-10 items-center justify-center rounded-full text-white/60 hover:text-white transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-5 custom-scrollbar">
                {messages.map((message) => (
                  <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {message.role === 'assistant' && (
                      <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/60">
                        <Sparkles className="h-4 w-4" />
                      </div>
                    )}
                    <div className={`flex max-w-[85%] flex-col ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                      <div className={`whitespace-pre-wrap rounded-[22px] px-5 py-4 text-[13px] font-medium leading-relaxed backdrop-blur-xl ${message.role === 'user' ? 'bg-code-green/20 text-code-green border border-code-green/30 shadow-green-900/10 shadow-lg' : 'bg-white/5 text-white/80 border border-white/10 shadow-lg'}`}>
                        {message.content.split('\n').map((line, i) => {
                          const parts = line.replace(/^#{1,6}\s+/, '').split('**');
                          return (
                            <p key={i} className="mb-1 last:mb-0 min-h-[0.5em]">
                              {parts.map((part, j) => 
                                j % 2 === 1 ? <strong key={j} className={message.role === 'user' ? 'text-code-green font-bold' : 'text-white/95 font-bold'}>{part}</strong> : <span key={j}>{part}</span>
                              )}
                            </p>
                          );
                        })}
                      </div>
                      {message.suggestions?.length ? (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {message.suggestions.slice(0, 3).map((suggestion) => (
                            <button
                              key={suggestion}
                              type="button"
                              onClick={() => void sendMessage(suggestion)}
                              className="rounded-full border border-code-green/30 bg-code-green/10 px-3 py-1.5 text-[10px] uppercase font-bold tracking-widest text-code-green hover:bg-code-green/20 transition-colors"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      ) : null}
                    </div>
                    {message.role === 'user' && (
                      <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-code-green/10 border border-code-green/20 text-code-green">
                        <User className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className="flex items-center gap-2 text-code-green text-[10px] uppercase font-bold tracking-widest animate-pulse ml-10">
                    <div className="w-1.5 h-1.5 rounded-full bg-code-green animate-bounce" />
                    SIGNAL PROCESSING...
                  </div>
                )}
                <div ref={endRef} />
              </div>

              <div className="border-t border-white/10 px-4 py-4 sm:px-5">
                {!messages.length && (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {starterPrompts.map((prompt) => (
                      <button key={prompt} type="button" onClick={() => void sendMessage(prompt)} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white/60 hover:bg-white/10 hover:text-white transition-colors">
                        {prompt}
                      </button>
                    ))}
                  </div>
                )}

                <div className="bg-white/5 border border-white/10 flex items-end gap-3 rounded-[28px] p-2 focus-within:border-white/30 transition-colors">
                  <textarea
                    value={inputValue}
                    onChange={(event) => setInputValue(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' && !event.shiftKey) {
                        event.preventDefault();
                        void sendMessage(inputValue);
                      }
                    }}
                    rows={1}
                    placeholder="INITIATE SIGNAL..."
                    className="min-h-[56px] flex-1 resize-none bg-transparent px-3 py-3 text-[13px] font-medium tracking-wide text-white outline-none placeholder:text-white/30 placeholder:uppercase placeholder:tracking-widest placeholder:font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => void sendMessage(inputValue)}
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-code-green text-[#0a0c10] shadow-lg disabled:opacity-50 transition-transform active:scale-95 flex-shrink-0"
                    disabled={!inputValue.trim() || isLoading}
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        whileHover={{ scale: 1.04, y: -2 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => setIsOpen((value) => !value)}
        className="fixed bottom-5 right-4 z-[68] flex items-center gap-3 rounded-full bg-code-green px-4 py-3 text-[12px] uppercase font-[900] tracking-widest text-[#0a0c10] shadow-[0_0_30px_rgba(94,210,156,0.3)]"
      >
        <MessageSquare className="h-5 w-5" />
        <span className="hidden sm:inline">Connect to AI</span>
      </motion.button>
    </>
  );
}

export default GlobalAIMentor;
