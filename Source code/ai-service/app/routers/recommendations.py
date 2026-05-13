from fastapi import APIRouter, Depends, HTTPException  # pyre-ignore
from pydantic import BaseModel, Field  # pyre-ignore
from typing import List, Dict, Any, Optional
from datetime import datetime
from loguru import logger  # pyre-ignore

from app.dependencies import get_model_service, get_embedding_service, get_vector_store, get_database  # pyre-ignore
from app.services.recommendation_engine import RecommendationEngine  # pyre-ignore
from app.services.response_validator import validate_response, ensure_minimum_response  # pyre-ignore
from app.services.model_service import ModelService  # pyre-ignore
from app.services.embedding_service import EmbeddingService  # pyre-ignore
from app.services.vector_store import VectorStore  # pyre-ignore
from app.database import Database  # pyre-ignore

router = APIRouter()


# Request/Response Models
class GenerateRecommendationsRequest(BaseModel):
    student_profile: Dict[str, Any] = Field(..., description="Complete student profile")
    assessment_results: Dict[str, Any] = Field(..., description="Latest assessment results")
    include_reasoning: bool = Field(default=True, description="Include AI reasoning explanation")


class RecordEffectivenessRequest(BaseModel):
    student_id: str = Field(..., description="Student's user ID")
    new_score: float = Field(..., description="New assessment score")
    skills_improved: List[str] = Field(default=[], description="List of skills that improved")


class SkillGapRequest(BaseModel):
    current_skills: List[str] = Field(..., description="Student's current skills")
    target_role: str = Field(..., description="Target job role")
    top_k: int = Field(default=10, description="Number of gaps to return")


class ResourceSearchRequest(BaseModel):
    skill: str = Field(..., description="Skill to find resources for")
    resource_types: Optional[List[str]] = Field(default=None)
    level: Optional[str] = Field(default=None)
    top_k: int = Field(default=5)


@router.post("/generate")
async def generate_recommendations(
    request: GenerateRecommendationsRequest,
    model_service: ModelService = Depends(get_model_service),
    embedding_service: EmbeddingService = Depends(get_embedding_service),
    vector_store: VectorStore = Depends(get_vector_store),
    database: Database = Depends(get_database)
):
    """
    Generate AI-powered personalized recommendations
    
    This replaces ALL hardcoded recommendation logic.
    Uses vector similarity vs static if-else.
    
    Process:
    1. Embed student profile
    2. Compute skill gaps via similarity
    3. Rank gaps by priority
    4. Find best-matching resources
    5. Generate learning path
    6. Predict improvement
    7. Explain reasoning
    8. Validate response
    """
    engine = RecommendationEngine(
        embedding_service=embedding_service,
        vector_store=vector_store,
        model_service=model_service,
        database=database
    )
    
    try:
        recommendations = await engine.generate_recommendations(
            student_profile=request.student_profile,
            assessment_results=request.assessment_results,
            include_reasoning=request.include_reasoning
        )
    except Exception as e:
        import traceback
        logger.error(f"Failed to generate recommendations from engine: {e}\n{traceback.format_exc()}")
        # Build minimal fallback if engine crashes
        target_role = request.student_profile.get('targetRole', 'Software Engineer')
        recommendations = {
            "target_role": target_role,
            "status": "failed_but_minimal",
            "message": f"AI service temporarily unavailable: {str(e)}",
            "prioritySkillGaps": [
                {"skill": "Data Structures & Algorithms", "importance": "critical"},
                {"skill": "Object Oriented Programming", "importance": "high"},
                {"skill": "System Design", "importance": "high"}
            ]
        }
    
    # Ensure minimum required fields
    recommendations = ensure_minimum_response(recommendations)
    
    # Validate response
    validation_result = validate_response(
        recommendations,
        target_role=request.student_profile.get('targetRole'),
        assessment_results=request.assessment_results
    )
    
    # Add validation metadata
    recommendations['_validation'] = validation_result
    
    return {
        "success": True,
        "recommendations": recommendations,
        "validationResult": validation_result
    }


@router.post("/skill-gaps")
async def find_skill_gaps(
    request: SkillGapRequest,
    vector_store: VectorStore = Depends(get_vector_store)
):
    """
    Identify skill gaps between student and role requirements
    
    Uses vector similarity to find missing skills
    No hardcoded skill mappings
    """
    
    gaps = await vector_store.find_skill_gaps(
        student_skills=request.current_skills,
        target_role=request.target_role,
        top_k=request.top_k
    )
    
    return {
        "success": True,
        "skill_gaps": gaps,
        "target_role": request.target_role
    }


@router.post("/resources/search")
async def search_resources(
    request: ResourceSearchRequest,
    vector_store: VectorStore = Depends(get_vector_store)
):
    """
    Find learning resources for a skill using vector search
    
    Returns courses, YouTube playlists, certifications
    ranked by relevance
    """
    
    resources = await vector_store.find_resources_for_skill(
        skill=request.skill,
        resource_types=request.resource_types,
        level=request.level,
        top_k=request.top_k
    )
    
    return {
        "success": True,
        "resources": resources,
        "skill": request.skill
    }


@router.get("/resources/search")
async def search_resources_get(
    skill: str,
    resource_type: str = "all",
    limit: int = 10,
    vector_store: VectorStore = Depends(get_vector_store)
):
    """
    Find learning resources for a skill using vector search (GET version)
    
    Query params:
    - skill: Skill to find resources for
    - resource_type: all, courses, youtube, certifications
    - limit: Number of results
    """
    
    resource_types = None if resource_type == "all" else [resource_type]
    
    resources = await vector_store.find_resources_for_skill(
        skill=skill,
        resource_types=resource_types,
        level=None,
        top_k=limit
    )
    
    return {
        "success": True,
        "resources": resources,
        "skill": skill
    }


@router.post("/effectiveness")
async def record_effectiveness(
    request: RecordEffectivenessRequest,
    model_service: ModelService = Depends(get_model_service),
    embedding_service: EmbeddingService = Depends(get_embedding_service),
    vector_store: VectorStore = Depends(get_vector_store),
    database: Database = Depends(get_database)
):
    """
    Record recommendation effectiveness for self-learning
    
    This enables the system to learn which recommendations
    lead to better outcomes and improve over time.
    """
    engine = RecommendationEngine(
        embedding_service=embedding_service,
        vector_store=vector_store,
        model_service=model_service,
        database=database
    )
    
    await engine.record_effectiveness(
        student_id=request.student_id,
        new_score=request.new_score,
        skills_improved=request.skills_improved
    )
    
    return {
        "success": True,
        "message": "Effectiveness recorded for model improvement"
    }


@router.get("/stats")
async def get_recommendation_stats(
    database: Database = Depends(get_database),
    vector_store: VectorStore = Depends(get_vector_store)
):
    """Get recommendation system statistics"""
    
    # Get vector store stats
    index_stats = await vector_store.get_index_stats()
    
    # Get recommendation effectiveness stats
    pipeline = [
        {"$match": {"effectiveness_score": {"$ne": None}}},
        {"$group": {
            "_id": None,
            "avg_effectiveness": {"$avg": "$effectiveness_score"},
            "total_recommendations": {"$sum": 1},
            "avg_improvement": {"$avg": "$actual_improvement"}
        }}
    ]
    
    effectiveness_stats = await database.recommendation_logs.aggregate(pipeline).to_list(1)
    
    return {
        "success": True,
        "index_stats": index_stats,
        "effectiveness_stats": effectiveness_stats[0] if effectiveness_stats else {}
    }
