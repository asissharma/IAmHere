import { NextApiRequest, NextApiResponse } from 'next';
import connectToDatabase from './lib/mongodb';
import Question from './lib/question';

export default async function getSolvedDsaQuestions(req: NextApiRequest, res: NextApiResponse) {
  await connectToDatabase();

  if (req.method === 'GET') {
    try {
      const { limit = 10, skip = 0 } = req.query;

      // Validate and sanitize query parameters
      const sanitizedLimit = Number(limit) > 0 ? Number(limit) : 10;
      const sanitizedSkip = Number(skip) >= 0 ? Number(skip) : 0;

      // Fetch the recently solved questions
      const solvedQuestions = await Question.find({ isSolved: true })
        .limit(sanitizedLimit)
        .skip(sanitizedSkip)
        .sort({ updatedAt: -1 });

      return res.status(200).json(solvedQuestions);
    } catch (error) {
      console.error('Error retrieving solved DSA questions:', error);
      return res.status(500).json({ message: 'Internal Server Error', error });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}
