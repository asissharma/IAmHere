import mongoose, { Schema, Document, Model } from 'mongoose';
interface IText extends Document {
  textId: string;  // Ensure textId is part of the schema
  content: string;
}

const TextSchema: Schema = new Schema({
  textId: { type: String, required: true, unique: true }, // Make textId unique
  content: { type: String, required: true },
});

const Text: Model<IText> = mongoose.models.Text || mongoose.model<IText>('Text', TextSchema);

export default Text;
