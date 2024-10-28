import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Thought {
  _id: string;
  topicId: string;
  content: {
    type: string;
    content: string;
    _id: string;
  }[]; // Adjusted to match the actual structure of content
}

const DumpYourThought = () => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [thoughts, setThoughts] = useState<Thought[]>([]);

  const fetchThoughts = async () => {
    try {
      const response = await fetch('/api/getdumpYourThought'); // Adjust this to your actual API route
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
          topicId: '671fdebdf99d11cf32d2f727', // Replace with actual topic ID
          content,
          type: 'dumpYourThought'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save your thought');
      }

      setSuccess(true);
      setContent('');
      fetchThoughts(); // Refresh thoughts after saving
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleThoughtClick = (thought: Thought) => {
    setContent(thought.content[0].content); // Load the clicked thought's content into the textarea
  };

  return (
    <div className="max-w-md mx-auto w-full h-full bg-white rounded-lg shadow-lg p-4">
      <h2 className="text-2xl font-bold text-center mb-4">Dump Your Thoughts</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={5}
          placeholder="Write your thoughts here..."
          className="w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 focus:outline-none"
        >
          {loading ? 'Saving...' : 'Save Thought'}
        </button>
      </form>
      {error && <p className="text-red-500 text-center mt-2">{error}</p>}
      {success && <p className="text-green-500 text-center mt-2">Thought saved successfully!</p>}

      <h3 className="text-xl font-semibold mt-6">Your Thoughts</h3>
      <motion.ul 
        className="mt-4 space-y-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {thoughts.map((thought) => (
          <motion.li 
            key={thought._id} 
            className="p-2 border rounded-lg cursor-pointer hover:bg-gray-100"
            onClick={() => handleThoughtClick(thought)}
            whileHover={{ scale: 1.05 }} // Scale effect on hover
            whileTap={{ scale: 0.95 }} // Scale effect on tap
          >
            {thought.content[0]?.content} {/* Access the first content item */}
          </motion.li>
        ))}
      </motion.ul>
    </div>
  );
};

export default DumpYourThought;
