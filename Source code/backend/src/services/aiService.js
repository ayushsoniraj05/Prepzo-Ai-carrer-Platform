/**
 * Prepzo AI Service Client
 * Connects Node.js backend to Python AI microservice
 */

import axios from 'axios';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
const AI_API_KEY = process.env.AI_API_KEY || 'prepzo-ai-secret-key';

// Create axios instance with default config
const aiClient = axios.create({
    baseURL: AI_SERVICE_URL,
    timeout: 600000, // 600 seconds for AI operations
    headers: {
        'Content-Type': 'application/json',
        'X-API-Key': AI_API_KEY
    }
});

// Add response interceptor for error handling
aiClient.interceptors.response.use(
    response => response,
    error => {
        if (error.response) {
            console.error('AI Service Error:', error.response.status, error.response.data);
        } else if (error.request) {
            console.error('AI Service Connection Error:', error.message);
        }
        throw error;
    }
);

/**
 * Check if AI service is available
 */
const isServiceAvailable = async () => {
    try {
        const response = await aiClient.get('/health', { timeout: 20000 });
        return response.data.status === 'healthy';
    } catch (error) {
        console.warn('AI Service not reachable (timeout/down):', error.message);
        return false;
    }
};

/**
 * Check if AI service is ready (models loaded)
 */
const isServiceReady = async () => {
    try {
        const response = await aiClient.get('/ready', { timeout: 20000 });
        return response.data.ready === true;
    } catch (error) {
        return false;
    }
};

// =====================================================
// ASSESSMENT ENDPOINTS
// =====================================================

/**
 * Evaluate MCQ answers
 * @param {Array} questions - Array of {question_id, user_answer, correct_answer, difficulty, time_taken}
 * @param {Object} options - {passing_threshold, time_limit_per_question}
 */
const evaluateMCQ = async (questions, options = {}) => {
    try {
        const response = await aiClient.post('/api/assessment/evaluate/mcq', {
            questions,
            passing_threshold: options.passingThreshold || 60,
            time_limit_per_question: options.timeLimitPerQuestion || 60
        });
        return response.data;
    } catch (error) {
        console.error('MCQ evaluation failed:', error.message);
        throw error;
    }
};

/**
 * Evaluate text/descriptive answers using AI
 * @param {string} question - The question text
 * @param {string} userAnswer - User's answer
 * @param {string} referenceAnswer - Reference/expected answer
 * @param {string} skill - Related skill
 */
const evaluateTextAnswer = async (question, userAnswer, referenceAnswer, skill = 'general') => {
    try {
        const response = await aiClient.post('/api/assessment/evaluate/text', {
            question,
            user_answer: userAnswer,
            reference_answer: referenceAnswer,
            skill
        });
        return response.data;
    } catch (error) {
        console.error('Text evaluation failed:', error.message);
        throw error;
    }
};

/**
 * Evaluate coding answers
 * @param {string} problem - Problem description
 * @param {string} code - User's code
 * @param {Array} testCases - Array of {input, expected_output}
 * @param {string} language - Programming language
 */
const evaluateCodingAnswer = async (problem, code, testCases, language = 'python') => {
    try {
        const response = await aiClient.post('/api/assessment/evaluate/code', {
            problem,
            code,
            test_cases: testCases,
            language
        });
        return response.data;
    } catch (error) {
        console.error('Code evaluation failed:', error.message);
        throw error;
    }
};

/**
 * Calculate section score
 * @param {string} sectionName - Section name (e.g., "Data Structures")
 * @param {Array} answers - Array of answer evaluations
 */
const calculateSectionScore = async (sectionName, answers) => {
    try {
        const response = await aiClient.post('/api/assessment/section/score', {
            section_name: sectionName,
            answers
        });
        return response.data;
    } catch (error) {
        console.error('Section score calculation failed:', error.message);
        throw error;
    }
};

/**
 * Calculate overall assessment
 * @param {Object} data - {user_id, sections, target_role, target_companies}
 */
