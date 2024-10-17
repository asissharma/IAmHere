import mongoose, { Document, Schema } from 'mongoose';

// Define the content interface
export interface IContent {
  type: string;  // Removed the enum and made it a string
  content: string;
  metadata?: {
    level?: string;
    source?: string;
    generatedAt?: Date;
  };
}

// Define the main document interface
export interface IDocument extends Document {
  topicId: mongoose.Types.ObjectId;
  content: IContent[];
}

// Create the schema for the document
const ContentSchema: Schema<IContent> = new Schema({
  type: { 
    type: String,  // Now it's a normal string without enum
    required: true 
  },
  content: { type: String, required: true },
  metadata: {
    level: { type: String },
    source: { type: String },
    generatedAt: { type: Date },
  },
});

// Update this line to use Schema.Types.ObjectId
const DocumentSchema: Schema<IDocument> = new Schema({
  topicId: { type: Schema.Types.ObjectId, required: true },
  content: { type: [ContentSchema], required: true },
});

// Create the model
const DocumentModel = mongoose.models.Document || mongoose.model<IDocument>('Document', DocumentSchema);

export default DocumentModel;
