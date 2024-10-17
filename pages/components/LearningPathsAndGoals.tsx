import React, { useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion, AnimatePresence } from 'framer-motion';
import ResizableCard from './ResizableCard';
import axios from 'axios';
// Define the interfaces for Document and Topic
interface IDocument {
  _id: string;
  type: 'ai' | 'note';
  content: string;
  name:string;
}

interface ITopic {
  _id: string;
  title: string;
  isCompleted: boolean;
  resourceUrl?: string;
  resourceUrls?: string[];
  documents?: IDocument[];
}

interface IMetadata {
  level: string;
}

interface IContentItem {
  _id: string;
  content: string;
  metadata: IMetadata;
}

const TAGS = [
  { label: 'Learn the Topic', prompt: 'Please help me understand this topic.' },
  { label: 'Example Questions', prompt: 'Can you give me example questions related to this topic?' },
  { label: 'Summarize', prompt: 'Can you summarize this topic for me?' },
  // Add more tags as needed
];

// Main component
const LearningPaths: React.FC = () => {
  const [topic, setTopic] = useState<ITopic | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  const [notes, setNotes] = useState<string>('');
  const [resourceUrls, setResourceUrls] = useState<string>('');
  const [isUrl, setIsUrl] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [chatHistory, setChatHistory] = useState<{ role: string; text: string }[]>([]);
  const [userMessage, setUserMessage] = useState<string>('');
  const [aiHistoryArray, setAiHistoryArray] = useState<IDocument[]>([]);
  const [documentName, setDocumentName] = useState<string>('');
  const [docType, setDocType] = useState<string>('');
  const [theExerciseLevel, setTheExerciseLevel] = useState<any[]>([]);
  const [selectedTag, setSelectedTag] = useState<{ label: string; prompt: string } | null>(null);


  useEffect(() => {
    fetchTopic();
  }, [currentPage]);

  const decodeHtmlEntities = (text: string) => {
    const txt = document.createElement("textarea");
    txt.innerHTML = text;
    return txt.value;
};

const handleGenerateData = async (topicId: string) => {
  if (!topic) {
    toast.error('Topic is required');
    return;
  }

  setLoading(true);

  try {
    const titles = topic.title;
    const response = await axios.post('/api/generateTheData', { titles, topicId });
    toast.success('generate the data');
  } catch (error) {
    toast.error('Failed to generate data. Please try again.');
  } finally {
    setLoading(false);
  }
};

  // Load content based on the provided content or URL
  const loadOnTheCard = (content: string, type?: string) => {
    const isContentUrl = (content: string) => {
      const urlRegex = /^(https?:\/\/[^\s]+)/;
      return urlRegex.test(content);
    };
    const urlCheck = isContentUrl(content);
    setIsUrl(urlCheck);
    setSelectedDoc(content);
    
    if (type) {
      setDocType(type); // Set the document type directly
      if (type === 'ai') {
        console.log("Content before parsing:", content); // Log the content to see its structure
        try {
          // Decode the content before parsing
          const decodedContent = decodeHtmlEntities(content);
          const aiHistoryArray = JSON.parse(decodedContent);
          console.log("Parsed AI History Array:", aiHistoryArray); // Log the parsed array
          setAiHistoryArray(aiHistoryArray); // Set AI history array
        } catch (error) {
          console.error('Failed to parse AI content:', error);
          setAiHistoryArray([]); // Reset in case of error
        }
      } else {
        setAiHistoryArray([]); // Clear AI history for non-AI documents
      }
    } else {
      setDocType(''); // Clear type if it's null
    }
};


// Fetch the topic data from the server
const fetchTopic = async () => {
  setLoading(true);
  try {
    const response = await fetch(`/api/getTopicData?page=${currentPage}`);
    const data: ITopic[] = await response.json();
    
    if (data.length > 0) {
      const firstTopic = data[0];
      setTopic(firstTopic);
      setSelectedDoc(firstTopic.resourceUrls?.[0] || ''); // Use the first resource URL if available
      setResourceUrls(firstTopic.resourceUrls?.join('\n') || '');
      // Ensure the topic has documents and at least one valid document
      if (firstTopic.documents && firstTopic.documents.length > 0) {
        const firstDocument = firstTopic.documents[0];

        // Ensure 'content' exists in the document
        if (firstDocument.content) {
          // Convert content to an array if it's not already
          const documentContent = Array.isArray(firstDocument.content)
            ? firstDocument.content
            : [firstDocument.content];

          // Filter out invalid entries (ensures items have metadata and level)
          const filteredContent = documentContent.filter((item: any) => {
            return typeof item === 'object' && item.metadata && item.metadata.level;
          });

          if (filteredContent.length > 0) {
            // Sort by level
            const levels = ["Beginner", "Intermediate", "Advanced"];
            const sortedContent = [...filteredContent].sort((a, b) => {
              return levels.indexOf(a.metadata.level) - levels.indexOf(b.metadata.level);
            });

            // Group content by level
            const groupedContent = sortedContent.reduce((acc, item) => {
              const level = item.metadata.level;
              if (!acc[level]) {
                acc[level] = [];
              }
              acc[level].push(item);
              return acc;
            }, {});

            // Set state with grouped content
            setTheExerciseLevel(groupedContent);
            console.log("Grouped content:", groupedContent);
          } else {
            console.log('No valid content with metadata and level found.');
          }
        } else {
          console.log('No content available in the first document.');
        }
      } else {
        toast.info('No documents available for the topic.');
      }
    } else {
      toast.info('No more topics available.');
    }
  } catch (error) {
    console.error('Error fetching topic:', error);
    toast.error('Failed to fetch topic.');
  } finally {
    setLoading(false);
  }
};


  // Mark the topic as completed
  const markAsCompleted = async (topicId: string) => {
    if (!topic) return;

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
      setTopic(null);
      setSelectedDoc(null);
      setResourceUrls('');
    } catch (error) {
      console.error('Error marking topic as completed:', error);
      toast.error('Failed to mark topic as completed.');
    }
  };

  // Save resource URLs to the backend
  const saveUrls = async () => {
    if (!topic) return;

    try {
      const urlsArray = resourceUrls.split('\n').map(url => url.trim()).filter(url => url.length > 0);

      const response = await fetch('/api/saveResourceUrls', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topicId: topic._id,
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

  // Handle saving of notes
  const handleNoteSave = async () => {
    if (!topic) return;

    try {
      const response = await fetch('/api/customDocumentation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topicId: topic._id,
          content: notes,
          type: 'note',
          name: documentName
        }),
      });

      if (!response.ok) throw new Error('Failed to save notes');
      toast.success('Notes saved successfully!');
    } catch (error) {
      console.error('Error saving notes:', error);
      toast.error('Failed to save notes.');
    }
  };

  // Load more topics
  const loadMoreTopics = async (direction: 'prev' | 'next') => {
    setCurrentPage((prev) => (direction === 'prev' ? Math.max(prev - 1, 0) : prev + 1));
  };

  // Handle sending message to AI
  const handleSendMessage = async () => {
    // Use the prompt from the selected tag, if available
    const messageToSend = selectedTag ? selectedTag.prompt + ' ' + topic?.title : userMessage;

    if (!messageToSend || !topic) {
      toast.error('Please enter a message');
      return;
    }

    const newHistory = [...chatHistory, { role: 'user', text: messageToSend }];
    setChatHistory(newHistory);
    setUserMessage(''); // Clear user input after sending

    try {
      setLoading(true);
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageToSend,
          history: newHistory,
          systemInstruction: 'You are a teacher, be straightforward.',
        }),
      });

      const data = await response.json();
      if (response.ok) {
        const aiResponse = data.response;
        setChatHistory((prev) => [...prev, { role: 'model', text: aiResponse }]);
        saveChatToBackend([...newHistory, { role: 'model', text: aiResponse }]);
        setSelectedTag(null); // Reset the selected tag
      } else {
        toast.error(data.error || 'Failed to get AI response.');
      }
    } catch (error) {
      console.error('Error in getting AI response:', error);
      toast.error('Failed to get AI response.');
    } finally {
      setLoading(false);
    }
  };

  // Save chat history to the backend
  const saveChatToBackend = async (updatedChatHistory: { role: string; text: string }[]) => {
    try {
      const response = await fetch('/api/customDocumentation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topicId: topic?._id,
          content: JSON.stringify(updatedChatHistory),
          type: 'ai',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save chat history');
      }

      toast.success('Chat history saved successfully!');
    } catch (error) {
      console.error('Error saving chat history:', error);
      toast.error('Failed to save chat history.');
    }
  };

  // Main rendering of the component
  return (
    <div className="min-h-screen bg-gray-100 p-3">
      <ToastContainer />
      <motion.div
        className="bg-blue-200 p-2 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {loading ? (
          <div className="flex justify-center items-center">
            <div className="loader" />
          </div>
        ) : topic ? (
          <div className="flex flex-col md:flex-row justify-between space-y-2 md:space-y-0 md:space-x-2">
            <motion.button
              onClick={() => loadMoreTopics('prev')}
              disabled={currentPage === 0}
              className="bg-gray-400 text-white rounded px-4 py-2 hover:bg-gray-500 transition duration-200"
              whileHover={{ scale: 1.05 }}
            >
              Previous
            </motion.button>
            <h1 className="text-2xl font-bold text-center">{topic.title}</h1>
            <motion.button
              onClick={() => loadMoreTopics('next')}
              disabled={!topic}
              className="bg-gray-400 text-white rounded px-4 py-2 hover:bg-gray-500 transition duration-200"
              whileHover={{ scale: 1.05 }}
            >
              Next
            </motion.button>
          </div>
        ) : (
          <h1 className="text-2xl font-bold text-center">No Topics Available</h1>
        )}
      </motion.div>
      
      <div className="grid grid-cols-4 gap-6">
        <div className='col-span-1'>
            {/* Documentation, Resource URLs */}
            <div className="bg-green-200 mb-1 p-6 max-h-96 overflow-y-scroll scrollabler scrollable-hover rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="prose max-w-full">
                <h3 className="text-lg font-semibold mb-2 mt-4">Resource URLs</h3>
                {resourceUrls.split('\n').map((url, index) => (
                  <div key={index} className="flex justify-between mb-2">
                    <span
                      className="text-blue-700 cursor-pointer hover:underline"
                      onClick={() => loadOnTheCard(url)}
                    >
                      {url}
                    </span>
                  </div>
                ))}
                <h3 className="text-lg font-semibold mb-2">Custom Documentation</h3>
                {topic?.documents && topic.documents.length > 0 && (
                  <div className="space-y-4 mt-6">
                    {topic.documents.map((doc) => (
                      <div
                        key={doc._id}
                        className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
                        onClick={() => loadOnTheCard(doc.content,doc.type)}
                      >
                        <h3 className="text-lg font-bold">Document Type: {doc.type}</h3>
                        <p>{doc.name}...</p> {/* Display a snippet of the document */}
                      </div>
                    ))}
                  </div>
                )}
                <h3 className="text-lg font-semibold mb-2">The AI Content</h3>
                <div className='bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300'>
                  {Object.keys(theExerciseLevel).length > 0 && (
                    <ul>
                      {Object.entries(theExerciseLevel).map(([level, items]) => (
                        <li key={level}>
                          <strong>{level}</strong>
                          <ul>
                            {items.map((item: any) => (
                              <li key={item._id} onClick={() => loadOnTheCard(item.content, 'aiGenerated')}>
                                {item.type} {/* Display any other item metadata if needed */}
                              </li>
                            ))}
                          </ul>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          <ResizableCard>
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
                <i className="fas fa-save"></i> Save URLs
              </button>
            </div>
          </ResizableCard>
        </div>
        <div className='col-span-2 max-h-96 overflow-y-scroll scrollabler scrollable-hover bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300'>
          <ResizableCard>
          <div className="bg-white rounded-lg p-4 w-full relative overflow-hidden">
            <div className="overflow-auto">
              <h2 className="text-xl mb-4">Content</h2>
              {isUrl && selectedDoc ? (
                <iframe
                  src={selectedDoc}
                  title="Webview"
                  className="w-full h-96 border-0 rounded"
                  sandbox="allow-same-origin allow-scripts allow-popups"
                />
              ) : docType === "ai" ? (
                <div className="ai-doc-rendering">
                  {aiHistoryArray.map((chat: any, index: any) => (
                    <div
                      key={index}
                      className={`p-2 rounded-lg mb-2 ${chat.role === 'user' ? 'bg-blue-100 self-end' : 'bg-gray-100 self-start'}`}
                      dangerouslySetInnerHTML={{ __html: chat.text || 'AI solution will appear here...' }}
                    />
                  ))}
                </div>
              ) : docType === "aiGenerated" ? (
                <div
                  dangerouslySetInnerHTML={{ __html: JSON.parse(selectedDoc || 'AI solution will appear here...') }}
                />
              ) : (
                <pre className="whitespace-pre-wrap">{selectedDoc}</pre> // Render the content directly if it's not a URL
              )}
            </div>
          </div>
          </ResizableCard>
        </div>
        <div className='col-span-1'>

          {/* AI Assistant Chat */}
          <ResizableCard>
            <div className="mb-1 max-h-96 h-48 overflow-y-scroll scrollabler scrollable-hover bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-md font-semibold mb-2">Chat with AI</h3>
              
              {/* Tag Selection */}
              <div className="mb-4">
            <label htmlFor="tag-select" className="block mb-2 text-gray-700">Choose a tag:</label>
            <select
              id="tag-select"
              value={selectedTag?.label || ''}
              onChange={(e) => {
                const selected = TAGS.find(tag => tag.label === e.target.value);
                setSelectedTag(selected || null);
              }}
              className="border rounded-md p-2 w-full"
            >
              <option value="">Select a tag</option>
              {TAGS.map((tag) => (
                <option key={tag.label} value={tag.label}>
                  {tag.label}
                </option>
              ))}
            </select>
          </div>

              <div className="flex flex-col">
                {chatHistory.map((chat, index) => (
                  <div
                    key={index}
                    className={`p-2 rounded-lg mb-2 ${chat.role === 'user' ? 'bg-blue-100 self-end' : 'bg-gray-100 self-start'}`}
                    dangerouslySetInnerHTML={{ __html: chat.text || 'AI solution will appear here...' }}
                  />
                ))}
                <div className="flex bottom-4 mt-2">
                  <input
                    className="flex-1 border border-gray-300 rounded-lg p-2"
                    type="text"
                    value={userMessage}
                    onChange={(e) => setUserMessage(e.target.value)}
                    placeholder="Type your message..."
                  />
                  <button
                    onClick={handleSendMessage}
                    className="rounded-full text-white rounded ml-2 transition-colors duration-300 bg-blue-600 hover:bg-blue-700"
                  >
                    <svg fill="grey" height="24" width="24" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 495.003 495.003">
                      <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                      <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                      <g id="SVGRepo_iconCarrier">
                        <g id="XMLID_51_">
                          <path id="XMLID_53_" d="M164.711,456.687c0,2.966,1.647,5.686,4.266,7.072c2.617,1.385,5.799,1.207,8.245-0.468l55.09-37.616 l-67.6-32.22V456.687z"></path>
                          <path id="XMLID_52_" d="M492.431,32.443c-1.513-1.395-3.466-2.125-5.44-2.125c-1.19,0-2.377,0.264-3.5,0.816L7.905,264.422 c-4.861,2.389-7.937,7.353-7.904,12.783c0.033,5.423,3.161,10.353,8.057,12.689l125.342,59.724l250.62-205.99L164.455,364.414 l156.145,74.4c1.918,0.919,4.012,1.376,6.084,1.376c1.768,0,3.519-0.322,5.186-0.977c3.637-1.438,6.527-4.318,7.97-7.956 L494.436,41.257C495.66,38.188,494.862,34.679,492.431,32.443z"></path>
                        </g>
                      </g>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </ResizableCard>

          {/* Add Note */}
          <ResizableCard>
            <div className="bg-gray-200 p-2 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
              <h2 className="text-lg m-2 text-center font-semibold border border-black text-gray-800">Add Note</h2>
              <input
                type="text"
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)} // Handle name input
                placeholder="Enter a name for your note"
                className="border rounded p-2 w-full mb-4"
              />
              <Editor
                height="200px"
                defaultLanguage="markdown"
                value={notes}
                onChange={(value) => setNotes(value || '')}
                options={{ minimap: { enabled: false }, automaticLayout: true }}
              />
              <button
                onClick={handleNoteSave}
                className="mt-1 bg-blue-500 text-white rounded p-1 hover:bg-blue-600 transition-colors duration-300"
              >
                Save
              </button>
            </div>
          </ResizableCard>
        </div>
      </div>
      {topic && (
        <div className="fixed bottom-4 right-4">
          <button
            onClick={() => markAsCompleted(topic._id)}
            className="bg-green-500 text-white p-1 rounded-full shadow-lg hover:bg-green-600 transition-colors duration-300"
          >
            <img src="/completedTask.svg" alt="Completed Task" width={40} height={40}/>
          </button>
          {!theExerciseLevel || Object.keys(theExerciseLevel).length === 0 && (
            <button
              onClick={() => handleGenerateData(topic._id)}
              className="bg-red-500 text-white p-1 rounded-full shadow-lg hover:bg-red-600 transition-colors duration-300"
            >
              <img src="/completedTask.svg" alt="Completed Task" width={40} height={40} />
            </button>
          )}

        </div>
      )}
    </div>
  );
};

export default LearningPaths;
