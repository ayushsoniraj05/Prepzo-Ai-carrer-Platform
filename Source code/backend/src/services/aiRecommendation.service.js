/**
 * AI Recommendation Service (Prepzo Pro)
 * Powered by Google Gemini
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Groq configuration - High Performance Llama 3.3
const groq = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: 'https://api.groq.com/openai/v1',
});



// Resource Library for high-fidelity thumbnails (Common Skills)
const RESOURCE_METADATA = {
    'dsa': 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&q=80',
    'coding': 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&q=80',
    'system design': 'https://images.unsplash.com/photo-1558494949-ef010cbdcc51?w=800&q=80',
    'os': 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80',
    'dbms': 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&q=80',
    'database': 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&q=80',
    'oops': 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&q=80',
    'javascript': 'https://images.unsplash.com/photo-1555099962-4199c345e5dd?w=800&q=80',
    'typescript': 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80',
    'react': 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80',
    'frontend': 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80',
    'node': 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&q=80',
    'backend': 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80',
    'python': 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80',
    'java': 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80',
    'sql': 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800&q=80',
    'machine learning': 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=800&q=80',
    'data': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
    'cloud': 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&q=80',
    'api': 'https://images.unsplash.com/photo-1558494949-ef010cbdcc51?w=800&q=80',
    'devops': 'https://images.unsplash.com/photo-1618401471353-b98a520d9e46?w=800&q=80',
    'network': 'https://images.unsplash.com/photo-1558494949-ef010cbdcc51?w=800&q=80'
};

const getThumbnail = (skill) => {
    if (!skill || typeof skill !== 'string') return 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80';
    const key = skill.toLowerCase();
    for (const [k, v] of Object.entries(RESOURCE_METADATA)) {
        if (key.includes(k)) return v;
    }
    return 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80'; // Generic high-tech
};

/**
 * Generate Pure AI Recommendations
 * Supports Groq (Primary) and Gemini (Fallback)
 */
export const generateAIRecommendations = async (data) => {
    const { studentProfile, assessmentResults, targetRole, testType = 'field_based' } = data;
    const score = assessmentResults.overallScore || 0;
    
    // Stage Differentiation Logic
    const isStage2 = testType === 'skill_assessment';
    const roadmapHorizon = isStage2 ? "3-month intensive 'Sprint' roadmap" : "6-month broad foundational roadmap";
    const focusArea = isStage2 ? "Deep technical mastery of the specific skills you just tested" : "Broad core engineering fundamentals (DSA, OS, DBMS) and role-based readiness";
    
    const prompt = `
    You are the Prepzo AI placement mentor. Your task is to generate a HIGH-FIDELITY, dynamic career recommendation JSON for a student.
    
    CONTEXT:
    Student Profile: ${JSON.stringify(studentProfile)}
    Assessment Score: ${score}%
    Target Role: ${targetRole}
    Test Mode: ${testType} (${isStage2 ? 'Skill Precision' : 'Field Assessment'})
    Section Performance: ${JSON.stringify(assessmentResults.sections || assessmentResults.sectionResults)}
    
    REQUIREMENTS:
    1. ROADMAP: Generate a structured roadmap with exactly ${isStage2 ? '3 intensive phases' : '4 phases'}.
       - Stage 1 (Field): Focus on broad CS fundamentals first.
       - Stage 2 (Skill): Focus on advanced implementation and system architecting of the specific skills tested.
    2. RESOURCES: For EACH weak skill (score < 70%), recommend exactly:
       - 1 High-quality Course (Real titles/platforms like Coursera, Udemy, etc.)
       - 1 YouTube Playlist (Searchable titles, real-looking IDs)
       - 1 Project (Production-level description)
    3. NO HARDCODED PLACEHOLDERS: Your response must be 100% synthesized by AI.
    4. YOUTUBE LINKS: Use valid-looking YouTube URLs like https://www.youtube.com/watch?v=dQw4w9WgXcQ (placeholders are okay if the titles are high fidelity).
    
    RESPONSE FORMAT (JSON ONLY):
    {
      "analysis": {
        "strengthSummary": "...",
        "weaknessSummary": "...",
        "skillGapAnalysis": "...",
        "careerReadinessScore": ${score},
        "interviewConfidence": ${Math.min(score + 15, 100)},
        "strengths": [],
        "primaryWeaknesses": []
      },
      "career_paths": [
        { "role": "...", "fit_score": 90, "why_this_role": "...", "market_demand": "High", "salary_expectation": "..." }
      ],
      "prioritySkillGaps": [
        { "skill": "...", "importance": "critical", "reasoning": "..." }
      ],
      "recommendations": {
        "courses": [ { "title": "...", "platform": "...", "level": "...", "whyThisCourse": "...", "skill": "...", "duration": "..." } ],
        "youtube": [ { "playlistTitle": "...", "channelName": "...", "url": "...", "skill": "..." } ],
        "projects": [ { "title": "...", "description": "...", "techStack": ["..."], "difficulty": "...", "skill": "..." } ],
        "certifications": [ { "title": "...", "issuingAuthority": "...", "duration": "...", "url": "..." } ]
      },
      "improvementPrediction": {
        "currentScore": ${score},
        "predictedScore": ${Math.min(score + 40, 100)},
        "timeToAchieve": "${isStage2 ? '8 weeks' : '16 weeks'}"
      },
      "learningPath": {
        "title": "${isStage2 ? 'Skill Precision Sprint' : 'Field Core Mastery Roadmap'}",
        "readinessGoal": "Production Ready",
        "phases": [
          { "phase": "...", "weeks": "...", "focus": ["..."], "milestone": "...", "tasks": ["..."] }
        ]
      },
      "summary": "...",
      "confidenceScore": 0.99
    }
    `;

    try {
        console.log(`[aiRecommendation] Calling Groq for ${testType} recommendations...`);
        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile",
            response_format: { type: "json_object" },
            temperature: 0.7,
            max_tokens: 3000
        });

        const aiData = JSON.parse(completion.choices[0].message.content);

        // Enrichment with high-quality thumbnails
        return processAIData(aiData, 'Groq (Llama 3.3)');
    } catch (error) {
        console.error('Groq Failed, falling back to Gemini...', error.message);
        try {
            const model = genAI.getGenerativeModel({ 
                model: "gemini-1.5-pro",
                generationConfig: { responseMimeType: "application/json" }
            });
            const result = await model.generateContent(prompt);
            const aiData = JSON.parse(result.response.text());
            return processAIData(aiData, 'Gemini 1.5 Pro');
        } catch (geminiError) {
            console.error('Both AI providers failed:', geminiError.message);
            throw geminiError;
        }
    }
};

