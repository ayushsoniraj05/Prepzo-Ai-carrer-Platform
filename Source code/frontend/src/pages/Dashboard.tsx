import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';

import {
  Activity,
  ArrowRight,
  ArrowLeft,
  Bot,
  FileText,
  ShieldCheck,
  Sparkles,
  Target,
  CheckCircle2,
  Download,
  Zap,
  Award,
  Shield,
  Brain,

  Upload,
  Lock,
  CheckCircle,
  Building2,
  MapPin,
  Briefcase,
  ArrowUpRight,
  ChevronRight,
  Mic,
  BookOpen,
  Search,
  Layers,
  FileCode,
  TrendingUp,
  Code
} from 'lucide-react';
import { type Job } from '@/api/jobs';
import { showSuccess, showError, showInfo } from '@/utils/toastManager';
import { jsPDF } from 'jspdf';
import { exportToDocx } from '@/utils/docxExporter';
import { GlassButton, GlassCard } from '@/components/ui/GlassCard';
import { CircularProgress, SkillBar } from '@/components/ui/CircularProgress';
import { SearchableDropdown } from '@/components/ui/SearchableDropdown';
import { useAuthStore } from '@/store/authStore';
import { useAppStore } from '@/store/appStore';
import QuickInsightsWidget from '@/components/recommendations/QuickInsightsWidget';
import { ProctoredAssessment } from '@/components/assessment/ProctoredAssessment';
import { uploadApi, type ResumeInfo } from '@/api/auth';
import { ResumeRenderer } from '@/components/resume/ResumeRenderer';
import ThinkingLoader from '@/components/ui/loading';
import allTemplates from '@/data/templates.json';
import { GridBeam } from '@/components/ui/background-grid-beam';
import { QuestionBank } from '@/components/interview/QuestionBank';
import { SettingsForm } from '@/components/profile/SettingsForm';



type DashboardTab = 'home' | 'resume' | 'assessment' | 'opportunities' | 'settings';





const resumeRoleOptions = [
  { value: 'Backend Developer', label: 'Backend Developer', color: 'from-green-500 to-teal-500' },
  { value: 'Frontend Developer', label: 'Frontend Developer', color: 'from-cyan-500 to-blue-500' },
  { value: 'Full Stack Developer', label: 'Full Stack Developer', color: 'from-violet-500 to-purple-500' },
  { value: 'Software Engineer', label: 'Software Engineer', color: 'from-purple-500 to-indigo-500' },
  { value: 'Data Scientist', label: 'Data Scientist', color: 'from-orange-500 to-red-500' },
  { value: 'Machine Learning Engineer', label: 'Machine Learning Engineer', color: 'from-pink-500 to-rose-500' },
];

const demoJDOptions = [
  { value: 'backend_node', label: 'Backend Developer — Node.js', color: 'from-green-500 to-teal-500' },
  { value: 'frontend_react', label: 'Frontend Developer — React', color: 'from-cyan-500 to-blue-500' },
  { value: 'fullstack_web', label: 'Full Stack Developer', color: 'from-violet-500 to-purple-500' },
  { value: 'ml_engineer', label: 'Machine Learning Engineer', color: 'from-pink-500 to-rose-500' },
];

const templateOptions = [
  { value: 'Standard Professional ATS', label: 'Standard ATS (Classic)' },
  { value: 'Modern Creative', label: 'Modern Creative Template' },
  { value: 'Executive Leadership', label: 'Executive Leadership' },
  { value: 'Minimalist Tech', label: 'Minimalist Tech Layout' },
  { value: 'AltaCV Modern', label: 'AltaCV Modern Design' },
  { value: 'Jakes Resume', label: 'Jake\'s ATS Resume' },
  { value: 'Simple Hipster', label: 'Simple Hipster Sidebar' },
  { value: 'MBZUAI Academic', label: 'MBZUAI Academic Clean' }
];

const demoJDs = [
  {
    id: 'backend_node',
    label: 'Backend Developer - Node.js',
    role: 'Backend Developer',
    description:
      'Looking for a Backend Developer with strong experience in Node.js, REST APIs, MongoDB, Docker, and microservices architecture. Experience with API security, performance optimization, and cloud deployment is preferred.',
  },
  {
    id: 'frontend_react',
    label: 'Frontend Developer - React',
    role: 'Frontend Developer',
    description:
      'Looking for a Frontend Developer with expertise in React, TypeScript, performance optimization, responsive UI, and accessibility. Experience with testing frameworks and component architecture is required.',
  },
  {
    id: 'fullstack_web',
    label: 'Full Stack Developer',
    role: 'Full Stack Developer',
    description:
      'Seeking a Full Stack Developer with React, Node.js, API development, SQL/NoSQL databases, CI/CD, and cloud deployment experience. Strong debugging and system design fundamentals are expected.',
  },
  {
    id: 'ml_engineer',
    label: 'Machine Learning Engineer',
    role: 'Machine Learning Engineer',
    description:
      'Hiring an ML Engineer with Python, PyTorch or TensorFlow, model serving, feature engineering, MLOps pipelines, Docker, and monitoring experience. Data processing and experimentation rigor is important.',
  },
];

