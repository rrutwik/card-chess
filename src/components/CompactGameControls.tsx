import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Trophy,
  Play,
  AlertTriangle,
  Eye,
  EyeOff,
  Zap,
} from "lucide-react";
import { PlayingCard, PieceColor } from "../types/game";
import { SUIT_SYMBOLS, CARD_MEANINGS } from "../constants/chess";
import { MAX_CHECK_ATTEMPTS } from "../hooks/useCardChess";
import { useTheme } from "../contexts/ThemeContext";
import { PlayingCard as PlayingCardComponent } from "./PlayingCard";

export interface CompactGameControlsProps {
  currentCards: PlayingCard[];
  cardsToDrawCount: number;
  noValidCard: boolean;
  isInCheck: boolean;
  checkAttempts: number;
  cardsRemaining: number;
  onDrawCard: () => void;
  onReshuffle: () => void;
  canDrawCard: boolean;
  currentPlayer: PieceColor;
  userColor: PieceColor;
  gameOver: boolean;
  handleShowMoveButton: (show: boolean) => void;
  showMoves: boolean;
  winner: PieceColor | "draw" | null;
  selectedCardIndex: number | null;
  onCardSelect: (index: number | null) => void;
  isMobile?: boolean;
  autoDrawEnabled?: boolean;
  onToggleAutoDraw?: () => void;
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
  handleShowMoveButton,
  showMoves,
  selectedCardIndex,
  onCardSelect,
  isMobile = false,
  autoDrawEnabled = false,
  onToggleAutoDraw,
}: CompactGameControlsProps) {
  const { actualTheme } = useTheme();
  const isDark = actualTheme === "dark";
  const attemptsRemaining = MAX_CHECK_ATTEMPTS - checkAttempts;
  const isMyTurn = userColor === currentPlayer;
  const isActive = isMyTurn && !gameOver && currentCards.length > 0;

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

  // ── MOBILE layout ──────────────────────────────────────────────────
  if (isMobile) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          gap: "8px",
          padding: "8px 12px 6px",
        }}
      >
        {/* Check warning (compact) */}
        <AnimatePresence>
          {isInCheck && !gameOver && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              style={{ overflow: "hidden", flexShrink: 0 }}
            >
              <div
                style={{
                  borderRadius: "10px",
                  padding: "8px 12px",
                  border: `2px solid ${attemptsRemaining <= 2 ? "#ef4444" : "#f97316"}`,
                  background: attemptsRemaining <= 2
                    ? "linear-gradient(135deg, rgba(127,29,29,0.3), rgba(124,45,18,0.3))"
                    : "linear-gradient(135deg, rgba(124,45,18,0.3), rgba(113,63,18,0.3))",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <AlertTriangle style={{ width: 14, height: 14, color: attemptsRemaining <= 2 ? "#ef4444" : "#f97316", flexShrink: 0 }} />
                <span style={{ fontSize: "12px", fontWeight: "600", color: "#fca5a5", flex: 1 }}>
                  King in Check! {attemptsRemaining}/{MAX_CHECK_ATTEMPTS} left
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cards row */}
        <div
          style={{
            flex: 1,
            display: "flex",
            gap: "10px",
            overflowX: "auto",
            alignItems: "center",
            paddingBottom: "4px",
          }}
        >
          <AnimatePresence mode="wait">
            {currentCards.length > 0 ? (
              <motion.div
                key="cards"
                initial={{ rotateY: 90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: -90, opacity: 0 }}
                transition={{ duration: 0.28 }}
                style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}
              >
                {currentCards.map((card, i) => renderCard(card, i))}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "4px",
                  color: isDark ? "#6b7280" : "#9ca3af",
                }}
              >
                <span style={{ fontSize: "28px" }}>🎴</span>
                <span style={{ fontSize: "12px", fontWeight: "600" }}>
                  {isMyTurn ? "Draw a card!" : "Opponent's turn"}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Action row */}
        <div style={{ display: "flex", gap: "7px", flexShrink: 0 }}>
          {/* Draw button */}
          <button
            onClick={canDrawCard ? onDrawCard : undefined}
            disabled={!canDrawCard}
            style={{
              flex: 1,
              padding: "10px 8px",
              borderRadius: "12px",
              border: "none",
              fontWeight: "700",
              fontSize: "12px",
              cursor: canDrawCard ? "pointer" : "not-allowed",
              background: canDrawCard
                ? "linear-gradient(90deg, #10b981 0%, #059669 100%)"
                : isDark ? "rgba(107,114,128,0.3)" : "#d1d5db",
              color: canDrawCard ? "white" : isDark ? "#6b7280" : "#4b5563",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "5px",
              boxShadow: canDrawCard ? "0 4px 12px rgba(16,185,129,0.35)" : "none",
              transition: "all 0.2s",
            }}
          >
            {isMyTurn ? (
              canDrawCard ? (
                <><Play style={{ width: 13, height: 13 }} /> Draw {cardsToDrawCount > 1 ? `${cardsToDrawCount} Cards` : "Card"}</>
              ) : "Make Your Move"
            ) : "Opponent's Turn"}
          </button>

          {/* Deck count */}
          <div style={{
            padding: "0 10px",
            borderRadius: "12px",
            background: "rgba(139,92,246,0.14)",
            border: "1px solid rgba(139,92,246,0.28)",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            flexShrink: 0, minWidth: 46,
          }}>
            <span style={{ fontSize: 15, fontWeight: 900, color: "#a78bfa", lineHeight: 1 }}>{cardsRemaining}</span>
            <span style={{ fontSize: 7, color: "rgba(167,139,250,0.65)", fontWeight: 700, marginTop: 2, letterSpacing: "0.06em" }}>DECK</span>
          </div>

          {/* Show moves */}
          <button
            onClick={() => handleShowMoveButton(!showMoves)}
            style={{
              padding: "0 10px", borderRadius: "12px", border: "1px solid",
              borderColor: showMoves ? "rgba(16,185,129,0.4)" : isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.15)",
              background: showMoves ? "rgba(16,185,129,0.14)" : isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
              color: showMoves ? "rgba(16,185,129,0.9)" : isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.6)",
              cursor: "pointer", display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              gap: 2, flexShrink: 0, minWidth: 40,
            }}
          >
            {showMoves ? <EyeOff style={{ width: 14, height: 14 }} /> : <Eye style={{ width: 14, height: 14 }} />}
            <span style={{ fontSize: 7, fontWeight: 700 }}>MOVES</span>
          </button>

          {/* Auto draw */}
          <button
            onClick={onToggleAutoDraw}
            style={{
              padding: "0 9px", borderRadius: "12px", border: "1px solid",
              borderColor: autoDrawEnabled ? "rgba(16,185,129,0.4)" : isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.15)",
              background: autoDrawEnabled ? "rgba(16,185,129,0.14)" : isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
              color: autoDrawEnabled ? "rgba(16,185,129,0.9)" : isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.6)",
              cursor: "pointer", display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              gap: 2, flexShrink: 0, minWidth: 40,
            }}
          >
            <Zap style={{ width: 13, height: 13 }} />
            <span style={{ fontSize: 7, fontWeight: 700 }}>AUTO</span>
          </button>
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
              <Zap style={{ width: "14px", height: "14px", color: isDark ? "#d8b4fe" : "#7c3aed" }} />
              <span style={{ fontSize: "12px", fontWeight: "600", color: isDark ? "#d8b4fe" : "#7c3aed" }}>
                Auto Draw Cards
              </span>
              {/* Toggle */}
              <div
                onClick={onToggleAutoDraw}
                style={{
                  position: "relative", width: "40px", height: "22px",
                  borderRadius: "999px", cursor: "pointer",
                  background: autoDrawEnabled
                    ? "linear-gradient(90deg, #10b981 0%, #059669 100%)"
                    : isDark ? "rgba(107,114,128,0.4)" : "#d1d5db",
                  transition: "background 0.25s ease",
                  flexShrink: 0,
                  boxShadow: autoDrawEnabled ? "0 0 8px rgba(16,185,129,0.4)" : "none",
                }}
              >
                <div
                  style={{
                    position: "absolute", top: "3px",
                    left: autoDrawEnabled ? "21px" : "3px",
                    width: "16px", height: "16px",
                    borderRadius: "50%", background: "white",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
                    transition: "left 0.25s ease",
                  }}
                />
              </div>
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

          {/* Show moves button */}
          <motion.button
            onClick={() => handleShowMoveButton(!showMoves)}
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
            {showMoves ? (
              <><EyeOff style={{ width: "20px", height: "20px" }} /><span>Hide Moves</span></>
            ) : (
              <><Eye style={{ width: "20px", height: "20px" }} /><span>Show Moves</span></>
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
