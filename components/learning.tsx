import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import ReactFlow, {
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  addEdge,
  MiniMap,
  Controls,
  Connection,
  Node,
  Edge,
} from "reactflow";
import "reactflow/dist/style.css";
import "tailwindcss/tailwind.css"; // Ensure tailwind is properly imported
import DOMPurify from 'dompurify';

// Types for the document and topic structure
interface IDocument {
  _id: string;
  type: "ai" | "note";
  content: string | IContentItem[];
  name: string;
}

interface ITopic {
  _id: string;
  title: string;
  isCompleted: boolean;
  resourceUrl?: string;
  resourceUrls?: string[];
  documents?: IDocument[];
}

interface IMetadata {
  level: string;
}

interface IContentItem {
  _id: string;
  content: string;
  metadata: IMetadata;
  type: string;
}

// Default Input Data
const defaultInputData: Record<string, IContentItem[]> = {
  Beginner: [],
  Intermediate: [],
  Advanced: [],
};

// Constants for the circular layout
const CIRCLE_RADIUS = 300;
const TOPIC_CENTER = { x: 400, y: 300 };

// Utility function to create nodes and edges in a circular layout
const createNodesAndEdges = (
  inputData: Record<string, IContentItem[]>,
  topicName: string
): { nodes: Node[]; edges: Edge[] } => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const levels = ["Beginner", "Intermediate", "Advanced", "Extra"];

  // Constants for positioning
  const TOPIC_RADIUS = 500; // Distance of levels from the center topic
  const LEVEL_RADIUS = 280; // Distance of sub-topics from level nodes
  const TOPIC_CENTER = { x: 500, y: 300 }; // Center position of the topic node

  // Create the central topic node
  const topicNodeId = "topic-center";
  nodes.push({
    id: topicNodeId,
    type: "default",
    data: { label: topicName || "Topic Name" },
    position: TOPIC_CENTER,
    style: {
      backgroundColor: "#FFCC00",
      color: "#000",
      fontWeight: "bold",
      textAlign: "center",
    },
  });

  // Generate level nodes in a circular layout
  const levelNodes: { [key: string]: string } = {};
  const levelAngleStep = (2 * Math.PI) / levels.length;

  levels.forEach((level, index) => {
    const angle = index * levelAngleStep;

    const levelPosX = TOPIC_CENTER.x + TOPIC_RADIUS * Math.cos(angle);
    const levelPosY = TOPIC_CENTER.y + TOPIC_RADIUS * Math.sin(angle);

    const levelNodeId = `level-${level}`;
    levelNodes[level] = levelNodeId;

    nodes.push({
      id: levelNodeId,
      type: "default",
      data: { label: level },
      position: { x: levelPosX, y: levelPosY },
      style: {
        backgroundColor: "#87CEEB",
        color: "#000",
        fontWeight: "bold",
      },
    });

    edges.push({
      id: `edge-${topicNodeId}-${levelNodeId}`,
      source: topicNodeId,
      target: levelNodeId,
      animated: true,
      style: { stroke: "#FFAA00", strokeWidth: 2 },
    });

    // Add sub-topic nodes around each level node
    const group = inputData[level as keyof typeof inputData];
    if (group && group.length > 0) {
      const subAngleStep = (2 * Math.PI) / group.length;

      group.forEach((item, itemIndex) => {
        const subAngle = itemIndex * subAngleStep;

        const subPosX = levelPosX + LEVEL_RADIUS * Math.cos(subAngle);
        const subPosY = levelPosY + LEVEL_RADIUS * Math.sin(subAngle);

        const subNodeId = `${level}-${item._id}`;
        nodes.push({
          id: subNodeId,
          type: "default",
          data: { label: `${item.type}` },
          position: { x: subPosX, y: subPosY },
          style: { backgroundColor: "#FFFFFF", color: "#333" },
        });

        edges.push({
          id: `edge-${levelNodeId}-${subNodeId}`,
          source: levelNodeId,
          target: subNodeId,
          animated: true,
          style: { stroke: "#87CEEB", strokeWidth: 2 },
        });
      });
    }
  });

  return { nodes, edges };
};

