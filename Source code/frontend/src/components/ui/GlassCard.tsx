import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  liquid?: boolean;
  delay?: number;
  onClick?: () => void;
}

export const GlassCard = ({ children, className, hover = true, liquid = false, delay = 0, onClick }: GlassCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={hover ? { scale: 1.01, y: -6 } : {}}
      onClick={onClick}
      className={cn(
        'glass-panel premium-ring p-6 text-[var(--text)]',
        liquid && 'liquid-glass',
        hover && 'glass-panel--interactive cursor-pointer',
        'transition-all duration-300',
        className
      )}
    >
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
};

export const GlassButton = ({ 
  children, 
  onClick, 
  variant = 'primary',
  size = 'md',
  className,
  disabled = false,
  type = 'button'
}: { 
  children: React.ReactNode; 
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit';
}) => {
  const variants = {
    primary: 'glass-button--primary',
    secondary: 'glass-button--secondary',
    ghost: 'glass-button--ghost',
  };

  const sizes = {
    sm: 'glass-button--sm',
    md: 'glass-button--md',
    lg: 'glass-button--lg',
  };

  return (
    <motion.button
      type={type}
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'glass-button relative transition-all duration-300',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </motion.button>
  );
};

export const GlassInput = ({
  label,
  type = 'text',
  placeholder,
  error,
  ...props
}: {
  label?: string;
  type?: string;
  placeholder?: string;
  error?: string;
  [key: string]: unknown;
}) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-[var(--text-soft)]">{label}</label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        className={cn(
          'glass-input transition-all duration-300',
          error && 'border-red-500/50 focus:border-red-500/50'
        )}
        {...props}
      />
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
};
