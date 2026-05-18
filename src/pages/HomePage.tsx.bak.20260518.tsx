import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { useMeetingStore } from "../store/useMeetingStore";

interface HomePageProps {
  onCreate: () => void;
  onJoin: (code: string) => void;
}

type TabType = "features" | "safety" | "about" | "how-it-works" | null;

export default function HomePage({ onCreate, onJoin }: HomePageProps) {
  const [roomCode, setRoomCode] = useState("");
  const { userName, setUserName } = useMeetingStore();
  const [activeTab, setActiveTab] = useState<TabType>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // App Onboarding Intro state
  const [showIntro, setShowIntro] = useState(true);
  const [introProgress, setIntroProgress] = useState(42);

  useEffect(() => {
    if (!showIntro) return;

    const interval = window.setInterval(() => {
      setIntroProgress((current) => {
        if (current >= 99) return 99;
        const next = current + Math.max(1, Math.round((100 - current) * 0.08));
        return next > 99 ? 99 : next;
      });
    }, 220);

    return () => window.clearInterval(interval);
  }, [showIntro]);

  // Real Dark Mode state and handler
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      return document.documentElement.classList.contains("dark") || 
        (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches);
    }
    return false;
  });

  useEffect(() => {
    const theme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (theme === "dark" || (!theme && systemPrefersDark)) {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    } else {
      document.documentElement.classList.remove("dark");
      setIsDark(false);
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  };

  const focusNameInput = () => {
    nameInputRef.current?.focus();
    nameInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  // Cinematic stagger variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 18, filter: "blur(8px)" },
    show: { 
      opacity: 1, 
      y: 0, 
      filter: "blur(0px)",
      transition: { type: "spring", stiffness: 100, damping: 15 }
    },
  };

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-br from-[#f5f8fc] via-[#edf2f7] to-[#e4ebf3] dark:from-[#080b11] dark:via-[#0e1320] dark:to-[#090c15] text-slate-800 dark:text-slate-200 overflow-x-hidden font-sans select-none flex flex-col items-center justify-start transition-colors duration-500">
      {/* SOFT LUXURY AMBIENT BLOBS */}
      <div className="absolute top-[10%] left-[5%] w-[45vw] h-[45vw] rounded-full bg-blue-200/20 dark:bg-indigo-950/15 blur-[130px] pointer-events-none animate-blob-1" />
      <div className="absolute bottom-[15%] right-[5%] w-[50vw] h-[50vw] rounded-full bg-indigo-200/15 dark:bg-purple-950/10 blur-[150px] pointer-events-none animate-blob-2" />
      <div className="absolute top-[40%] right-[20%] w-[30vw] h-[30vw] rounded-full bg-purple-200/15 dark:bg-blue-950/10 blur-[120px] pointer-events-none animate-blob-3" />

      <AnimatePresence mode="wait">
        {showIntro ? (
          /* ========================================== */
          /* STEP 1 — FULLSCREEN PREMIUM INTRO COVER    */
          /* ========================================== */
          <motion.div
            key="intro-screen"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.98, filter: "blur(18px)" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-50 overflow-hidden bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.7),_transparent_45%),radial-gradient(circle_at_bottom_left,_rgba(148,163,184,0.13),_transparent_25%),linear-gradient(180deg,#f8fafc_0%,#eef2f7_60%,#e2e8f0_100%)] dark:bg-[radial-gradient(circle_at_top_right,_rgba(15,23,42,0.65),_transparent_45%),radial-gradient(circle_at_bottom_left,_rgba(79,70,229,0.1),_transparent_25%),linear-gradient(180deg,#05070d_0%,#0b1220_55%,#090b12_100%)]"
          >
            <div className="absolute inset-0 bg-white/70 dark:bg-slate-950/30 backdrop-blur-3xl" />
            <div className="absolute left-[-12%] top-1/4 h-96 w-96 rounded-full bg-slate-100/70 dark:bg-white/10 blur-3xl opacity-80" />
            <div className="absolute right-[-8%] top-0 h-[26rem] w-[26rem] rounded-full bg-slate-200/60 dark:bg-indigo-900/20 blur-3xl opacity-70" />
            <div className="absolute inset-x-0 top-[12%] h-36 bg-white/30 dark:bg-slate-900/20 blur-3xl" />

            <div className="relative z-10 flex min-h-screen w-full items-center justify-center px-6 py-10">
              <div className="w-full max-w-4xl">
                <motion.div
                  initial={{ opacity: 0, y: 24, filter: "blur(14px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col items-center gap-10 rounded-[2rem] border border-white/70 dark:border-slate-800/70 bg-white/70 dark:bg-slate-950/75 shadow-[0_40px_120px_rgba(15,23,42,0.12)] backdrop-blur-3xl p-10 md:p-12"
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-white/90 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800/80 shadow-sm backdrop-blur-xl">
                      <img src="/velora-logo.png" className="h-6.5 w-6.5 object-contain dark:invert" alt="Velora" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">Velora</p>
                      <h1 className="mt-3 text-4xl md:text-5xl font-semibold tracking-tight text-slate-950 dark:text-white">Preparing your private video space</h1>
                    </div>
                  </div>

                  <div className="relative flex items-center justify-center">
                    <motion.div
                      animate={{ scale: [1, 1.02, 1] }}
                      transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute inset-0 rounded-full bg-slate-900/5 dark:bg-white/10"
                    />
                    <div className="relative flex h-[220px] w-[220px] items-center justify-center rounded-full bg-white/85 dark:bg-slate-950/85 border border-slate-200/80 dark:border-slate-800/80 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur-2xl">
                      <motion.div
                        initial={{ rotate: 0 }}
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
                        className="absolute inset-4 rounded-full border-2 border-slate-200/70 dark:border-slate-700/60"
                      />
                      <div className="absolute inset-8 rounded-full border border-slate-200/50 dark:border-slate-700/40" />
                      <div className="relative flex flex-col items-center justify-center gap-2">
                        <span className="text-5xl md:text-6xl font-semibold text-slate-950 dark:text-white">{introProgress}%</span>
                        <span className="text-xs uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">Loading</span>
                      </div>
                    </div>
                  </div>

                  <p className="max-w-2xl text-center text-sm leading-7 text-slate-600 dark:text-slate-300">
                    Preparing your secure private space with premium performance, smooth connection, and zero friction.
                  </p>

                  <motion.button
                    onClick={() => setShowIntro(false)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="inline-flex items-center justify-center rounded-full bg-slate-950 dark:bg-white px-7 py-3 text-sm font-semibold text-white dark:text-slate-950 shadow-lg shadow-slate-900/10 dark:shadow-white/10 transition duration-300"
                  >
                    Continue
                  </motion.button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        ) : (
          /* ========================================== */
          /* STEP 3 — ACTUAL APPLICATION UI APPEARS     */
          /* ========================================== */
          <motion.div
            key="app-ui"
            initial={{ opacity: 0, scale: 0.98, filter: "blur(12px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-7xl flex flex-col items-center py-6 md:py-10 px-4 md:px-8 z-10 relative"
          >
            {/* 1. DESKTOP OPTIMIZED UX (lg screen and up) */}
            <div className="hidden lg:flex w-full flex-col items-center gap-8">
              {/* DESKTOP FLOATING NAVBAR */}
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="w-full rounded-[2rem] bg-white/85 dark:bg-slate-950/80 border border-white/75 dark:border-slate-800/70 shadow-[0_24px_80px_rgba(15,23,42,0.06)] backdrop-blur-xl p-5 mt-4"
              >
                 <div className="space-y-2.5 mb-4">
                   <h2 className="text-lg font-semibold text-slate-900 dark:text-white tracking-tight">Create a room</h2>
                   <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                     <svg className="w-3 h-3 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                       <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                     </svg>
                     <span className="text-[11px]">Your privacy is our priority</span>
                   </div>
                 </div>

                <nav className="flex items-center gap-6">
                  <button
                    onClick={() => setActiveTab(null)}
                    className={`text-sm font-medium transition ${activeTab === null ? "text-slate-950 dark:text-white" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"}`}
                  >
                    Home
                  </button>
                  <button
                    onClick={() => setActiveTab("features")}
                    className={`text-sm font-medium transition ${activeTab === "features" ? "text-slate-950 dark:text-white" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"}`}
                  >
                    Features
                  </button>
                  <button
                    onClick={() => setActiveTab("how-it-works")}
                    className={`text-sm font-medium transition ${activeTab === "how-it-works" ? "text-slate-950 dark:text-white" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"}`}
                  >
                    How it works
                  </button>
                  <button
                    onClick={() => setActiveTab("safety")}
                    className={`text-sm font-medium transition ${activeTab === "safety" ? "text-slate-950 dark:text-white" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"}`}
                  >
                    Safety
                  </button>
                  <button
                    onClick={() => setActiveTab("about")}
                    className={`text-sm font-medium transition ${activeTab === "about" ? "text-slate-950 dark:text-white" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"}`}
                  >
                    About
                  </button>
                </nav>

                <div className="flex items-center gap-3">
                  <motion.button
                    onClick={toggleTheme}
                    aria-label="Toggle theme"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/80 text-slate-600 dark:text-slate-300 shadow-sm transition duration-200 hover:bg-white dark:hover:bg-slate-900"
                  >
                    {isDark ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-11.314l.707.707m11.314 11.314l.707-.707M12 17a5 5 0 100-10 5 5 0 000 10z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                      </svg>
                    )}
                  </motion.button>

                  <motion.button
                    whileHover={{ y: -2, scale: 1.03, boxShadow: "0 10px 25px rgba(0,0,0,0.08)" }}
                    whileTap={{ scale: 0.97 }}
                    onClick={focusNameInput}
                    className="px-5 py-2.5 rounded-full bg-slate-950 dark:bg-white text-white dark:text-slate-950 text-sm font-semibold shadow-lg shadow-slate-900/10 dark:shadow-white/5 transition duration-300"
                  >
                    Get Started
                  </motion.button>
                </div>
              </motion.div>

              {/* MAIN LUXURY GLASS PANE CONTAINER */}
              <motion.main
                initial={{ y: 25, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
                className="w-full rounded-[2.5rem] glass-pane premium-shimmer shadow-[0_30px_80px_rgba(0,0,0,0.02)] p-12 flex flex-col gap-14 overflow-hidden relative"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.03] dark:via-white/[0.01] to-transparent pointer-events-none" />

                <div className="grid grid-cols-[1.1fr_0.9fr] gap-16 relative z-10">
                  <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="flex flex-col justify-center gap-7"
                  >
                    <motion.div 
                      variants={itemVariants}
                      className="inline-flex items-center gap-2 self-start rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100/50 dark:border-indigo-900/30 px-4 py-1.5 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest shadow-sm"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
                      Anonymous rooms in seconds
                    </motion.div>

                    <motion.h1 
                      variants={itemVariants}
                      className="text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15] font-display"
                    >
                      Private conversations. <br />
                      <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 dark:from-indigo-400 dark:via-purple-400 dark:to-indigo-400">
                        Instant connection.
                      </span>
                    </motion.h1>

                    <motion.p 
                      variants={itemVariants}
                      className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed max-w-xl"
                    >
                      Create or join a room instantly. No accounts, no friction, just real-time conversations.
                    </motion.p>

                    <motion.div 
                      variants={itemVariants}
                      className="flex items-center gap-8 mt-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/70 dark:bg-slate-800/40 border border-white dark:border-slate-700/50 shadow-sm">
                          <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 tracking-wider uppercase">Live Video</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/70 dark:bg-slate-800/40 border border-white dark:border-slate-700/50 shadow-sm">
                          <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                        </div>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 tracking-wider uppercase">Real-time Chat</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/70 dark:bg-slate-800/40 border border-white dark:border-slate-700/50 shadow-sm">
                          <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                        </div>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 tracking-wider uppercase">100% ANONYMOUS</span>
                      </div>
                    </motion.div>
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, scale: 0.97, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 80, damping: 15, delay: 0.2 }}
                    className="flex flex-col items-center justify-center"
                  >
                    <div className="w-full max-w-md rounded-3xl glass-card p-8 shadow-[0_15px_45px_rgba(0,0,0,0.02)] backdrop-blur-md relative overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 pointer-events-none" />
                      
                      <div className="space-y-2 mb-8 relative z-10">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight font-display">Start a room</h2>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 font-medium">
                          <svg className="w-3.5 h-3.5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                          <span>Your privacy is our priority</span>
                        </div>
                      </div>

                      <div className="space-y-6 relative z-10">
                        <div className="space-y-2.5">
                          <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 block ml-1">
                            Your Name
                          </label>
                          <input
                            ref={nameInputRef}
                            className="w-full rounded-2xl border border-white/80 dark:border-slate-800/80 bg-white/50 dark:bg-slate-950/40 hover:bg-white/85 dark:hover:bg-slate-950/60 px-4 py-3.5 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 shadow-sm focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 focus:outline-none transition-all duration-300 text-sm font-semibold backdrop-blur-md"
                            placeholder="Enter your name"
                            value={userName}
                            onChange={(event) => setUserName(event.target.value)}
                          />
                        </div>

                        <div className="space-y-2.5">
                          <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 block ml-1">
                            Room Code (optional)
                          </label>
                          <input
                            className="w-full rounded-2xl border border-white/80 dark:border-slate-800/80 bg-white/50 dark:bg-slate-955/40 hover:bg-white/85 dark:hover:bg-slate-955/60 px-4 py-3.5 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 shadow-sm focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 focus:outline-none transition-all duration-300 uppercase tracking-widest text-sm font-semibold backdrop-blur-md"
                            placeholder="e.g. VZQSQC"
                            value={roomCode}
                            onChange={(event) => setRoomCode(event.target.value.toUpperCase())}
                            onKeyDown={(event) => {
                              if (event.key === "Enter" && roomCode.trim()) onJoin(roomCode);
                            }}
                          />
                        </div>

                        <div className="space-y-3 pt-2">
                          <motion.button
                            whileHover={{ y: -2, scale: 1.01, boxShadow: "0 12px 30px rgba(99,102,241,0.2)" }}
                            whileTap={{ scale: 0.98 }}
                            type="button"
                            onClick={onCreate}
                            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 dark:from-indigo-600 dark:to-purple-600 hover:from-slate-800 hover:to-indigo-900 dark:hover:from-indigo-500 dark:hover:to-purple-500 text-white px-6 py-4 text-xs font-bold uppercase tracking-wider shadow-lg shadow-slate-900/10 dark:shadow-indigo-500/10 transition duration-300"
                          >
                            Create Room <span aria-hidden="true" className="text-sm">→</span>
                          </motion.button>

                          <div className="flex items-center justify-center gap-3">
                            <div className="h-px bg-slate-200/80 dark:bg-slate-800/50 w-full" />
                            <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider">or</span>
                            <div className="h-px bg-slate-200/80 dark:bg-slate-800/50 w-full" />
                          </div>

                          <motion.button
                            whileHover={roomCode.trim() ? { y: -2, scale: 1.01 } : undefined}
                            whileTap={roomCode.trim() ? { scale: 0.98 } : undefined}
                            type="button"
                            onClick={() => onJoin(roomCode)}
                            disabled={!roomCode.trim()}
                            className="w-full flex items-center justify-center gap-2 rounded-2xl border border-white/80 dark:border-slate-800/80 bg-white/50 dark:bg-slate-955/40 hover:bg-white/85 dark:hover:bg-slate-955/60 px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 shadow-sm transition duration-300 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            Join Room
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>

                <motion.div 
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  className="grid grid-cols-4 gap-6 pt-8 border-t border-slate-200/50 dark:border-slate-800/50"
                >
                  <motion.div variants={itemVariants} className="flex items-center gap-4 p-4.5 rounded-2xl bg-white/40 dark:bg-slate-950/30 border border-white/70 dark:border-slate-800/50 shadow-sm">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-purple-50 dark:bg-purple-950/30 border border-purple-100/50 dark:border-purple-900/30 shadow-xs">
                      <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-700 dark:text-slate-300">Ultra Fast</span>
                      <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">Instant room creation</span>
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants} className="flex items-center gap-4 p-4.5 rounded-2xl bg-white/40 dark:bg-slate-950/30 border border-white/70 dark:border-slate-800/50 shadow-sm">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100/50 dark:border-emerald-900/30 shadow-xs">
                      <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-700 dark:text-slate-300">Secure</span>
                      <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">End-to-end encryption</span>
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants} className="flex items-center gap-4 p-4.5 rounded-2xl bg-white/40 dark:bg-slate-950/30 border border-white/70 dark:border-slate-800/50 shadow-sm">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-rose-50 dark:bg-rose-950/30 border border-rose-100/50 dark:border-rose-900/30 shadow-xs">
                      <svg className="w-5 h-5 text-rose-600 dark:text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                      </svg>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-700 dark:text-slate-300">No Login</span>
                      <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">100% anonymous experience</span>
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants} className="flex items-center gap-4 p-4.5 rounded-2xl bg-white/40 dark:bg-slate-950/30 border border-white/70 dark:border-slate-800/50 shadow-sm">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950/30 border border-blue-100/50 dark:border-blue-900/30 shadow-xs">
                      <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-700 dark:text-slate-300">Global</span>
                      <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">Connect from anywhere</span>
                    </div>
                  </motion.div>
                </motion.div>
              </motion.main>

              <motion.footer
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="w-full flex items-center justify-between px-6 text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mt-8"
              >
                <span>&copy; 2024 Velora. All rights reserved.</span>
                <div className="flex items-center gap-6">
                  <button className="hover:text-slate-700 dark:hover:text-slate-300 transition">Privacy</button>
                  <button className="hover:text-slate-700 dark:hover:text-slate-300 transition">Terms</button>
                  <button className="hover:text-slate-700 dark:hover:text-slate-300 transition">Guidelines</button>
                </div>
              </motion.footer>
            </div>

            {/* 2. MOBILE OPTIMIZED UX (lg screen and down) */}
            <div className="flex lg:hidden w-full flex-col gap-6 pb-20">
              <header className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-[1.75rem] bg-white/85 dark:bg-slate-950/80 border border-slate-200/70 dark:border-slate-800/70 backdrop-blur-xl shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950/5 dark:bg-white/10 border border-slate-200/60 dark:border-white/10 shadow-sm">
                    <img src="/velora-logo.png" className="h-5.5 w-5.5 object-contain dark:invert" alt="Velora Logo" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">Velora</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">Secure rooms</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <motion.button
                    onClick={toggleTheme}
                    aria-label="Toggle theme"
                    whileTap={{ scale: 0.95 }}
                    className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/80 text-slate-600 dark:text-slate-300 shadow-sm transition duration-200 hover:bg-white dark:hover:bg-slate-900"
                  >
                    {isDark ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-11.314l.707.707m11.314 11.314l.707-.707M12 17a5 5 0 100-10 5 5 0 000 10z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                      </svg>
                    )}
                  </motion.button>

                  <button
                    aria-label="Open menu"
                    onClick={() => setMobileMenuOpen(true)}
                    className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/80 text-slate-600 dark:text-slate-300 shadow-sm transition duration-200 hover:bg-white dark:hover:bg-slate-900"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" />
                    </svg>
                  </button>
                </div>
              </header>

              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="flex flex-col gap-6 px-2 mt-2"
              >
                <motion.div
                  variants={itemVariants}
                  className="self-start rounded-full bg-slate-100/80 dark:bg-slate-900/70 border border-slate-200/70 dark:border-slate-800/70 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-600 dark:text-slate-400 shadow-sm"
                >
                  Anonymous rooms in seconds
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-4">
                  <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-950 dark:text-white leading-tight">
                    Private conversations
                    <span className="block bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 dark:from-indigo-400 dark:via-purple-400 dark:to-indigo-400">
                      with instant connection.
                    </span>
                  </h1>
                  <p className="max-w-xl text-sm leading-7 text-slate-600 dark:text-slate-400">
                    Launch a secure room in seconds and invite friends without accounts, passwords, or friction.
                  </p>
                </motion.div>

                <motion.div variants={itemVariants} className="flex flex-col gap-3">
                  <motion.button
                    onClick={onCreate}
                    whileTap={{ scale: 0.98 }}
                    className="w-full rounded-2xl bg-slate-950 dark:bg-indigo-600 px-5 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-white shadow-lg shadow-slate-900/10 transition duration-200 hover:bg-slate-800 dark:hover:bg-indigo-500"
                  >
                    Create Room
                  </motion.button>
                  <button
                    onClick={focusNameInput}
                    className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/80 px-5 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-slate-900 dark:text-white shadow-sm transition duration-200 hover:bg-slate-100 dark:hover:bg-slate-900"
                  >
                    Join with code
                  </button>
                </motion.div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="w-full rounded-[2rem] glass-card p-6.5 shadow-xl backdrop-blur-xl mt-2"
              >
                <div className="space-y-2.5 mb-7">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight font-display">Start a room</h2>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500 font-bold">
                    <svg className="w-3 h-3 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span>Your privacy is our priority</span>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 block ml-1">
                      Your Name
                    </label>
                    <input
                      ref={nameInputRef}
                      className="w-full rounded-xl border border-white dark:border-slate-800/80 bg-white/60 dark:bg-slate-955/40 px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 shadow-xs focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 focus:outline-none transition-all duration-300 text-xs font-semibold"
                      placeholder="Enter your name"
                      value={userName}
                      onChange={(event) => setUserName(event.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 block ml-1">
                      Room Code (optional)
                    </label>
                    <input
                      className="w-full rounded-xl border border-white dark:border-slate-800/80 bg-white/60 dark:bg-slate-955/40 px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 shadow-xs focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 focus:outline-none transition-all duration-300 uppercase tracking-widest text-xs font-semibold"
                      placeholder="e.g. VZQSQC"
                      value={roomCode}
                      onChange={(event) => setRoomCode(event.target.value.toUpperCase())}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && roomCode.trim()) onJoin(roomCode);
                      }}
                    />
                  </div>

                  <div className="space-y-2.5 pt-2">
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={onCreate}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-50 text-white px-4 py-3.5 text-xs font-bold uppercase tracking-wider shadow-md shadow-slate-900/10 dark:shadow-indigo-500/10 active:scale-98 transition duration-200"
                    >
                      Create Room <span aria-hidden="true" className="text-sm">→</span>
                    </motion.button>

                    <div className="flex items-center justify-center gap-2.5">
                      <div className="h-px bg-slate-200/80 dark:bg-slate-800/50 w-full" />
                      <span className="text-[9px] font-extrabold uppercase text-slate-400 dark:text-slate-500 tracking-wider">or</span>
                      <div className="h-px bg-slate-200/80 dark:bg-slate-800/50 w-full" />
                    </div>

                    <motion.button
                      whileTap={roomCode.trim() ? { scale: 0.98 } : undefined}
                      type="button"
                      onClick={() => onJoin(roomCode)}
                      disabled={!roomCode.trim()}
                      className="w-full flex items-center justify-center gap-2 rounded-xl border border-white dark:border-slate-800/80 bg-white/60 dark:bg-slate-955/40 px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 shadow-xs active:scale-98 transition duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Join Room
                    </motion.button>
                  </div>
                </div>
              </motion.div>

              <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[90%] max-w-sm z-50">
                <div className="rounded-full bg-white/55 dark:bg-slate-950/80 border border-white/60 dark:border-slate-800/60 px-6 py-2.5 shadow-lg backdrop-blur-xl flex items-center justify-between">
                  <button
                    onClick={() => {
                      setActiveTab(null);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex flex-col items-center gap-1 transition ${
                      activeTab === null ? "text-indigo-600 dark:text-indigo-400 scale-105" : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <span className="text-[8px] font-bold uppercase tracking-wider">Home</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("features")}
                    className={`flex flex-col items-center gap-1 transition ${
                      activeTab === "features" ? "text-indigo-600 dark:text-indigo-400 scale-105" : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                    <span className="text-[8px] font-bold uppercase tracking-wider">Features</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("safety")}
                    className={`flex flex-col items-center gap-1 transition ${
                      activeTab === "safety" ? "text-indigo-600 dark:text-indigo-400 scale-105" : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span className="text-[8px] font-bold uppercase tracking-wider">Safety</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("about")}
                    className={`flex flex-col items-center gap-1 transition ${
                      activeTab === "about" ? "text-indigo-600 dark:text-indigo-400 scale-105" : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-[8px] font-bold uppercase tracking-wider">About</span>
                  </button>
                </div>
              </div>

              {/* 3. DYNAMIC CONTENT MODALS / BOTTOM-SHEETS */}
              <AnimatePresence>
                {activeTab !== null && (
                  <>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setActiveTab(null)}
                      className="fixed inset-0 bg-slate-900/20 dark:bg-black/50 backdrop-blur-md z-45 transition-all duration-300"
                    />

                    <motion.div
                      initial={{ y: "100%", opacity: 0.5, scale: 0.95 }}
                      animate={{ y: 0, opacity: 1, scale: 1 }}
                      exit={{ y: "100%", opacity: 0.5, scale: 0.95 }}
                      transition={{ type: "spring", damping: 26, stiffness: 210 }}
                      className="fixed bottom-0 lg:bottom-auto lg:top-[18%] left-0 lg:left-1/2 lg:-translate-x-1/2 w-full lg:max-w-2xl bg-white/75 dark:bg-[#0f172a]/90 border-t lg:border border-white/80 dark:border-slate-800/50 rounded-t-[2.5rem] lg:rounded-[2rem] shadow-2xl z-50 p-8 backdrop-blur-2xl flex flex-col gap-6 max-h-[85vh] lg:max-h-none overflow-y-auto"
                    >
                      <div className="flex lg:hidden justify-center pb-2 -mt-4">
                        <div className="w-12 h-1.5 rounded-full bg-slate-300/80 dark:bg-slate-700/80" onClick={() => setActiveTab(null)} />
                      </div>

                      <div className="flex items-center justify-between pb-4 border-b border-slate-200/50 dark:border-slate-800/50">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                          <span className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
                            {activeTab === "features" && "App Features"}
                            {activeTab === "safety" && "Privacy & Safety"}
                            {activeTab === "about" && "About Velora"}
                            {activeTab === "how-it-works" && "How it works"}
                          </span>
                        </div>
                        <button
                          onClick={() => setActiveTab(null)}
                          className="px-4 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 text-[10px] font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition duration-150 uppercase tracking-widest"
                        >
                          Close
                        </button>
                      </div>

                      <div className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed space-y-4 font-medium">
                        {activeTab === "features" && (
                          <div className="space-y-5">
                            <p>
                              Velora is engineered from the ground up to give you high-performance and effortless
                              video calling inside a high-end, responsive architecture.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                              <div className="p-4 rounded-2xl bg-white/45 dark:bg-slate-900/40 border border-white/60 dark:border-slate-800/30">
                                <h4 className="text-xs font-extrabold uppercase text-slate-900 dark:text-white tracking-wider mb-1">
                                  Instant WebRTC connection
                                </h4>
                                <p className="text-xs text-slate-400 dark:text-slate-500 leading-normal">
                                  Direct peer-to-peer transmission ensures ultra-low latency audio and HD video
                                  directly inside the browser viewport.
                                </p>
                              </div>
                              <div className="p-4 rounded-2xl bg-white/45 dark:bg-slate-900/40 border border-white/60 dark:border-slate-800/30">
                                <h4 className="text-xs font-extrabold uppercase text-slate-900 dark:text-white tracking-wider mb-1">
                                  Secure realtime text chat
                                </h4>
                                <p className="text-xs text-slate-400 dark:text-slate-500 leading-normal">
                                  Exchange text, links, and messages during video calls via Supabase secure
                                  realtime broadcasting channel.
                                </p>
                              </div>
                              <div className="p-4 rounded-2xl bg-white/45 dark:bg-slate-900/40 border border-white/60 dark:border-slate-800/30">
                                <h4 className="text-xs font-extrabold uppercase text-slate-900 dark:text-white tracking-wider mb-1">
                                  Responsive adaptive scaling
                                </h4>
                                <p className="text-xs text-slate-400 dark:text-slate-500 leading-normal">
                                  Intelligent design structure scales from large screens down to hand-held
                                  viewports without breaking visual consistency.
                                </p>
                              </div>
                              <div className="p-4 rounded-2xl bg-white/45 dark:bg-slate-900/40 border border-white/60 dark:border-slate-800/30">
                                <h4 className="text-xs font-extrabold uppercase text-slate-900 dark:text-white tracking-wider mb-1">
                                  Frictionless design
                                </h4>
                                <p className="text-xs text-slate-400 dark:text-slate-500 leading-normal">
                                  No password requirements, verification delays, or account registration forms.
                                  Just launch and connect.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {activeTab === "safety" && (
                          <div className="space-y-4">
                            <p className="font-semibold text-slate-800 dark:text-slate-200">
                              Your privacy is not a feature — it is our absolute architecture.
                            </p>
                            <p>Unlike conventional teleconferencing platforms, Velora values your complete confidentiality:</p>
                            <ul className="list-disc pl-5 space-y-2.5 text-xs text-slate-400 dark:text-slate-500">
                              <li>
                                <strong className="text-slate-600 dark:text-slate-400">No Account Sign-Ups:</strong> We never collect names, phone
                                credentials, email configurations, or passwords. Your identity is totally invisible.
                              </li>
                              <li>
                                <strong className="text-slate-600 dark:text-slate-400">Zero Persistent Logs:</strong> Meetings are generated completely in
                                memory. As soon as you navigate away or close the page, the room and chat history are wiped forever.
                              </li>
                              <li>
                                <strong className="text-slate-600 dark:text-slate-400">Peer-to-Peer Routing:</strong> Realtime WebRTC signal streams
                                transfer directly from device to device. Your video feed never touches a central cloud server.
                              </li>
                            </ul>
                          </div>
                        )}

                        {activeTab === "about" && (
                          <div className="space-y-4">
                            <p>
                              Velora is a clean, minimal, production-ready anonymous video calling platform, hand-crafted by{" "}
                              <strong className="text-slate-800 dark:text-slate-200">Anuj</strong> using next-generation web technologies.
                            </p>
                            <p>
                              Designed with pristine glassmorphic principles, Apple VisionOS alignment guidelines, and Arc Browser
                              visual style to ensure it feels like a funded SaaS startup product.
                            </p>
                            <div className="pt-4 border-t border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
                              <span>Version 1.0.0 (Stable MVP)</span>
                              <span>Developed by Anuj</span>
                            </div>
                          </div>
                        )}

                        {activeTab === "how-it-works" && (
                          <div className="space-y-4">
                            <p className="font-semibold text-slate-800 dark:text-slate-200">Start communicating in three extremely simple steps:</p>
                            <ol className="list-decimal pl-5 space-y-3 text-xs text-slate-400 dark:text-slate-500">
                              <li>
                                <strong className="text-slate-600 dark:text-slate-400">Fill in Your Name:</strong> Type a temporary alias name in the form card so others know who you are.
                              </li>
                              <li>
                                <strong className="text-slate-600 dark:text-slate-400">Create a New Room:</strong> Click "Create Room" to instantly generate a secure, high-tech video portal with a unique code.
                              </li>
                              <li>
                                <strong className="text-slate-600 dark:text-slate-400">Share & Chat:</strong> Send the room code to your friend. Once they enter the code and click "Join Room", a direct secure RTC link initiates automatically!
                              </li>
                            </ol>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>

              {/* 4. MOBILE HAMBURGER SLIDE MENU drawer */}
              <AnimatePresence>
                {mobileMenuOpen && (
                  <>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setMobileMenuOpen(false)}
                      className="fixed inset-0 bg-slate-900/20 dark:bg-black/50 backdrop-blur-md z-45"
                    />
                    <motion.div
                      initial={{ x: "100%" }}
                      animate={{ x: "0%" }}
                      exit={{ x: "100%" }}
                      transition={{ type: "spring", damping: 26, stiffness: 220 }}
                      className="fixed right-0 top-0 bottom-0 w-[75vw] max-w-sm bg-white/75 dark:bg-[#0f172a]/95 backdrop-blur-2xl border-l border-white/80 dark:border-slate-800/50 shadow-2xl p-8 z-50 flex flex-col justify-between"
                    >
                      <div className="space-y-8">
                        <div className="flex items-center justify-between">
                          <img src="/velora-logo.png" className="h-5.5 object-contain dark:invert" alt="Logo" />
                          <button
                            onClick={() => setMobileMenuOpen(false)}
                            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition"
                          >
                            ✕
                          </button>
                        </div>

                        <nav className="flex flex-col gap-3">
                          <button
                            onClick={() => {
                              setActiveTab(null);
                              setMobileMenuOpen(false);
                            }}
                            className="w-full text-left px-4 py-3 rounded-2xl text-xs font-extrabold uppercase tracking-widest text-slate-800 dark:text-slate-100 hover:bg-white/60 dark:hover:bg-slate-800/40 transition"
                          >
                            Home
                          </button>
                          <button
                            onClick={() => {
                              setActiveTab("features");
                              setMobileMenuOpen(false);
                            }}
                            className="w-full text-left px-4 py-3 rounded-2xl text-xs font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-800/40 transition"
                          >
                            Features
                          </button>
                          <button
                            onClick={() => {
                              setActiveTab("how-it-works");
                              setMobileMenuOpen(false);
                            }}
                            className="w-full text-left px-4 py-3 rounded-2xl text-xs font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-800/40 transition"
                          >
                            How It Works
                          </button>
                          <button
                            onClick={() => {
                              setActiveTab("safety");
                              setMobileMenuOpen(false);
                            }}
                            className="w-full text-left px-4 py-3 rounded-2xl text-xs font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-800/40 transition"
                          >
                            Safety
                          </button>
                          <button
                            onClick={() => {
                              setActiveTab("about");
                              setMobileMenuOpen(false);
                            }}
                            className="w-full text-left px-4 py-3 rounded-2xl text-xs font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-800/40 transition"
                          >
                            About
                          </button>
                        </nav>
                      </div>

                      <div className="space-y-4">
                        <button
                          onClick={() => {
                            setMobileMenuOpen(false);
                            focusNameInput();
                          }}
                          className="w-full py-3.5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-xs font-bold uppercase tracking-widest shadow-md text-center block"
                        >
                          Get Started
                        </button>
                        <div className="text-[8px] text-slate-400 dark:text-slate-500 font-extrabold tracking-widest uppercase text-center">
                          &copy; 2024 Velora • Made by Anuj
                        </div>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* 4. MOBILE HAMBURGER SLIDE MENU drawer */}
            <AnimatePresence>
              {mobileMenuOpen && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setMobileMenuOpen(false)}
                    className="fixed inset-0 bg-slate-900/20 dark:bg-black/50 backdrop-blur-md z-45"
                  />
                  <motion.div
                    initial={{ x: "100%" }}
                    animate={{ x: "0%" }}
                    exit={{ x: "100%" }}
                    transition={{ type: "spring", damping: 26, stiffness: 220 }}
                    className="fixed right-0 top-0 bottom-0 w-[75vw] max-w-sm bg-white/75 dark:bg-[#0f172a]/95 backdrop-blur-2xl border-l border-white/80 dark:border-slate-800/50 shadow-2xl p-8 z-50 flex flex-col justify-between"
                  >
                    <div className="space-y-8">
                      <div className="flex items-center justify-between">
                        <img src="/velora-logo.png" className="h-5.5 object-contain dark:invert" alt="Logo" />
                        <button
                          onClick={() => setMobileMenuOpen(false)}
                          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition"
                        >
                          ✕
                        </button>
                      </div>

                      <nav className="flex flex-col gap-3">
                        <button
                          onClick={() => {
                            setActiveTab(null);
                            setMobileMenuOpen(false);
                          }}
                          className="w-full text-left px-4 py-3 rounded-2xl text-xs font-extrabold uppercase tracking-widest text-slate-800 dark:text-slate-100 hover:bg-white/60 dark:hover:bg-slate-800/40 transition"
                        >
                          Home
                        </button>
                        <button
                          onClick={() => {
                            setActiveTab("features");
                            setMobileMenuOpen(false);
                          }}
                          className="w-full text-left px-4 py-3 rounded-2xl text-xs font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-800/40 transition"
                        >
                          Features
                        </button>
                        <button
                          onClick={() => {
                            setActiveTab("how-it-works");
                            setMobileMenuOpen(false);
                          }}
                          className="w-full text-left px-4 py-3 rounded-2xl text-xs font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-800/40 transition"
                        >
                          How It Works
                        </button>
                        <button
                          onClick={() => {
                            setActiveTab("safety");
                            setMobileMenuOpen(false);
                          }}
                          className="w-full text-left px-4 py-3 rounded-2xl text-xs font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slat...