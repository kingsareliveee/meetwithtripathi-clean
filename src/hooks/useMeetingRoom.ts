import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import { createMessageId } from "../lib/utils";

export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  time: string;
  local?: boolean;
}

const STUN_SERVERS = [
  { urls: "stun:stun1.l.google.com:19302" },
  { urls: "stun:stun2.l.google.com:19302" },
  { urls: "stun:stun.l.google.com:19302" },
  {
    urls: "turn:openrelay.metered.ca:80",
    username: "openrelayproject",
    credential: "openrelayproject",
  },
];

function createPeerId() {
  return crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2, 10);
}

export function useMeetingRoom(roomCode: string, userName: string = "Anonymous") {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [connected, setConnected] = useState(false);
  const [connectionState, setConnectionState] = useState("waiting");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [peerCount, setPeerCount] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remoteUserName, setRemoteUserName] = useState<string>("Remote Peer");

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const channelRef = useRef<any>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const clientIdRef = useRef<string>(createPeerId());
  const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([]);

  const connectionLabel = useMemo(() => {
    if (error) return "Error";
    if (connected) return "Connected";
    if (connectionState === "connecting") return "Connecting";
    return "Waiting";
  }, [connected, connectionState, error]);

  useEffect(() => {
    let cancelled = false;
    let heartbeatInterval: any = null;

    async function setupRoom() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        });

        console.debug("Acquired local media stream", {
          id: stream.id,
          audioTracks: stream.getAudioTracks().map((t) => ({ id: t.id, kind: t.kind, enabled: t.enabled })),
          videoTracks: stream.getVideoTracks().map((t) => ({ id: t.id, kind: t.kind, enabled: t.enabled })),
        });

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        setLocalStream(stream);
        localStreamRef.current = stream;
        stream.getAudioTracks().forEach((t) => {
          t.enabled = true;
        });

        const peerConnection = new RTCPeerConnection({ iceServers: STUN_SERVERS });
        peerConnectionRef.current = peerConnection;

        const remoteMediaStream = new MediaStream();
        setRemoteStream(remoteMediaStream);

        peerConnection.ontrack = (event) => {
          console.debug("peerConnection.ontrack", { event });
          const tracks = event.streams[0]?.getTracks() ?? [event.track];
          tracks.forEach((track) => {
            console.debug("Adding remote track to remoteMediaStream", { kind: track.kind, id: track.id });
            try {
              remoteMediaStream.addTrack(track);
            } catch (err) {
              console.warn("Failed to add remote track", err);
            }
          });
        };

        peerConnection.onconnectionstatechange = () => {
          const state = peerConnection.connectionState;
          console.debug("Peer connection state change", state);
          setConnectionState(state);
          setConnected(state === "connected");
          if (state === "failed" || state === "disconnected") {
            setError("Connection interrupted. Refresh or leave and join again.");
          }
        };

        peerConnection.onicecandidate = async (event) => {
          console.debug("onicecandidate", event?.candidate);
          if (!event.candidate) return;
          await sendSignal({
            type: "ice",
            clientId: clientIdRef.current,
            candidate: event.candidate.toJSON(),
          });
        };

        stream.getTracks().forEach((track) => peerConnection.addTrack(track, stream));

        const channel = supabase.channel(`room:${roomCode}`, {
          config: { broadcast: { self: true } },
        });

        channel.on("broadcast", { event: "signal" }, async (payload: any) => {
          await handleSignal(payload?.payload);
        });

        channel.on("broadcast", { event: "chat" }, (payload: any) => {
          const chat = payload?.payload;
          if (!chat || chat.clientId === clientIdRef.current) return;
          setMessages((existing) => [
            ...existing,
            {
              id: chat.id,
              sender: chat.sender,
              text: chat.text,
              time: chat.time,
              local: false,
            },
          ]);
        });

        channel.on("presence", { event: "sync" }, () => {
          const presenceState = channel.presenceState?.() ?? {};
          setPeerCount(Object.keys(presenceState).length || 1);
        });

        await channel.subscribe();
        await channel.track({ clientId: clientIdRef.current, userName, joinedAt: new Date().toISOString() });

        channelRef.current = channel;

        // Periodic join ping heartbeat to guarantee connection on permission screen delay
        heartbeatInterval = setInterval(async () => {
          if (peerConnectionRef.current && peerConnectionRef.current.connectionState !== "connected") {
            console.debug("Periodic peer join negotiation heartbeat...");
            await sendSignal({ type: "join", clientId: clientIdRef.current, userName });
          }
        }, 3000);

        await sendSignal({ type: "join", clientId: clientIdRef.current, userName });
        setConnectionState("waiting");
      } catch (reason) {
        console.error(reason);
        if (!cancelled) {
          setError("Unable to access camera or microphone.");
        }
      }
    }

    async function sendSignal(payload: Record<string, unknown>) {
      if (!channelRef.current) return;
      await channelRef.current.send({
        type: "broadcast",
        event: payload.type === "chat" ? "chat" : "signal",
        payload,
      });
    }

    // Drain and apply any queued ICE candidates after setRemoteDescription settles
    async function drainIceCandidates(pc: RTCPeerConnection) {
      const candidates = pendingCandidatesRef.current;
      pendingCandidatesRef.current = [];
      for (const candidate of candidates) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
          console.debug("Applied queued ICE candidate successfully");
        } catch (err) {
          console.warn("Failed to apply queued ICE candidate", err);
        }
      }
    }

    async function handleSignal(payload: any) {
      if (!payload || payload.clientId === clientIdRef.current) {
        return;
      }

      const peerConnection = peerConnectionRef.current;
      if (!peerConnection) return;

      // Read remote user name if sent
      if (payload.userName) {
        setRemoteUserName(payload.userName);
      }

      if (payload.type === "join") {
        const remoteId = payload.clientId;
        // Offerer is peer with lexicographically lower clientId
        if (remoteId && clientIdRef.current < remoteId) {
          console.debug("offerer initiating signaling negotiations");
          await createOffer();
        }
        return;
      }

      if (payload.type === "offer") {
        const offer = payload.offer;
        if (!offer) return;
        await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
        await drainIceCandidates(peerConnection);
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        await sendSignal({
          type: "answer",
          clientId: clientIdRef.current,
          answer,
          userName,
        });
        return;
      }

      if (payload.type === "answer") {
        const answer = payload.answer;
        if (!answer) return;
        await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        await drainIceCandidates(peerConnection);
        return;
      }

      if (payload.type === "ice") {
        const candidate = payload.candidate;
        if (!candidate) return;
        try {
          if (peerConnection.remoteDescription && peerConnection.remoteDescription.type) {
            await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
          } else {
            console.debug("Queueing ICE candidate until RemoteDescription is set");
            pendingCandidatesRef.current.push(candidate);
          }
        } catch (error) {
          console.warn("Failed to add ICE candidate", error);
        }
      }
    }

    async function createOffer() {
      const peerConnection = peerConnectionRef.current;
      if (!peerConnection) return;
      try {
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        await channelRef.current?.send({
          type: "broadcast",
          event: "signal",
          payload: {
            type: "offer",
            clientId: clientIdRef.current,
            offer,
            userName,
          },
        });
        setConnectionState("connecting");
      } catch (error) {
        console.error(error);
      }
    }

    setupRoom();

    return () => {
      cancelled = true;
      if (heartbeatInterval) clearInterval(heartbeatInterval);
      const cleanup = async () => {
        if (channelRef.current) {
          await channelRef.current.unsubscribe();
          channelRef.current = null;
        }
        if (peerConnectionRef.current) {
          peerConnectionRef.current.close();
          peerConnectionRef.current = null;
        }
        if (localStreamRef.current) {
          localStreamRef.current.getTracks().forEach((track) => track.stop());
          localStreamRef.current = null;
        }
        setLocalStream(null);
        setRemoteStream(null);
      };
      cleanup();
    };
  }, [roomCode, userName]);

  const sendChat = async (text: string) => {
    const message = {
      id: createMessageId(),
      sender: userName,
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      local: true,
      clientId: clientIdRef.current,
    } as unknown as Record<string, unknown>;

    setMessages((existing) => [
      ...existing,
      {
        id: message.id as string,
        sender: message.sender as string,
        text: message.text as string,
        time: message.time as string,
        local: true,
      },
    ]);

    if (channelRef.current) {
      await channelRef.current.send({
        type: "broadcast",
        event: "chat",
        payload: message,
      });
    }
  };

  const toggleMute = () => {
    if (!localStream) return;
    localStream.getAudioTracks().forEach((track) => {
      track.enabled = !track.enabled;
    });
    setIsMuted((state) => !state);
  };

  const toggleCamera = () => {
    if (!localStream) return;
    localStream.getVideoTracks().forEach((track) => {
      track.enabled = !track.enabled;
    });
    setCameraOff((state) => !state);
  };

  return {
    localStream,
    remoteStream,
    connectionLabel,
    connected,
    connectionState,
    messages,
    peerCount,
    isMuted,
    cameraOff,
    error,
    remoteUserName,
    sendChat,
    toggleMute,
    toggleCamera,
  };
}
