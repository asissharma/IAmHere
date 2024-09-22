import { NextApiRequest, NextApiResponse } from 'next';
import connectToDatabase from './lib/mongodb';
import Question from './lib/question';
import validator from 'validator';

const saveDsaAnswer = async (req: NextApiRequest, res: NextApiResponse) => {
  await connectToDatabase();

  if (req.method === 'POST') {
    try {
      const { questionId, code, solvedBy } = req.body;

      // Sanitize inputs
      const sanitizedCode = validator.escape(code);
      const sanitizedSolvedBy = validator.escape(solvedBy);
      // Basic validation for the questionId and code
      if (!questionId || !sanitizedCode) {
        return res.status(400).json({ message: 'Invalid input data' });
      }

      // Update the question with new code and mark as solved
      const updatedQuestion = await Question.findByIdAndUpdate(
        questionId,
        {
          isSolved: true,
          code: sanitizedCode,
          solvedBy: sanitizedSolvedBy,
        },
        { new: true } // Return the updated document
      );

      if (!updatedQuestion) {
        return res.status(404).json({ message: 'Question not found' });
      }

      res.status(200).json(updatedQuestion);
    } catch (error) {
      console.error('Error saving DSA answer:', error);
      res.status(500).json({ error: 'Failed to save DSA answer' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

export default saveDsaAnswer;
