import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Users, Search, X, Crown, Swords, Wifi } from "lucide-react";
import { Header } from "../components/Header";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import { getGuestToken } from "../utils/sessionIdentity";
import { ChessSocket } from "../services/socket";

type MatchmakingState = "idle" | "searching" | "found";

export const FindOpponentPage: React.FC = () => {
  const navigate = useNavigate();
  const { actualTheme } = useTheme();
  const isDark = actualTheme === "dark";
  const { user } = useAuth();

  const [state, setState] = useState<MatchmakingState>("idle");
  const [searchSeconds, setSearchSeconds] = useState(0);
  const [onlineCount, setOnlineCount] = useState<number>(0);
  const [foundGameId, setFoundGameId] = useState<string | null>(null);
  const [foundColor, setFoundColor] = useState<"white" | "black" | null>(null);
  const [timeoutWarning, setTimeoutWarning] = useState(false);

  const socketRef = useRef<ChessSocket | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Initialize socket ──────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem("authToken") || undefined;
      const guestToken = getGuestToken();
      const socket = new ChessSocket(token, guestToken ?? undefined);
      socketRef.current = socket;

      // Get initial count
      socket.requestMatchmakingCount();

      socket.onMatchmakingCount(({ count }) => {
        setOnlineCount(count);
      });

      socket.onMatchmakingFound(({ gameId, color }) => {
        setFoundGameId(gameId);
        setFoundColor(color);
        setState("found");
        stopTimer();
      });

      socket.onMatchmakingTimeout(({ message }) => {
        console.warn("Matchmaking timeout:", message);
        setState("idle");
        stopTimer();
        setTimeoutWarning(true);
        setTimeout(() => setTimeoutWarning(false), 5000);
      });
    };

    init();

    return () => {
      if (socketRef.current) {
        socketRef.current.offMatchmaking();
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      stopTimer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
      setSearchSeconds(0);
    }
  };

  const handleFindOpponent = useCallback(() => {
    if (!socketRef.current || state !== "idle") return;
    setState("searching");
    setSearchSeconds(0);
    timerRef.current = setInterval(() => {
      setSearchSeconds((s) => s + 1);
    }, 1000);
    socketRef.current.joinMatchmaking();
  }, [state]);

  const handleCancel = useCallback(() => {
    if (!socketRef.current) return;
    socketRef.current.leaveMatchmaking();
    setState("idle");
    stopTimer();
  }, []);

  // ── Navigate when match is found ───────────────────────────────────────
  useEffect(() => {
    if (state === "found" && foundGameId) {
      const timer = setTimeout(() => {
        navigate(`/game/${foundGameId}`);
      }, 2000); // 2s to show the "found" animation
      return () => clearTimeout(timer);
    }
  }, [state, foundGameId, navigate]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const bg = isDark
    ? "linear-gradient(180deg, #0f0f1e 0%, #1a1a2e 50%, #0f0f1e 100%)"
    : "linear-gradient(180deg, #f8f9ff 0%, #ffffff 50%, #f8f9ff 100%)";

  const cardBg = isDark
    ? "rgba(255,255,255,0.05)"
    : "rgba(255,255,255,0.9)";
  const cardBorder = isDark ? "rgba(255,255,255,0.1)" : "rgba(102,126,234,0.2)";

  return (
    <div style={{
      minHeight: "100vh",
      background: bg,
      color: isDark ? "#f9fafb" : "#1f2937",
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      display: "flex",
      flexDirection: "column",
    }}>
      <Header />

      {/* Floating background blobs */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 0 }}>
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute", top: "10%", right: "8%",
            width: 400, height: 400, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(102,126,234,0.3) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.12, 0.2, 0.12] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          style={{
            position: "absolute", bottom: "10%", left: "8%",
            width: 350, height: 350, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(168,85,247,0.3) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />
      </div>

      <main style={{
        position: "relative", zIndex: 1, flex: 1,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        padding: "24px 16px",
      }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ textAlign: "center", marginBottom: 32 }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 12 }}>
            <Crown style={{ width: 32, height: 32, color: "#667eea" }} />
            <h1 style={{ fontSize: "clamp(24px,5vw,36px)", fontWeight: 800, margin: 0 }}>
              Find Opponent
            </h1>
            <Swords style={{ width: 32, height: 32, color: "#a855f7" }} />
          </div>

          {/* Live player count badge */}
          <motion.div
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "8px 18px",
              background: isDark ? "rgba(102,126,234,0.15)" : "rgba(102,126,234,0.1)",
              border: "1px solid rgba(102,126,234,0.3)",
              borderRadius: 20, fontSize: 14, fontWeight: 600,
              color: isDark ? "#c4b5fd" : "#6d28d9",
            }}
          >
            <motion.div
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981" }}
            />
            <Wifi style={{ width: 14, height: 14 }} />
            {onlineCount === 0 ? "No one" : onlineCount === 1 ? "1 player" : `${onlineCount} players`} searching
          </motion.div>

          {/* Timeout warning */}
          <AnimatePresence>
            {timeoutWarning && (
              <motion.p
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{ color: "#f97316", fontSize: 13, fontWeight: 600, marginTop: 10 }}
              >
                No opponent found in 5 minutes. Please try again.
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Main card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{
            background: cardBg, backdropFilter: "blur(12px)",
            border: `1px solid ${cardBorder}`, borderRadius: 28,
            padding: "40px 32px", maxWidth: 420, width: "100%",
            boxShadow: isDark ? "0 24px 64px rgba(0,0,0,0.4)" : "0 24px 64px rgba(102,126,234,0.15)",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 24,
          }}
        >
          <AnimatePresence mode="wait">

            {/* IDLE state */}
            {state === "idle" && (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, width: "100%" }}
              >
                {/* Icon */}
                <motion.div
                  whileHover={{ scale: 1.08, rotate: 5 }}
                  style={{
                    width: 96, height: 96, borderRadius: 28,
                    background: "linear-gradient(135deg, #667eea 0%, #a855f7 100%)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: "0 16px 40px rgba(102,126,234,0.45)",
                  }}
                >
                  <Users style={{ width: 44, height: 44, color: "white" }} />
                </motion.div>

                <div style={{ textAlign: "center" }}>
                  <h2 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 8px" }}>Ready to Play?</h2>
                  <p style={{ fontSize: 14, color: isDark ? "#9ca3af" : "#6b7280", margin: 0, lineHeight: 1.5 }}>
                    Click below to enter the matchmaking queue. Cards per match: <strong>3</strong>. Colors assigned randomly.
                  </p>
                </div>

                <motion.button
                  id="find-opponent-btn"
                  onClick={handleFindOpponent}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    width: "100%", padding: "16px",
                    background: "linear-gradient(135deg, #667eea 0%, #a855f7 100%)",
                    color: "white", border: "none", borderRadius: 16,
                    fontSize: 16, fontWeight: 700, cursor: "pointer",
                    boxShadow: "0 8px 24px rgba(102,126,234,0.5)",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                  }}
                >
                  <Search style={{ width: 20, height: 20 }} />
                  Find Opponent
                </motion.button>
              </motion.div>
            )}

            {/* SEARCHING state */}
            {state === "searching" && (
              <motion.div
                key="searching"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24, width: "100%" }}
              >
                {/* Pulsing rings */}
                <div style={{ position: "relative", width: 120, height: 120 }}>
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ scale: [1, 2.2], opacity: [0.5, 0] }}
                      transition={{ duration: 2, delay: i * 0.65, repeat: Infinity, ease: "easeOut" }}
                      style={{
                        position: "absolute", inset: 0, borderRadius: "50%",
                        border: "2px solid #667eea",
                      }}
                    />
                  ))}
                  <div style={{
                    position: "absolute", inset: 0, borderRadius: "50%",
                    background: "linear-gradient(135deg, #667eea 0%, #a855f7 100%)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: "0 0 32px rgba(102,126,234,0.6)",
                  }}>
                    <Search style={{ width: 44, height: 44, color: "white" }} />
                  </div>
                </div>

                <div style={{ textAlign: "center" }}>
                  <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 6px" }}>Searching…</h2>
                  <p style={{ fontSize: 13, color: isDark ? "#9ca3af" : "#6b7280", margin: "0 0 4px" }}>
                    Looking for an opponent
                  </p>
                  <motion.p
                    animate={{ opacity: [1, 0.4, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    style={{ fontSize: 24, fontWeight: 800, color: "#667eea", margin: 0, fontVariantNumeric: "tabular-nums" }}
                  >
                    {formatTime(searchSeconds)}
                  </motion.p>
                </div>

                {/* Animated dots */}
                <div style={{ display: "flex", gap: 8 }}>
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 0.7, delay: i * 0.15, repeat: Infinity }}
                      style={{ width: 10, height: 10, borderRadius: "50%", background: "#a855f7" }}
                    />
                  ))}
                </div>

                <motion.button
                  onClick={handleCancel}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    width: "100%", padding: "14px",
                    background: "transparent",
                    border: `2px solid ${isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.12)"}`,
                    color: isDark ? "#9ca3af" : "#6b7280",
                    borderRadius: 16, fontSize: 15, fontWeight: 600, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#ef4444"; e.currentTarget.style.color = "#ef4444"; }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.12)";
                    e.currentTarget.style.color = isDark ? "#9ca3af" : "#6b7280";
                  }}
                >
                  <X style={{ width: 16, height: 16 }} />
                  Cancel
                </motion.button>
              </motion.div>
            )}

            {/* FOUND state */}
            {state === "found" && (
              <motion.div
                key="found"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", damping: 14, stiffness: 200 }}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, width: "100%" }}
              >
                <motion.div
                  animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
                  transition={{ duration: 0.6, repeat: 2 }}
                  style={{
                    width: 100, height: 100, borderRadius: "50%",
                    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: "0 0 40px rgba(16,185,129,0.6)",
                  }}
                >
                  <span style={{ fontSize: 52 }}>⚔️</span>
                </motion.div>

                <div style={{ textAlign: "center" }}>
                  <h2 style={{ fontSize: 22, fontWeight: 800, color: "#10b981", margin: "0 0 8px" }}>
                    Opponent Found!
                  </h2>
                  <p style={{ fontSize: 14, margin: 0, color: isDark ? "#d1d5db" : "#4b5563" }}>
                    You are playing as{" "}
                    <strong style={{
                      padding: "2px 10px", borderRadius: 8,
                      background: foundColor === "white"
                        ? "rgba(249,250,251,0.15)"
                        : "rgba(17,24,39,0.15)",
                      color: foundColor === "white" ? (isDark ? "#f9fafb" : "#1f2937") : (isDark ? "#d1d5db" : "#111827"),
                      border: `1px solid ${foundColor === "white" ? "#d1d5db" : "#374151"}`,
                    }}>
                      {foundColor === "white" ? "♔ White" : "♚ Black"}
                    </strong>
                  </p>
                  <motion.p
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    style={{ fontSize: 13, color: isDark ? "#9ca3af" : "#6b7280", marginTop: 8 }}
                  >
                    Entering game…
                  </motion.p>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </motion.div>

        {/* Info strip */}
        {state === "idle" && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            style={{
              marginTop: 20, fontSize: 13,
              color: isDark ? "#6b7280" : "#9ca3af",
              textAlign: "center", maxWidth: 340,
            }}
          >
            Matchmaking is open to everyone — guests included. You'll be matched within 5 minutes or notified.
          </motion.p>
        )}
      </main>
    </div>
  );
};
