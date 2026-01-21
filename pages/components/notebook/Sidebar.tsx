import React, { useState, useCallback, useEffect } from "react";
import { FaFolder, FaFile, FaTrash, FaEllipsisV, FaBook } from "react-icons/fa";
import { toast } from "react-toastify";
import { handleGenerateData } from "../../api/utils";

export type Node = {
  nodeId: string;
  id: string;
  title: string;
  type: "syllabus"|"folder" | "file";
  parentId: string | null;
  content?: string;
  children: Node[];
  resourceType : string;
  generated: boolean;
};

const Sidebar: React.FC<{
  tree: Node[];
  onAddNode: (parentId: string | null, type: "syllabus"|"folder" | "file") => void;
  onDeleteNode: (nodeId: string) => void;
  onSelectNode: (node: Node) => void;
  setShowMindMap: (nodeId: string) => void; // Add callback prop for toggling Mind Map
}> = ({ tree, onAddNode, onDeleteNode, onSelectNode, setShowMindMap }) => {
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
                  if (node.type === "folder" || node.type === "syllabus") {
                    toggleCollapse(node.id)
                  }
                  onSelectNode(node);
                }}
              >
                {node.type === "syllabus" ? (
                  <FaBook
                    className={`text-primary mr-2 ${
                      collapsed[node.id] ? "opacity-50" : ""
                    }`}
                  />
                ) : node.type === "folder" ? (
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
                        {(node.type === "folder" || node.type === "syllabus") && (
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
                        <button
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 rounded"
                          onClick={() => {
                            setActiveMenu(null);
                            setShowMindMap(node.id); // Pass the node.id to the parent
                            setIsSidebarCollapsed((prev) => !prev);
                          }}
                        >
                          MindMap
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {collapsed[node.id] && node.children?.length
                ? renderTree(node.children)
                : null}
            </div>
          ))
        : null,
    [collapsed, onAddNode, onDeleteNode, onSelectNode, activeMenu]
  );

  return (
    <div
      className={`h-full bg-accent rounded-lg flex flex-col ${
        isSidebarCollapsed ? "w-20" : isMobile ? "w-56" : "w-80"
      } transition-all duration-300`}
    >
      {/* Mobile collapse button */}
      <div className="flex justify-between items-center mb-2">
        <div
          className="bg-gray-800 p-2 rounded-full cursor-pointer hover:bg-gray-600 transition"
          title="Toggle Sidebar"
          onClick={() => setIsSidebarCollapsed((prev) => !prev)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="1.5rem"
            height="1.5rem"
            fill="none"
            viewBox="0 0 602 602"
            className="animate-bounce"
          >
            <g>
              <path
                stroke="#E91E63"
                stroke-miterlimit="10"
                stroke-width="24"
                d="M274.151 201.657c66.903-17.997 131.399-24.32 182.018-19.756l1.077-11.95-1.077 11.95c30.477 2.747 55.643 9.518 73.763 18.622 18.414 9.252 27.823 19.969 30.45 29.72h0c2.776 10.303-.231 25.206-12.364 43.484-11.936 17.98-31.68 37.56-58.646 56.139v.001c-40.663 28.018-98.24 52.637-161.885 69.759-65.406 17.596-128.7 26.024-178.487 21.651h0c-31.569-2.772-57.609-10.095-76.356-19.82-19.058-9.886-28.938-21.326-31.677-31.495h0c-2.636-9.786-.088-23.613 10.677-40.523 10.622-16.687 28.385-34.904 52.944-52.425l-6.724-9.425 6.724 9.425c41.556-29.647 101.985-57.176 169.563-75.357zm0 0l-3.116-11.583 3.116 11.583z"
              ></path>
              <path
                stroke="#E91E63"
                stroke-miterlimit="10"
                stroke-width="24"
                d="M373.214 228.061c49.036 48.941 86.758 101.635 108.114 147.755l10.889-5.042-10.889 5.042c12.859 27.768 19.578 52.949 20.754 73.194 1.194 20.573-3.382 34.081-10.514 41.232h0c-7.535 7.555-21.944 12.403-43.839 11.035-21.539-1.346-48.366-8.656-77.939-22.719l-.001-.001c-44.594-21.205-94.702-58.759-141.351-105.317l-8.138 8.153 8.138-8.153c-47.94-47.846-86.885-98.447-107.99-143.751h0c-13.383-28.726-20.062-54.939-21.013-76.038-.967-21.448 4-35.725 11.437-43.182h0c7.157-7.176 20.405-11.883 40.432-11.016 19.761.856 44.419 7.13 71.872 19.639l4.975-10.92-4.975 10.92c46.451 21.165 100.505 59.734 150.038 109.169zm0 0l8.477-8.494-8.477 8.494z"
              ></path>
              <path
                stroke="#E91E63"
                stroke-miterlimit="10"
                stroke-width="24"
                d="M325.98 494.55l9.811 6.909-9.811-6.909c-17.619 25.02-36.067 43.429-53.012 54.569-17.221 11.322-31.207 14.112-40.966 11.511h0c-10.311-2.747-21.714-12.801-31.476-32.447-9.604-19.326-16.687-46.213-19.294-78.855v-.001c-3.933-49.221 3.537-111.393 20.533-175.07l-11.594-3.095 11.594 3.095c17.467-65.44 41.817-124.466 70.5-165.396h0c18.186-25.953 37.549-44.843 55.345-56.216 18.091-11.562 32.94-14.398 43.117-11.686h0c9.793 2.61 20.494 11.73 29.756 29.506 9.139 17.541 16.035 42.032 18.928 72.06 4.896 50.811-1.48 116.906-19.526 184.519-17.867 66.937-44.642 125.951-73.905 167.506z"
              ></path>
            </g>
            <path
              fill="#E91E63"
              d="M301.007 269.002a62.496 62.496 0 00-4.799-4.301c-1.568-1.254-3.439-2.596-5.615-4.026a30.06 30.06 0 00-7.055-3.411c-2.527-.842-5.007-1.264-7.436-1.264-8.779 0-15.657 2.43-20.635 7.29-4.979 4.859-7.467 11.601-7.467 20.223 0 8.661 4.488 17.479 13.463 26.455 0 0 24.492 21.967 39.544 36.043 15.053-14.076 39.545-36.043 39.545-36.043 8.975-8.976 13.463-17.794 13.463-26.455 0-8.622-2.488-15.364-7.467-20.223-4.978-4.86-11.856-7.29-20.635-7.29-2.429 0-4.909.422-7.436 1.264a30.06 30.06 0 00-7.055 3.411c-2.176 1.43-4.047 2.772-5.615 4.026a62.699 62.699 0 00-4.8 4.301z"
            ></path>
          </svg>
        </div>

        <div
          className={`${
            isSidebarCollapsed ? "opacity-0" : "opacity-100"
          } flex space-x-4`}
        >
          <div
            className="bg-gray-800 p-2 rounded-full cursor-pointer hover:bg-gray-600 transition"
            title="Add Syllabus"
            onClick={() => onAddNode(null, "syllabus")}
          >
            <FaBook className="text-white text-lg" />
          </div>
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
