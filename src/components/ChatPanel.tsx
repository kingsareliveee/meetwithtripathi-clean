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
    <div className="flex h-full flex-col rounded-[2rem] border border-white/10 bg-slate-950/90 p-5 shadow-[0_30px_80px_rgba(255,0,143,0.08)]">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-pink-300/80">Room</p>
          <h2 className="text-xl font-semibold text-white">{roomCode}</h2>
        </div>
        <div className="rounded-3xl bg-slate-900 px-4 py-3 text-sm text-slate-200">
          {peerCount} online
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto pr-1 text-sm text-slate-200">
        {sortedMessages.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/10 bg-white/5 p-6 text-slate-400">
            {connected ? "Start typing to chat live" : "Waiting for another participant..."}
          </div>
        ) : (
          sortedMessages.map((message) => (
            <div
              key={message.id}
              className={`rounded-3xl p-4 ${message.local ? "bg-pink-500/15 text-pink-100" : "bg-slate-900/80 text-slate-100"}`}
            >
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{message.sender}</p>
              <p className="mt-2 whitespace-pre-line leading-6">{message.text}</p>
            </div>
          ))
        )}
        <div ref={endRef} />
      </div>

      <form onSubmit={handleSubmit} className="mt-5 flex items-center gap-3">
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={connected ? "Send a message..." : "Waiting for connection..."}
          disabled={!connected}
          className="flex-1 rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-400/20"
        />
        <button
          type="submit"
          disabled={!draft.trim() || !connected}
          aria-label="Send message"
          className="inline-flex h-12 min-w-[3rem] items-center justify-center rounded-3xl bg-pink-500 px-4 text-white transition hover:bg-pink-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span aria-hidden="true">➡️</span>
        </button>
      </form>
    </div>
  );
}
