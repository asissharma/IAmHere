import type { NextApiRequest, NextApiResponse } from 'next';
import connectToDatabase from '../lib/mongodb';
import mongoose from 'mongoose';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        try {
            await connectToDatabase();

            const db = mongoose.connection.db;
            if (!db) {
                return res.status(500).json({ message: 'Database not connected' });
            }

            const collection = db.collection('activity_logs');

            // Aggregate by day
            const aggregation = await collection.aggregate([
                {
                    $group: {
                        _id: {
                            $dateToString: { format: "%Y-%m-%d", date: "$timestamp" }
                        },
                        totalDuration: { $sum: "$duration" }
                    }
                }
            ]).toArray();

            // Transform to Map: "DateString" -> Duration
            const stats: Record<string, number> = {};
            aggregation.forEach((item: any) => {
                const d = new Date(item._id);
                const dateKey = d.toDateString();
                stats[dateKey] = item.totalDuration;
            });

            return res.status(200).json(stats);
        } catch (error) {
            console.error('Error fetching stats:', error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
