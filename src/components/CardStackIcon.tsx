import React from "react";

interface CardStackIconProps {
  size?: number;
  /** Outline / back-card colour (defaults to the "Draw" button green). */
  accent?: string;
  /** Suit colour on the front card. */
  suit?: string;
}

/** Two tilted playing cards - a crisp, theme-neutral replacement for the 🎴 emoji. */
export function CardStackIcon({ size = 40, accent = "#10b981", suit = "#dc2626" }: CardStackIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      focusable="false"
      style={{ flexShrink: 0, display: "block" }}
    >
      {/* back card: tinted, with a small lattice */}
      <g transform="rotate(-12 24 26)">
        <rect x="8" y="8" width="22" height="31" rx="4" fill={accent} fillOpacity="0.16" stroke={accent} strokeWidth="2" />
        <path
          d="M13 15l12 17M25 15L13 32"
          stroke={accent}
          strokeOpacity="0.4"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </g>

      {/* front card: white with a heart */}
      <g transform="rotate(10 27 26)">
        <rect x="16" y="9" width="22" height="31" rx="4" fill="#ffffff" stroke={accent} strokeWidth="2" />
        <path
          d="M27 32c-6-4.5-7-8-7-9.8 0-2.2 1.7-3.6 3.5-3.6 1.5 0 2.8.8 3.5 2.2.7-1.4 2-2.2 3.5-2.2 1.8 0 3.5 1.4 3.5 3.6 0 1.8-1 5.3-7 9.8z"
          fill={suit}
        />
      </g>
    </svg>
  );
}
