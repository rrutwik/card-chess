import {
  Arrow,
  Chessboard,
  ChessboardProvider,
  DraggingPieceDataType,
  PieceDataType,
} from "react-chessboard";
import { Chess, Move, Square } from "chess.js";
import { PieceColor } from "../types/game";
import React from "react";

interface ChessBoardProps {
  game: Chess;
  showMoves?: boolean;
  fromMoveSelected: Square | null;
  validMoves: Move[];
  onSquareClick: (square: Square, piece: PieceDataType | null) => void;
  onDrop: (fromSquare: Square, toSquare: Square) => boolean;
  currentPlayer: PieceColor;
  canMove: boolean;
}

export function ChessBoard({
  game,
  fromMoveSelected,
  showMoves=false,
  validMoves,
  onSquareClick,
  onDrop,
  currentPlayer,
  canMove,
}: ChessBoardProps) {
  const handleSquareClick = ({
    square,
    piece,
  }: {
    square: string;
    piece: PieceDataType | null;
  }) => {
    if (!canMove) return;
    onSquareClick(square as Square, piece);
  };

  const handleDrop = ({
    piece,
    sourceSquare,
    targetSquare,
  }: {
    piece: DraggingPieceDataType;
    sourceSquare: string;
    targetSquare: string | null;
  }) => {
    if (!canMove) return false;
    return onDrop(sourceSquare as Square, targetSquare as Square);
  };

  const customSquareStyles = React.useMemo(() => {
    const styles: { [square: string]: React.CSSProperties } = {};
    console.log({
      validMoves,
      fromMoveSelected
    })
  
    if (!showMoves) return styles;
    
    if (!fromMoveSelected) return styles;

    validMoves.forEach((move) => {
      const dest = move.to;
      const isCapture = !!move.captured;
      styles[move.from] = {
        backgroundColor: "rgba(59, 130, 246, 0.4)",
      };
      if (isCapture) {
        
        styles[dest] = {
          boxShadow: "inset 0 0 0 4px rgba(239, 68, 68, 0.6)",
          borderRadius: "50%",
        };
      } else {
        
        styles[dest] = {
          position: "relative",
        };
        
        styles[dest].backgroundImage =
          "radial-gradient(circle, rgba(34,197,94,0.8) 25%, transparent 26%)";
      }
    });
    console.log({
      styles
    })
    return styles;
  }, [fromMoveSelected, validMoves, showMoves]);

  const arrows = React.useMemo(() => {
    if (!showMoves) return [];
    if (fromMoveSelected) return [];
    const colors = [
      "rgba(59,130,246,0.75)", 
      "rgba(34,197,94,0.75)", 
      "rgba(234,179,8,0.75)", 
      "rgba(239,68,68,0.75)", 
    ];
    const grouped: Record<string, { from: string; to: string; color: string }[]> = {};
    validMoves.forEach((move, i) => {
      const color = colors[i % colors.length];
      if (!grouped[move.from]) grouped[move.from] = [];
        grouped[move.from].push({ from: move.from, to: move.to, color });
    });
    const arrows = Object.values(grouped).flatMap((moves) => {
      const color = moves[0].color;
      return moves.map((m) => ({ startSquare: m.from, endSquare: m.to, color }));
    });
    return arrows;
  }, [fromMoveSelected, showMoves, validMoves, currentPlayer]);

  return (
    <div className="w-full h-full min-h-0 flex items-center justify-center p-2">
      <div className="relative bg-gray-800 rounded-2xl shadow-2xl p-3 sm:p-4">
        <Chessboard
          options={{
            position: game.fen(),
            onSquareClick: handleSquareClick,
            onPieceDrop: handleDrop,
            boardOrientation: currentPlayer === "white" ? "white" : "black",
            boardStyle: {
              width: "100%",
              height: "100%",
              cursor: "default",
              borderRadius: "2px",
              boxShadow: "0 6px 18px rgba(15, 23, 42, 0.06)",
            },
            darkSquareStyle: { backgroundColor: "#769656" },
            lightSquareStyle: { backgroundColor: "#eeeed2" },
            squareStyles: customSquareStyles,
            arrows: arrows
            
          }}
        />
      </div>
    </div>
  );
}
