"""
Health Check Router
"""

from fastapi import APIRouter
from datetime import datetime

router = APIRouter()


@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "Prepzo AI Service",
        "timestamp": datetime.utcnow().isoformat()
    }


@router.get("/ready")
async def readiness_check():
    """Readiness check - verifies all services are ready"""
    from app.main import model_service, embedding_service, vector_store, database
    
    checks = {
        "model_service": model_service is not None and model_service.is_ready,
        "embedding_service": embedding_service is not None and embedding_service.is_ready,
        "vector_store": vector_store is not None and vector_store.is_ready,
        "database": database is not None
    }
    
    all_ready = all(checks.values())
    
    return {
        "ready": all_ready,
        "checks": checks,
        "timestamp": datetime.utcnow().isoformat()
    }
