import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  Clock,
  AlertCircle
} from 'lucide-react';
import { getNoteById, Note, Annotation, getNoteAnnotations, saveNoteAnnotations } from '@/api/notes';
import { useAppStore } from '@/store/appStore';
import { PdfViewer } from '@/components/notes/PdfViewer';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'react-hot-toast';

export const NoteDetail: React.FC = () => {
  const { selectedNoteId, setCurrentPage } = useAppStore();
  const { isAuthenticated } = useAuthStore();
  const noteId = selectedNoteId;
  const [note, setNote] = useState<Note | null>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNoteAndAnnotations = async () => {
      if (!noteId) return;
      try {
        setLoading(true);
        const [noteData, annotationData] = await Promise.all([
          getNoteById(noteId),
          isAuthenticated ? getNoteAnnotations(noteId) : Promise.resolve([])
        ]);
        setNote(noteData);
        setAnnotations(annotationData || []);
      } catch (err: any) {
        console.error('Failed to fetch data:', err);
        if (err.response?.status === 401) {
          setError('Please log in to access study tools and progress.');
        } else {
          setError('Failed to load study material.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchNoteAndAnnotations();
  }, [noteId, isAuthenticated]);

  const handleSaveAnnotations = async (newAnnotations: Annotation[]) => {
    if (!noteId) return;
    if (!isAuthenticated) {
      toast.error('Please log in to save your progress.');
      return;
    }
    try {
      const saved = await saveNoteAnnotations(noteId, newAnnotations);
      setAnnotations(saved);
      toast.success('Study progress saved!');
    } catch (err) {
      console.error('Failed to save annotations:', err);
      toast.error('Failed to save progress.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] space-y-6">
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
          Decrypting Study Grid...
        </p>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="p-12 text-center border border-white/5 bg-black rounded-[32px] flex flex-col items-center justify-center min-h-[400px] max-w-4xl mx-auto mt-12">
        <AlertCircle className="mb-6 text-red-500/50" size={48} />
        <h3 className="text-xl font-[900] text-white mb-2 uppercase tracking-widest italic">Access Restricted</h3>
        <p className="text-white/30 mb-8 italic text-sm">{error || "The requested study material does not exist or has been removed."}</p>
        <button 
          onClick={() => {
            setCurrentPage('notes');
            window.location.hash = 'notes';
          }}
          className="px-8 py-3 bg-white/5 text-white border border-white/10 font-[900] text-[10px] uppercase tracking-widest rounded-xl hover:bg-white/10 transition-all italic cursor-pointer"
        >
          Return to Library
        </button>
      </div>
    );
  }

  const serverUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';
  const pdfUrl = note.content.startsWith('http') ? note.content : `${serverUrl}${note.content}`;

  // Robust check for HTML content vs PDF path
  const isHtmlContent = note.content.trim().startsWith('<') || 
                        (note.content.includes('<h1') && note.content.includes('</h1>')) || 
                        (note.content.includes('<div') && note.content.includes('</div>'));

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 font-rubik p-4 md:p-8 print:p-0">
      {/* Back Button */}
      <div className="flex justify-between items-center print:hidden">
        <button 
          onClick={() => {
            setCurrentPage('notes');
            window.location.hash = 'notes';
          }}
          className="inline-flex items-center gap-2 text-[10px] font-black text-white/40 uppercase tracking-widest italic hover:text-blue-400 transition-colors cursor-pointer bg-transparent border-none"
        >
          <ArrowLeft size={14} /> Back to Library
        </button>

        <button 
          onClick={() => {
            setCurrentPage('notes');
            window.location.hash = 'notes';
          }}
          className="inline-flex items-center gap-2 text-[10px] font-black text-white/40 uppercase tracking-widest italic hover:text-blue-400 transition-colors cursor-pointer bg-transparent border-none"
        >
          <ArrowLeft size={14} /> Back to Library
        </button>
      </div>

      {/* Header Info */}
      <div className="bg-black border border-white/5 p-8 md:p-12 rounded-[40px] relative overflow-hidden print:border-none print:p-0 print:bg-white print:text-black">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-400/30 to-transparent print:hidden" />
        
        <div className="flex flex-wrap items-center gap-4 mb-6 print:hidden">
          <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-md border ${note.difficulty === 'advanced' ? 'text-red-400 border-red-400/20 bg-red-400/5' : note.difficulty === 'intermediate' ? 'text-yellow-400 border-yellow-400/20 bg-yellow-400/5' : 'text-blue-400 border-blue-400/20 bg-blue-400/5'}`}>
            {note.difficulty}
          </span>
          <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] bg-white/[0.02] px-3 py-1.5 rounded-md">
            {note.category}
          </span>
          <span className="text-[10px] font-black text-blue-400/40 uppercase tracking-[0.3em] bg-blue-400/5 px-3 py-1.5 rounded-md border border-blue-400/10">
            Smart Study Active
          </span>
          <div className="flex items-center gap-1.5 text-[10px] font-black text-white/30 uppercase tracking-widest ml-auto">
            <Clock size={12} /> {note.readTimeMinutes} min read
          </div>
        </div>

        <h1 className="text-3xl md:text-5xl font-[900] text-white italic tracking-tighter uppercase mb-6 leading-tight print:text-black">
          {note.title}
        </h1>

        <p className="text-lg text-white/50 italic leading-relaxed max-w-4xl print:text-gray-600">
          {note.summary}
        </p>
      </div>

      {/* Content Area */}
      <div className="h-[900px] w-full">
        {isHtmlContent ? (
          <div className="bg-[#0a0c10] border border-white/5 rounded-[40px] p-8 h-full overflow-y-auto custom-scrollbar">
            <div 
              className="note-content-render prose prose-invert max-w-none px-4 md:px-8 pb-8 print:text-black print:prose-black"
              dangerouslySetInnerHTML={{ __html: note.content }}
            />
          </div>
        ) : (
          <PdfViewer 
            url={pdfUrl} 
            initialAnnotations={annotations} 
            onSave={handleSaveAnnotations}
            onEnterReadingMode={() => {
              setCurrentPage('reader');
              window.location.hash = `reader?id=${noteId}`;
            }}
          />
        )}
      </div>
    </div>
  );
};
