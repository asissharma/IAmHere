import React, { useState, useCallback, useEffect } from "react";
import { FaFolder, FaFile, FaTrash, FaEllipsisV } from "react-icons/fa";
import { toast } from "react-toastify";
import { handleGenerateData } from "../../api/utils";

export type Node = {
  nodeId: string;
  id: string;
  title: string;
  type: "folder" | "file";
  parentId: string | null;
  content?: string;
  children: Node[];
  generated: boolean;
};

const Sidebar: React.FC<{
  tree: Node[];
  onAddNode: (parentId: string | null, type: "folder" | "file") => void;
  onDeleteNode: (nodeId: string) => void;
  onSelectNode: (node: Node) => void;
}> = ({ tree, onAddNode, onDeleteNode, onSelectNode }) => {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleCollapse = (nodeId: string) => {
    setCollapsed((prev) => ({
      ...prev,
      [nodeId]: !prev[nodeId],
    }));
  };

  const handleMenuToggle = (nodeId: string) => {
    setActiveMenu((prev) => (prev === nodeId ? null : nodeId));
  };

  const handleResize = () => {
    setIsMobile(window.innerWidth <= 768); // Check if it's a mobile screen
  };

  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const renderTree = useCallback(
    (nodes: Node[]) =>
      Array.isArray(nodes) && nodes.length > 0
        ? nodes.map((node) => (
            <div key={node.id} className="ml-2">
              <div
                className="flex items-center bg-white rounded-lg shadow-md p-2 mb-1 cursor-pointer hover:bg-primary hover:text-white transition"
                onClick={() => {
                  if (node.type === "folder") toggleCollapse(node.id);
                  onSelectNode(node);
                }}
              >
                {node.type === "folder" ? (
                  <FaFolder
                    className={`text-primary mr-2 ${
                      collapsed[node.id] ? "opacity-50" : ""
                    }`}
                  />
                ) : (
                  <FaFile className="text-primary mr-2" />
                )}
                <span
                  className="flex-1"
                  style={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {node.title}
                </span>
                <div className="flex space-x-2">
                  <div className="relative">
                    <FaEllipsisV
                      className="text-gray-500 hover:text-secondary cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMenuToggle(node.id);
                      }}
                    />
                    {activeMenu === node.id && (
                      <div
                        className="absolute right-0 mt-2 bg-white shadow-lg rounded-lg p-2 z-50"
                        onClick={(e) => e.stopPropagation()} // Prevent menu click from triggering parent events
                      >
                        {node.type === "folder" && (
                          <>
                            <button
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 rounded"
                              onClick={() => {
                                setActiveMenu(null);
                                onAddNode(node.id, "folder");
                              }}
                            >
                              Add Folder
                            </button>
                            <button
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 rounded"
                              onClick={() => {
                                setActiveMenu(null);
                                onAddNode(node.id, "file");
                              }}
                            >
                              Add File
                            </button>
                          </>
                        )}
                        <button
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 rounded"
                          onClick={() => {
                            setActiveMenu(null);
                            onDeleteNode(node.id);
                          }}
                        >
                          Delete
                        </button>
                        {node.generated !== true && (
                          <button
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 rounded"
                            onClick={async () => {
                              try {
                                setActiveMenu(null);
                                const success = await handleGenerateData(node.nodeId); // Wait for handleGenerateData to complete
                                if (success as any) {
                                  await onSelectNode(node.nodeId as any); // Call onSelectNode only after success
                                }
                              } catch (error) {
                                console.error("Error generating data or selecting node:", error);
                              }
                            }}
                          >
                            Generate
                          </button>
                        )}
                        <button className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 rounded">
                          Summarize
                        </button>
                        <button className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 rounded">
                          MindMap
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {!collapsed[node.id] && node.children?.length
                ? renderTree(node.children)
                : null}
            </div>
          ))
        : null,
    [collapsed, onAddNode, onDeleteNode, onSelectNode, activeMenu]
  );

  return (
    <div
      className={`h-full bg-accent p-4 rounded-lg flex flex-col ${
        isSidebarCollapsed ? "w-20" : isMobile ? "w-56" : "w-80"
      } transition-all duration-300`}
    >
      {/* Mobile collapse button */}
      <div className="flex justify-between items-center mb-4">
        <div
          className="bg-gray-800 p-2 rounded-full cursor-pointer hover:bg-gray-600 transition"
          title="Toggle Sidebar"
          onClick={() => setIsSidebarCollapsed((prev) => !prev)}
        >
          <FaFolder className="text-white text-lg" />
        </div>
        <div
          className={`${
            isSidebarCollapsed ? "opacity-0" : "opacity-100"
          } flex space-x-4`}
        >
          <div
            className="bg-gray-800 p-2 rounded-full cursor-pointer hover:bg-gray-600 transition"
            title="Add Folder"
            onClick={() => onAddNode(null, "folder")}
          >
            <FaFolder className="text-white text-lg" />
          </div>
          <div
            className="bg-gray-800 p-2 rounded-full cursor-pointer hover:bg-gray-600 transition"
            title="Add File"
            onClick={() => onAddNode(null, "file")}
          >
            <FaFile className="text-white text-lg" />
          </div>
        </div>
      </div>

      {/* Render tree */}
      <div className="overflow-y-auto flex-grow h-96">{renderTree(tree)}</div>
    </div>
  );
};

export default Sidebar;
