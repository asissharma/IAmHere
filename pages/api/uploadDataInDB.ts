import type { NextApiRequest, NextApiResponse } from 'next';
import connectToDatabase from './lib/mongodb';
import Notebook from './lib/notebook';
import multer from 'multer';
import { parse as csvParse } from 'csv-parse';
import { promisify } from 'util';

const storage = multer.memoryStorage();
const upload = multer({ storage });
const uploadMiddleware = promisify(upload.single('file'));

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectToDatabase();

  const { method } = req;
  const { uploadType } = req.query;

  try {
    switch (method) {
      case 'POST': {
        if (uploadType === 'upload') {
          await uploadMiddleware(req as any, res as any); // Process file upload
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
          res.status(400).json({ error: 'Invalid uploadType' });
          return;
        }
      }
      default: {
        res.status(405).json({ error: 'Method Not Allowed' });
        return;
      }
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
    return;
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
async function saveDataToDB(data: any[]) {
  if (!Array.isArray(data)) throw new Error('Invalid data format');

  for (const item of data) {
    const { title, type, resourceType, content, parentId } = item;

    const newNode = new Notebook({
      title,
      type,
      resourceType: resourceType || 'text',
      content: content || null,
      parentId: parentId || null,
    });
    await newNode.save();
  }
}
