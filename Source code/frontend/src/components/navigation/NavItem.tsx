import { motion } from 'framer-motion';
import React from 'react';

interface NavItemProps {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  active?: boolean;
  onClick?: () => void;
  badge?: string | number;
  showLabel?: boolean;
  className?: string;
}

export const NavItem: React.FC<NavItemProps> = (props) => {
  const { icon: Icon, label, active, onClick, badge, showLabel = false, className = '' } = props;
  return (
    <motion.div
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.97 }}
      className={`relative flex flex-col items-center gap-1 cursor-pointer group select-none ${active ? 'text-white' : 'text-white/70'} ${className}`}
      onClick={onClick}
    >
      <div className={`relative p-3 rounded-xl transition-all duration-200 ${active ? 'bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg' : 'bg-white/5 group-hover:bg-white/10'}`}>
        <Icon size={22} />
        {typeof badge !== 'undefined' && (
          <span className="absolute -top-1 -right-1 bg-blue-500 text-xs px-1 rounded-full">
            {String(badge)}
          </span>
        )}
      </div>
      {showLabel && (
        <span className="text-xs opacity-70 group-hover:opacity-100 transition-all duration-200">
          {label}
        </span>
      )}
    </motion.div>
  );
};
