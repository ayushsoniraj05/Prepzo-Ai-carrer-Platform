import { motion } from 'framer-motion';
import { Home, Compass, AlertTriangle } from 'lucide-react';

interface NotFoundPageProps {
  onNavigate: (page: string) => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onNavigate }) => {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#0a0c10]">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-indigo-500/5 blur-[150px]" />
        <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] rounded-full bg-cyan-500/5 blur-[120px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-6 p-6 text-center">
        {/* 404 Number */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <h1 className="text-[10rem] md:text-[14rem] font-[900] leading-none tracking-tighter italic text-transparent bg-clip-text bg-gradient-to-b from-white/80 to-white/5 select-none" style={{ maskImage: 'linear-gradient(to bottom, black 20%, transparent 90%)', WebkitMaskImage: 'linear-gradient(to bottom, black 20%, transparent 90%)' }}>
            404
          </h1>
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="-mt-16 flex flex-col items-center gap-3"
        >
          <div className="flex items-center gap-2 text-yellow-400/60">
            <AlertTriangle size={16} />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Page Not Found</span>
          </div>
          <p className="text-white/50 text-sm italic max-w-md leading-relaxed">
            The page you're looking for might have been moved, deleted, or doesn't exist in this dimension.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="flex gap-3 mt-4"
        >
          <button
            onClick={() => onNavigate('dashboard')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white font-[800] text-[11px] uppercase tracking-widest rounded-xl hover:scale-105 transition-transform italic shadow-[0_0_20px_rgba(59,130,246,0.3)] cursor-pointer border-none"
          >
            <Home size={14} />
            Go Home
          </button>
          <button
            onClick={() => onNavigate('jobs')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 text-white border border-white/10 font-[800] text-[11px] uppercase tracking-widest rounded-xl hover:bg-white/10 hover:scale-105 transition-all italic cursor-pointer"
          >
            <Compass size={14} />
            Explore
          </button>
        </motion.div>
      </div>
    </div>
  );
};
