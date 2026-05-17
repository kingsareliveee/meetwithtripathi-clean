import { useEffect, useState } from "react";
import HomePage from "./pages/HomePage";
import MeetingPage from "./pages/MeetingPage";
import { useMeetingStore } from "./store/useMeetingStore";
import { generateRoomCode } from "./lib/utils";

function parseRoomCode(pathname: string) {
  const match = pathname.match(/^\/room\/([a-zA-Z0-9-]+)$/);
  return match?.[1] ?? "";
}

function App() {
  const { setRoomCode } = useMeetingStore();
  const [roomCode, setRoomCodeState] = useState(() => parseRoomCode(window.location.pathname));

  useEffect(() => {
    const handlePopState = () => {
      setRoomCodeState(parseRoomCode(window.location.pathname));
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigateToRoom = (code: string) => {
    setRoomCode(code);
    window.history.pushState({}, "", `/room/${encodeURIComponent(code)}`);
    setRoomCodeState(code);
  };

  const goHome = () => {
    setRoomCode("");
    window.history.pushState({}, "", "/");
    setRoomCodeState("");
  };

  const handleCreate = () => navigateToRoom(generateRoomCode());
  const handleJoin = (code: string) => navigateToRoom(code.trim());

  if (roomCode) {
    return <MeetingPage roomCode={roomCode} onLeave={goHome} />;
  }

  return <HomePage onCreate={handleCreate} onJoin={handleJoin} />;
}

export default App;
