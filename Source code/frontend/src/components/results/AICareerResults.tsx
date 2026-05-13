import { motion } from 'framer-motion';
import { 
  Brain, TrendingUp, ArrowRight, ArrowUpRight,
  Youtube, Rocket, BookOpen,
  Users, Star, PlayCircle, Play
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { 
  AIRecommendationResult, 
  CourseRecommendation, 
  YouTubeRecommendation,
  CertificationRecommendation,
  ProjectRecommendation
} from '../../data/aiRecommendationEngine';

interface AICareerResultsProps {
  recommendations: AIRecommendationResult;
}

// Precision Formatter
const formatVal = (val: any) => {
  const num = parseFloat(val);
  return isNaN(num) ? "0.00" : num.toFixed(2);
};

// 3D Section Score Card
const SectionScoreCard = ({ section, index }: { 
  section: AIRecommendationResult['sectionScores'][0]; 
  index: number 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      className={`relative bg-[#0a0c10]/60 backdrop-blur-3xl rounded-[32px] p-8 border border-white/5 group overflow-hidden`}
    >
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
            <p className="text-[10px]  font-black text-white/20 uppercase tracking-[0.2em]">{section.name}</p>
            <span className="text-2xl  font-[900] text-white italic tracking-tighter">
              {formatVal(section.percentage)}%
            </span>
        </div>
        
        <div className="h-1 bg-white/5 rounded-full overflow-hidden mb-6">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${section.percentage}%` }}
            transition={{ delay: 0.3, duration: 1, ease: "easeOut" }}
            className={`h-full bg-white rounded-full`}
          />
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-[11px]  font-black text-white/40 uppercase tracking-widest">{section.correct}/{section.total} Signals</span>
          <span className="text-[9px]  font-[900] uppercase tracking-[0.2em] px-3 py-1 bg-white/5 border border-white/10 rounded-full text-white/30 italic">
            {section.status}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

// AI Analysis Card
const AIAnalysisCard = ({ analysis }: { analysis: AIRecommendationResult['analysis'] }) => (
  <div className="relative bg-[#0a0c10]/60 backdrop-blur-3xl rounded-[32px] md:rounded-[40px] p-6 md:p-10 border border-white/5 overflow-hidden">
    <div className="relative z-10">
      <div className="flex items-center justify-between gap-6 mb-8 md:mb-12">
        <div>
          <p className="text-[10px]  font-[900] uppercase tracking-[0.4em] text-white/20 mb-2">AI Diagnostic Summary</p>
          <h3 className="text-3xl md:text-4xl  font-[900] text-white uppercase tracking-tighter italic">Signal Analysis</h3>
        </div>
        <Brain className="w-8 h-8 md:w-10 md:h-10 text-white/10" />
      </div>
      
      <div className="grid gap-6 md:gap-8 grid-cols-1 lg:grid-cols-3">
        {/* Strengths */}
        <div className="p-8 bg-white/5 rounded-[32px] border border-white/5">
          <p className="text-[10px]  font-black text-white/20 uppercase tracking-[0.2em] mb-4">Top Levers</p>
          <p className="text-[15px]  font-medium text-white/60 leading-relaxed italic">{analysis.strengthSummary}</p>
        </div>
        
        {/* Weaknesses */}
        <div className="p-8 bg-white/5 rounded-[32px] border border-white/5">
          <p className="text-[10px]  font-black text-white/20 uppercase tracking-[0.2em] mb-4">Priorities</p>
          <p className="text-[15px]  font-medium text-white/60 leading-relaxed italic">{analysis.weaknessSummary}</p>
        </div>
        
        {/* Skill Gap */}
        <div className="p-8 bg-white/5 rounded-[32px] border border-white/5">
          <p className="text-[10px]  font-black text-white/20 uppercase tracking-[0.2em] mb-4">Gaps Detected</p>
          <p className="text-[15px]  font-medium text-white/60 leading-relaxed italic">{analysis.skillGapAnalysis}</p>
        </div>
      </div>

      <div className="mt-8 md:mt-12 p-6 md:p-8 bg-white/5 rounded-[32px] border border-white/5 flex flex-col md:flex-row flex-wrap gap-8 md:gap-12 items-start md:items-center">
        <div className="flex-1 min-w-full md:min-w-[200px]">
          <p className="text-[10px]  font-black text-white/20 uppercase tracking-[0.2em] mb-4 md:mb-6">Strategic Outlook</p>
          <p className="text-[14px] md:text-[16px]  font-medium text-white italic leading-relaxed">{analysis.overallAssessment}</p>
        </div>
        <div className="flex gap-8 w-full md:w-auto pt-6 md:pt-0 border-t md:border-t-0 md:border-l border-white/10">
            <div className="text-center flex-1 md:flex-none">
              <div className="text-2xl md:text-3xl  font-[900] text-white italic tracking-tighter">{formatVal(analysis.careerReadinessScore)}%</div>
              <div className="text-[9px]  font-black text-white/20 uppercase tracking-widest mt-1">Readiness</div>
            </div>
            <div className="text-center flex-1 md:flex-none border-l border-white/10 pl-8">
              <div className="text-2xl md:text-3xl  font-[900] text-white italic tracking-tighter">{formatVal(analysis.interviewConfidence)}%</div>
              <div className="text-[9px]  font-black text-white/20 uppercase tracking-widest mt-1">Confidence</div>
            </div>
        </div>
      </div>
    </div>
  </div>
);

// Course Card
const CourseCard = ({ course, index }: { course: CourseRecommendation; index: number }) => (
  <motion.a
    href={course.url}
    target="_blank"
    rel="noopener noreferrer"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    className="group relative bg-[#1c2128]/50 backdrop-blur-xl border border-white/5 rounded-[40px] overflow-hidden hover:border-white/20 transition-all duration-500 block h-full"
  >
    <div className="relative h-48 overflow-hidden bg-[#0a0c10]">
      <img 
        src={course.thumbnail} 
        alt={course.title} 
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
        onError={(e) => {
          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1498050108023-c524a983c605?auto=format&fit=crop&q=80&w=800';
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0c10] via-[#0a0c10]/20 to-transparent" />
      <div className="absolute top-6 right-6">
        <div className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/10">
          <span className="text-[10px]  font-black text-white uppercase tracking-widest">{course.level || course.difficulty}</span>
        </div>
      </div>
    </div>
    
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <span className="text-[10px]  font-black text-white/40 uppercase tracking-[0.3em]">{course.platform}</span>
        <div className="flex items-center gap-1.5 text-emerald-400">
           <TrendingUp size={12} />
           <span className="text-[11px] font-bold">Recommended</span>
        </div>
      </div>
      
      <h3 className="text-[18px]  font-black text-white uppercase tracking-tight leading-tight group-hover:text-blue-400 transition-colors italic line-clamp-2">
        {course.title}
      </h3>
      
      <p className="text-[13px]  font-medium text-white/40 leading-relaxed italic line-clamp-2">
        {course.whyThisCourse || course.whyRecommended}
      </p>

      <div className="pt-6 border-t border-white/5 flex items-center justify-between">
        <span className="text-[12px]  font-black text-white/60 uppercase">{course.duration}</span>
        <ArrowUpRight className="text-white/20 group-hover:text-white transition-all group-hover:translate-x-1 group-hover:-translate-y-1" />
      </div>
    </div>
  </motion.a>
);

// YouTube Card
const YouTubeCard = ({ video, index }: { video: YouTubeRecommendation; index: number }) => (
  <motion.a
    href={video.url}
    target="_blank"
    rel="noopener noreferrer"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    className="group relative bg-[#1c2128]/50 backdrop-blur-xl border border-white/5 rounded-[40px] overflow-hidden hover:border-white/20 transition-all duration-500 block h-full"
  >
    <div className="relative h-48 overflow-hidden bg-[#0a0c10]">
      <img 
        src={video.thumbnailUrl || video.thumbnail} 
        alt={video.title || video.playlistTitle} 
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
        onError={(e) => {
          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1461749280684-d676f03ef285?auto=format&fit=crop&q=80&w=800';
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0c10] via-[#0a0c10]/20 to-transparent" />
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/20">
          <Play fill="white" size={24} className="text-white ml-1" />
        </div>
      </div>
    </div>
    
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <span className="text-[10px]  font-black text-white/40 uppercase tracking-[0.3em]">{video.channelName || video.channel}</span>
        <Youtube className="text-red-500/50" size={16} />
      </div>
      
      <h3 className="text-[18px]  font-black text-white uppercase tracking-tight leading-tight group-hover:text-red-400 transition-colors italic line-clamp-2">
        {video.title || video.playlistTitle}
      </h3>
      
      <p className="text-[13px]  font-medium text-white/40 leading-relaxed italic line-clamp-2">
        Access high-fidelity tutorial signals for deeper domain mastery.
      </p>

      <div className="pt-6 border-t border-white/5 flex items-center justify-between">
        <span className="text-[12px]  font-black text-white/60 uppercase italic">Free Access</span>
        <ArrowUpRight className="text-white/20 group-hover:text-white transition-all group-hover:translate-x-1 group-hover:-translate-y-1" />
      </div>
    </div>
  </motion.a>
);

// Certification Card
const CertificationCard = ({ cert, index }: { cert: CertificationRecommendation; index: number }) => (
  <motion.a
    href={cert.url}
    target="_blank"
    rel="noopener noreferrer"
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: index * 0.05 }}
    className={`relative bg-[#1c2128]/50 backdrop-blur-xl rounded-[32px] p-8 border border-white/5 group overflow-hidden block h-full hover:border-white/20 transition-all`}
  >
    <div className="relative z-10 text-center">
       <p className="text-[10px]  font-black text-white/20 uppercase tracking-[0.2em] mb-4">{cert.issuingAuthority}</p>
       <h4 className="text-[16px]  font-black text-white uppercase tracking-tight leading-tight mb-4 italic h-12 line-clamp-2">
         {cert.title}
       </h4>
       <div className="flex flex-col items-center gap-1 mb-8">
           <span className="text-[9px]  font-black text-emerald-400 uppercase tracking-widest italic">Resume Impact</span>
           <span className="text-xl  font-[900] text-white italic">+{formatVal(cert.resumeImpact || 15)}%</span>
       </div>
       <div className="pt-6 border-t border-white/5 flex justify-between items-center text-[10px]  font-black text-white/20 uppercase tracking-widest">
          <span>{cert.duration}</span>
          <span>{cert.cost || 'Free'}</span>
       </div>
    </div>
  </motion.a>
);

// Project Card
const ProjectCard = ({ project, index }: { project: ProjectRecommendation; index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    className="group relative bg-[#1c2128]/50 backdrop-blur-xl border border-white/5 rounded-[40px] overflow-hidden hover:border-white/20 transition-all duration-500 h-full flex flex-col"
  >
    <div className="relative h-48 overflow-hidden shrink-0 bg-[#0a0c10]">
      <img 
        src={project.thumbnailUrl || project.thumbnail} 
        alt={project.title} 
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
        onError={(e) => {
          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1558494947-a8bd2fd35897?auto=format&fit=crop&q=80&w=800';
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0c10] via-[#0a0c10]/20 to-transparent" />
      <div className="absolute top-6 right-6">
        <div className="px-3 py-1 bg-blue-500/10 backdrop-blur-md rounded-full border border-blue-500/20">
          <span className="text-[10px]  font-black text-blue-400 uppercase tracking-widest">{project.difficulty || 'Intermediate'}</span>
        </div>
      </div>
    </div>

    <div className="p-8 space-y-6 flex-1 flex flex-col">
      <div className="flex items-center justify-between">
        <span className="text-[10px]  font-black text-white/40 uppercase tracking-[0.3em] font-black">Applied Engineering</span>
        <Rocket className="text-white/20" size={16} />
      </div>
      
      <h3 className="text-[18px]  font-black text-white uppercase tracking-tight leading-tight group-hover:text-blue-400 transition-colors italic line-clamp-2">
        {project.title}
      </h3>
      
      <p className="text-[13px]  font-medium text-white/40 leading-relaxed italic line-clamp-3">
        {project.description}
      </p>

      <div className="mt-auto pt-8 border-t border-white/5">
        <div className="flex flex-wrap gap-2">
           {project.techStack?.slice(0, 3).map(tech => (
             <span key={tech} className="text-[9px]  font-black text-white/20 uppercase tracking-widest bg-white/5 px-2 py-1 rounded">
               {tech}
             </span>
           ))}
        </div>
      </div>
    </div>
  </motion.div>
);
;

// Improvement Prediction Card
const ImprovementPredictionCard = ({ prediction }: { prediction: AIRecommendationResult['improvementPrediction'] }) => (
  <div className="relative bg-[#0a0c10]/60 backdrop-blur-3xl rounded-[32px] p-10 border border-white/5 overflow-hidden">
    <div className="relative z-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 md:mb-12 gap-4">
        <div>
          <p className="text-[10px]  font-black text-white/20 uppercase tracking-[0.2em] mb-2">Growth Forecast</p>
          <h3 className="text-2xl md:text-3xl  font-[900] text-white uppercase tracking-tighter italic">Signal Projection</h3>
        </div>
        <div className="text-[10px] md:text-[11px]  font-black text-white/20 uppercase tracking-[0.3em]">
          Est. Time: {prediction.timeToAchieve}
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-8 mb-8 md:mb-10">
        <div className="p-6 md:p-8 bg-white/5 rounded-2xl border border-white/5">
          <p className="text-[10px]  font-black text-white/20 uppercase tracking-[0.2em] mb-3 md:mb-4 text-center">Baseline</p>
          <div className="text-3xl md:text-4xl  font-[900] text-white/40 text-center tracking-tighter">{formatVal(prediction.currentScore)}%</div>
        </div>
        
        <div className="p-6 md:p-8 bg-white/5 rounded-2xl border border-white/10 relative overflow-hidden">
          <p className="text-[10px]  font-black text-white/40 uppercase tracking-[0.2em] mb-3 md:mb-4 text-center">Target Signal</p>
          <div className="text-3xl md:text-4xl  font-[900] text-white text-center tracking-tighter italic">{formatVal(prediction.predictedScore)}%</div>
        </div>
        
        <div className="p-6 md:p-8 bg-white/5 rounded-2xl border border-white/5 sm:col-span-2 md:col-span-1">
          <p className="text-[10px]  font-black text-white/20 uppercase tracking-[0.2em] mb-3 md:mb-4 text-center">Expected Lift</p>
          <div className="text-3xl md:text-4xl  font-[900] text-white text-center tracking-tighter italic flex items-center justify-center gap-1">
             +{formatVal(prediction.improvementPercentage)}%
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2">
        <div className="p-6 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
          <span className="text-[11px]  font-black text-white/30 uppercase tracking-widest italic">Interview Confidence Boost</span>
          <span className="text-xl  font-[900] text-white italic">+{formatVal(prediction.interviewConfidenceBoost)}%</span>
        </div>
        <div className="p-6 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
          <span className="text-[11px]  font-black text-white/30 uppercase tracking-widest italic">Placement Readiness Lift</span>
          <span className="text-xl  font-[900] text-white italic">+{formatVal(prediction.placementReadinessBoost)}%</span>
        </div>
      </div>
    </div>
  </div>
);

// Study Note Card
const StudyNoteCard = ({ note, index }: { note: any, index: number }) => (
  <motion.a
    href={note.url || '#'}
    target="_blank"
    rel="noopener noreferrer"
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: index * 0.05 }}
    className={`relative bg-[#0a0c10]/60 backdrop-blur-3xl rounded-[32px] p-6 border border-white/5 group overflow-hidden block hover:border-white/20 transition-all h-full`}
  >
    <div className="relative z-10">
       <div className="flex items-center justify-between mb-4">
          <p className="text-[9px]  font-black text-white/20 uppercase tracking-[0.2em]">{note.category}</p>
          <BookOpen size={14} className="text-white/10 group-hover:text-white transition-colors" />
       </div>
       <h4 className="text-[15px]  font-black text-white uppercase tracking-tight leading-tight mb-4 italic line-clamp-2">
         {note.title}
       </h4>
       <div className="flex flex-wrap gap-2 mb-6">
          {note.skillsCovered?.slice(0, 2).map((s: string) => (
            <span key={s} className="text-[8px]  font-black text-white/20 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded border border-white/5">
              {s}
            </span>
          ))}
       </div>
       <div className="pt-4 border-t border-white/5 flex justify-end">
          <ArrowRight size={14} className="text-white/10 group-hover:translate-x-1 group-hover:text-white transition-all" />
       </div>
    </div>
  </motion.a>
);

// Interview Prep Card
const InterviewCard = ({ item, index }: { item: any, index: number }) => (
  <motion.a
    href={item.url || '#'}
    target="_blank"
    rel="noopener noreferrer"
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: index * 0.05 }}
    className={`relative bg-[#0a0c10]/60 backdrop-blur-3xl rounded-[32px] p-6 border border-white/5 group overflow-hidden block hover:border-white/20 transition-all h-full`}
  >
    <div className="relative z-10">
       <div className="flex items-center justify-between mb-4">
          <p className="text-[9px]  font-black text-white/20 uppercase tracking-[0.2em]">{item.category}</p>
          <Users size={14} className="text-white/10 group-hover:text-white transition-colors" />
       </div>
       <h4 className="text-[15px]  font-black text-white uppercase tracking-tight leading-tight mb-6 italic line-clamp-2">
         {item.title}
       </h4>
       <div className="pt-4 border-t border-white/5 flex justify-between items-center">
          <span className="text-[9px]  font-black text-white/20 uppercase tracking-widest">{item.timeToComplete}</span>
          <PlayCircle size={14} className="text-white/10 group-hover:scale-110 group-hover:text-white transition-all" />
       </div>
    </div>
  </motion.a>
);

// Practice Card
const PracticeCard = ({ platform, index }: { platform: any, index: number }) => (
  <motion.a
    href={platform.url || '#'}
    target="_blank"
    rel="noopener noreferrer"
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: index * 0.05 }}
    className={`relative bg-[#0a0c10]/60 backdrop-blur-3xl rounded-[32px] p-6 border border-white/5 group overflow-hidden block hover:border-white/20 transition-all h-full`}
  >
    <div className="relative z-10">
       <div className="flex items-center justify-between mb-4">
          <p className="text-[9px]  font-black text-white/20 uppercase tracking-[0.2em]">{platform.type}</p>
          <div className="flex items-center gap-1 text-[10px]  font-black text-white/20 italic">
             <Star size={10} className="fill-white/20" /> {formatVal(platform.matchPercentage)}%
          </div>
       </div>
       <h4 className="text-[15px]  font-black text-white uppercase tracking-tight leading-tight mb-6 italic line-clamp-1">
         {platform.title}
       </h4>
       <div className="pt-4 border-t border-white/5 flex justify-end">
          <ArrowRight size={14} className="text-white/10 group-hover:translate-x-1 group-hover:text-white transition-all" />
       </div>
    </div>
  </motion.a>
);


