import mongoose, { Schema, Document, Model } from 'mongoose';

interface IQuestion extends Document {
  sno: number;                   
  topic: string;                  
  problem: string;                
  difficulty: string;             
  tags: string[];                 
  createdAt: Date;                
  isSolved: boolean;              
  solvedBy: string;               
  code?: string;                  
}

const questionSchema: Schema = new Schema({
  sno: { type: Number, required: true },         
  topic: { type: String, required: true },       
  problem: { type: String, required: true },     
  difficulty: { type: String, default: 'Easy' }, 
  tags: { type: [String], default: [] },         
  createdAt: { type: Date, default: Date.now },  
  isSolved: { type: Boolean, default: false },   
  solvedBy: { type: String, default: '' },       
  code: { type: String, default: '' },           
}, { 
  timestamps: true,
  collection: 'dsa-question'
});

const Question: Model<IQuestion> = mongoose.models.Question || mongoose.model<IQuestion>('Question', questionSchema);

export default Question;
