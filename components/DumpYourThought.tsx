import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import DOMPurify from 'dompurify';
import Editor from './editor/Editor'; // Import the new Editor component

interface Thought {
  _id: string;
  topicId: string;
  content: {
    type: string;
    content: string;
    _id: string;
  }[];
  createdAt: string;
}

const DumpYourThought = () => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [thoughts, setThoughts] = useState<Thought[]>([]);

  const fetchThoughts = async () => {
    try {
      const response = await fetch('/api/getdumpYourThought');
      if (!response.ok) {
        throw new Error('Failed to fetch thoughts');
      }
      const data = await response.json();
      setThoughts(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  };

  useEffect(() => {
    fetchThoughts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/customDocumentation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topicId: '671fdebdf99d11cf32d2f727',
          content,
          type: 'dumpYourThought',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save your thought');
      }

      setSuccess(true);
      setContent('');
      fetchThoughts();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleThoughtClick = (thought: Thought) => {
    setContent(thought.content[0].content);
  };

  // Format the date to a readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(); // You can modify this to your preferred format
  };

  return (
    <div className="max-w-lg mx-auto w-full h-full bg-gradient-to-t from-blue-500 to-indigo-600 rounded-xl shadow-2xl p-2">
      <h2 className="text-3xl font-semibold text-white text-center mb-2">Dump Your Thoughts</h2>

      <div className="bg-white p-1 rounded-xl shadow-lg">
        {/* Replaced ReactQuill with Editor */}
        <div className="border-2 border-gray-300 rounded-lg overflow-hidden min-h-[150px]">
          <Editor
            value={content}
            onChange={setContent}
            isLoading={false}
            initialContent={""}
            className="prose max-w-none p-2 focus:outline-none"
          />
        </div>

        <motion.button
          onClick={(e) => handleSubmit(e as any)}
          disabled={loading}
          className="w-full mt-2 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none transition-all duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {loading ? 'Saving...' : 'Save Thought'}
        </motion.button>
      </div>

      {error && <p className="text-red-500 text-center mt-4">{error}</p>}
      {success && <p className="text-green-500 text-center mt-4">Thought saved successfully!</p>}
      <div className='bg-white rounded p-2 mt-2'>
        <h3 className="text-2xl font-semibold text-center mt-2">Your Thoughts</h3>
        <motion.ul
          className="mt-4 space-y-3 h-64 scrollabler overflow-y-auto overflow-x-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {thoughts.map((thought) => (
            <motion.li
              key={thought._id}
              className="p-2 bg-white rounded-lg shadow-md cursor-pointer hover:bg-gray-100 transition-all duration-300"
              onClick={() => handleThoughtClick(thought)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              {thought.createdAt ? (
                <p className="text-lg text-gray-700">
                  {formatDate(thought.createdAt)} {/* Call formatDate here */}
                </p>
              ) : null}

              <p className="text-lg text-gray-700" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(thought.content[0]?.content?.slice(0, 50)) }} />
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </div>
  );
};

export default DumpYourThought;
