import { NextApiRequest, NextApiResponse } from 'next';
import connectToDatabase from './lib/mongodb';
import Question from './lib/question';

const getProgress = async (req: NextApiRequest, res: NextApiResponse) => {
  await connectToDatabase();

  try {
    const stats = await Question.aggregate([
      {
        $facet: {
          byDifficulty: [
            { $match: { isSolved: true } },
            { $group: { _id: '$difficulty', count: { $sum: 1 } } }
          ],
          byMastery: [
            { $group: { _id: '$mastery', count: { $sum: 1 } } }
          ],
          totalSolved: [
            { $match: { isSolved: true } },
            { $count: 'count' }
          ],
          totalQuestions: [
            { $count: 'count' }
          ]
        }
      }
    ]);

    const result = stats[0];

    // Transform into easier format
    const easy = result.byDifficulty.find((d: any) => d._id === 'Easy')?.count || 0;
    const medium = result.byDifficulty.find((d: any) => d._id === 'Medium')?.count || 0;
    const hard = result.byDifficulty.find((d: any) => d._id === 'Hard')?.count || 0;
    const totalSolved = result.totalSolved[0]?.count || 0;
    const totalQuestions = result.totalQuestions[0]?.count || 0;

    const masteryCounts: any = {
      untouched: 0,
      attempted: 0,
      solved: 0,
      understood: 0,
      mastered: 0
    };
    result.byMastery.forEach((m: any) => {
      masteryCounts[m._id] = m.count;
    });

    res.status(200).json({
      easy,
      medium,
      hard,
      totalSolved,
      totalQuestions,
      mastery: masteryCounts
    });
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
};

export default getProgress;
