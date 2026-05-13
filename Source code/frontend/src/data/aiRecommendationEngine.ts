// AI-Powered Career Recommendation Engine
// Comprehensive personalized recommendations based on assessment results

export interface SectionScore {
  name: string;
  score: number;
  total: number;
  correct: number;
  percentage: number;
  category: 'beginner' | 'intermediate' | 'advanced';
  status: 'strength' | 'moderate' | 'weakness';
}

export interface CourseRecommendation {
  id: string;
  title: string;
  platform: string;
  platformLogo?: string;
  thumbnail: string;
  url: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  rating?: number;
  students?: string;
  price?: string;
  skills?: string[];
  description?: string;
  whyRecommended?: string;
  whyThisCourse?: string; // New AI property
  level?: string;         // New AI property
  howItHelps?: string;
  expectedImprovement?: number;
  priority?: 'critical' | 'important' | 'enhancement';
  skillArea?: string;
  skill?: string;         // New AI property
}

export interface YouTubeRecommendation {
  id: string;
  title?: string;          // Made optional for playlistTitle support
  playlistTitle?: string;  // New AI property
  channel?: string;
  channelName?: string;    // New AI property
  channelLogo?: string;
  thumbnail?: string;
  thumbnailUrl?: string;    // New AI property
  url: string;
  videoCount?: number;
  totalDuration?: string;
  views?: string;
  rating?: number;
  skillFocus?: string[];
  description?: string;
  whyRecommended?: string;
  priority?: 'critical' | 'important' | 'enhancement';
  skillArea?: string;
  skill?: string;          // New AI property
}

export interface CertificationRecommendation {
  id: string;
  title: string;
  issuingAuthority: string;
  authorityLogo: string;
  thumbnail: string;
  url: string;
  cost: string;
  isFree: boolean;
  duration: string;
  industryValue: 'high' | 'medium' | 'standard';
  resumeImpact: number;
  skills: string[];
  description: string;
  whyRecommended: string;
  howItHelps: string;
  priority: 'critical' | 'important' | 'enhancement';
  skillArea: string;
}

export interface ProjectRecommendation {
  id: string;
  title: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  thumbnail?: string;
  thumbnailUrl?: string;   // New AI property
  techStack?: string[];
  duration?: string;
  category?: string;
  description: string;
  realWorldUseCase?: string;
  resumeImpact?: string;
  githubIdea?: string;
  keyFeatures?: string[];
  learningOutcomes?: string[];
  whyRecommended?: string;
  priority?: 'critical' | 'important' | 'enhancement';
  skillArea?: string;
  skill?: string;          // New AI property
}

export interface AIAnalysis {
  strengthSummary: string;
  weaknessSummary: string;
  skillGapAnalysis: string;
  improvementPriority: string[];
  overallAssessment: string;
  careerReadinessScore: number;
  interviewConfidence: number;
}

export interface ImprovementPrediction {
  currentScore: number;
  predictedScore: number;
  improvementPercentage: number;
  timeToAchieve: string;
  sectionImprovements: {
    section: string;
    currentScore: number;
    predictedScore: number;
  }[];
  interviewConfidenceBoost: number;
  placementReadinessBoost: number;
  current_score?: number;
  predicted_score?: number;
  improvement_percentage?: number;
  time_to_achieve?: string;
}

export interface StudyNoteRecommendation {
  id: string;
  title: string;
  type: string;
  category: string;
  url: string;
  topics: string[];
  timeToReview: string;
  difficultyLevel: string;
  skillsCovered: string[];
  whyRecommended: string;
  priority?: 'critical' | 'important' | 'enhancement';
}

export interface InterviewPrepRecommendation {
  id: string;
  title: string;
  type: string;
  category: string;
  url: string;
  description: string;
  skillsCovered: string[];
  timeToComplete: string;
  whyRecommended: string;
  priority?: 'critical' | 'important' | 'enhancement';
}

export interface PracticeRecommendation {
  id: string;
  title: string;
  type: string;
  category: string;
  url: string;
  skillsTargeted: string[];
  whyRecommended: string;
  priority?: 'critical' | 'important' | 'enhancement';
}

export interface RoadmapPhase {
  phase: string;
  weeks: string;
  focus: string[];
  milestone: string;
  tasks: string[];
}

export interface Roadmap {
  title: string;
  description: string;
  total_weeks: number;
  phases: RoadmapPhase[];
  weekly_commitment: string;
  readiness_goal: string;
  readinessGoal?: string;
  weeklyCommitment?: string;
}

export interface AIRecommendationResult {
  sectionScores: SectionScore[];
  analysis: AIAnalysis;
  recommendations: {
    courses: CourseRecommendation[];
    youtube: YouTubeRecommendation[];
    certifications: CertificationRecommendation[];
    projects: ProjectRecommendation[];
    studyNotes: StudyNoteRecommendation[];
    interviewPrep: InterviewPrepRecommendation[];
    practice: PracticeRecommendation[];
  };
  learningPath: Roadmap;
  improvementPrediction: ImprovementPrediction;
  careerPaths?: any[];
  explanationSummary?: string;
  metadata?: {
    generatedBy: string;
    generatedAt: string;
    targetRole: string;
  };
  generatedAt: string;
}


