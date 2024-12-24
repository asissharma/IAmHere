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

// Default export: Node template
const defaultNode: Node = {
  nodeId: "",
  id: "",
  title: "Untitled",
  type: "file",
  parentId: null,
  content: "",
  children: [],
  generated: false,
};

export default defaultNode;
