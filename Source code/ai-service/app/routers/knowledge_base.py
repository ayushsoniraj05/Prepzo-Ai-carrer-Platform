"""
Knowledge Base Router
Manage AI knowledge base - skills, courses, questions, etc.
"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime
import json
import logging
from app.dependencies import get_database, get_embedding_service, get_vector_store
from app.services.vector_store import VectorStore

logger = logging.getLogger(__name__)

router = APIRouter()


# Request/Response Models
class AddSkillRequest(BaseModel):
    name: str = Field(..., description="Skill name")
    category: str = Field(..., description="Skill category")
    industry: str = Field(default="tech", description="Industry")
    description: Optional[str] = Field(default=None)
    related_skills: List[str] = Field(default=[])

    class Config:
        extra = "ignore"


class AddCourseRequest(BaseModel):
    title: str = Field(..., description="Course title")
    platform: str = Field(..., description="Platform (Coursera, Udemy, etc.)")
    url: str = Field(..., description="Course URL")
    skills: List[str] = Field(..., description="Skills taught")
    level: str = Field(default="beginner")
    duration: Optional[str] = Field(default=None)
    instructor: Optional[str] = Field(default=None)
    thumbnail: Optional[str] = Field(default=None)
    platform_logo: Optional[str] = Field(default=None)
    description: Optional[str] = Field(default=None)

    class Config:
        extra = "ignore"


class AddYouTubeRequest(BaseModel):
    title: str = Field(..., description="Playlist/video title")
    channel: str = Field(..., description="Channel name")
    url: str = Field(..., description="YouTube URL")
    skills: List[str] = Field(..., description="Skills covered")
    video_count: int = Field(default=1)
    duration_hours: float = Field(default=1.0)
    thumbnail: Optional[str] = Field(default=None)
    channel_logo: Optional[str] = Field(default=None)
    description: Optional[str] = Field(default=None)

    class Config:
        extra = "ignore"


class AddCertificationRequest(BaseModel):
    name: str = Field(..., description="Certification name")
    provider: str = Field(..., description="Provider (AWS, Google, etc.)")
    url: str = Field(..., description="Certification URL")
    skills: List[str] = Field(..., description="Skills validated")
    cost: Optional[str] = Field(default="Varies")
    duration: Optional[str] = Field(default=None)
    thumbnail: Optional[str] = Field(default=None)
    authority_logo: Optional[str] = Field(default=None)
    industry_value: str = Field(default="High")

    class Config:
        extra = "ignore"


class AddQuestionRequest(BaseModel):
    question: str = Field(..., description="Question text")
    answer: str = Field(..., description="Answer")
    skill: str = Field(..., description="Related skill")
    difficulty: str = Field(default="medium")
    company: Optional[str] = Field(default=None)
    role: Optional[str] = Field(default=None)
    question_type: str = Field(default="conceptual")

    class Config:
        extra = "ignore"


class AddRoleRequest(BaseModel):
    title: str = Field(..., description="Role title")
    description: str = Field(..., description="Role description")
    required_skills: List[str] = Field(..., description="Required skills")
    preferred_skills: List[str] = Field(default=[])
    experience_level: str = Field(default="entry")
    industry: str = Field(default="tech")

    class Config:
        extra = "ignore"


class BulkImportRequest(BaseModel):
    entity_type: str = Field(..., description="Type: skills, courses, youtube, certifications, questions, roles, study_notes, interview_prep, practice_problems")
    data: List[Dict[str, Any]] = Field(..., description="List of entities to import")


class AddStudyNotesRequest(BaseModel):
    title: str = Field(..., description="Title of the study notes/cheat sheet")
    type: str = Field(default="study_notes", description="Type: study_notes, cheat_sheet")
    category: str = Field(..., description="Category (e.g., DSA, Database, OOP)")
    skills: List[str] = Field(..., description="Skills covered")
    content_summary: Optional[str] = Field(default=None)
    url: str = Field(..., description="URL to the resource")
    format: str = Field(default="Web")
    difficulty_level: str = Field(default="Intermediate")
    difficulty: Optional[str] = Field(default=None)
    topics: List[str] = Field(default=[])
    time_to_review: Optional[str] = Field(default="2-3 hours")
    best_for: Optional[str] = Field(default="Quick revision")
    description: Optional[str] = Field(default=None)

    class Config:
        extra = "ignore"


class AddInterviewPrepRequest(BaseModel):
    title: str = Field(..., description="Title of the prep material")
    type: str = Field(default="interview_guide", description="Type: interview_guide, problem_list, company_guide")
    category: str = Field(..., description="Category")
    skills: List[str] = Field(..., description="Skills covered")
    description: Optional[str] = Field(default=None)
    url: str = Field(..., description="URL to the resource")
    topics: List[Dict[str, Any]] = Field(default=[])
    time_to_complete: Optional[str] = Field(default="1-2 weeks")
    duration: Optional[str] = Field(default=None)
    best_for: Optional[str] = Field(default="Interview preparation")

    class Config:
        extra = "ignore"


class AddPracticeProblemRequest(BaseModel):
    title: str = Field(..., description="Title of the practice platform/resource")
    type: str = Field(default="coding_platform", description="Type: coding_platform, practice_platform, mock_assessment")
    category: str = Field(..., description="Category")
    skills: List[str] = Field(..., description="Skills targeted")
    description: Optional[str] = Field(default=None)
    url: str = Field(..., description="URL to the platform")
    features: List[str] = Field(default=[])
    difficulty: Optional[str] = Field(default=None)
    pricing: str = Field(default="Free")
    best_for: Optional[str] = Field(default="Practice")

    class Config:
        extra = "ignore"


@router.post("/skills")
async def add_skill(
    request: AddSkillRequest,
    database=Depends(get_database),
    embedding_service=Depends(get_embedding_service),
    vector_store=Depends(get_vector_store)
):
    """Add a skill to the knowledge base"""
    # Create embedding for the skill
    skill_text = f"{request.name}: {request.description or ''} in {request.category}"
    embedding = await embedding_service.embed_text(skill_text)
    
    # Store in MongoDB
    skill_doc = {
        "name": request.name,
        "category": request.category,
        "industry": request.industry,
        "description": request.description,
        "related_skills": request.related_skills,
        "created_at": datetime.utcnow()
    }
    
    result = await database.skill_vectors.insert_one(skill_doc)
    skill_id = str(result.inserted_id)
    
    # Add to vector store
    await vector_store.add_single(
        VectorStore.INDEX_SKILLS,
        skill_text,
        skill_id,
        {"name": request.name, "category": request.category}
    )
    
    return {
        "success": True,
        "skill_id": skill_id,
        "message": f"Skill '{request.name}' added to knowledge base"
    }


@router.post("/courses")
async def add_course(request: AddCourseRequest):
    """Add a course to the knowledge base"""
    from app.main import database, embedding_service, vector_store
    from app.services.vector_store import VectorStore
    
    # Create embedding
    course_text = f"{request.title}. Skills: {', '.join(request.skills)}. Level: {request.level}. {request.description or ''}"
    embedding = await embedding_service.embed_text(course_text)
    
    # Store in MongoDB
    course_doc = {
        "title": request.title,
        "platform": request.platform,
        "url": request.url,
        "skills": request.skills,
        "level": request.level,
        "duration": request.duration,
        "instructor": request.instructor,
        "thumbnail": request.thumbnail,
        "platform_logo": request.platform_logo,
        "description": request.description,
        "created_at": datetime.utcnow()
    }
    
    result = await database.courses.insert_one(course_doc)
    course_id = str(result.inserted_id)
    
    # Add to vector store
    await vector_store.add_single(
        VectorStore.INDEX_COURSES,
        course_text,
        course_id,
        {
            "title": request.title,
            "platform": request.platform,
            "url": request.url,
            "level": request.level,
            "duration": request.duration,
            "instructor": request.instructor,
            "thumbnail": request.thumbnail,
            "platform_logo": request.platform_logo
        }
    )
    
    return {
        "success": True,
        "course_id": course_id,
        "message": f"Course '{request.title}' added to knowledge base"
    }


@router.post("/youtube")
async def add_youtube(
    request: AddYouTubeRequest,
    database=Depends(get_database),
    embedding_service=Depends(get_embedding_service),
    vector_store=Depends(get_vector_store)
):
    """Add a YouTube resource to the knowledge base"""
    # Create embedding
    yt_text = f"{request.title} by {request.channel}. Skills: {', '.join(request.skills)}. {request.description or ''}"
    
    # Store in MongoDB
    yt_doc = {
        "title": request.title,
        "channel": request.channel,
        "url": request.url,
        "skills": request.skills,
        "video_count": request.video_count,
        "duration_hours": request.duration_hours,
        "thumbnail": request.thumbnail,
        "channel_logo": request.channel_logo,
        "description": request.description,
        "created_at": datetime.utcnow()
    }
    
    result = await database.youtube_resources.insert_one(yt_doc)
    yt_id = str(result.inserted_id)
    
    # Add to vector store
    await vector_store.add_single(
        VectorStore.INDEX_YOUTUBE,
        yt_text,
        yt_id,
        {
            "title": request.title,
            "channel": request.channel,
            "url": request.url,
            "video_count": request.video_count,
            "duration_hours": request.duration_hours,
            "thumbnail": request.thumbnail,
            "channel_logo": request.channel_logo
        }
    )
    
    return {
        "success": True,
        "youtube_id": yt_id,
        "message": f"YouTube resource '{request.title}' added"
    }


@router.post("/certifications")
async def add_certification(request: AddCertificationRequest):
    """Add a certification to the knowledge base"""
    from app.main import database, embedding_service, vector_store
    from app.services.vector_store import VectorStore
    
    # Create embedding
    cert_text = f"{request.name} by {request.provider}. Skills: {', '.join(request.skills)}. Industry value: {request.industry_value}"
    
    # Store in MongoDB
    cert_doc = {
        "name": request.name,
        "provider": request.provider,
        "url": request.url,
        "skills": request.skills,
        "cost": request.cost,
        "duration": request.duration,
        "thumbnail": request.thumbnail,
        "authority_logo": request.authority_logo,
        "industry_value": request.industry_value,
        "created_at": datetime.utcnow()
    }
    
    result = await database.certifications.insert_one(cert_doc)
    cert_id = str(result.inserted_id)
    
    # Add to vector store
    await vector_store.add_single(
        VectorStore.INDEX_CERTIFICATIONS,
        cert_text,
        cert_id,
        {
            "name": request.name,
            "provider": request.provider,
            "url": request.url,
            "cost": request.cost,
            "thumbnail": request.thumbnail,
            "authority_logo": request.authority_logo,
            "industry_value": request.industry_value
        }
    )
    
    return {
        "success": True,
        "certification_id": cert_id,
        "message": f"Certification '{request.name}' added"
    }


@router.post("/questions")
async def add_question(request: AddQuestionRequest):
    """Add an interview question to the knowledge base"""
    from app.main import database, embedding_service, vector_store
    from app.services.vector_store import VectorStore
    
    # Create embedding
    q_text = f"{request.question}. Skill: {request.skill}. Difficulty: {request.difficulty}"
    
    # Store in MongoDB
    q_doc = {
        "question": request.question,
        "answer": request.answer,
        "skill": request.skill,
        "difficulty": request.difficulty,
        "company": request.company,
        "role": request.role,
        "question_type": request.question_type,
        "created_at": datetime.utcnow()
    }
    
    result = await database.interview_questions.insert_one(q_doc)
    q_id = str(result.inserted_id)
    
    # Add to vector store
    await vector_store.add_single(
        VectorStore.INDEX_QUESTIONS,
        q_text,
        q_id,
        {
            "question": request.question[:100],
            "skill": request.skill,
            "difficulty": request.difficulty,
            "company": request.company
        }
    )
    
    return {
        "success": True,
        "question_id": q_id,
        "message": "Question added to knowledge base"
    }


@router.post("/roles")
async def add_role(
    request: AddRoleRequest,
    database=Depends(get_database),
    embedding_service=Depends(get_embedding_service),
    vector_store=Depends(get_vector_store)
):
    """Add a job role to the knowledge base"""
    # Create embedding
    role_text = f"{request.title}. {request.description}. Required skills: {', '.join(request.required_skills)}"
    
    # Store in MongoDB
    role_doc = {
        "title": request.title,
        "description": request.description,
        "required_skills": request.required_skills,
        "preferred_skills": request.preferred_skills,
        "experience_level": request.experience_level,
        "industry": request.industry,
        "created_at": datetime.utcnow()
    }
    
    result = await database.job_roles.insert_one(role_doc)
    role_id = str(result.inserted_id)
    
    # Add to vector store
    await vector_store.add_single(
        VectorStore.INDEX_ROLES,
        role_text,
        role_id,
        {
            "title": request.title,
            "experience_level": request.experience_level,
            "required_skills": request.required_skills
        }
    )
    
    return {
        "success": True,
        "role_id": role_id,
        "message": f"Role '{request.title}' added"
    }


@router.post("/study-notes")
async def add_study_notes(
    request: AddStudyNotesRequest,
    database=Depends(get_database),
    embedding_service=Depends(get_embedding_service),
    vector_store=Depends(get_vector_store)
):
    """Add study notes/cheat sheet to the knowledge base"""
    # Create embedding
    notes_text = f"{request.title}. {request.category}. Topics: {', '.join(request.topics[:5])}. Skills: {', '.join(request.skills)}"
    
    # Store in MongoDB
    notes_doc = {
        "title": request.title,
        "type": request.type,
        "category": request.category,
        "skills": request.skills,
        "content_summary": request.content_summary,
        "url": request.url,
        "format": request.format,
        "difficulty_level": request.difficulty_level,
        "topics": request.topics,
        "time_to_review": request.time_to_review,
        "best_for": request.best_for,
        "created_at": datetime.utcnow()
    }
    
    result = await database.study_notes.insert_one(notes_doc)
    notes_id = str(result.inserted_id)
    
    # Add to vector store
    await vector_store.add_single(
        VectorStore.INDEX_STUDY_NOTES,
        notes_text,
        notes_id,
        {
            "title": request.title,
            "type": request.type,
            "category": request.category,
            "url": request.url,
            "topics": request.topics,
            "time_to_review": request.time_to_review,
            "difficulty_level": request.difficulty_level,
            "best_for": request.best_for
        }
    )
    
    return {
        "success": True,
        "notes_id": notes_id,
        "message": f"Study notes '{request.title}' added"
    }


@router.post("/interview-prep")
async def add_interview_prep(
    request: AddInterviewPrepRequest,
    database=Depends(get_database),
    embedding_service=Depends(get_embedding_service),
    vector_store=Depends(get_vector_store)
):
    """Add interview preparation material to the knowledge base"""
    # Create embedding
    prep_text = f"{request.title}. {request.category}. {request.description or ''}. Skills: {', '.join(request.skills)}"
    
    # Store in MongoDB
    prep_doc = {
        "title": request.title,
        "type": request.type,
        "category": request.category,
        "skills": request.skills,
        "description": request.description,
        "url": request.url,
        "topics": request.topics,
        "time_to_complete": request.time_to_complete,
        "best_for": request.best_for,
        "created_at": datetime.utcnow()
    }
    
    result = await database.interview_prep.insert_one(prep_doc)
    prep_id = str(result.inserted_id)
    
    # Add to vector store
    await vector_store.add_single(
        VectorStore.INDEX_INTERVIEW_PREP,
        prep_text,
        prep_id,
        {
            "title": request.title,
            "type": request.type,
            "category": request.category,
            "url": request.url,
            "description": request.description,
            "topics": request.topics,
            "time_to_complete": request.time_to_complete
        }
    )
    
    return {
        "success": True,
        "prep_id": prep_id,
        "message": f"Interview prep '{request.title}' added"
    }


@router.post("/practice-problems")
async def add_practice_problems(request: AddPracticeProblemRequest):
    """Add practice problems platform to the knowledge base"""
    from app.main import database, embedding_service, vector_store
    from app.services.vector_store import VectorStore
    
    # Create embedding
    practice_text = f"{request.title}. {request.category}. {request.description or ''}. Skills: {', '.join(request.skills)}"
    
    # Store in MongoDB
    practice_doc = {
        "title": request.title,
        "type": request.type,
        "category": request.category,
        "skills": request.skills,
        "description": request.description,
        "url": request.url,
        "features": request.features,
        "pricing": request.pricing,
        "best_for": request.best_for,
        "created_at": datetime.utcnow()
    }
    
    result = await database.db.practice_problems.insert_one(practice_doc)
    practice_id = str(result.inserted_id)
    
    # Add to vector store
    await vector_store.add_single(
        VectorStore.INDEX_PRACTICE_PROBLEMS,
        practice_text,
        practice_id,
        {
            "title": request.title,
            "type": request.type,
            "category": request.category,
            "url": request.url,
            "description": request.description,
            "features": request.features,
            "pricing": request.pricing
        }
    )
    
    return {
        "success": True,
        "practice_id": practice_id,
        "message": f"Practice resource '{request.title}' added"
    }


class AddProjectRequest(BaseModel):
    title: str = Field(..., description="Project title")
    difficulty: str = Field(default="intermediate")
    tech_stack: List[str] = Field(..., description="Tech stack used")
    duration: str = Field(default="2 weeks")
    description: str = Field(..., description="Project description")
    thumbnail: Optional[str] = Field(default=None)
    skills: List[str] = Field(..., description="Skills gained")

    class Config:
        extra = "ignore"


@router.post("/projects")
async def add_project(
    request: AddProjectRequest,
    database=Depends(get_database),
    embedding_service=Depends(get_embedding_service),
    vector_store=Depends(get_vector_store)
):
    """Add a project to the knowledge base"""
    # Create embedding
    proj_text = f"{request.title}. Difficulty: {request.difficulty}. Tech: {', '.join(request.tech_stack)}. {request.description}"
    
    # Store in MongoDB
    proj_doc = {
        "title": request.title,
        "difficulty": request.difficulty,
        "tech_stack": request.tech_stack,
        "duration": request.duration,
        "description": request.description,
        "thumbnail": request.thumbnail,
        "skills": request.skills,
        "created_at": datetime.utcnow()
    }
    
    result = await database.projects.insert_one(proj_doc)
    proj_id = str(result.inserted_id)
    
    # Add to vector store
    await vector_store.add_single(
        VectorStore.INDEX_PROJECTS,
        proj_text,
        proj_id,
        {
            "title": request.title,
            "difficulty": request.difficulty,
            "tech_stack": request.tech_stack,
            "duration": request.duration,
            "thumbnail": request.thumbnail
        }
    )
    
    return {
        "success": True,
        "project_id": proj_id,
        "message": f"Project '{request.title}' added"
    }


@router.post("/bulk-import")
async def bulk_import(
    request: BulkImportRequest,
    database=Depends(get_database),
    embedding_service=Depends(get_embedding_service),
    vector_store=Depends(get_vector_store)
):
    """
    Bulk import data into knowledge base
    
    Supports: skills, courses, youtube, certifications, questions, roles
    """
    entity_type = request.entity_type.lower()
    imported = 0
    errors = []
    
    # Map entity types to handlers
    handlers = {
        "skills": (add_skill, AddSkillRequest),
        "courses": (add_course, AddCourseRequest),
        "youtube": (add_youtube, AddYouTubeRequest),
        "certifications": (add_certification, AddCertificationRequest),
        "questions": (add_question, AddQuestionRequest),
        "roles": (add_role, AddRoleRequest),
        "study_notes": (add_study_notes, AddStudyNotesRequest),
        "interview_prep": (add_interview_prep, AddInterviewPrepRequest),
        "practice_problems": (add_practice_problems, AddPracticeProblemRequest),
        "projects": (add_project, AddProjectRequest)
    }
    
    if entity_type not in handlers:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown entity type: {entity_type}. Supported: {', '.join(handlers.keys())}"
        )
    
    handler_func, request_model = handlers[entity_type]
    
    for i, item in enumerate(request.data):
        try:
            item_request = request_model(**item)
            # Invoke handler with dependencies manually
            await handler_func(item_request, database=database, embedding_service=embedding_service, vector_store=vector_store)
            imported += 1
        except Exception as e:
            errors.append({"index": i, "error": str(e)})
            logger.error(f"Bulk import error at index {i}: {e}")
    
    # Save vector indexes
    await vector_store.save_indexes()
    
    return {
        "success": True,
        "imported": imported,
        "total": len(request.data),
        "errors": errors
    }


@router.get("/stats")
async def get_knowledge_base_stats(
    database=Depends(get_database),
    vector_store=Depends(get_vector_store)
):
    """Get statistics about the knowledge base"""
    # Get counts from MongoDB
    stats = {
        "skills": await database.skill_vectors.count_documents({}),
        "courses": await database.courses.count_documents({}),
        "youtube": await database.youtube_resources.count_documents({}),
        "certifications": await database.certifications.count_documents({}),
        "questions": await database.interview_questions.count_documents({}),
        "roles": await database.job_roles.count_documents({}),
        "projects": await database.projects.count_documents({})
    }
    
    # Get vector store stats
    index_stats = await vector_store.get_index_stats()
    
    return {
        "success": True,
        "mongodb_counts": stats,
        "vector_store_stats": index_stats
    }


@router.post("/save-indexes")
async def save_indexes(vector_store=Depends(get_vector_store)):
    """Manually save all FAISS indexes to disk"""
    await vector_store.save_indexes()
    
    return {
        "success": True,
        "message": "All indexes saved to disk"
    }


@router.post("/search")
async def search_knowledge_base(
    query: str,
    entity_type: str = "all",
    top_k: int = 10
):
    """
    Search the knowledge base using semantic search
    """
    from app.main import vector_store
    from app.services.vector_store import VectorStore
    
    results = {}
    
    type_mapping = {
        "skills": VectorStore.INDEX_SKILLS,
        "courses": VectorStore.INDEX_COURSES,
        "youtube": VectorStore.INDEX_YOUTUBE,
        "certifications": VectorStore.INDEX_CERTIFICATIONS,
        "questions": VectorStore.INDEX_QUESTIONS,
        "roles": VectorStore.INDEX_ROLES
    }
    
    if entity_type == "all":
        for name, index_type in type_mapping.items():
            results[name] = await vector_store.search_by_text(
                index_type,
                query,
                top_k=top_k
            )
    else:
        if entity_type not in type_mapping:
            raise HTTPException(
                status_code=400,
                detail=f"Unknown entity type: {entity_type}"
            )
        results[entity_type] = await vector_store.search_by_text(
            type_mapping[entity_type],
            query,
            top_k=top_k
        )
    
    return {
        "success": True,
        "query": query,
        "results": results
    }
