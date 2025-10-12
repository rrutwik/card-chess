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

export const GamePage: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { addNotification } = useAppStore();
  const { theme } = useTheme();
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
  const [orientation, setOrientation] = useState<BoardOrientation>(() => {
    const saved = localStorage.getItem('chessboard-orientation');
    return (saved as BoardOrientation) || 'auto';
  });
  // Load game data from backend if gameId is provided
  useEffect(() => {
    const loadGame = async () => {
      if (!gameId) {
        setLoading(false);
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
  }, [gameId, setCurrentGame, setLoading, setError, addNotification]);

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
  } = useCardChess(currentGame?.game_state.fen || null);

  const handleShareGame = async () => {
    const gameUrl = `${window.location.origin}/game/${gameId}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Card Chess Game",
          text: "Join me in this Card Chess game!",
          url: gameUrl,
        });
        addNotification({
          type: "success",
          title: "Game shared",
          message: "Game link shared successfully",
          duration: 3000,
        });
      } catch (err) {
        // User cancelled sharing or sharing failed
        copyToClipboard(gameUrl);
      }
    } else {
      copyToClipboard(gameUrl);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        addNotification({
          type: "success",
          title: "Link copied",
          message: "Game link copied to clipboard!",
          duration: 3000,
        });
      })
      .catch(() => {
        addNotification({
          type: "error",
          title: "Failed to copy",
          message: "Could not copy link to clipboard",
          duration: 3000,
        });
      });
  };

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
              canMove={!!currentCard && !gameOver}
              orientation={orientation}
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
                canDrawCard={canDrawCard}
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
