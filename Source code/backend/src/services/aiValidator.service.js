/**
 * AI Output Validator Service
 * Comprehensive validation for AI-generated recommendations
 * 
 * Validates:
 * - Required fields exist
 * - No empty/duplicate recommendations
 * - No generic phrases
 * - Role consistency
 * - Skill gap alignment
 * - Confidence score thresholds
 * - Hallucination detection
 */

import mongoose from 'mongoose';

// =============================================================================
// CONFIGURATION
// =============================================================================

const CONFIG = {
  MIN_CONFIDENCE_SCORE: 0.75,
  MIN_RECOMMENDATIONS_PER_CATEGORY: 1,
  MAX_RETRY_ATTEMPTS: 2,
  GENERIC_PHRASES: [
    'learn programming fundamentals',
    'practice coding',
    'improve your skills',
    'study more',
    'work harder',
    'learn programming',
    'practice more',
    'keep learning',
    'study basics',
    'learn the basics',
    'improve communication',
    'enhance your knowledge',
    'get better at coding',
    'become a better developer',
    'master the fundamentals',
  ],
  URL_PATTERNS: {
    youtube: /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/.+/i,
    coursera: /^https?:\/\/(www\.)?coursera\.org\/.+/i,
    udemy: /^https?:\/\/(www\.)?udemy\.com\/.+/i,
    generic: /^https?:\/\/.+\..+\/.+/i,
  },
};

// =============================================================================
// ROLE SKILL MATRIX
// =============================================================================

