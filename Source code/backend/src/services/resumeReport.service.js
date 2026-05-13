const ROLE_KEYWORDS = {
  'Backend Developer': ['node.js', 'rest api', 'mongodb', 'docker', 'microservices', 'api security', 'system design', 'redis'],
  'Frontend Developer': ['react', 'typescript', 'javascript', 'html', 'css', 'redux', 'performance', 'accessibility'],
  'Full Stack Developer': ['react', 'node.js', 'mongodb', 'sql', 'rest api', 'docker', 'testing', 'system design'],
  'Software Engineer': ['data structures', 'algorithms', 'system design', 'api', 'database', 'testing', 'cloud', 'git'],
  'Data Scientist': ['python', 'sql', 'machine learning', 'statistics', 'pandas', 'feature engineering', 'visualization'],
  'Machine Learning Engineer': ['python', 'tensorflow', 'pytorch', 'mlops', 'docker', 'model deployment', 'feature store', 'monitoring'],
};

const DEMO_JD_LIBRARY = {
  backend_node: {
    title: 'Backend Developer - Node.js',
    role: 'Backend Developer',
    description:
      'Looking for a Backend Developer with strong experience in Node.js, REST APIs, MongoDB, Docker, and microservices architecture. Experience with API security, performance optimization, and cloud deployment is preferred.',
  },
  frontend_react: {
    title: 'Frontend Developer - React',
    role: 'Frontend Developer',
    description:
      'Looking for a Frontend Developer with expertise in React, TypeScript, performance optimization, responsive UI, and accessibility. Experience with testing frameworks and component architecture is required.',
  },
  fullstack_web: {
    title: 'Full Stack Developer',
    role: 'Full Stack Developer',
    description:
      'Seeking a Full Stack Developer with React, Node.js, API development, SQL/NoSQL databases, CI/CD, and cloud deployment experience. Strong debugging and system design fundamentals are expected.',
  },
  ml_engineer: {
    title: 'Machine Learning Engineer',
    role: 'Machine Learning Engineer',
    description:
      'Hiring an ML Engineer with Python, PyTorch or TensorFlow, model serving, feature engineering, MLOps pipelines, Docker, and monitoring experience. Data processing and experimentation rigor is important.',
  },
};

const STOPWORDS = new Set([
  'the', 'and', 'for', 'with', 'that', 'this', 'from', 'are', 'you', 'your', 'our', 'their', 'into', 'using', 'over', 'under', 'have', 'has', 'had', 'will', 'would', 'can', 'could', 'should', 'about', 'more', 'less', 'than', 'through', 'across', 'looking', 'experience',
]);

const ACTION_VERBS = [
  'developed',
  'designed',
  'implemented',
  'optimized',
  'led',
  'built',
  'engineered',
  'deployed',
  'delivered',
  'improved',
  'scaled',
  'automated',
];

const tokenize = (text = '') =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9+.#\-\s]/g, ' ')
    .split(/\s+/)
    .filter((token) => token && !STOPWORDS.has(token) && token.length > 2);

const unique = (arr) => [...new Set(arr.filter(Boolean))];

const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, value));

const normalizePhrase = (value = '') => value.toLowerCase().replace(/\s+/g, ' ').trim();

