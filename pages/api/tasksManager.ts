import { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "./lib/mongodb";
import Task from "./lib/task";
import TaskCompletion from "./lib/taskCompletion";
import mongoose from "mongoose";

const getTodayDate = () => new Date().toISOString().split("T")[0];
const getTodayDay = () => new Date().toLocaleString("en-us", { weekday: "long" });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectToDatabase();
  const { method } = req;

  switch (method) {
    case "POST":
      return handlePost(req, res);
    case "GET":
      return handleGet(req, res);
    default:
      return res.status(405).json({ message: "Method not allowed" });
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  const { action } = req.body;

  switch (action) {
    case "createTask":
      return createTask(req, res);
    case "completeTask":
      return completeTask(req, res);
    default:
      return res.status(400).json({ message: "Invalid action" });
  }
}

async function createTask(req: NextApiRequest, res: NextApiResponse) {
  const { taskName, description, frequency, dayOfWeek, date, userId, priority } = req.body;

  if (!taskName || !description || !frequency || !userId) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  if (frequency === "once" && !date) {
    return res.status(400).json({ message: "Date is required for one-time tasks" });
  }

  if (frequency === "weekly" && !dayOfWeek) {
    return res.status(400).json({ message: "Day of the week is required for weekly tasks" });
  }

  try {
    const newTask = await Task.create({
      taskName,
      description,
      frequency,
      dayOfWeek: frequency === "weekly" ? dayOfWeek : null,
      date: frequency === "once" ? date : null,
      userId,
      priority: priority || "medium", // default to 'medium' priority
    });

    return res.status(201).json({ taskId: newTask._id, message: "Task created successfully" });
  } catch (error : any) {
    console.error(error);
    return res.status(500).json({ message: "Error creating task", error: error.message });
  }
}

async function completeTask(req: NextApiRequest, res: NextApiResponse) {
  const { taskId, userId, completionDate } = req.body;

  if (!taskId || !userId) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    // Check if task is already completed today
    const existingCompletion = await TaskCompletion.findOne({ taskId, userId, completionDate: getTodayDate() });
    if (existingCompletion) {
      return res.status(400).json({ message: "Task already completed today" });
    }

    await TaskCompletion.create({
      taskId,
      userId,
      completionDate: completionDate || getTodayDate(),
      isCompleted: true,
    });

    return res.status(200).json({ message: "Task marked as completed" });
  } catch (error : any) {
    console.error(error);
    return res.status(500).json({ message: "Error completing task", error: error.message });
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ message: "Invalid or missing user ID" });
  }

  try {
    const today = "2024-12-09";
    const todayDay = "Monday";
    console.log(today);
    const tasks = await Task.find({
      userId,
      $or: [
        { frequency: "daily" },
        { frequency: "weekly", dayOfWeek: todayDay },
        { frequency: "monthly", date: today.split("-").slice(0, 2).join("-") },
        { frequency: "once", date: today },
      ],
    });

    const completedTasks = await TaskCompletion.find({
      userId,
      completionDate: today,
    }).select("taskId");

    const completedTaskIds = new Set(completedTasks.map((task) => task.taskId.toString()));

    const taskList = tasks.map((task: any) => ({
      _id: task._id,
      taskName: task.taskName,
      description: task.description,
      isCompleted: completedTaskIds.has(task._id.toString()),
      priority: task.priority,
      frequency: task.frequency,
    }));

    return res.status(200).json(taskList);
  } catch (error : any) {
    console.error(error);
    return res.status(500).json({ message: "Error fetching tasks", error: error.message });
  }
}
