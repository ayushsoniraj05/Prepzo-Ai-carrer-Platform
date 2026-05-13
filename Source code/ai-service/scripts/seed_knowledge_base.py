"""
Seed Knowledge Base
Populate the AI service with initial training data
"""

import sys
import io

# Force UTF-8 encoding for stdout
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

import asyncio
import httpx  # type: ignore
from typing import List, Dict, Any

# Configuration
AI_SERVICE_URL = "http://localhost:8000"

HEADERS = {
    "Content-Type": "application/json",
    "X-API-Key": "prepzo-ai-secret-key" # Match your .env
}


# =====================================================
# SKILLS DATABASE
# =====================================================
SKILLS: List[Dict] = [
    # Programming Languages
    {"name": "Python", "category": "Programming Languages", "industry": "tech", 
     "description": "General-purpose programming language known for readability and versatility",
     "related_skills": ["Django", "FastAPI", "Flask", "NumPy", "Pandas", "Machine Learning"]},
    
    {"name": "JavaScript", "category": "Programming Languages", "industry": "tech",
     "description": "Dynamic programming language for web development, both frontend and backend",
     "related_skills": ["React", "Node.js", "TypeScript", "Vue.js", "Angular"]},
    
    {"name": "Java", "category": "Programming Languages", "industry": "tech",
     "description": "Object-oriented programming language used for enterprise applications",
     "related_skills": ["Spring Boot", "Hibernate", "Maven", "Microservices"]},
    
    {"name": "C++", "category": "Programming Languages", "industry": "tech",
     "description": "High-performance language for system programming and competitive coding",
     "related_skills": ["Data Structures", "Algorithms", "Competitive Programming"]},
    
    {"name": "TypeScript", "category": "Programming Languages", "industry": "tech",
     "description": "Typed superset of JavaScript for building large-scale applications",
     "related_skills": ["JavaScript", "React", "Angular", "Node.js"]},
    
    {"name": "Go", "category": "Programming Languages", "industry": "tech",
     "description": "Efficient language for building scalable concurrent systems",
     "related_skills": ["Microservices", "Kubernetes", "Docker", "Backend Development"]},
    
    {"name": "Rust", "category": "Programming Languages", "industry": "tech",
     "description": "Systems programming language focused on safety and performance",
     "related_skills": ["Systems Programming", "WebAssembly", "Memory Safety"]},
    
    # Frontend
    {"name": "React", "category": "Frontend Frameworks", "industry": "tech",
     "description": "JavaScript library for building user interfaces with component-based architecture",
     "related_skills": ["JavaScript", "TypeScript", "Redux", "Next.js", "HTML", "CSS"]},
    
    {"name": "Angular", "category": "Frontend Frameworks", "industry": "tech",
     "description": "Platform for building web applications with TypeScript",
     "related_skills": ["TypeScript", "RxJS", "NgRx", "HTML", "CSS"]},
    
    {"name": "Vue.js", "category": "Frontend Frameworks", "industry": "tech",
     "description": "Progressive JavaScript framework for building user interfaces",
     "related_skills": ["JavaScript", "Vuex", "Nuxt.js", "HTML", "CSS"]},
    
    {"name": "HTML", "category": "Frontend", "industry": "tech",
     "description": "Standard markup language for creating web pages",
     "related_skills": ["CSS", "JavaScript", "Web Development"]},
    
    {"name": "CSS", "category": "Frontend", "industry": "tech",
     "description": "Style sheet language for describing presentation of web documents",
     "related_skills": ["HTML", "Tailwind CSS", "SASS", "Bootstrap"]},
    
    {"name": "Tailwind CSS", "category": "Frontend", "industry": "tech",
     "description": "Utility-first CSS framework for rapid UI development",
     "related_skills": ["CSS", "HTML", "React", "Vue.js"]},
    
    # Backend
    {"name": "Node.js", "category": "Backend Frameworks", "industry": "tech",
     "description": "JavaScript runtime for building scalable server-side applications",
     "related_skills": ["JavaScript", "Express.js", "MongoDB", "REST APIs"]},
    
    {"name": "Express.js", "category": "Backend Frameworks", "industry": "tech",
     "description": "Minimal Node.js web application framework",
     "related_skills": ["Node.js", "JavaScript", "REST APIs", "MongoDB"]},
    
    {"name": "Django", "category": "Backend Frameworks", "industry": "tech",
     "description": "High-level Python web framework for rapid development",
     "related_skills": ["Python", "PostgreSQL", "REST APIs", "Django REST Framework"]},
    
    {"name": "FastAPI", "category": "Backend Frameworks", "industry": "tech",
     "description": "Modern, fast Python web framework for building APIs",
     "related_skills": ["Python", "Pydantic", "SQLAlchemy", "Async Programming"]},
    
    {"name": "Spring Boot", "category": "Backend Frameworks", "industry": "tech",
     "description": "Java-based framework for building microservices and enterprise applications",
     "related_skills": ["Java", "Microservices", "Spring Security", "Hibernate"]},
    
    # Databases
    {"name": "SQL", "category": "Databases", "industry": "tech",
     "description": "Standard language for managing relational databases",
     "related_skills": ["MySQL", "PostgreSQL", "Database Design", "Query Optimization"]},
    
    {"name": "MongoDB", "category": "Databases", "industry": "tech",
     "description": "NoSQL document database for modern applications",
     "related_skills": ["NoSQL", "Node.js", "Mongoose", "Database Design"]},
    
    {"name": "PostgreSQL", "category": "Databases", "industry": "tech",
     "description": "Advanced open-source relational database",
     "related_skills": ["SQL", "Database Design", "Query Optimization", "Python"]},
    
    {"name": "Redis", "category": "Databases", "industry": "tech",
     "description": "In-memory data structure store used as database and cache",
     "related_skills": ["Caching", "Pub/Sub", "Session Storage"]},
    
    {"name": "DBMS", "category": "Databases", "industry": "tech",
     "description": "Database Management Systems concepts and fundamentals",
     "related_skills": ["SQL", "Normalization", "ACID", "Transactions", "Indexing"]},
    
    # DevOps & Cloud
    {"name": "Docker", "category": "DevOps", "industry": "tech",
     "description": "Container platform for building, shipping, and running applications",
     "related_skills": ["Kubernetes", "CI/CD", "Linux", "Microservices"]},
    
    {"name": "Kubernetes", "category": "DevOps", "industry": "tech",
     "description": "Container orchestration platform for automating deployment and scaling",
     "related_skills": ["Docker", "Cloud Computing", "DevOps", "Microservices"]},
    
    {"name": "AWS", "category": "Cloud Computing", "industry": "tech",
     "description": "Amazon Web Services cloud computing platform",
     "related_skills": ["EC2", "S3", "Lambda", "Cloud Architecture", "DevOps"]},
    
    {"name": "GCP", "category": "Cloud Computing", "industry": "tech",
     "description": "Google Cloud Platform for cloud computing services",
     "related_skills": ["BigQuery", "Cloud Functions", "Kubernetes", "Cloud Architecture"]},
    
    {"name": "Azure", "category": "Cloud Computing", "industry": "tech",
     "description": "Microsoft Azure cloud computing platform",
     "related_skills": ["Azure Functions", "Azure DevOps", "Cloud Architecture"]},
    
    {"name": "Git", "category": "DevOps", "industry": "tech",
     "description": "Distributed version control system for tracking code changes",
     "related_skills": ["GitHub", "GitLab", "CI/CD", "Version Control"]},
    
    {"name": "CI/CD", "category": "DevOps", "industry": "tech",
     "description": "Continuous Integration and Continuous Deployment practices",
     "related_skills": ["Jenkins", "GitHub Actions", "GitLab CI", "Docker"]},
    
    # AI/ML
    {"name": "Machine Learning", "category": "AI/ML", "industry": "tech",
     "description": "Building systems that learn from data to make predictions",
     "related_skills": ["Python", "TensorFlow", "PyTorch", "Scikit-learn", "Deep Learning"]},
    
    {"name": "Deep Learning", "category": "AI/ML", "industry": "tech",
     "description": "Neural network-based machine learning for complex patterns",
     "related_skills": ["TensorFlow", "PyTorch", "Neural Networks", "Computer Vision", "NLP"]},
    
    {"name": "Natural Language Processing", "category": "AI/ML", "industry": "tech",
     "description": "AI techniques for understanding and generating human language",
     "related_skills": ["Transformers", "BERT", "GPT", "Text Classification", "Machine Learning"]},
    
    {"name": "Computer Vision", "category": "AI/ML", "industry": "tech",
     "description": "AI for processing and analyzing visual information",
     "related_skills": ["CNN", "Image Classification", "Object Detection", "OpenCV"]},
    
    {"name": "TensorFlow", "category": "AI/ML", "industry": "tech",
     "description": "Open-source machine learning framework by Google",
     "related_skills": ["Python", "Deep Learning", "Keras", "Neural Networks"]},
    
    {"name": "PyTorch", "category": "AI/ML", "industry": "tech",
     "description": "Open-source machine learning framework by Meta",
     "related_skills": ["Python", "Deep Learning", "Neural Networks", "Research"]},
    
    # Data Science
    {"name": "Data Science", "category": "Data", "industry": "tech",
     "description": "Extracting insights from data using statistics and machine learning",
     "related_skills": ["Python", "Pandas", "NumPy", "Statistics", "Machine Learning"]},
    
    {"name": "Data Analysis", "category": "Data", "industry": "tech",
     "description": "Analyzing data to discover patterns and insights",
     "related_skills": ["Python", "Excel", "SQL", "Pandas", "Visualization"]},
    
    {"name": "Pandas", "category": "Data", "industry": "tech",
     "description": "Python library for data manipulation and analysis",
     "related_skills": ["Python", "NumPy", "Data Analysis", "Data Science"]},
    
    {"name": "NumPy", "category": "Data", "industry": "tech",
     "description": "Fundamental package for scientific computing with Python",
     "related_skills": ["Python", "Pandas", "Machine Learning", "Data Science"]},
    
    # CS Fundamentals
    {"name": "Data Structures", "category": "CS Fundamentals", "industry": "tech",
     "description": "Organizing and storing data efficiently - arrays, trees, graphs, etc.",
     "related_skills": ["Algorithms", "Competitive Programming", "Problem Solving"]},
    
    {"name": "Algorithms", "category": "CS Fundamentals", "industry": "tech",
     "description": "Step-by-step procedures for solving computational problems",
     "related_skills": ["Data Structures", "Competitive Programming", "Problem Solving", "Time Complexity"]},
    
    {"name": "System Design", "category": "CS Fundamentals", "industry": "tech",
     "description": "Designing large-scale distributed systems",
     "related_skills": ["Scalability", "Microservices", "Database Design", "Caching"]},
    
    {"name": "Object-Oriented Programming", "category": "CS Fundamentals", "industry": "tech",
     "description": "Programming paradigm based on objects and classes",
     "related_skills": ["Java", "Python", "C++", "Design Patterns"]},
    
    {"name": "Operating Systems", "category": "CS Fundamentals", "industry": "tech",
     "description": "Software that manages computer hardware and software resources",
     "related_skills": ["Linux", "Process Management", "Memory Management", "File Systems"]},
    
    {"name": "Computer Networks", "category": "CS Fundamentals", "industry": "tech",
     "description": "Systems for connecting computers and exchanging data",
     "related_skills": ["TCP/IP", "HTTP", "DNS", "Network Security"]},
]


