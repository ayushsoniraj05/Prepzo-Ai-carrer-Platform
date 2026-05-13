"""
Prepzo AI Service Configuration
Centralized configuration management using Pydantic Settings
Uses Ollama for local LLM - NO external AI APIs
"""

from pydantic_settings import BaseSettings
from pydantic import Field
from typing import List, Optional
from functools import lru_cache
import os


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # Server
    host: str = Field(default="0.0.0.0", env="HOST")
    port: int = Field(default=8000, env="PORT")
    debug: bool = Field(default=False, env="DEBUG")
    workers: int = Field(default=1, env="WORKERS")
    low_memory_mode: bool = Field(default=False, env="LOW_MEMORY_MODE")
    
    # AI Provider (ollama, groq, gemini)
    ai_provider: str = Field(default="ollama", env="AI_PROVIDER")
    
    # Groq Configuration (High-speed Cloud LLM)
    # Get free API key: https://console.groq.com
    groq_api_key: str = Field(default="", env="GROQ_API_KEY")
    groq_model: str = Field(default="llama-3.3-70b-versatile", env="GROQ_MODEL")
    
    # Ollama Configuration (Local LLM Server)
    # Install Ollama: https://ollama.ai
    # Pull model: ollama pull llama3.2:1b
    ollama_url: str = Field(default="http://localhost:11434", env="OLLAMA_URL")
    ollama_model: str = Field(default="llama3.2:1b", env="OLLAMA_MODEL")
    ollama_num_gpu: int = Field(default=0, env="OLLAMA_NUM_GPU")
    
    # Embedding Model (for FAISS vector search)
    embedding_model: str = Field(default="sentence-transformers/all-MiniLM-L6-v2", env="EMBEDDING_MODEL")
    
    # MongoDB
    mongodb_uri: str = Field(default="mongodb://localhost:27017", env="MONGODB_URI")
    mongodb_database: str = Field(default="prepzo_ai", env="MONGODB_DATABASE")
    
    # FAISS
    faiss_index_path: str = Field(default="./data/faiss_indexes", env="FAISS_INDEX_PATH")
    knowledge_base_path: str = Field(default="./data/knowledge_base", env="KNOWLEDGE_BASE_PATH")
    
    # Service URLs
    node_backend_url: str = Field(default="http://localhost:5000", env="NODE_BACKEND_URL")
    
    # NOTE: Prepzo AI Mentor uses Ollama for 100% local AI
    # No external API keys required - all AI is self-hosted via Ollama
    # Supported models: mistral, llama2, phi, gemma, codellama, etc.
    
    # Logging
    log_level: str = Field(default="INFO", env="LOG_LEVEL")
    log_file: str = Field(default="./logs/ai_service.log", env="LOG_FILE")

    def __init__(self, **values):
        super().__init__(**values)
        # Clean critical string values
        self.groq_api_key = str(self.groq_api_key).strip() if hasattr(self, 'groq_api_key') and self.groq_api_key else ""
        self.groq_model = str(self.groq_model).strip() if hasattr(self, 'groq_model') and self.groq_model else "llama-3.3-70b-versatile"
        self.ollama_url = str(self.ollama_url).strip().rstrip('/') if hasattr(self, 'ollama_url') and self.ollama_url else "http://localhost:11434"
        self.ai_provider = str(self.ai_provider).strip().lower() if hasattr(self, 'ai_provider') and self.ai_provider else "ollama"

    
    # Security
    api_key: str = Field(default="", env="API_KEY")
    allowed_origins: str = Field(default="http://localhost:3000,http://localhost:5173", env="ALLOWED_ORIGINS")
    
    # Model Parameters
    max_tokens: int = Field(default=2048, env="MAX_TOKENS")
    temperature: float = Field(default=0.7, env="TEMPERATURE")
    top_p: float = Field(default=0.9, env="TOP_P")
    context_length: int = Field(default=4096, env="CONTEXT_LENGTH")
    
    @property
    def allowed_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.allowed_origins.split(",")]
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False
        extra = "ignore"  # Ignore extra environment variables from old config


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()


# Create directories if they don't exist
def ensure_directories():
    """Ensure all required directories exist"""
    settings = get_settings()
    directories = [
        settings.faiss_index_path,
        settings.knowledge_base_path,
        os.path.dirname(settings.log_file),
        "./models",
        "./data",
    ]
    for directory in directories:
        os.makedirs(directory, exist_ok=True)
