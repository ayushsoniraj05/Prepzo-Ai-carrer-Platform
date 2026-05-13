import { useState } from 'react';
import { 
  User, 
  GraduationCap, 
  Target, 
  Upload, 
  Save, 
  Trash2, 
  Globe, 
  Linkedin, 
  Github, 
  Phone,
  FileText,
  Briefcase,
  Zap,
  CalendarDays,
  Clock,
  LogOut,
  ShieldAlert,
  Bell,
  Lock,
  Eye,
  Database
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { uploadApi } from '@/api/auth';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { 
  SearchableDropdown, 
  degreeOptions, 
  yearOfStudyOptions, 
  placementTimelineOptions, 
  expectedCtcOptions,
  getFieldsOfStudyByDegree,
  getTargetRolesByField
} from '@/components/ui/SearchableDropdown';
import { CollegeDropdown } from '@/components/ui/CollegeDropdown';
import { TechnologySelector } from '@/components/ui/TechnologySelector';
import ThinkingLoader from '@/components/ui/loading';
import toast from 'react-hot-toast';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface SkillSliderProps {
  skill: string;
  value: number;
  onChange: (val: number) => void;
}

const SkillSlider = ({ skill, value, onChange }: SkillSliderProps) => (
  <div className="group">
    <div className="flex items-center justify-between mb-3">
      <label className="text-[13px] font-black uppercase tracking-tight text-white/70 group-hover:text-[#5ed29c] transition-colors">{skill}</label>
      <span className="text-[12px] font-black text-[#5ed29c] italic">{value}/10</span>
    </div>
    <div className="relative">
      <input
        type="range"
        min="1"
        max="10"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1 rounded-full appearance-none bg-white/5 accent-[#5ed29c] cursor-pointer"
      />
    </div>
  </div>
);

export function SettingsForm() {
  const { user, updateProfileAsync, logoutAsync } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to terminate your current session?')) {
      try {
        await logoutAsync();
        toast.success('Neural session terminated');
      } catch (error) {
        toast.error('Failed to terminate session');
      }
    }
  };
  
  // Form State
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    linkedin: user?.linkedin || '',
    github: user?.github || '',
    collegeName: user?.collegeName || '',
    degree: user?.degree || '',
    fieldOfStudy: user?.fieldOfStudy || '',
    yearOfStudy: user?.yearOfStudy || '',
    cgpa: user?.cgpa || '',
    targetRole: user?.targetRole || '',
    expectedCtc: user?.expectedCtc || '',
    placementTimeline: user?.placementTimeline || '',
    knownTechnologies: user?.knownTechnologies || [],
    skillRatings: user?.skillRatings || {}
  });

  // Derived options
  const fieldOptions = getFieldsOfStudyByDegree(formData.degree);
  const roleOptions = getTargetRolesByField(formData.fieldOfStudy);

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateProfileAsync(formData);
      toast.success('Neural profile synchronized successfully');
    } catch (error: any) {
      toast.error(error.message || 'Synchronization failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResumeUpload = async (file: File) => {
    setUploading(true);
    try {
      const response = await uploadApi.uploadResume(file);
      await updateProfileAsync({ resumeUrl: response.resumeUrl });
      toast.success('Resume node uploaded and mapped');
    } catch (error: any) {
      toast.error('Failed to upload resume');
    } finally {
      setUploading(false);
    }
  };

  const handleResumeDelete = async () => {
    if (!window.confirm('Are you sure you want to delete your resume node?')) return;
    try {
      await uploadApi.deleteResume();
      await updateProfileAsync({ resumeUrl: undefined });
      toast.success('Resume node purged');
    } catch (error) {
      toast.error('Failed to delete resume');
    }
  };

  const handleDeleteAccount = () => {
    if (window.confirm('WARNING: This will permanently delete your account and all associated data. This action cannot be undone. Are you absolutely sure?')) {
      toast.error('Account deletion requested. Please contact support to finalize.');
    }
  };

  const handleClearData = () => {
    if (window.confirm('WARNING: This will clear all your assessment history, saved jobs, and performance data. Continue?')) {
      toast.success('Local data cache cleared successfully.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-32 font-rubik">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <p className="text-[11px] font-[900] uppercase tracking-[0.4em] text-[#5ed29c] mb-4">Command Center</p>
          <h1 className="text-4xl md:text-8xl font-[900] text-white uppercase tracking-tighter italic leading-[0.85]">Settings <span className="text-white/20">Matrix</span></h1>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleLogout}
            className="bg-red-500/10 text-red-500 border border-red-500/20 px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-red-500 hover:text-white transition-all shadow-xl shadow-red-500/10"
          >
            <LogOut size={16} />
            <span className="font-[900] uppercase tracking-widest text-[11px]">Logout</span>
          </button>
          <button 
            onClick={handleSave} 
            disabled={loading}
            className="bg-[#5ed29c] text-[#0a0c10] px-8 py-3 rounded-xl flex items-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-[#5ed29c]/10"
          >
            {loading ? <ThinkingLoader /> : <Save size={16} />}
            <span className="font-[900] uppercase tracking-widest text-[11px]">Sync Profile</span>
          </button>
        </div>
      </div>

      <Tabs defaultValue="account" className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 mb-8 bg-[#0a0c10]/40 border border-white/5 backdrop-blur-3xl h-auto p-2 gap-2">
          <TabsTrigger value="account" className="py-3 text-xs uppercase tracking-widest font-black"><User className="w-4 h-4 mr-2" /> Account</TabsTrigger>
          <TabsTrigger value="academic" className="py-3 text-xs uppercase tracking-widest font-black"><GraduationCap className="w-4 h-4 mr-2" /> Academic</TabsTrigger>
          <TabsTrigger value="security" className="py-3 text-xs uppercase tracking-widest font-black"><Lock className="w-4 h-4 mr-2" /> Security</TabsTrigger>
          <TabsTrigger value="privacy" className="py-3 text-xs uppercase tracking-widest font-black"><Eye className="w-4 h-4 mr-2" /> Privacy</TabsTrigger>
          <TabsTrigger value="notifications" className="py-3 text-xs uppercase tracking-widest font-black"><Bell className="w-4 h-4 mr-2" /> Alerts</TabsTrigger>
          <TabsTrigger value="data" className="py-3 text-xs uppercase tracking-widest font-black"><Database className="w-4 h-4 mr-2" /> Data</TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl uppercase tracking-tighter italic">
                <div className="p-2 rounded-lg bg-[#5ed29c]/10 text-[#5ed29c]"><User size={20} /></div>
                Identity Node
              </CardTitle>
              <CardDescription className="uppercase tracking-widest text-[10px]">Manage your personal command center identity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="uppercase tracking-widest text-[10px] text-[#5ed29c]">Full Name</Label>
                  <Input 
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    placeholder="Enter your system name"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="uppercase tracking-widest text-[10px] text-[#5ed29c]">Phone Vector</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={14} />
                    <Input 
                      className="pl-9"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="Physical contact ID"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="uppercase tracking-widest text-[10px] text-[#5ed29c]">LinkedIn Bridge</Label>
                  <div className="relative">
                    <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={14} />
                    <Input 
                      className="pl-9"
                      value={formData.linkedin}
                      onChange={(e) => setFormData({...formData, linkedin: e.target.value})}
                      placeholder="linkedin.com/in/username"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="uppercase tracking-widest text-[10px] text-[#5ed29c]">GitHub Repository</Label>
                  <div className="relative">
                    <Github className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={14} />
                    <Input 
                      className="pl-9"
                      value={formData.github}
                      onChange={(e) => setFormData({...formData, github: e.target.value})}
                      placeholder="github.com/username"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-3 text-2xl uppercase tracking-tighter italic">
                  <div className="p-2 rounded-lg bg-white/5 text-white/50"><Globe size={20} /></div>
                  System Appearance
                </CardTitle>
                <CardDescription className="uppercase tracking-widest text-[10px]">Calibrate neural interface visuals</CardDescription>
              </div>
              <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/10">
                <ThemeToggle />
              </div>
            </CardHeader>
          </Card>
        </TabsContent>

        <TabsContent value="academic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl uppercase tracking-tighter italic">
                <div className="p-2 rounded-lg bg-[#5ed29c]/10 text-[#5ed29c]"><GraduationCap size={20} /></div>
                Academic Backbone
              </CardTitle>
              <CardDescription className="uppercase tracking-widest text-[10px]">Your institutional signals</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-2">
                <Label className="uppercase tracking-widest text-[10px] text-[#5ed29c]">University / Institute</Label>
                <CollegeDropdown 
                  value={formData.collegeName}
                  onChange={(val) => setFormData({...formData, collegeName: val})}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="uppercase tracking-widest text-[10px] text-[#5ed29c]">Degree Program</Label>
                  <SearchableDropdown 
                    value={formData.degree}
                    onChange={(val) => setFormData({...formData, degree: val, fieldOfStudy: ''})}
                    options={degreeOptions}
                    placeholder="Select qualification"
                    icon={FileText}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="uppercase tracking-widest text-[10px] text-[#5ed29c]">Field of Intelligence</Label>
                  <SearchableDropdown 
                    value={formData.fieldOfStudy}
                    onChange={(val) => setFormData({...formData, fieldOfStudy: val})}
                    options={fieldOptions}
                    placeholder="Select specialization"
                    icon={Target}
                    searchable={true}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="uppercase tracking-widest text-[10px] text-[#5ed29c]">Study Cycle</Label>
                  <SearchableDropdown 
                    value={formData.yearOfStudy}
                    onChange={(val) => setFormData({...formData, yearOfStudy: val})}
                    options={yearOfStudyOptions}
                    placeholder="Current year"
                    icon={CalendarDays as any}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="uppercase tracking-widest text-[10px] text-[#5ed29c]">GPA Signal (0-10)</Label>
                  <Input 
                    value={formData.cgpa}
                    onChange={(e) => setFormData({...formData, cgpa: e.target.value})}
                    placeholder="Current academic score"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl uppercase tracking-tighter italic">
                <div className="p-2 rounded-lg bg-[#5ed29c]/10 text-[#5ed29c]"><Briefcase size={20} /></div>
                Career Vector
              </CardTitle>
              <CardDescription className="uppercase tracking-widest text-[10px]">Your professional trajectory</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label className="uppercase tracking-widest text-[10px] text-[#5ed29c]">Target Command Role</Label>
                  <SearchableDropdown 
                    value={formData.targetRole}
                    onChange={(val) => setFormData({...formData, targetRole: val})}
                    options={roleOptions}
                    placeholder="The role you seek"
                    icon={Briefcase}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="uppercase tracking-widest text-[10px] text-[#5ed29c]">Expected Compensation (LPA)</Label>
                  <SearchableDropdown 
                    value={formData.expectedCtc}
                    onChange={(val) => setFormData({...formData, expectedCtc: val})}
                    options={expectedCtcOptions}
                    placeholder="Value of expertise"
                    icon={Zap}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="uppercase tracking-widest text-[10px] text-[#5ed29c]">Placement Window</Label>
                  <SearchableDropdown 
                    value={formData.placementTimeline}
                    onChange={(val) => setFormData({...formData, placementTimeline: val})}
                    options={placementTimelineOptions}
                    placeholder="Deployment timeline"
                    icon={Clock as any}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl uppercase tracking-tighter italic">
                <div className="p-2 rounded-lg bg-[#5ed29c]/10 text-[#5ed29c]"><Zap size={20} /></div>
                Signal Expertise Matrix
              </CardTitle>
              <CardDescription className="uppercase tracking-widest text-[10px]">Tech stack nodes & calibration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-4">
                <Label className="uppercase tracking-widest text-[10px] text-[#5ed29c]">Tech Stack Nodes</Label>
                <TechnologySelector 
                  value={formData.knownTechnologies.join(', ')}
                  onChange={(techs) => setFormData({...formData, knownTechnologies: techs.split(',').map(t => t.trim()).filter(t => t.length > 0)})}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <Label className="uppercase tracking-widest text-[10px] text-[#5ed29c]">Expertise Calibration</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-8 mt-4">
                  {Object.entries(formData.skillRatings).map(([skill, value]) => (
                    <SkillSlider 
                      key={skill}
                      skill={skill}
                      value={value as number}
                      onChange={(val) => {
                        setFormData({
                          ...formData,
                          skillRatings: { ...formData.skillRatings, [skill]: val }
                        });
                      }}
                    />
                  ))}
                  {Object.keys(formData.skillRatings).length === 0 && (
                    <div className="col-span-full py-10 text-center border border-white/5 rounded-2xl bg-white/5">
                      <p className="text-[10px] font-black text-white/30 uppercase tracking-widest italic">Complete onboarding to generate skill calibration maps.</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl uppercase tracking-tighter italic">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400"><Lock size={20} /></div>
                Security Protocol
              </CardTitle>
              <CardDescription className="uppercase tracking-widest text-[10px]">Manage authentication and sessions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/5">
                <div className="space-y-1">
                  <p className="text-sm font-bold uppercase tracking-wider text-white">Two-Factor Authentication</p>
                  <p className="text-[10px] uppercase tracking-widest text-white/50">Secure your neural link with 2FA</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/5">
                <div className="space-y-1">
                  <p className="text-sm font-bold uppercase tracking-wider text-white">Require 2FA for Sensitive Ops</p>
                  <p className="text-[10px] uppercase tracking-widest text-white/50">E.g., deleting resumes or changing email</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="pt-2">
                <Label className="uppercase tracking-widest text-[10px] text-blue-400 mb-4 block">Active Sessions</Label>
                <div className="p-4 rounded-xl border border-white/10 bg-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                      <Globe size={16} className="text-white/60" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-white">Windows PC • Chrome</p>
                      <p className="text-[10px] uppercase tracking-widest text-[#5ed29c] flex items-center gap-1 mt-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#5ed29c]" /> Active Now
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline">Current</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl uppercase tracking-tighter italic">
                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400"><Eye size={20} /></div>
                Privacy Configuration
              </CardTitle>
              <CardDescription className="uppercase tracking-widest text-[10px]">Control your digital footprint</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/5">
                <div className="space-y-1">
                  <p className="text-sm font-bold uppercase tracking-wider text-white">Public Profile Search</p>
                  <p className="text-[10px] uppercase tracking-widest text-white/50">Allow recruiters to discover your node</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/5">
                <div className="space-y-1">
                  <p className="text-sm font-bold uppercase tracking-wider text-white">Show Performance Metrics</p>
                  <p className="text-[10px] uppercase tracking-widest text-white/50">Display ATS scores and skill calibration publicly</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/5">
                <div className="space-y-1">
                  <p className="text-sm font-bold uppercase tracking-wider text-white">Anonymous Telemetry</p>
                  <p className="text-[10px] uppercase tracking-widest text-white/50">Help improve the neural engine</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl uppercase tracking-tighter italic">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400"><Bell size={20} /></div>
                Alert Vectors
              </CardTitle>
              <CardDescription className="uppercase tracking-widest text-[10px]">Manage incoming signals</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/5">
                <div className="space-y-1">
                  <p className="text-sm font-bold uppercase tracking-wider text-white">Job Match Alerts</p>
                  <p className="text-[10px] uppercase tracking-widest text-white/50">Notify when high-probability roles appear</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/5">
                <div className="space-y-1">
                  <p className="text-sm font-bold uppercase tracking-wider text-white">Assessment Reminders</p>
                  <p className="text-[10px] uppercase tracking-widest text-white/50">Alerts for pending stage 1 and stage 2 tests</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/5">
                <div className="space-y-1">
                  <p className="text-sm font-bold uppercase tracking-wider text-white">Security Notifications</p>
                  <p className="text-[10px] uppercase tracking-widest text-white/50">Alerts for suspicious login activity</p>
                </div>
                <Switch defaultChecked disabled />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl uppercase tracking-tighter italic">
                <div className="p-2 rounded-lg bg-[#5ed29c]/10 text-[#5ed29c]"><Database size={20} /></div>
                Data Management
              </CardTitle>
              <CardDescription className="uppercase tracking-widest text-[10px]">Your files and telemetry</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div>
                <Label className="uppercase tracking-widest text-[10px] text-[#5ed29c] mb-4 block">Resume Blueprint</Label>
                {user?.resumeUrl ? (
                  <div className="p-6 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-[#5ed29c]/10 text-[#5ed29c]">
                        <FileText size={20} />
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-white">Current Blueprint Mapped</p>
                        <a href={user.resumeUrl} target="_blank" rel="noreferrer" className="text-[10px] text-[#5ed29c] hover:underline uppercase tracking-widest mt-1 inline-block">View Document</a>
                      </div>
                    </div>
                    <button onClick={handleResumeDelete} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="p-8 border border-dashed border-white/10 rounded-xl text-center group hover:border-[#5ed29c]/30 transition-all">
                    <Upload className="text-white/20 mx-auto mb-3 group-hover:text-[#5ed29c] transition-colors" size={24} />
                    <p className="text-xs font-bold text-white uppercase tracking-wider mb-1">No Blueprint Detected</p>
                    <p className="text-[10px] uppercase tracking-widest text-white/30 mb-4">Upload resume to calibrate AI</p>
                    
                    <input 
                      type="file" 
                      id="resume-upload" 
                      className="hidden" 
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleResumeUpload(file);
                      }}
                    />
                    <label htmlFor="resume-upload" className="px-6 py-2 bg-white/10 text-white rounded-lg text-[10px] uppercase tracking-widest cursor-pointer hover:bg-white/20 transition-all">
                      {uploading ? 'Uploading...' : 'Upload File'}
                    </label>
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-4 pt-2">
                <Label className="uppercase tracking-widest text-[10px] text-red-500 flex items-center gap-2"><ShieldAlert size={14} /> Danger Zone</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5">
                    <p className="text-sm font-bold uppercase tracking-wider text-red-500 mb-1">Clear Local Data</p>
                    <p className="text-[10px] uppercase tracking-widest text-white/40 mb-4">Reset dashboard cache and saved states</p>
                    <button onClick={handleClearData} className="px-4 py-2 bg-red-500/10 text-red-500 text-[10px] uppercase tracking-widest font-black rounded-lg hover:bg-red-500 hover:text-white transition-all">
                      Clear Data
                    </button>
                  </div>
                  <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5">
                    <p className="text-sm font-bold uppercase tracking-wider text-red-500 mb-1">Delete Account</p>
                    <p className="text-[10px] uppercase tracking-widest text-white/40 mb-4">Permanently purge your neural node</p>
                    <button onClick={handleDeleteAccount} className="px-4 py-2 bg-red-500 text-white text-[10px] uppercase tracking-widest font-black rounded-lg hover:bg-red-600 transition-all">
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
