"""
Prepzo AI Service - Vector Store
FAISS-based vector database for semantic search and recommendation
"""

import faiss
import numpy as np
from loguru import logger
from typing import List, Dict, Any, Optional, Tuple
import os
import pickle
import asyncio
from concurrent.futures import ThreadPoolExecutor

from app.config import get_settings
from app.services.embedding_service import EmbeddingService


class VectorStore:
    """
    FAISS-based vector store for efficient similarity search
    Supports multiple indexes for different entity types
    """
    
    # Index types
    INDEX_SKILLS = "skills"
    INDEX_COURSES = "courses"
    INDEX_YOUTUBE = "youtube"
    INDEX_CERTIFICATIONS = "certifications"
    INDEX_QUESTIONS = "questions"
    INDEX_ROLES = "roles"
    INDEX_STUDY_NOTES = "study_notes"
    INDEX_INTERVIEW_PREP = "interview_prep"
    INDEX_PRACTICE_PROBLEMS = "practice_problems"
    INDEX_PROJECTS = "projects"
    
    def __init__(self, embedding_service: EmbeddingService):
        self.settings = get_settings()
        self.embedding_service = embedding_service
        self.executor = ThreadPoolExecutor(max_workers=2)
        
        # FAISS indexes for different entity types
        self.indexes: Dict[str, faiss.Index] = {}
        
        # ID mappings (FAISS uses integer IDs, we map to our string IDs)
        self.id_maps: Dict[str, Dict[int, str]] = {}
        
        # Metadata storage
        self.metadata: Dict[str, Dict[str, Any]] = {}
        
        self._initialized = False
    
    async def initialize(self):
        """Initialize vector store and load existing indexes"""
        if self._initialized:
            return
        
        # Ensure index directory exists
        os.makedirs(self.settings.faiss_index_path, exist_ok=True)
        
        # Initialize indexes for each type
        index_types = [
            self.INDEX_SKILLS,
            self.INDEX_COURSES,
            self.INDEX_YOUTUBE,
            self.INDEX_CERTIFICATIONS,
            self.INDEX_QUESTIONS,
            self.INDEX_ROLES,
            self.INDEX_STUDY_NOTES,
            self.INDEX_INTERVIEW_PREP,
            self.INDEX_PRACTICE_PROBLEMS,
            self.INDEX_PROJECTS
        ]
        
        for index_type in index_types:
            await self._init_index(index_type)
        
        self._initialized = True
        logger.info("✅ FAISS vector store initialized")
    
    async def _init_index(self, index_type: str):
        """Initialize or load a specific index"""
        index_path = os.path.join(self.settings.faiss_index_path, f"{index_type}.index")
        mapping_path = os.path.join(self.settings.faiss_index_path, f"{index_type}_mapping.pkl")
        metadata_path = os.path.join(self.settings.faiss_index_path, f"{index_type}_metadata.pkl")
        
        if os.path.exists(index_path):
            # Load existing index
            loop = asyncio.get_event_loop()
            index = await loop.run_in_executor(
                self.executor,
                lambda: faiss.read_index(index_path)
            )
            self.indexes[index_type] = index
            
            # Load ID mapping
            if os.path.exists(mapping_path):
                with open(mapping_path, 'rb') as f:
                    self.id_maps[index_type] = pickle.load(f)
            else:
                self.id_maps[index_type] = {}
            
            # Load metadata
            if os.path.exists(metadata_path):
                with open(metadata_path, 'rb') as f:
                    self.metadata[index_type] = pickle.load(f)
            else:
                self.metadata[index_type] = {}
            
            logger.info(f"   Loaded index: {index_type} ({index.ntotal} vectors)")
        else:
            # Create new index
            dim = self.embedding_service.embedding_dim
            
            # Use IndexFlatIP for cosine similarity (after normalizing vectors)
            # For larger datasets, use IndexIVFFlat or IndexHNSW
            index = faiss.IndexFlatIP(dim)
            
            self.indexes[index_type] = index
            self.id_maps[index_type] = {}
            self.metadata[index_type] = {}
            
            logger.info(f"   Created new index: {index_type}")
    
    async def add_vectors(
        self,
        index_type: str,
        vectors: np.ndarray,
        ids: List[str],
        metadata_list: Optional[List[Dict[str, Any]]] = None
    ):
        """
        Add vectors to an index
        
        Args:
            index_type: Type of index (skills, courses, etc.)
            vectors: numpy array of shape (n, dim)
            ids: List of string IDs
            metadata_list: Optional list of metadata dicts
        """
        if index_type not in self.indexes:
            raise ValueError(f"Unknown index type: {index_type}")
        
        index = self.indexes[index_type]
        
        # Normalize vectors for cosine similarity
        faiss.normalize_L2(vectors)
        
        # Get starting ID
        start_id = index.ntotal
        
        # Add to index
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(
            self.executor,
            lambda: index.add(vectors)
        )
        
        # Update ID mapping
        for i, str_id in enumerate(ids):
            int_id = start_id + i
            self.id_maps[index_type][int_id] = str_id
            
            # Store metadata
            if metadata_list and i < len(metadata_list):
                self.metadata[index_type][str_id] = metadata_list[i]
        
        logger.debug(f"Added {len(ids)} vectors to {index_type} index")
    
    async def add_single(
        self,
        index_type: str,
        text: str,
        entity_id: str,
        metadata: Optional[Dict[str, Any]] = None
    ):
        """
        Add a single item to the index
        
        Args:
            index_type: Type of index
            text: Text to embed
            entity_id: String ID for the entity
            metadata: Optional metadata
        """
        # Generate embedding
        embedding = await self.embedding_service.embed_text(text)
        embedding = embedding.reshape(1, -1).astype('float32')
        
        await self.add_vectors(
            index_type,
            embedding,
            [entity_id],
            [metadata] if metadata else None
        )
    
    async def search(
        self,
        index_type: str,
        query_vector: np.ndarray,
        top_k: int = 10,
        filter_fn: Optional[callable] = None
    ) -> List[Dict[str, Any]]:
        """
        Search for similar vectors
        
        Args:
            index_type: Type of index to search
            query_vector: Query embedding
            top_k: Number of results
            filter_fn: Optional filter function for metadata
            
        Returns:
            List of results with id, score, and metadata
        """
        if index_type not in self.indexes:
            raise ValueError(f"Unknown index type: {index_type}")
        
        index = self.indexes[index_type]
        
        if index.ntotal == 0:
            return []
        
        # Normalize query vector
        query_vector = query_vector.reshape(1, -1).astype('float32')
        faiss.normalize_L2(query_vector)
        
        # Search
        # Get more results if we need to filter
        search_k = top_k * 3 if filter_fn else top_k
        
        loop = asyncio.get_event_loop()
        scores, indices = await loop.run_in_executor(
            self.executor,
            lambda: index.search(query_vector, min(search_k, index.ntotal))
        )
        
        results = []
        for score, idx in zip(scores[0], indices[0]):
            if idx == -1:  # Invalid result
                continue
            
            str_id = self.id_maps[index_type].get(int(idx))
            if not str_id:
                continue
            
            meta = self.metadata[index_type].get(str_id, {})
            
            # Apply filter if provided
            if filter_fn and not filter_fn(meta):
                continue
            
            results.append({
                "id": str_id,
                "score": float(score),
                "similarity": float(score),  # Already cosine similarity due to normalization
                "metadata": meta
            })
            
            if len(results) >= top_k:
                break
        
        return results
    
    async def search_by_text(
        self,
        index_type: str,
        query_text: str,
        top_k: int = 10,
        filter_fn: Optional[callable] = None
    ) -> List[Dict[str, Any]]:
        """
        Search using text query
        
        Args:
            index_type: Type of index to search
            query_text: Text query
            top_k: Number of results
            filter_fn: Optional filter function
            
        Returns:
            List of search results
        """
        query_embedding = await self.embedding_service.embed_text(query_text)
        return await self.search(index_type, query_embedding, top_k, filter_fn)
    
    async def find_skill_gaps(
        self,
        student_skills: List[str],
        target_role: str,
        top_k: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Find skill gaps by comparing student skills to role requirements
        
        Args:
            student_skills: List of student's current skills
            target_role: Target job role
            top_k: Number of gaps to return
            
        Returns:
            List of skill gaps with severity scores
        """
        # Get embedding for student skills combined
        student_text = f"Skills: {', '.join(student_skills)}"
        student_embedding = await self.embedding_service.embed_text(student_text)
        
        # Search role requirements
        role_results = await self.search_by_text(
            self.INDEX_ROLES,
            target_role,
            top_k=5
        )
        
        # Search all skills and find gaps
        all_skills = await self.search_by_text(
            self.INDEX_SKILLS,
            target_role,
            top_k=50
        )
        
        # Calculate gap severity for each skill
        gaps = []
        student_skill_set = set(s.lower() for s in student_skills)
        
        for skill_result in all_skills:
            skill_name = skill_result['metadata'].get('name', skill_result['id'])
            
            # Check if student already has this skill
            if skill_name.lower() in student_skill_set:
                continue
            
            # Gap severity based on role relevance
            gap_severity = skill_result['score']  # Higher score = more relevant to role
            
            gaps.append({
                "skill": skill_name,
                "gap_severity": gap_severity,
                "relevance_to_role": skill_result['score'] * 100,
                "priority": "high" if gap_severity > 0.7 else "medium" if gap_severity > 0.4 else "low",
                "metadata": skill_result['metadata']
            })
        
        # Sort by gap severity
        gaps.sort(key=lambda x: x['gap_severity'], reverse=True)
        
        return gaps[:top_k]
    
    async def find_resources_for_skill(
        self,
        skill: str,
        resource_types: List[str] = None,
        level: Optional[str] = None,
        top_k: int = 5
    ) -> Dict[str, List[Dict[str, Any]]]:
        """
        Find learning resources for a skill
        
        Args:
            skill: Skill to find resources for
            resource_types: List of resource types (courses, youtube, certifications)
            level: Optional skill level filter
            top_k: Number of resources per type
            
        Returns:
            Dict mapping resource type to list of resources
        """
        if resource_types is None:
            resource_types = [self.INDEX_COURSES, self.INDEX_YOUTUBE, self.INDEX_CERTIFICATIONS]
        
        results = {}
        
        # Filter function for level
        def level_filter(meta):
            if not level:
                return True
            return meta.get('level', '').lower() == level.lower()
        
        for rtype in resource_types:
            resources = await self.search_by_text(
                rtype,
                skill,
                top_k=top_k,
                filter_fn=level_filter if level else None
            )
            results[rtype] = resources
        
        return results
    
    async def save_indexes(self):
        """Save all indexes to disk"""
        for index_type, index in self.indexes.items():
            index_path = os.path.join(self.settings.faiss_index_path, f"{index_type}.index")
            mapping_path = os.path.join(self.settings.faiss_index_path, f"{index_type}_mapping.pkl")
            metadata_path = os.path.join(self.settings.faiss_index_path, f"{index_type}_metadata.pkl")
            
            # Save index
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(
                self.executor,
                lambda p=index_path: faiss.write_index(index, p)
            )
            
            # Save ID mapping
            with open(mapping_path, 'wb') as f:
                pickle.dump(self.id_maps.get(index_type, {}), f)
            
            # Save metadata
            with open(metadata_path, 'wb') as f:
                pickle.dump(self.metadata.get(index_type, {}), f)
        
        logger.info("✅ All indexes saved to disk")
    
    async def get_index_stats(self) -> Dict[str, Any]:
        """Get statistics for all indexes"""
        stats = {}
        for index_type, index in self.indexes.items():
            stats[index_type] = {
                "total_vectors": index.ntotal,
                "dimension": index.d,
                "is_trained": index.is_trained
            }
        return stats
    
    @property
    def is_ready(self) -> bool:
        """Check if vector store is ready"""
        return self._initialized
