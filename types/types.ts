export type Node = {
    nodeId: string;
    id: string; // Used for UI state matching nodeId locally or legacy id
    title: string;
    type: "syllabus" | "folder" | "file";
    parentId: string | null;
    children: Node[];
    resourceType?: string;
    content?: string;
    generated?: boolean;
    tags?: string[];
    pinned?: boolean;
    progress?: number;
    lastStudied?: number;
    prerequisites?: string[]; // Array of Node IDs
    related?: string[];       // Array of Node IDs
    linkedResources?: { type: string; id: string; title: string }[]; // Generic linked resources
};
