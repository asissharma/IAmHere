import mongoose, { Schema, Document, Model } from 'mongoose';

// Interface for the Notebook document
interface INotebook extends Document {
  nodeId: string;
  title: string;
  type: "folder" | "file"; // Restrict to 'folder' or 'file'
  resourceType?: "text" | "pdf" | "url" | "quiz"|""; // Specific to files
  content?: string; // For text content, PDFs, or external links
  progress?: number; // For tracking completion (0-100)
  parentId?: string | null; // Parent ID for hierarchical structure
  generated?: false;
}

// Schema definition for the notebook model
const NotebookSchema: Schema = new Schema(
  {
    nodeId: {
      type: String,
      unique: true,
      default: () => new mongoose.Types.ObjectId().toString(),
    },
    title: { type: String, required: true },
    type: { type: String, required: true, enum: ["folder", "file"] },
    resourceType: {
      type: String,
      enum: ["text", "pdf", "url", "quiz",""],
    },
    content: { type: String }, // Store text, URLs, or relevant file links
    progress: { type: Number, min: 0, max: 100, default: 0 }, // Default progress is 0
    parentId: { type: String, default: null }, // Null for root-level nodes
    generated: { type: Boolean, default: false }, // Null for root-level nodes
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

// Create or reuse the existing model
const Notebook: Model<INotebook> =
  mongoose.models.Notebook || mongoose.model<INotebook>("Notebook", NotebookSchema);

export default Notebook;
