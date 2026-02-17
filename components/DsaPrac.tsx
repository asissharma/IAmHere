import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DSAQuestion, DSAStats, DSATree } from '../types/dsa';
import TopicTree from './dsa/TopicTree';
import QuestionPanel from './dsa/QuestionPanel';
import SolutionStudio from './dsa/SolutionStudio';
// import AIPanel from './dsa/AIPanel'; // Commented out until we fix the AIPanel import or file
import StatsBar from './dsa/StatsBar';
import { FiMenu, FiX } from 'react-icons/fi';

const DSAPlayground: React.FC = () => {
  const [tree, setTree] = useState<DSATree>({});
  const [stats, setStats] = useState<DSAStats>({
    easy: 0, medium: 0, hard: 0, totalSolved: 0, totalQuestions: 0,
    mastery: { untouched: 0, attempted: 0, solved: 0, understood: 0, mastered: 0 }
  });
  const [selectedQuestion, setSelectedQuestion] = useState<DSAQuestion | null>(null);
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Initial Fetch
  useEffect(() => {
    fetchTree();
    fetchStats();
  }, []);

  const fetchTree = async () => {
    try {
      const { data } = await axios.get('/api/getDsaQuestion?mode=tree&numQuestions=1000'); // Fetch all for tree
      setTree(data);
    } catch (error) {
      console.error("Failed to fetch DSA tree", error);
    }
  };

  const fetchStats = async () => {
    try {
      const { data } = await axios.get('/api/dsaProgressBar');
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch stats", error);
    }
  };

  const handleSelectQuestion = (question: DSAQuestion) => {
    setSelectedQuestion(question);
    setCode(question.code || ''); // Load existing code if available
    setOutput('');
    // On mobile, close sidebar after selection
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  const handleRunCode = async () => {
    if (!code.trim()) return;
    setIsRunning(true);
    setOutput('');
    try {
      // Basic client-side execution for JS
      // For a real playground, this should hit a secure sandbox API (e.g. Piston)
      // or at least a Web Worker. keeping existing logic for now.
      const executor = new Function(`return (async () => { ${code} })()`);
      const result = await executor();
      setOutput(result !== undefined ? result.toString() : 'Success (No output)');
    } catch (err: any) {
      setOutput(err.toString());
    } finally {
      setIsRunning(false);
    }
  };

  const handleSaveSolution = async () => {
    if (!selectedQuestion) return;
    setIsSaving(true);
    try {
      await axios.post('/api/saveDsaAnswer', {
        questionId: selectedQuestion._id,
        code,
        language: 'javascript', // Fixed for now
        solvedBy: 'User', // Auth context needed
        duration: 0
      });

      // Update local state to reflect saved status
      setSelectedQuestion(prev => prev ? { ...prev, code, isSolved: true } : null);
      fetchStats(); // Refresh stats
      fetchTree(); // Refresh tree (mastery might update)
    } catch (error) {
      console.error("Failed to save solution", error);
      alert("Failed to save solution");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateMastery = async (level: string) => {
    if (!selectedQuestion) return;
    try {
      await axios.post('/api/solvedDsaQuestion', {
        questionId: selectedQuestion._id,
        mastery: level
      });
      setSelectedQuestion(prev => prev ? { ...prev, mastery: level as any } : null);
      fetchStats();
      fetchTree(); // Refresh tree indicators
    } catch (error) {
      console.error("Failed to update mastery", error);
    }
  };

  const handleUpdateNotes = async (notes: string) => {
    if (!selectedQuestion) return;
    try {
      await axios.post('/api/solvedDsaQuestion', {
        questionId: selectedQuestion._id,
        inlineNotes: notes
      });
      setSelectedQuestion(prev => prev ? { ...prev, inlineNotes: notes } : null);
    } catch (error) {
      console.error("Failed to update notes", error);
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">

      {/* Sidebar Toggle (Mobile) */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="absolute left-4 top-20 z-20 p-2 bg-white dark:bg-gray-800 shadow-lg rounded-full md:hidden"
        >
          <FiMenu />
        </button>
      )}

      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 relative border-r border-gray-200 dark:border-gray-700 flex-shrink-0 bg-gray-50 dark:bg-gray-900`}>
        <div className="h-full overflow-hidden">
          <TopicTree
            tree={tree}
            onSelectQuestion={handleSelectQuestion}
            selectedQuestionId={selectedQuestion?._id}
          />
        </div>
        {/* Close Sidebar Button */}
        {sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(false)}
            className="absolute right-2 top-2 p-1 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white md:hidden"
          >
            <FiX />
          </button>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <StatsBar stats={stats} />

        {selectedQuestion ? (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Left: Question Panel */}
            <div className="md:w-1/3 border-r border-gray-200 dark:border-gray-700 h-1/3 md:h-full overflow-y-auto">
              <QuestionPanel
                question={selectedQuestion}
                onUpdateMastery={handleUpdateMastery}
                onUpdateTags={() => { }} // TODO
                onUpdateNotes={handleUpdateNotes}
              />
            </div>

            {/* Right: Solution Studio */}
            <div className="flex-1 h-2/3 md:h-full overflow-hidden flex flex-col">
              <SolutionStudio
                code={code}
                language="javascript"
                onChange={setCode}
                onRun={handleRunCode}
                onSave={handleSaveSolution} // save handles history too
                isRunning={isRunning}
                isSaving={isSaving}
                output={output}
                questionId={selectedQuestion._id}
              />
            </div>

            {/* AI Panel (Hidden for now to save space, or toggleable sidebar on right) */}
            {/* <div className="hidden lg:block w-80 border-l">
               <AIPanel question={selectedQuestion} code={code} />
            </div> */}

          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Select a Question</h3>
              <p>Choose a topic from the sidebar to start practicing.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DSAPlayground;
