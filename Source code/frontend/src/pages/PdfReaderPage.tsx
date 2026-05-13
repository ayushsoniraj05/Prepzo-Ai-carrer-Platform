import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getNoteById, Note, Annotation, getNoteAnnotations, saveNoteAnnotations } from '@/api/notes';
import { useAuthStore } from '@/store/authStore';
import { PdfViewer } from '@/components/notes/PdfViewer';
import { AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const PdfReaderPage: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const [noteId, setNoteId] = useState<string | null>(null);
  const [note, setNote] = useState<Note | null>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Extract note ID from URL: /#reader?id=xyz
    const hash = window.location.hash;
    if (hash.includes('?id=')) {
      const id = hash.split('?id=')[1].split('&')[0];
      setNoteId(id);
    } else {
      setError('No document ID provided.');
      setLoading(false);
    }
  }, []);

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
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0c10] space-y-6">
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
          Loading Document...
        </p>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0c10]">
        <div className="p-12 text-center border border-white/5 bg-black rounded-[32px] flex flex-col items-center justify-center max-w-lg mx-auto">
          <AlertCircle className="mb-6 text-red-500/50" size={48} />
          <h3 className="text-xl font-[900] text-white mb-2 uppercase tracking-widest italic">Access Restricted</h3>
          <p className="text-white/30 mb-8 italic text-sm">{error || "The requested study material does not exist."}</p>
          <button 
            onClick={() => {
              if (window.history.length > 1) {
                window.history.back();
              } else {
                window.location.hash = 'notes';
              }
            }}
            className="px-8 py-3 bg-white/5 text-white border border-white/10 font-[900] text-[10px] uppercase tracking-widest rounded-xl hover:bg-white/10 transition-all italic cursor-pointer"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const serverUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';
  const pdfUrl = note.content.startsWith('http') ? note.content : `${serverUrl}${note.content}`;

  // If the content is not a PDF but rather HTML content (like the fake notes before)
  const isHtmlContent = note.content.trim().startsWith('<') || 
                        (note.content.includes('<h1') && note.content.includes('</h1>')) || 
                        (note.content.includes('<div') && note.content.includes('</div>'));

  return (
    <div className="w-full h-screen bg-[#0a0c10] flex flex-col overflow-hidden font-rubik">
      {/* Slim Header */}
      <div className="h-14 bg-black border-b border-white/5 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-sm font-[900] text-white italic tracking-widest uppercase truncate max-w-[300px] md:max-w-[600px]">
            {note.title}
          </h1>
          <span className="hidden md:inline-flex text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-sm border border-blue-400/20 text-blue-400 bg-blue-400/5">
            Reading Mode
          </span>
        </div>
        <button 
          onClick={() => {
            if (window.history.length > 1) {
              window.history.back();
            } else {
              window.location.hash = `note-detail?id=${noteId}`;
            }
          }}
          className="text-[10px] font-black text-white/40 uppercase tracking-widest italic hover:text-white transition-colors bg-transparent border-none cursor-pointer"
        >
          Exit Reading Mode
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 w-full overflow-hidden">
        {isHtmlContent ? (
          <div className="bg-[#0a0c10] border border-white/5 rounded-[24px] p-8 h-full overflow-y-auto custom-scrollbar">
            <div 
              className="note-content-render prose prose-invert max-w-none px-4 md:px-8 pb-8"
              dangerouslySetInnerHTML={{ __html: note.content }}
            />
          </div>
        ) : (
          <PdfViewer 
            url={pdfUrl} 
            initialAnnotations={annotations} 
            onSave={handleSaveAnnotations}
          />
        )}
      </div>
    </div>
  );
};
