import mongoose, { Schema, Document } from 'mongoose';

// Define the interface for a Book document
export interface IBook extends Document {
    title?: string;        // Title is optional
    author?: string;       // Author is optional
    publishedDate?: Date;  // Published date is optional
    genre?: string;        // Genre is optional
    description?: string;  // Description is optional
    content: string;       // Content is required
    createdAt?: Date;      // Created at is optional
    updatedAt?: Date;      // Updated at is optional
  }
  
  // Create the Book schema
  const BookSchema: Schema = new Schema(
    {
      title: {
        type: String,
        required: true, // Title is required
        trim: true,
      },
      author: {
        type: String,
        trim: true,
      },
      publishedDate: {
        type: Date,
      },
      genre: {
        type: String,
        trim: true,
      },
      description: {
        type: String,
        trim: true,
      },
      content: {
        type: String,
        required: true, // Content is required
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
      updatedAt: {
        type: Date,
        default: Date.now,
      },
    },
    { timestamps: true } // Automatically manage createdAt and updatedAt
  );
  
  // Create and export the model
  const BookModel =mongoose.models.Book || mongoose.model<IBook>('Book', BookSchema );
  export default BookModel;