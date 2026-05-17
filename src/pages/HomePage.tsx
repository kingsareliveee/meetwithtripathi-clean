import { motion } from "framer-motion";
import { useState } from "react";

interface HomePageProps {
  onCreate: () => void;
  onJoin: (code: string) => void;
}

export default function HomePage({ onCreate, onJoin }: HomePageProps) {
  const [roomCode, setRoomCode] = useState("");

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(255,92,184,0.24),_transparent_22%),radial-gradient(circle_at_bottom_right,_rgba(255,0,143,0.18),_transparent_25%),#090b16] flex items-center justify-center px-5 py-10">
      <div className="w-full max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="rounded-[2rem] border border-white/10 bg-white/5 shadow-[0_30px_120px_rgba(255,0,143,0.12)] backdrop-blur-xl p-8 lg:p-12"
        >
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-3 rounded-full bg-pink-500/15 px-4 py-2 text-sm font-semibold text-pink-200">
                <span className="text-lg">✨</span>
                Anonymous rooms in seconds
              </div>
              <div className="space-y-4">
                <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                  MeetwithTripathi
                </h1>
                <p className="max-w-xl text-slate-300 sm:text-lg">
                  Instant anonymous video calls with a shared room code, live chat, and modern glass UI.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={onCreate}
                  className="inline-flex items-center justify-center gap-2 rounded-3xl bg-pink-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-pink-500/30 transition hover:bg-pink-400"
                >
                  Create room
                  <span aria-hidden="true">→</span>
                </button>
                <button
                  type="button"
                  onClick={() => onJoin(roomCode)}
                  disabled={!roomCode.trim()}
                  className="inline-flex items-center justify-center gap-2 rounded-3xl border border-white/10 bg-slate-950/80 px-6 py-3 text-sm font-semibold text-slate-100 transition hover:border-pink-400/40 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Join room
                </button>
              </div>
              <div className="grid gap-3">
                <label className="text-sm font-medium text-slate-200">Room code</label>
                <input
                  className="w-full rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-400/20"
                  placeholder="Enter room code"
                  value={roomCode}
                  onChange={(event) => setRoomCode(event.target.value.toUpperCase())}
                  onKeyDown={(event) => { if (event.key === "Enter") onJoin(roomCode); }}
                />
              </div>
            </div>

            <div className="rounded-[2rem] bg-slate-950/80 p-8 shadow-[0_40px_100px_rgba(0,0,0,0.25)] border border-white/10">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.32em] text-pink-300/80">Ready to call</p>
                  <h2 className="mt-3 text-3xl font-semibold text-white">Warm neon rooms</h2>
                </div>
                <div className="rounded-3xl bg-pink-500/15 p-3 text-pink-200">🔒</div>
              </div>
              <p className="mt-6 text-slate-400">
                Share a short room code and connect in one tap. No login, no profile, no fuss.
              </p>
              <div className="mt-8 grid gap-4 rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
                <div className="flex items-center justify-between gap-3 rounded-3xl bg-slate-950/90 p-4">
                  <span className="text-sm text-slate-300">Live video</span>
                  <span className="text-sm font-semibold text-pink-300">Instant</span>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-3xl bg-slate-950/90 p-4">
                  <span className="text-sm text-slate-300">Chat</span>
                  <span className="text-sm font-semibold text-pink-300">Realtime</span>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-3xl bg-slate-950/90 p-4">
                  <span className="text-sm text-slate-300">No account</span>
                  <span className="text-sm font-semibold text-pink-300">Anonymous</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