// Comprehensive Course Database with Real Links
const courseDatabase: Record<string, CourseRecommendation[]> = {
  'Programming Fundamentals': [
    {
      id: 'c-pf-1',
      title: 'Python for Everybody Specialization',
      platform: 'Coursera',
      platformLogo: 'https://upload.wikimedia.org/wikipedia/commons/9/97/Coursera-Logo_600x600.svg',
      thumbnail: 'https://d3njjcbhbojbot.cloudfront.net/api/utilities/v1/imageproxy/https://coursera-course-photos.s3.amazonaws.com/83/e258e0532611e5a5072321239ff4d4/python_for_everybody_newbrand.png',
      url: 'https://www.coursera.org/specializations/python',
      difficulty: 'beginner',
      duration: '8 months',
      rating: 4.8,
      students: '3.2M',
      price: 'Free Audit',
      skills: ['Python', 'Programming Logic', 'Data Structures', 'Web Scraping', 'Databases'],
      description: 'Start your programming journey with this comprehensive Python course from University of Michigan.',
      whyRecommended: '',
      howItHelps: 'Builds solid programming foundation essential for all software roles. Python is the most in-demand language.',
      expectedImprovement: 25,
      priority: 'critical',
      skillArea: 'Programming Fundamentals'
    },
    {
      id: 'c-pf-2',
      title: 'CS50: Introduction to Computer Science',
      platform: 'edX',
      platformLogo: 'https://upload.wikimedia.org/wikipedia/commons/8/8f/EdX.svg',
      thumbnail: 'https://prod-discovery.edx-cdn.org/media/course/image/da1b2400-322b-459b-97b0-0c557f05d017-a3d1899c3344.small.jpg',
      url: 'https://www.edx.org/course/cs50s-introduction-to-computer-science',
      difficulty: 'beginner',
      duration: '12 weeks',
      rating: 4.9,
      students: '4M+',
      price: 'Free',
      skills: ['C', 'Python', 'SQL', 'JavaScript', 'Algorithms', 'Problem Solving'],
      description: 'Harvard\'s legendary introduction to computer science. The gold standard for programming fundamentals.',
      whyRecommended: '',
      howItHelps: 'Provides world-class foundation in computational thinking and problem-solving approached used by top companies.',
      expectedImprovement: 30,
      priority: 'critical',
      skillArea: 'Programming Fundamentals'
    },
    {
      id: 'c-pf-3',
      title: '100 Days of Code: Python Bootcamp',
      platform: 'Udemy',
      platformLogo: 'https://upload.wikimedia.org/wikipedia/commons/e/e3/Udemy_logo.svg',
      thumbnail: 'https://img-c.udemycdn.com/course/480x270/2776760_f176_10.jpg',
      url: 'https://www.udemy.com/course/100-days-of-code/',
      difficulty: 'beginner',
      duration: '65 hours',
      rating: 4.7,
      students: '1.5M',
      price: '₹449',
      skills: ['Python', 'Web Development', 'Automation', 'Data Science', 'Game Development'],
      description: 'Master Python with 100 projects covering web, data science, automation, and more.',
      whyRecommended: '',
      howItHelps: 'Learn by building 100 real projects. Project experience is what recruiters value most.',
      expectedImprovement: 28,
      priority: 'important',
      skillArea: 'Programming Fundamentals'
    },
    {
      id: 'c-pf-4',
      title: 'Java Programming Masterclass',
      platform: 'Udemy',
      platformLogo: 'https://upload.wikimedia.org/wikipedia/commons/e/e3/Udemy_logo.svg',
      thumbnail: 'https://img-c.udemycdn.com/course/480x270/533682_c10c_4.jpg',
      url: 'https://www.udemy.com/course/java-the-complete-java-developer-course/',
      difficulty: 'beginner',
      duration: '80 hours',
      rating: 4.6,
      students: '800K+',
      price: '₹449',
      skills: ['Java', 'OOP', 'Lambda', 'Streams', 'Concurrency'],
      description: 'Complete Java developer course from zero to professional.',
      whyRecommended: '',
      howItHelps: 'Java is the primary language for enterprise development and most tech companies.',
      expectedImprovement: 30,
      priority: 'important',
      skillArea: 'Programming Fundamentals'
    },
    {
      id: 'c-pf-5',
      title: 'The Odin Project - Full Stack',
      platform: 'The Odin Project',
      platformLogo: 'https://www.theodinproject.com/assets/og-logo-022832d4cefeec1d5266237571d3d0b1.png',
      thumbnail: 'https://www.theodinproject.com/mstile-310x310.png',
      url: 'https://www.theodinproject.com/paths/full-stack-javascript',
      difficulty: 'beginner',
      duration: '6-12 months',
      rating: 4.9,
      students: '500K+',
      price: 'Free',
      skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'Git'],
      description: 'Free full-stack curriculum with real-world projects.',
      whyRecommended: '',
      howItHelps: 'Learn by building - the best free full-stack web development curriculum.',
      expectedImprovement: 35,
      priority: 'critical',
      skillArea: 'Programming Fundamentals'
    }
  ],
  'Data Structures': [
    {
      id: 'c-ds-1',
      title: 'Data Structures & Algorithms Specialization',
      platform: 'Coursera',
      platformLogo: 'https://upload.wikimedia.org/wikipedia/commons/9/97/Coursera-Logo_600x600.svg',
      thumbnail: 'https://d3njjcbhbojbot.cloudfront.net/api/utilities/v1/imageproxy/https://coursera-course-photos.s3.amazonaws.com/fb/434400d9ac11e5b195f7f5a63a3717/logo.png',
      url: 'https://www.coursera.org/specializations/data-structures-algorithms',
      difficulty: 'intermediate',
      duration: '6 months',
      rating: 4.6,
      students: '500K+',
      price: '₹3,226/month',
      skills: ['DSA', 'Graph Algorithms', 'Dynamic Programming', 'NP-Complete Problems'],
      description: 'Master algorithmic techniques for solving computational problems from UC San Diego.',
      whyRecommended: '',
      howItHelps: 'DSA is tested in 95% of tech interviews. This course prepares you for FAANG-level problems.',
      expectedImprovement: 35,
      priority: 'critical',
      skillArea: 'Data Structures'
    },
    {
      id: 'c-ds-2',
      title: 'Strivers A2Z DSA Course',
      platform: 'take U forward',
      platformLogo: 'https://takeuforward.org/static/media/logo.13aadb72.png',
      thumbnail: 'https://takeuforward.org/wp-content/uploads/2023/04/STRIVERS-A2Z-SHEET.webp',
      url: 'https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2/',
      difficulty: 'advanced',
      duration: 'Self-paced',
      rating: 4.9,
      students: '1M+',
      price: 'Free',
      skills: ['Arrays', 'LinkedList', 'Trees', 'Graphs', 'DP', 'Bit Manipulation'],
      description: 'The most comprehensive DSA roadmap for FAANG preparation by Striver.',
      whyRecommended: '',
      howItHelps: 'Covers every pattern asked in top company interviews. 450+ problems with video explanations.',
      expectedImprovement: 40,
      priority: 'critical',
      skillArea: 'Data Structures'
    },
    {
      id: 'c-ds-3',
      title: 'Master the Coding Interview: DSA + Big O',
      platform: 'Udemy',
      platformLogo: 'https://upload.wikimedia.org/wikipedia/commons/e/e3/Udemy_logo.svg',
      thumbnail: 'https://img-c.udemycdn.com/course/480x270/1917546_4df3.jpg',
      url: 'https://www.udemy.com/course/master-the-coding-interview-data-structures-algorithms/',
      difficulty: 'intermediate',
      duration: '20 hours',
      rating: 4.7,
      students: '200K+',
      price: '₹449',
      skills: ['Big O', 'Arrays', 'Hash Tables', 'Trees', 'Graphs', 'Recursion'],
      description: 'Complete interview preparation with focus on FAANG companies.',
      whyRecommended: '',
      howItHelps: 'Specifically designed for interview preparation with real interview questions from top companies.',
      expectedImprovement: 30,
      priority: 'important',
      skillArea: 'Data Structures'
    },
    {
      id: 'c-ds-4',
      title: 'NeetCode.io - Roadmap & Problems',
      platform: 'NeetCode',
      platformLogo: 'https://neetcode.io/favicon.ico',
      thumbnail: 'https://neetcode.io/assets/neetcode-io-logo.png',
      url: 'https://neetcode.io/roadmap',
      difficulty: 'intermediate',
      duration: 'Self-paced',
      rating: 4.9,
      students: '2M+',
      price: 'Free',
      skills: ['LeetCode Patterns', 'Blind 75', 'NeetCode 150', 'Interview Prep'],
      description: 'Structured LeetCode roadmap with video explanations for each problem.',
      whyRecommended: '',
      howItHelps: 'The most efficient DSA preparation resource. Covers all essential LeetCode patterns.',
      expectedImprovement: 40,
      priority: 'critical',
      skillArea: 'Data Structures'
    },
    {
      id: 'c-ds-5',
      title: 'LeetCode Premium',
      platform: 'LeetCode',
      platformLogo: 'https://leetcode.com/static/images/LeetCode_logo_rvs.png',
      thumbnail: 'https://leetcode.com/static/images/LeetCode_Sharing.png',
      url: 'https://leetcode.com/subscribe/',
      difficulty: 'advanced',
      duration: 'Self-paced',
      rating: 4.8,
      students: '5M+',
      price: '₹1,499/mo',
      skills: ['Company Tags', 'Interview Questions', 'Solution Videos', 'Mock Interviews'],
      description: 'Access company-specific questions and detailed solutions.',
      whyRecommended: '',
      howItHelps: 'Practice exact questions asked by your target companies. Includes mock interviews.',
      expectedImprovement: 35,
      priority: 'important',
      skillArea: 'Data Structures'
    }
  ],
  'Algorithms': [
    {
      id: 'c-algo-1',
      title: 'Algorithms, Part I & II',
      platform: 'Coursera',
      platformLogo: 'https://upload.wikimedia.org/wikipedia/commons/9/97/Coursera-Logo_600x600.svg',
      thumbnail: 'https://d3njjcbhbojbot.cloudfront.net/api/utilities/v1/imageproxy/https://coursera-course-photos.s3.amazonaws.com/19/e7d9508a0f11e8ad2acf8a52dcebb8/algorithms-part1.png',
      url: 'https://www.coursera.org/learn/algorithms-part1',
      difficulty: 'intermediate',
      duration: '12 weeks',
      rating: 4.9,
      students: '800K+',
      price: 'Free Audit',
      skills: ['Sorting', 'Searching', 'Graph Algorithms', 'String Processing'],
      description: 'Princeton\'s world-renowned algorithms course taught by Robert Sedgewick.',
      whyRecommended: '',
      howItHelps: 'Industry-standard algorithms knowledge. This course is recommended by FAANG engineers.',
      expectedImprovement: 35,
      priority: 'critical',
      skillArea: 'Algorithms'
    },
    {
      id: 'c-algo-2',
      title: 'Introduction to Algorithms (MIT OCW)',
      platform: 'MIT OpenCourseWare',
      platformLogo: 'https://upload.wikimedia.org/wikipedia/commons/0/0c/MIT_logo.svg',
      thumbnail: 'https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/6006.png',
      url: 'https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/',
      difficulty: 'advanced',
      duration: '16 weeks',
      rating: 4.9,
      students: '2M+',
      price: 'Free',
      skills: ['Sorting', 'Hashing', 'Dynamic Programming', 'Graph Algorithms', 'Shortest Paths'],
      description: 'MIT\'s flagship algorithms course covering all fundamental algorithmic techniques.',
      whyRecommended: '',
      howItHelps: 'The same algorithms course taught to MIT students. Builds deep understanding.',
      expectedImprovement: 40,
      priority: 'critical',
      skillArea: 'Algorithms'
    },
    {
      id: 'c-algo-3',
      title: 'JavaScript Algorithms and Data Structures',
      platform: 'freeCodeCamp',
      platformLogo: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/FreeCodeCamp_logo.svg',
      thumbnail: 'https://img.youtube.com/vi/8hly31xKli0/maxresdefault.jpg',
      url: 'https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/',
      difficulty: 'beginner',
      duration: '300 hours',
      rating: 4.8,
      students: '5M+',
      price: 'Free',
      skills: ['JavaScript', 'Basic Algorithms', 'Functional Programming', 'OOP'],
      description: 'Interactive JavaScript course with algorithm challenges.',
      whyRecommended: '',
      howItHelps: 'Earn a free certification while mastering algorithms in JavaScript.',
      expectedImprovement: 25,
      priority: 'important',
      skillArea: 'Algorithms'
    }
  ],
  'OOP Concepts': [
    {
      id: 'c-oop-1',
      title: 'Object Oriented Programming in Java',
      platform: 'Coursera',
      platformLogo: 'https://upload.wikimedia.org/wikipedia/commons/9/97/Coursera-Logo_600x600.svg',
      thumbnail: 'https://d3njjcbhbojbot.cloudfront.net/api/utilities/v1/imageproxy/https://coursera-course-photos.s3.amazonaws.com/51/e31b80b83011e8869f9dfa8c47d8c1/Introduction.gif',
      url: 'https://www.coursera.org/learn/object-oriented-java',
      difficulty: 'beginner',
      duration: '6 weeks',
      rating: 4.6,
      students: '150K+',
      price: 'Free Audit',
      skills: ['Java', 'Classes', 'Inheritance', 'Polymorphism', 'Encapsulation'],
      description: 'Learn core OOP principles with interactive visualization from Duke University.',
      whyRecommended: '',
      howItHelps: 'OOP is fundamental for backend development. Understanding it deeply helps in system design.',
      expectedImprovement: 25,
      priority: 'important',
      skillArea: 'OOP Concepts'
    },
    {
      id: 'c-oop-2',
      title: 'Design Patterns in Object-Oriented Programming',
      platform: 'Udemy',
      platformLogo: 'https://upload.wikimedia.org/wikipedia/commons/e/e3/Udemy_logo.svg',
      thumbnail: 'https://img-c.udemycdn.com/course/480x270/1132422_2be0_6.jpg',
      url: 'https://www.udemy.com/course/design-patterns-java/',
      difficulty: 'advanced',
      duration: '11 hours',
      rating: 4.6,
      students: '80K+',
      price: '₹449',
      skills: ['Creational Patterns', 'Structural Patterns', 'Behavioral Patterns', 'SOLID'],
      description: 'Master all 23 GoF design patterns with real-world Java examples.',
      whyRecommended: '',
      howItHelps: 'Design patterns are asked in senior-level interviews and crucial for writing maintainable code.',
      expectedImprovement: 30,
      priority: 'important',
      skillArea: 'OOP Concepts'
    }
  ],
  'Database & SQL': [
    {
      id: 'c-db-1',
      title: 'The Complete SQL Bootcamp',
      platform: 'Udemy',
      platformLogo: 'https://upload.wikimedia.org/wikipedia/commons/e/e3/Udemy_logo.svg',
      thumbnail: 'https://img-c.udemycdn.com/course/480x270/762616_7693_3.jpg',
      url: 'https://www.udemy.com/course/the-complete-sql-bootcamp/',
      difficulty: 'beginner',
      duration: '9 hours',
      rating: 4.7,
      students: '700K+',
      price: '₹449',
      skills: ['PostgreSQL', 'Queries', 'Joins', 'Aggregations', 'Subqueries'],
      description: 'Go from zero to hero with SQL and PostgreSQL. Most comprehensive SQL course.',
      whyRecommended: '',
      howItHelps: 'SQL is asked in 80% of backend interviews. Strong SQL skills are essential.',
      expectedImprovement: 30,
      priority: 'critical',
      skillArea: 'Database & SQL'
    },
    {
      id: 'c-db-2',
      title: 'Database Engineering Complete Course',
      platform: 'freeCodeCamp',
      platformLogo: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/FreeCodeCamp_logo.svg',
      thumbnail: 'https://img.youtube.com/vi/ztHopE5Wnpc/maxresdefault.jpg',
      url: 'https://www.youtube.com/watch?v=ztHopE5Wnpc',
      difficulty: 'intermediate',
      duration: '8 hours',
      rating: 4.8,
      students: '5M+',
      price: 'Free',
      skills: ['Database Design', 'Normalization', 'ER Diagrams', 'Indexing', 'Transactions'],
      description: 'Master database design, normalization, and SQL optimization.',
      whyRecommended: '',
      howItHelps: 'Understanding database internals helps you write efficient queries and design better schemas.',
      expectedImprovement: 35,
      priority: 'critical',
      skillArea: 'Database & SQL'
    },
    {
      id: 'c-db-3',
      title: 'MongoDB University - MongoDB Basics',
      platform: 'MongoDB University',
      platformLogo: 'https://upload.wikimedia.org/wikipedia/commons/9/93/MongoDB_Logo.svg',
      thumbnail: 'https://webimages.mongodb.com/_com_assets/cms/kuzt9r42or1fxvlq2-Meta_Generic.png',
      url: 'https://learn.mongodb.com/learning-paths/introduction-to-mongodb',
      difficulty: 'beginner',
      duration: '4 hours',
      rating: 4.8,
      students: '200K+',
      price: 'Free',
      skills: ['MongoDB', 'NoSQL', 'Document Database', 'Aggregation Pipeline', 'CRUD'],
      description: 'Official MongoDB course covering NoSQL fundamentals and document databases.',
      whyRecommended: '',
      howItHelps: 'NoSQL is increasingly used in modern applications. Learn directly from MongoDB creators.',
      expectedImprovement: 25,
      priority: 'important',
      skillArea: 'Database & SQL'
    },
    {
      id: 'c-db-4',
      title: 'Advanced SQL for Data Scientists',
      platform: 'DataCamp',
      platformLogo: 'https://www.datacamp.com/datacamp.png',
      thumbnail: 'https://images.datacamp.com/image/upload/v1674571179/marketing/advanced-sql.png',
      url: 'https://www.datacamp.com/courses/intermediate-sql',
      difficulty: 'intermediate',
      duration: '4 hours',
      rating: 4.7,
      students: '300K+',
      price: '₹1,299/mo',
      skills: ['Window Functions', 'CTEs', 'Performance Tuning', 'Complex Queries'],
      description: 'Master advanced SQL techniques used in data analysis and backend development.',
      whyRecommended: '',
      howItHelps: 'Advanced SQL skills differentiate you in interviews and real-world projects.',
      expectedImprovement: 30,
      priority: 'important',
      skillArea: 'Database & SQL'
    }
  ],
  'Operating Systems': [
    {
      id: 'c-os-1',
      title: 'Operating Systems: Three Easy Pieces',
      platform: 'OSTEP',
      platformLogo: 'https://pages.cs.wisc.edu/~remzi/OSTEP/book-cover-two.jpg',
      thumbnail: 'https://pages.cs.wisc.edu/~remzi/OSTEP/book-cover-two.jpg',
      url: 'https://pages.cs.wisc.edu/~remzi/OSTEP/',
      difficulty: 'intermediate',
      duration: 'Self-paced',
      rating: 4.9,
      students: '500K+',
      price: 'Free',
      skills: ['Processes', 'Memory Management', 'File Systems', 'Concurrency', 'Scheduling'],
      description: 'The best free OS textbook covering virtualization, concurrency, and persistence.',
      whyRecommended: '',
      howItHelps: 'OS concepts are frequently asked in system design and backend interviews.',
      expectedImprovement: 30,
      priority: 'important',
      skillArea: 'Operating Systems'
    },
    {
      id: 'c-os-2',
      title: 'Introduction to Operating Systems',
      platform: 'Udacity',
      platformLogo: 'https://upload.wikimedia.org/wikipedia/commons/3/3b/Udacity_logo.png',
      thumbnail: 'https://www.udacity.com/www-proxy/contentful/assets/2y9b3o528xhq/1pMgKYMkgMmYMCg8oUUGKU/d78fb6da77cab2b0c3fc946cd0b14d83/Course_Icon_-_Intro_to_Operating_Systems.jpg',
      url: 'https://www.udacity.com/course/introduction-to-operating-systems--ud923',
      difficulty: 'intermediate',
      duration: '8 weeks',
      rating: 4.7,
      students: '200K+',
      price: 'Free',
      skills: ['Threads', 'Synchronization', 'Memory', 'Inter-Process Communication'],
      description: 'Georgia Tech\'s OS course covering processes, threads, and memory management.',
      whyRecommended: '',
      howItHelps: 'Deep dive into OS internals. Essential for systems programming roles.',
      expectedImprovement: 30,
      priority: 'important',
      skillArea: 'Operating Systems'
    },
    {
      id: 'c-os-3',
      title: 'Nand to Tetris - Build a Modern Computer',
      platform: 'Coursera',
      platformLogo: 'https://upload.wikimedia.org/wikipedia/commons/9/97/Coursera-Logo_600x600.svg',
      thumbnail: 'https://d3njjcbhbojbot.cloudfront.net/api/utilities/v1/imageproxy/https://s3.amazonaws.com/coursera-course-photos/83/e258e0532611e5a5072321239ff4d4/nand2tetris2-thumb-big.png',
      url: 'https://www.coursera.org/learn/build-a-computer',
      difficulty: 'advanced',
      duration: '6 weeks',
      rating: 4.9,
      students: '100K+',
      price: 'Free Audit',
      skills: ['Computer Architecture', 'Assembly', 'Virtual Machine', 'Compiler Design'],
      description: 'Build a complete computer from scratch - from logic gates to operating system.',
      whyRecommended: '',
      howItHelps: 'Understand how computers work at the deepest level. Highly regarded course.',
      expectedImprovement: 35,
      priority: 'enhancement',
      skillArea: 'Operating Systems'
    }
  ],
  'Computer Networks': [
    {
      id: 'c-cn-1',
      title: 'The Bits and Bytes of Computer Networking',
      platform: 'Coursera',
      platformLogo: 'https://upload.wikimedia.org/wikipedia/commons/9/97/Coursera-Logo_600x600.svg',
      thumbnail: 'https://d3njjcbhbojbot.cloudfront.net/api/utilities/v1/imageproxy/https://coursera-course-photos.s3.amazonaws.com/29/89db70d92611e7a0c7b5f1a1b84a27/Bits-and-Bytes-Icon.png',
      url: 'https://www.coursera.org/learn/computer-networking',
      difficulty: 'beginner',
      duration: '6 weeks',
      rating: 4.7,
      students: '300K+',
      price: 'Free Audit',
      skills: ['TCP/IP', 'DNS', 'DHCP', 'Routing', 'Troubleshooting'],
      description: 'Google\'s networking fundamentals course. Part of IT Support Professional Certificate.',
      whyRecommended: '',
      howItHelps: 'Networking knowledge is crucial for understanding web applications and microservices.',
      expectedImprovement: 25,
      priority: 'important',
      skillArea: 'Computer Networks'
    },
    {
      id: 'c-cn-2',
      title: 'Computer Networking: A Top-Down Approach',
      platform: 'Jim Kurose',
      platformLogo: 'https://gaia.cs.umass.edu/kurose_ross/images/kurose-small.jpg',
      thumbnail: 'https://gaia.cs.umass.edu/kurose_ross/images/8e_cover.png',
      url: 'https://gaia.cs.umass.edu/kurose_ross/lectures.php',
      difficulty: 'intermediate',
      duration: 'Self-paced',
      rating: 4.9,
      students: '1M+',
      price: 'Free',
      skills: ['Application Layer', 'Transport Layer', 'Network Layer', 'HTTP', 'TCP/UDP'],
      description: 'Free video lectures from the most popular computer networking textbook authors.',
      whyRecommended: '',
      howItHelps: 'The gold standard networking resource used in universities worldwide.',
      expectedImprovement: 30,
      priority: 'important',
      skillArea: 'Computer Networks'
    },
    {
      id: 'c-cn-3',
      title: 'AWS Networking Specialty',
      platform: 'A Cloud Guru',
      platformLogo: 'https://acloudguru.com/favicon.ico',
      thumbnail: 'https://d1.awsstatic.com/training-and-certification/certification-badges/AWS-Certified-Advanced-Networking-Specialty_badge.e4d2c7db3cd8fa935088ab86efe4caf684d64e32.png',
      url: 'https://acloudguru.com/course/aws-certified-advanced-networking-specialty',
      difficulty: 'advanced',
      duration: '20 hours',
      rating: 4.7,
      students: '50K+',
      price: '₹2,999/mo',
      skills: ['VPC', 'CloudFront', 'Route 53', 'Direct Connect', 'Load Balancers'],
      description: 'Master cloud networking on AWS for production-grade applications.',
      whyRecommended: '',
      howItHelps: 'Cloud networking is essential for DevOps and cloud engineering roles.',
      expectedImprovement: 30,
      priority: 'enhancement',
      skillArea: 'Computer Networks'
    }
  ],
  'System Design': [
    {
      id: 'c-sd-1',
      title: 'Grokking the System Design Interview',
      platform: 'Educative',
      platformLogo: 'https://www.educative.io/static/imgs/logos/logoMarkv2.svg',
      thumbnail: 'https://www.educative.io/v2api/collection/5668639101419520/5649050225344512/image/5630903070621696',
      url: 'https://www.educative.io/courses/grokking-the-system-design-interview',
      difficulty: 'advanced',
      duration: '25 hours',
      rating: 4.8,
      students: '300K+',
      price: '₹3,999',
      skills: ['Scalability', 'Load Balancing', 'Caching', 'Database Design', 'Microservices'],
      description: 'The definitive system design interview preparation course used by FAANG engineers.',
      whyRecommended: '',
      howItHelps: 'System design is asked in 100% of senior-level interviews. This course covers all patterns.',
      expectedImprovement: 40,
      priority: 'critical',
      skillArea: 'System Design'
    },
    {
      id: 'c-sd-2',
      title: 'System Design Primer',
      platform: 'GitHub',
      platformLogo: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
      thumbnail: 'https://repository-images.githubusercontent.com/68479576/8c5e9e00-6f84-11e9-9b9c-8b1e7f79b616',
      url: 'https://github.com/donnemartin/system-design-primer',
      difficulty: 'intermediate',
      duration: 'Self-paced',
      rating: 4.9,
      students: '250K+',
      price: 'Free',
      skills: ['System Design', 'Distributed Systems', 'CAP Theorem', 'Database Sharding'],
      description: 'Learn how to design large-scale systems. Free comprehensive resource.',
      whyRecommended: '',
      howItHelps: 'Most comprehensive free system design resource. Contains real interview questions.',
      expectedImprovement: 35,
      priority: 'important',
      skillArea: 'System Design'
    },
    {
      id: 'c-sd-3',
      title: 'Designing Data-Intensive Applications',
      platform: 'O\'Reilly',
      platformLogo: 'https://upload.wikimedia.org/wikipedia/commons/d/d2/O%27Reilly_Media_logo.svg',
      thumbnail: 'https://dataintensive.net/images/book-cover.png',
      url: 'https://www.oreilly.com/library/view/designing-data-intensive-applications/9781491903063/',
      difficulty: 'advanced',
      duration: 'Self-paced',
      rating: 4.9,
      students: '500K+',
      price: '₹4,500',
      skills: ['Distributed Databases', 'Stream Processing', 'Batch Processing', 'Replication'],
      description: 'The bible of distributed systems. Written by Martin Kleppmann.',
      whyRecommended: '',
      howItHelps: 'Deep understanding of data systems. Essential for senior/staff engineer roles.',
      expectedImprovement: 40,
      priority: 'critical',
      skillArea: 'System Design'
    },
    {
      id: 'c-sd-4',
      title: 'ByteByteGo System Design Course',
      platform: 'ByteByteGo',
      platformLogo: 'https://bytebytego.com/favicon.ico',
      thumbnail: 'https://substackcdn.com/image/fetch/f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F78dc96fb-2b8e-4d55-a9f1-5e3c1c1d9c4d_1280x720.png',
      url: 'https://bytebytego.com/',
      difficulty: 'intermediate',
      duration: '20 hours',
      rating: 4.8,
      students: '100K+',
      price: '$79',
      skills: ['System Design', 'Architecture', 'Scalability', 'Interview Prep'],
      description: 'Visual guide to system design by Alex Xu (author of System Design Interview).',
      whyRecommended: '',
      howItHelps: 'Visual explanations make complex concepts easy. Perfect for interview prep.',
      expectedImprovement: 35,
      priority: 'important',
      skillArea: 'System Design'
    }
  ],
  'Aptitude & Reasoning': [
    {
      id: 'c-apt-1',
      title: 'Aptitude & Logical Reasoning Masterclass',
      platform: 'Udemy',
      platformLogo: 'https://upload.wikimedia.org/wikipedia/commons/e/e3/Udemy_logo.svg',
      thumbnail: 'https://img-c.udemycdn.com/course/480x270/1378130_4e21_3.jpg',
      url: 'https://www.udemy.com/course/complete-quantitative-aptitude-for-competitive-exams/',
      difficulty: 'beginner',
      duration: '12 hours',
      rating: 4.5,
      students: '50K+',
      price: '₹449',
      skills: ['Percentages', 'Profit & Loss', 'Time & Work', 'Probability', 'Puzzles'],
      description: 'Master all aptitude topics for placements and competitive exams.',
      whyRecommended: '',
      howItHelps: 'Aptitude tests are the first round in most companies. Cracking it opens interview doors.',
      expectedImprovement: 25,
      priority: 'important',
      skillArea: 'Aptitude & Reasoning'
    },
    {
      id: 'c-apt-2',
      title: 'GMAT/GRE Quantitative Reasoning',
      platform: 'Magoosh',
      platformLogo: 'https://magoosh.com/favicon.ico',
      thumbnail: 'https://magoosh.com/wp-content/uploads/sites/2/2022/04/Magoosh-logo-purple-800x800-1.png',
      url: 'https://gre.magoosh.com/lessons',
      difficulty: 'intermediate',
      duration: '40 hours',
      rating: 4.7,
      students: '150K+',
      price: '₹5,999',
      skills: ['Algebra', 'Geometry', 'Data Analysis', 'Word Problems', 'Number Properties'],
      description: 'Comprehensive quantitative reasoning preparation for standardized tests.',
      whyRecommended: '',
      howItHelps: 'Advanced aptitude prep that goes beyond placement-level questions.',
      expectedImprovement: 30,
      priority: 'enhancement',
      skillArea: 'Aptitude & Reasoning'
    }
  ]
};

