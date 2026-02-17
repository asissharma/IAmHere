import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDSASolution extends Document {
    questionId: mongoose.Types.ObjectId;
    code: string;
    language: string;
    version: number;
    timeComplexity?: string;
    spaceComplexity?: string;
    duration?: number;
    solvedBy?: string;
    createdAt: Date;
}

const dsaSolutionSchema: Schema = new Schema({
    questionId: { type: Schema.Types.ObjectId, ref: 'Question', required: true },
    code: { type: String, required: true },
    language: { type: String, default: 'javascript' },
    version: { type: Number, required: true },
    timeComplexity: { type: String },
    spaceComplexity: { type: String },
    duration: { type: Number }, // in seconds
    solvedBy: { type: String },
}, {
    timestamps: { createdAt: true, updatedAt: false }, // Immutable versions
    collection: 'dsa-solutions'
});

// Compound index for efficient version querying
dsaSolutionSchema.index({ questionId: 1, version: -1 });

const DSASolution: Model<IDSASolution> = mongoose.models.DSASolution || mongoose.model<IDSASolution>('DSASolution', dsaSolutionSchema);

export default DSASolution;
