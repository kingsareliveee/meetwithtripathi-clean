import { create } from "zustand";

interface MeetingState {
  roomCode: string;
  setRoomCode: (code: string) => void;
}

export const useMeetingStore = create<MeetingState>((set) => ({
  roomCode: "",
  setRoomCode: (code) => set({ roomCode: code }),
}));
