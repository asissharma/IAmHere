import type { NextApiRequest, NextApiResponse } from 'next';
import { Dropbox } from 'dropbox';
import fetch from 'isomorphic-fetch';
import multer from 'multer';
import fs from 'fs/promises';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';
import sanitizeHtml from 'sanitize-html'; 
import connectToDatabase from './lib/mongodb';
import BookModel from './lib/books'; // Mongoose model for storing book content
import File from './lib/fileUpload'; // Mongoose model for storing file uploads
import Token from './lib/tokenModel';
import Tesseract from 'tesseract.js'; // For OCR
import axios from 'axios';

// Multer configuration for file uploads
const upload = multer({ dest: 'uploads/' });

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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  await connectToDatabase();

  try {
    // Use Multer middleware to handle file uploads
    await multerPromise(req, res);

    const file = (req as any).file; // Multer file
    const { uploadType } = req.body; // Check if it's a direct upload or conversion
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Check the file extension
    const fileType = file.originalname.split('.').pop()?.toLowerCase();

    if (uploadType === 'direct') {
      // Handle Direct Upload (Dropbox)
      await handleDirectUpload(file, req, res);
    } else {
      // Handle Conversion (PDF or DOCX)
      if (fileType === 'pdf' || fileType === 'docx') {
        await handleConversion(file, fileType, req, res);
      } else {
        res.status(400).json({ error: 'Unsupported file type for conversion' });
      }
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred', details: error });
  }
}

// Handle Direct Upload (Dropbox)
const handleDirectUpload = async (file: any, req: NextApiRequest, res: NextApiResponse) => {
  const filename = file.originalname;
  const mimetype = file.mimetype;
  const filePath = file.path;
  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const baseUrl = `${protocol}://${req.headers.host}`;

  try {
    const response = await axios.post(`${baseUrl}/api/upload`, {
      file: await fs.readFile(filePath),
      filename: filename,
      mimetype: mimetype,
    });
    
    await BookModel.create({ title: filename, publicUrl: response.data.publicUrl });
    res.status(200).json({ message: 'File uploaded and saved successfully!' });
  } catch (error) {
    console.error('Error in Dropbox upload:', error);
    res.status(500).json({ error: 'Dropbox upload failed' });
  } finally {
    await fs.unlink(filePath); // Clean up the temporary file
  }
};

// Handle file conversion (PDF, DOCX)
const handleConversion = async (file: any, fileType: string, req: NextApiRequest, res: NextApiResponse) => {
  const filePath = file.path;
  try {
    const fileBuffer = await fs.readFile(filePath);
    let htmlContent: string = '';

    if (fileType === 'pdf') {
      htmlContent = await pdfToHTML(fileBuffer);
    } else if (fileType === 'docx') {
      htmlContent = await docxToHTML(fileBuffer);
    }

    // Extract title from the file name
    const title = file.originalname.split('.').slice(0, -1).join('.');

    // Save the converted content to MongoDB
    await BookModel.create({ title, content: htmlContent });

    res.status(200).json({ message: 'File converted and saved successfully!' });
  } catch (error) {
    console.error('Conversion error:', error);
    res.status(500).json({ error: 'File conversion failed', details: error });
  } finally {
    await fs.unlink(filePath); // Clean up the temporary file
  }
};

// PDF to HTML conversion function
const pdfToHTML = async (fileBuffer: Buffer): Promise<string> => {
  const data = await pdf(fileBuffer);
  const htmlContent = data.text
    .split('\n')
    .map(line => line.trim() ? `<p>${line}</p>` : '')
    .join('\n');

  return sanitizeHtml(`<article>${htmlContent}</article>`);
};

// DOCX to HTML conversion function
const docxToHTML = async (fileBuffer: Buffer): Promise<string> => {
  const result = await mammoth.convertToHtml({ buffer: fileBuffer });
  return sanitizeHtml(`<article>${result.value}</article>`);
};
