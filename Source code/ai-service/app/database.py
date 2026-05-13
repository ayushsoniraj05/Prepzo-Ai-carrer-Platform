"""
Prepzo AI Service - Database Connection
Async MongoDB connection using Motor
"""

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from loguru import logger
from typing import Optional

from app.config import get_settings


class Database:
    """Async MongoDB database connection manager"""
    
    def __init__(self):
        self.settings = get_settings()
        self.client: Optional[AsyncIOMotorClient] = None
        self.db: Optional[AsyncIOMotorDatabase] = None
    
    async def connect(self):
        """Connect to MongoDB with graceful fallback"""
        try:
            if not self.settings.mongodb_uri:
                logger.warning("⚠️ No MONGODB_URI configured. AI Service will run in degraded mode.")
                return

            self.client = AsyncIOMotorClient(
                self.settings.mongodb_uri,
                serverSelectionTimeoutMS=5000,
                connectTimeoutMS=5000
            )
            self.db = self.client[self.settings.mongodb_database]
            
            # Verify connection
            await self.client.admin.command('ping')
            logger.info(f"✅ Connected to MongoDB: {self.settings.mongodb_database}")
            
            # Ensure indexes
            await self._ensure_indexes()
            
        except Exception as e:
            logger.error(f"❌ Failed to connect to MongoDB: {e}")
            logger.warning("⚠️ AI Service will continue without database persistence.")
            self.client = None
            self.db = None
            # Do not raise - allow service to start degraded
    
    async def disconnect(self):
        """Disconnect from MongoDB"""
        if self.client:
            self.client.close()
            logger.info("🔌 Disconnected from MongoDB")
    
    async def _ensure_indexes(self):
        """Create necessary indexes for AI collections"""
        
        # Embeddings collection indexes
        await self.db.embeddings.create_index("entity_type")
        await self.db.embeddings.create_index("entity_id")
        await self.db.embeddings.create_index([("entity_type", 1), ("created_at", -1)])
        
        # Skill vectors collection indexes
        await self.db.skill_vectors.create_index("name") # Removed unique=True
        await self.db.skill_vectors.create_index("category")
        await self.db.skill_vectors.create_index("industry")
        
        # Knowledge base collections
        await self.db.interview_questions.create_index("company")
        await self.db.interview_questions.create_index("role")
        await self.db.interview_questions.create_index("skill")
        await self.db.interview_questions.create_index("difficulty")
        
        await self.db.courses.create_index("skills")
        await self.db.courses.create_index("platform")
        await self.db.courses.create_index("level")
        await self.db.courses.create_index("quality_score")
        
        await self.db.youtube_resources.create_index("skills")
        await self.db.youtube_resources.create_index("channel")
        await self.db.youtube_resources.create_index("quality_score")
        
        await self.db.certifications.create_index("skills")
        await self.db.certifications.create_index("provider")
        await self.db.certifications.create_index("industry_value")
        
        # Recommendation tracking
        await self.db.recommendation_logs.create_index("user_id")
        await self.db.recommendation_logs.create_index("created_at")
        await self.db.recommendation_logs.create_index("effectiveness_score")
        
        await self.db.resource_quality_scores.create_index("resource_id")
        await self.db.resource_quality_scores.create_index("resource_type")
        
        # Improvement tracking
        await self.db.improvement_tracking.create_index("user_id")
        await self.db.improvement_tracking.create_index([("user_id", 1), ("skill", 1)])
        await self.db.improvement_tracking.create_index("recorded_at")
        
        # Mentor conversation history
        await self.db.mentor_conversations.create_index("user_id")
        await self.db.mentor_conversations.create_index([("user_id", 1), ("session_id", 1)])
        await self.db.mentor_conversations.create_index("created_at")
        
        # Industry trends
        await self.db.industry_trends.create_index("skill")
        await self.db.industry_trends.create_index("industry")
        await self.db.industry_trends.create_index("updated_at")
        
        logger.info("📑 Database indexes ensured")
    
    # Collection accessors with safety checks
    @property
    def embeddings(self):
        return self.db.embeddings if self.db is not None else None
    
    @property
    def skill_vectors(self):
        return self.db.skill_vectors if self.db is not None else None
    
    @property
    def interview_questions(self):
        return self.db.interview_questions if self.db is not None else None
    
    @property
    def courses(self):
        return self.db.courses if self.db is not None else None
    
    @property
    def youtube_resources(self):
        return self.db.youtube_resources if self.db is not None else None
    
    @property
    def certifications(self):
        return self.db.certifications if self.db is not None else None
    
    @property
    def recommendation_logs(self):
        return self.db.recommendation_logs if self.db is not None else None
    
    @property
    def resource_quality_scores(self):
        return self.db.resource_quality_scores if self.db is not None else None
    
    @property
    def improvement_tracking(self):
        return self.db.improvement_tracking if self.db is not None else None
    
    @property
    def mentor_conversations(self):
        return self.db.mentor_conversations if self.db is not None else None
    
    @property
    def industry_trends(self):
        return self.db.industry_trends if self.db is not None else None

    @property
    def job_roles(self):
        return self.db.job_roles if self.db is not None else None

    @property
    def study_notes(self):
        return self.db.study_notes if self.db is not None else None

    @property
    def interview_prep(self):
        return self.db.interview_prep if self.db is not None else None

    @property
    def practice_problems(self):
        return self.db.practice_problems if self.db is not None else None

    @property
    def projects(self):
        return self.db.projects if self.db is not None else None