const ROLE_SKILL_MATRIX = {
  'Backend Developer': {
    required: ['DBMS', 'API', 'SQL', 'Server', 'REST', 'Node.js', 'Python', 'Java', 'System Design', 'Security'],
    optional: ['Docker', 'Kubernetes', 'Redis', 'MongoDB', 'PostgreSQL', 'GraphQL', 'Microservices'],
    forbidden: ['UI/UX Design', 'Graphic Design', 'Adobe Photoshop', 'Figma', 'Sketch', 'Android Development', 'iOS Development', 'Swift', 'Kotlin'],
  },
  'Frontend Developer': {
    required: ['JavaScript', 'HTML', 'CSS', 'React', 'Vue', 'Angular', 'TypeScript', 'DOM', 'Responsive Design'],
    optional: ['Redux', 'Next.js', 'Webpack', 'Sass', 'Tailwind', 'Testing', 'Accessibility'],
    forbidden: ['Machine Learning', 'Data Science', 'TensorFlow', 'PyTorch', 'Android Development', 'iOS Development'],
  },
  'Full Stack Developer': {
    required: ['JavaScript', 'Node.js', 'React', 'DBMS', 'API', 'SQL', 'HTML', 'CSS'],
    optional: ['Docker', 'AWS', 'MongoDB', 'PostgreSQL', 'TypeScript', 'GraphQL', 'Redis'],
    forbidden: ['Machine Learning', 'Data Science', 'Android Development', 'iOS Development', 'Graphic Design'],
  },
  'Data Scientist': {
    required: ['Python', 'Machine Learning', 'Statistics', 'SQL', 'Data Analysis', 'Pandas', 'NumPy', 'Visualization'],
    optional: ['TensorFlow', 'PyTorch', 'Deep Learning', 'NLP', 'Computer Vision', 'Spark', 'R'],
    forbidden: ['iOS Development', 'Android Development', 'React Native', 'UI/UX Design', 'Graphic Design'],
  },
  'DevOps Engineer': {
    required: ['Docker', 'Kubernetes', 'CI/CD', 'AWS', 'Linux', 'Shell Scripting', 'Terraform', 'Monitoring'],
    optional: ['Azure', 'GCP', 'Ansible', 'Jenkins', 'GitLab', 'Prometheus', 'Grafana'],
    forbidden: ['UI/UX Design', 'Graphic Design', 'Mobile Development', 'React Native'],
  },
  'Machine Learning Engineer': {
    required: ['Python', 'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'MLOps', 'Statistics'],
    optional: ['NLP', 'Computer Vision', 'Kubernetes', 'Docker', 'AWS SageMaker', 'Spark'],
    forbidden: ['UI/UX Design', 'Graphic Design', 'Mobile Development', 'Frontend Development'],
  },
  'Software Engineer': {
    required: ['DSA', 'System Design', 'OOPS', 'Problem Solving', 'Coding'],
    optional: ['Any technical skill'],
    forbidden: ['Graphic Design', 'UI/UX Design', 'Content Writing'],
  },
  'Android Developer': {
    required: ['Kotlin', 'Java', 'Android SDK', 'Jetpack', 'XML', 'Material Design'],
    optional: ['Compose', 'Room', 'Retrofit', 'Dagger', 'Testing'],
    forbidden: ['iOS Development', 'Swift', 'React', 'Vue', 'Angular'],
  },
  'iOS Developer': {
    required: ['Swift', 'Objective-C', 'iOS SDK', 'UIKit', 'SwiftUI', 'Xcode'],
    optional: ['Core Data', 'ARKit', 'HealthKit', 'Testing'],
    forbidden: ['Android Development', 'Kotlin', 'React', 'Vue', 'Angular'],
  },
};

// =============================================================================
// REQUIRED RESPONSE SCHEMA
// =============================================================================

const REQUIRED_SCHEMA = {
  strengths: { type: 'array', minLength: 1 },
  weaknesses: { type: 'array', minLength: 1 },
  prioritySkillGaps: { type: 'array', minLength: 1 },
  recommendations: {
    type: 'object',
    properties: {
      courses: { type: 'array', minLength: 1 },
      youtube: { type: 'array', minLength: 0 },
      certifications: { type: 'array', minLength: 0 },
      projects: { type: 'array', minLength: 1 },
    },
  },
  improvementPrediction: { type: 'object', required: true },
  summary: { type: 'string', minLength: 50 },
  confidenceScore: { type: 'number', min: 0, max: 1 },
};

// =============================================================================
// VALIDATION RESULTS STRUCTURE
// =============================================================================

class ValidationResult {
  constructor() {
    this.isValid = true;
    this.errors = [];
    this.warnings = [];
    this.fixedIssues = [];
    this.originalResponse = null;
    this.validatedResponse = null;
    this.validationMetrics = {
      structureValid: false,
      contentValid: false,
      roleAligned: false,
      skillGapAligned: false,
      noHallucinations: false,
      confidenceAcceptable: false,
      explanationsPresent: false,
    };
  }

  addError(code, message, field = null) {
    this.isValid = false;
    this.errors.push({ code, message, field, timestamp: new Date() });
  }

  addWarning(code, message, field = null) {
    this.warnings.push({ code, message, field, timestamp: new Date() });
  }

  addFix(description) {
    this.fixedIssues.push({ description, timestamp: new Date() });
  }
}

// =============================================================================
// STRUCTURE VALIDATION
// =============================================================================

/**
 * Validate AI response structure
 */
export const validateStructure = (response) => {
  const result = new ValidationResult();
  result.originalResponse = response;

  if (!response || typeof response !== 'object') {
    result.addError('INVALID_RESPONSE', 'AI response is not a valid object');
    return result;
  }

  // Check top-level required fields
  const requiredTopLevel = ['prioritySkillGaps', 'recommendations', 'improvementPrediction'];
  
  for (const field of requiredTopLevel) {
    if (!(field in response)) {
      result.addError('MISSING_FIELD', `Required field '${field}' is missing`, field);
    }
  }

  // Check for strengths (might be in analysisInsights or top-level)
  const strengths = response.strengths || response.analysisInsights?.strengths;
  if (!strengths || !Array.isArray(strengths) || strengths.length === 0) {
    result.addError('MISSING_STRENGTHS', 'Response must include identified strengths', 'strengths');
  }

  // Check for weaknesses
  const weaknesses = response.weaknesses || 
                     response.analysisInsights?.primaryWeaknesses ||
                     response.analysisInsights?.weaknesses;
  if (!weaknesses || !Array.isArray(weaknesses) || weaknesses.length === 0) {
    result.addError('MISSING_WEAKNESSES', 'Response must include identified weaknesses', 'weaknesses');
  }

  // Validate recommendations structure
  if (response.recommendations) {
    const recCategories = ['courses', 'projects'];
    for (const category of recCategories) {
      if (!response.recommendations[category] || 
          !Array.isArray(response.recommendations[category]) ||
          response.recommendations[category].length < CONFIG.MIN_RECOMMENDATIONS_PER_CATEGORY) {
        result.addError(
          'INSUFFICIENT_RECOMMENDATIONS',
          `At least ${CONFIG.MIN_RECOMMENDATIONS_PER_CATEGORY} ${category} recommendation(s) required`,
          `recommendations.${category}`
        );
      }
    }
  }

  // Validate improvement prediction
  if (response.improvementPrediction) {
    const requiredPredictionFields = ['currentScore', 'predictedScoreAfter'];
    for (const field of requiredPredictionFields) {
      if (!(field in response.improvementPrediction)) {
        result.addError(
          'MISSING_PREDICTION_FIELD',
          `Improvement prediction missing '${field}'`,
          `improvementPrediction.${field}`
        );
      }
    }
  }

  // Check for summary/explanation
  const summary = response.summary || response.explanationSummary;
  if (!summary || typeof summary !== 'string' || summary.length < 50) {
    result.addError(
      'MISSING_SUMMARY',
      'Response must include a detailed summary (min 50 chars)',
      'summary'
    );
  }

  result.validationMetrics.structureValid = result.isValid;
  return result;
};

// =============================================================================
// CONTENT VALIDATION (Sanity Check)
// =============================================================================

/**
 * Validate content quality (no empty, duplicate, or generic content)
 */
export const validateContent = (response, result = new ValidationResult()) => {
  result.originalResponse = result.originalResponse || response;

  // Check for empty recommendations
  if (response.recommendations) {
    for (const [category, items] of Object.entries(response.recommendations)) {
      if (Array.isArray(items)) {
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          
          // Check for empty/missing titles
          const titleField = category === 'youtube' ? 'playlistTitle' : 
                            category === 'certifications' ? 'name' : 'title';
          if (!item[titleField] || item[titleField].trim().length < 3) {
            result.addError(
              'EMPTY_RECOMMENDATION',
              `Empty or missing title in ${category}[${i}]`,
              `recommendations.${category}[${i}].${titleField}`
            );
          }
        }

        // Check for duplicates
        const titles = items.map(item => 
          (item.title || item.playlistTitle || item.name || '').toLowerCase().trim()
        ).filter(Boolean);
        const uniqueTitles = new Set(titles);
        if (titles.length !== uniqueTitles.size) {
          result.addError(
            'DUPLICATE_RECOMMENDATIONS',
            `Duplicate recommendations found in ${category}`,
            `recommendations.${category}`
          );
        }
      }
    }
  }

  // Check for generic phrases
  const textContent = JSON.stringify(response).toLowerCase();
  for (const phrase of CONFIG.GENERIC_PHRASES) {
    if (textContent.includes(phrase.toLowerCase())) {
      result.addWarning(
        'GENERIC_PHRASE_DETECTED',
        `Generic phrase detected: "${phrase}"`,
        'content'
      );
    }
  }

  // Validate URLs format
  if (response.recommendations?.courses) {
    for (const course of response.recommendations.courses) {
      if (course.url && !CONFIG.URL_PATTERNS.generic.test(course.url)) {
        result.addWarning(
          'INVALID_URL_FORMAT',
          `Invalid URL format: ${course.url}`,
          'recommendations.courses.url'
        );
      }
    }
  }

  // Check for explanation in each recommendation
  if (response.recommendations?.courses) {
    for (let i = 0; i < response.recommendations.courses.length; i++) {
      const course = response.recommendations.courses[i];
      if (!course.whyThisCourse || course.whyThisCourse.length < 20) {
        result.addWarning(
          'MISSING_EXPLANATION',
          `Course recommendation ${i + 1} lacks proper explanation`,
          `recommendations.courses[${i}].whyThisCourse`
        );
      }
    }
  }

  // Check priority ranking exists
  if (response.prioritySkillGaps) {
    const hasPriorities = response.prioritySkillGaps.every((gap, index) => 
      gap.priority !== undefined || index === gap.priority
    );
    if (!hasPriorities) {
      result.addWarning(
        'MISSING_PRIORITIES',
        'Skill gaps should have priority rankings',
        'prioritySkillGaps'
      );
    }
  }

  result.validationMetrics.contentValid = result.errors.filter(e => 
    ['EMPTY_RECOMMENDATION', 'DUPLICATE_RECOMMENDATIONS'].includes(e.code)
  ).length === 0;

  return result;
};

