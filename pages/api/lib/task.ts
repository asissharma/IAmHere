import mongoose, { Schema, Document, model, Model } from "mongoose";

export interface ITask extends Document {
  taskName: string;
  description: string;
  frequency: "daily" | "weekly" | "monthly" | "once";
  dayOfWeek?: string;
  date?: string;
  userId: string;
  priority: "low" | "medium" | "high";
}

const TaskSchema = new Schema<ITask>({
  taskName: { type: String, required: true },
  description: { type: String, required: true },
  frequency: { type: String, required: true, enum: ["daily", "weekly", "monthly", "once"] },
  dayOfWeek: { type: String, required: function () { return this.frequency === "weekly"; } },
  date: { type: String, required: function () { return this.frequency === "once"; } },
  userId: { type: String, required: true },
  priority: { type: String, default: "medium", enum: ["low", "medium", "high"] },
});

const Task: Model<ITask> = mongoose.models.Task || model<ITask>("Task", TaskSchema);

export default Task;
