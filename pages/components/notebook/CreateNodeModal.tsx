import React, { useState } from "react";
import { FaBook, FaFolder, FaFile, FaTimes, FaTag, FaThumbtack } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

interface CreateNodeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (title: string, type: "syllabus" | "folder" | "file", tags: string[], pinned: boolean) => void;
    parentId: string | null;
    initialType?: "syllabus" | "folder" | "file";
}

const CreateNodeModal: React.FC<CreateNodeModalProps> = ({ isOpen, onClose, onSubmit, parentId, initialType = "file" }) => {
    const [title, setTitle] = useState("");
    const [type, setType] = useState<"syllabus" | "folder" | "file">(initialType);
    const [tagInput, setTagInput] = useState("");
    const [tags, setTags] = useState<string[]>([]);
    const [pinned, setPinned] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;
        onSubmit(title, type, tags, pinned);
        resetForm();
    };

    const resetForm = () => {
        setTitle("");
        setTags([]);
        setTagInput("");
        setPinned(false);
        onClose();
    };

    const handleAddTag = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && tagInput.trim()) {
            e.preventDefault();
            if (!tags.includes(tagInput.trim())) {
                setTags([...tags, tagInput.trim()]);
            }
            setTagInput("");
        }
    };

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md p-6 overflow-hidden"
                >
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Create New Item</h2>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                            <FaTimes />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Title Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                autoFocus
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                placeholder="Enter title..."
                            />
                        </div>

                        {/* Type Selector */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                            <div className="grid grid-cols-3 gap-2">
                                {(["syllabus", "folder", "file"] as const).map((t) => (
                                    <button
                                        key={t}
                                        type="button"
                                        onClick={() => setType(t)}
                                        className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${type === t
                                                ? "bg-blue-50 border-blue-500 text-blue-600 dark:bg-blue-900/30 dark:border-blue-400 dark:text-blue-300"
                                                : "border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700 dark:text-gray-400"
                                            }`}
                                    >
                                        {t === "syllabus" && <FaBook className="mb-1" />}
                                        {t === "folder" && <FaFolder className="mb-1" />}
                                        {t === "file" && <FaFile className="mb-1" />}
                                        <span className="text-xs capitalize">{t}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Tags Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tags</label>
                            <div className="flex items-center gap-2 px-3 py-2 border rounded-lg focus-within:ring-2 focus-within:ring-blue-500 dark:bg-gray-700 dark:border-gray-600">
                                <FaTag className="text-gray-400" />
                                <input
                                    type="text"
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={handleAddTag}
                                    className="flex-1 bg-transparent outline-none dark:text-white"
                                    placeholder="Type tag & press Enter"
                                />
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {tags.map((tag) => (
                                    <span key={tag} className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full dark:bg-gray-600 dark:text-gray-200">
                                        {tag}
                                        <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500">
                                            &times;
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Pinned Toggle */}
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setPinned(!pinned)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${pinned
                                        ? "bg-yellow-100 text-yellow-700 border border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
                                    }`}
                            >
                                <FaThumbtack className={pinned ? "transform rotate-45" : ""} />
                                {pinned ? "Pinned" : "Pin to Top"}
                            </button>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition-colors"
                                disabled={!title.trim()}
                            >
                                Create
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default CreateNodeModal;
