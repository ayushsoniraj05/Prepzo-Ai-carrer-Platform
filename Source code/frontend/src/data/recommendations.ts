// AI-Based Recommendation System
// Comprehensive learning resources based on skill gaps

export interface YouTubePlaylist {
  id: string;
  title: string;
  channel: string;
  thumbnail: string;
  videoCount: number;
  duration: string;
  url: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  rating: number;
  views: string;
  description: string;
}

export interface Course {
  id: string;
  title: string;
  provider: string;
  thumbnail: string;
  duration: string;
  url: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  rating: number;
  students: string;
  price: string;
  description: string;
  skills: string[];
  certificate: boolean;
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  estimatedTime: string;
  resources: {
    type: 'video' | 'course' | 'article' | 'practice';
    title: string;
    url: string;
    duration: string;
  }[];
}

// Comprehensive YouTube Playlists Database
export const youtubePlaylistsDB: Record<string, YouTubePlaylist[]> = {
  'Programming Fundamentals': [
    {
      id: 'pf-1',
      title: 'Complete Programming Fundamentals Course',
      channel: 'freeCodeCamp',
      thumbnail: 'https://img.youtube.com/vi/zOjov-2OZ0E/maxresdefault.jpg',
      videoCount: 1,
      duration: '5h 30m',
      url: 'https://www.youtube.com/watch?v=zOjov-2OZ0E',
      difficulty: 'beginner',
      rating: 4.9,
      views: '15M+',
      description: 'Learn programming fundamentals with this comprehensive course covering variables, loops, functions, and more.'
    },
    {
      id: 'pf-2',
      title: 'Programming Logic & Syntax Mastery',
      channel: 'Telusko',
      thumbnail: 'https://img.youtube.com/vi/WPqXP_kLzpo/maxresdefault.jpg',
      videoCount: 135,
      duration: '12h',
      url: 'https://www.youtube.com/playlist?list=PLsyeobzWxl7poL9JTVyndKe62ieoN-MZ3',
      difficulty: 'beginner',
      rating: 4.7,
      views: '8M+',
      description: 'Master programming logic with Python - perfect for absolute beginners.'
    },
    {
      id: 'pf-3',
      title: 'CS50 Introduction to Computer Science',
      channel: 'CS50',
      thumbnail: 'https://img.youtube.com/vi/8mAITcNt710/maxresdefault.jpg',
      videoCount: 25,
      duration: '40h',
      url: 'https://www.youtube.com/playlist?list=PLhQjrBD2T3817j24-GogXmWqO5Q5vYy0V',
      difficulty: 'beginner',
      rating: 4.9,
      views: '20M+',
      description: 'Harvard\'s legendary CS50 course - the best introduction to computer science.'
    }
  ],
  'Data Structures': [
    {
      id: 'ds-1',
      title: 'Data Structures Full Course',
      channel: 'freeCodeCamp',
      thumbnail: 'https://img.youtube.com/vi/RBSGKlAvoiM/maxresdefault.jpg',
      videoCount: 1,
      duration: '8h',
      url: 'https://www.youtube.com/watch?v=RBSGKlAvoiM',
      difficulty: 'intermediate',
      rating: 4.8,
      views: '12M+',
      description: 'Complete data structures course covering arrays, linked lists, trees, graphs, and more.'
    },
    {
      id: 'ds-2',
      title: 'Data Structures & Algorithms in Java',
      channel: 'Kunal Kushwaha',
      thumbnail: 'https://img.youtube.com/vi/rZ41y93P2Qo/maxresdefault.jpg',
      videoCount: 60,
      duration: '50h',
      url: 'https://www.youtube.com/playlist?list=PL9gnSGHSqcnr_DxHsP7AW9ftq0AtAyYqJ',
      difficulty: 'intermediate',
      rating: 4.9,
      views: '5M+',
      description: 'Comprehensive DSA playlist by Kunal Kushwaha - perfect for interview prep.'
    },
    {
      id: 'ds-3',
      title: 'Abdul Bari - Algorithms',
      channel: 'Abdul Bari',
      thumbnail: 'https://img.youtube.com/vi/0IAPZzGSbME/maxresdefault.jpg',
      videoCount: 82,
      duration: '25h',
      url: 'https://www.youtube.com/playlist?list=PLDN4rrl48XKpZkf03iYFl-O29szjTrs_O',
      difficulty: 'intermediate',
      rating: 4.9,
      views: '10M+',
      description: 'Best algorithms playlist with clear animations and explanations.'
    },
    {
      id: 'ds-4',
      title: 'Striver\'s A2Z DSA Course',
      channel: 'take U forward',
      thumbnail: 'https://img.youtube.com/vi/0bHoB32fuj0/maxresdefault.jpg',
      videoCount: 200,
      duration: '100h+',
      url: 'https://www.youtube.com/playlist?list=PLgUwDviBIf0oF6QL8m22w1hIDC1vJ_BTs',
      difficulty: 'advanced',
      rating: 4.9,
      views: '15M+',
      description: 'The most comprehensive DSA playlist for FAANG interview preparation.'
    }
  ],
  'Algorithms': [
    {
      id: 'algo-1',
      title: 'Algorithms Full Course',
      channel: 'freeCodeCamp',
      thumbnail: 'https://img.youtube.com/vi/8hly31xKli0/maxresdefault.jpg',
      videoCount: 1,
      duration: '5h',
      url: 'https://www.youtube.com/watch?v=8hly31xKli0',
      difficulty: 'intermediate',
      rating: 4.8,
      views: '8M+',
      description: 'Learn all major algorithms - sorting, searching, dynamic programming, graphs.'
    },
    {
      id: 'algo-2',
      title: 'Dynamic Programming Patterns',
      channel: 'Aditya Verma',
      thumbnail: 'https://img.youtube.com/vi/nqowUJzG-iM/maxresdefault.jpg',
      videoCount: 52,
      duration: '20h',
      url: 'https://www.youtube.com/playlist?list=PL_z_8CaSLPWekqhdCPmFohncHwz8TY2Go',
      difficulty: 'advanced',
      rating: 4.9,
      views: '6M+',
      description: 'Master dynamic programming with pattern-based approach. Best DP playlist on YouTube.'
    },
    {
      id: 'algo-3',
      title: 'Graph Theory Algorithms',
      channel: 'William Fiset',
      thumbnail: 'https://img.youtube.com/vi/DgXR2OWQnLc/maxresdefault.jpg',
      videoCount: 35,
      duration: '15h',
      url: 'https://www.youtube.com/playlist?list=PLDV1Zeh2NRsDGO4--qE8yH72HFL1Km93P',
      difficulty: 'advanced',
      rating: 4.9,
      views: '3M+',
      description: 'Complete graph algorithms course with code implementations.'
    }
  ],
  'OOP Concepts': [
    {
      id: 'oop-1',
      title: 'Object Oriented Programming Complete Course',
      channel: 'Kunal Kushwaha',
      thumbnail: 'https://img.youtube.com/vi/BSVKUk58K6U/maxresdefault.jpg',
      videoCount: 4,
      duration: '8h',
      url: 'https://www.youtube.com/playlist?list=PL9gnSGHSqcno1G3XjUbwzXHL8_EttOuKk',
      difficulty: 'beginner',
      rating: 4.8,
      views: '2M+',
      description: 'Master OOP concepts with Java - classes, inheritance, polymorphism, abstraction.'
    },
    {
      id: 'oop-2',
      title: 'OOP in Python - Full Course',
      channel: 'Tech With Tim',
      thumbnail: 'https://img.youtube.com/vi/JeznW_7DlB0/maxresdefault.jpg',
      videoCount: 1,
      duration: '2h',
      url: 'https://www.youtube.com/watch?v=JeznW_7DlB0',
      difficulty: 'beginner',
      rating: 4.7,
      views: '1.5M+',
      description: 'Learn object-oriented programming with Python from scratch.'
    },
    {
      id: 'oop-3',
      title: 'Design Patterns in OOP',
      channel: 'Derek Banas',
      thumbnail: 'https://img.youtube.com/vi/vNHpsC5ng_E/maxresdefault.jpg',
      videoCount: 25,
      duration: '10h',
      url: 'https://www.youtube.com/playlist?list=PLF206E906175C7E07',
      difficulty: 'advanced',
      rating: 4.6,
      views: '2M+',
      description: 'All 23 Gang of Four design patterns explained with examples.'
    }
  ],
  'Database & SQL': [
    {
      id: 'db-1',
      title: 'SQL Tutorial - Full Database Course',
      channel: 'freeCodeCamp',
      thumbnail: 'https://img.youtube.com/vi/HXV3zeQKqGY/maxresdefault.jpg',
      videoCount: 1,
      duration: '4h',
      url: 'https://www.youtube.com/watch?v=HXV3zeQKqGY',
      difficulty: 'beginner',
      rating: 4.9,
      views: '18M+',
      description: 'Complete SQL course for beginners - the most popular SQL tutorial on YouTube.'
    },
    {
      id: 'db-2',
      title: 'Database Design Course',
      channel: 'freeCodeCamp',
      thumbnail: 'https://img.youtube.com/vi/ztHopE5Wnpc/maxresdefault.jpg',
      videoCount: 1,
      duration: '8h',
      url: 'https://www.youtube.com/watch?v=ztHopE5Wnpc',
      difficulty: 'intermediate',
      rating: 4.8,
      views: '5M+',
      description: 'Learn database design, normalization, ER diagrams, and SQL best practices.'
    },
    {
      id: 'db-3',
      title: 'MongoDB Complete Course',
      channel: 'Traversy Media',
      thumbnail: 'https://img.youtube.com/vi/-56x56UppqQ/maxresdefault.jpg',
      videoCount: 1,
      duration: '2h',
      url: 'https://www.youtube.com/watch?v=-56x56UppqQ',
      difficulty: 'intermediate',
      rating: 4.7,
      views: '2M+',
      description: 'Learn MongoDB NoSQL database from scratch with practical examples.'
    },
    {
      id: 'db-4',
      title: 'PostgreSQL Tutorial',
      channel: 'Amigoscode',
      thumbnail: 'https://img.youtube.com/vi/qw--VYLpxG4/maxresdefault.jpg',
      videoCount: 1,
      duration: '3h',
      url: 'https://www.youtube.com/watch?v=qw--VYLpxG4',
      difficulty: 'intermediate',
      rating: 4.8,
      views: '3M+',
      description: 'Full PostgreSQL tutorial for backend developers.'
    }
  ],
  'Operating Systems': [
    {
      id: 'os-1',
      title: 'Operating Systems - Neso Academy',
      channel: 'Neso Academy',
      thumbnail: 'https://img.youtube.com/vi/vBURTt97EkA/maxresdefault.jpg',
      videoCount: 100,
      duration: '20h',
      url: 'https://www.youtube.com/playlist?list=PLBlnK6fEyqRiVhbXDGLXDk_OQAeuVcp2O',
      difficulty: 'intermediate',
      rating: 4.8,
      views: '8M+',
      description: 'Complete OS course covering processes, memory management, file systems.'
    },
    {
      id: 'os-2',
      title: 'Operating Systems - Gate Smashers',
      channel: 'Gate Smashers',
      thumbnail: 'https://img.youtube.com/vi/bkSWJJZNgf8/maxresdefault.jpg',
      videoCount: 75,
      duration: '15h',
      url: 'https://www.youtube.com/playlist?list=PLxCzCOWd7aiGz9donHRrE9I3Mwn6XdP8p',
      difficulty: 'intermediate',
      rating: 4.7,
      views: '10M+',
      description: 'OS concepts explained simply - perfect for GATE and interviews.'
    }
  ],
  'Computer Networks': [
    {
      id: 'cn-1',
      title: 'Computer Networks Full Course',
      channel: 'Gate Smashers',
      thumbnail: 'https://img.youtube.com/vi/JFF2vJaN0Cw/maxresdefault.jpg',
      videoCount: 80,
      duration: '18h',
      url: 'https://www.youtube.com/playlist?list=PLxCzCOWd7aiGFBD2-2joCpWOLUrDLvVV_',
      difficulty: 'intermediate',
      rating: 4.8,
      views: '12M+',
      description: 'Complete networking course - OSI model, TCP/IP, routing, protocols.'
    },
    {
      id: 'cn-2',
      title: 'Networking Fundamentals',
      channel: 'Network Chuck',
      thumbnail: 'https://img.youtube.com/vi/qiQR5rTSshw/maxresdefault.jpg',
      videoCount: 23,
      duration: '8h',
      url: 'https://www.youtube.com/playlist?list=PLIhvC56v63IJVXv0GJcl9vO5Z6znCVb1P',
      difficulty: 'beginner',
      rating: 4.9,
      views: '5M+',
      description: 'Fun and practical networking course with hands-on labs.'
    }
  ],
  'System Design': [
    {
      id: 'sd-1',
      title: 'System Design Primer',
      channel: 'Gaurav Sen',
      thumbnail: 'https://img.youtube.com/vi/xpDnVSmNFX0/maxresdefault.jpg',
      videoCount: 45,
      duration: '15h',
      url: 'https://www.youtube.com/playlist?list=PLMCXHnjXnTnvo6alSjVkgxV-VH6EPyvoX',
      difficulty: 'advanced',
      rating: 4.9,
      views: '8M+',
      description: 'The best system design playlist - scalability, databases, caching explained.'
    },
    {
      id: 'sd-2',
      title: 'System Design for Beginners',
      channel: 'ByteByteGo',
      thumbnail: 'https://img.youtube.com/vi/i53Gi_K3o7I/maxresdefault.jpg',
      videoCount: 30,
      duration: '10h',
      url: 'https://www.youtube.com/@ByteByteGo/videos',
      difficulty: 'intermediate',
      rating: 4.9,
      views: '15M+',
      description: 'Visual system design explanations with beautiful animations.'
    },
    {
      id: 'sd-3',
      title: 'Distributed Systems',
      channel: 'MIT OpenCourseWare',
      thumbnail: 'https://img.youtube.com/vi/cQP8WApzIQQ/maxresdefault.jpg',
      videoCount: 20,
      duration: '30h',
      url: 'https://www.youtube.com/playlist?list=PLrw6a1wE39_tb2fErI4-WkMbsvGQk9_UB',
      difficulty: 'advanced',
      rating: 4.8,
      views: '3M+',
      description: 'MIT\'s famous distributed systems course - deep dive into system design.'
    }
  ],
  'Web Development': [
    {
      id: 'web-1',
      title: 'Full Stack Web Development Course',
      channel: 'freeCodeCamp',
      thumbnail: 'https://img.youtube.com/vi/nu_pCVPKzTk/maxresdefault.jpg',
      videoCount: 1,
      duration: '12h',
      url: 'https://www.youtube.com/watch?v=nu_pCVPKzTk',
      difficulty: 'beginner',
      rating: 4.8,
      views: '10M+',
      description: 'Complete full stack course - HTML, CSS, JavaScript, React, Node.js.'
    },
    {
      id: 'web-2',
      title: 'React JS Complete Course',
      channel: 'Codevolution',
      thumbnail: 'https://img.youtube.com/vi/QFaFIcGhPoM/maxresdefault.jpg',
      videoCount: 91,
      duration: '15h',
      url: 'https://www.youtube.com/playlist?list=PLC3y8-rFHvwgg3vaYJgHGnModB54rxOk3',
      difficulty: 'intermediate',
      rating: 4.8,
      views: '6M+',
      description: 'Master React.js from basics to advanced concepts.'
    },
    {
      id: 'web-3',
      title: 'Node.js & Express Full Course',
      channel: 'Traversy Media',
      thumbnail: 'https://img.youtube.com/vi/Oe421EPjeBE/maxresdefault.jpg',
      videoCount: 1,
      duration: '8h',
      url: 'https://www.youtube.com/watch?v=Oe421EPjeBE',
      difficulty: 'intermediate',
      rating: 4.8,
      views: '4M+',
      description: 'Build REST APIs with Node.js and Express from scratch.'
    }
  ],
  'Machine Learning': [
    {
      id: 'ml-1',
      title: 'Machine Learning Full Course',
      channel: 'freeCodeCamp',
      thumbnail: 'https://img.youtube.com/vi/NWONeJKn6kc/maxresdefault.jpg',
      videoCount: 1,
      duration: '10h',
      url: 'https://www.youtube.com/watch?v=NWONeJKn6kc',
      difficulty: 'intermediate',
      rating: 4.8,
      views: '5M+',
      description: 'Complete ML course with Python - algorithms, models, deep learning.'
    },
    {
      id: 'ml-2',
      title: 'Machine Learning by Andrew Ng',
      channel: 'Stanford Online',
      thumbnail: 'https://img.youtube.com/vi/jGwO_UgTS7I/maxresdefault.jpg',
      videoCount: 20,
      duration: '30h',
      url: 'https://www.youtube.com/playlist?list=PLLssT5z_DsK-h9vYZkQkYNWcItqhlRJLN',
      difficulty: 'intermediate',
      rating: 4.9,
      views: '20M+',
      description: 'The legendary ML course by Andrew Ng from Stanford.'
    },
    {
      id: 'ml-3',
      title: 'Deep Learning Specialization',
      channel: 'DeepLearning.AI',
      thumbnail: 'https://img.youtube.com/vi/CS4cs9xVecg/maxresdefault.jpg',
      videoCount: 50,
      duration: '40h',
      url: 'https://www.youtube.com/playlist?list=PLkDaE6sCZn6Ec-XTbcX1uRg2_u4xOEky0',
      difficulty: 'advanced',
      rating: 4.9,
      views: '10M+',
      description: 'Complete deep learning course by Andrew Ng - neural networks, CNNs, RNNs.'
    }
  ],
  'Aptitude & Reasoning': [
    {
      id: 'apt-1',
      title: 'Aptitude Complete Course',
      channel: 'CareerRide',
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      videoCount: 50,
      duration: '15h',
      url: 'https://www.youtube.com/playlist?list=PL0s3O6GgLL5dGjBcqOwp7xLp5VVjv8vSj',
      difficulty: 'beginner',
      rating: 4.6,
      views: '3M+',
      description: 'Master quantitative aptitude for placements and competitive exams.'
    },
    {
      id: 'apt-2',
      title: 'Logical Reasoning - Complete Course',
      channel: 'Study IQ',
      thumbnail: 'https://img.youtube.com/vi/xYQkI0Umkm4/maxresdefault.jpg',
      videoCount: 40,
      duration: '12h',
      url: 'https://www.youtube.com/playlist?list=PLgUAGTAghjXmhbskXv9z2HqE8HMD6yZqP',
      difficulty: 'beginner',
      rating: 4.7,
      views: '2M+',
      description: 'Complete logical reasoning course for placements and aptitude tests.'
    }
  ]
};

