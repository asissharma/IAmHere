import { NextApiRequest, NextApiResponse } from 'next';
import connectToDatabase from './lib/mongodb';
import DocumentModel from './lib/documentation';

const getDocumentsById = async (req: NextApiRequest, res: NextApiResponse) => {
  await connectToDatabase();

  if (req.method === 'GET') {
    const { documentId } = req.query;

    if (!documentId) {
      return res.status(400).json({ error: 'Document ID is required' });
    }

    try {
      // Fetch the document by its ID
      const document = await DocumentModel.findById(documentId);
      
      if (!document) {
        return res.status(404).json({ error: 'Document not found' });
      }

      res.status(200).json(document);
    } catch (error) {
      console.error('Error fetching document:', error);
      res.status(500).json({ error: 'Failed to fetch document' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

export default getDocumentsById;
