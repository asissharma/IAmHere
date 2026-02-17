import React, { useState } from 'react';
import { DSAQuestion } from '../../types/dsa';
import { FiTag, FiEdit3, FiAward, FiClock, FiBookOpen } from 'react-icons/fi';
import DOMPurify from 'dompurify'; // Ensure this is installed or use a different sanitizer
import { useRouter } from 'next/router';
import { addNode, fetchNodes, updateNode } from '../../pages/api/utils';
import { toast } from 'react-toastify';

interface QuestionPanelProps {
    question: DSAQuestion;
    onUpdateMastery: (level: string) => void;
    onUpdateTags: (tags: string[]) => void;
    onUpdateNotes: (notes: string) => void;
}

const QuestionPanel: React.FC<QuestionPanelProps> = ({ question, onUpdateMastery, onUpdateTags, onUpdateNotes }) => {
    const [activeTab, setActiveTab] = useState<'problem' | 'notes'>('problem');
    const [noteEdit, setNoteEdit] = useState(question.inlineNotes || '');
    const router = useRouter();

    const handleNoteSave = () => onUpdateNotes(noteEdit);

    const handleCreateNote = async () => {
        try {
            // Check if a note already exists linked to this question
            // We need to fetch nodes and check. This might be heavy if not optmized.
            // Better to check if question.linkedNoteIds has value.
            // But question.linkedNoteIds might not be synced if we just added it from Notebook side.
            // Let's rely on creating a new one or finding by naming convention for now?
            // User wants "Create Note from Playground".

            // 1. Create new note
            const title = `DSA: ${question.problem}`;
            // We assume root level or specific folder? Root for now.
            const newNode: any = await addNode(title, "file", null, ["DSA", question.topic], false);

            // 2. Link it
            // We need to update the node with linkedResources
            await updateNode(newNode.nodeId, {
                linkedResources: [{ type: 'dsa', id: question._id, title: question.problem }]
            });

            // 3. Navigate
            toast.success("Note created! Redirecting...");
            router.push(`/notebook?nodeId=${newNode.nodeId}`);
        } catch (error) {
            console.error(error);
            toast.error("Failed to create note");
        }
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-800/50">
            {/* Header / Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700">
                <button
                    onClick={() => setActiveTab('problem')}
                    className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'problem'
                        ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50 dark:bg-orange-900/10'
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                        }`}
                >
                    Problem Statement
                </button>
                <button
                    onClick={() => setActiveTab('notes')}
                    className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'notes'
                        ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50 dark:bg-orange-900/10'
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                        }`}
                >
                    My Notes {question.inlineNotes && '📝'}
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
                {activeTab === 'problem' ? (
                    <div className="space-y-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{question.problem}</h2>
                                <span className={`px-2 py-1 text-xs rounded-full font-medium ${question.difficulty === 'Easy' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                    question.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                    }`}>
                                    {question.difficulty}
                                </span>
                                <button
                                    onClick={handleCreateNote}
                                    className="ml-auto p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                    title="Create/Open Notebook Entry"
                                >
                                    <FiBookOpen size={18} />
                                </button>
                            </div>

                            <div className="text-sm text-gray-500 flex gap-4 mb-4">
                                <span>{question.topic} &gt; {question.subtopic}</span>
                                {question.patterns?.length > 0 && (
                                    <div className="flex gap-2">
                                        {question.patterns.map(p => (
                                            <span key={p} className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 px-2 rounded-md">
                                                <FiTag className="w-3 h-3" /> {p}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="prose dark:prose-invert max-w-none text-gray-800 dark:text-gray-300">
                                <p className="whitespace-pre-wrap">{question.description || question.problem}</p> {/* Use description if available */}
                                {question.link && (
                                    <a href={question.link} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline block mt-2 text-sm">
                                        View on external site ↗
                                    </a>
                                )}
                            </div>
                        </div>

                        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                            <h3 className="font-semibold mb-3 flex items-center gap-2"><FiAward /> Mastery Level</h3>
                            <div className="flex gap-2 flex-wrap">
                                {['untouched', 'attempted', 'solved', 'understood', 'mastered'].map((level) => (
                                    <button
                                        key={level}
                                        onClick={() => onUpdateMastery(level)}
                                        className={`px-3 py-1 rounded-full text-xs border transition-all ${question.mastery === level
                                            ? 'bg-orange-600 text-white border-orange-600 ring-2 ring-orange-200 dark:ring-orange-900'
                                            : 'bg-transparent text-gray-500 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                                            }`}
                                    >
                                        {level.charAt(0).toUpperCase() + level.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col">
                        <textarea
                            value={noteEdit}
                            onChange={(e) => setNoteEdit(e.target.value)}
                            placeholder="Write your intuition, edge cases, or reminders here..."
                            className="flex-1 w-full p-4 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-orange-500 focus:outline-none resize-none"
                        />
                        <div className="flex justify-end mt-4">
                            <button
                                onClick={handleNoteSave}
                                className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
                            >
                                Save Notes
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuestionPanel;
