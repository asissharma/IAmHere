import { NextPage } from 'next';
import FileUpload from './components/upload';
import TextEditor from './components/TextEditor';
import { motion } from 'framer-motion';

const Home: NextPage = () => {
  return (
    <motion.div 
      className="page-container bg-gradient-to-r from-purple-600 to-blue-500 min-h-screen flex flex-col items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
    >
      <motion.h1 
        className="text-white text-4xl font-bold mb-8"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1 }}
      >
        I Am Here...
      </motion.h1>
      <FileUpload />
      <TextEditor />
    </motion.div>
  );
};

export default Home;
