import mongoose, { Schema, Document, Model } from 'mongoose';

// Interface for the Topic model
interface ITopic extends Document {
  title: string;
  mainTopic: string;
  difficulty: string;
  category: string;
  resourceUrls?: string[]; // Optional field for resource URLs
  isCompleted: boolean;     // Status of topic completion
  scrapedDataCount?: number; // Number of documents scraped for this topic
  lastScrapedAt?: Date;     // When data was last scraped
}

// Topic schema definition
const topicSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    mainTopic: { type: String, required: true },
    difficulty: { type: String, required: true },
    category: { type: String, required: true },
    resourceUrls: { type: [String], default: [] },
    isCompleted: { type: Boolean, default: false },
    scrapedDataCount: { type: Number, default: 0 }, // New field
    lastScrapedAt: { type: Date, default: null },   // New field
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt fields
    collection: 'topics', // Collection name in MongoDB
  }
);

const Topic: Model<ITopic> = mongoose.models.Topic || mongoose.model<ITopic>('Topic', topicSchema);

export default Topic;
