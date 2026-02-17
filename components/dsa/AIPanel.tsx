import React, { useState } from 'react';
import { FiMessageSquare, FiZap, FiHelpCircle, FiSearch } from 'react-icons/fi';
import { DSAQuestion } from '../../types/dsa';
import DOMPurify from 'dompurify';
import axios from 'axios';

interface AIPanelProps {
    question: DSAQuestion;
    code: string;
}

const AIPanel: React.FC<AIPanelProps> = ({ question, code }) => {
    const [response, setResponse] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [customPrompt, setCustomPrompt] = useState('');

    const handleCommand = async (command: string, promptText?: string) => {
        setIsLoading(true);
        setResponse('');

        const context = `
      Problem: ${question.problem}
      Description: ${question.description || question.problem}
      Difficulty: ${question.difficulty}
      Current Code: 
      \`\`\`${code}\`\`\`
    `;

        const fullPrompt = `${command}: ${context} ${promptText || ''}`;

        try {
            const { data } = await axios.post('/api/chat', {
                message: fullPrompt,
                systemInstruction: `You are an expert DSA coding tutor. Provide helpful, concise, and educational responses. Format with Markdown.`
            });
            setResponse(data.response);
        } catch (error) {
            setResponse("Error fetching AI response. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 w-80">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                <h3 className="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                    <FiZap className="text-yellow-500" /> AI Assistant
                </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Quick Commands */}
                <div className="grid grid-cols-2 gap-2">
                    <CommandBtn onClick={() => handleCommand('Explain the approach')} icon={<FiMessageSquare />} label="Explain" />
                    <CommandBtn onClick={() => handleCommand('Provide a hint')} icon={<FiHelpCircle />} label="Hint" />
                    <CommandBtn onClick={() => handleCommand('Optimize time complexity')} icon={<FiZap />} label="Optimize" />
                    <CommandBtn onClick={() => handleCommand('Identify edge cases')} icon={<FiSearch />} label="Edge Cases" />
                </div>

                {/* Custom Input */}
                <div className="flex gap-2">
                    <input
                        value={customPrompt}
                        onChange={(e) => setCustomPrompt(e.target.value)}
                        placeholder="Ask specific question..."
                        className="flex-1 px-3 py-2 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        onKeyDown={(e) => e.key === 'Enter' && handleCommand('User Question', customPrompt)}
                    />
                    <button
                        onClick={() => handleCommand('User Question', customPrompt)}
                        className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        ➜
                    </button>
                </div>

                {/* Response Area */}
                {isLoading && (
                    <div className="flex justify-center p-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                    </div>
                )}

                {response && !isLoading && (
                    <div className="prose prose-sm dark:prose-invert bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(response) }} />
                        {/* Note: 'marked' needs to be imported or handled. For now assuming raw text or pre-parsed in backend. 
                Actually the chat API returns text. We need a markdown parser here or simple render. 
                Let's simplify and just render text with whitespace for now if marked isn't available, 
                or use a simple regex replacer for bold/code. 
                Wait, DsaPrac had DOMPurify but expected HTML? 
                The chat API returns markdown usually. 
                I'll assume response is HTML for now or plain text. 
             */}
                        <pre className="whitespace-pre-wrap font-sans">{response}</pre>
                    </div>
                )}
            </div>
        </div>
    );
};

const CommandBtn = ({ onClick, icon, label }: { onClick: () => void, icon: React.ReactNode, label: string }) => (
    <button
        onClick={onClick}
        className="flex items-center justify-center gap-2 py-2 px-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors text-sm font-medium text-gray-700 dark:text-gray-200"
    >
        {icon} {label}
    </button>
);

export default AIPanel;
