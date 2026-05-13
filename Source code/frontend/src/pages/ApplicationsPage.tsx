/**
 * Applications Page
 * Track and manage job applications
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Calendar,
  Building2,
  MapPin,
  AlertCircle,
  FileText,
  Video,
  Award,
  ArrowUpRight,
  TrendingUp,
  BarChart3,
  Zap,
} from 'lucide-react';
import { GlassButton } from '@/components/ui/GlassCard';
import { CircularProgress } from '@/components/ui/CircularProgress';
import { GridBeam } from '@/components/ui/background-grid-beam';
import { useAuthStore } from '@/store/authStore';
import { useAppStore } from '@/store/appStore';
import { applicationsApi, Application, ApplicationStatus } from '@/api/applications';
import ThinkingLoader from '@/components/ui/loading';
import toast from 'react-hot-toast';

// Status configurations
const statusConfig: Record<ApplicationStatus, {
  label: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  color: string;
  bgColor: string;
}> = {
  applied: { label: 'Applied', icon: FileText, color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
  viewed: { label: 'Viewed', icon: Eye, color: 'text-cyan-400', bgColor: 'bg-cyan-500/20' },
  under_review: { label: 'Under Review', icon: Clock, color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' },
  shortlisted: { label: 'Shortlisted', icon: CheckCircle, color: 'text-green-400', bgColor: 'bg-green-500/20' },
  interview_scheduled: { label: 'Interview', icon: Calendar, color: 'text-purple-400', bgColor: 'bg-purple-500/20' },
  interview_completed: { label: 'Interview Done', icon: Video, color: 'text-indigo-400', bgColor: 'bg-indigo-500/20' },
  offer_extended: { label: 'Offer Received', icon: Award, color: 'text-emerald-400', bgColor: 'bg-emerald-500/20' },
  offer_accepted: { label: 'Accepted', icon: CheckCircle, color: 'text-green-500', bgColor: 'bg-green-500/30' },
  offer_declined: { label: 'Declined', icon: XCircle, color: 'text-orange-400', bgColor: 'bg-orange-500/20' },
  rejected: { label: 'Rejected', icon: XCircle, color: 'text-red-400', bgColor: 'bg-red-500/20' },
  withdrawn: { label: 'Withdrawn', icon: XCircle, color: 'text-gray-400', bgColor: 'bg-gray-500/20' },
  on_hold: { label: 'On Hold', icon: AlertCircle, color: 'text-amber-400', bgColor: 'bg-amber-500/20' },
};

export function ApplicationsPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { setGlobalLoading } = useAppStore();

  // Applications state
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{
    totalApplications: number;
    statusBreakdown: Record<string, number>;
  } | null>(null);
  
  // Filter state
  const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus | ''>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth?mode=login');
    }
  }, [isAuthenticated, navigate]);

  // Load applications
  const loadApplications = useCallback(async () => {
    setLoading(true);
    try {
      const response = await applicationsApi.getApplications({
        status: selectedStatus || undefined,
        page,
        limit: 20,
      });
      
      if (response.success) {
        setApplications(response.data.applications);
        setStats(response.data.stats);
        setTotalPages(response.data.pagination.pages);
      }
    } catch (error) {
      console.error('Failed to load applications:', error);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
      setGlobalLoading(false);
    }
  }, [selectedStatus, page, setGlobalLoading]);

  useEffect(() => {
    if (isAuthenticated) {
      loadApplications();
    }
  }, [loadApplications, isAuthenticated]);

  // Handle withdraw
  const handleWithdraw = async (applicationId: string) => {
    if (!confirm('Are you sure you want to withdraw this application?')) {
      return;
    }

    try {
      const response = await applicationsApi.withdrawApplication(applicationId);
      if (response.success) {
        toast.success('Application withdrawn');
        loadApplications();
      }
    } catch (error) {
      toast.error('Failed to withdraw application');
    }
  };

  // Internal statistics calculate nodes
  const getActiveRate = () => {
    if (!stats?.statusBreakdown) return 0;
    const active = ['applied', 'viewed', 'under_review', 'shortlisted', 'interview_scheduled', 'interview_completed'];
    const activeCount = active.reduce((sum, status) => sum + (stats.statusBreakdown[status] || 0), 0);
    return stats.totalApplications > 0 ? Math.round((activeCount / stats.totalApplications) * 100) : 0;
  };

  return (
    <div className="min-h-screen bg-[#0a0c10] selection:bg-[#00ff9d] selection:text-[#0a0c10] overflow-x-hidden relative">
      {/* Background Effect */}
      <div className="absolute inset-0 w-full h-full bg-[#0a0c10] z-0 [mask-image:radial-gradient(transparent,white)] pointer-events-none" />
      <GridBeam className="absolute inset-0" />

      {/* Header / Hero Section */}
      <div className="relative z-10 border-b border-white/5 bg-[#0a0c10]/30 backdrop-blur-3xl">
        <div className="max-w-7xl mx-auto px-6 py-12 md:py-20 text-left">
          <div className="flex items-center gap-4 text-[13px] font-rubik font-[900] uppercase tracking-[0.5em] text-white/40 mb-8">
            <TrendingUp size={20} strokeWidth={2.5} />
            Application Console
          </div>
          
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-7xl font-rubik font-[900] leading-[0.95] tracking-tighter text-white uppercase mb-6">
                Live Status <br/>
                <span className="text-white/40">Propagation.</span>
              </h1>
              <p className="text-[18px] md:text-[21px] leading-relaxed text-white/50 font-rubik font-medium tracking-tight max-w-xl">
                Real-time tracking of your recruitment signals. Monitor every pulse from review to onboarding.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="bg-[#0a0c10] border border-white/5 p-6 rounded-[32px] min-w-[200px]">
                 <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-white/20 mb-2">
                    <Zap size={14} className="text-[#00ff9d]" />
                    Efficiency Rating
                 </div>
                 <div className="flex items-center gap-4">
                    <span className="text-4xl font-rubik font-[900] text-white">{getActiveRate()}%</span>
                    <div className="w-12 h-12">
                       <CircularProgress value={getActiveRate()} size={48} strokeWidth={4} />
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 md:py-16 relative z-10">
        {/* Stats Overview - Premium Blocks */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            <div className="bg-[#0a0c10]/50 border border-white/5 p-10 rounded-[48px] backdrop-blur-xl group hover:border-[#00ff9d]/30 transition-all">
              <p className="text-6xl font-rubik font-[900] text-white tracking-tighter mb-4 italic group-hover:scale-110 transition-transform origin-left">{stats.totalApplications}</p>
              <div className="flex items-center gap-3">
                 <div className="w-2 h-2 rounded-full bg-white/20" />
                 <p className="text-[10px] uppercase font-black tracking-[0.3em] text-white/30">Total Nodes</p>
              </div>
            </div>
            
            <div className="bg-[#0a0c10]/50 border border-white/5 p-10 rounded-[48px] backdrop-blur-xl group hover:border-[#00ff9d]/30 transition-all">
              <p className="text-6xl font-rubik font-[900] text-[#00ff9d] tracking-tighter mb-4 italic group-hover:scale-110 transition-transform origin-left">{stats.statusBreakdown['shortlisted'] || 0}</p>
              <div className="flex items-center gap-3">
                 <div className="w-2 h-2 rounded-full bg-[#00ff9d]" />
                 <p className="text-[10px] uppercase font-black tracking-[0.3em] text-white/30">Shortlisted</p>
              </div>
            </div>
            
            <div className="bg-[#0a0c10]/50 border border-white/5 p-10 rounded-[48px] backdrop-blur-xl group hover:border-[#00ff9d]/30 transition-all">
              <p className="text-6xl font-rubik font-[900] text-white tracking-tighter mb-4 italic group-hover:scale-110 transition-transform origin-left">{stats.statusBreakdown['interview_scheduled'] || 0}</p>
              <div className="flex items-center gap-3">
                 <div className="w-2 h-2 rounded-full bg-purple-500" />
                 <p className="text-[10px] uppercase font-black tracking-[0.3em] text-white/30">Active Interviews</p>
              </div>
            </div>
            
            <div className="bg-[#00ff9d] p-10 rounded-[48px] group hover:scale-[1.02] transition-all shadow-2xl shadow-[#00ff9d]/20">
              <p className="text-6xl font-rubik font-[900] text-[#0a0c10] tracking-tighter mb-4 italic">{stats.statusBreakdown['offer_extended'] || 0}</p>
              <div className="flex items-center gap-3">
                 <div className="w-2 h-2 rounded-full bg-[#0a0c10]" />
                 <p className="text-[10px] uppercase font-black tracking-[0.3em] text-[#0a0c10]/40">Offers Extracted</p>
              </div>
            </div>
          </div>
        )}

        {/* Filter Tabs - Premium Glass Chips */}
        <div className="flex flex-wrap gap-4 mb-12 overflow-x-auto pb-4 scrollbar-hide">
          <button
            onClick={() => {
              setSelectedStatus('');
              setPage(1);
            }}
            className={`px-8 py-3 rounded-full text-[12px] font-black uppercase tracking-widest transition-all border ${
              selectedStatus === ''
                ? 'bg-[#00ff9d] text-[#0a0c10] border-[#00ff9d]'
                : 'bg-white/5 text-white/40 border-white/5 hover:bg-white/10'
            }`}
          >
            All Signal ({stats?.totalApplications || 0})
          </button>
          {Object.entries(statusConfig).map(([status, config]) => {
            const count = stats?.statusBreakdown[status] || 0;
            if (count === 0) return null;
            
            return (
              <button
                key={status}
                onClick={() => {
                  setSelectedStatus(status as ApplicationStatus);
                  setPage(1);
                }}
                className={`px-8 py-3 rounded-full text-[12px] font-black uppercase tracking-widest transition-all border flex items-center gap-3 ${
                  selectedStatus === status
                    ? 'bg-[#00ff9d]/10 border-[#00ff9d] text-[#00ff9d]'
                    : 'bg-white/5 text-white/40 border-white/5 hover:bg-white/10'
                }`}
              >
                <config.icon className="w-4 h-4" />
                <span>{config.label}</span>
                <span className="opacity-40">[{count}]</span>
              </button>
            );
          })}
        </div>

        {/* Applications List */}
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <ThinkingLoader loadingText="Retrieving History" />
          </div>
        ) : applications.length === 0 ? (
          <div className="bg-[#0a0c10]/20 border border-white/5 rounded-[40px] p-24 text-center backdrop-blur-xl">
            <Briefcase className="w-16 h-16 text-white/10 mx-auto mb-8" />
            <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-4">
              {selectedStatus ? 'No history detected' : 'No activity logged'}
            </h3>
            <p className="text-white/30 font-rubik font-bold uppercase text-[13px] tracking-wide mb-10">
              {selectedStatus
                ? 'Try a different signal filter'
                : 'Start applying to jobs to initiate tracking'}
            </p>
            <button 
              onClick={() => navigate('/jobs')}
              className="px-12 py-5 rounded-full bg-white text-[#0a0c10] font-black text-[14px] uppercase tracking-widest hover:scale-105 transition-all"
            >
              Browse Opportunity Grid
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence>
              {applications.map((app, idx) => (
                <motion.div
                  key={app._id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05, duration: 0.8 }}
                >
                  <ApplicationCard
                    application={app}
                    onView={() => navigate(`/applications/${app._id}`)}
                    onWithdraw={() => handleWithdraw(app._id)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <GlassButton
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="disabled:opacity-50"
            >
              Previous
            </GlassButton>
            <span className="px-4 py-2 text-purple-300">
              Page {page} of {totalPages}
            </span>
            <GlassButton
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="disabled:opacity-50"
            >
              Next
            </GlassButton>
          </div>
        )}
      </div>
    </div>
  );
}

