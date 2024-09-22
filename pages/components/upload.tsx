import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUpload, FiFileText } from 'react-icons/fi';  // Added icons

const FileUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [files, setFiles] = useState<any[]>([]);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await fetch('/api/getUpload');
        const data = await response.json();
        setFiles(data);
      } catch (error) {
        console.error('Error fetching files:', error);
      }
    };
    fetchFiles();
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (file) {
      setLoading(true);
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        try {
          const base64 = reader.result?.toString().split(',')[1];
          if (base64) {
            const response = await fetch('/api/upload', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                file: base64,
                filename: file.name,
                mimetype: file.type,
              }),
            });
            const data = await response.json();
            if (response.ok) {
              const updatedResponse = await fetch('/api/getUpload');
              const updatedData = await updatedResponse.json();
              setFiles(updatedData);
            } else {
              console.error('Upload failed:', data.error);
            }
          }
        } catch (error) {
          console.error('Upload error:', error);
        } finally {
          setLoading(false);
        }
      };
    }
  };

  return (
    <motion.div
      className="bg-white shadow-lg rounded-lg p-8 max-w-2xl mx-auto"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <div className="flex flex-col items-center">
        <label htmlFor="file-upload" className="cursor-pointer flex items-center justify-center w-64 h-32 border-2 border-dashed border-gray-300 rounded-lg text-gray-400 hover:border-blue-500 hover:text-blue-500 transition-all">
          <FiUpload className="text-4xl" />
          <span className="ml-3">Choose a file</span>
        </label>
        <input 
          id="file-upload" 
          type="file" 
          onChange={handleFileChange} 
          className="hidden"
        />
      </div>

      <button 
        onClick={handleUpload} 
        disabled={loading}
        className={`mt-4 px-6 py-2 w-full rounded-md text-white ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-700'}`}
      >
        {loading ? 'Uploading...' : 'Upload'}
      </button>

      <motion.div 
        className="mt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <h3 className="text-xl font-semibold mb-4">Uploaded Files</h3>
        {files.length > 0 ? (
          <ul className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
            {files.map((file) => (
              <div key={file._id} className="relative overflow-hidden rounded-lg shadow-md transition-transform duration-300 hover:scale-105">
                {file.mimetype && file.mimetype.startsWith('image/') ? (
                  <a href={file.url} target="_blank" rel="noopener noreferrer">
                    <img 
                      src={file.url} 
                      alt={file.filename} 
                      className="w-full h-32 object-cover rounded-lg" 
                    />
                  </a>
                ) : (
                  <a href={file.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-full h-32 bg-gray-100 text-blue-600 hover:text-blue-800 text-center p-2">
                    <FiFileText className="mr-2" /> {file.filename}
                  </a>
                )}
              </div>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No files uploaded yet.</p>
        )}
      </motion.div>
    </motion.div>
  );
};

export default FileUpload;
