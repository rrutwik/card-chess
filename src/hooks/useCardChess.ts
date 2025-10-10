import { useCallback, useEffect, useRef, useState } from "react";
import { Chess, Move, Square } from "chess.js";
import { PlayingCard } from "../types/game";
import { MoveHistory, createDeck, shuffleDeck } from "../utils/deckUtils";
import { CardChessMap } from "../constants/chess";
import { saveGameState, loadGameState, clearGameState } from "../utils/storage";

export const MAX_CHECK_ATTEMPTS = 5;

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

function getValidMovesForCard(
  game: Chess,
  fromMoveSelected: Square,
  card: PlayingCard,
  player: "white" | "black"
): Move[] {
  if (!fromMoveSelected || !card) return [];
  const piece = game.get(fromMoveSelected);
  if (!piece) return [];
  const piecePlayerColor = piece.color === "w" ? "white" : "black";
  if (piecePlayerColor !== player) return [];

  const allMoves = game.moves({ square: fromMoveSelected, verbose: true }) as Move[];
  return allMoves.filter((m) => checkMove(m, card));
}

function checkIfAnyValidMoveForSelectedCard(game: Chess, card: PlayingCard) {
  if (!card) return [] as Move[];
  const allMoves = game.moves({ verbose: true }) as Move[];
  
  return allMoves.filter((move) => {
    if (!move) return false;
    const sideToMove = game.turn(); 
    if (move.color !== sideToMove) return false;
    return checkMove(move, card);
  });
}

export function useCardChess() {
  const gameRef = useRef(new Chess());

  const [deck, setDeck] = useState(() => createDeck());
  const [currentCard, setCurrentCard] = useState<PlayingCard | null>(null);
  const [noValidCard, setNoValidCard] = useState<boolean>(false);
  const [currentPlayer, setCurrentPlayer] = useState<"white" | "black">("white");
  const [checkAttempts, setCheckAttempts] = useState<number>(0);

  const [fromMoveSelected, setFromMoveSelected] = useState<Square | null>(null);
  const [validMoves, setValidMoves] = useState<Move[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<"white" | "black" | null>(null);
  const [moveHistory, setMoveHistory] = useState<MoveHistory[]>([]);
  
  useEffect(() => {
    const saved = loadGameState();
    if (saved) {
      try {
        gameRef.current.load(saved.fen);
        setDeck(saved.deck || createDeck());
        if (saved.currentCard) setCurrentCard(saved.currentCard);
        setCurrentPlayer(gameRef.current.turn() === "w" ? "white" : "black");
        setCheckAttempts(saved.checkAttempts || 0);
        setMoveHistory(saved.moveHistory || []);
      } catch (e) {
        console.error("Failed to load saved state:", e);
        clearGameState();
      }
    }
  }, []);

  useEffect(() => {
    try {
      saveGameState(gameRef.current.fen(), deck, currentPlayer, currentCard, checkAttempts, moveHistory);
    } catch (e) {
      console.warn("Auto-save failed:", e);
    }
  }, [deck, currentPlayer, checkAttempts, currentCard, moveHistory]);

  useEffect(() => {
    if (gameRef.current.isCheck()) {
      if (checkAttempts >= MAX_CHECK_ATTEMPTS) {
        setGameOver(true);
        setWinner(currentPlayer === "white" ? "black" : "white");
        clearGameState();
      }
    }
  }, [gameRef.current, checkAttempts, currentPlayer]);

  const drawCard = useCallback(() => {
    if (deck.length === 0) return;
    const newCard = deck[0];
    setDeck((d) => d.slice(1));
    setCurrentCard(newCard);
    setFromMoveSelected(null);

    if (gameRef.current.isCheck()) {
      setCheckAttempts((prev) => {
        const next = prev + 1;
        if (next >= MAX_CHECK_ATTEMPTS) {
          setGameOver(true);
          setWinner(currentPlayer === "white" ? "black" : "white");
          clearGameState();
        }
        return next;
      });
    } else {
      setCheckAttempts(0);
    }
  }, [deck, currentPlayer]);

  useEffect(() => {
    if (deck.length == 0) {
      const shuffled = shuffleDeck(createDeck());
      setDeck(shuffled);
    }
  }, [deck]);

  useEffect(() => {
    if (!currentCard) return;
    const moves = checkIfAnyValidMoveForSelectedCard(gameRef.current, currentCard);
    setValidMoves(moves);
    setNoValidCard(moves.length === 0);
  }, [currentCard]);

  const reshuffleDeck = useCallback(() => {
    const shuffled = shuffleDeck(createDeck());
    setDeck(shuffled);
    setCurrentCard(null);
    setFromMoveSelected(null);
    setValidMoves([]);
    setNoValidCard(false);
  }, []);

  const updateMove = useCallback(
    (playedCard: PlayingCard, move: Move) => {
      if (!move) {
        console.error("updateMove called without a move");
        return;
      }

      
      setMoveHistory((prev) => [...prev, { card: playedCard, move }]);

      
      const nextPlayer = gameRef.current.turn() === "w" ? "white" : "black";

      
      setCurrentPlayer(nextPlayer);
      setCurrentCard(null);
      setFromMoveSelected(null);
      setValidMoves([]);

      
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

      try {
        saveGameState(gameRef.current.fen(), deck, nextPlayer, currentCard, checkAttempts, moveHistory);
      } catch (e) {
        console.warn("Save after move failed:", e);
      }
    },
    [currentPlayer, deck, checkAttempts, currentCard]
  );

  const chessMakeMove = useCallback((fromSquare: Square, toSquare: Square, promotion: string) => {
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
  }, [currentCard, updateMove, setCheckAttempts]);

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

        const found = validMovesForSelection.some((m) => m.from === fromMoveSelected && m.to === square);
        if (found) {
          chessMakeMove(fromMoveSelected, square, "q");
          return;
        }

        
        const clickedPiece = gameRef.current.get(square);
        const clickedColor = clickedPiece ? (clickedPiece.color === "w" ? "white" : "black") : null;
        if (clickedPiece && clickedColor === currentPlayer) {
          setFromMoveSelected(square);
          const moves = getValidMovesForCard(gameRef.current, square, currentCard, currentPlayer);
          setValidMoves(moves);
        } else {
          
          setFromMoveSelected(null);
          setValidMoves([]);
        }

        return;
      }

      
      const clickedPiece = gameRef.current.get(square);
      const clickedColor = clickedPiece ? (clickedPiece.color === "w" ? "white" : "black") : null;
      if (clickedPiece && clickedColor === currentPlayer) {
        setFromMoveSelected(square);
        const moves = getValidMovesForCard(gameRef.current, square, currentCard, currentPlayer);
        setValidMoves(moves);
      } else {
        setFromMoveSelected(null);
        setValidMoves([]);
      }
    },
    [fromMoveSelected, currentCard, currentPlayer, gameOver, updateMove]
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
        const found = validMovesForSelection.some((m) => m.from === fromSquare && m.to === toSquare);
        if (found) {
          return chessMakeMove(fromSquare, toSquare, "q");
        }
        return false;
      } catch (err) {
        console.error("Invalid drop move:", err);
        return false;
      }
    },
    [currentCard, gameOver, updateMove]
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