# =====================================================
# COURSES DATABASE
# =====================================================
COURSES: List[Dict] = [
    # Python
    {"title": "Complete Python Bootcamp", "platform": "Udemy", 
     "url": "https://www.udemy.com/course/complete-python-bootcamp/",
     "skills": ["Python", "Object-Oriented Programming"], "level": "beginner",
     "duration": "22 hours", "instructor": "Jose Portilla",
     "thumbnail": "https://img-c.udemycdn.com/course/480x270/2776760_f176_10.jpg",
     "platform_logo": "https://upload.wikimedia.org/wikipedia/commons/e/e3/Udemy_logo.svg",
     "description": "Learn Python like a professional from basics to advanced"},
    
    {"title": "Python for Data Science and Machine Learning Bootcamp", "platform": "Udemy",
     "url": "https://www.udemy.com/course/python-for-data-science-and-machine-learning-bootcamp/",
     "skills": ["Python", "Data Science", "Machine Learning", "Pandas", "NumPy"],
     "level": "intermediate", "duration": "25 hours", "instructor": "Jose Portilla",
     "thumbnail": "https://img-c.udemycdn.com/course/480x270/903744_7016.jpg",
     "platform_logo": "https://upload.wikimedia.org/wikipedia/commons/e/e3/Udemy_logo.svg",
     "description": "Learn how to use NumPy, Pandas, Seaborn, and more for Data Science and ML"},
    
    # JavaScript/React
    {"title": "The Complete JavaScript Course", "platform": "Udemy",
     "url": "https://www.udemy.com/course/the-complete-javascript-course/",
     "skills": ["JavaScript", "HTML", "CSS"], "level": "beginner",
     "duration": "69 hours", "instructor": "Jonas Schmedtmann",
     "thumbnail": "https://img-c.udemycdn.com/course/480x270/851712_fc61_6.jpg",
     "platform_logo": "https://upload.wikimedia.org/wikipedia/commons/e/e3/Udemy_logo.svg",
     "description": "Master JavaScript with projects, challenges and theory"},
    
    {"title": "React - The Complete Guide", "platform": "Udemy",
     "url": "https://www.udemy.com/course/react-the-complete-guide-incl-redux/",
     "skills": ["React", "JavaScript", "Redux", "TypeScript"], "level": "intermediate",
     "duration": "50 hours", "instructor": "Maximilian Schwarzmüller",
     "thumbnail": "https://img-c.udemycdn.com/course/480x270/1362070_b9a1_2.jpg",
     "platform_logo": "https://upload.wikimedia.org/wikipedia/commons/e/e3/Udemy_logo.svg",
     "description": "Dive in and learn React.js from scratch with Redux, Hooks, and more"},
    
    {"title": "Next.js & React - The Complete Guide", "platform": "Udemy",
     "url": "https://www.udemy.com/course/nextjs-react-the-complete-guide/",
     "skills": ["React", "Next.js", "TypeScript"], "level": "intermediate",
     "duration": "25 hours", "instructor": "Maximilian Schwarzmüller",
     "thumbnail": "https://img-c.udemycdn.com/course/480x270/3873464_3072_3.jpg",
     "platform_logo": "https://upload.wikimedia.org/wikipedia/commons/e/e3/Udemy_logo.svg",
     "description": "Learn Next.js from ground up and build production-ready fullstack apps"},
    
    # Node.js/Backend
    {"title": "The Complete Node.js Developer Course", "platform": "Udemy",
     "url": "https://www.udemy.com/course/the-complete-nodejs-developer-course-2/",
     "skills": ["Node.js", "Express.js", "MongoDB", "JavaScript"], "level": "intermediate",
     "duration": "35 hours", "instructor": "Andrew Mead",
     "thumbnail": "https://img-c.udemycdn.com/course/480x270/922484_52a1_8.jpg",
     "platform_logo": "https://upload.wikimedia.org/wikipedia/commons/e/e3/Udemy_logo.svg",
     "description": "Learn Node.js by building real-world applications with Node JS, Express, MongoDB"},
    
    # Java
    {"title": "Java Programming Masterclass", "platform": "Udemy",
     "url": "https://www.udemy.com/course/java-the-complete-java-developer-course/",
     "skills": ["Java", "Object-Oriented Programming"], "level": "beginner",
     "duration": "80 hours", "instructor": "Tim Buchalka",
     "thumbnail": "https://img-c.udemycdn.com/course/480x270/533682_c10c_4.jpg",
     "platform_logo": "https://upload.wikimedia.org/wikipedia/commons/e/e3/Udemy_logo.svg",
     "description": "Learn Java from beginner to advanced concepts"},
    
    {"title": "Spring & Hibernate for Beginners", "platform": "Udemy",
     "url": "https://www.udemy.com/course/spring-hibernate-tutorial/",
     "skills": ["Java", "Spring Boot", "Hibernate"], "level": "intermediate",
     "duration": "42 hours", "instructor": "Chad Darby",
     "thumbnail": "https://img-c.udemycdn.com/course/480x270/609504_3172_9.jpg",
     "platform_logo": "https://upload.wikimedia.org/wikipedia/commons/e/e3/Udemy_logo.svg",
     "description": "Build Java Apps with Spring Framework including Spring Boot, MVC, Hibernate"},
    
    # DSA
    {"title": "Master the Coding Interview: Data Structures + Algorithms", "platform": "Udemy",
     "url": "https://www.udemy.com/course/master-the-coding-interview-data-structures-algorithms/",
     "skills": ["Data Structures", "Algorithms", "Problem Solving"], "level": "intermediate",
     "duration": "20 hours", "instructor": "Andrei Neagoie",
     "thumbnail": "https://img-c.udemycdn.com/course/480x270/1917546_4df3.jpg",
     "platform_logo": "https://upload.wikimedia.org/wikipedia/commons/e/e3/Udemy_logo.svg",
     "description": "Ace coding interviews by mastering data structures and algorithms"},
    
    {"title": "Grokking the Coding Interview", "platform": "Educative",
     "url": "https://www.educative.io/courses/grokking-the-coding-interview",
     "skills": ["Data Structures", "Algorithms", "Competitive Programming"], "level": "intermediate",
     "duration": "40 hours",
     "thumbnail": "https://www.educative.io/api/collection/5668639101419520/5649050225344512/image/5630903070621696",
     "platform_logo": "https://www.educative.io/static/imgs/logos/logoMarkv2.svg",
     "description": "Pattern-based approach to coding interview preparation"},
    
    # System Design
    {"title": "Grokking System Design Interview", "platform": "Educative",
     "url": "https://www.educative.io/courses/grokking-modern-system-design-interview-for-engineers-managers",
     "skills": ["System Design", "Scalability", "Microservices"], "level": "advanced",
     "duration": "35 hours",
     "thumbnail": "https://www.educative.io/api/collection/5668639101419520/5649050225344512/image/5630903070621696",
     "platform_logo": "https://www.educative.io/static/imgs/logos/logoMarkv2.svg",
     "description": "Learn system design fundamentals for technical interviews"},
    
    {"title": "System Design Interview – An insider's guide", "platform": "Book",
     "url": "https://www.amazon.com/System-Design-Interview-insiders-guide/dp/B08CMF2CQF",
     "skills": ["System Design", "Scalability", "Database Design"], "level": "advanced",
     "duration": "10 hours",
     "description": "Alex Xu's comprehensive guide to system design interviews"},
    
    # Machine Learning
    {"title": "Machine Learning by Andrew Ng", "platform": "Coursera",
     "url": "https://www.coursera.org/learn/machine-learning",
     "skills": ["Machine Learning", "Python", "Deep Learning"], "level": "intermediate",
     "duration": "60 hours", "instructor": "Andrew Ng",
     "thumbnail": "https://d3njjcbhbojbot.cloudfront.net/api/utilities/v1/imageproxy/https://coursera-course-photos.s3.amazonaws.com/fb/434400d9ac11e5b195f7f5a63a3717/logo.png",
     "platform_logo": "https://upload.wikimedia.org/wikipedia/commons/9/97/Coursera-Logo_600x600.svg",
     "description": "Stanford's legendary ML course covering fundamentals"},
    
    {"title": "Deep Learning Specialization", "platform": "Coursera",
     "url": "https://www.coursera.org/specializations/deep-learning",
     "skills": ["Deep Learning", "Neural Networks", "TensorFlow", "Computer Vision", "NLP"],
     "level": "advanced", "duration": "120 hours", "instructor": "Andrew Ng",
     "thumbnail": "https://d3njjcbhbojbot.cloudfront.net/api/utilities/v1/imageproxy/https://coursera-course-photos.s3.amazonaws.com/26/506720138911e7ba2565691f16327b/Logo-Coursera.png",
     "platform_logo": "https://upload.wikimedia.org/wikipedia/commons/9/97/Coursera-Logo_600x600.svg",
     "description": "Master deep learning by building neural networks"},
    
    {"title": "fastai Practical Deep Learning for Coders", "platform": "fast.ai",
     "url": "https://course.fast.ai/",
     "skills": ["Deep Learning", "PyTorch", "Computer Vision", "NLP"],
     "level": "intermediate", "duration": "40 hours", "instructor": "Jeremy Howard",
     "description": "Top-down practical approach to deep learning"},
    
    # SQL/Databases
    {"title": "The Complete SQL Bootcamp", "platform": "Udemy",
     "url": "https://www.udemy.com/course/the-complete-sql-bootcamp/",
     "skills": ["SQL", "PostgreSQL", "DBMS", "Database Design"], "level": "beginner",
     "duration": "9 hours", "instructor": "Jose Portilla",
     "thumbnail": "https://img-c.udemycdn.com/course/480x270/762616_7693_3.jpg",
     "platform_logo": "https://upload.wikimedia.org/wikipedia/commons/e/e3/Udemy_logo.svg",
     "description": "Learn SQL using PostgreSQL and pgAdmin"},
    
    {"title": "MongoDB - The Complete Developer's Guide", "platform": "Udemy",
     "url": "https://www.udemy.com/course/mongodb-the-complete-developers-guide/",
     "skills": ["MongoDB", "NoSQL", "Database Design"], "level": "intermediate",
     "duration": "18 hours", "instructor": "Maximilian Schwarzmüller",
     "description": "Master MongoDB development for modern applications"},
    
    # DevOps/Cloud
    {"title": "Docker and Kubernetes: The Complete Guide", "platform": "Udemy",
     "url": "https://www.udemy.com/course/docker-and-kubernetes-the-complete-guide/",
     "skills": ["Docker", "Kubernetes", "DevOps", "CI/CD"], "level": "intermediate",
     "duration": "22 hours", "instructor": "Stephen Grider",
     "thumbnail": "https://img-c.udemycdn.com/course/480x270/1151632_de9b.jpg",
     "platform_logo": "https://upload.wikimedia.org/wikipedia/commons/e/e3/Udemy_logo.svg",
     "description": "Build, test, and deploy Docker applications with Kubernetes"},
    
    {"title": "AWS Certified Solutions Architect", "platform": "Udemy",
     "url": "https://www.udemy.com/course/aws-certified-solutions-architect-associate/",
     "skills": ["AWS", "Cloud Architecture", "DevOps"], "level": "intermediate",
     "duration": "27 hours", "instructor": "Stephane Maarek",
     "thumbnail": "https://img-c.udemycdn.com/course/480x270/362328_9177_9.jpg",
     "platform_logo": "https://upload.wikimedia.org/wikipedia/commons/e/e3/Udemy_logo.svg",
     "description": "Become an AWS Certified Solutions Architect"},
    
    {"title": "Git Complete: The definitive guide", "platform": "Udemy",
     "url": "https://www.udemy.com/course/git-complete/",
     "skills": ["Git", "Version Control", "GitHub"], "level": "beginner",
     "duration": "6 hours",
     "description": "Master Git version control from basics to advanced"},
    
    # Soft Skills
    {"title": "Technical Interview Preparation", "platform": "Exponent",
     "url": "https://www.tryexponent.com/",
     "skills": ["System Design", "Data Structures", "Algorithms"], "level": "advanced",
     "duration": "20 hours",
     "description": "Mock interviews and structured preparation for FAANG"},
]



