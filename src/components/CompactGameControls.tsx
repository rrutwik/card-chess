import React from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Trophy,
  RotateCcw,
  Shuffle,
  Play,
  AlertTriangle,
  Eye,
  EyeOff,
} from "lucide-react";
import { PlayingCard, PieceColor } from "../types/game";
import { SUIT_SYMBOLS, CARD_MEANINGS } from "../constants/chess";
import { MAX_CHECK_ATTEMPTS } from "../hooks/useCardChess";
import { useTheme } from "../contexts/ThemeContext";

interface CompactGameControlsProps {
  currentCard: PlayingCard | null;
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
  // onNewGame: () => void;
}

function getCardMeaning(card: PlayingCard): string {
  return CARD_MEANINGS[card.value.toUpperCase()] || "";
}

export function CompactGameControls({
  currentCard,
  isInCheck,
  checkAttempts,
  onDrawCard,
  noValidCard,
  userColor,
  canDrawCard,
  currentPlayer,
  gameOver,
  winner,
  handleShowMoveButton,
  showMoves,
  // onNewGame,
}: CompactGameControlsProps) {
  const { actualTheme } = useTheme();
  const isDark = actualTheme === 'dark';
  const attemptsRemaining = MAX_CHECK_ATTEMPTS - checkAttempts;
  
  return (
    <div style={{ 
      position: 'relative', 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '12px',
      height: '100%',
      width: '100%'
    }}>
      {/* Game Over Overlay */}
      <AnimatePresence>
        {gameOver && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 50,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0, 0, 0, 0.2)',
              backdropFilter: 'blur(4px)',
              borderRadius: '16px'
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{
                background: 'linear-gradient(135deg, #fbbf24 0%, #f97316 50%, #ef4444 100%)',
                borderRadius: '16px',
                padding: '24px',
                color: 'white',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                border: '2px solid #fcd34d',
                margin: '0 16px'
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                marginBottom: '12px'
              }}>
                <motion.div
                  animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    repeatDelay: 2,
                  }}
                >
                  <Trophy style={{ width: '32px', height: '32px' }} />
                </motion.div>
                <h2 style={{ fontSize: '24px', fontWeight: '900' }}>Victory!</h2>
              </div>
              <p style={{
                textAlign: 'center',
                marginBottom: '16px',
                fontWeight: '700',
                textTransform: 'capitalize',
                fontSize: '18px'
              }}>
                {winner} Player Wins! 🎉
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        flex: 1,
        minWidth: 0,
        minHeight: 0,
        overflow: 'hidden'
      }}>
        {/* Current Turn Indicator */}
        <div style={{
          borderRadius: '12px',
          padding: '16px',
          border: '2px solid',
          borderColor: currentPlayer === "white" 
            ? (isDark ? '#e5e7eb' : '#1f2937')
            : (isDark ? '#f3f4f6' : '#374151'),
          boxShadow: isDark 
            ? '0 10px 25px -5px rgba(0, 0, 0, 0.3)' 
            : '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.3s ease',
          background: currentPlayer === "white" 
            ? (isDark ? 'rgba(249, 250, 251, 0.95)' : 'white')
            : (isDark ? 'rgba(17, 24, 39, 0.95)' : '#111827'),
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{
                fontSize: '12px',
                color: currentPlayer === "white" ? '#4b5563' : '#9ca3af'
              }}>
                Current Turn :
              </span>
              <span style={{
                fontSize: '12px',
                fontWeight: '900',
                textTransform: 'capitalize',
                color: currentPlayer === "white" ? '#111827' : 'white'
              }}>
                {" " + currentPlayer}
              </span>
            </div>
          </div>
        </div>

        {/* Check Warning Section */}
        <AnimatePresence mode="wait">
          {isInCheck && checkAttempts >= 0 && !gameOver && (
            <motion.div
              initial={{ opacity: 0, height: 0, scale: 0.95 }}
              animate={{ opacity: 1, height: "auto", scale: 1 }}
              exit={{ opacity: 0, height: 0, scale: 0.95 }}
              style={{ overflow: 'hidden', flexShrink: 0 }}
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
                  borderRadius: '12px',
                  padding: '16px',
                  border: '2px solid',
                  borderColor: attemptsRemaining <= 2 ? '#ef4444' : '#f97316',
                  boxShadow: isDark
                    ? '0 10px 25px -5px rgba(239, 68, 68, 0.3)'
                    : '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                  background: isDark
                    ? (attemptsRemaining <= 2
                      ? 'linear-gradient(135deg, rgba(127, 29, 29, 0.3) 0%, rgba(124, 45, 18, 0.3) 100%)'
                      : 'linear-gradient(135deg, rgba(124, 45, 18, 0.3) 0%, rgba(113, 63, 18, 0.3) 100%)')
                    : (attemptsRemaining <= 2
                      ? 'linear-gradient(135deg, #fef2f2 0%, #fff7ed 100%)'
                      : 'linear-gradient(135deg, #fffbeb 0%, #fff7ed 100%)')
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <motion.div
                    animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
                    transition={{
                      duration: 0.5,
                      repeat: Infinity,
                      repeatDelay: 1,
                    }}
                  >
                    <AlertTriangle
                      style={{
                        width: '24px',
                        height: '24px',
                        color: attemptsRemaining <= 2 ? '#dc2626' : '#ea580c'
                      }}
                    />
                  </motion.div>
                  <div style={{ flex: 1 }}>
                    <p style={{
                      fontWeight: '900',
                      color: attemptsRemaining <= 2 ? '#7f1d1d' : '#7c2d12'
                    }}>
                      King in Check!
                    </p>
                    <p style={{
                      fontSize: '12px',
                      color: attemptsRemaining <= 2 ? '#b91c1c' : '#c2410c'
                    }}>
                      Escape or face checkmate
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span style={{
                      fontWeight: '700',
                      color: attemptsRemaining <= 2 ? '#991b1b' : '#9a3412'
                    }}>
                      Attempts Remaining
                    </span>
                    <span style={{
                      fontWeight: '900',
                      fontSize: '18px',
                      color: attemptsRemaining <= 2 ? '#dc2626' : '#ea580c'
                    }}>
                      {attemptsRemaining}/{MAX_CHECK_ATTEMPTS}
                    </span>
                  </div>

                  <div style={{
                    width: '100%',
                    background: '#e5e7eb',
                    borderRadius: '9999px',
                    height: '8px',
                    overflow: 'hidden',
                    boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)'
                  }}>
                    <motion.div
                      animate={{
                        width: `${(attemptsRemaining / MAX_CHECK_ATTEMPTS) * 100}%`,
                      }}
                      style={{
                        height: '100%',
                        borderRadius: '9999px',
                        background: attemptsRemaining <= 2
                          ? 'linear-gradient(90deg, #dc2626 0%, #ef4444 100%)'
                          : 'linear-gradient(90deg, #f97316 0%, #fbbf24 100%)'
                      }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', paddingTop: '4px' }}>
                    {Array.from({ length: MAX_CHECK_ATTEMPTS }).map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: i < attemptsRemaining
                            ? (attemptsRemaining <= 2 ? '#ef4444' : '#f97316')
                            : '#d1d5db'
                        }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Card Section */}
        <div style={{
          background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'white',
          borderRadius: '16px',
          boxShadow: isDark
            ? '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
            : '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
          border: `2px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : '#e5e7eb'}`,
          overflow: 'hidden',
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{
            background: 'linear-gradient(90deg, #3b82f6 0%, #9333ea 100%)',
            padding: '12px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            flexShrink: 0
          }}>
            <span style={{ fontWeight: '700', fontSize: '12px', color: 'white' }}>Current Card</span>
          </div>
          <div style={{
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            minHeight: 0
          }}>
            <AnimatePresence mode="wait">
              {currentCard ? (
                <motion.div
                  key="card"
                  initial={{ rotateY: 90, opacity: 0 }}
                  animate={{ rotateY: 0, opacity: 1 }}
                  exit={{ rotateY: -90, opacity: 0 }}
                  transition={{ duration: 0.28 }}
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    gap: '16px',
                    maxWidth: '400px'
                  }}
                >
                  {/* Card */}
                  <div style={{
                    position: 'relative',
                    background: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    padding: '16px',
                    border: `3px solid ${currentCard.color === "red" ? '#ef4444' : '#111827'}`,
                    width: '140px',
                    height: '196px',
                    aspectRatio: '2.5/3.5',
                    flexShrink: 0
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: '8px',
                      left: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      lineHeight: 1,
                      color: currentCard.color === "red" ? '#dc2626' : '#111827'
                    }}>
                      <span style={{ fontSize: '20px', fontWeight: '900' }}>
                        {currentCard.value}
                      </span>
                      <span style={{ fontSize: '24px' }}>
                        {SUIT_SYMBOLS[currentCard.suit]}
                      </span>
                    </div>

                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: currentCard.color === "red" ? '#dc2626' : '#111827'
                    }}>
                      <span style={{ fontSize: '48px' }}>
                        {SUIT_SYMBOLS[currentCard.suit]}
                      </span>
                    </div>

                    <div style={{
                      position: 'absolute',
                      bottom: '8px',
                      right: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      transform: 'rotate(180deg)',
                      lineHeight: 1,
                      color: currentCard.color === "red" ? '#dc2626' : '#111827'
                    }}>
                      <span style={{ fontSize: '20px', fontWeight: '900' }}>
                        {currentCard.value}
                      </span>
                      <span style={{ fontSize: '24px' }}>
                        {SUIT_SYMBOLS[currentCard.suit]}
                      </span>
                    </div>
                  </div>

                  {/* Meaning & Warning */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flex: 1,
                    gap: '12px',
                    minWidth: 0
                  }}>
                    <div style={{
                      padding: '12px',
                      background: 'linear-gradient(90deg, #dbeafe 0%, #fae8ff 100%)',
                      border: '2px solid #bfdbfe',
                      borderRadius: '12px',
                      width: '100%'
                    }}>
                      <p style={{
                        fontSize: '12px',
                        color: '#1e3a8a',
                        fontWeight: '700',
                        textAlign: 'center'
                      }}>
                        {getCardMeaning(currentCard)}
                      </p>
                    </div>

                    {noValidCard && (
                      <AnimatePresence>
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.8 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.8 }}
                          style={{ textAlign: 'center' }}
                        >
                          <p style={{
                            display: 'inline-block',
                            fontSize: '12px',
                            color: '#dc2626',
                            fontWeight: '700',
                            background: '#fef2f2',
                            border: '2px solid #fecaca',
                            borderRadius: '9999px',
                            padding: '8px 16px'
                          }}>
                            ⚠️ No valid moves
                          </p>
                        </motion.div>
                      </AnimatePresence>
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="back"
                  initial={{ rotateY: 90, opacity: 0 }}
                  animate={{ rotateY: 0, opacity: 1 }}
                  transition={{ duration: 0.28 }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px',
                    width: '100%',
                    maxWidth: '200px'
                  }}
                >
                  <div style={{
                    position: 'relative',
                    background: 'linear-gradient(135deg, #2563eb 0%, #9333ea 50%, #4338ca 100%)',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    padding: '16px',
                    overflow: 'hidden',
                    width: '140px',
                    height: '196px',
                    aspectRatio: '2.5/3.5',
                    flexShrink: 0
                  }}>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white'
                      }}
                    >
                      <div style={{ fontSize: '48px', marginBottom: '8px' }}>🎴</div>
                      <p style={{ fontWeight: '700', fontSize: '18px' }}>Ready</p>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flexShrink: 0 }}>
          <button
            onClick={onDrawCard}
            disabled={!canDrawCard}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '12px',
              fontWeight: '700',
              fontSize: '14px',
              transition: 'all 0.2s ease',
              boxShadow: canDrawCard
                ? (isDark ? '0 6px 16px -2px rgba(16, 185, 129, 0.4)' : '0 6px 16px -2px rgba(16, 185, 129, 0.3)')
                : 'none',
              background: canDrawCard
                ? 'linear-gradient(90deg, #10b981 0%, #059669 100%)'
                : (isDark ? 'rgba(107, 114, 128, 0.3)' : '#d1d5db'),
              color: canDrawCard ? 'white' : (isDark ? '#6b7280' : '#4b5563'),
              cursor: canDrawCard ? 'pointer' : 'not-allowed',
              opacity: canDrawCard ? 1 : 0.6,
              border: 'none'
            }}
            onMouseEnter={(e) => {
              if (canDrawCard) {
                e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)';
                e.currentTarget.style.filter = 'brightness(1.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (canDrawCard) {
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                e.currentTarget.style.filter = 'brightness(1)';
              }
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              {userColor === currentPlayer ?
               canDrawCard ? (
                <>
                  <Play style={{ width: '20px', height: '20px' }} /> Draw Card
                </>
              ) : (
                "Make Your Move"
              ) : (
                "Opponent's Turn"
              )}
            </div>
          </button>

          <motion.button
            onClick={() => handleShowMoveButton(!showMoves)}
            style={{
              width: '100%',
              padding: '12px',
              background: isDark 
                ? 'rgba(55, 65, 81, 0.8)'
                : '#374151',
              color: isDark ? '#d1d5db' : 'white',
              borderRadius: '12px',
              fontWeight: '600',
              fontSize: '14px',
              boxShadow: isDark
                ? '0 4px 12px -1px rgba(0, 0, 0, 0.3)'
                : '0 4px 12px -1px rgba(0, 0, 0, 0.15)',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'transparent'}`,
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = isDark ? 'rgba(31, 41, 55, 0.9)' : '#1f2937';
              e.currentTarget.style.boxShadow = isDark
                ? '0 10px 25px -5px rgba(0, 0, 0, 0.4)'
                : '0 10px 25px -5px rgba(0, 0, 0, 0.25)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = isDark ? 'rgba(55, 65, 81, 0.8)' : '#374151';
              e.currentTarget.style.boxShadow = isDark
                ? '0 4px 12px -1px rgba(0, 0, 0, 0.3)'
                : '0 4px 12px -1px rgba(0, 0, 0, 0.15)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {showMoves ? (
              <>
                <EyeOff style={{ width: '20px', height: '20px' }} />
                <span>Hide Moves</span>
              </>
            ) : (
              <>
                <Eye style={{ width: '20px', height: '20px' }} />
                <span>Show Moves</span>
              </>
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
