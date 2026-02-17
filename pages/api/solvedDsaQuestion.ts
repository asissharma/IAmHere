import { NextApiRequest, NextApiResponse } from 'next';
import connectToDatabase from './lib/mongodb';
import Question from './lib/question';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectToDatabase();

  if (req.method === 'GET') {
    try {
      const { limit = 10, skip = 0 } = req.query;
      const sanitizedLimit = Number(limit) > 0 ? Number(limit) : 10;
      const sanitizedSkip = Number(skip) >= 0 ? Number(skip) : 0;

      // Fetch recently practiced questions (not just solved)
      const questions = await Question.find({
        $or: [{ isSolved: true }, { mastery: { $ne: 'untouched' } }]
      })
        .limit(sanitizedLimit)
        .skip(sanitizedSkip)
        .sort({ lastPracticed: -1, updatedAt: -1 });

      return res.status(200).json(questions);
    } catch (error) {
      console.error('Error retrieving DSA questions:', error);
      return res.status(500).json({ message: 'Internal Server Error', error });
    }
  } else if (req.method === 'POST') {
    try {
      const { questionId, mastery, pattern, inlineNotes } = req.body;

      if (!questionId) return res.status(400).json({ message: 'Missing questionId' });

      // Spaced Repetition Logic (Fibonacci sequences for days)
      // untouched -> 0
      // attempted -> 1 day
      // solved -> 3 days
      // understood -> 7 days
      // mastered -> 30 days
      let daysToAdd = 0;
      if (mastery === 'attempted') daysToAdd = 1;
      if (mastery === 'solved') daysToAdd = 3;
      if (mastery === 'understood') daysToAdd = 7;
      if (mastery === 'mastered') daysToAdd = 30;

      const nextReview = new Date();
      nextReview.setDate(nextReview.getDate() + daysToAdd);

      const updateFields: any = {
        lastPracticed: new Date(),
        nextReview: nextReview
      };

      if (mastery) updateFields.mastery = mastery;
      if (pattern) updateFields.$addToSet = { patterns: pattern }; // Add pattern if provided
      if (inlineNotes) updateFields.inlineNotes = inlineNotes;

      const updatedQuestion = await Question.findByIdAndUpdate(
        questionId,
        updateFields,
        { new: true }
      );

      return res.status(200).json({ success: true, question: updatedQuestion });
    } catch (error) {
      console.error('Error updating DSA status:', error);
      return res.status(500).json({ message: 'Failed to update status' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}
