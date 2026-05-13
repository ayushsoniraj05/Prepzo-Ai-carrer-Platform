/**
 * AI Testing Suite
 * 
 * Automated tests for AI recommendation system.
 * Run these tests whenever model is updated to ensure quality.
 * 
 * Test Categories:
 * 1. Structure validation
 * 2. Role-specific recommendations
 * 3. Skill gap alignment
 * 4. Performance benchmarks
 * 5. Hallucination detection
 */

import aiValidator from '../services/aiValidator.service.js';
import aiService from '../services/aiService.js';
import aiMonitoring from '../services/aiMonitoring.service.js';

// =============================================================================
// TEST CASE DEFINITIONS
// =============================================================================

const TEST_CASES = [
  // Case 1: Backend student weak in DBMS
  {
    id: 'TC001',
    name: 'Backend Developer - Weak DBMS',
    description: 'Backend student weak in DBMS should get DBMS prioritized',
    input: {
      studentProfile: {
        name: 'Test Student 1',
        degree: 'B.Tech',
        fieldOfStudy: 'Computer Science',
        year: '3rd Year',
        targetRole: 'Backend Developer',
        targetCompanies: ['Google', 'Amazon', 'Microsoft'],
      },
      assessmentResults: {
        overallScore: 58,
        sectionResults: [
          { section: 'DBMS', score: 35, correct: 7, total: 20 },
          { section: 'DSA', score: 70, correct: 14, total: 20 },
          { section: 'API Design', score: 65, correct: 13, total: 20 },
          { section: 'System Design', score: 50, correct: 10, total: 20 },
        ],
      },
    },
    expectedBehavior: {
      mustIncludeInWeaknesses: ['DBMS', 'database', 'sql'],
      mustIncludeInRecommendations: ['DBMS', 'database', 'sql'],
      mustNotInclude: ['UI/UX', 'Android', 'iOS', 'Graphic Design'],
      dbmsMustBePriority: true,
    },
  },

  // Case 2: Frontend student strong in React
  {
    id: 'TC002',
    name: 'Frontend Developer - Strong React',
    description: 'Frontend student strong in React should NOT get React basics recommended',
    input: {
      studentProfile: {
        name: 'Test Student 2',
        degree: 'B.Tech',
        fieldOfStudy: 'Computer Science',
        year: '3rd Year',
        targetRole: 'Frontend Developer',
        targetCompanies: ['Meta', 'Airbnb', 'Netflix'],
      },
      assessmentResults: {
        overallScore: 72,
        sectionResults: [
          { section: 'React', score: 90, correct: 18, total: 20 },
          { section: 'JavaScript', score: 85, correct: 17, total: 20 },
          { section: 'CSS', score: 55, correct: 11, total: 20 },
          { section: 'Testing', score: 45, correct: 9, total: 20 },
        ],
      },
    },
    expectedBehavior: {
      mustIncludeInStrengths: ['React', 'JavaScript'],
      mustIncludeInWeaknesses: ['CSS', 'Testing'],
      mustNotRecommend: ['React fundamentals', 'React basics', 'Introduction to React'],
      mustIncludeInRecommendations: ['CSS', 'Testing'],
      mustNotInclude: ['Backend', 'DBMS', 'Machine Learning'],
    },
  },

  // Case 3: Advanced student
  {
    id: 'TC003',
    name: 'Advanced Student - High Scores',
    description: 'Advanced student should get advanced-level recommendations',
    input: {
      studentProfile: {
        name: 'Test Student 3',
        degree: 'B.Tech',
        fieldOfStudy: 'Computer Science',
        year: '4th Year',
        targetRole: 'Software Engineer',
        targetCompanies: ['Google', 'Meta', 'Apple'],
      },
      assessmentResults: {
        overallScore: 85,
        sectionResults: [
          { section: 'DSA', score: 90, correct: 18, total: 20 },
          { section: 'System Design', score: 75, correct: 15, total: 20 },
          { section: 'OOPS', score: 85, correct: 17, total: 20 },
          { section: 'Problem Solving', score: 88, correct: 17, total: 20 },
        ],
      },
    },
    expectedBehavior: {
      recommendationLevelShouldBe: ['intermediate', 'advanced', 'expert'],
      mustNotRecommend: ['basics', 'fundamentals', 'introduction', 'beginner'],
      projectDifficulty: ['intermediate', 'advanced'],
    },
  },

  // Case 4: Data Science student
  {
    id: 'TC004',
    name: 'Data Science Student - ML Weak',
    description: 'Data Science student weak in ML should get ML recommendations',
    input: {
      studentProfile: {
        name: 'Test Student 4',
        degree: 'M.Tech',
        fieldOfStudy: 'Data Science',
        year: '2nd Year',
        targetRole: 'Data Scientist',
        targetCompanies: ['Amazon', 'Netflix', 'Uber'],
      },
      assessmentResults: {
        overallScore: 60,
        sectionResults: [
          { section: 'Machine Learning', score: 40, correct: 8, total: 20 },
          { section: 'Statistics', score: 75, correct: 15, total: 20 },
          { section: 'Python', score: 80, correct: 16, total: 20 },
          { section: 'SQL', score: 65, correct: 13, total: 20 },
        ],
      },
    },
    expectedBehavior: {
      mustIncludeInWeaknesses: ['Machine Learning', 'ML'],
      mustIncludeInRecommendations: ['Machine Learning', 'ML', 'Deep Learning'],
      mustNotInclude: ['Frontend', 'React', 'Android', 'iOS'],
    },
  },

  // Case 5: Very weak student
  {
    id: 'TC005',
    name: 'Weak Student - Multiple Gaps',
    description: 'Student with multiple weak areas should get prioritized recommendations',
    input: {
      studentProfile: {
        name: 'Test Student 5',
        degree: 'B.Tech',
        fieldOfStudy: 'Computer Science',
        year: '2nd Year',
        targetRole: 'Software Engineer',
        targetCompanies: ['Any product company'],
      },
      assessmentResults: {
        overallScore: 35,
        sectionResults: [
          { section: 'DSA', score: 25, correct: 5, total: 20 },
          { section: 'OOPS', score: 30, correct: 6, total: 20 },
          { section: 'DBMS', score: 40, correct: 8, total: 20 },
          { section: 'Problem Solving', score: 45, correct: 9, total: 20 },
        ],
      },
    },
    expectedBehavior: {
      mustIncludeInWeaknesses: ['DSA', 'OOPS'],
      minWeaknesses: 2,
      minRecommendations: 3,
      dsaMustBePriority: true, // DSA is weakest at 25%
    },
  },
];

