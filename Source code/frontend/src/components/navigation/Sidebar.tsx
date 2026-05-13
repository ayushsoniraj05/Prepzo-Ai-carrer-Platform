import React from 'react';
import { motion } from 'framer-motion';
// import { NavItem } from './NavItem';
import { Home, FileText, Brain, Briefcase, Settings, Lock, Layout } from 'lucide-react';

interface SidebarProps {
  active: string;
  onNavigate: (id: string) => void;
  badgeMap?: Record<string, string | number>;
  lockedItems?: string[];
}

const Sidebar: React.FC<SidebarProps> = ({ active, onNavigate, badgeMap, lockedItems = [] }) => (
  <div className="hidden md:flex w-auto h-[72px] items-center justify-center bg-[#13171d]/90 backdrop-blur-3xl border border-white/5 rounded-full shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-4 transition-all duration-500 ease-out">
    {/* Subtle edge highlight */}
    <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent rounded-full" />
    
    <div className="relative flex flex-row items-center gap-1 z-10">
      {[
        { id: 'home', icon: Home, label: 'Home' },
        { id: 'resume', icon: FileText, label: 'Resume' },
        { id: 'assessment', icon: Brain, label: 'Skill' },
        { id: 'opportunities', icon: Briefcase, label: 'Jobs' },
        { id: 'settings', icon: Settings, label: 'Settings' },
      ].map((item) => {
        const isActive = active === item.id || (item.id === 'opportunities' && active === 'jobs');
        const isLocked = lockedItems.includes(item.id) || (item.id === 'opportunities' && lockedItems.includes('jobs'));
        
        return (
          <div 
            key={item.id} 
            className={`flex flex-row items-center relative cursor-pointer group py-2 px-6 rounded-full transition-all duration-500 ease-out 
              ${isActive ? 'bg-white/10' : 'hover:bg-white/5'} 
              ${isLocked ? 'opacity-40 cursor-not-allowed grayscale' : ''}`}
            onClick={() => !isLocked && onNavigate(item.id === 'opportunities' ? 'jobs' : item.id)}
          >
            <div className="relative">
              <item.icon 
                size={20} 
                className={isActive ? 'text-white' : 'text-white/20 group-hover:text-white/60 transition-all duration-300'} 
              />
              {isLocked && (
                <div className="absolute -top-1 -right-1 bg-[#13171d] rounded-full p-0.5 border border-white/5">
                  <Lock size={8} className="text-white/40" />
                </div>
              )}
            </div>
            
            <div className={`overflow-hidden transition-all duration-500 ease-out ${isActive ? 'max-w-[80px] ml-3' : 'max-w-0'}`}>
              <span className={`text-[9px]  font-[900] uppercase tracking-[0.2em] whitespace-nowrap ${isActive ? 'text-white' : 'text-white/40'}`}>
                {item.label}
              </span>
            </div>

            {badgeMap?.[item.id] && !isLocked && (
              <span className="absolute -top-1 -right-1 bg-white text-[#0a0c10] text-[8px] font-black px-1.5 py-0.5 rounded-full min-w-[16px] text-center shadow-lg">
                {badgeMap[item.id]}
              </span>
            )}
            
            {isActive && !isLocked && (
              <motion.div 
                layoutId="sidebar-active-dot"
                className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full"
              />
            )}
          </div>
        );
      })}
    </div>
  </div>
);

export default Sidebar;
