// pages/api/upload.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { Dropbox } from 'dropbox'; // Import necessary types
import fetch from 'isomorphic-fetch';
import File from './lib/fileUpload'; // Import the File model
import connectToDatabase from './lib/mongodb'; // MongoDB connection function

const dbx = new Dropbox({
  accessToken: process.env.DROPBOX_ACCESS_TOKEN!,
  fetch,
});

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const { file, filename, mimetype } = req.body;

    if (!file || !filename || !mimetype) {
      return res.status(400).json({ error: 'File, filename, and mimetype are required' });
    }

    try {
      // Connect to MongoDB
      await connectToDatabase();

      // Upload the file to Dropbox
      const dropboxResponse = await dbx.filesUpload({
        path: `/${filename}`,
        contents: Buffer.from(file, 'base64'),
      });

      // Create a shared link for the uploaded file
      const sharedLinkResponse = await dbx.sharingCreateSharedLinkWithSettings({
        path: dropboxResponse.result.path_display || '',
        settings: {
            requested_visibility: { '.tag': 'public' }, // Ensure public access
        },
    });

      // Adjust URL for direct access
      const fileUrl = sharedLinkResponse.result.url.replace('dl=0', 'raw=1');

      // Save file metadata to MongoDB
      const fileData = {
        filename,
        url: fileUrl,
        mimetype,
        created_at: new Date(),
      };

      await File.create(fileData); // Use create method to save file data to MongoDB

      res.status(200).json({ message: 'File uploaded and saved successfully', file: dropboxResponse });
    } catch (error) {
      console.error('Error uploading file:', error);
      res.status(500).json({ error: 'Upload failed' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};

export default handler;
