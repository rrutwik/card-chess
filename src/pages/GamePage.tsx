import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Share2, BookOpen } from "lucide-react";
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

export const GamePage: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { addNotification } = useAppStore();
  const { theme } = useTheme();
  const { user } = useAuth();
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

  // Check if current user can join this game
  const canJoinGame = currentGame && user && (
    (!currentGame.player_black && currentGame.player_white !== user._id) ||
    (!currentGame.player_white && currentGame.player_black !== user._id)
  );

  // Check if current user is already playing in this game
  const isPlayerInGame = currentGame && user && (
    currentGame.player_white === user._id || currentGame.player_black === user._id
  ) ? true : false;

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
        setLoading(true);
        setError(null);
        const response = await ChessAPI.getGame(gameId);
        setCurrentGame(response.data.data);
      } catch (err) {
        console.error("Error loading game:", err);
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
    } catch (err) {
      console.error("Error joining game:", err);
      addNotification({
        type: "error",
        title: "Failed to join game",
        message: "Could not join the game. It may be full or no longer available.",
        duration: 5000,
      });
    }
  };

  const {
    game: chessGame,
    currentCard,
    currentPlayer,
    fromMoveSelected,
    onDrop,
    validMoves,
    gameOver,
    winner,
    noValidCard,
    drawCard,
    reshuffleDeck,
    handleSquareClick,
    resetGame,
    cardsRemaining,
    canDrawCard,
    isInCheck,
    checkAttempts,
    moveHistory,
  } = useCardChess(currentGame?.game_state.fen || null, {
    gameId,
    userId: user?._id,
    onGameUpdate: (fen, currentPlayer, currentCard) => {
      // Handle game updates from other players
      console.log("Game updated from backend:", { fen, currentPlayer, currentCard });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto mb-6"></div>
            <p className="text-muted-foreground text-lg">Loading game...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center bg-card p-10 rounded-3xl shadow-lg max-w-md mx-auto border border-border">
            <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">⚠️</span>
            </div>
            <h2 className="text-3xl font-bold text-destructive mb-4">Error</h2>
            <p className="text-muted-foreground mb-8 text-lg">{error}</p>
            <button
              onClick={() => navigate("/")}
              className="bg-primary text-primary-foreground px-8 py-4 rounded-2xl hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-screen w-screen flex flex-col overflow-hidden ${
      theme === 'dark'
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'
        : 'bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50'
    }`}>
      <CollapsibleRulesSidebar
        isOpen={showRules}
        onClose={() => setShowRules(false)}
      />

      {/* Header */}
      <Header showBackButton={true} backTo="/" />

      {/* Join Game Prompt - Show if user can join but hasn't yet */}
      {canJoinGame && !isPlayerInGame && (
        <div className="flex items-center justify-center p-4 bg-primary/10 border-b border-primary/20">
          <div className="text-center max-w-md mx-auto">
            <h3 className="text-lg font-semibold text-primary mb-2">
              Join This Game?
            </h3>
            <p className="text-muted-foreground mb-4">
              This game is waiting for a second player. Click below to join!
            </p>
            <button
              onClick={handleJoinGameAsOpponent}
              className="bg-primary text-primary-foreground px-6 py-3 rounded-2xl hover:bg-primary/90 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
            >
              Join Game
            </button>
          </div>
        </div>
      )}

      {/* Main Game Layout */}
      <main className="flex-1 flex">
        <div className="flex-1 flex items-center justify-center p-2 sm:p-4 lg:p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full h-full"
            style={{ width: "70%", height: "70%" }}
          >
            <ChessBoard
              game={chessGame}
              fromMoveSelected={fromMoveSelected}
              validMoves={validMoves}
              showMoves={showMoves}
              onDrop={onDrop}
              onSquareClick={handleSquareClick}
              currentPlayer={currentPlayer}
              canMove={currentCard !== null && gameOver == false && isPlayerInGame == true}
              orientation={currentGame?.player_white?.toString() === user?._id.toString() ? "white" : "black"}
            />
          </motion.div>
        </div>
          <aside
            className={`sm:w-80 lg:w-96 flex items-center justify-center p-2 sm:p-4 lg:p-6 border-l ${
              theme === 'dark'
                ? 'border-slate-700 bg-slate-800/40 backdrop-blur-sm'
                : 'border-gray-200/50 bg-white/40 backdrop-blur-sm'
            }`}
            style={{ width: "40%" }}
          >
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
              className="w-full h-full overflow-y-auto"
            >
              <CompactGameControls
                currentCard={currentCard}
                cardsRemaining={cardsRemaining}
                isInCheck={isInCheck}
                checkAttempts={checkAttempts}
                onDrawCard={drawCard}
                noValidCard={noValidCard}
                onReshuffle={reshuffleDeck}
                canDrawCard={canDrawCard && isPlayerInGame}
                currentPlayer={currentPlayer}
                gameOver={gameOver}
                winner={winner}
                onNewGame={resetGame}
                showMoves={showMoves}
                handleShowMoveButton={setShowMoves}
              />
            </motion.div>
          </aside>
      </main>

      {/* Move History Footer */}
      {gameOver && <MoveHistoryFooter moveHistory={moveHistory} />}
    </div>
  );
};