// =============================================================================
// ROLE CONSISTENCY VALIDATION
// =============================================================================

/**
 * Validate recommendations align with target role
 */
export const validateRoleConsistency = (response, targetRole, result = new ValidationResult()) => {
  result.originalResponse = result.originalResponse || response;

  const normalizedRole = normalizeRoleName(targetRole);
  const roleMatrix = ROLE_SKILL_MATRIX[normalizedRole] || ROLE_SKILL_MATRIX['Software Engineer'];

  const forbiddenDetected = [];
  const alignedWithRole = [];

  // Extract all skills/topics from recommendations
  const allRecommendedSkills = extractAllSkills(response);

  // Check for forbidden skills
  for (const skill of allRecommendedSkills) {
    const skillLower = skill.toLowerCase();
    for (const forbidden of roleMatrix.forbidden || []) {
      if (skillLower.includes(forbidden.toLowerCase()) || 
          forbidden.toLowerCase().includes(skillLower)) {
        forbiddenDetected.push({ skill, forbidden });
      }
    }
    
    // Check if skill is in required or optional
    const isAligned = [...(roleMatrix.required || []), ...(roleMatrix.optional || [])]
      .some(req => skillLower.includes(req.toLowerCase()) || req.toLowerCase().includes(skillLower));
    if (isAligned) {
      alignedWithRole.push(skill);
    }
  }

  if (forbiddenDetected.length > 0) {
    result.addError(
      'ROLE_MISMATCH',
      `Recommendations include skills not relevant to ${targetRole}: ${forbiddenDetected.map(f => f.skill).join(', ')}`,
      'recommendations'
    );
  }

  // At least 50% of recommendations should align with role
  const alignmentRatio = allRecommendedSkills.length > 0 
    ? alignedWithRole.length / allRecommendedSkills.length 
    : 0;
  
  if (alignmentRatio < 0.5 && allRecommendedSkills.length > 0) {
    result.addWarning(
      'LOW_ROLE_ALIGNMENT',
      `Only ${Math.round(alignmentRatio * 100)}% of recommendations align with ${targetRole}`,
      'recommendations'
    );
  }

  result.validationMetrics.roleAligned = forbiddenDetected.length === 0;
  return result;
};

