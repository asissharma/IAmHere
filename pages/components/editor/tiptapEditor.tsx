"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import { BubbleMenu, FloatingMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Highlight from "@tiptap/extension-highlight";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import TextAlign from "@tiptap/extension-text-align";
import CharacterCount from "@tiptap/extension-character-count";
import Dropcursor from "@tiptap/extension-dropcursor";
import Gapcursor from "@tiptap/extension-gapcursor";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { createLowlight, all as allGrammars } from "lowlight";
const lowlight = createLowlight(allGrammars);

import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { Extension } from "@tiptap/core";
import Suggestion from "@tiptap/suggestion";

// languages for highlighting
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import json from "highlight.js/lib/languages/json";
import python from "highlight.js/lib/languages/python";
import xml from "highlight.js/lib/languages/xml";

// register a few languages with lowlight
try {
  // registerLanguage may throw if already registered — ignore safely
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (lowlight as any).registerLanguage?.("javascript", javascript);
  (lowlight as any).registerLanguage?.("typescript", typescript);
  (lowlight as any).registerLanguage?.("json", json);
  (lowlight as any).registerLanguage?.("python", python);
  (lowlight as any).registerLanguage?.("xml", xml);
} catch (e) {
  // noop
}

// --- Icons (tiny inline SVGs for no-dependency UI) ---
const Ic = {
  Bold: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" width="16" height="16" {...p} fill="currentColor"><path d="M7 5h6a4 4 0 0 1 0 8H7zm0 6h7a4 4 0 1 1 0 8H7z"/></svg>
  ),
  Italic: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" width="16" height="16" {...p} fill="currentColor"><path d="M10 4v3h2.1l-3.4 10H6v3h8v-3h-2.1l3.4-10H18V4z"/></svg>
  ),
  Underline: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" width="16" height="16" {...p} fill="currentColor"><path d="M6 4v7a6 6 0 1 0 12 0V4h-2v7a4 4 0 1 1-8 0V4zM5 20h14v2H5z"/></svg>
  ),
  Strike: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" width="16" height="16" {...p} fill="currentColor"><path d="M4 10h16v2H4zm5.3 4a4 4 0 0 0 1.7.9V18h2v-2.3a5.3 5.3 0 0 0 2-.8l1.2 1.6A7.2 7.2 0 0 1 13 18.1V20h-2v-2a7.1 7.1 0 0 1-4.8-2.2zM11 4v2.1A7.2 7.2 0 0 1 6 8.3L4.7 6.7A9.2 9.2 0 0 1 11 4zm2 0a9.2 9.2 0 0 1 6.3 2.7L17.9 8A7.2 7.2 0 0 1 13 6.1z"/></svg>
  ),
  H: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" width="16" height="16" {...p} fill="currentColor"><path d="M5 4h2v6h10V4h2v16h-2v-8H7v8H5z"/></svg>
  ),
  Quote: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" width="16" height="16" {...p} fill="currentColor"><path d="M7 6h6v6H9v6H5V8a2 2 0 0 1 2-2zm10 0h6v6h-4v6h-4V8a2 2 0 0 1 2-2z"/></svg>
  ),
  List: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" width="16" height="16" {...p} fill="currentColor"><path d="M4 6h2v2H4zm4 0h12v2H8zM4 11h2v2H4zm4 0h12v2H8zM4 16h2v2H4zm4 0h12v2H8z"/></svg>
  ),
  Ordered: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" width="16" height="16" {...p} fill="currentColor"><path d="M6 5h2v2H6V5zm0 5h2v2H6v-2zm0 5h2v2H6v-2zM9 6h12v2H9V6zm0 5h12v2H9v-2zm0 5h12v2H9v-2z"/></svg>
  ),
  Task: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" width="16" height="16" {...p} fill="currentColor"><path d="M9 16l-3-3 1.5-1.5L9 13l7.5-7.5L18 7z"/></svg>
  ),
  AlignLeft: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" width="16" height="16" {...p} fill="currentColor"><path d="M3 5h14v2H3zm0 4h18v2H3zm0 4h14v2H3zm0 4h18v2H3z"/></svg>
  ),
  AlignCenter: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" width="16" height="16" {...p} fill="currentColor"><path d="M4 5h16v2H4zm3 4h10v2H7zm-3 4h16v2H4zm3 4h10v2H7z"/></svg>
  ),
  AlignRight: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" width="16" height="16" {...p} fill="currentColor"><path d="M7 5h14v2H7zM3 9h18v2H3zm4 4h14v2H7zm-4 4h18v2H3z"/></svg>
  ),
  Code: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" width="16" height="16" {...p} fill="currentColor"><path d="M9 18l-5-6 5-6 1.5 1.3L7.1 12l3.4 4.7zM15 6l5 6-5 6-1.5-1.3L16.9 12 13.5 7.3z"/></svg>
  ),
  Link: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" width="16" height="16" {...p} fill="currentColor"><path d="M3.9 12A3.6 3.6 0 0 1 7.5 8.4H11v2H7.5a1.6 1.6 0 1 0 0 3.2H11v2H7.5A3.6 3.6 0 0 1 3.9 12zm6.1-1v2h4v-2zm3-3h3.6A3.6 3.6 0 0 1 20.2 10.6 3.6 3.6 0 0 1 16.6 14H13v-2h3.1a1.6 1.6 0 1 0 0-3.2H13z"/></svg>
  ),
  Image: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" width="16" height="16" {...p} fill="currentColor"><path d="M5 5h14a2 2 0 0 1 2 2v10H3V7a2 2 0 0 1 2-2zm2 9l3-4 3 4 2-3 4 5H7z"/></svg>
  ),
  Undo: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" width="16" height="16" {...p} fill="currentColor"><path d="M12 5V2L6 8l6 6V9c3.3 0 6 2.7 6 6 0 1.2-.3 2.3-.9 3.3l1.5 1.5C20.8 18.6 21 15.9 21 13c0-5-4-9-9-9z"/></svg>
  ),
  Redo: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" width="16" height="16" {...p} fill="currentColor"><path d="M12 5V2l6 6-6 6V9a6 6 0 0 0-6 6c0 1.2.3 2.3.9 3.3L5.4 21A9 9 0 0 1 3 15c0-5 4-9 9-9z"/></svg>
  ),
  HR: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" width="16" height="16" {...p} fill="currentColor"><rect x="3" y="11" width="18" height="2"/></svg>
  ),
  Table: (p: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" width="16" height="16" {...p} fill="currentColor"><path d="M3 5h18v14H3zm2 2v3h5V7zm7 0v3h7V7zM5 12v5h5v-5zm7 0v5h7v-5z"/></svg>
  ),
};

