import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { PlayingCard as PlayingCardType } from "../types/game";
import { SUIT_SYMBOLS, CARD_MEANINGS } from "../constants/chess";

interface PlayingCardProps {
  card: PlayingCardType;
  isSelected?: boolean;
  isActive?: boolean;
  isMobile?: boolean;
  onClick?: () => void;
  isDark?: boolean;
  variant?: "normal" | "mini";
}

export function PlayingCard({
  card,
  isSelected = false,
  isActive = false,
  isMobile = false,
  onClick,
  isDark = true,
  variant = "normal"
}: PlayingCardProps) {
  const suitSymbol = SUIT_SYMBOLS[card.suit];
  const isRed = card.color === "red";
  const cardColor = isRed ? "#dc2626" : "#111827";
  
  const width = variant === "mini" ? 48 : isMobile ? 78 : 110;
  const height = variant === "mini" ? 68 : isMobile ? 110 : 154;
  
  const fontSizeCornerValue = variant === "mini" ? "10px" : isMobile ? "14px" : "20px";
  const fontSizeCornerSuit = variant === "mini" ? "10px" : isMobile ? "16px" : "24px";
  const fontSizeCenter = variant === "mini" ? "18px" : isMobile ? "30px" : "48px";
  
  const meaningFontSize = variant === "mini" ? "8px" : "11px";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: variant === "mini" ? "4px" : "6px",
        position: "relative",
        cursor: isActive && onClick ? "pointer" : "default",
        userSelect: "none",
        flexShrink: 0,
      }}
      onClick={isActive ? onClick : undefined}
    >
      {/* Glow ring when selected */}
      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            style={{
              position: "absolute",
              top: -4, left: -4, right: -4,
              bottom: variant === "mini" ? 20 : 28,
              borderRadius: 16,
              background: "linear-gradient(135deg, rgba(16,185,129,0.85), rgba(255,255,255,0.75), rgba(16,185,129,0.85))",
              filter: "blur(5px)",
              zIndex: 0,
              pointerEvents: "none",
            }}
          />
        )}
      </AnimatePresence>

      {/* The card itself */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          background: "white",
          borderRadius: variant === "mini" ? "6px" : "12px",
          boxShadow: isSelected
            ? `0 0 0 3px ${isRed ? "#ef4444" : "#111827"}, 0 8px 20px rgba(0,0,0,0.3)`
            : "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          padding: variant === "mini" ? "4px" : isMobile ? "7px" : "10px",
          border: `${variant === "mini" ? 2 : 3}px solid ${cardColor}`,
          width: width,
          height: height,
          aspectRatio: "2.5/3.5",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: isSelected ? "translateY(-4px)" : "translateY(0)",
          transition: "transform 0.15s ease, box-shadow 0.15s ease",
        }}
      >
        {/* Top-left corner */}
        <div
          style={{
            position: "absolute",
            top: variant === "mini" ? "3px" : "6px",
            left: variant === "mini" ? "3px" : "6px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            lineHeight: 1,
            color: cardColor,
          }}
        >
          <span style={{ fontSize: fontSizeCornerValue, fontWeight: "900" }}>{card.value}</span>
          <span style={{ fontSize: fontSizeCornerSuit }}>{suitSymbol}</span>
        </div>

        {/* Center symbol */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: cardColor,
          }}
        >
          <span style={{ fontSize: fontSizeCenter }}>{suitSymbol}</span>
        </div>

        {/* Bottom-right corner */}
        <div
          style={{
            position: "absolute",
            bottom: variant === "mini" ? "3px" : "6px",
            right: variant === "mini" ? "3px" : "6px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            transform: "rotate(180deg)",
            lineHeight: 1,
            color: cardColor,
          }}
        >
          <span style={{ fontSize: fontSizeCornerValue, fontWeight: "900" }}>{card.value}</span>
          <span style={{ fontSize: fontSizeCornerSuit }}>{suitSymbol}</span>
        </div>
      </div>

      {/* Card meaning below */}
      <div
        style={{
          fontSize: meaningFontSize,
          fontWeight: "600",
          color: isDark ? "#9ca3af" : "#4b5563",
          textAlign: "center",
          maxWidth: width,
          minHeight: variant === "mini" ? "12px" : "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        {CARD_MEANINGS[String(card.value).toUpperCase()] || ""}
      </div>
    </div>
  );
}
