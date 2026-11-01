import React, { useEffect, useRef, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { ChessBoard } from "../components/ChessBoard";
import { CompactGameControls } from "../components/CompactGameControls";
import { CollapsibleRulesSidebar } from "../components/CollapsibleRulesSidebar";
import { MoveHistoryFooter } from "../components/MoveHistoryFooter";
import { Header } from "../components/Header";
import { useCardChess } from "../hooks/useCardChess";
import { ChessAPI, ApiError, ChessGame } from "../services/api";
import { useGameStore } from "../stores/gameStore";
import { useAppStore } from "../stores/appStore";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import { Link2, Check, Users, Trophy, Settings, Volume2, VolumeX, Eye, EyeOff, Zap, ZapOff, X, ChevronLeft, BookOpen, Clock, Flag, Equal, RotateCcw, Search } from "lucide-react";
import { useLayoutMode } from "../hooks/useLayoutMode";
import { useTurnTimer } from "../hooks/useTurnTimer";
import { logger } from "../utils/logger";
import { CardChessMove } from "../utils/bot";
import { isMuted, setMuted } from "../utils/sounds";

// ── Turn timer chip ──────────────────────────────────────────────────
// Idle timeout: the player to move loses when it hits 0:00. Kept as its own top-level component
// so the per-tick state change re-renders only this chip.
function TurnTimerChip({
  game, isMyTurn, isBotGame, gameOver, isDark,
}: {
  game: ChessGame | null;
  isMyTurn: boolean;
  isBotGame: boolean;
  gameOver: boolean;
  isDark: boolean;
}) {
  const secondsLeft = useTurnTimer(game);
  const show =
    secondsLeft !== null &&
    !gameOver &&
    game?.game_state?.status === "active" &&
    !(isBotGame && !isMyTurn); // the bot answers by itself, no point counting down for it
  if (!show) return null;

  const urgent = isMyTurn && secondsLeft <= 10;
  return (
    <span
      title={
        isMyTurn
          ? "Time left to act before the game ends for inactivity"
          : "Time your opponent has left before the game ends for inactivity"
      }
      style={{
        display: "inline-flex", alignItems: "center", gap: 4, flexShrink: 0,
        fontSize: 12, fontWeight: 800, fontVariantNumeric: "tabular-nums",
        padding: "2px 8px", borderRadius: 999,
        color: urgent ? "#ef4444" : isMyTurn ? "#10b981" : isDark ? "#9ca3af" : "#6b7280",
        background: urgent ? "rgba(239,68,68,0.15)" : isMyTurn ? "rgba(16,185,129,0.12)" : isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)",
        border: `1px solid ${urgent ? "rgba(239,68,68,0.5)" : isMyTurn ? "rgba(16,185,129,0.35)" : "transparent"}`,
        animation: urgent ? "cc-timer-pulse 1s ease-in-out infinite" : "none",
      }}
    >
      <Clock size={12} />
      {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, "0")}
    </span>
  );
}