// YouTube Playlist Database
const youtubeDatabase: Record<string, YouTubeRecommendation[]> = {
  'Programming Fundamentals': [
    {
      id: 'yt-pf-1',
      title: 'Complete Python Course - Beginner to Advanced',
      channel: 'freeCodeCamp',
      channelLogo: 'https://yt3.googleusercontent.com/ytc/AIdro_nMCoS-Y-ObZ_KGnSkbNuBFfLt6lp5HqAF4FLtLBqCRCo8=s176-c-k-c0x00ffffff-no-rj',
      thumbnail: 'https://img.youtube.com/vi/rfscVS0vtbw/maxresdefault.jpg',
      url: 'https://www.youtube.com/watch?v=rfscVS0vtbw',
      videoCount: 1,
      totalDuration: '4h 30m',
      views: '40M+',
      rating: 4.9,
      skillFocus: ['Python', 'Programming Basics', 'Functions', 'OOP'],
      description: 'Full Python tutorial for beginners. Learn Python programming from zero.',
      whyRecommended: '',
      priority: 'critical',
      skillArea: 'Programming Fundamentals'
    },
    {
      id: 'yt-pf-2',
      title: 'CS50 Full Course 2024',
      channel: 'CS50',
      channelLogo: 'https://yt3.googleusercontent.com/ytc/AIdro_ncvj6BZpB0TezY2bvFVhBtRCyKOq6m2VLqO1KlTqfW9Rc=s176-c-k-c0x00ffffff-no-rj',
      thumbnail: 'https://img.youtube.com/vi/8mAITcNt710/maxresdefault.jpg',
      url: 'https://www.youtube.com/playlist?list=PLhQjrBD2T3817j24-GogXmWqO5Q5vYy0V',
      videoCount: 25,
      totalDuration: '40h',
      views: '20M+',
      rating: 4.9,
      skillFocus: ['C', 'Python', 'SQL', 'Web Development', 'Algorithms'],
      description: 'Harvard\'s famous CS50 - the best intro to computer science.',
      whyRecommended: '',
      priority: 'critical',
      skillArea: 'Programming Fundamentals'
    },
    {
      id: 'yt-pf-3',
      title: 'C Programming Tutorial for Beginners',
      channel: 'freeCodeCamp',
      channelLogo: 'https://yt3.googleusercontent.com/ytc/AIdro_nMCoS-Y-ObZ_KGnSkbNuBFfLt6lp5HqAF4FLtLBqCRCo8=s176-c-k-c0x00ffffff-no-rj',
      thumbnail: 'https://img.youtube.com/vi/KJgsSFOSQv0/maxresdefault.jpg',
      url: 'https://www.youtube.com/watch?v=KJgsSFOSQv0',
      videoCount: 1,
      totalDuration: '3h 45m',
      views: '13M+',
      rating: 4.9,
      skillFocus: ['C', 'Pointers', 'Memory Management', 'Data Types'],
      description: 'Master C programming - the foundation of system programming.',
      whyRecommended: '',
      priority: 'important',
      skillArea: 'Programming Fundamentals'
    },
    {
      id: 'yt-pf-4',
      title: 'JavaScript Full Course - Zero to Hero',
      channel: 'Traversy Media',
      channelLogo: 'https://yt3.googleusercontent.com/ytc/AIdro_nJwDkGuVeFUOZQGgF8uYGH7gYb8hYWlMBZLpDjSTXXKA=s176-c-k-c0x00ffffff-no-rj',
      thumbnail: 'https://img.youtube.com/vi/hdI2bqOjy3c/maxresdefault.jpg',
      url: 'https://www.youtube.com/watch?v=hdI2bqOjy3c',
      videoCount: 1,
      totalDuration: '2h',
      views: '10M+',
      rating: 4.8,
      skillFocus: ['JavaScript', 'ES6+', 'DOM Manipulation', 'Events'],
      description: 'Learn JavaScript from scratch - the language of the web.',
      whyRecommended: '',
      priority: 'important',
      skillArea: 'Programming Fundamentals'
    }
  ],
  'Data Structures': [
    {
      id: 'yt-ds-1',
      title: 'Striver A2Z DSA Course - Complete Playlist',
      channel: 'take U forward',
      channelLogo: 'https://yt3.googleusercontent.com/ytc/AIdro_lFlMuJZW6q2GwIHFGWKsruNlF8Y4vcrmPYLH5F0t_mGEs=s176-c-k-c0x00ffffff-no-rj',
      thumbnail: 'https://img.youtube.com/vi/0bHoB32fuj0/maxresdefault.jpg',
      url: 'https://www.youtube.com/playlist?list=PLgUwDviBIf0oF6QL8m22w1hIDC1vJ_BTs',
      videoCount: 200,
      totalDuration: '100h+',
      views: '15M+',
      rating: 4.9,
      skillFocus: ['Arrays', 'LinkedList', 'Trees', 'Graphs', 'DP'],
      description: 'Most comprehensive DSA playlist for FAANG interviews by Striver.',
      whyRecommended: '',
      priority: 'critical',
      skillArea: 'Data Structures'
    },
    {
      id: 'yt-ds-2',
      title: 'Data Structures & Algorithms Complete Course',
      channel: 'Kunal Kushwaha',
      channelLogo: 'https://yt3.googleusercontent.com/ytc/AIdro_kP9XXr3XYjc2xaF4DSn9yzLI2RD_Y4qrCeQ9xYOiqKTGo=s176-c-k-c0x00ffffff-no-rj',
      thumbnail: 'https://img.youtube.com/vi/rZ41y93P2Qo/maxresdefault.jpg',
      url: 'https://www.youtube.com/playlist?list=PL9gnSGHSqcnr_DxHsP7AW9ftq0AtAyYqJ',
      videoCount: 60,
      totalDuration: '50h',
      views: '5M+',
      rating: 4.9,
      skillFocus: ['Java', 'DSA', 'Problem Solving', 'Patterns'],
      description: 'Complete DSA bootcamp with Java by Kunal Kushwaha.',
      whyRecommended: '',
      priority: 'critical',
      skillArea: 'Data Structures'
    },
    {
      id: 'yt-ds-3',
      title: 'Dynamic Programming Playlist',
      channel: 'Aditya Verma',
      channelLogo: 'https://yt3.googleusercontent.com/ytc/AIdro_nckAD9cKBBPw7G3UGCvnP7FVCxRjQIYGUVRYoiNXs5cGI=s176-c-k-c0x00ffffff-no-rj',
      thumbnail: 'https://img.youtube.com/vi/nqowUJzG-iM/maxresdefault.jpg',
      url: 'https://www.youtube.com/playlist?list=PL_z_8CaSLPWekqhdCPmFohncHwz8TY2Go',
      videoCount: 52,
      totalDuration: '20h',
      views: '6M+',
      rating: 4.9,
      skillFocus: ['Dynamic Programming', 'Recursion', 'Memoization'],
      description: 'Best DP playlist with pattern-based approach.',
      whyRecommended: '',
      priority: 'critical',
      skillArea: 'Data Structures'
    },
    {
      id: 'yt-ds-4',
      title: 'Data Structures Easy to Advanced',
      channel: 'William Fiset',
      channelLogo: 'https://yt3.googleusercontent.com/ytc/AIdro_nctJW5Uv8cmzHQD_dAIEFZU4tR0u-5NZfVULxlWJyNxQ=s176-c-k-c0x00ffffff-no-rj',
      thumbnail: 'https://img.youtube.com/vi/RBSGKlAvoiM/maxresdefault.jpg',
      url: 'https://www.youtube.com/watch?v=RBSGKlAvoiM',
      videoCount: 1,
      totalDuration: '8h',
      views: '5M+',
      rating: 4.9,
      skillFocus: ['All Data Structures', 'Implementations', 'Time Complexity'],
      description: 'Complete DS course with visualizations and code.',
      whyRecommended: '',
      priority: 'important',
      skillArea: 'Data Structures'
    },
    {
      id: 'yt-ds-5',
      title: 'Recursion & Backtracking Full Course',
      channel: 'Pepcoding',
      channelLogo: 'https://yt3.googleusercontent.com/ytc/AIdro_lBi_jYQY7PV3uRkEZV7ld_LlI5lXFQB-_F0C3Kh-kKrw=s176-c-k-c0x00ffffff-no-rj',
      thumbnail: 'https://img.youtube.com/vi/kHi1DUhp9kM/maxresdefault.jpg',
      url: 'https://www.youtube.com/playlist?list=PL-Jc9J83PIiFxaBahjslhBD1LiJAV7nKs',
      videoCount: 60,
      totalDuration: '25h',
      views: '2M+',
      rating: 4.8,
      skillFocus: ['Recursion', 'Backtracking', 'N-Queens', 'Sudoku'],
      description: 'Master recursion - the foundation of advanced algorithms.',
      whyRecommended: '',
      priority: 'important',
      skillArea: 'Data Structures'
    }
  ],
  'Algorithms': [
    {
      id: 'yt-algo-1',
      title: 'Algorithms Course by Abdul Bari',
      channel: 'Abdul Bari',
      channelLogo: 'https://yt3.googleusercontent.com/ytc/AIdro_lFWBnC4xmk4i-b3VXdZMGCsjqFWguUjm8TLHwE77Lprw=s176-c-k-c0x00ffffff-no-rj',
      thumbnail: 'https://img.youtube.com/vi/0IAPZzGSbME/maxresdefault.jpg',
      url: 'https://www.youtube.com/playlist?list=PLDN4rrl48XKpZkf03iYFl-O29szjTrs_O',
      videoCount: 82,
      totalDuration: '25h',
      views: '10M+',
      rating: 4.9,
      skillFocus: ['Sorting', 'Searching', 'Greedy', 'Graph Algorithms'],
      description: 'Best algorithms playlist with clear animations.',
      whyRecommended: '',
      priority: 'critical',
      skillArea: 'Algorithms'
    },
    {
      id: 'yt-algo-2',
      title: 'Graph Theory Algorithms',
      channel: 'William Fiset',
      channelLogo: 'https://yt3.googleusercontent.com/ytc/AIdro_nctJW5Uv8cmzHQD_dAIEFZU4tR0u-5NZfVULxlWJyNxQ=s176-c-k-c0x00ffffff-no-rj',
      thumbnail: 'https://img.youtube.com/vi/DgXR2OWQnLc/maxresdefault.jpg',
      url: 'https://www.youtube.com/playlist?list=PLDV1Zeh2NRsDGO4--qE8yH72HFL1Km93P',
      videoCount: 35,
      totalDuration: '15h',
      views: '3M+',
      rating: 4.9,
      skillFocus: ['BFS', 'DFS', 'Dijkstra', 'Topological Sort'],
      description: 'Complete graph algorithms with code implementations.',
      whyRecommended: '',
      priority: 'important',
      skillArea: 'Algorithms'
    },
    {
      id: 'yt-algo-3',
      title: 'Competitive Programming - Errichto',
      channel: 'Errichto',
      channelLogo: 'https://yt3.googleusercontent.com/ytc/AIdro_kRmK5CSWqZ5w-KKBJ0dDIRTAEA3mSZdUGkUfjILyDYnA=s176-c-k-c0x00ffffff-no-rj',
      thumbnail: 'https://img.youtube.com/vi/xAeiXy8-9Y8/maxresdefault.jpg',
      url: 'https://www.youtube.com/playlist?list=PLl0KD3g-oDOGJUdmhFk19LaPgrfmAGQfo',
      videoCount: 30,
      totalDuration: '12h',
      views: '1M+',
      rating: 4.9,
      skillFocus: ['Competitive Programming', 'Advanced Algorithms', 'Contest Strategies'],
      description: 'Learn from a Codeforces legendary grandmaster.',
      whyRecommended: '',
      priority: 'enhancement',
      skillArea: 'Algorithms'
    },
    {
      id: 'yt-algo-4',
      title: 'Sorting Algorithms Visualized',
      channel: 'Coding Train',
      channelLogo: 'https://yt3.googleusercontent.com/ytc/AIdro_nDlrF8SKWhQMJExVWxm-LqVjjJ7xpGCLqxkXlLgT4A9dE=s176-c-k-c0x00ffffff-no-rj',
      thumbnail: 'https://img.youtube.com/vi/67k3I2GxTH8/maxresdefault.jpg',
      url: 'https://www.youtube.com/playlist?list=PLRqwX-V7Uu6ZidWjv0Q9WX0H8Rl8DaGBL',
      videoCount: 10,
      totalDuration: '5h',
      views: '2M+',
      rating: 4.8,
      skillFocus: ['Sorting', 'Visualization', 'Time Complexity Analysis'],
      description: 'Understand sorting algorithms through beautiful visualizations.',
      whyRecommended: '',
      priority: 'important',
      skillArea: 'Algorithms'
    }
  ],
  'OOP Concepts': [
    {
      id: 'yt-oop-1',
      title: 'Object Oriented Programming - Complete Course',
      channel: 'Kunal Kushwaha',
      channelLogo: 'https://yt3.googleusercontent.com/ytc/AIdro_kP9XXr3XYjc2xaF4DSn9yzLI2RD_Y4qrCeQ9xYOiqKTGo=s176-c-k-c0x00ffffff-no-rj',
      thumbnail: 'https://img.youtube.com/vi/BSVKUk58K6U/maxresdefault.jpg',
      url: 'https://www.youtube.com/playlist?list=PL9gnSGHSqcno1G3XjUbwzXHL8_EttOuKk',
      videoCount: 4,
      totalDuration: '8h',
      views: '2M+',
      rating: 4.8,
      skillFocus: ['Classes', 'Inheritance', 'Polymorphism', 'Abstraction'],
      description: 'Master OOP concepts with Java.',
      whyRecommended: '',
      priority: 'important',
      skillArea: 'OOP Concepts'
    },
    {
      id: 'yt-oop-2',
      title: 'Design Patterns Full Course',
      channel: 'Derek Banas',
      channelLogo: 'https://yt3.googleusercontent.com/ytc/AIdro_kXfLGP7xXSZNYSLXqBJsRH4p7XtPF8y9Y7TgQIg-A=s176-c-k-c0x00ffffff-no-rj',
      thumbnail: 'https://img.youtube.com/vi/vNHpsC5ng_E/maxresdefault.jpg',
      url: 'https://www.youtube.com/watch?v=vNHpsC5ng_E',
      videoCount: 1,
      totalDuration: '3h',
      views: '4M+',
      rating: 4.8,
      skillFocus: ['Design Patterns', 'GoF Patterns', 'SOLID Principles'],
      description: 'All 23 Gang of Four design patterns explained.',
      whyRecommended: '',
      priority: 'important',
      skillArea: 'OOP Concepts'
    },
    {
      id: 'yt-oop-3',
      title: 'SOLID Principles in 8 Minutes',
      channel: 'Web Dev Simplified',
      channelLogo: 'https://yt3.googleusercontent.com/ytc/AIdro_nK7E3dXKgHjQGqMnHxm0tI4j4DqQT3G9kz0wQ5gJBWSA=s176-c-k-c0x00ffffff-no-rj',
      thumbnail: 'https://img.youtube.com/vi/UQqY3_6Epbg/maxresdefault.jpg',
      url: 'https://www.youtube.com/watch?v=UQqY3_6Epbg',
      videoCount: 1,
      totalDuration: '8m',
      views: '800K+',
      rating: 4.9,
      skillFocus: ['SOLID', 'Clean Code', 'Best Practices'],
      description: 'Quick and clear explanation of SOLID principles.',
      whyRecommended: '',
      priority: 'critical',
      skillArea: 'OOP Concepts'
    }
  ],
  'Database & SQL': [
    {
      id: 'yt-db-1',
      title: 'SQL Tutorial - Full Database Course',
      channel: 'freeCodeCamp',
      channelLogo: 'https://yt3.googleusercontent.com/ytc/AIdro_nMCoS-Y-ObZ_KGnSkbNuBFfLt6lp5HqAF4FLtLBqCRCo8=s176-c-k-c0x00ffffff-no-rj',
      thumbnail: 'https://img.youtube.com/vi/HXV3zeQKqGY/maxresdefault.jpg',
      url: 'https://www.youtube.com/watch?v=HXV3zeQKqGY',
      videoCount: 1,
      totalDuration: '4h',
      views: '18M+',
      rating: 4.9,
      skillFocus: ['SQL', 'MySQL', 'Queries', 'Joins', 'Normalization'],
      description: 'Most popular SQL tutorial on YouTube.',
      whyRecommended: '',
      priority: 'critical',
      skillArea: 'Database & SQL'
    },
    {
      id: 'yt-db-2',
      title: 'Database Design Course',
      channel: 'freeCodeCamp',
      channelLogo: 'https://yt3.googleusercontent.com/ytc/AIdro_nMCoS-Y-ObZ_KGnSkbNuBFfLt6lp5HqAF4FLtLBqCRCo8=s176-c-k-c0x00ffffff-no-rj',
      thumbnail: 'https://img.youtube.com/vi/ztHopE5Wnpc/maxresdefault.jpg',
      url: 'https://www.youtube.com/watch?v=ztHopE5Wnpc',
      videoCount: 1,
      totalDuration: '8h',
      views: '5M+',
      rating: 4.8,
      skillFocus: ['ER Diagrams', 'Normalization', 'Schema Design'],
      description: 'Learn database design principles.',
      whyRecommended: '',
      priority: 'important',
      skillArea: 'Database & SQL'
    },
    {
      id: 'yt-db-3',
      title: 'MongoDB Full Tutorial',
      channel: 'Web Dev Simplified',
      channelLogo: 'https://yt3.googleusercontent.com/ytc/AIdro_nK7E3dXKgHjQGqMnHxm0tI4j4DqQT3G9kz0wQ5gJBWSA=s176-c-k-c0x00ffffff-no-rj',
      thumbnail: 'https://img.youtube.com/vi/ofme2o29ngU/maxresdefault.jpg',
      url: 'https://www.youtube.com/watch?v=ofme2o29ngU',
      videoCount: 1,
      totalDuration: '1h 30m',
      views: '2M+',
      rating: 4.8,
      skillFocus: ['MongoDB', 'NoSQL', 'CRUD Operations', 'Aggregation'],
      description: 'Learn MongoDB basics in 90 minutes.',
      whyRecommended: '',
      priority: 'important',
      skillArea: 'Database & SQL'
    },
    {
      id: 'yt-db-4',
      title: 'PostgreSQL Full Course',
      channel: 'Amigoscode',
      channelLogo: 'https://yt3.googleusercontent.com/ytc/AIdro_nqG4_fxBIBCIGaJjXLiP8W4c6e9qHqvdFhGd6q1wBfXw=s176-c-k-c0x00ffffff-no-rj',
      thumbnail: 'https://img.youtube.com/vi/qw--VYLpxG4/maxresdefault.jpg',
      url: 'https://www.youtube.com/watch?v=qw--VYLpxG4',
      videoCount: 1,
      totalDuration: '4h',
      views: '3M+',
      rating: 4.9,
      skillFocus: ['PostgreSQL', 'Advanced SQL', 'Joins', 'Indexes'],
      description: 'Master PostgreSQL - the enterprise database.',
      whyRecommended: '',
      priority: 'important',
      skillArea: 'Database & SQL'
    }
  ],
  'Operating Systems': [
    {
      id: 'yt-os-1',
      title: 'Operating Systems - Complete Course',
      channel: 'Neso Academy',
      channelLogo: 'https://yt3.googleusercontent.com/ytc/AIdro_kuHhb7tL_m1ePv1qf5xRNFv0iYgc0Qr_BQi3d0mW2bKSM=s176-c-k-c0x00ffffff-no-rj',
      thumbnail: 'https://img.youtube.com/vi/vBURTt97EkA/maxresdefault.jpg',
      url: 'https://www.youtube.com/playlist?list=PLBlnK6fEyqRiVhbXDGLXDk_OQAeuVcp2O',
      videoCount: 100,
      totalDuration: '20h',
      views: '8M+',
      rating: 4.8,
      skillFocus: ['Processes', 'Memory', 'Scheduling', 'Deadlocks'],
      description: 'Complete OS course for interviews and exams.',
      whyRecommended: '',
      priority: 'important',
      skillArea: 'Operating Systems'
    },
    {
      id: 'yt-os-2',
      title: 'Operating Systems - Gate Smashers',
      channel: 'Gate Smashers',
      channelLogo: 'https://yt3.googleusercontent.com/ytc/AIdro_mAByvOCwP5QH7LJ6RKLQM2pqnOXWpHQkdMNGqNRBU60so=s176-c-k-c0x00ffffff-no-rj',
      thumbnail: 'https://img.youtube.com/vi/bkSWJJZNgf8/maxresdefault.jpg',
      url: 'https://www.youtube.com/playlist?list=PLxCzCOWd7aiGz9donHRrE9I3Mwn6XdP8p',
      videoCount: 75,
      totalDuration: '15h',
      views: '10M+',
      rating: 4.7,
      skillFocus: ['OS Concepts', 'GATE Preparation', 'Interviews'],
      description: 'OS concepts explained simply for interviews.',
      whyRecommended: '',
      priority: 'important',
      skillArea: 'Operating Systems'
    }
  ],
  'Computer Networks': [
    {
      id: 'yt-cn-1',
      title: 'Computer Networks Complete Course',
      channel: 'Gate Smashers',
      channelLogo: 'https://yt3.googleusercontent.com/ytc/AIdro_mAByvOCwP5QH7LJ6RKLQM2pqnOXWpHQkdMNGqNRBU60so=s176-c-k-c0x00ffffff-no-rj',
      thumbnail: 'https://img.youtube.com/vi/JFF2vJaN0Cw/maxresdefault.jpg',
      url: 'https://www.youtube.com/playlist?list=PLxCzCOWd7aiGFBD2-2joCpWOLUrDLvVV_',
      videoCount: 80,
      totalDuration: '18h',
      views: '12M+',
      rating: 4.8,
      skillFocus: ['OSI Model', 'TCP/IP', 'Routing', 'Protocols'],
      description: 'Complete networking course for placements.',
      whyRecommended: '',
      priority: 'important',
      skillArea: 'Computer Networks'
    },
    {
      id: 'yt-cn-2',
      title: 'Computer Networking Full Course',
      channel: 'NetworkChuck',
      channelLogo: 'https://yt3.googleusercontent.com/ytc/AIdro_lj-vBb9Z6v8JRRxjeTz4YQJKT0qk3i0DCCB_NRYT6qQIA=s176-c-k-c0x00ffffff-no-rj',
      thumbnail: 'https://img.youtube.com/vi/qiQR5rTSshw/maxresdefault.jpg',
      url: 'https://www.youtube.com/watch?v=qiQR5rTSshw',
      videoCount: 1,
      totalDuration: '2h',
      views: '3M+',
      rating: 4.9,
      skillFocus: ['Networking Basics', 'IP Addressing', 'Subnetting'],
      description: 'Fun and engaging networking fundamentals.',
      whyRecommended: '',
      priority: 'important',
      skillArea: 'Computer Networks'
    },
    {
      id: 'yt-cn-3',
      title: 'HTTP Crash Course & REST APIs',
      channel: 'Traversy Media',
      channelLogo: 'https://yt3.googleusercontent.com/ytc/AIdro_nJwDkGuVeFUOZQGgF8uYGH7gYb8hYWlMBZLpDjSTXXKA=s176-c-k-c0x00ffffff-no-rj',
      thumbnail: 'https://img.youtube.com/vi/iYM2zFP3Zn0/maxresdefault.jpg',
      url: 'https://www.youtube.com/watch?v=iYM2zFP3Zn0',
      videoCount: 1,
      totalDuration: '40m',
      views: '1.5M+',
      rating: 4.9,
      skillFocus: ['HTTP', 'REST APIs', 'Status Codes', 'Request Methods'],
      description: 'Essential HTTP and REST knowledge for web developers.',
      whyRecommended: '',
      priority: 'critical',
      skillArea: 'Computer Networks'
    }
  ],
  'System Design': [
    {
      id: 'yt-sd-1',
      title: 'System Design Primer - Gaurav Sen',
      channel: 'Gaurav Sen',
      channelLogo: 'https://yt3.googleusercontent.com/ytc/AIdro_mGEomhXLQdOz5w0HLxF1h6QF4f0w7VLhQQf2kGPQ6Oeg=s176-c-k-c0x00ffffff-no-rj',
      thumbnail: 'https://img.youtube.com/vi/xpDnVSmNFX0/maxresdefault.jpg',
      url: 'https://www.youtube.com/playlist?list=PLMCXHnjXnTnvo6alSjVkgxV-VH6EPyvoX',
      videoCount: 45,
      totalDuration: '15h',
      views: '8M+',
      rating: 4.9,
      skillFocus: ['Scalability', 'Databases', 'Caching', 'Load Balancing'],
      description: 'Best system design playlist for interviews.',
      whyRecommended: '',
      priority: 'critical',
      skillArea: 'System Design'
    },
    {
      id: 'yt-sd-2',
      title: 'System Design for Beginners',
      channel: 'ByteByteGo',
      channelLogo: 'https://yt3.googleusercontent.com/v0T_9a_F8Yjnkuwj1HJoGvlYMdVK0zPejx9DQjn6jBJJx3i0vq2u2h7ue3F6l7xPpHJwWX9WRg=s176-c-k-c0x00ffffff-no-rj',
      thumbnail: 'https://img.youtube.com/vi/i53Gi_K3o7I/maxresdefault.jpg',
      url: 'https://www.youtube.com/@ByteByteGo/videos',
      videoCount: 100,
      totalDuration: '30h',
      views: '20M+',
      rating: 4.9,
      skillFocus: ['System Design', 'Architecture', 'Interviews'],
      description: 'Visual system design with beautiful animations.',
      whyRecommended: '',
      priority: 'important',
      skillArea: 'System Design'
    },
    {
      id: 'yt-sd-3',
      title: 'Microservices Architecture',
      channel: 'Tech Primers',
      channelLogo: 'https://yt3.googleusercontent.com/ytc/AIdro_lFH6vQ8qNg3f_xWrxdJtV7BF9G5c8QIvPH4vCmlQ=s176-c-k-c0x00ffffff-no-rj',
      thumbnail: 'https://img.youtube.com/vi/SzjGGpC5nys/maxresdefault.jpg',
      url: 'https://www.youtube.com/playlist?list=PLTyWtrsGknYdyi0JR7c1wsuv-Plrwcqxi',
      videoCount: 40,
      totalDuration: '20h',
      views: '1M+',
      rating: 4.7,
      skillFocus: ['Microservices', 'Spring Boot', 'Docker', 'Kubernetes'],
      description: 'Build production-ready microservices architecture.',
      whyRecommended: '',
      priority: 'important',
      skillArea: 'System Design'
    },
    {
      id: 'yt-sd-4',
      title: 'System Design Interview Questions',
      channel: 'Exponent',
      channelLogo: 'https://yt3.googleusercontent.com/ytc/AIdro_lZb7c0z1dLf1EtbCcVTGJn7Kc5xJwvLx2JqWdFDkZjIg=s176-c-k-c0x00ffffff-no-rj',
      thumbnail: 'https://img.youtube.com/vi/NtMvNh0WFOK/maxresdefault.jpg',
      url: 'https://www.youtube.com/playlist?list=PLrtCHHeadkHp92TyPt1Fj452_VGLipJnL',
      videoCount: 25,
      totalDuration: '10h',
      views: '2M+',
      rating: 4.9,
      skillFocus: ['Interview Prep', 'FAANG', 'Case Studies'],
      description: 'Real system design interview walkthroughs from ex-Google engineers.',
      whyRecommended: '',
      priority: 'critical',
      skillArea: 'System Design'
    }
  ],
  'Aptitude & Reasoning': [
    {
      id: 'yt-apt-1',
      title: 'Quantitative Aptitude Full Course',
      channel: 'CareerRide',
      channelLogo: 'https://yt3.googleusercontent.com/ytc/AIdro_l6l8Tm0E1I8VPlBL4j4i_Zz8-a5Xn-8_KVNW5Zl7p6Ag=s176-c-k-c0x00ffffff-no-rj',
      thumbnail: 'https://img.youtube.com/vi/OtUK_bPWbWo/maxresdefault.jpg',
      url: 'https://www.youtube.com/playlist?list=PLpyc33gOcbVA4qXMoQ5vmhefTruk5t9lt',
      videoCount: 50,
      totalDuration: '15h',
      views: '3M+',
      rating: 4.6,
      skillFocus: ['Aptitude', 'Reasoning', 'Problem Solving'],
      description: 'Complete aptitude for placements.',
      whyRecommended: '',
      priority: 'important',
      skillArea: 'Aptitude & Reasoning'
    },
    {
      id: 'yt-apt-2',
      title: 'Logical Reasoning Full Course',
      channel: 'Placement Preparation',
      channelLogo: 'https://yt3.googleusercontent.com/ytc/AIdro_n3RcXdFLvC8_qWFqGPNwPk_1Q3v7B5xHQ2r4F0cw=s176-c-k-c0x00ffffff-no-rj',
      thumbnail: 'https://img.youtube.com/vi/tXXRntaJQGg/maxresdefault.jpg',
      url: 'https://www.youtube.com/playlist?list=PLe0Ew3lQqn4dXOYVkBbKLJjcXdCxNJJZ-',
      videoCount: 30,
      totalDuration: '10h',
      views: '500K+',
      rating: 4.5,
      skillFocus: ['Logical Reasoning', 'Puzzles', 'Blood Relations', 'Coding-Decoding'],
      description: 'Complete logical reasoning for campus placements.',
      whyRecommended: '',
      priority: 'important',
      skillArea: 'Aptitude & Reasoning'
    },
    {
      id: 'yt-apt-3',
      title: 'Verbal Ability & Communication',
      channel: 'English with Lucy',
      channelLogo: 'https://yt3.googleusercontent.com/ytc/AIdro_mKPMYLZz0-M1L3v5F_K6Q9xFo0b8M6ZP_0nZkKrg=s176-c-k-c0x00ffffff-no-rj',
      thumbnail: 'https://img.youtube.com/vi/sQgd6MccwZc/maxresdefault.jpg',
      url: 'https://www.youtube.com/playlist?list=PLDlKNNJG7jPKLOYrskZuP9zJpQ7hDJE_R',
      videoCount: 20,
      totalDuration: '8h',
      views: '1M+',
      rating: 4.7,
      skillFocus: ['English', 'Communication', 'Grammar', 'Vocabulary'],
      description: 'Improve verbal ability for aptitude tests.',
      whyRecommended: '',
      priority: 'enhancement',
      skillArea: 'Aptitude & Reasoning'
    }
  ]
};

