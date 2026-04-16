import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { History, ChevronUp, X } from 'lucide-react';
import { MoveHistory } from '../types/game';
import { useTheme } from '../contexts/ThemeContext';

import { PlayingCard as PlayingCardComponent } from './PlayingCard';

interface MoveHistoryFooterProps {
  moveHistory: MoveHistory[];
}

export function MoveHistoryFooter({ moveHistory }: MoveHistoryFooterProps) {
  const { actualTheme } = useTheme();
  const isDark = actualTheme === 'dark';
  const [isExpanded, setIsExpanded] = useState(false);

  if (moveHistory.length === 0) return null;

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsExpanded(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              zIndex: 9999998
            }}
          />
        )}
      </AnimatePresence>

      {/* Footer */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 9999999
        }}
      >
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                background: isDark ? '#1f2937' : 'white',
                borderTop: `2px solid ${isDark ? '#374151' : '#d1d5db'}`,
                boxShadow: '0 -25px 50px -12px rgba(0, 0, 0, 0.25)',
                overflow: 'hidden'
              }}
            >
              <div style={{
                maxWidth: '1280px',
                margin: '0 auto',
                padding: '16px',
                maxHeight: '60vh',
                overflowY: 'auto'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <History style={{ width: '20px', height: '20px', color: '#4f46e5' }} />
                    <h3 style={{ fontWeight: '900', color: isDark ? '#f9fafb' : '#111827' }}>Move History</h3>
                    <span style={{
                      fontSize: '14px',
                      color: isDark ? '#9ca3af' : '#6b7280',
                      background: isDark ? '#374151' : '#f3f4f6',
                      padding: '2px 8px',
                      borderRadius: '9999px'
                    }}>
                      {moveHistory.length} moves
                    </span>
                  </div>
                  <button
                    onClick={() => setIsExpanded(false)}
                    style={{
                      padding: '8px',
                      background: isDark ? '#374151' : '#f3f4f6',
                      borderRadius: '8px',
                      transition: 'background 0.2s ease',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = isDark ? '#4b5563' : '#e5e7eb';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = isDark ? '#374151' : '#f3f4f6';
                    }}
                  >
                    <X style={{ width: '20px', height: '20px', color: isDark ? '#9ca3af' : '#6b7280' }} />
                  </button>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: '12px'
                }}>
                  {[...moveHistory].reverse().map((move, index) => (
                    <motion.div
                      key={moveHistory.length - index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.02 }}
                      style={{
                        fontSize: '13px',
                        padding: '12px',
                        background: isDark 
                          ? 'linear-gradient(90deg, #374151 0%, #4b5563 100%)'
                          : 'linear-gradient(90deg, #f9fafb 0%, #f3f4f6 100%)',
                        borderRadius: '10px',
                        border: `1px solid ${isDark ? '#4b5563' : '#e5e7eb'}`,
                        overflow: 'hidden'
                      }}
                    >
                      {/* Move Number Badge */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '8px',
                        paddingBottom: '8px',
                        borderBottom: `1px solid ${isDark ? '#6b7280' : '#d1d5db'}`
                      }}>
                        <span style={{ 
                          fontWeight: '900', 
                          color: '#4f46e5',
                          fontSize: '14px',
                          background: isDark ? '#6366f1' : '#e0e7ff',
                          padding: '2px 8px',
                          borderRadius: '4px'
                        }}>
                          #{moveHistory.length - index}
                        </span>
                        <span style={{
                          fontWeight: '700',
                          color: isDark ? '#d1d5db' : '#4b5563',
                          fontSize: '12px',
                          textTransform: 'capitalize'
                        }}>
                          {move.player}
                        </span>
                        {move.isFailedAttempt && (
                          <span style={{
                            background: '#fef2f2',
                            color: '#dc2626',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '10px',
                            fontWeight: '700'
                          }}>
                            ⚠️ Failed
                          </span>
                        )}
                      </div>

                      {/* Cards Drawn */}
                      <div style={{ marginBottom: '8px' }}>
                        <p style={{
                          fontSize: '11px',
                          fontWeight: '700',
                          color: isDark ? '#9ca3af' : '#6b7280',
                          marginBottom: '4px'
                        }}>
                          Cards Drawn ({move.cards?.length || 1}):
                        </p>
                        <div style={{
                          display: 'flex',
                          gap: '6px',
                          flexWrap: 'wrap'
                        }}>
                          {move.cards?.map((card, idx) => (
                            <PlayingCardComponent 
                              key={idx} 
                              card={card} 
                              isDark={isDark} 
                              variant="mini" 
                              isSelected={move.usedCard === card}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Used Card specific label (optional since we're highlighting the drawn card now, but keeping for clarity) */}
                      {move.usedCard && (
                        <div style={{ marginBottom: '8px' }}>
                          <p style={{
                            fontSize: '11px',
                            fontWeight: '700',
                            color: '#4f46e5',
                            marginBottom: '3px'
                          }}>
                            Used Card:
                          </p>
                          <div style={{ display: 'inline-block' }}>
                            <PlayingCardComponent card={move.usedCard} isDark={isDark} variant="mini" />
                          </div>
                        </div>
                      )}

                      {/* Chess Move */}
                      {move.move && (
                        <div>
                          <p style={{
                            fontSize: '11px',
                            fontWeight: '700',
                            color: isDark ? '#9ca3af' : '#6b7280',
                            marginBottom: '4px'
                          }}>
                            Move:
                          </p>
                          <div style={{
                            background: isDark ? '#1f2937' : '#ffffff',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            fontSize: '13px',
                            fontWeight: '600',
                            color: isDark ? '#f3f4f6' : '#111827',
                            fontFamily: 'monospace'
                          }}>
                            {move.move.piece.toUpperCase()} {move.move.from} → {move.move.to}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collapsed Bar */}
        <div style={{
          background: isDark ? '#1f2937' : 'white',
          borderTop: `2px solid ${isDark ? '#374151' : '#d1d5db'}`,
          boxShadow: '0 -10px 15px -3px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px' }}>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              style={{
                width: '100%',
                padding: '12px 0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                transition: 'background 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = isDark ? 'rgba(55, 65, 81, 0.5)' : 'rgba(249, 250, 251, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  padding: '8px',
                  background: '#e0e7ff',
                  borderRadius: '8px',
                  transition: 'background 0.2s ease'
                }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#c7d2fe';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#e0e7ff';
                  }}
                >
                  <History style={{ width: '20px', height: '20px', color: '#4f46e5' }} />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <p style={{ fontWeight: '700', color: isDark ? '#f9fafb' : '#111827' }}>Move History</p>
                  <p style={{ fontSize: '12px', color: isDark ? '#9ca3af' : '#6b7280' }}>
                    {moveHistory.length} {moveHistory.length === 1 ? 'move' : 'moves'} played
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {/* Last move info */}
                {moveHistory.length > 0 && (
                  <div style={{ textAlign: 'right', display: 'none' }} className="sm:block">
                    <p style={{ fontSize: '12px', color: isDark ? '#9ca3af' : '#6b7280' }}>Last move:</p>
                    <p style={{
                      fontSize: '14px',
                      fontWeight: '700',
                      color: isDark ? '#f9fafb' : '#111827',
                      maxWidth: '384px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {moveHistory[moveHistory.length - 1].usedCard.value} {moveHistory[moveHistory.length - 1].usedCard.suit[0].toUpperCase()} - {moveHistory[moveHistory.length - 1].move?.piece?.toUpperCase()} {moveHistory[moveHistory.length - 1].move?.from} {moveHistory[moveHistory.length - 1].move?.to}
                    </p>
                  </div>
                )}

                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    padding: '8px',
                    background: isDark ? '#374151' : '#f3f4f6',
                    borderRadius: '8px'
                  }}
                >
                  <ChevronUp style={{ width: '20px', height: '20px', color: isDark ? '#9ca3af' : '#4b5563' }} />
                </motion.div>
              </div>
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
