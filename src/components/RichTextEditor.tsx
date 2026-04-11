"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { 
  Bold, Italic, Underline as UnderlineIcon, 
  List, ListOrdered, Quote, Undo, Redo 
} from "lucide-react";
import clsx from "clsx";

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

const MenuButton = ({ 
  onClick, 
  isActive = false, 
  children, 
  title 
}: { 
  onClick: () => void; 
  isActive?: boolean; 
  children: React.ReactNode; 
  title: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className={clsx(
      "p-2 rounded-lg transition-all",
      isActive 
        ? "bg-[var(--accent-main)] text-white shadow-md shadow-accent-soft" 
        : "text-[var(--text-dim)] hover:bg-white/5 hover:text-[var(--foreground)]"
    )}
  >
    {children}
  </button>
);

export default function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: { keepMarks: true, keepAttributes: false },
        orderedList: { keepMarks: true, keepAttributes: false },
      }),
      Underline,
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm prose-invert max-w-none focus:outline-none min-h-[150px] px-5 py-4 text-sm text-[var(--foreground)] selection:bg-[var(--accent-main)]/30",
      },
    },
  });

  if (!editor) return null;

  return (
    <div className="flex flex-col border border-white/5 rounded-xl overflow-hidden bg-black/10">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-1 border-b border-white/5 bg-white/5">
        <MenuButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
          title="Bold"
        >
          <Bold size={16} />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
          title="Italic"
        >
          <Italic size={16} />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive("underline")}
          title="Underline"
        >
          <UnderlineIcon size={16} />
        </MenuButton>
        
        <div className="w-px h-6 bg-white/10 mx-1" />

        <MenuButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive("bulletList")}
          title="Bullet List"
        >
          <List size={16} />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive("orderedList")}
          title="Ordered List"
        >
          <ListOrdered size={16} />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive("blockquote")}
          title="Quote"
        >
          <Quote size={16} />
        </MenuButton>

        <div className="flex-1" />

        <MenuButton
          onClick={() => editor.chain().focus().undo().run()}
          title="Undo"
        >
          <Undo size={16} />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().redo().run()}
          title="Redo"
        >
          <Redo size={16} />
        </MenuButton>
      </div>

      {/* Editor Surface */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <EditorContent editor={editor} />
      </div>

      <style jsx global>{`
        .prose p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: var(--text-dim);
          pointer-events: none;
          height: 0;
          opacity: 0.5;
        }
        .prose ul, .prose ol {
          padding-left: 1.5rem;
          margin: 1rem 0;
        }
        .prose blockquote {
          border-left: 3px solid var(--accent-main);
          padding-left: 1rem;
          margin: 1rem 0;
          color: var(--text-dim);
          font-style: italic;
        }
      `}</style>
    </div>
  );
}
