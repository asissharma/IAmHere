import React, { useState, useMemo } from 'react';
import { DSATree, DSAQuestion } from '../../types/dsa';
import { FiChevronDown, FiChevronRight, FiSearch, FiCheckCircle, FiCircle } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

interface TopicTreeProps {
    tree: DSATree;
    onSelectQuestion: (question: DSAQuestion) => void;
    selectedQuestionId?: string;
}

const TopicTree: React.FC<TopicTreeProps> = ({ tree, onSelectQuestion, selectedQuestionId }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({});

    const toggleTopic = (topic: string) => {
        setExpandedTopics((prev) => ({ ...prev, [topic]: !prev[topic] }));
    };

    // Filter tree based on search term
    const filteredTree = useMemo(() => {
        if (!searchTerm) return tree;
        const lowerSearch = searchTerm.toLowerCase();
        const newTree: DSATree = {};

        Object.entries(tree).forEach(([topic, subtopics]) => {
            let topicMatch = topic.toLowerCase().includes(lowerSearch);
            const newSubtopics: any = {};
            let subtopicHasMatch = false;

            Object.entries(subtopics).forEach(([subtopic, patterns]) => {
                let subtopicMatch = subtopic.toLowerCase().includes(lowerSearch);
                const newPatterns: any = {};
                let patternHasMatch = false;

                Object.entries(patterns).forEach(([pattern, questions]) => {
                    const matchingQuestions = questions.filter((q) =>
                        q.problem.toLowerCase().includes(lowerSearch) ||
                        q.pattern.toLowerCase().includes(lowerSearch)
                    );

                    if (matchingQuestions.length > 0 || subtopicMatch || topicMatch) {
                        newPatterns[pattern] = matchingQuestions.length > 0 ? matchingQuestions : questions;
                        patternHasMatch = true;
                    }
                });

                if (patternHasMatch || subtopicMatch || topicMatch) {
                    newSubtopics[subtopic] = newPatterns;
                    subtopicHasMatch = true;
                }
            });

            if (subtopicHasMatch || topicMatch) {
                newTree[topic] = newSubtopics;
            }
        });

        return newTree;
    }, [tree, searchTerm]);

    return (
        <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 w-80">
            {/* Search Bar */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-gray-50 dark:bg-gray-900 z-10 w-[95%]">
                <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search topics or problems..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-orange-500 focus:outline-none dark:text-gray-100"
                    />
                </div>
            </div>

            {/* Tree Content */}
            <div className="flex-1 overflow-y-auto w-[90%]">
                {Object.entries(filteredTree).map(([topic, subtopics]) => (
                    <div key={topic} className="border-b border-gray-100 dark:border-gray-800">
                        <button
                            onClick={() => toggleTopic(topic)}
                            className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-sm align-start">{topic}</h3>
                            {expandedTopics[topic] ? <FiChevronDown /> : <FiChevronRight />}
                        </button>

                        <AnimatePresence>
                            {(expandedTopics[topic] || searchTerm) && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden bg-white dark:bg-gray-900/50"
                                >
                                    {Object.entries(subtopics).map(([subtopic, patterns]) => (
                                        <div key={subtopic} className="pl-4">
                                            <div className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider mt-2">
                                                {subtopic || 'General'}
                                            </div>

                                            {Object.entries(patterns).map(([pattern, questions]) => (
                                                <div key={pattern} className="mb-2">
                                                    {pattern && <div className="px-4 py-1 text-xs text-orange-600 dark:text-orange-400 font-medium pl-6">{pattern}</div>}
                                                    <div>
                                                        {questions.map((q) => (
                                                            <button
                                                                key={q._id}
                                                                onClick={() => onSelectQuestion(q)}
                                                                className={`w-full text-left px-8 py-2 text-sm flex items-center gap-3 transition-colors ${selectedQuestionId === q._id
                                                                        ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border-r-4 border-orange-500'
                                                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                                                                    }`}
                                                            >
                                                                <StatusIcon mastery={q.mastery} isSolved={q.isSolved} />
                                                                <span className={`truncate ${q.mastery === 'mastered' ? 'bg-gradient-to-r from-yellow-700 via-orange-500 to-red-500 bg-clip-text text-transparent font-bold' : ''}`}>{q.problem}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}
            </div>
        </div>
    );
};

const StatusIcon = ({ mastery, isSolved }: { mastery?: string; isSolved: boolean }) => {
    if (mastery === 'mastered') return <FiCheckCircle className="text-purple-500 w-4 h-4 flex-shrink-0" />;
    if (mastery === 'solved' || isSolved) return <FiCheckCircle className="text-green-500 w-4 h-4 flex-shrink-0" />;
    if (mastery === 'attempted') return <div className="w-4 h-4 rounded-full border-2 border-yellow-500 flex-shrink-0" />;
    return <div className="w-4 h-4 rounded-full border-2 border-gray-300 dark:border-gray-600 flex-shrink-0" />;
};

export default TopicTree;