// Comprehensive Courses Database
export const coursesDB: Record<string, Course[]> = {
  'Programming Fundamentals': [
    {
      id: 'c-pf-1',
      title: 'Python for Everybody Specialization',
      provider: 'Coursera',
      thumbnail: 'https://d3njjcbhbojbot.cloudfront.net/api/utilities/v1/imageproxy/https://coursera-course-photos.s3.amazonaws.com/83/e258e0532611e5a5072321239ff4d4/python_for_everybody_newbrand.png',
      duration: '8 months',
      url: 'https://www.coursera.org/specializations/python',
      difficulty: 'beginner',
      rating: 4.8,
      students: '3M+',
      price: 'Free Audit',
      description: 'Learn Python programming from University of Michigan. Start from scratch.',
      skills: ['Python', 'Programming', 'Data Structures', 'Web Scraping'],
      certificate: true
    },
    {
      id: 'c-pf-2',
      title: 'CS50: Introduction to Computer Science',
      provider: 'edX',
      thumbnail: 'https://prod-discovery.edx-cdn.org/media/course/image/da1b2400-322b-459b-97b0-0c557f05d017-a3d1899c3344.small.jpg',
      duration: '12 weeks',
      url: 'https://www.edx.org/course/cs50s-introduction-to-computer-science',
      difficulty: 'beginner',
      rating: 4.9,
      students: '4M+',
      price: 'Free',
      description: 'Harvard\'s legendary introduction to computer science and programming.',
      skills: ['C', 'Python', 'SQL', 'JavaScript', 'HTML', 'CSS'],
      certificate: true
    }
  ],
  'Data Structures': [
    {
      id: 'c-ds-1',
      title: 'Data Structures and Algorithms Specialization',
      provider: 'Coursera',
      thumbnail: 'https://d3njjcbhbojbot.cloudfront.net/api/utilities/v1/imageproxy/https://coursera-course-photos.s3.amazonaws.com/fb/434400d9ac11e5b195f7f5a63a3717/logo.png',
      duration: '6 months',
      url: 'https://www.coursera.org/specializations/data-structures-algorithms',
      difficulty: 'intermediate',
      rating: 4.6,
      students: '500K+',
      price: '₹3,226/month',
      description: 'Master algorithmic techniques for solving problems from UC San Diego.',
      skills: ['DSA', 'Graph Algorithms', 'Dynamic Programming', 'NP-Complete'],
      certificate: true
    },
    {
      id: 'c-ds-2',
      title: 'Master the Coding Interview: DSA + Big O',
      provider: 'Udemy',
      thumbnail: 'https://img-c.udemycdn.com/course/240x135/1917546_4df3.jpg',
      duration: '20 hours',
      url: 'https://www.udemy.com/course/master-the-coding-interview-data-structures-algorithms/',
      difficulty: 'intermediate',
      rating: 4.7,
      students: '200K+',
      price: '₹449',
      description: 'Complete interview preparation with focus on FAANG companies.',
      skills: ['Big O', 'Arrays', 'Trees', 'Graphs', 'Dynamic Programming'],
      certificate: true
    },
    {
      id: 'c-ds-3',
      title: 'Strivers A2Z DSA Course/Sheet',
      provider: 'take U forward',
      thumbnail: 'https://takeuforward.org/static/media/logo.13aadb72.png',
      duration: 'Self-paced',
      url: 'https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2/',
      difficulty: 'advanced',
      rating: 4.9,
      students: '1M+',
      price: 'Free',
      description: 'The most comprehensive DSA sheet for FAANG preparation.',
      skills: ['Arrays', 'LinkedList', 'Trees', 'Graphs', 'DP', 'Bit Manipulation'],
      certificate: false
    }
  ],
  'Algorithms': [
    {
      id: 'c-algo-1',
      title: 'Algorithms, Part I & II',
      provider: 'Coursera',
      thumbnail: 'https://d3njjcbhbojbot.cloudfront.net/api/utilities/v1/imageproxy/https://coursera-course-photos.s3.amazonaws.com/19/e7d9508a0f11e8ad2acf8a52dcebb8/algorithms-part1.png',
      duration: '12 weeks',
      url: 'https://www.coursera.org/learn/algorithms-part1',
      difficulty: 'intermediate',
      rating: 4.9,
      students: '800K+',
      price: 'Free Audit',
      description: 'Princeton\'s algorithms course - covers sorting, searching, graph algorithms.',
      skills: ['Sorting', 'Searching', 'Graph Algorithms', 'String Processing'],
      certificate: true
    },
    {
      id: 'c-algo-2',
      title: 'Dynamic Programming (Aditya Verma)',
      provider: 'YouTube/Notes',
      thumbnail: 'https://img.youtube.com/vi/nqowUJzG-iM/maxresdefault.jpg',
      duration: '20 hours',
      url: 'https://www.youtube.com/playlist?list=PL_z_8CaSLPWekqhdCPmFohncHwz8TY2Go',
      difficulty: 'advanced',
      rating: 4.9,
      students: '1M+',
      price: 'Free',
      description: 'Best DP playlist with pattern-based approach. Must for interviews.',
      skills: ['0/1 Knapsack', 'Unbounded Knapsack', 'LCS', 'MCM', 'DP on Trees'],
      certificate: false
    }
  ],
  'OOP Concepts': [
    {
      id: 'c-oop-1',
      title: 'Object Oriented Programming in Java',
      provider: 'Coursera',
      thumbnail: 'https://d3njjcbhbojbot.cloudfront.net/api/utilities/v1/imageproxy/https://coursera-course-photos.s3.amazonaws.com/51/e31b80b83011e8869f9dfa8c47d8c1/Introduction.gif',
      duration: '6 weeks',
      url: 'https://www.coursera.org/learn/object-oriented-java',
      difficulty: 'beginner',
      rating: 4.6,
      students: '150K+',
      price: 'Free Audit',
      description: 'Learn OOP principles with Java from Duke University.',
      skills: ['Classes', 'Inheritance', 'Polymorphism', 'Encapsulation'],
      certificate: true
    },
    {
      id: 'c-oop-2',
      title: 'Design Patterns in Java',
      provider: 'Udemy',
      thumbnail: 'https://img-c.udemycdn.com/course/240x135/1132422_2be0_6.jpg',
      duration: '11 hours',
      url: 'https://www.udemy.com/course/design-patterns-java/',
      difficulty: 'advanced',
      rating: 4.6,
      students: '80K+',
      price: '₹449',
      description: 'All 23 GoF design patterns with real-world examples.',
      skills: ['Creational Patterns', 'Structural Patterns', 'Behavioral Patterns'],
      certificate: true
    }
  ],
  'Database & SQL': [
    {
      id: 'c-db-1',
      title: 'SQL for Data Science',
      provider: 'Coursera',
      thumbnail: 'https://d3njjcbhbojbot.cloudfront.net/api/utilities/v1/imageproxy/https://coursera-course-photos.s3.amazonaws.com/a5/4e0ef04b7811e9a8c6bb11f3b5c3d0/Slide1.png',
      duration: '4 weeks',
      url: 'https://www.coursera.org/learn/sql-for-data-science',
      difficulty: 'beginner',
      rating: 4.6,
      students: '500K+',
      price: 'Free Audit',
      description: 'Master SQL for data analysis from UC Davis.',
      skills: ['SQL', 'Data Analysis', 'Subqueries', 'Joins'],
      certificate: true
    },
    {
      id: 'c-db-2',
      title: 'The Complete SQL Bootcamp',
      provider: 'Udemy',
      thumbnail: 'https://img-c.udemycdn.com/course/240x135/762616_7693_3.jpg',
      duration: '9 hours',
      url: 'https://www.udemy.com/course/the-complete-sql-bootcamp/',
      difficulty: 'beginner',
      rating: 4.7,
      students: '700K+',
      price: '₹449',
      description: 'Become an expert at SQL with PostgreSQL.',
      skills: ['PostgreSQL', 'Queries', 'Joins', 'Aggregations'],
      certificate: true
    },
    {
      id: 'c-db-3',
      title: 'MongoDB - The Complete Developer\'s Guide',
      provider: 'Udemy',
      thumbnail: 'https://img-c.udemycdn.com/course/240x135/1906852_93c6_2.jpg',
      duration: '17 hours',
      url: 'https://www.udemy.com/course/mongodb-the-complete-developers-guide/',
      difficulty: 'intermediate',
      rating: 4.7,
      students: '150K+',
      price: '₹449',
      description: 'Master MongoDB from basics to advanced aggregations.',
      skills: ['MongoDB', 'NoSQL', 'Aggregation', 'Indexing'],
      certificate: true
    }
  ],
  'Operating Systems': [
    {
      id: 'c-os-1',
      title: 'Operating Systems: Three Easy Pieces',
      provider: 'OSTEP',
      thumbnail: 'https://pages.cs.wisc.edu/~remzi/OSTEP/book-cover-two.jpg',
      duration: 'Self-paced',
      url: 'https://pages.cs.wisc.edu/~remzi/OSTEP/',
      difficulty: 'intermediate',
      rating: 4.9,
      students: '500K+',
      price: 'Free',
      description: 'The best free OS textbook - virtualization, concurrency, persistence.',
      skills: ['Processes', 'Memory Management', 'File Systems', 'Concurrency'],
      certificate: false
    },
    {
      id: 'c-os-2',
      title: 'Introduction to Operating Systems',
      provider: 'Udacity',
      thumbnail: 'https://www.udacity.com/www-proxy/contentful/assets/2y9b3o528xhq/4QBnNKJnUkIS8wCKSQi8oI/32f5eb23c4b0c08a0e53b7d9c5d5c5d7/OS_Course_Card.jpg',
      duration: '8 weeks',
      url: 'https://www.udacity.com/course/introduction-to-operating-systems--ud923',
      difficulty: 'intermediate',
      rating: 4.5,
      students: '100K+',
      price: 'Free',
      description: 'Learn OS concepts from Georgia Tech.',
      skills: ['Threads', 'Synchronization', 'Memory', 'Scheduling'],
      certificate: false
    }
  ],
  'Computer Networks': [
    {
      id: 'c-cn-1',
      title: 'The Bits and Bytes of Computer Networking',
      provider: 'Coursera',
      thumbnail: 'https://d3njjcbhbojbot.cloudfront.net/api/utilities/v1/imageproxy/https://coursera-course-photos.s3.amazonaws.com/29/89db70d92611e7a0c7b5f1a1b84a27/Bits-and-Bytes-Icon.png',
      duration: '6 weeks',
      url: 'https://www.coursera.org/learn/computer-networking',
      difficulty: 'beginner',
      rating: 4.7,
      students: '300K+',
      price: 'Free Audit',
      description: 'Google\'s networking fundamentals course. Part of IT Support Certificate.',
      skills: ['TCP/IP', 'DNS', 'DHCP', 'Routing', 'Troubleshooting'],
      certificate: true
    },
    {
      id: 'c-cn-2',
      title: 'Computer Networking Full Course',
      provider: 'Udemy',
      thumbnail: 'https://img-c.udemycdn.com/course/240x135/1954568_ff53_2.jpg',
      duration: '15 hours',
      url: 'https://www.udemy.com/course/complete-networking-fundamentals-course-ccna-start/',
      difficulty: 'beginner',
      rating: 4.6,
      students: '200K+',
      price: '₹449',
      description: 'Complete networking course - CCNA level preparation.',
      skills: ['OSI Model', 'TCP/IP', 'Subnetting', 'Routing'],
      certificate: true
    }
  ],
  'System Design': [
    {
      id: 'c-sd-1',
      title: 'Grokking the System Design Interview',
      provider: 'Educative',
      thumbnail: 'https://www.educative.io/cdn-cgi/image/f=auto,fit=cover,w=600/v2api/collection/5668639101419520/5649050225344512/image/5630903070621696',
      duration: '25 hours',
      url: 'https://www.educative.io/courses/grokking-the-system-design-interview',
      difficulty: 'advanced',
      rating: 4.8,
      students: '300K+',
      price: '₹3,999',
      description: 'The definitive system design interview preparation course.',
      skills: ['Scalability', 'Load Balancing', 'Caching', 'Database Design'],
      certificate: true
    },
    {
      id: 'c-sd-2',
      title: 'Designing Data-Intensive Applications',
      provider: 'Book',
      thumbnail: 'https://images-na.ssl-images-amazon.com/images/I/91Qx7uDfPML.jpg',
      duration: 'Self-paced',
      url: 'https://www.amazon.in/Designing-Data-Intensive-Applications-Reliable-Maintainable/dp/1449373321',
      difficulty: 'advanced',
      rating: 4.9,
      students: '200K+',
      price: '₹3,500',
      description: 'The bible of system design - by Martin Kleppmann.',
      skills: ['Distributed Systems', 'Replication', 'Partitioning', 'Transactions'],
      certificate: false
    }
  ],
  'Machine Learning': [
    {
      id: 'c-ml-1',
      title: 'Machine Learning Specialization',
      provider: 'Coursera',
      thumbnail: 'https://d3njjcbhbojbot.cloudfront.net/api/utilities/v1/imageproxy/https://coursera-course-photos.s3.amazonaws.com/bf/9b6fd0b3af11e8be17f3d3e4a7f10e/ML_Specialization_Banner.png',
      duration: '3 months',
      url: 'https://www.coursera.org/specializations/machine-learning-introduction',
      difficulty: 'intermediate',
      rating: 4.9,
      students: '1M+',
      price: '₹3,226/month',
      description: 'Andrew Ng\'s new ML specialization - the definitive ML course.',
      skills: ['Supervised Learning', 'Neural Networks', 'Decision Trees', 'Clustering'],
      certificate: true
    },
    {
      id: 'c-ml-2',
      title: 'Deep Learning Specialization',
      provider: 'Coursera',
      thumbnail: 'https://d3njjcbhbojbot.cloudfront.net/api/utilities/v1/imageproxy/https://coursera-course-photos.s3.amazonaws.com/00/0bb0305d7e11e8b3b99d6d3e6e5d45/CareerBanner_Coursera_6.png',
      duration: '5 months',
      url: 'https://www.coursera.org/specializations/deep-learning',
      difficulty: 'advanced',
      rating: 4.9,
      students: '800K+',
      price: '₹3,226/month',
      description: 'Master deep learning - neural networks, CNN, RNN, transformers.',
      skills: ['Neural Networks', 'CNN', 'RNN', 'TensorFlow', 'Optimization'],
      certificate: true
    }
  ],
  'Aptitude & Reasoning': [
    {
      id: 'c-apt-1',
      title: 'Quantitative Aptitude for Competitive Exams',
      provider: 'Udemy',
      thumbnail: 'https://img-c.udemycdn.com/course/240x135/1378130_4e21_3.jpg',
      duration: '12 hours',
      url: 'https://www.udemy.com/course/complete-quantitative-aptitude-for-competitive-exams/',
      difficulty: 'beginner',
      rating: 4.5,
      students: '50K+',
      price: '₹449',
      description: 'Master all aptitude topics for placements and competitive exams.',
      skills: ['Percentages', 'Profit & Loss', 'Time & Work', 'Probability'],
      certificate: true
    },
    {
      id: 'c-apt-2',
      title: 'Logical Reasoning Masterclass',
      provider: 'Unacademy',
      thumbnail: 'https://static.uniapply.com/images/unacademy.png',
      duration: 'Self-paced',
      url: 'https://unacademy.com/goal/cat-and-management-entrance-tests/KFMCT',
      difficulty: 'intermediate',
      rating: 4.6,
      students: '100K+',
      price: '₹2,999/month',
      description: 'Complete reasoning course for placements and management exams.',
      skills: ['Puzzles', 'Blood Relations', 'Coding-Decoding', 'Syllogisms'],
      certificate: false
    }
  ]
};