export const GamePage: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { addNotification, showRules, setShowRules } = useAppStore();
  const { actualTheme } = useTheme();
  const isDark = actualTheme === "dark";
  const { user, sessionIdentity } = useAuth();
  const identityId = sessionIdentity?.id;
  const layoutMode = useLayoutMode();
  const [linkCopied, setLinkCopied] = useState(false);
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);

  const [autoDrawEnabled, setAutoDrawEnabled] = useState(() => {
    if (typeof window === "undefined") return false;
    const stored = localStorage.getItem("cardChess_autoDraw");
    return stored ? JSON.parse(stored) : false;
  });

  const toggleAutoDraw = () => {
    const newValue = !autoDrawEnabled;
    setAutoDrawEnabled(newValue);
    localStorage.setItem("cardChess_autoDraw", JSON.stringify(newValue));
  };

  const [soundEnabled, setSoundEnabled] = useState(!isMuted());
  const toggleSound = () => {
    const val = !soundEnabled;
    setSoundEnabled(val);
    setMuted(!val);
  };

  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Result card: can be closed to review the final position, and reopened from the controls.
  const [resultDismissed, setResultDismissed] = useState(false);
  const [rematching, setRematching] = useState(false);
  useEffect(() => {
    setResultDismissed(false);
    setRematching(false);
  }, [gameId]);

  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem("cc_sidebar_w");
    return saved ? parseInt(saved, 10) : 340;
  });

  useEffect(() => localStorage.setItem("cc_sidebar_w", sidebarWidth.toString()), [sidebarWidth]);

  const handleDesktopResize = (e: React.PointerEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startW = sidebarWidth;

    const onPointerMove = (moveEvent: PointerEvent) => {
      let newW = startW + (startX - moveEvent.clientX);
      setSidebarWidth(Math.max(260, Math.min(newW, window.innerWidth * 0.8)));
    };
    const onPointerUp = () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      document.body.style.cursor = "";
    };
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    document.body.style.cursor = "col-resize";
  };

  const botTurnTimeoutRef = useRef<number | null>(null);
  const botActionInFlightRef = useRef(false);
  const {
    currentGame,
    showMoves,
    isLoading,
    error,
    setCurrentGame,
    setShowMoves,
    setLoading,
    setError,
  } = useGameStore();

  const isBotGame = Boolean(currentGame?.is_vs_bot);

  // Copy game link
  const handleCopyLink = () => {
    const gameLink = `${window.location.origin}/game/${gameId}`;
    navigator.clipboard
      .writeText(gameLink)
      .then(() => {
        setLinkCopied(true);
        addNotification({ type: "success", title: "Link Copied!", message: "Game link copied to clipboard", duration: 2000 });
        setTimeout(() => setLinkCopied(false), 2000);
      })
      .catch(() => {
        addNotification({ type: "error", title: "Failed to copy", message: "Could not copy link to clipboard", duration: 3000 });
      });
  };

  // Load game
  useEffect(() => {
    let ignore = false;
    const loadGame = async () => {
      if (!gameId) {
        addNotification({ type: "info", title: "No Game Found", message: "No game ID provided. Redirecting to home.", duration: 5000 });
        navigate("/play");
        return;
      }
      setLoading(true);
      setError(null);
      logger.info(`GamePage: Loading game ${gameId}`);
      if (!identityId) return;
      setCurrentGame(null);
      try {
        logger.info(`GamePage: Loading game ${gameId}`);
        setError(null);
        const response = await ChessAPI.getGame(gameId);
        if (!ignore) {
          setCurrentGame(response.data.data);
          logger.info(`GamePage: Game loaded`, { gameId });
        }
      } catch (err) {
        if (!ignore) {
          logger.error("Error loading game:", err);
          const errorMessage = err instanceof ApiError ? err.message : "Failed to load game";
          setError(errorMessage);
          addNotification({ type: "error", title: "Failed to load game", message: errorMessage, duration: 5000 });
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    loadGame();
    return () => { ignore = true; };
  }, [gameId, identityId, setCurrentGame, setLoading, setError, addNotification, navigate]);

  // Join game as opponent
  const handleJoinGameAsOpponent = async () => {
    if (!gameId || !currentGame || isBotGame) return;
    try {
      logger.info(`GamePage: Joining game ${gameId}`);
      await ChessAPI.joinGame(gameId);
      const response = await ChessAPI.getGame(gameId);
      setCurrentGame(response.data.data);
      setLoading(false);
      addNotification({ type: "success", title: "Joined Game", message: "You have successfully joined the game!", duration: 3000 });
    } catch {
      setLoading(false);
      addNotification({ type: "error", title: "Failed to join game", message: "Could not join the game.", duration: 5000 });
    }
  };

  const {
    game: chessGame,
    gameState,
    drawCard,
    onDrop,
    playRandomValidMove,
    handleSquareClick,
    resolvePromotion,
    cancelPromotion,
  } = useCardChess(currentGame, {
    userId: identityId,
    onGameStateChanged: (updatedGame) => setCurrentGame(updatedGame),
  });

  const isPlayerInGame = Boolean(
    currentGame &&
    (currentGame.player_white === identityId || currentGame.player_black === identityId)
  );
  const canJoinGame = Boolean(
    currentGame &&
    !isBotGame &&
    ((!currentGame.player_black && currentGame.player_white !== identityId) ||
      (!currentGame.player_white && currentGame.player_black !== identityId))
  );
  const isWaitingForOpponent = Boolean(
    currentGame && !isBotGame && isPlayerInGame && gameState.gameStatus === "waiting_for_opponent"
  );

  // Reset card selection when cards change
  useEffect(() => {
    setSelectedCardIndex(null);
  }, [gameState.currentCards]);

  useEffect(() => {
    if (
      autoDrawEnabled &&
      gameState.userColor === gameState.currentPlayer &&
      !gameState.isInCheck &&
      gameState.canDrawCard &&
      (gameState.currentCards.length === 0 || gameState.noValidCard) &&
      !gameState.gameOver
    ) {
      const timer = setTimeout(() => {
        drawCard();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [
    autoDrawEnabled,
    gameState.userColor,
    gameState.currentPlayer,
    gameState.isInCheck,
    gameState.canDrawCard,
    gameState.noValidCard,
    gameState.currentCards.length,
    gameState.noValidCard,
    gameState.gameOver,
    isBotGame,
    drawCard,
  ]);

  // Filter valid moves by selected card
  const filteredValidMoves = useMemo(() => {
    if (selectedCardIndex === null || !gameState.currentCards[selectedCardIndex]) {
      return gameState.validMoves;
    }
    const selectedCard = gameState.currentCards[selectedCardIndex];
    return gameState.validMoves.filter((move) => {
      const cardMove = move as unknown as CardChessMove;
      if (!cardMove.card) return false;
      return cardMove.card.suit === selectedCard.suit && cardMove.card.value === selectedCard.value;
    });
  }, [selectedCardIndex, gameState.validMoves, gameState.currentCards]);

  // Bot auto-play
  useEffect(() => {
    const shouldBotPlay =
      isBotGame && isPlayerInGame &&
      gameState.gameStatus === "active" && !gameState.gameOver &&
      gameState.currentPlayer !== gameState.userColor;

    if (!shouldBotPlay) {
      if (botTurnTimeoutRef.current !== null) {
        window.clearTimeout(botTurnTimeoutRef.current);
        botTurnTimeoutRef.current = null;
      }
      botActionInFlightRef.current = false;
      return;
    }
    if (botActionInFlightRef.current) return;
    botActionInFlightRef.current = true;
    botTurnTimeoutRef.current = window.setTimeout(() => {
      botTurnTimeoutRef.current = null;
      botActionInFlightRef.current = false;
      const stillBotTurn = isBotGame && isPlayerInGame &&
        gameState.gameStatus === "active" && !gameState.gameOver &&
        gameState.currentPlayer !== gameState.userColor;
      if (!stillBotTurn) return;
      if (!gameState.currentCards || gameState.currentCards.length === 0 ||
        gameState.noValidCard || gameState.validMoves.length === 0) {
        drawCard();
        return;
      }
      playRandomValidMove();
    }, 2000);

    return () => {
      if (botTurnTimeoutRef.current !== null) {
        window.clearTimeout(botTurnTimeoutRef.current);
        botTurnTimeoutRef.current = null;
      }
      botActionInFlightRef.current = false;
    };
  }, [isBotGame, isPlayerInGame, gameState.gameStatus, gameState.gameOver,
    gameState.currentPlayer, gameState.userColor, gameState.currentCards,
    gameState.noValidCard, gameState.validMoves.length, drawCard, playRandomValidMove]);

  // ── Theme vars ─────────────────────────────────────────────────────
  const bg = isDark
    ? "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)"
    : "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 50%, #cbd5e1 100%)";

  const sidebarBg = isDark
    ? "linear-gradient(180deg, rgba(15,23,42,0.97) 0%, rgba(30,41,59,0.97) 100%)"
    : "linear-gradient(180deg, rgba(255,255,255,0.97) 0%, rgba(248,250,252,0.97) 100%)";

  const bottomPanelBg = isDark ? "rgba(13,19,33,0.98)" : "rgba(248,250,252,0.98)";

  const opponentName = gameState.userColor === "white"
    ? currentGame?.player_black_name || "Opponent"
    : currentGame?.player_white_name || "Opponent";

  const isMyTurn = gameState.userColor === gameState.currentPlayer;
  const isBotPlaying = !isMyTurn && isBotGame;
  const turnLabel = isMyTurn ? "Your turn" : isBotPlaying ? "Bot is playing..." : `${opponentName}'s turn`;
  const turnDotColor = isMyTurn ? "#10b981" : isDark ? "#6b7280" : "#9ca3af";

  const boardOrientation = currentGame?.player_white === identityId
    ? "white"
    : currentGame?.player_black === identityId
      ? "black"
      : "white";

  const topPlayerName = boardOrientation === "white" ? (currentGame?.player_black_name || "Bot") : (currentGame?.player_white_name || "Bot");
  const bottomPlayerName = boardOrientation === "white" ? currentGame?.player_white_name : currentGame?.player_black_name;

  const PlayerTag = ({ name }: { name?: string }) => (
    <div
      className="game-tag"
      style={{
        color: isDark ? "#e5e7eb" : "#374151",
        background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
      }}
    >
      <div style={{
        width: 20, height: 20, borderRadius: 4, flexShrink: 0, background: isDark ? "#374151" : "#d1d5db",
        display: "flex", alignItems: "center", justifyContent: "center", color: isDark ? "#9ca3af" : "#ffffff"
      }}>
        <Users size={12} />
      </div>
      <span>{name || "Player"}</span>
    </div>
  );

  const canMove =
    gameState.currentCards.length > 0 &&
    !gameState.gameOver &&
    isPlayerInGame &&
    gameState.currentPlayer === gameState.userColor;

  const sharedControlProps = {
    currentCards: gameState.currentCards,
    cardsToDrawCount: gameState.cardsToDrawCount,
    cardsRemaining: gameState.cardsRemaining,
    isInCheck: gameState.isInCheck,
    checkAttempts: gameState.checkAttempts,
    onDrawCard: drawCard,
    noValidCard: gameState.noValidCard,
    canDrawCard: gameState.canDrawCard,
    currentPlayer: gameState.currentPlayer,
    userColor: gameState.userColor,
    gameOver: gameState.gameOver,
    winner: gameState.winner,
    selectedCardIndex,
    onCardSelect: setSelectedCardIndex,
    onOpenSettings: () => setShowSettingsModal(true),
    onShowResult: () => setResultDismissed(false),
  };

  // Escape closes the result card (same as "View board")
  useEffect(() => {
    if (!gameState.gameOver || resultDismissed) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setResultDismissed(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [gameState.gameOver, resultDismissed]);

  // ── Loading state ──────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="game-shell" style={{ background: bg, color: isDark ? "#f9fafb" : "#1f2937" }}>
        <Header />
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{
              width: 52, height: 52,
              border: "4px solid #667eea", borderTopColor: "transparent",
              borderRadius: "50%", margin: "0 auto 20px",
              animation: "spin 1s linear infinite",
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
            <p style={{ color: isDark ? "#9ca3af" : "#6b7280", fontSize: 16 }}>Loading game…</p>
          </div>
        </div>
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="game-shell" style={{ background: bg, color: isDark ? "#f9fafb" : "#1f2937" }}>
        <Header />
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{
            textAlign: "center", maxWidth: 400, width: "100%",
            background: isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.9)",
            backdropFilter: "blur(10px)", borderRadius: 24, padding: "36px 24px",
            boxShadow: isDark ? "0 8px 32px rgba(0,0,0,0.3)" : "0 8px 32px rgba(0,0,0,0.1)",
          }}>
            <span style={{ fontSize: 48 }}>⚠️</span>
            <h2 style={{ fontSize: 28, fontWeight: 700, color: "#ef4444", margin: "16px 0 8px" }}>Error</h2>
            <p style={{ color: isDark ? "#9ca3af" : "#6b7280", marginBottom: 24, lineHeight: 1.5 }}>{error}</p>
            <button
              onClick={() => navigate("/")}
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white", padding: "14px 28px", borderRadius: 16,
                border: "none", cursor: "pointer", fontSize: 15, fontWeight: 600,
                boxShadow: "0 4px 16px rgba(102,126,234,0.4)",
              }}
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Shared banners ─────────────────────────────────────────────────
  const JoinBanner = () => (
    <div className="cc-banner" style={{
      background: isDark ? "rgba(102,126,234,0.1)" : "rgba(102,126,234,0.08)",
      borderBottom: `1px solid rgba(102,126,234,0.2)`,
    }}>
      <div>
        <p style={{ fontWeight: 700, color: "#667eea", fontSize: 14, marginBottom: 2 }}>Join This Game?</p>
        <p style={{ color: isDark ? "#9ca3af" : "#6b7280", fontSize: 12 }}>
          This game is waiting for a second player.
        </p>
      </div>
      <button
        onClick={handleJoinGameAsOpponent}
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white", padding: "10px 20px", borderRadius: 12,
          border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700,
          boxShadow: "0 4px 14px rgba(102,126,234,0.4)", whiteSpace: "nowrap",
          flexShrink: 0,
        }}
      >
        Join Game
      </button>
    </div>
  );

  const WaitingBanner = () => (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      className="cc-banner"
      style={{
        background: isDark
          ? "linear-gradient(135deg, rgba(168,85,247,0.12) 0%, rgba(236,72,153,0.12) 100%)"
          : "linear-gradient(135deg, rgba(168,85,247,0.08) 0%, rgba(236,72,153,0.08) 100%)",
        borderBottom: `1px solid rgba(168,85,247,0.2)`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Users style={{ width: 18, height: 18, color: "#a855f7" }} />
        </motion.div>
        <div>
          <p style={{ fontWeight: 700, color: isDark ? "#f9fafb" : "#1f2937", fontSize: 13, marginBottom: 2 }}>
            Waiting for Opponent
          </p>
          <p style={{ color: isDark ? "#d1d5db" : "#6b7280", fontSize: 12 }}>Share the link to invite someone</p>
        </div>
      </div>
      <button
        onClick={handleCopyLink}
        style={{
          display: "flex", alignItems: "center", gap: 6,
          background: linkCopied
            ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
            : "linear-gradient(135deg, #a855f7 0%, #ec4899 100%)",
          color: "white", padding: "9px 16px", borderRadius: 12,
          border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700,
          boxShadow: linkCopied ? "0 4px 14px rgba(16,185,129,0.4)" : "0 4px 14px rgba(168,85,247,0.4)",
          transition: "all 0.3s", whiteSpace: "nowrap", flexShrink: 0,
        }}
      >
        {linkCopied ? (
          <><Check style={{ width: 14, height: 14 }} /> Copied!</>
        ) : (
          <><Link2 style={{ width: 14, height: 14 }} /> Copy Link</>
        )}
      </button>
    </motion.div>
  );

  // ── Turn timer chip (idle timeout: the player to move loses when it hits 0:00) ──
  // The countdown ticks inside TurnTimerChip so GamePage itself does not re-render 4x a second.
  const timerChip = (
    <TurnTimerChip
      game={currentGame}
      isMyTurn={isMyTurn}
      isBotGame={isBotGame}
      gameOver={gameState.gameOver}
      isDark={isDark}
    />
  );

  // ── Status strip ───────────────────────────────────────────────────
  const StatusStrip = ({ minimal = false, inline = false }: { minimal?: boolean; inline?: boolean }) => (
    <div
      className="game-status-strip"
      style={inline ? { padding: 0, height: "auto", flex: 1, minWidth: 0 } : {
        background: isDark
          ? currentGame?.game_state?.turn === "white"
            ? "rgba(249,250,251,0.05)"
            : "rgba(17,24,39,0.4)"
          : currentGame?.game_state?.turn === "white"
            ? "rgba(255,255,255,0.7)"
            : "rgba(30,41,59,0.08)",
        borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
        <div className="game-status-dot" style={{ background: turnDotColor, boxShadow: isMyTurn ? `0 0 6px ${turnDotColor}` : "none" }} />
        <span style={{
          fontSize: minimal ? 12 : 13, fontWeight: 600, flexShrink: 1,
          color: isDark ? "#f9fafb" : "#1f2937", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>
          {gameState.gameOver ? (
            gameState.winner === "draw" ? "Game drawn 🤝" :
              gameState.winner === gameState.userColor ? "You won! 🎉" : "You lost 😔"
          ) : (
            isBotPlaying ? (
              <motion.span
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                style={{ display: "inline-block", color: "#6366f1" }}
              >
                🤖 {turnLabel}
              </motion.span>
            ) : turnLabel
          )}
        </span>
        {gameState.isInCheck && !gameState.gameOver && (
          <motion.span
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
            style={{
              fontSize: 10, fontWeight: 800, color: "#ef4444",
              background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.4)",
              borderRadius: 6, padding: "1px 6px", flexShrink: 0,
            }}
          >
            CHECK
          </motion.span>
        )}
        {timerChip}
      </div>
      {!minimal && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          <span style={{ fontSize: 11, color: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)", fontWeight: 600 }}>
            {gameState.cardsRemaining} cards left
          </span>
          <div style={{
            fontSize: 11, padding: "2px 8px", borderRadius: 12,
            background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)",
            color: isDark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.5)", fontWeight: 700,
            textTransform: "capitalize",
          }}>
            {gameState.currentPlayer}
          </div>
        </div>
      )}
    </div>
  );

  // ── Game Over overlay ──────────────────────────────────────────────
  const GameOverOverlay = () => {
    const outcome: "win" | "loss" | "draw" =
      gameState.winner === "draw" || !gameState.winner
        ? "draw"
        : gameState.winner === gameState.userColor
          ? "win"
          : "loss";
    const abandoned = currentGame?.game_state?.status === "abandoned";

    // Why it ended
    let reason: string;
    if (abandoned) {
      reason = outcome === "win"
        ? "Your opponent left or ran out of time"
        : "You ran out of time or left the game";
    } else if (outcome === "draw") {
      reason = "Stalemate or draw";
    } else if (chessGame.isCheckmate()) {
      reason = outcome === "win" ? "Checkmate - well played" : "Checkmate";
    } else {
      reason = outcome === "win" ? "Your opponent couldn't escape check" : "You couldn't escape check in time";
    }

    const theme = {
      win: { bg: "linear-gradient(135deg, #fbbf24 0%, #f97316 50%, #ef4444 100%)", border: "#fcd34d", title: "Victory!", Icon: Trophy },
      loss: { bg: "linear-gradient(135deg, #475569 0%, #334155 60%, #1e293b 100%)", border: "#64748b", title: "Defeat", Icon: Flag },
      draw: { bg: "linear-gradient(135deg, #6366f1 0%, #4f46e5 60%, #3730a3 100%)", border: "#a5b4fc", title: "Draw", Icon: Equal },
    }[outcome];

    const close = () => setResultDismissed(true);

    // Bot game: rematch with the colours swapped and the same cards-per-turn. Human game: there is no
    // rematch handshake on the server, so the primary action is to find a new opponent.
    const handleRematch = async () => {
      if (rematching) return;
      setRematching(true);
      try {
        const nextColor = gameState.userColor === "white" ? "black" : "white";
        const res = await ChessAPI.createGame(nextColor, true, currentGame?.cards_to_draw || gameState.cardsToDrawCount || 1);
        const newId = res.data?.data?.game_id;
        if (newId) navigate(`/game/${newId}`);
        else setRematching(false);
      } catch (e) {
        logger.error("Rematch failed", e);
        setRematching(false);
      }
    };

    const btnBase: React.CSSProperties = {
      width: "100%", minHeight: 48, borderRadius: 14, fontWeight: 700, fontSize: 15,
      cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
      touchAction: "manipulation",
    };

    return (
      <AnimatePresence>
        {gameState.gameOver && !resultDismissed && (
          <div className="cc-gameover-overlay" onClick={close}>
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={`${theme.title}. ${reason}`}
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.85, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", damping: 20, stiffness: 260 }}
              className="cc-gameover-card"
              style={{ background: theme.bg, border: `2px solid ${theme.border}`, position: "relative" }}
            >
              <button
                onClick={close}
                aria-label="Close and view the board"
                style={{
                  position: "absolute", top: 10, right: 10, width: 40, height: 40, minHeight: 40,
                  borderRadius: 12, border: "none", background: "rgba(255,255,255,0.18)", color: "white",
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                <X size={20} />
              </button>

              <motion.div
                animate={outcome === "win" ? { rotate: [0, -10, 10, -10, 10, 0] } : {}}
                transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 2.5 }}
                style={{ display: "inline-block", marginBottom: 10 }}
              >
                <theme.Icon style={{ width: 44, height: 44, color: "white" }} />
              </motion.div>
              <h2 style={{ fontSize: 28, fontWeight: 900, marginBottom: 6 }}>{theme.title}</h2>
              <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 20, opacity: 0.92 }}>{reason}</p>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {isBotGame ? (
                  <button
                    onClick={handleRematch}
                    disabled={rematching}
                    autoFocus
                    style={{ ...btnBase, background: "white", color: "#111827", border: "none", opacity: rematching ? 0.7 : 1 }}
                  >
                    <RotateCcw size={18} /> {rematching ? "Starting…" : "Rematch"}
                  </button>
                ) : (
                  <button
                    onClick={() => navigate("/find-opponent")}
                    autoFocus
                    style={{ ...btnBase, background: "white", color: "#111827", border: "none" }}
                  >
                    <Search size={18} /> Find new opponent
                  </button>
                )}
                <button
                  onClick={() => navigate("/play")}
                  style={{ ...btnBase, background: "rgba(255,255,255,0.18)", color: "white", border: "2px solid rgba(255,255,255,0.45)" }}
                >
                  New game
                </button>
                <button
                  onClick={close}
                  style={{ ...btnBase, minHeight: 44, background: "transparent", color: "white", border: "none", textDecoration: "underline", textUnderlineOffset: 3 }}
                >
                  View board
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    );
  };

  // ── Promotion dialog ───────────────────────────────────────────────
  const PromotionDialog = () => (
    <>
      {!!gameState.pendingPromotion && (
        <div style={{
          position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(4px)", zIndex: 999999,
          display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
        }}>
          <div style={{
            background: isDark ? "#1e293b" : "#ffffff",
            color: isDark ? "#f8fafc" : "#0f172a",
            border: isDark ? "1px solid #334155" : "1px solid #e2e8f0",
            borderRadius: 24, padding: "32px 24px",
            maxWidth: 380, width: "100%",
            boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", position: "relative",
          }}>
            <h2 style={{ textAlign: "center", fontSize: 22, fontWeight: 700, marginBottom: 20 }}>
              Choose Promotion
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
              {[
                { id: "q", name: "Queen", icon: "♕" },
                { id: "r", name: "Rook", icon: "♖" },
                { id: "n", name: "Knight", icon: "♘" },
                { id: "b", name: "Bishop", icon: "♗" },
              ].map((piece) => (
                <button
                  key={piece.id}
                  onClick={() => resolvePromotion(piece.id)}
                  style={{
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    padding: "20px 12px",
                    background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
                    border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
                    borderRadius: 16, cursor: "pointer", transition: "all 0.2s",
                    color: isDark ? "#fff" : "#000",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.06)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
                >
                  <span style={{ fontSize: 42, lineHeight: 1, marginBottom: 6 }}>{piece.icon}</span>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{piece.name}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => cancelPromotion()}
              style={{
                position: "absolute", top: 14, right: 14, background: "transparent",
                border: "none", color: isDark ? "#94a3b8" : "#64748b",
                cursor: "pointer", fontSize: 24, lineHeight: 1, padding: 4,
              }}
              title="Cancel"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  );

  // ── Slim top bar (stack + rail modes) ──────────────────────────────
  const GameTopBar = () => (
    <div
      className="game-topbar"
      style={{
        background: isDark ? "rgba(13,19,33,0.98)" : "rgba(248,250,252,0.98)",
        color: isDark ? "#f9fafb" : "#1f2937",
      }}
    >
      <button
        className="game-iconbtn"
        onClick={() => navigate("/play")}
        aria-label="Back"
        style={{ color: "inherit" }}
      >
        <ChevronLeft size={22} />
      </button>
      <div className="game-topbar__status">
        <StatusStrip minimal inline />
      </div>
      <button
        className="game-iconbtn"
        onClick={() => setShowRules(true)}
        aria-label="Rules"
        style={{ color: "inherit" }}
      >
        <BookOpen size={20} />
      </button>
      <button
        className="game-iconbtn"
        onClick={() => setShowSettingsModal(true)}
        aria-label="Options"
        style={{ color: "inherit" }}
      >
        <Settings size={20} />
      </button>
    </div>
  );

  // ── Main render ────────────────────────────────────────────────────
  const isSide = layoutMode === "side";
  return (
    <div className="game-shell" data-over={gameState.gameOver ? "true" : undefined} style={{
      background: bg, color: isDark ? "#f9fafb" : "#1f2937",
      "--cc-sidebar-w": `${sidebarWidth}px`,
    } as React.CSSProperties}>
      <CollapsibleRulesSidebar isOpen={showRules} onClose={() => setShowRules(false)} />
      {isSide ? <Header /> : <GameTopBar />}

      {/* Banners */}
      {!isBotGame && canJoinGame && !isPlayerInGame && <JoinBanner />}
      {!isBotGame && isWaitingForOpponent && <WaitingBanner />}

      {/* One layout tree for every screen; CSS (.game-main) re-flows it per mode */}
      <div className="game-main" data-mode={layoutMode}>
        {/* Board */}
        <div className="game-board-area">
          <div className="game-board-col">
            <PlayerTag name={topPlayerName} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="game-board-inner"
              style={{
                boxShadow: isDark
                  ? "0 24px 48px -10px rgba(0,0,0,0.7)"
                  : "0 24px 48px -10px rgba(0,0,0,0.2)",
              }}
            >
              <ChessBoard
                game={chessGame}
                fromMoveSelected={gameState.fromMoveSelected}
                validMoves={filteredValidMoves}
                showMoves={selectedCardIndex !== null || showMoves}
                onDrop={onDrop}
                onSquareClick={handleSquareClick}
                currentPlayer={gameState.currentPlayer}
                canMove={canMove}
                orientation={boardOrientation}
              />
            </motion.div>
            <PlayerTag name={bottomPlayerName} />
          </div>
        </div>

        {isSide ? (
          <>
            {/* Resizer */}
            <div
              className="game-resizer"
              onPointerDown={handleDesktopResize}
              style={{ background: sidebarBg, borderLeft: "1px solid rgba(255,255,255,0.05)" }}
            >
              <div style={{ height: "40px", width: "4px", borderRadius: "2px", background: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)" }} />
            </div>

            {/* Sidebar */}
            <aside className="game-sidebar" style={{ background: sidebarBg, backdropFilter: "blur(20px)", borderLeft: "none" }}>
              <StatusStrip />
              <div className="game-sidebar-scroll">
                <motion.div
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.45, delay: 0.15 }}
                  style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1 }}
                >
                  <CompactGameControls {...sharedControlProps} layout="panel" />
                </motion.div>
              </div>
            </aside>
          </>
        ) : (
          /* Card dock: under the board (portrait) or in a rail beside it (landscape) */
          <div className="game-dock" style={{ background: bottomPanelBg }}>
            <CompactGameControls {...sharedControlProps} layout={layoutMode === "rail" ? "dock-rail" : "dock-stack"} />
          </div>
        )}
      </div>

      {/* Global overlays */}
      <GameOverOverlay />
      <PromotionDialog />

      <AnimatePresence>
        {showSettingsModal && (
          <div className="cc-gameover-overlay" style={{ zIndex: 9999 }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              style={{
                background: isDark ? "#1f2937" : "#ffffff",
                borderRadius: "16px", padding: "20px", width: "min(360px, 100%)",
                maxHeight: "90dvh", overflowY: "auto", boxSizing: "border-box", boxShadow: "0 20px 40px -10px rgba(0,0,0,0.5)",
                border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: isDark ? "#f9fafb" : "#111827", display: "flex", alignItems: "center", gap: 8 }}>
                  <Settings size={20} color={isDark ? "#d1d5db" : "#4b5563"} /> Game Options
                </h3>
                <button
                  onClick={() => setShowSettingsModal(false)}
                  style={{ background: "transparent", border: "none", cursor: "pointer", color: isDark ? "#9ca3af" : "#6b7280" }}
                >
                  <X size={20} />
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {/* Sound Toggle */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", background: isDark ? "rgba(255,255,255,0.05)" : "#f3f4f6", borderRadius: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ background: soundEnabled ? "rgba(59,130,246,0.15)" : (isDark ? "rgba(255,255,255,0.1)" : "#e5e7eb"), padding: 8, borderRadius: 8, color: soundEnabled ? "#3b82f6" : "#9ca3af" }}>
                      {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: isDark ? "#f3f4f6" : "#374151" }}>Sound Effects</div>
                      <div style={{ fontSize: 12, color: isDark ? "#9ca3af" : "#6b7280" }}>Enable game notification sounds</div>
                    </div>
                  </div>
                  <div
                    onClick={toggleSound}
                    style={{
                      width: 44, height: 24, borderRadius: 12, cursor: "pointer", position: "relative", padding: 0,
                      background: soundEnabled ? "#3b82f6" : (isDark ? "#4b5563" : "#d1d5db"), transition: "background 0.2s"
                    }}
                  >
                    <div style={{ position: "absolute", top: 2, left: soundEnabled ? 22 : 2, width: 20, height: 20, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }} />
                  </div>
                </div>

                {/* Show Moves Toggle */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", background: isDark ? "rgba(255,255,255,0.05)" : "#f3f4f6", borderRadius: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ background: showMoves ? "rgba(16,185,129,0.15)" : (isDark ? "rgba(255,255,255,0.1)" : "#e5e7eb"), padding: 8, borderRadius: 8, color: showMoves ? "#10b981" : "#9ca3af" }}>
                      {showMoves ? <Eye size={18} /> : <EyeOff size={18} />}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: isDark ? "#f3f4f6" : "#374151" }}>Show Valid Moves</div>
                      <div style={{ fontSize: 12, color: isDark ? "#9ca3af" : "#6b7280" }}>Highlight squares where a piece can move</div>
                    </div>
                  </div>
                  <div
                    onClick={() => setShowMoves(!showMoves)}
                    style={{
                      width: 44, height: 24, borderRadius: 12, cursor: "pointer", position: "relative", padding: 0,
                      background: showMoves ? "#10b981" : (isDark ? "#4b5563" : "#d1d5db"), transition: "background 0.2s"
                    }}
                  >
                    <div style={{ position: "absolute", top: 2, left: showMoves ? 22 : 2, width: 20, height: 20, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }} />
                  </div>
                </div>

                {/* Auto Draw Toggle */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", background: isDark ? "rgba(255,255,255,0.05)" : "#f3f4f6", borderRadius: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ background: autoDrawEnabled ? "rgba(245,158,11,0.15)" : (isDark ? "rgba(255,255,255,0.1)" : "#e5e7eb"), padding: 8, borderRadius: 8, color: autoDrawEnabled ? "#f59e0b" : "#9ca3af" }}>
                      {autoDrawEnabled ? <Zap size={18} /> : <ZapOff size={18} />}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: isDark ? "#f3f4f6" : "#374151" }}>Auto Draw</div>
                      <div style={{ fontSize: 12, color: isDark ? "#9ca3af" : "#6b7280" }}>Automatically draw missing cards</div>
                    </div>
                  </div>
                  <div
                    onClick={toggleAutoDraw}
                    style={{
                      width: 44, height: 24, borderRadius: 12, cursor: "pointer", position: "relative", padding: 0,
                      background: autoDrawEnabled ? "#f59e0b" : (isDark ? "#4b5563" : "#d1d5db"), transition: "background 0.2s"
                    }}
                  >
                    <div style={{ position: "absolute", top: 2, left: autoDrawEnabled ? 22 : 2, width: 20, height: 20, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }} />
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 24 }}>
                <button
                  onClick={() => setShowSettingsModal(false)}
                  style={{
                    width: "100%", padding: "12px", background: isDark ? "rgba(255,255,255,0.05)" : "#e5e7eb",
                    border: "none", borderRadius: 10, cursor: "pointer",
                    fontSize: 14, fontWeight: 700, color: isDark ? "#f3f4f6" : "#374151"
                  }}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Move History Footer (game over only) */}
      {gameState.gameOver && <MoveHistoryFooter moveHistory={gameState.moveHistory} />}
    </div>
  );
};
