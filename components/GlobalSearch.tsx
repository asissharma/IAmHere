
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/router';
import { FaSearch, FaBook, FaCode, FaHome, FaTimes, FaArrowRight } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchNodes } from '../pages/api/utils';
import { Node } from '../types/types';
import { DSAQuestion } from '../types/dsa';

interface SearchResult {
    id: string;
    title: string;
    type: 'note' | 'dsa' | 'nav';
    path?: string;
    icon?: React.ReactNode;
    subtitle?: string;
}

const GlobalSearch: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [notes, setNotes] = useState<Node[]>([]);
    const [dsaQuestions, setDsaQuestions] = useState<DSAQuestion[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);

    // Toggle Open
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(prev => !prev);
            }
            if (e.key === 'Escape' && isOpen) {
                setIsOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    // Data Fetching on Open
    useEffect(() => {
        if (isOpen) {
            setIsLoading(true);
            setQuery("");
            setSelectedIndex(0);

            // Parallel fetch
            Promise.all([
                fetchNodes().catch(() => []),
                fetch('/api/getDsaQuestion?numQuestions=1000').then(res => res.json()).catch(() => [])
            ]).then(([fetchedNodes, fetchedQuestions]) => {
                setNotes(fetchedNodes.map((n: any) => ({ ...n, id: n.nodeId })));
                if (Array.isArray(fetchedQuestions)) {
                    setDsaQuestions(fetchedQuestions);
                }
                setIsLoading(false);
                // Focus input
                setTimeout(() => inputRef.current?.focus(), 100);
            });
        }
    }, [isOpen]);

    // Search Logic
    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            return;
        }

        const lowerQuery = query.toLowerCase();

        const navResults: SearchResult[] = [
            { id: 'nav-home', title: 'Home', type: 'nav' as const, path: '/', icon: <FaHome /> },
            { id: 'nav-notebook', title: 'Notebook', type: 'nav' as const, path: '/notebook', icon: <FaBook /> },
            { id: 'nav-dsa', title: 'DSA Playground', type: 'nav' as const, path: '/dsa', icon: <FaCode /> }
        ].filter(n => n.title.toLowerCase().includes(lowerQuery));

        const noteResults: SearchResult[] = notes
            .filter(n => n.title.toLowerCase().includes(lowerQuery))
            .slice(0, 5)
            .map(n => ({
                id: n.id,
                title: n.title,
                type: 'note',
                path: `/notebook?nodeId=${n.nodeId}`,
                icon: <FaBook className="text-blue-500" />,
                subtitle: n.tags?.join(', ')
            }));

        const dsaResults: SearchResult[] = dsaQuestions
            .filter(q => q.problem.toLowerCase().includes(lowerQuery) || q.topic.toLowerCase().includes(lowerQuery))
            .slice(0, 5)
            .map(q => ({
                id: q._id,
                title: q.problem,
                type: 'dsa',
                path: `/dsa`, // How to open specific question? Maybe add query param support in DSA page too?
                // For now, redirect to DSA page. Or implementing logic similar to Notebook.
                // Assuming DSA page matches 'dsa' path.
                // Let's assume we can pass dsa?id=... logic later.
                // Actually I need to implement deep linking for DSA too?
                // For now, let's just go to /dsa, users can search there.
                // Wait, users expect "Global Search" to go TO the item.
                // I should implement query param support in DsaPrac.tsx as well!
                // Let's use `/dsa?questionId=${q._id}`
                icon: <FaCode className="text-orange-500" />,
                subtitle: `${q.topic} - ${q.difficulty}`
            }));

        setResults([...navResults, ...noteResults, ...dsaResults]);
        setSelectedIndex(0);
    }, [query, notes, dsaQuestions]);

    const handleSelect = (result: SearchResult) => {
        setIsOpen(false);
        if (result.type === 'dsa') {
            // Special handling for DSA deep link
            // We need to implement this in DsaPrac.tsx
            router.push(`/dsa?questionId=${result.id}`);
        } else if (result.path) {
            router.push(result.path);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev + 1) % results.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (results[selectedIndex]) {
                handleSelect(results[selectedIndex]);
            }
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -20 }}
                    className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col"
                    onClick={e => e.stopPropagation()}
                >
                    <div className="flex items-center px-4 py-4 border-b border-gray-100 dark:border-gray-800">
                        <FaSearch className="text-gray-400 mr-3" size={18} />
                        <input
                            ref={inputRef}
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Search anything... (Notes, Questions, Navigation)"
                            className="flex-1 bg-transparent text-lg text-gray-800 dark:text-gray-100 placeholder-gray-400 outline-none"
                        />
                        <button onClick={() => setIsOpen(false)} className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs text-gray-500 font-mono">
                            ESC
                        </button>
                    </div>

                    <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                        {results.length > 0 ? (
                            <div className="py-2">
                                {results.map((result, index) => (
                                    <div
                                        key={`${result.type}-${result.id}`}
                                        onClick={() => handleSelect(result)}
                                        className={`px-4 py-3 flex items-center justify-between cursor-pointer transition-colors ${index === selectedIndex ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className={`p-2 rounded-lg ${result.type === 'nav' ? 'bg-gray-100 dark:bg-gray-800 text-gray-500' :
                                                result.type === 'note' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' :
                                                    'bg-orange-100 dark:bg-orange-900/30 text-orange-600'
                                                }`}>
                                                {result.icon}
                                            </div>
                                            <div className="flex flex-col overflow-hidden">
                                                <span className={`text-sm font-medium truncate ${index === selectedIndex ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-200'}`}>
                                                    {result.title}
                                                </span>
                                                {result.subtitle && (
                                                    <span className="text-xs text-gray-400 truncate">{result.subtitle}</span>
                                                )}
                                            </div>
                                        </div>
                                        {index === selectedIndex && <FaArrowRight className="text-blue-500 text-xs" />}
                                    </div>
                                ))}
                            </div>
                        ) : query ? (
                            <div className="p-8 text-center text-gray-400">
                                <p>No results found for "{query}"</p>
                            </div>
                        ) : (
                            <div className="p-8 text-center text-gray-400 text-sm">
                                <p>Type to search...</p>
                                <div className="mt-4 flex justify-center gap-4 text-xs font-mono">
                                    <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">Notes</span>
                                    <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">DSA Questions</span>
                                    <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">Navigation</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex justify-between text-[10px] text-gray-400 font-mono">
                        <div className="flex gap-4">
                            <span>⇅ Select</span>
                            <span>↵ Open</span>
                        </div>
                        <div>
                            IAmHere v2.0
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default GlobalSearch;
