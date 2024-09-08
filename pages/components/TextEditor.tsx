import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import 'react-quill/dist/quill.snow.css';

// Dynamically import ReactQuill to prevent SSR
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

const TextEditor: React.FC = () => {
  const [content, setContent] = useState<string>('This is the initial content of the editor.');

  useEffect(() => {
    const fetchContent = async () => {
      const response = await fetch('/api/getText');
      const data = await response.json();
      setContent(data.content || 'This is the initial content of the editor.');
    };
    fetchContent();
  }, []);

  const handleSave = async () => {
    const editorContent = content;
    await fetch('/api/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: editorContent }),
    });
    console.log('Content saved:', editorContent);
  };

  return (
    <motion.div 
      className="mt-10 p-6 bg-white rounded-lg shadow-lg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2 }}
    >
      <ReactQuill
        theme="snow"
        value={content}
        onChange={setContent}
        modules={{
          toolbar: [
            [{ 'header': '1' }, { 'header': '2' }, { 'font': [] }],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['bold', 'italic', 'underline'],
            ['link', 'image'],
            [{ 'align': [] }],
            ['clean'],
          ],
        }}
        formats={[
          'header', 'font',
          'bold', 'italic', 'underline',
          'list', 'bullet',
          'link', 'image', 'align',
        ]}
        style={{ height: '300px' }}
      />
      <button 
        onClick={handleSave}
        className="mt-4 px-6 py-2 bg-green-500 hover:bg-green-700 text-white rounded-md"
      >
        Save
      </button>
    </motion.div>
  );
};

export default TextEditor;