// =============================================================================
// SKILL GAP ALIGNMENT VALIDATION
// =============================================================================

/**
 * Validate that weak skills from assessment are addressed
 */
export const validateSkillGapAlignment = (response, assessmentResults, result = new ValidationResult()) => {
  result.originalResponse = result.originalResponse || response;

  const weakSections = extractWeakSections(assessmentResults);
  
  if (weakSections.length === 0) {
    result.validationMetrics.skillGapAligned = true;
    return result;
  }

  const addressedInWeaknesses = [];
  const addressedInRecommendations = [];
  const notAddressed = [];

  // Get weaknesses from response
  const responseWeaknesses = response.weaknesses || 
                             response.analysisInsights?.primaryWeaknesses || 
                             [];
  const weaknessesText = responseWeaknesses.join(' ').toLowerCase();

  // Get skill gaps
  const skillGapsText = (response.prioritySkillGaps || [])
    .map(sg => `${sg.skill} ${sg.reasoning || ''}`)
    .join(' ')
    .toLowerCase();

  // Get recommendations text
  const recommendationsText = JSON.stringify(response.recommendations || {}).toLowerCase();

  for (const weakSection of weakSections) {
    const sectionLower = weakSection.name.toLowerCase();
    const alternatives = getSkillAlternatives(weakSection.name);
    
    const isAddressedInWeaknesses = [sectionLower, ...alternatives].some(term => 
      weaknessesText.includes(term) || skillGapsText.includes(term)
    );
    
    const isAddressedInRecommendations = [sectionLower, ...alternatives].some(term =>
      recommendationsText.includes(term)
    );

    if (isAddressedInWeaknesses) {
      addressedInWeaknesses.push(weakSection.name);
    }
    if (isAddressedInRecommendations) {
      addressedInRecommendations.push(weakSection.name);
    }
    if (!isAddressedInWeaknesses && !isAddressedInRecommendations) {
      notAddressed.push(weakSection);
    }
  }

  // Weak sections with score < 40% must be mentioned
  const criticalNotAddressed = notAddressed.filter(s => s.score < 40);
  
  if (criticalNotAddressed.length > 0) {
    result.addError(
      'SKILL_GAP_IGNORED',
      `Critical weak sections (${criticalNotAddressed.map(s => `${s.name}: ${s.score}%`).join(', ')}) not addressed in recommendations`,
      'prioritySkillGaps'
    );
  }

  if (notAddressed.length > 0 && notAddressed.length <= weakSections.length * 0.5) {
    result.addWarning(
      'PARTIAL_SKILL_COVERAGE',
      `Some weak sections not fully addressed: ${notAddressed.map(s => s.name).join(', ')}`,
      'recommendations'
    );
  }

  result.validationMetrics.skillGapAligned = criticalNotAddressed.length === 0;
  return result;
};

