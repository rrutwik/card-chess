import { useCallback, useEffect, useRef, useState } from "react";
import { Chess, Move, Square } from "chess.js";
import { PlayingCard } from "../types/game";
import { MoveHistory, createDeck, shuffleDeck } from "../utils/deckUtils";
import { CardChessMap } from "../constants/chess";
import { saveGameState, loadGameState, clearGameState } from "../utils/storage";
import { ChessAPI } from "../services/api";

export const MAX_CHECK_ATTEMPTS = 5;

interface UseCardChessOptions {
  gameId?: string;
  userId?: string;
  onGameUpdate?: (fen: string, currentPlayer: string, currentCard: PlayingCard | null) => void;
}

function checkMove(move: Move, card: PlayingCard) {
  if (!card) return false;
  if (card.suit === "joker") return true;

  const cardValue = String(card.value);

  const pawnCards = ["2", "3", "4", "5", "6", "7", "8", "9"];
  if (pawnCards.includes(cardValue)) {
    if (move.piece !== "p") return false;

    const fromSquare = move.from;
    if (!fromSquare) return false;
    const file = fromSquare[0];
    if (CardChessMap && CardChessMap[file]) {
      return CardChessMap[file] === cardValue;
    }
    return true;
  }

  const mapping: Record<string, string> = {
    A: "r", 
    "10": "n",
    J: "b",
    Q: "q",
    K: "k",
  };

  if (mapping[cardValue]) {
    return move.piece === mapping[cardValue];
  }

  return false;
}

