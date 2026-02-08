import { Node } from "../../types/types";

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



export const fetchMindMap = async (parentId: string) => {
  try {
    const identifier = "fetchMindMap";
    return await apiRequest("/api/notes", "GET", { parentId, identifier });
  } catch (error) {
    throw new Error("Failed to generate data. Please try again.");
  }
};

export const fetchGlobalMindMap = async () => {
  try {
    const identifier = "fetchGlobalMindMap";
    return await apiRequest("/api/notes", "GET", { identifier });
  } catch (error) {
    throw new Error("Failed to fetch global mind map.");
  }
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

export const addNode = async (title: string, type: "syllabus" | "folder" | "file", parentId: string | null, tags?: string[], pinned?: boolean) => {
  const identifier = "addNode";
  try {
    return await apiRequest("/api/notes", "POST", { title, type, parentId, identifier, tags, pinned });
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

export const saveContent = async (nodeId: string, content: string, resourceType: string) => {
  const identifier = "saveContent";
  try {
    return await apiRequest("/api/notes", "PUT", { nodeId, content, resourceType, identifier });
  } catch (error) {
    console.error("Error saving content:", error);
    throw error;
  }
};

export const updateNode = async (nodeId: string, updates: { title?: string, tags?: string[], pinned?: boolean, aiSummary?: string, prerequisites?: string[] }) => {
  const identifier = "saveContent";
  try {
    return await apiRequest("/api/notes", "PUT", { nodeId, identifier, ...updates });
  } catch (error) {
    console.error("Error updating node:", error);
    throw error;
  }
};

export const updateNodeProgress = async (nodeId: string, progress: number) => {
  const identifier = "updateProgress";
  try {
    return await apiRequest("/api/notes", "PUT", { nodeId, progress, identifier });
  } catch (error) {
    console.error("Error updating progress:", error);
    throw error;
  }
};



export const logActivity = async (nodeId: string, duration: number) => {
  const identifier = "logActivity";
  try {
    return await apiRequest("/api/notes", "PUT", { nodeId, duration, identifier });
  } catch (error) {
    console.error("Error logging activity:", error);
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

export const performSmartAction = async (action: string, text: string, context?: string) => {
  const identifier = "smartAction";
  try {
    return await apiRequest("/api/smartNotes", "POST", { action, text, context, identifier });
  } catch (error) {
    console.error("Smart Action failed:", error);
    throw error;
  }
};
