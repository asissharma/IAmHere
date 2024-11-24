import mongoose, { Schema, Document, Model } from 'mongoose';

// Interface for the Notebook document
interface INotebook extends Document {
  nodeId: string; // Ensure this is always provided
  title: string;
  type: "folder" | "file"; // Restrict to folder or file types
  content?: string;
  parentId?: string | null; // Parent ID for hierarchical structure, null for root
}

// Schema definition for the notebook model
const NotebookSchema: Schema = new Schema(
  {
    nodeId: { type: String, unique: true, default: () => new mongoose.Types.ObjectId().toString() },
    title: { type: String, required: true },
    type: { type: String, required: true, enum: ["folder", "file"] }, // Restrict to 'folder' or 'file'
    content: { type: String }, // Only files will have content
    parentId: { type: String, default: null }, // Root-level node will have null parentId
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

// Create or reuse the existing model
const Notebook: Model<INotebook> = mongoose.models.Notebook || mongoose.model<INotebook>("Notebook", NotebookSchema);

export default Notebook;
