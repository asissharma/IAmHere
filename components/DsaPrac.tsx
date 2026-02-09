import React, { useState, useEffect } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { FiPlayCircle, FiSave } from 'react-icons/fi';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import ResizableCard from './ResizableCard';
import { Doughnut } from 'react-chartjs-2';
import DOMPurify from 'dompurify';

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

const ProgressBar: React.FC<{ value: number; label: string }> = ({ value, label }) => (
  <div>
    <label className="block text-gray-600">{label}:</label>
    <div className="flex items-center mb-2">
      <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-teal-600 bg-teal-200 mr-2">
        {value}%
      </span>
      <div className="flex-grow bg-gray-200 h-4 rounded overflow-hidden">
        <div className="bg-teal-500 h-full rounded" style={{ width: `${value}%` }} />
      </div>
    </div>
  </div>
);

const DSAPlayground: React.FC = () => {
  const [code, setCode] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [aiSolution, setAiSolution] = useState<string>(''); // State for AI solution
  const [dailyQuestions, setDailyQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [recentlySolved, setRecentlySolved] = useState<Question[]>([]);
  const [language, setLanguage] = useState<string>('javascript');
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [progress, setProgress] = useState<{ easy: number; medium: number; hard: number }>({ easy: 0, medium: 0, hard: 0 });
  const [loadingMore, setLoadingMore] = useState(false);
  const [tag, setTag] = useState<string>('solution'); // Default tag
  const [userPrompt, setUserPrompt] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [questionsData, progressData] = await Promise.all([
          axios.get('/api/getDsaQuestion?solved=false&numQuestions=2'),
          axios.get('/api/dsaProgressBar'),
        ]);
        setDailyQuestions(questionsData.data);
        setProgress(progressData.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        alert('Failed to load data. Please try again later.');
      }
    };

    fetchData();
  }, []);

  const runJavaScriptCode = async (code: string) => {
    try {
      const asyncWrapper = `(async () => { ${code} })()`;
      // SECURITY NOTE: Executing arbitrary code is inherently risky.
      // Ideally, this should be run in a Web Worker or sandboxed iframe.
      // Using new Function() is slightly safer than eval() direct access to local scope.
      const executor = new Function(`return (async () => { ${code} })()`);
      const result = await executor();
      setOutput(result !== undefined ? result.toString() : 'No output');
    } catch (err) {
      setOutput(err instanceof Error ? err.message : 'Error executing code');
    }
  };

  const runCode = async () => {
    if (!code.trim()) return;
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
    if (!code.trim()) return;
    setSaving(true);
    try {
      await axios.post('/api/saveDsaAnswer', {
        questionId,
        code,
        solvedBy: 'User123', // Replace with actual user data if available
      });

      setDailyQuestions(prev =>
        prev.map(q => (q._id === questionId ? { ...q, isSolved: true, code } : q))
      );

      setRecentlySolved(prev => [
        ...prev,
        { ...dailyQuestions.find(q => q._id === questionId), isSolved: true, code } as Question,
      ]);
    } catch (error) {
      console.error('Error saving solution:', error);
      alert('Failed to save solution. Please try again later.');
    } finally {
      setSaving(false);
    }
  };

  const fetchAiSolution = async () => {
    if (!tag || !dailyQuestions[currentQuestionIndex]) return;

    const prompt = `${tag}: ${dailyQuestions[currentQuestionIndex].problem} ${code} ${userPrompt} in js`;

    try {
      const { data } = await axios.post('/api/chat', {
        message: prompt,
        history: [], // Implement history management if needed
        systemInstruction: `Provide a ${tag} for the following problem:`,
      });
      setAiSolution(data.response);
    } catch (error) {
      console.error('Error fetching AI solution:', error);
      setAiSolution('Error fetching AI response.');
    }
  };

  const flipToNextQuestion = () => {
    setCurrentQuestionIndex(prev => (prev === 0 ? 1 : 0));
  };

  const fetchMoreSolvedQuestions = async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    try {
      const { data } = await axios.get('/api/solvedDsaQuestion', {
        params: { limit: 10, skip: recentlySolved.length },
      });
      setRecentlySolved(prev => [...prev, ...data]);
    } catch (error) {
      console.error('Error fetching more solved questions:', error);
      alert('Failed to load more solved questions. Please try again later.');
    } finally {
      setLoadingMore(false);
    }
  };

  const doughnutData = {
    labels: ['Easy', 'Medium', 'Hard'],
    datasets: [
      {
        data: [progress.easy, progress.medium, progress.hard],
        backgroundColor: ['#36A2EB', '#FF6384', '#FFCE56'],
        hoverBackgroundColor: ['#36A2EB', '#FF6384', '#FFCE56'],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 via-white to-gray-200">
      <div className="max-w-7xl mx-auto">
        <div className="flex space-x-6">
          <div className="flex-1">
            <div className='flex flex-row w-full space-x-4 p-2'> {/* Use space-x-4 for spacing between cards */}
              <motion.div
                key={currentQuestionIndex}
                initial={{ opacity: 0, rotateY: 90 }}
                animate={{ opacity: 1, rotateY: 0 }}
                exit={{ opacity: 0, rotateY: -90 }}
                transition={{ duration: 0.5 }}
                className="flex-1 mb-6 p-6 bg-white shadow-lg rounded-md" // Use flex-1 to make the question card larger
              >
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Today's Question</h2>
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700">Question</label>
                  <input
                    className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={dailyQuestions[currentQuestionIndex]?.problem || 'Loading...'}
                    readOnly
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Topic</label>
                    <input
                      type="text"
                      className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={dailyQuestions[currentQuestionIndex]?.topic || 'Loading...'}
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Difficulty</label>
                    <input
                      type="text"
                      className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={dailyQuestions[currentQuestionIndex]?.difficulty || 'Loading...'}
                      readOnly
                    />
                  </div>
                </div>
                <button
                  onClick={flipToNextQuestion}
                  className="w-full py-2 px-4 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Next Question
                </button>
              </motion.div>

              <div className="mb-6 p-4 bg-white shadow-lg rounded-md flex-none w-1/4"> {/* Adjusted size for progress card */}
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Progress Tracker</h2>
                <div className="grid grid-cols-1 gap-4 mb-4"> {/* Single column layout */}
                  <Doughnut data={doughnutData} />
                </div>
              </div>
            </div>

            <ResizableCard>
              <div className="mb-6 p-6 bg-white shadow-lg rounded-md">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Code Editor</h2>
                <MonacoEditor
                  height="300px"
                  language={language}
                  theme="vs-dark"
                  value={code}
                  onChange={(newValue) => setCode(newValue || '')}
                  options={{ minimap: { enabled: false } }}
                />
                <div className="mt-4 flex space-x-4">
                  <button
                    onClick={runCode}
                    disabled={loading}
                    className={`flex-1 py-2 px-4 bg-green-600 text-white rounded-md flex items-center justify-center space-x-2 hover:bg-green-700 transition ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <FiPlayCircle />
                    <span>{loading ? 'Running...' : 'Run Code'}</span>
                  </button>
                  <button
                    onClick={() => saveSolution(dailyQuestions[currentQuestionIndex]._id)}
                    disabled={saving}
                    className={`flex-1 py-2 px-4 bg-blue-600 text-white rounded-md flex items-center justify-center space-x-2 hover:bg-blue-700 transition ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <FiSave />
                    <span>{saving ? 'Saving...' : 'Save Solution'}</span>
                  </button>
                </div>
              </div>
            </ResizableCard>

            <motion.div
              key={output}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white shadow-lg p-6 rounded-md"
            >
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Output</h2>
              <div className="p-4 bg-gray-900 text-white rounded-md">
                <pre className="whitespace-pre-wrap">{output || 'Output will appear here...'}</pre>
              </div>
            </motion.div>
          </div>

          <div className="w-1/3 space-y-6">
            <ResizableCard>
              <div className="mb-1 p-2 bg-white shadow-lg rounded-md">
                <h2 className="text-center border border-black rounded-md text-xl font-semibold text-gray-800 mb-1">AI Suggested Solution</h2>
                <div className="mt-4 p-4 border rounded-md max-h-96 overflow-y-auto bg-gray-100">
                  <h3 className="font-semibold text-gray-800">Suggested Solution:</h3>
                  <div
                    className="whitespace-pre-wrap overflow-hidden break-words" // Added break-words to prevent overflow
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(aiSolution || 'AI solution will appear here...') }}
                  />
                </div>
                <div className="m-4">
                  <select
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                    className="block w-full mt-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="solution">Solution</option>
                    <option value="hint">Hint</option>
                    <option value="check">Check</option>
                    <option value="optimize">Optimization</option>
                    <option value="solve">Solve</option>
                  </select>
                </div>
                {/* Textarea for User Input */}
                <div className='flex items-center justify-center mb-4'> {/* Add margin-bottom for spacing */}
                  <input
                    className="flex-grow p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mr-2" // Add right margin for spacing
                    placeholder="Enter your prompt here..."
                    value={userPrompt}
                    onChange={(e) => setUserPrompt(e.target.value)}
                  />
                  <button
                    onClick={fetchAiSolution}
                    className="py-2 px-4 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition"
                  >
                    {loading ? <span>Loading...</span> : <FiPlayCircle className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </ResizableCard>

            <div className="p-6 bg-white shadow-lg rounded-md">
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Recently Solved</h3>

              {recentlySolved.length > 0 ? (

                <div className='h-64 scrollabler overflow-y-auto overflow-x-hidden'>
                  {recentlySolved.map((q) => (
                    <div key={q._id} className="border-b py-2">
                      <p className="text-gray-700">
                        <strong>Problem:</strong> {q.problem}
                      </p>
                      <p className="text-gray-600">
                        <strong>Topic:</strong> {q.topic}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No recently solved questions.</p>
              )}
              <button
                onClick={fetchMoreSolvedQuestions}
                disabled={loadingMore}
                className="mt-4 w-full py-2 text-blue-600 hover:underline"
              >
                {loadingMore ? 'Loading...' : 'Load More'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DSAPlayground;
