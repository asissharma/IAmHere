import type { NextApiRequest, NextApiResponse } from 'next';
import multer from 'multer';
import { createClient } from '@supabase/supabase-js';
import connectToDatabase from './lib/mongodb';
import File from './lib/fileUpload';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

// Configure multer to use memory storage
const upload = multer({ storage: multer.memoryStorage() });

export const config = {
  api: {
    bodyParser: false, // Disable body parsing to use multer
  },
};

// Multer promise wrapper for Next.js
const multerPromise = (req: NextApiRequest, res: NextApiResponse): Promise<void> =>
  new Promise((resolve, reject) => {
    upload.single('file')(req as any, res as any, (err: any) => {
      if (err) {
        return reject(err);
      }
      resolve();
    });
  });

// File upload handler
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await connectToDatabase();
  const method = req.method;

  if (method === 'GET') {
    try {
      const { data, error } = await supabase.storage
        .from('IAmHere')
        .list('public', {
          limit: 100,
          offset: 0,
          sortBy: { column: 'name', order: 'asc' },
        });
    
      if (error) throw error;
    
      // Generate signed URLs for all files
      const files = await Promise.all(
        data.map(async (file) => {
          const { data: signedUrlData, error: signedUrlError } = await supabase.storage
            .from('IAmHere')
            .createSignedUrl(`public/${file.name}`, 60 * 60); // Expires in 1 hour
    
          if (signedUrlError) throw signedUrlError;
    
          return {
            name: file.name,
            url: signedUrlData.signedUrl,
            metadata: file.metadata,
            created_at: file.created_at,
            updated_at: file.updated_at,
          };
        })
      );
    
      res.status(200).json(files);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error retrieving files from Supabase Storage' });
    }
    
  } else if (method === 'POST') {
    try {

      const fileId = (req as any).fileId;
      await multerPromise(req, res);
      const file = (req as any).file;
      if (!file) {
        return res.status(400).json({ error: 'No file provided' });
      }

      // Upload file to Supabase storage
      const { data, error } = await supabase.storage
          .from('IAmHere')
          .upload(`public/${file.originalname}`, file.buffer, {
            contentType: file.mimetype,
            upsert: false,
          });

        if (error) {
          console.error('Supabase Upload Error:', error);
          throw error;
        }

        console.log('Supabase Upload Success:', data);

      // Save file metadata to MongoDB
      const newFile = new File({
        fileId: fileId ? fileId : null,
        url: data.path,
        filename: file.originalname,
        mimetype: file.mimetype,
      });
      await newFile.save();

      res.status(200).json({ message: 'File uploaded successfully', data });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error uploading file to Supabase' });
    }
  } else if (method === 'DELETE') {
    const { publicUrl } = req.body;
    if (!publicUrl) {
      return res.status(400).json({ error: 'No public URL provided' });
    }

    try {
      const { error } = await supabase.storage
        .from('IAmHere')
        .remove([`public/${publicUrl.split('/').pop()}`]);

      if (error) throw error;

      await File.deleteOne({ url: publicUrl });
      res.status(200).json({ message: 'File deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Error deleting file' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};

export default handler;