// AI Recommendation Engine
export interface Recommendation {
  type: 'youtube' | 'course';
  priority: 'critical' | 'high' | 'medium' | 'low';
  skillArea: string;
  score: number;
  resource: YouTubePlaylist | Course;
  reason: string;
}

// Get personalized recommendations based on test results
export function getAIRecommendations(
  testResults: {
    sectionResults: { name: string; score: number }[];
  } | null,
  _weaknesses: string[],
  _skillGaps: string[],
  targetRole: string
): Recommendation[] {
  if (!testResults) return [];

  const recommendations: Recommendation[] = [];
  const processedAreas = new Set<string>();

  // Sort sections by score (lowest first for priority)
  const sortedSections = [...testResults.sectionResults]
    .sort((a, b) => a.score - b.score);

  // Generate recommendations for each weak area
  sortedSections.forEach((section) => {
    const { name, score } = section;
    
    // Skip if already processed or score is good
    if (processedAreas.has(name)) return;
    processedAreas.add(name);

    // Determine priority based on score
    let priority: 'critical' | 'high' | 'medium' | 'low';
    if (score < 40) priority = 'critical';
    else if (score < 50) priority = 'high';
    else if (score < 60) priority = 'medium';
    else if (score < 70) priority = 'low';
    else return; // Score is good, no recommendation needed

    // Get YouTube playlists for this area
    const playlists = youtubePlaylistsDB[name] || [];
    const courses = coursesDB[name] || [];

    // Select appropriate difficulty based on score
    let targetDifficulty: 'beginner' | 'intermediate' | 'advanced';
    if (score < 40) targetDifficulty = 'beginner';
    else if (score < 60) targetDifficulty = 'intermediate';
    else targetDifficulty = 'advanced';

    // Add YouTube recommendations
    const relevantPlaylists = playlists
      .filter(p => p.difficulty === targetDifficulty || 
                   (score < 40 && p.difficulty === 'beginner') ||
                   (score < 50 && p.difficulty !== 'advanced'))
      .slice(0, 2);

    relevantPlaylists.forEach((playlist) => {
      recommendations.push({
        type: 'youtube',
        priority,
        skillArea: name,
        score,
        resource: playlist,
        reason: generateReason(name, score, 'youtube', targetRole)
      });
    });

    // Add Course recommendations
    const relevantCourses = courses
      .filter(c => c.difficulty === targetDifficulty || 
                   (score < 40 && c.difficulty === 'beginner') ||
                   (score < 50 && c.difficulty !== 'advanced'))
      .slice(0, 2);

    relevantCourses.forEach((course) => {
      recommendations.push({
        type: 'course',
        priority,
        skillArea: name,
        score,
        resource: course,
        reason: generateReason(name, score, 'course', targetRole)
      });
    });
  });

  // Sort by priority
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return recommendations;
}