// --- Slash command extension (/, type to insert blocks) ---
export type SlashItem = {
  title: string;
  subtitle?: string;
  icon: keyof typeof Ic;
  command: (opts: { editor: any; range: { from: number; to: number } }) => void;
};

const makeSlashItems = (uploadImage?: (file: File) => Promise<string>): SlashItem[] => [
  {
    title: "Heading 1",
    subtitle: "Large section title",
    icon: "H",
    command: ({ editor, range }) => editor.chain().focus().deleteRange(range).setHeading({ level: 1 }).run(),
  },
  {
    title: "Heading 2",
    subtitle: "Medium section title",
    icon: "H",
    command: ({ editor, range }) => editor.chain().focus().deleteRange(range).setHeading({ level: 2 }).run(),
  },
  {
    title: "Bullet list",
    icon: "List",
    command: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleBulletList().run(),
  },
  {
    title: "Numbered list",
    icon: "Ordered",
    command: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleOrderedList().run(),
  },
  {
    title: "Task list",
    icon: "Task",
    command: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleTaskList().run(),
  },
  {
    title: "Quote",
    icon: "Quote",
    command: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleBlockquote().run(),
  },
  {
    title: "Code block",
    icon: "Code",
    command: ({ editor, range }) => editor.chain().focus().deleteRange(range).setCodeBlock().run(),
  },
  {
    title: "Table",
    icon: "Table",
    command: ({ editor, range }) => editor.chain().focus().deleteRange(range).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
  },
  {
    title: "Divider",
    icon: "HR",
    command: ({ editor, range }) => editor.chain().focus().deleteRange(range).setHorizontalRule().run(),
  },
  {
    title: "Image (upload)",
    icon: "Image",
    command: async ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).run();
      if (!uploadImage) return;
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = async () => {
        const file = input.files?.[0];
        if (!file) return;
        const url = await uploadImage(file);
        editor.chain().focus().setImage({ src: url, alt: file.name }).run();
      };
      input.click();
    },
  },
];