# =====================================================
# YOUTUBE RESOURCES
# =====================================================
YOUTUBE_RESOURCES: List[Dict] = [
    # DSA
    {"title": "Data Structures and Algorithms Complete Course", "channel": "freeCodeCamp",
     "url": "https://www.youtube.com/watch?v=8hly31xKli0",
     "skills": ["Data Structures", "Algorithms"], "video_count": 1, "duration_hours": 8,
     "description": "Comprehensive DSA course covering all essential concepts"},
    
    {"title": "Striver's A2Z DSA Course", "channel": "take U forward",
     "url": "https://www.youtube.com/playlist?list=PLgUwDviBIf0oF6QLRhJWNhDpAFG79dWWY",
     "skills": ["Data Structures", "Algorithms", "Competitive Programming"],
     "video_count": 450, "duration_hours": 200,
     "description": "Most comprehensive DSA playlist for placement preparation"},
    
    {"title": "Abdul Bari Algorithms", "channel": "Abdul Bari",
     "url": "https://www.youtube.com/playlist?list=PLDN4rrl48XKpZkf03iYFl-O29szjTrs_O",
     "skills": ["Algorithms", "Data Structures"], "video_count": 85, "duration_hours": 40,
     "description": "Clear explanations of algorithms with visual examples"},
    
    {"title": "NeetCode 150", "channel": "NeetCode",
     "url": "https://www.youtube.com/c/NeetCode",
     "skills": ["Data Structures", "Algorithms", "Competitive Programming"],
     "video_count": 150, "duration_hours": 50,
     "description": "Curated 150 most important LeetCode problems for interviews"},
    
    # System Design
    {"title": "System Design Primer Course", "channel": "freeCodeCamp",
     "url": "https://www.youtube.com/watch?v=F2FmTdLtb_4",
     "skills": ["System Design", "Scalability"], "video_count": 1, "duration_hours": 5,
     "description": "System design fundamentals for interviews"},
    
    {"title": "Gaurav Sen System Design", "channel": "Gaurav Sen",
     "url": "https://www.youtube.com/playlist?list=PLMCXHnjXnTnvo6alSjVkgxV-VH6EPyvoX",
     "skills": ["System Design", "Scalability", "Microservices"],
     "video_count": 30, "duration_hours": 15,
     "description": "In-depth system design concepts and interview problems"},
    
    # Web Development
    {"title": "Full Stack Web Development Course", "channel": "freeCodeCamp",
     "url": "https://www.youtube.com/watch?v=nu_pCVPKzTk",
     "skills": ["HTML", "CSS", "JavaScript", "React", "Node.js"],
     "video_count": 1, "duration_hours": 12,
     "description": "Complete web development bootcamp"},
    
    {"title": "React Course - Beginner's Tutorial", "channel": "freeCodeCamp",
     "url": "https://www.youtube.com/watch?v=bMknfKXIFA8",
     "skills": ["React", "JavaScript"], "video_count": 1, "duration_hours": 12,
     "description": "Learn React JS from scratch"},
    
    {"title": "Node.js and Express.js Full Course", "channel": "freeCodeCamp",
     "url": "https://www.youtube.com/watch?v=Oe421EPjeBE",
     "skills": ["Node.js", "Express.js", "JavaScript"], "video_count": 1, "duration_hours": 8,
     "description": "Build backend applications with Node.js and Express"},
    
    # Python
    {"title": "Python Tutorial - Full Course for Beginners", "channel": "Programming with Mosh",
     "url": "https://www.youtube.com/watch?v=_uQrJ0TkZlc",
     "skills": ["Python"], "video_count": 1, "duration_hours": 6,
     "description": "Python programming for beginners"},
    
    {"title": "CS50's Introduction to Programming with Python", "channel": "freeCodeCamp",
     "url": "https://www.youtube.com/watch?v=nLRL_NcnK-4",
     "skills": ["Python", "Object-Oriented Programming"], "video_count": 1, "duration_hours": 16,
     "description": "Harvard's CS50 Python course"},
    
    # Machine Learning
    {"title": "Machine Learning Course for Beginners", "channel": "freeCodeCamp",
     "url": "https://www.youtube.com/watch?v=NWONeJKn6kc",
     "skills": ["Machine Learning", "Python"], "video_count": 1, "duration_hours": 10,
     "description": "Learn machine learning from scratch"},
    
    {"title": "Deep Learning Crash Course", "channel": "freeCodeCamp",
     "url": "https://www.youtube.com/watch?v=VyWAvY2CF9c",
     "skills": ["Deep Learning", "TensorFlow", "Neural Networks"],
     "video_count": 1, "duration_hours": 4,
     "description": "Introduction to deep learning concepts"},
    
    {"title": "Stanford CS229 Machine Learning", "channel": "Stanford Online",
     "url": "https://www.youtube.com/playlist?list=PLoROMvodv4rMiGQp3WXShtMGgzqpfVfbU",
     "skills": ["Machine Learning", "Deep Learning"], "video_count": 20, "duration_hours": 30,
     "description": "Stanford's graduate ML course by Andrew Ng"},
    
    # Java
    {"title": "Java Full Course", "channel": "Bro Code",
     "url": "https://www.youtube.com/watch?v=xk4_1vDrzzo",
     "skills": ["Java", "Object-Oriented Programming"], "video_count": 1, "duration_hours": 12,
     "description": "Complete Java programming course"},
    
    {"title": "Spring Boot Tutorial For Beginners", "channel": "Amigoscode",
     "url": "https://www.youtube.com/watch?v=9SGDpanrc8U",
     "skills": ["Java", "Spring Boot"], "video_count": 1, "duration_hours": 3,
     "description": "Build REST APIs with Spring Boot"},
    
    # DevOps
    {"title": "Docker Tutorial for Beginners", "channel": "TechWorld with Nana",
     "url": "https://www.youtube.com/watch?v=3c-iBn73dDE",
     "skills": ["Docker", "DevOps"], "video_count": 1, "duration_hours": 3,
     "description": "Docker fundamentals and practical usage"},
    
    {"title": "Kubernetes Course - Full Beginners Tutorial", "channel": "TechWorld with Nana",
     "url": "https://www.youtube.com/watch?v=X48VuDVv0do",
     "skills": ["Kubernetes", "Docker", "DevOps"], "video_count": 1, "duration_hours": 4,
     "description": "Learn Kubernetes from scratch"},
    
    {"title": "AWS Certified Cloud Practitioner Training", "channel": "freeCodeCamp",
     "url": "https://www.youtube.com/watch?v=SOTamWNgDKc",
     "skills": ["AWS", "Cloud Computing"], "video_count": 1, "duration_hours": 13,
     "description": "Complete AWS Cloud Practitioner course"},
    
    # SQL/Database
    {"title": "SQL Full Course", "channel": "freeCodeCamp",
     "url": "https://www.youtube.com/watch?v=HXV3zeQKqGY",
     "skills": ["SQL", "DBMS", "Database Design"], "video_count": 1, "duration_hours": 4,
     "description": "Learn SQL database querying from scratch"},
    
    {"title": "MongoDB Crash Course", "channel": "Traversy Media",
     "url": "https://www.youtube.com/watch?v=-56x56UppqQ",
     "skills": ["MongoDB", "NoSQL"], "video_count": 1, "duration_hours": 1.5,
     "description": "Quick start guide to MongoDB"},
]