const calculateOverallAssessment = async (data) => {
    try {
        const response = await aiClient.post('/api/assessment/overall', {
            user_id: data.userId,
            sections: data.sections,
            target_role: data.targetRole,
            target_companies: data.targetCompanies
        });
        return response.data;
    } catch (error) {
        console.error('Overall assessment calculation failed:', error.message);
        throw error;
    }
};

// =====================================================
// RECOMMENDATIONS ENDPOINTS
// =====================================================

/**
 * Generate personalized recommendations
 * @param {Object} studentProfile - Student profile data
 */
const generateRecommendations = async (studentProfile) => {
    try {
        const response = await aiClient.post('/api/recommendations/generate', {
            student_profile: {
                userId: studentProfile.userId,
                targetRole: studentProfile.targetRole || 'Software Engineer',
                currentSkills: studentProfile.currentSkills || [],
                targetCompanies: studentProfile.targetCompanies || [],
                preferences: studentProfile.preferences || {}
            },
            assessment_results: studentProfile.assessmentResults || {
                totalQuestions: 0,
                attemptedQuestions: 0,
                correctAnswers: 0,
                overallScore: 0,
                sections: []
            }
        });
        return response.data;
    } catch (error) {
        console.error('Recommendation generation failed:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * Get skill gaps analysis
 * @param {string} userId - User ID
 * @param {Array} currentSkills - Current skills
 * @param {Object} skillLevels - Skill proficiency levels
 * @param {string} targetRole - Target role
 */
const getSkillGaps = async (userId, currentSkills, skillLevels, targetRole) => {
    try {
        const response = await aiClient.post('/api/recommendations/skill-gaps', {
            user_id: userId,
            current_skills: currentSkills,
            skill_levels: skillLevels,
            target_role: targetRole
        });
        return response.data;
    } catch (error) {
        console.error('Skill gaps analysis failed:', error.message);
        throw error;
    }
};

/**
 * Search for learning resources
 * @param {string} skill - Skill to find resources for
 * @param {string} resourceType - Type: courses, youtube, certifications, all
 * @param {number} limit - Number of results
 */
const searchResources = async (skill, resourceType = 'all', limit = 10) => {
    try {
        const response = await aiClient.get('/api/recommendations/resources/search', {
            params: { skill, resource_type: resourceType, limit }
        });
        return response.data;
    } catch (error) {
        console.error('Resource search failed:', error.message);
        throw error;
    }
};

/**
 * Record recommendation effectiveness (for self-learning)
 * @param {Object} data - {user_id, recommendation_id, resource_id, completed, time_spent, skill_improvement}
 */
const recordEffectiveness = async (data) => {
    try {
        const response = await aiClient.post('/api/recommendations/effectiveness', {
            user_id: data.userId,
            recommendation_id: data.recommendationId,
            resource_id: data.resourceId,
            completed: data.completed,
            time_spent_hours: data.timeSpentHours,
            skill_improvement: data.skillImprovement,
            user_rating: data.userRating
        });
        return response.data;
    } catch (error) {
        console.error('Effectiveness recording failed:', error.message);
        throw error;
    }
};

// =====================================================
// AI MENTOR ENDPOINTS
// =====================================================

/**
 * Chat with AI mentor
 * @param {string} userId - User ID
 * @param {string} sessionId - Session ID
 * @param {string} message - User's message
 * @param {Object} context - Optional context
 */
const chatWithMentor = async (userId, sessionId, message, context = {}) => {
    try {
        const response = await aiClient.post('/api/mentor/chat', {
            user_id: userId,
            session_id: sessionId,
            message,
            context: {
                target_role: context.targetRole,
                current_skills: context.currentSkills,
                learning_goals: context.learningGoals
            }
        });
        return response.data;
    } catch (error) {
        console.error('Mentor chat failed:', error.message);
        throw error;
    }
};

/**
 * Get mentor conversation sessions for a user
 * @param {string} userId - User ID
 */
const getMentorSessions = async (userId) => {
    try {
        const response = await aiClient.get(`/api/mentor/sessions/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Get sessions failed:', error.message);
        throw error;
    }
};

/**
 * Get session history
 * @param {string} sessionId - Session ID
 * @param {number} limit - Number of messages to retrieve
 */
const getSessionHistory = async (sessionId, limit = 50) => {
    try {
        const response = await aiClient.get('/api/mentor/sessions/history', {
            params: { session_id: sessionId, limit }
        });
        return response.data;
    } catch (error) {
        console.error('Get history failed:', error.message);
        throw error;
    }
};

/**
 * Start mock interview practice
 * @param {string} userId - User ID
 * @param {string} topic - Interview topic
 * @param {string} difficulty - Difficulty level
 */
const startInterviewPractice = async (userId, topic, difficulty = 'medium') => {
    try {
        const response = await aiClient.post('/api/mentor/interview/start', {
            user_id: userId,
            topic,
            difficulty
        });
        return response.data;
    } catch (error) {
        console.error('Interview practice start failed:', error.message);
        throw error;
    }
};

/**
 * Explain a concept
 * @param {string} concept - Concept to explain
 * @param {string} studentLevel - beginner, intermediate, advanced
 * @param {Array} relatedSkills - Related skills context
 */
const explainConcept = async (concept, studentLevel = 'intermediate', relatedSkills = []) => {
    try {
        const response = await aiClient.post('/api/mentor/explain', {
            concept,
            student_level: studentLevel,
            related_skills: relatedSkills
        });
        return response.data;
    } catch (error) {
        console.error('Concept explanation failed:', error.message);
        throw error;
    }
};

// =====================================================
// EMBEDDINGS ENDPOINTS
// =====================================================

/**
 * Generate embedding for text
 * @param {string} text - Text to embed
 */
const embedText = async (text) => {
    try {
        const response = await aiClient.post('/api/embeddings/embed', { text });
        return response.data;
    } catch (error) {
        console.error('Text embedding failed:', error.message);
        throw error;
    }
};

/**
 * Generate embeddings for multiple texts
 * @param {Array} texts - Array of texts to embed
 */
const embedBatch = async (texts) => {
    try {
        const response = await aiClient.post('/api/embeddings/embed/batch', { texts });
        return response.data;
    } catch (error) {
        console.error('Batch embedding failed:', error.message);
        throw error;
    }
};

/**
 * Compute similarity between two texts
 * @param {string} text1 - First text
 * @param {string} text2 - Second text
 */
const computeSimilarity = async (text1, text2) => {
    try {
        const response = await aiClient.post('/api/embeddings/similarity', { text1, text2 });
        return response.data;
    } catch (error) {
        console.error('Similarity computation failed:', error.message);
        throw error;
    }
};

// =====================================================
// KNOWLEDGE BASE ENDPOINTS
// =====================================================

/**
 * Search knowledge base
 * @param {string} query - Search query
 * @param {string} entityType - skills, courses, youtube, certifications, questions, roles, all
 * @param {number} topK - Number of results
 */
const searchKnowledgeBase = async (query, entityType = 'all', topK = 10) => {
    try {
        const response = await aiClient.post('/api/knowledge/search', null, {
            params: { query, entity_type: entityType, top_k: topK }
        });
        return response.data;
    } catch (error) {
        console.error('Knowledge base search failed:', error.message);
        throw error;
    }
};

/**
 * Get knowledge base statistics
 */
const getKnowledgeBaseStats = async () => {
    try {
        const response = await aiClient.get('/api/knowledge/stats');
        return response.data;
    } catch (error) {
        console.error('Knowledge base stats failed:', error.message);
        throw error;
    }
};

/**
 * Add a skill to knowledge base
 * @param {Object} skill - {name, category, industry, description, related_skills}
 */
const addSkill = async (skill) => {
    try {
        const response = await aiClient.post('/api/knowledge/skills', skill);
        return response.data;
    } catch (error) {
        console.error('Add skill failed:', error.message);
        throw error;
    }
};

/**
 * Add a course to knowledge base
 * @param {Object} course - {title, platform, url, skills, level, duration, instructor, description}
 */
const addCourse = async (course) => {
    try {
        const response = await aiClient.post('/api/knowledge/courses', course);
        return response.data;
    } catch (error) {
        console.error('Add course failed:', error.message);
        throw error;
    }
};

/**
 * Bulk import to knowledge base
 * @param {string} entityType - Type of entities
 * @param {Array} data - Array of entities
 */
const bulkImport = async (entityType, data) => {
    try {
        const response = await aiClient.post('/api/knowledge/bulk-import', {
            entity_type: entityType,
            data
        });
        return response.data;
    } catch (error) {
        console.error('Bulk import failed:', error.message);
        throw error;
    }
};

// =====================================================
// AI TEST GENERATION ENDPOINTS
// =====================================================

/**
 * Generate a unique AI-powered test for a student
 * @param {Object} studentProfile - Student profile data
 * @param {Object} testConfig - Test configuration
 */
const generateAITest = async (studentProfile, testConfig = {}) => {
    try {
        const response = await aiClient.post('/api/ai-test/generate-test', {
            studentProfile: {
                id: studentProfile.userId || studentProfile.id,
                name: studentProfile.name,
                degree: studentProfile.degree,
                stream: studentProfile.stream,
                fieldOfStudy: studentProfile.fieldOfStudy || studentProfile.stream,
                year: studentProfile.year,
                targetRole: studentProfile.targetRole || 'Software Engineer',
                knownTechnologies: studentProfile.knownTechnologies || studentProfile.currentSkills || [],
                careerGoals: studentProfile.careerGoals
            },
            testConfig
        }, { timeout: 600000 }); // 10 min timeout for complex generation
        return response.data;
    } catch (error) {
        console.error('AI test generation failed:', error.message);
        throw error;
    }
};

/**
 * Generate a company-specific pattern test
 * @param {Object} studentProfile - Student profile data
 * @param {string} company - Company name (amazon, google, tcs, etc.)
 * @param {Object} testConfig - Additional test configuration
 */
const generateCompanyTest = async (studentProfile, company, testConfig = {}) => {
    try {
        const response = await aiClient.post('/api/ai-test/generate-company-test', {
            studentProfile: {
                id: studentProfile.userId || studentProfile.id,
                name: studentProfile.name,
                degree: studentProfile.degree,
                stream: studentProfile.stream,
                year: studentProfile.year,
                targetRole: studentProfile.targetRole || 'Software Engineer',
                knownTechnologies: studentProfile.knownTechnologies || studentProfile.currentSkills || [],
                careerGoals: studentProfile.careerGoals
            },
            testConfig: {
                ...testConfig,
                company: company.toLowerCase()
            }
        }, { timeout: 300000 });
        return response.data;
    } catch (error) {
        console.error('Company test generation failed:', error.message);
        throw error;
    }
};

/**
 * Generate a Stage 1 Field-based Test (60 questions)
 */
const generateFieldTest = async (studentProfile, testConfig = {}) => {
    try {
        const response = await aiClient.post('/api/ai-test/generate-field-test', {
            studentProfile: {
                id: studentProfile.userId || studentProfile.id,
                name: studentProfile.name,
                degree: studentProfile.degree,
                stream: studentProfile.stream,
                fieldOfStudy: studentProfile.fieldOfStudy || studentProfile.stream,
                year: studentProfile.year,
                targetRole: studentProfile.targetRole || 'Software Engineer',
                knownTechnologies: studentProfile.knownTechnologies || studentProfile.currentSkills || [],
                careerGoals: studentProfile.careerGoals
            },
            testConfig: {
                ...testConfig,
                questionCount: 60,
                difficultyRange: 'easy-to-hard'
            }
        }, { timeout: 900000 }); // 15 min for 60 questions
        return response.data;
    } catch (error) {
        console.error('Field test generation failed:', error.message);
        throw error;
    }
};

/**
 * Generate a Stage 2 Skill-based Test (10 questions per skill)
 */
const generateSkillTest = async (studentProfile, skills, testConfig = {}) => {
    try {
        const response = await aiClient.post('/api/ai-test/generate-skill-test', {
            studentProfile: {
                id: studentProfile.userId || studentProfile.id,
                name: studentProfile.name,
                degree: studentProfile.degree,
                stream: studentProfile.stream,
                fieldOfStudy: studentProfile.fieldOfStudy || studentProfile.stream,
                year: studentProfile.year,
                targetRole: studentProfile.targetRole || 'Software Engineer',
                knownTechnologies: studentProfile.knownTechnologies || studentProfile.currentSkills || [],
                careerGoals: studentProfile.careerGoals
            },
            skills,
            testConfig: {
                ...testConfig,
                questionsPerSkill: 10,
                difficultyRange: 'easy-to-hard'
            }
        }, { timeout: 900000 });
        return response.data;
    } catch (error) {
        console.error('Skill test generation failed:', error.message);
        throw error;
    }
};

/**
 * Get adaptive difficulty for next question
 * @param {Object} currentPerformance - Current performance metrics
 * @param {string} currentDifficulty - Current difficulty level
 */
const adaptDifficulty = async (currentPerformance, currentDifficulty) => {
    try {
        const response = await aiClient.post('/api/ai-test/adapt-difficulty', {
            currentPerformance,
            currentDifficulty
        });
        return response.data;
    } catch (error) {
        console.error('Difficulty adaptation failed:', error.message);
        throw error;
    }
};

/**
 * Evaluate code using LeetCode-style judge
 * @param {string} code - Student's submitted code
 * @param {string} language - Programming language
 * @param {Array} testCases - Visible test cases
 * @param {Array} hiddenTestCases - Hidden test cases
 * @param {Object} options - Additional options (timeLimit, memoryLimit, expectedComplexity)
 */
const evaluateCodeWithJudge = async (code, language, testCases, hiddenTestCases = [], options = {}) => {
    try {
        const response = await aiClient.post('/api/ai-test/evaluate-code', {
            code,
            language,
            testCases,
            hiddenTestCases,
            timeLimit: options.timeLimit || 5.0,
            memoryLimit: options.memoryLimit,
            expectedComplexity: options.expectedComplexity
        }, { timeout: 60000 }); // 1 min timeout for code execution
        return response.data;
    } catch (error) {
        console.error('Code evaluation with judge failed:', error.message);
        throw error;
    }
};

/**
 * Get next adaptive question during test
 * @param {Object} studentProfile - Student profile
 * @param {string} section - Current section
 * @param {Object} currentPerformance - Performance so far
 * @param {Array} questionsAnswered - IDs of answered questions
 */
const getNextAdaptiveQuestion = async (studentProfile, section, currentPerformance, questionsAnswered = []) => {
    try {
        const response = await aiClient.post('/api/ai-test/next-question', {
            studentProfile: {
                id: studentProfile.userId || studentProfile.id,
                name: studentProfile.name,
                targetRole: studentProfile.targetRole || 'Software Engineer',
                knownTechnologies: studentProfile.knownTechnologies || []
            },
            section,
            currentPerformance,
            questionsAnswered
        });
        return response.data;
    } catch (error) {
        console.error('Next adaptive question failed:', error.message);
        throw error;
    }
};

/**
 * Get list of supported companies for pattern tests
 */
const getSupportedCompanies = async () => {
    try {
        const response = await aiClient.get('/api/ai-test/supported-companies');
        return response.data;
    } catch (error) {
        console.error('Get supported companies failed:', error.message);
        throw error;
    }
};

/**
 * Get available sections for a stream
 * @param {string} stream - Academic stream
 */
const getSectionsForStream = async (stream) => {
    try {
        const response = await aiClient.get(`/api/ai-test/sections/${encodeURIComponent(stream)}`);
        return response.data;
    } catch (error) {
        console.error('Get sections failed:', error.message);
        throw error;
    }
};

/**
 * Validate answer in real-time
 * @param {string} questionId - Question ID
 * @param {string} questionType - Question type (mcq, coding, short_answer)
 * @param {Object} question - Full question object
 * @param {any} studentAnswer - Student's answer
 * @param {number} timeTaken - Time taken in seconds
 */
const validateAnswer = async (questionId, questionType, question, studentAnswer, timeTaken = 0) => {
    try {
        const response = await aiClient.post('/api/ai-test/validate-answer', null, {
            params: {
                question_id: questionId,
                question_type: questionType,
                time_taken: timeTaken
            },
            data: {
                question,
                student_answer: studentAnswer
            }
        });
        return response.data;
    } catch (error) {
        console.error('Answer validation failed:', error.message);
        throw error;
    }
};

/**
 * Generate interview questions based on resume text
 * @param {string} resumeText - The resume content
 * @param {string} targetRole - Target role
 * @param {number} numQuestions - Number of questions
 */
const getResumeInterviewQuestions = async (resumeText, targetRole, numQuestions = 5) => {
    try {
        const response = await aiClient.post('/recruiter/resume-questions', {
            resume_text: resumeText,
            target_role: targetRole,
            num_questions: numQuestions
        });
        return response.data;
    } catch (error) {
        console.error('Resume question generation failed:', error.message);
        throw error;
    }
};

/**
 * Conduct mock interview based on resume questions
 * @param {Array} questions - Pre-generated questions
 * @param {number} questionIndex - Current question index
 * @param {string} userResponse - User's answer
 */
const resumeMockInterview = async (questions, questionIndex, userResponse = null) => {
    try {
        const response = await aiClient.post('/recruiter/resume-mock-interview', {
            questions,
            question_index: questionIndex,
            user_response: userResponse
        });
        return response.data;
    } catch (error) {
        console.error('Resume mock interview failed:', error.message);
        throw error;
    }
};

export {
    // Service health
    isServiceAvailable,
    isServiceReady,
    
    // Assessment
    evaluateMCQ,
    evaluateTextAnswer,
    evaluateCodingAnswer,
    calculateSectionScore,
    calculateOverallAssessment,
    
    // Recommendations
    generateRecommendations,
    getSkillGaps,
    searchResources,
    recordEffectiveness,
    
    // AI Mentor
    chatWithMentor,
    getMentorSessions,
    getSessionHistory,
    startInterviewPractice,
    explainConcept,
    
    // Embeddings
    embedText,
    embedBatch,
    computeSimilarity,
    
    // Knowledge Base
    searchKnowledgeBase,
    getKnowledgeBaseStats,
    addSkill,
    addCourse,
    bulkImport,
    
    // AI Test Generation
    generateAITest,
    generateFieldTest,
    generateSkillTest,
    generateCompanyTest,
    adaptDifficulty,
    evaluateCodeWithJudge,
    getNextAdaptiveQuestion,
    getSupportedCompanies,
    getSectionsForStream,
    validateAnswer,
    
    // Raw client for custom requests
    aiClient
};

// Default export for convenience
// =====================================================
// RESUME ANALYSIS ENDPOINTS
// =====================================================

/**
 * Analyze resume using AI
 * @param {string} resumeText - The resume content as text
 * @param {string} targetRole - Target job role for optimization
 */
const analyzeResume = async (resumeText, targetRole = 'Software Engineer') => {
    try {
        const response = await aiClient.post('/api/resume/analyze', {
            resume_text: resumeText,
            target_role: targetRole
        });
        return response.data;
    } catch (error) {
        console.error('Resume analysis failed:', error.message);
        throw error;
    }
};

/**
 * Ask AI Resume Mentor a question
 * @param {string} question - User's question
 * @param {Object} userProfile - User profile data
 * @param {Object} resumeAnalysis - User's resume analysis
 * @param {string} context - Additional context
 */
const askResumeMentor = async (question, userProfile = {}, resumeAnalysis = null, context = '') => {
    try {
        const response = await aiClient.post('/api/resume/mentor/ask', {
            question,
            user_profile: userProfile,
            resume_analysis: resumeAnalysis,
            context
        });
        return response.data;
    } catch (error) {
        console.error('Resume mentor query failed:', error.message);
        throw error;
    }
};

/**
 * Get quick tip from Resume Mentor
 * @param {string} targetRole - Target role
 * @param {string} category - Tip category
 */
const getResumeMentorQuickTip = async (targetRole = 'Software Engineer', category = 'general') => {
    try {
        const response = await aiClient.post('/api/resume/mentor/quick-tip', {
            target_role: targetRole,
            category
        });
        return response.data;
    } catch (error) {
        console.error('Resume mentor quick tip failed:', error.message);
        throw error;
    }
};

/**
 * Get improvement checklist from Resume Mentor
 * @param {Object} resumeAnalysis - User's resume analysis
 * @param {string} targetRole - Target role
 */
const getResumeMentorChecklist = async (resumeAnalysis, targetRole = 'Software Engineer') => {
    try {
        const response = await aiClient.post('/api/resume/mentor/checklist', {
            resume_analysis: resumeAnalysis,
            target_role: targetRole
        });
        return response.data;
    } catch (error) {
        console.error('Resume mentor checklist failed:', error.message);
        throw error;
    }
};

/**
 * Generate a professional resume using pure AI
 * @param {Object} userProfile - User profile data
 * @param {string} targetRole - Target role
 * @param {string} jobDescription - Optional job description
 */
const generateResume = async (userProfile, targetRole = 'Software Engineer', jobDescription = null, templateStyle = 'Standard Professional ATS') => {
    try {
        const response = await aiClient.post('/api/resume/generate', {
            user_profile: userProfile,
            target_role: targetRole,
            job_description: jobDescription,
            template_style: templateStyle
        });
        return response.data;
    } catch (error) {
        console.error('Resume generation failed:', error.message);
        throw error;
    }
};

/**
 * Get role-specific skill requirements
 * @param {string} role - Target role
 */
const getRoleSkillRequirements = async (role) => {
    try {
        const response = await aiClient.get(`/api/resume/skills/${encodeURIComponent(role)}`);
        return response.data;
    } catch (error) {
        console.error('Role skill requirements failed:', error.message);
        throw error;
    }
};

/**
 * Get action verb suggestions
 * @param {string} category - Verb category (optional)
 */
const getActionVerbs = async (category = null) => {
    try {
        const url = category 
            ? `/api/resume/action-verbs?category=${encodeURIComponent(category)}`
            : '/api/resume/action-verbs';
        const response = await aiClient.get(url);
        return response.data;
    } catch (error) {
        console.error('Action verbs fetch failed:', error.message);
        throw error;
    }
};

export default {
    isServiceAvailable,
    isServiceReady,
    evaluateMCQ,
    evaluateTextAnswer,
    evaluateCodingAnswer,
    calculateSectionScore,
    calculateOverallAssessment,
    generateRecommendations,
    getSkillGaps,
    searchResources,
    recordEffectiveness,
    chatWithMentor,
    getMentorSessions,
    getSessionHistory,
    startInterviewPractice,
    explainConcept,
    embedText,
    embedBatch,
    computeSimilarity,
    searchKnowledgeBase,
    getKnowledgeBaseStats,
    addSkill,
    addCourse,
    bulkImport,
    generateAITest,
    generateFieldTest,
    generateSkillTest,
    generateCompanyTest,
    adaptDifficulty,
    evaluateCodeWithJudge,
    getNextAdaptiveQuestion,
    getSupportedCompanies,
    getSectionsForStream,
    validateAnswer,
    // Resume Analysis
    analyzeResume,
    askResumeMentor,
    getResumeMentorQuickTip,
    getResumeMentorChecklist,
    getRoleSkillRequirements,
    getActionVerbs,
    generateResume,
    getResumeInterviewQuestions,
    resumeMockInterview,
    aiClient
};
