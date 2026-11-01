import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Trophy,
  Play,
  AlertTriangle,
  Settings,
  Zap,
} from "lucide-react";
import { PlayingCard, PieceColor } from "../types/game";
import { SUIT_SYMBOLS, CARD_MEANINGS } from "../constants/chess";
import { MAX_CHECK_ATTEMPTS } from "../hooks/useCardChess";
import { useTheme } from "../contexts/ThemeContext";
import { PlayingCard as PlayingCardComponent } from "./PlayingCard";
import { CardStackIcon } from "./CardStackIcon";

export interface CompactGameControlsProps {
  currentCards: PlayingCard[];
  cardsToDrawCount: number;
  noValidCard: boolean;
  isInCheck: boolean;
  checkAttempts: number;
  cardsRemaining: number;
  onDrawCard: () => void;
  canDrawCard: boolean;
  currentPlayer: PieceColor;
  userColor: PieceColor;
  gameOver: boolean;
  winner: PieceColor | "draw" | null;
  selectedCardIndex: number | null;
  onCardSelect: (index: number | null) => void;
  /**
   * "panel"      - full side panel (laptop / desktop).
   * "dock-stack" - compact dock under the board (portrait phones, foldables, tablets).
   * "dock-rail"  - compact dock in a narrow column beside the board (landscape phones, small windows).
   */
  layout?: "panel" | "dock-stack" | "dock-rail";
  onOpenSettings: () => void;
  /** After the game ends: reopen the result card (rematch / new game). Shown in place of the draw button. */
  onShowResult?: () => void;
}

function getCardMeaning(card: PlayingCard): string {
  return CARD_MEANINGS[String(card.value).toUpperCase()] || "";
}

