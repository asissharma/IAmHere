import { NextApiRequest, NextApiResponse } from 'next';
import connectToDatabase from './lib/mongodb';
import DocumentModel from './lib/documentation';
import Topic from './lib/topic';

const getDocumentsByTopic = async (req: NextApiRequest, res: NextApiResponse) => {
    await connectToDatabase();
  
    if (req.method === 'GET') {
      const { topicId } = req.query;
  
      try {
        const documents = await DocumentModel.find({ topicId });
        res.status(200).json(documents);
      } catch (error) {
        console.error('Error fetching documents:', error);
        res.status(500).json({ error: 'Failed to fetch documents' });
      }
    } else {
      res.setHeader('Allow', ['GET']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  };
  
  export default getDocumentsByTopic;
  