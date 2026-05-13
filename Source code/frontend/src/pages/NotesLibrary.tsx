import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  ChevronDown, 
  Filter,
  BookOpen,
  Clock,
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import { getNoteCategories, getNotes, Note, NoteCategoryData } from '@/api/notes';
import { useAppStore } from '@/store/appStore';

export const NotesLibrary: React.FC = () => {
  const { setCurrentPage, setSelectedNoteId } = useAppStore();
  const [categories, setCategories] = useState<NoteCategoryData[]>([]);
  const [totalNotesCount, setTotalNotesCount] = useState<number>(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedSubSkill, setSelectedSubSkill] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data, totalNotes } = await getNoteCategories();
        setCategories(data);
        setTotalNotesCount(totalNotes);
      } catch (err: any) {
        console.error('Failed to fetch categories:', err);
        setError('Failed to load study notes categories.');
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Fetch notes when filters change
  const fetchNotes = useCallback(async () => {
    const categoryFilter = selectedCategory === 'ALL' ? undefined : selectedCategory;
    
    try {
      setLoading(true);
      const data = await getNotes({
        category: categoryFilter || undefined,
        subSkill: selectedSubSkill || undefined,
        difficulty: selectedLevel || undefined,
        search: searchQuery || undefined
      });
      setNotes(data || []);
    } catch (err: any) {
      console.error('Failed to fetch notes:', err);
      if (!error) setError('Failed to fetch requested study notes.');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, selectedSubSkill, selectedLevel, searchQuery, error]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const groupedNotes = useMemo(() => {
    return notes.reduce((acc: any, note) => {
      const key = note.subSkill || 'General';
      if (!acc[key]) acc[key] = [];
      acc[key].push(note);
      return acc;
    }, {});
  }, [notes]);

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-700 font-rubik p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-4xl font-[900] text-white italic tracking-tighter uppercase mb-2">
            STUDY <span className="text-blue-400">NOTES.</span>
          </h2>
          <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.4em] italic">
            Downloadable Study Materials & PDF Guides
          </p>
        </div>
      </div>

      {/* Search and Filter Row */}
      <div className="flex flex-col xl:flex-row gap-6 items-center justify-between">
        <div className="relative w-full xl:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-blue-400 transition-colors" size={18} />
          <input 
            type="text"
            placeholder="SEARCH NOTES..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0a0c10] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-[11px] font-[900] text-white placeholder:text-white/10 focus:outline-none focus:border-blue-400/30 transition-all uppercase italic tracking-widest"
          />
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
          {/* Custom Dropdown */}
          <div className="relative w-full sm:w-80">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              disabled={categories.length === 0}
              className={`w-full flex items-center justify-between gap-3 px-5 py-4 bg-[#0a0c10] border rounded-2xl text-[11px] font-[900] text-white uppercase tracking-widest italic transition-all ${categories.length === 0 ? 'opacity-50 cursor-not-allowed border-white/5' : 'group hover:border-blue-400/30 border-white/5'}`}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <Filter size={14} className="text-blue-400/60 shrink-0" />
                <span className="truncate">
                  {selectedCategory === 'ALL' ? 'ALL CATEGORIES' : selectedCategory ? `${selectedCategory} / ${selectedSubSkill}` : 'SELECT CATEGORY'}
                </span>
              </div>
              <ChevronDown size={14} className={`text-white/20 shrink-0 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute z-[100] mt-2 w-full bg-black border border-blue-400/20 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
                >
                  <div className="max-h-[400px] overflow-y-auto py-2">
                    {categories.length === 0 ? (
                      <div className="px-8 py-4 text-[10px] text-white/30 italic">No categories available.</div>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setSelectedCategory('ALL');
                            setSelectedSubSkill('');
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full px-8 py-3 text-left text-[10px] font-[900] uppercase tracking-widest italic transition-all hover:bg-blue-400/10 ${selectedCategory === 'ALL' ? 'text-blue-400 bg-blue-400/5' : 'text-white/40'}`}
                        >
                          ALL CATEGORIES ({totalNotesCount}+ NOTES)
                        </button>

                        {categories.map(cat => (
                          <div key={cat.category} className="mb-2">
                          <div className="px-6 py-2 text-[8px] font-black text-blue-400/40 uppercase tracking-[0.3em] bg-white/[0.02]">
                            {cat.category}
                          </div>
                          {cat.subSkills.map(skill => (
                            <button
                              key={skill.name}
                              onClick={() => {
                                setSelectedCategory(cat.category);
                                setSelectedSubSkill(skill.name);
                                setIsDropdownOpen(false);
                              }}
                              className={`w-full px-8 py-3 text-left text-[10px] font-[900] uppercase tracking-widest italic transition-colors hover:bg-blue-400/10 ${selectedSubSkill === skill.name && selectedCategory === cat.category ? 'text-blue-400 bg-blue-400/5' : 'text-white/40'}`}
                            >
                              {skill.name} ({skill.noteCount})
                            </button>
                          ))}
                        </div>
                      ))}
                    </>
                  )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div className="flex gap-2">
            {['Beginner', 'Intermediate', 'Advanced'].map(lvl => (
              <button 
                key={lvl}
                onClick={() => {
                  setSelectedLevel(selectedLevel === lvl ? null : lvl);
                }}
                className={`px-5 py-3 rounded-xl border text-[9px] font-[900] uppercase tracking-widest italic transition-all ${selectedLevel === lvl ? 'bg-blue-400 border-blue-400 text-black shadow-lg shadow-blue-400/20' : 'bg-[#0a0c10] border-white/5 text-white/20 hover:border-white/20'}`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="min-h-[500px]">
        {loading && notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-6">
            <div className="relative w-16 h-16">
              <motion.div 
                className="absolute inset-0 border-t-2 border-r-2 border-blue-400 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <motion.div 
                className="absolute inset-2 border-b-2 border-l-2 border-blue-400/30 rounded-full"
                animate={{ rotate: -360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              />
            </div>
            <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] animate-pulse italic">
              Loading Study Materials...
            </p>
          </div>
        ) : error && notes.length === 0 ? (
          <div className="p-12 text-center border border-white/5 bg-black rounded-[32px] flex flex-col items-center justify-center min-h-[400px]">
            <AlertCircle className="mb-6 text-red-500/50" size={48} />
            <h3 className="text-xl font-[900] text-white mb-2 uppercase tracking-widest italic">Connection Error</h3>
            <p className="text-white/30 mb-8 italic text-sm">{error}</p>
          </div>
        ) : notes.length === 0 ? (
          <div className="p-12 text-center border border-white/5 bg-black rounded-[40px]">
            <BookOpen className="mx-auto mb-6 text-blue-400/20" size={48} />
            <h3 className="text-xl font-[900] text-white mb-2 uppercase tracking-widest italic">No Notes Found</h3>
            <p className="text-white/30 mb-8 italic">No study materials match your current filters.</p>
            <button 
              onClick={() => {setSearchQuery(''); setSelectedLevel(null); setSelectedCategory('ALL'); setSelectedSubSkill('');}}
              className="px-8 py-3 bg-blue-400 text-black font-[900] text-[10px] uppercase tracking-widest rounded-xl hover:scale-105 transition-transform italic"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="space-y-12">
            {Object.entries(groupedNotes).map(([skill, skillNotes]: [string, any]) => (
              <div key={skill} className="space-y-6">
                <div className="flex items-center gap-4">
                  <h3 className="text-xl font-black text-white italic uppercase tracking-widest">{skill}</h3>
                  <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                  <span className="text-[10px] font-black text-blue-400 bg-blue-400/10 px-3 py-1 rounded-full uppercase tracking-widest italic">
                    {skillNotes.length} Guides
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {skillNotes.map((note: Note, idx: number) => (
                    <motion.div 
                      key={note.noteId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="group flex flex-col bg-[#0a0c10] border border-white/5 rounded-3xl hover:border-blue-400/30 transition-all overflow-hidden h-full"
                    >
                      <div className="p-6 flex-1 flex flex-col">
                        <div className="flex justify-between items-start gap-4 mb-4">
                          <span className={`shrink-0 text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded border ${note.difficulty === 'advanced' ? 'text-red-400 border-red-400/20' : note.difficulty === 'intermediate' ? 'text-yellow-400 border-yellow-400/20' : 'text-blue-400 border-blue-400/20'}`}>
                            {note.difficulty}
                          </span>
                          <div className="flex items-center gap-1 text-[10px] font-black text-white/30 uppercase tracking-widest">
                            <Clock size={12} /> {note.readTimeMinutes} min
                          </div>
                        </div>
                        
                        <h4 className="text-lg font-black text-white italic group-hover:text-blue-400 transition-colors mb-3 line-clamp-2">
                          {note.title}
                        </h4>
                        
                        <p className="text-sm text-white/40 italic leading-relaxed line-clamp-3 mb-6">
                          {note.summary}
                        </p>

                        <div className="mt-auto pt-6 border-t border-white/5">
                          <button 
                            onClick={() => {
                              setSelectedNoteId(note.noteId);
                              setCurrentPage('note-detail');
                              window.location.hash = 'note-detail';
                            }}
                            className="flex items-center justify-between w-full p-3 rounded-xl bg-white/5 hover:bg-blue-400/10 text-white/60 hover:text-blue-400 transition-all text-[10px] font-black uppercase tracking-widest italic cursor-pointer"
                          >
                            <span>Read & Download PDF</span>
                            <ExternalLink size={14} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
