import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { BookOpen } from "lucide-react";
import { ChessBoard } from "./components/ChessBoard";
import { CompactGameControls } from "./components/CompactGameControls";
import { CollapsibleRulesSidebar } from "./components/CollapsibleRulesSidebar";
import { useCardChessV2 } from "./hooks/useCardChessV2";
import { MoveHistoryFooter } from "./components/MoveHistoryFooter";

export default function App() {
  const [showRules, setShowRules] = useState(false);
  const [showMoves, setShowMoves] = useState(false);

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
  } = useCardChessV2();

  useEffect(() => {
    console.log({
      showMoves
    })
  }, [showMoves]);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50">

      <CollapsibleRulesSidebar
        isOpen={showRules}
        onClose={() => setShowRules(false)}
      />


      <header className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 bg-white/95 backdrop-blur-sm shadow-lg border-b border-gray-200/50 flex-none relative z-20">
        <button
          onClick={() => setShowRules(true)}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 hover:from-indigo-700 hover:to-purple-700"
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
      </header>

      <main className="flex-1 flex overflow-hidden">

        <div className="flex-1 flex items-center justify-center overflow-hidden p-2 sm:p-4 lg:p-6">
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
            />
          </motion.div>
        </div>


        <aside className="sm:w-80 lg:w-96 flex items-center justify-center overflow-hidden p-2 sm:p-4 lg:p-6 border-l border-gray-200/50 bg-white/40 backdrop-blur-sm"
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
