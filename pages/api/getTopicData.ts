import { NextApiRequest, NextApiResponse } from 'next';
import connectToDatabase from './lib/mongodb';
import Topic from './lib/topic';
import DocumentModel from './lib/documentation';

const getTopicData = async (req: NextApiRequest, res: NextApiResponse) => {
  await connectToDatabase();

  const page = parseInt(req.query.page as string) || 0; // Default to page 0 if not provided
  const limit = 1; // Number of topics to fetch

  try {
    // Fetch topics based on page number, with associated documents
    const topics = await Topic.find({ isCompleted: false })
      .skip(page * limit) // Skip topics based on the page
      .limit(limit); // Limit to the specified number

    if (topics.length === 0) {
      return res.status(404).json({ message: 'No more topics available' });
    }

    // Fetch documents related to each topic
    const topicsWithDocuments = await Promise.all(
      topics.map(async (topic) => {
        const documents = await DocumentModel.find({ topicId: topic._id }).select('name content type');
        return {
          ...topic.toObject(), // Convert the Mongoose model to a plain JS object
          documents,
        };
      })
    );

    res.status(200).json(topicsWithDocuments);
  } catch (error) {
    console.error('Error fetching topics:', error);
    res.status(500).json({ error: 'Failed to fetch topics' });
  }
};

export default getTopicData;
