export interface InterviewRole {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  questions: string[];
}

export const INTERVIEW_ROLES: InterviewRole[] = [
  {
    id: 'frontend',
    title: 'Frontend Developer',
    description: 'Focus on UI/UX, React, JavaScript, and CSS performance.',
    category: 'Engineering',
    icon: 'Layout',
    questions: [
      "Explain the difference between useMemo and useCallback. When should you use each?",
      "How does the Virtual DOM work in React, and how does it improve performance?",
      "What are the different ways to handle state management in a large-scale React application?",
      "Describe the CSS Box Model and the difference between content-box and border-box.",
      "How do you optimize a web application for better Core Web Vitals?"
    ]
  },
  {
    id: 'backend',
    title: 'Backend Developer',
    description: 'System design, APIs, Databases, and Server-side logic.',
    category: 'Engineering',
    icon: 'Server',
    questions: [
      "What is the difference between SQL and NoSQL databases? When would you choose one over the other?",
      "Explain the concept of microservices architecture and its pros and cons.",
      "How do you handle authentication and authorization in a REST API?",
      "What are database indexes and how do they improve query performance? What are the trade-offs?",
      "Describe the CAP theorem and its implications on distributed systems."
    ]
  },
  {
    id: 'fullstack',
    title: 'Full Stack Engineer',
    description: 'End-to-end application development and architecture.',
    category: 'Engineering',
    icon: 'Layers',
    questions: [
      "How do you ensure security across both the frontend and backend of an application?",
      "Describe your process for debugging a complex issue that spans from the client to the database.",
      "What is the difference between Server-Side Rendering (SSR) and Static Site Generation (SSG)?",
      "Explain how WebSockets differ from traditional HTTP requests and when to use them.",
      "How do you manage database migrations in a production environment?"
    ]
  },
  {
    id: 'datascience',
    title: 'Data Scientist',
    description: 'Machine Learning, Statistics, and Data Analysis.',
    category: 'Data',
    icon: 'Database',
    questions: [
      "What is the difference between supervised and unsupervised learning?",
      "Explain the concept of overfitting and how you can prevent it.",
      "How do you handle missing or imbalanced data in a dataset?",
      "Describe the difference between L1 and L2 regularization.",
      "What is a p-value and how is it used in hypothesis testing?"
    ]
  },
  {
    id: 'devops',
    title: 'DevOps Engineer',
    description: 'CI/CD, Cloud Infrastructure, and Scalability.',
    category: 'Infrastructure',
    icon: 'Cloud',
    questions: [
      "What is Infrastructure as Code (IaC) and why is it important?",
      "Explain the difference between continuous integration, continuous delivery, and continuous deployment.",
      "How do you secure a CI/CD pipeline?",
      "What are containers, and how do they differ from virtual machines?",
      "How do you monitor the health and performance of a distributed system in production?"
    ]
  },
  {
    id: 'cybersecurity',
    title: 'Cybersecurity Analyst',
    description: 'Threat detection, network security, and incident response.',
    category: 'Security',
    icon: 'Shield',
    questions: [
      "What is the difference between Symmetric and Asymmetric encryption?",
      "Explain the concept of a Man-in-the-Middle (MitM) attack and how to prevent it.",
      "What are the phases of an incident response plan?",
      "Describe the difference between a vulnerability assessment and penetration testing.",
      "How do you secure a web application against SQL injection attacks?"
    ]
  },
  {
    id: 'uiux',
    title: 'UI/UX Designer',
    description: 'User research, wireframing, and visual design systems.',
    category: 'Design',
    icon: 'Layout',
    questions: [
      "What is your process for conducting user research for a new product feature?",
      "Explain the importance of accessibility in modern web design.",
      "How do you handle feedback when a stakeholder disagrees with your design decision?",
      "Describe the difference between UI and UX with an example.",
      "What are design tokens and how do they benefit a design system?"
    ]
  },
  {
    id: 'communication',
    title: 'IT Communication Expert',
    description: 'Check your professional communication, tone, and logical flow.',
    category: 'Soft Skills',
    icon: 'Mic',
    questions: [
      "Tell me about yourself and your professional journey in 2 minutes.",
      "How do you explain a complex technical concept to a non-technical stakeholder?",
      "Describe a time you had a conflict with a team member. How did you resolve it?",
      "What is your approach to giving and receiving constructive criticism?",
      "Why should we hire you? Highlight your unique value proposition clearly."
    ]
  }
];
