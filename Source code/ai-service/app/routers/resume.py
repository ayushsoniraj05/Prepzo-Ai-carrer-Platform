"""
Resume Analysis API Router
Endpoints for AI-powered resume analysis, ATS scoring, and AI mentor
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import Dict, List, Any, Optional
import logging

from ..services.resume_analyzer import get_resume_analyzer
from ..services.resume_mentor import get_ai_mentor
from ..services.resume_generator import get_resume_generator
from ..dependencies import get_model_service

logger = logging.getLogger(__name__)

router = APIRouter()


# ============== Request/Response Models ==============

class ResumeAnalysisRequest(BaseModel):
    """Request model for resume analysis"""
    resume_text: str = Field(..., description="The extracted text from the resume")
    target_role: str = Field(default="Software Engineer", description="Target job role for optimization")
    user_id: Optional[str] = Field(None, description="User ID for personalization")
    user_profile: Optional[Dict[str, Any]] = Field(None, description="User profile data")


class ResumeAnalysisResponse(BaseModel):
    """Response model for resume analysis"""
    success: bool
    analysis: Dict[str, Any]
    ats_score: int
    message: str


class MentorQueryRequest(BaseModel):
    """Request model for AI mentor queries"""
    question: str = Field(..., description="User's question about resume improvement")
    user_id: Optional[str] = Field(None, description="User ID for context")
    user_profile: Optional[Dict[str, Any]] = Field(None, description="User profile data")
    resume_analysis: Optional[Dict[str, Any]] = Field(None, description="Previous resume analysis")
    conversation_history: Optional[List[Dict]] = Field(None, description="Previous conversation")


class MentorResponse(BaseModel):
    """Response model for AI mentor"""
    success: bool
    response: str
    suggestions: List[str]
    related_topics: List[str]
    action_items: List[str]


class QuickTipRequest(BaseModel):
    """Request model for quick tips"""
    category: str = Field(default="general", description="Category for the tip")


class ChecklistRequest(BaseModel):
    """Request model for improvement checklist"""
    resume_analysis: Optional[Dict[str, Any]] = Field(None, description="Resume analysis for personalization")


class ResumeGenerateRequest(BaseModel):
    """Request model for AI resume generation"""
    user_profile: Dict[str, Any] = Field(..., description="User profile data for generation")
    target_role: str = Field(default="Software Engineer", description="Target job role")
    job_description: Optional[str] = Field(None, description="Optional target job description")
    template_style: Optional[str] = Field("Standard Professional ATS", description="Format style for the resume")


class ResumeGenerateResponse(BaseModel):
    """Response model for resume generation"""
    success: bool
    markdown: str
    summary: str
    tips: List[str]
    message: str


# ============== API Endpoints ==============

@router.post("/analyze", response_model=ResumeAnalysisResponse)
async def analyze_resume(request: ResumeAnalysisRequest):
    """
    Analyze a resume and generate ATS score with detailed feedback
    
    This endpoint performs comprehensive resume analysis including:
    - ATS score calculation
    - Section-by-section analysis
    - Keyword optimization suggestions
    - Skill gap identification
    - AI-generated improvement suggestions
    - Professional summary suggestions
    - Industry comparison
    """
    try:
        logger.info(f"Resume analysis requested for role: {request.target_role}")
        
        if not request.resume_text or len(request.resume_text.strip()) < 50:
            raise HTTPException(
                status_code=400,
                detail="Resume text is too short or empty. Please provide the complete resume content."
            )
        
        # Get analyzer instance
        analyzer = get_resume_analyzer()
        
        # Perform analysis
        analysis = await analyzer.analyze_resume(
            resume_text=request.resume_text,
            target_role=request.target_role,
            user_profile=request.user_profile
        )
        
        return ResumeAnalysisResponse(
            success=True,
            analysis=analysis,
            ats_score=analysis.get("overallScore", 0),
            message="Resume analysis completed successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error analyzing resume: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to analyze resume: {str(e)}"
        )


@router.post("/mentor/ask", response_model=MentorResponse)
async def ask_mentor(request: MentorQueryRequest):
    """
    Ask the Prepzo AI Mentor a question about resume improvement
    
    The AI mentor provides:
    - Personalized resume guidance
    - Section-specific tips
    - ATS optimization advice
    - Role-specific recommendations
    - Common mistake warnings
    """
    try:
        logger.info(f"Mentor question received: {request.question[:50]}...")
        
        if not request.question or len(request.question.strip()) < 3:
            raise HTTPException(
                status_code=400,
                detail="Please provide a valid question"
            )
        
        # Get mentor instance
        mentor = get_ai_mentor()
        
        # Get guidance
        result = await mentor.get_guidance(
            question=request.question,
            user_profile=request.user_profile,
            resume_analysis=request.resume_analysis,
            conversation_history=request.conversation_history
        )
        
        if not result.get("success"):
            raise HTTPException(
                status_code=500,
                detail=result.get("error", "Failed to get mentor response")
            )
        
        return MentorResponse(
            success=True,
            response=result["response"],
            suggestions=result.get("suggestions", []),
            related_topics=result.get("relatedTopics", []),
            action_items=result.get("actionItems", [])
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in mentor query: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process question: {str(e)}"
        )


@router.post("/mentor/quick-tip")
async def get_quick_tip(request: QuickTipRequest):
    """Get a quick tip for resume improvement"""
    try:
        mentor = get_ai_mentor()
        tip = await mentor.get_quick_tip(request.category)
        
        return {
            "success": True,
            "tip": tip,
            "category": request.category
        }
        
    except Exception as e:
        logger.error(f"Error getting quick tip: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get tip: {str(e)}"
        )


@router.post("/mentor/checklist")
async def get_improvement_checklist(request: ChecklistRequest):
    """Get a personalized improvement checklist"""
    try:
        mentor = get_ai_mentor()
        checklist = await mentor.get_improvement_checklist(request.resume_analysis)
        
        return {
            "success": True,
            "checklist": checklist
        }
        
    except Exception as e:
        logger.error(f"Error getting checklist: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get checklist: {str(e)}"
        )


@router.get("/skills/{role}")
async def get_required_skills(role: str):
    """Get required and preferred skills for a specific role"""
    from ..services.resume_analyzer import ROLE_REQUIREMENTS
    
    # Normalize role name
    role_lower = role.lower().replace("-", " ").replace("_", " ")
    
    matching_role = None
    for config_role in ROLE_REQUIREMENTS.keys():
        if config_role.lower() in role_lower or role_lower in config_role.lower():
            matching_role = config_role
            break
    
    if not matching_role:
        matching_role = "Software Engineer"
    
    role_config = ROLE_REQUIREMENTS.get(matching_role, {})
    
    return {
        "success": True,
        "role": matching_role,
        "required_skills": role_config.get("required_skills", []),
        "preferred_skills": role_config.get("preferred_skills", []),
        "technologies": role_config.get("technologies", []),
        "keywords": role_config.get("keywords", [])
    }


@router.get("/action-verbs")
async def get_action_verbs():
    """Get recommended action verbs for resume writing"""
    from ..services.resume_analyzer import ACTION_VERBS
    
    return {
        "success": True,
        "action_verbs": ACTION_VERBS
    }


@router.post("/generate", response_model=ResumeGenerateResponse)
async def generate_resume_ai(
    request: ResumeGenerateRequest,
    model_service=Depends(get_model_service)
):
    """
    Generate a professional resume using pure AI
    """
    try:
        generator = get_resume_generator(model_service)
        result = await generator.generate_resume_pure_ai(
            user_profile=request.user_profile,
            target_role=request.target_role,
            job_description=request.job_description,
            template_style=request.template_style
        )
        
        if not result.get("success", True):
            raise HTTPException(status_code=500, detail=result.get("error", "Generation failed"))
            
        return ResumeGenerateResponse(
            success=True,
            markdown=result.get("markdown", ""),
            summary=result.get("summary", ""),
            tips=result.get("tips", []),
            message="Resume generated successfully"
        )
    except Exception as e:
        logger.error(f"Error generating AI resume: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def health_check():
    """Health check for resume analysis service"""
    return {
        "status": "healthy",
        "service": "resume-analysis",
        "version": "2.0"
    }
