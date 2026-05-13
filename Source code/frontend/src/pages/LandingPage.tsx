import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Zap,
  CheckCircle,
  Users,
  Bot,
  ShieldCheck,
  FileSearch,
  Briefcase,
  TrendingUp,
  Rocket,
  Award,
  BarChart3,
} from 'lucide-react';
import { PrepzoHero } from '@/components/landing/PrepzoHero';
import { PrepzoNavbar } from '@/components/landing/PrepzoNavbar';
import { getPublicStats, PublicStats } from '@/api/public';
import { useState } from 'react';
import { useAppStore } from '@/store/appStore';
import { Boxes } from '@/components/ui/background-boxes';

gsap.registerPlugin(ScrollTrigger);

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

/* ── Journey Steps ───────────────────────────────────────── */
const prepzoJourney = [
  { step: '01', title: 'Join the Nest', desc: 'Secure your place in the Prepzo ecosystem and connect your professional profile.' },
  { step: '02', title: 'Signal Assessment', desc: 'Take dynamic, AI-proctored evaluations to baseline your true technical skill.' },
  { step: '03', title: 'ATS Deep Scan', desc: 'Our analyzers deconstruct your resume and map it directly to industry-standard roles.' },
  { step: '04', title: 'AI Orchestration', desc: 'Your personal mentor designs a hyper-tailored study and interview prep roadmap.' },
  { step: '05', title: 'Verified Placement', desc: 'Apply to top-tier roles with your verified assessment scores and standing.' },
];

