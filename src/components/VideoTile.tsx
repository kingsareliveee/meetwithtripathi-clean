import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface VideoTileProps {
  label: string;
  stream?: MediaStream | null;
  muted?: boolean;
  accent?: string;
  hint?: string;
  isLocal?: boolean;
  variant?: "default" | "fullscreen" | "floating";
}

export function VideoTile({ 
  label, 
  stream, 
  muted = false, 
  accent = "from-pink-500 to-fuchsia-500", 
  hint,
  isLocal = false,
  variant = "default"
}: VideoTileProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream ?? null;
      const playPromise = videoRef.current.play();
      if (playPromise && typeof playPromise.then === "function") {
        playPromise.catch((err) => {
          console.debug("Video play() rejected:", err?.name || err, "- user gesture may be required");
        });
      }
      try {
        const s = stream as MediaStream | null;
        if (s) {
          console.debug("VideoTile attached stream", {
            label,
            id: s.id,
            audioTracks: s.getAudioTracks().map((t) => ({ id: t.id, kind: t.kind, enabled: t.enabled })),
            videoTracks: s.getVideoTracks().map((t) => ({ id: t.id, kind: t.kind, enabled: t.enabled })),
          });
        }
      } catch (err) {
        console.warn("VideoTile stream log failed", err);
      }
    }
  }, [stream]);

  // IMMERSIVE FULLSCREEN VARIANT (FaceTime Remote Feed Style)
  if (variant === "fullscreen") {
    return (
      <div className="relative w-full h-full bg-slate-950">
        <video
          ref={videoRef}
          muted={muted}
          autoPlay
          playsInline
          className="h-full w-full object-cover"
        />
        {/* Floating frosted Glass Username overlay */}
        <motion.div
          initial={{ opacity: 0, y: 6, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="absolute left-4 bottom-4 z-10 flex items-center gap-2 rounded-full bg-black/60 px-3.5 py-1.5 text-xs font-bold text-white backdrop-blur-md border border-white/10 shadow-sm"
        >
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{label}</span>
        </motion.div>
      </div>
    );
  }

  // FLOATING PICTURE-IN-PICTURE VARIANT (FaceTime Local Preview Style)
  if (variant === "floating") {
    return (
      <div className="relative w-full h-full bg-slate-900">
        <video
          ref={videoRef}
          muted={muted}
          autoPlay
          playsInline
          style={{ transform: "scaleX(-1)" }} // Mirrors the self camera natively
          className="h-full w-full object-cover"
        />
        {/* Tiny float label */}
        <motion.div
          initial={{ opacity: 0, y: 6, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="absolute left-2 bottom-2 z-10 rounded-md bg-black/60 px-2 py-0.5 text-[9px] font-bold text-white backdrop-blur-xs border border-white/5"
        >
          {label}
        </motion.div>
      </div>
    );
  }

  // DEFAULT VIEW CARD
  return (
    <div className="rounded-[2.25rem] border border-border bg-card p-4 shadow-md transition hover:shadow-lg duration-200">
      
      {/* Video Container with floating overlay elements */}
      <div className="relative overflow-hidden rounded-[1.75rem] bg-slate-950 border border-border/10 aspect-video w-full">
        
        <video
          ref={videoRef}
          muted={muted}
          autoPlay
          playsInline
          style={isLocal ? { transform: "scaleX(-1)" } : undefined}
          className="h-full w-full object-cover"
        />

        {/* FLOATING TOP-LEFT NAME BADGE */}
        <motion.div
          initial={{ opacity: 0, y: 8, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="absolute left-4 top-4 z-10 flex items-center gap-2 rounded-full bg-black/60 px-3.5 py-1.5 text-xs font-bold text-white backdrop-blur-md border border-white/10 will-change-transform"
        >
          <div className="h-5 w-5 rounded-full bg-pink-500/20 text-pink-300 flex items-center justify-center font-display text-[10px]">
            {label.substring(0, 2).toUpperCase()}
          </div>
          <span>{label}</span>
        </motion.div>

        {/* FLOATING TOP-RIGHT MICROPHONE/LIVE DOT */}
        <motion.div
          initial={{ opacity: 0, y: 8, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
          className="absolute right-4 top-4 z-10 flex items-center gap-2 will-change-transform"
        >
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-black/60 backdrop-blur-md text-xs border border-white/10">
            {muted ? "🔇" : "🎙️"}
          </span>
          <motion.span
            animate={muted ? { scale: 0.95 } : { scale: 1 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className={`h-2.5 w-2.5 rounded-full bg-gradient-to-br ${accent} animate-pulse`}
          />
        </motion.div>

        {/* FLOATING BOTTOM SUBTITLE/HINT OVERLAY */}
        {hint ? (
          <motion.div
            initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
            className="absolute bottom-4 left-4 right-4 z-10 flex items-center justify-between rounded-2xl bg-black/65 p-3.5 text-xs font-medium text-slate-200 backdrop-blur-md border border-white/10 will-change-transform"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-pink-400">⚡</span>
              <p className="line-clamp-1">{hint}</p>
            </div>
            <button
              type="button"
              className="text-slate-400 hover:text-white transition"
              aria-label="Settings"
            >
              ⚙️
            </button>
          </motion.div>
        ) : null}

      </div>
    </div>
  );
}
