import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster, resolveValue } from 'react-hot-toast';
import { LandingPage } from '@/pages/LandingPage';
import { AuthPage } from '@/pages/AuthPage';
import { Dashboard } from '@/pages/Dashboard';
import { AdminPanel } from '@/pages/AdminPanel';
import { OnboardingPage } from '@/pages/OnboardingPage';
import { GlobalAIMentor } from '@/components/mentor/GlobalAIMentor';
import { useAuthStore } from '@/store/authStore';
import { useAppStore } from '@/store/appStore';

import { JobsPage } from '@/pages/JobsPage';
import { CompaniesPage } from '@/pages/CompaniesPage';
import { ApplicationsPage } from '@/pages/ApplicationsPage';
import { NetworkPage } from '@/pages/NetworkPage';
import TetrisDemo from '@/pages/TetrisDemo';
import { QuestionBankPage } from '@/pages/QuestionBankPage';
import { MobileNav } from '@/components/navigation/MobileNav';
import TailwindAwesomeDemo from '@/pages/TailwindAwesomeDemo';
import Sidebar from '@/components/navigation/Sidebar';
import { InterviewPage } from '@/pages/InterviewPage';
import ThinkingLoader from '@/components/ui/loading';
import { GridBeam } from '@/components/ui/background-grid-beam';
import { NotesLibrary } from '@/pages/NotesLibrary';
import { NoteDetail } from '@/pages/NoteDetail';
import { NotFound } from '@/components/ui/not-found-2';
import { PdfReaderPage } from '@/pages/PdfReaderPage';

type Page = 'landing' | 'login' | 'signup' | 'dashboard' | 'admin' | 'onboarding' | 'jobs' | 'companies' | 'applications' | 'network' | 'tetris-demo' | 'resume' | 'settings' | 'assessment' | 'ai-interview' | 'tailwind-awesome' | 'notes' | 'note-detail' | 'question-bank' | 'reader' | '404';