export function useCardChess(
  initialFen: string | null,
  options: UseCardChessOptions = {}
) {
  const { gameId, userId, onGameUpdate } = options;
  const gameRef = useRef(new Chess(initialFen || undefined));
  const [deck, setDeck] = useState<PlayingCard[]>(() => createDeck());
  const [currentCard, setCurrentCard] = useState<PlayingCard | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<"white" | "black">("white");
  const [checkAttempts, setCheckAttempts] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<"white" | "black" | "draw" | null>(null);
  const [fromMoveSelected, setFromMoveSelected] = useState<Square | null>(null);
  const [validMoves, setValidMoves] = useState<Move[]>([]);
  const [moveHistory, setMoveHistory] = useState<MoveHistory[]>([]);
  const [noValidCard, setNoValidCard] = useState(false);

  // Sync game state with backend
  const syncWithBackend = useCallback(async (fen: string, newCurrentPlayer: string, newCurrentCard: PlayingCard | null) => {
    if (!gameId || !userId) return;

    try {
      await ChessAPI.updateGameState(gameId, {
        fen,
        turn: newCurrentPlayer as 'white' | 'black',
        current_card: newCurrentCard ? `${newCurrentCard.value}${newCurrentCard.suit}` : null,
        cards_deck: deck,
        moves: moveHistory
      });

      onGameUpdate?.(fen, newCurrentPlayer, newCurrentCard);
    } catch (error) {
      console.error("Failed to sync with backend:", error);
    }
  }, [gameId, userId, deck.length, moveHistory, onGameUpdate]);

  const drawCard = useCallback(() => {
    if (deck.length === 0 || gameOver) return;

    const newDeck = [...deck];
    const card = newDeck.pop();
    if (card) {
      setDeck(newDeck);
      setCurrentCard(card);
      setNoValidCard(false);

      // Sync with backend
      syncWithBackend(gameRef.current.fen(), currentPlayer, card);
    }
  }, [deck, gameOver, currentPlayer, syncWithBackend]);

  const reshuffleDeck = useCallback(() => {
    const newDeck = shuffleDeck(createDeck());
    setDeck(newDeck);
    setCurrentCard(null);
    setNoValidCard(false);
    setCheckAttempts(0);
  }, []);

  const updateMove = useCallback(
    (card: PlayingCard, move: Move) => {
      if (gameOver) return;

      const nextPlayer = gameRef.current.turn() === "w" ? "white" : "black";

      setCurrentPlayer(nextPlayer);
      setCurrentCard(null);
      setFromMoveSelected(null);
      setValidMoves([]);

      // Update move history
      const newMoveHistory = [
        ...moveHistory,
        {
          move: {
            from: move.from,
            to: move.to,
            piece: move.piece,
          },
          card: card,
          player: currentPlayer,
        },
      ];
      setMoveHistory(newMoveHistory);

      if (gameRef.current.isCheckmate()) {
        setGameOver(true);
        setWinner(currentPlayer);
      } else if (
        gameRef.current.isStalemate() ||
        gameRef.current.isDraw() ||
        gameRef.current.isThreefoldRepetition()
      ) {
        setGameOver(true);
        setWinner(null);
      }

      // Sync with backend
      syncWithBackend(gameRef.current.fen(), nextPlayer, null);

      try {
        saveGameState(
          gameRef.current.fen(),
          deck,
          nextPlayer,
          null,
          checkAttempts,
          newMoveHistory
        );
      } catch (e) {
        console.warn("Save after move failed:", e);
      }
    },
    [currentPlayer, deck, checkAttempts, gameOver, moveHistory, syncWithBackend]
  );

  const chessMakeMove = useCallback(
    (fromSquare: Square, toSquare: Square, promotion: string) => {
      try {
        setCheckAttempts(0);
        const mv = gameRef.current.move({ from: fromSquare, to: toSquare, promotion });
        if (!currentCard) {
          console.error("Current Card is not selected");
          return false;
        }
        if (mv) updateMove(currentCard, mv);
        return true;
      } catch (e) {
        console.error("Invalid move attempt:", e);
        return false;
      }
    },
    [currentCard, updateMove, setCheckAttempts]
  );

  const handleSquareClick = useCallback(
    (square: Square, piece: any | null) => {
      if (gameOver || !currentCard) return;

      if (fromMoveSelected) {
        const validMovesForSelection = getValidMovesForCard(
          gameRef.current,
          fromMoveSelected,
          currentCard,
          currentPlayer
        );

        const found = validMovesForSelection.some(
          (m) => m.from === fromMoveSelected && m.to === square
        );
        if (found) {
          chessMakeMove(fromMoveSelected, square, "q");
          return;
        }

        const clickedPiece = gameRef.current.get(square);
        const clickedColor = clickedPiece
          ? clickedPiece.color === "w"
            ? "white"
            : "black"
          : null;
        if (clickedPiece && clickedColor === currentPlayer) {
          setFromMoveSelected(square);
          const moves = getValidMovesForCard(
            gameRef.current,
            square,
            currentCard,
            currentPlayer
          );
          setValidMoves(moves);
        } else {
          setFromMoveSelected(null);
          setValidMoves([]);
        }

        return;
      }

      const clickedPiece = gameRef.current.get(square);
      const clickedColor = clickedPiece
        ? clickedPiece.color === "w"
          ? "white"
          : "black"
        : null;
      if (clickedPiece && clickedColor === currentPlayer) {
        setFromMoveSelected(square);
        const moves = getValidMovesForCard(
          gameRef.current,
          square,
          currentCard,
          currentPlayer
        );
        setValidMoves(moves);
      } else {
        setFromMoveSelected(null);
        setValidMoves([]);
      }
    },
    [fromMoveSelected, currentCard, currentPlayer, gameOver, chessMakeMove]
  );

  const onDrop = useCallback(
    (fromSquare: Square, toSquare: Square) => {
      if (!currentCard || gameOver) return false;
      try {
        const validMovesForSelection = getValidMovesForCard(
          gameRef.current,
          fromSquare,
          currentCard,
          currentPlayer
        );
        const found = validMovesForSelection.some(
          (m) => m.from === fromSquare && m.to === toSquare
        );
        if (found) {
          return chessMakeMove(fromSquare, toSquare, "q");
        }
        return false;
      } catch (err) {
        console.error("Invalid drop move:", err);
        return false;
      }
    },
    [currentCard, gameOver, chessMakeMove, currentPlayer]
  );

  const resetGame = useCallback(() => {
    gameRef.current.reset();
    const newDeck = createDeck();
    setDeck(newDeck);
    setCurrentCard(null);
    setNoValidCard(false);
    setCurrentPlayer("white");
    setCheckAttempts(0);
    setGameOver(false);
    setWinner(null);
    setFromMoveSelected(null);
    setValidMoves([]);
    setMoveHistory([]);
    clearGameState();
  }, []);

  // Poll for updates from other players
  useEffect(() => {
    if (!gameId) return;

    const pollForUpdates = async () => {
      try {
        const response = await ChessAPI.getGame(gameId);
        const latestGame = response.data.data;

        // If the backend has a different FEN, update local state
        if (latestGame.game_state.fen !== gameRef.current.fen()) {
          gameRef.current.load(latestGame.game_state.fen);
          setCurrentPlayer(latestGame.game_state.turn);
          setCurrentCard(null); // card would not be selected if fen changes
          setDeck(latestGame.game_state.cards_deck || []);
          setMoveHistory(latestGame.game_state.moves || []);
          setGameOver(latestGame.game_state.status === 'completed');
          setWinner(latestGame.game_state.winner || null);
        }
      } catch (err) {
        console.error("Error polling for game updates:", err);
      }
    };

    // Poll for updates every 3 seconds
    const intervalId = setInterval(pollForUpdates, 3000);
    return () => clearInterval(intervalId);
  }, [gameId]);

  return {
    game: gameRef.current,
    deck,
    drawCard,
    currentCard,
    currentPlayer,
    checkAttempts,
    gameOver,
    winner,
    handleSquareClick,
    onDrop,
    resetGame,
    noValidCard,
    reshuffleDeck,
    fromMoveSelected,
    validMoves,
    moveHistory,
    isInCheck: gameRef.current.isCheck(),
    cardsRemaining: deck.length,
    canDrawCard: (!currentCard || noValidCard) && !gameOver,
  } as const;
}

function getValidMovesForCard(
  game: Chess,
  fromSquare: Square,
  card: PlayingCard,
  currentPlayer: "white" | "black"
) {
  const moves: Move[] = [];
  const possibleMoves = game.moves({
    square: fromSquare,
    verbose: true,
  });

  for (const move of possibleMoves) {
    if (checkMove(move, card)) {
      moves.push(move);
    }
  }

  return moves;
}
