import mongoose, { Schema, Document, Model } from 'mongoose';

interface ITopic extends Document {
  title: string;
  mainTopic: string;
  difficulty: string;
  category: string;
  resourceUrl?: string;
  isCompleted: boolean; // Add this field
}

const topicSchema: Schema = new Schema({
  title: { type: String, required: true },
  mainTopic: { type: String, required: true },
  difficulty: { type: String, required: true },
  category: { type: String, required: true },
  resourceUrl: { type: String, default: '' },
  isCompleted: { type: Boolean, default: false }, // Default to false
}, {
  timestamps: true,
  collection: 'topics',
});

const Topic: Model<ITopic> = mongoose.models.Topic || mongoose.model<ITopic>('Topic', topicSchema);

export default Topic;
