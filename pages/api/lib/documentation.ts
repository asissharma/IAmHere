import mongoose, { Schema, Document, Model } from 'mongoose';

interface IDocument extends Document {
    topicId: string;     // Reference to the related topic
    type: 'ai' | 'note'; // Type of document (AI response or user note)
    content: string;     // The actual content (markdown or text)
  }
  
  const documentSchema: Schema = new Schema({
    topicId: { type: Schema.Types.ObjectId, ref: 'Topic', required: true },
    type: { type: String, enum: ['ai', 'note'], required: true },
    content: { type: String, required: true },
  }, {
    timestamps: true,
    collection: 'documents'
  });
  
  const DocumentModel: Model<IDocument> = mongoose.models.Document || mongoose.model<IDocument>('Document', documentSchema);
  
  export default DocumentModel;
  