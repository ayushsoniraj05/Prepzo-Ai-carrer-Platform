from fastapi import APIRouter, Depends, HTTPException  # pyre-ignore
from pydantic import BaseModel, Field  # pyre-ignore
from typing import List, Dict, Any, Optional
from datetime import datetime
from loguru import logger  # pyre-ignore

from app.dependencies import get_model_service, get_embedding_service, get_vector_store  # pyre-ignore
from app.services.model_service import ModelService  # pyre-ignore
from app.services.question_generator import get_question_generator  # pyre-ignore

router = APIRouter()


# ──────────────────────────────────────────────────────────────────────────────
# Request / Response models
# ──────────────────────────────────────────────────────────────────────────────

class StudentProfile(BaseModel):
    id: str = Field(..., description="Unique student identifier")
    name: str
    degree: Optional[str] = None
    stream: Optional[str] = None
    fieldOfStudy: Optional[str] = None
    year: Optional[str] = None
    targetRole: str = "Software Engineer"
    knownTechnologies: List[str] = []
    careerGoals: Optional[str] = None


class TestConfig(BaseModel):
    sections: Optional[List[str]] = None
    questionsPerSection: int = Field(20, ge=3, le=25)
    totalTime: Optional[int] = None          # seconds
    timePerSection: Optional[int] = None     # seconds
    company: Optional[str] = None
    difficulty: Optional[str] = None
    includeCoding: bool = True
    adaptive: bool = True
    enableProctoring: bool = True
    targetRole: Optional[str] = None
    testMode: Optional[str] = None
    fieldOfStudy: Optional[str] = None
    degree: Optional[str] = None


class GenerateTestRequest(BaseModel):
    studentProfile: StudentProfile
    testConfig: Optional[TestConfig] = None


class GenerateSkillTestRequest(BaseModel):
    studentProfile: StudentProfile
    skills: List[str]
    testConfig: Optional[TestConfig] = None


class AdaptDifficultyRequest(BaseModel):
    currentPerformance: Dict[str, Any]
    currentDifficulty: str


class NextQuestionRequest(BaseModel):
    studentProfile: StudentProfile
    section: str
    currentPerformance: Dict[str, Any]
    questionsAnswered: List[str] = []


class EvaluateCodeRequest(BaseModel):
    code: str
    language: str
    testCases: List[Dict[str, str]]
    hiddenTestCases: Optional[List[Dict[str, str]]] = None
    timeLimit: Optional[float] = 5.0
    memoryLimit: Optional[int] = None
    expectedComplexity: Optional[Dict[str, str]] = None


# ──────────────────────────────────────────────────────────────────────────────
# Helpers
# ──────────────────────────────────────────────────────────────────────────────

def _inject_model(generator, model_service: ModelService):
    """Try to inject model_service from the app global into a generator."""
    if generator and model_service:
        generator.model_service = model_service
    return generator


# ──────────────────────────────────────────────────────────────────────────────
# Endpoints
# ──────────────────────────────────────────────────────────────────────────────

@router.post("/generate-test")
async def generate_ai_test(
    request: GenerateTestRequest,
    model_service: ModelService = Depends(get_model_service)
):
    """
    Generate a 100% unique AI-powered test.
    Every student, every attempt → completely different questions.
    """
    try:
        generator = _inject_model(get_question_generator(), model_service)

        profile = request.studentProfile.dict()
        test_config = request.testConfig
        
        cfg = test_config.dict() if test_config is not None else {}

        if test_config is not None and test_config.targetRole is not None:
            profile["targetRole"] = test_config.targetRole

        test = await generator.generate_test(student_profile=profile, test_config=cfg)

        logger.info(
            f"Generated test {test['testId']} | "
            f"{test['totalQuestions']} questions | student={request.studentProfile.name}"
        )

        return {
            "success": True,
            "test": test,
            "message": (
                f"Generated {test['totalQuestions']} unique AI questions "
                f"across {len(test['sections'])} sections"
            ),
        }

    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc))
    except Exception as exc:
        logger.error(f"Test generation error: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/generate-company-test")
async def generate_company_test(
    request: GenerateTestRequest,
    model_service: ModelService = Depends(get_model_service)
):
    """
    Generate a company-pattern test (Amazon, Google, TCS, Infosys, etc.).
    Questions follow the focus areas and style of the target company.
    """
    try:
        test_config = request.testConfig
        if test_config is None:
            raise HTTPException(status_code=400, detail="testConfig is required")
        
        company_val = test_config.company
        if company_val is None:
            raise HTTPException(status_code=400, detail="testConfig.company is required")

        generator = _inject_model(get_question_generator(), model_service)
        profile = request.studentProfile.dict()
        cfg = test_config.dict() if test_config is not None else {}

        test = await generator.generate_test(student_profile=profile, test_config=cfg)
        company = company_val.upper() if company_val is not None else ""

        logger.info(f"Generated {company} pattern test for {request.studentProfile.name}")

        return {
            "success": True,
            "test": test,
            "company": company,
            "message": f"Generated {company}-style test with {test['totalQuestions']} questions",
        }

    except HTTPException:
        raise
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc))
    except Exception as exc:
        logger.error(f"Company test error: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/generate-field-test")
