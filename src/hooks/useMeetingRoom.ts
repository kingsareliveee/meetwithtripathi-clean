import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import { createMessageId, shortClientId } from "../lib/utils";

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
];

function createPeerId() {
  return crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2, 10);
}

export function useMeetingRoom(roomCode: string) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [connected, setConnected] = useState(false);
  const [connectionState, setConnectionState] = useState("waiting");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [peerCount, setPeerCount] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const channelRef = useRef<any>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const clientIdRef = useRef<string>(createPeerId());
  const hasCreatedOfferRef = useRef(false);

  const connectionLabel = useMemo(() => {
    if (error) return "Error";
    if (connected) return "Connected";
    if (connectionState === "connecting") return "Connecting";
    return "Waiting";
  }, [connected, connectionState, error]);

  useEffect(() => {
    let cancelled = false;

    async function setupRoom() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        });

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        setLocalStream(stream);
        localStreamRef.current = stream;

        const peerConnection = new RTCPeerConnection({ iceServers: STUN_SERVERS });
        peerConnectionRef.current = peerConnection;

        const remoteMediaStream = new MediaStream();
        setRemoteStream(remoteMediaStream);

        peerConnection.ontrack = (event) => {
          event.streams[0]?.getTracks().forEach((track) => remoteMediaStream.addTrack(track));
        };

        peerConnection.onconnectionstatechange = () => {
          const state = peerConnection.connectionState;
          setConnectionState(state);
          setConnected(state === "connected");
          if (state === "failed" || state === "disconnected") {
            setError("Connection interrupted. Refresh or leave and join again.");
          }
        };

        peerConnection.onicecandidate = async (event) => {
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
        await channel.track({ clientId: clientIdRef.current, joinedAt: new Date().toISOString() });

        channelRef.current = channel;

        await sendSignal({ type: "join", clientId: clientIdRef.current });
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

    async function handleSignal(payload: any) {
      if (!payload || payload.clientId === clientIdRef.current) {
        return;
      }

      const peerConnection = peerConnectionRef.current;
      if (!peerConnection) return;

      if (payload.type === "join") {
        const remoteId = payload.clientId;
        if (remoteId && clientIdRef.current < remoteId && !hasCreatedOfferRef.current) {
          await createOffer();
        }
        return;
      }

      if (payload.type === "offer") {
        const offer = payload.offer;
        if (!offer) return;
        await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        await sendSignal({
          type: "answer",
          clientId: clientIdRef.current,
          answer,
        });
        return;
      }

      if (payload.type === "answer") {
        const answer = payload.answer;
        if (!answer) return;
        await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        return;
      }

      if (payload.type === "ice") {
        const candidate = payload.candidate;
        if (!candidate) return;
        try {
          await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (error) {
          console.warn("Failed to add ICE candidate", error);
        }
      }
    }

    async function createOffer() {
      const peerConnection = peerConnectionRef.current;
      if (!peerConnection) return;
      try {
        hasCreatedOfferRef.current = true;
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        await channelRef.current?.send({
          type: "broadcast",
          event: "signal",
          payload: {
            type: "offer",
            clientId: clientIdRef.current,
            offer,
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
  }, [roomCode]);

  const sendChat = async (text: string) => {
    const message = {
      id: createMessageId(),
      sender: shortClientId(clientIdRef.current),
      text,
      time: new Date().toISOString(),
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
    sendChat,
    toggleMute,
    toggleCamera,
  };
}
