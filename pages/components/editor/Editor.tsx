"use client";

import React, { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { ProEditorProps } from "./tiptapEditor";

const DynamicProEditor = dynamic(() => import("./tiptapEditor"), { ssr: false });

const DefaultSkeleton: React.FC = () => (
  <div className="w-full p-6 bg-white rounded-lg shadow-lg">
    <div className="h-6 bg-gray-200 rounded w-1/3 mb-4 animate-pulse" />
    <div className="flex gap-2 items-center mb-4">
      <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
      <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
      <div className="h-8 w-8 bg-gray-200 rounded animate-pulse ml-auto" />
    </div>

    <div className="rounded-lg border overflow-hidden">
      <div className="p-4">
        <div className="h-8 bg-gray-100 rounded mb-3 animate-pulse w-3/4" />
        <div className="h-40 bg-gray-100 rounded animate-pulse" />
      </div>
    </div>

    <div className="mt-6 flex justify-end">
      <div className="h-10 w-28 bg-gray-200 rounded animate-pulse" />
    </div>
  </div>
);

export type EditorProps = Omit<ProEditorProps, "onChange"> & {
  isLoading?: boolean;
  skeleton?: React.ReactNode;
  onChange?: (html: string) => void;
  value?: string;
};

const Editor: React.FC<EditorProps> = ({
  initialContent = "",
  value,
  onChange,
  isLoading = true,
  skeleton,
  ...rest
}) => {
  const [loading, setLoading] = useState(isLoading);

  const handleEditorChange = useCallback(
    (html: string, _json?: any) => {
      onChange?.(html);
    },
    [onChange]
  );

  useEffect(() => {
    // Set loading to false once component mounts, empty content is valid
    setLoading(false);
  }, [initialContent]);


  if (loading) {
    return <>{skeleton ?? <DefaultSkeleton />}</>;
  }

  return (
    <DynamicProEditor
      initialContent={initialContent}
      value={value}
      onChange={handleEditorChange as any}
      {...(rest as Partial<ProEditorProps>)}
    />
  );
};

export default Editor;
