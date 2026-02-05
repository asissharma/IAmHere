import type { NextApiRequest, NextApiResponse } from 'next';
import connectToDatabase from './lib/mongodb';
import Notebook from './lib/notebook';

type ImportNode = {
    title: string;
    type: "syllabus" | "folder" | "file";
    content?: string;
    tags?: string[];
    externalLinks?: { type: string; url: string; label?: string }[];
    metadata?: any;
    children?: ImportNode[];
};

// Recursive insertion function
async function insertNode(node: ImportNode, parentId: string | null, syllabusId: string, sourceFile: string): Promise<any> {
    const newNode = new Notebook({
        title: node.title,
        type: node.type,
        parentId: parentId,
        content: node.content,
        tags: node.tags || [],
        externalLinks: node.externalLinks || [],
        metadata: node.metadata || {},
        sourceFile: sourceFile,
        importedAt: new Date(),
        // Inherit pinned? No.
    });

    const savedNode = await newNode.save();

    if (node.children && node.children.length > 0) {
        for (const child of node.children) {
            await insertNode(child, savedNode.nodeId, syllabusId, sourceFile);
        }
    }
    return savedNode;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    await connectToDatabase();

    try {
        const { syllabus, rootNode } = req.body;
        // rootNode is the top-level structure (usually type: syllabus or folder)
        // syllabus metadata: { title, source, ... }

        if (!rootNode || !rootNode.title) {
            return res.status(400).json({ error: "Invalid data: Root node missing" });
        }

        // 1. Check duplicate title?
        const existing = await Notebook.findOne({ title: rootNode.title, type: "syllabus", parentId: null });
        if (req.query.checkDuplicate === "true") {
            if (existing) {
                return res.status(200).json({ duplicate: true, existingId: existing.nodeId });
            }
        }

        // If force overwrite or new...
        // Actually we don't overwrite usually, we create new copy or user must delete old.
        // Importing as new copy is safer data-wise.

        const sourceFile = syllabus?.source || "unknown";

        const savedRoot = await insertNode(rootNode, null, "", sourceFile);

        return res.status(200).json({ success: true, rootId: savedRoot.nodeId });

    } catch (error: any) {
        console.error("Import Error:", error);
        return res.status(500).json({ error: error.message || "Import failed" });
    }
}
