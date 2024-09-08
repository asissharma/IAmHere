import type { NextApiRequest, NextApiResponse } from 'next';
import connectToDatabase from '../lib/mongodb';
import Text from '../lib/text';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Connect to the database
    console.log('dada');
    await connectToDatabase();

    // Retrieve content from MongoDB
    const text = await Text.findOne({ textId: 'default' }).exec();
    console.log(text);
    const content = text ? text.content : '<p>Edit this text</p>';

    return res.status(200).json({ content });
  } catch (error) {
    console.error('Error retrieving content:', error);
    return res.status(500).json({ error: 'Failed to retrieve content' });
  }
}
