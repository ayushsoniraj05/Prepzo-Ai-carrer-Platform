"""
AI Mentor Router
Interactive mentor chat endpoints
"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime

router = APIRouter()


# Request/Response Models
class ChatRequest(BaseModel):
    user_id: str = Field(..., description="User's ID")
    message: str = Field(..., description="Chat message from user")
    session_id: Optional[str] = Field(default=None, description="Session ID for conversation continuity")


class SessionHistoryRequest(BaseModel):
    user_id: str = Field(..., description="User's ID")
    session_id: str = Field(..., description="Session ID to retrieve")


@router.post("/chat")
async def chat_with_mentor(request: ChatRequest):
    """
    Chat with AI mentor
    
    Features:
    - Context-aware responses
    - Remembers conversation history
    - Knows student's weak areas
    - Provides adaptive guidance
    - Interview practice mode
    - Concept explanations
    - Career guidance
    - Motivational support
    """
    from app.main import model_service, embedding_service, vector_store, database
    from app.services.mentor_engine import MentorEngine
    
    engine = MentorEngine(
        model_service=model_service,
        embedding_service=embedding_service,
        vector_store=vector_store,
        database=database
    )
    
    response = await engine.chat(
        user_id=request.user_id,
        message=request.message,
        session_id=request.session_id
    )
    
    return {
        "success": True,
        "response": response
    }


@router.get("/sessions/{user_id}")
async def get_user_sessions(user_id: str, limit: int = 10):
    """
    Get list of conversation sessions for a user
    """
    from app.main import model_service, embedding_service, vector_store, database
    from app.services.mentor_engine import MentorEngine
    
    engine = MentorEngine(
        model_service=model_service,
        embedding_service=embedding_service,
        vector_store=vector_store,
        database=database
    )
    
    sessions = await engine.get_conversation_sessions(user_id, limit)
    
    return {
        "success": True,
        "sessions": sessions
    }


@router.post("/sessions/history")
async def get_session_history(request: SessionHistoryRequest):
    """
    Get full conversation history for a specific session
    """
    from app.main import model_service, embedding_service, vector_store, database
    from app.services.mentor_engine import MentorEngine
    
    engine = MentorEngine(
        model_service=model_service,
        embedding_service=embedding_service,
        vector_store=vector_store,
        database=database
    )
    
    history = await engine.get_session_history(
        user_id=request.user_id,
        session_id=request.session_id
    )
    
    return {
        "success": True,
        "history": history
    }


@router.post("/interview/start")
async def start_interview_practice(request: ChatRequest):
    """
    Start an interview practice session
    """
    # Redirect to chat with interview intent
    request.message = "I want to practice interview questions"
    return await chat_with_mentor(request)


@router.post("/explain")
async def explain_concept(
    user_id: str,
    concept: str,
    depth: str = "medium"
):
    """
    Get AI explanation for a concept
    
    Args:
        user_id: User's ID for context
        concept: Concept to explain
        depth: brief/medium/detailed
    """
    from app.main import model_service, embedding_service, vector_store, database
    from app.services.mentor_engine import MentorEngine
    
    engine = MentorEngine(
        model_service=model_service,
        embedding_service=embedding_service,
        vector_store=vector_store,
        database=database
    )
    
    message = f"Explain {concept}"
    if depth == "brief":
        message = f"Briefly explain {concept}"
    elif depth == "detailed":
        message = f"Give me a detailed explanation of {concept} with examples"
    
    response = await engine.chat(
        user_id=user_id,
        message=message
    )
    
    return {
        "success": True,
        "explanation": response
    }
