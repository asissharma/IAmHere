import mongoose, { Schema, Document, Model } from 'mongoose';

// Interface for the Notebook document
interface INotebook extends Document {
  nodeId: string;
  title: string;
  type: "syllabus" | "folder" | "file"; // Restrict to 'folder' or 'file'
  resourceType?: "text" | "pdf" | "url" | "quiz" | "fileAnalysis"; // Specific to files
  content?: string; // For text content, PDFs, or external links
  progress?: number; // For tracking completion (0-100)
  parentId?: string | null; // Parent ID for hierarchical structure
  generated?: boolean;

  // New Enhanced Fields
  tags: string[];          // User-defined tags
  pinned: boolean;         // Pin to top of list
  lastViewed: Date;        // Track recent access
  aiSummary?: string;      // Auto-generated summary
  createdAt: Date;
  updatedAt: Date;

  // Import Metadata
  sourceFile?: string;
  importedAt?: Date;
  linkedResources?: { type: string; id: string; title: string }[]; // Generic linked resources
  externalLinks?: { type: string; url: string; label?: string }[];
  metadata?: {
    author?: string;
    difficulty?: string;
    estimatedTime?: string;
    [key: string]: any;
  };
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
    type: { type: String, required: true, enum: ["syllabus", "folder", "file"] },
    resourceType: {
      type: String,
      enum: ["text", "pdf", "url", "quiz", "fileAnalysis"],
    },
    content: { type: String }, // Store text, URLs, or relevant file links
    progress: { type: Number, min: 0, max: 100, default: 0 }, // Default progress is 0
    parentId: { type: String, default: null }, // Null for root-level nodes
    generated: { type: Boolean, default: false },

    // New Fields
    tags: { type: [String], default: [] },
    pinned: { type: Boolean, default: false },
    lastViewed: { type: Date, default: Date.now },
    aiSummary: { type: String },

    // Import Metadata
    // Import Metadata
    sourceFile: { type: String },
    importedAt: { type: Date },
    linkedResources: [{
      type: { type: String, required: true },
      id: { type: String, required: true },
      title: { type: String, default: '' }
    }],

    externalLinks: [{
      type: { type: String }, // e.g., 'youtube', 'article'
      url: { type: String },
      label: { type: String }
    }],
    metadata: {
      author: String,
      difficulty: String,
      estimatedTime: String
    },

    // Engagement
    studyTime: { type: Number, default: 0 }, // Seconds
    lastStudied: { type: Date }
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

// Create or reuse the existing model
const Notebook: Model<INotebook> =
  mongoose.models.Notebook || mongoose.model<INotebook>("Notebook", NotebookSchema);

export default Notebook;
