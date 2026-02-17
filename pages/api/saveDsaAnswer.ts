
import { NextApiRequest, NextApiResponse } from 'next';
import connectToDatabase from './lib/mongodb';
import Question from './lib/question';
import DSASolution from './lib/dsaSolution';
import validator from 'validator';

const saveDsaAnswer = async (req: NextApiRequest, res: NextApiResponse) => {
  await connectToDatabase();

  if (req.method === 'POST') {
    try {
      const {
        questionId,
        code,
        solvedBy,
        language = 'javascript',
        timeComplexity,
        spaceComplexity,
        duration = 0
      } = req.body;

      // Sanitize inputs
      // validator.escape might be too aggressive for code (escapes quotes, etc.), simpler to just store as string
      // but if we want XSS protection we should be careful. 
      // For now, let's trust the input but ensure it's a string.
      // const sanitizedCode = validator.escape(code); 
      // ACTUALLY: escaping code ruins it for the editor. We should sanitize on RENDER, not on SAVE.

      if (!questionId || !code) {
        return res.status(400).json({ message: 'Invalid input data' });
      }

      // 1. Get current version count for this question
      const lastSolution = await DSASolution.findOne({ questionId }).sort({ version: -1 });
      const newVersion = (lastSolution?.version || 0) + 1;

      // 2. Save new version to DSASolution
      const newSolution = new DSASolution({
        questionId,
        code,
        language,
        version: newVersion,
        timeComplexity,
        spaceComplexity,
        duration,
        solvedBy
      });
      await newSolution.save();

      // 3. Update Question summary
      const updatedQuestion = await Question.findByIdAndUpdate(
        questionId,
        {
          isSolved: true,
          code: code, // keep latest code in Question for quick access
          solvedBy: solvedBy,
          lastPracticed: new Date(),
          $inc: { timeSpentMinutes: Math.ceil(duration / 60) },
          // We don't auto-update mastery here; seeing the solution doesn't mean mastery.
          // Mastery update should be a separate explicit action or inferred separately.
          // But if it was 'untouched', we can move it to 'attempted' or 'solved'.
        },
        { new: true }
      );

      if (!updatedQuestion) {
        return res.status(404).json({ message: 'Question not found' });
      }

      res.status(200).json({ success: true, version: newVersion, question: updatedQuestion });
    } catch (error) {
      console.error('Error saving DSA answer:', error);
      res.status(500).json({ error: 'Failed to save DSA answer' });
    }
  } else if (req.method === 'GET') {
    // Fetch history for a question
    const { questionId } = req.query;
    if (!questionId) return res.status(400).json({ message: 'Missing questionId' });

    try {
      const history = await DSASolution.find({ questionId }).sort({ version: -1 });
      return res.status(200).json(history);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch history' });
    }
  } else {
    res.setHeader('Allow', ['POST', 'GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

export default saveDsaAnswer;


