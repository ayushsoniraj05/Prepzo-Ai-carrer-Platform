# Prepzo AI Service

A self-hosted AI engine for intelligent career guidance and placement preparation. This service uses **Mistral 7B** for natural language understanding and **FAISS** for semantic similarity search.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      Prepzo AI Service                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐           │
│  │   FastAPI   │   │  Mistral 7B │   │   MongoDB   │           │
│  │   Server    │   │    (LLM)    │   │  (Storage)  │           │
│  └─────────────┘   └─────────────┘   └─────────────┘           │
│         │                 │                 │                   │
│  ┌──────┴─────────────────┴─────────────────┴──────┐           │
│  │                                                  │           │
│  │  ┌─────────────┐   ┌─────────────┐             │           │
│  │  │  Sentence   │   │    FAISS    │             │           │
│  │  │ Transformers│──▶│Vector Store │             │           │
│  │  │ (Embeddings)│   │ (Similarity)│             │           │
│  │  └─────────────┘   └─────────────┘             │           │
│  │                                                  │           │
│  └──────────────────────────────────────────────────┘           │
│                                                                 │
│  Services:                                                      │
│  • Skill Assessment (AI-powered evaluation)                    │
│  • Recommendation Engine (Dynamic, no hardcoding!)             │
│  • AI Mentor (Career guidance chatbot)                         │
│  • Knowledge Base (Skills, courses, certifications)            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Key Features

### 🎯 No Hardcoded Recommendations
Every recommendation is generated dynamically using:
- Vector similarity for skill matching
- AI-powered analysis of student profiles
- Real-time industry trend consideration

### 🧠 Intelligent Skill Assessment
- MCQ evaluation with difficulty weighting
- Text answer evaluation using semantic similarity + AI
- Code evaluation with complexity analysis

### 📚 Knowledge Base
- Skills with embeddings for semantic search
- Courses from multiple platforms
- YouTube playlists with hour estimates
- Industry certifications
- Interview questions

### 💬 AI Mentor
- Context-aware conversations
- Interview practice mode
- Concept explanations
- Career guidance

## Quick Start

### 1. Install Python Dependencies

```bash
cd ai-service
pip install -r requirements.txt
```

### 2. Download Mistral 7B Model

```bash
python scripts/download_model.py
```

This downloads the quantized GGUF model (~4.4GB for Q4_K_M).

### 3. Configure Environment

```bash
cp .env.example .env
# Edit .env with your settings
```

Key settings:
- `MODEL_PATH`: Path to downloaded GGUF model
- `MONGODB_URI`: MongoDB connection string
- `API_KEY`: Secret key for API authentication

### 4. Start the Service

```bash
# Development
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Production
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### 5. Seed Knowledge Base

```bash
python scripts/seed_knowledge_base.py
```

This populates the AI with initial skills, courses, and questions.

## API Endpoints

### Health Check
- `GET /health` - Service status
- `GET /ready` - Model readiness check

### Assessment
- `POST /api/assessment/evaluate/mcq` - Evaluate MCQ answers
- `POST /api/assessment/evaluate/text` - Evaluate text answers
- `POST /api/assessment/evaluate/code` - Evaluate code answers
- `POST /api/assessment/overall` - Overall assessment

### Recommendations
- `POST /api/recommendations/generate` - Generate personalized recommendations
- `POST /api/recommendations/skill-gaps` - Analyze skill gaps
- `GET /api/recommendations/resources/search` - Search learning resources

### AI Mentor
- `POST /api/mentor/chat` - Chat with AI mentor
- `GET /api/mentor/sessions/{user_id}` - Get user's sessions
- `POST /api/mentor/interview/start` - Start mock interview
- `POST /api/mentor/explain` - Explain a concept

### Knowledge Base
- `POST /api/knowledge/skills` - Add skill
- `POST /api/knowledge/courses` - Add course
- `POST /api/knowledge/youtube` - Add YouTube resource
- `POST /api/knowledge/bulk-import` - Bulk import
- `POST /api/knowledge/search` - Semantic search
- `GET /api/knowledge/stats` - Knowledge base statistics

### Embeddings
- `POST /api/embeddings/embed` - Generate text embedding
- `POST /api/embeddings/similarity` - Compute similarity

## Integration with Node.js Backend

The `backend/src/services/aiService.js` provides a client for calling this service:

```javascript
const aiService = require('./services/aiService.js');

// Check availability
const isAvailable = await aiService.isServiceAvailable();

// Generate recommendations
const recommendations = await aiService.generateRecommendations({
  userId: 'user123',
  currentSkills: ['Python', 'JavaScript'],
  skillLevels: { 'Python': 'intermediate' },
  targetRole: 'Software Engineer',
  targetCompanies: ['Google', 'Microsoft']
});

// Chat with mentor
const response = await aiService.chatWithMentor(
  'user123',
  'session123',
  'How do I prepare for system design interviews?'
);
```

## GPU Acceleration

The service is configured for GPU acceleration by default. If you have a CUDA-capable GPU:

```env
MODEL_GPU_LAYERS=35  # Number of layers to offload to GPU
```

For CPU-only:
```env
MODEL_GPU_LAYERS=0
```

## Memory Requirements

| Model Variant | VRAM Required | RAM Required |
|---------------|---------------|--------------|
| Q2_K (3.1GB)  | ~4GB          | ~6GB         |
| Q4_K_M (4.4GB)| ~6GB          | ~8GB         |
| Q5_K_M (5.1GB)| ~7GB          | ~10GB        |
| Q8_0 (7.7GB)  | ~10GB         | ~12GB        |

## Self-Learning System

The service improves over time by tracking:

1. **Resource Effectiveness**: Track which resources lead to actual improvement
2. **Recommendation Quality**: Monitor completion rates and user feedback
3. **Industry Trends**: Update skill demand based on market data

```python
# Record effectiveness feedback
await aiService.recordEffectiveness({
    userId: 'user123',
    recommendationId: 'rec123',
    resourceId: 'course123',
    completed: True,
    timeSpentHours: 20,
    skillImprovement: 15,
    userRating: 4.5
});
```

## Project Structure

```
ai-service/
├── app/
│   ├── config.py           # Configuration
│   ├── main.py             # FastAPI app
│   ├── database.py         # MongoDB connection
│   ├── routers/
│   │   ├── health.py       # Health endpoints
│   │   ├── assessment.py   # Assessment endpoints
│   │   ├── recommendations.py
│   │   ├── mentor.py       # AI mentor
│   │   ├── embeddings.py   # Embedding endpoints
│   │   └── knowledge_base.py
│   └── services/
│       ├── model_service.py      # Mistral 7B
│       ├── embedding_service.py  # Sentence Transformers
│       ├── vector_store.py       # FAISS
│       ├── skill_assessment.py   # Assessment logic
│       ├── recommendation_engine.py
│       └── mentor_engine.py      # AI mentor
├── scripts/
│   ├── download_model.py   # Download Mistral
│   └── seed_knowledge_base.py
├── models/                  # Downloaded models
├── faiss_indexes/          # Persisted FAISS indexes
├── logs/                   # Application logs
├── requirements.txt
├── .env.example
└── README.md
```

## License

Part of Prepzo AI Career Platform.
