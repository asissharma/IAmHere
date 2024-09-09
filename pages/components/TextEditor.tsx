import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import 'react-quill/dist/quill.snow.css';

// Dynamically import ReactQuill to prevent SSR
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

const TextEditor: React.FC = () => {
  const [content, setContent] = useState<string>('This is the initial content of the editor.');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch('/api/getText');
        if (!response.ok) throw new Error('Failed to fetch content');
        const data = await response.json();
        setContent(data.content || 'This is the initial content of the editor.');
      } catch (err) {
        console.error(err);
        setError('Error fetching content.');
      }
    };
    fetchContent();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      const editorContent = content;
      const response = await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editorContent }),
      });
      if (!response.ok) throw new Error('Failed to save content');
      console.log('Content saved:', editorContent);
    } catch (err) {
      console.error(err);
      setError('Error saving content.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="mt-10 p-6 bg-white rounded-lg shadow-lg max-w-4xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">Text Editor</h2>
      {error && (
        <p className="text-red-500 mb-4">{error}</p>
      )}

      {/* Wrapping ReactQuill in a div */}
      <div className="mb-6"> {/* Added margin-bottom */}
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
          style={{ height: '400px' }}
        />
      </div>

      <motion.button
        onClick={handleSave}
        className={`px-6 py-2 text-white font-semibold rounded-md transition-colors duration-300 ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-700'}`}
        disabled={loading}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.2 }}
        style={{ marginTop: '50px' }}  // Corrected inline style syntax
      >
        {loading ? 'Saving...' : 'Save'}
      </motion.button>
    </motion.div>
  );
};

export default TextEditor;
