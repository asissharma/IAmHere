import React, { useEffect, useState, useCallback } from "react";
import { FaFolder, FaFile, FaTrash, FaPlus, FaEllipsisV } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-quill/dist/quill.snow.css";
import "react-toastify/dist/ReactToastify.css";
import dynamic from "next/dynamic";

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

type Node = {
  nodeId:string;
  id: string;
  title: string;
  type: "folder" | "file";
  parentId: string | null;
  content?: string;
  children: Node[];
};

const handleGenerateData = async (parentId: string) => {
  try {
    const response =  await apiRequest("/api/generatesTheData", "POST", { parentId });
    toast.success('generate the data');
  } catch (error) {
    toast.error('Failed to generate data. Please try again.');
  } 
};

const apiRequest = async (url: string, method: "GET" | "POST" | "PUT" | "DELETE", body?: any) => {
  const options: RequestInit = {
    method,
    headers: { "Content-Type": "application/json" },
    ...(body && { body: JSON.stringify(body) }),
  };
  const response = await fetch(url, options);
  if (!response.ok) throw new Error(await response.text());
  return response.json();
};

const buildTree = (nodes: Node[], parentId: string | null = null): Node[] =>
  nodes
    .filter((node) => node.parentId === parentId)
    .map((node) => ({ ...node, children: buildTree(nodes, node.id) }));
    

const Sidebar: React.FC<{
  tree: Node[];
  onAddNode: (parentId: string | null, type: "folder" | "file") => void;
  onDeleteNode: (nodeId: string) => void;
  onSelectNode: (node: Node) => void;
}> = ({ tree, onAddNode, onDeleteNode, onSelectNode }) => {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const toggleCollapse = (nodeId: string) => {
    setCollapsed((prev) => ({
      ...prev,
      [nodeId]: !prev[nodeId],
    }));
  };

  const handleMenuToggle = (nodeId: string) => {
    setActiveMenu((prev) => (prev === nodeId ? null : nodeId));
  };

  const renderTree = useCallback(
    (nodes: Node[]) =>
      nodes.map((node) => (
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
                    <button
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 rounded"
                      onClick={() => {
                        setActiveMenu(null);
                        console.log(`Summarize content for node ${node.id}`);
                      }}
                    >
                      Summarize
                    </button>
                    <button
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 rounded"
                      // onClick={handleShowMindMap}
                    >
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
      )),
    [collapsed, onAddNode, onDeleteNode, onSelectNode, activeMenu]
  );

  return (
    <div className="h-full bg-accent p-4 rounded-lg flex flex-col">
      <div className="flex space-x-4 mb-4 justify-end items-center">
        <div
          className="bg-gray-800 p-3 rounded-full cursor-pointer hover:bg-gray-600 transition"
          title="Add Folder"
          onClick={() => onAddNode(null, "folder")}
        >
          <FaFolder className="text-white" />
        </div>
        <div
          className="bg-gray-800 p-3 rounded-full cursor-pointer hover:bg-gray-600 transition"
          title="Add File"
          onClick={() => onAddNode(null, "file")}
        >
          <FaFile className="text-white" />
        </div>
      </div>
      <div className="overflow-y-auto flex-grow h-96">{renderTree(tree)}</div>
    </div>
  );
};


const NodeEditor: React.FC<{
  node: Node | null;
  onSaveContent: (nodeId: string, content: string) => void;
}> = ({ node, onSaveContent }) => {
  const [content, setContent] = useState(node?.content || "");

  useEffect(() => {
    setContent(node?.content || "");
  }, [node]);

  return node ? (
    <div className="flex-1 bg-white p-2 rounded-lg shadow-lg overflow-y-scroll scrollabler">
      <h2 className="text-xl font-semibold mb-1">{node.title}</h2>
      {node.type === "file" ? (
        <div className="flex flex-col justify-between">
          <ReactQuill
          theme="snow"
          value={content}
          onChange={setContent}
          modules={{
            toolbar: [
              [{ 'header': '1' }, { 'header': '2' }, { 'font': [] }],
              [{ 'list': 'ordered' }, { 'list': 'bullet' }],
              ['bold', 'italic', 'underline'],
              ['link', 'image'],
              [{ 'align': [] }],
              ['clean'],
            ],
          }}
          formats={[
            'header', 'font',
            'bold', 'italic', 'underline',
            'list', 'bullet',
            'link', 'image', 'align',
          ]}
          style={{ height: '400px' }}
        />
          <button
            onClick={() => onSaveContent(node.id, content)}
            className="bg-primary text-white py-2 px-4 rounded hover:bg-primary-dark transition"
          >
            Save
          </button>
        </div>
      ) : (
        <p>Select a file to edit its content</p>
      )}
    </div>
  ) : (
    <div className="flex-1 flex items-center justify-center text-gray-500">
      Select a node to edit
    </div>
  );
};

const NotebookPage: React.FC = () => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const fetchNodes = async () => {
    try {
      const data = await apiRequest("/api/notes", "GET");
      setNodes(data.map((n: any) => ({ ...n, id: n.nodeId })));
    } catch (err) {
      toast.error("Failed to fetch nodes");
    }
  };

  useEffect(() => {
    fetchNodes();
  }, []);

  const addNode = async (parentId: string | null, type: "folder" | "file") => {
    const name = prompt(`Enter name for the new ${type}:`);
    if (!name) return toast.error("Name is required!");

    try {
      const newNode = await apiRequest("/api/notes", "POST", { title: name, type, parentId });
      setNodes([...nodes, { ...newNode, id: newNode.nodeId }]);
    } catch (err) {
      toast.error("Failed to add node");
    }
  };

  const deleteNode = async (nodeId: string) => {
    try {
      await apiRequest("/api/notes", "DELETE", { nodeId });
      setNodes(nodes.filter((node) => node.id !== nodeId));
    } catch (err) {
      toast.error("Failed to delete node");
    }
  };

  const saveContent = async (nodeId: string, content: string) => {
    try {
      await apiRequest("/api/notes", "PUT", { nodeId, content });
      setNodes(nodes.map((node) => (node.id === nodeId ? { ...node, content } : node)));
    } catch (err) {
      toast.error("Failed to save content");
    }
  };

  const fetchDescendants = async (nodeId: string) => {
    try {
      const data = await apiRequest(`/api/notes?parentId=${nodeId}&recusive=true`, "GET");
      const descendants = data.map((n: any) => ({ ...n, id: n.nodeId }));
      const updatedNodes = nodes.filter((n) => !descendants.some((d: any) => d.id === n.id));
      setNodes([...updatedNodes, ...descendants]);
    } catch (err) {
      toast.error("Failed to fetch descendants");
    }
  };

  const [fetched, setFetched] = useState<Record<string, boolean>>({}); 

  const onSelectNode = async (node: Node) => {
    if (fetched[node.nodeId] !== true) {

      setFetched((prev) => ({
        ...prev,
        [node.nodeId]: true, 
      }));


      if (node.type === "folder") {
        await fetchDescendants(node.id);
      }

    }
    setSelectedNode(node);
  };

  return (
    <div className="flex min-h-96 p-4 space-x-4 bg-accent">
      <div className="w-64 text-xs flex-shrink-0">
        <Sidebar
          tree={buildTree(nodes)}
          onAddNode={addNode}
          onDeleteNode={deleteNode}
          onSelectNode={onSelectNode}
        />
      </div>
      <NodeEditor node={selectedNode} onSaveContent={saveContent} />
      <ToastContainer />
    </div>
  );
};

export default NotebookPage;
