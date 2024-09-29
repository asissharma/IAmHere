import { NextPage } from 'next';
import FileUpload from './components/upload';
import TextEditor from './components/TextEditor';
import Dashboard from './components/Dashboard';
import DSAPlayground from './components/DsaPrac';
import LearningPathsAndGoals from './components/LearningPathsAndGoals';
import { motion } from 'framer-motion';
import { FiFileText, FiCode, FiUpload, FiCalendar, FiArrowRight, FiMic } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import { FaIceCream } from 'react-icons/fa';

const sections = {
  dashboard: <Dashboard />,
  playground: <DSAPlayground />,
  upload: <FileUpload />,
  editor: <TextEditor />,
  learningpathsandgoals: <LearningPathsAndGoals />,
};

type SectionKeys = keyof typeof sections;

const Home: NextPage = () => {
  const [activeSection, setActiveSection] = useState<SectionKeys>('dashboard');
  const [currentDate, setCurrentDate] = useState<string>(''); // State to hold the current date

  useEffect(() => {
    const updateDate = () => {
      const date = new Date();
      setCurrentDate(date.toLocaleString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' }));
    };

    updateDate(); // Initial call to set the date
    const intervalId = setInterval(updateDate, 1000); // Update date every second

    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, []);

  return (
    <motion.div
      className="bg-[#f8f8f8] h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
    >
      {/* Floating Navigation */}
      <div className="fixed top-1/3 left-8 flex flex-col space-y-4 z-10">
        {Object.keys(sections).map((key) => (
          <button
            key={key}
            className={`flex items-center p-4 rounded-full text-lg transition duration-300 ${
              activeSection === key ? 'bg-orange-600 text-white' : 'bg-gray-800 text-gray-100 hover:bg-gray-700'
            }`}
            onClick={() => setActiveSection(key as SectionKeys)}
            aria-label={`Navigate to ${key.charAt(0).toUpperCase() + key.slice(1)}`}
          >
            {key === 'dashboard' && <FiFileText />}
            {key === 'playground' && <FiCode />}
            {key === 'learningpathsandgoals' && <FaIceCream />}
            {key === 'upload' && <FiUpload />}
            {key === 'editor' && <FiCode />}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <motion.div className="flex flex-col justify-center">
        <motion.nav 
          className="flex flex-col items-center justify-between p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
        >
          {/* Date & Tasks Overview */}
          <div className="flex flex-grow-0 justify-center w-full">
            <h1 className="text-2xl font-bold">🌟 Personal Management Hub</h1>
          </div>
          <div className="flex items-center justify-between space-x-4 w-full">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold">
                {/* <span className='p-4 w-16 h-16 bg-white-400 text-black rounded-full shadow transition-transform transform hover:scale-110'>19</span>  */}
                <span className='flex items-center px-4 py-2 bg-orange-500 text-white rounded-full'>{currentDate}</span>
              </h1>
            </div>

            {/* AI Assistant */}
            <div className='flex flex-row justify-center items-center h-full'>
              <div className="flex flex-col items-center px-4 py-3">
                <h1 className="font-semibold" style={{ fontSize: '30px', fontWeight: '600' }}>
                  Hey, Need help?👋
                </h1>
                <h3 className="flex items-center space-x-2" style={{ fontSize: '20px', fontWeight: '400' }}>
                  <span>Just ask me anything!</span>
                </h3>
              </div>
              <div>
                <button className="flex items-center justify-center w-16 h-16 bg-white-400 text-black rounded-full shadow transition-transform transform hover:scale-110">
                  <FiMic className="text-3xl" />
                </button>
              </div>
            </div>
          </div>
        </motion.nav>

        <motion.main
          className="bg-white border rounded-2xl shadow-lg"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
        >
          {/* Active Section Content */}
          {sections[activeSection]}
        </motion.main>
      </motion.div>
    </motion.div>
  );
};

export default Home;