const extractKeywordsFromJD = (jobDescription = '', role = 'Software Engineer') => {
  const roleDefaults = ROLE_KEYWORDS[role] || ROLE_KEYWORDS['Software Engineer'];
  const tokens = tokenize(jobDescription);
  const frequentTokens = Object.entries(tokens.reduce((acc, token) => {
    acc[token] = (acc[token] || 0) + 1;
    return acc;
  }, {}))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([token]) => token);

  const phraseMatches = unique(
    [
      ...roleDefaults,
      ...(jobDescription.match(/\b([a-zA-Z0-9.+#\-]{3,}(?:\s+[a-zA-Z0-9.+#\-]{3,})?)\b/g) || []),
    ]
      .map((term) => normalizePhrase(term))
      .filter((term) => term.length > 2)
  );

  return unique([...roleDefaults.map(normalizePhrase), ...frequentTokens, ...phraseMatches]).slice(0, 18);
};

const hasToken = (text, keyword) => {
  const normalizedText = normalizePhrase(text);
  const normalizedKeyword = normalizePhrase(keyword);
  return normalizedText.includes(normalizedKeyword);
};

const scoreBreakdown = ({
  resumeText,
  role,
  keywordMatchRate,
  projectCount,
  experienceCount,
  educationCount,
  actionVerbHits,
  quantifiedHits,
  formatHealth,
}) => {
  const roleSkills = ROLE_KEYWORDS[role] || ROLE_KEYWORDS['Software Engineer'];
  const text = normalizePhrase(resumeText);
  const relevantSkillHits = roleSkills.filter((skill) => hasToken(text, skill)).length;
  const skillRelevance = clamp((relevantSkillHits / Math.max(roleSkills.length, 1)) * 100);
  const projectQuality = clamp(projectCount * 20 + quantifiedHits * 5, 0, 100);
  const experienceRelevance = clamp(experienceCount * 22 + keywordMatchRate * 35, 0, 100);
  const educationAlignment = clamp(educationCount > 0 ? 80 : 45);
  const actionVerbStrength = clamp(actionVerbHits * 16, 0, 100);
  const quantImpact = clamp(quantifiedHits * 20, 0, 100);
  const keywordDensity = clamp(keywordMatchRate * 100, 0, 100);

  const factors = [
    { id: 'keywordMatchWithJD', label: 'Keyword match with JD', weight: 18, score: keywordDensity },
    { id: 'technicalSkillRelevance', label: 'Technical skill relevance', weight: 16, score: skillRelevance },
    { id: 'projectQuality', label: 'Project quality', weight: 14, score: projectQuality },
    { id: 'workExperienceRelevance', label: 'Work experience relevance', weight: 14, score: experienceRelevance },
    { id: 'educationAlignment', label: 'Education alignment', weight: 8, score: educationAlignment },
    { id: 'resumeStructureFormatting', label: 'Resume structure and formatting', weight: 10, score: formatHealth },
    { id: 'actionVerbs', label: 'Use of action verbs', weight: 8, score: actionVerbStrength },
    { id: 'quantifiableAchievements', label: 'Quantifiable achievements', weight: 7, score: quantImpact },
    { id: 'industryKeywordDensity', label: 'Industry keyword density', weight: 5, score: keywordDensity },
  ];

  const weightedScore = factors.reduce((acc, factor) => acc + (factor.score * factor.weight) / 100, 0);

  return {
    factors,
    weightedScore: clamp(weightedScore),
  };
};

const buildRewriteLines = (resumeText = '') => {
  const lines = resumeText
    .split(/\n+/)
    .map((line) => line.trim())
    .filter((line) => line.length > 20)
    .slice(0, 6);

  return lines.slice(0, 3).map((line, index) => {
    const verb = ACTION_VERBS[index % ACTION_VERBS.length];
    const percent = 20 + index * 10;
    return {
      original: line,
      improved: `${verb.charAt(0).toUpperCase()}${verb.slice(1)} ${line.replace(/^[a-z]/, (c) => c.toLowerCase())}, delivering measurable outcomes and improving efficiency by ${percent}% in production workflows.`,
      reason: 'Adds strong action verb, measurable impact, and clearer ownership.',
    };
  });
};

export const buildAdvancedResumeReport = ({
  aiAnalysis,
  resumeText,
  role,
  user,
  jobDescription,
  demoJobId,
}) => {
  const normalizedRole = role || user?.targetRole || 'Software Engineer';
  const jobDescriptionUsed = jobDescription?.trim() || DEMO_JD_LIBRARY[demoJobId]?.description || '';
  const jdKeywords = extractKeywordsFromJD(jobDescriptionUsed, normalizedRole);
  const normalizedResume = normalizePhrase(resumeText);

  const matchedKeywords = jdKeywords.filter((keyword) => hasToken(normalizedResume, keyword));
  const missingKeywords = jdKeywords.filter((keyword) => !matchedKeywords.includes(keyword));
  const keywordMatchRate = matchedKeywords.length / Math.max(jdKeywords.length, 1);

  const extracted = aiAnalysis.extracted_data || {};
  const projectCount = (extracted.projects || []).length;
  const experienceCount = (extracted.experience || []).length;
  const educationCount = (extracted.education || []).length;
  const formatIssues = (aiAnalysis.format_analysis || []).filter((item) => item.status !== 'good').length;
  const formatHealth = clamp(100 - formatIssues * 18, 45, 100);

  const actionVerbHits = ACTION_VERBS.filter((verb) => normalizedResume.includes(verb)).length;
  const quantifiedHits = (resumeText.match(/\b\d+(?:\.\d+)?%?\b/g) || []).length;

  const breakdown = scoreBreakdown({
    resumeText,
    role: normalizedRole,
    keywordMatchRate,
    projectCount,
    experienceCount,
    educationCount,
    actionVerbHits,
    quantifiedHits,
    formatHealth,
  });

  // Normalize AI score keys (Python uses camelCase, Node sometimes expects snake_case)
  const baselineScore = aiAnalysis.overallScore || aiAnalysis.overall_score || aiAnalysis.ats_score || 0;
  const finalATS = clamp(baselineScore * 0.45 + breakdown.weightedScore * 0.55);

  const roleSkills = ROLE_KEYWORDS[normalizedRole] || ROLE_KEYWORDS['Software Engineer'];
  const currentSkills = unique([...(aiAnalysis.extracted_data?.skills || []), ...(aiAnalysis.keywords || [])]).map(normalizePhrase);
  const missingRoleSkills = roleSkills.filter((skill) => !currentSkills.some((have) => have.includes(normalizePhrase(skill))));

  const rewriteLines = buildRewriteLines(resumeText);

  const percentile = clamp(finalATS * 0.9, 1, 99);
  const interviewProbability = clamp(
    finalATS * 0.55 + Math.max(0, 100 - missingRoleSkills.length * 10) * 0.25 + Math.min(projectCount * 12, 100) * 0.2,
    5,
    98
  );

  const expectedImprovement = clamp(finalATS + Math.min(24, missingRoleSkills.length * 4 + 8));

  return {
    overallScore: finalATS,
    keywords: unique([...(aiAnalysis.keywords || []), ...matchedKeywords]).slice(0, 20),
    missingKeywords: unique([...(aiAnalysis.missing_keywords || []), ...missingKeywords]).slice(0, 20),
    improvedLines: rewriteLines.length ? rewriteLines : aiAnalysis.improved_lines || [],
    jobMatch: {
      score: clamp(keywordMatchRate * 100),
      matchedSkills: matchedKeywords,
      missingSkills: missingKeywords,
      feedback:
        keywordMatchRate >= 0.7
          ? 'Strong alignment with the selected role and JD. Prioritize interview readiness and architecture depth.'
          : 'Moderate alignment. Address missing JD keywords and showcase stronger role-specific impact metrics.',
      targetRole: normalizedRole,
      matchPercentage: clamp(keywordMatchRate * 100),
      requiredSkillsMatch: roleSkills.slice(0, 8).map((skill) => ({
        skill,
        found: !missingRoleSkills.includes(skill),
        importance: roleSkills.slice(0, 5).includes(skill) ? 'required' : 'preferred',
      })),
    },
    roleContext: {
      targetRole: normalizedRole,
      jobDescriptionUsed,
      demoJobId: demoJobId || null,
      analyzedAgainst: jobDescriptionUsed ? 'custom-or-demo-jd' : 'role-baseline',
    },
    keywordAnalysis: {
      jdKeywords,
      matchedKeywords,
      missingKeywords,
      keywordMatchRate: clamp(keywordMatchRate * 100),
      industryKeywordDensity: clamp((matchedKeywords.length / Math.max((resumeText.match(/\b\w+\b/g) || []).length, 1)) * 1000),
    },
    parsedResume: {
      name: user?.fullName || 'Student',
      education: extracted.education || [],
      technicalSkills: extracted.skills || [],
      projects: extracted.projects || [],
      workExperience: extracted.experience || [],
      certifications: extracted.certifications || [],
      technologiesUsed: unique([...(extracted.skills || []), ...(aiAnalysis.keywords || [])]).slice(0, 20),
      achievements: extracted.achievements || [],
    },
    skillGapAnalysis: {
      currentSkills: unique(extracted.skills || []),
      missingSkills: missingRoleSkills,
      recommendations: missingRoleSkills.slice(0, 5).map((skill) => `Build one applied project that demonstrates ${skill} in production scenarios.`),
    },
    atsBreakdown: {
      factors: breakdown.factors,
      weightedScore: breakdown.weightedScore,
      baselineAIATS: baselineScore,
    },
    projectQualityEvaluation: {
      projectCount,
      score: clamp(projectCount * 20 + quantifiedHits * 6, 0, 100),
      notes:
        projectCount >= 3
          ? 'Project depth is good. Add architecture decisions, scale, and measurable outcomes.'
          : 'Add 2-3 role-aligned projects with clear business impact and deployed links.',
    },
    aiRecommendations: {
      skillsToLearn: missingRoleSkills.slice(0, 6),
      projectsToBuild: missingRoleSkills.slice(0, 4).map((skill) => `${normalizedRole} project focused on ${skill}`),
      certificationsToPursue: [
        'AWS Certified Cloud Practitioner',
        'Google Professional Certificate (Role-aligned)',
        'Docker and Kubernetes specialization',
      ],
      technologiesToAdd: missingKeywords.slice(0, 8),
      coursesToTake: [
        'System Design fundamentals',
        'API architecture and scalability',
        'Behavioral + technical interview preparation',
      ],
      industryTools: ['GitHub', 'Postman', 'Docker', 'CI/CD', 'Cloud monitoring tools'],
    },
    resumeRewrite: {
      beforeAfterPairs: rewriteLines,
      summaryRewrite:
        aiAnalysis.suggested_summary ||
        `Role-focused ${normalizedRole} profile with demonstrated impact, measurable outcomes, and strong alignment to modern engineering standards.`,
    },
    recruiterSimulation: {
      strengths: (aiAnalysis.strengths || []).slice(0, 3),
      concerns: [
        ...missingRoleSkills.slice(0, 3).map((skill) => `Limited evidence for ${skill} in projects/experience.`),
        ...(quantifiedHits < 3 ? ['Few quantifiable achievements were detected.'] : []),
      ].slice(0, 4),
      recommendation:
        'Add role-specific architecture bullets, measurable metrics, and one project closely matching the selected JD stack.',
    },
    linkedinOptimization: {
      optimizedHeadline: `${normalizedRole} | ${(unique([...(extracted.skills || []), ...matchedKeywords]).slice(0, 4) || ['Problem Solving']).join(' | ')}`,
      summarySuggestions: [
        'Start with your target role and strongest technical stack in the first line.',
        'Show 2-3 quantified outcomes from projects or internships.',
        'Highlight deployment, collaboration, and ownership responsibilities.',
      ],
      skillHighlights: unique([...(extracted.skills || []), ...matchedKeywords]).slice(0, 10),
      networkingStrategies: [
        'Engage weekly with hiring managers and engineers in your target domain.',
        'Publish one practical build or learning post every week.',
        'Request project-based endorsements from peers/mentors.',
      ],
      portfolioLinksSuggestions: [
        'GitHub profile with pinned role-aligned repositories',
        'Live project demos with architecture notes',
        'Resume + portfolio landing page',
      ],
    },
    resumeRanking: {
      percentile,
      tier: percentile >= 80 ? 'Top 20%' : percentile >= 60 ? 'Top 40%' : 'Developing',
      rankingFactors: {
        atsScore: finalATS,
        skillRelevance: clamp((1 - missingRoleSkills.length / Math.max(roleSkills.length, 1)) * 100),
        projectQuality: clamp(projectCount * 20 + quantifiedHits * 5, 0, 100),
        experienceRelevance: clamp(experienceCount * 25 + keywordMatchRate * 30, 0, 100),
      },
    },
    interviewSuccess: {
      probability: interviewProbability,
      strengths: (aiAnalysis.strengths || []).slice(0, 3),
      weaknesses: unique([...(aiAnalysis.weaknesses || []), ...missingRoleSkills]).slice(0, 4),
      communicationReadiness: clamp(60 + quantifiedHits * 6, 40, 96),
      recommendations: [
        'Prepare impact-driven project stories using STAR format.',
        'Practice role-specific system design or practical problem rounds.',
        'Align resume keywords with interview narrative examples.',
      ],
    },
    scoreSimulation: {
      currentScore: finalATS,
      expectedScoreAfterImprovements: expectedImprovement,
      topActions: [
        'Add missing JD keywords naturally to projects and experience.',
        'Rewrite 3 weak bullets with quantified outcomes.',
        'Build one role-specific project matching the selected JD stack.',
      ],
    },
    careerRoadmap: {
      milestones: [
        { week: 'Week 1', goal: 'Close top 3 skill gaps', output: 'Skill drills + mini implementation tasks' },
        { week: 'Week 2', goal: 'Ship role-aligned project upgrade', output: 'Production-ready project with metrics' },
        { week: 'Week 3', goal: 'Interview preparation sprint', output: 'Mock interviews + refined behavioral stories' },
        { week: 'Week 4', goal: 'Application optimization', output: 'Tailored resume versions and targeted outreach' },
      ],
    },
    mentorContextPrompts: [
      `How can I improve my resume for ${normalizedRole}?`,
      'Why is my ATS score low and what should I fix first?',
      'Which projects should I add to improve recruiter confidence?',
    ],
  };
};

export const getDemoJobDescriptions = () => DEMO_JD_LIBRARY;
