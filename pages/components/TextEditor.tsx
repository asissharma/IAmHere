// components/TextEditor.tsx
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';

const QuillEditor = dynamic(() => import('react-quill'), { ssr: false });

const TextEditor: React.FC = () => {
  const [content, setContent] = useState<string>('');

  useEffect(() => {
    const savedContent = localStorage.getItem('savedContent');
    if (savedContent) {
      setContent(savedContent);
    }
  }, []);

  const handleSave = async () => {
    localStorage.setItem('savedContent', content);
    try {
      const response = await fetch('/api/save-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });
      if (response.ok) {
        alert('Content saved as file!');
      } else {
        alert('Failed to save content as file.');
      }
    } catch (error) {
      alert('Error saving content as file.');
    }
  };

  return (
    <div>
      <QuillEditor
        value={content}
        onChange={setContent}
        theme="snow"
      />
      <button onClick={handleSave}>Save Content</button>
    </div>
  );
};

export default TextEditor;
