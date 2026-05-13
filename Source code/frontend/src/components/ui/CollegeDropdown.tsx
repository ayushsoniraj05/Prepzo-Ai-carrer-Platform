import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Search, ChevronDown, X, MapPin } from 'lucide-react';

// Comprehensive list of Indian colleges
const colleges = [
  // IITs
  "Indian Institute of Technology (IIT) Bombay",
  "Indian Institute of Technology (IIT) Delhi",
  "Indian Institute of Technology (IIT) Madras",
  "Indian Institute of Technology (IIT) Kanpur",
  "Indian Institute of Technology (IIT) Kharagpur",
  "Indian Institute of Technology (IIT) Roorkee",
  "Indian Institute of Technology (IIT) Guwahati",
  "Indian Institute of Technology (IIT) Hyderabad",
  "Indian Institute of Technology (IIT) Indore",
  "Indian Institute of Technology (IIT) BHU Varanasi",
  "Indian Institute of Technology (IIT) Gandhinagar",
  "Indian Institute of Technology (IIT) Patna",
  "Indian Institute of Technology (IIT) Ropar",
  "Indian Institute of Technology (IIT) Bhubaneswar",
  "Indian Institute of Technology (IIT) Jodhpur",
  "Indian Institute of Technology (IIT) Mandi",
  "Indian Institute of Technology (IIT) Tirupati",
  "Indian Institute of Technology (IIT) Palakkad",
  "Indian Institute of Technology (IIT) Dharwad",
  "Indian Institute of Technology (IIT) Jammu",
  "Indian Institute of Technology (IIT) Goa",
  "Indian Institute of Technology (IIT) Bhilai",
  
  // NITs
  "National Institute of Technology (NIT) Trichy",
  "National Institute of Technology (NIT) Surathkal",
  "National Institute of Technology (NIT) Warangal",
  "National Institute of Technology (NIT) Calicut",
  "National Institute of Technology (NIT) Rourkela",
  "National Institute of Technology (NIT) Allahabad",
  "National Institute of Technology (NIT) Durgapur",
  "National Institute of Technology (NIT) Kurukshetra",
  "National Institute of Technology (NIT) Jaipur",
  "National Institute of Technology (NIT) Nagpur",
  "National Institute of Technology (NIT) Silchar",
  "National Institute of Technology (NIT) Srinagar",
  "National Institute of Technology (NIT) Hamirpur",
  "National Institute of Technology (NIT) Patna",
  "National Institute of Technology (NIT) Raipur",
  "National Institute of Technology (NIT) Agartala",
  "National Institute of Technology (NIT) Goa",
  "National Institute of Technology (NIT) Delhi",
  "National Institute of Technology (NIT) Puducherry",
  "National Institute of Technology (NIT) Manipur",
  "National Institute of Technology (NIT) Meghalaya",
  "National Institute of Technology (NIT) Mizoram",
  "National Institute of Technology (NIT) Sikkim",
  "National Institute of Technology (NIT) Arunachal Pradesh",
  "National Institute of Technology (NIT) Uttarakhand",
  "National Institute of Technology (NIT) Andhra Pradesh",
  
  // IIITs
  "International Institute of Information Technology (IIIT) Hyderabad",
  "International Institute of Information Technology (IIIT) Delhi",
  "International Institute of Information Technology (IIIT) Bangalore",
  "International Institute of Information Technology (IIIT) Allahabad",
  "International Institute of Information Technology (IIIT) Guwahati",
  "International Institute of Information Technology (IIIT) Kota",
  "International Institute of Information Technology (IIIT) Lucknow",
  "International Institute of Information Technology (IIIT) Una",
  "International Institute of Information Technology (IIIT) Sonepat",
  "International Institute of Information Technology (IIIT) Kalyani",
  "International Institute of Information Technology (IIIT) Vadodara",
  "International Institute of Information Technology (IIIT) Kancheepuram",
  "International Institute of Information Technology (IIIT) Sri City",
  "International Institute of Information Technology (IIIT) Dharwad",
  "International Institute of Information Technology (IIIT) Kottayam",
  "International Institute of Information Technology (IIIT) Manipur",
  "International Institute of Information Technology (IIIT) Nagpur",
  "International Institute of Information Technology (IIIT) Pune",
  "International Institute of Information Technology (IIIT) Ranchi",
  "International Institute of Information Technology (IIIT) Surat",
  "International Institute of Information Technology (IIIT) Tiruchirappalli",
  "International Institute of Information Technology (IIIT) Bhopal",
  "International Institute of Information Technology (IIIT) Bhagalpur",
  "International Institute of Information Technology (IIIT) Agartala",
  "International Institute of Information Technology (IIIT) Raichur",
  
  // BITS
  "Birla Institute of Technology and Science (BITS) Pilani",
  "Birla Institute of Technology and Science (BITS) Goa",
  "Birla Institute of Technology and Science (BITS) Hyderabad",
  "Birla Institute of Technology and Science (BITS) Dubai",
  
  // Top Private Universities
  "Vellore Institute of Technology (VIT) Vellore",
  "Vellore Institute of Technology (VIT) Chennai",
  "Vellore Institute of Technology (VIT) Bhopal",
  "Vellore Institute of Technology (VIT) Andhra Pradesh",
  "SRM Institute of Science and Technology Chennai",
  "SRM University Andhra Pradesh",
  "SRM University Sonepat",
  "Manipal Institute of Technology",
  "Manipal Academy of Higher Education",
  "Thapar Institute of Engineering and Technology",
  "Amity University Noida",
  "Amity University Lucknow",
  "Amity University Jaipur",
  "Amity University Mumbai",
  "Amity University Kolkata",
  "Lovely Professional University (LPU)",
  "Chandigarh University",
  "Chitkara University Punjab",
  "Chitkara University Himachal Pradesh",
  "Shiv Nadar University",
  "Ashoka University",
  "Bennett University",
  "OP Jindal Global University",
  "Kalinga Institute of Industrial Technology (KIIT)",
  "Symbiosis International University",
  "Christ University Bangalore",
  "PES University Bangalore",
  "RV College of Engineering Bangalore",
  "BMS College of Engineering Bangalore",
  "MS Ramaiah Institute of Technology",
  "Dayananda Sagar College of Engineering",
  "New Horizon College of Engineering",
  "Rashtreeya Vidyalaya College of Engineering",
  "JSS Science and Technology University",
  "KLE Technological University",
  "Visvesvaraya Technological University",
  
  // State Universities & Colleges
  "Delhi Technological University (DTU)",
  "Netaji Subhas University of Technology (NSUT) Delhi",
  "Indraprastha Institute of Information Technology Delhi",
  "Jamia Millia Islamia",
  "University of Delhi",
  "Jawaharlal Nehru University (JNU)",
  "Anna University Chennai",
  "College of Engineering Guindy (CEG)",
  "PSG College of Technology Coimbatore",
  "Coimbatore Institute of Technology",
  "Kongu Engineering College",
  "Sri Sivasubramaniya Nadar College of Engineering",
  "Kumaraguru College of Technology",
  "Government College of Technology Coimbatore",
  "Thiagarajar College of Engineering",
  "Mepco Schlenk Engineering College",
  "Velammal Engineering College",
  "Sathyabama Institute of Science and Technology",
  "Saveetha Engineering College",
  "St. Joseph's College of Engineering",
  "Rajalakshmi Engineering College",
  "Sri Krishna College of Engineering and Technology",
  "Bannari Amman Institute of Technology",
  "KCG College of Technology",
  
  // Maharashtra Colleges
  "College of Engineering Pune (COEP)",
  "Vishwakarma Institute of Technology Pune",
  "MIT World Peace University Pune",
  "Symbiosis Institute of Technology Pune",
  "Pune Institute of Computer Technology",
  "VJTI Mumbai",
  "Institute of Chemical Technology (ICT) Mumbai",
  "Sardar Patel Institute of Technology Mumbai",
  "DJ Sanghvi College of Engineering Mumbai",
  "KJ Somaiya College of Engineering Mumbai",
  "Thadomal Shahani Engineering College Mumbai",
  "Fr. Conceicao Rodrigues College of Engineering Mumbai",
  "Ramrao Adik Institute of Technology",
  "Walchand College of Engineering Sangli",
  "Government College of Engineering Aurangabad",
  "Shri Guru Gobind Singhji Institute of Engineering and Technology",
  
  // Gujarat Colleges
  "Sardar Vallabhbhai National Institute of Technology (SVNIT) Surat",
  "Dhirubhai Ambani Institute of Information and Communication Technology",
  "Pandit Deendayal Energy University",
  "Gujarat Technological University",
  "LD College of Engineering",
  "Nirma University",
  "CEPT University",
  
  // Karnataka Colleges
  "National Institute of Engineering Mysore",
  "Siddaganga Institute of Technology",
  "BNM Institute of Technology",
  "Sri Jayachamarajendra College of Engineering",
  "The National Institute of Engineering",
  "Global Academy of Technology",
  "CMR Institute of Technology",
  "Nitte Meenakshi Institute of Technology",
  "Reva University",
  "Alliance University",
  
  // Andhra Pradesh & Telangana
  "JNTU Hyderabad",
  "JNTU Kakinada",
  "Osmania University",
  "Andhra University",
  "CBIT Hyderabad",
  "CVR College of Engineering",
  "VNR Vignana Jyothi Institute of Engineering and Technology",
  "Gokaraju Rangaraju Institute of Engineering and Technology",
  "MLR Institute of Technology",
  "Sreenidhi Institute of Science and Technology",
  "Vasavi College of Engineering",
  "Maturi Venkata Subba Rao Engineering College",
  "Malla Reddy Engineering College",
  "Koneru Lakshmaiah Education Foundation (KL University)",
  "Vignan's Foundation for Science, Technology and Research",
  "SRM University Andhra Pradesh",
  "Gitam University",
  
  // Kerala Colleges
  "College of Engineering Trivandrum (CET)",
  "Government Engineering College Thrissur",
  "TKM College of Engineering",
  "NSS College of Engineering",
  "Model Engineering College",
  "Mar Athanasius College of Engineering",
  "Rajagiri School of Engineering and Technology",
  "Amrita Vishwa Vidyapeetham",
  "Saintgits College of Engineering",
  
  // West Bengal
  "Jadavpur University",
  "Indian Statistical Institute Kolkata",
  "Bengal Engineering and Science University",
  "Heritage Institute of Technology",
  "Institute of Engineering and Management",
  "Techno India University",
  "Maulana Abul Kalam Azad University of Technology",
  
  // Rajasthan
  "Malaviya National Institute of Technology Jaipur",
  "Birla Institute of Technology and Science Pilani",
  "LNMIIT Jaipur",
  "Manipal University Jaipur",
  "JECRC University",
  "Poornima University",
  "Swami Keshvanand Institute of Technology",
  
  // Madhya Pradesh
  "Indian Institute of Information Technology Jabalpur",
  "Maulana Azad National Institute of Technology Bhopal",
  "Indian Institute of Science Education and Research (IISER) Bhopal",
  "LNCT University Bhopal",
  "Medicaps University",
  "Shri Govindram Seksaria Institute of Technology and Science",
  "Jabalpur Engineering College",
  
  // Uttar Pradesh
  "Indian Institute of Technology Kanpur",
  "Indian Institute of Technology BHU",
  "Motilal Nehru National Institute of Technology Allahabad",
  "Harcourt Butler Technical University",
  "KIET Group of Institutions",
  "Galgotias University",
  "ABES Engineering College",
  "AKTU (Dr. A.P.J. Abdul Kalam Technical University)",
  "Jaypee Institute of Information Technology",
  "Jaypee University of Engineering and Technology",
  
  // Uttarakhand
  "Indian Institute of Technology Roorkee",
  "Graphic Era University",
  "DIT University",
  "University of Petroleum and Energy Studies (UPES)",
  
  // Punjab & Haryana
  "PEC University of Technology Chandigarh",
  "Punjab Engineering College",
  "Guru Nanak Dev University",
  "Thapar Institute of Engineering and Technology",
  "Chandigarh College of Engineering and Technology",
  "National Institute of Technology Kurukshetra",
  
  // North East
  "Indian Institute of Technology Guwahati",
  "National Institute of Technology Silchar",
  "Assam Engineering College",
  "Jorhat Engineering College",
  "Tezpur University",
  "North Eastern Regional Institute of Science and Technology",
  
  // Bihar & Jharkhand
  "National Institute of Technology Patna",
  "Indian Institute of Technology Patna",
  "Birla Institute of Technology Mesra",
  "Indian Institute of Technology (ISM) Dhanbad",
  "National Institute of Technology Jamshedpur",
  "Central University of Jharkhand",
  
  // Odisha
  "National Institute of Technology Rourkela",
  "Kalinga Institute of Industrial Technology",
  "Veer Surendra Sai University of Technology",
  "Silicon Institute of Technology",
  "College of Engineering and Technology Bhubaneswar",
  "International Institute of Information Technology Bhubaneswar",
  
  // Tamil Nadu
  "Indian Institute of Technology Madras",
  "National Institute of Technology Trichy",
  "College of Engineering Guindy Anna University",
  "Government College of Technology Coimbatore",
  "Madras Institute of Technology",
  "SSN College of Engineering",
  "Sastra University",
  "Amrita Vishwa Vidyapeetham Coimbatore",
  "Sri Krishna College of Technology",
];