# =====================================================
# CERTIFICATIONS DATABASE
# =====================================================
CERTIFICATIONS: List[Dict] = [
    # Cloud
    {"name": "AWS Certified Solutions Architect - Associate",
     "provider": "Amazon Web Services",
     "url": "https://aws.amazon.com/certification/certified-solutions-architect-associate/",
     "skills": ["AWS", "Cloud Architecture", "DevOps"],
     "cost": "$150", "duration": "130 mins", "industry_value": "Very High",
     "thumbnail": "https://d1.awsstatic.com/training-and-certification/certification-badges/AWS-Certified-Solutions-Architect-Associate_badge.3419559c682629072f1eb968d59dea0741772c0f.png",
     "authority_logo": "https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg"},
    
    {"name": "AWS Certified Developer - Associate",
     "provider": "Amazon Web Services",
     "url": "https://aws.amazon.com/certification/certified-developer-associate/",
     "skills": ["AWS", "Cloud Computing", "DevOps"],
     "cost": "$150", "duration": "130 mins", "industry_value": "High",
     "thumbnail": "https://d1.awsstatic.com/training-and-certification/certification-badges/AWS-Certified-Developer-Associate_badge.e4d2c7db3cd8fa935088ab86efe4caf684d64e32.png",
     "authority_logo": "https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg"},
    
    {"name": "Google Cloud Professional Cloud Architect",
     "provider": "Google Cloud",
     "url": "https://cloud.google.com/certification/cloud-architect",
     "skills": ["GCP", "Cloud Architecture", "DevOps"],
     "cost": "$200", "duration": "120 mins", "industry_value": "Very High",
     "thumbnail": "https://d3njjcbhbojbot.cloudfront.net/api/utilities/v1/imageproxy/https://s3.amazonaws.com/coursera-course-photos/76/b934bfc6e411e7814bdf3c52aff6f0/Professional-Certificate---Data-Analytics.jpg",
     "authority_logo": "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg"},
    
    {"name": "Microsoft Azure Fundamentals (AZ-900)",
     "provider": "Microsoft",
     "url": "https://learn.microsoft.com/en-us/certifications/azure-fundamentals/",
     "skills": ["Azure", "Cloud Computing"],
     "cost": "$99", "duration": "60 mins", "industry_value": "Medium"},
    
    # Kubernetes/DevOps
    {"name": "Certified Kubernetes Administrator (CKA)",
     "provider": "CNCF",
     "url": "https://www.cncf.io/certification/cka/",
     "skills": ["Kubernetes", "Docker", "DevOps"],
     "cost": "$395", "duration": "120 mins", "industry_value": "Very High"},
    
    {"name": "Certified Kubernetes Application Developer (CKAD)",
     "provider": "CNCF",
     "url": "https://www.cncf.io/certification/ckad/",
     "skills": ["Kubernetes", "Docker", "DevOps"],
     "cost": "$395", "duration": "120 mins", "industry_value": "High"},
    
    {"name": "HashiCorp Terraform Associate",
     "provider": "HashiCorp",
     "url": "https://www.hashicorp.com/certification/terraform-associate",
     "skills": ["Terraform", "DevOps", "Cloud Computing"],
     "cost": "$70.50", "duration": "60 mins", "industry_value": "High"},
    
    # Python/Data Science
    {"name": "TensorFlow Developer Certificate",
     "provider": "Google",
     "url": "https://www.tensorflow.org/certificate",
     "skills": ["TensorFlow", "Deep Learning", "Machine Learning", "Python"],
     "cost": "$100", "duration": "300 mins", "industry_value": "High"},
    
    {"name": "IBM Data Science Professional Certificate",
     "provider": "IBM/Coursera",
     "url": "https://www.coursera.org/professional-certificates/ibm-data-science",
     "skills": ["Data Science", "Python", "Machine Learning", "SQL"],
     "cost": "$39/month", "duration": "3-6 months", "industry_value": "Medium"},
    
    {"name": "Google Data Analytics Certificate",
     "provider": "Google/Coursera",
     "url": "https://www.coursera.org/professional-certificates/google-data-analytics",
     "skills": ["Data Analysis", "SQL", "Data Visualization"],
     "cost": "$39/month", "duration": "6 months", "industry_value": "Medium"},
    
    # Web Development
    {"name": "Meta Front-End Developer Professional Certificate",
     "provider": "Meta/Coursera",
     "url": "https://www.coursera.org/professional-certificates/meta-front-end-developer",
     "skills": ["React", "JavaScript", "HTML", "CSS"],
     "cost": "$39/month", "duration": "7 months", "industry_value": "Medium",
     "thumbnail": "https://d3njjcbhbojbot.cloudfront.net/api/utilities/v1/imageproxy/https://coursera-course-photos.s3.amazonaws.com/9a/e2bcbdea8b4870b1d89a3cd5bb01d4/FE-Dev.png",
     "authority_logo": "https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg"},
    
    {"name": "Meta Back-End Developer Professional Certificate",
     "provider": "Meta/Coursera",
     "url": "https://www.coursera.org/professional-certificates/meta-back-end-developer",
     "skills": ["Python", "Django", "SQL", "REST APIs"],
     "cost": "$39/month", "duration": "8 months", "industry_value": "Medium"},
    
    # Java
    {"name": "Oracle Certified Professional: Java SE Developer",
     "provider": "Oracle",
     "url": "https://education.oracle.com/oracle-certified-professional-java-se-17-developer/trackp_OCPJSE17",
     "skills": ["Java", "Object-Oriented Programming"],
     "cost": "$245", "duration": "90 mins", "industry_value": "High"},
    
    # Database
    {"name": "MongoDB Associate Developer",
     "provider": "MongoDB",
     "url": "https://university.mongodb.com/certification",
     "skills": ["MongoDB", "NoSQL", "Database Design"],
     "cost": "$150", "duration": "90 mins", "industry_value": "Medium"},
    
    {"name": "Oracle Database SQL Certified Associate",
     "provider": "Oracle",
     "url": "https://education.oracle.com/oracle-database-sql-certified-associate/trackp_457",
     "skills": ["SQL", "Oracle", "DBMS"],
     "cost": "$245", "duration": "90 mins", "industry_value": "Medium"},
]