// Certification Database
const certificationDatabase: Record<string, CertificationRecommendation[]> = {
  'Programming Fundamentals': [
    {
      id: 'cert-pf-1',
      title: 'Python Professional Certificate',
      issuingAuthority: 'Google',
      authorityLogo: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg',
      thumbnail: 'https://d3njjcbhbojbot.cloudfront.net/api/utilities/v1/imageproxy/https://s3.amazonaws.com/coursera-course-photos/76/b934bfc6e411e7814bdf3c52aff6f0/Professional-Certificate---Data-Analytics.jpg',
      url: 'https://www.coursera.org/professional-certificates/google-it-automation',
      cost: '₹3,226/month',
      isFree: false,
      duration: '6 months',
      industryValue: 'high',
      resumeImpact: 85,
      skills: ['Python', 'Git', 'Automation', 'Cloud'],
      description: 'Google\'s official Python automation certificate.',
      whyRecommended: '',
      howItHelps: 'Google certification carries significant weight with recruiters. Validates your Python expertise.',
      priority: 'important',
      skillArea: 'Programming Fundamentals'
    }
  ],
  'Data Structures': [
    {
      id: 'cert-ds-1',
      title: 'Meta Front-End Developer Certificate',
      issuingAuthority: 'Meta',
      authorityLogo: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg',
      thumbnail: 'https://d3njjcbhbojbot.cloudfront.net/api/utilities/v1/imageproxy/https://coursera-course-photos.s3.amazonaws.com/9a/e2bcbdea8b4870b1d89a3cd5bb01d4/FE-Dev.png',
      url: 'https://www.coursera.org/professional-certificates/meta-front-end-developer',
      cost: '₹3,226/month',
      isFree: false,
      duration: '7 months',
      industryValue: 'high',
      resumeImpact: 90,
      skills: ['React', 'JavaScript', 'HTML/CSS', 'Version Control'],
      description: 'Official Meta certification for frontend development.',
      whyRecommended: '',
      howItHelps: 'FAANG certification that validates your frontend skills.',
      priority: 'important',
      skillArea: 'Data Structures'
    }
  ],
  'Database & SQL': [
    {
      id: 'cert-db-1',
      title: 'Oracle Database SQL Certified Associate',
      issuingAuthority: 'Oracle',
      authorityLogo: 'https://upload.wikimedia.org/wikipedia/commons/5/50/Oracle_logo.svg',
      thumbnail: 'https://education.oracle.com/file/general/OPNCC-DB-SQL-CertifiedAssociate.png',
      url: 'https://education.oracle.com/oracle-database-sql-certified-associate/trackp_457',
      cost: '$245',
      isFree: false,
      duration: 'Self-paced',
      industryValue: 'high',
      resumeImpact: 80,
      skills: ['SQL', 'Oracle DB', 'Query Optimization'],
      description: 'Industry-recognized Oracle SQL certification.',
      whyRecommended: '',
      howItHelps: 'Oracle certification is valued in enterprise companies.',
      priority: 'important',
      skillArea: 'Database & SQL'
    },
    {
      id: 'cert-db-2',
      title: 'MongoDB Developer Certification',
      issuingAuthority: 'MongoDB',
      authorityLogo: 'https://upload.wikimedia.org/wikipedia/commons/9/93/MongoDB_Logo.svg',
      thumbnail: 'https://webimages.mongodb.com/_com_assets/cms/kuyjf3vea2hg34taa-horizontal_default_slate_blue.svg',
      url: 'https://learn.mongodb.com/pages/mongodb-developer-certification-program',
      cost: '$150',
      isFree: false,
      duration: 'Self-paced',
      industryValue: 'medium',
      resumeImpact: 75,
      skills: ['MongoDB', 'NoSQL', 'Aggregation', 'Indexing'],
      description: 'Official MongoDB developer certification.',
      whyRecommended: '',
      howItHelps: 'Validates NoSQL skills increasingly demanded by startups.',
      priority: 'enhancement',
      skillArea: 'Database & SQL'
    }
  ],
  'System Design': [
    {
      id: 'cert-sd-1',
      title: 'AWS Solutions Architect Associate',
      issuingAuthority: 'Amazon Web Services',
      authorityLogo: 'https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg',
      thumbnail: 'https://d1.awsstatic.com/training-and-certification/certification-badges/AWS-Certified-Solutions-Architect-Associate_badge.3419559c682629072f1eb968d59dea0741772c0f.png',
      url: 'https://aws.amazon.com/certification/certified-solutions-architect-associate/',
      cost: '$150',
      isFree: false,
      duration: '3 months prep',
      industryValue: 'high',
      resumeImpact: 95,
      skills: ['AWS', 'Cloud Architecture', 'Scalability', 'Security'],
      description: 'Most valuable cloud certification in the industry.',
      whyRecommended: '',
      howItHelps: 'AWS certification can increase salary by 20-30%. Highly valued.',
      priority: 'critical',
      skillArea: 'System Design'
    }
  ]
};

