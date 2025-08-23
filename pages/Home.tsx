import { NextPage } from "next";
import { motion } from "framer-motion";
import {
  FiFileText,
  FiCode,
  FiUpload,
  FiBook,
  FiThumbsUp,
  FiMic,
  FiGithub,
  FiFastForward,
} from "react-icons/fi";
import { FaIceCream } from "react-icons/fa";
import { useState, useEffect } from "react";
import PomodoroTimer from "./components/PomodoroTimer";
import FileUpload from "./components/upload";
import TextEditor from "./components/TextEditor";
import Dashboard from "./components/Dashboard";
import DSAPlayground from "./components/DsaPrac";
import Trial from "./components/homePage/trial";
// import DumpYourThought from "./components/DumpYourThought";
import LearningPathsAndGoals from "./components/LearningPathsAndGoals";
import Notebook from "./components/notebook";
import Learning from "./components/learning";
// import Books from "./components/books";

const sections = {
  dashboard: <Dashboard />,
  playground: <DSAPlayground />,
  notebook: <Notebook />,
  // dumpYourThought: <DumpYourThought />,
  learningpathsandgoals: <LearningPathsAndGoals />,
  learning: <Learning />,
  upload: <FileUpload />,
  editor: <TextEditor />,
  trial: <Trial />,
  // books: <Books />,
};

type SectionKeys = keyof typeof sections;

const Home: NextPage = () => {
  const [activeSection, setActiveSection] = useState<SectionKeys>("dashboard");
  const [currentDate, setCurrentDate] = useState<string>("");
  const [darkMode, setDarkMode] = useState<boolean>(false);

  // Set the dark mode preference in localStorage and apply it to the body
  useEffect(() => {
    // Check if the user has a saved dark mode preference
    const savedDarkMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(savedDarkMode);

    // Apply dark mode class to the body based on the darkMode state
    if (savedDarkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }

    const updateDate = () => {
      const date = new Date();
      setCurrentDate(
        date.toLocaleString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "numeric",
          second: "numeric",
        })
      );
    };

    updateDate();
    const intervalId = setInterval(updateDate, 1000);

    return () => clearInterval(intervalId);
  }, []);

  // Toggle dark mode and store preference
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("darkMode", newDarkMode.toString());
    if (newDarkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-gray-100 dark:bg-gray-900 dark:text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
    >
      {/* Top Navigation */}
      <nav className="sticky top-0 z-20 bg-opacity-90 backdrop-blur-lg shadow-md rounded-xl">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">🌟 Personal Management Hub</h1>
          <div>
            <PomodoroTimer />
          </div>
          <aside className="flex flex-row items-center">
            {Object.keys(sections).map((key) => (
              <button
                key={key}
                className={`flex items-center justify-center p-2 rounded-full text-lg transition-all duration-300 ${
                  activeSection === key
                    ? "bg-orange-600 text-white"
                    : "bg-gray-700 text-gray-200 hover:bg-gray-600"
                }`}
                onClick={() => setActiveSection(key as SectionKeys)}
                aria-label={`Navigate to ${key.charAt(0).toUpperCase() + key.slice(1)}`}
              >
                {key === "dashboard" && <FiFileText className="w-full h-full"/>}
                {key === "playground" && <FiCode className="w-full h-full"/>}
                {key === "learningpathsandgoals" && <FaIceCream className="w-full h-full"/>}
                {key === "upload" && <FiUpload className="w-full h-full"/>}
                {key === "editor" && <FiCode className="w-full h-full"/>}
                {key === "books" && <FiBook className="w-full h-full"/>}
                {key === "notebook" && <FiGithub className="w-full h-full"/>}
                {key === "learning" && <FiGithub className="w-full h-full"/>}
                {key === "trial" && <FiFastForward className="w-full h-full"/>}
              </button>
            ))}
          </aside>
          <div className="flex items-center">
            <div className="flex items-center">
              <span className="px-3 py-1 bg-orange-500 text-white rounded-full text-sm">
                {currentDate}
              </span>
            </div>
            <button
              className="p-2 rounded-full hover:bg-gray-700 focus:outline-none transition"
              onClick={toggleDarkMode}
              aria-label="Toggle Dark Mode"
            >
              {darkMode ? "🌞" : "🌙"}
            </button>
          </div>
        </div>
      </nav>

      {/* Sidebar Navigation */}
      {/* <aside className="fixed left-2 flex flex-col space-y-4 mt-4">
        {Object.keys(sections).map((key) => (
          <button
            key={key}
            className={`flex items-center w-15 h-15 p-2 rounded-full text-lg transition-all duration-300 ${
              activeSection === key
                ? "bg-orange-600 text-white"
                : "bg-gray-700 text-gray-200 hover:bg-gray-600"
            }`}
            onClick={() => setActiveSection(key as SectionKeys)}
            aria-label={`Navigate to ${key.charAt(0).toUpperCase() + key.slice(1)}`}
          >
            {key === "dashboard" && <FiFileText className="w-5 h-5" />}
            {key === "playground" && <FiCode className="w-5 h-5" />}
            {key === "learningpathsandgoals" && <FaIceCream className="w-5 h-5" />}
            {key === "upload" && <FiUpload className="w-5 h-5" />}
            {key === "editor" && <FiCode className="w-5 h-5" />}
            {key === "notebook" && <FiGithub className="w-5 h-5" />}
            {key === "learning" && <FiGithub className="w-5 h-5" />}
            {key === "trial" && <FiFastForward className="w-5 h-5" />}

          </button>
        ))}
      </aside> */}

      {/* Main Content */}
      <main className="ml-1 mt-2">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className=""
        >
          {sections[activeSection]}
        </motion.div>
      </main>
    </motion.div>
  );
};

export default Home;
