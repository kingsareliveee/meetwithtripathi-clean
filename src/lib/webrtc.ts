import { supabase } from "@/integrations/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

const ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
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
      // Tie-break: lower userId initiates the offer
      if (this.userId < key) void this.callPeer(key);
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
            if (this.userId < key) void this.callPeer(key);
          }
          resolve();
        }
      });
    });
  }

  private createPeer(remoteUserId: string): RTCPeerConnection {
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    this.peers.set(remoteUserId, pc);

    if (this.localStream) {
      this.localStream.getTracks().forEach((t) => pc.addTrack(t, this.localStream!));
    }

    pc.ontrack = (e) => {
      const stream = e.streams[0] ?? new MediaStream([e.track]);
      this.remoteStreams.set(remoteUserId, { userId: remoteUserId, stream });
      this.emit();
    };

    pc.onicecandidate = (e) => {
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
      if (
        pc.connectionState === "failed" ||
        pc.connectionState === "closed" ||
        pc.connectionState === "disconnected"
      ) {
        this.removePeer(remoteUserId);
      }
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
