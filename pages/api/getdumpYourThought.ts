// pages/api/getDocuments.ts
import { NextApiRequest, NextApiResponse } from 'next';
import connectToDatabase from './lib/mongodb';
import DocumentModel from './lib/documentation';

const getDocuments = async (req: NextApiRequest, res: NextApiResponse) => {
  await connectToDatabase();

  if (req.method === 'GET') {
    const topicId  = '671fdebdf99d11cf32d2f727'; // Get topicId from query parameters

    if (!topicId || Array.isArray(topicId)) {
      return res.status(400).json({ error: 'Valid topic ID is required' });
    }

    try {
      // Fetch all documents for the specific topicId
      const documents = await DocumentModel.find({ topicId });

      // Check if documents were found
      if (!documents || documents.length === 0) {
        return res.status(404).json({ error: 'No documents found' });
      }

      // Return the documents in the expected format
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

export default getDocuments;
