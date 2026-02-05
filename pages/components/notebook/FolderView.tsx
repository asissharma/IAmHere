import React from "react";
import { FaFolder, FaFile, FaPlus, FaArrowRight, FaCheckCircle, FaMagic } from "react-icons/fa";
import { motion } from "framer-motion";
import EmptyState from "./EmptyState";

type Node = {
    id: string;
    title: string;
    type: "syllabus" | "folder" | "file";
    children: Node[];
    pinned?: boolean;
    progress?: number;
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
                            onClick={() => onAdd(node.id, "folder")}
                            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                        >
                            + Folder
                        </button>
                        <button
                            onClick={() => onAdd(node.id, "file")}
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

                                    {/* Progress Bar / Badge */}
                                    {child.type === 'file' && (child.progress || 0) >= 100 && (
                                        <div className="flex items-center gap-1 text-xs text-green-600 mb-2">
                                            <FaCheckCircle /> Completed
                                        </div>
                                    )}
                                    {child.type === 'folder' && (child.progress || 0) > 0 && (
                                        <div className="mb-2">
                                            <div className="flex justify-between text-[10px] text-gray-500 mb-0.5">
                                                <span>Progress</span>
                                                <span>{child.progress}%</span>
                                            </div>
                                            <div className="w-full h-1 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                                <div className="h-full bg-green-500 rounded-full" style={{ width: `${child.progress}%` }}></div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-1 text-xs text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                        Open <FaArrowRight size={10} />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        title="Empty Folder"
                        description="This folder is empty. Create a new note or import a syllabus to get started."
                        icon={<FaFolder size={48} className="text-blue-200 dark:text-gray-700" />}
                        action={{
                            label: "Create First Note",
                            onClick: () => onAdd(node.id, "file")
                        }}
                    />
                )}
            </motion.div>
        </div>
    );
};

export default FolderView;
