import "react-quill/dist/quill.snow.css";
import "react-toastify/dist/ReactToastify.css";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import TurndownService from "turndown"; // For converting HTML to markdown
import MonacoEditor from "@monaco-editor/react";
import { AiOutlineFileText, AiOutlineCode, AiOutlineSave } from "react-icons/ai";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

export type Node = {
  nodeId: string;
  id: string;
  title: string;
  type: "folder" | "file";
  parentId: string | null;
  content?: string;
  children: Node[];
  generated: boolean;
};

const NodeEditor: React.FC<{
  node: Node | null;
  onSaveContent: (nodeId: string, content: string) => void;
}> = ({ node, onSaveContent }) => {
  const [htmlContent, setHtmlContent] = useState(node?.content || ""); // For ReactQuill
  const [markdownContent, setMarkdownContent] = useState(""); // For Monaco
  const [isMonaco, setIsMonaco] = useState(false); // Track editor toggle state

  const turndownService = new TurndownService();

  useEffect(() => {
    if (node) {
      const content = node.content || "";
      setHtmlContent(content);
      setMarkdownContent(turndownService.turndown(content));
    }
  }, [node]);

  const handleEditorToggle = () => {
    if (!isMonaco) {
      // Convert current HTML content to markdown before toggling
      const markdown = turndownService.turndown(htmlContent || "");
      setMarkdownContent(markdown);
    }
    setIsMonaco((prev) => !prev); // Toggle editor mode
  };

  const handleSave = () => {
    const saveContent = isMonaco ? markdownContent : htmlContent;
    onSaveContent(node?.id || "", saveContent);
  };

  if (!node) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        <h2 className="text-xl font-semibold mb-1">Select a node to edit</h2>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-white p-2 rounded-lg shadow-lg overflow-y-scroll">
      {/* Header: Title and Action Buttons */}
      <div className="text-xl font-semibold mb-2 flex items-center justify-between">
        <div className="flex-1 text-center">
          <h1>{node.title}</h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleEditorToggle}
            className="transition bg-gray-200 p-2 rounded hover:bg-gray-300"
          >
            {isMonaco ? (
              <AiOutlineFileText size={24} title="Switch to ReactQuill" />
            ) : (
              <AiOutlineCode size={24} title="Switch to Monaco" />
            )}
          </button>
          <button
            onClick={handleSave}
            className="transition bg-primary p-2 rounded text-white hover:bg-primary-dark"
          >
            <AiOutlineSave size={24} title="Save Content" />
          </button>
        </div>
      </div>

      {/* Editor: ReactQuill or Monaco */}
      {node.type === "file" ? (
        isMonaco ? (
          <MonacoEditor
            height="600px"
            language="markdown"
            theme="vs-dark"
            value={markdownContent} // Use markdown state
            onChange={(newValue) => setMarkdownContent(newValue || "")}
            options={{
              selectOnLineNumbers: true,
            }}
          />
        ) : (
          <ReactQuill
            theme="snow"
            value={htmlContent} // Use HTML state
            onChange={(value) => setHtmlContent(value || "")}
            modules={{
              toolbar: [
                [{ header: "1" }, { header: "2" }, { font: [] }],
                [{ list: "ordered" }, { list: "bullet" }],
                ["bold", "italic", "underline"],
                ["link", "image"],
                [{ align: [] }],
                ["clean"],
              ],
            }}
            formats={[
              "header",
              "font",
              "bold",
              "italic",
              "underline",
              "list",
              "bullet",
              "link",
              "image",
              "align",
            ]}
            style={{ height: "400px" }}
          />
        )
      ) : (
        <p>Select a file to edit its content</p>
      )}
    </div>
  );
};

export default NodeEditor;
