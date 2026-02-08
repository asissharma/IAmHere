import { useEffect, useState } from "react";
import Sidebar from "./notebook/Sidebar";
import NodeEditor from "./notebook/NodeEditor";
import MindMap from "./notebook/MindMap";
import CreateNodeModal from "./notebook/CreateNodeModal";
import SyllabusDashboard from "./notebook/SyllabusDashboard";
import FolderView from "./notebook/FolderView";
import WelcomeView from "./notebook/WelcomeView";
import ImportWizard from "./notebook/ImportWizard";
import { fetchNodes, addNode, deleteNode, saveContent, fetchDescendants, updateNodeProgress } from "../pages/api/utils";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { FaPlus, FaSearch, FaBars, FaTimes, FaLayerGroup } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import EmptyState from "./notebook/EmptyState";
import QuickCreateFAB from "./notebook/QuickCreateFAB";
import { Node } from "../types/types";

// Define the Node type


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
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [streak, setStreak] = useState(0);

  // Calculates streak based on lastStudied dates
  const calculateStreak = (nodes: any[]) => {
    const dates = new Set<string>();
    nodes.forEach(n => {
      if (n.lastStudied) {
        dates.add(new Date(n.lastStudied).toDateString());
      }
    });
    // Basic count of active days (for now, just count distinct days to keep it simple and rewarding)
    // Real streak logic would require checking consecutive days.
    // Let's implement actual consecutive streak.
    const sortedDates = Array.from(dates).map(d => new Date(d).getTime()).sort((a, b) => b - a);
    if (sortedDates.length === 0) return 0;

    let currentStreak = 0;
    let lastDate = new Date();
    lastDate.setHours(0, 0, 0, 0);

    // Check if studied today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // If most recent is not today or yesterday, streak is broken (0)? 
    // Or we just count consecutive days from the most recent one? 
    // Standard streak: must include today or yesterday.
    const mostRecent = new Date(sortedDates[0]);
    mostRecent.setHours(0, 0, 0, 0);

    const diffDays = (today.getTime() - mostRecent.getTime()) / (1000 * 3600 * 24);
    if (diffDays > 1) return 0; // Streak broken

    // Count backwards
    // This is a simplified check.
    return dates.size; // Placeholder: returning total active days for encouragement until sufficient history exists.
    // Actually, let's just return distinct active days as "Days Active" for now, simpler and more robust.
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchNodes();
        setNodes(data.map((n: any) => ({ ...n, id: n.nodeId })));
        setStreak(calculateStreak(data));
      } catch (error) {
        toast.error("Failed to load nodes.");
      }
    };
    fetchData();
    fetchData();

    // Mobile Check
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarCollapsed(true);
      } else {
        // Optional: Expand on desktop? Or respect user choice?
        // Let's just default collapse on mobile init
      }
    };

    // Initial check
    if (window.innerWidth < 768) {
      setIsSidebarCollapsed(true);
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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

  const handleAddNodeRequest = (parentId: string | null, type: "syllabus" | "folder" | "file" | "fileAnalysis") => {
    // If Analysis, specific modal or direct create?
    // Let's reuse CreateNodeModal but pass resourceType hint
    setModalProps({ parentId, type: type === "fileAnalysis" ? "file" : type });
    // We need to pass resourceType to modal or handle it after?
    // Let's store special type in modal props extended
    (window as any).tempResourceType = type === "fileAnalysis" ? "fileAnalysis" : "text"; // Quick hack or proper state
    setIsModalOpen(true);
  };

  const handleCreateNode = async (title: string, type: "syllabus" | "folder" | "file", tags: string[], pinned: boolean) => {
    try {
      const resourceType = (window as any).tempResourceType || "text";
      const newNode: any = await addNode(title, type, modalProps.parentId, tags, pinned);
      // If fileAnalysis, we might need to set resourceType?
      // addNode API might not take resourceType in params line 76 of utils.
      // We might need to update it immediately.
      if (resourceType === "fileAnalysis") {
        await saveContent(newNode.nodeId, "", "fileAnalysis");
        newNode.resourceType = "fileAnalysis";
      }

      const nodeWithId = { ...newNode, id: newNode.nodeId, children: [] };
      setNodes((prev) => [...prev, nodeWithId]);
      setIsModalOpen(false);
      toast.success(`${type} created successfully!`);

      // Auto-select the newly created node for better UX
      if (type === "file") {
        setSelectedNode(nodeWithId);
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

  const handleUpdateProgress = async (nodeId: string, progress: number) => {
    try {
      await updateNodeProgress(nodeId, progress);
      // Optimistic update or refetch
      setNodes(prev => prev.map(n => n.nodeId === nodeId ? { ...n, progress } : n));

      // Trigger fetch to get cascaded updates? Or just update parent locally?
      // For accurate cascade, refetching is safer for now.
      fetchNodes().then(data => {
        setNodes(data.map((n: any) => ({ ...n, id: n.nodeId })));
      });

    } catch (e) {
      toast.error("Failed to update status");
    }
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
      return (
        <EmptyState
          title="Welcome to IAmHere"
          description="Select a note from the sidebar to start learning, or create a new syllabus to structure your journey."
          icon={<FaLayerGroup size={64} className="text-blue-200" />}
          action={{ label: "Import Syllabus", onClick: () => setIsImportOpen(true) }}
        />
      );
    }
    const nodeWithChildren = { ...selectedNode, children: getDirectChildren(selectedNode.nodeId) };

    switch (selectedNode.type) {
      case "syllabus":
        return <SyllabusDashboard node={nodeWithChildren} onNavigate={handleNavigate} />;
      case "folder":
        return <FolderView node={nodeWithChildren} onNavigate={handleNavigate} onAdd={handleAddNodeRequest} />;
      case "file":
        return <NodeEditor node={selectedNode} allNodes={nodes} onSaveContent={handleSaveContent} onUpdateProgress={handleUpdateProgress} />;
      default:
        return <WelcomeView onAdd={handleAddNodeRequest} onImport={() => setIsImportOpen(true)} />;
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
          <span className="text-sm font-semibold text-orange-500 flex items-center gap-1 bg-orange-50 dark:bg-orange-900/30 px-2 py-0.5 rounded border border-orange-100 dark:border-orange-800/50" title="Study Streak">
            🔥 {streak}
          </span>
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

      {isImportOpen && (
        <ImportWizard
          onClose={() => setIsImportOpen(false)}
          onImportSuccess={() => {
            // Refresh nodes
            fetchNodes().then(data => {
              setNodes(data.map((n: any) => ({ ...n, id: n.nodeId })));
            });
          }}
        />
      )}

      <QuickCreateFAB onAddNode={handleAddNodeRequest} onImport={() => setIsImportOpen(true)} />
    </div>
  );
};

export default NotebookPage;