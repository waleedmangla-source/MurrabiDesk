"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Mic, MicOff, Volume2, X, Sparkles, Navigation, ArrowRight, Activity, Terminal } from "lucide-react";
import { clsx } from "clsx";

export default function JarvisHUD() {
  const router = useRouter();
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [jarvisResponse, setJarvisResponse] = useState<string | null>(null);
  const [lastAction, setLastAction] = useState<{ type: string; path?: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // ── Pre-load Voices ───────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      synthRef.current = window.speechSynthesis;
      synthRef.current.getVoices();
      synthRef.current.onvoiceschanged = () => {
        synthRef.current?.getVoices();
      };
    }
  }, []);

  // ── Speech Recognition Setup ──────────────────────────────────────────────
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const reco = new SpeechRecognition();
        reco.continuous = false;
        reco.interimResults = true;
        reco.lang = "en-GB"; // Target British English

        reco.onresult = (event: any) => {
          let text = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            text += event.results[i][0].transcript;
          }
          setTranscript(text);

          if (event.results[0].isFinal) {
            setIsListening(false);
            executeJarvisCommand(text);
          }
        };

        reco.onerror = (e: any) => {
          console.warn("[J.A.R.V.I.S. ASR] Error:", e.error);
          setIsListening(false);
        };

        reco.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = reco;
      }
    }
  }, [pathname]);

  // ── Global Keyboard Shortcut: Cmd+J or Ctrl+J ─────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "j") {
        e.preventDefault();
        setIsOpen(true);
        toggleListening();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isListening]);

  // ── Voice Synthesis (J.A.R.V.I.S. UK Baritone) ───────────────────────────
  const speakJarvis = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    const voices = window.speechSynthesis.getVoices();
    const femaleExcludes = [
      "serena", "kate", "victoria", "fiona", "libby", "sonia", "mia",
      "flo", "sandy", "shelley", "grandma", "karen", "samantha"
    ];

    const jarvisVoice =
      voices.find((v) => {
        const nameLower = v.name.toLowerCase();
        return nameLower.includes("daniel") || nameLower.includes("google uk english male");
      }) ||
      voices.find((v) => {
        const nameLower = v.name.toLowerCase();
        const langLower = v.lang.toLowerCase().replace("_", "-");
        const isUK = langLower.startsWith("en-gb") || nameLower.includes("uk") || nameLower.includes("british");
        const isFemale = femaleExcludes.some((f) => nameLower.includes(f));
        return isUK && !isFemale;
      }) ||
      voices.find((v) => v.lang.toLowerCase().replace("_", "-").startsWith("en-gb")) ||
      voices.find((v) => v.name.includes("Alex") || v.name.includes("Oliver"));

    if (jarvisVoice) {
      utterance.voice = jarvisVoice;
    }

    utterance.rate = 0.94; // Calm, measured British pacing
    utterance.pitch = 0.85; // Deep baritone tone
    window.speechSynthesis.speak(utterance);
  };

  // ── Execute Command via Backend ───────────────────────────────────────────
  const executeJarvisCommand = async (cmdText: string) => {
    if (!cmdText.trim()) return;

    setIsProcessing(true);
    setJarvisResponse(null);

    try {
      const res = await fetch("/api/jarvis/command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          command: cmdText,
          currentPath: pathname
        })
      });

      const data = await res.json();
      setIsProcessing(false);

      if (data.text) {
        setJarvisResponse(data.text);
        speakJarvis(data.text);
      }

      // Handle autonomous action (e.g. Navigation)
      if (data.action) {
        setLastAction(data.action);
        if (data.action.type === "navigate" && data.action.path) {
          setTimeout(() => {
            router.push(data.action.path);
          }, 800); // Allow speech to initiate before smooth page transition
        }
      }
    } catch (err: any) {
      setIsProcessing(false);
      const errMsg = "Apologies, sir. My connection to core subsystems was temporarily interrupted.";
      setJarvisResponse(errMsg);
      speakJarvis(errMsg);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setTranscript("");
      setJarvisResponse(null);
      setLastAction(null);
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (err) {
        console.warn("[J.A.R.V.I.S.] Mic start exception:", err);
      }
    }
  };

  return (
    <>
      {/* ── Collapsed Floating Arc-Reactor Trigger ── */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            toggleListening();
          }}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-full bg-slate-900/90 text-cyan-400 border border-cyan-500/40 shadow-2xl backdrop-blur-xl hover:scale-105 active:scale-95 transition-all group hover:border-cyan-400"
          title="Summon J.A.R.V.I.S. (Cmd+J)"
        >
          {/* Arc Reactor Core Glow */}
          <div className="relative flex items-center justify-center">
            <span className="absolute w-6 h-6 rounded-full bg-cyan-400/30 animate-ping" />
            <div className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_12px_#22d3ee]" />
          </div>
          <span className="text-xs font-black tracking-widest uppercase text-white/90">
            J.A.R.V.I.S.
          </span>
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/10 text-white/50 group-hover:text-cyan-300 transition-colors">
            ⌘J
          </span>
        </button>
      )}

      {/* ── Expanded J.A.R.V.I.S. Holographic HUD ── */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] rounded-3xl bg-slate-950/95 border border-cyan-500/40 p-5 shadow-2xl backdrop-blur-2xl text-white flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* HUD Top Bar */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] animate-pulse" />
              <div>
                <h3 className="text-xs font-black tracking-widest uppercase text-white">
                  J.A.R.V.I.S. Autonomous OS
                </h3>
                <p className="text-[9px] font-bold uppercase tracking-widest text-cyan-400/80">
                  {isSpeaking ? "Speaking" : isListening ? "Listening..." : isProcessing ? "Computing..." : "Standby"}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setIsOpen(false);
                if (isListening) recognitionRef.current?.stop();
                if (typeof window !== "undefined" && "speechSynthesis" in window) {
                  window.speechSynthesis.cancel();
                }
              }}
              className="p-1.5 rounded-xl hover:bg-white/10 text-white/40 hover:text-white transition-all"
            >
              <X size={16} />
            </button>
          </div>

          {/* Central Holographic Visualizer */}
          <div className="flex flex-col items-center justify-center py-2 relative">
            <div
              className={clsx(
                "w-20 h-20 rounded-full border-2 flex items-center justify-center transition-all duration-500 relative cursor-pointer",
                isListening
                  ? "border-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.4)] scale-110"
                  : isSpeaking
                  ? "border-emerald-400 shadow-[0_0_30px_rgba(52,211,153,0.4)] scale-105"
                  : "border-white/10 bg-white/5"
              )}
              onClick={toggleListening}
            >
              {/* Concentric rotating rings */}
              <div className="absolute inset-1 rounded-full border border-cyan-400/20 animate-spin" style={{ animationDuration: "12s" }} />
              <div className="absolute inset-3 rounded-full border border-dashed border-cyan-400/30 animate-spin" style={{ animationDuration: "8s", animationDirection: "reverse" }} />
              
              {isListening ? (
                <Mic size={28} className="text-cyan-400 animate-bounce" />
              ) : isSpeaking ? (
                <Volume2 size={28} className="text-emerald-400 animate-pulse" />
              ) : (
                <Mic size={24} className="text-white/40 hover:text-white transition-colors" />
              )}
            </div>

            <span className="text-[10px] font-bold uppercase tracking-widest mt-3 text-white/40">
              {isListening ? "Speak naturally to J.A.R.V.I.S." : "Tap ring or press ⌘J to speak"}
            </span>
          </div>

          {/* Transcript Display */}
          {transcript && (
            <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-xs text-white/80 font-medium leading-relaxed">
              <span className="text-[9px] font-black uppercase tracking-wider text-cyan-400 block mb-1">
                You:
              </span>
              "{transcript}"
            </div>
          )}

          {/* J.A.R.V.I.S. Response Display */}
          {jarvisResponse && (
            <div className="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/20 text-xs text-cyan-100 font-medium leading-relaxed shadow-inner">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[9px] font-black uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <Activity size={10} /> J.A.R.V.I.S.:
                </span>
                {lastAction && (
                  <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    {lastAction.type === "navigate" ? `Navigating to ${lastAction.path}` : "Task Executed"}
                  </span>
                )}
              </div>
              {jarvisResponse}
            </div>
          )}

          {/* Quick Suggestion Chips */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {[
              "Open Reader",
              "Take me to Calendar",
              "Show Expenses",
              "Open Notes"
            ].map((sugg, i) => (
              <button
                key={i}
                onClick={() => {
                  setTranscript(sugg);
                  executeJarvisCommand(sugg);
                }}
                className="text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-white/50 hover:text-cyan-300 border border-white/5 hover:border-cyan-500/30 transition-all active:scale-95"
              >
                {sugg}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