# =====================================================
# STUDY NOTES DATABASE
# =====================================================
STUDY_NOTES: List[Dict] = [
    {"title": "DSA Cheat Sheet", "type": "Cheat Sheet", "url": "https://prepzo.com/notes/dsa-tips",
     "category": "Data Structures", "skills": ["Data Structures", "Algorithms"], "time_to_review": "30 mins",
     "difficulty_level": "beginner", "description": "Quick reference for all major patterns"},
    {"title": "System Design Patterns", "type": "Guide", "url": "https://prepzo.com/notes/system-design",
     "category": "System Design", "skills": ["System Design", "Scalability"], "time_to_review": "45 mins",
     "difficulty_level": "intermediate", "description": "Microservices to Caching patterns"},
    {"title": "React Best Practices 2024", "type": "Guide", "url": "https://prepzo.com/notes/react",
     "category": "Frontend", "skills": ["React", "JavaScript"], "time_to_review": "20 mins",
     "difficulty_level": "intermediate", "description": "Hooks, Context and Performance tips"},
]

# =====================================================
# INTERVIEW PREP DATABASE
# =====================================================
INTERVIEW_PREP: List[Dict] = [
    {"title": "FAANG Selection Guide", "type": "Strategy", "url": "https://prepzo.com/prep/faang",
     "category": "General", "skills": ["Problem Solving", "System Design"], "duration": "2 hours",
     "description": "How to crack big tech interviews"},
    {"title": "React Interview Top 50", "type": "Q&A", "url": "https://prepzo.com/prep/react-qa",
     "skills": ["React", "JavaScript"], "duration": "1 hour",
     "category": "Frontend", "description": "Virtual DOM to Concurrent mode explained"},
]

