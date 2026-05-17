import { motion } from "framer-motion";
import { useState } from "react";
import { useMeetingStore } from "../store/useMeetingStore";

interface HomePageProps {
  onCreate: () => void;
  onJoin: (code: string) => void;
}

export default function HomePage({ onCreate, onJoin }: HomePageProps) {
  const [roomCode, setRoomCode] = useState("");
  const { userName, setUserName } = useMeetingStore();

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 flex items-center justify-center px-4 py-8 md:px-8">
      <div className="w-full max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="rounded-[2.5rem] border border-border bg-card shadow-xl p-8 lg:p-12 text-card-foreground overflow-hidden"
        >
          {/* Responsive 2-column Grid */}
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
            
            {/* LEFT COLUMN: Main Information, CTAs and Inputs */}
            <div className="space-y-8 flex flex-col justify-center">
              
              {/* Premium Pill Badge */}
              <div className="flex justify-start">
                <span className="inline-flex items-center gap-2 rounded-full bg-pink-500/10 border border-pink-500/20 px-4 py-2 text-xs font-bold text-pink-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-pink-500 animate-pulse" />
                  Anonymous rooms in seconds
                </span>
              </div>

              {/* Title & Subtitle */}
              <div className="space-y-4">
                <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl font-display leading-tight">
                  MeetwithTripathi
                </h1>
                <p className="max-w-xl text-muted-foreground sm:text-lg leading-relaxed">
                  Instant anonymous video calls with a shared room code, live chat, and a modern glass UI.
                </p>
              </div>

              {/* Inputs Box (Name and Room Code) */}
              <div className="grid gap-5 sm:grid-cols-2">
                {/* Name Input */}
                <div className="space-y-3">
                  <label className="text-xs font-bold tracking-wider uppercase text-muted-foreground">
                    Your Name
                  </label>
                  <input
                    className="w-full rounded-2xl border border-border bg-card px-4 py-3.5 text-foreground placeholder:text-muted-foreground/60 shadow-xs focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 focus:outline-none transition duration-200 text-sm font-semibold"
                    placeholder="Enter your name"
                    value={userName}
                    onChange={(event) => setUserName(event.target.value)}
                  />
                </div>

                {/* Room Code Input */}
                <div className="space-y-3">
                  <label className="text-xs font-bold tracking-wider uppercase text-muted-foreground">
                    Room code
                  </label>
                  <input
                    className="w-full rounded-2xl border border-border bg-card px-4 py-3.5 text-foreground placeholder:text-muted-foreground/60 shadow-xs focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 focus:outline-none transition duration-200 uppercase tracking-widest text-sm font-semibold"
                    placeholder="e.g. VZQSQC"
                    value={roomCode}
                    onChange={(event) => setRoomCode(event.target.value.toUpperCase())}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && roomCode.trim()) {
                        onJoin(roomCode);
                      }
                    }}
                  />
                </div>
              </div>

              {/* Functional CTA Buttons */}
              <div className="grid gap-4 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={onCreate}
                  className="inline-flex items-center justify-center gap-2.5 rounded-full bg-primary text-primary-foreground px-6 py-4 text-xs font-bold shadow-md shadow-primary/10 transition hover:bg-slate-800 hover:scale-[1.02] active:scale-[0.98] duration-200"
                >
                  Create room
                  <span aria-hidden="true">→</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => onJoin(roomCode)}
                  disabled={!roomCode.trim()}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-secondary/80 px-6 py-4 text-xs font-bold text-foreground transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40 hover:scale-[1.02] active:scale-[0.98] duration-200"
                >
                  Join room
                </button>
              </div>
            </div>

            {/* RIGHT COLUMN: Polished "Ready to call" Specs Box */}
            <div className="rounded-[2.25rem] bg-secondary/35 border border-border/60 p-6 md:p-8 flex flex-col justify-between min-h-[360px]">
              <div className="space-y-6">
                
                {/* Header Information */}
                <div className="flex items-start justify-between gap-3 pb-4 border-b border-border/60">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-pink-500">
                      Ready to Call
                    </p>
                    <h3 className="mt-2 text-2xl font-bold tracking-tight text-foreground font-display">
                      Warm neon rooms
                    </h3>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-pink-500/10 flex items-center justify-center text-pink-500 text-sm">
                    🔒
                  </div>
                </div>

                {/* Real Original Description */}
                <p className="text-xs md:text-sm text-muted-foreground font-medium leading-relaxed">
                  Share a short room code and connect in one tap. No login, no profile, no fuss.
                </p>
              </div>

              {/* Features Specifications List */}
              <div className="mt-8 space-y-3">
                <div className="flex items-center justify-between gap-3 rounded-2xl bg-card border border-border/80 px-4 py-3.5 shadow-xs">
                  <span className="text-xs text-muted-foreground font-bold uppercase tracking-wide">
                    Live video
                  </span>
                  <span className="text-xs font-bold text-pink-500">
                    Instant
                  </span>
                </div>
                
                <div className="flex items-center justify-between gap-3 rounded-2xl bg-card border border-border/80 px-4 py-3.5 shadow-xs">
                  <span className="text-xs text-muted-foreground font-bold uppercase tracking-wide">
                    Chat
                  </span>
                  <span className="text-xs font-bold text-pink-500">
                    Realtime
                  </span>
                </div>
                
                <div className="flex items-center justify-between gap-3 rounded-2xl bg-card border border-border/80 px-4 py-3.5 shadow-xs">
                  <span className="text-xs text-muted-foreground font-bold uppercase tracking-wide">
                    No account
                  </span>
                  <span className="text-xs font-bold text-pink-500">
                    Anonymous
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* SIMPLIFIED FOOTER */}
          <div className="mt-10 pt-6 border-t border-border/60 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-xs text-muted-foreground font-semibold">
            <span>MeetwithTripathi — Secure WebRTC video rooms</span>
            <span>Made by Anuj</span>
          </div>

        </motion.div>
      </div>
    </div>
  );
}
