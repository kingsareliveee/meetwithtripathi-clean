import { motion } from "framer-motion";
import ChatPanel from "../components/ChatPanel";
import { VideoTile } from "../components/VideoTile";
import { useMeetingRoom } from "../hooks/useMeetingRoom";

interface MeetingPageProps {
  roomCode: string;
  onLeave: () => void;
}

export default function MeetingPage({ roomCode, onLeave }: MeetingPageProps) {
  const {
    localStream,
    remoteStream,
    connectionLabel,
    connected,
    messages,
    peerCount,
    isMuted,
    cameraOff,
    error,
    sendChat,
    toggleMute,
    toggleCamera,
  } = useMeetingRoom(roomCode);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(255,92,184,0.20),_transparent_20%),radial-gradient(circle_at_bottom_right,_rgba(255,0,143,0.16),_transparent_25%),#050812] px-4 py-6 text-slate-100">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <div className="flex flex-col gap-3 rounded-[2rem] border border-white/10 bg-slate-950/70 p-5 shadow-[0_30px_80px_rgba(255,0,143,0.12)] backdrop-blur-xl md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-pink-500/15 px-4 py-2 text-xs uppercase tracking-[0.24em] text-pink-200">
              <span className="text-sm">💬</span>
              Room active
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
              <span className="font-semibold text-white">{roomCode}</span>
              <span>•</span>
              <span>{peerCount} user{peerCount === 1 ? "" : "s"} online</span>
              <span>•</span>
              <span>{connectionLabel}</span>
            </div>
          </div>
          <button
            onClick={onLeave}
            className="inline-flex items-center gap-2 rounded-3xl bg-slate-900/90 px-5 py-3 text-sm font-semibold text-white transition hover:bg-pink-500/15"
          >
            <span aria-hidden="true">←</span>
            Leave room
          </button>
        </div>

        {error ? (
          <div className="rounded-[2rem] border border-rose-500/20 bg-rose-500/10 p-6 text-sm text-rose-100">
            {error}
          </div>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <VideoTile
              label="Remote video"
              stream={remoteStream}
              muted={false}
              hint={connected ? "Live feed" : "Waiting for peer"}
            />
            <VideoTile
              label="Your preview"
              stream={localStream}
              muted={true}
              hint={cameraOff ? "Camera off" : "Microphone active"}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="h-full"
          >
            <ChatPanel
              roomCode={roomCode}
              peerCount={peerCount}
              messages={messages}
              connected={connected}
              onSend={sendChat}
            />
          </motion.div>
        </div>

        <div className="sticky bottom-6 z-10 mx-auto w-full max-w-7xl rounded-[2rem] border border-white/10 bg-slate-950/85 p-4 shadow-[0_30px_120px_rgba(255,0,143,0.14)] backdrop-blur-xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300 md:gap-4">
              <div className="inline-flex items-center gap-2 rounded-3xl bg-slate-900/80 px-4 py-2 text-slate-200">
                <span className="text-pink-300">🎥</span>
                {cameraOff ? "Camera off" : "Camera on"}
              </div>
              <div className="inline-flex items-center gap-2 rounded-3xl bg-slate-900/80 px-4 py-2 text-slate-200">
                <span className="text-pink-300">🎙️</span>
                {isMuted ? "Muted" : "Mic live"}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={toggleMute}
                className="inline-flex items-center gap-2 rounded-3xl bg-slate-900/95 px-5 py-3 text-sm font-semibold text-white transition hover:bg-pink-500/15"
              >
                <span className="text-pink-300">{isMuted ? "🔇" : "🎙️"}</span>
                {isMuted ? "Unmute" : "Mute"}
              </button>
              <button
                onClick={toggleCamera}
                className="inline-flex items-center gap-2 rounded-3xl bg-slate-900/95 px-5 py-3 text-sm font-semibold text-white transition hover:bg-pink-500/15"
              >
                <span className="text-pink-300">{cameraOff ? "📷" : "🎥"}</span>
                {cameraOff ? "Turn camera on" : "Turn camera off"}
              </button>
              <button
                onClick={onLeave}
                className="inline-flex items-center gap-2 rounded-3xl bg-rose-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-400"
              >
                <span aria-hidden="true">📴</span>
                Leave
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