// =============================================================================
// TEST RUNNER
// =============================================================================

/**
 * Run a single test case
 */
const runTestCase = async (testCase, aiResponse) => {
  const result = {
    id: testCase.id,
    name: testCase.name,
    passed: true,
    assertions: [],
    errors: [],
    warnings: [],
  };

  const expected = testCase.expectedBehavior;
  
  // Get text representations for searching
  const weaknessesText = JSON.stringify(
    aiResponse.weaknesses || aiResponse.analysisInsights?.primaryWeaknesses || []
  ).toLowerCase();
  
  const strengthsText = JSON.stringify(
    aiResponse.strengths || aiResponse.analysisInsights?.strengths || []
  ).toLowerCase();
  
  const recommendationsText = JSON.stringify(aiResponse.recommendations || {}).toLowerCase();
  const skillGapsText = JSON.stringify(aiResponse.prioritySkillGaps || []).toLowerCase();

  // Check mustIncludeInWeaknesses
  if (expected.mustIncludeInWeaknesses) {
    const found = expected.mustIncludeInWeaknesses.some(term => 
      weaknessesText.includes(term.toLowerCase()) || skillGapsText.includes(term.toLowerCase())
    );
    addAssertion(result, 'mustIncludeInWeaknesses', found, 
      `Expected one of [${expected.mustIncludeInWeaknesses.join(', ')}] in weaknesses`);
  }

  // Check mustIncludeInStrengths
  if (expected.mustIncludeInStrengths) {
    const found = expected.mustIncludeInStrengths.some(term => 
      strengthsText.includes(term.toLowerCase())
    );
    addAssertion(result, 'mustIncludeInStrengths', found,
      `Expected one of [${expected.mustIncludeInStrengths.join(', ')}] in strengths`);
  }

  // Check mustIncludeInRecommendations
  if (expected.mustIncludeInRecommendations) {
    const found = expected.mustIncludeInRecommendations.some(term => 
      recommendationsText.includes(term.toLowerCase())
    );
    addAssertion(result, 'mustIncludeInRecommendations', found,
      `Expected one of [${expected.mustIncludeInRecommendations.join(', ')}] in recommendations`);
  }

  // Check mustNotInclude
  if (expected.mustNotInclude) {
    const forbidden = expected.mustNotInclude.filter(term => 
      recommendationsText.includes(term.toLowerCase())
    );
    addAssertion(result, 'mustNotInclude', forbidden.length === 0,
      `Found forbidden terms in recommendations: [${forbidden.join(', ')}]`);
  }

  // Check mustNotRecommend
  if (expected.mustNotRecommend) {
    const forbidden = expected.mustNotRecommend.filter(term => 
      recommendationsText.includes(term.toLowerCase())
    );
    addAssertion(result, 'mustNotRecommend', forbidden.length === 0,
      `Found forbidden recommendations: [${forbidden.join(', ')}]`);
  }

  // Check recommendation levels for advanced students
  if (expected.recommendationLevelShouldBe) {
    const courses = aiResponse.recommendations?.courses || [];
    const projects = aiResponse.recommendations?.projects || [];
    
    const allLevels = [
      ...courses.map(c => c.level?.toLowerCase()),
      ...projects.map(p => p.difficulty?.toLowerCase()),
    ].filter(Boolean);

    const hasAppropriateLevel = allLevels.some(level => 
      expected.recommendationLevelShouldBe.includes(level)
    );
    
    addAssertion(result, 'recommendationLevel', hasAppropriateLevel,
      `Expected recommendation levels to be one of [${expected.recommendationLevelShouldBe.join(', ')}]`);
  }

  // Check project difficulty
  if (expected.projectDifficulty) {
    const projects = aiResponse.recommendations?.projects || [];
    const difficulties = projects.map(p => p.difficulty?.toLowerCase()).filter(Boolean);
    
    const hasAppropriateLevel = difficulties.length === 0 || 
      difficulties.some(d => expected.projectDifficulty.includes(d));
    
    addAssertion(result, 'projectDifficulty', hasAppropriateLevel,
      `Expected project difficulty to be one of [${expected.projectDifficulty.join(', ')}]`);
  }

  // Check DBMS priority for backend weak in DBMS
  if (expected.dbmsMustBePriority) {
    const skillGaps = aiResponse.prioritySkillGaps || [];
    const dbmsGap = skillGaps.find(g => 
      g.skill?.toLowerCase().includes('dbms') || 
      g.skill?.toLowerCase().includes('database')
    );
    const isHighPriority = dbmsGap && (dbmsGap.priority === 1 || skillGaps.indexOf(dbmsGap) < 2);
    addAssertion(result, 'dbmsPriority', isHighPriority,
      'Expected DBMS to be a top priority skill gap');
  }

  // Check DSA priority for weak student
  if (expected.dsaMustBePriority) {
    const skillGaps = aiResponse.prioritySkillGaps || [];
    const dsaGap = skillGaps.find(g => 
      g.skill?.toLowerCase().includes('dsa') || 
      g.skill?.toLowerCase().includes('data structure') ||
      g.skill?.toLowerCase().includes('algorithm')
    );
    const isHighPriority = dsaGap && (dsaGap.priority === 1 || skillGaps.indexOf(dsaGap) < 2);
    addAssertion(result, 'dsaPriority', isHighPriority,
      'Expected DSA to be a top priority skill gap');
  }

  // Check minimum weaknesses
  if (expected.minWeaknesses) {
    const weaknesses = aiResponse.weaknesses || aiResponse.analysisInsights?.primaryWeaknesses || [];
    addAssertion(result, 'minWeaknesses', weaknesses.length >= expected.minWeaknesses,
      `Expected at least ${expected.minWeaknesses} weaknesses, got ${weaknesses.length}`);
  }

  // Check minimum recommendations
  if (expected.minRecommendations) {
    const totalRecs = (aiResponse.recommendations?.courses?.length || 0) +
                      (aiResponse.recommendations?.projects?.length || 0);
    addAssertion(result, 'minRecommendations', totalRecs >= expected.minRecommendations,
      `Expected at least ${expected.minRecommendations} recommendations, got ${totalRecs}`);
  }

  return result;
};

