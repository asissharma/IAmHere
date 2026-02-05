import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaPlus, FaFolder, FaFileAlt, FaBook, FaFileImport } from "react-icons/fa";

interface QuickCreateFABProps {
    onAddNode: (parentId: string | null, type: "syllabus" | "folder" | "file" | "fileAnalysis") => void;
    onImport: () => void;
}

const QuickCreateFAB: React.FC<QuickCreateFABProps> = ({ onAddNode, onImport }) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleOpen = () => setIsOpen(!isOpen);

    const actions = [
        { label: "New Syllabus", icon: <FaBook />, color: "bg-purple-500", onClick: () => onAddNode(null, "syllabus") },
        { label: "New Folder", icon: <FaFolder />, color: "bg-blue-500", onClick: () => onAddNode(null, "folder") },
        { label: "New Note", icon: <FaFileAlt />, color: "bg-green-500", onClick: () => onAddNode(null, "file") },
        { label: "Analyze Doc", icon: <FaFileAlt />, color: "bg-pink-500", onClick: () => onAddNode(null, "fileAnalysis") },
        { label: "Import", icon: <FaFileImport />, color: "bg-orange-500", onClick: onImport },
    ];

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
                        onClick={toggleOpen}
                    />
                )}
            </AnimatePresence>

            <div className="absolute bottom-6 left-6 z-50 flex flex-col items-start pointer-events-none">
                <AnimatePresence>
                    {isOpen && (
                        <div className="flex flex-col items-start gap-3 mb-3 pointer-events-auto pl-1">
                            {actions.map((action, index) => (
                                <motion.div
                                    key={action.label}
                                    initial={{ opacity: 0, y: 20, scale: 0.8, x: -20 }}
                                    animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
                                    exit={{ opacity: 0, y: 20, scale: 0.8, x: -20 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="flex items-center gap-2"
                                >
                                    <button
                                        onClick={() => { action.onClick(); setIsOpen(false); }}
                                        className={`${action.color} p-3 rounded-full text-white shadow-lg hover:brightness-110 transition-all`}
                                    >
                                        {action.icon}
                                    </button>
                                    <span className="bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-md">{action.label}</span>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </AnimatePresence>

                <motion.button
                    onClick={toggleOpen}
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    className="pointer-events-auto bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-xl flex items-center justify-center transition-colors"
                >
                    <FaPlus size={24} />
                </motion.button>
            </div>
        </>
    );
};

export default QuickCreateFAB;
