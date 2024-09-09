import mongoose, { Schema, Document, Model } from 'mongoose';

interface IFile extends Document {
  url: string;       
  filename: string;  
  mimetype: string;  
  created_at: Date;  
}

const fileSchema: Schema = new Schema({
  url: { type: String, required: true }, 
  filename: { type: String, required: true }, 
  mimetype: { type: String, required: true }, 
  created_at: { type: Date, default: Date.now }, 
});

const File: Model<IFile> = mongoose.models.File || mongoose.model<IFile>('File', fileSchema);

export default File;
