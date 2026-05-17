import { supabase } from "@/integrations/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

const ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
  {
    urls: "turn:openrelay.metered.ca:80",
    username: "openrelayproject",
    credential: "openrelayproject",
  },
];

export interface RemotePeer {
  userId: string;
  stream: MediaStream;
}

type Listener = (peers: Map<string, RemotePeer>) => void;

interface SignalPayload {
  from: string;
  to: string;
  kind: "offer" | "answer" | "ice";
  sdp?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
}

/**
 * Simple mesh WebRTC manager. Signaling uses one Supabase Realtime channel
 * per room with broadcast events + presence to discover peers.
 */
export class WebRTCManager {
  private peers = new Map<string, RTCPeerConnection>();
  private remoteStreams = new Map<string, RemotePeer>();
  private channel: RealtimeChannel | null = null;
  private listeners = new Set<Listener>();
  private localStream: MediaStream | null = null;

  constructor(
    private roomCode: string,
    private userId: string,
  ) {}

  setLocalStream(stream: MediaStream) {
    this.localStream = stream;
    // Replace tracks on existing peers (e.g. after screen share)
    try {
      console.debug("WebRTCManager.setLocalStream", { id: stream.id, tracks: stream.getTracks().map(t => ({ id: t.id, kind: t.kind })) });
    } catch (err) {
      console.debug("WebRTCManager.setLocalStream log failed", err);
    }
    for (const pc of this.peers.values()) {
      const senders = pc.getSenders();
      stream.getTracks().forEach((track) => {
        const sender = senders.find((s) => s.track?.kind === track.kind);
        if (sender) sender.replaceTrack(track);
        else pc.addTrack(track, stream);
      });
    }
  }

