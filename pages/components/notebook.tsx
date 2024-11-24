import React, { useEffect, useState, useCallback } from "react";
import { FaFolder, FaFile, FaTrash, FaPlus } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-quill/dist/quill.snow.css";
import "react-toastify/dist/ReactToastify.css";
import dynamic from "next/dynamic";

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

type Node = {
  id: string;
  title: string;
  type: "folder" | "file";
  parentId: string | null;
  content?: string;
  children: Node[];
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
  const renderTree = useCallback(
    (nodes: Node[]) =>
      nodes.map((node) => (
        <div key={node.id} className="ml-6">
          <div
            className="flex items-center bg-white rounded-lg shadow-md p-3 mb-1 cursor-pointer hover:bg-primary hover:text-white transition"
            onClick={() => onSelectNode(node)}
          >
            {node.type === "folder" ? (
              <FaFolder className="text-primary mr-2" />
            ) : (
              <FaFile className="text-primary mr-2" />
            )}
            <span className="flex-1">{node.title}</span>
            <div className="flex space-x-2">
              {node.type === "folder" && (
                <>
                  <FaFolder
                    className="text-gray-500 hover:text-secondary cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddNode(node.id, "folder");
                    }}
                  />
                  <FaFile
                    className="text-gray-500 hover:text-secondary cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddNode(node.id, "file");
                    }}
                  />
                </>
              )}
              <FaTrash
                className="text-red-500 hover:text-red-700 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteNode(node.id);
                }}
              />
            </div>
          </div>
          {renderTree(node.children)}
        </div>
      )),
    [onAddNode, onDeleteNode, onSelectNode]
  );

  return (
    <div className="h-full bg-accent p-4 rounded-lg flex flex-col">
      {/* Add New Buttons */}
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

      {/* Sidebar Tree */}
      <div className="overflow-y-auto flex-grow">{renderTree(tree)}</div>
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
    <div className="flex-1 bg-white p-2 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-1">{node.title}</h2>
      {node.type === "file" ? (
        <div className="flex flex-col justify-between">
          <ReactQuill
            theme="snow"
            value={content}
            onChange={setContent}
            className="h-72 mb-16"
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
      const data = await apiRequest(`/api/notes?nodeId=${nodeId}&recursive=true`, "GET");
      const descendants = data.map((n: any) => ({ ...n, id: n.nodeId }));
      const updatedNodes = nodes.filter((n) => !descendants.some((d: any) => d.id === n.id));
      setNodes([...updatedNodes, ...descendants]);
    } catch (err) {
      toast.error("Failed to fetch descendants");
    }
  };

  const onSelectNode = async (node: Node) => {
    if (node.type === "folder") await fetchDescendants(node.id);
    setSelectedNode(node);
  };

  return (
    <div className="flex min-h-96 p-4 space-x-4 bg-accent">
      <div className="w-64 flex-shrink-0 h-full">
        <Sidebar tree={buildTree(nodes)} onAddNode={addNode} onDeleteNode={deleteNode} onSelectNode={onSelectNode} />
      </div>
      <NodeEditor node={selectedNode} onSaveContent={saveContent} />
      <ToastContainer />
    </div>
  );
};

export default NotebookPage;
