import React, { useState, useEffect } from 'react';
import { Loader2, BookOpen, Search, Info, ChevronLeft, ChevronRight, Wand2 } from 'lucide-react';
import { clsx } from 'clsx';

export default function RuhaniKhazainReader() {
  const [volumes, setVolumes] = useState<number[]>([]);
  const [selectedVolume, setSelectedVolume] = useState<number | null>(null);
  const [pages, setPages] = useState<any[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [aiLoading, setAiLoading] = useState(false);
  const [aiData, setAiData] = useState<{ summary: string, hardWords: {word: string, meaning: string}[] } | null>(null);
  
  useEffect(() => {
    // We know we processed volumes 1-23. Let's list them.
    const vols = Array.from({length: 23}, (_, i) => i + 1);
    setVolumes(vols);
    setSelectedVolume(1);
  }, []);

  useEffect(() => {
    if (selectedVolume === null) return;
    
    const fetchVolume = async () => {
      setLoading(true);
      setError(null);
      setAiData(null);
      try {
        const res = await fetch(`/ruhani-khazain/volume_${selectedVolume}.json`);
        if (!res.ok) throw new Error('Volume not found');
        const data = await res.json();
        setPages(data.pages || []);
        setCurrentPageIndex(0);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchVolume();
  }, [selectedVolume]);

  const currentPage = pages[currentPageIndex];

  const handleAnalyze = async () => {
    if (!currentPage?.text) return;
    setAiLoading(true);
    setAiData(null);
    try {
      const res = await fetch('/api/beta/khazain-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: currentPage.text })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAiData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  // Helper to render text with tooltips for hard words
  const renderText = (text: string) => {
    if (!aiData?.hardWords || aiData.hardWords.length === 0) {
      return <span>{text}</span>;
    }
    
    let rendered = text;
    // VERY simple string replacement (has flaws with sub-word matching but works for prototype)
    // A better approach would be regex word boundaries, but Urdu word boundaries can be tricky.
    
    // Sort words by length descending so longer words get replaced first
    const sortedWords = [...aiData.hardWords].sort((a, b) => b.word.length - a.word.length);
    
    // Using a simple split/map to avoid regex issues with Arabic/Urdu chars
    // This is a naive approach, let's refine:
    
    // For now, we'll just return it as a single element, but in React we need an array of elements.
    // Let's do a safer pass:
    let elements: React.ReactNode[] = [text];
    
    sortedWords.forEach(({ word, meaning }) => {
      const newElements: React.ReactNode[] = [];
      elements.forEach(element => {
        if (typeof element === 'string') {
          const parts = element.split(word);
          parts.forEach((part, i) => {
            newElements.push(part);
            if (i < parts.length - 1) {
              newElements.push(
                <span key={`${word}-${i}`} className="group relative inline-block cursor-help text-indigo-700 font-bold border-b border-indigo-700/50 hover:bg-indigo-100 rounded px-1 transition-colors">
                  {word}
                  <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs bg-gray-900 text-white text-xs p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity z-50">
                    {meaning}
                  </span>
                </span>
              );
            }
          });
        } else {
          newElements.push(element);
        }
      });
      elements = newElements;
    });

    return <>{elements.map((el, i) => <React.Fragment key={i}>{el}</React.Fragment>)}</>;
  };

  return (
    <div className="flex w-full h-full text-white bg-black/40 backdrop-blur-xl">
      {/* Left Sidebar - Volume Selection */}
      <div className="w-64 border-r border-white/10 flex flex-col h-full bg-black/20">
        <div className="p-4 border-b border-white/10 flex items-center gap-2">
          <BookOpen size={18} className="text-indigo-400" />
          <h3 className="font-bold">Ruhani Khazain</h3>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {volumes.map(vol => (
            <button
              key={vol}
              onClick={() => setSelectedVolume(vol)}
              className={clsx(
                "w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                selectedVolume === vol 
                  ? "bg-indigo-500/20 text-indigo-300" 
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              )}
            >
              Volume {vol}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content - Reader */}
      <div className="flex-1 flex flex-col h-full">
        {/* Toolbar */}
        <div className="h-14 border-b border-white/10 flex items-center justify-between px-6 bg-black/20">
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold text-gray-300">
              {loading ? "Loading..." : `Volume ${selectedVolume}`}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => { setCurrentPageIndex(Math.max(0, currentPageIndex - 1)); setAiData(null); }}
              disabled={currentPageIndex === 0 || loading}
              className="p-2 text-gray-400 hover:text-white disabled:opacity-50"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-sm text-gray-400 font-mono">
              Page {currentPage?.page_num || (currentPageIndex + 1)} / {pages.length}
            </span>
            <button 
              onClick={() => { setCurrentPageIndex(Math.min(pages.length - 1, currentPageIndex + 1)); setAiData(null); }}
              disabled={currentPageIndex === pages.length - 1 || loading}
              className="p-2 text-gray-400 hover:text-white disabled:opacity-50"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Text Area */}
        <div className="flex-1 overflow-y-auto p-8 relative bg-black/10">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
          ) : error ? (
            <div className="text-red-400 text-center mt-10">{error}</div>
          ) : currentPage ? (
            <div className="max-w-3xl mx-auto bg-[#fbf8f1] shadow-2xl rounded-sm p-12 min-h-full border border-[#e8e2d2]">
              <div 
                className="text-2xl leading-[2.5] font-serif text-justify text-black whitespace-pre-wrap select-text" 
                dir="rtl"
                style={{ fontFamily: "'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', serif" }}
              >
                {renderText(currentPage.text)}
              </div>
            </div>
          ) : (
            <div className="text-gray-500 text-center mt-10">Select a volume to begin reading</div>
          )}
        </div>
      </div>

      {/* Right Sidebar - AI Panel */}
      <div className="w-80 border-l border-white/10 bg-black/20 flex flex-col">
        <div className="p-4 border-b border-white/10 flex items-center gap-2">
          <Wand2 size={18} className="text-purple-400" />
          <h3 className="font-bold">AI Assistant</h3>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          <button
            onClick={handleAnalyze}
            disabled={aiLoading || !currentPage}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-all"
          >
            {aiLoading ? <Loader2 size={18} className="animate-spin" /> : <Wand2 size={18} />}
            {aiLoading ? "Analyzing..." : "Analyze Current Page"}
          </button>

          {aiData && (
            <div className="space-y-6 mt-4">
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-purple-300 flex items-center gap-2">
                  <Info size={16} /> Summary
                </h4>
                <div className="text-sm text-gray-300 leading-relaxed bg-white/5 p-4 rounded-xl border border-white/10">
                  {aiData.summary}
                </div>
              </div>
              
              {aiData.hardWords && aiData.hardWords.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-indigo-300">Hard Words Found ({aiData.hardWords.length})</h4>
                  <div className="space-y-2">
                    {aiData.hardWords.map((item, idx) => (
                      <div key={idx} className="bg-white/5 p-3 rounded-lg border border-white/5 text-right flex flex-col items-end gap-1" dir="rtl">
                        <span className="font-bold text-indigo-400 text-lg">{item.word}</span>
                        <span className="text-sm text-gray-300">{item.meaning}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