// Project Database
const projectDatabase: Record<string, ProjectRecommendation[]> = {
  'Programming Fundamentals': [
    {
      id: 'proj-pf-1',
      title: 'Personal Finance Tracker',
      difficulty: 'beginner',
      thumbnail: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400',
      techStack: ['Python', 'SQLite', 'Matplotlib'],
      duration: '2 weeks',
      category: 'Desktop Application',
      description: 'Build an expense tracker with charts and data export.',
      realWorldUseCase: 'Track personal expenses, generate monthly reports, visualize spending patterns.',
      resumeImpact: 'Shows practical Python skills and database basics.',
      githubIdea: 'Create CLI and GUI versions with budget alerts.',
      keyFeatures: ['Expense tracking', 'Charts', 'Data export', 'Budget alerts'],
      learningOutcomes: ['Python OOP', 'Database CRUD', 'Data visualization'],
      whyRecommended: '',
      priority: 'important',
      skillArea: 'Programming Fundamentals'
    }
  ],
  'Data Structures': [
    {
      id: 'proj-ds-1',
      title: 'LRU Cache Implementation',
      difficulty: 'intermediate',
      thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400',
      techStack: ['Java/Python', 'HashMap', 'Doubly Linked List'],
      duration: '1 week',
      category: 'System Component',
      description: 'Implement a production-grade LRU cache from scratch.',
      realWorldUseCase: 'Used in databases, operating systems, and web browsers.',
      resumeImpact: 'Demonstrates deep DSA understanding. Often asked in interviews.',
      githubIdea: 'Add thread-safety, TTL, and Redis-like features.',
      keyFeatures: ['O(1) get/put', 'Eviction policy', 'Thread safety'],
      learningOutcomes: ['HashMap', 'Linked List', 'Time complexity optimization'],
      whyRecommended: '',
      priority: 'critical',
      skillArea: 'Data Structures'
    },
    {
      id: 'proj-ds-2',
      title: 'Mini Search Engine',
      difficulty: 'advanced',
      thumbnail: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=400',
      techStack: ['Python', 'Trie', 'Inverted Index', 'TF-IDF'],
      duration: '3 weeks',
      category: 'Information Retrieval',
      description: 'Build a search engine with autocomplete and ranking.',
      realWorldUseCase: 'Powers Google, Elasticsearch, and document search systems.',
      resumeImpact: 'Shows advanced DSA skills. Great discussion point in interviews.',
      githubIdea: 'Add web crawler and ranking algorithm.',
      keyFeatures: ['Autocomplete', 'Ranking', 'Inverted index', 'Fuzzy search'],
      learningOutcomes: ['Trie', 'Information retrieval', 'Ranking algorithms'],
      whyRecommended: '',
      priority: 'important',
      skillArea: 'Data Structures'
    }
  ],
  'Database & SQL': [
    {
      id: 'proj-db-1',
      title: 'E-Commerce Database Design',
      difficulty: 'intermediate',
      thumbnail: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400',
      techStack: ['PostgreSQL', 'ER Diagrams', 'Indexing'],
      duration: '2 weeks',
      category: 'Database Design',
      description: 'Design a complete e-commerce database schema.',
      realWorldUseCase: 'Used by Amazon, Flipkart, and all e-commerce platforms.',
      resumeImpact: 'Shows database design skills valued by backend teams.',
      githubIdea: 'Add complex queries, indexing strategy, and optimization.',
      keyFeatures: ['Users', 'Products', 'Orders', 'Reviews', 'Inventory'],
      learningOutcomes: ['Normalization', 'Relationships', 'Query optimization'],
      whyRecommended: '',
      priority: 'critical',
      skillArea: 'Database & SQL'
    }
  ],
  'System Design': [
    {
      id: 'proj-sd-1',
      title: 'URL Shortener (like bit.ly)',
      difficulty: 'intermediate',
      thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400',
      techStack: ['Node.js', 'Redis', 'MongoDB', 'Express'],
      duration: '2 weeks',
      category: 'Web Service',
      description: 'Build a scalable URL shortening service.',
      realWorldUseCase: 'Classic system design interview question.',
      resumeImpact: 'Perfect talking point for system design rounds.',
      githubIdea: 'Add analytics, custom short codes, and rate limiting.',
      keyFeatures: ['URL shortening', 'Redirection', 'Analytics', 'Rate limiting'],
      learningOutcomes: ['Hashing', 'Caching', 'Database design', 'API design'],
      whyRecommended: '',
      priority: 'critical',
      skillArea: 'System Design'
    },
    {
      id: 'proj-sd-2',
      title: 'Real-time Chat Application',
      difficulty: 'advanced',
      thumbnail: 'https://images.unsplash.com/photo-1611746872915-64382b5c76da?w=400',
      techStack: ['React', 'Socket.io', 'Node.js', 'MongoDB'],
      duration: '3 weeks',
      category: 'Real-time Application',
      description: 'Build a WhatsApp-like chat application.',
      realWorldUseCase: 'Powers messaging apps, customer support, and collaboration tools.',
      resumeImpact: 'Shows full-stack + real-time skills.',
      githubIdea: 'Add group chats, file sharing, and read receipts.',
      keyFeatures: ['Real-time messaging', 'Typing indicators', 'Online status'],
      learningOutcomes: ['WebSockets', 'Event-driven architecture', 'Scaling'],
      whyRecommended: '',
      priority: 'important',
      skillArea: 'System Design'
    }
  ]
};