const SlashCommand = (items: SlashItem[]) =>
  Extension.create({
    name: "slash-command",
    addProseMirrorPlugins() {
      // pass the editor instance from the extension context into Suggestion
      const plugin = Suggestion({
        editor: (this as any).editor, // required by SuggestionOptions
        char: "/",
        startOfLine: true,
        allowSpaces: true,
        items: ({ query }) => {
          return items
            .filter((i) => i.title.toLowerCase().includes(query.toLowerCase()))
            .slice(0, 8);
        },
        render: () => {
          let component: HTMLDivElement | null = null;
          let onKeyDown: ((props: any) => boolean) | null = null;

          return {
            onStart: (props: any) => {
              component = document.createElement("div");
              component.className =
                "z-50 w-72 max-h-80 overflow-auto rounded-xl border bg-white shadow-lg p-1 text-sm";
              component.tabIndex = -1;
              update(props);
              document.body.appendChild(component);
              const { left, bottom } = props.clientRect?.() ?? { left: 0, bottom: 0 };
              Object.assign(component.style, { position: "absolute", left: `${left}px`, top: `${bottom + 6}px` });
            },
            onUpdate: update,
            onKeyDown: keydown,
            onExit: () => {
              component?.remove();
              component = null;
            },
          };

          function update(props: any) {
            if (!component) return;
            const { items, command } = props;
            let index = 0;
            component.innerHTML = items
              .map((i: SlashItem, idx: number) => (
                `<div data-idx="${idx}" class="flex items-start gap-2 p-2 rounded-lg hover:bg-gray-100 cursor-pointer ${idx===0?"bg-gray-50": ""}">
                   <div class="mt-0.5">${iconHTML(i.icon)}</div>
                   <div>
                     <div class="font-medium">${i.title}</div>
                     ${i.subtitle ? `<div class="text-xs text-gray-500">${i.subtitle}</div>` : ""}
                   </div>
                 </div>`
              ))
              .join("");

            const children = Array.from(component.querySelectorAll("[data-idx]")) as HTMLDivElement[];
            const select = (i: number) => {
              index = (i + children.length) % children.length;
              children.forEach((c, j) => c.classList.toggle("bg-gray-100", j === index));
            };
            children.forEach((el, i) => {
              el.addEventListener("mouseenter", () => select(i));
              el.addEventListener("click", () => {
                command(items[index]);
              });
            });

            onKeyDown = ({ event }: any) => {
              if (event.key === "ArrowDown") { select(index + 1); return true; }
              if (event.key === "ArrowUp") { select(index - 1); return true; }
              if (event.key === "Enter") { command(items[index]); return true; }
              return false;
            };
          }

          function keydown(props: any) { return onKeyDown?.(props) ?? false; }
        },
        command: ({ editor, range, props }: any) => {
          if ((props as SlashItem)?.command) {
            (props as SlashItem).command({ editor, range });
          }
        },
      });

      return [plugin];
    },
  });