function ApplicationCard({
  application,
  onView,
  onWithdraw,
}: {
  application: Application;
  onView: () => void;
  onWithdraw: () => void;
}) {
  const config = statusConfig[application.status];
  const StatusIcon = config.icon;
  
  const canWithdraw = ['applied', 'viewed', 'under_review', 'shortlisted'].includes(
    application.status
  );

  // Check for upcoming interview
  const upcomingInterview = application.interviews?.find(
    (i) => i.status === 'scheduled' && new Date(i.date) > new Date()
  );

  return (
    <div
      className="group relative bg-[#0a0c10]/40 border border-white/5 rounded-[32px] p-8 md:p-10 transition-all hover:bg-[#1c2128] hover:border-white/20 hover:scale-[1.01] cursor-pointer shadow-2xl backdrop-blur-sm overflow-hidden"
      onClick={onView}
    >
      <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition-opacity">
         <ArrowUpRight size={24} className="text-[#00ff9d]" />
      </div>

      <div className="flex flex-col md:flex-row items-start justify-between gap-8 relative z-10">
        <div className="flex flex-col md:flex-row gap-8 flex-1">
          {/* Company Logo - Premium Style */}
          <div className="w-20 h-20 bg-[#0a0c10] border border-white/10 rounded-[24px] flex items-center justify-center overflow-hidden shrink-0 shadow-lg p-2 group-hover:border-[#00ff9d]/30 transition-colors">
            {application?.company?.logo ? (
              <img
                src={application.company.logo}
                alt={application.company.name}
                className="w-full h-full object-contain rounded-xl"
              />
            ) : (
              <Building2 className="w-10 h-10 text-white/10" />
            )}
          </div>

          {/* Application Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-2">
               <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded border flex items-center gap-2 ${config.color} ${config.bgColor} border-white/10`}>
                 <StatusIcon size={12} />
                 {config.label}
               </span>
               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 bg-white/5 px-2.5 py-1 rounded">
                  Applied {new Date(application.createdAt).toLocaleDateString()}
               </span>
            </div>
            
            <h3 className="text-2xl md:text-3xl font-rubik font-[900] text-white uppercase tracking-tight mb-2 group-hover:text-[#00ff9d] transition-colors leading-[1.1]">
              {application.job.title}
            </h3>
            
            <div className="flex items-center gap-3 mb-6">
               <p className="text-[15px] font-rubik font-bold text-white/50 tracking-tight">{application?.company?.name}</p>
               <span className="w-1 h-1 rounded-full bg-white/10" />
               <p className="text-[14px] font-rubik font-bold text-white/30 tracking-tight flex items-center gap-2">
                 <MapPin size={14} />
                 {application.job.locations?.[0]?.city || 'Remote'}
               </p>
            </div>

            {/* Upcoming Interview Alert - Premium Banner */}
            {upcomingInterview && (
              <div className="inline-flex items-center gap-4 bg-purple-500/10 border border-purple-500/20 px-6 py-3 rounded-2xl mb-8">
                <Calendar className="w-5 h-5 text-purple-400" />
                <div className="flex items-center gap-2">
                   <span className="text-[11px] font-black uppercase tracking-widest text-purple-300">Next Transmission:</span>
                   <span className="text-[11px] font-bold text-white tracking-tight">
                     {upcomingInterview.round} on {new Date(upcomingInterview.date).toLocaleDateString()}
                   </span>
                </div>
              </div>
            )}

            {/* Progress Timeline - Narrative Style */}
            <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-2">
              {application.statusHistory.slice(-4).map((history: { status: ApplicationStatus }, idx: number) => {
                const historyConfig = statusConfig[history.status];
                const HistoryIcon = historyConfig?.icon || Clock;
                
                return (
                  <div key={idx} className="flex items-center shrink-0">
                    {idx > 0 && <div className="w-4 h-px bg-white/10" />}
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/5 rounded-xl">
                      <HistoryIcon size={12} className={historyConfig?.color || 'text-white/20'} />
                      <span className={`text-[10px] font-black uppercase tracking-widest ${historyConfig?.color || 'text-white/20'}`}>
                        {historyConfig?.label || history.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Match Signal / Action Section */}
        <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-10 md:min-w-[120px]">
          <div className="text-right">
             <div className="flex items-center gap-3 mb-2 justify-end">
                <span className="text-4xl font-rubik font-[900] text-[#00ff9d] italic leading-none">{application.matchScore?.overall || 85}%</span>
                <BarChart3 size={20} className="text-[#00ff9d]/40" />
             </div>
             <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20 whitespace-nowrap">EXTRACTED MATCH</p>
          </div>

          <div className="flex gap-4">
             {canWithdraw && (
               <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onWithdraw();
                  }}
                  className="px-6 py-4 rounded-2xl bg-white/5 border border-white/5 text-[11px] font-black uppercase tracking-widest text-red-400/40 hover:bg-red-500/10 hover:text-red-400 transition-all"
                >
                  Withdraw
               </button>
             )}
             <button className="w-12 h-12 rounded-2xl bg-white text-[#0a0c10] flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-xl shadow-white/5">
                <ArrowUpRight size={20} />
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