// Study Note Database
const studyNoteDatabase: Record<string, StudyNoteRecommendation[]> = {
  'Programming Fundamentals': [
    { id: 'sn-pf-1', title: 'Clean Code Principles', type: 'Guide', category: 'Best Practices', url: '#', topics: ['Naming', 'Functions', 'Comments'], timeToReview: '15 mins', difficultyLevel: 'Beginner', skillsCovered: ['Code Quality'], whyRecommended: 'Critical for professional development.' },
    { id: 'sn-pf-2', title: 'Git Flow & Version Control', type: 'Cheat Sheet', category: 'DevOps', url: '#', topics: ['Branching', 'Merging', 'Rebasing'], timeToReview: '10 mins', difficultyLevel: 'Beginner', skillsCovered: ['Collaboration'], whyRecommended: 'Standard industry requirement.' }
  ],
  'Data Structures': [
    { id: 'sn-ds-1', title: 'Complexity Analysis (Big O)', type: 'Mastery Sheet', category: 'Theory', url: '#', topics: ['Time', 'Space', 'Best/Worst cases'], timeToReview: '20 mins', difficultyLevel: 'Intermediate', skillsCovered: ['Algorithm Efficiency'], whyRecommended: 'Core interview topic.' }
  ]
};

// Interview Prep Database
const interviewPrepDatabase: Record<string, InterviewPrepRecommendation[]> = {
  'Programming Fundamentals': [
    { id: 'ip-pf-1', title: 'Top 50 Frontend Questions', type: 'Question Bank', category: 'Technical', url: '#', description: 'Curated list of frequently asked JS and CSS questions.', skillsCovered: ['JavaScript', 'HTML', 'CSS'], timeToComplete: '2 hours', whyRecommended: 'Covers 80% of entry-level interviews.' }
  ],
  'System Design': [
    { id: 'ip-sd-1', title: 'System Design Framework', type: 'Video Prep', category: 'Architecture', url: '#', description: 'Step-by-step approach to solve any system design problem.', skillsCovered: ['Scalability', 'Availability', 'Reliability'], timeToComplete: '3 hours', whyRecommended: 'Essential for SDE-2+ roles.' }
  ]
};

