"""
Prepzo AI Service - External AI Service (DEPRECATED)

This file is kept for backwards compatibility but now redirects
to the internal AI service. No external APIs (OpenAI, Gemini, etc.) are used.

All AI functionality now runs on the local Mistral/LLaMA model.
"""

from loguru import logger

# Redirect all imports to internal_ai_service
from app.services.internal_ai_service import (
    InternalAIService,
    get_internal_ai_service
)


# Alias for backwards compatibility
ExternalAIService = InternalAIService


def get_external_ai_service() -> InternalAIService:
    """
    Backwards compatibility function
    
    DEPRECATED: This function now returns InternalAIService.
    No external AI APIs are used. All AI runs locally.
    """
    logger.debug("get_external_ai_service() called - redirecting to internal AI service")
    return get_internal_ai_service()


__all__ = ['ExternalAIService', 'get_external_ai_service']
