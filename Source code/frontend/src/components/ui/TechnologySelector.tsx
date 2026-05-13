import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code, Search, ChevronDown, X } from 'lucide-react';

import { fieldSkillsMap } from '@/data/fieldSkillsData';

// Extract all unique skills from fieldSkillsMap to provide a comprehensive list
const fieldSpecificSkills = Array.from(new Set(Object.values(fieldSkillsMap).flat()));

// Comprehensive list of technologies and skills
const technologies = Array.from(new Set([
  // Programming Languages
  "JavaScript", "TypeScript", "Python", "Java", "C", "C++", "C#", "Go", "Rust", "Ruby", 
  "PHP", "Swift", "Kotlin", "Scala", "R", "MATLAB", "Perl", "Haskell", "Lua", "Dart",
  "Objective-C", "Shell", "PowerShell", "Bash", "SQL", "PL/SQL", "Groovy", "Clojure",
  "Elixir", "Erlang", "F#", "Julia", "Assembly", "COBOL", "Fortran", "Lisp", "Prolog",
  
  // Frontend Frameworks & Libraries
  "React", "React.js", "Vue.js", "Vue", "Angular", "AngularJS", "Next.js", "Nuxt.js",
  "Svelte", "SvelteKit", "Ember.js", "Backbone.js", "jQuery", "Bootstrap", "Tailwind CSS",
  "Material UI", "Chakra UI", "Ant Design", "Styled Components", "Sass", "SCSS", "Less",
  "Redux", "Zustand", "MobX", "Recoil", "Vite", "Webpack", "Parcel", "Rollup",
  "Gatsby", "Astro", "Remix", "SolidJS", "Preact", "Alpine.js", "HTMX",
  
  // Backend Frameworks
  "Node.js", "Express.js", "Express", "NestJS", "Fastify", "Koa", "Hapi",
  "Django", "Flask", "FastAPI", "Pyramid", "Tornado", "Sanic",
  "Spring", "Spring Boot", "Hibernate", "Struts", "Play Framework",
  "Ruby on Rails", "Rails", "Sinatra",
  "Laravel", "Symfony", "CodeIgniter", "CakePHP", "Yii",
  "ASP.NET", ".NET Core", ".NET", "Entity Framework",
  "Gin", "Echo", "Fiber", "Buffalo",
  "Actix", "Rocket", "Axum",
  
  // Databases
  "MySQL", "PostgreSQL", "MongoDB", "Redis", "SQLite", "Oracle", "SQL Server",
  "MariaDB", "Cassandra", "DynamoDB", "Firebase", "Firestore", "CouchDB",
  "Neo4j", "Elasticsearch", "InfluxDB", "TimescaleDB", "CockroachDB", "PlanetScale",
  "Supabase", "Prisma", "Mongoose", "Sequelize", "TypeORM", "Drizzle",
  
  // Cloud & DevOps
  "AWS", "Amazon Web Services", "Azure", "Google Cloud", "GCP", "Heroku", "Vercel",
  "Netlify", "DigitalOcean", "Linode", "Cloudflare", "Railway",
  "Docker", "Kubernetes", "K8s", "Terraform", "Ansible", "Puppet", "Chef",
  "Jenkins", "GitHub Actions", "GitLab CI", "CircleCI", "Travis CI", "ArgoCD",
  "Nginx", "Apache", "Caddy", "HAProxy",
  
  // Mobile Development
  "React Native", "Flutter", "Dart", "SwiftUI", "UIKit", "Jetpack Compose",
  "Android SDK", "iOS SDK", "Xamarin", "Ionic", "Cordova", "Capacitor",
  "Expo", "NativeScript",
  
  // AI & Machine Learning
  "TensorFlow", "PyTorch", "Keras", "Scikit-learn", "OpenCV", "NLTK", "SpaCy",
  "Hugging Face", "Transformers", "LangChain", "OpenAI API", "GPT", "BERT",
  "Pandas", "NumPy", "SciPy", "Matplotlib", "Seaborn", "Plotly",
  "Jupyter", "Jupyter Notebook", "Google Colab", "MLflow", "Weights & Biases",
  "Apache Spark", "PySpark", "Hadoop", "Kafka", "Airflow", "Databricks",
  
  // Testing
  "Jest", "Mocha", "Chai", "Cypress", "Playwright", "Selenium", "Puppeteer",
  "Testing Library", "React Testing Library", "Vitest", "Jasmine", "Karma",
  "JUnit", "TestNG", "Pytest", "Unittest", "RSpec", "Capybara",
  "Postman", "Insomnia", "SoapUI",
  
  // Version Control & Tools
  "Git", "GitHub", "GitLab", "Bitbucket", "SVN", "Mercurial",
  "VS Code", "Visual Studio", "IntelliJ IDEA", "PyCharm", "WebStorm", "Eclipse",
  "Vim", "Neovim", "Emacs", "Sublime Text", "Atom",
  "npm", "yarn", "pnpm", "pip", "Maven", "Gradle", "Cargo", "Composer",
  
  // APIs & Protocols
  "REST", "RESTful API", "GraphQL", "gRPC", "WebSocket", "WebRTC", "SOAP",
  "OAuth", "OAuth2", "JWT", "OpenID Connect", "SAML",
  "Swagger", "OpenAPI", "Postman", "Insomnia",
  
  // Other Tools & Concepts
  "Linux", "Unix", "Windows Server", "macOS",
  "Agile", "Scrum", "Kanban", "JIRA", "Confluence", "Trello", "Notion",
  "Figma", "Sketch", "Adobe XD", "InVision", "Zeplin",
  "Microservices", "Serverless", "Lambda", "Cloud Functions",
  "CI/CD", "DevOps", "SRE", "Infrastructure as Code",
  "Data Structures", "Algorithms", "System Design", "Design Patterns",
  "Object-Oriented Programming", "OOP", "Functional Programming", "TDD", "BDD",
  
  // Data Science & Analytics
  "Tableau", "Power BI", "Looker", "Metabase", "Grafana",
  "Excel", "Google Sheets", "Data Analysis", "Business Intelligence",
  "ETL", "Data Warehousing", "Data Modeling", "Data Pipeline",
  
  // Blockchain & Web3
  "Solidity", "Web3.js", "Ethers.js", "Hardhat", "Truffle", "Metamask",
  "Smart Contracts", "Ethereum", "Polygon", "Solana", "Rust (Solana)",
  
  // CMS & E-commerce
  "WordPress", "Drupal", "Joomla", "Shopify", "Magento", "WooCommerce",
  "Strapi", "Contentful", "Sanity", "Ghost", "Webflow",

  // Add all skills from field-specific map
  ...fieldSpecificSkills
]));

