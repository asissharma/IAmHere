import type { NextApiRequest, NextApiResponse } from 'next';
import connectToDatabase from './lib/mongodb'; // Updated path
import Notebook from './lib/notebook';
type TreeNode = {
  nodeId: string;
  title: string;
  type: string;
  parentId: string | null;
  content?: string;
  children: TreeNode[]; // Recursive definition for children
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectToDatabase();

  const { method } = req;
  let { nodeId, title, type, content, parentId, identifier,resourceType } = req.body; // From the request body
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
            
            case "fetchMindMap":
                const { parentId } = req.query;
            
                // Fetch nodes from the database
                const notebooks = await Notebook.find({}).lean();
            
                if (!notebooks) {
                  return res.status(404).json({ message: "No data found" });
                }
            
                // Build the tree for the requested parentId
                const treeData = buildTree(notebooks, parentId as string | null);
            
                return res.status(200).json(treeData);
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
          if(resourceType === ''){
            resourceType = undefined;
          }
          const updatedNode = await Notebook.findOneAndUpdate(
            { nodeId },
            { title, type, content,resourceType },
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
  const nodes = await Notebook.find();
  const results = [];
  for (const node of nodes) {
    results.push(node);
    const childDescendants = await getDescendants(node.nodeId);
    results.push(...childDescendants);
  }

  return results;
}

async function getNestedDescendants(parentId: string, notes: any[]): Promise<any[]> {
  // Filter nodes with the given parentId
  const nodes = notes.filter((node) => node.parentId === parentId);

  const results = [];
  let count = 1;
  const parentNode = notes.find((node) => node.nodeId === parentId);
  if (parentNode) {
    console.log(count++);
    results.push(parentNode); 
  }

  for (const node of nodes) {
    results.push(node);

    const childDescendants = await getNestedDescendants(node.nodeId, notes);
    results.push(...childDescendants);
  }
  return results;
}

// Recursive function to build the tree structure dynamically
const buildTree = (data: any[], parentId: string | null): any[] => {
  const parentNode = data.find((item) => item.nodeId === parentId);
  const children = data
    .filter((item) => item.parentId === parentId)
    .map((item) => ({
      ...item,
      children: buildTree(data, item.nodeId),
    }));
  if (parentNode) {
    return [
      {
        ...parentNode,
        children: children,
      },
    ];
  }
  return children;
};


// const buildTree = (data: TreeNode[], parentId: string | null = null): TreeNode[] => {
//   const nodes = data.filter((item) => item.parentId === parentId);

//   return nodes.map((node) => ({
//     ...node, // Keep all properties of the node, including parentId
//     children: buildTree(data, node.nodeId), // Recursively build children under the current node
//   }));
// };

// const buildTree = (data: TreeNode[], parentId: string | null = null): TreeNode[] => {
//   const parentNode = data.find((item) => item.nodeId === parentId);

//   // Start by including the parent node in the tree
//   const tree: TreeNode[] = parentNode ? [{
//     ...parentNode,
//     children: [] // Initialize children as an empty array, which will be populated
//   }] : [];

//   const children = data
//     .filter((item) => item.parentId === parentId && item.nodeId !== parentId) // Exclude the parent itself
//     .map((item) => ({
//       ...item,
//       children: buildTree(data, item.nodeId)
//     }));

//   if (tree.length > 0) {
//     tree[0].children = children;
//   }
//   return tree;
// };
