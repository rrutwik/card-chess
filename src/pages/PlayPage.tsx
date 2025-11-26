import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Users, Plus, Crown, Swords, Clock, Search, GamepadIcon, Share2 } from "lucide-react";
import { ChessAPI, ChessGame } from "../services/api";
import { Header } from "../components/Header";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import type { User } from "../contexts/AuthContext";
import { logger } from "../utils/logger";

export const PlayPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { actualTheme } = useTheme();
  const isDark = actualTheme === 'dark';
  const [games, setGames] = useState<ChessGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<'white' | 'black'>('white');
  const [creatingGame, setCreatingGame] = useState(false);

  useEffect(() => {
    logger.info('PlayPage: Mounted');
    loadGames();
  }, []);

  const loadGames = async () => {
    try {
      logger.info('PlayPage: Loading active games');
      setLoading(true);
      setError(null);

      const response = await ChessAPI.getActiveGames();
      setGames(response.data.data);
      logger.info(`PlayPage: Loaded ${response.data.data.length} active games`);
    } catch (err: any) {
      logger.error("Error loading games:", err);
      setError(err.response?.data?.message || "Failed to load games");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGame = async () => {
    try {
      logger.info('PlayPage: Creating new game', { color: selectedColor });
      setCreatingGame(true);

      // Create game with current user and selected color
      const response = await ChessAPI.createGame(selectedColor);

      if (response.data?.data?.game_id) {
        const gameUrl = `${window.location.origin}/game/${response.data.data.game_id}`;
        logger.info('PlayPage: Game created successfully', { gameId: response.data.data.game_id });
        navigate(`/game/${response.data.data.game_id}`);

        // Show shareable link
        if (navigator.share) {
          try {
            await navigator.share({
              title: "Card Chess Game",
              text: "Join my Card Chess game!",
              url: gameUrl,
            });
          } catch (err) {
            // User cancelled sharing, just copy to clipboard
            copyToClipboard(gameUrl);
          }
        } else {
          copyToClipboard(gameUrl);
        }
      }
    } catch (err: any) {
      logger.error("Error creating game:", err);
      setError(err.response?.data?.message || "Failed to create game");
    } finally {
      setCreatingGame(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      // Could show a toast notification here
      console.log("Game link copied to clipboard!");
    });
  };

  const handleJoinGame = (gameId: string) => {
    navigate(`/game/${gameId}`);
  };

  const waitingGames = games.filter(game => game.game_state.status === 'active' && !game.player_black);
  const activeGames = games.filter(game => game.game_state.status === 'active' && game.player_black);

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
            }}>Loading...</p>
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
              <span style={{ fontSize: '40px' }}>⚠️</span>
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
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(0.95)';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
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
          width: '350px',
          height: '350px',
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
          width: '300px',
          height: '300px',
          background: isDark
            ? 'radial-gradient(circle, rgba(236, 72, 153, 0.15) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(236, 72, 153, 0.1) 0%, transparent 70%)',
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{
              textAlign: 'center',
              marginBottom: '48px'
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              marginBottom: '24px',
              flexWrap: 'wrap'
            }}>
              <motion.div
                animate={{
                  rotate: [0, -10, 10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatDelay: 2,
                  ease: "easeInOut"
                }}
              >
                <Crown style={{
                  width: '48px',
                  height: '48px',
                  color: '#667eea',
                  filter: 'drop-shadow(0 4px 8px rgba(102, 126, 234, 0.4))'
                }} />
              </motion.div>
              <h1 style={{
                fontSize: 'clamp(24px, 6vw, 48px)',
                fontWeight: '800',
                color: isDark ? '#f9fafb' : '#1f2937',
                margin: 0,
                letterSpacing: '-0.5px'
              }}>
                Start Playing
              </h1>
              <motion.div
                animate={{
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatDelay: 2,
                  ease: "easeInOut",
                  delay: 0.5
                }}
              >
                <Swords style={{
                  width: '48px',
                  height: '48px',
                  color: '#a855f7',
                  filter: 'drop-shadow(0 4px 8px rgba(168, 85, 247, 0.4))'
                }} />
              </motion.div>
            </div>
            <p style={{
              fontSize: '18px',
              color: isDark ? '#d1d5db' : '#6b7280',
              maxWidth: '640px',
              margin: '0 auto',
              lineHeight: '1.6'
            }}>
              Create a game and share the link with a friend to start playing
            </p>
          </motion.div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '32px'
          }}>
            {/* Game Creation */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              style={{
                background: isDark
                  ? 'rgba(255, 255, 255, 0.05)'
                  : 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                borderRadius: '24px',
                boxShadow: isDark
                  ? '0 8px 32px rgba(0, 0, 0, 0.3)'
                  : '0 8px 32px rgba(102, 126, 234, 0.15)',
                border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(102, 126, 234, 0.2)'}`,
                padding: '32px'
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '24px'
              }}>
                <Plus style={{ width: '32px', height: '32px', color: '#667eea' }} />
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: isDark ? '#f9fafb' : '#1f2937',
                  margin: 0
                }}>Create New Game</h2>
              </div>

              {/* Color Selection */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: isDark ? '#f9fafb' : '#1f2937',
                  marginBottom: '12px'
                }}>
                  Choose Your Color
                </label>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px'
                }}>
                  <button
                    onClick={() => setSelectedColor('white')}
                    style={{
                      padding: '16px',
                      borderRadius: '16px',
                      border: selectedColor === 'white'
                        ? '2px solid #667eea'
                        : `2px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : '#e5e7eb'}`,
                      background: selectedColor === 'white'
                        ? isDark ? 'rgba(102, 126, 234, 0.15)' : 'rgba(102, 126, 234, 0.1)'
                        : 'transparent',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      transform: selectedColor === 'white' ? 'scale(1.05)' : 'scale(1)',
                      boxShadow: selectedColor === 'white' ? '0 4px 16px rgba(102, 126, 234, 0.3)' : 'none'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedColor !== 'white') {
                        e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.5)';
                        e.currentTarget.style.background = isDark ? 'rgba(102, 126, 234, 0.05)' : 'rgba(102, 126, 234, 0.05)';
                        e.currentTarget.style.transform = 'scale(1.02)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedColor !== 'white') {
                        e.currentTarget.style.borderColor = isDark ? 'rgba(255, 255, 255, 0.1)' : '#e5e7eb';
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.transform = 'scale(1)';
                      }
                    }}
                  >
                    <div style={{
                      width: '32px',
                      height: '32px',
                      background: 'white',
                      borderRadius: '50%',
                      margin: '0 auto 8px',
                      border: '2px solid #d1d5db',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                    }}></div>
                    <span style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: selectedColor === 'white' ? '#667eea' : (isDark ? '#f9fafb' : '#1f2937'),
                      display: 'block',
                      marginBottom: '4px'
                    }}>White</span>
                    <p style={{
                      fontSize: '12px',
                      color: isDark ? '#9ca3af' : '#6b7280',
                      margin: 0
                    }}>Moves first</p>
                  </button>
                  <button
                    onClick={() => setSelectedColor('black')}
                    style={{
                      padding: '16px',
                      borderRadius: '16px',
                      border: selectedColor === 'black'
                        ? '2px solid #667eea'
                        : `2px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : '#e5e7eb'}`,
                      background: selectedColor === 'black'
                        ? isDark ? 'rgba(102, 126, 234, 0.15)' : 'rgba(102, 126, 234, 0.1)'
                        : 'transparent',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      transform: selectedColor === 'black' ? 'scale(1.05)' : 'scale(1)',
                      boxShadow: selectedColor === 'black' ? '0 4px 16px rgba(102, 126, 234, 0.3)' : 'none'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedColor !== 'black') {
                        e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.5)';
                        e.currentTarget.style.background = isDark ? 'rgba(102, 126, 234, 0.05)' : 'rgba(102, 126, 234, 0.05)';
                        e.currentTarget.style.transform = 'scale(1.02)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedColor !== 'black') {
                        e.currentTarget.style.borderColor = isDark ? 'rgba(255, 255, 255, 0.1)' : '#e5e7eb';
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.transform = 'scale(1)';
                      }
                    }}
                  >
                    <div style={{
                      width: '32px',
                      height: '32px',
                      background: '#1f2937',
                      borderRadius: '50%',
                      margin: '0 auto 8px',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                    }}></div>
                    <span style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: selectedColor === 'black' ? '#667eea' : (isDark ? '#f9fafb' : '#1f2937'),
                      display: 'block',
                      marginBottom: '4px'
                    }}>Black</span>
                    <p style={{
                      fontSize: '12px',
                      color: isDark ? '#9ca3af' : '#6b7280',
                      margin: 0
                    }}>Moves second</p>
                  </button>
                </div>
              </div>

              <button
                onClick={handleCreateGame}
                disabled={creatingGame}
                style={{
                  width: '100%',
                  background: creatingGame
                    ? isDark ? 'rgba(102, 126, 234, 0.5)' : 'rgba(102, 126, 234, 0.7)'
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  padding: '16px 32px',
                  borderRadius: '16px',
                  border: 'none',
                  cursor: creatingGame ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  fontWeight: '600',
                  fontSize: '16px',
                  boxShadow: '0 4px 16px rgba(102, 126, 234, 0.4)',
                  transition: 'all 0.3s ease',
                  opacity: creatingGame ? 0.6 : 1
                }}
                onMouseEnter={(e) => {
                  if (!creatingGame) {
                    e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(102, 126, 234, 0.5)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!creatingGame) {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(102, 126, 234, 0.4)';
                  }
                }}
                onMouseDown={(e) => {
                  if (!creatingGame) {
                    e.currentTarget.style.transform = 'translateY(0) scale(0.98)';
                  }
                }}
                onMouseUp={(e) => {
                  if (!creatingGame) {
                    e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                  }
                }}
              >
                {creatingGame ? (
                  <>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      border: '2px solid white',
                      borderTopColor: 'transparent',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    <span>Creating Game...</span>
                  </>
                ) : (
                  <>
                    <Plus style={{ width: '20px', height: '20px' }} />
                    <span>Create Game & Share Link</span>
                  </>
                )}
              </button>

              <div style={{
                marginTop: '16px',
                padding: '12px',
                background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(102, 126, 234, 0.08)',
                borderRadius: '12px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  color: isDark ? '#9ca3af' : '#6b7280'
                }}>
                  <Share2 style={{ width: '16px', height: '16px', flexShrink: 0 }} />
                  <span>Share the game link with a friend to start playing!</span>
                </div>
              </div>
            </motion.div>

            {/* Join Existing Games */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              style={{
                background: isDark
                  ? 'rgba(255, 255, 255, 0.05)'
                  : 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                borderRadius: '24px',
                boxShadow: isDark
                  ? '0 8px 32px rgba(0, 0, 0, 0.3)'
                  : '0 8px 32px rgba(168, 85, 247, 0.15)',
                border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(168, 85, 247, 0.2)'}`,
                padding: '32px'
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '24px'
              }}>
                <Users style={{ width: '32px', height: '32px', color: '#a855f7' }} />
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: isDark ? '#f9fafb' : '#1f2937',
                  margin: 0
                }}>Join Game</h2>
              </div>

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                {waitingGames.length === 0 && activeGames.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '32px 0'
                  }}>
                    <GamepadIcon style={{
                      width: '64px',
                      height: '64px',
                      color: isDark ? '#4b5563' : '#9ca3af',
                      margin: '0 auto 16px'
                    }} />
                    <p style={{
                      color: isDark ? '#9ca3af' : '#6b7280',
                      marginBottom: '8px'
                    }}>No games available to join</p>
                    <p style={{
                      fontSize: '14px',
                      color: isDark ? '#6b7280' : '#9ca3af',
                      margin: 0
                    }}>Create a game above and share the link!</p>
                  </div>
                ) : (
                  <>
                    {waitingGames.length > 0 && (
                      <>
                        <h3 style={{
                          fontWeight: '600',
                          color: isDark ? '#f9fafb' : '#1f2937',
                          marginBottom: '12px',
                          fontSize: '16px'
                        }}>Waiting for Players</h3>
                        {waitingGames.slice(0, 3).map((game) => (
                          <div
                            key={game._id}
                            onClick={() => handleJoinGame(game.game_id)}
                            style={{
                              padding: '16px',
                              borderRadius: '16px',
                              border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : '#e5e7eb'}`,
                              background: 'transparent',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.5)';
                              e.currentTarget.style.background = isDark ? 'rgba(102, 126, 234, 0.05)' : 'rgba(102, 126, 234, 0.05)';
                              e.currentTarget.style.transform = 'translateX(4px)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = isDark ? 'rgba(255, 255, 255, 0.1)' : '#e5e7eb';
                              e.currentTarget.style.background = 'transparent';
                              e.currentTarget.style.transform = 'translateX(0)';
                            }}
                          >
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              marginBottom: '8px'
                            }}>
                              <h4 style={{
                                fontWeight: '700',
                                color: isDark ? '#f9fafb' : '#1f2937',
                                margin: 0,
                                fontSize: '15px'
                              }}>
                                Game {game.game_id.slice(0, 8)}
                              </h4>
                              <div style={{
                                padding: '4px 12px',
                                borderRadius: '12px',
                                fontSize: '12px',
                                fontWeight: '500',
                                background: isDark ? 'rgba(34, 197, 94, 0.2)' : 'rgba(34, 197, 94, 0.1)',
                                color: isDark ? '#86efac' : '#16a34a'
                              }}>
                                Waiting
                              </div>
                            </div>
                            <div style={{
                              fontSize: '14px',
                              color: isDark ? '#9ca3af' : '#6b7280',
                              marginBottom: '4px'
                            }}>
                              Created by {game.player_white}
                            </div>
                            <div style={{
                              fontSize: '14px',
                              color: isDark ? '#9ca3af' : '#6b7280'
                            }}>
                              Created {new Date(game.createdAt || "").toLocaleDateString()}
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                    {activeGames.length > 0 && (
                      <>
                        <h3 style={{
                          fontWeight: '600',
                          color: isDark ? '#f9fafb' : '#1f2937',
                          marginBottom: '12px',
                          fontSize: '16px',
                          marginTop: waitingGames.length > 0 ? '8px' : '0'
                        }}>Active Games</h3>
                        {activeGames.slice(0, 5).map((game) => (
                          <div
                            key={game._id}
                            onClick={() => handleJoinGame(game.game_id)}
                            style={{
                              padding: '16px',
                              borderRadius: '16px',
                              border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : '#e5e7eb'}`,
                              background: 'transparent',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.5)';
                              e.currentTarget.style.background = isDark ? 'rgba(168, 85, 247, 0.05)' : 'rgba(168, 85, 247, 0.05)';
                              e.currentTarget.style.transform = 'translateX(4px)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = isDark ? 'rgba(255, 255, 255, 0.1)' : '#e5e7eb';
                              e.currentTarget.style.background = 'transparent';
                              e.currentTarget.style.transform = 'translateX(0)';
                            }}
                          >
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              marginBottom: '8px'
                            }}>
                              <h4 style={{
                                fontWeight: '700',
                                color: isDark ? '#f9fafb' : '#1f2937',
                                margin: 0,
                                fontSize: '15px'
                              }}>
                                Game {game.game_id.slice(0, 8)}
                              </h4>
                              <div style={{
                                padding: '4px 12px',
                                borderRadius: '12px',
                                fontSize: '12px',
                                fontWeight: '500',
                                background: isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)',
                                color: isDark ? '#93c5fd' : '#2563eb'
                              }}>
                                Active
                              </div>
                            </div>
                            <div style={{
                              fontSize: '14px',
                              color: isDark ? '#9ca3af' : '#6b7280',
                              marginBottom: '4px'
                            }}>
                              {game.player_white} vs {game.player_black}
                            </div>
                            <div style={{
                              fontSize: '14px',
                              color: isDark ? '#9ca3af' : '#6b7280'
                            }}>
                              Current turn: {game.game_state.turn}
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </>
                )}
              </div>

              {games.length > 5 && (
                <button
                  onClick={() => navigate("/games")}
                  style={{
                    width: '100%',
                    marginTop: '16px',
                    background: isDark ? 'rgba(168, 85, 247, 0.15)' : 'rgba(168, 85, 247, 0.1)',
                    color: isDark ? '#f9fafb' : '#1f2937',
                    padding: '12px 32px',
                    borderRadius: '12px',
                    border: `1px solid ${isDark ? 'rgba(168, 85, 247, 0.3)' : 'rgba(168, 85, 247, 0.2)'}`,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = isDark ? 'rgba(168, 85, 247, 0.2)' : 'rgba(168, 85, 247, 0.15)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = isDark ? 'rgba(168, 85, 247, 0.15)' : 'rgba(168, 85, 247, 0.1)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <Search style={{ width: '16px', height: '16px' }} />
                  <span>View All Games</span>
                </button>
              )}
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};
