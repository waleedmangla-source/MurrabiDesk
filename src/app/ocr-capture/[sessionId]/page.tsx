"use client";
import React, { useState, useEffect } from "react";
import { Camera, Upload, CheckCircle2, Loader2, AlertCircle } from "lucide-react";

export default function MobileOcrCapture({ params }: { params: { sessionId: string } }) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState("");
  const sessionId = params.sessionId;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setStatus('idle');
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setStatus('uploading');
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await fetch(`/api/ocr/${sessionId}/upload`, {
        method: 'POST',
        body: formData,
      });
      
      const data = await res.json();
      if (data.success) {
        setStatus('success');
      } else {
        setStatus('error');
        setErrorMsg(data.error || "Upload failed");
      }
    } catch (e: any) {
      setStatus('error');
      setErrorMsg("Network error during upload");
    }
  };

  // Keep checking status if it's processing
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (status === 'uploading' || status === 'processing') {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`/api/ocr/${sessionId}/status`);
          const data = await res.json();
          if (data.success) {
            if (data.status === 'completed') {
              setStatus('success');
            } else if (data.status === 'error') {
              setStatus('error');
              setErrorMsg(data.textResult || "OCR processing failed");
            }
          }
        } catch (e) {
          // ignore network errors on polling
        }
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [status, sessionId]);

  return (
    <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center justify-center font-sans">
      <div className="w-full max-w-md space-y-8 text-center">
        <div>
          <h1 className="text-3xl font-black mb-2 tracking-tight">Murabbi Lens</h1>
          <p className="text-sm opacity-50 uppercase tracking-widest font-bold">Document Scanner</p>
        </div>

        {status === 'success' ? (
          <div className="p-8 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex flex-col items-center space-y-4 animate-in fade-in zoom-in duration-500">
            <CheckCircle2 size={64} />
            <h2 className="text-xl font-bold">Scan Complete!</h2>
            <p className="text-sm opacity-80 text-center">
              The document has been digitized. You can now view the text on your desktop tab.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {!preview ? (
              <label className="flex flex-col items-center justify-center w-full aspect-[3/4] max-h-[60vh] border-2 border-dashed border-white/20 rounded-[32px] hover:border-white/40 hover:bg-white/5 transition-all cursor-pointer">
                <Camera size={48} className="mb-4 opacity-50" />
                <span className="font-bold tracking-widest uppercase text-sm opacity-80">Tap to Scan</span>
                <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
              </label>
            ) : (
              <div className="relative w-full aspect-[3/4] max-h-[60vh] rounded-[32px] overflow-hidden border border-white/10 shadow-2xl">
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                {(status === 'uploading' || status === 'processing') && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                    <Loader2 size={48} className="animate-spin mb-4 text-[var(--accent-main, #3b82f6)]" />
                    <span className="font-bold tracking-widest uppercase text-sm animate-pulse">
                      {status === 'uploading' ? 'Uploading...' : 'Extracting Text...'}
                    </span>
                  </div>
                )}
              </div>
            )}

            {errorMsg && status === 'error' && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center gap-3 text-sm font-bold">
                <AlertCircle size={18} />
                {errorMsg}
              </div>
            )}

            {preview && status === 'idle' && (
              <div className="flex gap-4">
                <label className="flex-1 py-4 px-6 rounded-2xl bg-white/10 font-bold uppercase tracking-widest text-xs cursor-pointer hover:bg-white/20 transition-all text-center">
                  Retake
                  <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
                </label>
                <button 
                  onClick={handleUpload}
                  className="flex-1 py-4 px-6 rounded-2xl bg-blue-600 font-bold uppercase tracking-widest text-xs hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                >
                  <Upload size={16} />
                  Upload
                </button>
              </div>
            )}
            
            {status === 'error' && (
              <button 
                  onClick={() => setStatus('idle')}
                  className="w-full py-4 px-6 rounded-2xl bg-white/10 font-bold uppercase tracking-widest text-xs hover:bg-white/20 transition-all text-center"
                >
                  Try Again
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
