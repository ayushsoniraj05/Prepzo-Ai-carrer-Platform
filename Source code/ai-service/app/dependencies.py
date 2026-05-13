"""
Prepzo AI Service - Dependencies
Centralized dependency injection for all routers and services
"""

from typing import Optional
from fastapi import HTTPException  # pyre-ignore
import app.services.model_service as model_service_mod  # pyre-ignore
import app.services.embedding_service as embedding_service_mod  # pyre-ignore
import app.services.vector_store as vector_store_mod  # pyre-ignore
import app.database as database_mod  # pyre-ignore

# Resource instances (initialized in app/main.py lifespan)
_model_service: Optional['model_service_mod.ModelService'] = None
_embedding_service: Optional['embedding_service_mod.EmbeddingService'] = None
_vector_store: Optional['vector_store_mod.VectorStore'] = None
_database: Optional['database_mod.Database'] = None

def set_services(model, embedding, vector, db):
    """Set the global service instances (called by main.py)"""
    global _model_service, _embedding_service, _vector_store, _database
    _model_service = model
    _embedding_service = embedding
    _vector_store = vector
    _database = db

def get_model_service() -> 'model_service_mod.ModelService':
    """FastAPI dependency to get model service"""
    if _model_service is None:
        raise HTTPException(status_code=503, detail="AI Model service not initialized")
    return _model_service

def get_embedding_service() -> 'embedding_service_mod.EmbeddingService':
    """FastAPI dependency to get embedding service"""
    if _embedding_service is None:
        raise HTTPException(status_code=503, detail="Embedding service not initialized")
    return _embedding_service

def get_vector_store() -> 'vector_store_mod.VectorStore':
    """FastAPI dependency to get vector store"""
    if _vector_store is None:
        raise HTTPException(status_code=503, detail="Vector store not initialized")
    return _vector_store

def get_database() -> 'database_mod.Database':
    """FastAPI dependency to get database instance"""
    if _database is None:
        raise HTTPException(status_code=503, detail="Database not initialized")
    return _database