function iconHTML(name: keyof typeof Ic) {
  const svg: Record<string, string> = {
    H: '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M5 4h2v6h10V4h2v16h-2v-8H7v8H5z"/></svg>',
    List: '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M4 6h2v2H4zm4 0h12v2H8zM4 11h2v2H4zm4 0h12v2H8zM4 16h2v2H4zm4 0h12v2H8z"/></svg>',
    Ordered: '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M6 5h2v2H6V5zm0 5h2v2H6v-2zm0 5h2v2H6v-2zM9 6h12v2H9V6zm0 5h12v2H9v-2zm0 5h12v2H9v-2z"/></svg>',
    Task: '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M9 16l-3-3 1.5-1.5L9 13l7.5-7.5L18 7z"/></svg>',
    Quote: '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M7 6h6v6H9v6H5V8a2 2 0 0 1 2-2zm10 0h6v6h-4v6h-4V8a2 2 0 0 1 2-2z"/></svg>',
    Code: '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M9 18l-5-6 5-6 1.5 1.3L7.1 12l3.4 4.7zM15 6l5 6-5 6-1.5-1.3L16.9 12 13.5 7.3z"/></svg>',
    HR: '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><rect x="3" y="11" width="18" height="2"/></svg>',
    Table: '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M3 5h18v14H3zm2 2v3h5V7zm7 0v3h7V7zM5 12v5h5v-5zm7 0v5h7v-5z"/></svg>',
    Image: '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M5 5h14a2 2 0 0 1 2 2v10H3V7a2 2 0 0 1 2-2zm2 9l3-4 3 4 2-3 4 5H7z"/></svg>',
  };
  return svg[name] ?? svg.H;
}

// --- Props ---
export type ProEditorProps = {
  className?: string;
  initialContent?: string; // HTML string
  value?: string;
  onChange?: (html: string, json: any) => void; // debounced onUpdate
  readOnly?: boolean;
  maxChars?: number; // for CharacterCount
  uploadImage?: (file: File) => Promise<string>; // return a public URL
  storageKey?: string; // localStorage persistence key
  dark?: boolean; // dark mode
};

// --- Toolbar button ---
const Btn: React.FC<{
  active?: boolean;
  disabled?: boolean;
  title?: string;
  onClick?: () => void;
  children: React.ReactNode;
}> = ({ active, disabled, title, onClick, children }) => (
  <button
    type="button"
    title={title}
    aria-pressed={!!active}
    disabled={disabled}
    onMouseDown={(e) => e.preventDefault()}
    onClick={onClick}
    className={`inline-flex items-center gap-1 px-2 py-1 rounded-md border text-sm transition ${
      active ? "bg-gray-900 text-white border-transparent" : "bg-white text-gray-700 border-gray-200"
    } disabled:opacity-50 disabled:cursor-not-allowed`}
  >
    {children}
  </button>
);

