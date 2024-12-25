import { useEffect, useState } from "react";
import Sidebar from "./notebook/Sidebar";
import NodeEditor from "./notebook/NodeEditor";
import MindMap from "./notebook/MindMap";
import { fetchNodes, addNode, deleteNode, saveContent,fetchDescendants } from "../api/utils";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Define the Node type
type Node = {
  id: string;
  nodeId: string;
  title: string;
  type: "folder" | "file";
  parentId: string | null;
  children: Node[];
  generated: boolean;
};

const NotebookPage: React.FC = () => {
  // Use the Node type for state
  const [nodes, setNodes] = useState<Node[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [fetched, setFetched] = useState<Record<string, boolean>>({}); 
  const [showMindMap, setShowMindMapState] = useState(false); // Whether to show MindMap
  const [mindMapNodeId, setMindMapNodeId] = useState<string | null>(null); // Node for MindMap


  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchNodes();
        setNodes(data.map((n: any) => ({ ...n, id: n.nodeId })));
      } catch (error) {
        toast.error("Failed to load nodes.");
      }
    };
    fetchData();
  }, []);

    const setShowMindMap = (nodeId: string) => {
      setMindMapNodeId(nodeId); // Set the selected node's ID
      setShowMindMapState(true); // Show the Mind Map
    };

    const handleHideMindMap = () => {
      setShowMindMapState(false); // Hide the Mind Map
      setMindMapNodeId(null); // Clear the selected node ID
    };


  const handleAddNode = async (parentId: string | null, type: "folder" | "file") => {
    const title = prompt(`Enter name for the new ${type}:`);
    if (!title) return toast.error("Name is required!");
    
    try {
      const newNode: Node = await addNode(title, type, parentId);
      setNodes([...nodes, { ...newNode, id: newNode.nodeId }]); // TypeScript knows `prev` is of type `Node[]`
    } catch (error) {
      toast.error("Failed to add node.");
    }
  };

  const handleDeleteNode = async (nodeId: string) => {
    try {
      await deleteNode(nodeId);
      setNodes((prev) => prev.filter((node) => node.id !== nodeId)); // Correct filtering
    } catch (error) {
      toast.error("Failed to delete node.");
    }
  };

  const handleSaveContent = async (nodeId: string, content: string) => {
    try {
      await saveContent(nodeId, content);
      toast.success("Content saved.");
    } catch (error) {
      toast.error("Failed to save content.");
    }
  };

  const fetchChildrenNode = async (node: Node) => {
    try {
      if (!fetched[node.nodeId]) {
        setFetched((prev) => ({
          ...prev,
          [node.nodeId]: true,
        }));
  
        if (node.type === "folder") {
          const descendants = await fetchDescendants(node);
          const updatedNodes = nodes.filter((n) => !descendants.some((d: any) => d.id === n.id));
          setNodes([...updatedNodes, ...descendants]);
        }
      }
      setSelectedNode(node);
    } catch (error) {
      toast.error("Failed to load nodes.");
    }
  };
  const buildTree = (nodes: Node[], parentId: string | null = null): Node[] =>
    nodes
      .filter((node) => node.parentId === parentId)
      .map((node) => ({ ...node, children: buildTree(nodes, node.id) }));
  

  return (
    <div className="flex h-screen p-0">
      <ToastContainer />
      <Sidebar tree={buildTree(nodes)} onAddNode={handleAddNode} onDeleteNode={handleDeleteNode} onSelectNode={fetchChildrenNode} setShowMindMap={setShowMindMap} />
      <div className="flex-grow">
        {showMindMap ? (
          <MindMap parentId={mindMapNodeId || ""} onClose={handleHideMindMap} />
        ) : (
          <NodeEditor node={selectedNode} onSaveContent={handleSaveContent} />
        )}
      </div>
    </div>

  );
};

export default NotebookPage;