import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
  noteId: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
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
  summary: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner',
    index: true,
  },
  readTimeMinutes: {
    type: Number,
    default: 5,
  },
  tags: [{
    type: String,
  }],
}, {
  timestamps: true,
});

noteSchema.index({ category: 1, subSkill: 1, difficulty: 1 });
noteSchema.index({ title: 'text', content: 'text', tags: 'text' });

const Note = mongoose.model('Note', noteSchema);

export default Note;
