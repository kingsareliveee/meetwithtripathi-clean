import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import HomePage from "./pages/HomePage";
import MeetingPage from "./pages/MeetingPage";
import { useMeetingStore } from "./store/useMeetingStore";
import { generateRoomCode } from "./lib/utils";

function parseRoomCode(pathname: string) {
  const match = pathname.match(/^\/room\/([a-zA-Z0-9-]+)$/);
  return match?.[1] ?? "";
}

function App() {
  const { setRoomCode, userName } = useMeetingStore();
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

  return (
    <AnimatePresence mode="wait" initial={false}>
      {roomCode ? (
        <motion.div
          key={`meeting:${roomCode}`}
          initial={{ opacity: 0, y: 10, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -10, filter: "blur(10px)" }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="h-full"
        >
          <MeetingPage roomCode={roomCode} userName={userName || "Anonymous"} onLeave={goHome} />
        </motion.div>
      ) : (
        <motion.div
          key="home"
          initial={{ opacity: 0, y: 10, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -10, filter: "blur(10px)" }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="h-full"
        >
          <HomePage onCreate={handleCreate} onJoin={handleJoin} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default App;
