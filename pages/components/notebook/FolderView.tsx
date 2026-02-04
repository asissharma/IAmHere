import React from "react";
import { FaFolder, FaFile, FaPlus, FaArrowRight } from "react-icons/fa";
import { motion } from "framer-motion";

type Node = {
    id: string;
    title: string;
    type: "syllabus" | "folder" | "file";
    children: Node[];
    progress?: number;
    tags?: string[];
    pinned?: boolean;
};

interface FolderViewProps {
    node: Node;
    onNavigate: (nodeId: string) => void;
    onAdd: (parentId: string, type: "folder" | "file") => void;
}

const FolderView: React.FC<FolderViewProps> = ({ node, onNavigate, onAdd }) => {
    const children = node.children || [];
    const foldersCount = children.filter(c => c.type === "folder").length;
    const filesCount = children.filter(c => c.type === "file").length;

    return (
        <div className="p-8 h-full overflow-y-auto bg-gray-50 dark:bg-gray-900/50">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-5xl mx-auto"
            >
                {/* Header */}
                <div className="flex items-end justify-between border-b border-gray-200 dark:border-gray-700 pb-6 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-yellow-100 dark:bg-yellow-900/30 rounded-2xl text-yellow-600 dark:text-yellow-500">
                            <FaFolder size={32} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{node.title}</h1>
                            <div className="flex gap-3 mt-1 text-sm text-gray-500">
                                <span>{foldersCount} Folders</span>
                                <span>&bull;</span>
                                <span>{filesCount} Files</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => onAdd(node.nodeId, "folder")}
                            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                        >
                            + Folder
                        </button>
                        <button
                            onClick={() => onAdd(node.nodeId, "file")}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition shadow-sm"
                        >
                            + File
                        </button>
                    </div>
                </div>

                {/* Children Grid */}
                {children.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {children.map((child) => (
                            <motion.div
                                key={child.id}
                                whileHover={{ y: -2, scale: 1.01 }}
                                onClick={() => onNavigate(child.id)}
                                className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer shadow-sm hover:shadow-md transition-all group flex flex-col justify-between h-32"
                            >
                                <div className="flex justify-between items-start">
                                    <div className={`p-2 rounded-lg ${child.type === 'folder' ? 'bg-yellow-50 text-yellow-600' : 'bg-blue-50 text-blue-600'} dark:bg-gray-700`}>
                                        {child.type === 'folder' ? <FaFolder /> : <FaFile />}
                                    </div>
                                    {child.pinned && <span className="text-xs bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded">Pinned</span>}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate mb-1">{child.title}</h3>
                                    <div className="flex items-center gap-1 text-xs text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                        Open <FaArrowRight size={10} />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50 dark:bg-gray-800/30">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-400 mb-4">
                            <FaPlus size={24} />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Empty Folder</h3>
                        <p className="text-gray-500 mt-1 max-w-sm">Use the buttons above to add files or folders to this location.</p>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default FolderView;
