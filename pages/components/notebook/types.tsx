// types.ts
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
  