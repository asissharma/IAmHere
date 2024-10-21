// pages/api/getBooks.ts

import { NextApiRequest, NextApiResponse } from 'next';
import connectToDatabase from './lib/mongodb'; // Your MongoDB connection function
import BookModel from './lib/books'; // Your Book model

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectToDatabase(); // Ensure the database connection is made

  if (req.method === 'GET') {
    try {
      const books = await BookModel.find({}); // Retrieve all books from the database
      return res.status(200).json({ success: true, books });
    } catch (error) {
      console.error('Error fetching books:', error);
      return res.status(500).json({ success: false, message: 'Failed to retrieve books', error });
    }
  } else {
    return res.status(405).json({ success: false, message: 'Method not allowed' }); // Handle non-GET methods
  }
}
