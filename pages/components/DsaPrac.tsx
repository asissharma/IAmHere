import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MonacoEditor from '@monaco-editor/react';
import { FiPlayCircle, FiSave } from 'react-icons/fi';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Question {
  _id: string;
  sno: number;
  topic: string;
  problem: string;
  difficulty: string;
  isSolved: boolean;
  solvedBy: string;
  code?: string;
}

const DSAPlayground: React.FC = () => {
  const [code, setCode] = useState<string>(''); // User-written code
  const [output, setOutput] = useState<string>(''); // Code execution output
  const [dailyQuestions, setDailyQuestions] = useState<Question[]>([]); // Two questions
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // Flip between two questions
  const [recentlySolved, setRecentlySolved] = useState<Question[]>([]); // Solved questions list
  const [language, setLanguage] = useState<string>('javascript'); // Language selection
  const [loading, setLoading] = useState<boolean>(false); // Loading state
  const [progress, setProgress] = useState<{ easy: number; medium: number; hard: number }>({ easy: 0, medium: 0, hard: 0 });

  useEffect(() => {
    const fetchQuestions = async () => {
      // Fetch two unsolved questions from the database
      const { data } = await axios.get('/api/getDsaQuestion?solved=false&numQuestions=2');
      setDailyQuestions(data);
    };

    const fetchProgress = async () => {
      const { data } = await axios.get('/api/dsaProgressBar');
      setProgress(data);
    };

    fetchQuestions();
    fetchProgress();
  }, []);

  const runJavaScriptCode = async (code: string) => {
    try {
      const asyncWrapper = `(async () => { ${code} })()`;
      const result = await eval(asyncWrapper); // Safe in controlled environment, avoid in prod
      setOutput(result !== undefined ? result.toString() : 'No output');
    } catch (err) {
      setOutput(err instanceof Error ? err.message : String(err));
    }
  };

  const runCode = async () => {
    setLoading(true);
    setOutput('');
    try {
      if (language === 'javascript') {
        await runJavaScriptCode(code);
      } else {
        setOutput('Currently, only JavaScript execution is supported.');
      }
    } catch {
      setOutput('Error in execution');
    } finally {
      setLoading(false);
    }
  };

  const saveSolution = async (questionId: string) => {
    try {
      await axios.post('/api/saveDsaAnswer', {
        questionId,
        code,
        solvedBy: 'User123', // Replace with actual user data if available
      });
  
      // Update the local state
      setDailyQuestions(prev =>
        prev.map(q => (q._id === questionId ? { ...q, isSolved: true, code } : q))
      );
  
      // Add to recently solved questions list
      setRecentlySolved(prev => [
        ...prev,
        { ...dailyQuestions.find(q => q._id === questionId), isSolved: true, code } as Question,
      ]);
    } catch (error) {
      console.error('Error saving solution:', error);
    }
  };
  
  const flipToNextQuestion = () => {
    setCurrentQuestionIndex(prev => (prev === 0 ? 1 : 0));
  };

  const fetchMoreSolvedQuestions = async () => {
    const { data } = await axios.get('/api/solvedDsaQuestion', {
      params: { limit: 10, skip: recentlySolved.length },
    });
    setRecentlySolved(prev => [...prev, ...data]);
  };

  // Progress bar component
  const ProgressBar = ({ value, label }: { value: number; label: string }) => (
    <div className="">
      <label className="block text-gray-600">{label}:</label>
      <div className="relative pt-1">
        <div className="flex mb-2 items-center justify-between">
          <div>
            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-teal-600 bg-teal-200 mr-2">
              {value}%
            </span>
          </div>
        </div>
        <div className="flex h-4 bg-gray-200 rounded">
          <div
            className="bg-teal-500 h-4 rounded"
            style={{ width: `${value}%` }}
          />
        </div>
      </div>
    </div>
  );

  return (
    <motion.div className="flex flex-col bg-white max-w-6xl mx-auto">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4 text-gray-900">DSA Code Playground</h2>
        <p className="text-gray-600 mb-6">Practice your DSA skills by solving daily questions and running your code.</p>
      </div>
      <div className="flex flex-row flex-grow">
        {/* Left: Daily Questions and Editor */}
        <div className="w-2/3 p-4">
          {/* Progress Tracker */}
          <div className="progress-tracker mb-6">
            <h3 className="text-xl font-semibold mb-2">Progress Tracker:</h3>
            <ProgressBar value={progress.easy} label="Easy" />
            <ProgressBar value={progress.medium} label="Medium" />
            <ProgressBar value={progress.hard} label="Hard" />
          </div>

          {/* Daily Questions Section */}
          <div className="mb-6 p-4 bg-gray-100 rounded-md shadow relative">
            <h3 className="text-xl font-semibold mb-2">Today's Questions:</h3>
            <AnimatePresence mode="wait">
              {dailyQuestions.length > 0 && (
                <motion.div
                  key={dailyQuestions[currentQuestionIndex]._id}
                  initial={{ opacity: 0, rotateY: 90 }}
                  animate={{ opacity: 1, rotateY: 0 }}
                  exit={{ opacity: 0, rotateY: -90 }}
                  transition={{ duration: 0.6 }}
                  className="border-b py-2"
                >
                  <p className={`text-gray-800 ${dailyQuestions[currentQuestionIndex].isSolved ? 'line-through' : ''}`}>
                    <strong>Problem:</strong> {dailyQuestions[currentQuestionIndex].problem}
                  </p>
                  <p className="text-gray-600">
                    <strong>Topic:</strong> {dailyQuestions[currentQuestionIndex].topic}
                  </p>
                  <p className="text-gray-600">
                    <strong>Difficulty:</strong> {dailyQuestions[currentQuestionIndex].difficulty}
                  </p>
                  {!dailyQuestions[currentQuestionIndex].isSolved && (
                    <button
                      onClick={() => saveSolution(dailyQuestions[currentQuestionIndex]._id)}
                      className="mt-2 text-blue-600"
                    >
                      Save Solution
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
            <button onClick={flipToNextQuestion} className="mt-4 text-blue-600">
              Flip to Next Question
            </button>
          </div>

          {/* Language Selector */}
          <div className="mb-6 flex justify-between items-center">
            <label className="text-gray-600 font-medium">Select Language:</label>
            <select
              value={language}
              onChange={e => setLanguage(e.target.value)}
              className="border rounded-md p-2 bg-gray-50 text-gray-800 focus:ring-2 focus:ring-blue-500"
            >
              <option value="javascript">JavaScript</option>
              <option value="python" disabled>
                Python (Coming Soon)
              </option>
            </select>
          </div>

          {/* Monaco Code Editor */}
          <motion.div className="editor-container border-2 rounded-lg mb-6 overflow-hidden shadow-md">
            <MonacoEditor
              height="450px"
              language={language}
              theme="vs-dark"
              value={code}
              onChange={newValue => setCode(newValue || '')}
              options={{
                fontSize: 16,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                automaticLayout: true,
              }}
            />
          </motion.div>

          {/* Buttons Container */}
          <div className="flex justify-between">
            {/* Save Button */}
            <motion.button
              onClick={() => saveSolution(dailyQuestions[currentQuestionIndex]._id)}
              className={`w-1/2 py-3 text-lg text-white font-bold rounded-md transition-colors duration-300 bg-blue-600 hover:bg-blue-800`}
            >
              <div className="flex justify-center items-center">
                <FiSave className="mr-2" />
                Save Solution
              </div>
            </motion.button>

            {/* Run Button */}
            <motion.button
              onClick={runCode}
              className={`w-1/2 py-3 text-lg text-white font-bold rounded-md transition-colors duration-300 ${
                loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-800'
              }`}
              disabled={loading}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              {loading ? 'Running...' : (
                <div className="flex justify-center items-center">
                  <FiPlayCircle className="mr-2" />
                  Run Code
                </div>
              )}
            </motion.button>
          </div>

          {/* Output Console */}
          <motion.div className="output-container bg-gray-900 text-white p-4 rounded-lg shadow-lg mt-6">
            <h3 className="text-xl font-semibold mb-2 text-yellow-400">Output:</h3>
            <pre className="whitespace-pre-wrap text-gray-200 font-mono">
              {output || 'Your output will appear here...'}
            </pre>
          </motion.div>
        </div>

        {/* Right: Recently Solved Questions */}
        <div className="w-1/3 mt-6 ml-6 bg-gray-100 rounded-md p-4 shadow">
          <h3 className="text-xl font-semibold mb-2">Recently Solved:</h3>
          {recentlySolved.map(q => (
            <div key={q._id} className="border-b py-2">
              <p className="text-gray-800">
                <strong>Problem:</strong> {q.problem}
              </p>
              <p className="text-gray-600">
                <strong>Topic:</strong> {q.topic}
              </p>
            </div>
          ))}
          {/* Infinite scroll button */}
          <button onClick={fetchMoreSolvedQuestions} className="mt-2 text-blue-600">
            Load More
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default DSAPlayground;
