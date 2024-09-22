import React, { useState } from 'react';
import Editor from '@monaco-editor/react'; // Make sure to install Monaco Editor

// Placeholder for the AI Assistant component
const AIAssistant = () => {
  return <div>Please integrate the AI assistant here.</div>;
};

const LearningPaths: React.FC = () => {
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  const [notes, setNotes] = useState<string>('');

  const learningTopics = [
    { title: 'Dynamic Programming', content: 'dp-handbook.md' },
    { title: 'Data Structures', content: 'data-structures-guide.md' },
  ];

  const documentContent: Record<string, string> = {
    'dp-handbook.md': '# Dynamic Programming\nLearn about memoization, tabulation, and more...',
    'data-structures-guide.md': '# Data Structures\nExplore arrays, linked lists, trees, etc.',
  };

  const handleTopicClick = (docName: string) => {
    setSelectedDoc(documentContent[docName] || null);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Learning Paths</h1>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {/* Topics List */}
        <div className="col-span-1 bg-blue-200 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Topics</h2>
          <ul>
            {learningTopics.map((topic, index) => (
              <li
                key={index}
                className="text-blue-700 cursor-pointer hover:underline mb-2"
                onClick={() => handleTopicClick(topic.content)}
              >
                {topic.title}
              </li>
            ))}
          </ul>
        </div>

        {/* Documentation Viewer */}
        <div className="col-span-3 bg-green-200 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Documentation</h2>
          {selectedDoc ? (
            <div className="prose max-w-full">
              <pre className="bg-gray-200 p-4 rounded">{selectedDoc}</pre>
              {/* To render Markdown: <ReactMarkdown>{selectedDoc}</ReactMarkdown> */}
            </div>
          ) : (
            <p className="text-gray-600">Select a topic to view its documentation.</p>
          )}
        </div>
      </div>

      {/* Notes and AI Assistant Section */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-200 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Notes</h2>
          <Editor
            height="400px"
            defaultLanguage="markdown"
            value={notes}
            onChange={(value) => setNotes(value || '')}
            theme="vs-dark" // You can choose a theme
            options={{
              automaticLayout: true,
              formatOnPaste: true,
              formatOnType: true
            }}
          />
        </div>

        {/* AI Assistant for Help */}
        <div className="bg-purple-200 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">AI Learning Assistant</h2>
          <AIAssistant />
        </div>
      </div>
    </div>
  );
};

export default LearningPaths;
