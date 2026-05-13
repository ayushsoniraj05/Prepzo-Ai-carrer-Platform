"""
Prepzo AI Service - Main Application
FastAPI-based AI microservice for career guidance and placement preparation
"""

from fastapi import FastAPI, HTTPException, Depends, Security, Request  # pyre-ignore
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware  # pyre-ignore
from fastapi.security import APIKeyHeader  # pyre-ignore
from contextlib import asynccontextmanager
from loguru import logger  # pyre-ignore
import sys
import traceback
import asyncio

from app.config import get_settings, ensure_directories  # pyre-ignore
from app.routers import (  # pyre-ignore
    assessment,
    recommendations,
    mentor,
    embeddings,
    knowledge_base,
    health,
    ai_test,
    resume,
    jobs
)
from app.services.model_service import ModelService  # pyre-ignore
from app.services.embedding_service import EmbeddingService  # pyre-ignore
from app.services.vector_store import VectorStore  # pyre-ignore
from app.database import Database  # pyre-ignore
from app import dependencies  # pyre-ignore


# Configure logging
settings = get_settings()
logger.remove()
logger.add(
    sys.stderr,
    level=settings.log_level,
    format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>"
)
logger.add(
    settings.log_file,
    rotation="10 MB",
    retention="7 days",
    level=settings.log_level
)


# Global service instances (legacy support, but better use app.state or dependencies)
model_service: ModelService = None
embedding_service: EmbeddingService = None
vector_store: VectorStore = None
database: Database = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager - handles startup and shutdown"""
    global model_service, embedding_service, vector_store, database
    
    logger.info("🚀 Prepzo AI Service: Opening network ports immediately...")
    
    # 1. Basic Directory Setup (Fast)
    ensure_directories()
    
    # 2. Start Services in the Background
    # This ensures Render sees an open port in < 1 second.
    async def initialize_background():
        global model_service, embedding_service, vector_store, database
        try:
            logger.info("📦 [Background] Initiating connections...")
            
            # Database
            database = Database()
            await database.connect()
            
            # Embeddings (Heavy: 80MB-500MB)
            embedding_service = EmbeddingService()
            await embedding_service.initialize()
            
            # Vector Store
            vector_store = VectorStore(embedding_service)
            await vector_store.initialize()
            
            # Model Provider
            model_service = ModelService()
            await model_service.initialize()
            
            # Sync dependencies
            dependencies.set_services(model_service, embedding_service, vector_store, database)
            
            # Re-attach to state
            app.state.model_service = model_service
            app.state.embedding_service = embedding_service
            app.state.vector_store = vector_store
            app.state.database = database
            
            logger.info("✨ [Background] All AI systems are now ONLINE.")
        except Exception as e:
            logger.error(f"❌ [Background] Critical init error: {e}")

    # Fire and forget the background task
    asyncio.create_task(initialize_background())
    
    # Port is now open!
    logger.info("🌐 Web Server is now listening. AI loading in background...")
    
    yield
    
    # Cleanup on shutdown
    logger.info("🛑 Shutting down Prepzo AI Service...")
    if database:
        await database.disconnect()
    logger.info("👋 Shutdown complete")


# Create FastAPI application
app = FastAPI(
    title="Prepzo AI Service",
    description="Internal AI Engine for Career Guidance & Placement Preparation",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"❌ Global error: {exc}")
    logger.error(traceback.format_exc())
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc), "traceback": traceback.format_exc()}
    )


# API Key authentication
api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)


async def verify_api_key(api_key: str = Security(api_key_header)):
    """Verify API key for protected endpoints"""
    if settings.api_key and api_key != settings.api_key:
        raise HTTPException(status_code=403, detail="Invalid API key")
    return api_key


# Dependency injection for services
def get_model_service() -> ModelService:
    """Get model service instance"""
    if model_service is None:
        raise HTTPException(status_code=503, detail="Model service not initialized")
    return model_service


def get_embedding_service() -> EmbeddingService:
    """Get embedding service instance"""
    if embedding_service is None:
        raise HTTPException(status_code=503, detail="Embedding service not initialized")
    return embedding_service


def get_vector_store() -> VectorStore:
    """Get vector store instance"""
    if vector_store is None:
        raise HTTPException(status_code=503, detail="Vector store not initialized")
    return vector_store


def get_database() -> Database:
    """Get database instance"""
    if database is None:
        raise HTTPException(status_code=503, detail="Database not initialized")
    return database


# Include routers
app.include_router(health.router, tags=["Health"])
app.include_router(
    assessment.router,
    prefix="/api/assessment",
    tags=["Skill Assessment"],
    dependencies=[Depends(verify_api_key)]
)
app.include_router(
    recommendations.router,
    prefix="/api/recommendations",
    tags=["Recommendations"],
    dependencies=[Depends(verify_api_key)]
)
app.include_router(
    mentor.router,
    prefix="/api/mentor",
    tags=["AI Mentor"],
    dependencies=[Depends(verify_api_key)]
)
app.include_router(
    embeddings.router,
    prefix="/api/embeddings",
    tags=["Embeddings"],
    dependencies=[Depends(verify_api_key)]
)
app.include_router(
    knowledge_base.router,
    prefix="/api/knowledge",
    tags=["Knowledge Base"],
    dependencies=[Depends(verify_api_key)]
)
app.include_router(
    ai_test.router,
    prefix="/api/ai-test",
    tags=["AI Test Generation"],
    dependencies=[Depends(verify_api_key)]
)
app.include_router(
    resume.router,
    prefix="/api/resume",
    tags=["Resume Analysis"],
    dependencies=[Depends(verify_api_key)]
)
app.include_router(
    jobs.router,
    prefix="/api/jobs",
    tags=["Job Matching & Recruiter Bot"],
    dependencies=[Depends(verify_api_key)]
)


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "Prepzo AI Service",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs" if settings.debug else "disabled"
    }


if __name__ == "__main__":
    import uvicorn  # pyre-ignore
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
        workers=settings.workers
    )
 
