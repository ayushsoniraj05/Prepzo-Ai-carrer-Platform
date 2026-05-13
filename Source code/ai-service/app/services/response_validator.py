"""
Prepzo AI Service - Response Validation
Validates AI responses before sending to Node.js backend
"""

from loguru import logger
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field, validator
from enum import Enum
import re


class RecommendationLevel(str, Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"


class SkillGapSchema(BaseModel):
    """Schema for skill gap validation"""
    skill: str = Field(..., min_length=2)
    currentLevel: Optional[str] = None
    requiredLevel: Optional[str] = None
    impactOnInterviews: Optional[str] = None
    priority: int = Field(default=1, ge=1, le=10)
    reasoning: Optional[str] = Field(default=None, min_length=10)


class CourseRecommendation(BaseModel):
    """Schema for course recommendation"""
    title: str = Field(..., min_length=3)
    platform: str = Field(..., min_length=2)
    url: Optional[str] = None
    level: Optional[str] = None
    duration: Optional[str] = None
    skillsTargeted: List[str] = Field(default_factory=list)
    whyThisCourse: Optional[str] = Field(default=None, min_length=15)
    priority: int = Field(default=1, ge=1, le=10)
    
    @validator('url')
    def validate_url(cls, v):
        if v and not v.startswith(('http://', 'https://')):
            logger.warning(f"Invalid URL format: {v}")
            return None
        return v


class ProjectRecommendation(BaseModel):
    """Schema for project recommendation"""
    title: str = Field(..., min_length=3)
    description: Optional[str] = None
    techStack: List[str] = Field(default_factory=list)
    difficulty: Optional[RecommendationLevel] = None
    skillsGained: List[str] = Field(default_factory=list)
    priority: int = Field(default=1, ge=1, le=10)


class ImprovementPrediction(BaseModel):
    """Schema for improvement prediction"""
    currentScore: Optional[float] = None
    predictedScoreAfter: Optional[float] = None
    timeToAchieve: Optional[str] = None
    confidenceLevel: Optional[str] = None


class ValidatedRecommendationResponse(BaseModel):
    """Full validated response schema"""
    strengths: List[str] = Field(default_factory=list, min_items=1)
    weaknesses: List[str] = Field(default_factory=list, min_items=1)
    prioritySkillGaps: List[SkillGapSchema] = Field(default_factory=list, min_items=1)
    recommendations: Dict[str, List[Any]]
    improvementPrediction: ImprovementPrediction
    summary: str = Field(..., min_length=50)
    confidenceScore: float = Field(default=0.8, ge=0.0, le=1.0)


# =============================================================================
# ROLE SKILL MATRIX
# =============================================================================

ROLE_SKILL_MATRIX = {
    'Backend Developer': {
        'required': ['DBMS', 'API', 'SQL', 'Server', 'REST', 'Node.js', 'Python', 'Java', 'System Design'],
        'forbidden': ['UI/UX Design', 'Graphic Design', 'Android Development', 'iOS Development'],
    },
    'Frontend Developer': {
        'required': ['JavaScript', 'HTML', 'CSS', 'React', 'Vue', 'Angular', 'TypeScript'],
        'forbidden': ['Machine Learning', 'Data Science', 'Android Development', 'iOS Development'],
    },
    'Data Scientist': {
        'required': ['Python', 'Machine Learning', 'Statistics', 'SQL', 'Data Analysis'],
        'forbidden': ['iOS Development', 'Android Development', 'UI/UX Design'],
    },
    'Software Engineer': {
        'required': ['DSA', 'System Design', 'OOPS', 'Problem Solving'],
        'forbidden': ['Graphic Design', 'UI/UX Design'],
    },
}


# =============================================================================
# GENERIC PHRASE DETECTION
# =============================================================================

GENERIC_PHRASES = [
    'learn programming fundamentals',
    'practice coding',
    'improve your skills',
    'study more',
    'work harder',
    'practice more',
    'keep learning',
    'learn the basics',
]


def contains_generic_phrases(text: str) -> List[str]:
    """Check if text contains generic phrases"""
    text_lower = text.lower()
    found = []
    for phrase in GENERIC_PHRASES:
        if phrase in text_lower:
            found.append(phrase)
    return found


# =============================================================================
# VALIDATION FUNCTIONS
# =============================================================================

class ValidationResult:
    """Validation result container"""
    def __init__(self):
        self.is_valid = True
        self.errors: List[Dict] = []
        self.warnings: List[Dict] = []
        self.confidence_score = 0.8
    
    def add_error(self, code: str, message: str, field: str = None):
        self.is_valid = False
        self.errors.append({
            "code": code,
            "message": message,
            "field": field
        })
    
    def add_warning(self, code: str, message: str, field: str = None):
        self.warnings.append({
            "code": code,
            "message": message,
            "field": field
        })


def validate_structure(response: Dict[str, Any]) -> ValidationResult:
    """Validate response structure"""
    result = ValidationResult()
    
    # Check required top-level fields
    required_fields = ['recommendations', 'confidenceScore']
    for field in required_fields:
        if field not in response:
            result.add_error("MISSING_FIELD", f"Required field '{field}' is missing", field)
    
    # Check for strengths
    strengths = response.get('strengths') or response.get('analysis', {}).get('strong_areas', [])
    if not strengths or len(strengths) == 0:
        result.add_warning("MISSING_STRENGTHS", "Response should include identified strengths", "strengths")
    
    # Check for weaknesses
    weaknesses = response.get('weaknesses') or response.get('analysis', {}).get('weak_areas', [])
    if not weaknesses or len(weaknesses) == 0:
        result.add_error("MISSING_WEAKNESSES", "Response must include identified weaknesses", "weaknesses")
    
    # Check recommendations structure
    if 'recommendations' in response:
        rec = response['recommendations']
        if not rec.get('courses') or len(rec.get('courses', [])) == 0:
            result.add_error("NO_COURSES", "At least one course recommendation is required", "recommendations.courses")
        if not rec.get('projects') or len(rec.get('projects', [])) == 0:
            result.add_warning("NO_PROJECTS", "Project recommendations are recommended", "recommendations.projects")
    
    # Check for priority skill gaps
    skill_gaps = response.get('prioritySkillGaps') or response.get('analysis', {}).get('skill_gaps', [])
    if not skill_gaps or len(skill_gaps) == 0:
        result.add_error("NO_SKILL_GAPS", "Priority skill gaps must be identified", "prioritySkillGaps")
    
    return result


def validate_role_consistency(response: Dict[str, Any], target_role: str) -> ValidationResult:
    """Validate recommendations align with target role"""
    result = ValidationResult()
    
    if not target_role:
        return result
    
    # Normalize role name
    role_key = None
    for key in ROLE_SKILL_MATRIX:
        if key.lower() in target_role.lower() or target_role.lower() in key.lower():
            role_key = key
            break
    
    if not role_key:
        role_key = 'Software Engineer'  # Default
    
    role_config = ROLE_SKILL_MATRIX.get(role_key, {})
    forbidden = role_config.get('forbidden', [])
    
    # Check courses
    recommendations_str = str(response.get('recommendations', {})).lower()
    skill_gaps_str = str(response.get('prioritySkillGaps', [])).lower()
    
    for forbidden_item in forbidden:
        if forbidden_item.lower() in recommendations_str or forbidden_item.lower() in skill_gaps_str:
            result.add_error(
                "ROLE_MISMATCH",
                f"Recommendation includes '{forbidden_item}' which is not relevant for {target_role}",
                "recommendations"
            )
    
    return result


def validate_skill_gap_alignment(response: Dict[str, Any], assessment_results: Dict[str, Any]) -> ValidationResult:
    """Validate that weak skills from assessment are addressed"""
    result = ValidationResult()
    
    if not assessment_results:
        return result
    
    sections = assessment_results.get('sections') or assessment_results.get('sectionResults', [])
    
    # Find weak sections (score < 50%)
    weak_sections = []
    for section in sections:
        score = section.get('score', 100)
        name = section.get('section') or section.get('name', '')
        if score < 50 and name:
            weak_sections.append({"name": name, "score": score})
    
    if not weak_sections:
        return result
    
    # Check if weak sections are mentioned
    weaknesses = response.get('weaknesses', [])
    skill_gaps = response.get('prioritySkillGaps', [])
    recommendations_text = str(response.get('recommendations', {})).lower()
    
    weaknesses_text = ' '.join(str(w) for w in weaknesses).lower()
    skill_gaps_text = ' '.join(str(sg.get('skill', '')) for sg in skill_gaps).lower()
    
    for weak in weak_sections:
        name_lower = weak['name'].lower()
        # Check if addressed anywhere
        is_addressed = (
            name_lower in weaknesses_text or
            name_lower in skill_gaps_text or
            name_lower in recommendations_text
        )
        
        if not is_addressed and weak['score'] < 40:  # Critical weakness
            result.add_error(
                "SKILL_GAP_IGNORED",
                f"Critical weak section '{weak['name']}' (score: {weak['score']}%) is not addressed",
                "prioritySkillGaps"
            )
        elif not is_addressed:
            result.add_warning(
                "PARTIAL_SKILL_COVERAGE",
                f"Weak section '{weak['name']}' is not fully addressed",
                "recommendations"
            )
    
    return result


def validate_confidence_score(response: Dict[str, Any]) -> ValidationResult:
    """Validate confidence score"""
    result = ValidationResult()
    
    confidence = response.get('confidenceScore')
    
    if confidence is None:
        result.add_warning("MISSING_CONFIDENCE", "Response should include confidence score", "confidenceScore")
        return result
    
    if not isinstance(confidence, (int, float)) or confidence < 0 or confidence > 1:
        result.add_error("INVALID_CONFIDENCE", "Confidence score must be between 0 and 1", "confidenceScore")
        return result
    
    if confidence < 0.75:
        result.add_error("LOW_CONFIDENCE", f"Confidence score {confidence} is below threshold 0.75", "confidenceScore")
    
    result.confidence_score = confidence
    return result


def validate_explanations(response: Dict[str, Any]) -> ValidationResult:
    """Validate that explanations are present"""
    result = ValidationResult()
    
    # Check summary
    summary = response.get('summary') or response.get('reasoning', '')
    if not summary or len(str(summary)) < 50:
        result.add_warning("MISSING_SUMMARY", "Response should include a detailed summary", "summary")
    
    # Check course explanations
    courses = response.get('recommendations', {}).get('courses', [])
    for i, course in enumerate(courses):
        why = course.get('whyThisCourse', '')
        if not why or len(why) < 15:
            result.add_warning(
                "MISSING_EXPLANATION",
                f"Course '{course.get('title', i)}' lacks explanation",
                f"recommendations.courses[{i}].whyThisCourse"
            )
    
    return result


def detect_generic_content(response: Dict[str, Any]) -> ValidationResult:
    """Detect generic/low-quality content"""
    result = ValidationResult()
    
    response_text = str(response).lower()
    generic_found = contains_generic_phrases(response_text)
    
    if generic_found:
        result.add_warning(
            "GENERIC_CONTENT",
            f"Generic phrases detected: {', '.join(generic_found[:3])}",
            "content"
        )
    
    return result


def validate_response(
    response: Dict[str, Any],
    target_role: str = None,
    assessment_results: Dict[str, Any] = None
) -> Dict[str, Any]:
    """
    Run all validations and return comprehensive result
    """
    all_results = []
    
    # 1. Structure validation
    all_results.append(validate_structure(response))
    
    # 2. Confidence score
    all_results.append(validate_confidence_score(response))
    
    # 3. Role consistency
    if target_role:
        all_results.append(validate_role_consistency(response, target_role))
    
    # 4. Skill gap alignment
    if assessment_results:
        all_results.append(validate_skill_gap_alignment(response, assessment_results))
    
    # 5. Explanations
    all_results.append(validate_explanations(response))
    
    # 6. Generic content
    all_results.append(detect_generic_content(response))
    
    # Combine results
    is_valid = all(r.is_valid for r in all_results)
    all_errors = []
    all_warnings = []
    
    for r in all_results:
        all_errors.extend(r.errors)
        all_warnings.extend(r.warnings)
    
    # Get confidence score
    confidence = next((r.confidence_score for r in all_results if hasattr(r, 'confidence_score')), 0.8)
    
    return {
        "isValid": is_valid,
        "errors": all_errors,
        "warnings": all_warnings,
        "errorCount": len(all_errors),
        "warningCount": len(all_warnings),
        "confidenceScore": confidence,
        "validatedAt": str(__import__('datetime').datetime.utcnow().isoformat())
    }


# Helper to ensure response meets minimum requirements
def ensure_minimum_response(response: Dict[str, Any]) -> Dict[str, Any]:
    """Ensure response has minimum required fields"""
    
    # Ensure strengths exist
    if not response.get('strengths'):
        response['strengths'] = response.get('analysis', {}).get('strong_areas', ['To be determined'])
    
    # Ensure weaknesses exist
    if not response.get('weaknesses'):
        response['weaknesses'] = response.get('analysis', {}).get('weak_areas', ['To be analyzed'])
    
    # Ensure prioritySkillGaps exist
    if not response.get('prioritySkillGaps'):
        skill_gaps = response.get('analysis', {}).get('skill_gaps', [])
        response['prioritySkillGaps'] = [
            {
                "skill": sg.get('skill', 'Unknown'),
                "currentLevel": sg.get('current_level', 'beginner'),
                "requiredLevel": sg.get('required_level', 'intermediate'),
                "priority": i + 1,
                "reasoning": sg.get('reason', 'Based on assessment results')
            }
            for i, sg in enumerate(skill_gaps[:5])
        ]
    
    # Ensure summary exists
    if not response.get('summary'):
        response['summary'] = response.get('reasoning', 'Personalized recommendations based on your assessment and profile.')
    
    # Ensure confidenceScore exists
    if 'confidenceScore' not in response:
        response['confidenceScore'] = 0.8
    
    # Ensure improvementPrediction exists
    if not response.get('improvementPrediction'):
        response['improvementPrediction'] = {
            "currentScore": response.get('analysis', {}).get('current_score', 0),
            "predictedScoreAfter": min(100, response.get('analysis', {}).get('current_score', 0) + 20),
            "timeToAchieve": "4-8 weeks",
        }
    
    return response
