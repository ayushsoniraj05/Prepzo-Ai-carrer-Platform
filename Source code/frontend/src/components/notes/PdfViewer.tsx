import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import * as pdfjs from 'pdfjs-dist';
import { Annotation } from '@/api/notes';
import {
  Highlighter, 
  StickyNote, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Save,
  Eraser,
  Maximize2
} from 'lucide-react';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfViewerProps {
  url: string;
  initialAnnotations: Annotation[];
  onSave: (annotations: Annotation[]) => void;
  onEnterReadingMode?: () => void;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({ url, initialAnnotations, onSave, onEnterReadingMode }) => {
  const [pdf, setPdf] = useState<any>(null);
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.5);
  const [annotations, setAnnotations] = useState<Annotation[]>(initialAnnotations);
  const [activeTool, setActiveTool] = useState<'none' | 'highlight' | 'note' | 'eraser'>('none');
  const [activeColor, setActiveColor] = useState('#ffff00');
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Animation, cursor, and drawing states
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState<'next' | 'prev'>('next');
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentRect, setCurrentRect] = useState<{x: number, y: number, w: number, h: number} | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Track mouse for custom highlighter pen cursor
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Load PDF
  useEffect(() => {
    const loadPdf = async () => {
      try {
        setLoading(true);
        setLoadError(null);
        const loadingTask = pdfjs.getDocument(url);
        const pdfDoc = await loadingTask.promise;
        setPdf(pdfDoc);
        setNumPages(pdfDoc.numPages);
        setLoading(false);
      } catch (err: any) {
        console.error('Error loading PDF:', err);
        const errorMsg = err?.message || 'Unknown error';
        if (errorMsg.includes('Missing PDF') || errorMsg.includes('404') || err?.name === 'MissingPDFException') {
          setLoadError('This PDF study material is currently unavailable on the server. It may still be uploading or the server is being updated.');
        } else {
          setLoadError(`Failed to load PDF: ${errorMsg}`);
        }
        setLoading(false);
      }
    };
    loadPdf();
  }, [url]);

  // Render Page
  const renderPage = useCallback(async (pageNum: number, currentScale: number) => {
    if (!pdf || !canvasRef.current || !containerRef.current) return;

    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: currentScale });
    
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;
    
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
      canvasContext: context,
      viewport: viewport
    };

    await page.render(renderContext).promise;
    setIsFlipping(false); // Reset flip animation after render

    // Render Text Layer for selection
    const textContent = await page.getTextContent();
    const textLayerDiv = document.createElement('div');
    textLayerDiv.setAttribute('class', 'textLayer');
    textLayerDiv.style.height = `${viewport.height}px`;
    textLayerDiv.style.width = `${viewport.width}px`;
    textLayerDiv.style.position = 'absolute';
    textLayerDiv.style.top = '0';
    textLayerDiv.style.left = '0';
    textLayerDiv.style.lineHeight = '1';
    
    // Remove old text layer if exists
    const oldTextLayer = containerRef.current.querySelector('.textLayer');
    if (oldTextLayer) oldTextLayer.remove();
    
    containerRef.current.appendChild(textLayerDiv);

    pdfjs.renderTextLayer({
      textContentSource: textContent,
      container: textLayerDiv,
      viewport: viewport,
      textDivs: []
    });
  }, [pdf]);

  useEffect(() => {
    renderPage(currentPage, scale);
  }, [currentPage, scale, renderPage]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (activeTool !== 'highlight') return;
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;

    const isOverCanvas = 
      e.clientX >= canvasRect.left && 
      e.clientX <= canvasRect.right && 
      e.clientY >= canvasRect.top && 
      e.clientY <= canvasRect.bottom;

    if (isOverCanvas) {
      setIsDrawing(true);
      setStartPos({ x: e.clientX, y: e.clientY });
      setCurrentRect(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDrawing && activeTool === 'highlight') {
      const x = Math.min(e.clientX, startPos.x);
      const y = Math.min(e.clientY, startPos.y);
      const w = Math.abs(e.clientX - startPos.x);
      const h = Math.abs(e.clientY - startPos.y);
      // Only show rect if dragged a minimum distance
      if (w > 5 || h > 5) {
        setCurrentRect({ x, y, w, h });
      }
    }
  };

  // Handle Text Selection, Rect Drawing, or Note Placement
  const handleMouseUp = (e: React.MouseEvent) => {
    if (activeTool === 'none') return;

    if (activeTool === 'note') {
      const canvasRect = canvasRef.current?.getBoundingClientRect();
      if (!canvasRect) return;

      const newAnnotation: Annotation = {
        id: Math.random().toString(36).substr(2, 9),
        type: 'note',
        pageNumber: currentPage,
        color: activeColor,
        rects: [{
          x1: (e.clientX - canvasRect.left) / scale,
          y1: (e.clientY - canvasRect.top) / scale,
          x2: (e.clientX + 200 - canvasRect.left) / scale,
          y2: (e.clientY + 100 - canvasRect.top) / scale,
          width: 200 / scale,
          height: 100 / scale
        }],
        content: '',
        createdAt: new Date().toISOString()
      };
      setAnnotations(prev => [...prev, newAnnotation]);
      setEditingNoteId(newAnnotation.id);
      setIsDrawing(false);
      setCurrentRect(null);
      return;
    }

    if (activeTool !== 'highlight') {
      setIsDrawing(false);
      setCurrentRect(null);
      return;
    }

    // 1. Try text selection highlight first
    const selection = window.getSelection();
    if (selection && !selection.isCollapsed && selection.rangeCount > 0 && selection.toString().trim() !== '') {
      const range = selection.getRangeAt(0);
      const rawRects = Array.from(range.getClientRects());
      
      if (rawRects.length > 0) {
        const canvasRect = canvasRef.current?.getBoundingClientRect();
        if (canvasRect) {
          // Normalize rects: Group by approximate vertical position and unify height
          const processedRects = rawRects.map(r => ({
            x1: (r.left - canvasRect.left) / scale,
            y1: (r.top - canvasRect.top) / scale,
            x2: (r.right - canvasRect.left) / scale,
            y2: (r.bottom - canvasRect.top) / scale,
            width: r.width / scale,
            height: r.height / scale
          }));

          const newAnnotation: Annotation = {
            id: Math.random().toString(36).substr(2, 9),
            type: 'highlight',
            pageNumber: currentPage,
            color: activeColor,
            rects: processedRects,
            createdAt: new Date().toISOString()
          };
          setAnnotations(prev => [...prev, newAnnotation]);
          selection.removeAllRanges();
          setIsDrawing(false);
          setCurrentRect(null);
          return;
        }
      }
    }

    // 2. If no text was selected, fallback to rectangular drawing
    if (isDrawing && currentRect) {
      const canvasRect = canvasRef.current?.getBoundingClientRect();
      if (canvasRect) {
        const newAnnotation: Annotation = {
          id: Math.random().toString(36).substr(2, 9),
          type: 'highlight',
          pageNumber: currentPage,
          color: activeColor,
          rects: [{
            x1: (currentRect.x - canvasRect.left) / scale,
            y1: (currentRect.y - canvasRect.top) / scale,
            x2: (currentRect.x + currentRect.w - canvasRect.left) / scale,
            y2: (currentRect.y + currentRect.h - canvasRect.top) / scale,
            width: currentRect.w / scale,
            height: currentRect.h / scale
          }],
          createdAt: new Date().toISOString()
        };
        setAnnotations(prev => [...prev, newAnnotation]);
      }
    }

    setIsDrawing(false);
    setCurrentRect(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    await onSave(annotations);
    setIsSaving(false);
  };

  const removeAnnotation = (id: string) => {
    setAnnotations(prev => prev.filter(a => a.id !== id));
  };

  const handlePageTurn = (direction: 'next' | 'prev') => {
    if (direction === 'next' && currentPage >= numPages) return;
    if (direction === 'prev' && currentPage <= 1) return;
    
    setFlipDirection(direction);
    setIsFlipping(true);
    
    setTimeout(() => {
      setCurrentPage(prev => direction === 'next' ? prev + 1 : prev - 1);
    }, 150); // Change page halfway through flip
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0c10] rounded-[32px] border border-white/5 overflow-hidden">
      <style>{`
        .textLayer {
          position: absolute;
          left: 0;
          top: 0;
          right: 0;
          bottom: 0;
          overflow: hidden;
          line-height: 1.0;
        }
        .textLayer > span {
          color: transparent;
          position: absolute;
          white-space: pre;
          cursor: text;
          transform-origin: 0% 0%;
        }
        .textLayer ::selection {
          background: rgba(0, 0, 255, 0.2);
        }
      `}</style>
      {/* Error State */}
      {loadError && (
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.072 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
          </div>
          <h3 className="text-xl font-[900] text-white mb-3 uppercase tracking-widest italic">PDF Unavailable</h3>
          <p className="text-white/40 mb-8 max-w-md italic text-sm leading-relaxed">{loadError}</p>
          <div className="flex gap-4">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-500/20 transition-all"
            >
              Try Direct Link
            </a>
            <button
              onClick={() => { window.location.hash = 'notes'; }}
              className="px-6 py-3 bg-white/5 border border-white/10 text-white/60 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-white/10 transition-all"
            >
              Back to Library
            </button>
          </div>
        </div>
      )}
      {/* Toolbar - only show when no error */}
      {!loadError && (
      <>
      <div className="flex items-center justify-between px-6 py-4 bg-black/40 border-b border-white/5 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="flex bg-white/5 rounded-xl p-1">
            <button 
              onClick={() => setActiveTool(activeTool === 'highlight' ? 'none' : 'highlight')}
              className={`p-2 rounded-lg transition-all ${activeTool === 'highlight' ? 'bg-blue-400 text-black shadow-lg' : 'text-white/40 hover:text-white'}`}
              title="Highlight Tool"
            >
              <Highlighter size={18} />
            </button>
            <button 
              onClick={() => setActiveTool(activeTool === 'eraser' ? 'none' : 'eraser')}
              className={`p-2 rounded-lg transition-all ${activeTool === 'eraser' ? 'bg-red-400 text-black shadow-lg' : 'text-white/40 hover:text-white'}`}
              title="Eraser Tool"
            >
              <Eraser size={18} />
            </button>
            <button 
              onClick={() => setActiveTool(activeTool === 'note' ? 'none' : 'note')}
              className={`p-2 rounded-lg transition-all ${activeTool === 'note' ? 'bg-blue-400 text-black shadow-lg' : 'text-white/40 hover:text-white'}`}
              title="Sticky Note Tool"
            >
              <StickyNote size={18} />
            </button>
          </div>

          {activeTool !== 'none' && (
            <div className="flex gap-2 animate-in slide-in-from-left-4 duration-300">
              {['#ffff00', '#00ff00', '#ff00ff', '#00ffff'].map(color => (
                <button 
                  key={color}
                  onClick={() => setActiveColor(color)}
                  className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${activeColor === color ? 'border-white' : 'border-transparent'}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl">
            <button onClick={() => handlePageTurn('prev')} className="text-white/40 hover:text-white transition-colors">
              <ChevronLeft size={18} />
            </button>
            <span className="text-[10px] font-black text-white/60 uppercase tracking-widest min-w-[80px] text-center">
              Page {currentPage} / {numPages}
            </span>
            <button onClick={() => handlePageTurn('next')} className="text-white/40 hover:text-white transition-colors">
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => setScale(prev => Math.max(0.5, prev - 0.2))} className="p-2 text-white/40 hover:text-white transition-colors">
              <ZoomOut size={18} />
            </button>
            <button onClick={() => setScale(prev => Math.min(3, prev + 0.2))} className="p-2 text-white/40 hover:text-white transition-colors">
              <ZoomIn size={18} />
            </button>
            {onEnterReadingMode && (
              <button 
                onClick={onEnterReadingMode} 
                className="p-2 ml-2 text-blue-400/80 hover:text-blue-400 bg-blue-500/10 rounded-lg hover:bg-blue-500/20 transition-all"
                title="Enter Reading Mode"
              >
                <Maximize2 size={16} />
              </button>
            )}
          </div>

          <button 
            onClick={handleSave}
            disabled={isSaving}
            className={`flex items-center gap-2 px-6 py-2.5 bg-emerald-500 text-black text-[10px] font-black uppercase tracking-widest italic rounded-xl hover:scale-105 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50`}
          >
            {isSaving ? <div className="w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : <Save size={14} />}
            {isSaving ? 'SAVING...' : 'SAVE EDITS'}
          </button>
        </div>
      </div>

      {/* Content Wrapper for Row Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Main Viewer Area */}
        <div 
          className={`flex-1 overflow-auto bg-[#07090c] p-6 md:p-12 custom-scrollbar relative ${activeTool === 'eraser' ? 'cursor-crosshair' : activeTool === 'highlight' ? 'cursor-none' : ''}`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
        <motion.div 
          ref={containerRef} 
          className="relative mx-auto bg-white shadow-2xl transition-all duration-300 transform-gpu" 
          style={{ width: 'fit-content' }}
          animate={{
            rotateY: isFlipping ? (flipDirection === 'next' ? -90 : 90) : 0,
            opacity: isFlipping ? 0.3 : 1,
            scale: isFlipping ? 0.95 : 1
          }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-50">
              <div className="w-12 h-12 border-4 border-blue-400/20 border-t-blue-400 rounded-full animate-spin" />
            </div>
          )}
          
          <canvas ref={canvasRef} className="block" />

          {/* Annotation Layer */}
          <div className="absolute inset-0 pointer-events-none">
            {annotations.filter(a => a.pageNumber === currentPage).map(anno => (
              <React.Fragment key={anno.id}>
                {anno.rects.map((r, i) => (
                  <div 
                    key={i}
                    onClick={(e) => {
                      if (activeTool === 'eraser') {
                        e.stopPropagation();
                        removeAnnotation(anno.id);
                      }
                    }}
                    className={`absolute pointer-events-auto ${activeTool === 'eraser' ? 'cursor-crosshair hover:bg-red-500/20' : 'cursor-pointer'} group`}
                    style={{
                      // Re-scale coordinates for display
                      left: r.x1 * scale,
                      top: r.y1 * scale,
                      width: r.width * scale,
                      height: r.height * scale,
                      backgroundColor: anno.type === 'note' ? `${anno.color}dd` : `${anno.color}88`,
                      mixBlendMode: anno.type === 'highlight' ? 'multiply' : 'normal',
                      borderRadius: anno.type === 'note' ? '8px' : '2px',
                      boxShadow: anno.type === 'note' ? '0 10px 30px rgba(0,0,0,0.3)' : 'none',
                      padding: anno.type === 'note' ? '12px' : '0',
                    }}
                  >
                    {anno.type === 'note' && (
                      <div className="w-full h-full flex flex-col pointer-events-auto">
                        <textarea
                          autoFocus={editingNoteId === anno.id}
                          value={anno.content}
                          onChange={(e) => {
                            const newContent = e.target.value;
                            setAnnotations(prev => prev.map(a => a.id === anno.id ? { ...a, content: newContent } : a));
                          }}
                          onBlur={() => setEditingNoteId(null)}
                          className="w-full h-full bg-transparent border-none outline-none text-black text-[10px] font-medium placeholder:text-black/30 resize-none"
                          placeholder="Type your note here..."
                        />
                      </div>
                    )}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        removeAnnotation(anno.id);
                      }}
                      className="absolute -top-3 -right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 text-white p-1 rounded-full hover:scale-110 shadow-lg"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
        </motion.div>

        {/* Custom Highlighter Cursor */}
        {activeTool === 'highlight' && (
          <motion.div
            className="fixed top-0 left-0 pointer-events-none z-[100] drop-shadow-2xl"
            animate={{
              x: mousePos.x, // Align exactly horizontally
              y: mousePos.y - 24 // Offset slightly vertically so tip touches mouse
            }}
            transition={{
              type: "spring",
              damping: 30,
              stiffness: 400,
              mass: 0.1
            }}
          >
            <Highlighter size={24} color={activeColor} strokeWidth={2.5} />
            <div 
              className="absolute top-full left-1/2 -translate-x-1/2 w-4 h-4 rounded-full mt-1 opacity-50 blur-[2px]"
              style={{ backgroundColor: activeColor }}
            />
          </motion.div>
        )}

        {/* Temporary Drawing Rect */}
        {currentRect && (
          <div 
            className="fixed pointer-events-none z-[90] rounded-sm"
            style={{
              left: currentRect.x,
              top: currentRect.y,
              width: currentRect.w,
              height: currentRect.h,
              backgroundColor: `${activeColor}44`,
              border: `1px dashed ${activeColor}`
            }}
          />
        )}
      </div>
      
      {/* Sidebar for Notes (Optional) */}
      <div className="hidden lg:flex w-80 border-l border-white/5 bg-black/20 backdrop-blur-xl p-6 flex-col">
        <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-6 italic">STUDY ANNOTATIONS</h3>
        <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar">
          {annotations.length === 0 ? (
            <p className="text-[10px] text-white/10 italic text-center py-12">No highlights or notes yet. Select text to start studying.</p>
          ) : (
            annotations.map(anno => (
              <div key={anno.id} className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all group">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Page {anno.pageNumber}</span>
                  <button onClick={() => removeAnnotation(anno.id)} className="text-white/10 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                    <Trash2 size={12} />
                  </button>
                </div>
                <div className="w-full h-1 rounded-full mb-3" style={{ backgroundColor: anno.color }} />
                <p className="text-[10px] text-white/60 italic leading-relaxed">
                  {anno.type === 'highlight' ? 'Text highlighted for review' : 'Personal study note'}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
      </div>
      </>
      )}
    </div>
  );
};
