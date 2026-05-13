"""
AI Job Matcher Service
Provides intelligent job matching based on user profiles
"""

from typing import List, Dict, Optional, Any
import json
import asyncio
from app.services.model_service import ModelService
from app.services.embedding_service import EmbeddingService
import logging

logger = logging.getLogger(__name__)


class JobMatcherService:
    """AI-powered job matching and recommendation engine"""
    
    def __init__(self):
        self.model_service = ModelService()
        self.embedding_service = EmbeddingService()
        
        # Skill synonyms for better matching
        self.skill_synonyms = {
            "javascript": ["js", "ecmascript", "es6", "es2015"],
            "typescript": ["ts"],
            "python": ["py", "python3"],
            "react": ["reactjs", "react.js"],
            "node": ["nodejs", "node.js"],
            "vue": ["vuejs", "vue.js"],
            "angular": ["angularjs", "angular.js"],
            "ml": ["machine learning", "machinelearning"],
            "ai": ["artificial intelligence"],
            "aws": ["amazon web services"],
            "gcp": ["google cloud", "google cloud platform"],
            "azure": ["microsoft azure"],
            "sql": ["mysql", "postgresql", "postgres", "sqlite"],
            "nosql": ["mongodb", "mongo", "dynamodb", "cassandra"],
            "docker": ["containerization", "containers"],
            "k8s": ["kubernetes"],
            "ci/cd": ["cicd", "continuous integration", "continuous deployment"],
        }
    
    def _normalize_skill(self, skill: str) -> str:
        """Normalize skill name for comparison"""
        skill_lower = skill.lower().strip()
        
        # Check if skill is a synonym
        for main_skill, synonyms in self.skill_synonyms.items():
            if skill_lower in synonyms or skill_lower == main_skill:
                return main_skill
        
        return skill_lower
    
    def _calculate_skill_match(
        self, 
        user_skills: List[str], 
        job_skills: List[str]
    ) -> Dict[str, Any]:
        """Calculate skill match score and details"""
        user_skills_normalized = set(self._normalize_skill(s) for s in user_skills)
        job_skills_normalized = set(self._normalize_skill(s) for s in job_skills)
        
        if not job_skills_normalized:
            return {
                "score": 50,
                "matched": [],
                "missing": [],
                "extra": list(user_skills_normalized)
            }
        
        matched = user_skills_normalized.intersection(job_skills_normalized)
        missing = job_skills_normalized - user_skills_normalized
        extra = user_skills_normalized - job_skills_normalized
        
        # Score calculation: matched skills / required skills * 100
        score = int((len(matched) / len(job_skills_normalized)) * 100)
        
        return {
            "score": min(100, score),
            "matched": list(matched),
            "missing": list(missing),
            "extra": list(extra)
        }
    
    def _calculate_experience_match(
        self,
        user_experience_years: float,
        job_experience_min: float,
        job_experience_max: Optional[float] = None
    ) -> Dict[str, Any]:
        """Calculate experience match score"""
        if job_experience_min <= 0:
            return {"score": 100, "status": "entry_level"}
        
        if user_experience_years >= job_experience_min:
            if job_experience_max and user_experience_years > job_experience_max:
                return {"score": 80, "status": "overqualified"}
            return {"score": 100, "status": "qualified"}
        
        # Partial match for close experience
        diff = job_experience_min - user_experience_years
        if diff <= 1:
            return {"score": 75, "status": "slightly_under"}
        elif diff <= 2:
            return {"score": 50, "status": "under_qualified"}
        else:
            return {"score": 25, "status": "significant_gap"}
    
    def _calculate_education_match(
        self,
        user_education: str,
        job_education_required: str
    ) -> Dict[str, Any]:
        """Calculate education match score"""
        education_levels = {
            "high_school": 1,
            "associate": 2,
            "bachelor": 3,
            "bachelors": 3,
            "master": 4,
            "masters": 4,
            "phd": 5,
            "doctorate": 5
        }
        
        user_level = education_levels.get(user_education.lower(), 0)
        required_level = education_levels.get(job_education_required.lower(), 0)
        
        if required_level == 0:
            return {"score": 100, "status": "no_requirement"}
        
        if user_level >= required_level:
            return {"score": 100, "status": "meets_requirement"}
        elif user_level == required_level - 1:
            return {"score": 70, "status": "close_to_requirement"}
        else:
            return {"score": 40, "status": "below_requirement"}
    
    def calculate_match_score(
        self,
        user_profile: Dict[str, Any],
        job: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Calculate comprehensive match score between user and job
        
        Args:
            user_profile: User profile with skills, experience, education
            job: Job posting with requirements
            
        Returns:
            Match analysis with scores and recommendations
        """
        # Extract user data
        user_skills = user_profile.get("skills", [])
        user_experience = user_profile.get("experience_years", 0)
        user_education = user_profile.get("education", "bachelor")
        user_target_role = user_profile.get("target_role", "")
        
        # Extract job data
        job_skills = [s.get("skill", s) if isinstance(s, dict) else s 
                      for s in job.get("required_skills", [])]
        job_exp_min = job.get("experience_min", 0)
        job_exp_max = job.get("experience_max")
        job_education = job.get("education_required", "")
        job_role_category = job.get("role_category", "")
        
        # Calculate individual scores
        skill_match = self._calculate_skill_match(user_skills, job_skills)
        experience_match = self._calculate_experience_match(
            user_experience, job_exp_min, job_exp_max
        )
        education_match = self._calculate_education_match(
            user_education, job_education
        )
        
        # Role alignment bonus
        role_bonus = 10 if user_target_role.lower() == job_role_category.lower() else 0
        
        # Calculate weighted overall score
        # Skills: 50%, Experience: 30%, Education: 20%
        overall_score = int(
            skill_match["score"] * 0.50 +
            experience_match["score"] * 0.30 +
            education_match["score"] * 0.20 +
            role_bonus
        )
        overall_score = min(100, overall_score)
        
        # Determine match level
        if overall_score >= 80:
            match_level = "excellent"
        elif overall_score >= 60:
            match_level = "good"
        elif overall_score >= 40:
            match_level = "moderate"
        else:
            match_level = "low"
        
        return {
            "overall_score": overall_score,
            "match_level": match_level,
            "skill_match": skill_match,
            "experience_match": experience_match,
            "education_match": education_match,
            "role_aligned": bool(role_bonus),
            "recommendations": self._generate_recommendations(
                skill_match, experience_match, education_match
            )
        }
    
    def _generate_recommendations(
        self,
        skill_match: Dict,
        experience_match: Dict,
        education_match: Dict
    ) -> List[str]:
        """Generate actionable recommendations to improve match"""
        recommendations = []
        
        # Skill recommendations
        if skill_match["missing"]:
            top_missing = skill_match["missing"][:3]
            recommendations.append(
                f"Learn these in-demand skills: {', '.join(top_missing)}"
            )
        
        if skill_match["score"] < 60:
            recommendations.append(
                "Consider upskilling through online courses or certifications"
            )
        
        # Experience recommendations
        if experience_match["status"] == "under_qualified":
            recommendations.append(
                "Gain more experience through internships or personal projects"
            )
        elif experience_match["status"] == "significant_gap":
            recommendations.append(
                "This role requires significantly more experience. Consider mid-level positions first"
            )
        
        # Education recommendations
        if education_match["status"] == "below_requirement":
            recommendations.append(
                "Consider pursuing additional education or relevant certifications"
            )
        
        return recommendations
    
    async def get_ai_job_recommendations(
        self,
        user_profile: Dict[str, Any],
        jobs: List[Dict[str, Any]],
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Get AI-powered job recommendations
        
        Args:
            user_profile: Complete user profile
            jobs: List of available jobs
            limit: Maximum number of recommendations
            
        Returns:
            Ranked list of job recommendations with match analysis
        """
        recommendations = []
        
        for job in jobs:
            match_result = self.calculate_match_score(user_profile, job)
            
            recommendations.append({
                "job": job,
                "match": match_result
            })
        
        # Sort by overall score
        recommendations.sort(key=lambda x: x["match"]["overall_score"], reverse=True)
        
        return recommendations[:limit]
    
    async def generate_application_tips(
        self,
        user_profile: Dict[str, Any],
        job: Dict[str, Any],
        match_result: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Generate personalized application tips using AI
        
        Args:
            user_profile: User profile data
            job: Job posting data
            match_result: Match analysis result
            
        Returns:
            AI-generated application tips
        """
        prompt = f"""
Based on the following job and candidate profile, provide specific tips for the job application:

Job Title: {job.get('title', 'Unknown')}
Company: {job.get('company_name', 'Unknown')}
Required Skills: {', '.join(str(s) for s in job.get('required_skills', [])[:10])}

Candidate Skills: {', '.join(str(s) for s in user_profile.get('skills', [])[:10])}
Match Score: {match_result.get('overall_score', 0)}%
Missing Skills: {', '.join(match_result.get('skill_match', {}).get('missing', [])[:5])}

Provide 3-5 specific, actionable tips for:
1. How to highlight relevant experience
2. How to address skill gaps in the application
3. Key points to mention in the cover letter
4. Interview preparation suggestions

Format as JSON with keys: resume_tips, cover_letter_tips, interview_tips
"""
        
        try:
            response = await self.model_service.generate_response(
                prompt=prompt,
                max_tokens=500,
                temperature=0.7
            )
            
            # Try to parse as JSON
            try:
                tips = json.loads(response)
            except json.JSONDecodeError:
                tips = {
                    "resume_tips": [response[:200]],
                    "cover_letter_tips": ["Highlight your transferable skills"],
                    "interview_tips": ["Research the company thoroughly"]
                }
            
            return {
                "success": True,
                "tips": tips
            }
            
        except Exception as e:
            logger.error(f"Error generating application tips: {str(e)}")
            return {
                "success": False,
                "tips": {
                    "resume_tips": ["Tailor your resume to match job requirements"],
                    "cover_letter_tips": ["Show enthusiasm for the role"],
                    "interview_tips": ["Prepare examples of your achievements"]
                }
            }
    
    async def analyze_job_market_fit(
        self,
        user_profile: Dict[str, Any],
        jobs: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Analyze overall job market fit for user
        
        Args:
            user_profile: User profile data
            jobs: List of jobs to analyze against
            
        Returns:
            Market fit analysis
        """
        if not jobs:
            return {
                "market_fit_score": 0,
                "analysis": "No jobs available for analysis",
                "in_demand_skills": [],
                "skill_gaps": []
            }
        
        # Calculate match for all jobs
        all_matches = [
            self.calculate_match_score(user_profile, job)
            for job in jobs
        ]
        
        # Average match score
        avg_score = sum(m["overall_score"] for m in all_matches) / len(all_matches)
        
        # Count skill frequencies across jobs
        skill_frequency = {}
        missing_frequency = {}
        
        for match in all_matches:
            for skill in match["skill_match"].get("matched", []):
                skill_frequency[skill] = skill_frequency.get(skill, 0) + 1
            for skill in match["skill_match"].get("missing", []):
                missing_frequency[skill] = missing_frequency.get(skill, 0) + 1
        
        # Most valuable skills (user has)
        in_demand_skills = sorted(
            skill_frequency.items(),
            key=lambda x: x[1],
            reverse=True
        )[:5]
        
        # Most common skill gaps
        skill_gaps = sorted(
            missing_frequency.items(),
            key=lambda x: x[1],
            reverse=True
        )[:5]
        
        # Good match count
        excellent_matches = sum(1 for m in all_matches if m["overall_score"] >= 80)
        good_matches = sum(1 for m in all_matches if 60 <= m["overall_score"] < 80)
        
        return {
            "market_fit_score": int(avg_score),
            "total_jobs_analyzed": len(jobs),
            "excellent_matches": excellent_matches,
            "good_matches": good_matches,
            "in_demand_skills": [{"skill": s[0], "match_count": s[1]} for s in in_demand_skills],
            "skill_gaps": [{"skill": s[0], "frequency": s[1]} for s in skill_gaps],
            "recommendation": self._get_market_fit_recommendation(avg_score, skill_gaps)
        }
    
    def _get_market_fit_recommendation(
        self,
        avg_score: float,
        skill_gaps: List[tuple]
    ) -> str:
        """Generate market fit recommendation"""
        if avg_score >= 70:
            return "Your profile is well-aligned with current job market demands. Focus on applying to high-match positions."
        elif avg_score >= 50:
            if skill_gaps:
                top_gaps = [g[0] for g in skill_gaps[:2]]
                return f"Good market fit with room for improvement. Consider learning: {', '.join(top_gaps)}"
            return "Moderate market fit. Consider expanding your skill set to unlock more opportunities."
        else:
            if skill_gaps:
                top_gaps = [g[0] for g in skill_gaps[:3]]
                return f"Focus on building core skills that are in high demand: {', '.join(top_gaps)}"
            return "Focus on building skills that match current job market requirements."


# Singleton instance
job_matcher = JobMatcherService()
