// utils/bot.ts
import { Chess, Move } from "chess.js";
import { PlayingCard } from "../types/game";

export type CardChessMove = Move & {
    card: PlayingCard;
};

export function getBestMove(game: Chess, moves: CardChessMove[]): CardChessMove | null {
    const allMoves = moves.map((move) => {
        const score = evaluateMove(game, move);
        return {
            move: move,
            score: score
        }
    })
    if (allMoves.length == 0) return null;
    const bestMove = allMoves.sort((a, b) => b.score - a.score)[0];
    return bestMove.move;
}

/**
 * Evaluate a move (CORE LOGIC)
 */
function evaluateMove(game: Chess, move: CardChessMove): number {
    let score = 0;
    game.move(move);
    if (move.captured) {
        score += getPieceValue(move.captured) * 10;
    }
    if (game.inCheck()) {
        score += 3;
    }
    if (game.isCheckmate()) {
        score += 1000;
    }
    if (game.isStalemate() || game.isDraw()) {
        score -= 20;
    }
    score += evaluateBoard(game);
    score += Math.random() * 0.5;
    game.undo();
    return score;
}

/**
 * Basic board evaluation
 */
function evaluateBoard(game: Chess): number {
    let score = 0;
    const board = game.board();
    const currentTurn = game.turn();
    for (const row of board) {
        for (const piece of row) {
            if (!piece) continue;

            const value = getPieceValue(piece.type);

            score += piece.color !== currentTurn ? value : -value;
        }
    }

    return score;
}

/**
 * Piece values
 */
function getPieceValue(piece: string): number {
    switch (piece) {
        case "p":
            return 1;
        case "n":
        case "b":
            return 3;
        case "r":
            return 5;
        case "q":
            return 9;
        case "k":
            return 0;
        default:
            return 0;
    }
}