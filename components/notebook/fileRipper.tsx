import { useState, useRef, useEffect } from "react";
import axios from "axios";
import DOMPurify from "dompurify";

interface FileAnalysisProps {
  setAnalysedContent: (content: string) => void;
  analysedContent: string | null;
}

export default function FileAnalysis({ setAnalysedContent, analysedContent }: FileAnalysisProps) {
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState<string>("");
  const [text, setText] = useState<string>("");
  const [analysisType, setAnalysisType] = useState<string>("Summarize");
  const [customPrompt, setCustomPrompt] = useState<string>("");
  const [conversation, setConversation] = useState<{ role: string; text: string }[]>([]);
  const [inputType, setInputType] = useState<string>("file");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const conversationEndRef = useRef<HTMLDivElement>(null);
  const [fullHistory, setFullHistory] = useState<{ role: string; text: string }[]>([]);

  useEffect(() => {
    if (analysedContent) {
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
        return "Provide a concise summary of the uploaded content.";
      case "Ask Questions":
        return "Generate insightful questions and answers based on the document.";
      case "Extract Topics":
        return "Identify and list the main topics covered in the document.";
      case "Key Takeaways":
        return "Highlight the key takeaways from the document.";
      case "Sentiment Analysis":
        return "Analyze and describe the sentiment of the content.";
      case "Highlight Insights":
        return "Highlight the most critical insights in the document.";
      case "Custom":
        return customPrompt || "Please provide a specific custom analysis.";
      default:
        return "Analyze the document based on the specified type.";
    }
  };

  const handleFileUpload = async () => {
    // if (!file && !url && !text) {
    //   setError("Please provide a file, URL, or text input.");
    //   return;
    // }
    if (analysisType === "Custom" && !customPrompt.trim()) {
      setError("Please provide a custom prompt for analysis.");
      return;
    }
    setError(null);
    setIsLoading(true);

    const formData = new FormData();
    if (file) formData.append("file", file);
    if (url) formData.append("url", url);
    if (text) formData.append("text", text);
    formData.append("analysisType", analysisType);
    formData.append("analysisPrompt", getAnalysisPrompt(analysisType));

    try {
      const response = await axios.post("/api/analyser", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const history = response.data.history || [];
      const summaryMessage = { role: "model", text: response.data.summary || "Conversation starts here..." };

      const updatedFullHistory = [...history, summaryMessage];
      const updatedConversation = [summaryMessage];

      setFullHistory(updatedFullHistory);
      setConversation(updatedConversation);

      const historyToBeSaved = { fullHistory: updatedFullHistory, conversation: updatedConversation };
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

    const userMessage = { role: "user", text: userQuery };
    const updatedConversation = [...conversation, userMessage];
    const updatedFullHistory = [...fullHistory, userMessage];

    setConversation(updatedConversation);
    setFullHistory(updatedFullHistory);

    const historyToBeSaved = { fullHistory: updatedFullHistory, conversation: updatedConversation };
    setAnalysedContent(JSON.stringify(historyToBeSaved));

    try {
      const response = await axios.post("/api/chat", {
        message: userQuery,
        history: updatedFullHistory,
        systemInstruction: "You are an expert tutor generating precise insights.",
      });

      const modelMessage = { role: "model", text: response.data.response || "Error in response." };

      const finalConversation = [...updatedConversation, modelMessage];
      const finalFullHistory = [...updatedFullHistory, modelMessage];

      setConversation(finalConversation);
      setFullHistory(finalFullHistory);

      const finalHistoryToBeSaved = { fullHistory: finalFullHistory, conversation: finalConversation };
      setAnalysedContent(JSON.stringify(finalHistoryToBeSaved));
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
    <div className="p-4 space-y-4">
      {conversation.length === 0 ? (
        <div className="space-y-6">
          <h2 className="text-lg font-bold">Upload and Analyze Document</h2>

          <div>
            <label className="block font-medium mb-1">Select Input Type</label>
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
            <div>
              <label className="block font-medium mb-1">Upload a File</label>
              <input
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="block w-full text-sm border border-gray-300 rounded"
              />
              {file && <p className="text-sm text-green-600 mt-1">Selected File: {file.name}</p>}
            </div>
          )}

          {inputType === "url" && (
            <div>
              <label className="block font-medium mb-1">Enter a URL</label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
          )}

          {inputType === "text" && (
            <div>
              <label className="block font-medium mb-1">Paste Text</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full p-2 border rounded"
                rows={4}
              ></textarea>
            </div>
          )}

          <div>
            <label className="block font-medium mb-1">Select Analysis Type</label>
            <select
              value={analysisType}
              onChange={(e) => setAnalysisType(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="Summarize">Summarize</option>
              <option value="Ask Questions">Ask Questions</option>
              <option value="Extract Topics">Extract Topics</option>
              <option value="Key Takeaways">Key Takeaways</option>
              <option value="Sentiment Analysis">Sentiment Analysis</option>
              <option value="Highlight Insights">Highlight Insights</option>
              <option value="Content Relevance">Content Relevance</option>
              <option value="Data Extraction">Data Extraction</option>
              <option value="Compare Content">Compare Content</option>
              <option value="Fact-Checking">Fact-Checking</option>
              <option value="Entity Recognition">Entity Recognition</option>
              <option value="Trend Analysis">Trend Analysis</option>
              <option value="Translation Summary">Translation Summary</option>
              <option value="Conceptual Mapping">Conceptual Mapping</option>
              <option value="Narrative Flow Analysis">Narrative Flow Analysis</option>
              <option value="Readability Score">Readability Score</option>
              <option value="Audience Suitability">Audience Suitability</option>
              <option value="Custom">Custom</option>
            </select>
          </div>

          {analysisType === "Custom" && (
            <div>
              <label className="block font-medium mb-1">Enter Custom Prompt</label>
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                className="w-full p-2 border rounded"
                rows={3}
                placeholder="Enter your custom analysis prompt here..."
              ></textarea>
            </div>
          )}

          <button
            onClick={handleFileUpload}
            disabled={isLoading}
            className={`w-full bg-blue-500 text-white py-2 rounded ${isLoading && "opacity-50 cursor-not-allowed"
              }`}
          >
            {isLoading ? "Processing..." : "Upload and Analyze"}
          </button>

          {error && <p className="text-red-600 text-sm">{error}</p>}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="chat-history border p-4 rounded bg-gray-100 space-y-2">
            {conversation.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-screen-md p-3 rounded-lg shadow-md text-sm ${msg.role === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-800"
                    }`}
                >
                  {msg.role === "model" ? (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(msg.text),
                      }}
                    />
                  ) : (
                    msg.text
                  )}
                </div>
              </div>
            ))}
            <div ref={conversationEndRef}></div>
            {isLoading && (
              <div className="text-center mt-2">
                <div className="loader border-t-2 border-blue-500 rounded-full w-8 h-8 animate-spin"></div>
              </div>
            )}
          </div>

          <div className="sticky bottom-0 bg-white">
            <textarea
              placeholder="Ask a question about the document..."
              className="w-full p-2 border rounded"
              rows={2}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  const query = (e.target as HTMLTextAreaElement).value;
                  handleConversation(query);
                  (e.target as HTMLTextAreaElement).value = "";
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
