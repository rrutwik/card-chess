import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Clock, Users, Play, Plus, Link as LinkIcon } from "lucide-react";
import { ChessAPI, ChessGame } from "../services/api";
import { Header } from "../components/Header";
import { useTheme } from "../contexts/ThemeContext";

export const GamesListPage: React.FC = () => {
  const navigate = useNavigate();
  const { actualTheme } = useTheme();
  const isDark = actualTheme === 'dark';
  const [games, setGames] = useState<ChessGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    try {
      setLoading(true);
      const response = await ChessAPI.getActiveGames();
      setGames(response.data.data);
      setError(null);
    } catch (err: any) {
      console.error("Error loading games:", err);
      setError(err.response?.data?.message || "Failed to load games");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getGameStatus = (game: ChessGame) => {
    const status = game.game_state.status;
    const turn = game.game_state.turn;

    if (status === "completed") {
      return `Finished - ${
        game.game_state.winner === "draw"
          ? "Draw"
          : `${game.game_state.winner} wins`
      }`;
    }
    if (status === "abandoned") {
      return "Abandoned";
    }
    return `Active - ${turn}'s turn`;
  };

  const handleCopyLink = (gameId: string) => {
    const gameUrl = `${window.location.origin}/game/${gameId}`;
    navigator.clipboard.writeText(gameUrl);
    setCopiedId(gameId);
    setTimeout(() => setCopiedId(null), 2000);
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
            }}>Loading games...</p>
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
              onClick={loadGames}
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
              <Clock style={{ width: '20px', height: '20px' }} />
              <span>Try Again</span>
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
          top: '20%',
          right: '10%',
          width: '300px',
          height: '300px',
          background: isDark 
            ? 'radial-gradient(circle, rgba(102, 126, 234, 0.15) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(102, 126, 234, 0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(40px)'
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '20%',
          left: '10%',
          width: '250px',
          height: '250px',
          background: isDark 
            ? 'radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(168, 85, 247, 0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(40px)'
        }}></div>
      </div>

      <main style={{
        position: 'relative',
        zIndex: 1,
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '32px 16px'
      }}>
        <div style={{ marginBottom: '32px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '40px',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div>
              <h1 style={{
                fontSize: 'clamp(28px, 6vw, 40px)',
                fontWeight: '800',
                color: isDark ? '#f9fafb' : '#1f2937',
                marginBottom: '12px',
                letterSpacing: '-0.5px'
              }}>
                Active Games
              </h1>
              <p style={{
                color: isDark ? '#d1d5db' : '#6b7280',
                fontSize: '16px'
              }}>
                Join existing games or start a new one
              </p>
            </div>
            <button
              onClick={() => navigate("/play")}
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
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(0.95)';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
              }}
            >
              <Plus style={{ width: '20px', height: '20px' }} />
              <span>Find Opponent</span>
            </button>
          </div>

          {games.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              style={{
                textAlign: 'center',
                padding: '80px 16px'
              }}
            >
              <div style={{
                width: '128px',
                height: '128px',
                background: isDark 
                  ? 'rgba(255, 255, 255, 0.05)'
                  : 'rgba(102, 126, 234, 0.1)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 32px'
              }}>
                <Users style={{ 
                  width: '64px', 
                  height: '64px', 
                  color: isDark ? '#4b5563' : '#9ca3af' 
                }} />
              </div>
              <h3 style={{
                fontSize: '32px',
                fontWeight: '700',
                color: isDark ? '#f9fafb' : '#1f2937',
                marginBottom: '16px'
              }}>
                No Active Games
              </h3>
              <p style={{
                color: isDark ? '#9ca3af' : '#6b7280',
                marginBottom: '40px',
                fontSize: '18px'
              }}>
                Be the first to start a game!
              </p>
              <button
                onClick={() => navigate("/play")}
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
                Find Opponent
              </button>
            </motion.div>
          ) : (
            <div style={{
              display: 'grid',
              gap: '24px',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))'
            }}>
              {games.map((game, index) => (
                <motion.div
                  key={game._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.05 }}
                  style={{
                    background: isDark 
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '24px',
                    boxShadow: isDark 
                      ? '0 8px 32px rgba(0, 0, 0, 0.3)'
                      : '0 8px 32px rgba(102, 126, 234, 0.1)',
                    border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(102, 126, 234, 0.2)'}`,
                    transition: 'all 0.3s ease',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px)';
                    e.currentTarget.style.boxShadow = isDark 
                      ? '0 16px 48px rgba(0, 0, 0, 0.4)'
                      : '0 16px 48px rgba(102, 126, 234, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = isDark 
                      ? '0 8px 32px rgba(0, 0, 0, 0.3)'
                      : '0 8px 32px rgba(102, 126, 234, 0.1)';
                  }}
                >
                  <div style={{ padding: '24px' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      marginBottom: '16px'
                    }}>
                      <div>
                        <h3 style={{
                          fontWeight: '700',
                          color: isDark ? '#f9fafb' : '#1f2937',
                          fontSize: '18px',
                          marginBottom: '4px'
                        }}>
                          Game {game.game_id.slice(0, 8)}
                        </h3>
                        <p style={{
                          fontSize: '13px',
                          color: isDark ? '#9ca3af' : '#6b7280',
                          margin: 0
                        }}>
                          Created {formatDate(game.createdAt || "")}
                        </p>
                      </div>
                      <div style={{
                        padding: '6px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '500',
                        background: game.game_state.status === "active"
                          ? isDark ? 'rgba(34, 197, 94, 0.2)' : 'rgba(34, 197, 94, 0.1)'
                          : isDark ? 'rgba(156, 163, 175, 0.2)' : 'rgba(156, 163, 175, 0.1)',
                        color: game.game_state.status === "active"
                          ? isDark ? '#86efac' : '#16a34a'
                          : isDark ? '#9ca3af' : '#6b7280'
                      }}>
                        {game.game_state.status}
                      </div>
                    </div>

                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      marginBottom: '24px'
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '14px'
                      }}>
                        <span style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>Players:</span>
                        <span style={{ fontWeight: '600', color: isDark ? '#f9fafb' : '#1f2937' }}>2</span>
                      </div>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '14px',
                        gap: '8px'
                      }}>
                        <span style={{ 
                          color: isDark ? '#9ca3af' : '#6b7280',
                          flexShrink: 0
                        }}>Status:</span>
                        <span style={{ 
                          fontWeight: '600', 
                          color: isDark ? '#f9fafb' : '#1f2937',
                          textAlign: 'right',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {getGameStatus(game)}
                        </span>
                      </div>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '14px'
                      }}>
                        <span style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>Moves:</span>
                        <span style={{ fontWeight: '600', color: isDark ? '#f9fafb' : '#1f2937' }}>
                          {game.game_state.moves?.length || 0}
                        </span>
                      </div>
                    </div>

                    <div style={{
                      display: 'flex',
                      gap: '12px'
                    }}>
                      <button
                        onClick={() => navigate(`/game/${game.game_id}`)}
                        style={{
                          flex: 1,
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          color: 'white',
                          padding: '12px 16px',
                          borderRadius: '12px',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '600',
                          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
                          e.currentTarget.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0) scale(1)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
                        }}
                        onMouseDown={(e) => {
                          e.currentTarget.style.transform = 'translateY(0) scale(0.95)';
                        }}
                        onMouseUp={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
                        }}
                      >
                        <Play style={{ width: '16px', height: '16px' }} />
                        <span>Join</span>
                      </button>
                      <button
                        onClick={() => handleCopyLink(game.game_id)}
                        style={{
                          padding: '12px',
                          border: `2px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(102, 126, 234, 0.2)'}`,
                          background: copiedId === game.game_id 
                            ? isDark ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.1)'
                            : 'transparent',
                          borderRadius: '12px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        onMouseEnter={(e) => {
                          if (copiedId !== game.game_id) {
                            e.currentTarget.style.background = isDark ? 'rgba(102, 126, 234, 0.1)' : 'rgba(102, 126, 234, 0.1)';
                            e.currentTarget.style.borderColor = '#667eea';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (copiedId !== game.game_id) {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.borderColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(102, 126, 234, 0.2)';
                          }
                        }}
                        title={copiedId === game.game_id ? "Copied!" : "Copy game link"}
                      >
                        {copiedId === game.game_id ? (
                          <span style={{ 
                            fontSize: '16px',
                            color: '#22c55e'
                          }}>✓</span>
                        ) : (
                          <LinkIcon style={{ 
                            width: '20px', 
                            height: '20px', 
                            color: isDark ? '#9ca3af' : '#6b7280' 
                          }} />
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
