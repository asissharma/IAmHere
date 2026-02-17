import React, { useState, useEffect } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { FiPlay, FiSave, FiClock, FiRotateCcw, FiCpu } from 'react-icons/fi';
import { DSASolution } from '../../types/dsa';
import axios from 'axios';

interface SolutionStudioProps {
    code: string;
    language: string;
    onChange: (value: string) => void;
    onRun: () => void;
    onSave: () => void;
    isRunning: boolean;
    isSaving: boolean;
    output: string;
    questionId: string;
}

const SolutionStudio: React.FC<SolutionStudioProps> = ({
    code,
    language,
    onChange,
    onRun,
    onSave,
    isRunning,
    isSaving,
    output,
    questionId
}) => {
    const [history, setHistory] = useState<DSASolution[]>([]);
    const [showHistory, setShowHistory] = useState(false);

    useEffect(() => {
        if (showHistory && questionId) {
            fetchHistory();
        }
    }, [showHistory, questionId]);

    const fetchHistory = async () => {
        try {
            const { data } = await axios.get(`/api/saveDsaAnswer?questionId=${questionId}`);
            setHistory(data);
        } catch (error) {
            console.error("Failed to fetch history", error);
        }
    };

    const loadVersion = (versionCode: string) => {
        if (confirm("Load this version? Current code will be replaced.")) {
            onChange(versionCode);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-gray-500 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                        {language}
                    </span>
                    <button
                        onClick={() => setShowHistory(!showHistory)}
                        className={`flex items-center gap-1 text-xs px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${showHistory ? 'text-orange-600 bg-orange-100' : 'text-gray-500'}`}
                    >
                        <FiClock /> History
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={onRun}
                        disabled={isRunning}
                        className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded transition-colors disabled:opacity-50"
                    >
                        <FiPlay /> {isRunning ? 'Running...' : 'Run'}
                    </button>
                    <button
                        onClick={onSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded transition-colors disabled:opacity-50"
                    >
                        <FiSave /> {isSaving ? 'Save' : 'Save'}
                    </button>
                </div>
            </div>

            {/* History Panel (Conditional) */}
            {showHistory && (
                <div className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-2 flex gap-2 overflow-x-auto">
                    {history.length === 0 ? <span className="text-xs text-gray-500 p-2">No history found. Save a solution to create a version.</span> :
                        history.map((ver) => (
                            <button
                                key={ver.version}
                                onClick={() => loadVersion(ver.code)}
                                className="flex flex-col items-start min-w-[120px] p-2 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 hover:border-orange-500 text-xs"
                            >
                                <span className="font-bold text-gray-700 dark:text-gray-200">v{ver.version}</span>
                                <span className="text-gray-500 dark:text-gray-400">{new Date(ver.createdAt).toLocaleDateString()}</span>
                                {ver.timeComplexity && <span className="text-[10px] text-gray-400">{ver.timeComplexity}</span>}
                            </button>
                        ))
                    }
                </div>
            )}

            {/* Editor */}
            <div className="flex-1 min-h-[300px]">
                <MonacoEditor
                    height="100%"
                    language={language}
                    theme="vs-dark"
                    value={code}
                    onChange={(val) => onChange(val || '')}
                    options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        fontFamily: "'Fira Code', monospace",
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                    }}
                />
            </div>

            {/* Console / Output */}
            <div className="bg-gray-900 text-gray-100 border-t border-gray-700 flex flex-col h-1/3 min-h-[150px]">
                <div className="px-4 py-2 border-b border-gray-800 flex justify-between items-center">
                    <span className="text-xs font-mono text-gray-400 flex items-center gap-2"><FiCpu /> Console Output</span>
                    <button
                        onClick={() => { }} // Clear console logic if needed
                        className="text-xs text-gray-500 hover:text-white"
                    >
                        Clear
                    </button>
                </div>
                <div className="flex-1 p-4 font-mono text-sm overflow-auto whitespace-pre-wrap">
                    {output || <span className="text-gray-600 italic">Ready to execute...</span>}
                </div>
            </div>
        </div>
    );
};

export default SolutionStudio;
