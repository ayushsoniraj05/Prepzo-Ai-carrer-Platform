import React from 'react';
import { NavItem } from './NavItem';
import { Home, FileText, Brain, Briefcase, Settings, Lock, Layout } from 'lucide-react';

interface MobileNavProps {
  active: string;
  onNavigate: (id: string) => void;
  badgeMap?: Record<string, string | number>;
  lockedItems?: string[];
}

const navItems = [
  { label: 'Home', icon: Home, id: 'home' },
  { label: 'Resume', icon: FileText, id: 'resume' },
  { label: 'Assessment', icon: Brain, id: 'assessment' },
  { label: 'Jobs', icon: Briefcase, id: 'jobs' },
  { label: 'Settings', icon: Settings, id: 'settings' },
];

export const MobileNav: React.FC<MobileNavProps> = ({ active, onNavigate, badgeMap, lockedItems = [] }) => (
  <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] flex md:hidden justify-around items-center p-2 rounded-[28px] backdrop-blur-[32px] bg-[#13171d]/80 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 animate-in fade-in slide-in-from-bottom-4 duration-500">
    {navItems.map((item) => {
      const isLocked = lockedItems.includes(item.id);
      return (
        <NavItem
          key={item.id}
          icon={isLocked ? Lock : item.icon}
          label={item.label}
          active={active === item.id}
          onClick={() => !isLocked && onNavigate(item.id)}
          badge={!isLocked ? badgeMap?.[item.id] as string | number : undefined}
          showLabel={false}
          className={isLocked ? 'opacity-30 grayscale' : ''}
        />
      );
    })}
  </div>
);
