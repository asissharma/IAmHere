import mongoose, { Schema, Document, Model } from 'mongoose';

interface IQuestion extends Document {
  sno: number;
  topic: string;
  subtopic: string;
  pattern: string;
  problem: string;
  description: string;
  difficulty: string;
  link: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  isSolved: boolean;
  solvedBy: string;
  code?: string;
  mastery: string;
  patterns: string[];
  lastPracticed?: Date;
  nextReview?: Date;
  inlineNotes?: string;
  linkedNoteIds: string[];
  timeSpentMinutes: number;
}

const questionSchema: Schema = new Schema({
  sno: { type: Number, required: true },
  topic: { type: String, required: true },
  subtopic: { type: String, default: '' },
  pattern: { type: String, default: '' },
  problem: { type: String, required: true },
  description: { type: String, default: '' },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Easy' },
  link: { type: String, default: '' },
  tags: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  isSolved: { type: Boolean, default: false },
  solvedBy: { type: String, default: '' },
  code: { type: String, default: '' },
  mastery: { type: String, enum: ['untouched', 'attempted', 'solved', 'understood', 'mastered'], default: 'untouched' },
  patterns: { type: [String], default: [] },
  lastPracticed: { type: Date },
  nextReview: { type: Date },
  inlineNotes: { type: String, default: '' },
  linkedNoteIds: { type: [String], default: [] },
  timeSpentMinutes: { type: Number, default: 0 },
}, {
  timestamps: true,
  collection: 'dsa-question'
});


const Question: Model<IQuestion> = mongoose.models.Question || mongoose.model<IQuestion>('Question', questionSchema);

export default Question;