function generateReason(
  skillArea: string, 
  score: number, 
  _type: 'youtube' | 'course',
  targetRole: string
): string {
  const reasons = {
    critical: [
      `Your ${skillArea} score of ${score}% needs immediate attention for ${targetRole} roles.`,
      `${skillArea} is fundamental for ${targetRole}. Strengthen your basics now.`,
      `With ${score}% in ${skillArea}, focusing here will significantly boost your placement readiness.`
    ],
    high: [
      `Improving ${skillArea} from ${score}% will greatly increase your job prospects.`,
      `${skillArea} is frequently tested in ${targetRole} interviews. Worth investing time.`,
      `A stronger ${skillArea} foundation will help in technical rounds.`
    ],
    medium: [
      `${skillArea} at ${score}% can be improved to stand out from other candidates.`,
      `Companies often test ${skillArea}. Getting to 70%+ will help.`,
      `A bit more practice in ${skillArea} will make you more confident.`
    ],
    low: [
      `Polish your ${skillArea} skills to go from good to great.`,
      `Fine-tuning ${skillArea} will give you an edge in competitive interviews.`
    ]
  };

  let priority: 'critical' | 'high' | 'medium' | 'low';
  if (score < 40) priority = 'critical';
  else if (score < 50) priority = 'high';
  else if (score < 60) priority = 'medium';
  else priority = 'low';

  const possibleReasons = reasons[priority];
  return possibleReasons[Math.floor(Math.random() * possibleReasons.length)];
}