// --- Main component ---
const ProEditor: React.FC<ProEditorProps> = ({
  className,
  initialContent = ``,
  value,
  onChange,
  readOnly = false,
  maxChars = '∞',
  uploadImage,
  storageKey,
  dark = false,
}) => {
  const [mounted, setMounted] = useState(false);
  const saveTimer = useRef<number | null>(null);

  // cleanup timer on unmount
  useEffect(() => {
    return () => {
      window.clearTimeout(saveTimer.current ?? undefined);
    };
  }, []);

  useEffect(() => setMounted(true), []);

  const editor = useEditor({
    immediatelyRender: false,
    editable: !readOnly,
    extensions: [
      StarterKit.configure({
        codeBlock: false, // we use CodeBlockLowlight
      }),
      Underline,
      Link.configure({ openOnClick: true, autolink: true, HTMLAttributes: { rel: "noopener noreferrer nofollow" } }),
      Image.configure({ allowBase64: false }),
      Highlight,
      TextStyle,
      Color,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Dropcursor,
      Gapcursor,
      CharacterCount.configure({ }),
      CodeBlockLowlight.configure({ lowlight }),
      Placeholder.configure({ placeholder: "Type / for commands…" }),
      SlashCommand(makeSlashItems(uploadImage)),
    ],
    // If parent passes `value` we start with that (controlled mode), otherwise initialContent
    content: typeof value === "string" ? value : initialContent,
    editorProps: {
      attributes: {
        class: `prose max-w-none prose-sm sm:prose-base ${dark ? "prose-invert" : ""} focus:outline-none`,
      },
      handlePaste(view, event: ClipboardEvent) {
        const file = (event.clipboardData?.files ?? [])[0];
        if (file && /^image\//.test(file.type) && uploadImage) {
          event.preventDefault();
          uploadImage(file).then((url) => {
            view.dispatch(view.state.tr.insert(view.state.selection.from, view.state.schema.nodes.image.create({ src: url, alt: file.name })));
          });
          return true;
        }
        return false;
      },
      handleDrop(view, event: DragEvent) {
        const file = (event.dataTransfer?.files ?? [])[0];
        if (file && /^image\//.test(file.type) && uploadImage) {
          event.preventDefault();
          uploadImage(file).then((url) => {
            view.dispatch(view.state.tr.insert(view.state.selection.from, view.state.schema.nodes.image.create({ src: url, alt: file.name })));
          });
          return true;
        }
        return false;
      },
    },
    autofocus: !readOnly,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      let json: any = null;
      try { json = editor.getJSON(); } catch {}
      // Debounce change callback (user edits)
      window.clearTimeout(saveTimer.current ?? undefined);
      saveTimer.current = window.setTimeout(() => onChange?.(html, json), 300) as unknown as number;

      // Local persistence only when uncontrolled (no parent `value`)
      if (!value && storageKey) {
        try { localStorage.setItem(storageKey, html); } catch {}
      }
    },
    // in useEditor config (onCreate)
    onCreate: ({ editor }) => {
      // If parent is controlling the editor (value provided), don't load localStorage
      if (typeof value === "string") return;

      if (storageKey) {
        try {
          const saved = localStorage.getItem(storageKey);
          if (saved) {
            editor.commands.setContent(saved, false as any);
          }
        } catch {}
      }
    },
  });

  
  const setLink = useCallback(() => {
    if (!editor) return;
    const previous = editor.getAttributes("link").href;
    const href = window.prompt("Enter URL", previous || "https://");
    if (href === null) return; // cancel
    if (href === "") return editor.chain().focus().extendMarkRange("link").unsetLink().run();
    editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
  }, [editor]);

  const addImageByUrl = useCallback(() => {
    if (!editor) return;
    const url = window.prompt("Image URL");
    if (!url) return;
    editor.chain().focus().setImage({ src: url }).run();
  }, [editor]);

  if (!mounted) {
    return (
      <div className="w-full p-6 rounded-lg border bg-white/60 text-sm text-gray-500">Loading editor…</div>
    );
  }
  if (!editor) {
    return (
      <div className="w-full p-6 rounded-lg border bg-white/60 text-sm text-red-600">Editor failed to initialize.</div>
    );
  }

  const is = (name: string, attrs?: any) => editor.isActive(name as any, attrs);

  return (
    <div className={`relative w-full ${className ?? ""}`}>
      {/* Floating toolbar on empty paragraph */}
      <FloatingMenu
        editor={editor}
        {...({ tippyOptions: { placement: "top", duration: 100, appendTo: () => document.body } } as any)}
        className="flex gap-2 p-2 rounded-xl shadow-lg bg-white border z-40"
      >
        <Btn title="H1" active={is("heading", { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}><Ic.H/>1</Btn>
        <Btn title="H2" active={is("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Ic.H/>2</Btn>
        <Btn title="Bullet List" active={is("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}><Ic.List/></Btn>
        <Btn title="Task List" active={is("taskList")} onClick={() => editor.chain().focus().toggleTaskList().run()}><Ic.Task/></Btn>
        <Btn title="Quote" active={is("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}><Ic.Quote/></Btn>
        <Btn title="Divider" onClick={() => editor.chain().focus().setHorizontalRule().run()}><Ic.HR/></Btn>
      </FloatingMenu>

      {/* Select text bubble menu */}
      <BubbleMenu
        editor={editor}
        {...({ tippyOptions: { placement: "top", duration: 100, appendTo: () => document.body } } as any)}
        className="flex gap-1 p-1 rounded-xl shadow-lg bg-white border z-40"
      >
        <Btn title="Bold (Mod+B)" active={is("bold")} onClick={() => editor.chain().focus().toggleBold().run()}><Ic.Bold/></Btn>
        <Btn title="Italic (Mod+I)" active={is("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}><Ic.Italic/></Btn>
        <Btn title="Underline" active={is("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}><Ic.Underline/></Btn>
        <Btn title="Strike" active={is("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}><Ic.Strike/></Btn>
        <Btn title="Code" active={is("code")} onClick={() => editor.chain().focus().toggleCode().run()}><Ic.Code/></Btn>
        <Btn title="Link" active={is("link")} onClick={setLink}><Ic.Link/></Btn>
      </BubbleMenu>

      {/* Static top toolbar for power controls */}
      <div className="sticky top-0 z-0 -mt-2 mb-2 flex flex-wrap gap-2 p-2 rounded-xl bg-white/90 backdrop-blur border">
        <Btn title="Undo" onClick={() => editor.chain().focus().undo().run()}><Ic.Undo/>Undo</Btn>
        <Btn title="Redo" onClick={() => editor.chain().focus().redo().run()}><Ic.Redo/>Redo</Btn>
        <div className="w-px h-6 bg-gray-200 mx-1"/>
        <Btn title="Left" active={is("textAlign", { textAlign: "left" })} onClick={() => editor.chain().focus().setTextAlign("left").run()}><Ic.AlignLeft/></Btn>
        <Btn title="Center" active={is("textAlign", { textAlign: "center" })} onClick={() => editor.chain().focus().setTextAlign("center").run()}><Ic.AlignCenter/></Btn>
        <Btn title="Right" active={is("textAlign", { textAlign: "right" })} onClick={() => editor.chain().focus().setTextAlign("right").run()}><Ic.AlignRight/></Btn>
        <div className="w-px h-6 bg-gray-200 mx-1"/>
        <Btn title="Bullet List" active={is("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}><Ic.List/></Btn>
        <Btn title="Ordered List" active={is("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}><Ic.Ordered/></Btn>
        <Btn title="Task List" active={is("taskList")} onClick={() => editor.chain().focus().toggleTaskList().run()}><Ic.Task/></Btn>
        <div className="w-px h-6 bg-gray-200 mx-1"/>
        <Btn title="Code block" active={is("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()}><Ic.Code/></Btn>
        <Btn title="Quote" active={is("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}><Ic.Quote/></Btn>
        <Btn title="Image URL" onClick={addImageByUrl}><Ic.Image/></Btn>
        {uploadImage ? (
          <Btn title="Upload image" onClick={() => makeSlashItems(uploadImage).find(i=>i.title.startsWith("Image"))!.command({ editor, range: editor.state.selection as any })}><Ic.Image/>Upload</Btn>
        ) : null}
        <div className="ml-auto flex items-center gap-2 text-xs text-gray-500">
          <span>{editor.storage.characterCount.characters()} / {maxChars}</span>
          <span>•</span>
          <span>{editor.storage.characterCount.words()} words</span>
        </div>
      </div>

      <div className={`p-4 border rounded-xl ${dark ? "bg-neutral-900 text-neutral-100" : "bg-white"}`}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default ProEditor;
