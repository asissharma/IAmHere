import React, { useState, useCallback, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  FaFolder,
  FaFolderOpen,
  FaFileAlt,
  FaEllipsisV,
  FaBook,
  FaThumbtack,
  FaChevronDown,
  FaBars // Hamburger menu icon
} from "react-icons/fa";
import { toast } from "react-toastify";
import { handleGenerateData, updateNode } from "../../pages/api/utils";
import { Node } from "../../types/types";

const MenuItem = ({ label, onClick, danger = false }: { label: string, onClick: () => void, danger?: boolean }) => (
  <button
    className={`w-full text-left px-3 py-1.5 text-xs transition-colors block
      ${danger
        ? "text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
        : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"}
    `}
    onClick={(e) => { e.stopPropagation(); onClick(); }}
  >
    {label}
  </button>
);

const Sidebar: React.FC<{
  tree: Node[];
  onAddNode: (parentId: string | null, type: "syllabus" | "folder" | "file") => void;
  onDeleteNode: (nodeId: string) => void;
  onSelectNode: (node: Node) => void;
  setShowMindMap: (nodeId: string) => void;
  searchQuery?: string;
  isCollapsed: boolean;
  toggleSidebar: () => void;
}> = ({ tree, onAddNode, onDeleteNode, onSelectNode, setShowMindMap, searchQuery, isCollapsed, toggleSidebar }) => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const toggleExpand = (nodeId: string) => {
    setExpanded((prev) => ({ ...prev, [nodeId]: !prev[nodeId] }));
  };

  const handleMenuToggle = (nodeId: string) => {
    setActiveMenu((prev) => (prev === nodeId ? null : nodeId));
  };

  const handleNodeClick = (node: Node) => {
    setSelectedId(node.nodeId);
    onSelectNode(node);
  };

  // Search Logic
  const isSearching = !!searchQuery;
  const searchResults = useMemo(() => {
    if (!isSearching) return [];

    const flatten = (list: Node[]): Node[] => {
      return list.reduce((acc, node) => {
        const children = node.children ? flatten(node.children) : [];
        return [...acc, { ...node, children: [] }, ...children];
      }, [] as Node[]);
    };

    const allNodes = flatten(tree);
    return allNodes.filter(n => {
      if (searchQuery.startsWith("tag:")) {
        const tagToMatch = searchQuery.replace("tag:", "").toLowerCase();
        return n.tags?.some(t => t.toLowerCase() === tagToMatch);
      }

      return (
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (n.content && n.content.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    });
  }, [tree, searchQuery, isSearching]);

  const renderTree = useCallback(
    (nodes: Node[], level = 0) => {
      if (isSearching) return null; // Don't use tree renderer for search

      const nodesToRender = nodes;

      if (!nodesToRender || nodesToRender.length === 0) return null;

      return nodesToRender.map((node) => {
        const isExpanded = !!expanded[node.id];
        const isSelected = selectedId === node.nodeId;
        const hasChildren = node.children && node.children.length > 0;

        // Compact Indentation
        const paddingLeft = level * 8 + 8; // Reduced from 12

        return (
          <motion.div
            key={node.id}
            className="relative select-none"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: level * 0.05 + 0.05 }}
          >
            {/* Tree Guide Line */}
            {level > 0 && (
              <div
                className="absolute left-0 top-0 bottom-0 w-px bg-gray-100 dark:bg-gray-800"
                style={{ left: `${(level * 8) + 3}px` }}
              />
            )}

            <div
              className={`group flex items-center py-0.5 px-2 cursor-pointer transition-all duration-150 border-l-2
                ${isSelected
                  ? "bg-blue-50 dark:bg-blue-900/10 border-blue-500 text-blue-700 dark:text-blue-400"
                  : "border-transparent hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"}
              `}
              style={{ paddingLeft: `${paddingLeft}px` }}
              onClick={() => handleNodeClick(node)}
            >
              {/* Chevron */}
              <div
                className={`mr-1 text-gray-300 hover:text-gray-500 transition-transform duration-200 ${isExpanded ? "rotate-0" : "-rotate-90"} ${!hasChildren && node.type !== 'folder' && node.type !== 'syllabus' ? "invisible w-3" : "w-3"}`}
                onClick={(e) => { e.stopPropagation(); toggleExpand(node.id); }}
              >
                <FaChevronDown size={8} />
              </div>

              {/* Icon */}
              <div className={`mr-1.5 ${isSelected ? "text-blue-500" : "text-gray-400"}`}>
                {node.type === "syllabus" ? <FaBook size={12} /> :
                  node.type === "folder" ? (isExpanded ? <FaFolderOpen size={12} /> : <FaFolder size={12} />) :
                    <FaFileAlt size={12} />}
              </div>

              {/* Title */}
              <span className="flex-1 truncate text-xs font-medium leading-loose pt-0.5">
                {node.title}
                {(node.progress || 0) > 0 && (
                  <div className="h-0.5 bg-gray-200 dark:bg-gray-700 w-12 mt-0.5 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500" style={{ width: `${node.progress}%` }}></div>
                  </div>
                )}
              </span>

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {node.pinned && <FaThumbtack className="text-yellow-500" size={8} />}

                <div className="relative">
                  <FaEllipsisV
                    className="text-gray-300 hover:text-gray-500 p-0.5 cursor-pointer"
                    size={14}
                    onClick={(e) => { e.stopPropagation(); handleMenuToggle(node.id); }}
                  />
                  {activeMenu === node.id && (
                    <div
                      className="absolute right-0 top-4 w-32 bg-white dark:bg-gray-800 shadow-xl border border-gray-100 dark:border-gray-700 rounded py-0.5 z-50 text-left"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {(node.type === "folder" || node.type === "syllabus") && (
                        <>
                          <MenuItem onClick={() => { setActiveMenu(null); onAddNode(node.id, "folder"); }} label="New Folder" />
                          <MenuItem onClick={() => { setActiveMenu(null); onAddNode(node.id, "file"); }} label="New File" />
                          <div className="h-px bg-gray-50 dark:bg-gray-700 my-0.5" />
                        </>
                      )}

                      <MenuItem onClick={() => {
                        setActiveMenu(null);
                        updateNode(node.nodeId, { pinned: !node.pinned }).then(() => window.location.reload());
                      }} label={node.pinned ? "Unpin" : "Pin"} />

                      <MenuItem onClick={() => { setActiveMenu(null); setShowMindMap(node.id); }} label="MindMap" />

                      <div className="h-px bg-gray-50 dark:bg-gray-700 my-0.5" />

                      <MenuItem onClick={() => { setActiveMenu(null); onDeleteNode(node.id); }} label="Delete" danger />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {isExpanded && node.children && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                {renderTree(node.children, level + 1)}
              </motion.div>
            )}
          </motion.div>
        );
      });
    },
    [expanded, onAddNode, onDeleteNode, onSelectNode, activeMenu, searchQuery, selectedId]
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {!isCollapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
          onClick={toggleSidebar}
        />
      )}

      <div
        className={`h-full bg-white dark:bg-gray-900 flex flex-col border-r border-gray-200 dark:border-gray-800 transition-all duration-300 
          fixed md:relative z-40 top-0 left-0
          ${isCollapsed ? "-translate-x-full md:translate-x-0 md:w-12 overflow-hidden" : "translate-x-0 w-64 shadow-2xl md:shadow-none"}
        `}
      >
        <div className="flex-1 overflow-y-auto py-1 custom-scrollbar">
          {searchQuery && (
            <div className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-800 mb-1">
              Found
            </div>
          )}
          {tree && tree.length > 0 ? renderTree(tree) : (
            <div className="px-4 py-8 text-center text-gray-300 text-xs">
              Not found
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
