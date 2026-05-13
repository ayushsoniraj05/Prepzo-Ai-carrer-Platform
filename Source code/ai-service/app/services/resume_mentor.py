"""
Prepzo AI Resume Mentor
Provides personalized guidance, answers questions, and helps students improve their resumes
"""

import logging
from typing import Dict, List, Any, Optional
from datetime import datetime

logger = logging.getLogger(__name__)


class PrepzoAIMentor:
    """
    AI-powered resume mentor that:
    - Answers resume improvement questions
    - Provides personalized guidance
    - Remembers student profile and progress
    - Available across the platform
    """
    
    def __init__(self, model_service=None):
        self.model_service = model_service
        self.version = "1.0"
        
        # Knowledge base for common questions
        self.knowledge_base = self._build_knowledge_base()
    
    def _build_knowledge_base(self) -> Dict[str, Any]:
        """Build the mentor's knowledge base"""
        return {
            "resume_sections": {
                "summary": {
                    "purpose": "A 2-3 sentence overview of your skills, experience, and career goals",
                    "tips": [
                        "Keep it under 50 words",
                        "Include your target role",
                        "Highlight 2-3 key skills",
                        "Mention your experience level"
                    ],
                    "examples": [
                        "Results-driven Computer Science graduate with expertise in Python and React. Passionate about building scalable web applications. Seeking a Software Engineer role to contribute to innovative tech solutions.",
                        "Motivated Data Science student with strong skills in Python, Machine Learning, and SQL. Experienced in building predictive models through academic projects. Looking for entry-level Data Analyst position."
                    ]
                },
                "experience": {
                    "purpose": "Showcase your work history with quantified achievements",
                    "tips": [
                        "Start each bullet with a strong action verb",
                        "Include numbers and percentages wherever possible",
                        "Focus on achievements, not just responsibilities",
                        "Use the format: Action Verb + Task + Result"
                    ],
                    "formats": [
                        "Developed [X] using [technologies], resulting in [impact]",
                        "Led a team of [N] to deliver [project], achieving [result]",
                        "Improved [metric] by [X%] through [action]"
                    ]
                },
                "projects": {
                    "purpose": "Demonstrate practical skills through hands-on work",
                    "tips": [
                        "Include 2-3 relevant projects",
                        "List technologies used",
                        "Describe the problem solved",
                        "Mention any users or impact if deployed",
                        "Include GitHub/live demo links"
                    ],
                    "structure": [
                        "Project Name | Technologies",
                        "- Problem: What problem does it solve?",
                        "- Solution: What did you build?",
                        "- Impact: Who uses it or what was learned?"
                    ]
                },
                "skills": {
                    "purpose": "List your technical and soft skills",
                    "tips": [
                        "Group skills by category (Languages, Frameworks, Tools)",
                        "Put most relevant skills first",
                        "Match skills to job requirements",
                        "Don't list skills you can't discuss in an interview"
                    ],
                    "categories": [
                        "Programming Languages: Python, Java, JavaScript",
                        "Frameworks: React, Node.js, Django",
                        "Databases: PostgreSQL, MongoDB",
                        "Tools: Git, Docker, AWS"
                    ]
                },
                "education": {
                    "purpose": "Show your academic background",
                    "tips": [
                        "Put degree, institution, and graduation year",
                        "Include GPA if above 3.0/4.0 or 7.0/10",
                        "List relevant coursework for entry-level positions",
                        "Mention academic achievements"
                    ]
                }
            },
            "common_mistakes": [
                {"mistake": "Using generic phrases like 'hardworking' or 'team player'", "fix": "Replace with specific examples demonstrating these qualities"},
                {"mistake": "Listing responsibilities instead of achievements", "fix": "Focus on what you accomplished, not what you were supposed to do"},
                {"mistake": "One-size-fits-all resume", "fix": "Customize your resume for each job application"},
                {"mistake": "Including irrelevant information", "fix": "Remove high school details, unrelated jobs, and personal info"},
                {"mistake": "Poor formatting", "fix": "Use consistent fonts, adequate white space, and clear section headers"},
                {"mistake": "No quantified achievements", "fix": "Add numbers: users served, percentage improvements, team sizes"},
                {"mistake": "Missing keywords", "fix": "Include keywords from the job description"},
                {"mistake": "Too long or too short", "fix": "1 page for <5 years experience, 2 pages for more"}
            ],
            "action_verbs": {
                "technical": ["Architected", "Automated", "Built", "Coded", "Deployed", "Designed", "Developed", "Engineered", "Implemented", "Integrated", "Migrated", "Optimized", "Programmed", "Refactored"],
                "leadership": ["Coordinated", "Directed", "Led", "Managed", "Mentored", "Organized", "Spearheaded", "Supervised"],
                "achievement": ["Achieved", "Delivered", "Exceeded", "Generated", "Improved", "Increased", "Reduced", "Saved", "Surpassed"],
                "analysis": ["Analyzed", "Assessed", "Evaluated", "Identified", "Investigated", "Researched", "Solved", "Tested"]
            },
            "ats_tips": [
                "Use standard section headers (Experience, Education, Skills)",
                "Avoid tables, graphics, and images in your resume",
                "Use standard fonts like Arial, Calibri, or Times New Roman",
                "Include keywords from the job description",
                "Save as PDF or DOCX (check job posting for preference)",
                "Use a simple, clean layout",
                "Spell out acronyms at least once"
            ],
            "role_specific_tips": {
                "Software Engineer": [
                    "Highlight DSA and problem-solving skills",
                    "Include LeetCode/competitive programming achievements",
                    "Show full-stack or specialized (frontend/backend) skills",
                    "Mention open-source contributions"
                ],
                "Data Scientist": [
                    "Emphasize Python, ML libraries, and statistics",
                    "Include Kaggle competitions or research papers",
                    "Show data visualization skills",
                    "Mention any ML models deployed in production"
                ],
                "Frontend Developer": [
                    "Highlight React/Vue/Angular expertise",
                    "Include responsive design experience",
                    "Show performance optimization knowledge",
                    "Mention accessibility (a11y) experience"
                ],
                "Backend Developer": [
                    "Emphasize API development and database skills",
                    "Show system design knowledge",
                    "Include scalability and performance work",
                    "Mention security best practices"
                ]
            }
        }
    
    async def get_guidance(
        self,
        question: str,
        user_profile: Optional[Dict] = None,
        resume_analysis: Optional[Dict] = None,
        conversation_history: Optional[List[Dict]] = None
    ) -> Dict[str, Any]:
        """
        Get personalized guidance from the AI mentor
        
        Args:
            question: The user's question
            user_profile: User profile data
            resume_analysis: Previous resume analysis results
            conversation_history: Previous conversation for context
            
        Returns:
            Mentor response with guidance
        """
        try:
            from app.services.internal_ai_service import get_internal_ai_service
            logger.info(f"Processing mentor question: {question[:50]}...")
            
            internal_ai = get_internal_ai_service()
            
            # Formulate the context
            context_prompt = f"Resume Analysis context: {resume_analysis}\n\nUser Profile: {user_profile}" if resume_analysis else f"User Profile: {user_profile}"
            
            history = conversation_history or []
            
            response_text = await internal_ai.chat(
                message=question,
                student_context={
                    "target_role": user_profile.get("targetRole", "Software Engineer") if user_profile else "Software Engineer",
                    "resume_analysis": resume_analysis
                },
                conversation_history=history,
                temperature=0.75,
                max_tokens=4000
            )

            return {
                "success": True,
                "response": response_text,
                "suggestions": ["How do I improve my summary?", "What keywords should I add?", "Review my experience section"],
                "relatedTopics": ["Resume formatting", "ATS systems"],
                "actionItems": [],
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error in mentor guidance: {str(e)}")
            return {
                "success": False,
                "response": "I apologize, but I'm having trouble processing your question. Please try rephrasing it.",
                "error": str(e)
            }
    
    def _classify_question(self, question: str) -> str:
        """Classify the type of question"""
        question_lower = question.lower()
        
        if any(word in question_lower for word in ["summary", "objective", "profile"]):
            return "summary"
        elif any(word in question_lower for word in ["project", "portfolio"]):
            return "projects"
        elif any(word in question_lower for word in ["skill", "technology", "tech stack"]):
            return "skills"
        elif any(word in question_lower for word in ["experience", "work", "job", "internship"]):
            return "experience"
        elif any(word in question_lower for word in ["education", "degree", "gpa", "cgpa"]):
            return "education"
        elif any(word in question_lower for word in ["ats", "keyword", "screening"]):
            return "ats"
        elif any(word in question_lower for word in ["format", "layout", "design", "template"]):
            return "format"
        elif any(word in question_lower for word in ["improve", "better", "fix", "change"]):
            return "improvement"
        elif any(word in question_lower for word in ["mistake", "wrong", "error", "avoid"]):
            return "mistakes"
        elif any(word in question_lower for word in ["score", "rating", "assessment"]):
            return "score"
        else:
            return "general"
    
    def _build_context(
        self,
        user_profile: Optional[Dict],
        resume_analysis: Optional[Dict]
    ) -> Dict:
        """Build context from user data"""
        context = {
            "has_profile": user_profile is not None,
            "has_analysis": resume_analysis is not None,
            "target_role": "Software Engineer",
            "skills": [],
            "ats_score": 0,
            "weaknesses": [],
            "strengths": []
        }
        
        if user_profile:
            context["target_role"] = user_profile.get("targetRole", "Software Engineer")
            context["skills"] = user_profile.get("knownTechnologies", [])
            context["name"] = user_profile.get("fullName", "").split()[0] if user_profile.get("fullName") else ""
        
        if resume_analysis:
            context["ats_score"] = resume_analysis.get("overallScore", 0)
            context["weaknesses"] = resume_analysis.get("weaknessesSummary", [])
            context["strengths"] = resume_analysis.get("strengthsSummary", [])
            context["missing_keywords"] = resume_analysis.get("missingKeywords", [])
        
        return context
    
    async def _generate_response(
        self,
        question: str,
        question_type: str,
        context: Dict,
        conversation_history: Optional[List[Dict]]
    ) -> Dict:
        """Generate a helpful response"""
        response = {
            "answer": "",
            "suggestions": [],
            "related_topics": [],
            "action_items": []
        }
        
        # Get relevant knowledge base content
        kb = self.knowledge_base
        
        # Build personalized greeting
        name = context.get("name", "")
        greeting = f"Hi {name}! " if name else ""
        
        # Generate response based on question type
        if question_type == "summary":
            section_info = kb["resume_sections"]["summary"]
            response["answer"] = f"""{greeting}Here's how to write an effective professional summary:

**Purpose:** {section_info['purpose']}

**Key Tips:**
{self._format_list(section_info['tips'])}

**Example for {context.get('target_role', 'your target role')}:**
"{section_info['examples'][0]}"

Would you like me to help you draft a summary based on your profile?"""
            response["suggestions"] = ["Show me another example", "Help me write my summary", "How long should it be?"]
            response["action_items"] = ["Write a 2-3 sentence summary", "Include your target role", "Mention 2-3 key skills"]
        
        elif question_type == "projects":
            section_info = kb["resume_sections"]["projects"]
            response["answer"] = f"""{greeting}Projects are crucial for demonstrating practical skills!

**Key Tips:**
{self._format_list(section_info['tips'])}

**Recommended Structure:**
{self._format_list(section_info['structure'])}

For a {context.get('target_role', 'tech role')}, I recommend including projects that showcase your technical expertise. Based on your skills ({', '.join(context.get('skills', ['your technologies'])[:3])}), consider projects that demonstrate these technologies."""
            response["suggestions"] = ["Give me project ideas", "How do I describe my projects?", "Should I include links?"]
            response["action_items"] = ["Add 2-3 relevant projects", "Include technologies used", "Add GitHub links"]
        
        elif question_type == "skills":
            section_info = kb["resume_sections"]["skills"]
            response["answer"] = f"""{greeting}Let me help you structure your skills section!

**Tips for Skills Section:**
{self._format_list(section_info['tips'])}

**Recommended Format:**
{self._format_list(section_info['categories'])}

For {context.get('target_role', 'your role')}, focus on: programming languages, frameworks, databases, and tools relevant to the job description."""
            if context.get("missing_keywords"):
                response["answer"] += f"\n\n**Missing Keywords (Add These):** {', '.join(context['missing_keywords'][:5])}"
            response["suggestions"] = ["What skills should I add?", "How do I organize my skills?", "Should I include soft skills?"]
        
        elif question_type == "experience":
            section_info = kb["resume_sections"]["experience"]
            response["answer"] = f"""{greeting}Here's how to write impactful experience bullets:

**Key Tips:**
{self._format_list(section_info['tips'])}

**Powerful Formats:**
{self._format_list(section_info['formats'])}

**Strong Action Verbs to Use:**
- Technical: {', '.join(kb['action_verbs']['technical'][:5])}
- Achievement: {', '.join(kb['action_verbs']['achievement'][:5])}"""
            response["suggestions"] = ["Give me more action verbs", "How do I quantify achievements?", "I don't have work experience"]
            response["action_items"] = ["Use action verbs", "Add quantified achievements", "Focus on impact not tasks"]
        
        elif question_type == "ats":
            response["answer"] = f"""{greeting}Here's how to optimize your resume for ATS (Applicant Tracking Systems):

**ATS Optimization Tips:**
{self._format_list(kb['ats_tips'])}"""
            if context.get("ats_score"):
                response["answer"] += f"\n\n**Your Current ATS Score:** {context['ats_score']}/100"
            if context.get("missing_keywords"):
                response["answer"] += f"\n\n**Add These Keywords:** {', '.join(context['missing_keywords'][:5])}"
            response["suggestions"] = ["How do I find keywords?", "What format is best for ATS?", "Why is my score low?"]
        
        elif question_type == "mistakes":
            response["answer"] = f"""{greeting}Here are common resume mistakes to avoid:

"""
            for i, mistake_info in enumerate(kb["common_mistakes"][:5], 1):
                response["answer"] += f"**{i}. {mistake_info['mistake']}**\n   Fix: {mistake_info['fix']}\n\n"
            
            if context.get("weaknesses"):
                response["answer"] += f"\n**Based on your resume analysis, focus on:** {', '.join(context['weaknesses'][:2])}"
            response["suggestions"] = ["Show me more mistakes", "How do I fix my resume?", "Review my resume"]
        
        elif question_type == "improvement":
            response["answer"] = f"""{greeting}Here's how to improve your resume:"""
            
            if context.get("weaknesses"):
                response["answer"] += f"""

**Areas to Improve Based on Your Analysis:**
{self._format_list(context['weaknesses'])}"""
            
            if context.get("missing_keywords"):
                response["answer"] += f"""

**Add These Keywords:**
{', '.join(context['missing_keywords'][:5])}"""
            
            # Add role-specific tips
            role = context.get("target_role", "Software Engineer")
            if role in kb["role_specific_tips"]:
                response["answer"] += f"""

**Tips for {role}:**
{self._format_list(kb['role_specific_tips'][role])}"""
            
            response["action_items"] = context.get("weaknesses", [])[:3]
            response["suggestions"] = ["What should I add?", "How do I increase my score?", "Review my changes"]
        
        elif question_type == "score":
            if context.get("ats_score"):
                score = context["ats_score"]
                response["answer"] = f"""{greeting}Your ATS Score: **{score}/100**

"""
                if score >= 80:
                    response["answer"] += "🎉 Excellent! Your resume is well-optimized for ATS systems."
                elif score >= 60:
                    response["answer"] += "👍 Good score! With a few improvements, you can reach 80+."
                else:
                    response["answer"] += "📈 Room for improvement. Let's work on boosting your score."
                
                if context.get("strengths"):
                    response["answer"] += f"\n\n**Your Strengths:**\n{self._format_list(context['strengths'])}"
                if context.get("weaknesses"):
                    response["answer"] += f"\n\n**Areas to Improve:**\n{self._format_list(context['weaknesses'])}"
            else:
                response["answer"] = f"{greeting}Upload your resume to get a detailed ATS score and analysis!"
            
            response["suggestions"] = ["How do I improve my score?", "What affects ATS score?", "Analyze my resume"]
        
        else:  # general
            response["answer"] = f"""{greeting}I'm Prepzo AI Mentor, your personal resume coach! 

I can help you with:
📄 **Resume Sections:** Summary, Experience, Projects, Skills, Education
📊 **ATS Optimization:** Keywords, formatting, scoring
🎯 **Role-Specific Tips:** Tailored advice for your target role
✍️ **Writing Improvement:** Better bullet points, action verbs
🚫 **Avoiding Mistakes:** Common errors and how to fix them

What would you like help with?"""
            
            if context.get("ats_score"):
                response["answer"] += f"\n\n📈 Your current ATS Score: **{context['ats_score']}/100**"
            
            response["suggestions"] = [
                "How do I improve my resume?",
                "Help me write my summary",
                "What are common mistakes?",
                "Optimize for ATS"
            ]
        
        # Add related topics
        topic_map = {
            "summary": ["experience", "skills"],
            "projects": ["skills", "experience"],
            "skills": ["projects", "ats"],
            "experience": ["summary", "projects"],
            "ats": ["skills", "format"],
            "format": ["ats", "skills"],
            "improvement": ["ats", "projects", "skills"],
            "mistakes": ["improvement", "ats"],
            "score": ["improvement", "ats"]
        }
        
        response["related_topics"] = [
            f"Learn about {topic}" for topic in topic_map.get(question_type, ["summary", "projects"])
        ]
        
        return response
    
    def _format_list(self, items: List[str]) -> str:
        """Format a list as bullet points"""
        return "\n".join([f"• {item}" for item in items])
    
    async def get_quick_tip(self, category: str = "general") -> str:
        """Get a quick tip for a category"""
        tips = {
            "summary": "Keep your summary under 50 words and include your target role + 2-3 key skills",
            "experience": "Start every bullet point with a strong action verb like 'Developed', 'Led', or 'Optimized'",
            "projects": "Include 2-3 portfolio projects with technologies used and GitHub links",
            "skills": "Group your skills by category and put the most relevant ones first",
            "ats": "Use keywords from the job description to improve your ATS score",
            "general": "A well-optimized resume significantly increases your chances of getting interviews"
        }
        return tips.get(category, tips["general"])
    
    async def get_improvement_checklist(
        self,
        resume_analysis: Optional[Dict] = None
    ) -> List[Dict]:
        """Get a personalized improvement checklist"""
        checklist = [
            {"task": "Add a professional summary", "priority": "high", "completed": False},
            {"task": "Include 2-3 relevant projects", "priority": "high", "completed": False},
            {"task": "Add quantified achievements (numbers, percentages)", "priority": "high", "completed": False},
            {"task": "Include relevant keywords for ATS", "priority": "medium", "completed": False},
            {"task": "Add LinkedIn and GitHub links", "priority": "medium", "completed": False},
            {"task": "Use action verbs in experience bullets", "priority": "medium", "completed": False},
            {"task": "Proofread for spelling and grammar", "priority": "low", "completed": False}
        ]
        
        if resume_analysis:
            # Mark items as completed based on analysis
            if resume_analysis.get("overallScore", 0) >= 70:
                # Good score indicates some items are done
                checklist[3]["completed"] = True  # Keywords
            
            # Add missing keywords as a specific task
            missing = resume_analysis.get("missingKeywords", [])
            if missing:
                checklist.insert(0, {
                    "task": f"Add keywords: {', '.join(missing[:3])}",
                    "priority": "high",
                    "completed": False
                })
        
        return checklist


# Singleton instance
_mentor_instance = None

def get_ai_mentor(model_service=None) -> PrepzoAIMentor:
    """Get or create AI mentor instance"""
    global _mentor_instance
    if _mentor_instance is None:
        _mentor_instance = PrepzoAIMentor(model_service)
    return _mentor_instance
