"""
Embeddings Router
Vector embedding generation and management
"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import numpy as np

router = APIRouter()


# Request/Response Models
class TextEmbeddingRequest(BaseModel):
    text: str = Field(..., description="Text to embed")


class BatchEmbeddingRequest(BaseModel):
    texts: List[str] = Field(..., description="List of texts to embed")


class ProfileEmbeddingRequest(BaseModel):
    profile: Dict[str, Any] = Field(..., description="Student profile")


class SimilarityRequest(BaseModel):
    text1: str = Field(..., description="First text")
    text2: str = Field(..., description="Second text")


class GapScoreRequest(BaseModel):
    student_profile: Dict[str, Any] = Field(..., description="Student profile")
    role: str = Field(..., description="Target role")
    company: Optional[str] = Field(default=None, description="Target company")


@router.post("/embed")
async def embed_text(request: TextEmbeddingRequest):
    """
    Generate embedding for a single text
    
    Returns 384-dimensional vector (all-MiniLM-L6-v2)
    """
    from app.main import embedding_service
    
    embedding = await embedding_service.embed_text(request.text)
    
    return {
        "success": True,
        "embedding": embedding.tolist(),
        "dimension": len(embedding)
    }


@router.post("/embed/batch")
async def embed_batch(request: BatchEmbeddingRequest):
    """
    Generate embeddings for multiple texts
    """
    from app.main import embedding_service
    
    embeddings = await embedding_service.embed_texts(request.texts)
    
    return {
        "success": True,
        "embeddings": embeddings.tolist(),
        "count": len(request.texts),
        "dimension": embeddings.shape[1] if len(embeddings) > 0 else 0
    }


@router.post("/embed/profile")
async def embed_profile(request: ProfileEmbeddingRequest):
    """
    Generate comprehensive embedding for student profile
    
    Combines education, skills, experience, target role
    into a single vector representation
    """
    from app.main import embedding_service
    
    embedding = await embedding_service.embed_student_profile(request.profile)
    
    return {
        "success": True,
        "embedding": embedding.tolist(),
        "dimension": len(embedding)
    }


@router.post("/similarity")
async def compute_similarity(request: SimilarityRequest):
    """
    Compute cosine similarity between two texts
    """
    from app.main import embedding_service
    
    emb1 = await embedding_service.embed_text(request.text1)
    emb2 = await embedding_service.embed_text(request.text2)
    
    similarity = await embedding_service.compute_similarity(emb1, emb2)
    
    return {
        "success": True,
        "similarity": similarity,
        "percentage": similarity * 100
    }


@router.post("/gap-score")
async def compute_gap_score(request: GapScoreRequest):
    """
    Compute skill gap score between student and role requirements
    """
    from app.main import embedding_service
    
    student_embedding = await embedding_service.embed_student_profile(request.student_profile)
    role_embedding = await embedding_service.embed_role_requirements(
        request.role,
        request.company
    )
    
    gap_score = await embedding_service.compute_gap_score(
        student_embedding,
        role_embedding
    )
    
    return {
        "success": True,
        "gap_analysis": gap_score
    }


@router.get("/info")
async def get_embedding_info():
    """
    Get information about the embedding model
    """
    from app.main import embedding_service
    from app.config import get_settings
    
    settings = get_settings()
    
    return {
        "success": True,
        "model": settings.embedding_model,
        "dimension": embedding_service.embedding_dim,
        "ready": embedding_service.is_ready
    }