/**
 * Add assertion to test result
 */
const addAssertion = (result, name, passed, message) => {
  result.assertions.push({ name, passed, message });
  if (!passed) {
    result.passed = false;
    result.errors.push(message);
  }
};

// =============================================================================
// TEST EXECUTION
// =============================================================================

/**
 * Run all test cases against AI service
 */
export const runAllTests = async (options = {}) => {
  const { verbose = false, mockResponses = null } = options;
  
  console.log('\n========================================');
  console.log('  AI RECOMMENDATION SYSTEM TEST SUITE');
  console.log('========================================\n');

  const results = {
    timestamp: new Date(),
    modelVersion: aiMonitoring.metrics?.model?.version || 'unknown',
    totalTests: TEST_CASES.length,
    passed: 0,
    failed: 0,
    testResults: [],
  };

  for (const testCase of TEST_CASES) {
    console.log(`Running: ${testCase.id} - ${testCase.name}`);
    
    try {
      let aiResponse;
      
      if (mockResponses && mockResponses[testCase.id]) {
        // Use mock response for testing
        aiResponse = mockResponses[testCase.id];
      } else {
        // Call actual AI service
        try {
          const isAvailable = await aiService.isServiceAvailable();
          if (!isAvailable) {
            console.log(`  ⚠ AI service unavailable, skipping actual test`);
            results.testResults.push({
              ...testCase,
              passed: null,
              skipped: true,
              reason: 'AI service unavailable',
            });
            continue;
          }

          aiResponse = await aiService.getRecommendations(
            testCase.input.assessmentResults,
            testCase.input.studentProfile
          );
        } catch (err) {
          console.log(`  ⚠ Failed to get AI response: ${err.message}`);
          results.testResults.push({
            ...testCase,
            passed: false,
            error: err.message,
          });
          results.failed++;
          continue;
        }
      }

      // Run validations
      const validationResult = aiValidator.validateAIResponse(aiResponse, {
        targetRole: testCase.input.studentProfile.targetRole,
        assessmentResults: testCase.input.assessmentResults,
      });

      // Run test case assertions
      const testResult = await runTestCase(testCase, aiResponse);
      
      // Add validation status
      testResult.validationPassed = validationResult.isValid;
      testResult.validationErrors = validationResult.errors;
      testResult.validationWarnings = validationResult.warnings;

      // If validation failed, mark test as failed
      if (!validationResult.isValid) {
        testResult.passed = false;
        testResult.errors.push(...validationResult.errors.map(e => e.message));
      }

      results.testResults.push(testResult);

      if (testResult.passed) {
        console.log(`  ✓ PASSED`);
        results.passed++;
      } else {
        console.log(`  ✗ FAILED`);
        if (verbose) {
          testResult.errors.forEach(err => console.log(`    - ${err}`));
        }
        results.failed++;
      }

    } catch (error) {
      console.log(`  ✗ ERROR: ${error.message}`);
      results.failed++;
      results.testResults.push({
        id: testCase.id,
        name: testCase.name,
        passed: false,
        error: error.message,
      });
    }
  }

  // Summary
  console.log('\n========================================');
  console.log('  TEST SUMMARY');
  console.log('========================================');
  console.log(`Total: ${results.totalTests}`);
  console.log(`Passed: ${results.passed}`);
  console.log(`Failed: ${results.failed}`);
  console.log(`Pass Rate: ${((results.passed / results.totalTests) * 100).toFixed(1)}%`);
  console.log('========================================\n');

  return results;
};

