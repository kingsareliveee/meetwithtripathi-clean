import { useEffect, useRef } from "react";

interface VideoTileProps {
  label: string;
  stream?: MediaStream | null;
  muted?: boolean;
  accent?: string;
  hint?: string;
}

export function VideoTile({ label, stream, muted = false, accent = "from-pink-500 to-fuchsia-500", hint }: VideoTileProps) {
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

  return (
    <div className="rounded-[2.25rem] border border-border bg-card p-4 shadow-md transition hover:shadow-lg duration-200">
      
      {/* Video Container with floating overlay elements */}
      <div className="relative overflow-hidden rounded-[1.75rem] bg-slate-950 border border-border/10 aspect-video w-full">
        
        <video
          ref={videoRef}
          muted={muted}
          autoPlay
          playsInline
          className="h-full w-full object-cover"
        />

        {/* FLOATING TOP-LEFT NAME BADGE (Frosted glass like reference screen) */}
        <div className="absolute left-4 top-4 z-10 flex items-center gap-2 rounded-full bg-black/60 px-3.5 py-1.5 text-xs font-bold text-white backdrop-blur-md border border-white/10">
          <div className="h-5 w-5 rounded-full bg-pink-500/20 text-pink-300 flex items-center justify-center font-display text-[10px]">
            {label.substring(0, 2).toUpperCase()}
          </div>
          <span>{label}</span>
        </div>

        {/* FLOATING TOP-RIGHT MICROPHONE/LIVE DOT */}
        <div className="absolute right-4 top-4 z-10 flex items-center gap-2">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-black/60 backdrop-blur-md text-xs border border-white/10">
            {muted ? "🔇" : "🎙️"}
          </span>
          <span className={`h-2.5 w-2.5 rounded-full bg-gradient-to-br ${accent} animate-pulse`} />
        </div>

        {/* FLOATING BOTTOM SUBTITLE/HINT OVERLAY (Like reference subtitle bar) */}
        {hint ? (
          <div className="absolute bottom-4 left-4 right-4 z-10 flex items-center justify-between rounded-2xl bg-black/65 p-3.5 text-xs font-medium text-slate-200 backdrop-blur-md border border-white/10">
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
          </div>
        ) : null}

      </div>
    </div>
  );
}
