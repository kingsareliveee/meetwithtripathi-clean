import { create } from "zustand";

interface MeetingState {
  roomCode: string;
  userName: string;
  setRoomCode: (code: string) => void;
  setUserName: (name: string) => void;
}

export const useMeetingStore = create<MeetingState>((set) => ({
  roomCode: "",
  userName: localStorage.getItem("meet_user_name") || "",
  setRoomCode: (code) => set({ roomCode: code }),
  setUserName: (name) => {
    localStorage.setItem("meet_user_name", name);
    set({ userName: name });
  },
}));