# =====================================================
# PROJECTS DATABASE
# =====================================================
PROJECTS: List[Dict] = [
    {"title": "Real-time Chat App", "difficulty": "intermediate", "tech_stack": ["React", "Node.js", "Socket.io"],
     "duration": "2 weeks", "description": "Build a scalable chat platform",
     "thumbnail": "https://images.unsplash.com/photo-1611746872915-64382b5c76da?w=400",
     "skills": ["WebSocket", "JavaScript", "Frontend", "Backend"]},
    {"title": "Portfolio Website with Next.js", "difficulty": "beginner", "tech_stack": ["Next.js", "Tailwind CSS"],
     "duration": "1 week", "description": "Modern SEO optimized portfolio",
     "thumbnail": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400",
     "skills": ["Next.js", "CSS", "Frontend"]},
    {"title": "Personal Finance Tracker", "difficulty": "beginner", "tech_stack": ["Python", "SQLite", "Matplotlib"],
     "duration": "2 weeks", "description": "Build an expense tracker with charts and data export.",
     "thumbnail": "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400",
     "skills": ["Python", "Database", "Data Visualization"]},
]

# =====================================================
# PRACTICE PROBLEMS DATABASE
# =====================================================
PRACTICE_PROBLEMS: List[Dict] = [
    {"title": "Reverse Linked List", "type": "Exercise", "url": "https://prepzo.com/practice/ll-1",
     "category": "Algorithms", "skills": ["Data Structures", "Algorithms"], "difficulty": "easy",
     "description": "Classic logic problem"},
    {"title": "Design a Distributed Cache", "type": "System Design", "url": "https://prepzo.com/practice/sd-1",
     "category": "System Design", "skills": ["System Design", "Scalability"], "difficulty": "hard",
     "description": "Design Memcached from scratch"},
]


