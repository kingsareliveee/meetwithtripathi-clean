import { motion } from "framer-motion";
import ChatPanel from "../components/ChatPanel";
import { VideoTile } from "../components/VideoTile";
import { useMeetingRoom } from "../hooks/useMeetingRoom";

interface MeetingPageProps {
  roomCode: string;
  userName: string;
  onLeave: () => void;
}

export default function MeetingPage({ roomCode, userName, onLeave }: MeetingPageProps) {
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
    remoteUserName,
    sendChat,
    toggleMute,
    toggleCamera,
  } = useMeetingRoom(roomCode, userName);

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 px-4 py-8 md:px-8 pb-32">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        
        {/* TOP HEADER BAR (Mockup Inspired Back navigation + avatar stack) */}
        <div className="flex flex-col gap-4 rounded-[2.25rem] border border-border bg-card p-5 shadow-sm md:flex-row md:items-center md:justify-between transition-all duration-200">
          <div className="flex items-center gap-4">
            
            {/* Back Button */}
            <button
              onClick={onLeave}
              type="button"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-card border border-border/80 shadow-xs text-foreground hover:bg-secondary transition active:scale-95 duration-150"
              aria-label="Go Home"
            >
              <span className="text-lg">←</span>
            </button>
            
            {/* Room Title Block */}
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 rounded-full bg-pink-500/10 border border-pink-500/20 px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider text-pink-500">
                <span className="h-1.5 w-1.5 rounded-full bg-pink-500 animate-pulse" />
                Active call
              </div>
              <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold">
                <span className="text-foreground font-bold font-display text-sm uppercase">{roomCode}</span>
                <span>•</span>
                <span>{connectionLabel}</span>
              </div>
            </div>
          </div>

          {/* Right section: Online User list & Overlapping Avatar bubbles */}
          <div className="flex items-center justify-between md:justify-end gap-4">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                <div className="h-7 w-7 rounded-full bg-slate-300 border border-card flex items-center justify-center text-[10px] font-bold text-slate-800">
                  {userName.substring(0, 2).toUpperCase()}
                </div>
                {peerCount > 1 ? (
                  <div className="h-7 w-7 rounded-full bg-pink-500/15 border border-card flex items-center justify-center text-[10px] font-bold text-pink-500 animate-pulse">
                    {remoteUserName.substring(0, 2).toUpperCase()}
                  </div>
                ) : null}
              </div>
              <span className="text-xs text-muted-foreground font-bold tracking-wide uppercase">
                {peerCount} online
              </span>
            </div>
            
            <button
              onClick={onLeave}
              className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-secondary/60 px-5 py-2.5 text-xs font-bold text-foreground transition hover:bg-rose-500/10 hover:text-rose-500 active:scale-95"
            >
              Leave room
            </button>
          </div>
        </div>

        {/* Error overlay */}
        {error ? (
          <div className="rounded-2xl border border-rose-500/25 bg-rose-500/10 p-5 text-sm font-semibold text-rose-700 dark:text-rose-300">
            ⚠️ {error}
          </div>
        ) : null}

        {/* Main Grid: Video grid + chat sidebar */}
        <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
          
          {/* Left Column: Video tiles stacked or in a responsive 2-column layout */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid gap-6 md:grid-cols-2 xl:grid-cols-1"
          >
            <VideoTile
              label={remoteUserName}
              stream={remoteStream}
              muted={false}
              hint={connected ? "Connected live feed" : "Waiting for peer to join..."}
            />
            <VideoTile
              label={`${userName} (You)`}
              stream={localStream}
              muted={true}
              hint={cameraOff ? "Camera stream disabled" : "Microphone active"}
            />
          </motion.div>

          {/* Right Column: Chat panel sidebar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
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

        {/* FLOATING DARK BOTTOM CONTROL BAR */}
        <div className="fixed bottom-6 left-1/2 z-20 w-full max-w-lg -translate-x-1/2 px-4">
          <div className="rounded-full border border-white/10 bg-slate-950/95 p-3 shadow-2xl backdrop-blur-md flex items-center justify-between gap-4">
            
            {/* Status tags inside control bar */}
            <div className="flex items-center gap-2 pl-2">
              <span 
                className={`h-2.5 w-2.5 rounded-full ${cameraOff ? "bg-rose-500" : "bg-emerald-500"} animate-pulse`} 
                title={cameraOff ? "Camera Off" : "Camera On"}
              />
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest hidden sm:inline">
                {isMuted ? "Muted" : "Active"}
              </span>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              {/* Toggle Audio Mute Key */}
              <button
                onClick={toggleMute}
                type="button"
                className={`flex h-11 w-11 items-center justify-center rounded-full transition duration-200 active:scale-90 border border-white/5 ${
                  isMuted 
                    ? "bg-rose-500 text-white hover:bg-rose-600" 
                    : "bg-white/10 text-white hover:bg-white/20"
                }`}
                title={isMuted ? "Unmute Mic" : "Mute Mic"}
              >
                <span className="text-sm">{isMuted ? "🔇" : "🎙️"}</span>
              </button>

              {/* Toggle Camera On/Off Key */}
              <button
                onClick={toggleCamera}
                type="button"
                className={`flex h-11 w-11 items-center justify-center rounded-full transition duration-200 active:scale-90 border border-white/5 ${
                  cameraOff 
                    ? "bg-rose-500 text-white hover:bg-rose-600" 
                    : "bg-white/10 text-white hover:bg-white/20"
                }`}
                title={cameraOff ? "Enable Cam" : "Disable Cam"}
              >
                <span className="text-sm">{cameraOff ? "📷" : "🎥"}</span>
              </button>

              {/* Leave Call Key (Red Pill button matching mockup) */}
              <button
                onClick={onLeave}
                type="button"
                className="flex items-center justify-center gap-2 rounded-full bg-rose-500 hover:bg-rose-600 px-5 h-11 text-xs font-bold text-white transition duration-200 active:scale-90 shadow-md shadow-rose-500/20"
              >
                <span className="text-sm">📴</span>
                <span>Leave</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-10 pt-6 border-t border-border/40 text-center text-xs text-muted-foreground font-semibold">
          MeetwithTripathi — Secure Video Calling • Made by Anuj
        </div>

      </div>
    </div>
  );
}
