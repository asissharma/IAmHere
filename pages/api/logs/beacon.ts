import type { NextApiRequest, NextApiResponse } from 'next';
import connectToDatabase from '../lib/mongodb';
import mongoose from 'mongoose';

export const config = {
    api: {
        bodyParser: false, // Beacon sends Blob
    },
};

async function getRawBody(req: NextApiRequest): Promise<string> {
    return new Promise((resolve, reject) => {
        let data = '';
        req.on('data', (chunk: Buffer) => { data += chunk.toString(); });
        req.on('end', () => resolve(data));
        req.on('error', reject);
    });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        try {
            await connectToDatabase();

            const raw = await getRawBody(req);
            let body: { nodeId?: string; duration?: number } = {};
            if (raw) {
                try {
                    body = JSON.parse(raw);
                } catch (e) {
                    console.error("Failed to parse beacon body", e);
                    return res.status(400).json({ message: 'Invalid JSON' });
                }
            }

            const { nodeId, duration } = body;

            if (!nodeId || !duration) {
                return res.status(400).json({ message: 'Missing nodeId or duration' });
            }

            // Use raw mongoose connection to insert into activity_logs collection
            const db = mongoose.connection.db;
            if (!db) {
                return res.status(500).json({ message: 'Database not connected' });
            }

            await db.collection('activity_logs').insertOne({
                nodeId,
                duration,
                timestamp: new Date(),
            });

            // Beacon doesn't really wait for response
            return res.status(200).json({ message: 'Logged' });
        } catch (error) {
            console.error('Error logging activity:', error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