# =====================================================
# INTERVIEW QUESTIONS
# =====================================================
INTERVIEW_QUESTIONS: List[Dict] = []


# =====================================================
# JOB ROLES
# =====================================================
JOB_ROLES: List[Dict] = [
    {"title": "Software Development Engineer (SDE)",
     "description": "Build and maintain software applications, write clean code, collaborate with team",
     "required_skills": ["Data Structures", "Algorithms", "System Design"],
     "preferred_skills": ["Java", "Python", "JavaScript", "SQL", "Git"],
     "experience_level": "entry"},
    
    {"title": "Frontend Developer",
     "description": "Build user interfaces for web applications with modern frameworks",
     "required_skills": ["JavaScript", "React", "HTML", "CSS"],
     "preferred_skills": ["TypeScript", "Vue.js", "Angular", "Tailwind CSS"],
     "experience_level": "entry"},
    
    {"title": "Backend Developer",
     "description": "Build server-side logic, APIs, and integrate with databases",
     "required_skills": ["Node.js", "Python", "SQL", "REST APIs"],
     "preferred_skills": ["MongoDB", "Redis", "Docker", "AWS"],
     "experience_level": "entry"},
    
    {"title": "Full Stack Developer",
     "description": "Work on both frontend and backend of web applications",
     "required_skills": ["React", "Node.js", "JavaScript", "SQL", "MongoDB"],
     "preferred_skills": ["TypeScript", "Docker", "AWS", "System Design"],
     "experience_level": "mid"},
    
    {"title": "Data Scientist",
     "description": "Analyze data, build ML models, derive insights for business decisions",
     "required_skills": ["Python", "Machine Learning", "SQL", "Pandas", "Statistics"],
     "preferred_skills": ["Deep Learning", "TensorFlow", "PyTorch", "Data Visualization"],
     "experience_level": "entry"},
    
    {"title": "Machine Learning Engineer",
     "description": "Design and deploy machine learning systems at scale",
     "required_skills": ["Python", "Machine Learning", "Deep Learning", "TensorFlow"],
     "preferred_skills": ["PyTorch", "MLOps", "Docker", "Kubernetes", "System Design"],
     "experience_level": "mid"},
    
    {"title": "DevOps Engineer",
     "description": "Manage infrastructure, CI/CD pipelines, and deployments",
     "required_skills": ["Docker", "Kubernetes", "CI/CD", "Linux", "Git"],
     "preferred_skills": ["AWS", "Terraform", "Python", "Monitoring"],
     "experience_level": "mid"},
    
    {"title": "Cloud Engineer",
     "description": "Design and manage cloud infrastructure and services",
     "required_skills": ["AWS", "Cloud Architecture", "Linux", "Networking"],
     "preferred_skills": ["GCP", "Azure", "Kubernetes", "Terraform"],
     "experience_level": "mid"},
    
    {"title": "Data Engineer",
     "description": "Build data pipelines, ETL processes, and data infrastructure",
     "required_skills": ["Python", "SQL", "Data Pipelines", "Data Warehousing"],
     "preferred_skills": ["Spark", "Kafka", "Airflow", "AWS"],
     "experience_level": "mid"},
    
    {"title": "Site Reliability Engineer (SRE)",
     "description": "Ensure reliability and scalability of production systems",
     "required_skills": ["Linux", "Python", "Kubernetes", "Monitoring"],
     "preferred_skills": ["AWS", "Docker", "CI/CD", "System Design"],
     "experience_level": "mid"},
]


