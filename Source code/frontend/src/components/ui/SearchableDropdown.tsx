import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, X, LucideIcon } from 'lucide-react';

interface DropdownOption {
  value: string;
  label: string;
  color?: string;
}

interface SearchableDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  placeholder: string;
  icon: LucideIcon;
  error?: string;
  searchable?: boolean;
}

export const SearchableDropdown = ({ 
  value, 
  onChange, 
  options, 
  placeholder, 
  icon: Icon,
  error,
  searchable = true
}: SearchableDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredOptions = searchable && searchTerm.length > 0
    ? options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    setHighlightedIndex(0);
  }, [searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => Math.min(prev + 1, filteredOptions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && filteredOptions.length > 0) {
      e.preventDefault();
      handleSelect(filteredOptions[highlightedIndex]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  const handleSelect = (option: DropdownOption) => {
    onChange(option.value);
    setSearchTerm('');
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange('');
    setSearchTerm('');
    inputRef.current?.focus();
  };

  const handleInputClick = () => {
    setIsOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (searchable) {
      setSearchTerm(e.target.value);
      setIsOpen(true);
    }
  };

  return (
    <div ref={dropdownRef} className="relative">
      {/* Input field */}
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        <input
          ref={inputRef}
          type="text"
          value={searchable ? (isOpen ? searchTerm : (selectedOption?.label || '')) : (selectedOption?.label || '')}
          onChange={handleInputChange}
          onClick={handleInputClick}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          readOnly={!searchable}
          className={`w-full pl-10 pr-12 py-3.5 rounded-2xl bg-white/[0.06] border ${
            isOpen
              ? 'border-purple-500/60 ring-2 ring-purple-500/20 shadow-[0_0_18px_rgba(139,92,246,0.18)]'
              : error
              ? 'border-red-500/50'
              : 'border-white/[0.12] hover:border-white/20'
          } text-white placeholder-gray-500 focus:outline-none transition-all duration-200 cursor-pointer`}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-full hover:bg-white/10 text-gray-500 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </motion.div>
        </div>
      </div>

      {/* Glassmorphism Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute z-50 w-full mt-2 rounded-2xl"
            style={{ transformOrigin: 'top center' }}
          >
            {/* Glass panel — blur layer must NOT have overflow-hidden or the backdrop-filter is clipped */}
            <div className="relative rounded-2xl hover-unblur" style={{ WebkitBackdropFilter: 'blur(50px)', backdropFilter: 'blur(50px)' }}>
              {/* Tinted glass fill — separate div so overflow-hidden never touches the blur layer */}
              <div className="absolute inset-0 rounded-2xl bg-[rgba(10,8,25,0.95)] border border-white/[0.16] shadow-[0_8px_48px_rgba(0,0,0,0.65)] pointer-events-none" />
              {/* Inner rounded clip for content — overflow-hidden here is safe because this div has no backdrop-filter */}
              <div className="relative rounded-2xl overflow-hidden">
              {/* Top sheen line */}
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent z-10" />

              {/* Search indicator */}
              {searchable && (
                <div className="relative px-4 py-2.5 border-b border-white/[0.08] flex items-center gap-2">
                  <Search className="w-3.5 h-3.5 text-purple-400/80" />
                  <span className="text-xs text-white/40">
                    {filteredOptions.length > 0
                      ? `${filteredOptions.length} options`
                      : 'No options found'}
                  </span>
                </div>
              )}

              {/* Results list */}
              <div className="relative max-h-64 overflow-y-auto">
                {filteredOptions.length > 0 ? (
                  filteredOptions.map((option, index) => {
                    const isSelected = value === option.value;
                    const isHighlighted = highlightedIndex === index;
                    return (
                      <motion.div
                        key={option.value}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.025, duration: 0.15 }}
                        onClick={() => handleSelect(option)}
                        onMouseEnter={() => setHighlightedIndex(index)}
                        className="relative px-3 py-2.5 cursor-pointer group"
                      >
                        {/* Hover/active background — rendered behind content, no transform */}
                        {isHighlighted && (
                          <motion.div
                            layoutId="glass-highlight"
                            className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/[0.18] to-blue-500/[0.12] border border-white/[0.08]"
                            style={{ zIndex: 0 }}
                          />
                        )}

                        {/* Row content — no 3D transform on the row itself */}
                        <div className="relative flex items-center gap-3" style={{ zIndex: 1 }}>
                          {/* Icon tile — 3D isolated so it never bleeds onto text */}
                          <div style={{ perspective: 320 }}>
                            <motion.div
                              className={`w-9 h-9 rounded-xl bg-gradient-to-br ${option.color || 'from-purple-500 to-blue-500'} flex items-center justify-center flex-shrink-0 shadow-lg`}
                              whileHover={{ rotateY: 18, scale: 1.08 }}
                              transition={{ duration: 0.2 }}
                              style={{ willChange: 'transform' }}
                            >
                              <Icon className="w-4 h-4 text-white" />
                            </motion.div>
                          </div>

                          {/* Label — lives in its own flat stacking context, never blurs */}
                          <div className="flex-1 min-w-0" style={{ isolation: 'isolate' }}>
                            <span className={`text-sm font-medium transition-colors duration-150 ${
                              isHighlighted ? 'text-white' : 'text-white/75 group-hover:text-white/90'
                            }`}>
                              {searchable && searchTerm ? (
                                option.label.split(new RegExp(`(${searchTerm})`, 'gi')).map((part, i) =>
                                  part.toLowerCase() === searchTerm.toLowerCase() ? (
                                    <span key={i} className="text-purple-300 font-semibold">{part}</span>
                                  ) : (
                                    <span key={i}>{part}</span>
                                  )
                                )
                              ) : (
                                option.label
                              )}
                            </span>
                          </div>

                          {/* Check / active dot */}
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{
                              scale: isSelected || isHighlighted ? 1 : 0,
                              opacity: isSelected || isHighlighted ? 1 : 0,
                            }}
                            transition={{ duration: 0.15 }}
                            className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                              isSelected ? 'bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.8)]' : 'bg-purple-400'
                            }`}
                          />
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="px-4 py-8 text-center">
                    <p className="text-white/40 text-sm">No options found</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              {filteredOptions.length > 0 && (
                <div className="relative px-4 py-2 border-t border-white/[0.08]">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-white/25">↑↓ navigate · Enter select</span>
                    <span className="text-[11px] text-purple-400/60">{options.length}</span>
                  </div>
                </div>
              )}

              {/* Bottom sheen line */}
              <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
              </div>{/* end overflow-hidden inner clip */}
            </div>{/* end blur layer */}
          </motion.div>
        )}
      </AnimatePresence>

      {error && <p className="text-sm text-red-400 mt-1">{error}</p>}
    </div>
  );
};

// Predefined option sets with colors
export const genderOptions: DropdownOption[] = [
  { value: 'male', label: 'Male', color: 'from-blue-500 to-cyan-500' },
  { value: 'female', label: 'Female', color: 'from-pink-500 to-rose-500' },
  { value: 'other', label: 'Other', color: 'from-purple-500 to-violet-500' },
];

export const degreeOptions: DropdownOption[] = [
  // Undergraduate Engineering
  { value: 'btech', label: 'B.Tech (Bachelor of Technology)', color: 'from-orange-500 to-red-500' },
  { value: 'be', label: 'B.E. (Bachelor of Engineering)', color: 'from-amber-500 to-orange-500' },
  
  // Undergraduate Science & IT
  { value: 'bsc', label: 'B.Sc (Bachelor of Science)', color: 'from-green-500 to-emerald-500' },
  { value: 'bca', label: 'BCA (Bachelor of Computer Applications)', color: 'from-teal-500 to-cyan-500' },
  { value: 'bscit', label: 'B.Sc IT (Information Technology)', color: 'from-cyan-500 to-blue-500' },
  
  // Undergraduate Commerce & Management
  { value: 'bcom', label: 'B.Com (Bachelor of Commerce)', color: 'from-yellow-500 to-amber-500' },
  { value: 'bba', label: 'BBA (Bachelor of Business Administration)', color: 'from-pink-500 to-rose-500' },
  
  // Undergraduate Arts & Humanities
  { value: 'ba', label: 'BA (Bachelor of Arts)', color: 'from-purple-500 to-violet-500' },
  { value: 'bjmc', label: 'BJMC (Bachelor of Journalism & Mass Communication)', color: 'from-indigo-500 to-purple-500' },
  
  // Undergraduate Design & Architecture
  { value: 'bdes', label: 'B.Des (Bachelor of Design)', color: 'from-rose-500 to-pink-500' },
  { value: 'barch', label: 'B.Arch (Bachelor of Architecture)', color: 'from-slate-500 to-gray-500' },
  
  // Undergraduate Law & Medical
  { value: 'llb', label: 'LLB (Bachelor of Laws)', color: 'from-red-500 to-rose-500' },
  { value: 'mbbs', label: 'MBBS (Bachelor of Medicine)', color: 'from-emerald-500 to-green-500' },
  { value: 'bds', label: 'BDS (Bachelor of Dental Surgery)', color: 'from-teal-500 to-emerald-500' },
  { value: 'bpharm', label: 'B.Pharm (Bachelor of Pharmacy)', color: 'from-blue-500 to-cyan-500' },
  
  // Postgraduate Engineering
  { value: 'mtech', label: 'M.Tech (Master of Technology)', color: 'from-blue-500 to-indigo-500' },
  { value: 'me', label: 'M.E. (Master of Engineering)', color: 'from-indigo-500 to-blue-500' },
  
  // Postgraduate Science & IT
  { value: 'msc', label: 'M.Sc (Master of Science)', color: 'from-green-600 to-emerald-600' },
  { value: 'mca', label: 'MCA (Master of Computer Applications)', color: 'from-violet-500 to-purple-500' },
  
  // Postgraduate Management
  { value: 'mba', label: 'MBA (Master of Business Administration)', color: 'from-pink-600 to-rose-600' },
  { value: 'pgdm', label: 'PGDM (Post Graduate Diploma in Management)', color: 'from-amber-600 to-orange-600' },
  
  // Postgraduate Arts
  { value: 'ma', label: 'MA (Master of Arts)', color: 'from-purple-600 to-violet-600' },
  
  // Doctoral
  { value: 'phd', label: 'Ph.D (Doctor of Philosophy)', color: 'from-gray-600 to-slate-600' },
  
  // Diploma
  { value: 'diploma', label: 'Diploma', color: 'from-cyan-600 to-teal-600' },
  { value: 'polytechnic', label: 'Polytechnic Diploma', color: 'from-orange-600 to-amber-600' },
];

// Fields of study mapped by degree category
const engineeringFields: DropdownOption[] = [
  { value: 'cse', label: 'Computer Science & Engineering', color: 'from-purple-500 to-blue-500' },
  { value: 'it', label: 'Information Technology', color: 'from-cyan-500 to-blue-500' },
  { value: 'ece', label: 'Electronics & Communication Engineering', color: 'from-green-500 to-teal-500' },
  { value: 'eee', label: 'Electrical & Electronics Engineering', color: 'from-yellow-500 to-orange-500' },
  { value: 'ee', label: 'Electrical Engineering', color: 'from-amber-500 to-yellow-500' },
  { value: 'mech', label: 'Mechanical Engineering', color: 'from-red-500 to-orange-500' },
  { value: 'civil', label: 'Civil Engineering', color: 'from-amber-500 to-yellow-500' },
  { value: 'chemical', label: 'Chemical Engineering', color: 'from-pink-500 to-rose-500' },
  { value: 'aerospace', label: 'Aerospace Engineering', color: 'from-blue-600 to-indigo-600' },
  { value: 'biotech', label: 'Biotechnology', color: 'from-green-600 to-emerald-600' },
  { value: 'automobile', label: 'Automobile Engineering', color: 'from-orange-600 to-red-600' },
  { value: 'industrial', label: 'Industrial Engineering', color: 'from-slate-500 to-gray-500' },
  { value: 'metallurgy', label: 'Metallurgical Engineering', color: 'from-gray-500 to-zinc-500' },
  { value: 'mining', label: 'Mining Engineering', color: 'from-stone-500 to-neutral-500' },
  { value: 'textile', label: 'Textile Engineering', color: 'from-violet-500 to-purple-500' },
  { value: 'production', label: 'Production Engineering', color: 'from-teal-500 to-cyan-500' },
  { value: 'instrumentation', label: 'Instrumentation Engineering', color: 'from-indigo-500 to-blue-500' },
  { value: 'ai_ml', label: 'Artificial Intelligence & Machine Learning', color: 'from-purple-600 to-pink-600' },
  { value: 'data_science', label: 'Data Science & Engineering', color: 'from-cyan-600 to-blue-600' },
  { value: 'robotics', label: 'Robotics & Automation', color: 'from-rose-500 to-red-500' },
  { value: 'mechatronics', label: 'Mechatronics Engineering', color: 'from-emerald-500 to-teal-500' },
];

const scienceFields: DropdownOption[] = [
  { value: 'physics', label: 'Physics', color: 'from-blue-500 to-indigo-500' },
  { value: 'chemistry', label: 'Chemistry', color: 'from-green-500 to-emerald-500' },
  { value: 'mathematics', label: 'Mathematics', color: 'from-purple-500 to-violet-500' },
  { value: 'biology', label: 'Biology', color: 'from-emerald-500 to-green-500' },
  { value: 'zoology', label: 'Zoology', color: 'from-amber-500 to-yellow-500' },
  { value: 'botany', label: 'Botany', color: 'from-green-600 to-lime-600' },
  { value: 'microbiology', label: 'Microbiology', color: 'from-teal-500 to-cyan-500' },
  { value: 'biochemistry', label: 'Biochemistry', color: 'from-pink-500 to-rose-500' },
  { value: 'biotechnology', label: 'Biotechnology', color: 'from-green-500 to-teal-500' },
  { value: 'statistics', label: 'Statistics', color: 'from-orange-500 to-amber-500' },
  { value: 'environmental', label: 'Environmental Science', color: 'from-green-600 to-emerald-600' },
  { value: 'geology', label: 'Geology', color: 'from-stone-500 to-amber-500' },
  { value: 'forensic', label: 'Forensic Science', color: 'from-red-500 to-rose-500' },
];

const computerFields: DropdownOption[] = [
  { value: 'computer_science', label: 'Computer Science', color: 'from-purple-500 to-blue-500' },
  { value: 'software_dev', label: 'Software Development', color: 'from-cyan-500 to-blue-500' },
  { value: 'web_dev', label: 'Web Development', color: 'from-orange-500 to-red-500' },
  { value: 'mobile_dev', label: 'Mobile App Development', color: 'from-green-500 to-teal-500' },
  { value: 'database', label: 'Database Management', color: 'from-yellow-500 to-amber-500' },
  { value: 'networking', label: 'Computer Networks', color: 'from-blue-500 to-cyan-500' },
  { value: 'cyber_security', label: 'Cyber Security', color: 'from-red-500 to-orange-500' },
  { value: 'cloud', label: 'Cloud Computing', color: 'from-sky-500 to-blue-500' },
  { value: 'ai_ml', label: 'Artificial Intelligence & ML', color: 'from-purple-600 to-pink-600' },
  { value: 'data_analytics', label: 'Data Analytics', color: 'from-indigo-500 to-purple-500' },
];

const commerceFields: DropdownOption[] = [
  { value: 'accounting', label: 'Accounting & Finance', color: 'from-green-500 to-emerald-500' },
  { value: 'taxation', label: 'Taxation', color: 'from-yellow-500 to-amber-500' },
  { value: 'banking', label: 'Banking & Insurance', color: 'from-blue-500 to-cyan-500' },
  { value: 'economics', label: 'Economics', color: 'from-purple-500 to-violet-500' },
  { value: 'commerce_general', label: 'Commerce (General)', color: 'from-amber-500 to-orange-500' },
  { value: 'cost_accounting', label: 'Cost Accounting', color: 'from-teal-500 to-green-500' },
  { value: 'auditing', label: 'Auditing', color: 'from-indigo-500 to-blue-500' },
];

const managementFields: DropdownOption[] = [
  { value: 'marketing', label: 'Marketing Management', color: 'from-pink-500 to-rose-500' },
  { value: 'finance', label: 'Finance', color: 'from-green-500 to-emerald-500' },
  { value: 'hr', label: 'Human Resource Management', color: 'from-purple-500 to-violet-500' },
  { value: 'operations', label: 'Operations Management', color: 'from-blue-500 to-cyan-500' },
  { value: 'it_management', label: 'IT Management', color: 'from-cyan-500 to-blue-500' },
  { value: 'international_business', label: 'International Business', color: 'from-indigo-500 to-purple-500' },
  { value: 'entrepreneurship', label: 'Entrepreneurship', color: 'from-orange-500 to-red-500' },
  { value: 'supply_chain', label: 'Supply Chain Management', color: 'from-teal-500 to-green-500' },
  { value: 'healthcare_mgmt', label: 'Healthcare Management', color: 'from-emerald-500 to-green-500' },
  { value: 'business_analytics', label: 'Business Analytics', color: 'from-violet-500 to-purple-500' },
  { value: 'retail', label: 'Retail Management', color: 'from-amber-500 to-yellow-500' },
];

const artsFields: DropdownOption[] = [
  { value: 'english', label: 'English Literature', color: 'from-blue-500 to-indigo-500' },
  { value: 'hindi', label: 'Hindi Literature', color: 'from-orange-500 to-amber-500' },
  { value: 'history', label: 'History', color: 'from-amber-600 to-yellow-600' },
  { value: 'political_science', label: 'Political Science', color: 'from-red-500 to-rose-500' },
  { value: 'sociology', label: 'Sociology', color: 'from-purple-500 to-violet-500' },
  { value: 'psychology', label: 'Psychology', color: 'from-pink-500 to-rose-500' },
  { value: 'philosophy', label: 'Philosophy', color: 'from-indigo-500 to-purple-500' },
  { value: 'geography', label: 'Geography', color: 'from-green-500 to-teal-500' },
  { value: 'economics', label: 'Economics', color: 'from-yellow-500 to-amber-500' },
  { value: 'journalism', label: 'Journalism & Mass Communication', color: 'from-cyan-500 to-blue-500' },
  { value: 'public_admin', label: 'Public Administration', color: 'from-slate-500 to-gray-500' },
];

const designFields: DropdownOption[] = [
  { value: 'fashion', label: 'Fashion Design', color: 'from-pink-500 to-rose-500' },
  { value: 'interior', label: 'Interior Design', color: 'from-amber-500 to-orange-500' },
  { value: 'graphic', label: 'Graphic Design', color: 'from-purple-500 to-violet-500' },
  { value: 'product', label: 'Product Design', color: 'from-blue-500 to-cyan-500' },
  { value: 'ui_ux', label: 'UI/UX Design', color: 'from-cyan-500 to-teal-500' },
  { value: 'animation', label: 'Animation & VFX', color: 'from-red-500 to-orange-500' },
  { value: 'textile_design', label: 'Textile Design', color: 'from-rose-500 to-pink-500' },
  { value: 'game_design', label: 'Game Design', color: 'from-violet-500 to-purple-500' },
];

const lawFields: DropdownOption[] = [
  { value: 'corporate_law', label: 'Corporate Law', color: 'from-blue-500 to-indigo-500' },
  { value: 'criminal_law', label: 'Criminal Law', color: 'from-red-500 to-rose-500' },
  { value: 'constitutional_law', label: 'Constitutional Law', color: 'from-amber-500 to-orange-500' },
  { value: 'civil_law', label: 'Civil Law', color: 'from-green-500 to-teal-500' },
  { value: 'intellectual_property', label: 'Intellectual Property Law', color: 'from-purple-500 to-violet-500' },
  { value: 'international_law', label: 'International Law', color: 'from-cyan-500 to-blue-500' },
  { value: 'cyber_law', label: 'Cyber Law', color: 'from-pink-500 to-rose-500' },
];

const medicalFields: DropdownOption[] = [
  { value: 'general_medicine', label: 'General Medicine', color: 'from-emerald-500 to-green-500' },
  { value: 'surgery', label: 'Surgery', color: 'from-red-500 to-rose-500' },
  { value: 'pediatrics', label: 'Pediatrics', color: 'from-pink-500 to-rose-500' },
  { value: 'orthopedics', label: 'Orthopedics', color: 'from-blue-500 to-cyan-500' },
  { value: 'cardiology', label: 'Cardiology', color: 'from-red-600 to-rose-600' },
  { value: 'dermatology', label: 'Dermatology', color: 'from-amber-500 to-yellow-500' },
  { value: 'radiology', label: 'Radiology', color: 'from-purple-500 to-violet-500' },
  { value: 'psychiatry', label: 'Psychiatry', color: 'from-indigo-500 to-purple-500' },
];

const pharmacyFields: DropdownOption[] = [
  { value: 'pharmaceutics', label: 'Pharmaceutics', color: 'from-blue-500 to-cyan-500' },
  { value: 'pharmacology', label: 'Pharmacology', color: 'from-green-500 to-emerald-500' },
  { value: 'pharma_chemistry', label: 'Pharmaceutical Chemistry', color: 'from-purple-500 to-violet-500' },
  { value: 'pharmacognosy', label: 'Pharmacognosy', color: 'from-amber-500 to-yellow-500' },
  { value: 'clinical_pharmacy', label: 'Clinical Pharmacy', color: 'from-teal-500 to-cyan-500' },
];

const architectureFields: DropdownOption[] = [
  { value: 'architecture', label: 'Architecture', color: 'from-slate-500 to-gray-500' },
  { value: 'urban_planning', label: 'Urban Planning', color: 'from-green-500 to-teal-500' },
  { value: 'landscape', label: 'Landscape Architecture', color: 'from-emerald-500 to-green-500' },
  { value: 'sustainable', label: 'Sustainable Architecture', color: 'from-lime-500 to-green-500' },
];

// Function to get fields based on degree
export const getFieldsOfStudyByDegree = (degree: string): DropdownOption[] => {
  const engineeringDegrees = ['btech', 'be', 'mtech', 'me', 'diploma', 'polytechnic'];
  const scienceDegrees = ['bsc', 'msc'];
  const computerDegrees = ['bca', 'mca', 'bscit'];
  const commerceDegrees = ['bcom'];
  const managementDegrees = ['bba', 'mba', 'pgdm'];
  const artsDegrees = ['ba', 'ma', 'bjmc'];
  const designDegrees = ['bdes'];
  const lawDegrees = ['llb'];
  const medicalDegrees = ['mbbs', 'bds'];
  const pharmacyDegrees = ['bpharm'];
  const architectureDegrees = ['barch'];
  
  if (engineeringDegrees.includes(degree)) return engineeringFields;
  if (scienceDegrees.includes(degree)) return scienceFields;
  if (computerDegrees.includes(degree)) return computerFields;
  if (commerceDegrees.includes(degree)) return commerceFields;
  if (managementDegrees.includes(degree)) return managementFields;
  if (artsDegrees.includes(degree)) return artsFields;
  if (designDegrees.includes(degree)) return designFields;
  if (lawDegrees.includes(degree)) return lawFields;
  if (medicalDegrees.includes(degree)) return medicalFields;
  if (pharmacyDegrees.includes(degree)) return pharmacyFields;
  if (architectureDegrees.includes(degree)) return architectureFields;
  if (degree === 'phd') return [...engineeringFields, ...scienceFields, ...managementFields, ...artsFields];
  
  // Default: return all engineering fields
  return engineeringFields;
};

// Legacy export for backwards compatibility
export const fieldOfStudyOptions: DropdownOption[] = engineeringFields;

export const yearOfStudyOptions: DropdownOption[] = [
  { value: '1', label: '1st Year', color: 'from-green-500 to-emerald-500' },
  { value: '2', label: '2nd Year', color: 'from-blue-500 to-cyan-500' },
  { value: '3', label: '3rd Year', color: 'from-purple-500 to-violet-500' },
  { value: '4', label: '4th Year', color: 'from-orange-500 to-red-500' },
  { value: '5', label: '5th Year', color: 'from-pink-500 to-rose-500' },
  { value: 'graduated', label: 'Graduated', color: 'from-yellow-500 to-amber-500' },
];

export const targetRoleOptions: DropdownOption[] = [
  // --- Software & IT ---
  { value: 'sde', label: 'Software Development Engineer', color: 'from-purple-500 to-blue-500' },
  { value: 'frontend', label: 'Frontend Developer', color: 'from-cyan-500 to-blue-500' },
  { value: 'backend', label: 'Backend Developer', color: 'from-green-500 to-teal-500' },
  { value: 'fullstack', label: 'Full Stack Developer', color: 'from-violet-500 to-purple-500' },
  { value: 'devops', label: 'DevOps Engineer', color: 'from-amber-500 to-orange-500' },
  { value: 'cloud', label: 'Cloud Engineer', color: 'from-sky-500 to-blue-500' },
  { value: 'security', label: 'Security Engineer', color: 'from-red-500 to-orange-500' },
  { value: 'qa', label: 'QA / Automation Engineer', color: 'from-green-600 to-emerald-600' },

  // --- Data & AI ---
  { value: 'data_science', label: 'Data Scientist', color: 'from-orange-500 to-red-500' },
  { value: 'ml', label: 'ML / AI Engineer', color: 'from-pink-500 to-rose-500' },
  { value: 'data_analyst', label: 'Data Analyst', color: 'from-indigo-500 to-purple-500' },

  // --- Core Electronics & Electrical ---
  { value: 'embedded', label: 'Embedded Systems Engineer', color: 'from-blue-600 to-cyan-600' },
  { value: 'vlsi', label: 'VLSI Design Engineer', color: 'from-indigo-600 to-violet-600' },
  { value: 'hardware', label: 'Hardware Design Engineer', color: 'from-teal-600 to-emerald-600' },
  { value: 'control_systems', label: 'Control Systems Engineer', color: 'from-amber-600 to-orange-600' },
  { value: 'power_electronics', label: 'Power Electronics Engineer', color: 'from-yellow-600 to-amber-600' },
  { value: 'iot_dev', label: 'IoT Solutions Architect', color: 'from-cyan-700 to-blue-700' },

  // --- Civil & Architecture ---
  { value: 'structural', label: 'Structural Engineer', color: 'from-amber-700 to-yellow-700' },
  { value: 'site_engineer', label: 'Site Engineer', color: 'from-orange-700 to-red-700' },
  { value: 'urban_planner', label: 'Urban Planner', color: 'from-emerald-700 to-green-700' },
  { value: 'architect', label: 'Project Architect', color: 'from-slate-600 to-gray-600' },
  { value: 'bim_manager', label: 'BIM Manager', color: 'from-blue-700 to-indigo-700' },

  // --- Mechanical & Automobile ---
  { value: 'mechanical_design', label: 'Mechanical Design Engineer', color: 'from-red-600 to-orange-600' },
  { value: 'automobile', label: 'Automobile Engineer', color: 'from-slate-600 to-gray-600' },
  { value: 'manufacturing', label: 'Manufacturing Process Engineer', color: 'from-zinc-600 to-gray-600' },
  { value: 'robotics_engineer', label: 'Robotics & Automation Engineer', color: 'from-rose-600 to-red-600' },

  // --- Chemical & Biotech ---
  { value: 'process_engineer', label: 'Process Engineer', color: 'from-pink-700 to-rose-700' },
  { value: 'bio_researcher', label: 'Biotech Researcher', color: 'from-green-600 to-emerald-600' },
  { value: 'pharma_analyst', label: 'Pharmaceutical Analyst', color: 'from-blue-500 to-teal-500' },

  // --- Management & Non-Tech ---
  { value: 'product', label: 'Product Manager', color: 'from-teal-500 to-green-500' },
  { value: 'business_analyst', label: 'Business Analyst', color: 'from-yellow-500 to-amber-500' },
  { value: 'marketing', label: 'Digital Marketing Lead', color: 'from-pink-600 to-rose-600' },
  { value: 'ops_manager', label: 'Operations Manager', color: 'from-blue-400 to-cyan-400' },
  { value: 'consultant', label: 'Strategy Consultant', color: 'from-gray-500 to-slate-500' },
  { value: 'hr_specialist', label: 'HR & Talent Acquisition', color: 'from-purple-400 to-violet-400' },
  { value: 'finance_analyst', label: 'Financial Analyst', color: 'from-emerald-500 to-teal-500' },
  { value: 'investment_banker', label: 'Investment Banker', color: 'from-yellow-600 to-amber-600' },

  // --- Arts, Media & Design ---
  { value: 'ui_ux', label: 'UI/UX Designer', color: 'from-rose-500 to-pink-500' },
  { value: 'graphic_designer', label: 'Graphic Designer', color: 'from-purple-600 to-indigo-600' },
  { value: 'content_strategist', label: 'Content Strategist', color: 'from-orange-500 to-amber-500' },
  { value: 'journalist', label: 'Media & Journalism', color: 'from-blue-600 to-cyan-600' },

  // --- Legal & Medical ---
  { value: 'corporate_lawyer', label: 'Corporate Lawyer', color: 'from-blue-800 to-indigo-800' },
  { value: 'legal_consultant', label: 'Legal Consultant', color: 'from-slate-700 to-gray-700' },
  { value: 'medical_practitioner', label: 'Medical Practitioner', color: 'from-emerald-600 to-green-600' },
  { value: 'health_admin', label: 'Healthcare Administrator', color: 'from-cyan-600 to-blue-600' },
];

/**
 * Filter roles based on the student's field of study
 */
export const getTargetRolesByField = (field: string): DropdownOption[] => {
  const f = (field || '').toLowerCase();
  
  // Computer Science / IT / BCA / MCA
  if (f.includes('computer') || f.includes('software') || f.includes('it') || f.includes('info') || f.includes('bca') || f.includes('mca')) {
    return targetRoleOptions.filter(opt => 
      ['sde', 'frontend', 'backend', 'fullstack', 'devops', 'cloud', 'security', 'qa', 'data_science', 'ml', 'product', 'data_analyst', 'ui_ux'].includes(opt.value)
    );
  }

  // Electronics / ECE / EEE / Instrumentation
  if (f.includes('electronics') || f.includes('ece') || f.includes('eee') || f.includes('instrumentation')) {
    return targetRoleOptions.filter(opt => 
      ['embedded', 'vlsi', 'hardware', 'control_systems', 'power_electronics', 'iot_dev', 'sde', 'ml', 'fullstack', 'robotics_engineer'].includes(opt.value)
    );
  }
  
  // Civil / Architecture
  if (f.includes('civil') || f.includes('structural') || f.includes('construction') || f.includes('arch')) {
    return targetRoleOptions.filter(opt => 
      ['structural', 'site_engineer', 'urban_planner', 'architect', 'bim_manager', 'ops_manager', 'business_analyst'].includes(opt.value)
    );
  }

  // Mechanical / Automobile / Production / Mechatronics
  if (f.includes('mechanical') || f.includes('automobile') || f.includes('prod') || f.includes('mech')) {
    return targetRoleOptions.filter(opt => 
      ['mechanical_design', 'automobile', 'manufacturing', 'robotics_engineer', 'iot_dev', 'control_systems', 'ops_manager'].includes(opt.value)
    );
  }

  // Chemical / Biotech / Science / Pharmaceutical
  if (f.includes('chemical') || f.includes('biotech') || f.includes('pharma') || f.includes('science')) {
    return targetRoleOptions.filter(opt => 
      ['process_engineer', 'bio_researcher', 'pharma_analyst', 'data_science', 'data_analyst', 'ops_manager'].includes(opt.value)
    );
  }

  // Management / Business / Commerce / Finance
  if (f.includes('manage') || f.includes('business') || f.includes('mba') || f.includes('bba') || f.includes('commer') || f.includes('finan') || f.includes('account')) {
    return targetRoleOptions.filter(opt => 
      ['product', 'business_analyst', 'marketing', 'ops_manager', 'consultant', 'hr_specialist', 'finance_analyst', 'investment_banker', 'data_analyst'].includes(opt.value)
    );
  }

  // Arts / Design / Media / Humanities
  if (f.includes('art') || f.includes('design') || f.includes('media') || f.includes('human') || f.includes('psych') || f.includes('journal')) {
    return targetRoleOptions.filter(opt => 
      ['ui_ux', 'graphic_designer', 'content_strategist', 'journalism', 'marketing', 'hr_specialist', 'product'].includes(opt.value)
    );
  }

  // Law / Legal
  if (f.includes('law') || f.includes('legal') || f.includes('llb')) {
    return targetRoleOptions.filter(opt => 
      ['corporate_lawyer', 'legal_consultant', 'hr_specialist', 'consultant'].includes(opt.value)
    );
  }

  // Medical / Healthcare
  if (f.includes('medic') || f.includes('healthcare') || f.includes('mbbs') || f.includes('bds')) {
    return targetRoleOptions.filter(opt => 
      ['medical_practitioner', 'health_admin', 'consultant', 'ops_manager'].includes(opt.value)
    );
  }

  // Default: Return all
  return targetRoleOptions;
};

export const placementTimelineOptions: DropdownOption[] = [
  { value: '1', label: 'Within 1 month', color: 'from-red-500 to-rose-500' },
  { value: '3', label: 'Within 3 months', color: 'from-orange-500 to-amber-500' },
  { value: '6', label: 'Within 6 months', color: 'from-yellow-500 to-orange-500' },
  { value: '9', label: 'Within 9 months', color: 'from-green-500 to-teal-500' },
  { value: '12', label: 'Within 1 year', color: 'from-blue-500 to-cyan-500' },
  { value: '18', label: 'Within 1.5 years', color: 'from-purple-500 to-violet-500' },
  { value: '24', label: 'Within 2 years', color: 'from-indigo-500 to-purple-500' },
  { value: 'flexible', label: 'Flexible / No rush', color: 'from-gray-500 to-slate-500' },
];

export const expectedCtcOptions: DropdownOption[] = [
  { value: '3-5', label: '3-5 LPA', color: 'from-green-500 to-emerald-500' },
  { value: '5-8', label: '5-8 LPA', color: 'from-teal-500 to-cyan-500' },
  { value: '8-12', label: '8-12 LPA', color: 'from-blue-500 to-indigo-500' },
  { value: '12-15', label: '12-15 LPA', color: 'from-purple-500 to-violet-500' },
  { value: '15-20', label: '15-20 LPA', color: 'from-pink-500 to-rose-500' },
  { value: '20-25', label: '20-25 LPA', color: 'from-orange-500 to-red-500' },
  { value: '25-35', label: '25-35 LPA', color: 'from-amber-500 to-yellow-500' },
  { value: '35-50', label: '35-50 LPA', color: 'from-red-500 to-rose-500' },
  { value: '50+', label: '50+ LPA', color: 'from-yellow-400 to-amber-400' },
];
