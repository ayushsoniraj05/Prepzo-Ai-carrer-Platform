import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PrepzoNavbarProps {
  onNavigate: (page: string) => void;
}

export const PrepzoNavbar = ({ onNavigate }: PrepzoNavbarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = [
    { label: 'MENTOR', href: '#mentor' },
    { label: 'ASSESSMENT', href: '#assessment' },
    { label: 'RESUME', href: '#resume' },
    { label: 'JOBS', href: '#jobs' },
  ];

  return (
    <>
      <header 
        className={`fixed top-0 left-0 w-full z-50 flex items-center justify-between px-6 py-6 md:px-12 md:py-8 transition-all duration-300 ${
          scrolled ? 'backdrop-blur-md bg-[#161a20]/80 py-4 border-b border-white/5 shadow-2xl' : 'bg-transparent'
        }`}
      >
        {/* Logo */}
        <div 
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-4 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center transition-transform group-hover:scale-110 shadow-lg">
              <div className="w-5 h-5 bg-[#161a20] rotate-45" />
          </div>
          <span className="text-white font-rubik font-[900] text-[24px] tracking-tight uppercase">Prepzo</span>
        </div>

        {/* Desktop Menu */}
        <nav className="hidden lg:flex items-center gap-14">
          {menuItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-white font-rubik font-[700] text-[13px] tracking-widest hover:text-white transition-all uppercase opacity-60 hover:opacity-100"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-10">
          <button 
            onClick={() => onNavigate('login')}
            className="hidden sm:block text-white font-rubik font-[700] text-[13px] tracking-widest hover:text-white transition-all uppercase opacity-80 hover:opacity-100"
          >
            LOG IN
          </button>
          <button
            className="lg:hidden text-white hover:text-code-green transition-all"
            onClick={() => setIsOpen(true)}
          >
            <Menu size={28} />
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[100] bg-code-dark flex flex-col p-8"
          >
            <div className="flex justify-between items-center mb-24">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-lg">
                        <div className="w-5 h-5 bg-[#161a20] rotate-45" />
                    </div>
                    <span className="text-white font-rubik font-[900] text-[28px] tracking-tight uppercase">Prepzo</span>
                </div>
                <button
                    className="text-white transition-all"
                    onClick={() => setIsOpen(false)}
                >
                    <X size={36} />
                </button>
            </div>

            <nav className="flex flex-col gap-12">
              {menuItems.map((item) => (
                <motion.a
                  key={item.label}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  href={item.href}
                  className="text-white font-rubik font-[900] text-[52px] tracking-tighter hover:text-white transition-all uppercase leading-none"
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </motion.a>
              ))}
            </nav>

            <div className="mt-auto flex flex-col gap-5">
                 <div className="h-[1px] w-full bg-white/10 mb-10" />
                 <button 
                  onClick={() => { setIsOpen(false); onNavigate('signup'); }}
                  className="w-full py-6 text-white font-rubik font-[800] text-[15px] tracking-widest border border-white/20 rounded-full uppercase transition-all"
                 >
                    JOIN THE NEST
                </button>
                 <button 
                  onClick={() => { setIsOpen(false); onNavigate('signup'); }}
                  className="w-full py-6 bg-white text-[#161a20] font-rubik font-[800] text-[15px] tracking-widest rounded-full uppercase hover:scale-[1.02] transition-all"
                 >
                    GET STARTED
                </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
