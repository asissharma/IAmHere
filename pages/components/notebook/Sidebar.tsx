import React, { useState, useCallback, useEffect } from "react";
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
import { handleGenerateData, updateNode } from "../../api/utils";

export type Node = {
  nodeId: string;
  id: string;
  title: string;
  type: "syllabus" | "folder" | "file";
  parentId: string | null;
  children: Node[];
  resourceType: string;
  generated: boolean;
  tags?: string[];
  pinned?: boolean;
};

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
    if (node.type === "folder" || node.type === "syllabus") {
      toggleExpand(node.id);
    }
    onSelectNode(node);
  };

  const renderTree = useCallback(
    (nodes: Node[], level = 0) => {
      const nodesToRender = searchQuery
        ? nodes.filter(n =>
          n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          n.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
        )
        : nodes;

      if (!nodesToRender || nodesToRender.length === 0) return null;

      return nodesToRender.map((node) => {
        const isExpanded = !!expanded[node.id];
        const isSelected = selectedId === node.nodeId;
        const hasChildren = node.children && node.children.length > 0;

        // Compact Indentation
        const paddingLeft = level * 8 + 8; // Reduced from 12

        return (
          <div key={node.id} className="relative select-none">
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

                      {node.generated !== true && (
                        <MenuItem onClick={async () => {
                          setActiveMenu(null);
                          try { await handleGenerateData(node.nodeId); await onSelectNode(node); }
                          catch (e) { console.error(e); }
                        }} label="Generate" />
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
              <div>{renderTree(node.children, level + 1)}</div>
            )}
          </div>
        );
      });
    },
    [expanded, onAddNode, onDeleteNode, onSelectNode, activeMenu, searchQuery, selectedId]
  );

  return (
    <div
      className={`h-full flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 
        ${isCollapsed ? "w-0 opacity-0 overflow-hidden" : "w-56 opacity-100"} 
        transition-all duration-300 ease-in-out`}
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
  );
};

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

export default Sidebar;