// =============================================================================
// CONFIDENCE SCORE VALIDATION
// =============================================================================

/**
 * Validate confidence score
 */
export const validateConfidenceScore = (response, result = new ValidationResult()) => {
  result.originalResponse = result.originalResponse || response;

  const confidenceScore = response.confidenceScore ?? response.confidence ?? null;

  if (confidenceScore === null || confidenceScore === undefined) {
    result.addWarning(
      'MISSING_CONFIDENCE',
      'AI response missing confidence score',
      'confidenceScore'
    );
    result.validationMetrics.confidenceAcceptable = false;
    return result;
  }

  if (typeof confidenceScore !== 'number' || confidenceScore < 0 || confidenceScore > 1) {
    result.addError(
      'INVALID_CONFIDENCE',
      'Confidence score must be a number between 0 and 1',
      'confidenceScore'
    );
    result.validationMetrics.confidenceAcceptable = false;
    return result;
  }

  if (confidenceScore < CONFIG.MIN_CONFIDENCE_SCORE) {
    result.addError(
      'LOW_CONFIDENCE',
      `Confidence score ${confidenceScore} is below threshold ${CONFIG.MIN_CONFIDENCE_SCORE}`,
      'confidenceScore'
    );
    result.validationMetrics.confidenceAcceptable = false;
    return result;
  }

  result.validationMetrics.confidenceAcceptable = true;
  return result;
};

// =============================================================================
// EXPLANATION VALIDATION
// =============================================================================

/**
 * Validate that AI provides explanations for its decisions
 */
export const validateExplanations = (response, result = new ValidationResult()) => {
  result.originalResponse = result.originalResponse || response;

  const explanationIssues = [];

  // Check skill gap explanations
  if (response.prioritySkillGaps) {
    for (let i = 0; i < response.prioritySkillGaps.length; i++) {
      const gap = response.prioritySkillGaps[i];
      if (!gap.reasoning && !gap.impactOnInterviews) {
        explanationIssues.push(`Skill gap '${gap.skill}' missing explanation`);
      }
    }
  }

  // Check course explanations
  if (response.recommendations?.courses) {
    for (const course of response.recommendations.courses) {
      if (!course.whyThisCourse || course.whyThisCourse.length < 20) {
        explanationIssues.push(`Course '${course.title}' missing explanation`);
      }
    }
  }

  // Check for summary explanation
  const summary = response.summary || response.explanationSummary;
  if (!summary || summary.length < 100) {
    explanationIssues.push('Overall summary/explanation is too brief');
  }

  if (explanationIssues.length > 3) {
    result.addError(
      'INSUFFICIENT_EXPLANATIONS',
      `Multiple explanations missing: ${explanationIssues.slice(0, 3).join('; ')}...`,
      'explanations'
    );
  } else if (explanationIssues.length > 0) {
    result.addWarning(
      'PARTIAL_EXPLANATIONS',
      `Some explanations missing: ${explanationIssues.join('; ')}`,
      'explanations'
    );
  }

  result.validationMetrics.explanationsPresent = explanationIssues.length <= 2;
  return result;
};

