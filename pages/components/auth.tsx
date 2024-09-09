import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface AuthProps {
  onSuccess: () => void; // Callback to notify success
}

const Auth: React.FC<AuthProps> = ({ onSuccess }) => {
  const [code, setCode] = useState<string>(''); // State for the input code
  const [message, setMessage] = useState<string>(''); // State for response message
  const [loading, setLoading] = useState<boolean>(false); // State for loading spinner

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }), // Send the entered code to the backend
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Authenticated!');
        onSuccess(); // Notify parent component of success
      } else {
        setMessage(data.message || 'Invalid code');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Something went wrong!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-3xl font-semibold text-gray-700 mb-6">Enter Authentication Code</h1>
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          <motion.input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter the code"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-transform duration-200"
            whileFocus={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          />
          <motion.button
            type="submit"
            className={`w-full px-4 py-2 text-white font-semibold rounded-lg transition-colors duration-300 ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 focus:ring-2 focus:ring-blue-500'}`}
            disabled={loading}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            {loading ? 'Verifying...' : 'Submit'}
          </motion.button>
        </motion.form>

        {message && (
          <motion.p
            className={`mt-4 text-center text-lg font-medium ${message === 'Authenticated!' ? 'text-green-500' : 'text-red-500'}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {message}
          </motion.p>
        )}
      </div>
    </motion.div>
  );
};

export default Auth;
