import React, { useState, useEffect } from "react";
import ReactFlow, {
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  MiniMap,
  Controls,
  Background,
  Node,
  Edge,
} from "reactflow";
import "reactflow/dist/style.css";
import { AiFillCloseCircle } from "react-icons/ai";
import { fetchMindMap } from "@/pages/api/utils";

// Define types for TreeNode and props
type TreeNode = {
  nodeId: string;
  title: string;
  type: string;
  parentId: string | null;
  content?: string;
  children: TreeNode[];
};

type MindMapProps = {
  parentId: string;
  onClose: () => void;
};

// Main MindMap component
const MindMap: React.FC<MindMapProps> = ({ parentId, onClose }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node[]>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTreeData = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetchMindMap(parentId);
        const treeData: TreeNode[] = res;
        const { nodes, edges } = transformTreeToFlow(treeData);
        setNodes(nodes);
        setEdges(edges);
      } catch (err: any) {
        console.error("Error fetching mind map:", err);
        setError(err.message || "An unknown error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchTreeData();
  }, [parentId]);

  // Recursive function to transform tree into React Flow nodes and edges
  const transformTreeToFlow = (
    treeData: TreeNode[],
    parentId: string | null = null
  ) => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    let maxDepth = 0;

    // Calculate the maximum depth of the tree
    const calculateDepth = (node: TreeNode, depth: number): number => {
      maxDepth = Math.max(maxDepth, depth);
      node.children.forEach((child) => calculateDepth(child, depth + 1));
      return maxDepth;
    };
    treeData.forEach((rootNode) => calculateDepth(rootNode, 1));

    // Recursive function to position nodes
    const traverseTree = (
      node: TreeNode,
      parentId: string | null,
      level: number,
      centerX: number,
      centerY: number,
      angleStart: number,
      angleEnd: number
    ) => {

      // Calculate dynamic distance based on depth
      const baseDistance = maxDepth * 100; // Base distance for root nodes
      const depthFactor = 50; // Reduce distance with depth
      const distance = baseDistance - depthFactor * level;
      // Calculate the available angle range for this node's children
      const childrenCount = node.children.length;
      const angleRange = angleEnd - angleStart;

      // Adjust angle spacing based on depth and number of children
      const depthAngleScaling = Math.max(0.5, 1 - level * 0.1); // Reduce angle range at deeper levels
      const adjustedAngleRange = angleRange * depthAngleScaling;

      // Calculate this node's position
      const angle = (angleStart + angleEnd) / 2; // Midpoint angle for the current node
      const x = centerX + distance * Math.cos(angle);
      const y = centerY + distance * Math.sin(angle);

      // Create the node
      const newNode: Node = {
        id: node.nodeId,
        type: "default",
        data: { label: node.title },
        position: { x, y },
        style: {
          backgroundColor: node.type === "folder" ? "#FFD700" : "#6AB9FF",
          fontWeight: "bold",
          padding: "10px",
        },
      };
      nodes.push(newNode);

      // Add an edge to the parent
      if (parentId) {
        edges.push({
          id: `${parentId}-${node.nodeId}`,
          source: parentId,
          target: node.nodeId,
          animated: true,
        });
      }

      // Adjust child node positioning
      const childAngleSpacing = adjustedAngleRange * level / Math.max(childrenCount, 1); // Spread adjusted angle over children

      node.children.forEach((child, index) => {
        // Calculate the angles for child nodes
        const childAngleStart = angleStart + index * childAngleSpacing;
        const childAngleEnd = childAngleStart + childAngleSpacing;

        // Recurse for child nodes
        traverseTree(child, node.nodeId, level + 1, x, y, childAngleStart, childAngleEnd);
      });
    };

    // Start traversal from root nodes
    const rootAngleStart = 0;
    const rootAngleEnd = 2 * Math.PI;
    treeData.forEach((rootNode, index) => {
      const centerX = 5000 + index * 800; // Adjust starting center position
      const centerY = 5000;
      traverseTree(rootNode, parentId, 1, centerX, centerY, rootAngleStart, rootAngleEnd);
    });

    return { nodes, edges };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div role="status" className="flex flex-col items-center space-y-2">
          <span>Loading Mind Map...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center p-6 text-center">
        <p className="mb-4 text-red-500">Error: {error}</p>
        <button
          className="px-4 py-2 text-white bg-blue-600 rounded"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ height: "90vh", position: "relative" }}>
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
        >
          <MiniMap />
          <Controls />
          <Background color="#aaa" gap={16} />
        </ReactFlow>
      </ReactFlowProvider>
      <AiFillCloseCircle
        onClick={onClose}
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          fontSize: "24px",
          cursor: "pointer",
          color: "red",
        }}
      />
    </div>
  );
};

export default MindMap;