interface CollegeDropdownProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export const CollegeDropdown = ({ value, onChange, error }: CollegeDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredColleges, setFilteredColleges] = useState<string[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchTerm.length > 0) {
      const filtered = colleges.filter(college =>
        college.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 10); // Limit to 10 results for performance
      setFilteredColleges(filtered);
      setHighlightedIndex(0);
    } else {
      setFilteredColleges([]);
    }
  }, [searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => Math.min(prev + 1, filteredColleges.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && filteredColleges.length > 0) {
      e.preventDefault();
      handleSelect(filteredColleges[highlightedIndex]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleSelect = (college: string) => {
    onChange(college);
    setSearchTerm('');
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setIsOpen(true);
    if (!e.target.value) {
      onChange('');
    }
  };

  const handleClear = () => {
    onChange('');
    setSearchTerm('');
    inputRef.current?.focus();
  };

  // Extract college type for badge
  const getCollegeType = (college: string): { type: string; color: string } => {
    if (college.includes('IIT')) return { type: 'IIT', color: 'from-orange-500 to-red-500' };
    if (college.includes('NIT')) return { type: 'NIT', color: 'from-blue-500 to-cyan-500' };
    if (college.includes('IIIT')) return { type: 'IIIT', color: 'from-green-500 to-emerald-500' };
    if (college.includes('BITS')) return { type: 'BITS', color: 'from-purple-500 to-pink-500' };
    if (college.includes('VIT')) return { type: 'VIT', color: 'from-yellow-500 to-orange-500' };
    if (college.includes('SRM')) return { type: 'SRM', color: 'from-teal-500 to-green-500' };
    return { type: 'College', color: 'from-gray-500 to-gray-600' };
  };

  return (
    <div ref={dropdownRef} className="relative">
      {/* Input field */}
      <div className="relative">
        <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        <input
          ref={inputRef}
          type="text"
          value={value || searchTerm}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search your college..."
          className={`w-full pl-10 pr-12 py-3 rounded-xl bg-white/5 border ${
            error ? 'border-red-500/50' : 'border-white/10'
          } text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all`}
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

      {/* 3D Dropdown */}
      <AnimatePresence>
        {isOpen && (searchTerm.length > 0 || filteredColleges.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -10, rotateX: -15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, rotateX: -15, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            style={{ perspective: 1000, transformOrigin: "top center" }}
            className="absolute z-50 w-full mt-2 rounded-xl overflow-hidden"
          >
            {/* Glass effect container */}
            <div className="relative rounded-xl shadow-2xl shadow-purple-500/10 overflow-hidden hover-unblur" style={{ backdropFilter: 'blur(60px)', WebkitBackdropFilter: 'blur(60px)', background: 'rgba(10, 15, 30, 0.98)' }}>
              {/* Animated gradient border */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-purple-500/20 opacity-50" />
              
              {/* Search indicator */}
              <div className="relative px-4 py-3 border-b border-white/5 flex items-center gap-2">
                <Search className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-gray-400">
                  {filteredColleges.length > 0 
                    ? `${filteredColleges.length} colleges found`
                    : 'Type to search colleges...'}
                </span>
              </div>

              {/* Results list */}
              <div className="relative max-h-64 overflow-y-auto">
                {filteredColleges.length > 0 ? (
                  filteredColleges.map((college, index) => {
                    const { type, color } = getCollegeType(college);
                    return (
                      <motion.div
                        key={college}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        onClick={() => handleSelect(college)}
                        onMouseEnter={() => setHighlightedIndex(index)}
                        className={`relative px-4 py-3 cursor-pointer transition-all duration-200 ${
                          highlightedIndex === index
                            ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20'
                            : 'hover:bg-white/5'
                        }`}
                      >
                        {/* 3D card effect */}
                        <motion.div
                          whileHover={{ scale: 1.02, x: 5 }}
                          className="flex items-center gap-3"
                        >
                          {/* College icon with 3D effect */}
                          <motion.div
                            className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0 shadow-lg`}
                            whileHover={{ rotateY: 15, scale: 1.1 }}
                            style={{ transformStyle: 'preserve-3d' }}
                          >
                            <GraduationCap className="w-5 h-5 text-white" />
                          </motion.div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-white truncate">
                                {/* Highlight matching text */}
                                {college.split(new RegExp(`(${searchTerm})`, 'gi')).map((part, i) => (
                                  part.toLowerCase() === searchTerm.toLowerCase() ? (
                                    <span key={i} className="text-purple-400 font-semibold">{part}</span>
                                  ) : (
                                    <span key={i}>{part}</span>
                                  )
                                ))}
                              </span>
                              {/* Type badge with 3D effect */}
                              <motion.span
                                whileHover={{ scale: 1.1 }}
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r ${color} text-white shadow-sm`}
                              >
                                {type}
                              </motion.span>
                            </div>
                            {/* Location hint */}
                            <div className="flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-gray-500" />
                              <span className="text-xs text-gray-500">India</span>
                            </div>
                          </div>

                          {/* Selection indicator */}
                          {highlightedIndex === index && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-2 h-2 rounded-full bg-purple-400"
                            />
                          )}
                        </motion.div>

                        {/* Glowing effect on hover */}
                        {highlightedIndex === index && (
                          <motion.div
                            layoutId="highlight"
                            className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 -z-10"
                          />
                        )}
                      </motion.div>
                    );
                  })
                ) : searchTerm.length > 0 ? (
                  <div className="px-4 py-8 text-center">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-gray-500/20 to-gray-600/20 flex items-center justify-center"
                    >
                      <Search className="w-6 h-6 text-gray-500" />
                    </motion.div>
                    <p className="text-gray-400 text-sm">No colleges found for "{searchTerm}"</p>
                    <p className="text-gray-500 text-xs mt-1">Try a different search term</p>
                  </div>
                ) : null}
              </div>

              {/* Footer with floating particles effect */}
              {filteredColleges.length > 0 && (
                <div className="relative px-4 py-2 border-t border-white/5 bg-gradient-to-r from-purple-500/5 to-blue-500/5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      Use ↑↓ to navigate, Enter to select
                    </span>
                    <span className="text-xs text-purple-400">
                      {colleges.length}+ colleges
                    </span>
                  </div>
                  
                  {/* Floating particles */}
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1 h-1 bg-purple-400/50 rounded-full"
                      style={{
                        left: `${30 + i * 20}%`,
                        bottom: '50%',
                      }}
                      animate={{
                        y: [0, -10, 0],
                        opacity: [0.3, 0.8, 0.3],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.3,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && <p className="text-sm text-red-400 mt-1">{error}</p>}
    </div>
  );
};
