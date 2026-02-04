import React from "react";
import { FaBook, FaFolder, FaFile, FaPlus } from "react-icons/fa";
import { motion } from "framer-motion";

interface WelcomeViewProps {
    onAdd: (parentId: string | null, type: "syllabus" | "folder" | "file") => void;
}

const WelcomeView: React.FC<WelcomeViewProps> = ({ onAdd }) => {
    return (
        <div className="h-full flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900/50 p-6 text-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="max-w-2xl w-full"
            >
                <div className="mb-8">
                    <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-3xl mx-auto flex items-center justify-center shadow-xl shadow-blue-500/20 mb-6">
                        <span className="text-4xl text-white font-bold">N</span>
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">Welcome to Notebook 2.0</h1>
                    <p className="text-lg text-gray-500 dark:text-gray-400">
                        Your personal knowledge base. Select a note from the sidebar or create something new to get started.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
                    <ActionButton
                        icon={<FaBook />}
                        label="New Syllabus"
                        desc="Create a structured course"
                        color="bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400"
                        onClick={() => onAdd(null, "syllabus")}
                    />
                    <ActionButton
                        icon={<FaFolder />}
                        label="New Folder"
                        desc="Organize your notes"
                        color="bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400"
                        onClick={() => onAdd(null, "folder")}
                    />
                    <ActionButton
                        icon={<FaFile />}
                        label="New File"
                        desc="Write a quick note"
                        color="bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                        onClick={() => onAdd(null, "file")}
                    />
                </div>

                {/* Tip or Quote */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <p className="text-gray-600 dark:text-gray-300 italic">
                        "The best way to predict the future is to invent it."
                    </p>
                    <p className="text-sm text-gray-400 mt-2 font-medium">— Alan Kay</p>
                </div>
            </motion.div>
        </div>
    );
};

const ActionButton = ({ icon, label, desc, color, onClick }: any) => (
    <motion.button
        whileHover={{ y: -4, shadow: "lg" }}
        onClick={onClick}
        className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:border-blue-200 dark:hover:border-blue-700 transition-all text-left flex flex-col gap-3 group"
    >
        <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center text-lg group-hover:scale-110 transition-transform`}>
            {icon}
        </div>
        <div>
            <h3 className="font-bold text-gray-900 dark:text-white">{label}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{desc}</p>
        </div>
    </motion.button>
);

export default WelcomeView;
