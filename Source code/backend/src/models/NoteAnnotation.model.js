import mongoose from 'mongoose';

const annotationSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: { type: String, enum: ['highlight', 'note'], default: 'highlight' },
  pageNumber: { type: Number, required: true },
  rects: [{
    x1: Number,
    y1: Number,
    x2: Number,
    y2: Number,
    width: Number,
    height: Number
  }],
  color: { type: String, default: '#ffeb3b' },
  content: { type: String }, // For text notes
  comment: { type: String }, // For comments on highlights
  createdAt: { type: Date, default: Date.now }
});

const noteAnnotationSchema = new mongoose.Schema({
  noteId: {
    type: String,
    required: true,
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  annotations: [annotationSchema],
}, {
  timestamps: true,
});

noteAnnotationSchema.index({ noteId: 1, userId: 1 }, { unique: true });

const NoteAnnotation = mongoose.model('NoteAnnotation', noteAnnotationSchema);

export default NoteAnnotation;
