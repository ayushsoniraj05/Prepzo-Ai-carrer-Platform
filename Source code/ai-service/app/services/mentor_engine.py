"""
Prepzo AI Service - AI Mentor Engine
Interactive AI mentor with memory, context awareness, and adaptive guidance
"""

from loguru import logger
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import uuid

from app.services.model_service import ModelService
from app.services.embedding_service import EmbeddingService
from app.services.vector_store import VectorStore
from app.services.internal_ai_service import get_internal_ai_service


class MentorEngine:
    """
    AI Mentor Module
    
    Features:
    - Conversation memory across sessions
    - Context-aware responses based on student profile
    - Knows weak areas and progress
    - Step-by-step advice
    - Interview simulation
    - Adaptive suggestions
    """
    
    def __init__(
        self,
        model_service: ModelService,
        embedding_service: EmbeddingService,
        vector_store: VectorStore,
        database
    ):
        self.model_service = model_service
        self.embedding_service = embedding_service
        self.vector_store = vector_store
        self.db = database
        self.internal_ai = get_internal_ai_service()
        # Ensure internal AI uses the already initialized model service instance
        # from app lifespan, not a stale/uninitialized module-level reference.
        self.internal_ai._model_service = model_service
    
    async def chat(
        self,
        user_id: str,
        message: str,
        session_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Process a chat message from the student
        
        Args:
            user_id: Student's user ID
            message: The message from student
            session_id: Optional session ID for conversation continuity
            
        Returns:
            Response with mentor's message and metadata
        """
        # Get or create session
        if not session_id:
            session_id = str(uuid.uuid4())
        
        # Load student context
        student_context = await self._load_student_context(user_id)
        
        # Load conversation history
        history = await self._load_conversation_history(user_id, session_id, limit=10)
        
        # Detect intent
        intent = await self._detect_intent(message)
        
        try:
            # Generate response based on intent
            if intent == "interview_practice":
                response = await self._handle_interview_practice(
                    message, student_context, history
                )
            elif intent == "concept_explanation":
                response = await self._handle_concept_explanation(
                    message, student_context
                )
            elif intent == "career_guidance":
                response = await self._handle_career_guidance(
                    message, student_context
                )
            elif intent == "progress_check":
                response = await self._handle_progress_check(
                    user_id, student_context
                )
            elif intent == "motivation":
                response = await self._handle_motivation(
                    student_context
                )
            else:
                # General conversation
                response = await self._handle_general_chat(
                    message, student_context, history
                )
        except RuntimeError as e:
            # AI model not available - provide helpful error
            error_msg = str(e)
            logger.error(f"AI generation failed: {error_msg}")
            
            # Check if it's a "not initialized" error
            if "not initialized" in error_msg.lower():
                response = {
                    "message": "👋 **I'm warming up!**\n\nI'm currently loading my knowledge base and AI models onto the server. This usually takes about 30 seconds. Feel free to ask me something else in a moment!",
                    "suggestions": ["Tell me a joke", "Check my progress"],
                    "follow_up_questions": []
                }
            else:
                response = {
                    "message": "⚠️ **AI Service Interruption**\n\nI encountered a technical issue while generating a response. My engineering team has been notified. Please try again in a few seconds.",
                    "suggestions": ["Try again", "Go to dashboard"],
                    "follow_up_questions": []
                }
        
        # Save conversation
        await self._save_conversation(
            user_id=user_id,
            session_id=session_id,
            user_message=message,
            mentor_response=response['message'],
            intent=intent
        )
        
        return {
            "session_id": session_id,
            "message": response['message'],
            "intent_detected": intent,
            "suggestions": response.get('suggestions', []),
            "resources": response.get('resources', []),
            "follow_up_questions": response.get('follow_up_questions', []),
            "timestamp": datetime.utcnow().isoformat()
        }
    
    async def _load_student_context(self, user_id: str) -> Dict[str, Any]:
        """Load comprehensive student context for personalized responses"""
        
        # Initialize with defaults
        context = {
            "user_id": user_id,
            "name": "Student",
            "target_role": "Software Engineer",
            "skill_level": "Intermediate",
            "weak_areas": [],
            "strong_areas": [],
            "recent_progress": [],
            "current_focus": None,
            "learning_streak": 0,
            "last_assessment_score": 0,
            "personality_traits": {},
            "learning_preferences": {},
            "roadmap_progress": {},
            "struggle_history": [],
            "interaction_count": 0
        }
        
        # Get latest recommendation data
        if self.db and self.db.recommendation_logs is not None:
            recent_rec = await self.db.recommendation_logs.find_one(
                {"student_id": user_id},
                sort=[("generated_at", -1)]
            )
            
            if recent_rec:
                context["weak_areas"] = recent_rec.get("gaps_identified", [])[:5]
                context["strong_areas"] = recent_rec.get("strengths", [])[:3]
                context["last_assessment_score"] = recent_rec.get("assessment_score", 0)
                context["roadmap_progress"] = recent_rec.get("learning_path", {})
                context["target_role"] = recent_rec.get("target_role", "Software Engineer")
        
        # Get improvement tracking history
        if self.db and self.db.improvement_tracking is not None:
            improvements = await self.db.improvement_tracking.find(
                {"user_id": user_id}
            ).sort("recorded_at", -1).limit(10).to_list(10)
        
        if improvements:
            context["recent_progress"] = [
                {
                    "skill": imp.get("skill"),
                    "improvement": imp.get("score_change"),
                    "date": imp.get("recorded_at")
                }
                for imp in improvements
            ]
            # Calculate learning streak
            if len(improvements) >= 2:
                context["learning_streak"] = len(improvements)
        
        # Get conversation history for personality insights
        if self.db and self.db.mentor_conversations is not None:
            recent_convos = await self.db.mentor_conversations.find(
                {"user_id": user_id}
            ).sort("timestamp", -1).limit(20).to_list(20)
        else:
            recent_convos = []
        
        if recent_convos:
            context["interaction_count"] = len(recent_convos)
            # Analyze struggle patterns
            struggle_keywords = ["stuck", "confused", "help", "don't understand", "hard", "difficult"]
            struggles = [
                c.get("user_message", "") 
                for c in recent_convos 
                if any(kw in c.get("user_message", "").lower() for kw in struggle_keywords)
            ]
            context["struggle_history"] = struggles[:5]
            
            # Determine personality traits from conversation patterns
            total_messages = sum(len(c.get("user_message", "")) for c in recent_convos)
            avg_length = total_messages / max(len(recent_convos), 1)
            context["personality_traits"] = {
                "communication_style": "detailed" if avg_length > 100 else "concise" if avg_length < 30 else "balanced",
                "engagement_level": "high" if len(recent_convos) > 10 else "moderate" if len(recent_convos) > 3 else "new",
                "needs_encouragement": len(struggles) > 2
            }
        
        return context
    
    async def _load_conversation_history(
        self,
        user_id: str,
        session_id: str,
        limit: int = 10
    ) -> List[Dict[str, str]]:
        """Load recent conversation history"""
        
        if not self.db or self.db.mentor_conversations is None:
            return []

        conversations = await self.db.mentor_conversations.find({
            "user_id": user_id,
            "session_id": session_id
        }).sort("timestamp", -1).limit(limit).to_list(limit)
        
        # Reverse to get chronological order
        conversations.reverse()
        
        history = []
        for conv in conversations:
            history.append({"role": "user", "content": conv.get("user_message", "")})
            history.append({"role": "assistant", "content": conv.get("mentor_response", "")})
        
        return history
    
    async def _detect_intent(self, message: str) -> str:
        """Detect the intent of the user's message"""
        
        message_lower = message.lower()

        # Small-talk / identity questions should stay conversational and not trigger concept mode.
        small_talk_phrases = [
            "hi", "hii", "hello", "hey", "how are you", "what's up", "whats up",
            "who are you", "what is your name", "what's your name", "your name"
        ]
        if any(phrase == message_lower.strip() or phrase in message_lower for phrase in small_talk_phrases):
            return "general"
        
        # Interview PRACTICE triggers - only when user explicitly wants mock/practice
        # Must have explicit action words, not just mentioning "interview"
        practice_keywords = ["mock interview", "practice interview", "quiz me", "test me", "ask me a question", 
                           "give me a question", "interview me", "let's practice", "start interview"]
        if any(kw in message_lower for kw in practice_keywords):
            return "interview_practice"
        
        # Concept explanation triggers
        explain_keywords = ["explain", "what is", "how does", "help me understand", "tell me about", "difference between"]
        if any(kw in message_lower for kw in explain_keywords):
            return "concept_explanation"
        
        # Career guidance triggers - includes general interview questions/advice
        career_keywords = ["career", "job", "company", "salary", "role", "position", "interview", "resume", 
                          "prepare", "learn", "study", "roadmap", "skills", "getting hired"]
        if any(kw in message_lower for kw in career_keywords):
            return "career_guidance"
        
        # Progress check triggers
        progress_keywords = ["progress", "how am i doing", "my score", "improvement", "status"]
        if any(kw in message_lower for kw in progress_keywords):
            return "progress_check"
        
        # Motivation triggers
        motivation_keywords = ["demotivated", "stressed", "worried", "scared", "nervous", "can't do", "give up", "help me stay"]
        if any(kw in message_lower for kw in motivation_keywords):
            return "motivation"
        
        return "general"
    
    async def _handle_interview_practice(
        self,
        message: str,
        student_context: Dict[str, Any],
        history: List[Dict[str, str]]
    ) -> Dict[str, Any]:
        """Handle interview practice requests"""
        
        # Determine if this is starting new practice or continuing
        is_answering = any("here's a question" in msg.get("content", "").lower() 
                          for msg in history[-2:] if msg.get("role") == "assistant")
        
        if is_answering:
            # Student is answering a previous question - evaluate
            return await self._evaluate_interview_answer(message, history, student_context)
        else:
            # Generate a new interview question
            return await self._generate_interview_question(student_context)
    
    async def _generate_interview_question(
        self,
        student_context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generate a contextual interview question"""
        
        target_role = student_context.get("target_role", "Software Engineer")
        weak_areas = student_context.get("weak_areas", ["Data Structures", "Algorithms"])
        
        # Focus on weak areas if available
        focus_area = weak_areas[0] if weak_areas else "general programming"
        
        # Always use dynamic AI generation
        response = await self.internal_ai.generate_interview_question(
            topic=focus_area,
            difficulty="medium",
            student_context=student_context
        )
        
        return {
            "message": f"Let's practice! Here's a question for you:\n\n{response}\n\n*Take your time and answer when ready. I'll provide feedback on your response.*",
            "suggestions": ["Skip this question", "Give me a hint", "Easier question please"],
            "follow_up_questions": []
        }
    
    async def _evaluate_interview_answer(
        self,
        answer: str,
        history: List[Dict[str, str]],
        student_context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Evaluate student's interview answer"""
        
        # Find the question from history
        question = ""
        for msg in reversed(history):
            if "Interview Question" in msg.get("content", ""):
                question = msg["content"]
                break
        
        # Always use dynamic AI evaluation
        response = await self.internal_ai.evaluate_answer(
            question=question,
            answer=answer,
            topic=student_context.get('target_role', 'Software Engineering')
        )
        
        return {
            "message": response + "\n\n*Would you like another question, or shall we discuss this topic more?*",
            "suggestions": ["Another question", "Explain this concept", "Move to different topic"],
            "follow_up_questions": ["Can you explain that concept more?", "What resources should I study?"]
        }
    
    async def _handle_concept_explanation(
        self,
        message: str,
        student_context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Handle concept explanation requests"""
        
        # Search for relevant content in knowledge base
        relevant_content = await self.vector_store.search_by_text(
            VectorStore.INDEX_QUESTIONS,
            message,
            top_k=3
        )
        
        # Always use dynamic AI for concept explanation
        response = await self.internal_ai.explain_concept(
            concept=message,
            student_level=student_context.get('skill_level', 'Intermediate'),
            depth="detailed"
        )
        
        # Get related resources
        resources = await self.vector_store.find_resources_for_skill(
            message.split()[-1] if message else "programming",  # Simple extraction
            top_k=2
        )
        
        return {
            "message": response,
            "suggestions": ["Give me practice problems", "Explain with example", "Interview questions on this"],
            "resources": [
                {"title": r.get('metadata', {}).get('title', ''), "url": r.get('metadata', {}).get('url', '')}
                for r_list in resources.values() 
                for r in r_list[:1]
            ],
            "follow_up_questions": ["What are common mistakes with this?", "How is this asked in interviews?"]
        }
    
    async def _handle_career_guidance(
        self,
        message: str,
        student_context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Handle career guidance requests - always uses dynamic AI"""
        
        target_role = student_context.get("target_role", "Software Engineer")
        weak_areas = student_context.get("weak_areas", [])
        
        # Always use dynamic AI for career guidance
        response = await self.internal_ai.chat(
            message=message,
            student_context=student_context,
            temperature=0.6
        )
        
        return {
            "message": response,
            "suggestions": ["Help me with resume", "Mock interview", "Company research tips"],
            "follow_up_questions": ["How do I prepare for system design?", "What projects should I build?"]
        }
    
    async def _handle_progress_check(
        self,
        user_id: str,
        student_context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Handle progress check requests"""
        
        recent_progress = student_context.get("recent_progress", [])
        weak_areas = student_context.get("weak_areas", [])
        
        if recent_progress:
            progress_summary = "\n".join([
                f"- {p['skill']}: +{p['improvement']}% improvement"
                for p in recent_progress[:3]
            ])
        else:
            progress_summary = "No recent assessments found. Take a skill assessment to track your progress!"
        
        message = f"""📊 **Your Progress Report**

**Recent Improvements:**
{progress_summary}

**Areas to Focus:**
{', '.join(weak_areas[:3]) if weak_areas else 'Complete an assessment to identify focus areas'}

**My Observations:**
You're making progress! Consistency is key - keep practicing daily and you'll see continued improvement.

**Next Steps:**
1. Take another assessment to measure growth
2. Focus on your weakest areas first
3. Build a mini-project to apply your learning

*Keep going! Every expert was once a beginner.* 🚀"""
        
        return {
            "message": message,
            "suggestions": ["Take assessment", "Review my recommendations", "What should I focus on?"],
            "follow_up_questions": []
        }
    
    async def _handle_motivation(
        self,
        student_context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Handle motivation and support requests - always uses dynamic AI"""
        
        target_role = student_context.get("target_role", "Software Engineer")
        name = student_context.get("name", "there")
        learning_streak = student_context.get("learning_streak", 0)
        
        # Generate personalized motivation using dynamic AI
        response = await self.internal_ai.chat(
            message=f"I'm feeling demotivated and stressed about my {target_role} preparation journey. Can you help me stay motivated?",
            student_context=student_context,
            temperature=0.8
        )
        
        return {
            "message": response,
            "suggestions": ["I'm ready to continue", "Give me an easy win", "Just chat with me"],
            "follow_up_questions": []
        }
    
    async def _handle_general_chat(
        self,
        message: str,
        student_context: Dict[str, Any],
        history: List[Dict[str, str]]
    ) -> Dict[str, Any]:
        """Handle general conversation with enhanced personalization - always uses dynamic AI"""
        
        # Build enhanced system prompt with student context
        personality = student_context.get("personality_traits", {})
        needs_encouragement = personality.get("needs_encouragement", False)
        communication_style = personality.get("communication_style", "balanced")
        
        # Customize response style based on student personality
        style_hints = []
        if needs_encouragement:
            style_hints.append("This student may need extra encouragement - be supportive and positive")
        if communication_style == "concise":
            style_hints.append("Keep responses shorter and action-focused")
        elif communication_style == "detailed":
            style_hints.append("Provide thorough explanations with examples")
        
        enhanced_context = {
            **student_context,
            "style_hints": style_hints,
            "last_score": student_context.get("last_assessment_score", 0),
            "interaction_history": f"This is interaction #{student_context.get('interaction_count', 0) + 1}"
        }
        
        # Greeting messages should stay brief and conversational.
        greeting_inputs = {"hi", "hii", "hello", "hey", "yo", "hiya"}
        is_greeting = message.strip().lower() in greeting_inputs or len(message.strip()) <= 4

        # Use internal AI for dynamic response generation
        response = await self.internal_ai.chat(
            message=message,
            student_context=enhanced_context,
            conversation_history=history,
            temperature=0.75,
            max_tokens=1000
        )
        
        # Generate context-aware suggestions
        weak_areas = student_context.get("weak_areas", [])
        suggestions = ["Help me study", "Interview practice", "Career advice"]
        
        if weak_areas:
            suggestions.insert(0, f"Help me with {weak_areas[0]}")
        
        if student_context.get("learning_streak", 0) > 3:
            suggestions.append("Check my progress")
        
        return {
            "message": response,
            "suggestions": suggestions[:4],
            "follow_up_questions": self._generate_follow_up_questions(message, student_context)
        }
    
    def _generate_follow_up_questions(
        self,
        message: str,
        student_context: Dict[str, Any]
    ) -> List[str]:
        """Generate contextual follow-up questions"""
        
        questions = []
        weak_areas = student_context.get("weak_areas", [])
        target_role = student_context.get("target_role", "Software Engineer")
        
        # Based on student's weak areas
        if weak_areas:
            questions.append(f"Can you explain {weak_areas[0]} in simple terms?")
        
        # Based on target role
        if "engineer" in target_role.lower():
            questions.append("What's the most common interview question?")
        
        # Based on recent struggles
        if student_context.get("struggle_history"):
            questions.append("What should I do when I feel stuck?")
        
        # Default questions
        if len(questions) < 3:
            questions.extend([
                "Give me a coding problem to practice",
                "What should I focus on today?",
                "How do I improve my chances at interviews?"
            ])
        
        return questions[:3]
    
    async def _save_conversation(
        self,
        user_id: str,
        session_id: str,
        user_message: str,
        mentor_response: str,
        intent: str
    ):
        """Save conversation to database"""
        if not self.db or self.db.mentor_conversations is None:
            logger.warning("⚠️ Skipping conversation save: Database disconnected.")
            return

        await self.db.mentor_conversations.insert_one({
            "user_id": user_id,
            "session_id": session_id,
            "user_message": user_message,
            "mentor_response": mentor_response,
            "intent": intent,
            "timestamp": datetime.utcnow()
        })
    
    async def get_conversation_sessions(
        self,
        user_id: str,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """Get list of conversation sessions for a user"""
        
        pipeline = [
            {"$match": {"user_id": user_id}},
            {"$group": {
                "_id": "$session_id",
                "started_at": {"$min": "$timestamp"},
                "last_message": {"$max": "$timestamp"},
                "message_count": {"$sum": 1}
            }},
            {"$sort": {"last_message": -1}},
            {"$limit": limit}
        ]
        
        sessions = await self.db.mentor_conversations.aggregate(pipeline).to_list(limit)
        
        return [
            {
                "session_id": s["_id"],
                "started_at": s["started_at"],
                "last_message": s["last_message"],
                "message_count": s["message_count"]
            }
            for s in sessions
        ]
    
    async def get_session_history(
        self,
        user_id: str,
        session_id: str
    ) -> List[Dict[str, Any]]:
        """Get full history for a specific session"""
        
        conversations = await self.db.mentor_conversations.find({
            "user_id": user_id,
            "session_id": session_id
        }).sort("timestamp", 1).to_list(100)
        
        return [
            {
                "role": "user",
                "content": conv["user_message"],
                "timestamp": conv["timestamp"]
            } if i % 2 == 0 else {
                "role": "assistant", 
                "content": conv["mentor_response"],
                "timestamp": conv["timestamp"]
            }
            for i, conv in enumerate(conversations)
            for _ in range(2)  # Create both user and assistant entries
        ][::2]  # Simplify - just return formatted conversations
