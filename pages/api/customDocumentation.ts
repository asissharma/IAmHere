import { NextApiRequest, NextApiResponse } from 'next';
import connectToDatabase from './lib/mongodb';
import DocumentModel from './lib/documentation';
import validator from 'validator';

const saveDocument = async (req: NextApiRequest, res: NextApiResponse) => {
  await connectToDatabase();

  if (req.method === 'POST') {
    try {
      const { topicId, content, type } = req.body;

      // Sanitize inputs
      const sanitizedContent = validator.escape(content);

      // Validate input
      if (!topicId || !sanitizedContent || !['ai', 'note'].includes(type)) {
        return res.status(400).json({ message: 'Invalid input data' });
      }

      const newDocument = await DocumentModel.create({
        topicId,
        type,
        content: sanitizedContent,
      });

      res.status(201).json(newDocument);
    } catch (error) {
      console.error('Error saving document:', error);
      res.status(500).json({ error: 'Failed to save document' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

export default saveDocument;
