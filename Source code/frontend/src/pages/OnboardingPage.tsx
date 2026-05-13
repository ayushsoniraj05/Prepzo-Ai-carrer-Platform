import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// Removed unused imports
import { CollegeDropdown } from '@/components/ui/CollegeDropdown';
import { CompanySelector } from '@/components/ui/CompanySelector';
import { TechnologySelector } from '@/components/ui/TechnologySelector';
import { 
  SearchableDropdown, 
  degreeOptions, 
  yearOfStudyOptions,
  placementTimelineOptions,
  expectedCtcOptions,
  getFieldsOfStudyByDegree,
  getTargetRolesByField
} from '@/components/ui/SearchableDropdown';
import { useAuthStore } from '@/store/authStore';
import { uploadApi } from '@/api/auth';
import { fieldSkillsMap, softSkills, getMappedField } from '@/data/fieldSkillsData';
import ThinkingLoader from '@/components/ui/loading';
import { showSuccess, showError, showInfo } from '@/utils/toastManager';
import {
  Brain,
  GraduationCap,
  Code,
  Target,
  Upload,
  CheckCircle,
  ArrowRight,
  Sparkles,
  BookOpen,
  CalendarDays,
  Clock,
  IndianRupee,
  ShieldCheck
} from 'lucide-react';

interface OnboardingPageProps {
  onNavigate: (page: string) => void;
}

