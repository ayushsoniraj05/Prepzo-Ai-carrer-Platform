import { motion } from 'framer-motion';
import { DataGridHero } from '../ui/DataGridHero';

interface PrepzoHeroProps {
  onNavigate: (page: string) => void;
}

export const PrepzoHero = ({ onNavigate }: PrepzoHeroProps) => {
  return (
    <DataGridHero
      rows={20}
      cols={40}
      spacing={4}
      duration={6}
      color="hsl(var(--green))"
      animationType="pulse"
      pulseEffect={true}
      mouseGlow={true}
      opacityMin={0.05}
      opacityMax={0.5}
      background="#070b0a"
    >
      <div className="relative z-20 max-w-[1400px] mx-auto px-6 md:px-12 pt-40 md:pt-64 pb-64 flex flex-col items-start justify-start min-h-screen">
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: 'circOut' }}
          className="flex flex-col gap-0"
        >
          <h1 className="font-rubik font-[900] text-white uppercase leading-[0.98] tracking-[-2px] md:tracking-[-4px] select-none">
            <span className="block text-4xl sm:text-6xl md:text-8xl lg:text-[100px]">NEW ERA</span>
            <span className="block text-4xl sm:text-6xl md:text-8xl lg:text-[100px]">OF PLACEMENT</span>
            <span className="block text-4xl sm:text-6xl md:text-8xl lg:text-[100px]">STARTS NOW</span>
          </h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 text-white/70 font-rubik font-medium text-lg md:text-xl uppercase tracking-widest max-w-2xl"
          >
            The educational signal interface for the modern engineer.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-12"
          >
            <button 
              onClick={() => onNavigate('signup')}
              className="relative w-[184px] h-[65px] group active:scale-95 transition-transform"
            >
              <svg 
                className="absolute inset-0 w-full h-full drop-shadow-2xl transition-transform group-hover:scale-105" 
                viewBox="0 0 184 65" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M0 0H184L174 65H10L0 0Z" 
                  fill="white" 
                />
              </svg>
              <span className="relative z-10 flex items-center justify-center h-full text-[#161a20] font-rubik font-[800] text-[20px] uppercase tracking-wide">
                GET STARTED
              </span>
            </button>
          </motion.div>
        </motion.div>

      </div>
    </DataGridHero>
  );
};