async def generate_field_test(
    request: GenerateTestRequest,
    model_service: ModelService = Depends(get_model_service)
):
    """Generate Stage 1: Field-based Assessment (60 questions)."""
    try:
        generator = _inject_model(get_question_generator(), model_service)
        profile = request.studentProfile.dict()
        cfg = request.testConfig.dict() if request.testConfig else {}

        test = await generator.generate_field_assessment(student_profile=profile, test_config=cfg)

        return {
            "success": True,
            "test": test,
            "message": f"Generated Stage 1 assessment with {test['totalQuestions']} questions"
        }
    except Exception as exc:
        logger.error(f"Field assessment error: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/generate-skill-test")
async def generate_skill_test(
    request: GenerateSkillTestRequest,
    model_service: ModelService = Depends(get_model_service)
):
    """Generate Stage 2: Skill-based Assessment (10 questions per skill)."""
    try:
        generator = _inject_model(get_question_generator(), model_service)
        profile = request.studentProfile.dict()
        cfg = request.testConfig.dict() if request.testConfig else {}

        test = await generator.generate_skill_assessment(
            student_profile=profile, 
            skills=request.skills, 
            test_config=cfg
        )

        return {
            "success": True,
            "test": test,
            "message": f"Generated Stage 2 assessment with {test['totalQuestions']} questions"
        }
    except Exception as exc:
        logger.error(f"Skill assessment error: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/adapt-difficulty")
async def adapt_difficulty(request: AdaptDifficultyRequest):
    """Recalculate recommended difficulty based on live performance."""
    try:
        from app.services.question_generator import get_question_generator  # pyre-ignore

        generator = get_question_generator()
        new_diff = await generator.adjust_difficulty(request.currentPerformance, request.currentDifficulty)

        return {
            "success": True,
            "previousDifficulty": request.currentDifficulty,
            "newDifficulty": new_diff,
        }
    except Exception as exc:
        logger.error(f"Difficulty adaptation error: {exc}")
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/next-question")
async def get_next_adaptive_question(
    request: NextQuestionRequest,
    model_service: ModelService = Depends(get_model_service)
):
    """Generate the next question adaptively during an active test session."""
    try:
        generator = _inject_model(get_question_generator(), model_service)
        question = await generator.get_next_question(
            student_profile=request.studentProfile.dict(),
            section=request.section,
            performance=request.currentPerformance,
            answered_ids=request.questionsAnswered,
        )

        return {
            "success": True,
            "question": question,
            "difficulty": question.get("difficulty", "medium"),
            "questionNumber": len(request.questionsAnswered) + 1,
        }
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc))
    except Exception as exc:
        logger.error(f"Adaptive question error: {exc}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/evaluate-code")
async def evaluate_code(request: EvaluateCodeRequest):
    """Evaluate code submission with LeetCode-style judge."""
    try:
        from app.services.coding_judge import get_coding_judge  # pyre-ignore
        judge = get_coding_judge()
        result = await judge.evaluate(
            code=request.code,
            language=request.language,
            test_cases=request.testCases,
            hidden_test_cases=request.hiddenTestCases,
            time_limit=request.timeLimit,
            memory_limit=request.memoryLimit,
            expected_complexity=request.expectedComplexity,
        )

        return {"success": True, "result": judge.to_dict(result)}
    except Exception as exc:
        logger.error(f"Code evaluation error: {exc}")
        raise HTTPException(status_code=500, detail=str(exc))


@router.get("/supported-companies")
async def get_supported_companies():
    """List companies supported for pattern-based test generation."""
    generator = get_question_generator()
    companies = []
    for name, pattern in generator.COMPANY_PATTERNS.items():
        companies.append({
            "name": name.upper(),
            "sections": pattern["sections"],
            "focus": pattern["focus"],
            "style": pattern["style"],
            "difficultyDistribution": pattern["dist"],
        })

    return {"success": True, "companies": companies}


@router.get("/sections/{stream}")
async def get_sections_for_stream(stream: str):
    """List all sections and topics available for a given academic stream."""
    generator = get_question_generator()
    s = stream.lower().replace(" ", "_")
    if s not in generator.STREAM_SECTIONS:
        s = "computer_science"

    sections = generator.STREAM_SECTIONS.get(s, {})
    return {
        "success": True,
        "stream": stream,
        "sections": [{"name": k, "topics": v} for k, v in sections.items()],
    }