// Skill Slider Component with 1-10 scale
const SkillSlider = ({ 
  skill, 
  value, 
  onChange 
}: { 
  skill: string; 
  value: number; 
  onChange: (val: number) => void;
}) => {
  return (
    <div className="group">
      <div className="flex items-center justify-between mb-4">
        <label className="text-[14px]  font-black uppercase tracking-tight text-white group-hover:text-code-green transition-colors">{skill}</label>
        <span className="text-[13px]  font-black text-code-green italic">
          {value}/10
        </span>
      </div>
      <div className="relative">
        <input
          type="range"
          min="1"
          max="10"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-1.5 rounded-full appearance-none bg-white/5 accent-white cursor-pointer hover:accent-code-green transition-all"
        />
        <div className="flex justify-between text-[10px] text-white/10 font-black mt-3 px-1">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
            <span key={num} className={num === value ? 'text-code-green' : ''}>{num}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

const steps = [
  { id: 1, title: 'Education Details', icon: GraduationCap },
  { id: 2, title: 'Skills Assessment', icon: Code },
  { id: 3, title: 'Target Role', icon: Target },
  { id: 4, title: 'Career Goals', icon: Sparkles },
  { id: 5, title: 'Resume Upload', icon: Upload },
  { id: 6, title: 'Confirmation', icon: CheckCircle },
];

// LocalStorage key for onboarding draft
const ONBOARDING_DRAFT_KEY = 'prepzo-onboarding-draft';

interface OnboardingDraft {
  currentStep: number;
  collegeName: string;
  degree: string;
  fieldOfStudy: string;
  yearOfStudy: string;
  cgpa: string;
  skillRatings: Record<string, number>;
  targetRole: string;
  placementTimeline: string;
  expectedCtc: string;
  preferredCompanies: string[];
}

const loadDraft = (): Partial<OnboardingDraft> | null => {
  try {
    const saved = localStorage.getItem(ONBOARDING_DRAFT_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

const saveDraft = (draft: OnboardingDraft) => {
  try {
    localStorage.setItem(ONBOARDING_DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // Ignore localStorage errors
  }
};

const clearDraft = () => {
  try {
    localStorage.removeItem(ONBOARDING_DRAFT_KEY);
  } catch {
    // Ignore localStorage errors
  }
};

export const OnboardingPage = ({ onNavigate }: OnboardingPageProps) => {
  const draft = loadDraft();
  const [currentStep, setCurrentStep] = useState(draft?.currentStep || 1);
  const { completeOnboarding, completeOnboardingAsync, updateUser, user } = useAuthStore();
  
  // Form state
  const [collegeName, setCollegeName] = useState(draft?.collegeName || user?.collegeName || '');
  const [degree, setDegree] = useState(draft?.degree || user?.degree || '');
  const [fieldOfStudy, setFieldOfStudy] = useState(draft?.fieldOfStudy || user?.fieldOfStudy || '');
  const [yearOfStudy, setYearOfStudy] = useState(draft?.yearOfStudy || user?.yearOfStudy || '');
  const [cgpa, setCgpa] = useState(draft?.cgpa || user?.cgpa || '');
  
  const onboardingSoftSkills = ['Communication'];
  
  const [skillRatings, setSkillRatings] = useState<Record<string, number>>(() => {
    if (draft?.skillRatings && Object.keys(draft.skillRatings).length > 0) return draft.skillRatings;
    const ratings: Record<string, number> = {};
    onboardingSoftSkills.forEach(skill => { ratings[skill] = 5; });
    user?.knownTechnologies?.forEach(tech => { ratings[tech] = 5; });
    return ratings;
  });

  // Keep skill ratings in sync
  useEffect(() => {
    setSkillRatings(prev => {
      const newRatings = { ...prev };
      onboardingSoftSkills.forEach(skill => { if (newRatings[skill] === undefined) newRatings[skill] = 5; });
      return newRatings;
    });
  }, []);
  
  const [targetRole, setTargetRole] = useState(draft?.targetRole || user?.targetRole || '');
  const [placementTimeline, setPlacementTimeline] = useState(draft?.placementTimeline || user?.placementTimeline || '');
  const [expectedCtc, setExpectedCtc] = useState(draft?.expectedCtc || user?.expectedCtc || '');
  const [preferredCompanies, setPreferredCompanies] = useState<string[]>(draft?.preferredCompanies || user?.preferredCompanies || []);
  
  const [resumeUrl, setResumeUrl] = useState<string | null>(user?.resumeUrl || null);
  const [resumeName, setResumeName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(async (file: File) => {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      showError('Invalid file type. Only PDF and Word files allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showError('File size too large. Max 5MB.');
      return;
    }
    setResumeName(file.name);
    setIsUploading(true);
    try {
      const response = await uploadApi.uploadResume(file);
      setResumeUrl(response.resumeUrl);
      updateUser({ resumeUrl: response.resumeUrl });
      showSuccess('Resume synchronized');
    } catch (error) {
      showInfo('Draft auto-saved');
    } finally {
      setIsUploading(false);
    }
  }, [updateUser]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleDeleteResume = useCallback(async () => {
    try {
      await uploadApi.deleteResume();
      setResumeUrl(null);
      setResumeName(null);
      updateUser({ resumeUrl: '' });
      showSuccess('Resume deleted');
    } catch (error) {
      showError('Delete failed');
    }
  }, [updateUser]);

  useEffect(() => {
    saveDraft({
      currentStep, collegeName, degree, fieldOfStudy, yearOfStudy, cgpa,
      skillRatings, targetRole, placementTimeline, expectedCtc, preferredCompanies,
    });
  }, [currentStep, collegeName, degree, fieldOfStudy, yearOfStudy, cgpa, skillRatings, targetRole, placementTimeline, expectedCtc, preferredCompanies]);

  const handleComplete = async () => {
    try {
      const sanitizedData = {
        collegeName: collegeName || '',
        degree: degree || '',
        fieldOfStudy: fieldOfStudy || '',
        yearOfStudy: yearOfStudy || '',
        cgpa: cgpa || '',
        targetRole: targetRole || '',
        skillRatings: skillRatings || {},
        placementTimeline: placementTimeline || '',
        expectedCtc: expectedCtc || '',
        preferredCompanies: preferredCompanies || [],
      };

      console.log('Sending onboarding data:', sanitizedData);

      await completeOnboardingAsync(sanitizedData);
      clearDraft();
      showSuccess('Onboarding verified');
      onNavigate('dashboard');
    } catch (error) {
      completeOnboarding();
      onNavigate('dashboard');
    }
  };

  const nextStep = () => currentStep < steps.length ? setCurrentStep(currentStep + 1) : handleComplete();
  const prevStep = () => currentStep > 1 && setCurrentStep(currentStep - 1);

  return (
    <div className="min-h-screen bg-code-dark text-white selection:bg-code-green selection:text-code-dark overflow-hidden flex flex-col lg:flex-row">
      {/* ── Left Side: Storytelling / Hero Context ── */}
      <div className="hidden lg:flex w-1/2 bg-[#0a0c10] relative items-center justify-center p-20 overflow-hidden border-r border-white/5">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_20%,rgba(94,210,156,0.1),transparent_50%)]" />
          <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_80%,rgba(56,189,248,0.1),transparent_50%)]" />
        </div>
        
        <div className="relative z-10 max-w-xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-4 text-[13px]  font-[900] uppercase tracking-[0.5em] text-white/40 mb-10">
              <Sparkles size={24} className="text-code-green" />
              Onboarding Protocol
            </div>
            <h1 className="text-7xl  font-[900] leading-[0.9] tracking-tighter text-white uppercase mb-10">
              Prepare for <br/>
              <span className="text-white/40">Placement</span><br/>
              Excellence.
            </h1>
            <p className="text-[20px] leading-relaxed text-white/50 mb-14  font-medium tracking-tight">
              We're calibrating your personal AI mentor. By providing your profile data, you allow the Prepzo ecosystem to map your skill signals directly to tier-1 company requirements.
            </p>

            <div className="space-y-8">
              {[
                { icon: Brain, label: 'Profile Calibration' },
                { icon: ShieldCheck, label: 'Skill Signal Mapping' },
                { icon: Target, label: 'Role-Specific Paths' }
              ].map((item, i) => (
                <div key={item.label} className="flex items-center gap-6">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border border-white/10 ${currentStep > i + 1 ? 'bg-code-green/20' : 'bg-white/5'}`}>
                    <item.icon size={20} className={currentStep > i + 1 ? 'text-code-green' : 'text-white/40'} />
                  </div>
                  <span className={`text-[14px]  font-[900] uppercase tracking-widest ${currentStep > i + 1 ? 'text-white' : 'text-white/30'}`}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
        
        {/* Animated Grid lines like landing page */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="absolute h-full w-[1px] bg-white/5" style={{ left: `${(i + 1) * 16.6}%` }} />
          ))}
        </div>
      </div>

      {/* ── Right Side: Onboarding Form Flow ── */}
      <div className="flex-1 flex flex-col p-6 lg:p-12 xl:p-24 relative bg-code-dark min-h-screen">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center">
                <div className="w-5 h-5 bg-[#0a0c10] rotate-45" />
            </div>
            <span className="text-white  font-[900] text-2xl uppercase tracking-tighter">Prepzo</span>
        </div>

        <div className="max-w-xl mx-auto w-full flex flex-col h-full justify-center">
          {/* Status / Step Indicator */}
          <div className="flex items-center justify-between mb-16">
            <div className="space-y-2">
                <p className="text-[11px]  font-[900] uppercase tracking-[0.4em] text-white/30">CALIBRATION SEQUENCE</p>
                <h2 className="text-3xl  font-[900] uppercase tracking-tight text-white italic">{steps[currentStep-1].title}</h2>
            </div>
            <div className="text-right">
                <div className="text-3xl  font-[900] flex items-baseline gap-1 italic">
                    <span className="text-white">{currentStep < 10 ? `0${currentStep}` : currentStep}</span>
                    <span className="text-white/20 text-lg">/</span>
                    <span className="text-white/20 text-lg">06</span>
                </div>
                <div className="h-1 w-20 bg-white/5 rounded-full mt-2 overflow-hidden">
                    <motion.div 
                        animate={{ width: `${(currentStep / 6) * 100}%` }}
                        className="h-full bg-code-green"
                    />
                </div>
            </div>
          </div>

          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4, ease: "circOut" }}
                className="space-y-8 min-h-[400px]"
              >
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div className="grid gap-6">
                      <div className="space-y-2">
                        <label className="text-[11px]  font-black uppercase tracking-widest text-white/40 px-2">University Node</label>
                        <CollegeDropdown value={collegeName} onChange={setCollegeName} />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <label className="text-[11px]  font-black uppercase tracking-widest text-white/40 px-2">Degree Type</label>
                           <SearchableDropdown
                             value={degree}
                             onChange={setDegree}
                             options={degreeOptions}
                             placeholder="Degree"
                             icon={GraduationCap}
                             searchable={false}
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[11px]  font-black uppercase tracking-widest text-white/40 px-2">Cycle Year</label>
                           <SearchableDropdown
                             value={yearOfStudy}
                             onChange={setYearOfStudy}
                             options={yearOfStudyOptions}
                             placeholder="Year"
                             icon={CalendarDays}
                             searchable={false}
                           />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[11px]  font-black uppercase tracking-widest text-white/40 px-2">Field Specialization</label>
                        <SearchableDropdown
                          value={fieldOfStudy}
                          onChange={setFieldOfStudy}
                          options={getFieldsOfStudyByDegree(degree)}
                          placeholder="Search Field"
                          icon={BookOpen}
                          searchable={true}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[11px]  font-black uppercase tracking-widest text-white/40 px-2">Academic Index (CGPA)</label>
                        <input
                          type="text"
                          value={cgpa}
                          onChange={(e) => setCgpa(e.target.value)}
                          placeholder="e.g. 9.1"
                          className="w-full h-[60px] px-6 rounded-[20px] bg-[#0a0c10] border border-white/5 text-white  font-bold placeholder-white/20 focus:outline-none focus:border-code-green transition-all shadow-inner"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-8 max-h-[500px] overflow-y-auto pr-2 scrollbar-hide">
                    <div className="space-y-6">
                         <p className="text-white/40 text-sm font-medium tracking-tight italic">Drag the signal sliders to calibrate your technical baseline.</p>
                         
                         <div className="space-y-10">
                            {/* Technical Skills Section */}
                            <div className="space-y-6">
                                <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-purple-400/60">My Technical Signals</h4>
                                <TechnologySelector 
                                    value={Object.keys(skillRatings).filter(s => !onboardingSoftSkills.includes(s) && !softSkills.includes(s)).join(', ')}
                                    onChange={(val) => {
                                      const newTechs = val.split(',').map(t => t.trim()).filter(t => t.length > 0);
                                      setSkillRatings(prev => {
                                        const next = { ...prev };
                                        // Keep only existing techs that are in newTechs OR are soft skills
                                        const final: Record<string, number> = {};
                                        onboardingSoftSkills.forEach(s => { final[s] = next[s] || 5; });
                                        newTechs.forEach(t => { final[t] = next[t] || 5; });
                                        return final;
                                      });
                                    }}
                                />
                                <div className="grid grid-cols-1 gap-4 mt-4">
                                  {Object.keys(skillRatings)
                                    .filter(s => !onboardingSoftSkills.includes(s) && !softSkills.includes(s))
                                    .map(skill => (
                                     <SkillSlider 
                                         key={skill} 
                                         skill={skill}
                                         value={skillRatings[skill]}
                                         onChange={(val) => setSkillRatings(prev => ({ ...prev, [skill]: val }))}
                                     />
                                  ))}
                                </div>
                            </div>

                            {/* Soft Skills Section - Only Communication */}
                            <div className="space-y-6">
                                <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-400/60">Communication Signals</h4>
                                {onboardingSoftSkills.map(skill => (
                                    <SkillSlider 
                                        key={skill} 
                                        skill={skill === 'Communication' ? 'Communication Skills' : skill}
                                        value={skillRatings[skill] || 5}
                                        onChange={(val) => setSkillRatings(prev => ({ ...prev, [skill]: val }))}
                                    />
                                ))}
                            </div>
                         </div>
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-10 py-10">
                    <div className="space-y-6">
                        <label className="text-4xl  font-[900] uppercase tracking-tighter text-white">What is your Target Node?</label>
                        <SearchableDropdown
                         value={targetRole}
                         onChange={setTargetRole}
                         options={getTargetRolesByField(fieldOfStudy)}
                         placeholder="Select Target Role"
                         icon={Target}
                         searchable={true}
                        />
                        <p className="text-white/30 text-sm leading-relaxed max-w-sm font-medium">Choosing a role allows the AI to prioritize specific skill gaps in your personalized learning roadmap.</p>
                    </div>
                  </div>
                )}

                {currentStep === 4 && (
                  <div className="space-y-8">
                    <div className="grid gap-8">
                       <div className="space-y-2">
                           <label className="text-[11px]  font-black uppercase tracking-widest text-white/40">Placement Timeline Horizon</label>
                           <SearchableDropdown
                             value={placementTimeline}
                             onChange={setPlacementTimeline}
                             options={placementTimelineOptions}
                             placeholder="Select Horizon"
                             icon={Clock}
                             searchable={false}
                           />
                       </div>
                       <div className="space-y-2">
                           <label className="text-[11px]  font-black uppercase tracking-widest text-white/40">Income Forecast (LPA)</label>
                           <SearchableDropdown
                             value={expectedCtc}
                             onChange={setExpectedCtc}
                             options={expectedCtcOptions}
                             placeholder="Target Package"
                             icon={IndianRupee}
                             searchable={false}
                           />
                       </div>
                       <div className="space-y-2">
                           <label className="text-[11px]  font-black uppercase tracking-widest text-white/40">Target Organizations (Nodes)</label>
                           <CompanySelector
                             value={preferredCompanies}
                             onChange={setPreferredCompanies}
                             maxSelections={5}
                           />
                       </div>
                    </div>
                  </div>
                )}

                {currentStep === 5 && (
                  <div className="space-y-10 flex flex-col justify-center h-full">
                    <div className="text-center lg:text-left">
                        <h3 className="text-4xl  font-[900] text-white uppercase tracking-tighter mb-4">Sync Resume Data.</h3>
                        <p className="text-white/40 font-medium italic">Our neural network will deconstruct your experience for better matching.</p>
                    </div>

                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => !resumeUrl && fileInputRef.current?.click()}
                        className={`
                            h-64 border-2 border-dashed rounded-[40px] flex flex-col items-center justify-center p-10 transition-all cursor-pointer group
                            ${resumeUrl ? 'border-code-green/50 bg-code-green/5 cursor-default' : isDragOver ? 'border-code-green bg-code-green/10' : 'border-white/10 bg-[#0a0c10] hover:border-white/30'}
                        `}
                    >
                        {isUploading ? (
                             <div className="flex flex-col items-center gap-4">
                                <ThinkingLoader loadingText="Architecting Career Roadmap" />
                             </div>
                        ) : resumeUrl ? (
                            <div className="flex flex-col items-center gap-6">
                                <div className="w-16 h-16 rounded-full bg-code-green flex items-center justify-center shadow-[0_0_30px_rgba(94,210,156,0.3)]">
                                    <CheckCircle size={32} className="text-[#0a0c10]" />
                                </div>
                                <div className="text-center">
                                    <p className="text-white font-[900] uppercase tracking-tighter text-lg">{resumeName || 'Resume.pdf'}</p>
                                    <button onClick={(e) => { e.stopPropagation(); handleDeleteResume(); }} className="text-[10px] font-black uppercase text-red-500/60 hover:text-red-500 mt-2 tracking-widest transition-colors">Disconnect File</button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-6">
                                <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                                    <Upload size={24} className="text-white/60" />
                                </div>
                                <div className="text-center space-y-2">
                                    <p className="text-white font-[900] uppercase tracking-tighter text-xl">Transmit Document</p>
                                    <p className="text-white/20 font-bold uppercase text-[10px] tracking-[0.2em]">PDF / DOCX (Max 5MB)</p>
                                </div>
                            </div>
                        )}
                        <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={handleFileInputChange} />
                    </div>

                    {!resumeUrl && (
                        <button onClick={nextStep} className="text-[11px] font-black uppercase text-white/30 hover:text-white transition-colors tracking-[0.4em] self-center">Skip Transmission</button>
                    )}
                  </div>
                )}

                {currentStep === 6 && (
                  <div className="space-y-12 py-10 flex flex-col items-center lg:items-start">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="w-24 h-24 rounded-[40px] bg-code-green flex items-center justify-center shadow-[0_0_80px_rgba(94,210,156,0.2)]"
                    >
                      <CheckCircle size={48} className="text-[#0a0c10]" />
                    </motion.div>
                    
                    <div className="space-y-4 text-center lg:text-left">
                        <h3 className="text-6xl  font-[900] text-white uppercase tracking-tighter leading-none italic">Calibration<br/>Complete.</h3>
                        <p className="text-white/40 font-medium text-lg leading-relaxed max-w-md">Your career signal is now locked. You are ready to access the dashboard and initiate your first live assessment.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 w-full">
                        <div className="bg-[#0a0c10] border border-white/5 p-6 rounded-[30px]">
                            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-2">Signal Integrity</p>
                            <p className="text-3xl  font-[900] text-white italic">100<span className="text-lg text-code-green">%</span></p>
                        </div>
                        <div className="bg-[#0a0c10] border border-white/5 p-6 rounded-[30px]">
                            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-2">Mentor Access</p>
                            <p className="text-3xl  font-[900] text-white italic">ACTIVE</p>
                        </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="mt-16 flex items-center gap-6">
            {currentStep > 1 && (
                <button
                    onClick={prevStep}
                    className="flex-1 h-[70px] bg-transparent border border-white/10 rounded-[24px] text-white  font-[900] uppercase tracking-widest hover:bg-white/5 transition-all active:scale-[0.98]"
                >
                    Back
                </button>
            )}
            <button
                onClick={nextStep}
                disabled={isUploading}
                className={`
                    flex-[2] h-[70px] relative group active:scale-[0.98] transition-all
                    ${isUploading ? 'opacity-50 grayscale' : ''}
                `}
            >
                <div className="absolute inset-0 bg-white rounded-[24px] group-hover:scale-[1.02] transition-transform shadow-[0_20px_40px_rgba(255,255,255,0.1)]" />
                <span className="relative z-10 flex items-center justify-center h-full text-[#0a0c10]  font-[900] text-xl uppercase tracking-tighter italic">
                    {currentStep === 6 ? 'Access Dashboard' : 'Execute Next Step'}
                    <ArrowRight className="ml-2" size={20} strokeWidth={3} />
                </span>
            </button>
          </div>

          {/* Hint Overlay */}
          <div className="mt-20 flex items-center gap-6 p-6 rounded-[32px] bg-white/5 border border-white/5 group hover:border-white/10 transition-colors">
            <div className="flex -space-x-3">
                <div className="w-10 h-10 rounded-full border-2 border-code-dark bg-purple-500 flex items-center justify-center text-[10px] font-black">AI</div>
                <div className="w-10 h-10 rounded-full border-2 border-code-dark bg-code-green flex items-center justify-center">
                    <Brain className="text-code-dark" size={16} />
                </div>
            </div>
            <p className="text-[12px]  font-bold uppercase tracking-widest text-white/30 leading-relaxed">
                Neural network is mapping <span className="text-white/60">SDE Match</span> in the background...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
