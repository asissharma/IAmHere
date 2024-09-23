// pages/api/getTopicData.ts
import { NextApiRequest, NextApiResponse } from 'next';
import connectToDatabase from './lib/mongodb';
import Topic from './lib/topic';

const getTopicData = async (req: NextApiRequest, res: NextApiResponse) => {
  await connectToDatabase();

  try {
    const topics = await Topic.find({ isCompleted: false }).limit(2); // Fetch only first two incomplete topics
    console.log(topics);
    res.status(200).json(topics);
  } catch (error) {
    console.error('Error fetching topics:', error);
    res.status(500).json({ error: 'Failed to fetch topics' });
  }
};

export default getTopicData;
