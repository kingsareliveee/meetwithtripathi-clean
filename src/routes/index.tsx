import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Video, Link2, ShieldCheck, Sparkles, ArrowRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import { createAnonymousMeeting } from "@/lib/anonymous-meeting";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  const navigate = useNavigate();
  const [joinCode, setJoinCode] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const handleStartCall = async () => {
    try {
      setIsCreating(true);
      const meeting = await createAnonymousMeeting();
      navigate({ to: "/call/$code", params: { code: meeting.room_code } });
    } catch (err) {
      toast.error("Failed to create meeting");
      setIsCreating(false);
    }
  };

  const handleJoinCall = () => {
    if (!joinCode.trim()) {
      toast.error("Please enter a room code");
      return;
    }
    setIsJoining(true);
    navigate({ to: "/call/$code", params: { code: joinCode.trim() } });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-950 via-gray-900 to-black">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
          className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
          }}
          transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"
        />
      </div>

      {/* Header */}
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="relative z-10 px-6 py-8 md:px-12"
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition">
            <div className="grid place-items-center h-10 w-10 rounded-lg bg-primary text-primary-foreground">
              <Video className="h-6 w-6" />
            </div>
            <span className="font-display font-semibold text-xl text-white">
              MeetwithTripathi
            </span>
          </Link>
          <p className="text-sm text-gray-400">Anonymous • Instant • Secure</p>
        </div>
      </motion.header>

      {/* Main Content */}
      <motion.main
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="relative z-10 flex-1 px-6 py-12 md:px-12 flex items-center"
      >
        <div className="max-w-5xl mx-auto w-full">
          {/* Hero */}
          <div className="text-center mb-16">
            <motion.h1
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-primary to-blue-500 bg-clip-text text-transparent"
            >
              Video Calls,
              <br />
              Zero Setup
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-12"
            >
              Start instant video calls anonymously. No account needed. Share a code and call anyone, anywhere.
            </motion.p>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="grid md:grid-cols-3 gap-4 mb-16"
            >
              {[
                { icon: Sparkles, label: "Instant", desc: "No signup required" },
                { icon: Video, label: "Secure", desc: "End-to-end encrypted" },
                { icon: Link2, label: "Easy", desc: "Share a code to join" },
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -5 }}
                  className="p-4 rounded-lg bg-gray-800/50 border border-gray-700 hover:border-primary/50 transition-colors"
                >
                  <feature.icon className="h-8 w-8 text-primary mx-auto mb-2" />
                  <h3 className="font-semibold text-white">{feature.label}</h3>
                  <p className="text-sm text-gray-400">{feature.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Action Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid md:grid-cols-2 gap-6 mb-8"
          >
            {/* Start Call */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-8 rounded-2xl bg-gradient-to-br from-primary/20 to-blue-600/20 border-2 border-primary/50 hover:border-primary transition-all"
            >
              <ArrowRight className="h-12 w-12 text-primary mb-4" />
              <h2 className="text-2xl font-bold text-white mb-3">Start a Call</h2>
              <p className="text-gray-400 mb-6">Create an instant video room and invite others</p>
              <Button
                onClick={handleStartCall}
                disabled={isCreating}
                className="w-full bg-primary hover:bg-primary/90"
                size="lg"
              >
                {isCreating ? "Creating..." : "Start Now"}
              </Button>
            </motion.div>

            {/* Join Call */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-8 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 border-2 border-blue-500/50 hover:border-blue-500 transition-all"
            >
              <Plus className="h-12 w-12 text-blue-400 mb-4" />
              <h2 className="text-2xl font-bold text-white mb-3">Join a Call</h2>
              <p className="text-gray-400 mb-6">Enter a room code to join someone's call</p>
              <div className="flex gap-2 mb-4">
                <Input
                  placeholder="Enter room code"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleJoinCall()}
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                />
              </div>
              <Button
                onClick={handleJoinCall}
                disabled={isJoining || !joinCode.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                {isJoining ? "Joining..." : "Join Call"}
              </Button>
            </motion.div>
          </motion.div>

          {/* Example */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-center text-sm text-gray-500 p-4 rounded-lg bg-gray-900/50 border border-gray-800"
          >
            <p>Example room code: <code className="text-primary font-mono">abcd-1234</code></p>
          </motion.div>
        </div>
      </motion.main>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="relative z-10 px-6 py-8 text-center text-gray-500 text-sm"
      >
        <p>No account • No data collection • Built for you</p>
      </motion.footer>
    </div>
  );
}
