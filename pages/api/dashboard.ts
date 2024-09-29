// pages/api/dashboard.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import mongoose from 'mongoose';
import Question from './lib/question'; // Adjust the import path as necessary
import Topic from './lib/topic';
import DocumentModel from './lib/documentation'; // Adjust the import path as necessary
import connectToDatabase from './lib/mongodb';

// Connect to MongoDB


interface Metric {
  title: string;
  value: number;
}

interface Insight {
  message: string;
}

interface Notification {
  id: string;
  message: string;
  timestamp: string;
}

interface DashboardResponse {
  metrics: Metric[];
  insights: Insight[];
  notifications: Notification[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DashboardResponse | { message: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    await connectToDatabase();

    // Fetch metrics
    const solvedProblems = await Question.countDocuments({ isSolved: true });
    const totalQuestions = await Question.countDocuments();
    const completedTopics = await Topic.countDocuments({ isCompleted: true });
    const totalNotes = await DocumentModel.countDocuments({ type: 'note' });

    // Constructing metrics
    const metrics: Metric[] = [
      { title: 'Notes Taken', value: totalNotes },
      { title: 'DSA Problems Solved', value: solvedProblems },
      { title: 'Topics Completed', value: completedTopics },
      { title: 'Total DSA Problems', value: totalQuestions },
    ];

    // Generating insights
    const insights: Insight[] = [];
    if (solvedProblems === 0) {
      insights.push({ message: "You haven't solved any DSA problems recently, try a new challenge!" });
    }

    const totalTopics = await Topic.countDocuments();
    const completionRate = totalTopics ? (completedTopics / totalTopics) * 100 : 0;
    insights.push({ message: `You have completed ${completionRate.toFixed(2)}% of your topics.` });

    // Recent notes
    const recentNotes = await DocumentModel.find({ type: 'note' }).sort({ createdAt: -1 }).limit(5);
    if (recentNotes.length > 0) {
      insights.push({ message: `You took ${recentNotes.length} notes recently.` });
    }

    // Notifications
    const notifications: Notification[] = [];
    const uncompletedTopics = await Topic.countDocuments({ isCompleted: false });
    if (uncompletedTopics > 0) {
      notifications.push({ id: '1', message: `You have ${uncompletedTopics} topics that are not completed!`, timestamp: new Date().toISOString() });
    }

    // Check for new problems
    const newProblems = await Question.find({ createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }); // Check for new problems added in the last week
    if (newProblems.length > 0) {
      notifications.push({ id: '2', message: 'New DSA problems have been added! Check them out.', timestamp: new Date().toISOString() });
    }

    res.status(200).json({ metrics, insights, notifications });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
