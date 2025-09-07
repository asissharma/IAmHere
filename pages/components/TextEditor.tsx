"use client";

import dynamic from "next/dynamic";
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

const ProEditor = dynamic(() => import("./editor/Editor"), { ssr: false });

const TextEditor: React.FC = () => {
  // content will hold the HTML string
  const [content, setContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchContent = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/getText");
        if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
        const data = await res.json();
        if (!mounted) return;
        setContent((data?.content as string) ?? "");
      } catch (err) {
        console.error(err);
        if (mounted) setError("Failed to load editor content.");
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    fetchContent();
    return () => {
      mounted = false;
    };
  }, []);

  const uploadImage = useCallback(async (file: File) => {
    if (file.size > 10 * 1024 * 1024) throw new Error("Image too large (max 10MB)");
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: form });
    if (!res.ok) throw new Error("Upload failed");
    const json = await res.json();
    if (!json?.url) throw new Error("No url in upload response");
    return json.url as string;
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      // Here `content` is the latest HTML we have from ProEditor via onChange
      const res = await fetch("/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error("Failed to save content");
      console.log("Saved");
    } catch (err) {
      console.error(err);
      setError("Failed to save content.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="ml-2 m-2">
        <motion.div
          className="w-full bg-white rounded-lg shadow-lg p-2"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
        >
          <h2 className="text-2xl font-semibold mb-2">Text Editor</h2>

          {error && <div className="text-red-500 mb-4">{error}</div>}

          <div className="mb-6">
            <ProEditor
              initialContent={content}
              onChange={(html: string) => setContent(html)}
              uploadImage={uploadImage}
              storageKey={undefined}
              className="w-full"
            />
          </div>
{!isLoading? 
          <div className="flex justify-end">
            <motion.button
              onClick={handleSave}
              disabled={isSaving}
              whileTap={{ scale: 0.98 }}
              className={`px-6 py-2 rounded-md text-white font-semibold transition-colors ${{
                true: "bg-gray-400 cursor-not-allowed",
                false: "bg-green-600 hover:bg-green-700",
              }[String(isSaving)]}`}
            >
              {isSaving ? "Saving..." : "Save"}
            </motion.button>
          </div>
          :''}
        </motion.div>
    </div>
  );
};

export default TextEditor;