async def seed_entity(client: httpx.AsyncClient, entity_type: str, data: List[Dict]) -> tuple[int, int]:
    """Seed a single entity type"""
    print(f"\n📦 Seeding {entity_type}...")
    
    endpoint_map = {
        "skills": "/api/knowledge/skills",
        "courses": "/api/knowledge/courses",
        "youtube": "/api/knowledge/youtube",
        "certifications": "/api/knowledge/certifications",
        "questions": "/api/knowledge/questions",
        "roles": "/api/knowledge/roles",
        "study_notes": "/api/knowledge/study-notes",
        "interview_prep": "/api/knowledge/interview-prep",
        "practice_problems": "/api/knowledge/practice-problems",
        "projects": "/api/knowledge/projects"
    }
    
    endpoint = endpoint_map.get(entity_type)
    if not endpoint:
        print(f"❌ Unknown entity type: {entity_type}")
        return 0, 0
    
    success: int = 0
    failed: int = 0
    
    for item in data:
        try:
            response = await client.post(
                f"{AI_SERVICE_URL}{endpoint}",
                json=item,
                headers=HEADERS,
                timeout=30.0
            )
            if response.status_code == 200:
                success = success + 1  # pyre-ignore
                try:
                    name = item.get('name', item.get('title', item.get('question', 'item')))
                    print(f"  [PASS] Added: {name[:50]}")
                except:
                    print(f"  [PASS] Added item")
            else:
                failed = failed + 1  # pyre-ignore
                print(f"  [FAIL] Status {response.status_code}: {response.text[:100]}")
        except Exception as e:
            failed = failed + 1  # pyre-ignore
            print(f"  [ERROR] {str(e)}")
    
    print(f"  📊 {entity_type}: {success} added, {failed} failed")
    return success, failed


async def main():
    """Main seeding function"""
    print("=" * 60)
    print("🌱 PREPZO AI - KNOWLEDGE BASE SEEDING")
    print("=" * 60)
    
    async with httpx.AsyncClient() as client:
        # Check if AI service is running
        try:
            response = await client.get(f"{AI_SERVICE_URL}/health")
            if response.status_code != 200:
                print("❌ AI Service is not healthy")
                return
            print("✅ AI Service is running\n")
        except Exception as e:
            print(f"❌ Cannot connect to AI Service: {e}")
            print("Make sure the AI service is running: python -m uvicorn app.main:app --reload")
            return
        
        # Seed all entities
        total_success = 0
        total_failed = 0
        
        entities = [
            ("skills", SKILLS),
            ("courses", COURSES),
            ("youtube", YOUTUBE_RESOURCES),
            ("certifications", CERTIFICATIONS),
            ("questions", INTERVIEW_QUESTIONS),
            ("roles", JOB_ROLES),
            ("study_notes", STUDY_NOTES),
            ("interview_prep", INTERVIEW_PREP),
            ("projects", PROJECTS),
            ("practice_problems", PRACTICE_PROBLEMS)
        ]
        
        for entity_type, data in entities:
            success, failed = await seed_entity(client, entity_type, data)
            total_success += success
            total_failed += failed
        
        # Save indexes
        print("\n💾 Saving vector indexes...")
        try:
            response = await client.post(
                f"{AI_SERVICE_URL}/api/knowledge/save-indexes",
                headers=HEADERS
            )
            if response.status_code == 200:
                print("✅ Indexes saved")
            else:
                print(f"⚠️ Index save warning: {response.text}")
        except Exception as e:
            print(f"⚠️ Index save error: {e}")
        
        # Get stats
        print("\n📊 Knowledge Base Stats:")
        try:
            response = await client.get(
                f"{AI_SERVICE_URL}/api/knowledge/stats",
                headers=HEADERS
            )
            if response.status_code == 200:
                stats = response.json()
                for key, count in stats.get("mongodb_counts", {}).items():
                    print(f"  {key}: {count}")
        except Exception as e:
            print(f"  Error getting stats: {e}")
        
        print("\n" + "=" * 60)
        print(f"🎉 SEEDING COMPLETE!")
        print(f"   Total Added: {total_success}")
        print(f"   Total Failed: {total_failed}")
        print("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())