// =============================================================================
// HALLUCINATION DETECTION
// =============================================================================

/**
 * Simple hallucination detection (check for known fake/invalid content)
 */
export const detectHallucinations = (response, knowledgeBase = null, result = new ValidationResult()) => {
  result.originalResponse = result.originalResponse || response;

  const hallucinations = [];

  // Check for obviously fake certification providers
  const fakeCertProviders = ['FakeCert', 'QuickCert', 'InstantDegree'];
  if (response.recommendations?.certifications) {
    for (const cert of response.recommendations.certifications) {
      if (fakeCertProviders.some(fake => cert.provider?.includes(fake))) {
        hallucinations.push(`Fake certification provider: ${cert.provider}`);
      }
    }
  }

  // Check for invalid URLs (if URL doesn't look like a real domain)
  const suspiciousUrlPatterns = [
    /example\.com/i,
    /test\.com/i,
    /fake\.com/i,
    /placeholder/i,
  ];

  const allUrls = extractAllUrls(response);
  for (const url of allUrls) {
    for (const pattern of suspiciousUrlPatterns) {
      if (pattern.test(url)) {
        hallucinations.push(`Suspicious URL: ${url}`);
      }
    }
  }

  // Check for known real platforms in courses
  const validPlatforms = ['Coursera', 'Udemy', 'edX', 'Pluralsight', 'LinkedIn Learning', 
                          'Udacity', 'YouTube', 'FreeCodeCamp', 'Codecademy', 'Skillshare',
                          'Khan Academy', 'MIT OpenCourseWare', 'Stanford Online', 'Google', 
                          'Microsoft Learn', 'AWS Training', 'LeetCode', 'HackerRank',
                          'Prepzo Academy', 'Prepzo AI', 'Tech Masters', 'Tech Mentor'];
  
  if (response.recommendations?.courses) {
    for (const course of response.recommendations.courses) {
      if (course.platform && !validPlatforms.some(vp => 
        course.platform.toLowerCase().includes(vp.toLowerCase()))) {
        hallucinations.push(`Unverified platform: ${course.platform}`);
      }
    }
  }

  if (hallucinations.length > 0) {
    result.addWarning(
      'POTENTIAL_HALLUCINATIONS',
      `Potential hallucinations detected: ${hallucinations.join('; ')}`,
      'content'
    );
  }

  result.validationMetrics.noHallucinations = hallucinations.length === 0;
  return result;
};

// =============================================================================
// COMPREHENSIVE VALIDATION
// =============================================================================

/**
 * Run all validations and return comprehensive result
 */
