import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Search, ChevronDown, Check, X } from 'lucide-react';

// Company data with logos (using placeholder URLs - in production use actual logos)
const companies = [
  // FAANG / MAANG
  { name: "Google", logo: "https://www.google.com/favicon.ico", category: "MAANG" },
  { name: "Microsoft", logo: "https://www.microsoft.com/favicon.ico", category: "MAANG" },
  { name: "Amazon", logo: "https://www.amazon.com/favicon.ico", category: "MAANG" },
  { name: "Apple", logo: "https://www.apple.com/favicon.ico", category: "MAANG" },
  { name: "Meta (Facebook)", logo: "https://www.facebook.com/favicon.ico", category: "MAANG" },
  { name: "Netflix", logo: "https://www.netflix.com/favicon.ico", category: "MAANG" },
  
  // Big Tech
  { name: "Adobe", logo: "https://www.adobe.com/favicon.ico", category: "Big Tech" },
  { name: "Salesforce", logo: "https://www.salesforce.com/favicon.ico", category: "Big Tech" },
  { name: "Oracle", logo: "https://www.oracle.com/favicon.ico", category: "Big Tech" },
  { name: "IBM", logo: "https://www.ibm.com/favicon.ico", category: "Big Tech" },
  { name: "Intel", logo: "https://www.intel.com/favicon.ico", category: "Big Tech" },
  { name: "Cisco", logo: "https://www.cisco.com/favicon.ico", category: "Big Tech" },
  { name: "SAP", logo: "https://www.sap.com/favicon.ico", category: "Big Tech" },
  { name: "VMware", logo: "https://www.vmware.com/favicon.ico", category: "Big Tech" },
  { name: "Nvidia", logo: "https://www.nvidia.com/favicon.ico", category: "Big Tech" },
  { name: "AMD", logo: "https://www.amd.com/favicon.ico", category: "Big Tech" },
  { name: "Qualcomm", logo: "https://www.qualcomm.com/favicon.ico", category: "Big Tech" },
  { name: "PayPal", logo: "https://www.paypal.com/favicon.ico", category: "Big Tech" },
  { name: "Stripe", logo: "https://stripe.com/favicon.ico", category: "Big Tech" },
  { name: "Shopify", logo: "https://www.shopify.com/favicon.ico", category: "Big Tech" },
  { name: "Airbnb", logo: "https://www.airbnb.com/favicon.ico", category: "Big Tech" },
  { name: "Uber", logo: "https://www.uber.com/favicon.ico", category: "Big Tech" },
  { name: "Lyft", logo: "https://www.lyft.com/favicon.ico", category: "Big Tech" },
  { name: "Twitter (X)", logo: "https://www.twitter.com/favicon.ico", category: "Big Tech" },
  { name: "LinkedIn", logo: "https://www.linkedin.com/favicon.ico", category: "Big Tech" },
  { name: "Snap Inc.", logo: "https://www.snap.com/favicon.ico", category: "Big Tech" },
  { name: "Pinterest", logo: "https://www.pinterest.com/favicon.ico", category: "Big Tech" },
  { name: "Spotify", logo: "https://www.spotify.com/favicon.ico", category: "Big Tech" },
  { name: "Zoom", logo: "https://zoom.us/favicon.ico", category: "Big Tech" },
  { name: "Slack", logo: "https://slack.com/favicon.ico", category: "Big Tech" },
  { name: "Atlassian", logo: "https://www.atlassian.com/favicon.ico", category: "Big Tech" },
  { name: "Twilio", logo: "https://www.twilio.com/favicon.ico", category: "Big Tech" },
  { name: "Cloudflare", logo: "https://www.cloudflare.com/favicon.ico", category: "Big Tech" },
  { name: "Databricks", logo: "https://www.databricks.com/favicon.ico", category: "Big Tech" },
  { name: "Snowflake", logo: "https://www.snowflake.com/favicon.ico", category: "Big Tech" },
  
  // Indian IT Giants
  { name: "TCS", logo: "https://www.tcs.com/favicon.ico", category: "Indian IT" },
  { name: "Infosys", logo: "https://www.infosys.com/favicon.ico", category: "Indian IT" },
  { name: "Wipro", logo: "https://www.wipro.com/favicon.ico", category: "Indian IT" },
  { name: "HCL Technologies", logo: "https://www.hcltech.com/favicon.ico", category: "Indian IT" },
  { name: "Tech Mahindra", logo: "https://www.techmahindra.com/favicon.ico", category: "Indian IT" },
  { name: "LTIMindtree", logo: "https://www.ltimindtree.com/favicon.ico", category: "Indian IT" },
  { name: "Persistent Systems", logo: "https://www.persistent.com/favicon.ico", category: "Indian IT" },
  { name: "Mphasis", logo: "https://www.mphasis.com/favicon.ico", category: "Indian IT" },
  { name: "Coforge", logo: "https://www.coforge.com/favicon.ico", category: "Indian IT" },
  { name: "Zensar Technologies", logo: "https://www.zensar.com/favicon.ico", category: "Indian IT" },
  { name: "Cyient", logo: "https://www.cyient.com/favicon.ico", category: "Indian IT" },
  { name: "KPIT Technologies", logo: "https://www.kpit.com/favicon.ico", category: "Indian IT" },
  { name: "Birlasoft", logo: "https://www.birlasoft.com/favicon.ico", category: "Indian IT" },
  { name: "Sonata Software", logo: "https://www.sonata-software.com/favicon.ico", category: "Indian IT" },
  
  // Indian Startups & Unicorns
  { name: "Flipkart", logo: "https://www.flipkart.com/favicon.ico", category: "Indian Startup" },
  { name: "Swiggy", logo: "https://www.swiggy.com/favicon.ico", category: "Indian Startup" },
  { name: "Zomato", logo: "https://www.zomato.com/favicon.ico", category: "Indian Startup" },
  { name: "Paytm", logo: "https://www.paytm.com/favicon.ico", category: "Indian Startup" },
  { name: "PhonePe", logo: "https://www.phonepe.com/favicon.ico", category: "Indian Startup" },
  { name: "Razorpay", logo: "https://razorpay.com/favicon.ico", category: "Indian Startup" },
  { name: "Ola", logo: "https://www.olacabs.com/favicon.ico", category: "Indian Startup" },
  { name: "CRED", logo: "https://www.cred.club/favicon.ico", category: "Indian Startup" },
  { name: "Byju's", logo: "https://www.byjus.com/favicon.ico", category: "Indian Startup" },
  { name: "Unacademy", logo: "https://www.unacademy.com/favicon.ico", category: "Indian Startup" },
  { name: "upGrad", logo: "https://www.upgrad.com/favicon.ico", category: "Indian Startup" },
  { name: "Nykaa", logo: "https://www.nykaa.com/favicon.ico", category: "Indian Startup" },
  { name: "Meesho", logo: "https://www.meesho.com/favicon.ico", category: "Indian Startup" },
  { name: "ShareChat", logo: "https://www.sharechat.com/favicon.ico", category: "Indian Startup" },
  { name: "Dream11", logo: "https://www.dream11.com/favicon.ico", category: "Indian Startup" },
  { name: "Groww", logo: "https://groww.in/favicon.ico", category: "Indian Startup" },
  { name: "Zerodha", logo: "https://zerodha.com/favicon.ico", category: "Indian Startup" },
  { name: "Lenskart", logo: "https://www.lenskart.com/favicon.ico", category: "Indian Startup" },
  { name: "PolicyBazaar", logo: "https://www.policybazaar.com/favicon.ico", category: "Indian Startup" },
  { name: "CarDekho", logo: "https://www.cardekho.com/favicon.ico", category: "Indian Startup" },
  { name: "Cars24", logo: "https://www.cars24.com/favicon.ico", category: "Indian Startup" },
  { name: "Delhivery", logo: "https://www.delhivery.com/favicon.ico", category: "Indian Startup" },
  { name: "Dunzo", logo: "https://www.dunzo.com/favicon.ico", category: "Indian Startup" },
  { name: "BigBasket", logo: "https://www.bigbasket.com/favicon.ico", category: "Indian Startup" },
  { name: "Blinkit", logo: "https://blinkit.com/favicon.ico", category: "Indian Startup" },
  { name: "Zepto", logo: "https://www.zeptonow.com/favicon.ico", category: "Indian Startup" },
  { name: "Urban Company", logo: "https://www.urbancompany.com/favicon.ico", category: "Indian Startup" },
  { name: "OYO", logo: "https://www.oyorooms.com/favicon.ico", category: "Indian Startup" },
  { name: "MakeMyTrip", logo: "https://www.makemytrip.com/favicon.ico", category: "Indian Startup" },
  { name: "Freshworks", logo: "https://www.freshworks.com/favicon.ico", category: "Indian Startup" },
  { name: "Zoho", logo: "https://www.zoho.com/favicon.ico", category: "Indian Startup" },
  { name: "Postman", logo: "https://www.postman.com/favicon.ico", category: "Indian Startup" },
  { name: "Chargebee", logo: "https://www.chargebee.com/favicon.ico", category: "Indian Startup" },
  { name: "BrowserStack", logo: "https://www.browserstack.com/favicon.ico", category: "Indian Startup" },
  { name: "Druva", logo: "https://www.druva.com/favicon.ico", category: "Indian Startup" },
  { name: "Hasura", logo: "https://hasura.io/favicon.ico", category: "Indian Startup" },
  
  // Consulting & Finance
  { name: "Accenture", logo: "https://www.accenture.com/favicon.ico", category: "Consulting" },
  { name: "Deloitte", logo: "https://www.deloitte.com/favicon.ico", category: "Consulting" },
  { name: "PwC", logo: "https://www.pwc.com/favicon.ico", category: "Consulting" },
  { name: "EY (Ernst & Young)", logo: "https://www.ey.com/favicon.ico", category: "Consulting" },
  { name: "KPMG", logo: "https://www.kpmg.com/favicon.ico", category: "Consulting" },
  { name: "McKinsey & Company", logo: "https://www.mckinsey.com/favicon.ico", category: "Consulting" },
  { name: "Boston Consulting Group", logo: "https://www.bcg.com/favicon.ico", category: "Consulting" },
  { name: "Bain & Company", logo: "https://www.bain.com/favicon.ico", category: "Consulting" },
  { name: "Capgemini", logo: "https://www.capgemini.com/favicon.ico", category: "Consulting" },
  { name: "Cognizant", logo: "https://www.cognizant.com/favicon.ico", category: "Consulting" },
  { name: "Goldman Sachs", logo: "https://www.goldmansachs.com/favicon.ico", category: "Finance" },
  { name: "Morgan Stanley", logo: "https://www.morganstanley.com/favicon.ico", category: "Finance" },
  { name: "JP Morgan Chase", logo: "https://www.jpmorganchase.com/favicon.ico", category: "Finance" },
  { name: "Barclays", logo: "https://www.barclays.com/favicon.ico", category: "Finance" },
  { name: "Deutsche Bank", logo: "https://www.db.com/favicon.ico", category: "Finance" },
  { name: "HSBC", logo: "https://www.hsbc.com/favicon.ico", category: "Finance" },
  { name: "American Express", logo: "https://www.americanexpress.com/favicon.ico", category: "Finance" },
  { name: "Mastercard", logo: "https://www.mastercard.com/favicon.ico", category: "Finance" },
  { name: "Visa", logo: "https://www.visa.com/favicon.ico", category: "Finance" },
  
  // Product Companies
  { name: "Atlassian", logo: "https://www.atlassian.com/favicon.ico", category: "Product" },
  { name: "Notion", logo: "https://www.notion.so/favicon.ico", category: "Product" },
  { name: "Figma", logo: "https://www.figma.com/favicon.ico", category: "Product" },
  { name: "Canva", logo: "https://www.canva.com/favicon.ico", category: "Product" },
  { name: "MongoDB", logo: "https://www.mongodb.com/favicon.ico", category: "Product" },
  { name: "Elastic", logo: "https://www.elastic.co/favicon.ico", category: "Product" },
  { name: "Redis", logo: "https://redis.io/favicon.ico", category: "Product" },
  { name: "Confluent", logo: "https://www.confluent.io/favicon.ico", category: "Product" },
  { name: "HashiCorp", logo: "https://www.hashicorp.com/favicon.ico", category: "Product" },
  { name: "JetBrains", logo: "https://www.jetbrains.com/favicon.ico", category: "Product" },
  { name: "GitHub", logo: "https://github.com/favicon.ico", category: "Product" },
  { name: "GitLab", logo: "https://gitlab.com/favicon.ico", category: "Product" },
  { name: "Docker", logo: "https://www.docker.com/favicon.ico", category: "Product" },
  { name: "Kubernetes", logo: "https://kubernetes.io/favicon.ico", category: "Product" },
  
  // Gaming
  { name: "Electronic Arts (EA)", logo: "https://www.ea.com/favicon.ico", category: "Gaming" },
  { name: "Ubisoft", logo: "https://www.ubisoft.com/favicon.ico", category: "Gaming" },
  { name: "Riot Games", logo: "https://www.riotgames.com/favicon.ico", category: "Gaming" },
  { name: "Epic Games", logo: "https://www.epicgames.com/favicon.ico", category: "Gaming" },
  { name: "Zynga", logo: "https://www.zynga.com/favicon.ico", category: "Gaming" },
  { name: "Games24x7", logo: "https://www.games24x7.com/favicon.ico", category: "Gaming" },
  { name: "Mobile Premier League (MPL)", logo: "https://www.mpl.live/favicon.ico", category: "Gaming" },
  
  // E-commerce
  { name: "eBay", logo: "https://www.ebay.com/favicon.ico", category: "E-commerce" },
  { name: "Walmart", logo: "https://www.walmart.com/favicon.ico", category: "E-commerce" },
  { name: "Target", logo: "https://www.target.com/favicon.ico", category: "E-commerce" },
  { name: "Myntra", logo: "https://www.myntra.com/favicon.ico", category: "E-commerce" },
  { name: "Ajio", logo: "https://www.ajio.com/favicon.ico", category: "E-commerce" },
  { name: "Tata Cliq", logo: "https://www.tatacliq.com/favicon.ico", category: "E-commerce" },
];