// Practice Database
const practiceDatabase: Record<string, PracticeRecommendation[]> = {
  'Programming Fundamentals': [
    { id: 'p-pf-1', title: 'LeetCode: Dynamic Programming', type: 'Daily Challenge', category: 'Logic', url: 'https://leetcode.com', skillsTargeted: ['Logic', 'Optimization'], whyRecommended: 'Builds critical thinking.' }
  ],
  'Database & SQL': [
    { id: 'p-db-1', title: 'SQLZoo: Joins Master', type: 'Interactive Lab', category: 'Database', url: 'https://sqlzoo.net', skillsTargeted: ['SQL', 'Data joins'], whyRecommended: 'Hands-on querying practice.' }
  ]
};

// AI Analysis Generator
function generateAIAnalysis(sectionScores: SectionScore[], targetRole: string): AIAnalysis {
  const strengths = sectionScores.filter(s => s.status === 'strength');
  const weaknesses = sectionScores.filter(s => s.status === 'weakness');
  const avgScore = sectionScores.reduce((sum, s) => sum + s.percentage, 0) / sectionScores.length;
  
  const strengthNames = strengths.map(s => s.name).join(', ');
  const weaknessNames = weaknesses.map(s => s.name).join(', ');
  
  const strengthSummary = strengths.length > 0 
    ? `You demonstrate strong proficiency in ${strengthNames}. These skills form a solid foundation for ${targetRole} roles. Your performance in these areas indicates you can handle real-world problems and contribute immediately to a team.`
    : `Your scores indicate room for improvement across all areas. Focus on building foundational skills first.`;
    
  const weaknessSummary = weaknesses.length > 0
    ? `Your performance in ${weaknessNames} needs significant improvement. These areas are frequently tested in technical interviews and are essential for ${targetRole} positions. Prioritize these topics in your preparation.`
    : `Great job! No significant weaknesses identified. Focus on deepening your existing knowledge.`;
    
  const skillGapAnalysis = weaknesses.length > 0
    ? `Based on industry requirements for ${targetRole}, you have skill gaps in: ${weaknessNames}. These skills are in high demand and improving them will significantly boost your placement chances by approximately ${Math.round(15 + weaknesses.length * 5)}%.`
    : `Your skill profile aligns well with ${targetRole} requirements. Focus on advanced topics and system design to stand out.`;
    
  const improvementPriority = [...weaknesses]
    .sort((a, b) => a.percentage - b.percentage)
    .map(s => s.name);
    
  const overallAssessment = avgScore >= 70 
    ? `Excellent performance! You are well-prepared for technical interviews. Focus on practicing real interview problems and mock interviews.`
    : avgScore >= 50
    ? `Good foundation with some areas needing improvement. With focused preparation on weak areas, you can be interview-ready in 4-6 weeks.`
    : `Your fundamentals need strengthening. Create a structured 8-12 week study plan focusing on weak areas first.`;
    
  return {
    strengthSummary,
    weaknessSummary,
    skillGapAnalysis,
    improvementPriority,
    overallAssessment,
    careerReadinessScore: Math.round(avgScore),
    interviewConfidence: Math.round(avgScore * 0.9)
  };
}

