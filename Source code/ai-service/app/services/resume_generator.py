"""
AI Resume Generator Service
Uses LLM to generate high-fidelity, professional resumes based on user profiles and target roles.
"""

import logging
from typing import Dict, List, Any, Optional
from datetime import datetime

logger = logging.getLogger(__name__)

class ResumeGenerator:
    """AI-powered resume generator using LLM"""
    
    def __init__(self, model_service=None):
        self.model_service = model_service
        self.version = "1.0"

    async def generate_resume_pure_ai(
        self,
        user_profile: Dict[str, Any],
        target_role: str = "Software Engineer",
        job_description: Optional[str] = None,
        template_style: str = "Standard Professional ATS"
    ) -> Dict[str, Any]:
        """
        Generate a professional resume using pure AI
        """
        if not self.model_service:
            return {
                "success": False,
                "error": "Model service not initialized"
            }

        logger.info(f"Generating pure AI resume for role: {target_role} with template: {template_style}")

        # Construct a detailed prompt for the LLM
        prompt = f"""
        Act as a professional resume writer and career coach. 
        Create a high-fidelity, ATS-optimized professional resume for the following user:
        
        TARGET ROLE: {target_role}
        TARGET TEMPLATE STYLE: {template_style}
        {f'JOB DESCRIPTION: {job_description}' if job_description else ''}
        
        USER PROFILE DATA:
        - Full Name: {user_profile.get('fullName', 'Professional')}
        - Degree: {user_profile.get('degree', 'Student')}
        - Stream/Field: {user_profile.get('stream', 'Technology')}
        - Graduation Year: {user_profile.get('year', '2025')}
        - Skills: {", ".join(user_profile.get('skills', [])) if isinstance(user_profile.get('skills'), list) else user_profile.get('skills', 'N/A')}
        - Technologies: {", ".join(user_profile.get('knownTechnologies', [])) if isinstance(user_profile.get('knownTechnologies'), list) else user_profile.get('knownTechnologies', 'N/A')}
        - Experience: {user_profile.get('experienceText', 'Entry Level / Student')}
        - Projects: {user_profile.get('projectsText', 'Multiple technical projects')}
        
        INSTRUCTIONS:
        1. Adapt the format and tone strictly to the '{template_style}'. For example, 'Executive' should be highly metric-driven and leadership-focused, while 'Creative' should have a vibrant, modern tone.
        2. Write a compelling Professional Summary (3-4 lines) targeted specifically at {target_role}.
        3. Expand the skills into logical categories (Core Technologies, Frameworks, Tools).
        4. Create 3-4 professional bullet points for the Experience/Projects section using strong action verbs and quantified metrics (e.g., 'Improved performance by 25%', 'Reduced latency by 40ms').
        5. Format the output in Markdown with clear sections according to the {template_style} conventions.
        
        Return the result as a JSON object with:
        - "success": true
        - "resume_data": An object containing the following structured data:
            - "name": string
            - "title": string
            - "contact": {{ "email": "string", "phone": "string", "location": "string", "linkedin": "string" }}
            - "summary": string
            - "experience": [{{ "title": "string", "company": "string", "date": "string", "location": "string", "bullets": ["string"] }}]
            - "projects": [{{ "title": "string", "date": "string", "details": "string" }}]
            - "education": [{{ "degree": "string", "school": "string", "date": "string", "details": "string" }}]
            - "skills": [{{ "category": "string", "items": ["string"], "proficiency": 90 }}]
            - "philosophy": "string (A short personal philosophy or quote)"
        - "markdown": "A plain text markdown fallback"
        - "tips": ["3 tips"]
        
        ENSURE THE MARKDOWN IS GORGEOUS AND PROFESSIONAL.
        """

        try:
            # Use model_service to call the LLM
            response = await self.model_service.generate(prompt, max_tokens=2500, temperature=0.7)
            
            # Extract JSON from response
            import json
            import re
            
            # Find JSON block
            json_match = re.search(r'(\{.*\})', response, re.DOTALL)
            if json_match:
                result = json.loads(json_match.group(1))
                return result
            else:
                # Fallback if AI didn't return valid JSON
                return {
                    "success": True,
                    "markdown": response,
                    "summary": "AI Generated Resume",
                    "tips": ["Review the formatting", "Add your contact details", "Customize bullet points"]
                }

        except Exception as e:
            logger.error(f"Error generating resume: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }

# Singleton instance
_generator_instance = None

def get_resume_generator(model_service=None) -> ResumeGenerator:
    """Get or create resume generator instance"""
    global _generator_instance
    if _generator_instance is None:
        _generator_instance = ResumeGenerator(model_service)
    return _generator_instance
