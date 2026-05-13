import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  moduleId: {
    type: String,
    required: true,
    index: true, // Critical for performance
  },
  field: {
    type: String,
    required: true,
  },
  targetRole: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['mcq', 'coding', 'short_answer'],
    default: 'mcq',
  },
  questionText: {
    type: String,
    required: true,
  },
  options: [{
    type: String,
  }],
  correctAnswer: {
    type: mongoose.Schema.Types.Mixed, // Can be index for MCQ or string for short answer
  },
  explanation: {
    type: String,
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard', 'advanced'],
    default: 'medium',
  },
  topics: [{
    type: String,
  }],
  companyTags: [{
    type: String,
  }],
  category: {
    type: String,
    enum: ['foundational', 'practical'],
    default: 'foundational',
    index: true,
  },
  metadata: {
    generatedBy: { type: String, default: 'groq' },
    modelUsed: { type: String, default: 'llama-3.1-70b-versatile' },
    seed: { type: String },
  }
}, {
  timestamps: true,
});

// Compound index for random sampling within a specific module
questionSchema.index({ moduleId: 1, difficulty: 1 });

const Question = mongoose.model('Question', questionSchema);

export default Question;
