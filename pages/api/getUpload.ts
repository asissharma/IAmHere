import type { NextApiRequest, NextApiResponse } from 'next';
import connectToDatabase from './lib/mongodb'; // MongoDB connection
import File from './lib/fileUpload'; // File model

const filesHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    try {
      await connectToDatabase();

      const files = await File.find({}).sort({ created_at: -1 });

      res.status(200).json(files);
    } catch (error) {
      console.error('Error retrieving files:', error);
      res.status(500).json({ error: 'Error retrieving files' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

export default filesHandler;