/**
 * Run tests against mock responses for validation logic testing
 */
export const runValidationTests = () => {
  console.log('\n========================================');
  console.log('  VALIDATION LOGIC TESTS');
  console.log('========================================\n');

  const tests = [
    {
      name: 'Valid response should pass',
      response: createValidResponse(),
      shouldPass: true,
    },
    {
      name: 'Missing strengths should fail',
      response: { ...createValidResponse(), strengths: [] },
      shouldPass: false,
      expectedError: 'MISSING_STRENGTHS',
    },
    {
      name: 'Missing recommendations should fail',
      response: { ...createValidResponse(), recommendations: {} },
      shouldPass: false,
      expectedError: 'INSUFFICIENT_RECOMMENDATIONS',
    },
    {
      name: 'Low confidence should fail',
      response: { ...createValidResponse(), confidenceScore: 0.5 },
      shouldPass: false,
      expectedError: 'LOW_CONFIDENCE',
    },
    {
      name: 'Role mismatch should fail',
      response: createRoleMismatchResponse(),
      targetRole: 'Backend Developer',
      shouldPass: false,
      expectedError: 'ROLE_MISMATCH',
    },
    {
      name: 'Ignored skill gap should fail',
      response: createMissingSkillGapResponse(),
      assessmentResults: {
        sectionResults: [
          { section: 'DBMS', score: 30 },
          { section: 'DSA', score: 80 },
        ],
      },
      shouldPass: false,
      expectedError: 'SKILL_GAP_IGNORED',
    },
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    const result = aiValidator.validateAIResponse(test.response, {
      targetRole: test.targetRole,
      assessmentResults: test.assessmentResults,
    });

    const testPassed = test.shouldPass ? result.isValid : !result.isValid;
    const hasExpectedError = test.expectedError 
      ? result.errors.some(e => e.code === test.expectedError)
      : true;

    if (testPassed && hasExpectedError) {
      console.log(`  ✓ ${test.name}`);
      passed++;
    } else {
      console.log(`  ✗ ${test.name}`);
      console.log(`    Expected: ${test.shouldPass ? 'PASS' : 'FAIL'}`);
      console.log(`    Got: ${result.isValid ? 'PASS' : 'FAIL'}`);
      if (test.expectedError && !hasExpectedError) {
        console.log(`    Missing expected error: ${test.expectedError}`);
      }
      failed++;
    }
  }

  console.log('\n========================================');
  console.log(`Validation Tests - Passed: ${passed}, Failed: ${failed}`);
  console.log('========================================\n');

  return { passed, failed };
};

