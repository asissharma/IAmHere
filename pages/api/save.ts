import type { NextApiRequest, NextApiResponse } from 'next';
import connectToDatabase from '../lib/mongodb';
import Text from '../lib/text';

interface SaveRequestBody {
  content: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { content }: SaveRequestBody = req.body;

  if (!content) {
    return res.status(400).json({ error: 'Content is required' });
  }

  try {
    // Connect to the database
    await connectToDatabase();

    // Save or update content in MongoDB based on textId
    const result = await Text.updateOne(
      { textId: 'default' },  // Use a consistent identifier for the document
      { content },
      { upsert: true }         // Create the document if it doesn't exist
    );

    console.log('Update result:', result); // Debugging info
    return res.status(200).json({ message: 'Content saved successfully' });
  } catch (error) {
    console.error('Error saving content:', error); // Detailed error logging
    return res.status(500).json({ error: 'Failed to save content' });
  }
}
