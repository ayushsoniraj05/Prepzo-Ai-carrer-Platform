import mongoose from 'mongoose';

const moduleSeederSchema = new mongoose.Schema({
  moduleId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  field: {
    type: String,
    required: true,
  },
  targetRole: {
    type: String,
    required: true,
  },
  questionCount: {
    type: Number,
    default: 0,
  },
  topics: {
    type: [String],
    default: [],
  },
  category: {
    type: String,
    enum: ['foundational', 'practical'],
    default: 'foundational',
    index: true,
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'completed', 'failed'],
    default: 'pending',
  },
  priority: {
    type: Number,
    default: 0, // Higher number = higher priority (e.g., student waiting)
  },
  lastSeededAt: {
    type: Date,
  },
  errorLog: {
    type: String,
  },
  retryCount: {
    type: Number,
    default: 0,
  }
}, {
  timestamps: true,
});

const ModuleSeeder = mongoose.model('ModuleSeeder', moduleSeederSchema);

export default ModuleSeeder;
