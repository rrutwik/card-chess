import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Trophy, Clock, Eye, RotateCcw, Calendar } from 'lucide-react';
import { ChessAPI, ChessGame } from '../services/api';
import { Header } from '../components/Header';
import { useTheme } from '../contexts/ThemeContext';

export const HistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { actualTheme } = useTheme();
  const isDark = actualTheme === 'dark';
  const [games, setGames] = useState<ChessGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadGameHistory();
  }, []);

  const loadGameHistory = async () => {
    try {
      setLoading(true);
      const response = await ChessAPI.getGameHistory();
      setGames(response.data.data);
      setError(null);
    } catch (err: any) {
      console.error('Error loading game history:', err);
      setError(err.response?.data?.message || 'Failed to load game history');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getGameResult = (game: ChessGame) => {
    if (game.game_state.status === 'abandoned') {
      return 'Abandoned';
    }
    if (game.game_state.winner === 'draw') {
      return 'Draw';
    }
    return `${game.game_state.winner} wins`;
  };

  const getResultColor = (game: ChessGame) => {
    if (game.game_state.status === 'abandoned') {
      return isDark ? '#9ca3af' : '#6b7280';
    }
    if (game.game_state.winner === 'draw') {
      return isDark ? '#fbbf24' : '#d97706';
    }
    return isDark ? '#34d399' : '#059669';
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: isDark 
          ? 'linear-gradient(180deg, #0f0f1e 0%, #1a1a2e 50%, #0f0f1e 100%)'
          : 'linear-gradient(180deg, #f8f9ff 0%, #ffffff 50%, #f8f9ff 100%)',
        color: isDark ? '#f9fafb' : '#1f2937',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
      }}>
        <Header />
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 'calc(100vh - 64px)'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '64px',
              height: '64px',
              border: `4px solid ${isDark ? '#667eea' : '#667eea'}`,
              borderTopColor: 'transparent',
              borderRadius: '50%',
              margin: '0 auto 24px',
              animation: 'spin 1s linear infinite'
            }}></div>
            <style>{`
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            `}</style>
            <p style={{
              color: isDark ? '#9ca3af' : '#6b7280',
              fontSize: '18px'
            }}>Loading game history...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        background: isDark 
          ? 'linear-gradient(180deg, #0f0f1e 0%, #1a1a2e 50%, #0f0f1e 100%)'
          : 'linear-gradient(180deg, #f8f9ff 0%, #ffffff 50%, #f8f9ff 100%)',
        color: isDark ? '#f9fafb' : '#1f2937',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
      }}>
        <Header />
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 'calc(100vh - 64px)',
          padding: '16px'
        }}>
          <div style={{
            textAlign: 'center',
            background: isDark 
              ? 'rgba(255, 255, 255, 0.05)'
              : 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            padding: '40px',
            borderRadius: '24px',
            boxShadow: isDark 
              ? '0 8px 32px rgba(0, 0, 0, 0.3)'
              : '0 8px 32px rgba(0, 0, 0, 0.1)',
            maxWidth: '448px',
            width: '100%',
            border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: isDark ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px'
            }}>
              <Clock style={{ width: '40px', height: '40px', color: '#ef4444' }} />
            </div>
            <h2 style={{
              fontSize: '32px',
              fontWeight: '700',
              color: '#ef4444',
              marginBottom: '16px'
            }}>Error</h2>
            <p style={{
              color: isDark ? '#9ca3af' : '#6b7280',
              marginBottom: '32px',
              fontSize: '16px',
              lineHeight: '1.5'
            }}>{error}</p>
            <button
              onClick={loadGameHistory}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                padding: '16px 32px',
                borderRadius: '16px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                boxShadow: '0 4px 16px rgba(102, 126, 234, 0.4)',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                margin: '0 auto'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(102, 126, 234, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(102, 126, 234, 0.4)';
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: isDark 
        ? 'linear-gradient(180deg, #0f0f1e 0%, #1a1a2e 50%, #0f0f1e 100%)'
        : 'linear-gradient(180deg, #f8f9ff 0%, #ffffff 50%, #f8f9ff 100%)',
      color: isDark ? '#f9fafb' : '#1f2937',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      <Header showBackButton={true} backTo="/" />

      {/* Background decorative elements */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0
      }}>
        <div style={{
          position: 'absolute',
          top: '15%',
          right: '5%',
          width: '400px',
          height: '400px',
          background: isDark 
            ? 'radial-gradient(circle, rgba(102, 126, 234, 0.15) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(102, 126, 234, 0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(40px)'
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '15%',
          left: '5%',
          width: '350px',
          height: '350px',
          background: isDark 
            ? 'radial-gradient(circle, rgba(234, 179, 8, 0.15) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(234, 179, 8, 0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(40px)'
        }}></div>
      </div>

      <div style={{
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 64px)',
        padding: '32px 16px'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '1280px'
        }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{ marginBottom: '32px' }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px',
              marginBottom: '24px'
            }}>
              <div>
                <h1 style={{
                  fontSize: 'clamp(28px, 6vw, 40px)',
                  fontWeight: '800',
                  color: isDark ? '#f9fafb' : '#1f2937',
                  marginBottom: '12px',
                  letterSpacing: '-0.5px'
                }}>
                  Game History
                </h1>
                <p style={{
                  color: isDark ? '#d1d5db' : '#6b7280',
                  fontSize: '16px'
                }}>
                  Review your past games and track your progress
                </p>
              </div>
              <button
                onClick={() => navigate('/games')}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  padding: '16px 32px',
                  borderRadius: '16px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '600',
                  boxShadow: '0 4px 16px rgba(102, 126, 234, 0.4)',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(102, 126, 234, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(102, 126, 234, 0.4)';
                }}
              >
                <RotateCcw style={{ width: '20px', height: '20px' }} />
                <span>Active Games</span>
              </button>
            </div>
          </motion.div>

          {games.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              style={{
                textAlign: 'center',
                padding: '80px 16px',
                background: isDark 
                  ? 'rgba(255, 255, 255, 0.05)'
                  : 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                borderRadius: '24px',
                boxShadow: isDark 
                  ? '0 8px 32px rgba(0, 0, 0, 0.3)'
                  : '0 8px 32px rgba(102, 126, 234, 0.1)',
                border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(102, 126, 234, 0.2)'}`
              }}
            >
              <div style={{
                width: '128px',
                height: '128px',
                background: isDark 
                  ? 'rgba(234, 179, 8, 0.1)'
                  : 'rgba(234, 179, 8, 0.1)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 32px'
              }}>
                <Trophy style={{ 
                  width: '64px', 
                  height: '64px', 
                  color: isDark ? '#fbbf24' : '#d97706' 
                }} />
              </div>
              <h3 style={{
                fontSize: '32px',
                fontWeight: '700',
                color: isDark ? '#f9fafb' : '#1f2937',
                marginBottom: '16px'
              }}>
                No Games Yet
              </h3>
              <p style={{
                color: isDark ? '#9ca3af' : '#6b7280',
                marginBottom: '40px',
                fontSize: '18px'
              }}>
                Start playing to build your game history!
              </p>
              <button
                onClick={() => navigate('/play')}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  padding: '20px 40px',
                  borderRadius: '16px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '18px',
                  fontWeight: '600',
                  boxShadow: '0 4px 16px rgba(102, 126, 234, 0.4)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(102, 126, 234, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(102, 126, 234, 0.4)';
                }}
              >
                Play Your First Game
              </button>
            </motion.div>
          ) : (
            <div style={{
              background: isDark 
                ? 'rgba(255, 255, 255, 0.05)'
                : 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              borderRadius: '24px',
              boxShadow: isDark 
                ? '0 8px 32px rgba(0, 0, 0, 0.3)'
                : '0 8px 32px rgba(102, 126, 234, 0.1)',
              overflow: 'hidden',
              border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(102, 126, 234, 0.2)'}`
            }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse'
                }}>
                  <thead>
                    <tr style={{
                      background: isDark 
                        ? 'rgba(255, 255, 255, 0.03)'
                        : 'rgba(102, 126, 234, 0.05)'
                    }}>
                      <th style={{
                        padding: '16px 24px',
                        textAlign: 'left',
                        fontSize: '12px',
                        fontWeight: '600',
                        color: isDark ? '#9ca3af' : '#6b7280',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>Game</th>
                      <th style={{
                        padding: '16px 24px',
                        textAlign: 'left',
                        fontSize: '12px',
                        fontWeight: '600',
                        color: isDark ? '#9ca3af' : '#6b7280',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>Result</th>
                      <th style={{
                        padding: '16px 24px',
                        textAlign: 'left',
                        fontSize: '12px',
                        fontWeight: '600',
                        color: isDark ? '#9ca3af' : '#6b7280',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>Moves</th>
                      <th style={{
                        padding: '16px 24px',
                        textAlign: 'left',
                        fontSize: '12px',
                        fontWeight: '600',
                        color: isDark ? '#9ca3af' : '#6b7280',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>Played</th>
                      <th style={{
                        padding: '16px 24px',
                        textAlign: 'right',
                        fontSize: '12px',
                        fontWeight: '600',
                        color: isDark ? '#9ca3af' : '#6b7280',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {games.map((game, index) => (
                      <motion.tr
                        key={game._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        style={{
                          borderTop: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}`,
                          transition: 'background 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = isDark 
                            ? 'rgba(255, 255, 255, 0.03)' 
                            : 'rgba(102, 126, 234, 0.05)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        <td style={{ padding: '16px 24px', whiteSpace: 'nowrap' }}>
                          <div style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            color: isDark ? '#f9fafb' : '#1f2937',
                            marginBottom: '4px'
                          }}>
                            Game {game.game_id.slice(0, 8)}
                          </div>
                          <div style={{
                            fontSize: '12px',
                            color: isDark ? '#9ca3af' : '#6b7280'
                          }}>
                            {game.game_state.status}
                          </div>
                        </td>
                        <td style={{ padding: '16px 24px', whiteSpace: 'nowrap' }}>
                          <span style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            color: getResultColor(game)
                          }}>
                            {getGameResult(game)}
                          </span>
                        </td>
                        <td style={{
                          padding: '16px 24px',
                          whiteSpace: 'nowrap',
                          fontSize: '14px',
                          color: isDark ? '#f9fafb' : '#1f2937'
                        }}>
                          {game.game_state.moves?.length || 0}
                        </td>
                        <td style={{
                          padding: '16px 24px',
                          whiteSpace: 'nowrap',
                          fontSize: '14px',
                          color: isDark ? '#9ca3af' : '#6b7280'
                        }}>
                          {game.createdAt ? formatDate(game.createdAt) : 'N/A'}
                        </td>
                        <td style={{
                          padding: '16px 24px',
                          whiteSpace: 'nowrap',
                          textAlign: 'right',
                          fontSize: '14px',
                          fontWeight: '600'
                        }}>
                          <button
                            onClick={() => navigate(`/game/${game.game_id}`)}
                            style={{
                              color: '#667eea',
                              background: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '8px 12px',
                              borderRadius: '8px',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = isDark 
                                ? 'rgba(102, 126, 234, 0.1)' 
                                : 'rgba(102, 126, 234, 0.1)';
                              e.currentTarget.style.color = '#764ba2';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'transparent';
                              e.currentTarget.style.color = '#667eea';
                            }}
                          >
                            <Eye style={{ width: '16px', height: '16px' }} />
                            <span>View</span>
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
