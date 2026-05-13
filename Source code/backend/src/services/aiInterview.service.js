/**
 * AI Mock Interview Service (Prepzo Pro)
 * Powered by Groq (Llama 3.3)
 */

import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

// Groq configuration - High Performance Llama 3.3
const groq = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: 'https://api.groq.com/openai/v1',
});

/**
 * Generate interview questions based on resume text
 * @param {string} resumeText - The resume content
 * @param {string} targetRole - Target role
 * @param {number} numQuestions - Number of questions
 */
export const getResumeInterviewQuestions = async (resumeText, targetRole, numQuestions = 5) => {
    try {
        const prompt = `
        You are an expert technical recruiter. Generate exactly ${numQuestions} high-quality interview questions for a candidate applying for the role of "${targetRole}".
        
        RESUME CONTENT:
        ${resumeText}
        
        REQUIREMENTS:
        1. Mix behavioral and technical questions based on the candidate's actual experience and skills.
        2. Questions should be challenging but fair.
        3. Format the output as a JSON array of strings.
        
        RESPONSE FORMAT (JSON ONLY):
        {
          "questions": [
            "Question 1...",
            "Question 2...",
            ...
          ]
        }
        `;

        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile",
            response_format: { type: "json_object" },
            temperature: 0.7,
        });

        const data = JSON.parse(completion.choices[0].message.content);
        return {
            success: true,
            data: {
                questions: data.questions || []
            }
        };
    } catch (error) {
        console.error('Groq Question Generation Error:', error);
        return {
            success: false,
            message: 'Failed to generate questions using Groq',
            error: error.message
        };
    }
};

/**
 * Conduct mock interview (Evaluate answer and provide next question)
 * @param {Array} questions - The list of questions
 * @param {number} questionIndex - Index of the question just answered
 * @param {string} userResponse - User's answer to the current question
 */
export const resumeMockInterview = async (questions, questionIndex, userResponse = null) => {
    try {
        // If it's the start (no user response yet), just return the first question
        if (userResponse === null) {
            return {
                success: true,
                data: {
                    question: questions[0],
                    question_number: 1,
                    total_questions: questions.length
                }
            };
        }

        const currentQuestion = questions[questionIndex - 1];
        const nextQuestion = questions[questionIndex];
        const isLast = questionIndex >= questions.length;

        const prompt = `
        You are a mock interview evaluator. 
        
        QUESTION ASKED: "${currentQuestion}"
        CANDIDATE'S RESPONSE: "${userResponse}"
        
        TASK:
        1. Evaluate the candidate's response. Provide concise, constructive feedback.
        2. Give a score from 0-10 based on clarity, technical accuracy, and professional tone.
        3. provide a "perfect_answer" example.
        
        RESPONSE FORMAT (JSON ONLY):
        {
          "feedback": "...",
          "score": 8,
          "perfect_answer": "...",
          "is_complete": ${isLast}
        }
        `;

        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile",
            response_format: { type: "json_object" },
            temperature: 0.5,
        });

        const evaluation = JSON.parse(completion.choices[0].message.content);

        return {
            success: true,
            data: {
                feedback: evaluation.feedback,
                score: evaluation.score,
                perfectAnswer: evaluation.perfect_answer,
                nextQuestion: isLast ? null : nextQuestion,
                question_number: questionIndex + 1,
                total_questions: questions.length,
                is_complete: isLast
            }
        };
    } catch (error) {
        console.error('Groq Interview Evaluation Error:', error);
        return {
            success: false,
            message: 'Failed to evaluate response using Groq',
            error: error.message
        };
    }
};

export default {
    getResumeInterviewQuestions,
    resumeMockInterview
};