// Improvement Prediction Generator
function generateImprovementPrediction(
  sectionScores: SectionScore[],
  recommendations: { courses: number; youtube: number; certifications: number; projects: number }
): ImprovementPrediction {
  const currentScore = sectionScores.reduce((sum, s) => sum + s.percentage, 0) / sectionScores.length;
  
  // Calculate predicted improvement based on recommendations followed
  const courseImpact = recommendations.courses * 8;
  const youtubeImpact = recommendations.youtube * 4;
  const certImpact = recommendations.certifications * 10;
  const projectImpact = recommendations.projects * 6;
  
  const totalImpact = Math.min(40, (courseImpact + youtubeImpact + certImpact + projectImpact) / 4);
  const predictedScore = Math.min(95, currentScore + totalImpact);
  
  const sectionImprovements = sectionScores
    .filter(s => s.status !== 'strength')
    .map(s => ({
      section: s.name,
      currentScore: s.percentage,
      predictedScore: Math.min(85, s.percentage + Math.round(totalImpact * 1.2))
    }));
    
  return {
    currentScore: Math.round(currentScore),
    predictedScore: Math.round(predictedScore),
    improvementPercentage: Math.round(totalImpact),
    timeToAchieve: totalImpact > 30 ? '8-10 weeks' : totalImpact > 20 ? '6-8 weeks' : '4-6 weeks',
    sectionImprovements,
    interviewConfidenceBoost: Math.round(totalImpact * 0.9),
    placementReadinessBoost: Math.round(totalImpact)
  };
}

// Main AI Recommendation Engine
export function generateAIRecommendations(
  testResults: {
    sectionResults: { name: string; total: number; correct: number; score: number }[];
    totalQuestions: number;
    correctAnswers: number;
    score: number;
  },
  targetRole: string,
  _knownTechnologies: string[]
): AIRecommendationResult {
  // Calculate section scores with categories
  const sectionScores: SectionScore[] = testResults.sectionResults.map(section => {
    const percentage = section.score;
    let category: 'beginner' | 'intermediate' | 'advanced';
    let status: 'strength' | 'moderate' | 'weakness';
    
    if (percentage >= 70) {
      category = 'advanced';
      status = 'strength';
    } else if (percentage >= 50) {
      category = 'intermediate';
      status = 'moderate';
    } else {
      category = 'beginner';
      status = 'weakness';
    }
    
    return {
      name: section.name,
      score: section.score,
      total: section.total,
      correct: section.correct,
      percentage,
      category,
      status
    };
  });
  
  // Generate AI analysis
  const analysis = generateAIAnalysis(sectionScores, targetRole);
  
  // Collect recommendations based on weaknesses and moderate areas
  const coursesToRecommend: CourseRecommendation[] = [];
  const youtubesToRecommend: YouTubeRecommendation[] = [];
  const certificationsToRecommend: CertificationRecommendation[] = [];
  const projectsToRecommend: ProjectRecommendation[] = [];
  const studyNotesToRecommend: StudyNoteRecommendation[] = [];
  const interviewPrepToRecommend: InterviewPrepRecommendation[] = [];
  const practiceToRecommend: PracticeRecommendation[] = [];
  
  // Sort sections by score (weakest first)
  const sortedSections = [...sectionScores].sort((a, b) => a.percentage - b.percentage);
  
  sortedSections.forEach((section, _index) => {
    const priority: 'critical' | 'important' | 'enhancement' = 
      section.status === 'weakness' ? 'critical' :
      section.status === 'moderate' ? 'important' : 'enhancement';
      
    // Add courses
    const courses = courseDatabase[section.name] || [];
    courses.forEach(course => {
      coursesToRecommend.push({
        ...course,
        priority,
        whyRecommended: `Your ${section.name} score is ${section.percentage}%. ${
          section.status === 'weakness' 
            ? 'This is a critical area that needs immediate attention.' 
            : 'Improving this will strengthen your overall profile.'
        }`,
        skillArea: section.name
      });
    });
    
    // Add YouTube playlists
    const youtubes = youtubeDatabase[section.name] || [];
    youtubes.forEach(yt => {
      youtubesToRecommend.push({
        ...yt,
        priority,
        whyRecommended: `Free video resources to improve your ${section.name} from ${section.percentage}% to 80%+.`,
        skillArea: section.name
      });
    });
    
    // Add certifications for weak/moderate areas
    if (section.status !== 'strength') {
      const certs = certificationDatabase[section.name] || [];
      certs.forEach(cert => {
        certificationsToRecommend.push({
          ...cert,
          priority,
          whyRecommended: `This certification will validate your ${section.name} skills and boost your resume score by ${cert.resumeImpact}%.`,
          skillArea: section.name
        });
      });
    }
    
    // Add projects
    const projects = projectDatabase[section.name] || [];
    projects.forEach(proj => {
      projectsToRecommend.push({
        ...proj,
        priority,
        whyRecommended: `Building this project will give you hands-on experience in ${section.name} and is a great portfolio addition.`,
        skillArea: section.name
      });
    });

    // Add study notes
    const notes = studyNoteDatabase[section.name] || [];
    notes.forEach(note => {
      studyNotesToRecommend.push({ ...note, priority });
    });

    // Add interview prep
    const interviewPrep = interviewPrepDatabase[section.name] || [];
    interviewPrep.forEach(item => {
      interviewPrepToRecommend.push({ ...item, priority });
    });

    // Add practice
    const practice = practiceDatabase[section.name] || [];
    practice.forEach(item => {
      practiceToRecommend.push({ ...item, priority });
    });
  });
  
  // Sort by priority
  const priorityOrder = { critical: 0, important: 1, enhancement: 2 };
  coursesToRecommend.sort((a, b) => priorityOrder[a.priority || 'enhancement'] - priorityOrder[b.priority || 'enhancement']);
  youtubesToRecommend.sort((a, b) => priorityOrder[a.priority || 'enhancement'] - priorityOrder[b.priority || 'enhancement']);
  certificationsToRecommend.sort((a, b) => priorityOrder[a.priority || 'enhancement'] - priorityOrder[b.priority || 'enhancement']);
  projectsToRecommend.sort((a, b) => priorityOrder[a.priority || 'enhancement'] - priorityOrder[b.priority || 'enhancement']);
  
  // Generate improvement prediction
  const improvementPrediction = generateImprovementPrediction(sectionScores, {
    courses: Math.min(coursesToRecommend.length, 3),
    youtube: Math.min(youtubesToRecommend.length, 4),
    certifications: Math.min(certificationsToRecommend.length, 2),
    projects: Math.min(projectsToRecommend.length, 2)
  });
  
  return {
    sectionScores,
    analysis,
    recommendations: {
      courses: coursesToRecommend.slice(0, 12),
      youtube: youtubesToRecommend.slice(0, 12),
      certifications: certificationsToRecommend.slice(0, 6),
      projects: projectsToRecommend.slice(0, 6),
      studyNotes: studyNotesToRecommend.slice(0, 6),
      interviewPrep: interviewPrepToRecommend.slice(0, 6),
      practice: practiceToRecommend.slice(0, 6)
    },
    learningPath: {
      title: `${targetRole} Mastery Roadmap`,
      description: `A personalized learning path to help you become a ${targetRole}.`,
      total_weeks: 8,
      phases: [
        {
          phase: 'Phase 1: Foundation Building',
          weeks: 'Week 1-2',
          focus: sortedSections.slice(0, 2).map(s => s.name),
          milestone: 'Complete fundamental concepts and 2 basic projects',
          tasks: [
            'Complete the critical priority courses',
            'Watch YouTube playlists for conceptual clarity',
            'Establish a daily practice routine'
          ]
        },
        {
          phase: 'Phase 2: Deep Dive',
          weeks: 'Week 3-4',
          focus: sortedSections.slice(1, 3).map(s => s.name),
          milestone: 'Intermediate mastery and portfolio project',
          tasks: [
            'Complete intermediate courses',
            'Start a medium-scale project',
            'Begin certification preparation'
          ]
        },
        {
          phase: 'Phase 3: Advanced Topics',
          weeks: 'Week 5-6',
          focus: ['System Design', 'Advanced ' + targetRole + ' concepts'],
          milestone: 'Advanced project completion',
          tasks: [
            'Master system design fundamentals',
            'Contribute to open source or build advanced project',
            'Take mock assessments'
          ]
        },
        {
          phase: 'Phase 4: Interview Ready',
          weeks: 'Week 7-8',
          focus: ['Interview Prep', 'Soft Skills'],
          milestone: 'Job readiness and confidence boost',
          tasks: [
            'Practice coding interviews',
            'Refine resume with new projects/certs',
            'Conduct mock interviews with peers'
          ]
        }
      ],
      weekly_commitment: '15-20 hours',
      readiness_goal: 'Industry-ready Professional'
    },
    improvementPrediction,
    generatedAt: new Date().toISOString()
  };
}

// Get priority color
export function getPriorityColor(priority: 'critical' | 'important' | 'enhancement'): string {
  switch (priority) {
    case 'critical': return 'bg-red-500';
    case 'important': return 'bg-orange-500';
    case 'enhancement': return 'bg-green-500';
  }
}

// Get priority text color
export function getPriorityTextColor(priority: 'critical' | 'important' | 'enhancement'): string {
  switch (priority) {
    case 'critical': return 'text-red-400';
    case 'important': return 'text-orange-400';
    case 'enhancement': return 'text-green-400';
  }
}

// Get priority background
export function getPriorityBg(priority: 'critical' | 'important' | 'enhancement'): string {
  switch (priority) {
    case 'critical': return 'bg-red-500/10 border-red-500/30';
    case 'important': return 'bg-orange-500/10 border-orange-500/30';
    case 'enhancement': return 'bg-green-500/10 border-green-500/30';
  }
}
