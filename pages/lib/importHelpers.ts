import Papa from "papaparse";
import * as XLSX from "xlsx";

export type ParsedRow = {
    // Standardized fields
    title: string;
    type: "syllabus" | "folder" | "file";
    content: string;
    parentRow: number | null; // 1-based index (relative to data rows)
    tags: string[];
    link?: string;
    // Raw data for custom mapping
    [key: string]: any;
};

export type ImportNode = {
    title: string;
    type: "syllabus" | "folder" | "file";
    content?: string;
    tags?: string[];
    externalLinks?: { type: string; url: string; label?: string }[];
    metadata?: any;
    children?: ImportNode[];
    _tempId?: number; // for validation
};

// --- Parsers ---

export const parseFile = async (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
        const ext = file.name.split('.').pop()?.toLowerCase();

        if (ext === 'csv') {
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => resolve(results.data),
                error: (err) => reject(err)
            });
        } else if (ext === 'xlsx' || ext === 'xls') {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = e.target?.result;
                    const workbook = XLSX.read(data, { type: 'binary' });
                    const firstSheet = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheet];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet);
                    resolve(jsonData);
                } catch (err) {
                    reject(err);
                }
            };
            reader.readAsBinaryString(file);
        } else {
            reject(new Error("Unsupported file type"));
        }
    });
};

// --- Tree Builder ---

export const buildImportTree = (
    rows: any[],
    mapping: { [key: string]: string }, // Maps 'title' -> 'ColumnName'
    syllabusTitle: string
): ImportNode => {

    // 1. Convert raw rows to standard ParsedRow format
    // Row Index mapping: 1-based index usually implies Excel row numbers.
    // But data array is 0-indexed.
    // If user inputs "1" as parent, does it mean Row 1 (header?) or Data Row 1?
    // Convention: Data Row 1 (Index 0).
    const standardizedNodes: (ImportNode & { parentRef?: any, id: number })[] = rows.map((row, index) => {
        const getVal = (field: string) => row[mapping[field]];

        const title = getVal('title') || `Untitled ${index + 1}`;
        let type = (getVal('type') || 'file').toLowerCase();
        // Normalization
        if (!['syllabus', 'folder', 'file'].includes(type)) type = 'file';

        const content = getVal('content') || undefined;
        const parentRef = getVal('parent'); // Could be number or string ID
        const tags = getVal('tags') ? String(getVal('tags')).split(',').map(t => t.trim()) : [];
        const link = getVal('link');

        return {
            id: index + 1, // 1-based ID for reference
            title,
            type: type as any,
            content,
            tags,
            externalLinks: link ? [{ type: 'link', url: link }] : [],
            children: [],
            parentRef,
            metadata: {
                // Store extra fields if needed
            }
        };
    });

    // 2. Build Hierarchy
    const rootChildren: ImportNode[] = [];
    const nodeMap = new Map<any, any>(); // id -> node

    // First pass: Index nodes
    standardizedNodes.forEach(node => nodeMap.set(node.id, node));

    // Second pass: link parents
    standardizedNodes.forEach(node => {
        const pRef = node.parentRef;
        if (pRef) {
            // Try to find parent
            // logic: matches ID?
            const parent = nodeMap.get(parseInt(pRef) || pRef); // handle "1" string vs 1 number
            if (parent && parent !== node) {
                parent.children.push(node);
            } else {
                // Orphan? Add to root for safety
                rootChildren.push(node);
            }
        } else {
            rootChildren.push(node);
        }
    });

    // 3. Wrap in Syllabus Root
    const root: ImportNode = {
        title: syllabusTitle,
        type: 'syllabus',
        children: rootChildren,
        metadata: {
            generatedRoot: true
        }
    };

    return root;
};
