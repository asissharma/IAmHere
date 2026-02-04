import { useEffect, useState } from "react";
import Sidebar from "./notebook/Sidebar";
import NodeEditor from "./notebook/NodeEditor";
import MindMap from "./notebook/MindMap";
import CreateNodeModal from "./notebook/CreateNodeModal";
import SyllabusDashboard from "./notebook/SyllabusDashboard";
import FolderView from "./notebook/FolderView";
import WelcomeView from "./notebook/WelcomeView";
import { fetchNodes, addNode, deleteNode, saveContent, fetchDescendants } from "../api/utils";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaPlus, FaSearch, FaBars, FaTimes } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

// Define the Node type
type Node = {
  id: string;
  nodeId: string;
  title: string;
  type: "syllabus" | "folder" | "file";
  parentId: string | null;
  children: Node[];
  resourceType: string;
  generated: boolean;
  tags?: string[];
  pinned?: boolean;
};

const NotebookPage: React.FC = () => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [fetched, setFetched] = useState<Record<string, boolean>>({});

  // View Modes
  const [showMindMap, setShowMindMapState] = useState(false);
  const [mindMapNodeId, setMindMapNodeId] = useState<string | null>(null);

  // UI State
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalProps, setModalProps] = useState<{ parentId: string | null; type: "syllabus" | "folder" | "file" }>({
    parentId: null,
    type: "file",
  });

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
    setMindMapNodeId(nodeId);
    setShowMindMapState(true);
  };

  const handleHideMindMap = () => {
    setShowMindMapState(false);
    setMindMapNodeId(null);
  };

  const handleNavigate = (nodeId: string) => {
    const target = nodes.find(n => n.nodeId === nodeId);
    if (target) {
      if (!fetched[target.nodeId] && (target.type === "folder" || target.type === "syllabus")) {
        fetchChildrenNode(target);
      } else {
        setSelectedNode(target);
      }
    }
  };

  const handleAddNodeRequest = (parentId: string | null, type: "syllabus" | "folder" | "file") => {
    setModalProps({ parentId, type });
    setIsModalOpen(true);
  };

  const handleCreateNode = async (title: string, type: "syllabus" | "folder" | "file", tags: string[], pinned: boolean) => {
    try {
      const newNode: any = await addNode(title, type, modalProps.parentId, tags, pinned);
      setNodes((prev) => [...prev, { ...newNode, id: newNode.nodeId, children: [] }]);
      setIsModalOpen(false);
      toast.success(`${type} created successfully!`);
      if (modalProps.parentId) { // If adding to a node, expand it or refresh it?
        // Optimistic update handled by modifying nodes state above, but sidebar might need to re-render tree logic
      }
    } catch (error) {
      toast.error("Failed to add node.");
    }
  };

  const handleDeleteNode = async (nodeId: string) => {
    if (!confirm("Are you sure you want to delete this?")) return;
    try {
      await deleteNode(nodeId);
      setNodes((prev) => prev.filter((node) => node.id !== nodeId));
      if (selectedNode?.id === nodeId) {
        setSelectedNode(null);
      }
    } catch (error) {
      toast.error("Failed to delete node.");
    }
  };

  const handleSaveContent = async (nodeId: string, content: string, resourceType: string) => {
    await saveContent(nodeId, content, resourceType);
    toast.success("Saved");
  };

  const fetchChildrenNode = async (node: Node) => {
    try {
      if (!fetched[node.nodeId]) {
        setFetched((prev) => ({ ...prev, [node.nodeId]: true }));
        if (node.type === "folder" || node.type === "syllabus") {
          const descendants = await fetchDescendants(node);
          const descendantIds = new Set(descendants.map((d: any) => d.nodeId));
          const updatedNodes = nodes.filter(n => !descendantIds.has(n.nodeId));
          setNodes([...updatedNodes, ...descendants]);
        }
      }
      setSelectedNode(node);
    } catch (error) {
      toast.error("Failed to load nodes.");
    }
  };

  const getDirectChildren = (parentId: string) => nodes.filter(n => n.parentId === parentId);

  const buildTree = (nodes: Node[], parentId: string | null = null): Node[] =>
    nodes
      .filter((node) => node.parentId === parentId)
      .map((node) => ({ ...node, children: buildTree(nodes, node.id) }));

  const renderContent = () => {
    if (!selectedNode) {
      return <WelcomeView onAdd={handleAddNodeRequest} />;
    }
    const nodeWithChildren = { ...selectedNode, children: getDirectChildren(selectedNode.nodeId) };

    switch (selectedNode.type) {
      case "syllabus":
        return <SyllabusDashboard node={nodeWithChildren} onNavigate={handleNavigate} />;
      case "folder":
        return <FolderView node={nodeWithChildren} onNavigate={handleNavigate} onAdd={handleAddNodeRequest} />;
      case "file":
        return <NodeEditor node={selectedNode} onSaveContent={handleSaveContent} />;
      default:
        return <WelcomeView onAdd={handleAddNodeRequest} />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans overflow-hidden">
      <ToastContainer position="bottom-right" theme="colored" autoClose={2000} hideProgressBar />

      {/* Ultra-Compact Main Bar (36px) - Merges Header + Toolbar logic */}
      <div className="flex-none h-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-3 z-20 shrink-0">

        {/* Left: Sidebar Toggle + Title/Breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-500"
            title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            <FaBars size={14} />
          </button>

          <div className="flex items-center gap-2 text-sm font-semibold select-none cursor-pointer" onClick={() => setSelectedNode(null)}>
            <div className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold">N</div>
            <span className="hidden sm:inline">Notebook</span>
            {selectedNode && (
              <>
                <span className="text-gray-400">/</span>
                <span className="text-gray-600 dark:text-gray-300 font-normal truncate max-w-[150px]">{selectedNode.title}</span>
              </>
            )}
          </div>
        </div>

        {/* Center: Search (Compact) */}
        <div className="flex-1 max-w-md mx-4">
          <div className="relative group w-full">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
              <FaSearch className="text-gray-300 group-focus-within:text-blue-500 text-xs" />
            </div>
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 text-xs focus:bg-white dark:focus:bg-gray-900 focus:border-blue-500 outline-none transition-all focus:w-full"
            />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleAddNodeRequest(null, "syllabus")}
            className="flex items-center gap-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors"
          >
            <FaPlus className="text-[10px]" /> <span className="hidden sm:inline">New Syllabus</span>
          </button>
        </div>
      </div>

      {/* Main Layout Area */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar */}
        <Sidebar
          tree={buildTree(nodes)}
          onAddNode={handleAddNodeRequest}
          onDeleteNode={handleDeleteNode}
          onSelectNode={fetchChildrenNode}
          setShowMindMap={setShowMindMap}
          searchQuery={searchQuery}
          isCollapsed={isSidebarCollapsed}
          toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        {/* Content */}
        <main className="flex-grow flex flex-col min-w-0 bg-white dark:bg-gray-950 relative overflow-hidden">

          <AnimatePresence>
            {showMindMap && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 bg-white dark:bg-gray-900"
              >
                <MindMap parentId={mindMapNodeId || ""} onClose={handleHideMindMap} onNavigate={handleNavigate} />
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            key={selectedNode ? selectedNode.nodeId : 'welcome'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
            className="h-full w-full"
          >
            {renderContent()}
          </motion.div>
        </main>
      </div>

      <CreateNodeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateNode}
        parentId={modalProps.parentId}
        initialType={modalProps.type}
      />
    </div>
  );
};

export default NotebookPage;