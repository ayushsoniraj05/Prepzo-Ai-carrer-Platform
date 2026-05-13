"""
Routers Package Initialization
"""

from app.routers import (
    health,
    assessment,
    recommendations,
    mentor,
    embeddings,
    knowledge_base
)

__all__ = [
    "health",
    "assessment",
    "recommendations",
    "mentor",
    "embeddings",
    "knowledge_base"
]
