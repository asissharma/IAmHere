import React, { useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface IDocument {
  topicId: string;
  type: 'ai' | 'note';
  content: string;
}

interface ITopic {
  _id: string;
  title: string;
  isCompleted: boolean;
  resourceUrl?: string;
  resourceUrls?: string[];
  documents?: IDocument[];
}

const Modal: React.FC<{ isOpen: boolean; onClose: () => void; content: string | null }> = ({ isOpen, onClose, content }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white p-4 rounded-lg shadow-md">
        <button onClick={onClose} className="absolute top-2 right-2 text-red-500">✖</button>
        <pre className="whitespace-pre-wrap">{content}</pre>
      </div>
    </div>
  );
};

const AIAssistant = () => {
  return <div>Please integrate the AI assistant here.</div>;
};

const LearningPaths: React.FC = () => {
  const [topics, setTopics] = useState<ITopic[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  const [notes, setNotes] = useState<string>('');
  const [resourceUrls, setResourceUrls] = useState<string>('');
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const response = await fetch('/api/getTopicData');
        const data: ITopic[] = await response.json();
        console.log('sdsdsd');
        console.log(data[0]['resourceUrls']);
        setTopics(data);
        if (data.length > 0) {
          const firstTopic = data[0];
          setSelectedTopicId(firstTopic._id);
          setSelectedDoc(firstTopic.resourceUrl || '');
          setResourceUrls(firstTopic.resourceUrls?.join('\n') || '');
          await fetchDocumentation(firstTopic._id);
        }
      } catch (error) {
        console.error('Error fetching topics:', error);
      }
    };

    fetchTopics();
  }, []);

  const fetchDocumentation = async (topicId: string) => {
    try {
      const response = await fetch(`/api/getCustomDocumentation?topicId=${topicId}`);
      const data = await response.json();
      setSelectedDoc(data.content);
      setResourceUrls(data.resourceUrls.join('\n') || '');
    } catch (error) {
      console.error('Error fetching documentation:', error);
    }
  };

  const handleTopicClick = async (topicId: string) => {
    setSelectedTopicId(topicId);
    await fetchDocumentation(topicId); // Fetch documentation for the clicked topic
  };

  const markAsCompleted = async (topicId: string) => {
    try {
      const response = await fetch(`/api/markAsCompleted`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topicId }),
      });

      if (!response.ok) throw new Error('Failed to mark as completed');

      toast.success('Topic marked as completed!');
      const updatedTopics = topics.filter(topic => topic._id !== topicId);
      setTopics(updatedTopics);
      if (updatedTopics.length > 0) {
        handleTopicClick(updatedTopics[0]._id);
      } else {
        setSelectedDoc(null);
        setResourceUrls('');
        setSelectedTopicId(null);
      }
    } catch (error) {
      console.error('Error marking topic as completed:', error);
      toast.error('Failed to mark topic as completed.');
    }
  };

  const saveUrls = async () => {
    if (!selectedTopicId) return false;

    try {
      const urlsArray = resourceUrls.split('\n').map(url => url.trim()).filter(url => url.length > 0);

      const response = await fetch('/api/saveResourceUrls', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topicId: selectedTopicId,
          resourceUrls: urlsArray,
        }),
      });

      if (!response.ok) throw new Error('Failed to save URLs');
      toast.success('Resource URLs saved successfully!');
    } catch (error) {
      console.error('Error saving URLs:', error);
      toast.error('Failed to save resource URLs.');
    }
  };

  const handleNoteSave = async () => {
    if (!selectedTopicId) return false;

    try {
      const response = await fetch('/api/customDocumentation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topicId: selectedTopicId,
          content: notes,
        }),
      });

      if (!response.ok) throw new Error('Failed to save notes');

      toast.success('Notes saved successfully!');
    } catch (error) {
      console.error('Error saving notes:', error);
      toast.error('Failed to save notes.');
    }
  };

  const handleOpenModal = (content: string) => {
    setModalContent(content);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalContent(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <ToastContainer />
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Learning Paths</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="col-span-1 bg-blue-200 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Topics</h2>
          <ul>
            {topics.map((topic) => (
              <li key={topic._id} className="flex justify-between mb-2">
                <span
                  className="text-blue-700 cursor-pointer hover:underline"
                  onClick={() => handleTopicClick(topic._id)}
                >
                  {topic.title}
                </span>
                <button
                  className="ml-2 bg-red-500 text-white rounded px-2 hover:bg-red-600 transition-colors duration-300"
                  onClick={() => markAsCompleted(topic._id)}
                >
                  Complete
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="col-span-3 bg-green-200 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Documentation</h2>
          {selectedDoc ? (
            <div className="prose max-w-full">
              <pre className="bg-gray-200 p-4 rounded">{selectedDoc}</pre>
              <h3 className="text-lg font-semibold mb-2 mt-4">Resource URLs</h3>
              {topics.find(topic => topic._id === selectedTopicId)?.resourceUrls?.map((url, index) => (
                <div key={index} className="flex justify-between mb-2">
                  <span className="text-blue-700 cursor-pointer hover:underline" onClick={() => handleOpenModal(url)}>
                    {url}
                  </span>
                </div>
              ))}
              <h3 className="text-lg font-semibold mb-2">Custom Documentation</h3>
              {topics.find(topic => topic._id === selectedTopicId)?.documents?.map((doc, index) => (
                <div key={index} className="flex justify-between mb-2">
                  <span className="text-blue-700 cursor-pointer hover:underline" onClick={() => handleOpenModal(doc.content)}>
                    {doc.type === 'ai' ? 'AI Response' : 'User Note'}: {doc.content.substring(0, 30)}...
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">Select a topic to view its documentation.</p>
          )}
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-200 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Resource URLs</h2>
          <textarea
            value={resourceUrls}
            onChange={(e) => setResourceUrls(e.target.value)}
            rows={5}
            className="border rounded p-2 w-full"
            placeholder="Add URLs here, one per line..."
          />
          <button
            onClick={saveUrls}
            className="mt-4 bg-blue-500 text-white rounded px-4 py-2 hover:bg-blue-600 transition-colors duration-300"
          >
            Save URLs
          </button>
        </div>

        <div className="bg-gray-200 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Add Note</h2>
          <Editor
            height="200px"
            defaultLanguage="markdown"
            value={notes}
            onChange={(e) => setNotes}
            options={{ minimap: { enabled: false }, automaticLayout: true }}
          />
          <button
            onClick={handleNoteSave}
            className="mt-4 bg-blue-500 text-white rounded px-4 py-2 hover:bg-blue-600 transition-colors duration-300"
          >
            Save Note
          </button>
        </div>
      </div>

      {/* Modal for displaying URLs or documentation */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} content={modalContent} />
    </div>
  );
};

export default LearningPaths;
