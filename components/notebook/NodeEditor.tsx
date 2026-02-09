import "react-quill/dist/quill.snow.css";
import "react-toastify/dist/ReactToastify.css";
import dynamic from "next/dynamic";
import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import TurndownService from "turndown";
import MonacoEditor from "@monaco-editor/react";
import { AiOutlineSave, AiOutlineSwap, AiOutlineThunderbolt } from "react-icons/ai";
import { FaMagic, FaSave, FaCode, FaAlignLeft, FaCheckCircle, FaTimes, FaCopy, FaPlus, FaExpand, FaCompress, FaEye, FaMarkdown, FaClock, FaCog, FaTrash, FaLink, FaBook } from "react-icons/fa";
import { toast } from "react-toastify"; // Added toast import
import { AnimatePresence, motion } from "framer-motion";
import DOMPurify from "dompurify";

import FileAnalysis from "./fileRipper";
import ProEditorWrapper from "../editor/Editor";
import { logActivity, performSmartAction, updateNode } from "../../pages/api/utils";
import { Node } from "../../types/types";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });



const NodeEditor: React.FC<{
  node: Node | null;
  allNodes?: Node[];
  onSaveContent: (nodeId: string, content: string, resourceType: string) => void;
  onUpdateProgress?: (nodeId: string, progress: number) => void;
}> = ({ node, allNodes = [], onSaveContent, onUpdateProgress }) => {
  const turndownService = new TurndownService();

  // Helper to determine mode synchronously
  const getInitialMode = (n: Node | null): "quill" | "monaco" | "fileAnalysis" => {
    if (!n) return "quill";
    if (n.resourceType === "fileAnalysis") return "fileAnalysis";

    const codeExtensions = [".js", ".ts", ".tsx", ".jsx", ".py", ".json", ".css", ".html", ".java", ".cpp", ".c", ".go", ".rs", ".php"];
    if (codeExtensions.some(ext => n.title.toLowerCase().endsWith(ext))) {
      return "monaco";
    }
    return "quill";
  };

  // Timer Logic
  // Timer Logic
  useEffect(() => {
    if (!node) return;

    let lastSync = Date.now();
    const intervalTime = 5 * 60 * 1000; // 5 minutes

    const syncActivity = () => {
      const now = Date.now();
      const duration = Math.floor((now - lastSync) / 1000);
      if (duration > 0) {
        // Use sendBeacon for reliable background/exit syncing
        const data = JSON.stringify({ nodeId: node.nodeId, duration });
        const blob = new Blob([data], { type: 'application/json' });
        navigator.sendBeacon('/api/logs/beacon', blob);
        lastSync = now;
      }
    };

    const interval = setInterval(syncActivity, intervalTime);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        syncActivity();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", syncActivity);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", syncActivity);
      syncActivity(); // Final sync on unmount
    };
  }, [node]);

  // State initialization (Synchronous)
  const [htmlContent, setHtmlContent] = useState(node?.content || "");
  const [markdownContent, setMarkdownContent] = useState(() => node?.content ? turndownService.turndown(node.content) : "");
  const [editorMode, setEditorMode] = useState<"quill" | "monaco" | "fileAnalysis">(() => getInitialMode(node));
  const [analysedContent, setAnalysedContent] = useState("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [nodeTags, setNodeTags] = useState<string[]>(node?.tags || []);
  const [nodePrereqs, setNodePrereqs] = useState<string[]>(node?.prerequisites || []);

  const handleUpdateNodeMeta = async () => {
    if (!node) return;
    try {
      await updateNode(node.nodeId, {
        tags: nodeTags,
        prerequisites: nodePrereqs
      });
      toast.success("Node settings updated!");
      setIsSettingsOpen(false);
    } catch (e) {
      toast.error("Failed to update settings");
    }
  };

  // Keep local state in sync when node changes
  useEffect(() => {
    if (node) {
      setNodeTags(node.tags || []);
      setNodePrereqs(node.prerequisites || []);
    }
  }, [node]);

  // Update effect if node reference changes (in case component is NOT remounted, though it should be)
  useEffect(() => {
    if (node) {
      setHtmlContent(node.content || "");
      setMarkdownContent(node.content ? turndownService.turndown(node.content) : "");
      setEditorMode(getInitialMode(node));
    }
  }, [node]); // Dependencies simplified since we just reset on node change

  // Calculate available modes (for UI)
  const availableModes = useMemo(() => {
    if (!node) return [];
    if (node.resourceType === "fileAnalysis") return ["fileAnalysis"];

    const codeExtensions = [".js", ".ts", ".tsx", ".jsx", ".py", ".json", ".css", ".html", ".java", ".cpp", ".c", ".go", ".rs", ".php"];
    if (codeExtensions.some(ext => node.title.toLowerCase().endsWith(ext))) return ["monaco"];

    return ["quill", "monaco"];
  }, [node]);

  const handleSave = useCallback(() => {
    let saveContent = editorMode === "monaco" ? markdownContent : htmlContent;
    let resourceType = node?.resourceType || '';
    if (editorMode == "fileAnalysis") {
      resourceType = 'fileAnalysis';
      saveContent = analysedContent;
    }
    onSaveContent(node?.id || "", saveContent, resourceType);
  }, [editorMode, markdownContent, htmlContent, analysedContent, node, onSaveContent]);

  /* Smart Actions Logic */
  const [showSmartActions, setShowSmartActions] = useState(false);
  const [isSmartActionLoading, setIsSmartActionLoading] = useState(false);
  const [smartActionResult, setSmartActionResult] = useState<string | null>(null);
  const [selectedText, setSelectedText] = useState("");
  const [conversationHistory, setConversationHistory] = useState<any[]>([]);
  const [customPromptInput, setCustomPromptInput] = useState("");
  const [showCustomPrompt, setShowCustomPrompt] = useState(false);

  // Clean raw AI response
  const cleanAIResponse = (text: string) => {
    // Remove "AI Insight:" headers if present to avoid redundancy
    return text.replace(/^> \*\*AI Insight.*\*\*:\n>/, '').trim();
  };


  const performAutoLink = () => {
    if (!allNodes || allNodes.length === 0) {
      setSmartActionResult("No other notes available to link.");
      return;
    }

    let currentContent = editorMode === "monaco" ? markdownContent : htmlContent;
    // Basic implementation for Markdown only right now to avoid breaking HTML
    if (editorMode !== "monaco") {
      toast.info("Auto-link works best in Code View (Markdown). Switching mode...");
      // We can't easily switch and run in one go without state flush.
      // Just warn for now.
      setSmartActionResult("Please switch to Code View to use Auto-Link reliably.");
      return;
    }

    let newContent = currentContent;
    let count = 0;
    const linkedTitles: string[] = [];

    allNodes.forEach(otherNode => {
      if (otherNode.id === node?.id) return; // Don't link self
      if (otherNode.type === 'folder' || otherNode.type === 'syllabus') return; // Link files only? Or all? Let's link all.

      // Regex to find title not already linked (approximate)
      // Avoid matching inside [ ] or ( )
      // This is hard with regex. 
      // Simple approach: Match " Title " boundaries.
      // \bTitle\b ?
      const title = otherNode.title;
      if (title.length < 3) return; // Skip short titles to avoid noise

      const regex = new RegExp(`\\b${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b(?![^[\\]]*\\])`, 'gi'); // Negative lookahead for ]

      if (regex.test(newContent)) {
        // Check if it's already linked with this ID?
        // Hard to check.
        // Let's just do replacement if it's plain text.
        // We replace with [Title](nodeId) which creates a link
        // But we need to make sure we don't replace inside the link we just made?
        // We iterate allNodes.
        // Risk: "Java" and "JavaScript". If we replace "Java" first... "JavaScript" -> "[Java](...)Script".
        // We should sort titles by length desc first?
        // But for now, simple iteration.

        // Count occurrences
        const matches = newContent.match(regex);
        if (matches) {
          newContent = newContent.replace(regex, `[${title}](?id=${otherNode.id})`); // Custom link format or standard?
          // Standard markdown: [Title](url)
          // Start with standard? But URL needs to be handled.
          // We use ?id=nodeId for internal navigation? we can handle this in markdown renderer.
          count += matches.length;
          linkedTitles.push(title);
        }
      }
    });

    if (count > 0) {
      setMarkdownContent(newContent);
      setSmartActionResult(`**Auto-Linked ${count} mentions:**\n\n` + linkedTitles.map(t => `- ${t}`).join('\n') + `\n\nContent updated.`);
    } else {
      setSmartActionResult("No unlinked mentions found.");
    }
  };

  const handleSmartAction = async (action: string, customPrompt?: string) => {
    // Local Actions
    if (action === 'auto_link') {
      setIsSmartPanelOpen(true);
      setIsSmartActionLoading(true);
      setTimeout(() => {
        performAutoLink();
        setIsSmartActionLoading(false);
      }, 500);
      return;
    }

    // 1. Get Selection (or full context)
    let textToProcess = "";
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      textToProcess = selection.toString().trim();
      setSelectedText(textToProcess);
    } else {
      const content = editorMode === "monaco" ? markdownContent : htmlContent;
      textToProcess = content.replace(/<[^>]*>/g, '').substring(0, 3000);
      setSelectedText("");
    }

    setShowSmartActions(false);
    setSmartActionResult(null);
    setIsSmartActionLoading(true);

    try {
      const response = await fetch('/api/smartNotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: customPrompt ? 'custom' : action,
          text: textToProcess,
          filename: node?.title || 'Untitled',
          history: conversationHistory,
          customPrompt: customPrompt || undefined
        })
      });

      const data = await response.json();
      if (data.result) {
        setSmartActionResult(data.result);
        // Update history for follow-up questions
        if (data.history) {
          setConversationHistory(data.history);
        }
      }
      setIsSmartActionLoading(false);
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate insight");
      setIsSmartActionLoading(false);
    }
    // Note: We keep isSmartActionLoading true until result comes, then show result. 
    // If successful, we set result and formatting. 
    // Actually we need a separate state for "Panel Open" vs "Loading".
    // Let's use `showSmartPanel` state? 
    // Or just use `smartActionResult` existence? 
    // Better: `isSmartPanelOpen`
  };

  const [isSmartPanelOpen, setIsSmartPanelOpen] = useState(false);

  // Wrapper to open panel and start action
  const triggerSmartAction = (action: string) => {
    setIsSmartPanelOpen(true);
    handleSmartAction(action);
  };

  const closeSmartPanel = () => {
    setIsSmartPanelOpen(false);
    setSmartActionResult(null);
    setIsSmartActionLoading(false);
    setConversationHistory([]);
    setCustomPromptInput("");
    setShowCustomPrompt(false);
  };

  // Insert Result actions
  const handleInsertResult = (type: 'insert' | 'append' | 'copy') => {
    if (!smartActionResult) return;
    const formatted = `\n\n> **AI Insight:**\n> ${smartActionResult}\n\n`;

    if (type === 'copy') {
      navigator.clipboard.writeText(smartActionResult);
      toast.success("Copied to clipboard");
    } else if (type === 'append') {
      if (editorMode === "monaco") {
        const newContent = markdownContent + formatted;
        setMarkdownContent(newContent);
        // Actually save to persist
        onSaveContent(node?.id || "", newContent, node?.resourceType || 'text');
      } else {
        const newContent = htmlContent + `<br/><blockquote><strong>AI Insight:</strong><br/>${smartActionResult.replace(/\n/g, '<br/>')}</blockquote><br/>`;
        setHtmlContent(newContent);
        onSaveContent(node?.id || "", newContent, node?.resourceType || 'text');
      }
      toast.success("Appended and saved!");
    } else if (type === 'insert') {
      navigator.clipboard.writeText(formatted);
      toast.info("Copied! Paste where you need it.");
    }
  };

  // Keyboard shortcut for save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave]);

  const toggleMode = () => {
    if (editorMode === "quill") {
      // To Monaco
      // If content works, great. If plain text, turndown might wrap it.
      const markdown = turndownService.turndown(htmlContent || "");
      setMarkdownContent(markdown);
      setEditorMode("monaco");
    } else {
      // To Quill
      // Assuming markdownContent is simple text or actual markdown
      setEditorMode("quill");
      // Note: We don't verify MD->HTML here, relying on Quill to handle text or previous HTML
    }
  };

  if (!node) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
        Select a file to edit
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-950 p-0 rounded-none overflow-hidden relative group">
      {/* Header */}
      <div className="flex-none h-8 flex items-center justify-between px-3 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 z-10 w-full select-none">

        <div className="flex items-center gap-2 max-w-[70%]">
          <button onClick={() => setIsSettingsOpen(true)} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded transition-colors" title="Node Settings">
            <FaCog size={12} />
          </button>
          <h1 className="text-sm font-semibold text-gray-700 dark:text-gray-300 truncate flex items-center gap-2" title={node.title}>
            {node.title}
          </h1>
          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-gray-100 dark:bg-gray-800 text-gray-400">
            {editorMode === 'monaco' ? 'Code' : editorMode === 'fileAnalysis' ? 'Analysis' : 'Note'}
          </span>
        </div>

        {isSettingsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm cursor-default" onClick={() => setIsSettingsOpen(false)}>
            <div className="bg-white dark:bg-gray-900 w-96 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h3 className="font-bold text-gray-800 dark:text-white">Node Settings</h3>
                <button onClick={() => setIsSettingsOpen(false)}><FaTimes /></button>
              </div>
              <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
                {/* Tags */}
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Tags</label>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {nodeTags.map(tag => (
                      <span key={tag} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded flex items-center gap-1">
                        {tag}
                        <button onClick={() => setNodeTags(nodeTags.filter(t => t !== tag))} className="hover:text-blue-900">×</button>
                      </span>
                    ))}
                  </div>
                  <input
                    className="w-full text-sm border rounded px-2 py-1 dark:bg-gray-800 dark:border-gray-700"
                    placeholder="Add tag + Enter"
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        const val = e.currentTarget.value.trim();
                        if (val && !nodeTags.includes(val)) {
                          setNodeTags([...nodeTags, val]);
                          e.currentTarget.value = '';
                        }
                      }
                    }}
                  />
                </div>

                {/* Prerequisites */}
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Prerequisites</label>
                  <div className="space-y-1 mb-2">
                    {nodePrereqs.map(reqId => (
                      <div key={reqId} className="flex justify-between items-center text-sm bg-gray-50 dark:bg-gray-800 p-2 rounded">
                        <span className="truncate">{allNodes?.find(n => n.id === reqId)?.title || reqId}</span>
                        <button onClick={() => setNodePrereqs(nodePrereqs.filter(id => id !== reqId))} className="text-red-500 hover:text-red-700 p-1"><FaTrash size={12} /></button>
                      </div>
                    ))}
                  </div>
                  <select
                    className="w-full text-sm border rounded px-2 py-1 dark:bg-gray-800 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                    onChange={e => {
                      if (e.target.value && !nodePrereqs.includes(e.target.value)) {
                        setNodePrereqs([...nodePrereqs, e.target.value]);
                        e.target.value = '';
                      }
                    }}
                    value=""
                  >
                    <option value="">+ Add Prerequisite...</option>
                    {allNodes?.filter(n => n.id !== node?.id && !nodePrereqs.includes(n.id))
                      .sort((a, b) => a.title.localeCompare(b.title))
                      .map(n => (
                        <option key={n.id} value={n.id}>{n.title}</option>
                      ))}
                  </select>
                </div>
              </div>
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                <button onClick={handleUpdateNodeMeta} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium">Save Changes</button>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          {/* Smart Actions Button */}
          <div className="relative">
            <button
              onClick={() => setShowSmartActions(!showSmartActions)}
              className={`flex items-center gap-1.5 px-2.5 py-0.5 ${isSmartActionLoading ? "bg-purple-100 text-purple-600 animate-pulse" : "bg-purple-50 text-purple-600 hover:bg-purple-100"} rounded-full text-[10px] font-medium transition-colors border border-purple-200`}
              disabled={isSmartActionLoading}
            >
              <FaMagic size={10} />
              {isSmartActionLoading ? "Thinking..." : "Smart Actions"}
            </button>

            {showSmartActions && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-100 dark:border-gray-700 py-1 z-50">
                <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 dark:border-gray-700/50 mb-1">
                  Enhance Note
                </div>
                <button onClick={() => triggerSmartAction('simplify')} className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-purple-50 dark:hover:bg-purple-900/30">
                  👶 Explain like I'm 5
                </button>
                <button onClick={() => triggerSmartAction('summarize')} className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-purple-50 dark:hover:bg-purple-900/30">
                  📝 Summarize
                </button>
                <button onClick={() => triggerSmartAction('key_concepts')} className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-purple-50 dark:hover:bg-purple-900/30">
                  🧠 Key Concepts
                </button>
                <button onClick={() => triggerSmartAction('examples')} className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-purple-50 dark:hover:bg-purple-900/30">
                  🔍 Add Examples
                </button>
                <div className="h-px bg-gray-50 dark:bg-gray-700 my-1" />
                <button onClick={() => triggerSmartAction('quiz')} className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-purple-50 dark:hover:bg-purple-900/30">
                  ❓ Create Quiz Question
                </button>
                <button onClick={() => triggerSmartAction('flashcards')} className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-purple-50 dark:hover:bg-purple-900/30">
                  💡 Flashcards
                </button>
                <button onClick={() => triggerSmartAction('action_items')} className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-purple-50 dark:hover:bg-purple-900/30">
                  ✅ Extract To-Do
                </button>
                <div className="h-px bg-gray-50 dark:bg-gray-700 my-1" />
                <button onClick={() => triggerSmartAction('auto_link')} className="w-full text-left px-3 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 font-medium">
                  🔗 Auto-Link Mentions
                </button>
                <div className="h-px bg-gray-50 dark:border-gray-700 my-1" />
                <button
                  onClick={() => {
                    setShowCustomPrompt(true);
                    setIsSmartPanelOpen(true);
                    setShowSmartActions(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 font-medium"
                >
                  💬 Ask Custom Question
                </button>
              </div>
            )}
          </div>
          <div className="h-3 w-px bg-gray-200 dark:bg-gray-700 mx-0.5"></div>

          <div className="h-3 w-px bg-gray-200 dark:bg-gray-700 mx-0.5"></div>

          {/* Progress / Complete Toggle */}
          <button
            onClick={() => {
              if (!node || !onUpdateProgress) return;
              const newProgress = (node?.progress || 0) >= 100 ? 0 : 100;
              onUpdateProgress(node.nodeId, newProgress);
            }}
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border transition-all ${(node?.progress || 0) >= 100
              ? "bg-green-50 border-green-200 text-green-600 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400"
              : "bg-gray-50 border-gray-200 text-gray-400 hover:border-gray-300 dark:bg-gray-800 dark:border-gray-700"
              }`}
            title={(node?.progress || 0) >= 100 ? "Mark as Incomplete" : "Mark as Complete"}
          >
            <div className={`w-3 h-3 rounded-full border flex items-center justify-center ${(node?.progress || 0) >= 100 ? "bg-green-500 border-green-500" : "border-gray-300"
              }`}>
              {(node?.progress || 0) >= 100 && <FaCheckCircle size={8} className="text-white" />}
            </div>
            <span className="text-[10px] font-medium">
              {(node?.progress || 0) >= 100 ? "Completed" : "Mark Complete"}
            </span>
          </button>

          {/* Direct Toggle */}
          {availableModes.length > 1 && (
            <button
              onClick={toggleMode}
              className="group/toggle flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-gray-50 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-gray-400 hover:text-blue-600 transition-all cursor-pointer"
              title={`Switch to ${editorMode === 'quill' ? 'Code View' : 'Rich Text'}`}
            >
              {editorMode === 'quill' ? <FaCode size={12} /> : <FaAlignLeft size={12} />}
            </button>
          )}

          {/* Smart Actions Slide-Out Panel */}
          <AnimatePresence>
            {isSmartPanelOpen && (
              <motion.div
                initial={{ x: "100%", opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: "100%", opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="absolute right-0 top-8 bottom-0 w-80 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 shadow-2xl z-40 flex flex-col"
              >
                {/* Panel Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                  <h3 className="text-sm font-semibold text-purple-600 flex items-center gap-2">
                    <FaMagic size={12} /> AI Insight
                  </h3>
                  <button onClick={closeSmartPanel} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                    <FaTimes size={14} />
                  </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                  {/* Context Indicator */}
                  <div className="mb-3 space-y-1">
                    <div className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold flex items-center gap-1">
                      <FaBook size={8} />
                      {node?.title || 'Untitled'}
                    </div>
                    {selectedText ? (
                      <div className="text-[10px] text-gray-400 border-l-2 border-purple-200 pl-2 line-clamp-2 italic">
                        Based on selection: "{selectedText}"
                      </div>
                    ) : (
                      <div className="text-[10px] text-gray-400 border-l-2 border-gray-200 pl-2 italic">
                        Based on entire note
                      </div>
                    )}
                    {conversationHistory.length > 0 && (
                      <div className="text-[9px] text-blue-500 dark:text-blue-400 flex items-center gap-1">
                        💬 {conversationHistory.length} message{conversationHistory.length > 1 ? 's' : ''} in conversation
                      </div>
                    )}
                  </div>

                  {isSmartActionLoading ? (
                    <div className="flex flex-col items-center justify-center py-10 gap-3 text-gray-400">
                      <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xs animate-pulse">Analyzing...</span>
                    </div>
                  ) : smartActionResult ? (
                    <div
                      className="prose prose-sm dark:prose-invert prose-p:text-gray-600 dark:prose-p:text-gray-300 prose-headings:text-gray-700 dark:prose-headings:text-gray-200 prose-strong:text-gray-800 dark:prose-strong:text-gray-100 prose-ul:text-gray-600 dark:prose-ul:text-gray-300 prose-ol:text-gray-600 dark:prose-ol:text-gray-300 text-xs max-w-none"
                      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(smartActionResult) }}
                    />
                  ) : (
                    <div className="text-center text-gray-400 text-xs py-10">
                      Select an action to generate insights.
                    </div>
                  )}

                  {/* Custom Prompt Input - Show after first result or when toggled */}
                  {(smartActionResult || showCustomPrompt) && !isSmartActionLoading && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <label className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 mb-2 block">
                        Ask a follow-up question:
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={customPromptInput}
                          onChange={(e) => setCustomPromptInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && customPromptInput.trim()) {
                              handleSmartAction('custom', customPromptInput);
                              setCustomPromptInput('');
                            }
                          }}
                          placeholder="e.g., Explain this in more detail..."
                          className="flex-1 text-xs px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                        />
                        <button
                          onClick={() => {
                            if (customPromptInput.trim()) {
                              handleSmartAction('custom', customPromptInput);
                              setCustomPromptInput('');
                            }
                          }}
                          disabled={!customPromptInput.trim()}
                          className="px-3 py-2 bg-purple-600 text-white rounded-lg text-xs font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Ask
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                {smartActionResult && !isSmartActionLoading && (
                  <div className="p-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 flex gap-2">
                    <button
                      onClick={() => handleInsertResult('copy')}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <FaCopy size={10} /> Copy
                    </button>
                    <button
                      onClick={() => handleInsertResult('append')}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-purple-600 text-white rounded-lg text-xs font-medium hover:bg-purple-700 transition-colors shadow-sm"
                    >
                      <FaPlus size={10} /> Append
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Save */}
          <button
            onClick={handleSave}
            title="Save (Ctrl+S)"
            className="p-1.5 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-full text-gray-300 hover:text-green-600 transition-colors"
          >
            <AiOutlineSave size={14} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto relative text-sm custom-scrollbar">
        {node.type === "file" ? (
          editorMode === "monaco" ? (
            <div className="h-full min-h-full">
              <MonacoEditor
                height="100%"
                language={
                  node.title.endsWith(".js") ? "javascript" :
                    node.title.endsWith(".ts") ? "typescript" :
                      node.title.endsWith(".json") ? "json" :
                        node.title.endsWith(".py") ? "python" :
                          "markdown"
                }
                theme="vs-dark"
                value={markdownContent}
                onChange={(newValue) => setMarkdownContent(newValue || "")}
                options={{
                  selectOnLineNumbers: true,
                  minimap: { enabled: false },
                  padding: { top: 16, bottom: 16 },
                  fontSize: 14,
                  lineHeight: 24,
                  fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
                  scrollBeyondLastLine: true,
                  wordWrap: "on",
                  wrappingIndent: "indent",
                  lineNumbers: "on",
                  renderLineHighlight: "all",
                  cursorBlinking: "smooth",
                  smoothScrolling: true,
                  contextmenu: true,
                  folding: true,
                  bracketPairColorization: { enabled: true }
                }}
              />
            </div>
          ) : editorMode === "quill" ? (
            <div className="h-full overflow-y-auto">
              <ProEditorWrapper
                initialContent={htmlContent}
                onChange={(html) => setHtmlContent(html || "")}
                storageKey={undefined}
                className="h-full border-none"
              />
            </div>
          ) : editorMode === "fileAnalysis" ? (
            <div className="p-6 h-full overflow-y-auto custom-scrollbar">
              <FileAnalysis analysedContent={node.content || null} setAnalysedContent={setAnalysedContent} />
            </div>
          ) : null
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">Select a file to edit</div>
        )}
      </div>
    </div>
  );
};

export default NodeEditor;
