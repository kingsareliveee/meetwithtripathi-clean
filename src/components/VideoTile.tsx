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
    }
  }, [stream]);

  return (
    <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-4 shadow-[0_30px_80px_rgba(255,0,143,0.08)]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-100">{label}</p>
          {hint ? <p className="text-xs text-slate-400">{hint}</p> : null}
        </div>
        <div className={`h-2.5 w-2.5 rounded-full bg-gradient-to-br ${accent}`} />
      </div>
      <div className="overflow-hidden rounded-[1.75rem] bg-slate-900/80">
        <video
          ref={videoRef}
          muted={muted}
          autoPlay
          playsInline
          className="h-72 w-full bg-slate-950 object-cover sm:h-80"
        />
      </div>
    </div>
  );
}
