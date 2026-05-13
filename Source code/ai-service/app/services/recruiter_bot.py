"""
AI Recruiter Bot Service
Company-specific AI guidance and interview preparation
"""

from typing import List, Dict, Optional, Any
import json
import asyncio
from datetime import datetime
from app.services.model_service import ModelService
from app.services.embedding_service import EmbeddingService
from app.services.vector_store import VectorStore
import logging

logger = logging.getLogger(__name__)


class RecruiterBotService:
    """AI-powered recruiter bot for company-specific career guidance"""
    
    def __init__(self):
        self.model_service = ModelService()
        self.embedding_service = EmbeddingService()
        self.vector_store = VectorStore(self.embedding_service)
        
        # Company interview patterns database
        self.company_patterns = {
            "google": {
                "interview_rounds": ["Phone Screen", "Technical Phone", "Onsite (4-5 rounds)", "Team Match"],
                "focus_areas": ["Data Structures", "Algorithms", "System Design", "Behavioral (Googleyness)"],
                "difficulty": "very_high",
                "preparation_time": "3-6 months",
                "key_tips": [
                    "Practice on LeetCode (medium/hard problems)",
                    "Focus on time and space complexity analysis",
                    "Learn the STAR method for behavioral questions",
                    "Study Google's leadership principles"
                ]
            },
            "microsoft": {
                "interview_rounds": ["Phone Screen", "Technical Interviews", "Onsite (4-5 rounds)"],
                "focus_areas": ["Coding", "System Design", "Problem Solving", "Culture Fit"],
                "difficulty": "high",
                "preparation_time": "2-4 months",
                "key_tips": [
                    "Understand Microsoft's growth mindset culture",
                    "Practice coding problems on whiteboard/paper",
                    "Be ready to discuss past projects in detail",
                    "Focus on collaboration and communication"
                ]
            },
            "amazon": {
                "interview_rounds": ["Online Assessment", "Phone Screen", "Onsite (5-6 rounds)", "Bar Raiser"],
                "focus_areas": ["Leadership Principles", "System Design", "Coding", "Behavioral"],
                "difficulty": "very_high",
                "preparation_time": "2-4 months",
                "key_tips": [
                    "Master all 16 Amazon Leadership Principles",
                    "Prepare STAR stories for each principle",
                    "Practice system design at scale",
                    "Be data-driven in your answers"
                ]
            },
            "meta": {
                "interview_rounds": ["Initial Screen", "Technical Phone", "Onsite (4-5 rounds)"],
                "focus_areas": ["Coding", "System Design", "Behavioral", "Product Sense"],
                "difficulty": "very_high",
                "preparation_time": "2-4 months",
                "key_tips": [
                    "Focus on efficient code and optimization",
                    "Think at scale (billions of users)",
                    "Prepare for product design questions",
                    "Show passion for Meta's mission"
                ]
            },
            "apple": {
                "interview_rounds": ["Phone Screen", "Technical Interview", "Onsite (6-8 rounds)"],
                "focus_areas": ["Technical Skills", "Design Thinking", "Problem Solving", "Culture"],
                "difficulty": "very_high",
                "preparation_time": "3-5 months",
                "key_tips": [
                    "Understand Apple's attention to detail",
                    "Be prepared for longer interview process",
                    "Show passion for Apple products",
                    "Focus on user experience"
                ]
            },
            "default": {
                "interview_rounds": ["Phone Screen", "Technical Interview", "Onsite/Final Round"],
                "focus_areas": ["Technical Skills", "Problem Solving", "Communication", "Culture Fit"],
                "difficulty": "moderate",
                "preparation_time": "1-2 months",
                "key_tips": [
                    "Research the company thoroughly",
                    "Practice common coding problems",
                    "Prepare examples of past achievements",
                    "Have thoughtful questions ready"
                ]
            }
        }
    
    def _get_company_pattern(self, company_name: str) -> Dict[str, Any]:
        """Get interview pattern for a company"""
        normalized_name = company_name.lower().strip()
        
        # Check for known companies
        for key in self.company_patterns:
            if key in normalized_name:
                return self.company_patterns[key]
        
        return self.company_patterns["default"]
    
    async def get_company_interview_guide(
        self,
        company_name: str,
        role: str,
        user_profile: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Get comprehensive interview preparation guide for a company
        
        Args:
            company_name: Name of the company
            role: Target role/position
            user_profile: Optional user profile for personalization
            
        Returns:
            Complete interview preparation guide
        """
        pattern = self._get_company_pattern(company_name)
        
        guide = {
            "company": company_name,
            "role": role,
            "interview_process": {
                "rounds": pattern["interview_rounds"],
                "focus_areas": pattern["focus_areas"],
                "estimated_duration": "2-6 weeks",
                "difficulty": pattern["difficulty"]
            },
            "preparation": {
                "recommended_time": pattern["preparation_time"],
                "key_tips": pattern["key_tips"],
                "resources": self._get_preparation_resources(pattern["focus_areas"])
            },
            "common_questions": await self._get_common_questions(company_name, role),
            "technical_topics": self._get_technical_topics(role, pattern["focus_areas"]),
        }
        
        # Add personalized advice if user profile provided
        if user_profile:
            guide["personalized_advice"] = await self._generate_personalized_advice(
                company_name, role, user_profile, pattern
            )
        
        return guide
    
    def _get_preparation_resources(self, focus_areas: List[str]) -> Dict[str, List[str]]:
        """Get preparation resources based on focus areas"""
        resources = {
            "platforms": [],
            "books": [],
            "courses": []
        }
        
        focus_lower = [f.lower() for f in focus_areas]
        
        if any("algorithm" in f or "data structure" in f or "coding" in f for f in focus_lower):
            resources["platforms"].extend(["LeetCode", "HackerRank", "CodeSignal"])
            resources["books"].append("Cracking the Coding Interview")
            resources["courses"].append("Algorithms Specialization (Coursera)")
        
        if any("system design" in f for f in focus_lower):
            resources["platforms"].append("System Design Primer (GitHub)")
            resources["books"].extend(["Designing Data-Intensive Applications", "System Design Interview"])
            resources["courses"].append("Grokking System Design Interview")
        
        if any("behavioral" in f or "leadership" in f for f in focus_lower):
            resources["books"].append("The STAR Interview Method")
            resources["platforms"].append("Glassdoor Interview Reviews")
        
        return resources
    
    async def _get_common_questions(
        self,
        company_name: str,
        role: str
    ) -> Dict[str, List[str]]:
        """Get common interview questions for company and role"""
        
        # Technical questions based on role
        technical_questions = []
        behavioral_questions = [
            "Tell me about yourself and your journey.",
            "Describe a challenging project you've worked on.",
            "How do you handle disagreements with team members?",
            "Tell me about a time you failed and what you learned.",
            "Why do you want to work here?",
        ]
        
        role_lower = role.lower()
        
        if "frontend" in role_lower or "react" in role_lower or "web" in role_lower:
            technical_questions = [
                "Explain the difference between var, let, and const.",
                "What is the Virtual DOM and how does it work?",
                "How do you optimize web application performance?",
                "Explain CSS Box Model and Flexbox/Grid.",
                "What are closures in JavaScript?",
            ]
        elif "backend" in role_lower or "server" in role_lower:
            technical_questions = [
                "Explain RESTful API design principles.",
                "How would you design a rate limiter?",
                "What is database indexing and when to use it?",
                "Explain microservices vs monolithic architecture.",
                "How do you handle authentication and authorization?",
            ]
        elif "fullstack" in role_lower or "full stack" in role_lower:
            technical_questions = [
                "Walk me through a full-stack application architecture.",
                "How do you ensure data consistency between frontend and backend?",
                "Explain state management in modern web apps.",
                "How would you design a scalable real-time chat application?",
                "What are your strategies for API versioning?",
            ]
        elif "data" in role_lower or "ml" in role_lower or "ai" in role_lower:
            technical_questions = [
                "Explain the bias-variance tradeoff.",
                "How do you handle imbalanced datasets?",
                "What is cross-validation and why is it important?",
                "Explain gradient descent and its variants.",
                "How would you deploy a ML model to production?",
            ]
        else:
            technical_questions = [
                "Explain a complex technical concept in simple terms.",
                "How do you approach debugging a difficult issue?",
                "Tell me about your favorite programming language and why.",
                "How do you stay updated with new technologies?",
                "Describe your development workflow.",
            ]
        
        # System design questions
        system_design = [
            "Design a URL shortening service like bit.ly.",
            "Design a social media news feed.",
            "Design a rate limiter for an API.",
            "Design a caching system.",
            "Design a notification system.",
        ]
        
        return {
            "technical": technical_questions,
            "behavioral": behavioral_questions,
            "system_design": system_design,
        }
    
    def _get_technical_topics(
        self,
        role: str,
        focus_areas: List[str]
    ) -> List[Dict[str, Any]]:
        """Get technical topics to prepare for"""
        topics = []
        
        role_lower = role.lower()
        
        # Core DS/Algo topics
        dsa_topics = [
            {"topic": "Arrays and Strings", "priority": "high"},
            {"topic": "Hash Tables", "priority": "high"},
            {"topic": "Trees and Graphs", "priority": "high"},
            {"topic": "Dynamic Programming", "priority": "medium"},
            {"topic": "Sorting and Searching", "priority": "medium"},
            {"topic": "Recursion and Backtracking", "priority": "medium"},
        ]
        
        # Role-specific topics
        if "frontend" in role_lower:
            topics.extend([
                {"topic": "JavaScript/TypeScript Fundamentals", "priority": "high"},
                {"topic": "React/Vue/Angular Concepts", "priority": "high"},
                {"topic": "CSS and Responsive Design", "priority": "high"},
                {"topic": "Web Performance Optimization", "priority": "medium"},
                {"topic": "Browser APIs and DOM", "priority": "medium"},
            ])
        elif "backend" in role_lower:
            topics.extend([
                {"topic": "Database Design (SQL/NoSQL)", "priority": "high"},
                {"topic": "API Design (REST/GraphQL)", "priority": "high"},
                {"topic": "Caching Strategies", "priority": "medium"},
                {"topic": "Message Queues", "priority": "medium"},
                {"topic": "Microservices Patterns", "priority": "medium"},
            ])
        elif "data" in role_lower or "ml" in role_lower:
            topics.extend([
                {"topic": "Statistics and Probability", "priority": "high"},
                {"topic": "Machine Learning Algorithms", "priority": "high"},
                {"topic": "Data Processing (Pandas/NumPy)", "priority": "high"},
                {"topic": "Model Evaluation Metrics", "priority": "medium"},
                {"topic": "Feature Engineering", "priority": "medium"},
            ])
        
        topics.extend(dsa_topics)
        
        return topics
    
    async def _generate_personalized_advice(
        self,
        company_name: str,
        role: str,
        user_profile: Dict[str, Any],
        pattern: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generate personalized advice based on user profile"""
        
        user_skills = user_profile.get("skills", [])
        user_experience = user_profile.get("experience_years", 0)
        
        advice = {
            "strengths_to_highlight": [],
            "areas_to_improve": [],
            "preparation_priorities": [],
            "timeline_suggestion": pattern["preparation_time"]
        }
        
        # Analyze strengths based on focus areas
        for area in pattern["focus_areas"]:
            area_lower = area.lower()
            
            # Check if user has relevant skills
            matching_skills = [
                s for s in user_skills 
                if area_lower in s.lower() or s.lower() in area_lower
            ]
            
            if matching_skills:
                advice["strengths_to_highlight"].append({
                    "area": area,
                    "relevant_skills": matching_skills[:3]
                })
            else:
                advice["areas_to_improve"].append({
                    "area": area,
                    "suggestion": f"Practice {area.lower()} problems and concepts"
                })
        
        # Preparation priorities based on experience
        if user_experience < 2:
            advice["preparation_priorities"] = [
                "Focus heavily on Data Structures & Algorithms",
                "Build 2-3 solid projects to discuss",
                "Practice explaining technical concepts clearly",
                "Prepare for behavioral questions with STAR method"
            ]
        else:
            advice["preparation_priorities"] = [
                "Deep dive into System Design",
                "Prepare detailed stories about leadership and impact",
                "Review advanced algorithmic patterns",
                "Practice presenting complex solutions"
            ]
        
        return advice
    
    async def answer_question(
        self,
        company_name: str,
        question: str,
        conversation_history: Optional[List[Dict]] = None,
        user_profile: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Answer user question as company-specific recruiter bot
        
        Args:
            company_name: Company context
            question: User's question
            conversation_history: Previous conversation
            user_profile: User's profile for personalization
            
        Returns:
            AI-generated response
        """
        pattern = self._get_company_pattern(company_name)
        
        # Build context
        context = f"""You are an AI career advisor specializing in {company_name} interviews and hiring process.

Company Interview Information:
- Interview Rounds: {', '.join(pattern['interview_rounds'])}
- Focus Areas: {', '.join(pattern['focus_areas'])}
- Difficulty Level: {pattern['difficulty']}
- Recommended Preparation Time: {pattern['preparation_time']}
- Key Tips: {json.dumps(pattern['key_tips'])}

"""
        
        if user_profile:
            context += f"""
User Profile:
- Skills: {', '.join(user_profile.get('skills', [])[:10])}
- Target Role: {user_profile.get('target_role', 'Unknown')}
- Experience: {user_profile.get('experience_years', 0)} years
"""
        
        # Build messages
        messages = []
        
        if conversation_history:
            for msg in conversation_history[-5:]:  # Last 5 messages
                messages.append(msg)
        
        messages.append({
            "role": "user",
            "content": f"Context: {context}\n\nQuestion: {question}"
        })
        
        prompt = f"""
{context}

User Question: {question}

Provide a helpful, specific, and actionable response about interviewing at {company_name}. 
Include relevant tips, resources, or examples where appropriate.
Keep the response concise but comprehensive.
"""
        
        try:
            response = await self.model_service.generate_response(
                prompt=prompt,
                max_tokens=500,
                temperature=0.7
            )
            
            return {
                "success": True,
                "response": response,
                "company": company_name,
                "resources": self._get_relevant_resources(question, pattern)
            }
            
        except Exception as e:
            logger.error(f"Error generating recruiter bot response: {str(e)}")
            return {
                "success": False,
                "response": f"I can help you prepare for {company_name} interviews. The process typically involves {', '.join(pattern['interview_rounds'])}. Would you like specific advice on any particular area?",
                "error": str(e)
            }
    
    def _get_relevant_resources(
        self,
        question: str,
        pattern: Dict[str, Any]
    ) -> List[Dict[str, str]]:
        """Get relevant resources based on question"""
        question_lower = question.lower()
        resources = []
        
        if any(word in question_lower for word in ["leetcode", "coding", "algorithm", "dsa", "data structure"]):
            resources.append({
                "type": "platform",
                "name": "LeetCode",
                "url": "https://leetcode.com",
                "description": "Practice coding problems"
            })
        
        if any(word in question_lower for word in ["system design", "scale", "architecture"]):
            resources.append({
                "type": "guide",
                "name": "System Design Primer",
                "url": "https://github.com/donnemartin/system-design-primer",
                "description": "Comprehensive system design guide"
            })
        
        if any(word in question_lower for word in ["behavioral", "star", "leadership"]):
            resources.append({
                "type": "article",
                "name": "STAR Method Guide",
                "url": "https://www.themuse.com/advice/star-interview-method",
                "description": "Master behavioral interviews"
            })
        
        return resources
    
    async def mock_interview(
        self,
        company_name: str,
        role: str,
        interview_type: str = "technical",
        user_response: Optional[str] = None,
        question_index: int = 0
    ) -> Dict[str, Any]:
        """
        Conduct a mock interview session
        
        Args:
            company_name: Target company
            role: Target role
            interview_type: technical/behavioral/system_design
            user_response: User's answer to evaluate
            question_index: Current question number
            
        Returns:
            Question or feedback
        """
        questions = await self._get_common_questions(company_name, role)
        question_list = questions.get(interview_type, questions["technical"])
        
        if question_index >= len(question_list):
            return {
                "complete": True,
                "message": "Mock interview complete! Great practice session."
            }
        
        if user_response:
            # Evaluate the response
            feedback = await self._evaluate_response(
                question_list[question_index - 1] if question_index > 0 else question_list[0],
                user_response,
                interview_type
            )
            
            return {
                "complete": False,
                "feedback": feedback,
                "next_question": question_list[question_index] if question_index < len(question_list) else None,
                "question_number": question_index + 1,
                "total_questions": len(question_list)
            }
        else:
            return {
                "complete": False,
                "question": question_list[question_index],
                "question_number": question_index + 1,
                "total_questions": len(question_list),
                "interview_type": interview_type
            }
    
    async def _evaluate_response(
        self,
        question: str,
        response: str,
        interview_type: str
    ) -> Dict[str, Any]:
        """Evaluate user's interview response"""
        prompt = f"""
Evaluate this {interview_type} interview response:

Question: {question}

Candidate's Answer: {response}

Provide feedback in JSON format with:
1. score (1-10)
2. strengths (list of what was done well)
3. improvements (list of areas to improve)
4. sample_answer (brief example of an ideal answer)
"""
        
        try:
            result = await self.model_service.generate_response(
                prompt=prompt,
                max_tokens=400,
                temperature=0.5
            )
            
            # Clean up the result to ensure it's valid JSON
            if "```json" in result:
                result = result.split("```json")[1].split("```")[0].strip()
            elif "```" in result:
                result = result.split("```")[1].split("```")[0].strip()
            
            try:
                feedback = json.loads(result)
            except json.JSONDecodeError:
                feedback = {
                    "score": 7,
                    "strengths": ["Provided a response to the question"],
                    "improvements": ["Could provide more specific examples"],
                    "sample_answer": "Consider structuring your answer with clear examples"
                }
            
            return feedback
            
        except Exception as e:
            logger.error(f"Error evaluating response: {str(e)}")
            return {
                "score": 6,
                "strengths": ["Attempted to answer the question"],
                "improvements": ["Practice more structured responses"],
                "sample_answer": "Focus on specific examples and outcomes"
            }

    async def generate_resume_questions(
        self,
        resume_text: str,
        target_role: str,
        num_questions: int = 5
    ) -> List[str]:
        """Generate interview questions based on resume text"""
        prompt = f"""
Analyze this resume for the role of {target_role} and generate {num_questions} challenging interview questions.
The questions should be a mix of:
1. Experience-based (probing into projects or roles mentioned)
2. Skill-based (testing mentioned technologies)
3. Behavioral (related to their work history)

Resume Text:
{resume_text}

Provide only a JSON list of {num_questions} strings.
Example: ["Question 1", "Question 2", ...]
"""
        try:
            result = await self.model_service.generate_response(
                prompt=prompt,
                max_tokens=500,
                temperature=0.7
            )
            
            if "```json" in result:
                result = result.split("```json")[1].split("```")[0].strip()
            elif "```" in result:
                result = result.split("```")[1].split("```")[0].strip()
                
            questions = json.loads(result)
            if isinstance(questions, list):
                return questions[:num_questions]
            return ["Tell me about your most significant project.", "How do you handle technical challenges?", "Why are you interested in this role?"]
        except Exception as e:
            logger.error(f"Error generating resume questions: {str(e)}")
            return ["Tell me about your most significant project.", "How do you handle technical challenges?", "Why are you interested in this role?"]

    async def resume_mock_interview(
        self,
        questions: List[str],
        question_index: int,
        user_response: Optional[str] = None
    ) -> Dict[str, Any]:
        """Conduct mock interview based on pre-generated questions"""
        
        if question_index >= len(questions):
            return {
                "complete": True,
                "message": "Interview complete! AI has analyzed your performance."
            }
            
        if user_response:
            feedback = await self._evaluate_response(
                questions[question_index - 1],
                user_response,
                "technical/behavioral"
            )
            
            return {
                "complete": False,
                "feedback": feedback,
                "next_question": questions[question_index] if question_index < len(questions) else None,
                "question_number": question_index + 1,
                "total_questions": len(questions)
            }
        else:
            return {
                "complete": False,
                "question": questions[question_index],
                "question_number": question_index + 1,
                "total_questions": len(questions)
            }


# Singleton instance
recruiter_bot = RecruiterBotService()