interface TechnologySelectorProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export const TechnologySelector = ({ value, onChange, error }: TechnologySelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTechnologies, setFilteredTechnologies] = useState<string[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Parse selected technologies from comma-separated string - memoized to prevent infinite loops
  const selectedTechnologies = useMemo(() => {
    return value
      ? value.split(',').map(t => t.trim()).filter(t => t.length > 0)
      : [];
  }, [value]);

  useEffect(() => {
    if (searchTerm.length > 0) {
      const filtered = technologies.filter(tech =>
        tech.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !selectedTechnologies.some(selected => 
          selected.toLowerCase() === tech.toLowerCase()
        )
      ).slice(0, 8);
      setFilteredTechnologies(filtered);
      setHighlightedIndex(0);
    } else {
      setFilteredTechnologies([]);
    }
  }, [searchTerm, selectedTechnologies]);

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
      setHighlightedIndex(prev => Math.min(prev + 1, filteredTechnologies.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && filteredTechnologies.length > 0) {
      e.preventDefault();
      handleSelect(filteredTechnologies[highlightedIndex]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchTerm('');
    } else if (e.key === 'Backspace' && searchTerm === '' && selectedTechnologies.length > 0) {
      // Remove last technology when backspace pressed on empty search
      const newSelected = selectedTechnologies.slice(0, -1);
      onChange(newSelected.join(', '));
    }
  };

  const handleSelect = (tech: string) => {
    const newSelected = [...selectedTechnologies, tech];
    onChange(newSelected.join(', '));
    setSearchTerm('');
    inputRef.current?.focus();
  };

  const handleRemove = (techToRemove: string) => {
    const newSelected = selectedTechnologies.filter(t => t !== techToRemove);
    onChange(newSelected.join(', '));
    inputRef.current?.focus();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setIsOpen(true);
  };

  // Get color based on technology category
  const getTechColor = (tech: string): string => {
    const lowerTech = tech.toLowerCase();
    
    // Languages
    if (['javascript', 'typescript', 'python', 'java', 'c', 'c++', 'c#', 'go', 'rust', 'ruby', 'php', 'swift', 'kotlin'].some(l => lowerTech.includes(l))) {
      return 'from-yellow-500 to-orange-500';
    }
    // Frontend
    if (['react', 'vue', 'angular', 'next', 'nuxt', 'svelte', 'tailwind', 'bootstrap', 'css', 'html'].some(f => lowerTech.includes(f))) {
      return 'from-cyan-500 to-blue-500';
    }
    // Backend
    if (['node', 'express', 'django', 'flask', 'spring', 'rails', 'laravel', '.net', 'fastapi'].some(b => lowerTech.includes(b))) {
      return 'from-green-500 to-emerald-500';
    }
    // Database
    if (['sql', 'mongo', 'redis', 'postgres', 'firebase', 'dynamo', 'cassandra', 'elastic'].some(d => lowerTech.includes(d))) {
      return 'from-purple-500 to-violet-500';
    }
    // Cloud
    if (['aws', 'azure', 'gcp', 'google cloud', 'docker', 'kubernetes', 'heroku', 'vercel'].some(c => lowerTech.includes(c))) {
      return 'from-orange-500 to-red-500';
    }
    // AI/ML
    if (['tensorflow', 'pytorch', 'keras', 'scikit', 'pandas', 'numpy', 'ml', 'ai', 'gpt', 'llm'].some(a => lowerTech.includes(a))) {
      return 'from-pink-500 to-rose-500';
    }
    // Mobile
    if (['flutter', 'react native', 'android', 'ios', 'swift', 'kotlin'].some(m => lowerTech.includes(m))) {
      return 'from-indigo-500 to-purple-500';
    }
    // Default
    return 'from-gray-500 to-slate-500';
  };

  return (
    <div ref={dropdownRef} className="relative">
      {/* Input container */}
      <div className={`relative min-h-[48px] px-3 py-2 rounded-xl bg-white/5 border ${
        error ? 'border-red-500/50' : 'border-white/10'
      } focus-within:ring-2 focus-within:ring-purple-500/50 transition-all`}>
        <div className="flex flex-wrap gap-2 items-center">
          <Code className="w-5 h-5 text-gray-500 flex-shrink-0" />
          
          {/* Selected technology chips */}
          <AnimatePresence>
            {selectedTechnologies.map((tech) => (
              <motion.div
                key={tech}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-gradient-to-r ${getTechColor(tech)} text-white text-sm font-medium shadow-sm`}
              >
                <span>{tech}</span>
                <button
                  type="button"
                  onClick={() => handleRemove(tech)}
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
            placeholder={selectedTechnologies.length === 0 ? "Search your skills..." : "Add more skills..."}
            className="flex-1 min-w-[120px] bg-transparent text-white placeholder-gray-500 focus:outline-none text-sm py-1"
          />

          {/* Dropdown indicator */}
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="flex-shrink-0"
          >
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </motion.div>
        </div>
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (searchTerm.length > 0 || filteredTechnologies.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -10, rotateX: -15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, rotateX: -15, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            style={{ perspective: 1000, transformOrigin: "top center" }}
            className="absolute z-50 w-full mt-2 rounded-xl overflow-hidden"
          >
            <div className="relative rounded-xl shadow-2xl shadow-purple-500/10 overflow-hidden hover-unblur" style={{ backdropFilter: 'blur(60px)', WebkitBackdropFilter: 'blur(60px)', background: 'rgba(10, 15, 30, 0.98)' }}>
              {/* Animated gradient border */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-purple-500/20 opacity-50" />
              
              {/* Search indicator */}
              <div className="relative px-4 py-3 border-b border-white/5 flex items-center gap-2">
                <Search className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-gray-400">
                  {filteredTechnologies.length > 0 
                    ? `${filteredTechnologies.length} skills found`
                    : 'Type to search your skills...'}
                </span>
              </div>

              {/* Results */}
              <div className="relative max-h-64 overflow-y-auto">
                {filteredTechnologies.length > 0 ? (
                  filteredTechnologies.map((tech, index) => (
                    <motion.div
                      key={tech}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      onClick={() => handleSelect(tech)}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      className={`relative px-4 py-3 cursor-pointer transition-all duration-200 ${
                        highlightedIndex === index
                          ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20'
                          : 'hover:bg-white/5'
                      }`}
                    >
                      <motion.div
                        whileHover={{ scale: 1.02, x: 5 }}
                        className="flex items-center gap-3"
                      >
                        {/* Tech icon */}
                        <motion.div
                          className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getTechColor(tech)} flex items-center justify-center flex-shrink-0 shadow-lg`}
                          whileHover={{ rotateY: 15, scale: 1.1 }}
                          style={{ transformStyle: 'preserve-3d' }}
                        >
                          <Code className="w-5 h-5 text-white" />
                        </motion.div>

                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium text-white">
                            {tech.split(new RegExp(`(${searchTerm})`, 'gi')).map((part, i) => (
                              part.toLowerCase() === searchTerm.toLowerCase() ? (
                                <span key={i} className="text-purple-400 font-semibold">{part}</span>
                              ) : (
                                <span key={i}>{part}</span>
                              )
                            ))}
                          </span>
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

                      {highlightedIndex === index && (
                        <motion.div
                          layoutId="tech-highlight"
                          className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 -z-10"
                        />
                      )}
                    </motion.div>
                  ))
                ) : searchTerm.length > 0 ? (
                  <div className="px-4 py-8 text-center">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-gray-500/20 to-gray-600/20 flex items-center justify-center"
                    >
                      <Search className="w-6 h-6 text-gray-500" />
                    </motion.div>
                    <p className="text-gray-400 text-sm">No technology found for "{searchTerm}"</p>
                    <p className="text-gray-500 text-xs mt-1">Try a different search term</p>
                  </div>
                ) : null}
              </div>

              {/* Footer */}
              {filteredTechnologies.length > 0 && (
                <div className="relative px-4 py-2 border-t border-white/5 bg-gradient-to-r from-purple-500/5 to-blue-500/5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      Use ↑↓ to navigate, Enter to select, Backspace to remove
                    </span>
                    <span className="text-xs text-purple-400">
                      {technologies.length}+ technologies
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

      {/* Helper text */}
      {selectedTechnologies.length > 0 && (
        <p className="text-xs text-gray-500 mt-1">
          {selectedTechnologies.length} technolog{selectedTechnologies.length === 1 ? 'y' : 'ies'} selected
        </p>
      )}

      {error && <p className="text-sm text-red-400 mt-1">{error}</p>}
    </div>
  );
};
