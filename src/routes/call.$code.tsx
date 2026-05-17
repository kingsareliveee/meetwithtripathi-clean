import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  PhoneOff,
  Copy,
  Loader2,
  Users,
  Share2,
  ArrowLeft,
} from "lucide-react";
import {
  createAnonymousMeeting,
  generateAnonymousUser,
  joinAnonymousMeeting,
  getMeetingByCodeAnonymous,
  leaveAnonymousMeeting,
  getActiveMeetingParticipants,
} from "@/lib/anonymous-meeting";
import { WebRTCManager, type RemotePeer } from "@/lib/webrtc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/call/$code")({
  component: AnonymousCallPage,
});

function AnonymousCallPage() {
  const { code } = Route.useParams();
  const navigate = useNavigate();

  const [meeting, setMeeting] = useState<any>(null);
  const [anonymousUser, setAnonymousUser] = useState<any>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error" | "joining">(
    "loading"
  );
  const [errMsg, setErrMsg] = useState("");
  const [remotes, setRemotes] = useState<Map<string, RemotePeer>>(new Map());
  const [participants, setParticipants] = useState<any[]>([]);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [displayName, setDisplayName] = useState("");
  const [customNameInput, setCustomNameInput] = useState("");
  const [showNameInput, setShowNameInput] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const managerRef = useRef<WebRTCManager | null>(null);

  // Load or create anonymous user
  useEffect(() => {
    const user = generateAnonymousUser();
    setAnonymousUser(user);
    setDisplayName(user.displayName);
  }, []);

  // Bootstrap meeting + media + WebRTC
  useEffect(() => {
    if (!anonymousUser) return;
    let cancelled = false;
    let manager: WebRTCManager | null = null;

    (async () => {
      try {
        setStatus("loading");

        // Get or create meeting
        let m = await getMeetingByCodeAnonymous(code);
        if (!m) {
          m = await createAnonymousMeeting();
          navigate({
            to: "/call/$code",
            params: { code: m.room_code },
            replace: true,
          });
          return;
        }
        setMeeting(m);

        // Join meeting
        setStatus("joining");
        await joinAnonymousMeeting(m.id, displayName);

        // Get participants
        const parts = await getActiveMeetingParticipants(m.id);
        setParticipants(parts || []);

        // Setup media
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true },
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        });

        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        cameraStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // Setup WebRTC
        manager = new WebRTCManager(code, anonymousUser.id);
        manager.setLocalStream(stream);
        manager.onPeersChange((peersMap) => {
          setRemotes(peersMap);
        });
        managerRef.current = manager;

        try {
          await manager.connect();
        } catch (connectErr) {
          console.warn("Connection error:", connectErr);
        }

        setStatus("ready");
      } catch (err: any) {
        if (!cancelled) {
          setErrMsg(err.message || "Failed to setup call");
          setStatus("error");
        }
      }
    })();

    return () => {
      cancelled = true;
      if (manager) manager.disconnect();
      cameraStreamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [anonymousUser, code, navigate, displayName]);

  const handleToggleMic = () => {
    if (cameraStreamRef.current) {
      const audioTracks = cameraStreamRef.current.getAudioTracks();
      audioTracks.forEach((track) => (track.enabled = !micOn));
      setMicOn(!micOn);
    }
  };

  const handleToggleCam = () => {
    if (cameraStreamRef.current) {
      const videoTracks = cameraStreamRef.current.getVideoTracks();
      videoTracks.forEach((track) => (track.enabled = !camOn));
      setCamOn(!camOn);
    }
  };

  const handleLeaveCall = async () => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((t) => t.stop());
    }
    if (managerRef.current) {
      await managerRef.current.disconnect();
    }
    if (meeting && anonymousUser) {
      await leaveAnonymousMeeting(meeting.id, anonymousUser.id);
    }
    navigate({ to: "/" });
  };

  const handleCopyRoomCode = () => {
    navigator.clipboard.writeText(meeting?.room_code || code);
    toast.success("Room code copied! Share it with others");
  };

  const handleShareRoom = () => {
    const url = `${window.location.origin}/call/${meeting?.room_code || code}`;
    if (navigator.share) {
      navigator.share({
        title: "Join my video call",
        text: "Let's video call!",
        url,
      });
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Link copied!");
    }
  };

  const handleChangeName = () => {
    if (customNameInput.trim()) {
      setDisplayName(customNameInput);
      setShowNameInput(false);
      toast.success(`Name updated to ${customNameInput}`);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
        >
          <Loader2 className="h-12 w-12 text-primary" />
        </motion.div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-white mb-2">Setup Failed</h1>
          <p className="text-gray-400 mb-6">{errMsg}</p>
          <Button onClick={() => navigate({ to: "/" })}>Go Home</Button>
        </div>
      </div>
    );
  }

  const remoteArray = Array.from(remotes.values());
  const gridCols =
    remoteArray.length === 0
      ? 1
      : remoteArray.length === 1
        ? 2
        : remoteArray.length <= 4
          ? 2
          : 3;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-black flex flex-col"
    >
      {/* Header */}
      <motion.div
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        className="bg-gray-900/80 backdrop-blur border-b border-gray-800 px-4 py-4 md:px-6"
      >
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-lg font-bold text-white">
                {meeting?.title || "Anonymous Video Call"}
              </h1>
              <p className="text-xs text-gray-400 font-mono">
                Code: {meeting?.room_code || code}
              </p>
            </div>
          </div>
          <motion.div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyRoomCode}
              className="text-xs"
            >
              <Copy className="h-4 w-4 mr-1" />
              Copy Code
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleShareRoom}
              className="text-xs"
            >
              <Share2 className="h-4 w-4 mr-1" />
              Share
            </Button>
            <div className="flex items-center gap-1 px-3 py-2 bg-gray-800 rounded-lg">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-white">
                {participants.length + 1}
              </span>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Video Grid */}
      <div className="flex-1 overflow-hidden p-4 md:p-6">
        <div
          className={`grid gap-4 h-full auto-rows-fr`}
          style={{
            gridTemplateColumns: `repeat(${Math.min(gridCols, remoteArray.length + 1)}, 1fr)`,
          }}
        >
          {/* Local Video */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative bg-gray-900 rounded-lg overflow-hidden border-2 border-primary"
          >
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-3 left-3 bg-black/70 px-3 py-1 rounded-full">
              <p className="text-xs font-semibold text-white">{displayName}</p>
            </div>
          </motion.div>

          {/* Remote Videos */}
          <AnimatePresence>
            {remoteArray.map((peer) => (
              <motion.div
                key={peer.userId}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="relative bg-gray-900 rounded-lg overflow-hidden"
              >
                <video
                  autoPlay
                  playsInline
                  ref={(el) => {
                    if (el) el.srcObject = peer.stream;
                  }}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-3 left-3 bg-black/70 px-3 py-1 rounded-full">
                  <p className="text-xs font-semibold text-white">{peer.userId}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Controls */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="bg-gray-900/80 backdrop-blur border-t border-gray-800 px-4 py-6 md:px-6"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-4">
          {/* Display Name Editor */}
          <AnimatePresence>
            {showNameInput ? (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "auto", opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="flex gap-2"
              >
                <Input
                  value={customNameInput}
                  onChange={(e) => setCustomNameInput(e.target.value)}
                  placeholder="Enter your name"
                  onKeyDown={(e) => e.key === "Enter" && handleChangeName()}
                  className="w-40"
                  autoFocus
                />
                <Button size="sm" onClick={handleChangeName}>
                  Set
                </Button>
              </motion.div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setCustomNameInput(displayName);
                  setShowNameInput(true);
                }}
                className="px-3 py-2 rounded-lg bg-gray-800 text-sm font-medium text-white hover:bg-gray-700"
              >
                {displayName}
              </motion.button>
            )}
          </AnimatePresence>

          {/* Media Controls */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleToggleMic}
            className={`p-4 rounded-full ${
              micOn
                ? "bg-gray-700 hover:bg-gray-600 text-white"
                : "bg-red-600 hover:bg-red-700 text-white"
            }`}
          >
            {micOn ? (
              <Mic className="h-6 w-6" />
            ) : (
              <MicOff className="h-6 w-6" />
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleToggleCam}
            className={`p-4 rounded-full ${
              camOn
                ? "bg-gray-700 hover:bg-gray-600 text-white"
                : "bg-red-600 hover:bg-red-700 text-white"
            }`}
          >
            {camOn ? (
              <VideoIcon className="h-6 w-6" />
            ) : (
              <VideoOff className="h-6 w-6" />
            )}
          </motion.button>

          {/* End Call Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLeaveCall}
            className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white"
          >
            <PhoneOff className="h-6 w-6" />
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
