import { NextApiRequest, NextApiResponse } from 'next';
import connectToDatabase from './lib/mongodb';
import Topic from './lib/topic';

const updateTopicUrls = async (req: NextApiRequest, res: NextApiResponse) => {
  await connectToDatabase(); // Ensure this connects successfully

  if (req.method === 'PATCH') {
    const { topicId, resourceUrls } = req.body;
    // Validate the input
    if (!topicId || !Array.isArray(resourceUrls)) {
      return res.status(400).json({ message: 'Invalid input: topicId and resourceUrls must be provided.' });
    }

    try {
      // Update the topic's resourceUrls
      const updatedTopic = await Topic.findByIdAndUpdate(
        topicId,
        { resourceUrls },
        { new: true }
      );


      // Check if the topic was found and updated
      if (!updatedTopic) {
        return res.status(404).json({ message: 'Topic not found' });
      }
      // If update is successful, return the updated topic
      res.status(200).json(updatedTopic);
    } catch (error) {
      console.error('Error updating topic URLs:', error);
      res.status(500).json({ error: 'Failed to update topic URLs' });
    }
  } else {
    res.setHeader('Allow', ['PATCH']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

export default updateTopicUrls;