const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    'MAANG': 'from-purple-500 to-blue-500',
    'Big Tech': 'from-cyan-500 to-blue-500',
    'Indian IT': 'from-orange-500 to-red-500',
    'Indian Startup': 'from-green-500 to-teal-500',
    'Consulting': 'from-amber-500 to-yellow-500',
    'Finance': 'from-emerald-500 to-green-500',
    'Product': 'from-pink-500 to-rose-500',
    'Gaming': 'from-violet-500 to-purple-500',
    'E-commerce': 'from-indigo-500 to-blue-500',
  };
  return colors[category] || 'from-gray-500 to-slate-500';
};

interface CompanySelectorProps {
  value: string[];
  onChange: (value: string[]) => void;
  error?: string;
  maxSelections?: number;
}

export const CompanySelector = ({ 
  value = [], 
  onChange, 
  error,
  maxSelections = 5
}: CompanySelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredCompanies = searchTerm.length > 0
    ? companies.filter(company =>
        company.name.toLowerCase().startsWith(searchTerm.toLowerCase()) ||
        company.category.toLowerCase().startsWith(searchTerm.toLowerCase())
      )
    : [];

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
      setHighlightedIndex(prev => Math.min(prev + 1, filteredCompanies.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && filteredCompanies.length > 0) {
      e.preventDefault();
      handleToggleCompany(filteredCompanies[highlightedIndex].name);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  const handleToggleCompany = (companyName: string) => {
    if (value.includes(companyName)) {
      onChange(value.filter(c => c !== companyName));
    } else if (value.length < maxSelections) {
      onChange([...value, companyName]);
      setSearchTerm('');
    }
  };

  const handleRemoveCompany = (companyName: string) => {
    onChange(value.filter(c => c !== companyName));
    inputRef.current?.focus();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setIsOpen(true);
  };

  // Get color for company category
  const getCompanyColor = (companyName: string): string => {
    const company = companies.find(c => c.name === companyName);
    if (!company) return 'from-gray-500 to-slate-500';
    return getCategoryColor(company.category);
  };

  return (
    <div ref={dropdownRef} className="relative">
      {/* Input container with chips */}
      <div className={`relative min-h-[48px] px-3 py-2 rounded-xl bg-white/5 border ${
        error ? 'border-red-500/50' : 'border-white/10'
      } focus-within:ring-2 focus-within:ring-purple-500/50 transition-all`}>
        <div className="flex flex-wrap gap-2 items-center">
          <Building2 className="w-5 h-5 text-gray-500 flex-shrink-0" />
          
          {/* Selected company chips */}
          <AnimatePresence>
            {value.map((companyName) => (
              <motion.div
                key={companyName}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-gradient-to-r ${getCompanyColor(companyName)} text-white text-sm font-medium shadow-sm`}
              >
                <span>{companyName}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveCompany(companyName)}
                  className="p-0.5 rounded-full hover:bg-white/20 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Search input */}
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={value.length === 0 ? "Search companies..." : value.length >= maxSelections ? `Max ${maxSelections} selected` : "Add more..."}
            disabled={value.length >= maxSelections}
            className="flex-1 min-w-[120px] bg-transparent text-white placeholder-gray-500 focus:outline-none text-sm py-1 disabled:opacity-50"
          />

          {/* Dropdown indicator */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {value.length > 0 && (
              <span className="text-xs text-purple-400">{value.length}/{maxSelections}</span>
            )}
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </motion.div>
          </div>
        </div>
      </div>

      {/* 3D Dropdown */}
      <AnimatePresence>
        {isOpen && searchTerm.length > 0 && (
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
              
              {/* Search indicator */}
              <div className="relative px-4 py-3 border-b border-white/5 flex items-center gap-2">
                <Search className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-gray-400">
                  {filteredCompanies.length > 0 
                    ? `${filteredCompanies.length} companies found`
                    : 'No companies found'}
                </span>
              </div>

              {/* Results list */}
              <div className="relative max-h-64 overflow-y-auto">
                {filteredCompanies.length > 0 ? (
                  filteredCompanies.map((company, index) => {
                    const isSelected = value.includes(company.name);
                    const color = getCategoryColor(company.category);
                    return (
                      <motion.div
                        key={company.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.02 }}
                        onClick={() => handleToggleCompany(company.name)}
                        onMouseEnter={() => setHighlightedIndex(index)}
                        className={`relative px-4 py-3 cursor-pointer transition-all duration-200 ${
                          highlightedIndex === index
                            ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20'
                            : 'hover:bg-white/5'
                        } ${isSelected ? 'bg-purple-500/10' : ''}`}
                      >
                        {/* 3D card effect */}
                        <motion.div
                          whileHover={{ scale: 1.02, x: 5 }}
                          className="flex items-center gap-3"
                        >
                          {/* Company logo with 3D effect */}
                          <motion.div
                            className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 shadow-lg overflow-hidden"
                            whileHover={{ rotateY: 15, scale: 1.1 }}
                            style={{ transformStyle: 'preserve-3d' }}
                          >
                            <img 
                              src={company.logo} 
                              alt={company.name}
                              className="w-6 h-6 object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                                (e.target as HTMLImageElement).parentElement!.innerHTML = `<span class="text-white font-bold text-lg">${company.name.charAt(0)}</span>`;
                              }}
                            />
                          </motion.div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-white truncate">
                                {searchTerm ? (
                                  company.name.split(new RegExp(`(${searchTerm})`, 'gi')).map((part, i) => (
                                    part.toLowerCase() === searchTerm.toLowerCase() ? (
                                      <span key={i} className="text-purple-400 font-semibold">{part}</span>
                                    ) : (
                                      <span key={i}>{part}</span>
                                    )
                                  ))
                                ) : (
                                  company.name
                                )}
                              </span>
                              {/* Category badge */}
                              <motion.span
                                whileHover={{ scale: 1.1 }}
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r ${color} text-white shadow-sm`}
                              >
                                {company.category}
                              </motion.span>
                            </div>
                          </div>

                          {/* Selection indicator */}
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center"
                            >
                              <Check className="w-3 h-3 text-white" />
                            </motion.div>
                          )}
                        </motion.div>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="px-4 py-8 text-center">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-gray-500/20 to-gray-600/20 flex items-center justify-center"
                    >
                      <Search className="w-6 h-6 text-gray-500" />
                    </motion.div>
                    <p className="text-gray-400 text-sm">No companies found for "{searchTerm}"</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="relative px-4 py-2 border-t border-white/5 bg-gradient-to-r from-purple-500/5 to-blue-500/5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    Select up to {maxSelections} companies
                  </span>
                  <span className="text-xs text-purple-400">
                    {companies.length}+ companies
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && <p className="text-sm text-red-400 mt-1">{error}</p>}
    </div>
  );
};
