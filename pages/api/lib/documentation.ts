import mongoose, { Document, Schema } from 'mongoose';

// Define the content interface
export interface IContent {
  title?: string;
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
  createdAt: Date; // Adding createdAt to the document interface
}

// Create the schema for the content
const ContentSchema: Schema<IContent> = new Schema({
  type: { 
    type: String,  // Now it's a normal string without enum
    required: true 
  },
  title: { type: String },
  content: { type: String, required: true },
  metadata: {
    level: { type: String },
    source: { type: String },
    generatedAt: { type: Date },
  },
}, { _id: false });  // ContentSchema does not need a separate _id

// Update this line to use Schema.Types.ObjectId and include timestamps
const DocumentSchema: Schema<IDocument> = new Schema({
  topicId: { type: Schema.Types.ObjectId, required: true },
  content: { type: [ContentSchema], required: true },
}, {
  timestamps: true,  // Automatically adds `createdAt` and `updatedAt`
});

// Create the model
const DocumentModel = mongoose.models.Document || mongoose.model<IDocument>('Document', DocumentSchema);

export default DocumentModel;