// SyllabusMap Component
const SyllabusMap: React.FC = () => {
  const [inputData, setInputData] = useState<Record<string, IContentItem[]>>(defaultInputData);
  const [loading, setLoading] = useState<boolean>(false);
  const [topicName, setTopicName] = useState<string>("Learning Syllabus");
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [nodeData, setNodeData] = useState<IContentItem | null>(null);

  const { nodes: initialNodes, edges: initialEdges } = createNodesAndEdges(inputData, topicName);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback((params: Connection) => {
    setEdges((eds) => addEdge(params, eds));
  }, []);

  const onNodeClick = (event: any, node: Node) => {
    const nodeId = node.id;
    const level = nodeId.split("-")[0];
    const contentItems = inputData[level as keyof typeof inputData];
    const clickedNodeData = contentItems?.find(item => item._id === nodeId.split("-")[1]);
    setNodeData(clickedNodeData || null);
    setSidebarOpen(true);
  };

  const onCloseSidebar = () => {
    setSidebarOpen(false);
    setNodeData(null);
  };

  // Fetch the topic data from the server
  const fetchTopic = async () => {
    setLoading(true);
    try {
      const currentPage = 0;
      const response = await fetch(`/api/getTopicData?page=${currentPage}`);
      const data: ITopic[] = await response.json();

      if (data.length > 0) {
        const firstTopic = data[0];
        setTopicName(firstTopic.title || "Learning Syllabus");

        if (firstTopic.documents && firstTopic.documents.length > 0) {
          const firstDocument = firstTopic.documents[0];

          if (firstDocument.content) {
            const documentContent = Array.isArray(firstDocument.content)
              ? firstDocument.content
              : [firstDocument.content];

            const levels = ["Beginner", "Intermediate", "Advanced", "Extra"];
            const groupedContent = documentContent.reduce((acc: any, item: any) => {
              const level = item.metadata?.level || "Extra"; // Default to "extra" if no level exists
              if (!acc[level]) acc[level] = [];
              acc[level].push(item);
              return acc;
            }, {});

            // Ensure levels appear in the desired order
            const orderedContent = levels.reduce((acc: any, level) => {
              if (groupedContent[level]) {
                acc[level] = groupedContent[level];
              }
              return acc;
            }, {});

            setInputData(orderedContent);
            console.log(" found.", orderedContent);
          } else {
            console.log("No valid content with metadata found.");
          }
        }
      } else {
        toast.info("No more topics available.");
      }
    } catch (error) {
      console.error("Error fetching topic:", error);
      toast.error("Failed to fetch topic.");
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchTopic();
  }, []);

  useEffect(() => {
    const { nodes: updatedNodes, edges: updatedEdges } = createNodesAndEdges(inputData, topicName);
    setNodes(updatedNodes);
    setEdges(updatedEdges);
  }, [inputData, topicName]);

  return (
    <div className="flex h-screen">
      <div className={`flex-1 ${sidebarOpen ? "w-2/3" : "w-full"}`}>
        {loading && <div className="absolute top-1/2 left-1/2">Loading...</div>}
        <ReactFlowProvider>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            fitView
            style={{ height: "100%", width: "100%" }}
          >
            <MiniMap />
            <Controls />
          </ReactFlow>
        </ReactFlowProvider>
      </div>

      {/* Sidebar on the right */}
      {sidebarOpen && (
        <div className="fixed relative top-0 right-0 z-10 h-3/4 w-1/2 scrollabler rounded-lg bg-slate-300 shadow-xl flex items-center justify-center">
          <div className="bg-white rounded-lg h-96 p-4 w-full overflow-x-hidden overflow-y-scroll scrollabler relative">
            <button onClick={onCloseSidebar} className="absolute top-4 left-4 text-gray-500">
              ×
            </button>
            <h2 className="text-xl font-bold mb-2">Content</h2>
            <div>
              {nodeData ? (
                <div className="w-full space-y-2">
                  <p>
                    <strong>Type:</strong> {nodeData.type}
                  </p>
                  <p>
                    <strong>Content:</strong>
                    <div
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(JSON.parse(nodeData.content || JSON.stringify('solution will appear here...'))),
                      }}
                      className="p-4 whitespace-normal break-words"
                    />
                  </p>
                </div>
              ) : (
                <p>No content available</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SyllabusMap