// Get top recommendations summary
export function getTopRecommendations(recommendations: Recommendation[], limit: number = 6): Recommendation[] {
  // Get mix of youtube and courses
  const youtubeRecs = recommendations.filter(r => r.type === 'youtube').slice(0, Math.ceil(limit / 2));
  const courseRecs = recommendations.filter(r => r.type === 'course').slice(0, Math.floor(limit / 2));
  
  return [...youtubeRecs, ...courseRecs].slice(0, limit);
}

// Role to required skills mapping for profile-based recommendations
const roleSkillsMap: Record<string, string[]> = {
  'Software Engineer': ['Data Structures', 'Algorithms', 'System Design', 'Programming Fundamentals', 'Object Oriented Programming'],
  'Backend Developer': ['System Design', 'Database Management', 'Algorithms', 'Programming Fundamentals', 'Cloud Computing'],
  'Frontend Developer': ['Programming Fundamentals', 'Web Development', 'JavaScript', 'React', 'UI/UX Design'],
  'Full Stack Developer': ['Programming Fundamentals', 'Data Structures', 'System Design', 'Database Management', 'Web Development'],
  'Data Scientist': ['Python Programming', 'Machine Learning', 'Data Structures', 'Statistics', 'Deep Learning'],
  'Data Analyst': ['SQL', 'Statistics', 'Data Visualization', 'Python Programming', 'Business Analysis'],
  'DevOps Engineer': ['Cloud Computing', 'System Design', 'Linux Administration', 'CI/CD', 'Containerization'],
  'ML Engineer': ['Machine Learning', 'Deep Learning', 'Python Programming', 'Data Structures', 'System Design'],
  'Product Manager': ['Product Design', 'Business Analysis', 'Technical Communication', 'Analytics', 'Agile'],
  'QA Engineer': ['Testing Fundamentals', 'Automation', 'Programming Fundamentals', 'SQL', 'API Testing'],
};