export function CompactGameControls({
  currentCards,
  cardsToDrawCount,
  isInCheck,
  checkAttempts,
  onDrawCard,
  cardsRemaining,
  noValidCard,
  userColor,
  canDrawCard,
  currentPlayer,
  gameOver,
  winner,
  selectedCardIndex,
  onCardSelect,
  layout = "panel",
  onOpenSettings,
  onShowResult,
}: CompactGameControlsProps) {
  const isDock = layout !== "panel";
  const isMobile = isDock; // PlayingCard still takes the old flag when it is not given an explicit size
  const { actualTheme } = useTheme();
  const isDark = actualTheme === "dark";
  const attemptsRemaining = MAX_CHECK_ATTEMPTS - checkAttempts;
  const isMyTurn = userColor === currentPlayer;
  const isActive = isMyTurn && !gameOver && currentCards.length > 0;

  // The dock sizes its cards from the space it really has (any screen), instead of fixed pixel sizes.
  const dockRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  useLayoutEffect(() => {
    const el = dockRef.current;
    if (!isDock || !el) return;
    const measure = () => setBox({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [isDock]);

  const handleCardClick = (index: number) => {
    if (!isActive) return;
    onCardSelect(selectedCardIndex === index ? null : index);
  };

  // ── Shared card renderer ─────────────────────────────────────────
  const renderCard = (card: PlayingCard, index: number) => {
    return (
      <PlayingCardComponent
        key={index}
        card={card}
        isSelected={selectedCardIndex === index}
        isActive={isActive}
        isMobile={isMobile}
        onClick={() => handleCardClick(index)}
        isDark={isDark}
        variant="normal"
      />
    );
  };

  // ── Card-back placeholder ─────────────────────────────────────────
  const renderCardBack = () => (
    <motion.div
      key="back"
      initial={{ rotateY: 90, opacity: 0 }}
      animate={{ rotateY: 0, opacity: 1 }}
      transition={{ duration: 0.28 }}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "12px",
        width: "100%",
        maxWidth: "200px",
      }}
    >
      <div
        style={{
          position: "relative",
          background:
            "linear-gradient(135deg, #2563eb 0%, #9333ea 50%, #4338ca 100%)",
          borderRadius: "12px",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          padding: "10px",
          overflow: "hidden",
          width: "140px",
          height: "196px",
          aspectRatio: "2.5/3.5",
          flexShrink: 0,
        }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "8px" }}>🎴</div>
          <p style={{ fontWeight: "700", fontSize: "18px" }}>Ready</p>
        </motion.div>
      </div>
    </motion.div>
  );

  // ── DOCK layout (stack + rail) ─────────────────────────────────────
  if (isDock) {
    const isRail = layout === "dock-rail";
    const n = currentCards.length;
    const gap = 8;
    const padX = 12;
    const showCheck = isInCheck && !gameOver;
    const availW = Math.max(0, box.w - padX * 2);
    const byWidth = n > 0 ? Math.floor((availW - gap * (n - 1)) / n) : 0;
    // rail: the dock fills the column height, so fit cards to it. stack: the dock is content-sized,
    // so cap the card height to a share of the viewport instead (keeps the board big).
    const reserved = (showCheck ? 38 : 0) + 20 + 48 + gap * 3 + 16;
    const viewportH = typeof window !== "undefined" ? window.innerHeight : 800;
    const byHeight = isRail ? Math.floor((box.h - reserved - 8) / 1.4) : Math.floor((viewportH * 0.17) / 1.4);
    const cardSize = Math.max(40, Math.min(byWidth > 0 ? byWidth : 96, byHeight > 0 ? byHeight : 96, 96));
    const selected = selectedCardIndex !== null ? currentCards[selectedCardIndex] : undefined;

    let hint = "";
    const resultAction = gameOver && !!onShowResult;
    if (gameOver) hint = "Game over - review the board or start another";
    else if (!isMyTurn) hint = "Waiting for your opponent…";
    else if (selected) hint = `${selected.value}${SUIT_SYMBOLS[selected.suit] || ""}  ·  ${getCardMeaning(selected)}`;
    else if (currentCards.length > 0) hint = noValidCard ? "No legal move with these cards" : "Tap a card, or tap a piece to move";
    else hint = "Draw to get your cards";

    let label: React.ReactNode;
    if (gameOver) label = resultAction ? "Rematch / new game" : "Game over";
    else if (!isMyTurn) label = "Opponent's turn…";
    else if (canDrawCard) label = (<><Play style={{ width: 16, height: 16 }} /> Draw {cardsToDrawCount > 1 ? `${cardsToDrawCount} cards` : "card"}</>);
    else label = "Pick a card, then a piece";

    return (
      <div
        ref={dockRef}
        style={{
          display: "flex",
          flexDirection: "column",
          gap,
          padding: `${gap}px ${padX}px`,
          flex: 1,
          minHeight: 0,
          width: "100%",
          boxSizing: "border-box",
          justifyContent: isRail ? "center" : "flex-start",
        }}
      >
        <AnimatePresence>
          {showCheck && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              style={{ overflow: "hidden", flexShrink: 0 }}
            >
              <div
                style={{
                  borderRadius: 10,
                  padding: "6px 10px",
                  border: `2px solid ${attemptsRemaining <= 2 ? "#ef4444" : "#f97316"}`,
                  background: attemptsRemaining <= 2 ? "rgba(127,29,29,0.3)" : "rgba(124,45,18,0.3)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <AlertTriangle style={{ width: 14, height: 14, color: attemptsRemaining <= 2 ? "#ef4444" : "#f97316", flexShrink: 0 }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: "#fca5a5", flex: 1 }}>
                  King in check! {attemptsRemaining}/{MAX_CHECK_ATTEMPTS} tries left
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Card tray: fits the cards to the width; scrolls (snap) only if they cannot fit */}
        <div
          style={{
            display: "flex",
            gap,
            overflowX: "auto",
            justifyContent: "safe center",
            alignItems: "center",
            minHeight: Math.round(cardSize * 1.4) + 8,
            scrollSnapType: "x proximity",
            WebkitOverflowScrolling: "touch",
            paddingTop: 6,
          }}
        >
          <AnimatePresence mode="wait">
            {n > 0 ? (
              <motion.div
                key="cards"
                initial={{ rotateY: 90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: -90, opacity: 0 }}
                transition={{ duration: 0.28 }}
                style={{ display: "flex", gap, alignItems: "flex-start", margin: "0 auto" }}
              >
                {currentCards.map((card, i) => (
                  <div key={i} style={{ scrollSnapAlign: "center" }}>
                    <PlayingCardComponent
                      card={card}
                      isSelected={selectedCardIndex === i}
                      isActive={isActive}
                      onClick={() => handleCardClick(i)}
                      isDark={isDark}
                      size={cardSize}
                      showMeaning={false}
                    />
                  </div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  color: isDark ? "#6b7280" : "#9ca3af",
                }}
              >
                <CardStackIcon size={Math.max(36, Math.round(cardSize * 0.9))} />
                <span style={{ fontSize: 13, fontWeight: 600 }}>{isMyTurn && !gameOver ? "Your turn - draw" : "No cards yet"}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* One-line hint */}
        <div
          style={{
            minHeight: 20,
            fontSize: 12,
            fontWeight: 600,
            textAlign: "center",
            color: isDark ? "#9ca3af" : "#4b5563",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {hint}
        </div>

        {/* Primary action + deck count */}
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          <button
            onClick={resultAction ? onShowResult : canDrawCard ? onDrawCard : undefined}
            disabled={!canDrawCard && !resultAction}
            aria-label={typeof label === "string" ? label : "Draw cards"}
            style={{
              flex: 1,
              minHeight: 48,
              padding: "0 12px",
              borderRadius: 14,
              border: "none",
              fontWeight: 700,
              fontSize: 15,
              cursor: canDrawCard || resultAction ? "pointer" : "not-allowed",
              background: resultAction
                ? "linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)"
                : canDrawCard
                  ? "linear-gradient(90deg, #10b981 0%, #059669 100%)"
                  : isDark ? "rgba(107,114,128,0.3)" : "#d1d5db",
              color: canDrawCard || resultAction ? "white" : isDark ? "#9ca3af" : "#4b5563",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              boxShadow: resultAction ? "0 4px 12px rgba(99,102,241,0.35)" : canDrawCard ? "0 4px 12px rgba(16,185,129,0.35)" : "none",
              transition: "all 0.2s",
              touchAction: "manipulation",
            }}
          >
            {label}
          </button>
          <div
            title="Cards left in the draw pile"
            style={{
              minWidth: 52,
              minHeight: 48,
              borderRadius: 14,
              background: "rgba(139,92,246,0.14)",
              border: "1px solid rgba(139,92,246,0.28)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: 16, fontWeight: 900, color: "#a78bfa", lineHeight: 1 }}>{cardsRemaining}</span>
            <span style={{ fontSize: 9, color: "rgba(167,139,250,0.75)", fontWeight: 700, marginTop: 2, letterSpacing: "0.06em" }}>DECK</span>
          </div>
        </div>
      </div>
    );
  }

  // ── DESKTOP layout (original structure) ───────────────────────────
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        height: "100%",
        width: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          flex: 1,
          minWidth: 0,
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        {gameOver && onShowResult && (
          <button
            onClick={onShowResult}
            style={{
              flexShrink: 0,
              minHeight: 44,
              borderRadius: 12,
              border: "none",
              fontWeight: 700,
              fontSize: 14,
              color: "white",
              cursor: "pointer",
              background: "linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)",
              boxShadow: "0 4px 12px rgba(99,102,241,0.35)",
            }}
          >
            Game over · Rematch / new game
          </button>
        )}

        {/* Current Turn Indicator */}
        <div
          style={{
            borderRadius: "12px",
            padding: "6px 8px",
            border: "2px solid",
            borderColor:
              currentPlayer === "white"
                ? isDark ? "#e5e7eb" : "#1f2937"
                : isDark ? "#f3f4f6" : "#374151",
            boxShadow: isDark
              ? "0 10px 25px -5px rgba(0, 0, 0, 0.3)"
              : "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
            background:
              currentPlayer === "white"
                ? isDark ? "rgba(249, 250, 251, 0.95)" : "white"
                : isDark ? "rgba(17, 24, 39, 0.95)" : "#111827",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <span style={{ fontSize: "12px", color: currentPlayer === "white" ? "#4b5563" : "#9ca3af" }}>
                Current Turn:
              </span>
              <span style={{ fontSize: "12px", fontWeight: "900", textTransform: "capitalize", color: currentPlayer === "white" ? "#111827" : "white" }}>
                {" " + currentPlayer}
              </span>
            </div>
          </div>
        </div>

        {/* Check Warning */}
        <AnimatePresence mode="wait">
          {isInCheck && checkAttempts >= 0 && !gameOver && (
            <motion.div
              initial={{ opacity: 0, height: 0, scale: 0.6 }}
              animate={{ opacity: 1, height: "auto", scale: 1 }}
              exit={{ opacity: 0, height: 0, scale: 0.6 }}
              style={{ overflow: "hidden", flexShrink: 0 }}
            >
              <motion.div
                animate={{
                  boxShadow: [
                    "0 0 0 0 rgba(239, 68, 68, 0.4)",
                    "0 0 0 8px rgba(239, 68, 68, 0)",
                    "0 0 0 0 rgba(239, 68, 68, 0)",
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{
                  borderRadius: "12px",
                  padding: "10px",
                  border: "2px solid",
                  borderColor: attemptsRemaining <= 2 ? "#ef4444" : "#f97316",
                  background: isDark
                    ? attemptsRemaining <= 2
                      ? "linear-gradient(135deg, rgba(127, 29, 29, 0.3) 0%, rgba(124, 45, 18, 0.3) 100%)"
                      : "linear-gradient(135deg, rgba(124, 45, 18, 0.3) 0%, rgba(113, 63, 18, 0.3) 100%)"
                    : attemptsRemaining <= 2
                      ? "linear-gradient(135deg, #fef2f2 0%, #fff7ed 100%)"
                      : "linear-gradient(135deg, #fffbeb 0%, #fff7ed 100%)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                  <motion.div
                    animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
                  >
                    <AlertTriangle style={{ width: "24px", height: "24px", color: attemptsRemaining <= 2 ? "#dc2626" : "#ea580c" }} />
                  </motion.div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: "500", color: attemptsRemaining <= 2 ? "#7f1d1d" : "#7c2d12" }}>
                      King in Check!
                    </p>
                    <p style={{ fontSize: "10px", color: attemptsRemaining <= 2 ? "#b91c1c" : "#c2410c" }}>
                      Escape or face checkmate
                    </p>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "10px" }}>
                    <span style={{ fontWeight: "500", color: attemptsRemaining <= 2 ? "#991b1b" : "#9a3412" }}>
                      Attempts Remaining
                    </span>
                    <span style={{ fontWeight: "600", fontSize: "15px", color: attemptsRemaining <= 2 ? "#dc2626" : "#ea580c" }}>
                      {attemptsRemaining}/{MAX_CHECK_ATTEMPTS}
                    </span>
                  </div>
                  <div style={{
                    width: "100%", background: "#e5e7eb",
                    borderRadius: "9999px", height: "8px", overflow: "hidden",
                    boxShadow: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
                  }}>
                    <motion.div
                      animate={{ width: `${(attemptsRemaining / MAX_CHECK_ATTEMPTS) * 100}%` }}
                      style={{
                        height: "100%", borderRadius: "99px",
                        background: attemptsRemaining <= 2
                          ? "linear-gradient(90deg, #dc2626 0%, #ef4444 100%)"
                          : "linear-gradient(90deg, #f97316 0%, #fbbf24 100%)",
                      }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <div style={{ display: "flex", gap: "4px", justifyContent: "center", paddingTop: "4px" }}>
                    {Array.from({ length: MAX_CHECK_ATTEMPTS }).map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        style={{
                          width: "8px", height: "8px", borderRadius: "50%",
                          background: i < attemptsRemaining
                            ? attemptsRemaining <= 2 ? "#ef4444" : "#f97316"
                            : "#d1d5db",
                        }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Card Container — original blue-to-purple header */}
        <div
          style={{
            background: isDark ? "rgba(255, 255, 255, 0.05)" : "white",
            borderRadius: "16px",
            boxShadow: isDark
              ? "0 10px 25px -5px rgba(0, 0, 0, 0.3)"
              : "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
            border: `1px solid ${isDark ? "rgba(255, 255, 255, 0.1)" : "#e5e7eb"}`,
            overflow: "hidden",
            flex: 1,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Gradient header */}
          <div
            style={{
              background: "linear-gradient(90deg, #3b82f6 0%, #9333ea 100%)",
              padding: "8px 14px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexShrink: 0,
            }}
          >
            <span style={{ fontWeight: "700", fontSize: "12px", color: "white" }}>
              Total Cards in Deck ({cardsRemaining})
            </span>
            {selectedCardIndex !== null && (
              <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>
                ✦ Filtered by card
              </span>
            )}
          </div>

          {/* Cards area */}
          <div
            style={{
              padding: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flex: 1,
              minHeight: 0,
              overflowY: "auto",
            }}
          >
            <AnimatePresence mode="wait">
              {currentCards && currentCards.length > 0 ? (
                <motion.div
                  key="cards"
                  initial={{ rotateY: 90, opacity: 0 }}
                  animate={{ rotateY: 0, opacity: 1 }}
                  exit={{ rotateY: -90, opacity: 0 }}
                  transition={{ duration: 0.28 }}
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    flexWrap: "wrap",
                    alignItems: "flex-start",
                    justifyContent: "center",
                    gap: "16px",
                    width: "100%",
                    paddingBottom: "4px",
                  }}
                >
                  {currentCards.map((card, index) => renderCard(card, index))}
                </motion.div>
              ) : (
                <motion.div
                  key="back"
                  initial={{ rotateY: 90, opacity: 0 }}
                  animate={{ rotateY: 0, opacity: 1 }}
                  transition={{ duration: 0.28 }}
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", width: "100%", maxWidth: "200px" }}
                >
                  {renderCardBack()}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", flexShrink: 0 }}>
          {/* Cards per turn + auto draw */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              padding: "8px 12px",
              background: isDark ? "rgba(139, 92, 246, 0.1)" : "rgba(139, 92, 246, 0.05)",
              borderRadius: "12px",
              border: `1px solid ${isDark ? "rgba(139, 92, 246, 0.3)" : "rgba(139, 92, 246, 0.2)"}`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            </div>
            <span style={{ fontSize: "12px", fontWeight: "600", color: isDark ? "#d8b4fe" : "#7c3aed" }}>
              📋 Cards per turn:
            </span>
            <span
              style={{
                fontSize: "14px", fontWeight: "700",
                color: isDark ? "#d8b4fe" : "#6d28d9",
                background: isDark ? "rgba(139, 92, 246, 0.2)" : "rgba(139, 92, 246, 0.1)",
                padding: "4px 10px", borderRadius: "8px",
              }}
            >
              {cardsToDrawCount}
            </span>
          </div>

          {/* Draw button */}
          <button
            onClick={onDrawCard}
            disabled={!canDrawCard}
            style={{
              width: "100%", padding: "12px 16px",
              borderRadius: "12px", fontWeight: "700", fontSize: "14px",
              border: "none",
              transition: "all 0.2s ease",
              boxShadow: canDrawCard
                ? isDark ? "0 6px 16px -2px rgba(16, 185, 129, 0.4)" : "0 6px 16px -2px rgba(16, 185, 129, 0.3)"
                : "none",
              background: canDrawCard
                ? "linear-gradient(90deg, #10b981 0%, #059669 100%)"
                : isDark ? "rgba(107, 114, 128, 0.3)" : "#d1d5db",
              color: canDrawCard ? "white" : isDark ? "#6b7280" : "#4b5563",
              cursor: canDrawCard ? "pointer" : "not-allowed",
              opacity: canDrawCard ? 1 : 0.6,
            }}
            onMouseEnter={(e) => {
              if (canDrawCard) {
                e.currentTarget.style.filter = "brightness(1.1)";
                e.currentTarget.style.transform = "translateY(-1px)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.filter = "brightness(1)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
              {userColor === currentPlayer ? (
                canDrawCard ? (
                  <><Play style={{ width: "20px", height: "20px" }} /> Draw {cardsToDrawCount > 1 ? `${cardsToDrawCount} Cards` : "Card"}</>
                ) : "Make Your Move"
              ) : "Opponent's Turn"}
            </div>
          </button>

          {/* Game Options button */}
          <motion.button
            onClick={onOpenSettings}
            style={{
              width: "100%", padding: "12px",
              background: isDark ? "rgba(55, 65, 81, 0.8)" : "#374151",
              color: isDark ? "#d1d5db" : "white",
              borderRadius: "12px", fontWeight: "600", fontSize: "14px",
              boxShadow: isDark ? "0 4px 12px -1px rgba(0, 0, 0, 0.3)" : "0 4px 12px -1px rgba(0, 0, 0, 0.15)",
              transition: "all 0.2s ease",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              border: `1px solid ${isDark ? "rgba(255, 255, 255, 0.1)" : "transparent"}`,
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = isDark ? "rgba(31, 41, 55, 0.9)" : "#1f2937";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = isDark ? "rgba(55, 65, 81, 0.8)" : "#374151";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <Settings style={{ width: "20px", height: "20px" }} /><span>Game Options</span>
          </motion.button>
        </div>
      </div>
    </div>
  );
}
