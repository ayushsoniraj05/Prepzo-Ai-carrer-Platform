"""
Prepzo AI Service - Skill Assessment Engine
AI-powered evaluation of student skills using NLP and ML
"""

from loguru import logger
from typing import List, Dict, Any, Optional
import numpy as np
from datetime import datetime

from app.services.embedding_service import EmbeddingService
from app.services.model_service import ModelService


class SkillAssessmentEngine:
    """
    AI-driven skill assessment system
    
    Replaces hardcoded scoring with:
    - Difficulty-weighted MCQ scoring
    - Semantic similarity for text answers
    - Time complexity analysis for coding
    - Concept coverage detection
    """
    
    # Difficulty weights
    DIFFICULTY_WEIGHTS = {
        "easy": 1.0,
        "medium": 1.5,
        "hard": 2.0,
        "expert": 2.5
    }
    
    # Time penalty thresholds (seconds)
    TIME_THRESHOLDS = {
        "easy": 60,
        "medium": 120,
        "hard": 180,
        "expert": 240
    }
    
    def __init__(
        self,
        embedding_service: EmbeddingService,
        model_service: ModelService
    ):
        self.embedding_service = embedding_service
        self.model_service = model_service
    
    async def evaluate_mcq(
        self,
        question: Dict[str, Any],
        selected_answer: str,
        time_taken: float
    ) -> Dict[str, Any]:
        """
        Evaluate MCQ answer with difficulty weighting and time analysis
        
        Args:
            question: Question dict with correctAnswer, difficulty, skill
            selected_answer: Student's selected option
            time_taken: Time taken in seconds
            
        Returns:
            Evaluation result with score and analysis
        """
        difficulty = question.get('difficulty', 'medium').lower()
        correct_answer = question.get('correctAnswer')
        skill = question.get('skill', 'General')
        
        is_correct = selected_answer == correct_answer
        weight = self.DIFFICULTY_WEIGHTS.get(difficulty, 1.0)
        time_threshold = self.TIME_THRESHOLDS.get(difficulty, 120)
        
        # Base score
        if is_correct:
            base_score = 100 * weight
            
            # Time bonus/penalty
            if time_taken < time_threshold * 0.5:
                # Quick correct answer - bonus
                time_factor = 1.1
            elif time_taken > time_threshold * 1.5:
                # Too slow - slight penalty
                time_factor = 0.9
            else:
                time_factor = 1.0
            
            final_score = base_score * time_factor
        else:
            final_score = 0
            time_factor = 1.0
        
        return {
            "is_correct": is_correct,
            "base_score": 100 if is_correct else 0,
            "weighted_score": final_score,
            "difficulty": difficulty,
            "difficulty_weight": weight,
            "time_taken": time_taken,
            "time_threshold": time_threshold,
            "time_factor": time_factor,
            "skill": skill,
            "correct_answer": correct_answer,
            "selected_answer": selected_answer
        }
    
    async def evaluate_text_answer(
        self,
        question: str,
        correct_answer: str,
        student_answer: str,
        skill: str
    ) -> Dict[str, Any]:
        """
        Evaluate text/short answer using semantic similarity and AI analysis
        
        Args:
            question: The question text
            correct_answer: Expected correct answer
            student_answer: Student's answer
            skill: Related skill
            
        Returns:
            Detailed evaluation with scores and feedback
        """
        # Calculate semantic similarity
        correct_embedding = await self.embedding_service.embed_text(correct_answer)
        student_embedding = await self.embedding_service.embed_text(student_answer)
        
        semantic_similarity = await self.embedding_service.compute_similarity(
            correct_embedding,
            student_embedding
        )
        
        # Use LLM for deeper analysis if model is available
        if self.model_service.has_model:
            ai_evaluation = await self.model_service.generate_skill_assessment(
                answer=student_answer,
                question=question,
                correct_answer=correct_answer,
                skill=skill
            )
        else:
            ai_evaluation = await self._rule_based_evaluation(
                student_answer,
                correct_answer,
                semantic_similarity
            )
        
        # Combine scores
        semantic_score = semantic_similarity * 100
        ai_score = ai_evaluation.get('score', semantic_score)
        
        # Weighted combination
        final_score = (semantic_score * 0.4) + (ai_score * 0.6)
        
        return {
            "final_score": final_score,
            "semantic_similarity": semantic_similarity,
            "semantic_score": semantic_score,
            "ai_evaluation": ai_evaluation,
            "concept_understanding": ai_evaluation.get('concept_understanding', final_score),
            "explanation_depth": ai_evaluation.get('explanation_depth', final_score),
            "accuracy": ai_evaluation.get('accuracy', final_score),
            "feedback": ai_evaluation.get('feedback', ''),
            "missing_concepts": ai_evaluation.get('missing_concepts', []),
            "strengths": ai_evaluation.get('strengths', []),
            "improvement_suggestions": ai_evaluation.get('improvement_suggestions', [])
        }
    
    async def _rule_based_evaluation(
        self,
        student_answer: str,
        correct_answer: str,
        similarity: float
    ) -> Dict[str, Any]:
        """Fallback rule-based evaluation when AI model is unavailable"""
        
        # Length analysis
        student_length = len(student_answer.split())
        correct_length = len(correct_answer.split())
        length_ratio = min(student_length, correct_length) / max(student_length, correct_length, 1)
        
        # Keyword matching
        correct_keywords = set(correct_answer.lower().split())
        student_keywords = set(student_answer.lower().split())
        keyword_overlap = len(correct_keywords & student_keywords) / max(len(correct_keywords), 1)
        
        # Combined score
        score = (similarity * 0.5 + length_ratio * 0.2 + keyword_overlap * 0.3) * 100
        
        return {
            "score": score,
            "concept_understanding": score,
            "explanation_depth": length_ratio * 100,
            "accuracy": similarity * 100,
            "feedback": self._generate_basic_feedback(score),
            "missing_concepts": [],
            "strengths": [],
            "improvement_suggestions": ["Practice explaining concepts in more detail"]
        }
    
    def _generate_basic_feedback(self, score: float) -> str:
        """Generate basic feedback based on score"""
        if score >= 80:
            return "Excellent answer! You demonstrated strong understanding of the concept."
        elif score >= 60:
            return "Good answer. You covered most key points but could add more detail."
        elif score >= 40:
            return "Fair attempt. Consider reviewing this topic and practicing more."
        else:
            return "This area needs improvement. Focus on understanding the core concepts."
    
    async def evaluate_coding_answer(
        self,
        question: Dict[str, Any],
        student_code: str,
        expected_output: Any,
        actual_output: Any,
        execution_time: float
    ) -> Dict[str, Any]:
        """
        Evaluate coding answer with multiple criteria
        
        Args:
            question: Question with test cases and complexity requirements
            student_code: Student's code solution
            expected_output: Expected test case outputs
            actual_output: Actual outputs from running code
            execution_time: Code execution time
            
        Returns:
            Detailed code evaluation
        """
        # Functional correctness
        outputs_match = expected_output == actual_output
        correctness_score = 100 if outputs_match else 0
        
        # Time complexity analysis (simplified)
        complexity_hints = self._analyze_code_complexity(student_code)
        
        # Code quality metrics
        code_quality = self._analyze_code_quality(student_code)
        
        # Pattern detection
        patterns = self._detect_coding_patterns(student_code)
        
        # Use AI for deeper analysis if available
        if self.model_service.has_model and not outputs_match:
            # Get AI feedback on why the code might be wrong
            ai_feedback = await self._get_ai_code_feedback(
                question.get('description', ''),
                student_code,
                expected_output,
                actual_output
            )
        else:
            ai_feedback = {"feedback": "", "suggestions": []}
        
        # Calculate weighted score
        final_score = (
            correctness_score * 0.5 +
            code_quality['score'] * 0.25 +
            complexity_hints['efficiency_score'] * 0.25
        )
        
        return {
            "final_score": final_score,
            "correctness": {
                "score": correctness_score,
                "passed": outputs_match,
                "expected": expected_output,
                "actual": actual_output
            },
            "complexity": complexity_hints,
            "code_quality": code_quality,
            "patterns_detected": patterns,
            "execution_time": execution_time,
            "ai_feedback": ai_feedback,
            "feedback": self._generate_code_feedback(
                outputs_match,
                code_quality,
                complexity_hints
            )
        }
    
    def _analyze_code_complexity(self, code: str) -> Dict[str, Any]:
        """Analyze time/space complexity hints from code"""
        code_lower = code.lower()
        
        # Simple heuristics for complexity detection
        has_nested_loops = code.count('for') > 1 or code.count('while') > 1
        has_recursion = 'def ' in code and any(
            name in code[code.find('def '):] 
            for name in ['return ' + name for name in ['solve', 'helper', 'recursive']]
        )
        uses_sorting = 'sort(' in code_lower or 'sorted(' in code_lower
        uses_hashmap = 'dict(' in code_lower or '{}' in code or 'set(' in code_lower
        
        # Estimate complexity
        if has_nested_loops:
            estimated_time = "O(n²)"
            efficiency_score = 60
        elif uses_sorting:
            estimated_time = "O(n log n)"
            efficiency_score = 80
        elif uses_hashmap:
            estimated_time = "O(n)"
            efficiency_score = 95
        else:
            estimated_time = "O(n)"
            efficiency_score = 85
        
        return {
            "estimated_time_complexity": estimated_time,
            "efficiency_score": efficiency_score,
            "has_nested_loops": has_nested_loops,
            "has_recursion": has_recursion,
            "uses_sorting": uses_sorting,
            "uses_hashmap": uses_hashmap
        }
    
    def _analyze_code_quality(self, code: str) -> Dict[str, Any]:
        """Analyze code quality metrics"""
        lines = code.split('\n')
        non_empty_lines = [l for l in lines if l.strip()]
        
        # Variable naming (simplified check)
        has_descriptive_names = any(
            len(word) > 3 
            for line in lines 
            for word in line.split() 
            if word.isidentifier()
        )
        
        # Comments
        comment_lines = sum(1 for l in lines if l.strip().startswith('#'))
        has_comments = comment_lines > 0
        
        # Function structure
        has_functions = 'def ' in code
        
        # Code length
        is_concise = len(non_empty_lines) < 50
        
        # Calculate score
        score = 50  # Base score
        if has_descriptive_names:
            score += 15
        if has_comments:
            score += 10
        if has_functions:
            score += 15
        if is_concise:
            score += 10
        
        return {
            "score": min(score, 100),
            "total_lines": len(lines),
            "code_lines": len(non_empty_lines),
            "comment_lines": comment_lines,
            "has_descriptive_names": has_descriptive_names,
            "has_comments": has_comments,
            "has_functions": has_functions,
            "is_concise": is_concise
        }
    
    def _detect_coding_patterns(self, code: str) -> List[str]:
        """Detect algorithmic patterns in code"""
        patterns = []
        code_lower = code.lower()
        
        pattern_indicators = {
            "Two Pointers": ["left", "right", "while left < right"],
            "Sliding Window": ["window", "start", "end"],
            "Binary Search": ["mid", "low", "high", "binary"],
            "Dynamic Programming": ["dp[", "memo", "cache"],
            "BFS/BFS": ["queue", "visited", "bfs", "dfs"],
            "Greedy": ["max(", "min(", "sorted"],
            "Recursion": ["return " and "def "],
            "Hash Map": ["dict(", "{}", "get("],
        }
        
        for pattern, indicators in pattern_indicators.items():
            if any(ind.lower() in code_lower for ind in indicators):
                patterns.append(pattern)
        
        return patterns
    
    async def _get_ai_code_feedback(
        self,
        problem: str,
        code: str,
        expected: Any,
        actual: Any
    ) -> Dict[str, Any]:
        """Get AI feedback on code"""
        prompt = f"""Analyze this code submission:

PROBLEM: {problem}

CODE:
```python
{code}
```

EXPECTED OUTPUT: {expected}
ACTUAL OUTPUT: {actual}

Provide brief feedback on what went wrong and how to fix it.
Respond as JSON: {{"feedback": "...", "suggestions": ["...", "..."]}}"""
        
        response = await self.model_service.generate(
            prompt=prompt,
            max_tokens=300,
            temperature=0.3
        )
        
        try:
            import json
            start = response.find("{")
            end = response.rfind("}") + 1
            if start != -1 and end > start:
                return json.loads(response[start:end])
        except:
            pass
        
        return {"feedback": response, "suggestions": []}
    
    def _generate_code_feedback(
        self,
        is_correct: bool,
        quality: Dict[str, Any],
        complexity: Dict[str, Any]
    ) -> str:
        """Generate comprehensive code feedback"""
        feedback_parts = []
        
        if is_correct:
            feedback_parts.append("✅ Your solution is correct!")
        else:
            feedback_parts.append("❌ Your solution didn't produce the expected output.")
        
        if complexity['efficiency_score'] < 70:
            feedback_parts.append(
                f"⚡ Consider optimizing - current complexity appears to be {complexity['estimated_time_complexity']}."
            )
        
        if not quality['has_comments']:
            feedback_parts.append("📝 Consider adding comments to explain your logic.")
        
        if not quality['has_descriptive_names']:
            feedback_parts.append("🏷️ Use more descriptive variable names for clarity.")
        
        return " ".join(feedback_parts)
    
    async def calculate_section_score(
        self,
        section_results: List[Dict[str, Any]],
        section_name: str
    ) -> Dict[str, Any]:
        """
        Calculate comprehensive section score
        
        Args:
            section_results: List of individual question results
            section_name: Name of the section
            
        Returns:
            Section score with analytics
        """
        if not section_results:
            return {
                "section": section_name,
                "score": 0,
                "total_questions": 0,
                "correct": 0,
                "analytics": {}
            }
        
        total_weighted_score = sum(r.get('weighted_score', r.get('final_score', 0)) for r in section_results)
        max_possible = sum(
            self.DIFFICULTY_WEIGHTS.get(r.get('difficulty', 'medium'), 1.0) * 100
            for r in section_results
        )
        
        correct_count = sum(1 for r in section_results if r.get('is_correct', r.get('final_score', 0) >= 70))
        
        # Time analysis
        total_time = sum(r.get('time_taken', 0) for r in section_results)
        avg_time = total_time / len(section_results) if section_results else 0
        
        # Difficulty breakdown
        difficulty_breakdown = {}
        for r in section_results:
            diff = r.get('difficulty', 'medium')
            if diff not in difficulty_breakdown:
                difficulty_breakdown[diff] = {'correct': 0, 'total': 0}
            difficulty_breakdown[diff]['total'] += 1
            if r.get('is_correct', r.get('final_score', 0) >= 70):
                difficulty_breakdown[diff]['correct'] += 1
        
        return {
            "section": section_name,
            "score": (total_weighted_score / max_possible * 100) if max_possible > 0 else 0,
            "raw_score": total_weighted_score,
            "max_possible": max_possible,
            "total_questions": len(section_results),
            "correct": correct_count,
            "accuracy": (correct_count / len(section_results) * 100) if section_results else 0,
            "total_time": total_time,
            "average_time": avg_time,
            "difficulty_breakdown": difficulty_breakdown,
            "timestamp": datetime.utcnow().isoformat()
        }
    
    async def calculate_overall_assessment(
        self,
        section_scores: List[Dict[str, Any]],
        student_profile: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Calculate overall assessment with placement readiness prediction
        
        Args:
            section_scores: List of section score results
            student_profile: Student profile data
            
        Returns:
            Comprehensive assessment result
        """
        if not section_scores:
            return {
                "overall_score": 0,
                "placement_readiness": 0,
                "sections": [],
                "weak_areas": [],
                "strong_areas": [],
                "recommendations": []
            }
        
        # Calculate weighted overall score
        total_score = sum(s['score'] * s['total_questions'] for s in section_scores)
        total_questions = sum(s['total_questions'] for s in section_scores)
        overall_score = total_score / total_questions if total_questions > 0 else 0
        
        # Identify weak and strong areas
        weak_areas = [s['section'] for s in section_scores if s['score'] < 60]
        strong_areas = [s['section'] for s in section_scores if s['score'] >= 80]
        
        # Placement readiness calculation
        # Factors: overall score, consistency, difficulty performance
        consistency = np.std([s['score'] for s in section_scores]) if len(section_scores) > 1 else 0
        consistency_factor = max(0, 1 - (consistency / 50))  # Lower std = better
        
        placement_readiness = overall_score * 0.7 + consistency_factor * 100 * 0.3
        
        return {
            "overall_score": overall_score,
            "placement_readiness": placement_readiness,
            "total_questions": total_questions,
            "total_correct": sum(s['correct'] for s in section_scores),
            "sections": section_scores,
            "weak_areas": weak_areas,
            "strong_areas": strong_areas,
            "consistency_score": consistency_factor * 100,
            "assessment_date": datetime.utcnow().isoformat(),
            "student_id": student_profile.get('_id'),
            "target_role": student_profile.get('targetRole', 'Software Engineer')
        }
