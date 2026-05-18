import { useMemo, useRef, useState, type FormEvent, useEffect } from "react";
import { motion } from "framer-motion";
import type { ChatMessage } from "../hooks/useMeetingRoom";

interface ChatPanelProps {
  roomCode: string;
  peerCount: number;
  messages: ChatMessage[];
  connected: boolean;
  onSend: (message: string) => void;
}

export default function ChatPanel({ roomCode, peerCount, messages, connected, onSend }: ChatPanelProps) {
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement | null>(null);

  const sortedMessages = useMemo(() => [...messages].sort((a, b) => a.time.localeCompare(b.time)), [messages]);

  // Auto-scroll to bottom of chat when new messages arrive
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [sortedMessages]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    onSend(text);
    setDraft("");
  };

  return (
    <div className="flex h-full flex-col bg-transparent text-slate-100 overflow-hidden flex-1">
      
      {/* Messages Scroll Area */}
      <div className="flex-1 space-y-3.5 overflow-y-auto px-4 py-3 text-sm">
        {sortedMessages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 8, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-center text-slate-400 my-8"
          >
            <motion.div 
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="text-2xl mb-2"
            >
              💬
            </motion.div>
            <p className="text-xs font-semibold text-slate-500">
              {connected ? "Start typing to chat live in this room." : "Waiting for another participant..."}
            </p>
          </motion.div>
        ) : (
          sortedMessages.map((message, index) => (
            <motion.div
              key={message.id || index}
              initial={{ opacity: 0, y: 10, scale: 0.98, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -1, scale: 1.005 }}
              className={`rounded-2xl p-4 transition-all duration-200 border ${
                message.local
                  ? "bg-pink-500/10 text-pink-100 border-pink-500/20 self-end ml-8 shadow-sm shadow-pink-500/5"
                  : "bg-white/5 text-slate-200 border-white/10 mr-8 shadow-sm"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-[9px] font-extrabold uppercase tracking-[0.15em] text-slate-400">
                  {message.sender}
                </p>
                <span className="text-[9px] text-slate-500 font-medium">{message.time}</span>
              </div>
              <p className="mt-1.5 whitespace-pre-line leading-relaxed font-medium text-sm">
                {message.text}
              </p>
            </motion.div>
          ))
        )}
        <div ref={endRef} />
      </div>

      {/* Inputs Form */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-white/5 bg-slate-950/40 flex items-center gap-3">
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={connected ? "Send a message..." : "Waiting for connection..."}
          disabled={!connected}
          className="flex-1 rounded-full border border-white/10 bg-slate-900/60 px-5 py-3.5 text-white placeholder:text-slate-500 shadow-xs focus:border-pink-500/60 focus:ring-4 focus:ring-pink-500/5 focus:outline-none transition duration-300 text-sm font-semibold backdrop-blur-md"
        />
        <motion.button
          type="submit"
          disabled={!draft.trim() || !connected}
          aria-label="Send message"
          whileHover={!draft.trim() || !connected ? undefined : { y: -2, scale: 1.05, boxShadow: "0 8px 20px rgba(236, 72, 153, 0.25)" }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-pink-500 text-white transition shadow-md disabled:cursor-not-allowed disabled:opacity-30 duration-300 shadow-pink-500/10"
        >
          <svg className="w-4 h-4 translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </motion.button>
      </form>
    </div>
  );
}
