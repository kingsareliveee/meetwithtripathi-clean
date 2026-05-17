import { useMemo, useRef, useState, type FormEvent } from "react";
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

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    onSend(text);
    setDraft("");
  };

  return (
    <div className="flex h-full flex-col rounded-[2.25rem] border border-border bg-card p-5 shadow-md min-h-[480px]">
      
      {/* Panel Header */}
      <div className="mb-5 flex items-center justify-between gap-3 pb-4 border-b border-border/60">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-pink-500">
            Room Chat
          </p>
          <h2 className="mt-1.5 text-xl font-bold text-foreground font-display">
            {roomCode}
          </h2>
        </div>
        <div className="rounded-full bg-secondary px-3.5 py-1.5 text-xs font-bold text-secondary-foreground border border-border/40">
          {peerCount} online
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 space-y-3.5 overflow-y-auto pr-1 text-sm text-foreground">
        {sortedMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-secondary/25 p-8 text-center text-muted-foreground">
            <span className="text-2xl mb-2">💬</span>
            <p className="text-xs font-medium">
              {connected ? "Start typing to chat live in this room." : "Waiting for another participant..."}
            </p>
          </div>
        ) : (
          sortedMessages.map((message) => (
            <div
              key={message.id}
              className={`rounded-2xl p-4 transition-all duration-200 border ${
                message.local
                  ? "bg-pink-500/10 text-pink-900 dark:text-pink-100 border-pink-500/20 self-end ml-8"
                  : "bg-secondary text-foreground border-border/60 mr-8"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/80">
                  {message.sender}
                </p>
                <span className="text-[9px] text-muted-foreground/60">{message.time}</span>
              </div>
              <p className="mt-1.5 whitespace-pre-line leading-relaxed font-medium">
                {message.text}
              </p>
            </div>
          ))
        )}
        <div ref={endRef} />
      </div>

      {/* Inputs Form */}
      <form onSubmit={handleSubmit} className="mt-5 flex items-center gap-3">
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={connected ? "Send a message..." : "Waiting for connection..."}
          disabled={!connected}
          className="flex-1 rounded-2xl border border-border bg-card px-4 py-3.5 text-foreground placeholder:text-muted-foreground/60 shadow-xs focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 focus:outline-none transition duration-200 text-sm font-medium"
        />
        <button
          type="submit"
          disabled={!draft.trim() || !connected}
          aria-label="Send message"
          className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground transition shadow-md hover:scale-[1.04] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 duration-200"
        >
          <span className="text-base">➡️</span>
        </button>
      </form>
    </div>
  );
}