// =============================================================================
// HELPER FUNCTIONS FOR MOCK RESPONSES
// =============================================================================

function createValidResponse() {
  return {
    strengths: ['Strong problem solving', 'Good in DSA'],
    weaknesses: ['Weak in DBMS', 'Needs improvement in System Design'],
    prioritySkillGaps: [
      {
        skill: 'DBMS',
        currentLevel: 'beginner',
        requiredLevel: 'intermediate',
        priority: 1,
        reasoning: 'DBMS is critical for backend roles',
      },
    ],
    recommendations: {
      courses: [
        {
          title: 'Complete SQL Masterclass',
          platform: 'Udemy',
          url: 'https://udemy.com/sql-course',
          level: 'Intermediate',
          duration: '20 hours',
          skillsTargeted: ['SQL', 'DBMS'],
          whyThisCourse: 'This course specifically addresses your DBMS weakness and aligns with backend developer requirements.',
          priority: 1,
        },
      ],
      youtube: [],
      certifications: [],
      projects: [
        {
          title: 'Build a REST API with Database',
          description: 'Create a full backend API with PostgreSQL',
          techStack: ['Node.js', 'PostgreSQL', 'Express'],
          difficulty: 'intermediate',
          skillsGained: ['DBMS', 'API Design'],
          priority: 1,
        },
      ],
    },
    improvementPrediction: {
      currentScore: 58,
      predictedScoreAfter: 75,
      timeToAchieve: '6 weeks',
    },
    summary: 'Based on your assessment, you have strong problem-solving skills but need to focus on DBMS and database concepts. The recommended courses and projects will help you become a stronger backend developer candidate.',
    confidenceScore: 0.85,
  };
}

function createRoleMismatchResponse() {
  return {
    ...createValidResponse(),
    recommendations: {
      courses: [
        {
          title: 'Android Development Masterclass',
          platform: 'Udemy',
          skillsTargeted: ['Android', 'Kotlin', 'Mobile Development'],
          whyThisCourse: 'Learn Android development',
          priority: 1,
        },
      ],
      projects: [
        {
          title: 'iOS App',
          techStack: ['Swift', 'Xcode'],
          skillsGained: ['iOS Development'],
          difficulty: 'intermediate',
        },
      ],
    },
    prioritySkillGaps: [
      { skill: 'Android Development', priority: 1 },
    ],
  };
}

function createMissingSkillGapResponse() {
  return {
    ...createValidResponse(),
    weaknesses: ['Weak in DSA'], // DBMS not mentioned
    prioritySkillGaps: [
      { skill: 'DSA', priority: 1, reasoning: 'Focus on algorithms' },
    ],
    recommendations: {
      courses: [
        {
          title: 'DSA Course',
          skillsTargeted: ['DSA'],
          whyThisCourse: 'Improve DSA skills',
        },
      ],
      projects: [
        { title: 'Algorithm Project', skillsGained: ['DSA'] },
      ],
    },
  };
}

// =============================================================================
// EXPORTS
// =============================================================================

export { TEST_CASES };

export default {
  runAllTests,
  runValidationTests,
  TEST_CASES,
};
