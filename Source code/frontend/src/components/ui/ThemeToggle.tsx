import { motion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import { useAppStore } from '@/store/appStore';

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { darkMode, toggleDarkMode } = useAppStore();

  return (
    <motion.button
      type="button"
      onClick={toggleDarkMode}
      whileTap={{ scale: 0.96 }}
      whileHover={{ scale: 1.03 }}
      className={[
        'glass-panel premium-ring flex items-center gap-3 rounded-full px-3 py-2 text-sm font-semibold text-[var(--text)]',
        className,
      ].filter(Boolean).join(' ')}
      aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span className="relative flex h-8 w-16 items-center rounded-full bg-[color:rgba(148,163,184,0.16)] px-1">
        <motion.span
          layout
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          className="absolute h-6 w-6 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] shadow-lg"
          style={{ left: darkMode ? 'calc(100% - 1.75rem)' : '0.25rem' }}
        />
        <Sun className="relative z-10 h-3.5 w-3.5 text-white" />
        <Moon className="relative z-10 ml-auto h-3.5 w-3.5 text-white" />
      </span>
      <span>{darkMode ? 'Dark' : 'Light'}</span>
    </motion.button>
  );
}

export default ThemeToggle;
