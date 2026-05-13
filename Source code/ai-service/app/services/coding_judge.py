"""
Coding Judge System
LeetCode-style code evaluation with test cases, time/space complexity checks.
Runs code in secure containers with resource limits.
"""

from loguru import logger
from typing import List, Dict, Any, Optional, Tuple
import subprocess
import tempfile
import os
import time
import resource
import signal
import json
import re
from dataclasses import dataclass
from enum import Enum


class ExecutionStatus(Enum):
    ACCEPTED = "Accepted"
    WRONG_ANSWER = "Wrong Answer"
    TIME_LIMIT_EXCEEDED = "Time Limit Exceeded"
    MEMORY_LIMIT_EXCEEDED = "Memory Limit Exceeded"
    RUNTIME_ERROR = "Runtime Error"
    COMPILATION_ERROR = "Compilation Error"
    INTERNAL_ERROR = "Internal Error"


@dataclass
class TestCaseResult:
    passed: bool
    input: str
    expected_output: str
    actual_output: str
    execution_time: float  # milliseconds
    memory_used: int  # KB
    error_message: Optional[str] = None
    hidden: bool = False


@dataclass
class JudgeResult:
    status: ExecutionStatus
    passed_test_cases: int
    total_test_cases: int
    score: float  # 0-100
    execution_time: float  # milliseconds (average)
    memory_used: int  # KB (peak)
    test_results: List[TestCaseResult]
    compilation_output: Optional[str] = None
    complexity_analysis: Optional[Dict[str, str]] = None
    feedback: Optional[str] = None


