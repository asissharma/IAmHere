import mongoose, { Schema, Document, model, Model, Types } from "mongoose";

export interface ITaskCompletion extends Document {
  taskId: Types.ObjectId;
  userId: string;
  completionDate: string;
  isCompleted: boolean;
}

const TaskCompletionSchema = new Schema<ITaskCompletion>({
  taskId: { type: Schema.Types.ObjectId, ref: "Task", required: true },
  userId: { type: String, required: true },
  completionDate: { type: String, required: true },
  isCompleted: { type: Boolean, default: false }, // Track whether the task is completed
});

const TaskCompletion: Model<ITaskCompletion> =
  mongoose.models.TaskCompletion || model<ITaskCompletion>("TaskCompletion", TaskCompletionSchema);

export default TaskCompletion;
