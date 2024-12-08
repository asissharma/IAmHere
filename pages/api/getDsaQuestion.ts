import { NextApiRequest, NextApiResponse } from 'next';
import connectToDatabase from './lib/mongodb';
import Question from './lib/question';

const fetchQuestions = async (req: NextApiRequest, res: NextApiResponse) => {
  await connectToDatabase();

  try {
    const { solved = 'false', numQuestions = 2 } = req.query;

    const numQuestionsLimit = Number(numQuestions);
    
    // Make sure solved is 'false'
    if (solved !== 'false') {
      return res.status(400).json({ error: 'Only unsolved questions can be fetched' });
    }

    let remainingQuestions = numQuestionsLimit;
    const allQuestions = [];
    const difficultyLevels = ['Easy', 'Medium', 'Hard'];

    for (const difficulty of difficultyLevels) {
      if (remainingQuestions <= 0) break;

      // Fetch unsolved questions for the current difficulty level
      const questions = await Question.find({
        isSolved: false,
        difficulty,
      }).limit(remainingQuestions);  // Limit to remaining questions

      allQuestions.push(...questions);
      remainingQuestions -= questions.length;  // Decrease the remaining count
    }

    return res.status(200).json(allQuestions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    return res.status(500).json({ error: 'Failed to fetch questions' });
  }
};

export default fetchQuestions;
