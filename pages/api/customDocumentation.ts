import { NextApiRequest, NextApiResponse } from 'next';
import connectToDatabase from './lib/mongodb';
import DocumentModel from './lib/documentation';
import Topic from './lib/topic'; // Import the Topic model to fetch topic info
import validator from 'validator';

const saveDocument = async (req: NextApiRequest, res: NextApiResponse) => {
  await connectToDatabase();

  if (req.method === 'POST') {
    try {
      const { title,topicId, content, type, name } = req.body;

      // Sanitize inputs
      const sanitizedContent = validator.escape(content);

      // Validate input
      if (!topicId || !sanitizedContent || !['ai', 'note', 'dumpYourThought'].includes(type)) {
        return res.status(400).json({ message: 'Invalid input data' });
      }

      // Handle "note" type: Check if a document with the same topicId already exists
      if (type === 'note') {
        const existingDocument = await DocumentModel.findOne({ topicId });
        
        if (existingDocument) {
          // Update the existing document by appending the new content
          console.log('updated');
          existingDocument.content.push({ title,type, content: sanitizedContent });
          await existingDocument.save();
          return res.status(200).json(existingDocument);
        }
      }

      // Generate a default name if not provided
      let documentName = name;
      if (!documentName) {
        const topic = await Topic.findById(topicId); // Fetch the topic to get the title
        documentName = topic ? `${topic.title} - ${type}` : `Document - ${type}`;
      }

      // Wrap content in the expected format for the array of IContent
      const contentArray = [
        {
          type,
          content: sanitizedContent,
        },
      ];

      // Create a new document
      const newDocument = await DocumentModel.create({
        topicId,
        content: contentArray,
        name: documentName, // Save the name of the document
      });

      res.status(201).json(newDocument);
    } catch (error) {
      console.error('Error saving document:', error);
      res.status(500).json({ error: 'Failed to save document' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

export default saveDocument;
