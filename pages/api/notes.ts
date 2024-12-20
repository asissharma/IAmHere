import type { NextApiRequest, NextApiResponse } from 'next';
import connectToDatabase from './lib/mongodb'; // Updated path
import Notebook from './lib/notebook';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectToDatabase();

  const { method } = req;
  const { nodeId, title, type, content } = req.body;

  const { recursive, parentId} = req.query;

  try {
    switch (method) {
      case "GET": {
        if(parentId){
          const nodes = await Notebook.find({parentId: parentId});
          return res.status(200).json(nodes);
        }else{
          const nodes = await Notebook.find({parentId: null});
          return res.status(200).json(nodes);
        }

      }

      case "POST": {
        // Create a new node (folder or file) after ensuring a title is provided
        if (!title) return res.status(400).json({ error: "Title is required" });

        const newNode = new Notebook({
          title,
          type,
          content: type === "file" ? content : undefined,
          parentId: parentId || null,
        });
        await newNode.save();
        return res.status(201).json(newNode);
      }

      case "PUT": {
        // Update an existing node
        if (!nodeId) return res.status(400).json({ error: "Node ID is required" });

        const updatedNode = await Notebook.findOneAndUpdate(
          { nodeId },
          { title, type, content },
          { new: true } // Return the updated document
        );

        if (!updatedNode) return res.status(404).json({ error: "Node not found" });
        return res.status(200).json(updatedNode);
      }

      case "DELETE": {
        if (!nodeId) return res.status(400).json({ error: "Node ID is required" });
      
        const nodeToDelete = await Notebook.findOne({ nodeId });
        if (!nodeToDelete) return res.status(404).json({ error: "Node not found" });
      
        const nodesToDelete = await getDescendants(nodeToDelete.nodeId);
        const nodeIdsToDelete = nodesToDelete.map((node) => node.nodeId); // Extract nodeId
        nodeIdsToDelete.push(nodeToDelete.nodeId); // Include the root node
      
        await Notebook.deleteMany({ nodeId: { $in: nodeIdsToDelete } });
      
        return res.status(200).json({ message: "Node and its children deleted" });
      }
      

      default:
        return res.status(405).json({ error: "Method Not Allowed" });
    }
  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

// Helper: Retrieve all descendants of a node
async function getDescendants(parentId: string): Promise<any[]> {
  const nodes = await Notebook.find({ parentId });
  const results = [];

  for (const node of nodes) {
    results.push(node);
    const childDescendants = await getDescendants(node.nodeId);
    results.push(...childDescendants);
  }

  return results;
}