  onPeersChange(cb: Listener) {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  private emit() {
    const snapshot = new Map(this.remoteStreams);
    this.listeners.forEach((l) => l(snapshot));
  }

  async connect() {
    const channel = supabase.channel(`room:${this.roomCode}`, {
      config: { presence: { key: this.userId }, broadcast: { self: false } },
    });
    this.channel = channel;

    channel.on("broadcast", { event: "signal" }, ({ payload }) => {
      const sig = payload as SignalPayload;
      if (sig.to !== this.userId) return;
      void this.handleSignal(sig);
    });

    channel.on("presence", { event: "join" }, ({ key }) => {
      if (key === this.userId || this.peers.has(key)) return;
      try {
        const state = channel.presenceState<{ user_id: string; at: number }>();
        const theirMeta = state[key]?.[0];
        const myMeta = state[this.userId]?.[0];
        const myAt = myMeta?.at ?? Date.now();
        const theirAt = theirMeta?.at ?? Date.now();
        // Later joiner should initiate the offer
        if (myAt > theirAt) void this.callPeer(key);
      } catch (err) {
        // Fallback to previous tie-break if presence metadata unavailable
        if (this.userId < key) void this.callPeer(key);
      }
    });

    channel.on("presence", { event: "leave" }, ({ key }) => {
      this.removePeer(key);
    });

    await new Promise<void>((resolve) => {
      channel.subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ user_id: this.userId, at: Date.now() });
          // Initiate calls to peers already in the room
          const state = channel.presenceState<{ user_id: string }>();
          for (const key of Object.keys(state)) {
            if (key === this.userId || this.peers.has(key)) continue;
            try {
              const theirMeta = state[key]?.[0] as { user_id: string; at: number } | undefined;
              const myMeta = state[this.userId]?.[0] as { user_id: string; at: number } | undefined;
              const myAt = myMeta?.at ?? Date.now();
              const theirAt = theirMeta?.at ?? Date.now();
              // Later joiner should initiate the offer
              if (myAt > theirAt) void this.callPeer(key);
            } catch (err) {
              if (this.userId < key) void this.callPeer(key);
            }
          }
          resolve();
        }
      });
    });
  }

  private createPeer(remoteUserId: string): RTCPeerConnection {
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    this.peers.set(remoteUserId, pc);

    // Ensure transceivers exist so audio/video are part of SDP even if tracks arrive later
    try {
      if (!pc.getTransceivers().some((t) => t.receiver.track && t.receiver.track.kind === "audio")) {
        pc.addTransceiver("audio", { direction: "sendrecv" });
      }
      if (!pc.getTransceivers().some((t) => t.receiver.track && t.receiver.track.kind === "video")) {
        pc.addTransceiver("video", { direction: "sendrecv" });
      }
    } catch (err) {
      console.debug("addTransceiver failed or not supported", err);
    }

    if (this.localStream) {
      this.localStream.getTracks().forEach((t) => pc.addTrack(t, this.localStream!));
    }

    pc.ontrack = (e) => {
      const stream = e.streams[0] ?? new MediaStream([e.track]);
      console.debug("pc.ontrack", { from: remoteUserId, streamId: stream.id, tracks: stream.getTracks().map(t=>({ id: t.id, kind: t.kind })) });
      this.remoteStreams.set(remoteUserId, { userId: remoteUserId, stream });
      this.emit();
    };

    pc.onicecandidate = (e) => {
      console.debug("pc.onicecandidate", { from: remoteUserId, candidate: e.candidate?.toJSON() });
      if (e.candidate) {
        void this.send({
          from: this.userId,
          to: remoteUserId,
          kind: "ice",
          candidate: e.candidate.toJSON(),
        });
      }
    };

    pc.onconnectionstatechange = () => {
      console.debug("pc.connectionState", { from: remoteUserId, state: pc.connectionState });
      if (
        pc.connectionState === "failed" ||
        pc.connectionState === "closed" ||
        pc.connectionState === "disconnected"
      ) {
        this.removePeer(remoteUserId);
      }
    };

    // When connected, log sender stats to verify outbound audio is being transmitted
    pc.addEventListener("connectionstatechange", async () => {
      if (pc.connectionState === "connected") {
        try {
          const senders = pc.getSenders();
          console.debug("pc.connected senders", { from: remoteUserId, senders: senders.map(s => ({ id: s.track?.id, kind: s.track?.kind })) });
          for (const s of senders) {
            try {
              const stats = await s.getStats();
              stats.forEach((report) => {
                if (report.type === "outbound-rtp") {
                  console.debug("outbound-rtp stats", { from: remoteUserId, kind: s.track?.kind, bytesSent: (report as any).bytesSent, packetsSent: (report as any).packetsSent });
                }
              });
            } catch (e) {
              console.warn("Failed to get sender stats", e);
            }
          }
        } catch (err) {
          console.warn("Failed to log senders on connect", err);
        }
      }
    });

    pc.oniceconnectionstatechange = () => {
      console.debug("pc.iceConnectionState", { from: remoteUserId, iceState: pc.iceConnectionState, gathering: pc.iceGatheringState });
    };

    return pc;
  }

  private async callPeer(remoteUserId: string) {
    const pc = this.createPeer(remoteUserId);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    await this.send({
      from: this.userId,
      to: remoteUserId,
      kind: "offer",
      sdp: offer,
    });
  }

  private async handleSignal(sig: SignalPayload) {
    let pc = this.peers.get(sig.from);
    if (!pc && sig.kind === "offer") pc = this.createPeer(sig.from);
    if (!pc) return;

    if (sig.kind === "offer" && sig.sdp) {
      await pc.setRemoteDescription(sig.sdp);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      await this.send({
        from: this.userId,
        to: sig.from,
        kind: "answer",
        sdp: answer,
      });
    } else if (sig.kind === "answer" && sig.sdp) {
      await pc.setRemoteDescription(sig.sdp);
    } else if (sig.kind === "ice" && sig.candidate) {
      try {
        await pc.addIceCandidate(sig.candidate);
      } catch (err) {
        console.warn("ICE add failed", err);
      }
    }
  }

  private async send(payload: SignalPayload) {
    if (!this.channel) return;
    await this.channel.send({
      type: "broadcast",
      event: "signal",
      payload,
    });
  }

  private removePeer(remoteUserId: string) {
    const pc = this.peers.get(remoteUserId);
    if (pc) {
      pc.close();
      this.peers.delete(remoteUserId);
    }
    if (this.remoteStreams.delete(remoteUserId)) this.emit();
  }

  async disconnect() {
    for (const id of Array.from(this.peers.keys())) this.removePeer(id);
    if (this.channel) {
      await this.channel.unsubscribe();
      this.channel = null;
    }
    this.listeners.clear();
  }
}
