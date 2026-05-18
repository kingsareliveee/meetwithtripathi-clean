import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ChatPanel from "../components/ChatPanel";
import { VideoTile } from "../components/VideoTile";
import { useMeetingRoom } from "../hooks/useMeetingRoom";

const cinematicEase = [0.16, 1, 0.3, 1] as const;
const fadeBlur = {
  hidden: { opacity: 0, filter: "blur(12px)", transform: "translateY(10px) scale(0.99)" },
  show: { opacity: 1, filter: "blur(0px)", transform: "translateY(0px) scale(1)" },
  exit: { opacity: 0, filter: "blur(12px)", transform: "translateY(-8px) scale(0.99)" },
};

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

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyRoomUrl = () => {
    const url = `${window.location.origin}/room/${roomCode}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden select-none font-sans">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={connected ? "active" : "waiting"}
          initial="hidden"
          animate="show"
          exit="exit"
          variants={fadeBlur}
          transition={{ duration: 0.55, ease: cinematicEase }}
          className="contents"
        >
          {/* 1. IMMERSIVE EDGE-TO-EDGE REMOTE VIDEO BACKDROP */}
          <div className="absolute inset-0 w-full h-full z-0 bg-slate-950">
            {connected ? (
              <VideoTile
                label={remoteUserName}
                stream={remoteStream}
                muted={false}
                isLocal={false}
                variant="fullscreen"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 text-slate-400 p-6 text-center overflow-hidden">
                {/* AMBIENT RADAR ORBIT LINES */}
                <div className="absolute w-[300px] h-[300px] rounded-full border border-white/5 flex items-center justify-center pointer-events-none">
                  <div className="w-[200px] h-[200px] rounded-full border border-white/5 flex items-center justify-center">
                    <div className="w-[100px] h-[100px] rounded-full border border-white/5" />
                  </div>
                </div>

                {/* PULSING RADAR GLOWS */}
                <div className="absolute h-60 w-60 radar-ring pointer-events-none radar-ring-delay-0" />
                <div className="absolute h-60 w-60 radar-ring pointer-events-none radar-ring-delay-1" />
                <div className="absolute h-60 w-60 radar-ring pointer-events-none radar-ring-delay-2" />

                <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-transparent to-indigo-500/10 blur-[120px] pointer-events-none" />

                <motion.div
                  initial={{ scale: 0.9, opacity: 0, filter: "blur(8px)" }}
                  animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
                  transition={{ duration: 0.65, ease: cinematicEase }}
                  className="flex flex-col items-center justify-center z-10 max-w-sm"
                >
                  <div className="relative mb-6">
                    <motion.div 
                      animate={{ scale: [1, 1.06, 1] }}
                      transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                      className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-xl text-3xl"
                    >
                      💬
                    </motion.div>
                    <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-pink-500 border-2 border-slate-950 animate-pulse" />
                  </div>

                  <h3 className="text-xl font-bold text-slate-100 tracking-tight font-display">Waiting for partner...</h3>
                  <p className="text-xs text-slate-500 mt-2 max-w-xs leading-relaxed">
                    The room is ready. Share the link below to start your private peer-to-peer call.
                  </p>

                  {/* PREMIUM COPY LINK CAPSULE */}
                  <motion.div
                    onClick={copyRoomUrl}
                    whileHover={{ y: -2, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="mt-8 flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md cursor-pointer transition-all duration-300 group shadow-lg shadow-pink-500/0 hover:shadow-pink-500/5 select-none"
                  >
                    <div className="flex flex-col items-start text-left">
                      <span className="text-[8px] font-extrabold uppercase tracking-widest text-slate-500 group-hover:text-slate-400">
                        {copied ? "Link Copied to Clipboard!" : "Click to Copy Room Link"}
                      </span>
                      <span className="text-xs font-bold text-slate-300 group-hover:text-white transition duration-200 mt-0.5 font-mono">
                        {roomCode}
                      </span>
                    </div>
                    <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-pink-500/10 text-pink-400 group-hover:bg-pink-500 group-hover:text-white transition-all duration-300 text-xs shadow-inner">
                      {copied ? "✓" : "📋"}
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* 2. FLOATING LOCAL SELF-PREVIEW (Draggable with springs) */}
      <AnimatePresence>
        {localStream ? (
          <motion.div
            key="local-preview"
            drag
            dragElastic={0.12}
            dragMomentum={false}
            whileHover={{ scale: 1.04, y: -2 }}
            whileDrag={{ scale: 1.05, cursor: "grabbing", boxShadow: "0 30px 60px rgba(0,0,0,0.6)" }}
            initial={{ opacity: 0, y: 15, scale: 0.95, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 12, scale: 0.97, filter: "blur(8px)" }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
            className="absolute top-6 right-6 z-10 w-28 h-40 sm:w-36 sm:h-48 md:w-44 md:h-60 rounded-2xl overflow-hidden border border-white/20 shadow-2xl bg-slate-900 cursor-grab active:cursor-grabbing select-none will-change-transform"
          >
            <VideoTile
              label={`${userName} (You)`}
              stream={localStream}
              muted={true}
              isLocal={true}
              variant="floating"
            />
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* 3. FLOATING HUD OVERLAY */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15, ease: cinematicEase }}
        className="absolute top-6 left-6 z-10 flex flex-col gap-2"
      >
        <div className="flex items-center gap-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10 px-4 py-2 text-xs font-bold text-white shadow-lg">
          <button
            onClick={onLeave}
            className="text-slate-400 hover:text-white font-bold transition mr-2 pr-2 border-r border-white/10"
            title="Leave Call"
          >
            ←
          </button>
          <span className="uppercase tracking-wider font-extrabold text-pink-400">{roomCode}</span>
          <span className="h-1.5 w-1.5 rounded-full bg-pink-500 animate-pulse ml-1.5" />
          <span className="text-[10px] font-bold text-slate-400 ml-1.5">{connectionLabel}</span>
        </div>

        {peerCount > 1 ? (
          <div className="flex items-center gap-1.5 self-start rounded-full bg-emerald-500/20 border border-emerald-500/35 px-3 py-1 text-[9px] font-bold text-emerald-400 shadow-md">
            <span className="h-1 w-1 rounded-full bg-emerald-400 animate-ping" />
            SECURELY CONNECTED
          </div>
        ) : null}
      </motion.div>

      {/* Error overlay */}
      {error ? (
        <div className="absolute top-20 left-6 z-10 max-w-sm rounded-xl border border-rose-500/25 bg-rose-500/90 backdrop-blur-md p-4 text-xs font-bold text-white shadow-lg">
          ⚠️ {error}
        </div>
      ) : null}

      {/* 4. WATERMARK */}
      <div className="absolute bottom-6 left-6 z-10 hidden sm:flex flex-col gap-1 items-start opacity-45 hover:opacity-85 transition-opacity duration-350">
        <img src="/velora-logo.png" className="h-5 object-contain dark:invert" alt="Velora" />
        <span className="text-[8px] font-bold tracking-[0.2em] text-slate-400 uppercase">Made by Anuj</span>
      </div>

      {/* 5. CONTROL DOCK */}
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2, ease: cinematicEase }}
        className="fixed bottom-6 left-1/2 z-20 w-auto -translate-x-1/2 px-4"
      >
        <motion.div
          animate={isChatOpen ? { scale: 0.98, y: 6, opacity: 0.95 } : { scale: 1, y: 0, opacity: 1 }}
          transition={{ duration: 0.25, ease: cinematicEase }}
          className="rounded-full border border-white/10 bg-slate-950/85 p-3 shadow-2xl backdrop-blur-md flex items-center justify-center gap-4"
        >
          <motion.button
            onClick={toggleMute}
            type="button"
            whileHover={{ y: -2, scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`flex h-12 w-12 items-center justify-center rounded-full transition-all duration-200 border border-white/5 shadow-md ${
              isMuted
                ? "bg-rose-500 text-white hover:bg-rose-600 shadow-rose-500/20"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
            title={isMuted ? "Unmute Mic" : "Mute Mic"}
          >
            <span className="text-base">{isMuted ? "🔇" : "🎙️"}</span>
          </motion.button>

          <motion.button
            onClick={toggleCamera}
            type="button"
            whileHover={{ y: -2, scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`flex h-12 w-12 items-center justify-center rounded-full transition-all duration-200 border border-white/5 shadow-md ${
              cameraOff
                ? "bg-rose-500 text-white hover:bg-rose-600 shadow-rose-500/20"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
            title={cameraOff ? "Enable Camera" : "Disable Camera"}
          >
            <span className="text-base">{cameraOff ? "📷" : "🎥"}</span>
          </motion.button>

          <motion.button
            onClick={() => setIsChatOpen(true)}
            type="button"
            whileHover={{ y: -2, scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-all duration-200 border border-white/5 shadow-md"
            title="Open Chat"
          >
            <span className="text-base">💬</span>
            {messages.length > 0 ? (
              <span className="absolute top-0.5 right-0.5 h-3.5 w-3.5 rounded-full bg-pink-500 border-2 border-slate-950 flex items-center justify-center text-[8px] font-black text-white">
                {messages.length}
              </span>
            ) : null}
          </motion.button>

          <motion.button
            onClick={onLeave}
            type="button"
            whileHover={{ y: -2, scale: 1.04, boxShadow: "0 10px 25px rgba(244, 63, 94, 0.25)" }}
            whileTap={{ scale: 0.96 }}
            className="flex h-12 px-6 items-center justify-center gap-2 rounded-full bg-rose-500 hover:bg-rose-600 text-xs font-bold text-white transition-all duration-200 shadow-md shadow-rose-500/20"
          >
            <span className="text-base">📴</span>
            <span className="hidden sm:inline">Leave</span>
          </motion.button>
        </motion.div>
      </motion.div>

      {/* 6. CHAT BOTTOM SHEET */}
      <AnimatePresence>
        {isChatOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsChatOpen(false)}
              transition={{ duration: 0.22, ease: cinematicEase }}
              className="fixed inset-0 bg-black/60 z-30 backdrop-blur-xs transition-opacity"
            />

            <motion.div
              initial={{ y: "100%", opacity: 0.5, scale: 0.985, filter: "blur(8px)" }}
              animate={{ y: "0%", opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ y: "100%", opacity: 0.5, scale: 0.99, filter: "blur(8px)" }}
              transition={{ type: "spring", damping: 28, stiffness: 240 }}
              className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 border-t border-white/10 rounded-t-[2.5rem] shadow-2xl max-w-xl mx-auto overflow-hidden flex flex-col h-[70vh] backdrop-blur-md"
            >
              <div className="flex justify-center py-3">
                <motion.button
                  onClick={() => setIsChatOpen(false)}
                  aria-label="Close Chat"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.18, ease: cinematicEase }}
                  className="w-12 h-1 rounded-full bg-white/20 hover:bg-white/40 transition"
                />
              </div>

              <div className="px-6 pb-4 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-pink-400">Live Chat</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-pink-500 animate-pulse" />
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase">{roomCode}</span>
                </div>

                <motion.button
                  onClick={() => setIsChatOpen(false)}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.18, ease: cinematicEase }}
                  className="text-[10px] font-bold text-slate-400 hover:text-white transition px-3 py-1 rounded-full bg-white/5 uppercase"
                >
                  Close
                </motion.button>
              </div>

              <div className="flex-1 overflow-hidden flex flex-col">
                <ChatPanel
                  roomCode={roomCode}
                  peerCount={peerCount}
                  messages={messages}
                  connected={connected}
                  onSend={sendChat}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
