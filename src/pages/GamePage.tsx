import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { ChessBoard } from "../components/ChessBoard";
import { CompactGameControls } from "../components/CompactGameControls";
import { CollapsibleRulesSidebar } from "../components/CollapsibleRulesSidebar";
import { MoveHistoryFooter } from "../components/MoveHistoryFooter";
import { Header } from "../components/Header";
import { useCardChess } from "../hooks/useCardChess";
import { ChessAPI, ApiError } from "../services/api";
import { useGameStore } from "../stores/gameStore";
import { useAppStore } from "../stores/appStore";
import { BoardOrientation } from "../types/game";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import { Link2, Check, Users } from "lucide-react";
import { logger } from "../utils/logger";

export const GamePage: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { addNotification } = useAppStore();
  const { actualTheme } = useTheme();
  const isDark = actualTheme === 'dark';
  const { user } = useAuth();
  const [linkCopied, setLinkCopied] = useState(false);
  const {
    currentGame,
    showRules,
    showMoves,
    isLoading,
    error,
    setCurrentGame,
    setShowRules,
    setShowMoves,
    setLoading,
    setError,
  } = useGameStore();

  const {
    game: chessGame,
    gameState,
    drawCard,
    reshuffleDeck,
    onDrop,
    // newGame,
    handleSquareClick,
  } = useCardChess(currentGame, {
    userId: user?._id || ''
  });

  // Check if current user can join this game
  const canJoinGame = currentGame && user && (
    (!currentGame.player_black && currentGame.player_white !== user._id) ||
    (!currentGame.player_white && currentGame.player_black !== user._id)
  );

  // Check if current user is already playing in this game
  const isPlayerInGame = currentGame && user && (
    currentGame.player_white === user._id || currentGame.player_black === user._id
  ) ? true : false;

  // Check if waiting for opponent (player is in game but opponent slot is empty)
  const isWaitingForOpponent = currentGame && user && isPlayerInGame && (
    !currentGame.player_black || !currentGame.player_white
  );

  // Handle copy game link
  const handleCopyLink = () => {
    const gameLink = `${window.location.origin}/game/${gameId}`;
    navigator.clipboard.writeText(gameLink).then(() => {
      setLinkCopied(true);
      addNotification({
        type: "success",
        title: "Link Copied!",
        message: "Game link copied to clipboard",
        duration: 2000,
      });
      setTimeout(() => setLinkCopied(false), 2000);
    }).catch((err) => {
      logger.error('Failed to copy link:', err);
      addNotification({
        type: "error",
        title: "Failed to copy",
        message: "Could not copy link to clipboard",
        duration: 3000,
      });
    });
  };

  // Load game data from backend if gameId is provided
  useEffect(() => {
    const loadGame = async () => {
      if (!gameId) {
        addNotification({
          type: "info",
          title: "No Game Found",
          message: "Please create a game first to get a shareable link",
          duration: 5000,
        });
        navigate("/play");
        return;
      }

      try {
        logger.info(`GamePage: Loading game ${gameId}`);
        setLoading(true);
        setError(null);
        const response = await ChessAPI.getGame(gameId);
        setCurrentGame(response.data.data);
        logger.info(`GamePage: Game loaded`, { gameId });
      } catch (err) {
        logger.error("Error loading game:", err);
        const errorMessage =
          err instanceof ApiError ? err.message : "Failed to load game";
        setError(errorMessage);
        addNotification({
          type: "error",
          title: "Failed to load game",
          message: errorMessage,
          duration: 5000,
        });
      } finally {
        setLoading(false);
      }
    };

    loadGame();
  }, [gameId, setCurrentGame, setLoading, setError, addNotification, navigate]);

  // Handle opponent registration when joining a game
  const handleJoinGameAsOpponent = async () => {
    if (!gameId || !currentGame || !user) return;

    try {
      logger.info(`GamePage: Joining game ${gameId}`);
      await ChessAPI.joinGame(gameId);

      // Reload the game to get updated state
      const response = await ChessAPI.getGame(gameId);
      setCurrentGame(response.data.data);

      addNotification({
        type: "success",
        title: "Joined Game",
        message: "You have successfully joined the game!",
        duration: 3000,
      });
      logger.info(`GamePage: Joined game successfully`, { gameId, userId: user._id });
    } catch (err) {
      logger.error("Error joining game:", err);
      addNotification({
        type: "error",
        title: "Failed to join game",
        message: "Could not join the game. It may be full or no longer available.",
        duration: 5000,
      });
    }
  };

  if (!user) {
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
            }}>Loading game...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
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
            }}>Loading game...</p>
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
              fontSize: '18px',
              lineHeight: '1.5'
            }}>{error}</p>
            <button
              onClick={() => navigate("/")}
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
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      background: isDark
        ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)'
        : 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 50%, #cbd5e1 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      <CollapsibleRulesSidebar
        isOpen={showRules}
        onClose={() => setShowRules(false)}
      />

      {/* Header */}
      <Header showBackButton={true} backTo="/" onToggleRules={() => setShowRules(!showRules)} />

      {/* Join Game Prompt - Show if user can join but hasn't yet */}
      {canJoinGame && !isPlayerInGame && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          background: isDark
            ? 'rgba(102, 126, 234, 0.1)'
            : 'rgba(102, 126, 234, 0.1)',
          borderBottom: `1px solid ${isDark ? 'rgba(102, 126, 234, 0.2)' : 'rgba(102, 126, 234, 0.2)'}`
        }}>
          <div style={{
            textAlign: 'center',
            maxWidth: '448px',
            margin: '0 auto'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#667eea',
              marginBottom: '8px'
            }}>
              Join This Game?
            </h3>
            <p style={{
              color: isDark ? '#9ca3af' : '#6b7280',
              marginBottom: '16px',
              fontSize: '14px'
            }}>
              This game is waiting for a second player. Click below to join!
            </p>
            <button
              onClick={handleJoinGameAsOpponent}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '16px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
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
              Join Game
            </button>
          </div>
        </div>
      )}

      {/* Waiting for Opponent - Show if player is in game but waiting for opponent */}
      {isWaitingForOpponent && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            background: isDark
              ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(236, 72, 153, 0.15) 100%)'
              : 'linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)',
            borderBottom: `1px solid ${isDark ? 'rgba(168, 85, 247, 0.3)' : 'rgba(168, 85, 247, 0.2)'}`,
            backdropFilter: 'blur(10px)'
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            maxWidth: '800px',
            width: '100%',
            gap: '16px',
            flexWrap: 'wrap'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              flex: '1 1 auto'
            }}>
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Users style={{
                  width: '24px',
                  height: '24px',
                  color: '#a855f7'
                }} />
              </motion.div>
              <div>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: isDark ? '#f9fafb' : '#1f2937',
                  marginBottom: '4px'
                }}>
                  Waiting for Opponent
                </h3>
                <p style={{
                  color: isDark ? '#d1d5db' : '#6b7280',
                  fontSize: '13px',
                  margin: 0
                }}>
                  Share the link below to invite someone to play
                </p>
              </div>
            </div>

            <button
              onClick={handleCopyLink}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: linkCopied
                  ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                  : 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '12px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                boxShadow: linkCopied
                  ? '0 4px 16px rgba(16, 185, 129, 0.4)'
                  : '0 4px 16px rgba(168, 85, 247, 0.4)',
                transition: 'all 0.3s ease',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => {
                if (!linkCopied) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(168, 85, 247, 0.5)';
                }
              }}
              onMouseLeave={(e) => {
                if (!linkCopied) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(168, 85, 247, 0.4)';
                }
              }}
            >
              {linkCopied ? (
                <>
                  <Check style={{ width: '16px', height: '16px' }} />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Link2 style={{ width: '16px', height: '16px' }} />
                  <span>Copy Game Link</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      )}

      {/* Main Game Layout */}
      <main style={{
        flex: 1,
        display: 'flex',
        alignItems: 'stretch',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        padding: '24px 16px',
        minHeight: 0
      }}>
        {/* Background decorative elements */}
        <div style={{
          position: 'absolute',
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
            left: '5%',
            width: '400px',
            height: '400px',
            background: isDark
              ? 'radial-gradient(circle, rgba(102, 126, 234, 0.12) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(102, 126, 234, 0.08) 0%, transparent 70%)',
            borderRadius: '50%',
            filter: 'blur(60px)'
          }}></div>
          <div style={{
            position: 'absolute',
            bottom: '15%',
            right: '5%',
            width: '350px',
            height: '350px',
            background: isDark
              ? 'radial-gradient(circle, rgba(139, 92, 246, 0.12) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, transparent 70%)',
            borderRadius: '50%',
            filter: 'blur(60px)'
          }}></div>
        </div>

        {/* Main Content Container with Max Width */}
        <div style={{
          width: '100%',
          maxWidth: '1400px',
          height: '100%',
          display: 'flex',
          position: 'relative',
          zIndex: 1,
          gap: '24px'
        }}>
          {/* Chess Board Area */}
          <div style={{
            flex: '1 1 60%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0',
            minWidth: 0
          }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              style={{
                width: '100%',
                maxWidth: 'min(700px, 100%)',
                aspectRatio: '1',
                boxShadow: isDark
                  ? '0 30px 60px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.05)'
                  : '0 30px 60px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)',
                borderRadius: '20px',
                overflow: 'hidden'
              }}
            >
              <ChessBoard
                game={chessGame}
                fromMoveSelected={gameState.fromMoveSelected}
                validMoves={gameState.validMoves}
                showMoves={showMoves}
                onDrop={onDrop}
                onSquareClick={handleSquareClick}
                currentPlayer={gameState.currentPlayer}
                canMove={gameState.currentCard !== null && gameState.gameOver === false && isPlayerInGame === true}
                orientation={currentGame?.player_white?.toString() === user?._id.toString() ? "white" : "black"}
              />
            </motion.div>
          </div>

          {/* Game Controls Sidebar */}
          <aside style={{
            flex: '1 1 40%',
            background: isDark
              ? 'linear-gradient(180deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)'
              : 'linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
            backdropFilter: 'blur(20px)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            position: 'relative',
            zIndex: 1,
            borderRadius: '20px',
            border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'}`,
            boxShadow: isDark
              ? '0 20px 40px -12px rgba(0, 0, 0, 0.5)'
              : '0 20px 40px -12px rgba(0, 0, 0, 0.15)',
            minWidth: 0,
            maxWidth: '480px'
          }}>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                padding: '20px',
                minHeight: 0
              }}
            >
              <CompactGameControls
                currentCard={gameState.currentCard}
                cardsRemaining={gameState.cardsRemaining}
                isInCheck={gameState.isInCheck}
                checkAttempts={gameState.checkAttempts}
                onDrawCard={drawCard}
                noValidCard={gameState.noValidCard}
                onReshuffle={reshuffleDeck}
                canDrawCard={gameState.canDrawCard}
                currentPlayer={gameState.currentPlayer}
                userColor={gameState.userColor}
                gameOver={gameState.gameOver}
                winner={gameState.winner}
                // onNewGame={newGame}
                showMoves={showMoves}
                handleShowMoveButton={setShowMoves}
              />
            </motion.div>
          </aside>
        </div>
      </main>

      {/* Move History Footer */}
      {gameState.gameOver && <MoveHistoryFooter moveHistory={gameState.moveHistory} />}
    </div>
  );
};
