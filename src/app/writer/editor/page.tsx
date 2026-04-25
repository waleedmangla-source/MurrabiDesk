"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, CloudUpload, Loader2, Bold, Italic, Underline as UnderlineIcon, List, ListOrdered, Quote, Undo, Redo, AlignLeft, AlignCenter, AlignRight, FileDown, FileText, Mail, Send } from 'lucide-react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { TEMPLATES } from '../templates';
import { GoogleSyncService } from '@/lib/google-sync-service';
function EditorToolbar({ editor }: { editor: any }) {
  if (!editor) return null;
  const MenuButton = ({ onClick, isActive, children, title }: any) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-2 rounded-lg transition-all ${
        isActive
          ? "bg-[var(--accent-main)] text-white shadow-md"
          : "text-[var(--text-dim)] hover:bg-white/10 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
  return (
    <div className="flex flex-wrap items-center justify-center gap-1 p-2 border-b border-white/5 bg-black/40 backdrop-blur-md sticky top-[72px] z-40">
       <MenuButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive("heading", { level: 1 })} title="Heading 1">H1</MenuButton>
       <MenuButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive("heading", { level: 2 })} title="Heading 2">H2</MenuButton>
       <div className="w-px h-6 bg-white/10 mx-2" />
       <MenuButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive("bold")} title="Bold"><Bold size={16} /></MenuButton>
       <MenuButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive("italic")} title="Italic"><Italic size={16} /></MenuButton>
       <MenuButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive("underline")} title="Underline"><UnderlineIcon size={16} /></MenuButton>
       <div className="w-px h-6 bg-white/10 mx-2" />
       <MenuButton onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })} title="Align Left"><AlignLeft size={16} /></MenuButton>
       <MenuButton onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })} title="Align Center"><AlignCenter size={16} /></MenuButton>
       <MenuButton onClick={() => editor.chain().focus().setTextAlign('right').run()} isActive={editor.isActive({ textAlign: 'right' })} title="Align Right"><AlignRight size={16} /></MenuButton>
       <div className="w-px h-6 bg-white/10 mx-2" />
       <MenuButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive("bulletList")} title="Bullet List"><List size={16} /></MenuButton>
       <MenuButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive("orderedList")} title="Ordered List"><ListOrdered size={16} /></MenuButton>
       <MenuButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive("blockquote")} title="Quote"><Quote size={16} /></MenuButton>
       <div className="w-px h-6 bg-white/10 mx-2" />
       <MenuButton onClick={() => editor.chain().focus().undo().run()} title="Undo"><Undo size={16} /></MenuButton>
       <MenuButton onClick={() => editor.chain().focus().redo().run()} title="Redo"><Redo size={16} /></MenuButton>
    </div>
  );
}
function EditorImpl() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get('templateId') || 'blank';
  const [title, setTitle] = useState("Untitled Document");
  const [isPublishing, setIsPublishing] = useState(false);
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [targetEmail, setTargetEmail] = useState("");
  const [isEmailing, setIsEmailing] = useState(false);
  useEffect(() => {
    const template = TEMPLATES.find(t => t.id === templateId);
    if (template) {
      if (template.title !== "Blank Document") setTitle(`${template.title} - Draft`);
    }
  }, [templateId]);
  const initialContent = TEMPLATES.find(t => t.id === templateId)?.templateText || "";
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: { keepMarks: true, keepAttributes: false },
        orderedList: { keepMarks: true, keepAttributes: false },
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: "prose prose-sm md:prose-base lg:prose-lg max-w-none focus:outline-none min-h-[1056px] text-black",
      },
    },
  });
  const handlePublish = async () => {
    if (!editor) return;
    try {
      setIsPublishing(true);
      const syncService = new GoogleSyncService();
      const htmlText = editor.getHTML();
      const res = await syncService.createGoogleDoc(title, htmlText);
      if (res && res.documentId) {
        import('@/lib/sync/bridge').then(({ liquid }) => {
          liquid.invoke('open-external', `https://docs.google.com/document/d/${res.documentId}/edit`);
        }).catch(() => {
          window.open(`https://docs.google.com/document/d/${res.documentId}/edit`, '_blank');
        });
      } else {
        throw new Error(res?.error || "Failed to publish document.");
      }
    } catch (err: any) {
      alert("Error publishing: " + (err.message || "Unknown error"));
    } finally {
      setIsPublishing(false);
    }
  };
  const handleExport = async (type: 'pdf' | 'docx') => {
    if (!editor) return;
    try {
      setIsExporting(type);
      const htmlText = editor.getHTML();
      const { liquid } = await import('@/lib/sync/bridge');
      const res = await liquid.invoke('export-doc', {
        title,
        templateText: htmlText,
        type
      });
      if (!res?.success) {
        if (res?.error !== 'Cancelled') alert("Error exporting: " + (res?.error || "Unknown error"));
      }
    } catch (err: any) {
      alert("Error exporting: " + (err.message || "Unknown error"));
    } finally {
      setIsExporting(null);
    }
  };
  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editor || !targetEmail) return;
    if (!targetEmail.includes('@')) return alert("Please enter a valid email address.");
    try {
      setIsEmailing(true);
      const htmlText = editor.getHTML();
      const { liquid } = await import('@/lib/sync/bridge');
      const res = await liquid.invoke('email-doc', {
        title,
        templateText: htmlText,
        email: targetEmail
      });
      if (res?.success) {
        setEmailModalOpen(false);
        setTargetEmail("");
      } else {
        throw new Error(res?.error || "Failed to send email");
      }
    } catch (err: any) {
      alert("Error sending email: " + (err.message || "Unknown error"));
    } finally {
      setIsEmailing(false);
    }
  };
  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-black/20 relative">
      {}
      {emailModalOpen && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#111] border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl flex flex-col gap-6 scale-in-center">
            <div>
              <h2 className="text-2xl font-black text-white italic tracking-tight">Quick Compose PDF</h2>
              <p className="text-[var(--text-dim)] text-sm mt-1">Send this document directly as a PDF attachment.</p>
            </div>
            <form onSubmit={handleEmail} className="flex flex-col gap-4">
              <input
                type="email"
                value={targetEmail}
                onChange={(e) => setTargetEmail(e.target.value)}
                placeholder="recipient@example.com"
                required
                className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--accent-main)] transition-colors"
              />
              <div className="flex items-center gap-3 justify-end mt-4">
                <button 
                  type="button" 
                  onClick={() => setEmailModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-white/60 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isEmailing || !targetEmail}
                  className="px-6 py-2 bg-[var(--accent-main)] hover:bg-[var(--accent-hover)] text-white rounded-xl font-bold tracking-wide transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {isEmailing ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  Send Email
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {}
      <div className="h-[72px] flex items-center justify-between px-6 border-b border-white/10 bg-black/40 backdrop-blur-xl shrink-0 z-50">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push('/writer')}
            className="p-2 rounded-full hover:bg-white/10 transition-colors text-[var(--text-dim)] hover:text-white"
          >
            <ChevronLeft size={24} />
          </button>
          <input 
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-transparent border-b border-transparent hover:border-white/20 focus:border-[var(--accent-main)] focus:outline-none text-2xl font-black italic tracking-tighter text-white px-2 py-1 transition-colors w-64 md:w-96"
            placeholder="Document Title"
          />
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleExport('pdf')}
            disabled={isExporting !== null}
            title="Download PDF"
            className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all disabled:opacity-50"
          >
            {isExporting === 'pdf' ? <Loader2 size={18} className="animate-spin" /> : <FileDown size={18} />}
          </button>
          <button
            onClick={() => handleExport('docx')}
            disabled={isExporting !== null}
            title="Download DOCX"
            className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all disabled:opacity-50"
          >
            {isExporting === 'docx' ? <Loader2 size={18} className="animate-spin" /> : <FileText size={18} />}
          </button>
          <button
            onClick={() => setEmailModalOpen(true)}
            disabled={isExporting !== null || isEmailing}
            title="Send via Email"
            className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all disabled:opacity-50 mr-2"
          >
            <Mail size={18} />
          </button>
          <button
            onClick={handlePublish}
            disabled={isPublishing}
            className="flex items-center gap-2 bg-[var(--accent-main)] hover:bg-[var(--accent-hover)] text-white px-6 py-2.5 rounded-full font-bold tracking-wide transition-all shadow-[0_0_20px_var(--accent-glow)] active:scale-95 disabled:opacity-50"
          >
            {isPublishing ? <Loader2 size={18} className="animate-spin" /> : <CloudUpload size={18} />}
            <span>PUBLISH TO DOCS</span>
          </button>
        </div>
      </div>
      {}
      <EditorToolbar editor={editor} />
      {}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-8 flex justify-center pb-32">
         <div className="w-full max-w-[816px] min-h-[1056px] bg-white rounded-lg shadow-2xl p-12 lg:p-16 text-black">
           <EditorContent editor={editor} />
         </div>
      </div>
    </div>
  );
}
export default function NativeDocEditor() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center h-screen"><Loader2 className="animate-spin text-[var(--accent-main)]" size={32} /></div>}>
      <EditorImpl />
    </Suspense>
  );
}
