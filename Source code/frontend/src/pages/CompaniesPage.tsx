/**
 * Companies Page
 * Company directory and search
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search,
  MapPin,
  Building2,
  Users,
  Star,
  Heart,
  Zap,
  Award,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';
import { GlassCard, GlassButton } from '@/components/ui/GlassCard';
import { GridBeam } from '@/components/ui/background-grid-beam';
import { useAuthStore } from '@/store/authStore';
import { useAppStore } from '@/store/appStore';
import { companiesApi, Company, CompanySearchParams } from '@/api/companies';
import ThinkingLoader from '@/components/ui/loading';
import toast from 'react-hot-toast';

export function CompaniesPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated } = useAuthStore();
  const { setGlobalLoading } = useAppStore();

  // Search state
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  
  // Companies state
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [featuredCompanies, setFeaturedCompanies] = useState<Company[]>([]);
  const [industries, setIndustries] = useState<string[]>([]);
  
  // Filters state
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [selectedCity] = useState('');
  const [hiringOnly, setHiringOnly] = useState(false);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Load industries
  useEffect(() => {
    const loadIndustries = async () => {
      try {
        const response = await companiesApi.getIndustries();
        if (response.success) {
          setIndustries(response.data);
        }
      } catch (error) {
        console.error('Failed to load industries:', error);
      }
    };
    loadIndustries();
  }, []);

  // Load companies
  const loadCompanies = useCallback(async () => {
    setLoading(true);
    try {
      const params: CompanySearchParams = {
        search: searchQuery || undefined,
        industry: selectedIndustry || undefined,
        city: selectedCity || undefined,
        hiringStatus: hiringOnly ? 'actively_hiring' : undefined,
        page,
        limit: 20,
      };

      const response = await companiesApi.getCompanies(params);
      if (response.success) {
        setCompanies(response.data.companies);
        setTotalPages(response.data.pagination.pages);
        setTotal(response.data.pagination.total);
      }
    } catch (error) {
      console.error('Failed to load companies:', error);
      toast.error('Failed to load companies');
    } finally {
      setLoading(false);
      setGlobalLoading(false);
    }
  }, [searchQuery, selectedIndustry, selectedCity, hiringOnly, page, setGlobalLoading]);

  useEffect(() => {
    loadCompanies();
  }, [loadCompanies]);

  // Load featured and hiring companies
  useEffect(() => {
    const loadExtra = async () => {
      try {
        const [featuredRes] = await Promise.all([
          companiesApi.getFeaturedCompanies(),
        ]);
        
        if (featuredRes.success) setFeaturedCompanies(featuredRes.data);
      } catch (error) {
        console.error('Failed to load extra data:', error);
      }
    };
    loadExtra();
  }, []);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    if (searchQuery) {
      setSearchParams({ q: searchQuery });
    } else {
      setSearchParams({});
    }
    loadCompanies();
  };

  // Handle follow company
  const handleFollowCompany = async (companyId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.error('Please login to follow companies');
      navigate('/auth?mode=login');
      return;
    }

    try {
      const response = await companiesApi.toggleFollowCompany(companyId);
      if (response.success) {
        setCompanies(prev =>
          prev.map(c =>
            c._id === companyId
              ? {
                  ...c,
                  isFollowing: response.data.isFollowing,
                  followerCount: (c.followerCount || 0) + (response.data.isFollowing ? 1 : -1),
                }
              : c
          )
        );
        toast.success(response.message);
      }
    } catch (error) {
      toast.error('Failed to follow company');
    }
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
            <Building2 size={20} strokeWidth={2.5} />
            Ecosystem Index
          </div>
          
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-7xl font-rubik font-[900] leading-[0.95] tracking-tighter text-white uppercase mb-6">
                Explore the <br/>
                <span className="text-white/40">Power Players.</span>
              </h1>
              <p className="text-[18px] md:text-[21px] leading-relaxed text-white/50 font-rubik font-medium tracking-tight max-w-xl">
                Real-time tracking of 34+ certified hiring nodes. Match your assessment signal to their growth cycles.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              {isAuthenticated && (
                <GlassButton
                  onClick={() => navigate('/companies/following')}
                  className="flex items-center gap-3 px-8 py-4 h-auto bg-white/5 hover:bg-white/10"
                >
                  <Heart className="w-5 h-5 text-[#00ff9d]" />
                  <span className="text-[14px] font-black uppercase tracking-widest">Followed Nodes</span>
                </GlassButton>
              )}
            </div>
          </div>

          {/* Search Form Integrated */}
          <GlassCard className="mt-12 p-2 border-white/10 shadow-2xl relative z-20">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, industry, or stack"
                  className="w-full pl-14 pr-4 py-5 bg-transparent border-none text-white text-[15px] font-bold placeholder-white/20 focus:ring-0 transition-all font-rubik"
                />
              </div>
              <div className="md:w-64 relative border-l border-white/5">
                <select
                  value={selectedIndustry}
                  onChange={(e) => {
                    setSelectedIndustry(e.target.value);
                    setPage(1);
                  }}
                  className="w-full h-full pl-6 pr-10 py-5 bg-transparent border-none text-white text-[15px] font-bold placeholder-white/20 focus:ring-0 transition-all font-rubik appearance-none cursor-pointer"
                >
                  <option value="" className="bg-[#0a0c10]">All Industries</option>
                  {industries.map((ind) => (
                    <option key={ind} value={ind} className="bg-[#0a0c10]">
                      {ind}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 p-1">
                <button 
                  type="button"
                  onClick={() => {
                    setHiringOnly(!hiringOnly);
                    setPage(1);
                  }}
                  className={`px-6 py-4 rounded-2xl border transition-all flex items-center gap-3 ${
                    hiringOnly
                      ? 'bg-[#00ff9d]/10 border-[#00ff9d] text-[#00ff9d]'
                      : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10'
                  }`}
                >
                  <Zap className="w-4 h-4" />
                  <span className="text-[12px] font-black uppercase tracking-widest hidden sm:inline">Hiring Only</span>
                </button>
                <button 
                  type="submit"
                  className="px-10 py-4 rounded-2xl bg-[#00ff9d] text-[#0a0c10] font-rubik font-[900] text-[14px] uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-[#00ff9d]/20"
                >
                  Search
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 md:py-16 relative z-10">
        {/* Market Stats Sidebar Style Overview */}
        {!searchQuery && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-20">
            <div className="lg:col-span-8">
               <div className="flex items-center gap-4 text-[13px] font-rubik font-[900] uppercase tracking-[0.4em] text-[#00ff9d] mb-10">
                  <Award size={20} />
                  Elite Vanguard
               </div>
               <div className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide">
                  {featuredCompanies.map((company) => (
                    <FeaturedCompanyCard
                      key={company._id}
                      company={company}
                      onClick={() => navigate(`/companies/${company.slug}`)}
                    />
                  ))}
               </div>
            </div>
            <div className="lg:col-span-4 bg-[#0a0c10]/50 border border-white/5 rounded-[48px] p-10 backdrop-blur-xl">
               <div className="flex items-center gap-4 text-[11px] font-rubik font-[900] uppercase tracking-[0.4em] text-white/30 mb-8">
                  <TrendingUp size={18} />
                  Market Pulse
               </div>
               <div className="space-y-8">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-4xl font-rubik font-[900] text-white tracking-tighter mb-2 italic">34</p>
                      <p className="text-[10px] uppercase font-black tracking-[0.2em] text-white/30">Total Nodes</p>
                    </div>
                    <div>
                      <p className="text-4xl font-rubik font-[900] text-[#00ff9d] tracking-tighter mb-2 italic">12</p>
                      <p className="text-[10px] uppercase font-black tracking-[0.2em] text-white/30">Actively Hiring</p>
                    </div>
                  </div>
                  <div className="pt-8 border-t border-white/5">
                     <p className="text-[13px] font-rubik font-bold text-white/40 leading-relaxed italic">
                       " The ecosystem is expanding. Major pivots detected in AI research and FinTech sectors. "
                     </p>
                  </div>
               </div>
            </div>
          </div>
        )}

        {/* Results Info */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-[#00ff9d] animate-pulse" />
            <p className="text-[12px] font-rubik font-[900] uppercase tracking-[0.3em] text-white/40">
              {loading ? 'Discovering Ecosystems...' : `${total} NODES DETECTED`}
            </p>
          </div>
        </div>

        {/* Company Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <ThinkingLoader loadingText="Discovering Ecosystems" />
          </div>
        ) : companies.length === 0 ? (
          <div className="bg-[#0a0c10]/20 border border-white/5 rounded-[40px] p-24 text-center backdrop-blur-xl">
            <Building2 className="w-16 h-16 text-white/10 mx-auto mb-8" />
            <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-4">No nodes mapped</h3>
            <p className="text-white/30 font-rubik font-bold uppercase text-[13px] tracking-wide">Try re-calibrating your search</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <AnimatePresence>
              {companies.map((company, idx) => (
                <motion.div
                  key={company._id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05, duration: 0.8 }}
                >
                  <CompanyCard
                    company={company}
                    onFollow={(e) => handleFollowCompany(company._id, e)}
                    onClick={() => navigate(`/companies/${company.slug}`)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Pagination - Show only if results > limit */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-4 mt-20">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-8 py-5 rounded-3xl bg-white/5 border border-white/5 text-[12px] font-black uppercase tracking-[0.2em] text-white disabled:opacity-20 transition-all hover:bg-white/10"
            >
              Previous Wave
            </button>
            <div className="px-10 py-5 rounded-3xl bg-[#0a0c10] border border-white/5 flex items-center">
              <span className="text-[12px] font-black uppercase tracking-[0.2em] text-[#00ff9d]">
                SECTOR {page} <span className="text-white/10 mx-3">/</span> {totalPages}
              </span>
            </div>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-8 py-5 rounded-3xl bg-white/5 border border-white/5 text-[12px] font-black uppercase tracking-[0.2em] text-white disabled:opacity-20 transition-all hover:bg-white/10"
            >
              Next Wave
            </button>
          </div>
        )}

        {/* Suggest Company */}
        <div className="mt-32 text-center py-20 border-t border-white/5">
          <p className="text-[14px] font-rubik font-bold text-white/30 uppercase tracking-[0.5em] mb-8">Node Missing From Grid?</p>
          <button 
            onClick={() => navigate('/companies/suggest')}
            className="px-12 py-5 rounded-full bg-white text-[#0a0c10] font-black text-[14px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl"
          >
            Report Missing Entity
          </button>
        </div>
      </div>
    </div>
  );
}

function FeaturedCompanyCard({
  company,
  onClick,
}: {
  company: Company;
  onClick: () => void;
}) {
  return (
    <div
      className="group relative min-w-[280px] bg-[#0a0c10]/40 border border-white/5 rounded-[28px] p-6 transition-all hover:bg-[#1c2128] hover:border-[#00ff9d]/30 cursor-pointer overflow-hidden shadow-2xl"
      onClick={onClick}
    >
      <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
         <ArrowUpRight size={20} className="text-[#00ff9d]" />
      </div>

      <div className="flex items-center gap-6 mb-6">
        <div className="w-16 h-16 bg-[#0a0c10] border border-white/10 rounded-[20px] flex items-center justify-center overflow-hidden p-2 group-hover:border-[#00ff9d]/20 transition-colors">
          {company?.logo ? (
            <img
              src={company.logo}
              alt={company.name}
              className="w-full h-full object-contain rounded-lg"
            />
          ) : (
            <Building2 className="w-8 h-8 text-white/10" />
          )}
        </div>
        <div>
          <h3 className="text-xl font-rubik font-[900] text-white uppercase tracking-tight group-hover:text-[#00ff9d] transition-colors">{company?.name}</h3>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">{company?.industry}</p>
        </div>
      </div>
      
      <p className="text-white/40 text-[13px] leading-relaxed font-medium tracking-tight mb-6 line-clamp-2 italic font-rubik">
        "{company.shortDescription || company.description}"
      </p>

      <div className="flex items-center justify-between mt-auto">
        <div className="flex items-center gap-2">
           <Star className="w-4 h-4 text-[#00ff9d] fill-[#00ff9d]" />
           <span className="text-[13px] font-black text-white">{company.ratings?.overall?.toFixed(1) || '4.8'}</span>
        </div>
        {company.hiringStatus === 'actively_hiring' && (
          <div className="flex items-center gap-2 px-3 py-1 bg-[#00ff9d]/10 border border-[#00ff9d]/20 rounded-lg">
             <div className="w-1.5 h-1.5 rounded-full bg-[#00ff9d] animate-pulse" />
             <span className="text-[9px] font-black uppercase tracking-widest text-[#00ff9d]">Hiring</span>
          </div>
        )}
      </div>
    </div>
  );
}


function CompanyCard({
  company,
  onFollow,
  onClick,
}: {
  company: Company;
  onFollow: (e: React.MouseEvent) => void;
  onClick: () => void;
}) {
  return (
    <div
      className="group relative bg-[#0a0c10]/40 border border-white/5 rounded-[28px] p-6 transition-all hover:bg-[#1c2128] hover:border-white/20 hover:scale-[1.01] cursor-pointer shadow-2xl backdrop-blur-sm"
      onClick={onClick}
    >
      <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition-opacity">
         <ArrowUpRight size={20} className="text-[#00ff9d]" />
      </div>

      <div className="flex items-start gap-6 mb-8">
        <div className="w-16 h-16 bg-[#0a0c10] border border-white/10 rounded-[24px] flex items-center justify-center overflow-hidden shrink-0 shadow-lg p-2 group-hover:border-[#00ff9d]/30 transition-colors">
          {company?.logo ? (
            <img
              src={company.logo}
              alt={company.name}
              className="w-full h-full object-contain rounded-xl"
            />
          ) : (
            <Building2 className="w-8 h-8 text-white/10" />
          )}
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
             <h3 className="text-xl font-rubik font-[900] text-white uppercase tracking-tighter truncate leading-tight group-hover:text-[#00ff9d] transition-colors">
               {company.name}
             </h3>
             {company.companyType && (
               <span className="text-[8px] font-black uppercase tracking-widest text-[#00ff9d] bg-[#00ff9d]/10 px-1.5 py-0.5 rounded">
                  {company.companyType}
               </span>
             )}
          </div>
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/30">{company.industry}</p>
        </div>
      </div>

      <p className="text-white/40 text-[14px] leading-relaxed font-medium tracking-tight mb-8 line-clamp-2 max-w-2xl font-rubik italic">
         " {company.shortDescription || company.description} "
      </p>

      <div className="grid grid-cols-2 gap-4 mb-8">
         <div className="flex items-center gap-3">
            <MapPin size={14} className="text-[#00ff9d]/40" />
            <span className="text-[11px] font-black uppercase tracking-widest text-white/30">{company.headquarters.city}</span>
         </div>
         <div className="flex items-center gap-3">
            <Users size={14} className="text-[#00ff9d]/40" />
            <span className="text-[11px] font-black uppercase tracking-widest text-white/30">{company.companySize}</span>
         </div>
      </div>

      <div className="flex items-center justify-between pt-6 border-t border-white/5">
        <div className="flex items-center gap-2">
           <div className="flex -space-x-2">
              {[1,2,3].map(i => (
                <div key={i} className="w-6 h-6 rounded-full border-2 border-[#0a0c10] bg-white/5 flex items-center justify-center overflow-hidden">
                   <Users size={10} className="text-white/20" />
                </div>
              ))}
           </div>
           <span className="text-[10px] font-black uppercase tracking-widest text-white/20">{company.followerCount || 0} Followers</span>
        </div>
        
        <button
          onClick={onFollow}
          className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
            company.isFollowing 
              ? 'bg-[#00ff9d] border-[#00ff9d] text-[#0a0c10]' 
              : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white'
          }`}
        >
          <Heart size={18} className={company.isFollowing ? 'fill-current' : ''} />
        </button>
      </div>
    </div>
  );
}
