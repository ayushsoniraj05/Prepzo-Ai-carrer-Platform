"""
AI Resume Analyzer Service
Provides comprehensive resume analysis including:
- ATS score calculation
- Skill extraction
- Keyword analysis
- Role-based optimization
- AI-generated improvement suggestions
"""

import re
import json
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime

logger = logging.getLogger(__name__)

# Role-specific keywords and requirements
ROLE_REQUIREMENTS = {
    "Software Engineer": {
        "required_skills": ["data structures", "algorithms", "problem solving", "coding", "programming"],
        "preferred_skills": ["system design", "api", "database", "git", "agile"],
        "keywords": ["developed", "implemented", "optimized", "designed", "built", "scalable", "performance"],
        "technologies": ["python", "java", "javascript", "c++", "sql", "react", "node.js", "aws"]
    },
    "Backend Developer": {
        "required_skills": ["api development", "database", "server-side", "system design"],
        "preferred_skills": ["microservices", "docker", "kubernetes", "caching", "message queues"],
        "keywords": ["api", "rest", "graphql", "scalable", "performance", "database", "server"],
        "technologies": ["python", "java", "node.js", "go", "postgresql", "mongodb", "redis", "kafka"]
    },
    "Frontend Developer": {
        "required_skills": ["html", "css", "javascript", "responsive design", "ui/ux"],
        "preferred_skills": ["react", "vue", "angular", "typescript", "testing", "performance"],
        "keywords": ["responsive", "user interface", "component", "ui", "ux", "interactive", "accessibility"],
        "technologies": ["react", "vue", "angular", "typescript", "javascript", "css", "sass", "webpack"]
    },
    "Full Stack Developer": {
        "required_skills": ["frontend", "backend", "database", "api"],
        "preferred_skills": ["devops", "cloud", "system design", "testing"],
        "keywords": ["full stack", "end-to-end", "frontend", "backend", "database", "api", "deployment"],
        "technologies": ["react", "node.js", "python", "mongodb", "postgresql", "docker", "aws"]
    },
    "Data Scientist": {
        "required_skills": ["python", "machine learning", "statistics", "data analysis"],
        "preferred_skills": ["deep learning", "nlp", "computer vision", "big data"],
        "keywords": ["model", "prediction", "analysis", "machine learning", "data", "insights", "algorithm"],
        "technologies": ["python", "tensorflow", "pytorch", "pandas", "numpy", "sql", "spark", "tableau"]
    },
    "Data Analyst": {
        "required_skills": ["sql", "excel", "data visualization", "statistics"],
        "preferred_skills": ["python", "tableau", "power bi", "data modeling"],
        "keywords": ["analysis", "insights", "dashboard", "report", "visualization", "kpi", "metrics"],
        "technologies": ["sql", "excel", "tableau", "power bi", "python", "r"]
    },
    "DevOps Engineer": {
        "required_skills": ["ci/cd", "docker", "kubernetes", "linux", "cloud"],
        "preferred_skills": ["terraform", "ansible", "monitoring", "security"],
        "keywords": ["automation", "deployment", "pipeline", "infrastructure", "monitoring", "scalability"],
        "technologies": ["docker", "kubernetes", "jenkins", "aws", "gcp", "terraform", "ansible", "prometheus"]
    },
    "ML Engineer": {
        "required_skills": ["machine learning", "python", "deep learning", "mlops"],
        "preferred_skills": ["distributed systems", "model deployment", "feature engineering"],
        "keywords": ["model", "training", "inference", "pipeline", "deployment", "optimization"],
        "technologies": ["python", "tensorflow", "pytorch", "mlflow", "kubeflow", "docker", "aws sagemaker"]
    }
}

# Action verbs for strong resume bullets
ACTION_VERBS = {
    "high_impact": ["achieved", "accelerated", "delivered", "drove", "generated", "increased", "launched", "led", "optimized", "reduced", "spearheaded", "transformed"],
    "technical": ["architected", "automated", "built", "coded", "debugged", "deployed", "designed", "developed", "engineered", "implemented", "integrated", "migrated", "programmed", "refactored"],
    "collaboration": ["collaborated", "coordinated", "facilitated", "mentored", "partnered", "presented", "trained"],
    "analysis": ["analyzed", "evaluated", "identified", "investigated", "researched", "solved", "tested", "validated"]
}

# Common resume sections
RESUME_SECTIONS = ["education", "experience", "skills", "projects", "certifications", "achievements", "summary", "objective"]