/**
 * Helper to process AI output and add metadata/thumbnails
 */
const processAIData = (data, provider) => {
    // Enrich with dynamic thumbnails
    if (data.recommendations) {
        if (data.recommendations.courses) {
            data.recommendations.courses = data.recommendations.courses.map(c => ({
                ...c,
                thumbnail: getThumbnail(c.skill || c.title)
            }));
        }
        if (data.recommendations.youtube) {
            data.recommendations.youtube = data.recommendations.youtube.map(v => ({
                ...v,
                thumbnailUrl: getThumbnail(v.skill || v.playlistTitle)
            }));
        }
        if (data.recommendations.projects) {
            data.recommendations.projects = data.recommendations.projects.map(p => ({
                ...p,
                thumbnailUrl: getThumbnail(p.skill || p.title)
            }));
        }
    }

    return {
        ...data,
        generatedBy: provider,
        metadata: {
            timestamp: new Date(),
            provider: provider,
            accuracyTarget: '100%'
        }
    };
};


/**
 * Generate Quick Insights
 */
export const generateQuickInsights = async (data) => {
    const { assessmentResults, placementReadinessScore } = data;
    
    // Quick heuristic logic for dashboard speed
    const strengths = assessmentResults.sectionResults?.filter(s => s.score >= 70).map(s => s.name) || [];
    const weaknesses = assessmentResults.sectionResults?.filter(s => s.score < 50).map(s => s.name) || [];

    return {
        readinessLevel: placementReadinessScore >= 80 ? 'Placement Ready' : placementReadinessScore >= 50 ? 'Developing' : 'Beginner',
        score: placementReadinessScore,
        summary: `You are currently in the ${placementReadinessScore >= 50 ? 'Intermediate' : 'Learning'} phase. Focus on ${weaknesses[0] || 'core concepts'} to increase your readiness score.`,
        highlights: [
            `Top Strength: ${strengths[0] || 'Learning Velocity'}`,
            `Key Area: ${weaknesses[0] || 'Domain Knowledge'}`
        ]
    };
};

export const validateRecommendations = (recs) => {
    return !!recs && typeof recs === 'object' && !!recs.analysis;
};
