import mongoose, { Schema, Document } from 'mongoose';
import { NextApiRequest, NextApiResponse } from 'next';
import multer from 'multer';
import fs from 'fs/promises';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';
import sanitizeHtml from 'sanitize-html'; // Import sanitize-html
import connectToDatabase from './lib/mongodb'; // Adjust path as needed
import BookModel from './lib/books'; // Mongoose model for MongoDB
import Tesseract from 'tesseract.js'; // Add Tesseract.js for OCR

// Configure Multer
const upload = multer({ dest: 'uploads/' });

export const config = {
  api: {
    bodyParser: false, // Disable body parsing to use multer
  },
};

// Multer wrapper to work with Next.js API routes
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
  await connectToDatabase();

  try {
    // Use Multer middleware to handle file uploads
    await multerPromise(req, res);

    const file = (req as any).file; // Type assertion to access Multer's file property
    if (!file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
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

    // Extract the title from the file name (without the extension)
    const title = file.originalname.split('.').slice(0, -1).join('.');

    // Save the converted content to MongoDB
    await BookModel.create({ title, content: htmlContent });

    res.status(200).json({ success: true, message: 'File converted and saved successfully!' });
  } catch (error) {
    console.error('Conversion error:', error);
    res.status(500).json({ success: false, message: 'Conversion failed', error: error });
  }
}

// PDF to HTML conversion
export const pdfToHTML = async (fileBuffer: Buffer): Promise<string> => {
  try {
    const data = await pdf(fileBuffer);

    if (!data.text || data.text.trim().length === 0) {
      return await extractTextFromScannedPDF(fileBuffer);
    }

    const htmlContent = data.text
      .split('\n')
      .map((line: string) => {
        // Attempt to detect headers or bold text based on simple heuristics
        if (line.trim().length === 0) return '';
        if (line === line.toUpperCase()) {
          return wrapInTag('h2', line.trim()); // Treat uppercase lines as headers
        }
        return wrapInTag('p', line.trim()); // Treat as paragraph otherwise
      })
      .join('\n');

    return sanitizeHtml(`<article>${htmlContent}</article>`);
  } catch (error) {
    console.error('PDF conversion error:', error);
    return '<p>Failed to convert PDF file.</p>';
  }
};


// Extract text from scanned PDF using OCR
const extractTextFromScannedPDF = async (fileBuffer: Buffer): Promise<string> => {
  try {
    const { data: { text } } = await Tesseract.recognize(fileBuffer, 'eng');
    return sanitizeHtml(wrapInTag('p', text)); // Sanitize the OCR output
  } catch (error) {
    console.error('OCR extraction error:', error);
    return '<p>Failed to extract text from scanned PDF.</p>';
  }
};

// DOCX to HTML conversion
export const docxToHTML = async (fileBuffer: Buffer): Promise<string> => {
  try {
    const result = await mammoth.convertToHtml({ buffer: fileBuffer }, {
      styleMap: [
        "p[style-name='Heading 1'] => h1:fresh",
        "p[style-name='Heading 2'] => h2:fresh",
        "p[style-name='Heading 3'] => h3:fresh",
        "b => strong", // Bold to strong
        "i => em", // Italic to em
        "ul => ul", // Bullet lists
        "ol => ol"  // Numbered lists
      ]
    });

    const htmlContent = `
      <article class="docx-book">
        <header class="docx-header"><h1>Word Document</h1></header>
        <section class="docx-content">${result.value}</section>
      </article>
    `;

    return sanitizeHtml(htmlContent); // Sanitize using sanitize-html
  } catch (error) {
    console.error('DOCX conversion error:', error);
    return '<p>Failed to convert DOCX file.</p>';
  }
};


const wrapInTag = (tag: string, content: string): string => content.trim() ? `<${tag}>${content}</${tag}>` : '';

