import { NextApiRequest, NextApiResponse } from 'next';
import connectToDatabase from './lib/mongodb';
import Topic from './lib/topic';
const updateTopicUrls = async (req: NextApiRequest, res: NextApiResponse) => {
    await connectToDatabase();
  
    if (req.method === 'PATCH') {
      const { topicId, resourceUrl } = req.body;
  
      try {
        const updatedTopic = await Topic.findByIdAndUpdate(
          topicId,
          { resourceUrl },
          { new: true } // Return the updated document
        );
  
        if (!updatedTopic) {
          return res.status(404).json({ message: 'Topic not found' });
        }
  
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
  