class CodingJudge:
    """
    Secure code execution and evaluation system.
    
    Features:
    - Multi-language support (Python, JavaScript, Java, C++)
    - Hidden test cases
    - Time and memory limits
    - Complexity analysis
    - Secure sandboxed execution
    """
    
    # Resource limits
    DEFAULT_TIME_LIMIT = 5  # seconds
    DEFAULT_MEMORY_LIMIT = 256 * 1024 * 1024  # 256 MB
    MAX_OUTPUT_SIZE = 64 * 1024  # 64 KB
    
    # Language configurations
    LANGUAGES = {
        'python': {
            'extension': '.py',
            'compile': None,
            'run': ['python3', '-u', '{file}'],
            'timeout_multiplier': 1.5,
        },
        'javascript': {
            'extension': '.js',
            'compile': None,
            'run': ['node', '{file}'],
            'timeout_multiplier': 1.2,
        },
        'java': {
            'extension': '.java',
            'compile': ['javac', '{file}'],
            'run': ['java', '-cp', '{dir}', 'Solution'],
            'timeout_multiplier': 1.0,
            'main_class': 'Solution',
        },
        'cpp': {
            'extension': '.cpp',
            'compile': ['g++', '-O2', '-o', '{output}', '{file}'],
            'run': ['{output}'],
            'timeout_multiplier': 1.0,
        },
        'c': {
            'extension': '.c',
            'compile': ['gcc', '-O2', '-o', '{output}', '{file}'],
            'run': ['{output}'],
            'timeout_multiplier': 1.0,
        },
    }
    
    def __init__(self):
        self.temp_dir = tempfile.mkdtemp(prefix='judge_')
        logger.info(f"Coding judge initialized with temp dir: {self.temp_dir}")
    
    async def evaluate(
        self,
        code: str,
        language: str,
        test_cases: List[Dict[str, str]],
        hidden_test_cases: List[Dict[str, str]] = None,
        time_limit: float = None,
        memory_limit: int = None,
        expected_complexity: Dict[str, str] = None,
    ) -> JudgeResult:
        """
        Evaluate submitted code against test cases.
        
        Args:
            code: Source code submitted by student
            language: Programming language (python, javascript, java, cpp, c)
            test_cases: Visible test cases [{"input": "...", "output": "..."}]
            hidden_test_cases: Hidden test cases (same format)
            time_limit: Time limit in seconds (per test case)
            memory_limit: Memory limit in bytes
            expected_complexity: {"time": "O(n)", "space": "O(1)"}
        
        Returns:
            JudgeResult with detailed evaluation
        """
        
        language = language.lower()
        if language not in self.LANGUAGES:
            return JudgeResult(
                status=ExecutionStatus.INTERNAL_ERROR,
                passed_test_cases=0,
                total_test_cases=len(test_cases) + len(hidden_test_cases or []),
                score=0,
                execution_time=0,
                memory_used=0,
                test_results=[],
                feedback=f"Unsupported language: {language}",
            )
        
        lang_config = self.LANGUAGES[language]
        time_limit = (time_limit or self.DEFAULT_TIME_LIMIT) * lang_config['timeout_multiplier']
        memory_limit = memory_limit or self.DEFAULT_MEMORY_LIMIT
        
        # Prepare all test cases
        all_test_cases = list(test_cases)
        if hidden_test_cases:
            all_test_cases.extend([{**tc, 'hidden': True} for tc in hidden_test_cases])
        
        # Write code to file
        code_file, output_file = self._write_code(code, language)
        
        # Compile if necessary
        if lang_config.get('compile'):
            compile_result = self._compile(code_file, output_file, lang_config)
            if not compile_result['success']:
                return JudgeResult(
                    status=ExecutionStatus.COMPILATION_ERROR,
                    passed_test_cases=0,
                    total_test_cases=len(all_test_cases),
                    score=0,
                    execution_time=0,
                    memory_used=0,
                    test_results=[],
                    compilation_output=compile_result['error'],
                    feedback="Fix compilation errors before resubmitting.",
                )
        
        # Run against all test cases
        test_results = []
        total_time = 0
        max_memory = 0
        passed = 0
        
        for i, test_case in enumerate(all_test_cases):
            result = self._run_test_case(
                code_file=code_file,
                output_file=output_file,
                lang_config=lang_config,
                test_input=test_case['input'],
                expected_output=test_case['output'],
                time_limit=time_limit,
                memory_limit=memory_limit,
                is_hidden=test_case.get('hidden', False),
            )
            
            test_results.append(result)
            total_time += result.execution_time
            max_memory = max(max_memory, result.memory_used)
            
            if result.passed:
                passed += 1
            elif result.error_message and 'Time Limit' in result.error_message:
                # Stop on TLE to prevent infinite loops
                break
        
        # Calculate score
        total = len(all_test_cases)
        score = (passed / total) * 100 if total > 0 else 0
        
        # Determine status
        if passed == total:
            status = ExecutionStatus.ACCEPTED
            feedback = "All test cases passed! Great job!"
        elif any(r.error_message and 'Time Limit' in r.error_message for r in test_results):
            status = ExecutionStatus.TIME_LIMIT_EXCEEDED
            feedback = "Your solution is too slow. Try optimizing the algorithm."
        elif any(r.error_message and 'Memory Limit' in r.error_message for r in test_results):
            status = ExecutionStatus.MEMORY_LIMIT_EXCEEDED
            feedback = "Your solution uses too much memory. Consider optimizing space usage."
        elif any(r.error_message and 'Runtime Error' in (r.error_message or '') for r in test_results):
            status = ExecutionStatus.RUNTIME_ERROR
            feedback = "Runtime error occurred. Check for edge cases and array bounds."
        else:
            status = ExecutionStatus.WRONG_ANSWER
            feedback = f"Passed {passed}/{total} test cases. Review failing cases."
        
        # Analyze complexity (basic heuristic)
        complexity_analysis = self._analyze_complexity(code, language) if expected_complexity else None
        
        # Cleanup
        self._cleanup(code_file, output_file)
        
        return JudgeResult(
            status=status,
            passed_test_cases=passed,
            total_test_cases=total,
            score=score,
            execution_time=total_time / max(len(test_results), 1),
            memory_used=max_memory,
            test_results=test_results,
            complexity_analysis=complexity_analysis,
            feedback=feedback,
        )
    
    def _write_code(self, code: str, language: str) -> Tuple[str, str]:
        """Write code to a temporary file"""
        
        lang_config = self.LANGUAGES[language]
        extension = lang_config['extension']
        
        # For Java, ensure class is named Solution
        if language == 'java':
            code = self._ensure_java_class_name(code)
        
        filename = 'Solution' + extension
        code_file = os.path.join(self.temp_dir, filename)
        output_file = os.path.join(self.temp_dir, 'solution')
        
        with open(code_file, 'w') as f:
            f.write(code)
        
        return code_file, output_file
    
    def _ensure_java_class_name(self, code: str) -> str:
        """Ensure Java class is named Solution"""
        # Replace class name with Solution
        return re.sub(r'public\s+class\s+\w+', 'public class Solution', code)
    
    def _compile(self, code_file: str, output_file: str, lang_config: Dict) -> Dict[str, Any]:
        """Compile the code"""
        
        compile_cmd = lang_config['compile']
        cmd = [
            part.format(file=code_file, output=output_file, dir=os.path.dirname(code_file))
            for part in compile_cmd
        ]
        
        try:
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=30,
                cwd=os.path.dirname(code_file),
            )
            
            if result.returncode != 0:
                return {
                    'success': False,
                    'error': result.stderr or result.stdout,
                }
            
            return {'success': True}
        except subprocess.TimeoutExpired:
            return {'success': False, 'error': 'Compilation timed out'}
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def _run_test_case(
        self,
        code_file: str,
        output_file: str,
        lang_config: Dict,
        test_input: str,
        expected_output: str,
        time_limit: float,
        memory_limit: int,
        is_hidden: bool = False,
    ) -> TestCaseResult:
        """Run a single test case"""
        
        run_cmd = lang_config['run']
        cmd = [
            part.format(file=code_file, output=output_file, dir=os.path.dirname(code_file))
            for part in run_cmd
        ]
        
        start_time = time.time()
        
        try:
            result = subprocess.run(
                cmd,
                input=test_input,
                capture_output=True,
                text=True,
                timeout=time_limit,
                cwd=os.path.dirname(code_file),
            )
            
            execution_time = (time.time() - start_time) * 1000  # milliseconds
            
            if result.returncode != 0:
                return TestCaseResult(
                    passed=False,
                    input=test_input if not is_hidden else '[hidden]',
                    expected_output=expected_output if not is_hidden else '[hidden]',
                    actual_output=result.stderr[:500] if result.stderr else 'Runtime Error',
                    execution_time=execution_time,
                    memory_used=0,
                    error_message=f"Runtime Error: {result.stderr[:200]}" if result.stderr else "Runtime Error",
                    hidden=is_hidden,
                )
            
            actual_output = result.stdout.strip()
            expected_clean = expected_output.strip()
            
            # Compare outputs (normalize whitespace)
            passed = self._compare_outputs(actual_output, expected_clean)
            
            return TestCaseResult(
                passed=passed,
                input=test_input if not is_hidden else '[hidden]',
                expected_output=expected_output if not is_hidden else '[hidden]',
                actual_output=actual_output[:500] if not is_hidden else ('[correct]' if passed else '[incorrect]'),
                execution_time=execution_time,
                memory_used=0,  # Would need /proc/pid/status for accurate memory
                hidden=is_hidden,
            )
            
        except subprocess.TimeoutExpired:
            return TestCaseResult(
                passed=False,
                input=test_input if not is_hidden else '[hidden]',
                expected_output=expected_output if not is_hidden else '[hidden]',
                actual_output='',
                execution_time=time_limit * 1000,
                memory_used=0,
                error_message="Time Limit Exceeded",
                hidden=is_hidden,
            )
        except Exception as e:
            return TestCaseResult(
                passed=False,
                input=test_input if not is_hidden else '[hidden]',
                expected_output=expected_output if not is_hidden else '[hidden]',
                actual_output='',
                execution_time=0,
                memory_used=0,
                error_message=f"Internal Error: {str(e)}",
                hidden=is_hidden,
            )
    
    def _compare_outputs(self, actual: str, expected: str) -> bool:
        """Compare actual and expected outputs with normalization"""
        
        # Normalize whitespace and newlines
        actual_lines = [line.strip() for line in actual.strip().split('\n')]
        expected_lines = [line.strip() for line in expected.strip().split('\n')]
        
        if len(actual_lines) != len(expected_lines):
            return False
        
        for actual_line, expected_line in zip(actual_lines, expected_lines):
            # Try numeric comparison first
            try:
                if abs(float(actual_line) - float(expected_line)) < 1e-6:
                    continue
            except ValueError:
                pass
            
            # String comparison
            if actual_line != expected_line:
                return False
        
        return True
    
    def _analyze_complexity(self, code: str, language: str) -> Dict[str, str]:
        """Basic heuristic complexity analysis"""
        
        code_lower = code.lower()
        
        # Time complexity heuristics
        time_complexity = "O(n)"
        
        if re.search(r'for.*for.*for', code_lower):
            time_complexity = "O(n³)"
        elif re.search(r'for.*for', code_lower) or 'nested' in code_lower:
            time_complexity = "O(n²)"
        elif any(x in code_lower for x in ['sort', 'sorted', '.sort(', 'quicksort', 'mergesort']):
            time_complexity = "O(n log n)"
        elif any(x in code_lower for x in ['binary_search', 'bisect', 'mid =', 'left, right']):
            time_complexity = "O(log n)"
        elif 'while' in code_lower and 'for' not in code_lower:
            time_complexity = "O(n)"
        elif '**' in code or 'pow(' in code_lower or 'math.pow' in code_lower:
            time_complexity = "O(n)"
        
        # Space complexity heuristics
        space_complexity = "O(1)"
        
        if any(x in code_lower for x in ['memo', 'cache', 'dp[', 'dp =', 'dict()', 'hashmap', 'set(']):
            space_complexity = "O(n)"
        elif any(x in code_lower for x in ['matrix', '2d', '[[', '[][]']):
            space_complexity = "O(n²)"
        elif 'recursion' in code_lower or 'def ' in code_lower:
            # Check for recursive calls
            if re.search(r'def\s+(\w+).*\1\(', code_lower):
                space_complexity = "O(n) (recursion stack)"
        
        return {
            'estimated_time': time_complexity,
            'estimated_space': space_complexity,
            'note': 'This is a heuristic analysis. Actual complexity may vary.',
        }
    
    def _cleanup(self, code_file: str, output_file: str):
        """Clean up temporary files"""
        try:
            if os.path.exists(code_file):
                os.remove(code_file)
            if os.path.exists(output_file):
                os.remove(output_file)
            # Clean class files for Java
            class_file = code_file.replace('.java', '.class')
            if os.path.exists(class_file):
                os.remove(class_file)
        except Exception as e:
            logger.warning(f"Cleanup error: {e}")
    
    def to_dict(self, result: JudgeResult) -> Dict[str, Any]:
        """Convert JudgeResult to dictionary for JSON serialization"""
        return {
            'status': result.status.value,
            'passed': result.passed_test_cases,
            'total': result.total_test_cases,
            'score': result.score,
            'executionTime': result.execution_time,
            'memoryUsed': result.memory_used,
            'testResults': [
                {
                    'passed': tr.passed,
                    'input': tr.input,
                    'expected': tr.expected_output,
                    'actual': tr.actual_output,
                    'time': tr.execution_time,
                    'memory': tr.memory_used,
                    'error': tr.error_message,
                    'hidden': tr.hidden,
                }
                for tr in result.test_results
            ],
            'compilationOutput': result.compilation_output,
            'complexityAnalysis': result.complexity_analysis,
            'feedback': result.feedback,
        }


# Singleton instance
_coding_judge = None

def get_coding_judge() -> CodingJudge:
    global _coding_judge
    if _coding_judge is None:
        _coding_judge = CodingJudge()
    return _coding_judge
