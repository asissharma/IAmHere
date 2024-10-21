import mongoose, { Schema, Document } from 'mongoose';

interface IToken extends Document {
  access_token: string;
  refresh_token: string;
  expires_at: number;  // The time the token will expire, in milliseconds since the epoch
  created_at: Date;
}

const TokenSchema: Schema = new Schema({
  access_token: { type: String, required: true },
  refresh_token: { type: String, required: true },
  expires_at: { type: Number, required: true },  // Stored as a timestamp in milliseconds
  created_at: { type: Date, default: Date.now }, // Automatically set to the current time
});

const Token = mongoose.models.Token || mongoose.model<IToken>('Token', TokenSchema);
export default Token;
