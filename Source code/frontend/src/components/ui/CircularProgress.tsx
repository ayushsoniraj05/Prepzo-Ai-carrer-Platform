import { motion } from 'framer-motion';

interface CircularProgressProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  color?: 'purple' | 'blue' | 'green' | 'red';
}

export const CircularProgress = ({
  value,
  size = 140,
  strokeWidth = 10,
  label,
  color = 'purple'
}: CircularProgressProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  const colors = {
    purple: { from: '#818CF8', to: '#C084FC', glow: 'rgba(129, 140, 248, 0.5)' },
    blue: { from: '#38BDF8', to: '#818CF8', glow: 'rgba(56, 189, 248, 0.5)' },
    green: { from: '#34D399', to: '#10B981', glow: 'rgba(52, 211, 153, 0.5)' },
    red: { from: '#F87171', to: '#EF4444', glow: 'rgba(248, 113, 113, 0.5)' },
  };

  return (
    <div className="relative inline-flex items-center justify-center group">
      {/* Outer Glow Ring */}
      <div 
        className="absolute inset-0 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"
        style={{ backgroundColor: colors[color].from }}
      />
      
      <svg width={size} height={size} className="-rotate-90 relative z-10">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <defs>
          <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors[color].from} />
            <stop offset="100%" stopColor={colors[color].to} />
          </linearGradient>
          <filter id={`glow-${color}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#gradient-${color})`}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          filter={`url(#glow-${color})`}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 2, ease: "circOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
        <div className="flex items-baseline">
          <motion.span
            className="text-3xl font-[900] text-white italic tracking-tighter"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
          >
            {value}
          </motion.span>
          <span className="text-sm font-bold text-white/40 ml-0.5">%</span>
        </div>
        {label && (
          <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em] mt-1">{label}</span>
        )}
      </div>
    </div>
  );
};

export const SkillBar = ({
  skill,
  level,
  delay = 0
}: {
  skill: string;
  level: number;
  delay?: number;
}) => {
  return (
    <div className="space-y-3 group">
      <div className="flex justify-between items-end">
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">{skill}</span>
          <div className="h-0.5 w-8 bg-white/10 rounded-full group-hover:w-12 transition-all duration-500" />
        </div>
        <span className="text-[14px] font-black text-white italic tracking-tighter">{level}%</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-white/5 border border-white/5 relative">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 relative z-10"
          initial={{ width: 0 }}
          animate={{ width: `${level}%` }}
          transition={{ duration: 1.5, delay, ease: "circOut" }}
        >
          <div className="absolute inset-0 bg-white/20 animate-pulse" />
        </motion.div>
        {/* Background track decoration */}
        <div className="absolute inset-0 opacity-10 bg-grid-white/[0.1] bg-[size:10px_10px]" />
      </div>
    </div>
  );
};
