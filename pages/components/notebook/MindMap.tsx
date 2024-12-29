import React, { useState, useEffect, useCallback } from "react";
import ReactFlow, {
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  addEdge,
  Background,
} from "reactflow";
import "reactflow/dist/style.css";
import { fetchMindMap } from "@/pages/api/utils";
import { AiFillCloseCircle } from "react-icons/ai";

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

const MindMap: React.FC<MindMapProps> = ({ parentId, onClose }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fileNodeDetails, setFileNodeDetails] = useState<TreeNode | null>(null); // Renamed `selectedNode`

  const handleFileNodeClick = (event: React.MouseEvent, node: any) => { // Renamed `onNodeClick`
    if (node.type === "file") {
      const foundNode = nodes.find((n: any) => n.id === node.id);
      setFileNodeDetails({
        nodeId: node.id,
        title: foundNode?.data.label || "",
        type: "file",
        parentId: null,
        content: foundNode?.data.content || "No content available",
        children: [],
      });
    }
  };

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    []
  );

  const getNodeColor = (depth: number) => {
    const pastelColors = [
      "#f7c6d7", "#f9e1a3", "#c0e2b4", "#a2c2ea", "#f7a1b1", "#a8e0ff", "#f6d8d8",
      "#c1e6c5", "#fbe2a7", "#d8a3e7",
    ];
    return pastelColors[depth % pastelColors.length];
  };

  const fetchAndTransformData = async () => {
    try {
      setLoading(true);
      const res = await fetchMindMap(parentId);
      const treeData: TreeNode[] = res;

      const nodes: any[] = [];
      const edges: any[] = [];
      const occupiedPositions = new Set<string>();

      const traverseTree = (
        node: TreeNode,
        parentId: string | null,
        depth: number,
        angleStart: number,
        angleEnd: number,
        radiusMultiplier: number
      ) => {
        let radius = depth * radiusMultiplier; // Adjust radius per level
        const angle = (angleStart + angleEnd) / 2; // Calculate node angle
        let x = radius * Math.cos(angle);
        let y = radius * Math.sin(angle);

        const findFreePosition = (x: number, y: number) => {
          let spiralRadius = 5;
          let spiralAngle = 0;
          while (occupiedPositions.has(`${Math.round(x)},${Math.round(y)}`)) {
            x += spiralRadius * Math.cos(spiralAngle);
            y += spiralRadius * Math.sin(spiralAngle);
            spiralAngle += Math.PI / 4;
            spiralRadius += 2;
          }
          return { x, y };
        };

        const adjustedPosition = findFreePosition(x, y);
        x = adjustedPosition.x;
        y = adjustedPosition.y;

        occupiedPositions.add(`${Math.round(x)},${Math.round(y)}`);

        nodes.push({
          id: node.nodeId,
          data: { label: node.title, content: node.content },
          position: { x, y },
          style: { backgroundColor: getNodeColor(depth), color: "#333", borderRadius: "8px" },
          type: node.type,
        });

        if (parentId) {
          edges.push({
            id: `${parentId}-${node.nodeId}`,
            source: parentId,
            target: node.nodeId,
            animated: true,
          });
        }

        const childrenCount = node.children.length;
        const angleStep = (angleEnd - angleStart) / Math.max(childrenCount, 1);

        node.children.forEach((child, index) => {
          traverseTree(
            child,
            node.nodeId,
            depth + 1,
            angleStart + index * angleStep,
            angleStart + (index + 1) * angleStep,
            radiusMultiplier
          );
        });
      };

      const initialRadiusMultiplier = 200;
      treeData.forEach((rootNode, index) => {
        traverseTree(
          rootNode,
          null,
          1,
          (2 * Math.PI * index) / treeData.length,
          (2 * Math.PI * (index + 1)) / treeData.length,
          initialRadiusMultiplier
        );
      });

      setNodes(nodes);
      setEdges(edges);
    } catch (err: any) {
      console.error("Error fetching or processing mind map data:", err);
      setError("Failed to load mind map.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAndTransformData();
  }, [parentId]);

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
    <div style={{ height: "90vh", position: "relative", display: "flex" }}>
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={handleFileNodeClick}
          fitView
          style={{ backgroundColor: "#F7F9FB" }}
        >
          <Background />
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
      {fileNodeDetails && (
        <div className="fixed relative top-0 right-0 z-10 w-1/2 scrollabler rounded-lg bg-slate-300 shadow-xl flex items-center justify-center">
          <div className="bg-white rounded-lg h-96 p-4 w-full overflow-x-hidden overflow-y-scroll scrollabler relative">
            <button 
              onClick={() => setFileNodeDetails(null)} 
              className="absolute top-4 right-4 text-black"
            >
              ×
            </button>
            <div>
                <div className="w-full space-y-2">
                  <p>
                    <strong>{fileNodeDetails.title}</strong> 
                  </p>
                  <p> 
                    <div
                      dangerouslySetInnerHTML={{
                        __html: fileNodeDetails.content || "Solution will appear here...",
                      }}
                      className="p-4 whitespace-normal break-words"
                    />
                  </p>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MindMap;