export function Dashboard() {
  const { user, completeAssessmentAsync, logout } = useAuthStore();
  const {
    dashboardTab,
    setDashboardTab,
    resumeAnalysis,
    atsHistory,
    resumeAnalysisLoading,
    analyzeResume,
    loadResumeAnalysisFromBackend,
    generatedResume,
    resumeGenerationLoading,
    generateResume,
    setShowFullRecommendations,
    setGlobalLoading,
    autofillResumeText
  } = useAppStore();
  const [startAssessment, setStartAssessment] = useState<false | 'field' | 'skills'>(false);
  const [resumeTextInput, setResumeTextInput] = useState('');
  const [resumeRoleInput, setResumeRoleInput] = useState(user?.targetRole || '');
  const [jobDescriptionInput, setJobDescriptionInput] = useState('');
  const [templateInput, setTemplateInput] = useState('Standard Professional ATS');
  const [selectedDemoJD, setSelectedDemoJD] = useState('');
  const [resumeInfo, setResumeInfo] = useState<ResumeInfo | null>(null);
  const [resumeWorkspace, setResumeWorkspace] = useState<'selection' | 'maker' | 'ats' | 'gallery'>('selection');
  const [opportunitiesWorkspace, setOpportunitiesWorkspace] = useState<'selection' | 'jobs' | 'companies' | 'applications' | 'network'>('selection');
  const [isResumeUploading, setIsResumeUploading] = useState(false);
  const [dashboardJobs, setDashboardJobs] = useState<Job[]>([]);
  const [dashboardJobsLoading, setDashboardJobsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Format helper for 2 decimal places
  const formatVal = (val: any) => {
    if (val === undefined || val === null) return '0';
    const num = typeof val === 'string' ? parseFloat(val) : val;
    if (isNaN(num)) return '0';
    return Number.isInteger(num) ? num.toString() : num.toFixed(2);
  };

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        // Only call protected endpoints if the user has a valid auth token
        const token = localStorage.getItem('prepzo-token');
        if (token && token !== 'null' && token !== 'undefined') {
          await Promise.all([
            uploadApi.getResumeInfo().then(setResumeInfo).catch(() => setResumeInfo(null)),
            loadResumeAnalysisFromBackend()
          ]);
        }
      } finally {
        setGlobalLoading(false);
      }
    };

    void initializeDashboard();
  }, [loadResumeAnalysisFromBackend, setGlobalLoading]);

  useEffect(() => {
    setResumeRoleInput(user?.targetRole || '');
  }, [user?.targetRole]);

  useEffect(() => {
    if (!selectedDemoJD) {
      return;
    }
    const selected = demoJDs.find((item) => item.id === selectedDemoJD);
    if (!selected) {
      return;
    }
    setResumeRoleInput(selected.role);
    setJobDescriptionInput(selected.description);
  }, [selectedDemoJD]);

  // Load jobs for the opportunities workspace
  useEffect(() => {
    const loadJobs = async () => {
      if (opportunitiesWorkspace !== 'jobs') return;
      
      setDashboardJobsLoading(true);
      try {
        const { jobsApi } = await import('@/api/jobs');
        const response = await jobsApi.searchJobs({ limit: 50 });
        if (response.success) {
          setDashboardJobs(response.data.jobs);
        }
      } catch (error) {
        console.error('Failed to load dashboard jobs:', error);
      } finally {
        setDashboardJobsLoading(false);
      }
    };
    
    void loadJobs();
  }, [opportunitiesWorkspace]);

  const activeTab = (dashboardTab === 'overview' ? 'home' : (dashboardTab as DashboardTab)) || 'home';
  const readinessScore = user?.placementReadinessScore || 68.42;
  const atsScore = resumeAnalysis?.overallScore ?? user?.atsScore ?? 0;

  const skillBars = useMemo(() => {
    const technologies = user?.knownTechnologies?.slice(0, 4) || ['React', 'Node.js', 'System Design', 'Problem Solving'];
    return technologies.map((skill, index) => ({
      skill,
      level: Math.max(55, Math.min(94, readinessScore - 8 + index * 7.25)),
    }));
  }, [readinessScore, user?.knownTechnologies]);

  const shellCards = [
    {
      title: 'Jobs',
      description: 'Track role-matched openings with cleaner filters and calmer surfaces.',
      action: () => window.location.hash = 'jobs',
    },
    {
      title: 'Companies',
      description: 'Company prep, hiring signals, and target lists in a premium workspace.',
      action: () => window.location.hash = 'companies',
    },
    {
      title: 'Applications',
      description: 'Review application status, momentum, and next actions in one view.',
      action: () => window.location.hash = 'applications',
    },
    {
      title: 'Network',
      description: 'Stay connected to peers, mentors, and warm opportunities.',
      action: () => window.location.hash = 'network',
    },
  ];

  const keywordLens = resumeAnalysis?.keywordAnalysis;
  const skillGapAnalysis = resumeAnalysis?.skillGapAnalysis;
  const recruiterSimulation = resumeAnalysis?.recruiterSimulation;
  const linkedinOptimization = resumeAnalysis?.linkedinOptimization;
  const ranking = resumeAnalysis?.resumeRanking;
  const interviewSuccess = resumeAnalysis?.interviewSuccess;
  const scoreSimulation = resumeAnalysis?.scoreSimulation;
  const rewriteLines = resumeAnalysis?.resumeRewrite?.beforeAfterPairs || resumeAnalysis?.improvedLines || [];
  const isFieldComplete = !!user?.isFieldTestComplete;
  const isSkillComplete = !!user?.isSkillTestComplete;
  const isFullyQualified = isFieldComplete && isSkillComplete;
  const atsTrend = (atsHistory || []).slice(0, 8).reverse();

  // Calculate real metrics for "fancy things"
  const dailyStreak = useMemo(() => {
    if (!atsHistory || atsHistory.length === 0) return 1;
    // Simple logic: count unique days in history
    const days = new Set(atsHistory.map(h => new Date(h.analyzedAt).toDateString()));
    return Math.max(1, days.size);
  }, [atsHistory]);

  const activityScore = useMemo(() => {
    const base = readinessScore * 0.8;
    const momentum = Math.min(20, (atsHistory?.length || 0) * 2);
    return Math.min(100, Math.round(base + momentum));
  }, [readinessScore, atsHistory]);

  const globalPercentile = ranking?.percentile || Math.round(readinessScore / 1.1);

  const missions = useMemo(() => {
    const baseMissions = [
      { label: "AI Interview Warmup", sub: "15 min spoken practice", done: !!user?.interviewScore, icon: Mic, type: 'interview' },
    ];

    if (resumeAnalysis?.improvementPlan) {
      const planMissions = resumeAnalysis.improvementPlan.slice(0, 2).map(plan => ({
        label: plan.action,
        sub: `Impact: ${plan.impact} | ${plan.timeToComplete}`,
        done: false,
        icon: Sparkles,
        type: 'improvement'
      }));
      return [...planMissions, ...baseMissions];
    }

    return [
      { label: "Update Resume keywords", sub: "Matches target job signals", done: false, icon: FileText, type: 'resume' },
      ...baseMissions,
      { label: "Complete Skill Assessment", sub: "Level up your signal", done: isSkillComplete, icon: Code, type: 'assessment' }
    ];
  }, [resumeAnalysis, user, isSkillComplete]);

  // Force assessment tab if not qualified
  useEffect(() => {
    if (!isFullyQualified && dashboardTab !== 'assessment') {
      setDashboardTab('assessment');
    }
  }, [isFullyQualified, dashboardTab]);

  const exportAtsReportPdf = () => {
    if (!isFullyQualified) {
      showError('Complete both assessment stages to unlock ATS reports.');
      return;
    }
    if (!resumeAnalysis) {
      showError('Run ATS analysis first to export report.');
      return;
    }

    const doc = new jsPDF();
    let y = 16;
    const lineHeight = 7;
    const pageWidth = 180;

    const addWrapped = (label: string, content: string) => {
      if (y > 275) {
        doc.addPage();
        y = 16;
      }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text(label, 14, y);
      y += 6;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      const lines = doc.splitTextToSize(content || '-', pageWidth);
      doc.text(lines, 14, y);
      y += lines.length * lineHeight + 2;
    };

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('Prepzo AI Resume ATS Optimization Report', 14, y);
    y += 10;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Student: ${user?.fullName || 'Student'}`, 14, y);
    y += 6;
    doc.text(`Target Role: ${resumeAnalysis.targetRoleUsed || user?.targetRole || 'Software Engineer'}`, 14, y);
    y += 6;
    doc.text(`ATS Score: ${formatVal(resumeAnalysis.overallScore || 0)}/100`, 14, y);
    y += 10;

    addWrapped('Keyword Match Analysis', `Matched: ${(keywordLens?.matchedKeywords || []).join(', ')}\nMissing: ${(keywordLens?.missingKeywords || []).join(', ')}`);
    addWrapped('Skill Gap Detection', (skillGapAnalysis?.missingSkills || []).join(', '));
    addWrapped('AI Recommendations', [
      ...(resumeAnalysis.aiRecommendations?.skillsToLearn || []).slice(0, 4).map((s) => `Learn: ${s}`),
      ...(resumeAnalysis.aiRecommendations?.projectsToBuild || []).slice(0, 3).map((s) => `Build: ${s}`),
    ].join('\n'));
    addWrapped('Recruiter Simulation', `Strengths: ${(recruiterSimulation?.strengths || []).join(', ')}\nConcerns: ${(recruiterSimulation?.concerns || []).join(', ')}\nRecommendation: ${recruiterSimulation?.recommendation || ''}`);
    addWrapped('Interview Success Probability', `${formatVal(interviewSuccess?.probability || 0)}%`);
    addWrapped('ATS Score Simulation', `Current: ${formatVal(scoreSimulation?.currentScore || resumeAnalysis.overallScore || 0)}%\nExpected: ${formatVal(scoreSimulation?.expectedScoreAfterImprovements || resumeAnalysis.overallScore || 0)}%`);
    addWrapped('LinkedIn Optimization Headline', linkedinOptimization?.optimizedHeadline || '-');

    doc.save(`prepzo-ats-report-${Date.now()}.pdf`);
  };

  const renderHome = () => (
    <div className="max-w-7xl mx-auto space-y-10 selection:bg-[#5ed29c] selection:text-black font-rubik pb-20">
      {/* Row 1: Fancy Welcome Card */}
      <div className="relative rounded-[40px] p-8 md:p-14 mb-8 bg-black border border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden group">
        {/* Background Grid Beam */}
        <div className="absolute inset-0 z-0 opacity-20 group-hover:opacity-30 transition-opacity duration-1000">
           <GridBeam className="w-full h-full" />
        </div>
        
        {/* Animated Background Glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#5ed29c]/10 blur-[100px] rounded-full animate-pulse" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500/5 blur-[100px] rounded-full animate-pulse" style={{ animationDelay: '1s' }} />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#5ed29c]" />
            <p className="text-[10px] font-black uppercase tracking-[0.6em] text-[#5ed29c]">Career Command Center</p>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12">
            <div className="max-w-3xl">
              <h1 className="text-5xl md:text-8xl font-[900] text-white uppercase tracking-tighter leading-[0.75] italic mb-8">
                Welcome back,<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/10">{user?.fullName?.split(' ')[0] || 'there'}.</span>
              </h1>
              
              <div className="flex flex-wrap items-center gap-6">
                <p className="text-[16px] font-medium tracking-tight leading-relaxed text-white/40 max-w-md italic">
                  Your AI mentor is standing by. All systems are calibrated for your next career jump.
                </p>
                <div className="h-10 w-px bg-white/10 hidden md:block" />
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-black bg-white/5 flex items-center justify-center overflow-hidden">
                        <img src={`https://i.pravatar.cc/150?u=${i + 10}`} alt="avatar" className="w-full h-full object-cover opacity-50" />
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">+12 Peers active now</p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-6 items-center lg:items-end">
              <button 
                onClick={() => setDashboardTab('assessment')}
                className="relative h-[75px] px-12 group active:scale-95 transition-transform"
              >
                <svg className="absolute inset-0 w-full h-full transition-transform group-hover:scale-105 shadow-2xl shadow-[#5ed29c]/20" viewBox="0 0 184 65" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                  <path d="M0 0H184L174 65H10L0 0Z" fill="#5ed29c" />
                </svg>
                <span className="relative z-10 flex items-center justify-center h-full text-[#070b0a] font-[900] text-[14px] uppercase tracking-[0.2em] gap-4 italic">
                   System Launch <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                </span>
              </button>
              
              <div className="flex items-center gap-4 text-white/30 text-[10px] font-black uppercase tracking-widest">
                <div className="flex items-center gap-1.5"><Zap size={12} className="text-amber-400" /> Daily Streak: {dailyStreak}</div>
                <div className="w-1 h-1 rounded-full bg-white/20" />
                <div className="flex items-center gap-1.5"><Award size={12} className="text-blue-400" /> Rank: {readinessScore > 80 ? 'Elite' : readinessScore > 60 ? 'Pro' : 'Rising'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Fancy Progress Tracker + Filling Space */}
      <div className="grid grid-cols-1 gap-8 xl:grid-cols-12">
        {/* Progress Tracker Card */}
        <div className="rounded-[40px] p-10 bg-black/40 border border-white/5 xl:col-span-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[80px] rounded-full group-hover:bg-indigo-500/10 transition-colors duration-1000" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-14">
            <div className="flex flex-col items-center justify-center gap-8 min-w-[200px]">
              <CircularProgress value={readinessScore} label="AI Readiness" color="purple" />
              <div className="flex flex-col items-center gap-2">
                <div className="px-5 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full flex items-center gap-2">
                  <ShieldCheck size={14} className="text-purple-400" />
                  <span className="text-[10px] font-black text-purple-400 uppercase tracking-[0.2em] italic">Validated Score</span>
                </div>
                <p className="text-[10px] font-bold text-white/20 uppercase">Last updated: {resumeAnalysis?.analyzedAt ? new Date(resumeAnalysis.analyzedAt).toLocaleDateString() : 'Just now'}</p>
              </div>
            </div>

            <div className="flex-1 w-full space-y-10">
              <div className="flex items-end justify-between border-b border-white/5 pb-6">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#5ed29c] mb-2 italic">Performance Matrix</p>
                  <h3 className="text-4xl font-[900] text-white uppercase italic tracking-tighter">Skill Signals</h3>
                </div>
                <div className="text-right hidden sm:block">
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Global Percentile</p>
                  <p className="text-2xl font-[900] text-white italic tracking-tighter">Top {100 - globalPercentile}%</p>
                </div>
              </div>

              <div className="grid gap-x-12 gap-y-8 sm:grid-cols-2">
                {skillBars.map((item, index) => (
                  <SkillBar key={item.skill} skill={item.skill} level={item.level} delay={index * 0.1} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Filling Space: Quick Engagement Widget */}
        <div className="xl:col-span-4 space-y-8">
          <div className="rounded-[40px] p-8 bg-[#0a0a0a] border border-white/5 shadow-2xl relative overflow-hidden group hover:border-[#5ed29c]/30 transition-colors duration-500 h-full">
             <div className="absolute -bottom-10 -right-10 opacity-5 group-hover:opacity-10 transition-opacity">
                <Sparkles size={160} className="text-[#5ed29c]" />
             </div>
             
             <div className="relative z-10 space-y-6">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 italic">AI Next Steps</p>
                <h4 className="text-2xl font-[900] text-white uppercase italic tracking-tighter leading-none">Your Daily <span className="text-[#5ed29c]">Missions.</span></h4>
                
                <div className="space-y-4 pt-4">
                  {missions.map((task, i) => (
                    <div key={i} className={`p-4 rounded-3xl border transition-all ${task.done ? 'bg-[#5ed29c]/5 border-[#5ed29c]/20 opacity-50' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}>
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-xl ${task.done ? 'bg-[#5ed29c]/20' : 'bg-white/5'}`}>
                           {task.done ? <CheckCircle2 size={16} className="text-[#5ed29c]" /> : <task.icon size={16} className="text-white/40" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-[11px] font-black text-white uppercase tracking-wider line-clamp-1">{task.label}</p>
                          <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest italic">{task.sub}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={() => setShowFullRecommendations(true)}
                  className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all text-[10px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-white"
                >
                  View All Missions
                </button>
             </div>
          </div>

          {/* New Fancy Thing: Career Roadmap Preview */}
          {resumeAnalysis?.careerRoadmap?.milestones?.length ? (
            <div className="rounded-[40px] p-8 bg-black border border-white/5 shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[40px] rounded-full" />
               <div className="relative z-10 space-y-6">
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400/60 italic">Strategic Roadmap</p>
                  <h4 className="text-xl font-[900] text-white uppercase italic tracking-tighter leading-none">Your Path to <span className="text-blue-400">Success.</span></h4>
                  
                  <div className="space-y-6 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-white/5">
                    {resumeAnalysis.careerRoadmap.milestones.slice(0, 3).map((ms, i) => (
                      <div key={i} className="relative pl-8 group/ms">
                        <div className="absolute left-0 top-1 w-4 h-4 rounded-full border-2 border-white/10 bg-black flex items-center justify-center group-hover/ms:border-blue-400 transition-colors">
                           <div className="w-1.5 h-1.5 rounded-full bg-white/10 group-hover/ms:bg-blue-400" />
                        </div>
                        <p className="text-[9px] font-black text-blue-400 uppercase tracking-[0.2em] mb-1">{ms.week}</p>
                        <p className="text-[11px] font-bold text-white tracking-tight leading-tight">{ms.goal}</p>
                        <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest mt-1 italic">{ms.output}</p>
                      </div>
                    ))}
                  </div>
               </div>
            </div>
          ) : (
             <div className="rounded-[40px] p-8 bg-black border border-white/5 shadow-2xl flex flex-col items-center justify-center text-center gap-4 py-12">
                <div className="p-4 bg-white/5 rounded-full">
                   <Target size={32} className="text-white/20" />
                </div>
                <div>
                   <p className="text-[11px] font-black text-white/40 uppercase tracking-widest italic">Roadmap Locked</p>
                   <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest mt-1">Complete AI Analysis to generate path</p>
                </div>
             </div>
          )}
        </div>
      </div>

      <div id="ai-insights" className="mt-12">
         <QuickInsightsWidget onViewFull={() => setShowFullRecommendations(true)} />
      </div>

      {/* Row 3: More fancy widgets to fill space */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
        <div className="p-8 rounded-[40px] bg-black border border-white/5 relative overflow-hidden group hover:bg-gradient-to-br hover:from-black hover:to-indigo-900/20 transition-all duration-700">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Target size={40} className="text-indigo-400" />
          </div>
          <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2">Target Role</p>
          <h5 className="text-2xl font-[900] text-white uppercase italic tracking-tighter mb-4">{user?.targetRole || resumeAnalysis?.roleContext?.targetRole || 'Not Set'}</h5>
          <div className="flex items-center gap-2 text-[#5ed29c] text-[10px] font-black uppercase italic">
            <TrendingUp size={12} /> Market Demand: {readinessScore > 70 ? 'High' : 'Stable'}
          </div>
        </div>

        <div className="p-8 rounded-[40px] bg-black border border-white/5 relative overflow-hidden group hover:bg-gradient-to-br hover:from-black hover:to-purple-900/20 transition-all duration-700">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Activity size={40} className="text-purple-400" />
          </div>
          <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2">Activity Score</p>
          <h5 className="text-2xl font-[900] text-white uppercase italic tracking-tighter mb-4">{activityScore}/100</h5>
          <div className="flex items-center gap-2 text-purple-400 text-[10px] font-black uppercase italic">
            <Sparkles size={12} /> Top {100 - globalPercentile}% Globally
          </div>
        </div>

        <div className="p-8 rounded-[40px] bg-black border border-white/5 relative overflow-hidden group hover:bg-gradient-to-br hover:from-black hover:to-emerald-900/20 transition-all duration-700">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <ShieldCheck size={40} className="text-[#5ed29c]" />
          </div>
          <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2">Job Matches</p>
          <h5 className="text-2xl font-[900] text-white uppercase italic tracking-tighter mb-4">{dashboardJobs.length > 0 ? `${dashboardJobs.length} Matches` : 'Analyzing Jobs...'}</h5>
          <div className="flex items-center gap-2 text-[#5ed29c] text-[10px] font-black uppercase italic">
            <ArrowRight size={12} /> Browse Opportunities
          </div>
        </div>
      </div>

      {/* AI Mock Interview Entry Card */}
      <div className="mt-10">
        <div className="rounded-[40px] p-10 bg-gradient-to-br from-[#13171d] to-black border border-[#5ed29c]/30 shadow-2xl relative overflow-hidden group">
          <div className="absolute -right-10 -bottom-10 opacity-10 group-hover:opacity-20 transition-opacity duration-700 transform group-hover:scale-125">
            <Bot size={240} className="text-[#5ed29c]" />
          </div>
          
          <div className="relative z-10 grid md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="px-3 py-1 bg-[#5ed29c]/10 border border-[#5ed29c]/20 rounded-full">
                  <span className="text-[10px] font-black text-[#5ed29c] uppercase tracking-widest">Stage 3 Validation</span>
                </div>
                <div className="flex -space-x-2">
                  <div className="w-6 h-6 rounded-full border-2 border-black bg-purple-500 flex items-center justify-center"><Mic size={10} className="text-white" /></div>
                  <div className="w-6 h-6 rounded-full border-2 border-black bg-[#5ed29c] flex items-center justify-center"><Bot size={10} className="text-black" /></div>
                </div>
              </div>
              
              <h2 className="text-3xl md:text-5xl font-[900] text-white uppercase tracking-tighter italic mb-6 leading-none">
                AI Mock <span className="text-white/40">Interview.</span>
              </h2>
              
              <p className="text-white/50 font-medium tracking-tight leading-relaxed max-w-md mb-8">
                The most advanced interview simulation. AI will analyze your resume, ask spoken questions, and evaluate your responses in real-time using high-fidelity voice synthesis.
              </p>
              
              <button 
                onClick={() => window.location.hash = 'ai-interview'}
                className="group/btn relative h-[55px] px-8 bg-[#5ed29c] rounded-2xl flex items-center gap-3 overflow-hidden transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-[#5ed29c]/20"
              >
                <span className="relative z-10 text-black font-black uppercase tracking-widest text-xs">Launch Session</span>
                <ArrowUpRight size={18} className="relative z-10 text-black group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
              </button>
            </div>
            
            <div className="hidden md:grid grid-cols-2 gap-4">
              {[
                { icon: Shield, label: "Proctored", sub: "Integrity check" },
                { icon: Brain, label: "Resume-Linked", sub: "Deep alignment" },
                { icon: Zap, label: "Real-time", sub: "Instant feedback" },
                { icon: Sparkles, label: "Voice-Sync", sub: "Speech API" }
              ].map((feature, i) => (
                <div key={i} className="p-5 rounded-3xl bg-white/5 border border-white/5 hover:border-[#5ed29c]/20 transition-colors group/feat">
                  <feature.icon size={20} className="text-[#5ed29c] mb-3 group-hover/feat:scale-110 transition-transform" />
                  <p className="text-[11px] font-black text-white uppercase tracking-wider mb-1">{feature.label}</p>
                  <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest italic">{feature.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Study Notes Entry Card */}
      <div className="mt-10">
        <div 
          onClick={() => { window.location.hash = 'notes'; }}
          className="rounded-[40px] p-10 bg-gradient-to-br from-[#13171d] to-black border border-blue-500/30 shadow-2xl relative overflow-hidden group hover:border-blue-500/50 transition-colors cursor-pointer"
        >
          <div className="absolute -right-10 -bottom-10 opacity-10 group-hover:opacity-20 transition-opacity duration-700 transform group-hover:scale-125">
            <BookOpen size={240} className="text-blue-500" />
          </div>
          
          <div className="relative z-10 grid md:grid-cols-2 gap-10 items-center pointer-events-none">
            <div className="pointer-events-auto">
              <div className="flex items-center gap-3 mb-6">
                <div className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full">
                  <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Knowledge Base</span>
                </div>
              </div>
              
              <h2 className="text-3xl md:text-5xl font-[900] text-white uppercase tracking-tighter italic mb-6 leading-none">
                Study <span className="text-white/40">Notes.</span>
              </h2>
              
              <p className="text-white/50 font-medium tracking-tight leading-relaxed max-w-md mb-8">
                Access curated PDF study materials for all 26 technical and non-technical sub-skills. Download and prepare offline for your mock interviews.
              </p>
              
              <button 
                onClick={(e) => { e.stopPropagation(); window.location.hash = 'notes'; }}
                className="group/btn relative h-[55px] px-8 bg-blue-500 rounded-2xl flex items-center gap-3 overflow-hidden transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-blue-500/20"
              >
                <span className="relative z-10 text-white font-black uppercase tracking-widest text-xs">Open Library</span>
                <ArrowUpRight size={18} className="relative z-10 text-white group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
              </button>
            </div>
            
            <div className="hidden md:grid grid-cols-2 gap-4 pointer-events-auto">
              {[
                { icon: BookOpen, label: "26 Sub-skills", sub: "Comprehensive" },
                { icon: Download, label: "Offline Mode", sub: "PDF Downloads" },
                { icon: Search, label: "Searchable", sub: "Quick Access" },
                { icon: Layers, label: "Categorized", sub: "Structured" }
              ].map((feature, i) => (
                <div key={i} className="p-5 rounded-3xl bg-white/5 border border-white/5 hover:border-blue-500/20 transition-colors group/feat">
                  <feature.icon size={20} className="text-blue-500 mb-3 group-hover/feat:scale-110 transition-transform" />
                  <p className="text-[11px] font-black text-white uppercase tracking-wider mb-1">{feature.label}</p>
                  <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest italic">{feature.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div id="question-bank-container" className="pointer-events-auto mt-10">
        <div className="mb-6 px-4 flex items-end justify-between">
          <div>
            <h2 className="text-[10px] font-[900] uppercase tracking-[0.5em] text-[#5ed29c] mb-2 italic opacity-80">Repository</h2>
            <h1 className="text-2xl md:text-5xl font-[900] text-white uppercase tracking-tighter italic">Interview <span className="text-white/40">Library.</span></h1>
          </div>
          <button 
            onClick={() => window.location.hash = 'question-bank'}
            className="group flex items-center gap-2 text-[10px] font-black text-[#5ed29c] uppercase tracking-widest italic hover:opacity-80 transition-opacity pb-2"
          >
            Open Full Bank <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
        <div className="p-1 border border-white/5 rounded-[40px] bg-black shadow-2xl relative">
            <QuestionBank limit={15} showFilters={true} showHeader={false} />
            
            <div className="p-8 border-t border-white/5 flex justify-center">
              <button 
                onClick={() => window.location.hash = 'question-bank'}
                className="relative h-[55px] px-10 group active:scale-95 transition-transform"
              >
                <svg className="absolute inset-0 w-full h-full transition-transform group-hover:scale-105 shadow-2xl shadow-[#5ed29c]/10" viewBox="0 0 184 55" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                  <path d="M0 0H184L174 55H10L0 0Z" fill="#5ed29c" />
                </svg>
                <span className="relative z-10 flex items-center justify-center h-full text-[#070b0a] font-[900] text-[11px] uppercase tracking-[0.2em] gap-3 italic">
                   Load More Questions <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
            </div>
        </div>
      </div>
    </div>
  );

  const renderResumeLab = () => {
    if (resumeWorkspace === 'maker') {
      return (
        <div className="space-y-12 pb-20 selection:bg-white selection:text-black">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => setResumeWorkspace('selection')}
              className="group flex items-center gap-3 text-white/40 hover:text-white transition-all  font-black uppercase tracking-[0.3em] text-[10px]"
            >
              <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
              Exit Workspace
            </button>
            <div className="flex gap-4">
               <span className="text-[10px]  font-black text-white/20 uppercase tracking-[0.4em]">AI Generation Active</span>
            </div>
          </div>

          {/* AI RESUME MAKER CONTENT */}
          <div className="lg:col-span-12">
            <GlassCard className="rounded-[40px] p-8 md:p-12 bg-[#0a0c10]/60 border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity">
                <Sparkles size={120} />
              </div>
              
              <div className="relative z-10 max-w-4xl">
                <div className="flex items-center gap-4 text-[10px]  font-[900] uppercase tracking-[0.4em] text-code-green mb-8">
                  <Bot size={20} strokeWidth={2.5} />
                  AI Generation Engine
                </div>
                
                <h3 className="text-3xl md:text-5xl  font-[900] text-white uppercase tracking-tighter mb-8 leading-none italic">
                  Resume <span className="text-white/40">Maker.</span>
                </h3>
                
                <p className="text-[16px] md:text-[18px] text-white/50 mb-12  leading-relaxed max-w-2xl font-medium tracking-tight">
                  Leverage Prepzo's neural engine to generate high-fidelity, professional resumes from your profile data. Optimized for target roles and elite placements.
                </p>

                <div className="grid gap-8 md:grid-cols-3 mb-12">
                   <div className="space-y-4">
                      <p className="text-[10px]  font-[900] uppercase tracking-[0.3em] text-white/30">Target Role</p>
                      <SearchableDropdown
                        value={resumeRoleInput}
                        onChange={setResumeRoleInput}
                        options={resumeRoleOptions}
                        placeholder="Select Role"
                        icon={Target}
                        searchable={false}
                      />
                   </div>
                   <div className="space-y-4">
                      <p className="text-[10px]  font-[900] uppercase tracking-[0.3em] text-white/30">Job Context (Optional)</p>
                      <SearchableDropdown
                        value={selectedDemoJD}
                        onChange={setSelectedDemoJD}
                        options={demoJDOptions}
                        placeholder="Select Demo JD"
                        icon={FileText}
                        searchable={false}
                      />
                   </div>
                   <div className="space-y-4">
                      <p className="text-[10px]  font-[900] uppercase tracking-[0.3em] text-white/30">Source Data</p>
                      <div className="flex gap-2 h-[42px]">
                        <button 
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isResumeUploading}
                          className="flex-1 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center gap-2 hover:bg-white/10 transition-colors text-xs  font-bold text-white/60"
                        >
                          {isResumeUploading ? <ThinkingLoader /> : <Upload className="w-4 h-4" />}
                          {resumeInfo?.resumeUrl ? 'Update' : 'Upload'}
                        </button>
                        <button 
                          onClick={() => {
                            const text = autofillResumeText();
                            if (text) {
                              setResumeTextInput(text);
                              showSuccess('Profile data synchronized!');
                            } else {
                              showError('No profile data found. Upload a resume first.');
                            }
                          }}
                          className="flex-1 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-500/20 transition-colors text-xs  font-bold text-indigo-400"
                        >
                          <Sparkles className="w-4 h-4" />
                          Autofill
                        </button>
                        {resumeInfo?.resumeUrl && (
                          <div className="px-4 bg-code-green/10 border border-code-green/20 rounded-xl flex items-center justify-center text-code-green">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept=".pdf,.doc,.docx"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setIsResumeUploading(true);
                          try {
                            await uploadApi.uploadResume(file);
                            const info = await uploadApi.getResumeInfo();
                            setResumeInfo(info);
                            showSuccess('Resume uploaded successfully! AI will now extract this data.');
                          } catch {
                            showError('Failed to upload resume');
                          } finally {
                            setIsResumeUploading(false);
                          }
                        }}
                      />
                   </div>
                </div>

                {/* VISUAL TEMPLATE GALLERY */}
                <div className="mb-12">
                  <p className="text-[10px]  font-[900] uppercase tracking-[0.3em] text-white/30 mb-6">Architectural Layout</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {templateOptions.map((template) => (
                      <button
                        key={template.value}
                        onClick={() => setTemplateInput(template.value)}
                        className={`group relative h-48 rounded-3xl border transition-all duration-300 overflow-hidden flex flex-col items-center justify-center p-4 ${
                          templateInput === template.value 
                            ? 'border-indigo-500 bg-indigo-500/10 shadow-[0_0_30px_-5px_rgba(99,102,241,0.3)]' 
                            : 'border-white/5 bg-[#0a0c10]/80 hover:bg-white/5 hover:border-white/20'
                        }`}
                      >
                        {/* Abstract mini-resume wireframe */}
                        <div className={`w-16 h-20 rounded-lg mb-5 flex flex-col gap-1.5 p-2 transition-all duration-500 ${
                          templateInput === template.value 
                            ? 'bg-indigo-950/40 border-2 border-indigo-500/50 scale-110 shadow-lg' 
                            : 'bg-black/40 border border-white/10 group-hover:scale-105 group-hover:border-white/20'
                        }`}>
                           {/* Header */}
                           <div className={`h-2 rounded-sm w-full opacity-80 ${['Modern Creative', 'AltaCV Modern'].includes(template.value) ? 'bg-emerald-400' : template.value === 'MBZUAI Academic' ? 'bg-blue-600' : 'bg-indigo-400'}`} />
                           {/* Body lines */}
                           <div className="h-1 rounded-sm w-2/3 bg-white/30 mt-1" />
                           <div className="h-1 rounded-sm w-full bg-white/20" />
                           <div className="h-1 rounded-sm w-5/6 bg-white/20" />
                           {/* Multi-column layouts depending on template logic */}
                           <div className="flex gap-1 mt-1.5 flex-1">
                             <div className={`h-full rounded-sm ${['Minimalist Tech', 'Jakes Resume'].includes(template.value) ? 'w-1/2 bg-white/10' : template.value === 'Simple Hipster' ? 'w-1/3 bg-slate-500' : 'w-1/3 bg-white/20'}`} />
                             <div className={`h-full rounded-sm ${['Executive Leadership', 'MBZUAI Academic', 'Jakes Resume'].includes(template.value) ? 'w-full bg-indigo-400/20' : 'w-2/3 bg-white/10'}`} />
                           </div>
                        </div>

                        <p className={`text-[10px]  font-black uppercase tracking-widest text-center px-2 leading-relaxed ${
                            templateInput === template.value ? 'text-indigo-300' : 'text-white/50'
                        }`}>
                          {template.label}
                        </p>
                        
                        {templateInput === template.value && (
                          <div className="absolute top-4 right-4 animate-in fade-in zoom-in duration-300">
                            <CheckCircle2 className="w-5 h-5 text-indigo-500" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Feature List */}
                <div className="grid grid-cols-2 gap-4 mb-12">
                  {[
                    { icon: Shield, label: "ATS Guard", sub: "Anti-rejection logic" },
                    { icon: Zap, label: "Neural Flow", sub: "Natural phrasing" },
                    { icon: Award, label: "Impact Sync", sub: "Outcome-driven data" },
                    { icon: Brain, label: "Core Mapping", sub: "Skill alignment" }
                  ].map((item, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                      <item.icon className="w-5 h-5 text-indigo-400 mb-2" />
                      <p className="text-[11px]  font-black text-white uppercase tracking-wider">{item.label}</p>
                      <p className="text-[9px]  text-white/40 uppercase tracking-widest italic">{item.sub}</p>
                    </div>
                  ))}
                </div>

                {/* AI Output Card */}
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-b from-indigo-500/20 to-transparent rounded-[32px] blur-sm opacity-50"></div>
                  <GlassCard className="relative p-8 border-white/5 bg-[#0a0c10]/40 min-h-[600px] flex flex-col rounded-[32px] backdrop-blur-3xl">
                    <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <h3 className="text-sm  font-black text-white/60 uppercase tracking-widest">Live Preview</h3>
                      </div>
                      {generatedResume && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                               const doc = new jsPDF();
                               doc.setFont('helvetica', 'normal');
                               doc.setFontSize(10);
                               const lines = doc.splitTextToSize(generatedResume.markdown, 180);
                               doc.text(lines, 14, 20);
                               doc.save(`${user?.fullName || 'Candidate'}_AI_Resume.pdf`);
                            }}
                            className="group/btn px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-400 text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500/20 transition-all flex items-center gap-2"
                          >
                            <Download className="w-3.5 h-3.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                            PDF
                          </button>
                          <button
                            onClick={() => {
                               if (generatedResume.resume_data) {
                                 exportToDocx(generatedResume.resume_data, `${user?.fullName || 'Candidate'}_AI_Resume.docx`);
                               }
                            }}
                            className="group/btn px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400 text-[10px] font-black uppercase tracking-widest hover:bg-blue-500/20 transition-all flex items-center gap-2"
                          >
                            <FileCode className="w-3.5 h-3.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                            WORD
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 overflow-auto max-h-[700px] custom-scrollbar rounded-xl bg-white/5 border border-white/10 p-6 flex flex-col justify-start">
                      {generatedResume ? (
                        <div className="w-full transform scale-[0.9] origin-top">
                          <ResumeRenderer 
                             data={generatedResume.resume_data} 
                             markdownFallback={generatedResume.markdown} 
                             template={templateInput} 
                          />
                        </div>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center py-20">
                           <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-6">
                              <Brain className="w-8 h-8 text-white/10" />
                           </div>
                           <p className="text-[11px]  font-black text-white/20 uppercase tracking-[0.3em] font-black italic">Waiting for signal...</p>
                           <p className="text-[9px]  font-black text-white/10 uppercase tracking-widest mt-2 max-w-[200px]">Configure your target role and hit generate to craft your professional identity.</p>
                        </div>
                      )}
                    </div>
                  </GlassCard>
                </div>

                <div className="relative group mt-8">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                  <button
                    disabled={resumeGenerationLoading || resumeAnalysisLoading}
                    onClick={async () => {
                      const role = resumeRoleInput || user?.targetRole || 'Software Engineer';
                      
                      try {
                        if (resumeInfo?.resumeUrl && !resumeAnalysis) {
                          showInfo('Extracting deep components from previous resume...');
                          await analyzeResume('', role, undefined);
                          showSuccess('Extraction complete. Compiling specific architectural layout.');
                        }
                        
                        await generateResume(role, jobDescriptionInput || undefined, templateInput);
                        showSuccess('Resume analyzed successfully!');
                      } catch (error: any) {
                        showError(error.response?.data?.message || 'Resume analysis failed');
                      }
                    }}
                    className="relative w-full py-4 px-8 bg-[#000000] border border-white/10 rounded-xl text-white  font-black uppercase tracking-widest hover:border-indigo-500/50 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                  >
                    {resumeGenerationLoading ? (
                      <>
                        <ThinkingLoader />
                        <span>Assembling Identity...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 text-blue-400" />
                        <span>Generate AI Resume</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      );
    }

    if (resumeWorkspace === 'ats') {
      return (
        <div className="space-y-12 pb-20 selection:bg-white selection:text-black">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => setResumeWorkspace('selection')}
              className="group flex items-center gap-3 text-white/40 hover:text-white transition-all  font-black uppercase tracking-[0.3em] text-[10px]"
            >
              <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
              Exit Workspace
            </button>
            <div className="flex gap-4">
              <GlassButton variant="secondary" onClick={exportAtsReportPdf} className="rounded-xl px-6 text-[10px] font-black">
                Export Report
              </GlassButton>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
            <div className="lg:col-span-8 space-y-8">
              <GlassCard className="rounded-[40px] p-8 md:p-12 bg-[#0a0c10]/60 border-white/5 relative overflow-hidden">
                <div className="flex items-center gap-4 text-[10px]  font-[900] uppercase tracking-[0.4em] text-white/30 mb-8">
                  <FileText size={20} />
                  Deep Scan Engine
                </div>

                <h3 className="text-3xl md:text-5xl  font-[900] text-white uppercase tracking-tighter mb-8 italic">
                  ATS Score <span className="text-white/40">Checker.</span>
                </h3>

                <div className="space-y-6">
                  <textarea
                    value={resumeTextInput}
                    onChange={(event) => setResumeTextInput(event.target.value)}
                    placeholder="Paste resume content for deep ATS validation..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-white/60  font-medium min-h-[200px] focus:outline-none focus:border-white/30 transition-colors"
                  />

                  <textarea
                    value={jobDescriptionInput}
                    onChange={(event) => setJobDescriptionInput(event.target.value)}
                    placeholder="Paste Job Description for role-match analysis (optional)..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-white/60  font-medium min-h-[120px] focus:outline-none focus:border-white/30 transition-colors"
                  />

                  <div className="flex flex-wrap gap-4">
                    <GlassButton
                      variant="primary"
                      disabled={resumeAnalysisLoading || isResumeUploading}
                      onClick={async () => {
                        const hasText = resumeTextInput.trim().length > 0;
                        const role = resumeRoleInput || user?.targetRole || 'Software Engineer';
                        if (!hasText && !resumeInfo?.resumeUrl) {
                          showError('Input resume text or upload a file first.');
                          return;
                        }
                        showInfo('Analyzing resume...');
                        try {
                          await analyzeResume(resumeTextInput, role, jobDescriptionInput || undefined);
                          showSuccess('Resume analyzed successfully!');
                        } catch (error: any) {
                          showError(error.response?.data?.message || 'Resume analysis failed');
                        }
                      }}
                      className="h-[55px] px-10 rounded-xl"
                    >
                      {resumeAnalysisLoading ? 'Analyzing Signal...' : 'Run Deep Scan'}
                    </GlassButton>
                    
                    <GlassButton variant="secondary" onClick={() => fileInputRef.current?.click()} className="h-[55px] px-8 rounded-xl border-white/10 text-[10px]">
                      {isResumeUploading ? 'Uploading...' : 'Upload'}
                    </GlassButton>

                    <GlassButton 
                      variant="secondary" 
                      onClick={() => {
                        const text = autofillResumeText();
                        if (text) {
                          setResumeTextInput(text);
                          showSuccess('Profile data synchronized!');
                        } else {
                          showError('No profile data found. Upload a resume first.');
                        }
                      }} 
                      className="h-[55px] px-8 rounded-xl border-white/10 text-[10px] text-indigo-400"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Autofill
                    </GlassButton>
                    
                    {/* The ATS Optimization Generator Hook */}
                     <GlassButton 
                      variant="primary" 
                      disabled={resumeGenerationLoading}
                      onClick={async () => {
                        setTemplateInput('Standard Professional ATS');
                        setResumeWorkspace('maker');
                        const role = resumeRoleInput || user?.targetRole || 'Software Engineer';
                        showInfo('Optimizing structural syntax for ATS compliance...');
                        try {
                           await generateResume(role, jobDescriptionInput || undefined, 'Standard Professional ATS');
                           showSuccess('Optimization complete!');
                        } catch {
                           showError('Auto-generation failed. Check neural link.');
                        }
                      }}
                      className="h-[55px] px-10 rounded-xl bg-code-green/10 text-code-green hover:bg-code-green/20 border border-code-green/30 ml-auto"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      {resumeGenerationLoading ? 'Reconstructing Layout...' : 'Generate High ATS Resume'}
                    </GlassButton>

                    <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setIsResumeUploading(true);
                      try {
                        await uploadApi.uploadResume(file);
                        showSuccess('Resume uploaded! You can now analyze or auto-optimize.');
                      } catch { showError('Upload failed.'); }
                      finally { setIsResumeUploading(false); }
                    }} />
                  </div>
                </div>
              </GlassCard>

              <div className="grid gap-6 md:grid-cols-3">
                {[
                  { label: 'ATS Signal', value: formatVal(atsScore), unit: '%' },
                  { label: 'Success Prob', value: formatVal(interviewSuccess?.probability || 0), unit: '%' },
                  { label: 'Global Rank', value: ranking?.percentile ? 100 - ranking.percentile : 100, unit: '', prefix: 'Top ' },
                ].map((stat) => ( stat && (
                  <div key={stat.label} className="bg-white/5 border border-white/10 rounded-[32px] p-8 text-left">
                    <p className="text-[10px]  font-[900] uppercase tracking-widest text-white/20 mb-4">{stat.label}</p>
                    <p className="text-4xl  font-[900] text-white tracking-tighter italic">
                      {stat.prefix}{stat.value}<span className="text-lg opacity-40 ml-1">{stat.unit}</span>
                    </p>
                  </div>
                )))}
              </div>

              <GlassCard className="rounded-[32px] p-8 bg-[#0a0c10]/60 border-white/5">
                <div className="flex items-center justify-between mb-8">
                  <p className="text-[10px]  font-[900] uppercase tracking-[0.3em] text-white/30">Structural Integrity</p>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-indigo-500" />
                    <span className="text-[9px] font-black uppercase text-indigo-400 tracking-widest">Parser Ready</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  {(resumeAnalysis?.sections || []).map(section => (
                    <div key={section.name} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                      <div className="flex items-center gap-3">
                        <div className={`w-1.5 h-1.5 rounded-full ${section.score >= 70 ? 'bg-code-green' : 'bg-amber-500'}`} />
                        <span className="text-[10px] font-black uppercase text-white/60 tracking-wider">{section.name}</span>
                      </div>
                      <span className={`text-[10px] font-black ${section.score >= 70 ? 'text-code-green' : 'text-amber-500'}`}>{section.score}%</span>
                    </div>
                  ))}
                  {(!resumeAnalysis?.sections || resumeAnalysis.sections.length === 0) && (
                    <p className="col-span-2 text-center py-4 text-[10px] font-black text-white/10 uppercase tracking-widest italic">No sections detected yet.</p>
                  )}
                </div>
              </GlassCard>
              
              <GlassCard className="rounded-[32px] p-8 bg-[#0a0c10]/60 border-white/5">
                <div className="flex items-center justify-between mb-8">
                  <p className="text-[10px]  font-[900] uppercase tracking-[0.3em] text-white/30">Keyword Delta</p>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-code-green" />
                    <span className="text-[9px] font-black uppercase text-code-green tracking-widest">Live Sync</span>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <p className="text-[12px]  font-[900] text-white uppercase tracking-widest mb-4">Matched Signals</p>
                    <div className="flex flex-wrap gap-2">
                      {(keywordLens?.matchedKeywords?.slice(0, 12) || []).map(k => (
                        <span key={k} className="bg-code-green/10 border border-code-green/30 text-code-green text-[10px] font-black uppercase px-3 py-1.5 rounded-full tracking-wider">
                          {k}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-[12px]  font-[900] text-white/40 uppercase tracking-widest mb-4">Missing Gaps</p>
                    <div className="flex flex-wrap gap-2">
                      {(keywordLens?.missingKeywords?.slice(0, 12) || []).map(k => (
                        <span key={k} className="bg-white/5 border border-white/10 text-white/30 text-[10px] font-black uppercase px-3 py-1.5 rounded-full tracking-wider italic">
                          {k}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </GlassCard>
            </div>

            <div className="lg:col-span-4 space-y-8">
              <GlassCard className="rounded-[32px] p-8 bg-[#0a0c10]/60 border-white/5">
                <p className="text-[10px]  font-[900] uppercase tracking-[0.5em] text-white/30 mb-8">Score History</p>
                <div className="flex h-40 items-end gap-2 mb-6">
                  {atsTrend.map((point, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                        <div 
                          className="w-full bg-white/5 group-hover:bg-white/10 transition-colors rounded-t-lg relative"
                          style={{ height: `${Math.max(10, (point.score || 0))}%` }}
                        >
                          <div className="absolute top-0 left-0 w-full h-[2px] bg-white opacity-20" />
                        </div>
                        <span className="text-[9px] font-black text-white/20 italic">{formatVal(point.score)}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[11px]  font-medium italic text-white/30 text-center">Historical ATS movement across versions.</p>
              </GlassCard>

              <GlassCard className="rounded-[32px] p-8 bg-[#0a0c10]/60 border-white/5">
                  <p className="text-[10px]  font-[900] uppercase tracking-[0.5em] text-white/30 mb-8">AI Rewrite Delta</p>
                  <div className="space-y-4">
                    {rewriteLines.slice(0, 4).map((line, i) => (
                        <div key={i} className="bg-white/5 border border-white/5 rounded-2xl p-5 hover:bg-white/10 transition-colors">
                          <p className="text-[10px]  font-[900] uppercase text-white/20 mb-3 tracking-widest">Impact Layer {i+1}</p>
                          <p className="text-[13px]  font-black text-white uppercase tracking-tight leading-snug italic line-clamp-2">
                              "{line.improved}"
                          </p>
                        </div>
                    ))}
                  </div>
              </GlassCard>
              
              <GlassCard className="rounded-[32px] p-8 bg-[#0a0c10]/60 border-white/5">
                  <p className="text-[10px]  font-[900] uppercase tracking-[0.5em] text-white/30 mb-8">Recruiter Sentiment</p>
                  <div className="space-y-4">
                    {recruiterSimulation?.strengths?.slice(0, 3).map((s, i) => (
                      <div key={i} className="flex items-center gap-4 text-code-green">
                          <ShieldCheck size={14} className="opacity-40" />
                          <span className="text-[11px]  font-black uppercase tracking-widest leading-none">{s}</span>
                      </div>
                    ))}
                    <div className="pt-4 border-t border-white/5">
                        <p className="text-[12px]  font-medium leading-relaxed text-white/40 italic">
                          {recruiterSimulation?.recommendation || "Maintain consistent technical signal across all sections."}
                        </p>
                    </div>
                  </div>
              </GlassCard>
            </div>
          </div>
        </div>
      );
    }

    if (resumeWorkspace === 'gallery') {
      return (
        <div className="space-y-12 pb-20 selection:bg-white selection:text-black">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => setResumeWorkspace('selection')}
              className="group flex items-center gap-3 text-white/40 hover:text-white transition-all  font-black uppercase tracking-[0.3em] text-[10px]"
            >
              <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
              Exit Workspace
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-10">
            {/* Sidebar Navigation */}
            <div className="w-full md:w-64 shrink-0 space-y-8 hidden md:block">
               <div className="space-y-1">
                 <button className="w-full text-left px-4 py-2 bg-indigo-500/10 text-indigo-400  font-black text-xs uppercase tracking-widest rounded-lg">All</button>
                 <button className="w-full text-left px-4 py-2 text-white/40 hover:text-white hover:bg-white/5 transition-colors  font-black text-xs uppercase tracking-widest rounded-lg">Templates</button>
                 <button className="w-full text-left px-4 py-2 text-white/40 hover:text-white hover:bg-white/5 transition-colors  font-black text-xs uppercase tracking-widest rounded-lg">Examples</button>
               </div>

               <div>
                 <p className="px-4 text-[10px]  font-black text-white/20 uppercase tracking-[0.3em] mb-4">Related Tags</p>
                 <div className="space-y-1">
                   {['Cover Letter', 'Math', 'Software', 'University', 'Formal letters', 'Assignments', 'Academic'].map(tag => (
                     <button key={tag} className="w-full text-left px-4 py-1.5 text-white/40 hover:text-white hover:bg-white/5 transition-colors  font-bold text-[11px] tracking-wider rounded-lg">
                       {tag}
                     </button>
                   ))}
                 </div>
               </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1">
               <div className="mb-10">
                 <h2 className="text-3xl md:text-4xl  font-[900] text-white tracking-tighter italic mb-4">
                   Make a great first impression with our popular LaTeX templates for CVs and résumés.
                 </h2>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {allTemplates.map((template: any) => (
                   <div key={template.id} className="group bg-[#1a1c23] border border-white/5 rounded-2xl overflow-hidden hover:border-white/20 transition-all flex flex-col">
                      <div className="aspect-[1/1.2] bg-[#22252a] relative border-b border-white/5 flex items-center justify-center object-cover">
                         {/* Render actual image scraped from Overleaf */}
                         <img src={template.image} alt={template.title} className="w-full h-full object-cover object-top opacity-70 group-hover:opacity-100 transition-opacity" />

                         {template.badge && (
                           <div className="absolute top-4 left-4 px-2 py-1 bg-code-green/20 border border-code-green/30 text-code-green text-[9px]  font-black uppercase tracking-widest rounded shadow-lg backdrop-blur-md">
                             {template.badge}
                           </div>
                         )}

                         {/* Hover Overlay Action */}
                         <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 backdrop-blur-sm">
                           <button onClick={() => { setTemplateInput(template.title); setResumeWorkspace('maker'); }} className="px-6 py-2 bg-indigo-500 hover:bg-indigo-600 text-white  font-black text-[11px] uppercase tracking-widest rounded-lg transition-colors">
                             Open as Template
                           </button>
                         </div>
                      </div>
                      <div className="p-6 flex flex-col flex-1">
                        <h3 className="text-[14px]  font-[900] text-white tracking-widest uppercase mb-3 line-clamp-2">{template.title}</h3>
                        <p className="text-[12px]  text-white/50 italic leading-relaxed line-clamp-3 mb-4 flex-1">
                          {template.description}
                        </p>
                      </div>
                   </div>
                 ))}
               </div>

               {/* Pagination */}
               <div className="mt-12 flex justify-center items-center gap-2">
                 <button className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400  font-black flex items-center justify-center">1</button>
                 <button className="w-10 h-10 rounded-lg border border-white/5 hover:border-white/10 hover:bg-white/5 text-white/40  font-black flex items-center justify-center transition-colors">2</button>
                 <button className="w-10 h-10 rounded-lg border border-white/5 hover:border-white/10 hover:bg-white/5 text-white/40  font-black flex items-center justify-center transition-colors">3</button>
                 <span className="text-white/40 px-2">...</span>
                 <button className="w-10 h-10 rounded-lg border border-white/5 hover:border-white/10 hover:bg-white/5 text-white/40  font-black flex items-center justify-center transition-colors">36</button>
                 <button className="px-4 h-10 rounded-lg border border-white/5 hover:border-white/10 hover:bg-white/5 text-white/40  font-black text-[11px] uppercase tracking-widest flex items-center justify-center transition-colors">Next</button>
               </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-12 pb-20 selection:bg-white selection:text-black">
        {/* Workspace Selection Header */}
        <div className="text-center md:text-left">
          <p className="text-[11px]  font-[900] uppercase tracking-[0.6em] text-white/20 mb-4">Command Center</p>
          <h2 className="text-4xl md:text-7xl  font-[900] tracking-tighter text-white uppercase leading-[0.85] italic mb-12">
            Resume <span className="text-white/40">Lab.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {/* AI Resume Maker Workspace Card */}
          <div
            onClick={() => setResumeWorkspace('maker')}
            className="cursor-pointer bg-gradient-to-b from-[#2a2d36] to-[#1c1e24] shadow-2xl border border-white/5 rounded-3xl p-8 md:p-10 transition-transform hover:-translate-y-1 flex flex-col min-h-[380px]"
          >
             <p className="text-[11px]  font-black text-gray-400 uppercase tracking-[0.2em] mb-10">
                TEMPLATE WORKSPACE
             </p>
             
             <h3 className="text-4xl md:text-5xl  font-[900] text-white uppercase italic mb-8">
                TEMPLATE MAKER
             </h3>
             
             <p className="text-[15px]  font-semibold text-gray-400 italic leading-relaxed mb-auto max-w-sm">
                Choose from a wide range of resume templates, similar to Overleaf, covering different fields. Upload your previous resume and the AI will extract all relevant details and automatically generate a new resume in the chosen template with properly formatted information.
             </p>
             
             <div className="mt-12 flex items-center gap-3 text-white  font-black uppercase tracking-widest text-[12px]">
                ENTER WORKSPACE <ArrowRight className="w-4 h-4" />
             </div>
          </div>

          {/* ATS Score Checker Workspace Card */}
          <div
            onClick={() => setResumeWorkspace('ats')}
            className="cursor-pointer bg-gradient-to-b from-[#2a2d36] to-[#1c1e24] shadow-2xl border border-white/5 rounded-3xl p-8 md:p-10 transition-transform hover:-translate-y-1 flex flex-col min-h-[380px]"
          >
             <p className="text-[11px]  font-black text-gray-400 uppercase tracking-[0.2em] mb-10">
                OPTIMIZER WORKSPACE
             </p>
             
             <h3 className="text-4xl md:text-5xl  font-[900] text-white uppercase italic mb-8">
                ATS OPTIMIZER
             </h3>
             
             <p className="text-[15px]  font-semibold text-gray-400 italic leading-relaxed mb-auto max-w-sm">
                Upload your existing resume or manually enter your details. The AI will then optimize the content and create a high ATS (Applicant Tracking System) score resume automatically.
             </p>
             
             <div className="mt-12 flex items-center gap-3 text-white  font-black uppercase tracking-widest text-[12px]">
                ENTER WORKSPACE <ArrowRight className="w-4 h-4" />
             </div>
          </div>

          {/* Template Gallery Card */}
          <div
            onClick={() => setResumeWorkspace('gallery')}
            className="cursor-pointer bg-gradient-to-b from-[#2a2d36] to-[#1c1e24] shadow-2xl border border-white/5 rounded-3xl p-8 md:p-10 transition-transform hover:-translate-y-1 flex flex-col min-h-[380px]"
          >
             <p className="text-[11px]  font-black text-gray-400 uppercase tracking-[0.2em] mb-10">
                GALLERY WORKSPACE
             </p>
             
             <h3 className="text-4xl md:text-5xl  font-[900] text-white uppercase italic mb-8">
                TEMPLATES
             </h3>
             
             <p className="text-[15px]  font-semibold text-gray-400 italic leading-relaxed mb-auto max-w-sm">
                Explore a vast collection of ATS-optimized resume templates. Browse our gallery inspired by the best professional structures to find the perfect format for your job applications.
             </p>
             
             <div className="mt-12 flex items-center gap-3 text-white  font-black uppercase tracking-widest text-[12px]">
                ENTER WORKSPACE <ArrowRight className="w-4 h-4" />
             </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAssessment = () => {
    if (startAssessment) {
      return (
        <ProctoredAssessment
          testMode={startAssessment as 'field' | 'skills'}
          onBack={() => setStartAssessment(false)}
          onComplete={(results: any) => {
            const mode = startAssessment;
            setStartAssessment(false);
            
            if (user && typeof user === 'object') {
              const updates: any = {};
              if (mode === 'field') {
                updates.isFieldTestComplete = true;
                updates.fieldAssessmentResults = {
                  ...results,
                  completedAt: new Date().toISOString()
                };
              }
              if (mode === 'skills') {
                updates.isSkillTestComplete = true;
                updates.skillAssessmentResults = {
                  ...results,
                  completedAt: new Date().toISOString()
                };
              }
              
              // Local state check for dual completion
              const isFieldDone = mode === 'field' || user.isFieldTestComplete;
              const isSkillDone = mode === 'skills' || user.isSkillTestComplete;
              
              if (isFieldDone && isSkillDone) {
                updates.isAssessmentComplete = true;
                setShowFullRecommendations(true);
              }
              
              updates.lastAssessmentAt = new Date().toISOString();
              
              // Sync to backend
              completeAssessmentAsync(updates);
            }
            
            showSuccess(`${mode === 'field' ? 'Stage 1' : 'Stage 2'} Assessment Completed!`);
          }}
        />
      );
    }

    const isLocked = !!user?.isAssessmentLocked;
    const unlockDate = user?.assessmentUnlockDate ? new Date(user.assessmentUnlockDate) : null;

    return (
      <div className="max-w-6xl mx-auto grid grid-cols-1 gap-8 lg:grid-cols-2 selection:bg-white selection:text-black font-rubik">
        <div className="rounded-[40px] p-10 md:p-14 bg-black border border-[#5ed29c]/20 relative overflow-hidden group shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#5ed29c]/30 to-transparent" />
          
          <p className="text-[11px] font-[900] uppercase tracking-[0.5em] text-[#5ed29c] mb-10 opacity-60">Operational Studio</p>
          <div className="flex items-center gap-4 mb-10">
            <h2 className="text-4xl md:text-5xl font-[900] text-white uppercase tracking-tighter italic leading-none">Skill <span className="text-white/30">Signal.</span></h2>
            {isLocked && (
              <span className="flex items-center gap-3 px-5 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full text-[11px] font-[900] text-amber-500 uppercase tracking-widest italic animate-pulse">
                <Lock size={14} /> LOCKED
              </span>
            )}
          </div>
          
          {isLocked ? (
            <div className="mb-10">
              <p className="text-[17px] font-medium tracking-tight leading-relaxed text-amber-500/30 mb-8 italic max-w-sm">
                Terminals offline. Neural calibration in sync. Signal restoration required for access.
              </p>
              <div className="inline-block p-8 bg-amber-500/5 border border-amber-500/10 rounded-[32px]">
                <p className="text-[11px] font-[900] text-amber-500/30 uppercase tracking-[0.4em] mb-2 italic">Sync Window</p>
                <p className="text-3xl font-[900] text-white uppercase tracking-tighter">{unlockDate?.toLocaleDateString()}</p>
              </div>
            </div>
          ) : (
            <p className="text-[17px] font-medium tracking-tight leading-relaxed text-white/20 mb-12 max-w-md italic">
               Launch your proctored assessment in high-fidelity obsidian matrix.
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => !isLocked && setStartAssessment('field')}
                disabled={isLocked}
                className={`relative h-[65px] px-10 group active:scale-95 transition-transform ${isLocked ? 'opacity-20 cursor-not-allowed grayscale' : ''}`}
              >
                {!isLocked && (
                  <svg className="absolute inset-0 w-full h-full transition-transform group-hover:scale-105" viewBox="0 0 184 65" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                    <path d="M0 0H184L174 65H10L0 0Z" fill="#5ed29c" />
                  </svg>
                )}
                {isLocked && <div className="absolute inset-0 w-full h-full bg-white/5 border border-white/10 rounded-2xl" />}
                <span className={`relative z-10 flex items-center justify-center h-full ${isLocked ? 'text-white/40' : 'text-black'} font-[900] text-[12px] uppercase tracking-[0.2em] gap-3 italic`}>
                  {isFieldComplete ? 'Retake Stage 1' : 'Launch Stage 1'} <ArrowRight size={18} />
                </span>
              </button>
              
              <button 
                onClick={() => !isLocked && setStartAssessment('skills')}
                disabled={isLocked || !isFieldComplete}
                className={`relative h-[65px] px-10 group active:scale-95 border rounded-[12px] transition-all hover:bg-[#5ed29c]/10 ${isLocked || !isFieldComplete ? 'opacity-10 cursor-not-allowed grayscale bg-white/5 border-white/10' : 'bg-transparent border-[#5ed29c]/40 text-[#5ed29c]'}`}
              >
                <span className={`relative z-10 flex items-center justify-center h-full font-[900] text-[12px] uppercase tracking-[0.2em] gap-3 italic`}>
                  {isSkillComplete ? 'Retake Stage 2' : 'Launch Stage 2'} <ArrowRight size={18} />
                </span>
              </button>
          </div>
          
          <div className="mt-12">
            <button 
              onClick={() => setShowFullRecommendations(true)}
              className="group flex items-center gap-3 text-[11px] text-white font-[900] uppercase tracking-[0.3em] opacity-20 hover:opacity-100 transition-all italic"
            >
              Analyze Records <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>


        <div className="rounded-[40px] p-10 md:p-14 bg-black border border-white/5 shadow-2xl relative overflow-hidden">
          <p className="text-[11px] font-[900] uppercase tracking-[0.5em] text-white/10 mb-10 italic">Diagnostics</p>
          <div className="grid gap-6 sm:grid-cols-2 mb-12">
            <div className="bg-white/[0.01] border border-white/5 rounded-[32px] p-8">
              <p className="text-[10px] font-[900] uppercase tracking-[0.2em] text-[#5ed29c] mb-2 italic opacity-60">Result</p>
              <p className="text-6xl font-[900] text-white uppercase tracking-tighter italic">{formatVal(user?.testResults?.score || 0)}%</p>
            </div>
            <div className="bg-white/[0.01] border border-white/5 rounded-[32px] p-8">
              <p className="text-[10px] font-[900] uppercase tracking-[0.2em] text-white/5 mb-2 italic">Neural State</p>
              <p className="text-4xl font-[900] text-white uppercase tracking-tighter italic opacity-80">{user?.isAssessmentComplete ? 'ACTIVE' : 'IDLE'}</p>
            </div>
          </div>
          {user?.testResults?.sectionResults?.length ? (
            <div className="space-y-6">
              {user.testResults.sectionResults.map((section) => (
                <SkillBar key={section.name} skill={section.name} level={section.score} />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center border border-dashed border-white/5 rounded-[40px]">
               <p className="text-[12px] font-black italic text-white/5 uppercase tracking-[0.4em]">Grid Offline.</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Target company handlers moved to dedicated Companies workspace.

  const renderOpportunities = () => {
    if (opportunitiesWorkspace === 'selection') {
      return (
        <div className="relative">
          <div className="grid gap-10 md:grid-cols-2 xl:grid-cols-4 selection:bg-white selection:text-black relative z-10">
            {shellCards.map((card, idx) => (
              <GlassCard 
                key={card.title} 
                className="rounded-[40px] p-10 bg-[#0a0c10]/40 border-white/5 flex flex-col justify-between group h-[400px] hover:bg-white/5 transition-all duration-700 relative overflow-hidden backdrop-blur-3xl"
              >
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-700">
                  <Sparkles size={120} className="text-white" />
                </div>
                
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-10 group-hover:border-white/20 transition-colors">
                    {idx === 0 ? <Zap className="text-blue-400" /> : idx === 1 ? <Target className="text-emerald-400" /> : idx === 2 ? <Activity className="text-amber-400" /> : <Bot className="text-purple-400" />}
                  </div>
                  <p className="text-[10px]  font-[900] uppercase tracking-[0.4em] text-white/20 mb-6">{card.title} Workspace</p>
                  <h3 className="text-3xl  font-[900] text-white uppercase tracking-tighter mb-4 italic group-hover:text-blue-400 transition-colors">{card.title}</h3>
                  <p className="text-[13px]  font-medium leading-relaxed text-white/30 italic group-hover:text-white/50 transition-colors">{card.description}</p>
                </div>

                <button 
                  onClick={card.action}
                  className="relative h-14 w-full group/btn overflow-hidden rounded-2xl border border-white/5 hover:border-white/20 transition-all"
                >
                  <div className="absolute inset-0 bg-white opacity-0 group-hover/btn:opacity-5 transition-opacity" />
                  <span className="relative z-10 flex items-center justify-center h-full text-[10px]  font-black uppercase tracking-[0.2em] text-white/60 group-hover/btn:text-white transition-colors gap-3">
                    Enter Workspace <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                  </span>
                </button>
              </GlassCard>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-12 pb-20 selection:bg-white selection:text-black">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => setOpportunitiesWorkspace('selection')}
            className="group flex items-center gap-3 text-white/40 hover:text-white transition-all  font-black uppercase tracking-[0.3em] text-[10px]"
          >
            <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
            Exit Workspace
          </button>
          
          <div className="flex gap-4">
            <h2 className="text-xl  font-[900] text-white uppercase tracking-tighter italic">
              {opportunitiesWorkspace} <span className="text-white/20">Module.</span>
            </h2>
          </div>
        </div>

        {opportunitiesWorkspace === 'jobs' && (
          <div className="space-y-6">
            {/* Headers and list start */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-[10px] font-[900] uppercase tracking-[0.5em] text-white/30 mb-2">Live Opportunity Grid</p>
                <h3 className="text-3xl font-[900] text-white uppercase tracking-tighter italic">
                  Matched <span className="text-blue-400">Openings.</span>
                </h3>
              </div>
              <GlassButton 
                onClick={() => window.location.hash = 'jobs'}
                className="text-[10px] font-black uppercase tracking-widest"
              >
                Open Full Workspace
              </GlassButton>
            </div>

            {dashboardJobsLoading ? (
              <div className="py-20 flex justify-center">
                <ThinkingLoader loadingText="Synchronizing with Global Hiring Tracker..." />
              </div>
            ) : dashboardJobs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dashboardJobs.map((job) => (
                  <GlassCard 
                    key={job._id}
                    className="p-6 border-white/5 hover:border-blue-500/30 transition-all group relative overflow-hidden"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 group-hover:border-blue-500/30 transition-colors">
                          <Building2 className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                          <h4 className="font-black text-white uppercase tracking-tight text-lg group-hover:text-blue-400 transition-colors">{job.title}</h4>
                          <p className="text-xs font-bold text-white/40 uppercase tracking-widest">{job.company?.name || 'Venture Capital'}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-black uppercase bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20">
                        {job.workMode}
                      </span>
                    </div>
                    
                    <p className="text-[13px] font-medium text-white/50 leading-relaxed italic mb-6 line-clamp-2">
                      {job.description}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-[10px] font-black text-white/30 uppercase tracking-[0.1em]">
                          <MapPin size={12} />
                          {job.locations?.[0]?.city || 'Hybrid'}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-black text-white/30 uppercase tracking-[0.1em]">
                          <Briefcase size={12} />
                          {job.jobType?.replace('_', ' ')}
                        </div>
                      </div>
                      <button 
                        onClick={() => window.location.hash = 'jobs'}
                        className="text-[10px] font-black text-blue-400 uppercase tracking-widest hover:text-white transition-colors flex items-center gap-2"
                      >
                        Apply Now <ArrowUpRight size={12} />
                      </button>
                    </div>
                  </GlassCard>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[40px]">
                <p className="text-[11px] font-black text-white/20 uppercase tracking-widest italic">No matching job signals detected in your current radius.</p>
              </div>
            )}
          </div>
        )}

        {/* The sub-workspace views for companies, apps, and network are now handle by full pages. 
            Keeping the 'jobs' lite view for quick dashboard check if needed, but it also has an 'Open Full Workspace' button. */}
      </div>
    );
  };

  const renderSettings = () => (
    <div className="pb-20">
      <SettingsForm />
    </div>
  );

  return (
    <div className="relative w-full min-h-screen bg-[#0a0c10]  text-white overflow-x-hidden selection:bg-white selection:text-black">
      <div className="fixed inset-0 bg-[#0a0c10] -z-50" />
      
      {/* Glassmorphism dashboard lock overlay for new users */}
      {!isFullyQualified && !startAssessment && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-[40px]">
          {/* Back button */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => {
              logout();
              window.location.hash = 'landing';
            }}
            className="fixed left-8 top-8 z-[110] inline-flex items-center gap-4 text-white/60 hover:text-white transition-all uppercase font-bold tracking-widest text-[11px]"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Landing
          </motion.button>

          <div className="max-w-xl w-full mx-4">
             <div className="glass-panel rounded-[40px] p-12 text-center border border-white/10 shadow-2xl bg-white/5 relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200px] h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
                
                <div className="mb-8 relative inline-flex">
                   <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full" />
                   <div className="relative w-20 h-20 rounded-3xl bg-white/10 border border-white/20 flex items-center justify-center">
                      <Lock className="w-8 h-8 text-white animate-pulse" />
                   </div>
                </div>

                <h2 className="text-4xl  font-[900] text-white tracking-tighter uppercase italic mb-4">
                   Terminal <span className="text-blue-400">Locked.</span>
                </h2>
                <p className="text-[15px]  font-semibold text-white/50 leading-relaxed mb-10 max-w-sm mx-auto">
                   Complete the <span className="text-white">Prepzo Tactical Assessment</span> suite to unlock your career engine.
                </p>

                <div className="grid grid-cols-1 gap-4 mb-10">
                   {/* Stage 1 Progress Card */}
                   <div className={`p-6 rounded-3xl border transition-all ${isFieldComplete ? 'bg-green-500/10 border-green-500/30' : 'bg-white/5 border-white/10'}`}>
                      <div className="flex items-center justify-between mb-4">
                         <p className="text-[10px]  font-black text-white/40 uppercase tracking-widest">Stage 01</p>
                         {isFieldComplete ? <CheckCircle className="w-4 h-4 text-green-400" /> : <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />}
                      </div>
                      <h3 className={`text-lg  font-[900] uppercase italic ${isFieldComplete ? 'text-green-400' : 'text-white'}`}>Field Core Assessment</h3>
                      <p className="text-[11px]  font-bold text-white/30 uppercase mt-1 tracking-widest">60 Curated Placement Questions</p>
                      {!isFieldComplete && (
                         <button 
                            onClick={() => { setDashboardTab('assessment'); setStartAssessment('field'); }}
                            className="mt-6 w-full py-4 bg-white text-black  font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl hover:bg-white/90 transition-all active:scale-[0.98]"
                         >
                            Initialize Stage 1
                         </button>
                      )}
                   </div>

                   {/* Stage 2 Progress Card */}
                   <div className={`p-6 rounded-3xl border transition-all ${isSkillComplete ? 'bg-green-500/10 border-green-500/30' : (isFieldComplete ? 'bg-white/5 border-white/10' : 'opacity-40 grayscale border-white/5')}`}>
                      <div className="flex items-center justify-between mb-4">
                         <p className="text-[10px]  font-black text-white/40 uppercase tracking-widest">Stage 02</p>
                         {isSkillComplete ? <CheckCircle className="w-4 h-4 text-green-400" /> : <div className={`w-2 h-2 rounded-full ${isFieldComplete ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]' : 'bg-white/10'}`} />}
                      </div>
                      <h3 className={`text-lg  font-[900] uppercase italic ${isSkillComplete ? 'text-green-400' : 'text-white'}`}>Skill Precision Test</h3>
                      <p className="text-[11px]  font-bold text-white/30 uppercase mt-1 tracking-widest">10 Questions per Selected Expertise</p>
                      {isFieldComplete && !isSkillComplete && (
                         <button 
                            onClick={() => { setDashboardTab('assessment'); setStartAssessment('skills'); }}
                            className="mt-6 w-full py-4 bg-amber-500 text-black  font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl hover:bg-amber-600 transition-all active:scale-[0.98]"
                         >
                            Initialize Stage 2
                         </button>
                      )}
                   </div>
                </div>

                <p className="text-[9px]  font-black text-white/20 uppercase tracking-[0.4em] italic leading-relaxed">
                   AI-GENERATED • PLACEMENT-READY • PROCTORED SECURE
                </p>
             </div>
          </div>
        </div>
      )}

      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute left-[-10%] top-[-10%] h-[500px] w-[500px] rounded-full bg-white/5 blur-[120px] opacity-20" />
        <div className="absolute right-[-10%] bottom-[-10%] h-[600px] w-[600px] rounded-full bg-white/5 blur-[150px] opacity-20" />
      </div>

      {!startAssessment ? (
        <div className="flex w-full">
          <main className="min-w-0 flex-1 relative z-10 flex flex-col bg-[#0a0c10]">
            <div className="absolute inset-0 w-full h-full bg-[#0a0c10] z-0 [mask-image:radial-gradient(transparent,white)] pointer-events-none" />
            <GridBeam className="absolute inset-0" />

            <header className="sticky top-0 z-30 px-6 py-6 flex items-center justify-between pointer-events-none font-rubik">
              <div className="flex items-center gap-6 pointer-events-auto">
                <div className="flex flex-col">
                  <h2 className="text-xl font-[900] uppercase tracking-[0.2em] text-white italic leading-none">
                    {activeTab === 'home' ? 'Cockpit' : activeTab === 'resume' ? 'Resume Lab' : activeTab === 'assessment' ? 'Skill Signal' : activeTab}
                  </h2>
                  <p className="text-[9px] font-[900] text-[#5ed29c] uppercase tracking-[0.3em] mt-1 italic opacity-40">Satellite .01</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 pointer-events-auto">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-[900] text-white uppercase tracking-[0.1em] leading-none">{user?.fullName}</p>
                  <p className="text-[9px] font-[900] text-white/20 uppercase tracking-[0.2em] mt-1 italic">{user?.targetRole || 'Engineer'}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-black border border-white/10 flex items-center justify-center font-[900] text-white text-xs uppercase shadow-lg shadow-[#5ed29c]/5">
                  {user?.fullName?.charAt(0)}
                </div>
              </div>
            </header>
            
            <div className="relative z-10 mx-auto w-full max-w-7xl space-y-12 px-6 pb-32">
              {activeTab === 'home' && (
                <div className="pointer-events-auto">
                    {renderHome()}
                </div>
              )}
              {activeTab === 'resume' && (
                <div className="pointer-events-auto">
                    {renderResumeLab()}
                </div>
              )}
              {activeTab === 'assessment' && (
                <div data-assessment-section className="pointer-events-auto">
                  {renderAssessment()}
                </div>
              )}
              {activeTab === 'opportunities' && (
                <div className="pointer-events-auto">
                    {renderOpportunities()}
                </div>
              )}
              {activeTab === 'settings' && (
                <div className="pointer-events-auto">
                    {renderSettings()}
                </div>
              )}
            </div>
          </main>
        </div>
      ) : (
        <div className="w-full min-h-screen flex flex-col items-center justify-center">
          <div className="w-full max-w-3xl mx-auto">
            {renderAssessment()}
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
