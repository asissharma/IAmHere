import React, { useState } from 'react';

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
    <div className="auth-container">
      <h1>Enter Authentication Code</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter the code"
          className="border rounded p-2 mb-2"
        />
        <button
          type="submit"
          className={`px-6 py-2 rounded-md text-white ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-700'}`}
          disabled={loading}
        >
          {loading ? 'Verifying...' : 'Submit'}
        </button>
      </form>

      {message && (
        <p className={`mt-4 ${message === 'Authenticated!' ? 'text-green-500' : 'text-red-500'}`}>
          {message}
        </p>
      )}
    </div>
  );
};

export default Auth;
