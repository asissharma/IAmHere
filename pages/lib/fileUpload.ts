import mongoose, { Schema, Document, Model } from 'mongoose';

// Define an interface for the file document
interface IFile extends Document {
  url: string;       // URL of the uploaded file
  filename: string;  // Original filename
  mimetype: string;  // MIME type of the file
  created_at: Date;  // Timestamp of when the file was uploaded
}

// Define the schema for the file model
const fileSchema: Schema = new Schema({
  url: { type: String, required: true }, // URL where the file is stored
  filename: { type: String, required: true }, // Original filename
  mimetype: { type: String, required: true }, // MIME type (e.g., image/jpeg)
  created_at: { type: Date, default: Date.now }, // Timestamp when the file was uploaded
});

// Create and export the model
const File: Model<IFile> = mongoose.models.File || mongoose.model<IFile>('File', fileSchema);

export default File;
