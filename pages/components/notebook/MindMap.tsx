import React, { useState, useEffect } from "react";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  Position,
  Node,
  Edge,
  ReactFlowProvider,
} from "reactflow";
import "reactflow/dist/style.css";
import { fetchMindMap } from "../../api/utils";

type TreeNode = {
  nodeId: string;
  title: string;
  type: string;
  parentId: string | null;
  content?: string;
  children: TreeNode[]; // Recursive definition for children
};

type MindMapProps = {
  parentId: string; // Required prop to specify which node's mind map to show
  onClose: () => void; // Callback to close the Mind Map view
};

const MindMap: React.FC<MindMapProps> = ({ parentId, onClose }) => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTreeData = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetchMindMap(parentId); // Fetch the mind map for the given nodeId

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
  }, [parentId]); // Re-run the effect when nodeId changes

  const transformTreeToFlow = (treeData: TreeNode[]) => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    const traverse = (
      items: TreeNode[],
      currentX: number,
      currentY: number,
      parentId: string | null = null
    ) => {
      let xOffset = currentX;

      items.forEach((item) => {
        const nodeId = item.nodeId;

        const newNode: Node = {
          id: nodeId,
          data: { label: item.title },
          position: { x: xOffset, y: currentY },
          type: "default",
          style: {
            backgroundColor: "#ffcc00", // Custom background color
            color: "black", // Text color
            padding: "10px",
            borderRadius: "5px",
            fontSize: "14px",
            border: "2px solid #333", // Border for clarity
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", // Add shadow for a clearer node appearance
          },
        };

        nodes.push(newNode);

        if (parentId) {
          edges.push({
            id: `${parentId}-${nodeId}`,
            source: parentId,
            target: nodeId,
            animated: true,
            style: { stroke: "#00f" }, // Edge color
          });
        }

        const childY = currentY + 150;
        const childXOffset = xOffset - (item.children?.length || 0) * 100;
        traverse(item.children || [], childXOffset, childY, nodeId);

        xOffset += 200; // Adjust to ensure proper spacing
      });
    };

    traverse(treeData, 0, 0);

    return { nodes, edges };
  };

  const handleNodeDragStop = (event: any, node: Node) => {
    setNodes((prevNodes) =>
      prevNodes.map((n) =>
        n.id === node.id
          ? { ...n, position: { x: node.position.x, y: node.position.y } }
          : n
      )
    );
  };

  if (loading) {
    return <div>Loading Mind Map...</div>;
  }

  if (error) {
    return (
      <div>
        <p>Error loading Mind Map: {error}</p>
        <button onClick={onClose}>Close</button>
      </div>
    );
  }

  return (
    <ReactFlowProvider>
      <div style={{ width: "100%", height: "100vh" }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          fitView
          nodesConnectable={false}
          nodesDraggable={true}
          onNodeDragStop={handleNodeDragStop} // Handle node drag stop
        >
          <MiniMap />
          <Controls />
          <Background color="#aaa" gap={12} />
        </ReactFlow>
        <button
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            padding: "10px 15px",
            backgroundColor: "#f56565",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
          onClick={onClose}
        >
          Close Mind Map
        </button>
      </div>
    </ReactFlowProvider>
  );
};

export default MindMap;
