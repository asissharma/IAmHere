// components/TextEditor.tsx
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const QuillEditor = dynamic(() => import('react-quill'), { ssr: false });

const TextEditor: React.FC = () => {
  const [content, setContent] = useState<string>('');

  // Load content from localStorage on component mount
  useEffect(() => {
    const savedContent = localStorage.getItem('savedContent');
    if (savedContent) {
      setContent(savedContent);
    }
  }, []);

  // Save content to localStorage on change
  const handleChange = (newContent: string) => {
    setContent(newContent);
    localStorage.setItem('savedContent', newContent);
  };

  return (
    <div>
      <QuillEditor
        value={content}
        onChange={handleChange}
        theme="snow"
      />
      <button onClick={() => localStorage.setItem('savedContent', content)}>Save</button>
    </div>
  );
};

export default TextEditor;