// Get profile-based recommendations for users without test results
export function getProfileBasedRecommendations(
  targetRole: string,
  knownTechnologies: string[] = [],
  experience: 'fresher' | 'intermediate' | 'experienced' = 'fresher'
): Recommendation[] {
  const recommendations: Recommendation[] = [];
  
  // Get required skills for the target role
  const requiredSkills = roleSkillsMap[targetRole] || roleSkillsMap['Software Engineer'];
  
  // Determine what skills are gaps (not in known technologies)
  const knownLower = knownTechnologies.map(t => t.toLowerCase());
  const skillGaps = requiredSkills.filter(skill => 
    !knownLower.some(known => 
      skill.toLowerCase().includes(known) || known.includes(skill.toLowerCase())
    )
  );
  
  // All skills to recommend (gaps first, then others for strengthening)
  const allSkillsToRecommend = [...new Set([...skillGaps, ...requiredSkills])];
  
  allSkillsToRecommend.forEach((skillArea, index) => {
    const isGap = skillGaps.includes(skillArea);
    
    // Determine priority based on whether it's a gap and position
    let priority: 'critical' | 'high' | 'medium' | 'low';
    if (isGap && index < 2) priority = 'critical';
    else if (isGap) priority = 'high';
    else if (index < 3) priority = 'medium';
    else priority = 'low';
    
    // Get resources from database
    const playlists = youtubePlaylistsDB[skillArea] || [];
    const courses = coursesDB[skillArea] || [];
    
    // Determine target difficulty based on experience
    let targetDifficulty: 'beginner' | 'intermediate' | 'advanced';
    if (experience === 'fresher') targetDifficulty = isGap ? 'beginner' : 'intermediate';
    else if (experience === 'intermediate') targetDifficulty = 'intermediate';
    else targetDifficulty = 'advanced';
    
    // Add YouTube recommendations
    const relevantPlaylists = playlists
      .filter(p => p.difficulty === targetDifficulty || p.difficulty === 'beginner')
      .slice(0, 1);
    
    relevantPlaylists.forEach((playlist) => {
      recommendations.push({
        type: 'youtube',
        priority,
        skillArea,
        score: isGap ? 0 : 50,
        resource: playlist,
        reason: isGap 
          ? `${skillArea} is essential for ${targetRole} roles. Start building your foundation now.`
          : `Strengthen your ${skillArea} skills to excel in ${targetRole} interviews.`
      });
    });
    
    // Add Course recommendations
    const relevantCourses = courses
      .filter(c => c.difficulty === targetDifficulty || c.difficulty === 'beginner')
      .slice(0, 1);
    
    relevantCourses.forEach((course) => {
      recommendations.push({
        type: 'course',
        priority,
        skillArea,
        score: isGap ? 0 : 50,
        resource: course,
        reason: isGap
          ? `Master ${skillArea} with this comprehensive course tailored for ${targetRole} aspirants.`
          : `Take your ${skillArea} skills to the next level for competitive advantage.`
      });
    });
  });
  
  // Sort by priority
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  
  return recommendations;
}

// Get learning path based on weaknesses
export function getLearningPath(weaknesses: string[]): LearningPath[] {
  return weaknesses.slice(0, 3).map((weakness, idx) => ({
    id: `lp-${idx}`,
    title: `Master ${weakness}`,
    description: `Comprehensive learning path to strengthen your ${weakness} skills`,
    estimatedTime: weakness.includes('System') ? '8 weeks' : 
                   weakness.includes('Algorithm') ? '6 weeks' :
                   weakness.includes('Database') ? '4 weeks' : '5 weeks',
    resources: [
      {
        type: 'video',
        title: `${weakness} Fundamentals`,
        url: '#',
        duration: '10h'
      },
      {
        type: 'course',
        title: `${weakness} Deep Dive`,
        url: '#',
        duration: '20h'
      },
      {
        type: 'practice',
        title: `${weakness} Practice Problems`,
        url: '#',
        duration: '15h'
      }
    ]
  }));
}
