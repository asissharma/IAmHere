import { NextApiRequest, NextApiResponse } from 'next';
import connectToDatabase from './lib/mongodb';
import Question from './lib/question';

const getProgress = async (req: NextApiRequest, res: NextApiResponse) => {
  await connectToDatabase();
  
  try {
    const easySolved = await Question.countDocuments({ difficulty: 'Easy', isSolved: true });
    const mediumSolved = await Question.countDocuments({ difficulty: 'Medium', isSolved: true });
    const hardSolved = await Question.countDocuments({ difficulty: 'Hard', isSolved: true });

    res.status(200).json({
      easy: easySolved,
      medium: mediumSolved,
      hard: hardSolved
    });
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
};

export default getProgress;
