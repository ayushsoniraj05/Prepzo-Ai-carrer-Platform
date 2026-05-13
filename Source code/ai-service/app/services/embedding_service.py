"""
Prepzo AI Service - Embedding Service
Generates vector embeddings using Sentence Transformers
"""

from loguru import logger
from typing import List, Dict, Any, Optional, Union
import numpy as np
import asyncio
from concurrent.futures import ThreadPoolExecutor

from app.config import get_settings


class EmbeddingService:
    """
    Service for generating text embeddings using Sentence Transformers
    Used for semantic search, skill matching, and recommendation scoring
    """
    
    def __init__(self):
        self.settings = get_settings()
        self.model: Any = None
        self.executor = ThreadPoolExecutor(max_workers=2)
        self._initialized = False
        self.embedding_dim = 384  # Default for all-MiniLM-L6-v2
    
    async def initialize(self):
        """Initialize the embedding model"""
        if self.settings.low_memory_mode:
            logger.warning("🧊 [Low Memory Mode] Skipping SentenceTransformer model load to save RAM.")
            return

        try:
            loop = asyncio.get_event_loop()
            self.model = await loop.run_in_executor(
                self.executor,
                self._load_model
            )
            if self.model:
                self.embedding_dim = self.model.get_sentence_embedding_dimension()
                self._initialized = True
                logger.info(f"✅ Embedding model loaded: {self.settings.embedding_model}")
                logger.info(f"   Embedding dimension: {self.embedding_dim}")
            else:
                logger.warning("⚠️ Embedding model could not be loaded. Some features will be disabled.")
            
        except Exception as e:
            logger.error(f"❌ Failed to load embedding model: {e}")
            # Do not raise, allow service to boot
    
    def _load_model(self) -> Any:
        """Load sentence transformer model lazily"""
        try:
            from sentence_transformers import SentenceTransformer
            logger.info(f"💾 Loading model: {self.settings.embedding_model}")
            return SentenceTransformer(self.settings.embedding_model)
        except Exception as e:
            logger.error(f"❌ Failed to load SentenceTransformer: {e}")
            return None
    
    async def embed_text(self, text: str) -> np.ndarray:
        """
        Generate embedding for a single text
        """
        if not self.model:
            return np.zeros(self.embedding_dim)
        
        loop = asyncio.get_event_loop()
        embedding = await loop.run_in_executor(
            self.executor,
            lambda: self.model.encode(text, convert_to_numpy=True)
        )
        return embedding
    
    async def embed_texts(self, texts: List[str]) -> np.ndarray:
        """
        Generate embeddings for multiple texts
        """
        if not self.model:
            return np.zeros((len(texts), self.embedding_dim))
        
        loop = asyncio.get_event_loop()
        embeddings = await loop.run_in_executor(
            self.executor,
            lambda: self.model.encode(texts, convert_to_numpy=True, show_progress_bar=False)
        )
        return embeddings
    
    async def embed_student_profile(self, profile: Dict[str, Any]) -> np.ndarray:
        """
        Create a comprehensive embedding for a student profile
        """
        profile_text = self._construct_profile_text(profile)
        return await self.embed_text(profile_text)
    
    def _construct_profile_text(self, profile: Dict[str, Any]) -> str:
        """Construct embedding-friendly text from profile"""
        parts = []
        if profile.get('degree'): parts.append(f"Education: {profile['degree']}")
        if profile.get('fieldOfStudy'): parts.append(f"Field: {profile['fieldOfStudy']}")
        if profile.get('targetRole'): parts.append(f"Target role: {profile['targetRole']}")
        if profile.get('skills'): parts.append(f"Skills: {', '.join(profile['skills'])}")
        return ". ".join(parts)

    async def compute_similarity(self, embedding1: np.ndarray, embedding2: np.ndarray) -> float:
        """Compute cosine similarity between two embeddings"""
        norm1 = np.linalg.norm(embedding1)
        norm2 = np.linalg.norm(embedding2)
        if norm1 == 0 or norm2 == 0: return 0.0
        return float(np.dot(embedding1, embedding2) / (norm1 * norm2))

    @property
    def is_ready(self) -> bool:
        return self._initialized and self.model is not None