/* ── Features ────────────────────────────────────────────── */
const storyFeatures = [
  {
    id: 'mentor',
    eyebrow: 'AI Mentor',
    title: 'A mentor that knows where you\'re stuck before you say a word.',
    description:
      'Prepzo\'s AI reads your assessment scores, resume gaps, and current dashboard tab — then opens a conversation already tailored to your next move. Not scripted. Not generic.',
    icon: Bot,
    color: '#5ed29c',
    highlights: [
      'Context memory across every session',
      'Role-aware study plans and prep paths',
      'Hint mode during live assessments',
    ],
    visual: (
      <div className="relative w-full h-full flex flex-col gap-3 p-2">
        <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-code-green animate-pulse" />
            <span className="text-[10px] text-code-green font-black uppercase tracking-widest">Live Sync: Assessment Session</span>
        </div>
        {[
          { role: 'ai',   text: 'I see your React score dropped to 62%. Want to focus on useEffect?' },
          { role: 'user', text: 'Yes, and also interview tips for frontend roles.' },
          { role: 'ai',   text: 'Perfect. Prepped a 2-day plan. Here\'s a concept map.' },
        ].map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95, x: msg.role === 'ai' ? -20 : 20 }}
            whileInView={{ opacity: 1, scale: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.18, duration: 0.6 }}
            className={`px-5 py-4 rounded-[22px] text-[13px] backdrop-blur-xl ${
              msg.role === 'ai'
                ? 'self-start max-w-[85%] bg-white/5 text-white/80 border border-white/10 shadow-lg'
                : 'self-end max-w-[75%] bg-code-green/20 text-code-green border border-code-green/30 shadow-green-900/10'
            }`}
          >
            {msg.text}
          </motion.div>
        ))}
      </div>
    ),
  },
  {
    id: 'assessment',
    eyebrow: 'Skill Signal',
    title: 'Dynamic questions. Real signals. Never the same paper twice.',
    description:
      'Every assessment draws from a hybrid pool — curated questions plus AI-generated ones unique to your session. Your readiness score reflects genuine skill, not memorized answers.',
    icon: ShieldCheck,
    color: '#38bdf8',
    highlights: [
      'AI-generated questions unique to each session',
      'Section-by-section skill heat map',
      'Proctored with live focus monitoring',
    ],
    visual: (
      <div className="relative p-2 space-y-4 h-full flex flex-col justify-center">
        <div className="bg-white/5 border border-white/10 p-6 rounded-[32px] backdrop-blur-2xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
              <div className="text-[10px] text-code-green font-bold bg-code-green/10 px-2 py-1 rounded">PROCTORED</div>
          </div>
          <p className="text-[10px] text-white/30 mb-4 uppercase tracking-[0.3em] font-bold">React Assessment — Signal #742</p>
          <p className="text-[15px] font-bold text-white mb-6 leading-snug">What cleanup does useEffect return when a subscription is active?</p>
          {['A cleanup function (unsubscribe)', 'A promise rejection handler', 'The previous state value', 'Nothing (null)'].map((opt, i) => (
            <div
              key={i}
              className={`mb-3 px-5 py-4 rounded-[18px] text-[13px] font-bold transition-all ${
                i === 0
                  ? 'bg-code-green/10 border border-code-green/50 text-code-green'
                  : 'bg-white/5 border border-white/5 text-white/30'
              }`}
            >
              {String.fromCharCode(65 + i)}. {opt}
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'resume',
    eyebrow: 'ATS Command Center',
    title: 'ATS feedback rendered as a high-fidelity command room.',
    description:
      'Upload your resume and get a role-matched keyword gap analysis, ATS score, and an ordered list of improvements — all in one narrative surface instead of scattered widgets.',
    icon: FileSearch,
    color: '#10b981',
    highlights: [
      'Keyword gap heatmap per target role',
      'ATS score with section breakdown',
      'Prioritized rewrite suggestions',
    ],
    visual: (
      <div className="p-2 space-y-5 h-full flex flex-col justify-center">
        <div className="bg-white/5 border border-white/10 p-8 rounded-[36px] flex items-center justify-between backdrop-blur-md shadow-2xl">
          <div className="text-left">
            <p className="text-[11px] text-white/30 uppercase tracking-[0.4em] mb-2 font-black">ATS Signal Score</p>
            <p className="text-5xl font-[900] text-white italic tracking-tighter leading-none">82<span className="text-xl text-code-green italic">%</span></p>
          </div>
          <div className="relative">
            <div className="w-20 h-20 rounded-full border-[6px] border-code-green/10" />
            <div className="absolute inset-0 w-20 h-20 rounded-full border-[6px] border-code-green border-r-transparent animate-spin-slow rotate-45" />
          </div>
        </div>
        <div className="space-y-3">
            {[
              { label: 'Cloud Architecture Match', pct: 91, status: 'Strong' },
              { label: 'System Design Patterns', pct: 34, status: 'Gap' },
              { label: 'Production Runtime Exp', pct: 72, status: 'Average' }
            ].map((item, i) => (
              <div key={i} className="bg-white/5 border border-white/10 p-5 rounded-[24px] hover:bg-white/10 transition-colors">
                <div className="flex justify-between items-center mb-3">
                    <span className="text-[11px] text-white/60 uppercase font-black tracking-widest">{item.label}</span>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${item.pct > 80 ? 'text-code-green bg-code-green/10' : item.pct > 50 ? 'text-yellow-500 bg-yellow-500/10' : 'text-red-500 bg-red-500/10'}`}>
                        {item.status}
                    </span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: `${item.pct}%` }}
                        transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                        className={`h-full rounded-full ${item.pct > 80 ? 'bg-code-green' : item.pct > 50 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                    />
                </div>
              </div>
            ))}
        </div>
      </div>
    ),
  },
  {
    id: 'jobs',
    eyebrow: 'Verified Job Radar',
    title: 'Apply with verified signals. Stand out before they click your PDF.',
    description:
      'Every application carries your live assessment scores. Recruiters see your verified skill proof directly linked to job applications through Prepzo.',
    icon: Briefcase,
    color: '#f59e0b',
    highlights: [
      'Skill-verified apply badge per job',
      'AI job match score based on profile',
      '1-click apply using verified data',
    ],
    visual: (
      <div className="p-2 space-y-4 h-full flex flex-col justify-center">
        {[
          { company: 'Zomato', role: 'Staff Frontend Engineer', match: 94, tech: 'React, Next.js, Node' },
          { company: 'Razorpay', role: 'SDE III — Platform', match: 78, tech: 'Golang, AWS, K8s' },
          { company: 'CRED', role: 'Frontend Architect', match: 82, tech: 'React, Swift, Animation' },
        ].map((job, i) => (
          <div key={i} className="bg-white/5 border border-white/10 p-5 rounded-[28px] flex items-center justify-between backdrop-blur-sm group hover:bg-white/10 transition-all cursor-default">
            <div className="text-left">
              <p className="text-[13px] font-black text-white uppercase tracking-tight mb-1">{job.company}</p>
              <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">{job.role}</p>
              <p className="mt-2 text-[9px] text-code-green/60 font-medium uppercase tracking-tighter">{job.tech}</p>
            </div>
            <div className="flex flex-col items-end">
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl font-black text-code-green italic tracking-tighter leading-none">{job.match}%</span>
                    <BarChart3 size={14} className="text-code-green/40" />
                </div>
                <p className="text-[8px] text-white/30 uppercase font-black tracking-[0.2em]">MATCH SIGNAL</p>
            </div>
          </div>
        ))}
      </div>
    ),
  },
];

/* ── Platform Edge ────────────────────────────────────────── */
const platformEdge = [
  { icon: Zap,         title: 'Readiness Score', desc: 'One live number mapping assessment, resume, and activity into recruiter-visible proof.', size: 'full' },
  { icon: Users,       title: 'Peer Benchmark',  desc: 'See how you rank against peers anonymously at the same experience level.', size: 'md' },
  { icon: Award,       title: 'AI Mock Interview', desc: 'Webcam + mic simulation with real-time delivery and logic evaluation.', size: 'md' },
  { icon: Rocket,      title: 'Skill Graph Export', desc: 'A shareable visual verification of your skills built specifically for LinkedIn.', size: 'full' },
];

export const LandingPage = ({ onNavigate }: LandingPageProps) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const [stats, setStats] = useState<PublicStats | null>(null);
  const { setGlobalLoading } = useAppStore();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getPublicStats();
        setStats(data);
      } finally {
        setGlobalLoading(false);
      }
    };
    fetchStats();
  }, [setGlobalLoading]);

  useEffect(() => {
    if (!rootRef.current) return;

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((card, i) => {
        gsap.fromTo(card,
          { opacity: 0, y: 50 },
          {
            opacity: 1, y: 0, duration: 1, ease: 'expo.out',
            scrollTrigger: { trigger: card, start: 'top 85%' },
            delay: i * 0.05,
          }
        );
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  const heroMetrics = [
    { value: stats ? `${stats.readinessSignal}%` : '92%',  label: 'Placement readiness transparency', icon: TrendingUp },
    { value: stats ? stats.mentorGuidance : '1:1',  label: 'AI mentor guidance feel',          icon: Bot },
    { value: stats ? `${stats.students}+` : '1.2k+',   label: 'Verified students enrolled',      icon: Users },
  ];

  return (
    <div ref={rootRef} className="min-h-screen bg-code-dark selection:bg-code-green selection:text-code-dark overflow-x-hidden relative">
      <div className="absolute inset-0 w-full h-full bg-[#0a0c10] z-0 [mask-image:radial-gradient(transparent,white)] pointer-events-none" />
      <Boxes />

      <PrepzoNavbar onNavigate={onNavigate} />
      
      <main>
        <PrepzoHero onNavigate={onNavigate} />


        {/* ── Metrics ─────────────────────────────────── */}
        <section className="relative z-40 -mt-16 px-6 max-w-7xl mx-auto">
            <div className="grid gap-6 sm:grid-cols-3">
                {heroMetrics.map((m, i) => (
                    <motion.div
                        key={m.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1 + i * 0.1, duration: 0.8, ease: 'easeOut' }}
                        className="bg-[#161a20] border border-white/5 backdrop-blur-3xl flex flex-col justify-between rounded-[40px] px-10 py-9 hover:border-white/30 transition-all group shadow-2xl relative overflow-hidden"
                    >
                        <m.icon className="h-7 w-7 text-white mb-8 group-hover:scale-110 transition-transform" />
                        <p className="text-5xl font-rubik font-[900] text-white tracking-tighter leading-none mb-4">{m.value}</p>
                        <p className="text-[12px] font-rubik uppercase tracking-[0.2em] text-white/30 font-bold leading-relaxed max-w-[140px]">{m.label}</p>
                    </motion.div>
                ))}
            </div>
        </section>

        {/* ── Feature Story Sections ───────────────────────── */}
        <section className="mx-auto mt-40 max-w-7xl px-6 space-y-40">
          {storyFeatures.map((feature, idx) => {
            const isEven = idx % 2 === 0;
            return (
              <div
                key={feature.id}
                id={feature.id}
                data-reveal
                className={`grid items-center gap-20 lg:grid-cols-2 ${isEven ? '' : 'lg:[&>*:first-child]:order-2'}`}
              >
                {/* Description panel */}
                <div className="relative text-left">
                  <div className="flex items-center gap-4 text-[13px] font-rubik font-[900] uppercase tracking-[0.5em] text-white/40 mb-10">
                    <feature.icon size={24} strokeWidth={2.5} />
                    {feature.eyebrow}
                  </div>
                  <h2 className="text-4xl md:text-7xl font-rubik font-[900] leading-[0.95] tracking-tighter text-white uppercase mb-8 md:mb-10">
                    {feature.title}
                  </h2>
                  <p className="text-[19px] md:text-[21px] leading-relaxed text-white/50 mb-14 max-w-xl font-rubik font-medium tracking-tight">
                    {feature.description}
                  </p>
                  <div className="space-y-6">
                    {feature.highlights.map(h => (
                      <div key={h} className="flex items-center gap-6 text-white text-opacity-80">
                        <CheckCircle size={22} className="text-white shrink-0" />
                        <span className="text-[15px] font-rubik font-[900] uppercase tracking-widest leading-none">{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Visual preview */}
                <div className="bg-[#161a20] border border-white/5 overflow-hidden rounded-[80px] p-8 md:p-12 flex flex-col justify-center relative min-h-[480px] shadow-[0_0_100px_rgba(0,0,0,0.5)] group hover:border-white/20 transition-all duration-700">
                  <div className="absolute inset-0 opacity-5 bg-gradient-to-br from-white to-transparent group-hover:opacity-10 transition-opacity pointer-events-none" />
                  <div className="relative z-10 w-full scale-105 group-hover:scale-[1.08] transition-transform duration-1000 ease-out">
                    {feature.visual}
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        {/* ── Journey ─────────────────────────────────────── */}
        <section className="mx-auto mt-20 md:mt-40 max-w-7xl px-6 md:px-12 py-16 md:py-24 bg-[#161a20] rounded-[40px] md:rounded-[80px] border border-white/5">
            <div className="text-center mb-16 md:mb-24">
                <p className="text-[10px] md:text-[11px] font-rubik font-[900] uppercase tracking-[0.5em] text-white/40 mb-4 md:mb-6 uppercase">The Prepzo Pipeline</p>
                <h2 className="text-3xl md:text-6xl font-rubik font-[900] tracking-tighter text-white uppercase leading-[0.85]">
                    From Assessment<br/>to <span className="text-white/60">Access.</span>
                </h2>
            </div>
            <div className="grid gap-10 md:grid-cols-5">
                {prepzoJourney.map((j) => (
                    <div key={j.step} className="group flex flex-col items-center md:items-start text-center md:text-left">
                        <div className="text-5xl font-rubik font-[900] text-white/5 mb-6 group-hover:text-white/10 transition-colors">{j.step}</div>
                        <h3 className="text-lg font-rubik font-bold text-white uppercase tracking-tight mb-4">{j.title}</h3>
                        <p className="text-[13px] text-white/30 font-rubik font-bold uppercase leading-relaxed tracking-wide">{j.desc}</p>
                    </div>
                ))}
            </div>
        </section>

        {/* ── Platform Edge Bento ──────────────────────────── */}
        <section className="mx-auto mt-40 max-w-7xl px-6" id="roadmap">
          <div className="mb-20 md:mb-28 text-center px-4">
            <p className="text-[10px] md:text-[11px] font-rubik font-[900] uppercase tracking-[0.5em] text-white/40 mb-6 md:mb-8">VERIFIED EDGE</p>
            <h2 className="text-4xl md:text-9xl font-rubik font-[900] tracking-tighter text-white uppercase leading-[0.8]">
              Built different.<br />
              <span className="text-white/40">Proven different.</span>
            </h2>
          </div>

          <div className="grid gap-8 grid-cols-1 md:grid-cols-12 auto-rows-[280px]">
            {platformEdge.map((edge) => (
              <div
                key={edge.title}
                data-reveal
                className={`
                    ${edge.size === 'full' ? 'md:col-span-8' : 'md:col-span-4'}
                    bg-[#161a20] border border-white/5 flex flex-col justify-between rounded-[48px] p-12 hover:bg-[#1c2128] hover:border-white/20 transition-all group shadow-2xl relative overflow-hidden
                `}
              >
                <div className="absolute -bottom-10 -right-10 opacity-5 group-hover:opacity-10 transition-opacity">
                    <edge.icon size={220} strokeWidth={1} />
                </div>
                <div className="relative z-10">
                    <div className="mb-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 text-white group-hover:bg-white group-hover:text-[#161a20] transition-all duration-700">
                        <edge.icon size={32} strokeWidth={2.5} />
                    </div>
                    <h3 className="text-3xl font-rubik font-[900] text-white uppercase tracking-tight mb-5 leading-none">{edge.title}</h3>
                </div>
                <p className="relative z-10 text-[14px] leading-relaxed text-white/30 font-rubik font-bold uppercase tracking-[0.1em] max-w-sm">
                    {edge.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Final CTA ───────────────────────────────────── */}
        <section className="mx-auto mt-20 md:mt-40 mb-20 md:mb-32 max-w-7xl px-4 md:px-6">
          <div className="bg-white rounded-[60px] md:rounded-[100px] p-12 sm:p-24 md:p-48 relative overflow-hidden flex flex-col items-center text-center shadow-[0_0_120px_rgba(255,255,255,0.05)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.05),transparent_70%)]" />
            <p className="relative z-10 text-[12px] md:text-[15px] font-rubik font-[900] uppercase tracking-[0.4em] md:tracking-[0.6em] text-[#161a20]/40 mb-8 md:mb-12">SECURE THE SIGNAL</p>
            <h2 className="relative z-10 text-4xl sm:text-6xl md:text-[140px] font-rubik font-[900] tracking-tighter text-[#161a20] uppercase leading-[0.8] mb-12 md:mb-20 max-w-7xl">
                Ready to <span className="text-[#161a20]/40">secure</span><br/> the role?
            </h2>
            
            <div className="relative z-10 flex flex-col sm:flex-row gap-10">
                <button 
                  onClick={() => onNavigate('signup')}
                  className="relative w-[184px] h-[65px] group active:scale-95 transition-transform"
                >
                  <svg className="absolute inset-0 w-full h-full drop-shadow-xl transition-transform group-hover:scale-105" viewBox="0 0 184 65" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 0H184L174 65H10L0 0Z" fill="#161a20" />
                  </svg>
                  <span className="relative z-10 flex items-center justify-center h-full text-white font-rubik font-[800] text-[18px] uppercase tracking-wide">
                    Create Account
                  </span>
                </button>

                <button 
                  onClick={() => onNavigate('login')}
                  className="relative w-[184px] h-[65px] group active:scale-95 transition-transform opacity-60 hover:opacity-100"
                >
                  <span className="relative z-10 flex items-center justify-center h-full text-[#161a20] font-rubik font-[800] text-[18px] uppercase tracking-wide">
                    Sign In
                  </span>
                </button>
            </div>

            <p className="relative z-10 mt-16 text-[11px] text-[#161a20] font-rubik font-[900] uppercase tracking-[0.4em] opacity-40">
                Prepzo is the final layer between you and your career.
            </p>
          </div>
        </section>
      </main>

      <footer className="py-48 border-t border-white/5 px-6">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-20">
              <div className="space-y-10">
                  <div className="flex items-center gap-6">
                      <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-2xl">
                          <div className="w-6 h-6 bg-[#161a20] rotate-45" />
                      </div>
                      <span className="text-white font-rubik font-[900] text-[32px] tracking-tight uppercase">Prepzo</span>
                  </div>
                  <p className="text-[14px] text-white/30 font-rubik font-medium max-w-sm leading-relaxed tracking-tight">
                    The ultra-high fidelity signal platform for elite tech placements. AI proctored, verified data, and direct recruiter access.
                  </p>
              </div>
              
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-16 md:gap-32">
                <div className="space-y-6">
                    <p className="text-[11px] text-white/20 font-rubik font-[900] uppercase tracking-[0.4em]">Signal</p>
                    <div className="flex flex-col gap-4">
                        <a href="#mentor" className="text-sm font-rubik font-bold text-white/50 hover:text-white transition-colors">AI Mentor</a>
                        <a href="#assessment" className="text-sm font-rubik font-bold text-white/50 hover:text-white transition-colors">Assessment</a>
                        <a href="#resume" className="text-sm font-rubik font-bold text-white/50 hover:text-white transition-colors">ATS Scan</a>
                    </div>
                </div>
                <div className="space-y-6">
                    <p className="text-[11px] text-white/20 font-rubik font-[900] uppercase tracking-[0.4em]">Connect</p>
                    <div className="flex flex-col gap-4">
                        <a onClick={() => onNavigate('login')} className="text-sm font-rubik font-bold text-white/50 hover:text-white transition-colors cursor-pointer">Log In</a>
                        <a onClick={() => onNavigate('signup')} className="text-sm font-rubik font-bold text-white/50 hover:text-white transition-colors cursor-pointer">Register</a>
                        <a href="#roadmap" className="text-sm font-rubik font-bold text-white/50 hover:text-white transition-colors">Roadmap</a>
                    </div>
                </div>
              </div>
          </div>
          
          <div className="max-w-7xl mx-auto mt-40 pt-16 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-10">
              <p className="text-[11px] text-white/20 font-rubik font-[900] tracking-[0.3em] uppercase">
                © PREPZO TECHNOLOGY GROUP. ALL RIGHTS RESERVED.
              </p>
              <div className="flex gap-10">
                <div className="text-[10px] text-white/10 font-rubik font-bold uppercase tracking-[0.2em]">Privacy System</div>
                <div className="text-[10px] text-white/10 font-rubik font-bold uppercase tracking-[0.2em]">Security Protocol</div>
              </div>
          </div>
      </footer>
    </div>
  );
};

export default LandingPage;