const RoadmapSection = ({ roadmap }: { roadmap: AIRecommendationResult['learningPath'] }) => (
  <div className="relative bg-[#0a0c10]/60 backdrop-blur-3xl rounded-[32px] p-10 border border-white/5 overflow-hidden">
    <div className="flex items-center justify-between mb-10 md:mb-12">
        <div>
           <p className="text-[10px]  font-black text-white/20 uppercase tracking-[0.2em] mb-2">{roadmap.title}</p>
           <h3 className="text-2xl md:text-3xl  font-[900] text-white uppercase tracking-tighter italic leading-none">AI Milestone Plan</h3>
        </div>
        <Rocket className="w-6 h-6 md:w-8 md:h-8 text-white/10" />
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
      {roadmap.phases?.map((phase: any) => (
        <div
          key={phase.phase}
          className="relative p-6 md:p-8 bg-white/5 rounded-2xl border border-white/5 group hover:bg-white/10 transition-colors"
        >
          <div className="text-[10px] md:text-[11px]  font-black text-white/30 uppercase tracking-widest mb-2 italic">{phase.weeks}</div>
          <h4 className="text-[14px] md:text-[15px]  font-black text-white uppercase tracking-widest mb-4 md:mb-6 leading-tight">{phase.phase}</h4>
          
          <div className="space-y-3">
            {phase.tasks?.map((task: string, j: number) => (
              <div key={j} className="flex gap-2 md:gap-3 items-start">
                <div className="w-1 h-1 rounded-full bg-white/20 mt-1.5 shrink-0" />
                <p className="text-[10px] md:text-[11px]  font-medium italic text-white/40 leading-relaxed">{task}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>

    <div className="mt-12 p-8 bg-white/5 rounded-2xl border border-white/5 flex flex-wrap gap-12 items-center justify-between">
      <div className="flex gap-12">
        <div>
          <p className="text-[9px]  font-black text-white/20 uppercase tracking-[0.2em] mb-2">Primary Goal</p>
          <p className="text-xl  font-[900] text-white uppercase italic tracking-widest">{roadmap.readinessGoal || 'Market Signal'}</p>
        </div>
        <div className="border-l border-white/10 pl-12">
          <p className="text-[9px]  font-black text-white/20 uppercase tracking-[0.2em] mb-2">Weekly Load</p>
          <p className="text-xl  font-[900] text-white uppercase italic tracking-widest">{roadmap.weeklyCommitment || '15 Hours'}</p>
        </div>
      </div>
    </div>
  </div>
);

export default function AICareerResults({ recommendations }: AICareerResultsProps) {
  const { 
    recommendations: recs = {
      courses: [],
      youtube: [],
      certifications: [],
      projects: [],
      studyNotes: [],
      interviewPrep: [],
      practice: []
    }, 
    learningPath = { 
      title: 'Growth Path', 
      description: 'Preparing your roadmap...', 
      total_weeks: 4, 
      phases: [], 
      weekly_commitment: '10 hrs', 
      readiness_goal: 'Job Readiness' 
    }, 
    analysisInsights,
    analysis: backwardAnalysis, 
    improvementPrediction = {
      currentScore: 0,
      predictedScore: 0,
      improvementPercentage: 0,
      timeToAchieve: '4 weeks',
      sectionImprovements: [],
      interviewConfidenceBoost: 0,
      placementReadinessBoost: 0
    }, 
    sectionScores = [],
    careerPaths = [],
    metadata = { generatedBy: 'AI' }
  } = (recommendations || {}) as any;


  // Sync analysis data regardless if the backend sent it as analysis or analysisInsights
  const analysis = analysisInsights || backwardAnalysis || {
      strengthSummary: '',
      weaknessSummary: '',
      skillGapAnalysis: '',
      improvementPriority: [],
      primaryWeaknesses: [],
      overallAssessment: '',
      careerReadinessScore: 0,
      interviewConfidence: 0
  };

  // Filter recommendations specifically by weak skills (improvement priorities)
  const weakSkills = analysis.skill_gaps || analysis.improvementPriority || analysis.primaryWeaknesses || [];
  
  const groupedRecs = weakSkills.map((skillObj: any) => {
    const skill = typeof skillObj === 'string' ? skillObj : skillObj.skill;
    const analysisObj = typeof skillObj === 'object' ? skillObj : null;
    
    const filterSkill = (list: any[]) => (list || []).filter((item: any) => {
      const skillsSource = item.skill || item.skillFocus || item.skillsTargeted || item.skills;
      const isMatchInText = (item.title || item.playlistTitle || item.name || '').toLowerCase().includes(skill.toLowerCase()) || 
                           (item.description || item.whyRecommended || '').toLowerCase().includes(skill.toLowerCase());
      
      if (isMatchInText) return true;
      if (Array.isArray(skillsSource)) return skillsSource.some((s: string) => typeof s === 'string' && s.toLowerCase().includes(skill.toLowerCase()));
      if (typeof skillsSource === 'string') return skillsSource.toLowerCase().includes(skill.toLowerCase());
      return false;
    });

    return {
      skill,
      analysis: analysisObj?.weakness_analysis || `Strategic focus on ${skill} requested for career alignment.`,
      courses: filterSkill(recs.courses).slice(0, 6),
      youtube: filterSkill(recs.youtube).slice(0, 6),
      projects: filterSkill(recs.projects).slice(0, 4),
      certifications: filterSkill(recs.certifications).slice(0, 4),
      notes: filterSkill(recs.studyNotes).slice(0, 4),
      practice: filterSkill(recs.practice).slice(0, 4)
    };
  });

  // The backend AI engine now handles perfect multi-variation generation without needing an API key. 
  // We use the direct outputs.
  const displayCerts = recs.certifications || [];
  const displayNotes = recs.studyNotes || [];
  const displayInterview = recs.interviewPrep || [];
  const displayPractice = recs.practice || [];

  // Hide supplemental content block entirely if we surprisingly have zero data overall
  const hasSupplementalData = displayCerts.length > 0 || displayNotes.length > 0 || displayInterview.length > 0 || displayPractice.length > 0;

  return (
    <div className="relative min-h-screen w-full bg-[#0a0c10] overflow-hidden selection:bg-white selection:text-black">
      {/* Background Placement Video - Cinematic Success Signals */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover opacity-[0.08] mix-blend-screen brightness-[1.1]"
        >
          <source 
              src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260206_180444_a1a13b6a-9f4a-4a2c-8f1a-6a54f67e5005.mp4" 
              type="video/mp4" 
          />
        </video>
        {/* Subtle Ambient Depth Layers */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#0a0c10] via-transparent to-[#0a0c10]/40" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0c10]/60 via-transparent to-[#0a0c10]/90" />
        <div className="absolute top-1/2 right-[-10%] -translate-y-1/2 w-[700px] h-[700px] bg-blue-500/10 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute inset-0 backdrop-blur-[1px] opacity-20" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16 space-y-20">
        {/* Header */}
        <div className="text-center px-4">
            <p className="text-[10px] md:text-[11px]  font-[900] uppercase tracking-[0.5em] text-white/20 mb-6 font-black leading-relaxed">AI Strategic Guidance</p>
            {analysis.careerReadinessScore <= 20 && (
              <div className="inline-block px-4 md:px-6 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full mb-8 backdrop-blur-xl animate-pulse">
                <span className="text-[9px] md:text-[10px]  font-black text-blue-400 uppercase tracking-[0.3em] font-black italic">🔰 Beginner Foundation Pathway Active</span>
              </div>
            )}
            <h1 className="text-4xl sm:text-5xl md:text-7xl  font-[900] text-white uppercase tracking-tighter leading-[0.85] italic mb-8">
                Prepzo AI<br />Career<br />Recommendation
            </h1>
            <p className="text-white/40 text-[14px] md:text-[16px]  font-medium max-w-2xl mx-auto leading-relaxed italic">
                {analysis.careerReadinessScore <= 20 
                  ? "Foundation mode activated. We've decoded your baseline signals and prepared a core mastery roadmap to bridge your initial skill gaps."
                  : "Decoded performance metrics processed through AI analysis. This is your high-fidelity roadmap to market dominance."}
            </p>
            <div className="mt-4 flex items-center justify-center gap-2">
               <span className="text-[9px]  font-black text-white/20 uppercase tracking-[0.2em]">Engine: {metadata?.generatedBy || 'AI'}</span>
               <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
            </div>
        </div>

        
        {/* Section Scores Grid */}
        <div className="space-y-10">
          <div className="flex items-center gap-4">
            <h2 className="text-xl md:text-2xl  font-[900] text-white uppercase tracking-tight italic">Performance Analytics</h2>
            <div className="h-[1px] flex-1 bg-white/5" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {sectionScores.map((section: any, i: number) => (
              <SectionScoreCard key={section.name} section={section} index={i} />
            ))}
          </div>
        </div>
        
        {/* AI Analysis */}
        <AIAnalysisCard analysis={analysis} />
        
        {/* Career Paths - NEW SECTION */}
        {careerPaths?.length > 0 && (
          <div className="space-y-10">
            <div className="flex items-center gap-4">
              <h2 className="text-xl md:text-2xl  font-[900] text-white uppercase tracking-tight italic">Recommended Career Roles</h2>
              <div className="h-[1px] flex-1 bg-white/5" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {careerPaths.map((path: any, i: number) => (

                <GlassCard key={i} className="rounded-[32px] p-8 bg-[#0a0c10]/60 border-white/5 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                    <TrendingUp size={60} />
                  </div>
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                      <span className="text-[9px]  font-black text-white/20 uppercase tracking-[0.3em]">Fit Score</span>
                      <span className="text-2xl  font-[900] text-emerald-400 italic">{path.fit_score}%</span>
                    </div>
                    <h4 className="text-xl  font-[900] text-white uppercase tracking-tight mb-4 group-hover:text-blue-400 transition-colors">{path.role}</h4>
                    <p className="text-[13px]  font-medium text-white/40 italic leading-relaxed mb-6">{path.why_this_role}</p>
                    <div className="pt-6 border-t border-white/5 flex justify-between items-center">
                      <div className="flex flex-col">
                        <span className="text-[9px]  font-black text-white/20 uppercase tracking-widest">Market Demand</span>
                        <span className="text-[11px]  font-bold text-white uppercase">{path.market_demand}</span>
                      </div>
                      <div className="flex flex-col text-right">
                        <span className="text-[9px]  font-black text-white/20 uppercase tracking-widest">Est. Salary</span>
                        <span className="text-[11px]  font-bold text-white uppercase">{path.salary_expectation}</span>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        )}
        
        {/* Improvement Prediction */}

        <ImprovementPredictionCard prediction={improvementPrediction} />
        
        {/* 🚀 Dynamic Roadmap Section (Primary Growth Path) */}
        <div className="space-y-10">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl  font-[900] text-white uppercase tracking-tight italic">Strategic Growth Roadmap</h2>
            <div className="h-[1px] flex-1 bg-white/5" />
          </div>
          <RoadmapSection roadmap={learningPath} />
        </div>

        {/* Weak Skill Calibration (Grouped by Weaknesses) */}
        {weakSkills.length > 0 && (
          <div className="space-y-16">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl  font-[900] text-white uppercase tracking-tight italic">Skill Gap Calibration</h2>
              <div className="h-[1px] flex-1 bg-white/5" />
            </div>
            
            <div className="space-y-24">
              {groupedRecs.map((group: any, idx: number) => (
                <div key={idx} className="space-y-8">
                  <div className="relative inline-block">
                    <p className="text-[10px]  font-black text-white/20 uppercase tracking-[0.4em] mb-2">Priority Correction</p>
                    <h3 className="text-3xl  font-[900] text-white uppercase tracking-tighter italic leading-none mb-4">{group.skill}</h3>
                    <p className="text-[13px]  font-medium text-white/50 italic leading-relaxed max-w-3xl mb-8">
                      {group.analysis}
                    </p>
                    <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-[2px] h-full bg-white/5" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {/* Courses */}
                    {group.courses.map((course: any, i: number) => (
                      <CourseCard key={`group-course-${idx}-${i}`} course={course} index={i} />
                    ))}
                    {/* Videos */}
                    {group.youtube.map((video: any, i: number) => (
                      <YouTubeCard key={`group-video-${idx}-${i}`} video={video} index={i} />
                    ))}
                    {/* Projects */}
                    {group.projects.map((project: any, i: number) => (
                      <ProjectCard key={`group-project-${idx}-${i}`} project={project} index={i} />
                    ))}
                    {/* Certifications */}
                    {group.certifications.map((cert: any, i: number) => (
                      <CertificationCard key={`group-cert-${idx}-${i}`} cert={cert} index={i} />
                    ))}
                    {/* Notes */}
                    {group.notes.map((note: any, i: number) => (
                      <StudyNoteCard key={`group-note-${idx}-${i}`} note={note} index={i} />
                    ))}
                    {/* Practice */}
                    {group.practice.map((p: any, i: number) => (
                      <PracticeCard key={`group-practice-${idx}-${i}`} platform={p} index={i} />
                    ))}
                    
                    {/* Fallback if no matching recs found for specific skill */}
                    {group.courses.length === 0 && group.youtube.length === 0 && group.projects.length === 0 && (
                      <div className="col-span-full p-6 md:p-8 rounded-[32px] bg-white/5 border border-white/5 text-center">
                        <p className="text-[11px] md:text-[12px]  font-black text-white/20 uppercase tracking-widest italic leading-relaxed">
                          System assembling specific signals for {group.skill}... access overall learning library below.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Supplemental AI Resources */}
        {hasSupplementalData && (
          <div className="mt-12 lg:mt-16 pt-12 lg:pt-16 border-t border-white/5 relative z-10 w-full">
            <div className="flex items-center justify-between mb-10 md:mb-12">
              <div>
                <h2 className="text-3xl md:text-5xl  font-[900] text-white uppercase tracking-tighter italic">Supplemental Resources</h2>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 md:gap-10">
              <div className="xl:col-span-2 space-y-12 md:space-y-20">
                {/* Credentials - Full Width Horizontal Scroll */}
                {displayCerts.length > 0 && (
                  <div className="space-y-6 mb-12">
                     <h3 className="text-lg md:text-xl  font-[900] text-white uppercase tracking-widest italic opacity-40">Credentials</h3>
                     <div className="flex overflow-x-auto gap-4 md:gap-6 pb-6 snap-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                       {displayCerts.map((cert: any, i: number) => (
                         <div key={`cert-${i}`} className="flex-none w-[85%] sm:w-[320px] md:w-[380px] snap-center">
                           <CertificationCard cert={cert} index={i} />
                         </div>
                       ))}
                     </div>
                  </div>
                )}

                {/* Signal Sheets - Full Width Horizontal Scroll */}
                {displayNotes.length > 0 && (
                  <div className="space-y-6 mb-12">
                     <h3 className="text-lg md:text-xl  font-[900] text-white uppercase tracking-widest italic opacity-40">Signal Sheets</h3>
                     <div className="flex overflow-x-auto gap-4 md:gap-6 pb-6 snap-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                       {displayNotes.map((note: any, i: number) => (
                         <div key={`note-${i}`} className="flex-none w-[85%] sm:w-[320px] md:w-[380px] snap-center">
                           <StudyNoteCard note={note} index={i} />
                         </div>
                       ))}
                     </div>
                  </div>
                )}

                {/* Interview Ops - Full Width Horizontal Scroll */}
                {displayInterview.length > 0 && (
                  <div className="space-y-6 mb-12">
                     <h3 className="text-lg md:text-xl  font-[900] text-white uppercase tracking-widest italic opacity-40">Interview Ops</h3>
                     <div className="flex overflow-x-auto gap-4 md:gap-6 pb-6 snap-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                       {displayInterview.map((item: any, i: number) => (
                         <div key={`interview-${i}`} className="flex-none w-[85%] sm:w-[320px] md:w-[380px] snap-center">
                           <InterviewCard item={item} index={i} />
                         </div>
                       ))}
                     </div>
                  </div>
                )}

                {/* Skill Lab - Full Width Horizontal Scroll */}
                {displayPractice.length > 0 && (
                  <div className="space-y-6 mb-12">
                     <h3 className="text-lg md:text-xl  font-[900] text-white uppercase tracking-widest italic opacity-40">Skill Lab</h3>
                     <div className="flex overflow-x-auto gap-4 md:gap-6 pb-6 snap-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                       {displayPractice.map((p: any, i: number) => (
                         <div key={`practice-${i}`} className="flex-none w-[85%] sm:w-[320px] md:w-[380px] snap-center">
                           <PracticeCard platform={p} index={i} />
                         </div>
                       ))}
                     </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
