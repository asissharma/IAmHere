import { useState, useRef, useEffect } from "react";
import axios from "axios";

interface FileAnalysisProps {
  setAnalysedContent: (content: string) => void;
  analysedContent: string | null;
}

export default function FileAnalysis({ setAnalysedContent,analysedContent }: FileAnalysisProps) {
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState<string>("");
  const [text, setText] = useState<string>("");
  const [analysisType, setAnalysisType] = useState<string>("Summarize");
  const [conversation, setConversation] = useState<{ role: string; text: string }[]>([]);
  const [inputType, setInputType] = useState<string>("file");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const conversationEndRef = useRef<HTMLDivElement>(null);
  const [fullHistory, setFullHistory] = useState<{ role: string; text: string }[]>([]);

  useEffect(() => {
      if(analysedContent){
        const savedContent = JSON.parse(analysedContent);
        if (savedContent.fullHistory && savedContent.conversation) {
          setFullHistory(savedContent.fullHistory);
          setConversation(savedContent.conversation);
        }
      }
  }, []);
  const getAnalysisPrompt = (type: string) => {
    switch (type) {
      case "Summarize":
        return "Please summarize the uploaded document.";
      case "Ask Questions":
        return "Generate a Q&A based on the content of the document.";
      case "Extract Topics":
        return "Extract and list the main topics from the document.";
      default:
        return "Please analyze the document based on the specified type.";
    }
  };

  const handleFileUpload = async () => {
    if (!file && !url && !text) {
      setError("Please provide a file, URL, or text input.");
      return;
    }
    setError(null); // Clear any previous errors
    setIsLoading(true);

    const formData = new FormData();
    if (file) formData.append("file", file);
    if (url) formData.append("url", url);
    if (text) formData.append("text", text);
    formData.append("analysisType", analysisType);
    formData.append("analysisPrompt", getAnalysisPrompt(analysisType)); // Add analysis prompt

    try {
      const response = await axios.post("/api/analyser", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      const history = response.data.history || [];
      
      setFullHistory([...history, { role: "model", text: response.data.summary }]);
      setConversation([{ role: "model", text: response.data.summary || "Conversation starts here..." }]);
      const historyToBeSaved = { fullHistory, conversation };
      setAnalysedContent(JSON.stringify(historyToBeSaved));
    } catch (error) {
      console.error("Error uploading input:", error);
      setError("Failed to analyze the input. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConversation = async (userQuery: string) => {
    if (!userQuery.trim()) return;
    setIsLoading(true);

    // Add user message to conversation
    const userMessage = { role: "user", text: userQuery };
    const updatedConversation = [...conversation, userMessage];
    setConversation(updatedConversation);

    // Append user message to fullHistory
    const updatedFullHistory = [...fullHistory, userMessage];
    setFullHistory(updatedFullHistory);

    try {
      const response = await axios.post("/api/chat", {
        message: userQuery,
        history: updatedFullHistory,
        systemInstruction: 'You are an expert tutor generating precise',
      });

      const modelMessage = { role: "model", text: response.data.response || "Error in response." };

      // Update user-visible conversation and full history with model response
      setConversation((prev) => [...prev, modelMessage]);
      setFullHistory((prev) => [...prev, modelMessage]);
    } catch (error) {
      console.error("Error during conversation:", error);
      setError("Failed to process your question. Please try again.");
    } finally {
      setIsLoading(false);
      scrollToBottom();
    }
  };

  const scrollToBottom = () => {
    conversationEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="p-4">
       {conversation.length === 0 ? (
        <div className="">
          <div className="mb-4">
            <label className="block font-medium mb-2">Select Input Type</label>
            <select
              value={inputType}
              onChange={(e) => setInputType(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="file">Upload a File</option>
              <option value="url">Enter a URL</option>
              <option value="text">Paste Text</option>
            </select>
          </div>

          {inputType === "file" && (
            <div className="mb-4">
              <label className="block font-medium mb-2">Upload a File</label>
              <input
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-gray-500 border border-gray-300 rounded"
              />
              {file && <p className="text-sm text-green-600 mt-1">Selected File: {file.name}</p>}
            </div>
          )}

          {inputType === "url" && (
            <div className="mb-4">
              <label className="block font-medium mb-2">Enter a URL</label>
              <input
                type="text"
                placeholder="https://example.com/document"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
          )}

          {inputType === "text" && (
            <div className="mb-4">
              <label className="block font-medium mb-2">Paste Text</label>
              <textarea
                placeholder="Paste your text here..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full p-2 border rounded"
                rows={5}
              ></textarea>
            </div>
          )}

          <div className="mb-4">
            <label className="block font-medium mb-2">Select Analysis Type</label>
            <select
              value={analysisType}
              onChange={(e) => setAnalysisType(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="Summarize">Summarize</option>
              <option value="Ask Questions">Ask Questions</option>
              <option value="Extract Topics">Extract Topics</option>
            </select>
          </div>

          <button
            onClick={handleFileUpload}
            disabled={isLoading}
            className={`w-full bg-blue-500 text-white py-2 rounded ${
              isLoading && "opacity-50 cursor-not-allowed"
            }`}
          >
            {isLoading ? "Processing..." : "Upload and Analyze"}
          </button>

          {error && <p className="text-sm text-red-600 mt-4">{error}</p>}
        </div>
      ) : (
        <div className="">
          <div className="chat-history h-screen overflow-y-auto border p-2 rounded mb-4 bg-gray-50">
            {conversation.map((msg, index) => (
              <div
              className={`p-2 mb-2 rounded ${
                msg.role === "user" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"
              }`}
            >
              {msg.role === "model" ? (
                <div
                  dangerouslySetInnerHTML={{
                    __html: msg.text, // Ensure this is an HTML string; if it requires parsing, use JSON.parse(msg.text)
                  }}
                />
              ) : (
                msg.text
              )}
            </div> 
            ))}
            <div ref={conversationEndRef}></div>
          </div>

          <textarea
            placeholder="Ask a question about the document..."
            className="w-full p-2 border rounded mb-4"
            rows={4}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                const query = (e.target as HTMLTextAreaElement).value;
                handleConversation(query);
                (e.target as HTMLTextAreaElement).value = "";
              }
            }}
          />

          {isLoading && <div className="text-center text-sm text-gray-500">Generating response...</div>}
        </div>
      )}
    </div>
  );
}
