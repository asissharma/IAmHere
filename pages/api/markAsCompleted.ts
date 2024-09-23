// pages/api/markAsCompleted.ts
import { NextApiRequest, NextApiResponse } from 'next';
import connectToDatabase from './lib/mongodb';
import Topic from './lib/topic';

const markAsCompleted = async (req: NextApiRequest, res: NextApiResponse) => {
  await connectToDatabase();

  if (req.method === 'PATCH') {
    const { topicId } = req.body;

    if (!topicId) {
      return res.status(400).json({ message: 'Topic ID is required' });
    }

    try {
      // Update the topic's completion status
      const updatedTopic = await Topic.findByIdAndUpdate(
        topicId,
        { isCompleted: true },
        { new: true } // Return the updated document
      );

      if (!updatedTopic) {
        return res.status(404).json({ message: 'Topic not found' });
      }

      res.status(200).json(updatedTopic);
    } catch (error) {
      console.error('Error marking topic as completed:', error);
      res.status(500).json({ error: 'Failed to mark topic as completed' });
    }
  } else {
    res.setHeader('Allow', ['PATCH']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

export default markAsCompleted;
