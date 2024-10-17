import { NextApiRequest, NextApiResponse } from 'next';
import multer from 'multer';
import fs from 'fs/promises';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';
import DOMPurify from 'dompurify';
import connectToDatabase from './lib/mongodb'; // Adjust path as needed
import DocumentModel from './lib/documentation'; // Assuming you're using a Mongoose model for MongoDB

// Configure Multer
const upload = multer({ dest: 'uploads/' });

export const config = {
  api: {
    bodyParser: false, // Disable body parsing to use multer
  },
};

// Multer wrapper to work with Next.js API routes
const multerPromise = (req: NextApiRequest, res: NextApiResponse) =>
  new Promise<void>((resolve, reject) => {
    upload.single('file')(req as any, res as any, (err: any) => {
      if (err) {
        return reject(err);
      }
      resolve();
    });
  });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectToDatabase();

  try {
    // Use Multer middleware to handle file uploads
    await multerPromise(req, res);

    const file = (req as any).file; // Type assertion to access Multer's file property
    if (!file) {
      res.status(400).json({ success: false, message: 'No file uploaded' });
      return;
    }

    const fileType = file.originalname.split('.').pop()?.toLowerCase();
    let htmlContent: string = '';

    // Read and convert file content based on its type
    const fileBuffer = await fs.readFile(file.path);
    if (fileType === 'pdf') {
      htmlContent = await pdfToHTML(fileBuffer);
    } else if (fileType === 'docx') {
      htmlContent = await docxToHTML(fileBuffer);
    } else {
      throw new Error('Unsupported file type');
    }

    // Save the converted content to MongoDB
    await DocumentModel.create({ content: htmlContent, createdAt: new Date() });

    res.status(200).json({ success: true, message: 'File converted and saved successfully!' });
  } catch (error) {
    console.error('Conversion error:', error);
    res.status(500).json({ success: false, message: 'Conversion failed' });
  }
}

// PDF to HTML conversion
export const pdfToHTML = async (fileBuffer: Buffer): Promise<string> => {
  try {
    const data = await pdf(fileBuffer);
    const paragraphs = data.text
      .split('\n\n')
      .map((line: string) => wrapInTag('p', line.trim()))
      .join('\n');
    
    const htmlContent = `
      <article class="pdf-book">
        <header class="pdf-header"><h1>PDF Document</h1></header>
        <section class="pdf-content">${paragraphs}</section>
      </article>
    `;
    return DOMPurify.sanitize(htmlContent);
  } catch (error) {
    console.error('PDF conversion error:', error);
    return '<p>Failed to convert PDF file.</p>';
  }
};

// DOCX to HTML conversion
export const docxToHTML = async (fileBuffer: Buffer): Promise<string> => {
  try {
    const result = await mammoth.convertToHtml({ buffer: fileBuffer });
    
    const htmlContent = `
      <article class="docx-book">
        <header class="docx-header"><h1>Word Document</h1></header>
        <section class="docx-content">${result.value}</section>
      </article>
    `;
    return DOMPurify.sanitize(htmlContent);
  } catch (error) {
    console.error('DOCX conversion error:', error);
    return '<p>Failed to convert DOCX file.</p>';
  }
};
const wrapInTag = (tag: string, content: string): string => `<${tag}>${content}</${tag}>`;
