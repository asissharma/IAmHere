import { NextPage } from "next";
import { AnimatePresence, motion, Variants } from "framer-motion";
import {
  FiCode,
  FiUpload,
  FiBook,
  FiFastForward,
} from "react-icons/fi";

import { useState, useEffect } from "react";
import TextEditor from "../components/TextEditor";
import DSAPlayground from "../components/DsaPrac";
import Trial from "../components/homePage/trial";
import Auth from "../components/auth"; // Import Auth component
import Notebook from "../components/notebook";
import FileUpload from "../components/upload";



const containerVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9, y: 12 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 400, damping: 28, staggerChildren: 0.06 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 8, scale: 0.92 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 700, damping: 30 } },
  exit: { opacity: 0, y: 6, scale: 0.95, transition: { duration: 0.12 } },
};



const Home: NextPage = () => {
  const menuOrder: SectionKeys[] = [
    "playground",
    "notebook",
    "upload",
    "editor",
    "trial",
  ];
  const sections = {
    playground: <DSAPlayground />,
    notebook: <Notebook />,
    upload: <FileUpload />,
    editor: <TextEditor />,
    trial: <Trial onNavigate={(section) => handleNavigation(section as SectionKeys)} onUnlock={() => { setIsMenuUnlocked(true); setIsAuthenticated(true); }} />,
  };

  type SectionKeys = keyof typeof sections;

  const [activeSection, setActiveSection] = useState<SectionKeys>("trial");
  const [currentDate, setCurrentDate] = useState<string>("");
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showPing, setShowPing] = useState(true);

  // --- ACCESS CONTROL STATE ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMenuUnlocked, setIsMenuUnlocked] = useState(false);  // FAB visibility
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingSection, setPendingSection] = useState<SectionKeys | null>(null);

  const handleNavigation = (section: SectionKeys) => {
    // If navigating to 'trial' (homepage), allow it always
    if (section === 'trial') {
      setActiveSection(section);
      return;
    }

    // If already authenticated, allow
    if (isAuthenticated) {
      setActiveSection(section);
    } else {
      // Otherwise prompt for auth
      setPendingSection(section);
      setShowAuthModal(true);
    }
  };

  const onAuthSuccess = () => {
    setIsAuthenticated(true);
    setShowAuthModal(false);
    if (pendingSection) {
      setActiveSection(pendingSection);
      setPendingSection(null);
    }
  };

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
  const iconForKey = (key: string) => {
    if (key === "playground") return <FiCode className="w-5 h-5" />;
    if (key === "upload") return <FiUpload className="w-5 h-5" />;
    if (key === "editor") return <FiCode className="w-5 h-5" />;
    if (key === "notebook") return <FiBook className="w-5 h-5" />;
    if (key === "trial") return <FiFastForward className="w-5 h-5" />;
    return <FiCode className="w-5 h-5" />;
  };

  return (
    <motion.div
      className="min-h-screen bg-gray-100 dark:bg-gray-900 dark:text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
    >
      {/* Top Navigation */}
      <nav className="sticky top-0 z-20 bg-opacity-90 backdrop-blur-lg shadow-md rounded-xl h-10">
        <div className="flex justify-between items-center h-full px-4">
          <h1 className="text-xl font-bold flex items-center justify-center pt-4">Hello Sweetie</h1>

          <div>

          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center">
              <span className="px-3 py-1 bg-orange-500 text-white rounded-full text-xs">
                {currentDate}
              </span>
            </div>
            <button
              className="p-2 rounded-full hover:bg-gray-700 focus:outline-none transition flex items-center justify-center"
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
      {/* Floating signal button at bottom-right (menu above button, one-time ping) */}
      {isMenuUnlocked && (
        <div className="fixed right-6 bottom-6 z-50">
          <div className="flex flex-col items-end">
            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  className="mb-3 flex flex-col items-end"
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={containerVariants}
                  aria-hidden={!menuOpen}
                >
                  {menuOrder.map((key) => (
                    <motion.button
                      key={key}
                      variants={itemVariants}
                      exit="exit"
                      onClick={() => {
                        handleNavigation(key as SectionKeys);
                        setMenuOpen(false);
                      }}
                      className={`flex items-center gap-3 mb-2 px-3 py-2 rounded-2xl shadow-md text-sm transition-all focus:outline-none focus:ring-2 focus:ring-orange-300 ${activeSection === key
                        ? "bg-orange-600 text-white"
                        : "bg-gray-800/70 text-gray-100 hover:bg-gray-700/80"
                        }`}
                      aria-label={`Navigate to ${key}`}
                      // ensure buttons aren't focusable if somehow menu re-renders during closing
                      tabIndex={menuOpen ? 0 : -1}
                    >
                      <span className="flex items-center justify-center w-6 h-6">
                        {iconForKey(key)}
                      </span>
                      <span className="pr-1">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>


            {/* Signal button */}
            <div className="relative">
              {/* one-time ping */}
              {showPing && (
                <span
                  className="absolute inset-1 rounded-full bg-orange-500 opacity-75 animate-ping"
                  aria-hidden="true"
                />
              )}
              <button
                onClick={() => {
                  setMenuOpen((s) => !s);
                  setShowPing(false); // disable ping forever after first click
                }}
                aria-expanded={menuOpen}
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                className="relative flex items-center justify-center w-14 h-14 rounded-full bg-orange-600 text-white shadow-2xl hover:scale-105 active:scale-95 transition-transform focus:outline-none"
                title="Open quick menu"
              >
                {/* signal icon, rotates when open */}
                <motion.span
                  initial={false}
                  animate={menuOpen ? { rotate: 45 } : { rotate: 0 }}
                  transition={{ type: "tween", stiffness: 500, damping: 30 }}
                  className="text-xl font-bold select-none"
                >
                  ⚡
                </motion.span>
              </button>
            </div>
          </div>
        </div>
      )}



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


      {/* --- AUTH MODAL OVERLAY --- */}
      <AnimatePresence>
        {showAuthModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <div className="relative w-full max-w-md">
              <button
                onClick={() => setShowAuthModal(false)}
                className="absolute top-2 right-2 text-slate-500 hover:text-white z-20"
              >
                ✕
              </button>
              <Auth onSuccess={onAuthSuccess} isModal={true} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div >
  );
};

export default Home;
