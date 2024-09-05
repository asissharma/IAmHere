// pages/api/save-content.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { content } = req.body;
    if (content) {
      const filePath = path.join(process.cwd(), 'public', 'saved-content.txt');
      fs.writeFileSync(filePath, content);
      res.status(200).json({ message: 'Content saved as file' });
    } else {
      res.status(400).json({ error: 'No content provided' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