export const validateAIResponse = (response, context = {}) => {
  const { targetRole, assessmentResults, knowledgeBase } = context;
  
  let result = new ValidationResult();
  result.originalResponse = response;

  // 1. Structure validation
  result = validateStructure(response);
  if (!result.isValid) {
    return result; // Critical - can't proceed
  }

  // 2. Content validation (sanity checks)
  result = validateContent(response, result);

  // 3. Role consistency validation
  if (targetRole) {
    result = validateRoleConsistency(response, targetRole, result);
  }

  // 4. Skill gap alignment validation
  if (assessmentResults) {
    result = validateSkillGapAlignment(response, assessmentResults, result);
  }

  // 5. Confidence score validation
  result = validateConfidenceScore(response, result);

  // 6. Explanation validation
  result = validateExplanations(response, result);

  // 7. Hallucination detection
  result = detectHallucinations(response, knowledgeBase, result);

  // Set validated response if all critical checks pass
  if (result.isValid) {
    result.validatedResponse = normalizeResponse(response);
  }

  return result;
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function normalizeRoleName(role) {
  if (!role) return 'Software Engineer';
  
  const roleMap = {
    'backend': 'Backend Developer',
    'frontend': 'Frontend Developer',
    'fullstack': 'Full Stack Developer',
    'full stack': 'Full Stack Developer',
    'data scientist': 'Data Scientist',
    'ml engineer': 'Machine Learning Engineer',
    'machine learning': 'Machine Learning Engineer',
    'devops': 'DevOps Engineer',
    'android': 'Android Developer',
    'ios': 'iOS Developer',
    'software engineer': 'Software Engineer',
    'sde': 'Software Engineer',
  };

  const roleLower = role.toLowerCase();
  for (const [key, value] of Object.entries(roleMap)) {
    if (roleLower.includes(key)) {
      return value;
    }
  }
  
  return role;
}

function extractAllSkills(response) {
  const skills = new Set();
  
  // From courses
  if (response.recommendations?.courses) {
    for (const course of response.recommendations.courses) {
      (course.skillsTargeted || []).forEach(s => skills.add(s));
    }
  }
  
  // From projects
  if (response.recommendations?.projects) {
    for (const project of response.recommendations.projects) {
      (project.techStack || []).forEach(s => skills.add(s));
      (project.skillsGained || []).forEach(s => skills.add(s));
    }
  }
  
  // From certifications
  if (response.recommendations?.certifications) {
    for (const cert of response.recommendations.certifications) {
      (cert.skillsValidated || []).forEach(s => skills.add(s));
    }
  }
  
  // From skill gaps
  if (response.prioritySkillGaps) {
    for (const gap of response.prioritySkillGaps) {
      if (gap.skill) skills.add(gap.skill);
    }
  }
  
  return Array.from(skills);
}

function extractWeakSections(assessmentResults) {
  if (!assessmentResults) return [];
  
  const sections = assessmentResults.sectionResults || assessmentResults.sections || [];
  return sections
    .filter(s => (s.score || 0) < 50)
    .map(s => ({
      name: s.section || s.name || s.sectionName,
      score: s.score || 0,
    }))
    .filter(s => s.name);
}

function getSkillAlternatives(skillName) {
  const alternatives = {
    'DBMS': ['database', 'sql', 'mysql', 'postgresql', 'mongodb', 'db'],
    'DSA': ['data structures', 'algorithms', 'dsa', 'arrays', 'trees', 'graphs'],
    'OOPS': ['object oriented', 'oop', 'classes', 'inheritance', 'polymorphism'],
    'OS': ['operating system', 'linux', 'unix', 'processes', 'threads'],
    'CN': ['computer networks', 'networking', 'tcp', 'http', 'protocols'],
    'System Design': ['architecture', 'scalability', 'distributed systems'],
  };
  
  const normalizedName = skillName.toUpperCase();
  return alternatives[normalizedName] || [skillName.toLowerCase()];
}

function extractAllUrls(response) {
  const urls = [];
  
  if (response.recommendations) {
    for (const category of Object.values(response.recommendations)) {
      if (Array.isArray(category)) {
        for (const item of category) {
          if (item.url) urls.push(item.url);
          if (item.githubRepoExample) urls.push(item.githubRepoExample);
        }
      }
    }
  }
  
  return urls;
}

function normalizeResponse(response) {
  // Ensure standard structure
  return {
    strengths: response.strengths || response.analysisInsights?.strengths || [],
    weaknesses: response.weaknesses || response.analysisInsights?.primaryWeaknesses || [],
    prioritySkillGaps: response.prioritySkillGaps || [],
    recommendations: {
      courses: response.recommendations?.courses || [],
      youtube: response.recommendations?.youtube || [],
      certifications: response.recommendations?.certifications || [],
      projects: response.recommendations?.projects || [],
    },
    improvementPrediction: response.improvementPrediction || {},
    learningPath: response.learningPath || {},
    careerAdvice: response.careerAdvice || {},
    summary: response.summary || response.explanationSummary || '',
    confidenceScore: response.confidenceScore ?? response.confidence ?? 0.8,
    analysisInsights: response.analysisInsights || {},
    validatedAt: new Date(),
  };
}

// =============================================================================
// EXPORTS
// =============================================================================

export default {
  validateAIResponse,
  validateStructure,
  validateContent,
  validateRoleConsistency,
  validateSkillGapAlignment,
  validateConfidenceScore,
  validateExplanations,
  detectHallucinations,
  ValidationResult,
  CONFIG,
  ROLE_SKILL_MATRIX,
};
