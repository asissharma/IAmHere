import { NextApiRequest, NextApiResponse } from 'next';
import connectToDatabase from './lib/mongodb';
import Question from './lib/question';

const fetchQuestions = async (req: NextApiRequest, res: NextApiResponse) => {
  await connectToDatabase();

  try {
    const { solved = 'false', numQuestions = 2, topic = '' } = req.query;

    // Building the query based on the solved and topic parameters
    const query: any = {};
    
    // If 'solved' is 'true', 'false', or 'all' handle accordingly
    if (solved === 'true') {
      query.isSolved = true;
    } else if (solved === 'false') {
      query.isSolved = false;
    }

    // If a specific topic is provided, filter questions by topic
    if (topic) {
      query.topic = topic;
    }

    // Fetch the desired number of questions (convert to number and limit)
    const questions = await Question.find(query).limit(Number(numQuestions));

    res.status(200).json(questions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
};

export default fetchQuestions;
