import type { NextApiRequest, NextApiResponse } from 'next';
import connectToDatabase from './lib/mongodb'; // Updated path
import Notebook from './lib/notebook';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectToDatabase();

  const { method } = req;
  const { nodeId, title, type, content, parentId, identifier } = req.body; // From the request body
  const { identifier: queryIdentifier, parentId: queryParentId } = req.query; // From the query parameters
  const actualIdentifier = identifier || queryIdentifier; // Prefer body identifier over query
  const actualParentId = parentId || queryParentId; // Prefer body identifier over query

  console.log(actualIdentifier); 

  try {
    switch (method) {
      case "GET":
        if (!actualIdentifier) {
          return res.status(400).json({ error: "Identifier is required for GET requests" });
        }
        
        switch (actualIdentifier) {
          case "fetchNodes":
            const nodes = await Notebook.find({ parentId: null });
            return res.status(200).json(nodes);

          case "fetchDescendants":
            if (!actualParentId) {
              return res.status(400).json({ error: "Parent ID is required for descendants" });
            }
            const descendants = await Notebook.find({ parentId : actualParentId });
            return res.status(200).json(descendants);

          default:
            return res.status(404).json({ error: "Identifier not found" });
        }

      case "POST":
        if (actualIdentifier === "addNode") {
          if (!title) return res.status(400).json({ error: "Title is required" });

          const newNode = new Notebook({
            title,
            type,
            content: type === "file" ? content : undefined,
            parentId: actualParentId || null,
          });
          await newNode.save();
          return res.status(201).json(newNode);
        }
        return res.status(405).json({ error: "Method Not Allowed" });

      case "PUT":
        if (actualIdentifier === "saveContent") {
          if (!nodeId) return res.status(400).json({ error: "Node ID is required" });

          const updatedNode = await Notebook.findOneAndUpdate(
            { nodeId },
            { title, type, content },
            { new: true }
          );

          if (!updatedNode) return res.status(404).json({ error: "Node not found" });
          return res.status(200).json(updatedNode);
        }
        return res.status(405).json({ error: "Method Not Allowed" });

      case "DELETE":
        if (actualIdentifier === "deleteNode") {
          if (!nodeId) return res.status(400).json({ error: "Node ID is required" });

          const nodeToDelete = await Notebook.findOne({ nodeId });
          if (!nodeToDelete) return res.status(404).json({ error: "Node not found" });

          const nodesToDelete = await getDescendants(nodeToDelete.nodeId);
          const nodeIdsToDelete = nodesToDelete.map((node) => node.nodeId);
          nodeIdsToDelete.push(nodeToDelete.nodeId);

          await Notebook.deleteMany({ nodeId: { $in: nodeIdsToDelete } });

          return res.status(200).json({ message: "Node and its children deleted" });
        }
        return res.status(405).json({ error: "Method Not Allowed" });

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
