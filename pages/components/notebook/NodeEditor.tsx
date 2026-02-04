import "react-quill/dist/quill.snow.css";
import "react-toastify/dist/ReactToastify.css";
import dynamic from "next/dynamic";
import { useEffect, useState, useCallback, useMemo } from "react";
import TurndownService from "turndown";
import MonacoEditor from "@monaco-editor/react";
import { AiOutlineSave, AiOutlineSwap } from "react-icons/ai";
import { FaCode, FaAlignLeft, FaEye, FaMarkdown } from "react-icons/fa";
import FileAnalysis from "./fileRipper";
import ProEditorWrapper from "../editor/Editor";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

export type Node = {
  nodeId: string;
  id: string;
  title: string;
  type: "syllabus" | "folder" | "file";
  parentId: string | null;
  content?: string;
  children: Node[];
  resourceType: string;
  generated: boolean;
};

const NodeEditor: React.FC<{
  node: Node | null;
  onSaveContent: (nodeId: string, content: string, resourceType: string) => void;
}> = ({ node, onSaveContent }) => {
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

  // State initialization (Synchronous)
  const [htmlContent, setHtmlContent] = useState(node?.content || "");
  const [markdownContent, setMarkdownContent] = useState(() => node?.content ? turndownService.turndown(node.content) : "");
  const [editorMode, setEditorMode] = useState<"quill" | "monaco" | "fileAnalysis">(() => getInitialMode(node));
  const [analysedContent, setAnalysedContent] = useState("");

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
        <h1 className="text-sm font-semibold text-gray-700 dark:text-gray-300 truncate max-w-[70%] flex items-center gap-2" title={node.title}>
          {node.title}
          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-gray-100 dark:bg-gray-800 text-gray-400">
            {editorMode === 'monaco' ? 'Code' : editorMode === 'fileAnalysis' ? 'Analysis' : 'Note'}
          </span>
        </h1>

        <div className="flex items-center gap-2">
          {/* Direct Toggle */}
          {availableModes.length > 1 && (
            <button
              onClick={toggleMode}
              className="group/toggle flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-gray-50 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-gray-400 hover:text-blue-600 transition-all cursor-pointer"
              title={`Switch to ${editorMode === 'quill' ? 'Code View' : 'Rich Text'}`}
            >
              {editorMode === 'quill' ? <FaCode size={12} /> : <FaAlignLeft size={12} />}
              <span className="text-[10px] font-medium max-w-0 overflow-hidden group-hover/toggle:max-w-xs transition-all duration-300 whitespace-nowrap">
                {editorMode === 'quill' ? 'Code View' : 'Rich Text'}
              </span>
            </button>
          )}

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
      <div className="flex-1 overflow-hidden relative text-sm">
        {node.type === "file" ? (
          editorMode === "monaco" ? (
            <MonacoEditor
              height="100%"
              language={
                node.title.endsWith(".js") ? "javascript" :
                  node.title.endsWith(".ts") ? "typescript" :
                    node.title.endsWith(".json") ? "json" :
                      node.title.endsWith(".py") ? "python" :
                        "markdown"
              }
              theme="vs-light"
              value={markdownContent}
              onChange={(newValue) => setMarkdownContent(newValue || "")}
              options={{
                selectOnLineNumbers: true,
                minimap: { enabled: false },
                padding: { top: 8, bottom: 8 },
                fontSize: 13,
                fontFamily: "'JetBrains Mono', monospace",
                scrollBeyondLastLine: false,
                wordWrap: "on"
              }}
            />
          ) : editorMode === "quill" ? (
            <ProEditorWrapper
              initialContent={htmlContent}
              onChange={(html) => setHtmlContent(html || "")}
              storageKey={undefined}
              className="h-full border-none"
            />
          ) : editorMode === "fileAnalysis" ? (
            <div className="p-4 h-full overflow-y-auto custom-scrollbar">
              <FileAnalysis analysedContent={node.content || null} setAnalysedContent={setAnalysedContent} />
            </div>
          ) : null
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">Select a file</div>
        )}
      </div>
    </div>
  );
};

export default NodeEditor;
