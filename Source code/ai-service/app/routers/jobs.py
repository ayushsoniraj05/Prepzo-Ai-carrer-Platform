"""
Job Matching Router
API endpoints for AI-powered job matching
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Dict, Optional, Any
from app.services.job_matcher import job_matcher
from app.services.recruiter_bot import recruiter_bot
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


# ============ Request Models ============

class UserProfile(BaseModel):
    skills: List[str] = []
    experience_years: float = 0
    education: str = "bachelor"
    target_role: str = ""
    resume_data: Optional[Dict[str, Any]] = None


class JobData(BaseModel):
    id: str
    title: str
    company_name: str
    required_skills: List[Any] = []
    experience_min: float = 0
    experience_max: Optional[float] = None
    education_required: str = ""
    role_category: str = ""
    description: Optional[str] = None


class MatchRequest(BaseModel):
    user_profile: UserProfile
    job: JobData


class RecommendationsRequest(BaseModel):
    user_profile: UserProfile
    jobs: List[JobData]
    limit: int = 10


class ApplicationTipsRequest(BaseModel):
    user_profile: UserProfile
    job: JobData


class MarketAnalysisRequest(BaseModel):
    user_profile: UserProfile
    jobs: List[JobData]


# ============ Endpoints ============

@router.post("/match")
async def calculate_job_match(request: MatchRequest):
    """
    Calculate match score between user and job
    
    Returns detailed match analysis including:
    - Overall match score
    - Skill match breakdown
    - Experience match
    - Education match
    - Personalized recommendations
    """
    try:
        result = job_matcher.calculate_match_score(
            user_profile=request.user_profile.dict(),
            job=request.job.dict()
        )
        
        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        logger.error(f"Error calculating match: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/recommendations")
async def get_job_recommendations(request: RecommendationsRequest):
    """
    Get AI-powered job recommendations ranked by match score
    
    Returns list of jobs with match analysis, sorted by relevance
    """
    try:
        jobs_dict = [job.dict() for job in request.jobs]
        
        recommendations = await job_matcher.get_ai_job_recommendations(
            user_profile=request.user_profile.dict(),
            jobs=jobs_dict,
            limit=request.limit
        )
        
        return {
            "success": True,
            "data": {
                "recommendations": recommendations,
                "total": len(recommendations)
            }
        }
    except Exception as e:
        logger.error(f"Error getting recommendations: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/application-tips")
async def get_application_tips(request: ApplicationTipsRequest):
    """
    Generate personalized application tips for a specific job
    
    Returns AI-generated tips for:
    - Resume customization
    - Cover letter points
    - Interview preparation
    """
    try:
        # First calculate match
        match_result = job_matcher.calculate_match_score(
            user_profile=request.user_profile.dict(),
            job=request.job.dict()
        )
        
        # Generate tips
        tips = await job_matcher.generate_application_tips(
            user_profile=request.user_profile.dict(),
            job=request.job.dict(),
            match_result=match_result
        )
        
        return {
            "success": True,
            "data": {
                "match": match_result,
                "tips": tips
            }
        }
    except Exception as e:
        logger.error(f"Error generating tips: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/market-analysis")
async def analyze_job_market(request: MarketAnalysisRequest):
    """
    Analyze user's overall job market fit
    
    Returns:
    - Market fit score
    - In-demand skills user has
    - Skills gaps to address
    - Recommendations
    """
    try:
        jobs_dict = [job.dict() for job in request.jobs]
        
        analysis = await job_matcher.analyze_job_market_fit(
            user_profile=request.user_profile.dict(),
            jobs=jobs_dict
        )
        
        return {
            "success": True,
            "data": analysis
        }
    except Exception as e:
        logger.error(f"Error analyzing market: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ============ Recruiter Bot Endpoints ============

class RecruiterRequest(BaseModel):
    company_name: str
    role: str = ""
    user_profile: Optional[UserProfile] = None


class RecruiterChatRequest(BaseModel):
    company_name: str
    question: str
    conversation_history: Optional[List[Dict]] = None
    user_profile: Optional[UserProfile] = None


class MockInterviewRequest(BaseModel):
    company_name: str
    role: str
    interview_type: str = "technical"
    user_response: Optional[str] = None
    question_index: int = 0


@router.post("/recruiter/guide")
async def get_interview_guide(request: RecruiterRequest):
    """
    Get comprehensive interview preparation guide for a company
    
    Returns:
    - Interview process overview
    - Preparation resources
    - Common questions
    - Technical topics to study
    - Personalized advice (if profile provided)
    """
    try:
        guide = await recruiter_bot.get_company_interview_guide(
            company_name=request.company_name,
            role=request.role,
            user_profile=request.user_profile.dict() if request.user_profile else None
        )
        
        return {
            "success": True,
            "data": guide
        }
    except Exception as e:
        logger.error(f"Error getting interview guide: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/recruiter/chat")
async def recruiter_chat(request: RecruiterChatRequest):
    """
    Chat with company-specific AI recruiter bot
    
    Get answers to questions about:
    - Interview process
    - Preparation strategies
    - Company culture
    - Role-specific advice
    """
    try:
        response = await recruiter_bot.answer_question(
            company_name=request.company_name,
            question=request.question,
            conversation_history=request.conversation_history,
            user_profile=request.user_profile.dict() if request.user_profile else None
        )
        
        return {
            "success": True,
            "data": response
        }
    except Exception as e:
        logger.error(f"Error in recruiter chat: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/recruiter/mock-interview")
async def mock_interview(request: MockInterviewRequest):
    """
    Conduct AI-powered mock interview session
    
    - Start with question_index=0 and no user_response to get first question
    - Submit user_response with question_index to get feedback and next question
    - Continue until complete=True
    """
    try:
        result = await recruiter_bot.mock_interview(
            company_name=request.company_name,
            role=request.role,
            interview_type=request.interview_type,
            user_response=request.user_response,
            question_index=request.question_index
        )
        
        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        logger.error(f"Error in mock interview: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


class ResumeQuestionsRequest(BaseModel):
    resume_text: str
    target_role: str
    num_questions: int = 5


class ResumeMockInterviewRequest(BaseModel):
    questions: List[str]
    question_index: int
    user_response: Optional[str] = None


@router.post("/recruiter/resume-questions")
async def get_resume_questions(request: ResumeQuestionsRequest):
    """
    Generate interview questions based on resume text
    """
    try:
        questions = await recruiter_bot.generate_resume_questions(
            resume_text=request.resume_text,
            target_role=request.target_role,
            num_questions=request.num_questions
        )
        
        return {
            "success": True,
            "data": {
                "questions": questions
            }
        }
    except Exception as e:
        logger.error(f"Error generating resume questions: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/recruiter/resume-mock-interview")
async def resume_mock_interview(request: ResumeMockInterviewRequest):
    """
    Conduct mock interview based on resume questions
    """
    try:
        result = await recruiter_bot.resume_mock_interview(
            questions=request.questions,
            question_index=request.question_index,
            user_response=request.user_response
        )
        
        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        logger.error(f"Error in resume mock interview: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/recruiter/companies")
async def get_supported_companies():
    """
    Get list of companies with detailed interview patterns
    """
    companies = list(recruiter_bot.company_patterns.keys())
    companies.remove("default")
    
    return {
        "success": True,
        "data": {
            "companies": companies,
            "note": "Any company can be queried, but these have detailed patterns"
        }
    }