// Get initial page from URL hash or default to 'landing'
const getPageFromHash = (): Page => {
  const hash = window.location.hash.slice(1);
  if (!hash) return 'landing';
  // Allow parameters in hash like #reader?id=123
  const pageName = hash.split('?')[0];
  const validPages: Page[] = ['landing', 'login', 'signup', 'dashboard', 'admin', 'onboarding', 'jobs', 'companies', 'applications', 'network', 'tetris-demo', 'resume', 'settings', 'assessment', 'ai-interview', 'tailwind-awesome', 'notes', 'note-detail', 'question-bank', 'reader'];
  return validPages.includes(pageName as Page) ? (pageName as Page) : '404';
};

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>(getPageFromHash());
  const [isInitialized, setIsInitialized] = useState(false);
  const [authValidated, setAuthValidated] = useState(false);
  const initRef = useRef(false);
  const { isAuthenticated, user, fetchUser } = useAuthStore();
  const { isGlobalLoading, globalLoadingText, setGlobalLoading, loadResumeAnalysisFromBackend, darkMode } = useAppStore();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    document.body.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // Handle social login token from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (token) {
      localStorage.setItem('prepzo-token', token);
      // Clean up the URL (remove token from query but keep hash)
      window.history.replaceState({}, document.title, window.location.pathname + window.location.hash);
      
      const reinitAuth = async () => {
        try {
          setGlobalLoading(true, 'Authenticating with Google...');
          const validatedUser = await fetchUser();
          if (validatedUser) {
            toast.success(`Welcome back, ${validatedUser.fullName.split(' ')[0]}!`);
            setAuthValidated(true);
            
            // Navigate based on state
            handleNavigate('dashboard');
          }
        } catch (error) {
          toast.error('Google login failed. Please try again.');
        } finally {
          setGlobalLoading(false);
        }
      };
      reinitAuth();
    }
  }, []);

  // Fetch user data on app initialization (with guard against React Strict Mode double-call)
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    
    const initializeAuth = async () => {
      // Only validate session if user is trying to access a protected page
      const protectedPages = ['dashboard', 'admin', 'onboarding', 'jobs', 'companies', 'applications', 'network', 'resume', 'settings', 'assessment', 'notes', 'note-detail', 'question-bank', 'reader'];
      const isOnProtectedPage = protectedPages.includes(currentPage);
      
      // Safety check: if we think we're authenticated but have no token, sync state
      const hasToken = !!localStorage.getItem('prepzo-token');
      
      if (isOnProtectedPage && isAuthenticated && hasToken) {
        try {
          // Validate session via HTTP-only cookies
          const validatedUser = await fetchUser();
          // If fetchUser returns null, the session is invalid (401 was returned)
          if (!validatedUser) {
            // Don't load resume data - auth failed
            setCurrentPage('landing');
            window.location.hash = 'landing';
            setAuthValidated(false);
          } else {
            // Auth validated successfully
            setAuthValidated(true);
          }
        } catch {
          // On error, trust persisted auth state - don't redirect
          // fetchUser already handles 401 by calling logout()
          setAuthValidated(false);
        }
      } else if ((isOnProtectedPage && !isAuthenticated) || (isAuthenticated && !hasToken)) {
        // Not authenticated and trying to access protected page OR
        // State says authenticated but token is missing physically
        if (isAuthenticated && !hasToken) {
          // Sync state to not-authenticated if token is missing
          useAuthStore.getState().logout();
        }
        
        if (isOnProtectedPage) {
          setCurrentPage('landing');
          window.location.hash = 'landing';
        }
        setAuthValidated(false);
      } else if (['landing', 'login', 'signup'].includes(currentPage) && isAuthenticated && hasToken) {
        // Authenticated user on public page - redirect to dashboard
        setCurrentPage('dashboard');
        window.location.hash = 'dashboard';
        setAuthValidated(true);
      } else {
        // Not on protected page, no validation needed
        setAuthValidated(isAuthenticated && hasToken);
      }
      setIsInitialized(true);
    };
    initializeAuth();
  }, []);

  // Load user-specific resume analysis when authenticated AND validated
  useEffect(() => {
    if (isInitialized && authValidated && isAuthenticated && user) {
      loadResumeAnalysisFromBackend();
    }
  }, [isInitialized, authValidated, isAuthenticated, user]);

  // Track previous auth state to detect new logins (not persisted/initial state)
  const prevAuthRef = useRef<{ isAuthenticated: boolean; user: typeof user; initialized: boolean }>({ 
    isAuthenticated, 
    user,
    initialized: false 
  });
  
  // Update authValidated when user logs in (detect transition from false to true)
  useEffect(() => {
    // Only handle auth state changes after initialization
    if (!isInitialized) return;
    
    // Skip the first run after initialization - this is likely persisted state
    if (!prevAuthRef.current.initialized) {
      prevAuthRef.current = { isAuthenticated, user, initialized: true };
      return;
    }
    
    const wasAuthenticated = prevAuthRef.current.isAuthenticated;
    
    // User just logged in (transition from not-authenticated to authenticated)
    if (!wasAuthenticated && isAuthenticated && user) {
      setAuthValidated(true);
    }
    
    // User logged out
    if (wasAuthenticated && !isAuthenticated) {
      setAuthValidated(false);
    }
    
    // Update ref for next comparison
    prevAuthRef.current = { isAuthenticated, user, initialized: true };
  }, [isInitialized, isAuthenticated, user]);

  // Listen for browser back/forward navigation
  useEffect(() => {
    const handleHashChange = () => {
      const newPage = getPageFromHash();
      if (newPage !== currentPage) {
        setGlobalLoading(true, `Routing to ${newPage.replace('-', ' ')}...`);
        
        // Fix: Sync dashboard tab state when navigating via browser back/forward or manual hash change
        if (['dashboard', 'resume', 'settings', 'assessment'].includes(newPage)) {
          const { setDashboardTab } = useAppStore.getState();
          if (newPage === 'resume') setDashboardTab('resume');
          else if (newPage === 'settings') setDashboardTab('settings');
          else if (newPage === 'assessment') setDashboardTab('assessment');
          else if (newPage === 'dashboard') setDashboardTab('home');
        }

        setTimeout(() => {
          setCurrentPage(newPage);
          // Safety timeout to hide loader if the new page doesn't signal readiness
          setTimeout(() => setGlobalLoading(false), 2000);
        }, 400);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [currentPage, setGlobalLoading]);

  // Redirect based on auth state after initialization
  useEffect(() => {
    if (!isInitialized) return;
    
    if (!isAuthenticated) {
      // If not authenticated and on protected page, redirect to landing
      if ([
        'dashboard',
        'admin',
        'onboarding',
        'jobs',
        'companies',
        'applications',
        'network',
        'resume',
        'settings',
        'assessment',
        'ai-interview',
        'notes',
        'note-detail',
        'question-bank',
        'reader'
      ].includes(currentPage)) {
        handleNavigate('landing');
      }
    } else {
      // If authenticated and on login/signup, redirect to dashboard
      // Note: We allow landing page for authenticated users so they can use "Back to Landing"
      if (['login', 'signup'].includes(currentPage)) {
        handleNavigate('dashboard');
      }
    }
  }, [isInitialized, isAuthenticated, currentPage]);

  const handleNavigate = (page: string) => {
    const newPage = page as Page;
    if (newPage === currentPage) return;

    const labels: Record<string, string> = {
      dashboard: 'Syncing Workspace Node',
      jobs: 'Scanning Opportunity Grid',
      companies: 'Analyzing Market Pulse',
      applications: 'Tracking Signal Streams',
      network: 'Connecting Neural Links',
      assessment: 'Evaluating Skill Vectors',
      'ai-interview': 'Initializing AI Interrogator',
      landing: 'Returning to Base',
    };

    setGlobalLoading(true, labels[newPage] || `Transmitting to ${newPage}...`);
    
    // Artificial delay to show premium loader and ensure smooth transition
    setTimeout(() => {
      // Navigation logic
      if (['dashboard', 'resume', 'settings', 'assessment'].includes(newPage)) {
        const { setDashboardTab } = useAppStore.getState();
        if (newPage === 'resume') setDashboardTab('resume');
        else if (newPage === 'settings') setDashboardTab('settings');
        else if (newPage === 'assessment') setDashboardTab('assessment');
        else if (newPage === 'dashboard') setDashboardTab('home');
      }

      setCurrentPage(newPage);
      window.location.hash = newPage;
      
      // We don't hide the loader here; we let the target page signal readiness
      // But we add a safety timeout just in case
      setTimeout(() => {
        setGlobalLoading(false);
      }, 3000); 
    }, 500);
  };

  // Show loading while initializing
  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0c10] relative overflow-hidden">
        <GridBeam className="absolute inset-0" />
        <ThinkingLoader 
          loadingText="Synchronizing Environment" 
        />
      </div>
    );
  }

  // Map current page to sidebar active ID
  const getSidebarActiveId = (page: Page) => {
    if (page === 'dashboard') return 'home';
    if (['jobs', 'companies', 'applications', 'network'].includes(page)) return 'opportunities';
    return page;
  };

  const isFieldComplete = user?.isFieldTestComplete;
  const isSkillComplete = user?.isSkillTestComplete;
  const isFullyQualified = isFieldComplete && isSkillComplete;

  const isWorkspacePage = ['dashboard', 'jobs', 'companies', 'applications', 'network', 'resume', 'settings', 'assessment', 'ai-interview', 'notes', 'note-detail', 'question-bank'].includes(currentPage);

  return (
    <div className="page-shell overflow-x-hidden">
      <Toaster position="top-right">
        {(t) => (
          <div
            className={`
              ${t.visible ? 'animate-enter opacity-100 translate-y-0 scale-100' : 'animate-leave opacity-0 -translate-y-4 scale-95'}
              flex items-center justify-between max-w-sm w-full shadow-2xl bg-[#0a0c10] border border-white/10 min-h-[48px] rounded-lg pointer-events-auto transition-all duration-300 overflow-hidden relative group
            `}
          >
            {/* left accent bar */}
            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${t.type === 'error' ? 'bg-red-500' : t.type === 'success' ? 'bg-emerald-500' : 'bg-blue-500'}`} />

            {/* icon + text */}
            <div className="flex flex-1 items-center px-4 py-3 pl-6">
              {t.type === 'success' ? (
                <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="text-emerald-500 shrink-0">
                  <path d="M11.95 16.5h.1" style={{ fill: "none", stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.95 }} />
                  <path d="M3 12a9 9 0 0 1 9-9h0a9 9 0 0 1 9 9h0a9 9 0 0 1-9 9h0a9 9 0 0 1-9-9m9 0V7" style={{ fill: "none", stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5 }} />
                </svg>
              ) : t.type === 'error' ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-500 shrink-0">
                   <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500 shrink-0">
                   <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
              )}
              <p className="text-[13px] font-medium text-white/90 ml-3 tracking-wide break-words">
                {resolveValue(t.message, t)}
              </p>
            </div>

            {/* close button */}
            <button
              onClick={() => toast.dismiss(t.id)}
              type="button"
              aria-label="close"
              className="active:scale-90 transition-all p-3 text-white/40 hover:text-white shrink-0 outline-none"
            >
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        )}
      </Toaster>

      {/* Page Content - always rendered */}
      <div className="w-full h-full">
        {currentPage === 'landing' && <LandingPage onNavigate={handleNavigate} />}
        {currentPage === 'login' && <AuthPage mode="login" onNavigate={handleNavigate} />}
        {currentPage === 'signup' && <AuthPage mode="signup" onNavigate={handleNavigate} />}
        
        {/* Workspace Pages wrapped in MainLayout */}
        {isWorkspacePage && (
          <div className="flex h-screen overflow-hidden bg-[#0a0c10] relative">
            <Sidebar 
              active={getSidebarActiveId(currentPage)} 
              onNavigate={(id) => handleNavigate(id === 'opportunities' ? 'jobs' : id === 'home' ? 'dashboard' : id)}
              lockedItems={!isFullyQualified ? ['home', 'resume', 'opportunities', 'settings'] : []}
            />
            <main className="flex-1 h-full overflow-y-auto overflow-x-hidden custom-scrollbar pb-24 md:pb-0">
              {(currentPage === 'dashboard' || currentPage === 'resume' || currentPage === 'settings' || currentPage === 'assessment') && <Dashboard />}
              {currentPage === 'jobs' && <JobsPage />}
              {currentPage === 'companies' && <CompaniesPage />}
              {currentPage === 'applications' && <ApplicationsPage />}
              {currentPage === 'network' && <NetworkPage />}
              {currentPage === 'ai-interview' && <InterviewPage />}
              {currentPage === 'notes' && <NotesLibrary />}
              {currentPage === 'note-detail' && <NoteDetail />}
              {currentPage === 'question-bank' && <QuestionBankPage />}
            </main>
            <MobileNav
              active={getSidebarActiveId(currentPage)}
              onNavigate={(id) => handleNavigate(id === 'opportunities' ? 'jobs' : id === 'home' ? 'dashboard' : id)}
              lockedItems={!isFullyQualified ? ['home', 'resume', 'opportunities', 'settings'] : []}
            />
          </div>
        )}

        {currentPage === 'admin' && <AdminPanel onNavigate={handleNavigate} />}
        {currentPage === 'onboarding' && <OnboardingPage onNavigate={handleNavigate} />}
        {currentPage === 'tetris-demo' && <TetrisDemo />}
        {currentPage === 'tailwind-awesome' && <TailwindAwesomeDemo />}
        {currentPage === 'reader' && <PdfReaderPage />}
        {currentPage === '404' && <NotFound onNavigate={handleNavigate} />}
      </div>

      {/* Global Loading Overlay - rendered ON TOP of content, never blocks mounting */}
      <AnimatePresence>
        {isGlobalLoading && (
          <motion.div
            key="global-loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0a0c10]/98 backdrop-blur-2xl"
          >
            {/* Animated grid background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
              <GridBeam className="absolute inset-0" />
            </div>
              {/* Radial glow behind loader */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-purple-500/5 blur-[120px]" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-emerald-500/5 blur-[80px]" />
            
            <ThinkingLoader loadingText={globalLoadingText} />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Prepzo AI Mentor - Available on all authenticated pages (ChatGPT-style) */}
      {authValidated && isAuthenticated && ['dashboard', 'admin', 'onboarding', 'jobs', 'companies', 'applications', 'network'].includes(currentPage) && (
        <GlobalAIMentor />
      )}
    </div>
  );
}
