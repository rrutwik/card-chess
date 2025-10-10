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
  gameOver: boolean;
  handleShowMoveButton: (show: boolean) => void;
  showMoves: boolean;
  winner: PieceColor | null;
  onNewGame: () => void;
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
  canDrawCard,
  currentPlayer,
  gameOver,
  winner,
  handleShowMoveButton,
  showMoves,
  onNewGame,
}: CompactGameControlsProps) {
  const attemptsRemaining = MAX_CHECK_ATTEMPTS - checkAttempts;
  return (
    <div className="relative flex flex-row gap-4" style={{ height: "600px" }}>
      {/* Game Over Overlay */}
      <AnimatePresence>
        {gameOver && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm rounded-2xl"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-2xl p-6 text-white shadow-2xl border-2 border-yellow-300 mx-4"
            >
              <div className="flex items-center justify-center gap-3 mb-3">
                <motion.div
                  animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    repeatDelay: 2,
                  }}
                >
                  <Trophy className="w-8 h-8" />
                </motion.div>
                <h2 className="text-2xl font-black">Victory!</h2>
              </div>
              <p className="text-center mb-4 font-bold capitalize text-lg">
                {winner} Player Wins! 🎉
              </p>
              <button
                onClick={onNewGame}
                className="w-full py-3 bg-white text-gray-900 rounded-xl font-bold hover:bg-gray-100 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-2xl hover:brightness-110"
              >
                <RotateCcw className="w-5 h-5" />
                New Game
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col gap-4 flex-1 min-w-0">
        <div
          className={`rounded-1xl p-4 border-2 shadow-xl transition-all duration-300 ${
            currentPlayer === "white"
              ? "bg-white border-gray-800"
              : "bg-gray-900 border-white"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <span
                className={`text-xs ${
                  currentPlayer === "white" ? "text-gray-600" : "text-gray-400"
                }`}
              >
                Current Turn :
              </span>
              <span
                className={`text-xs font-black capitalize ${
                  currentPlayer === "white" ? "text-gray-900" : "text-white"
                }`}
              >
                {" " + currentPlayer}
              </span>
            </div>
            {/* <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className={`
              w-14 h-14 rounded-full shadow-lg
              ${
                currentPlayer === "white"
                  ? "bg-white border-4 border-gray-800"
                  : "bg-gray-900 border-4 border-white"
              }
            `}
            /> */}
          </div>
        </div>

        {/* Check Warning Section */}
        <AnimatePresence mode="wait">
          {isInCheck && checkAttempts >= 0 && !gameOver && (
            <motion.div
              initial={{ opacity: 0, height: 0, scale: 0.95 }}
              animate={{ opacity: 1, height: "auto", scale: 1 }}
              exit={{ opacity: 0, height: 0, scale: 0.95 }}
              className="overflow-hidden"
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
                className={`rounded-xl p-4 border-2 shadow-xl ${
                  attemptsRemaining <= 2
                    ? "bg-gradient-to-br from-red-50 to-orange-50 border-red-500"
                    : "bg-gradient-to-br from-yellow-50 to-orange-50 border-orange-500"
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <motion.div
                    animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
                    transition={{
                      duration: 0.5,
                      repeat: Infinity,
                      repeatDelay: 1,
                    }}
                  >
                    <AlertTriangle
                      className={`w-6 h-6 ${
                        attemptsRemaining <= 2
                          ? "text-red-600"
                          : "text-orange-600"
                      }`}
                    />
                  </motion.div>
                  <div className="flex-1">
                    <p
                      className={`font-black ${
                        attemptsRemaining <= 2
                          ? "text-red-900"
                          : "text-orange-900"
                      }`}
                    >
                      King in Check!
                    </p>
                    <p
                      className={`text-xs ${
                        attemptsRemaining <= 2
                          ? "text-red-700"
                          : "text-orange-700"
                      }`}
                    >
                      Escape or face checkmate
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span
                      className={`font-bold ${
                        attemptsRemaining <= 2
                          ? "text-red-800"
                          : "text-orange-800"
                      }`}
                    >
                      Attempts Remaining
                    </span>
                    <span
                      className={`font-black text-lg ${
                        attemptsRemaining <= 2
                          ? "text-red-600"
                          : "text-orange-600"
                      }`}
                    >
                      {attemptsRemaining}/{MAX_CHECK_ATTEMPTS}
                    </span>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden shadow-inner">
                    <motion.div
                      animate={{
                        width: `${
                          (attemptsRemaining / MAX_CHECK_ATTEMPTS) * 100
                        }%`,
                      }}
                      className={`h-full rounded-full ${
                        attemptsRemaining <= 2
                          ? "bg-gradient-to-r from-red-600 to-red-500"
                          : "bg-gradient-to-r from-orange-500 to-yellow-500"
                      }`}
                      transition={{ duration: 0.5 }}
                    />
                  </div>

                  <div className="flex gap-1 justify-center pt-1">
                    {Array.from({ length: MAX_CHECK_ATTEMPTS }).map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className={`w-2 h-2 rounded-full ${
                          i < attemptsRemaining
                            ? attemptsRemaining <= 2
                              ? "bg-red-500"
                              : "bg-orange-500"
                            : "bg-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Card Section */}
        <div
          className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 overflow-hidden"
          style={{ height: "360px" }}
        >
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-3 justify-between flex flex-shrink-0">
            <span className="font-bold text-xs text-white">Current Card</span>
          </div>
          <div
            className="p-4 flex items-center justify-center"
            style={{ height: "calc(100% - 48px)" }}
          >
            <AnimatePresence mode="wait">
              {currentCard ? (
                <motion.div
                  key="card"
                  initial={{ rotateY: 90, opacity: 0 }}
                  animate={{ rotateY: 0, opacity: 1 }}
                  exit={{ rotateY: -90, opacity: 0 }}
                  transition={{ duration: 0.28 }}
                  className="flex flex-row items-center justify-between w-full gap-4"
                  style={{ width: "100%", maxWidth: "400px" }} // increased maxWidth to give space
                >
                  {/* Card */}
                  <div
                    className={`relative bg-white rounded-xl shadow-lg p-4 border-3 ${
                      currentCard.color === "red"
                        ? "border-red-500"
                        : "border-gray-900"
                    }`}
                    style={{
                      width: "140px",
                      height: "196px",
                      aspectRatio: "2.5/3.5",
                    }}
                  >
                    <div
                      className={`absolute top-2 left-2 flex flex-col items-center leading-none ${
                        currentCard.color === "red"
                          ? "text-red-600"
                          : "text-gray-900"
                      }`}
                    >
                      <span className="text-xl font-black">
                        {currentCard.value}
                      </span>
                      <span className="text-2xl">
                        {SUIT_SYMBOLS[currentCard.suit]}
                      </span>
                    </div>

                    <div
                      className={`absolute inset-0 flex items-center justify-center ${
                        currentCard.color === "red"
                          ? "text-red-600"
                          : "text-gray-900"
                      }`}
                    >
                      <span className="text-5xl opacity-10">
                        {SUIT_SYMBOLS[currentCard.suit]}
                      </span>
                    </div>

                    <div
                      className={`absolute bottom-2 right-2 flex flex-col items-center rotate-180 leading-none ${
                        currentCard.color === "red"
                          ? "text-red-600"
                          : "text-gray-900"
                      }`}
                    >
                      <span className="text-xl font-black">
                        {currentCard.value}
                      </span>
                      <span className="text-2xl">
                        {SUIT_SYMBOLS[currentCard.suit]}
                      </span>
                    </div>
                  </div>

                  {/* Meaning & Warning */}
                  <div className="flex flex-col justify-between items-center flex-1 gap-3">
                    <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl">
                      <p className="text-xs text-blue-900 font-bold text-center">
                        {getCardMeaning(currentCard)}
                      </p>
                    </div>

                    {noValidCard && (
                      <AnimatePresence>
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.8 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.8 }}
                          className="text-center"
                        >
                          <p className="inline-block text-xs text-red-600 font-bold bg-red-50 border-2 border-red-200 rounded-full px-4 py-2">
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
                  className="flex flex-col items-center gap-3"
                  style={{ width: "100%", maxWidth: "200px" }}
                >
                  <div
                    className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-xl shadow-lg p-4 overflow-hidden"
                    style={{
                      width: "140px",
                      height: "196px",
                      aspectRatio: "2.5/3.5",
                    }}
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="absolute inset-0 flex flex-col items-center justify-center text-white"
                    >
                      <div className="text-5xl mb-2">🎴</div>
                      <p className="font-bold text-lg">Ready</p>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={onDrawCard}
            disabled={!canDrawCard}
            className={`w-full py-3 rounded-xl font-bold transition-all duration-200 shadow-lg
            ${
              canDrawCard
                ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-2xl hover:brightness-110 active:scale-95"
                : "bg-gray-300 text-gray-500 cursor-not-allowed opacity-70"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              {canDrawCard ? (
                <>
                  <Play className="w-5 h-5" /> Draw Card
                </>
              ) : (
                "Make Your Move"
              )}
            </div>
          </button>

          <motion.button
            onClick={onNewGame}
            className="w-full py-2.5 bg-gray-700 hover:bg-gray-800 text-black rounded-xl font-bold shadow-lg transition-all duration-200 flex items-center justify-center gap-2 hover:shadow-2xl hover:brightness-110"
          >
            <RotateCcw className="w-4 h-4" />
            Restart
          </motion.button>

          <motion.button
            onClick={() => handleShowMoveButton(!showMoves)}
            className="w-full py-2.5 bg-gray-700 hover:bg-gray-800 text-black rounded-xl font-semibold shadow-lg transition-all duration-200 flex items-center justify-center gap-2 hover:shadow-2xl hover:brightness-110"
          >
            {showMoves ? (
              <>
                <EyeOff className="w-5 h-5" />
                <span>Hide Moves</span>
              </>
            ) : (
              <>
                <Eye className="w-5 h-5" />
                <span>Show Moves</span>
              </>
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
