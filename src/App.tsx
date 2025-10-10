import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { BookOpen } from "lucide-react";
import { ChessBoard } from "./components/ChessBoard";
import { CompactGameControls } from "./components/CompactGameControls";
import { CollapsibleRulesSidebar } from "./components/CollapsibleRulesSidebar";
import { useCardChess } from "./hooks/useCardChess";
import { MoveHistoryFooter } from "./components/MoveHistoryFooter";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./components/ui/select";
import { BoardOrientation } from "./types/game";

export default function App() {
  const [showRules, setShowRules] = useState(false);
  const [showMoves, setShowMoves] = useState(true);

  // Persistent orientation state
  const [orientation, setOrientation] = useState<BoardOrientation>(() => {
    const saved = localStorage.getItem('chessboard-orientation');
    return (saved as BoardOrientation) || 'auto';
  });

  // Save orientation to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('chessboard-orientation', orientation);
  }, [orientation]);

  useEffect(() => {
  }, [showMoves]);

  const {
    game,
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
  } = useCardChess();


  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50">

      <CollapsibleRulesSidebar
        isOpen={showRules}
        onClose={() => setShowRules(false)}
      />


      <header className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 bg-white/95 backdrop-blur-sm shadow-lg border-b border-gray-200/50 flex-none relative z-20">
        <button
          onClick={() => setShowRules(true)}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold shadow-lg hover:shadow-2xl hover:brightness-110 transition-all duration-200"
        >
          <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">Rules</span>
        </button>

        <div className="flex items-center gap-2 sm:gap-3">
          <motion.span 
            className="text-2xl sm:text-3xl"
            animate={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            ♔
          </motion.span>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Card Chess
          </h1>
          <motion.span 
            className="text-2xl sm:text-3xl"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3, delay: 1 }}
          >
            🎴
          </motion.span>
        </div>

        <div className="w-12 sm:w-24" />

        {/* Orientation Selector */}
        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-3 py-1.5 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-200 hover:bg-white/20">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 shadow-sm"></div>
            <span className="text-xs font-medium text-gray-700 tracking-wide">View</span>
          </div>

          <Select value={orientation} onValueChange={(value: BoardOrientation) => setOrientation(value)}>
            <SelectTrigger className="w-32 bg-white/70 border border-white/30 text-gray-700 hover:bg-white hover:border-white/50 focus:ring-1 focus:ring-indigo-400 shadow-sm transition-all duration-200 text-sm font-medium">
              <SelectValue placeholder="View" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-200 shadow-lg">
              <SelectItem value="auto" className="text-gray-700 hover:bg-blue-50 hover:text-blue-900 focus:bg-blue-50 py-2 px-3 text-sm transition-all duration-150">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 border border-white/30"></div>
                  <span className="font-medium">Auto</span>
                </div>
              </SelectItem>
              <SelectItem value="white" className="text-gray-700 hover:bg-gray-50 hover:text-gray-900 focus:bg-gray-50 py-2 px-3 text-sm transition-all duration-150">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-white border border-gray-300"></div>
                  <span className="font-medium">White</span>
                </div>
              </SelectItem>
              <SelectItem value="black" className="text-gray-700 hover:bg-gray-50 hover:text-gray-900 focus:bg-gray-50 py-2 px-3 text-sm transition-all duration-150">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-800 border border-gray-400"></div>
                  <span className="font-medium">Black</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </header>

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
              game={game}
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


        <aside className="sm:w-80 lg:w-96 flex items-center justify-center p-2 sm:p-4 lg:p-6 border-l border-gray-200/50 bg-white/40 backdrop-blur-sm"
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
      {gameOver && 
        <MoveHistoryFooter moveHistory={moveHistory} />
      }
    </div>
  );
}
