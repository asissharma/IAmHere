export const apiRequest = async (url: string, method: "GET" | "POST" | "PUT" | "DELETE", body?: any) => {
  let options: RequestInit = {
    method,
    headers: { "Content-Type": "application/json" },
  };

  // Handle query parameters for GET method
  if (method === "GET" && body) {
    const queryParams = new URLSearchParams(body).toString();
    url = `${url}?${queryParams}`;
  } else if (body) {
    options.body = JSON.stringify(body); // Add body for POST, PUT, DELETE
  }

  try {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  } catch (error: any) {
    throw new Error(`Request failed: ${error.message}`);
  }
};

// Define Node type
type Node = {
  nodeId: string;
  id: string;
  title: string;
  type: "folder" | "file";
  parentId: string | null;
  content?: string;
  children: Node[];
};

export const handleGenerateData = async (parentId: string) => {
  try {
    const identifier = "handleGenerateData";
    return await apiRequest("/api/generatesTheData", "POST", { parentId, identifier });
  } catch (error) {
    throw new Error("Failed to generate data. Please try again.");
  }
};

export const fetchNodes = async () => {
  const identifier = "fetchNodes";
  try {
    return await apiRequest("/api/notes", "GET", { identifier });
  } catch (error) {
    console.error("Error fetching nodes:", error);
    throw error;
  }
};

export const addNode = async (title: string, type: "folder" | "file", parentId: string | null) => {
  const identifier = "addNode";
  try {
    return await apiRequest("/api/notes", "POST", { title, type, parentId, identifier });
  } catch (error) {
    console.error("Error adding node:", error);
    throw error;
  }
};

export const deleteNode = async (nodeId: string) => {
  const identifier = "deleteNode";
  try {
    return await apiRequest("/api/notes", "DELETE", { nodeId, identifier });
  } catch (error) {
    console.error("Error deleting node:", error);
    throw error;
  }
};

export const saveContent = async (nodeId: string, content: string) => {
  const identifier = "saveContent";
  try {
    return await apiRequest("/api/notes", "PUT", { nodeId, content, identifier });
  } catch (error) {
    console.error("Error saving content:", error);
    throw error;
  }
};

export const fetchDescendants = async (node: Node) => {
  try {
    const nodeId = node.nodeId;
    const identifier = "fetchDescendants";
    const data = await apiRequest(`/api/notes?parentId=${nodeId}&recursive=true`, "GET", { parentId: nodeId, identifier });
    const descendants = data.map((n: any) => ({ ...n, id: n.nodeId }));
    return descendants;
  } catch (err) {
    console.error("Failed to fetch descendants:", err);
    throw err;
  }
};

// Default export
export default {
  apiRequest,
  handleGenerateData,
  fetchNodes,
  addNode,
  deleteNode,
  saveContent,
  fetchDescendants,
};
