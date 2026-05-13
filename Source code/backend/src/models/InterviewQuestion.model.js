import mongoose from 'mongoose';

const interviewQuestionSchema = new mongoose.Schema({
  questionId: {
    type: String,
    required: true,
    unique: true,
  },
  category: {
    type: String,
    required: true,
    index: true,
  },
  subSkill: {
    type: String,
    required: true,
    index: true,
  },
  question: {
    type: String,
    required: true,
  },
  answer: {
    type: String,
    required: true,
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard', 'beginner', 'intermediate', 'advanced'],
    required: true,
    index: true,
  },
  keywords: [{
    type: String,
  }],
}, {
  timestamps: true,
});

// Index for filtering
interviewQuestionSchema.index({ category: 1, subSkill: 1, difficulty: 1 });

const InterviewQuestion = mongoose.model('InterviewQuestion', interviewQuestionSchema);

export default InterviewQuestion;
