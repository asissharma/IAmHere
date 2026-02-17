import { NextApiRequest, NextApiResponse } from 'next';
import connectToDatabase from './lib/mongodb';
import Question from './lib/question';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await connectToDatabase();

  if (req.method === 'GET') {
    try {
      const {
        solved,
        numQuestions,
        topic,
        subtopic,
        pattern,
        mastery,
        mode // 'tree' or 'list' (default)
      } = req.query;

      const query: any = {};

      if (solved === 'false') query.isSolved = false;
      if (solved === 'true') query.isSolved = true;
      if (topic) query.topic = topic;
      if (subtopic) query.subtopic = subtopic;
      if (pattern) query.pattern = pattern;
      if (mastery) query.mastery = mastery;

      // Special mode for Spaced Repetition Queue
      if (req.query.queue === 'true') {
        const now = new Date();
        query.nextReview = { $lte: now };
        query.mastery = { $ne: 'untouched' }; // Only review things we've started
      }

      const limit = Number(numQuestions) || 50;

      const questions = await Question.find(query).limit(limit).sort({ sno: 1 });

      if (mode === 'tree') {
        // Group by Topic -> Subtopic -> Pattern
        const tree: any = {};
        questions.forEach((q: any) => {
          if (!tree[q.topic]) tree[q.topic] = {};
          if (!tree[q.topic][q.subtopic]) tree[q.topic][q.subtopic] = {};
          if (!tree[q.topic][q.subtopic][q.pattern]) tree[q.topic][q.subtopic][q.pattern] = [];
          tree[q.topic][q.subtopic][q.pattern].push(q);
        });
        return res.status(200).json(tree);
      }

      return res.status(200).json(questions);
    } catch (error) {
      console.error('Error fetching questions:', error);
      return res.status(500).json({ error: 'Failed to fetch questions' });
    }
  } else if (req.method === 'POST') {
    try {
      // Create new question
      const { topic, subtopic, pattern, problem, description, difficulty, link, sno } = req.body;

      const newQuestion = new Question({
        sno: Number(sno) || (await Question.countDocuments()) + 1,
        topic,
        subtopic,
        pattern,
        problem,
        description,
        difficulty,
        link
      });

      await newQuestion.save();
      return res.status(201).json({ success: true, question: newQuestion });
    } catch (error) {
      console.error('Error creating question:', error);
      return res.status(500).json({ error: 'Failed to create question' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

export default handler;
