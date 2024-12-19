import type { NextApiRequest, NextApiResponse } from 'next';
import connectToDatabase from './lib/mongodb';
import Notebook from './lib/notebook';
import multer from 'multer';
import { parse as csvParse } from 'csv-parse';
import fs from 'fs/promises';
import { promisify } from 'util';

const storage = multer.memoryStorage();
const upload = multer({ storage });
const uploadMiddleware = promisify(upload.single('file'));

export const config = {
  api: {
    bodyParser: false, // Disable body parsing to use multer
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectToDatabase();

  const { method } = req;
  const { uploadType } = req.query;

  try {
    if (method === 'POST') {
      // Use Multer middleware to handle file uploads
      await uploadMiddleware(req as any, res as any); 

      const file = (req as any).file;
      if (!file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
      }

      // Handle CSV, JSON based on MIME type
      if (file.mimetype === 'application/json') {
        const jsonData = JSON.parse(file.buffer.toString());
        await saveDataToDB(jsonData);
        res.status(201).json({ message: 'JSON file uploaded and data saved' });
        return;
      } else if (file.mimetype === 'text/csv') {
        const csvData = file.buffer.toString();
        const records = await parseCSV(csvData);
        await saveDataToDB(records);
        res.status(201).json({ message: 'CSV file uploaded and data saved' });
        return;
      } else {
        res.status(400).json({ error: 'Unsupported file format. Use JSON, CSV, or Excel.' });
        return;
      }
    } else {
      res.status(405).json({ error: 'Method Not Allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

// Helper: Parse CSV data into an array of objects
async function parseCSV(csvData: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const records: any[] = [];
    const parser = csvParse(csvData, { columns: true, skip_empty_lines: true });

    parser.on('readable', () => {
      let record;
      while ((record = parser.read()) !== null) {
        records.push(record);
      }
    });

    parser.on('error', (err) => reject(err));
    parser.on('end', () => resolve(records));
  });
}

// Helper: Save parsed data into the database
// Helper: Save parsed data into the database
async function saveDataToDB(data: any[]) {
    if (!Array.isArray(data)) throw new Error('Invalid data format');
  
    for (const item of data) {
      const { title, type, resourceType, content, parentId } = item;
  
      // If there's a parentId, search for the parent notebook by title
      let parentNodeID = null;
      if (parentId) {
        const parentNode = await Notebook.findOne({ title: parentId });
        if (parentNode) {
          parentNodeID = parentNode.nodeId;  // Assuming you have a 'nodeID' field
        } else {
          console.warn(`Parent node with title "${parentId}" not found`);
        }
      }
  
      const newNode = new Notebook({
        title,
        type,
        resourceType: resourceType || '',
        content: content || null,
        parentId: parentNodeID,  // Use the found or null parentNodeID
      });
  
      await newNode.save();
    }
  }
  
