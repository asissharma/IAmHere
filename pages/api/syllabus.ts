// pages/api/syllabus.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import connectToDatabase from './lib/mongodb';
import Notebook from './lib/notebook';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    await connectToDatabase();

    const syllabusNodes = await Notebook.find({ 
      type: 'syllabus',
      parentId: null 
    }).lean();

    const formattedData = syllabusNodes.map((node: any) => {
      let status = 'PENDING';
      const p = node.progress || 0;
      
      if (p === 100) status = 'DONE';
      else if (p > 0) status = 'IN_PROGRESS';
      
      return {
        id: node.nodeId,
        topic: node.title,
        status: status,
        progress: p,
        lastUpdated: node.updatedAt
      };
    });

    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
    
    return res.status(200).json(formattedData);

  } catch (error) {
    console.error("Syllabus API Error:", error);
    return res.status(500).json({ error: 'Failed to fetch syllabus' });
  }
}