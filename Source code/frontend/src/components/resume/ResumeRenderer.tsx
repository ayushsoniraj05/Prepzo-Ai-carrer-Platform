import { Mail, Phone, MapPin, Linkedin, Code, Briefcase, GraduationCap, Activity } from 'lucide-react';

interface ResumeData {
  name?: string;
  title?: string;
  contact?: {
    email?: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    website?: string;
  };
  summary?: string;
  experience?: Array<{ title?: string; company?: string; date?: string; location?: string; bullets?: string[] }>;
  projects?: Array<{ title?: string; date?: string; details?: string }>;
  education?: Array<{ degree?: string; school?: string; date?: string; details?: string }>;
  skills?: Array<{ category?: string; items?: string[]; proficiency?: number }>;
  philosophy?: string;
}

interface ResumeRendererProps {
  data?: ResumeData;
  template: string;
  markdownFallback?: string;
}

const ModernCreativeTemplate = ({ data }: { data: ResumeData }) => (
  <div className="bg-white text-gray-800 p-8 rounded-lg shadow-xl max-w-[800px] mx-auto grid grid-cols-3 gap-8">
    <div className="col-span-1 border-r border-gray-200 pr-6">
      <div className="bg-emerald-500 w-16 h-16 rounded-full mb-6 flex items-center justify-center text-white font-bold text-2xl">
        {data.name?.charAt(0) || 'U'}
      </div>
      <h1 className="text-2xl font-black uppercase text-gray-900 tracking-tight leading-none mb-2">{data.name}</h1>
      <p className="text-sm font-semibold text-emerald-600 mb-6 uppercase tracking-widest">{data.title}</p>
      
      <div className="space-y-3 text-xs mb-8">
        {data.contact?.email && <div className="flex items-center gap-2"><Mail size={12} className="text-emerald-500" /> {data.contact.email}</div>}
        {data.contact?.phone && <div className="flex items-center gap-2"><Phone size={12} className="text-emerald-500" /> {data.contact.phone}</div>}
        {data.contact?.location && <div className="flex items-center gap-2"><MapPin size={12} className="text-emerald-500" /> {data.contact.location}</div>}
        {data.contact?.linkedin && <div className="flex items-center gap-2"><Linkedin size={12} className="text-emerald-500" /> {data.contact.linkedin}</div>}
      </div>

      <div className="mb-8">
        <h2 className="text-xs font-black uppercase text-gray-900 border-b-2 border-emerald-500 pb-2 mb-4 tracking-widest">Core Skills</h2>
        <div className="space-y-4">
          {data.skills?.map((skill, i) => (
            <div key={i}>
              <p className="text-[10px] font-bold uppercase mb-1">{skill.category}</p>
              <div className="flex flex-wrap gap-1">
                {skill.items?.map((item, j) => (
                  <span key={j} className="bg-gray-100 text-[9px] px-2 py-1 rounded text-gray-600">{item}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {data.philosophy && (
        <div>
          <h2 className="text-xs font-black uppercase text-gray-900 border-b-2 border-emerald-500 pb-2 mb-4 tracking-widest">Philosophy</h2>
          <p className="text-xs italic text-gray-500 leading-relaxed">"{data.philosophy}"</p>
        </div>
      )}
    </div>

    <div className="col-span-2 space-y-8">
      <div>
        <h2 className="text-sm font-black uppercase text-gray-900 border-b border-gray-200 pb-2 mb-4 tracking-widest">Profile</h2>
        <p className="text-sm text-gray-600 leading-relaxed">{data.summary}</p>
      </div>

      <div>
        <h2 className="text-sm font-black uppercase text-gray-900 border-b border-gray-200 pb-2 mb-4 tracking-widest flex items-center gap-2">
          <Briefcase size={16} className="text-emerald-500" /> Experience
        </h2>
        <div className="space-y-6">
          {data.experience?.map((exp, i) => (
            <div key={i} className="relative pl-4 border-l-2 border-emerald-100">
              <div className="absolute w-2 h-2 bg-emerald-500 rounded-full -left-[5px] top-1.5" />
              <h3 className="font-bold text-gray-900">{exp.title}</h3>
              <p className="text-xs font-semibold text-emerald-600 mb-2">{exp.company} | {exp.date}</p>
              <ul className="list-disc list-outside ml-4 text-xs text-gray-600 space-y-1">
                {exp.bullets?.map((b, j) => <li key={j}>{b}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {data.projects && data.projects.length > 0 && (
        <div>
          <h2 className="text-sm font-black uppercase text-gray-900 border-b border-gray-200 pb-2 mb-4 tracking-widest flex items-center gap-2">
            <Code size={16} className="text-emerald-500" /> Projects
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {data.projects?.map((proj, i) => (
              <div key={i} className="bg-gray-50 p-4 rounded-lg border border-gray-100 border-l-4 border-l-emerald-500">
                <h3 className="font-bold text-gray-900 text-xs mb-1">{proj.title}</h3>
                <p className="text-[10px] text-gray-500 mb-2">{proj.date}</p>
                <p className="text-xs text-gray-600 line-clamp-3">{proj.details}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-sm font-black uppercase text-gray-900 border-b border-gray-200 pb-2 mb-4 tracking-widest flex items-center gap-2">
          <GraduationCap size={16} className="text-emerald-500" /> Education
        </h2>
        <div className="space-y-4">
          {data.education?.map((edu, i) => (
            <div key={i}>
              <h3 className="font-bold text-gray-900 text-sm">{edu.degree}</h3>
              <p className="text-xs font-semibold text-gray-600">{edu.school} | {edu.date}</p>
              <p className="text-xs text-gray-500 mt-1">{edu.details}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const ExecutiveTemplate = ({ data }: { data: ResumeData }) => (
  <div className="bg-white text-gray-800 p-10 rounded-lg shadow-xl max-w-[800px] mx-auto">
    <div className="text-center mb-10 pb-10 border-b-4 border-indigo-900">
      <h1 className="text-4xl font-serif text-indigo-950 mb-2">{data.name}</h1>
      <p className="text-md font-semibold text-indigo-700 uppercase tracking-[0.2em]">{data.title}</p>
      <div className="flex justify-center items-center gap-6 mt-4 text-xs text-gray-500">
        {data.contact?.email && <span>{data.contact.email}</span>}
        {data.contact?.phone && <span>• {data.contact.phone}</span>}
        {data.contact?.location && <span>• {data.contact.location}</span>}
        {data.contact?.linkedin && <span>• {data.contact.linkedin}</span>}
      </div>
    </div>

    <div className="mb-10 text-center max-w-2xl mx-auto">
      <p className="text-sm text-gray-700 leading-relaxed font-serif">"{data.summary}"</p>
    </div>

    <div className="grid grid-cols-3 gap-10">
      <div className="col-span-1 space-y-10">
        <div>
          <h2 className="text-sm font-bold uppercase text-indigo-950 mb-4 tracking-widest border-b border-gray-200 pb-2">Areas of Expertise</h2>
          <div className="space-y-4">
            {data.skills?.map((skill, i) => (
              <div key={i}>
                <p className="text-xs font-bold text-indigo-900 mb-2">{skill.category}</p>
                <div className="w-full bg-gray-100 rounded-full h-1.5 mb-1">
                  <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${skill.proficiency || 80}%` }}></div>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {skill.items?.map((item, j) => (
                    <span key={j} className="text-[10px] text-gray-600 bg-gray-50 border border-gray-100 px-1">{item}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-bold uppercase text-indigo-950 mb-4 tracking-widest border-b border-gray-200 pb-2">Education</h2>
          <div className="space-y-4">
            {data.education?.map((edu, i) => (
              <div key={i}>
                <h3 className="font-bold text-gray-900 text-xs">{edu.degree}</h3>
                <p className="text-[10px] font-semibold text-indigo-700">{edu.school}</p>
                <p className="text-[10px] text-gray-400">{edu.date}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="col-span-2 space-y-10">
        <div>
          <h2 className="text-sm font-bold uppercase text-indigo-950 mb-4 tracking-widest border-b border-gray-200 pb-2">Executive Experience</h2>
          <div className="space-y-8">
            {data.experience?.map((exp, i) => (
              <div key={i}>
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-bold text-indigo-950 text-md">{exp.title}</h3>
                  <span className="text-xs text-gray-500 font-semibold">{exp.date}</span>
                </div>
                <p className="text-sm font-semibold text-indigo-700 mb-3">{exp.company} <span className="text-gray-400 font-normal">| {exp.location}</span></p>
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-2">
                  {exp.bullets?.map((b, j) => <li key={j} className="pl-2 relative"><span className="absolute -left-4 text-indigo-400">•</span>{b}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
        
        {data.projects && data.projects.length > 0 && (
          <div>
            <h2 className="text-sm font-bold uppercase text-indigo-950 mb-4 tracking-widest border-b border-gray-200 pb-2">Strategic Initiatives</h2>
            <div className="space-y-6">
              {data.projects?.map((proj, i) => (
                <div key={i}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-bold text-gray-900 text-sm">{proj.title}</h3>
                    <span className="text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{proj.date}</span>
                  </div>
                  <p className="text-xs text-gray-600">{proj.details}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
);


const StandardTemplate = ({ data }: { data: ResumeData }) => (
  <div className="bg-white text-gray-900 p-10 rounded shadow-sm max-w-[800px] mx-auto font-sans">
    <div className="text-center mb-6">
      <h1 className="text-3xl font-bold mb-1">{data.name}</h1>
      <div className="flex justify-center gap-4 text-sm text-gray-600 mb-2">
         {data.contact?.email && <span>{data.contact.email}</span>}
         {data.contact?.phone && <span>{data.contact.phone}</span>}
         {data.contact?.linkedin && <span>{data.contact.linkedin}</span>}
      </div>
    </div>

    <div className="mb-6">
      <h2 className="text-lg font-bold border-b-2 border-gray-900 mb-2 uppercase pb-1">Professional Summary</h2>
      <p className="text-sm text-gray-800">{data.summary}</p>
    </div>

    <div className="mb-6">
      <h2 className="text-lg font-bold border-b-2 border-gray-900 mb-2 uppercase pb-1">Experience</h2>
      <div className="space-y-4">
        {data.experience?.map((exp, i) => (
           <div key={i}>
             <div className="flex justify-between font-bold text-sm text-gray-900">
               <span>{exp.title} - {exp.company}</span>
               <span>{exp.date}</span>
             </div>
             <ul className="list-disc list-inside mt-2 text-sm text-gray-800 space-y-1">
               {exp.bullets?.map((b, j) => <li key={j}>{b}</li>)}
             </ul>
           </div>
        ))}
      </div>
    </div>

    <div className="mb-6">
      <h2 className="text-lg font-bold border-b-2 border-gray-900 mb-2 uppercase pb-1">Education</h2>
      <div className="space-y-2">
        {data.education?.map((edu, i) => (
           <div key={i} className="flex justify-between text-sm">
             <div>
               <span className="font-bold">{edu.school}</span>
               <div>{edu.degree}</div>
             </div>
             <div className="text-right">
               <span className="font-bold">{edu.date}</span>
               <div className="text-gray-600">{edu.details}</div>
             </div>
           </div>
        ))}
      </div>
    </div>
    
    <div className="mb-6">
      <h2 className="text-lg font-bold border-b-2 border-gray-900 mb-2 uppercase pb-1">Technical Skills</h2>
      <div className="text-sm">
        {data.skills?.map((skill, i) => (
          <div key={i} className="mb-1">
            <span className="font-bold">{skill.category}: </span>
            <span className="text-gray-800">{skill.items?.join(', ')}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const AltaCVTemplate = ({ data }: { data: ResumeData }) => (
  <div className="bg-white text-gray-800 p-8 rounded shadow-lg max-w-[800px] mx-auto flex gap-8">
    <div className="w-1/3 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 border-b-2 border-emerald-600 pb-2 mb-2 uppercase">{data.name}</h1>
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-widest">{data.title}</p>
      </div>
      <div className="space-y-3 text-[11px] text-gray-600">
         {data.contact?.email && <div className="flex items-center gap-2"><Mail size={14} className="text-emerald-600" /> {data.contact.email}</div>}
         {data.contact?.phone && <div className="flex items-center gap-2"><Phone size={14} className="text-emerald-600" /> {data.contact.phone}</div>}
         {data.contact?.location && <div className="flex items-center gap-2"><MapPin size={14} className="text-emerald-600" /> {data.contact.location}</div>}
         {data.contact?.linkedin && <div className="flex items-center gap-2"><Linkedin size={14} className="text-emerald-600" /> {data.contact.linkedin}</div>}
      </div>
      
      <div>
        <h2 className="text-xs font-bold text-emerald-700 uppercase mb-3 flex items-center gap-2 border-b border-gray-100 pb-1"><Code size={14}/> Skills</h2>
        <div className="space-y-3">
          {data.skills?.map((skill, i) => (
            <div key={i}>
              <p className="text-[10px] uppercase font-bold text-gray-700 mb-1.5">{skill.category}</p>
              <div className="flex flex-wrap gap-1.5">
                {skill.items?.map((item, j) => (
                  <span key={j} className="border border-emerald-600 text-emerald-700 bg-emerald-50 text-[10px] px-2 py-0.5 rounded-full font-medium">{item}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {data.education && (
        <div>
          <h2 className="text-xs font-bold text-emerald-700 uppercase mb-3 flex items-center gap-2 border-b border-gray-100 pb-1"><GraduationCap size={14}/> Education</h2>
          <div className="space-y-4">
             {data.education.map((edu, i) => (
               <div key={i}>
                 <p className="font-bold text-xs text-gray-800">{edu.degree}</p>
                 <p className="text-[10px] text-gray-500 font-medium">{edu.school}</p>
                 <p className="text-[10px] text-emerald-600 font-bold mt-0.5">{edu.date}</p>
                 {edu.details && <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">{edu.details}</p>}
               </div>
             ))}
          </div>
        </div>
      )}
    </div>
    
    <div className="w-2/3 space-y-6">
      {data.summary && (
        <div>
           <h2 className="text-sm font-bold text-emerald-700 uppercase mb-2 border-b-2 border-gray-100 pb-1 flex items-center gap-2"><Activity size={16}/> Summary</h2>
           <p className="text-xs text-gray-600 leading-relaxed text-justify">{data.summary}</p>
        </div>
      )}

      <div>
         <h2 className="text-sm font-bold text-emerald-700 uppercase mb-4 border-b-2 border-gray-100 pb-1 flex items-center gap-2"><Briefcase size={16}/> Experience</h2>
         <div className="space-y-5">
           {data.experience?.map((exp, i) => (
             <div key={i}>
               <div className="flex justify-between items-baseline mb-1">
                 <h3 className="font-bold text-gray-900 text-sm">{exp.title}</h3>
                 <span className="text-[10px] text-emerald-700 bg-emerald-50 font-bold px-2 py-0.5 rounded border border-emerald-100">{exp.date}</span>
               </div>
               <p className="text-xs font-semibold text-emerald-600 mb-2.5">{exp.company}</p>
               <ul className="list-disc list-outside ml-4 text-[11px] text-gray-600 space-y-1.5 leading-relaxed text-justify w-full pr-2">
                 {exp.bullets?.map((b, j) => <li key={j}>{b}</li>)}
               </ul>
             </div>
           ))}
         </div>
      </div>
      
      {data.projects && data.projects.length > 0 && (
         <div>
           <h2 className="text-sm font-bold text-emerald-700 uppercase mb-4 border-b-2 border-gray-100 pb-1 flex items-center gap-2"><Code size={16}/> Projects</h2>
           <div className="space-y-4">
             {data.projects.map((proj, i) => (
               <div key={i}>
                 <div className="flex justify-between items-baseline mb-1">
                   <h3 className="font-bold text-gray-900 text-sm">{proj.title}</h3>
                   <span className="text-[10px] text-emerald-700 bg-emerald-50 font-bold px-2 py-0.5 rounded border border-emerald-100">{proj.date}</span>
                 </div>
                 <p className="text-[11px] text-gray-600 mt-1 leading-relaxed text-justify">{proj.details}</p>
               </div>
             ))}
           </div>
         </div>
      )}
    </div>
  </div>
);

const JakesResumeTemplate = ({ data }: { data: ResumeData }) => (
  <div className="bg-white text-black p-10 max-w-[800px] mx-auto font-[Times_New_Roman] shadow-sm border border-gray-200">
    <div className="text-center mb-4">
      <h1 className="text-[28px] font-bold mb-1">{data.name}</h1>
      <div className="text-[11px] flex justify-center items-center gap-2 flex-wrap text-black">
        {data.contact?.phone && <span>{data.contact.phone}</span>}
        {data.contact?.phone && <span>|</span>}
        {data.contact?.email && <span className="underline">{data.contact.email}</span>}
        {data.contact?.email && <span>|</span>}
        {data.contact?.linkedin && <span className="underline">{data.contact.linkedin}</span>}
      </div>
    </div>
    
    {data.education && data.education.length > 0 && (
      <div className="mb-3">
        <h2 className="text-[14px] font-bold border-b border-black mb-1.5 uppercase pb-0.5">Education</h2>
        {data.education?.map((edu, i) => (
          <div key={i} className="mb-2">
            <div className="flex justify-between text-[11.5px]">
              <span className="font-bold">{edu.school}</span>
              <span>{edu.date}</span>
            </div>
            <div className="flex justify-between text-[11.5px] italic">
              <span>{edu.degree}</span>
            </div>
            {edu.details && <p className="text-[11px] mt-0.5 leading-snug">{edu.details}</p>}
          </div>
        ))}
      </div>
    )}

    {data.experience && data.experience.length > 0 && (
      <div className="mb-3">
        <h2 className="text-[14px] font-bold border-b border-black mb-1.5 uppercase pb-0.5">Experience</h2>
        <div className="space-y-3">
          {data.experience?.map((exp, i) => (
            <div key={i}>
              <div className="flex justify-between text-[11.5px]">
                <span className="font-bold">{exp.title}</span>
                <span>{exp.date}</span>
              </div>
              <div className="flex justify-between text-[11.5px] italic mb-1">
                <span>{exp.company}</span>
                <span>{exp.location}</span>
              </div>
              <ul className="list-outside ml-[18px] text-[11px] space-y-[2px] leading-snug text-justify" style={{ listStyleType: 'square' }}>
                {exp.bullets?.map((b, j) => <li key={j} className="pl-1"><span className="-ml-1 mr-1"></span>{b}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>
    )}
    
    {data.projects && data.projects.length > 0 && (
      <div className="mb-3">
        <h2 className="text-[14px] font-bold border-b border-black mb-1.5 uppercase pb-0.5">Projects</h2>
        <div className="space-y-2.5">
          {data.projects?.map((proj, i) => (
            <div key={i}>
              <div className="flex justify-between text-[11.5px]">
                <span className="font-bold">{proj.title}</span>
                <span>{proj.date}</span>
              </div>
              <p className="text-[11px] mt-0.5 leading-snug text-justify">{proj.details}</p>
            </div>
          ))}
        </div>
      </div>
    )}

    {data.skills && data.skills.length > 0 && (
      <div className="mb-3">
        <h2 className="text-[14px] font-bold border-b border-black mb-1.5 uppercase pb-0.5">Technical Skills</h2>
        <div className="text-[11.5px]">
          {data.skills?.map((skill, i) => (
            <div key={i} className="mb-0.5">
              <span className="font-bold">{skill.category}: </span>
              <span>{skill.items?.join(', ')}</span>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);

const SimpleHipsterTemplate = ({ data }: { data: ResumeData }) => (
  <div className="bg-white text-gray-800 shadow-xl max-w-[800px] mx-auto flex min-h-[900px] overflow-hidden rounded-lg">
    <div className="w-[32%] bg-[#1e293b] text-white py-10 px-6">
      <div className="w-24 h-24 bg-[#0f172a] rounded-full flex items-center justify-center text-4xl font-black mb-6 border-[3px] border-[#334155] mx-auto shadow-lg">
        {data.name?.charAt(0)}
      </div>
      <h1 className="text-2xl font-black uppercase text-center mb-2 tracking-wide leading-tight">{data.name}</h1>
      <p className="text-[10px] font-bold text-sky-400 text-center mb-8 tracking-[0.2em] uppercase">{data.title}</p>
      
      <div className="space-y-5 text-xs text-slate-300 mb-10 border-t border-slate-700/50 pt-8" style={{fontFamily: 'sans-serif'}}>
        {data.contact?.email && <div className="flex items-center gap-3"><Mail size={14} className="text-slate-400"/> {data.contact.email}</div>}
        {data.contact?.phone && <div className="flex items-center gap-3"><Phone size={14} className="text-slate-400"/> {data.contact.phone}</div>}
        {data.contact?.location && <div className="flex items-center gap-3"><MapPin size={14} className="text-slate-400"/> {data.contact.location}</div>}
        {data.contact?.linkedin && <div className="flex items-center gap-3"><Linkedin size={14} className="text-slate-400"/> {data.contact.linkedin}</div>}
      </div>

      <div style={{fontFamily: 'sans-serif'}}>
        <h2 className="text-xs font-bold text-white uppercase mb-5 tracking-widest border-b border-slate-700/50 pb-2">Top Skills</h2>
        <div className="space-y-4 text-xs">
          {data.skills?.slice(0, 4).map((skill, i) => (
            <div key={i}>
              <div className="flex justify-between mb-1.5 text-[10px] text-slate-300 uppercase font-bold tracking-widest">
                 <span>{skill.category}</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 border border-slate-700/50">
                <div className="bg-sky-400 h-1.5 rounded-full" style={{ width: `${skill.proficiency || (100 - i * 10)}%` }}></div>
              </div>
              <p className="text-[9px] mt-1.5 text-slate-500 font-medium">{skill.items?.slice(0,3).join(' • ')}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
    
    <div className="w-[68%] p-10 bg-[#f8fafc]" style={{fontFamily: 'sans-serif'}}>
      {data.summary && (
        <div className="mb-10">
          <h2 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em] mb-4 flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center text-sky-600 shadow-sm"><Activity size={14}/></span> Profile
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed bg-white p-5 rounded-xl shadow-sm border border-slate-200/60 font-medium text-justify">{data.summary}</p>
        </div>
      )}

      <div className="mb-10">
        <h2 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
          <span className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center text-sky-600 shadow-sm"><Briefcase size={14}/></span> Experience
        </h2>
        <div className="space-y-6">
          {data.experience?.map((exp, i) => (
            <div key={i} className="relative pl-6 border-l-[3px] border-slate-200">
              <div className="absolute w-3.5 h-3.5 bg-white border-[3px] border-slate-800 rounded-full -left-[9px] top-1 shadow-sm"></div>
              <p className="text-[10px] font-black text-sky-600 mb-1 tracking-widest uppercase">{exp.date}</p>
              <h3 className="font-black text-slate-800 text-sm mb-0.5">{exp.title}</h3>
              <p className="text-xs text-slate-500 font-medium mb-3">{exp.company}</p>
              <ul className="list-disc list-outside ml-4 text-[11px] text-slate-600 space-y-1.5 leading-relaxed text-justify">
                {exp.bullets?.map((b, j) => <li key={j}>{b}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>
      
      {data.education && (
         <div className="mb-10">
           <h2 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
             <span className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center text-sky-600 shadow-sm"><GraduationCap size={14}/></span> Education
           </h2>
           <div className="space-y-4">
             {data.education?.map((edu, i) => (
               <div key={i} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200/60">
                 <h3 className="font-black text-slate-800 text-sm mb-1">{edu.degree}</h3>
                 <p className="text-xs text-sky-600 font-bold tracking-wide">{edu.school} <span className="text-slate-400 font-medium">| {edu.date}</span></p>
                 {edu.details && <p className="text-[11px] text-slate-500 mt-2 font-medium">{edu.details}</p>}
               </div>
             ))}
           </div>
         </div>
      )}
    </div>
  </div>
);

const MBZUAITemplate = ({ data }: { data: ResumeData }) => (
  <div className="bg-white text-gray-900 px-12 py-10 max-w-[800px] mx-auto shadow-md">
    <div className="border-b-4 border-[#003366] pb-5 mb-5 text-center">
      <h1 className="text-[32px] font-serif font-bold text-[#003366] mb-1 tracking-tight">{data.name?.toUpperCase()}</h1>
      <p className="text-[13px] text-[#0055A4] tracking-[0.15em] uppercase font-bold">{data.title}</p>
      <div className="mt-3 flex justify-center gap-5 text-[11px] text-gray-700 font-sans">
        {data.contact?.phone && <span className="flex items-center gap-1.5"><Phone size={12} className="text-[#003366]"/> {data.contact.phone}</span>}
        {data.contact?.email && <span className="flex items-center gap-1.5"><Mail size={12} className="text-[#003366]"/> {data.contact.email}</span>}
        {data.contact?.linkedin && <span className="flex items-center gap-1.5"><Linkedin size={12} className="text-[#003366]"/> {data.contact.linkedin}</span>}
      </div>
    </div>
    
    <div className="font-sans">
      {data.summary && (
        <div className="mb-6">
          <p className="text-xs text-gray-700 leading-relaxed font-serif text-justify border-l-4 border-gray-200 pl-4 py-1">{data.summary}</p>
        </div>
      )}

      {data.experience && data.experience.length > 0 && (
         <div className="mb-6">
           <h2 className="text-[13px] font-bold text-[#003366] uppercase tracking-widest border-b border-gray-300 pb-1.5 mb-3 font-serif">Professional Experience</h2>
           <div className="space-y-5">
             {data.experience?.map((exp, i) => (
               <div key={i}>
                 <div className="flex flex-row justify-between items-end mb-0.5">
                   <div>
                     <h3 className="font-bold text-gray-900 text-sm">{exp.title}</h3>
                     <p className="text-[11.5px] font-bold text-[#0055A4] italic">{exp.company}</p>
                   </div>
                   <div className="text-right">
                     <span className="text-[10px] text-gray-600 font-bold uppercase tracking-wider">{exp.date}</span>
                   </div>
                 </div>
                 <ul className="list-disc list-outside ml-[18px] text-[11.5px] text-gray-700 space-y-1 mt-1.5 text-justify leading-relaxed">
                   {exp.bullets?.map((b, j) => <li key={j}>{b}</li>)}
                 </ul>
               </div>
             ))}
           </div>
         </div>
      )}
      
      {data.education && data.education.length > 0 && (
         <div className="mb-6">
           <h2 className="text-[13px] font-bold text-[#003366] uppercase tracking-widest border-b border-gray-300 pb-1.5 mb-3 font-serif">Academic Background</h2>
           <div className="space-y-4">
             {data.education?.map((edu, i) => (
               <div key={i} className="flex justify-between items-start">
                 <div>
                   <h3 className="font-bold text-gray-900 text-[13px]">{edu.degree}</h3>
                   <p className="text-[11.5px] text-gray-700 font-medium mt-0.5">{edu.school}</p>
                   {edu.details && <p className="text-[11px] text-gray-500 mt-1 italic">{edu.details}</p>}
                 </div>
                 <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">{edu.date}</span>
               </div>
             ))}
           </div>
         </div>
      )}

      {data.skills && data.skills.length > 0 && (
        <div>
          <h2 className="text-[13px] font-bold text-[#003366] uppercase tracking-widest border-b border-gray-300 pb-1.5 mb-3 font-serif">Core Competencies</h2>
          <div className="grid grid-cols-2 gap-4">
            {data.skills?.map((skill, i) => (
              <div key={i}>
                <h3 className="text-[10px] font-bold text-gray-900 uppercase tracking-[0.1em] mb-1">— {skill.category}</h3>
                <p className="text-[11.5px] text-gray-700 font-medium">{skill.items?.join(' • ')}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  </div>
);

export const ResumeRenderer: React.FC<ResumeRendererProps> = ({ data, template, markdownFallback }) => {
  if (!data) {
    if (markdownFallback) {
      return (
        <div className="p-8 bg-white text-gray-900 rounded-lg shadow-xl max-w-[800px] mx-auto w-full">
           <pre className="whitespace-pre-wrap font-sans text-sm">{markdownFallback}</pre>
        </div>
      );
    }
    return <div>No resume data available.</div>;
  }

  if (template === 'Modern Creative') return <ModernCreativeTemplate data={data} />;
  if (template === 'Executive Leadership') return <ExecutiveTemplate data={data} />;
  if (template === 'AltaCV Modern') return <AltaCVTemplate data={data} />;
  if (template === 'Jakes Resume') return <JakesResumeTemplate data={data} />;
  if (template === 'Simple Hipster') return <SimpleHipsterTemplate data={data} />;
  if (template === 'MBZUAI Academic') return <MBZUAITemplate data={data} />;
  
  return <StandardTemplate data={data} />;
};