class ResumeAnalyzer:
    """Comprehensive AI-powered resume analyzer"""
    
    def __init__(self, model_service=None):
        """Initialize the analyzer with optional LLM service"""
        self.model_service = model_service
        self.version = "2.0"
    
    async def analyze_resume(
        self,
        resume_text: str,
        target_role: str = "Software Engineer",
        user_profile: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """
        Perform comprehensive resume analysis
        
        Args:
            resume_text: The extracted text from the resume
            target_role: The target job role for optimization
            user_profile: Optional user profile data for personalization
            
        Returns:
            Complete analysis results including ATS score, suggestions, etc.
        """
        try:
            logger.info(f"Starting resume analysis for target role: {target_role}")
            
            # Normalize inputs
            resume_text_lower = resume_text.lower()
            target_role = self._normalize_role(target_role)
            
            # Get role requirements
            role_config = ROLE_REQUIREMENTS.get(target_role, ROLE_REQUIREMENTS["Software Engineer"])
            
            # Extract resume data
            extracted_data = self._extract_resume_data(resume_text)
            
            # Calculate various scores
            keyword_score = self._calculate_keyword_score(resume_text_lower, role_config)
            skills_score = self._calculate_skills_score(extracted_data.get("skills", []), role_config)
            format_score = self._analyze_format(resume_text)
            experience_score = self._analyze_experience(resume_text, extracted_data)
            project_score = self._analyze_projects(extracted_data.get("projects", []), role_config)
            education_score = self._analyze_education(extracted_data.get("education", []))
            action_verb_score = self._analyze_action_verbs(resume_text_lower)
            quantification_score = self._analyze_quantification(resume_text)
            
            # Calculate overall ATS score (weighted average)
            ats_score = self._calculate_ats_score({
                "keyword": keyword_score,
                "skills": skills_score,
                "format": format_score,
                "experience": experience_score,
                "projects": project_score,
                "education": education_score,
                "action_verbs": action_verb_score,
                "quantification": quantification_score
            })
            
            # Generate section analysis
            sections_analysis = self._generate_section_analysis(resume_text, role_config, {
                "keyword": keyword_score,
                "skills": skills_score,
                "format": format_score,
                "experience": experience_score,
                "projects": project_score
            })
            
            # Find missing keywords
            missing_keywords = self._find_missing_keywords(resume_text_lower, role_config)
            found_keywords = self._find_present_keywords(resume_text_lower, role_config)
            
            # Generate suggestions
            suggestions = self._generate_suggestions(
                resume_text,
                extracted_data,
                role_config,
                missing_keywords,
                {
                    "keyword": keyword_score,
                    "skills": skills_score,
                    "action_verbs": action_verb_score,
                    "quantification": quantification_score
                }
            )
            
            # Generate improved lines
            improved_lines = self._generate_improved_lines(resume_text, role_config)
            
            # Generate professional summary suggestion
            suggested_summary = self._generate_summary_suggestion(
                extracted_data,
                target_role,
                user_profile
            )
            
            # Calculate job match
            job_match = self._calculate_job_match(extracted_data.get("skills", []), role_config, target_role)
            
            # Identify skill gaps
            skill_gaps = self._identify_skill_gaps(extracted_data.get("skills", []), role_config)
            
            # Format analysis
            format_analysis = self._detailed_format_analysis(resume_text)
            
            # Create improvement plan
            improvement_plan = self._create_improvement_plan(
                suggestions,
                skill_gaps,
                missing_keywords,
                {
                    "keyword": keyword_score,
                    "skills": skills_score,
                    "format": format_score
                }
            )
            
            # Industry comparison
            industry_comparison = self._generate_industry_comparison(ats_score, {
                "keyword": keyword_score,
                "skills": skills_score,
                "projects": project_score
            })
            
            # Generate strengths and weaknesses
            strengths, weaknesses = self._analyze_strengths_weaknesses(
                resume_text,
                extracted_data,
                role_config,
                {
                    "keyword": keyword_score,
                    "skills": skills_score,
                    "projects": project_score,
                    "experience": experience_score
                }
            )
            
            # Compile final analysis
            analysis = {
                "overallScore": round(ats_score),
                "sections": sections_analysis,
                "keywords": found_keywords,
                "missingKeywords": missing_keywords,
                "keywordMatchScore": keyword_score,
                "suggestions": suggestions,
                "improvedLines": improved_lines,
                "suggestedSummary": suggested_summary,
                "jobMatch": job_match,
                "skillGapsDetailed": skill_gaps,
                "formatAnalysis": format_analysis,
                "improvementPlan": improvement_plan,
                "industryComparison": industry_comparison,
                "strengthsSummary": strengths,
                "weaknessesSummary": weaknesses,
                "extractedData": extracted_data,
                "analyzedAt": datetime.utcnow().isoformat(),
                "analyzerVersion": self.version,
                "targetRoleUsed": target_role
            }
            
            logger.info(f"Resume analysis complete. ATS Score: {ats_score}")
            return analysis
            
        except Exception as e:
            logger.error(f"Error analyzing resume: {str(e)}")
            raise
    
    def _normalize_role(self, role: str) -> str:
        """Normalize role name to match our configurations"""
        role_lower = role.lower()
        
        # Map common variations
        role_mappings = {
            "sde": "Software Engineer",
            "software developer": "Software Engineer",
            "backend": "Backend Developer",
            "frontend": "Frontend Developer",
            "fullstack": "Full Stack Developer",
            "full-stack": "Full Stack Developer",
            "data science": "Data Scientist",
            "ml": "ML Engineer",
            "machine learning": "ML Engineer",
            "devops": "DevOps Engineer"
        }
        
        for key, value in role_mappings.items():
            if key in role_lower:
                return value
        
        # Check if role exists in our config
        for config_role in ROLE_REQUIREMENTS.keys():
            if config_role.lower() in role_lower or role_lower in config_role.lower():
                return config_role
        
        return "Software Engineer"  # Default
    
    def _extract_resume_data(self, resume_text: str) -> Dict[str, Any]:
        """Extract structured data from resume text"""
        data = {
            "skills": [],
            "experience": [],
            "education": [],
            "projects": [],
            "certifications": [],
            "achievements": []
        }
        
        # Extract skills (look for skills section or common skill patterns)
        skills_pattern = r'(?:skills|technologies|tech stack|tools)[:\s]*([^\n]+(?:\n(?![A-Z]).*)*)'
        skills_match = re.search(skills_pattern, resume_text, re.IGNORECASE)
        if skills_match:
            skills_text = skills_match.group(1)
            # Split by common delimiters
            skills = re.split(r'[,|•·\n]', skills_text)
            data["skills"] = [s.strip() for s in skills if s.strip() and len(s.strip()) > 1]
        
        # Also extract technologies mentioned throughout
        tech_keywords = [
            "python", "java", "javascript", "typescript", "c++", "c#", "ruby", "go", "rust", "php",
            "react", "angular", "vue", "node.js", "express", "django", "flask", "spring", "rails",
            "sql", "mongodb", "postgresql", "mysql", "redis", "elasticsearch",
            "aws", "azure", "gcp", "docker", "kubernetes", "jenkins", "git",
            "tensorflow", "pytorch", "pandas", "numpy", "scikit-learn",
            "html", "css", "sass", "webpack", "graphql", "rest api"
        ]
        for tech in tech_keywords:
            if tech.lower() in resume_text.lower() and tech not in [s.lower() for s in data["skills"]]:
                data["skills"].append(tech.title())
        
        # Extract projects
        projects_pattern = r'(?:projects?|personal projects?|academic projects?)[:\s]*\n((?:.*\n)*?)(?=\n[A-Z]|\Z)'
        projects_match = re.search(projects_pattern, resume_text, re.IGNORECASE)
        if projects_match:
            project_lines = projects_match.group(1).split('\n')
            current_project = {}
            for line in project_lines:
                line = line.strip()
                if line and not line.startswith(('•', '-', '*')):
                    if current_project:
                        data["projects"].append(current_project)
                    current_project = {"name": line, "description": "", "technologies": [], "highlights": []}
                elif line and current_project:
                    current_project["highlights"].append(line.lstrip('•-* '))
            if current_project:
                data["projects"].append(current_project)
        
        # Extract education
        education_pattern = r'(?:education|academic)[:\s]*\n((?:.*\n)*?)(?=\n[A-Z]|\Z)'
        education_match = re.search(education_pattern, resume_text, re.IGNORECASE)
        if education_match:
            edu_text = education_match.group(1)
            # Look for degree patterns
            degree_patterns = [
                r'(B\.?Tech|B\.?E\.?|Bachelor|M\.?Tech|M\.?S\.?|Master|Ph\.?D\.?)[^\n]*',
                r'(Computer Science|Information Technology|Software Engineering|Data Science)[^\n]*'
            ]
            for pattern in degree_patterns:
                matches = re.findall(pattern, edu_text, re.IGNORECASE)
                for match in matches:
                    data["education"].append({
                        "degree": match if isinstance(match, str) else match[0],
                        "institution": "",
                        "year": "",
                        "gpa": ""
                    })
        
        # Extract certifications
        cert_pattern = r'(?:certifications?|certificates?)[:\s]*\n?((?:.*\n)*?)(?=\n[A-Z]|\Z)'
        cert_match = re.search(cert_pattern, resume_text, re.IGNORECASE)
        if cert_match:
            cert_lines = cert_match.group(1).split('\n')
            data["certifications"] = [line.strip().lstrip('•-* ') for line in cert_lines if line.strip()]
        
        return data
    
    def _calculate_keyword_score(self, resume_text: str, role_config: Dict) -> float:
        """Calculate keyword match score"""
        all_keywords = (
            role_config.get("required_skills", []) +
            role_config.get("preferred_skills", []) +
            role_config.get("keywords", []) +
            role_config.get("technologies", [])
        )
        
        if not all_keywords:
            return 50.0
        
        found = sum(1 for kw in all_keywords if kw.lower() in resume_text)
        return min(100, (found / len(all_keywords)) * 150)  # Scale up for partial matches
    
    def _calculate_skills_score(self, skills: List[str], role_config: Dict) -> float:
        """Calculate skills match score"""
        required = role_config.get("required_skills", [])
        preferred = role_config.get("preferred_skills", [])
        technologies = role_config.get("technologies", [])
        
        skills_lower = [s.lower() for s in skills]
        
        required_found = sum(1 for s in required if any(s.lower() in skill for skill in skills_lower))
        preferred_found = sum(1 for s in preferred if any(s.lower() in skill for skill in skills_lower))
        tech_found = sum(1 for t in technologies if any(t.lower() in skill for skill in skills_lower))
        
        # Weight: required (50%), preferred (30%), technologies (20%)
        score = 0
        if required:
            score += (required_found / len(required)) * 50
        if preferred:
            score += (preferred_found / len(preferred)) * 30
        if technologies:
            score += (tech_found / len(technologies)) * 20
        
        return min(100, score)
    
    def _analyze_format(self, resume_text: str) -> float:
        """Analyze resume format and structure"""
        score = 50  # Base score
        
        # Check for key sections
        for section in RESUME_SECTIONS:
            if section.lower() in resume_text.lower():
                score += 5
        
        # Check length (ideal: 500-2000 words)
        word_count = len(resume_text.split())
        if 500 <= word_count <= 2000:
            score += 10
        elif word_count < 300:
            score -= 15
        elif word_count > 3000:
            score -= 10
        
        # Check for contact info patterns
        if re.search(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', resume_text):
            score += 5
        if re.search(r'linkedin\.com|github\.com', resume_text, re.IGNORECASE):
            score += 5
        
        return min(100, max(0, score))
    
    def _analyze_experience(self, resume_text: str, extracted_data: Dict) -> float:
        """Analyze work experience section"""
        score = 40  # Base score
        
        # Check for experience section
        if re.search(r'experience|work history|employment', resume_text, re.IGNORECASE):
            score += 15
        
        # Check for date ranges (indicates proper formatting)
        date_patterns = re.findall(r'\b(20\d{2}|19\d{2})\b', resume_text)
        if len(date_patterns) >= 2:
            score += 10
        
        # Check for company names followed by roles
        if re.search(r'(?:at|@|,)\s*(?:Inc|LLC|Corp|Ltd|Company)', resume_text, re.IGNORECASE):
            score += 10
        
        # Check for bullet points (good formatting)
        bullet_count = len(re.findall(r'[•\-\*]\s', resume_text))
        if bullet_count >= 5:
            score += 15
        elif bullet_count >= 3:
            score += 10
        
        return min(100, score)
    
    def _analyze_projects(self, projects: List[Dict], role_config: Dict) -> float:
        """Analyze projects section"""
        if not projects:
            return 30  # Base score without projects
        
        score = 50  # Base score with projects
        
        # Score based on number of projects
        score += min(20, len(projects) * 5)
        
        # Check for technology mentions
        technologies = role_config.get("technologies", [])
        for project in projects:
            highlights = project.get("highlights", [])
            for tech in technologies:
                if any(tech.lower() in h.lower() for h in highlights):
                    score += 3
        
        return min(100, score)
    
    def _analyze_education(self, education: List[Dict]) -> float:
        """Analyze education section"""
        if not education:
            return 40
        
        score = 60  # Base score with education
        
        # Check for relevant degrees
        relevant_degrees = ["computer science", "software", "information technology", "data science", "engineering"]
        for edu in education:
            degree = edu.get("degree", "").lower()
            if any(rd in degree for rd in relevant_degrees):
                score += 15
                break
        
        return min(100, score)
    
    def _analyze_action_verbs(self, resume_text: str) -> float:
        """Analyze use of action verbs"""
        all_verbs = []
        for verbs in ACTION_VERBS.values():
            all_verbs.extend(verbs)
        
        found = sum(1 for verb in all_verbs if verb in resume_text)
        
        # Score based on action verb density
        if found >= 15:
            return 100
        elif found >= 10:
            return 85
        elif found >= 5:
            return 70
        elif found >= 3:
            return 55
        return 40
    
    def _analyze_quantification(self, resume_text: str) -> float:
        """Check for quantified achievements"""
        # Look for numbers with context
        patterns = [
            r'\d+%',  # Percentages
            r'\$\d+',  # Dollar amounts
            r'\d+\+?\s*(?:users?|customers?|clients?|team members?|developers?)',  # User counts
            r'(?:increased|decreased|improved|reduced|grew|saved)\s*(?:by\s*)?\d+',  # Quantified results
            r'\d+x\s*(?:faster|better|more|improvement)',  # Multipliers
        ]
        
        found = sum(1 for p in patterns if re.search(p, resume_text, re.IGNORECASE))
        
        if found >= 5:
            return 100
        elif found >= 3:
            return 80
        elif found >= 2:
            return 65
        elif found >= 1:
            return 50
        return 35
    
    def _calculate_ats_score(self, scores: Dict[str, float]) -> float:
        """Calculate weighted ATS score"""
        weights = {
            "keyword": 0.20,
            "skills": 0.20,
            "format": 0.10,
            "experience": 0.15,
            "projects": 0.15,
            "education": 0.05,
            "action_verbs": 0.08,
            "quantification": 0.07
        }
        
        total = sum(scores.get(key, 50) * weight for key, weight in weights.items())
        return min(100, max(0, total))
    
    def _generate_section_analysis(
        self,
        resume_text: str,
        role_config: Dict,
        scores: Dict[str, float]
    ) -> List[Dict]:
        """Generate detailed section-by-section analysis"""
        sections = []
        
        # Skills Section
        skill_score = scores.get("skills", 50)
        skill_feedback = []
        if skill_score >= 80:
            skill_feedback.append("Excellent skill alignment with target role")
        elif skill_score >= 60:
            skill_feedback.append("Good skills listed, but consider adding more role-specific technologies")
        else:
            skill_feedback.append("Add more relevant technical skills for your target role")
        sections.append({
            "name": "Skills & Technologies",
            "score": round(skill_score),
            "feedback": skill_feedback,
            "icon": "code"
        })
        
        # Keywords Section
        keyword_score = scores.get("keyword", 50)
        keyword_feedback = []
        if keyword_score >= 80:
            keyword_feedback.append("Strong keyword optimization for ATS systems")
        else:
            keyword_feedback.append("Include more industry-specific keywords to improve ATS matching")
        sections.append({
            "name": "Keywords & ATS Optimization",
            "score": round(keyword_score),
            "feedback": keyword_feedback,
            "icon": "search"
        })
        
        # Experience Section
        experience_score = scores.get("experience", 50)
        exp_feedback = []
        if experience_score >= 80:
            exp_feedback.append("Well-structured experience section with good detail")
        elif experience_score >= 60:
            exp_feedback.append("Experience section could use more quantified achievements")
        else:
            exp_feedback.append("Add more detail to your experience with measurable results")
        sections.append({
            "name": "Work Experience",
            "score": round(experience_score),
            "feedback": exp_feedback,
            "icon": "briefcase"
        })
        
        # Projects Section
        project_score = scores.get("projects", 50)
        proj_feedback = []
        if project_score >= 80:
            proj_feedback.append("Strong project portfolio demonstrating practical skills")
        elif project_score >= 60:
            proj_feedback.append("Good projects, consider adding more technical details")
        else:
            proj_feedback.append("Add 2-3 relevant projects with technologies and impact")
        sections.append({
            "name": "Projects",
            "score": round(project_score),
            "feedback": proj_feedback,
            "icon": "folder"
        })
        
        # Format Section
        format_score = scores.get("format", 50)
        format_feedback = []
        if format_score >= 80:
            format_feedback.append("Clean, professional formatting")
        else:
            format_feedback.append("Consider improving resume structure and organization")
        sections.append({
            "name": "Format & Structure",
            "score": round(format_score),
            "feedback": format_feedback,
            "icon": "layout"
        })
        
        return sections
    
    def _find_missing_keywords(self, resume_text: str, role_config: Dict) -> List[str]:
        """Find important keywords missing from resume"""
        missing = []
        
        all_keywords = (
            role_config.get("required_skills", []) +
            role_config.get("technologies", [])
        )
        
        for kw in all_keywords:
            if kw.lower() not in resume_text:
                missing.append(kw)
        
        return missing[:10]  # Return top 10 missing
    
    def _find_present_keywords(self, resume_text: str, role_config: Dict) -> List[str]:
        """Find keywords present in resume"""
        found = []
        
        all_keywords = (
            role_config.get("required_skills", []) +
            role_config.get("preferred_skills", []) +
            role_config.get("technologies", [])
        )
        
        for kw in all_keywords:
            if kw.lower() in resume_text:
                found.append(kw)
        
        return found
    
    def _generate_suggestions(
        self,
        resume_text: str,
        extracted_data: Dict,
        role_config: Dict,
        missing_keywords: List[str],
        scores: Dict[str, float]
    ) -> List[str]:
        """Generate actionable improvement suggestions"""
        suggestions = []
        
        # Keyword suggestions
        if missing_keywords:
            suggestions.append(f"Add these keywords to improve ATS matching: {', '.join(missing_keywords[:5])}")
        
        # Skills suggestions
        if scores.get("skills", 0) < 70:
            suggestions.append("Include more technical skills relevant to your target role in a dedicated Skills section")
        
        # Quantification suggestions
        if scores.get("quantification", 0) < 60:
            suggestions.append("Add measurable achievements (e.g., 'Increased performance by 30%', 'Served 10K+ users')")
        
        # Action verb suggestions
        if scores.get("action_verbs", 0) < 70:
            suggestions.append("Start bullet points with strong action verbs like 'Developed', 'Implemented', 'Optimized', 'Led'")
        
        # Project suggestions
        projects = extracted_data.get("projects", [])
        if len(projects) < 2:
            suggestions.append("Add 2-3 portfolio projects showcasing your technical skills and real-world impact")
        
        # General suggestions
        if "summary" not in resume_text.lower() and "objective" not in resume_text.lower():
            suggestions.append("Add a professional summary highlighting your key strengths and career goals")
        
        if not re.search(r'github\.com', resume_text, re.IGNORECASE):
            suggestions.append("Include a link to your GitHub profile to showcase your code")
        
        if not re.search(r'linkedin\.com', resume_text, re.IGNORECASE):
            suggestions.append("Add your LinkedIn profile URL for professional networking")
        
        return suggestions[:8]  # Return top 8 suggestions
    
    def _generate_improved_lines(self, resume_text: str, role_config: Dict) -> List[Dict]:
        """Generate AI-improved versions of weak resume lines"""
        improved = []
        
        # Find weak patterns and suggest improvements
        weak_patterns = [
            {
                "pattern": r"worked on ([a-z\s]+)",
                "original": "Worked on {match}",
                "improved": "Developed and delivered {match} using modern technologies, improving user experience by X%",
                "reason": "Use specific action verbs and quantify impact"
            },
            {
                "pattern": r"responsible for ([a-z\s]+)",
                "original": "Responsible for {match}",
                "improved": "Led {match}, achieving measurable results in efficiency and quality",
                "reason": "Replace passive language with active, impact-focused statements"
            },
            {
                "pattern": r"helped (?:with |in )?([a-z\s]+)",
                "original": "Helped with {match}",
                "improved": "Contributed to {match}, specifically by implementing key features",
                "reason": "Be specific about your contributions rather than using vague helping language"
            },
            {
                "pattern": r"did ([a-z\s]+)",
                "original": "Did {match}",
                "improved": "Executed {match} resulting in improved outcomes",
                "reason": "Use professional action verbs instead of casual language"
            }
        ]
        
        resume_lower = resume_text.lower()
        for wp in weak_patterns:
            match = re.search(wp["pattern"], resume_lower)
            if match:
                matched_text = match.group(1) if match.groups() else ""
                improved.append({
                    "original": wp["original"].replace("{match}", matched_text),
                    "improved": wp["improved"].replace("{match}", matched_text),
                    "reason": wp["reason"]
                })
        
        # Add general improvement suggestions
        if len(improved) < 3:
            improved.extend([
                {
                    "original": "Built a web application",
                    "improved": "Architected and developed a scalable web application using React and Node.js, serving 1000+ daily active users",
                    "reason": "Add technologies used and quantify impact"
                },
                {
                    "original": "Good communication skills",
                    "improved": "Excellent communication skills demonstrated through client presentations and cross-functional team collaboration",
                    "reason": "Provide evidence of soft skills rather than just listing them"
                }
            ])
        
        return improved[:5]
    
    def _generate_summary_suggestion(
        self,
        extracted_data: Dict,
        target_role: str,
        user_profile: Optional[Dict]
    ) -> str:
        """Generate a professional summary suggestion"""
        skills = extracted_data.get("skills", [])[:5]
        skills_text = ", ".join(skills) if skills else "technical expertise"
        
        # Get additional context from user profile
        degree = ""
        if user_profile:
            degree = user_profile.get("degree", "")
            if user_profile.get("fieldOfStudy"):
                degree = f"{user_profile.get('fieldOfStudy')} {degree}".strip()
        
        degree_text = f"{degree} graduate" if degree else "motivated professional"
        
        summary = (
            f"Results-driven {degree_text} with strong expertise in {skills_text}. "
            f"Seeking to leverage technical skills and problem-solving abilities as a {target_role}. "
            f"Passionate about building scalable solutions and delivering high-quality software. "
            f"Strong foundation in data structures, algorithms, and software engineering best practices."
        )
        
        return summary
    
    def _calculate_job_match(
        self,
        skills: List[str],
        role_config: Dict,
        target_role: str
    ) -> Dict:
        """Calculate job match percentage"""
        required = role_config.get("required_skills", [])
        preferred = role_config.get("preferred_skills", [])
        
        skills_lower = [s.lower() for s in skills]
        
        required_match = []
        for skill in required:
            found = any(skill.lower() in s for s in skills_lower)
            required_match.append({
                "skill": skill,
                "found": found,
                "importance": "required"
            })
        
        preferred_match = []
        for skill in preferred:
            found = any(skill.lower() in s for s in skills_lower)
            preferred_match.append({
                "skill": skill,
                "found": found,
                "importance": "preferred"
            })
        
        # Calculate match percentage
        required_found = sum(1 for m in required_match if m["found"])
        preferred_found = sum(1 for m in preferred_match if m["found"])
        
        total_weight = len(required) * 2 + len(preferred)  # Required weighted 2x
        found_weight = required_found * 2 + preferred_found
        
        match_percentage = (found_weight / total_weight * 100) if total_weight > 0 else 50
        
        return {
            "targetRole": target_role,
            "matchPercentage": round(match_percentage),
            "requiredSkillsMatch": required_match + preferred_match
        }
    
    def _identify_skill_gaps(self, skills: List[str], role_config: Dict) -> List[Dict]:
        """Identify skill gaps with learning recommendations"""
        gaps = []
        skills_lower = [s.lower() for s in skills]
        
        # Check required skills
        for skill in role_config.get("required_skills", []):
            if not any(skill.lower() in s for s in skills_lower):
                gaps.append({
                    "skill": skill,
                    "importance": "critical",
                    "description": f"{skill} is essential for this role and frequently tested in interviews",
                    "certifications": self._get_certification_recommendations(skill)
                })
        
        # Check preferred skills
        for skill in role_config.get("preferred_skills", []):
            if not any(skill.lower() in s for s in skills_lower):
                gaps.append({
                    "skill": skill,
                    "importance": "high",
                    "description": f"{skill} will give you a competitive advantage",
                    "certifications": self._get_certification_recommendations(skill)
                })
        
        return gaps[:5]  # Return top 5 gaps
    
    def _get_certification_recommendations(self, skill: str) -> List[Dict]:
        """Get certification recommendations for a skill"""
        # Simplified certification database
        cert_db = {
            "python": {"name": "Python Developer Certificate", "provider": "Google", "url": "https://grow.google/certificates/", "duration": "3 months", "difficulty": "intermediate"},
            "java": {"name": "Oracle Java Certification", "provider": "Oracle", "url": "https://education.oracle.com/", "duration": "2 months", "difficulty": "intermediate"},
            "aws": {"name": "AWS Certified Solutions Architect", "provider": "Amazon", "url": "https://aws.amazon.com/certification/", "duration": "3 months", "difficulty": "advanced"},
            "docker": {"name": "Docker Certified Associate", "provider": "Docker", "url": "https://training.mirantis.com/dca", "duration": "2 months", "difficulty": "intermediate"},
            "kubernetes": {"name": "CKA: Certified Kubernetes Administrator", "provider": "CNCF", "url": "https://training.linuxfoundation.org/", "duration": "3 months", "difficulty": "advanced"},
            "machine learning": {"name": "TensorFlow Developer Certificate", "provider": "Google", "url": "https://www.tensorflow.org/certificate", "duration": "2 months", "difficulty": "intermediate"},
            "system design": {"name": "System Design Interview Course", "provider": "Educative", "url": "https://www.educative.io/", "duration": "1 month", "difficulty": "advanced"},
            "data structures": {"name": "Data Structures & Algorithms", "provider": "Coursera", "url": "https://www.coursera.org/", "duration": "2 months", "difficulty": "intermediate"},
        }
        
        skill_lower = skill.lower()
        for key, cert in cert_db.items():
            if key in skill_lower:
                return [{
                    "name": cert["name"],
                    "provider": cert["provider"],
                    "url": cert["url"],
                    "duration": cert["duration"],
                    "difficulty": cert["difficulty"],
                    "skills": [skill],
                    "price": "Free - $300",
                    "rating": 4.5
                }]
        
        # Default recommendation
        return [{
            "name": f"{skill} Fundamentals",
            "provider": "Coursera/Udemy",
            "url": "https://www.coursera.org/",
            "duration": "1-2 months",
            "difficulty": "beginner",
            "skills": [skill],
            "price": "Free - $50",
            "rating": 4.2
        }]
    
    def _detailed_format_analysis(self, resume_text: str) -> List[Dict]:
        """Detailed format and structure analysis"""
        analysis = []
        
        # Check sections
        has_summary = "summary" in resume_text.lower() or "objective" in resume_text.lower()
        analysis.append({
            "category": "Professional Summary",
            "status": "good" if has_summary else "warning",
            "message": "Has a professional summary" if has_summary else "Missing professional summary",
            "tip": "Add a 2-3 sentence summary highlighting your key strengths" if not has_summary else "Keep it concise and impactful"
        })
        
        # Check contact info
        has_email = bool(re.search(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', resume_text))
        analysis.append({
            "category": "Contact Information",
            "status": "good" if has_email else "error",
            "message": "Email address found" if has_email else "No email address found",
            "tip": "Ensure your email and phone number are prominently displayed"
        })
        
        # Check for LinkedIn/GitHub
        has_links = bool(re.search(r'linkedin\.com|github\.com', resume_text, re.IGNORECASE))
        analysis.append({
            "category": "Professional Links",
            "status": "good" if has_links else "warning",
            "message": "Professional profile links included" if has_links else "Missing LinkedIn/GitHub links",
            "tip": "Add your LinkedIn and GitHub profiles to showcase your professional presence"
        })
        
        # Check bullet points
        bullet_count = len(re.findall(r'[•\-\*]\s', resume_text))
        analysis.append({
            "category": "Bullet Points",
            "status": "good" if bullet_count >= 5 else "warning",
            "message": f"Found {bullet_count} bullet points" if bullet_count >= 5 else "Consider using more bullet points",
            "tip": "Use bullet points for easy scanning by recruiters and ATS systems"
        })
        
        # Check length
        word_count = len(resume_text.split())
        if 500 <= word_count <= 2000:
            length_status = "good"
            length_msg = f"Resume length ({word_count} words) is optimal"
        elif word_count < 300:
            length_status = "error"
            length_msg = f"Resume too short ({word_count} words)"
        else:
            length_status = "warning"
            length_msg = f"Resume may be too long ({word_count} words)"
        
        analysis.append({
            "category": "Length",
            "status": length_status,
            "message": length_msg,
            "tip": "Aim for 1-2 pages (500-1000 words for freshers, 1000-2000 for experienced)"
        })
        
        return analysis
    
    def _create_improvement_plan(
        self,
        suggestions: List[str],
        skill_gaps: List[Dict],
        missing_keywords: List[str],
        scores: Dict[str, float]
    ) -> List[Dict]:
        """Create prioritized improvement plan"""
        plan = []
        priority = 1
        
        # Critical: Low keyword score
        if scores.get("keyword", 100) < 60:
            plan.append({
                "priority": priority,
                "action": f"Add missing keywords: {', '.join(missing_keywords[:3])}",
                "impact": "high",
                "timeToComplete": "15 minutes",
                "details": "These keywords are essential for passing ATS screening"
            })
            priority += 1
        
        # High: Skill gaps
        critical_gaps = [g for g in skill_gaps if g.get("importance") == "critical"]
        if critical_gaps:
            plan.append({
                "priority": priority,
                "action": f"Learn {critical_gaps[0]['skill']}",
                "impact": "high",
                "timeToComplete": "2-4 weeks",
                "details": critical_gaps[0].get("description", "This is a required skill for your target role")
            })
            priority += 1
        
        # Medium: Format improvements
        if scores.get("format", 100) < 70:
            plan.append({
                "priority": priority,
                "action": "Improve resume formatting",
                "impact": "medium",
                "timeToComplete": "30 minutes",
                "details": "Add clear section headers, bullet points, and consistent formatting"
            })
            priority += 1
        
        # Add suggestions as plan items
        for suggestion in suggestions[:3]:
            plan.append({
                "priority": priority,
                "action": suggestion,
                "impact": "medium",
                "timeToComplete": "1 hour",
                "details": "Following this suggestion will improve your resume score"
            })
            priority += 1
        
        return plan[:6]
    
    def _generate_industry_comparison(
        self,
        ats_score: float,
        scores: Dict[str, float]
    ) -> List[Dict]:
        """Generate industry comparison metrics"""
        return [
            {
                "metric": "Overall ATS Score",
                "yourScore": round(ats_score),
                "average": 65,
                "topPerformers": 85
            },
            {
                "metric": "Keyword Optimization",
                "yourScore": round(scores.get("keyword", 50)),
                "average": 60,
                "topPerformers": 90
            },
            {
                "metric": "Skills Match",
                "yourScore": round(scores.get("skills", 50)),
                "average": 70,
                "topPerformers": 95
            },
            {
                "metric": "Project Quality",
                "yourScore": round(scores.get("projects", 50)),
                "average": 55,
                "topPerformers": 85
            }
        ]
    
    def _analyze_strengths_weaknesses(
        self,
        resume_text: str,
        extracted_data: Dict,
        role_config: Dict,
        scores: Dict[str, float]
    ) -> tuple:
        """Analyze resume strengths and weaknesses"""
        strengths = []
        weaknesses = []
        
        # Check skills score
        if scores.get("skills", 0) >= 70:
            strengths.append("Strong technical skill set aligned with target role")
        else:
            weaknesses.append("Limited technical skills listed for target role")
        
        # Check keyword score
        if scores.get("keyword", 0) >= 70:
            strengths.append("Good use of industry keywords for ATS optimization")
        else:
            weaknesses.append("Missing important keywords that ATS systems look for")
        
        # Check projects
        projects = extracted_data.get("projects", [])
        if len(projects) >= 2:
            strengths.append("Portfolio projects demonstrate hands-on experience")
        else:
            weaknesses.append("Weak project section - add more portfolio projects")
        
        # Check experience
        if scores.get("experience", 0) >= 70:
            strengths.append("Well-structured experience section")
        else:
            weaknesses.append("Experience section needs more detail and quantification")
        
        # Check quantification
        if re.findall(r'\d+%|\$\d+|\d+\+?\s*users?', resume_text, re.IGNORECASE):
            strengths.append("Good use of quantified achievements")
        else:
            weaknesses.append("Missing quantifiable achievements and metrics")
        
        return strengths[:4], weaknesses[:4]


# Singleton instance
_analyzer_instance = None

def get_resume_analyzer(model_service=None) -> ResumeAnalyzer:
    """Get or create resume analyzer instance"""
    global _analyzer_instance
    if _analyzer_instance is None:
        _analyzer_instance = ResumeAnalyzer(model_service)
    return _analyzer_instance
