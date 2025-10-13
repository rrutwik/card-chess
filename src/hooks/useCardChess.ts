import { useCallback, useEffect, useRef, useState } from "react";
import { Chess, Move, Square } from "chess.js";
import { MoveHistory, PlayingCard } from "../types/game";
import { createDeck, shuffleDeck } from "../utils/deckUtils";
import { CardChessMap } from "../constants/chess";
import { clearGameState } from "../utils/storage";
import { ChessAPI, ChessGame } from "../services/api";

export const MAX_CHECK_ATTEMPTS = 5;

const DEFAULT_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w - - 0 1";

export interface GameState {
  deck: PlayingCard[];
  currentCard: PlayingCard | null;
  currentPlayer: "white" | "black";
  userColor: "white" | "black";
  checkAttempts: number;
  gameOver: boolean;
  winner: "white" | "black" | "draw" | null;
  fromMoveSelected: Square | null;
  validMoves: Move[];
  moveHistory: MoveHistory[];
  noValidCard: boolean;
  isInCheck: boolean;
  canDrawCard: boolean;
  cardsRemaining: number;
}

interface UseCardChessOptions {
  userId: string;
  onGameUpdate?: (
    fen: string,
    currentPlayer: string,
    currentCard: PlayingCard | null
  ) => void;
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

function getAnyValidMoveForSelectedCard(game: Chess, card: PlayingCard) {
  if (!card) return [] as Move[];
  const allMoves = game.moves({ verbose: true }) as Move[];

  return allMoves.filter((move) => {
    if (!move) return false;
    const sideToMove = game.turn();
    if (move.color !== sideToMove) return false;
    return checkMove(move, card);
  });
}

export function useCardChess(
  game: ChessGame | null,
  options: UseCardChessOptions
) {
  const { userId } = options;
  const gameId = game?.game_id;

  const gameRef = useRef(new Chess(game?.game_state?.fen || undefined));
  const [gameState, setGameState] = useState<GameState>(() => ({
    fen: game?.game_state?.fen || DEFAULT_FEN,
    deck: game?.game_state?.cards_deck || createDeck(),
    currentCard: game?.game_state?.current_card || null,
    currentPlayer: "white",
    userColor: "white",
    checkAttempts: 0,
    gameOver: false,
    winner: null,
    fromMoveSelected: null,
    validMoves: [],
    moveHistory: [],
    noValidCard: false,
    isInCheck: false,
    canDrawCard: true,
    cardsRemaining: (game?.game_state?.cards_deck || createDeck()).length,
  }));

  useEffect(() => {
    if (game) {
      if (game.game_state.fen) {
        gameRef.current.load(game.game_state.fen);
        const isInCheck = gameRef.current.inCheck();
        setGameState((prev) => ({
          ...prev,
          currentPlayer: game.game_state.turn,
          currentCard: null,
          deck: game.game_state.cards_deck || [],
          moveHistory: game.game_state.moves || [],
          gameOver: game.game_state.status === "completed",
          winner: game.game_state.winner || null,
          checkAttempts: game.game_state.check_attempts || 0,
          canDrawCard: true,
          fromMoveSelected: null,
          validMoves: [],
          isInCheck: isInCheck,
        }));
      }

      if (game.player_white === userId) {
        setGameState((prev) => ({ ...prev, userColor: "white" }));
      } else if (game.player_black === userId) {
        setGameState((prev) => ({ ...prev, userColor: "black" }));
      }

      if (game.game_state.current_card) {
        setGameState((prev) => ({
          ...prev,
          currentCard: game.game_state.current_card || null,
        }));
        const moves = getAnyValidMoveForSelectedCard(
          gameRef.current,
          game.game_state.current_card
        );
        setGameState((prev) => ({ ...prev, validMoves: moves }));
      } else {
        setGameState((prev) => ({
          ...prev,
          currentCard: null,
          validMoves: [],
        }));
      }
    }
  }, [game, userId]);

  // Sync game state with backend
  const syncWithBackend = useCallback(
    async (
      fen: string,
      turn: "white" | "black",
      current_card: PlayingCard | null,
      cards_deck: PlayingCard[] | null,
      check_attempts: number,
      moves: MoveHistory[],
      status: "active" | "completed" | "abandoned",
      winner: "white" | "black" | "draw" | undefined = undefined
    ): Promise<void> => {
      if (!gameId || !userId) return;

      try {
        await ChessAPI.updateGameState(gameId, {
          fen,
          turn,
          current_card,
          cards_deck: cards_deck == null ? undefined : cards_deck,
          check_attempts,
          moves,
          status,
          winner,
        });
      } catch (error) {
        console.error("Failed to sync with backend:", error);
      }
    },
    [gameId, userId, gameState]
  );

  useEffect(() => {
    if (
      gameState.currentCard &&
      gameState.userColor === gameState.currentPlayer
    ) {
      const moves = getAnyValidMoveForSelectedCard(
        gameRef.current,
        gameState.currentCard
      );
      setGameState((prev) => ({ ...prev, validMoves: moves, noValidCard: moves.length === 0 }));
    }
  }, [gameState.currentCard, gameState.userColor, gameState.currentPlayer]);

  useEffect(() => {
    if (gameState.deck.length < 5) {
      const shuffled = shuffleDeck(createDeck());
      setGameState((prev) => ({ ...prev, deck: [...prev.deck, ...shuffled] }));
    }
  }, [gameState.deck]);

  // Helper function to check if current card allows any valid moves
  const checkForValidMoves = useCallback(
    (card: PlayingCard, player: "white" | "black") => {
      const game = gameRef.current;
      const pieces = game
        .board()
        .flat()
        .filter(
          (piece) => piece && piece.color === (player === "white" ? "w" : "b")
        );

      for (const piece of pieces) {
        if (piece && piece.square) {
          const moves = getValidMovesForCard(game, piece.square, card, player);
          if (moves.length > 0) {
            return true;
          }
        }
      }
      return false;
    },
    []
  );

  const drawCard = useCallback(() => {
    if (gameState.deck.length === 0 || gameState.gameOver) return;

    const newDeck = [...gameState.deck];
    const card = newDeck.pop();
    if (card) {
      setGameState((prev) => ({ ...prev, currentCard: card, deck: newDeck }));

      const hasValidMoves = checkForValidMoves(card, gameState.currentPlayer);
      let newAttempts = gameState.checkAttempts;
      let newMoveHistory = [...gameState.moveHistory];
      let winner: "white" | "black" | "draw" | null = null;
      if (!hasValidMoves) {
        setGameState((prev) => ({ ...prev, noValidCard: true }));
        newMoveHistory = [
          ...newMoveHistory,
          {
            card: card,
            player: gameState.currentPlayer,
            isFailedAttempt: true,
          },
        ];
        setGameState((prev) => ({ ...prev, moveHistory: newMoveHistory }));
        if (
          gameState.isInCheck &&
          gameState.checkAttempts < MAX_CHECK_ATTEMPTS
        ) {
          newAttempts = gameState.checkAttempts + 1;
          setGameState((prev) => ({ ...prev, checkAttempts: newAttempts }));
          // If this was the 5th failed attempt, end the game
          if (newAttempts >= MAX_CHECK_ATTEMPTS) {
            winner = gameState.currentPlayer === "white" ? "black" : "white";
            setGameState((prev) => ({
              ...prev,
              gameOver: true,
              winner,
            }));
          }
        }
      }

      syncWithBackend(
        gameRef.current.fen(),
        gameState.currentPlayer,
        card,
        newDeck,
        newAttempts,
        newMoveHistory,
        winner ? "completed" : "active",
        winner || undefined
      );
    }
  }, [
    gameState.deck,
    gameState.gameOver,
    gameState.currentPlayer,
    gameState.isInCheck,
    gameState.checkAttempts,
    gameState.moveHistory,
    syncWithBackend,
    checkForValidMoves,
  ]);

  const reshuffleDeck = useCallback(() => {
    const newDeck = shuffleDeck(createDeck());
    setGameState((prev) => ({ ...prev, deck: newDeck, checkAttempts: 0 }));
  }, []);

  const updateMove = useCallback(
    (card: PlayingCard, move: Move) => {
      if (gameState.gameOver) return;

      setGameState((prev) => ({
        ...prev,
        fen: gameRef.current.fen(),
        checkAttempts: 0,
        fromMoveSelected: null,
        validMoves: [],
        currentCard: null,
      }));
      // Update move history first
      const newMoveHistory = [
        ...gameState.moveHistory,
        {
          move: {
            from: move.from,
            to: move.to,
            piece: move.piece,
          },
          card: card,
          player: gameState.currentPlayer,
        },
      ];
      setGameState((prev) => ({ ...prev, moveHistory: newMoveHistory }));

      // Clear current card and selection state
      setGameState((prev) => ({ ...prev, currentCard: null }));
      setGameState((prev) => ({ ...prev, fromMoveSelected: null }));
      setGameState((prev) => ({ ...prev, validMoves: [] }));

      const nextPlayer = gameRef.current.turn() === "w" ? "white" : "black";

      const opponentInCheck = gameRef.current.isCheck();
      let gameOver = false;
      let winner: "white" | "black" | "draw" | null = null;
      if (opponentInCheck) {
        setGameState((prev) => ({ ...prev, isInCheck: true }));
        setGameState((prev) => ({ ...prev, checkAttempts: 0 }));
        setGameState((prev) => ({ ...prev, currentPlayer: nextPlayer }));
      } else {
        setGameState((prev) => ({ ...prev, isInCheck: false }));
        setGameState((prev) => ({ ...prev, checkAttempts: 0 }));
        setGameState((prev) => ({ ...prev, currentPlayer: nextPlayer }));
      }

      if (gameRef.current.isCheckmate()) {
        gameOver = true;
        winner = gameState.currentPlayer;
      } else if (
        gameRef.current.isStalemate() ||
        gameRef.current.isDraw() ||
        gameRef.current.isThreefoldRepetition()
      ) {
        gameOver = true;
        winner = "draw";
      }
      setGameState((prev) => ({ ...prev, gameOver, winner }));
      syncWithBackend(
        gameRef.current.fen(),
        nextPlayer,
        null,
        null,
        0,
        newMoveHistory,
        gameState.gameOver ? "completed" : "active",
        winner || undefined
      );
    },
    [
      gameState.currentPlayer,
      gameState.deck,
      gameState.gameOver,
      gameState.moveHistory,
    ]
  );

  const chessMakeMove = useCallback(
    (fromSquare: Square, toSquare: Square, promotion: string) => {
      try {
        const mv = gameRef.current.move({
          from: fromSquare,
          to: toSquare,
          promotion,
        });

        if (!gameState.currentCard) {
          console.error("Current Card is not selected");
          return false;
        }

        updateMove(gameState.currentCard, mv);
        return true;
      } catch (e) {
        console.error("Invalid move attempt:", e);
        return false;
      }
    },
    [gameState.currentCard, updateMove, gameState.isInCheck]
  );

  const handleSquareClick = useCallback(
    (square: Square, piece: any | null) => {
      if (gameState.gameOver || !gameState.currentCard) return;

      if (gameState.fromMoveSelected) {
        const validMovesForSelection = getValidMovesForCard(
          gameRef.current,
          gameState.fromMoveSelected,
          gameState.currentCard,
          gameState.currentPlayer
        );

        const found = validMovesForSelection.some(
          (m) => m.from === gameState.fromMoveSelected && m.to === square
        );
        if (found) {
          chessMakeMove(gameState.fromMoveSelected, square, "q");
          return;
        }
      }

      const clickedPiece = gameRef.current.get(square);
      const clickedColor = clickedPiece
        ? clickedPiece.color === "w"
          ? "white"
          : "black"
        : null;
      if (clickedPiece && clickedColor === gameState.currentPlayer) {
        setGameState((prev) => ({ ...prev, fromMoveSelected: square }));
        const moves = getValidMovesForCard(
          gameRef.current,
          square,
          gameState.currentCard,
          gameState.currentPlayer
        );
        setGameState((prev) => ({
          ...prev,
          fromMoveSelected: square,
          validMoves: moves,
        }));
      } else {
        setGameState((prev) => ({
          ...prev,
          fromMoveSelected: null,
          validMoves: [],
        }));
      }
    },
    [
      gameState.fromMoveSelected,
      gameState.currentCard,
      gameState.currentPlayer,
      gameState.gameOver,
      chessMakeMove,
    ]
  );

  const onDrop = useCallback(
    (fromSquare: Square, toSquare: Square) => {
      if (!gameState.currentCard || gameState.gameOver) return false;
      try {
        const validMovesForSelection = getValidMovesForCard(
          gameRef.current,
          fromSquare,
          gameState.currentCard,
          gameState.currentPlayer
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
    [
      gameState.currentCard,
      gameState.gameOver,
      chessMakeMove,
      gameState.currentPlayer,
    ]
  );

  useEffect(() => {
    if (!gameId) return;

    const pollForUpdates = async () => {
      try {
        const response = await ChessAPI.getGame(gameId);
        const latestGame = response.data.data;

        // Update local game state from backend
        if (
          latestGame.game_state.fen &&
          latestGame.game_state.fen !== gameRef.current.fen()
        ) {
          console.log("FEN changed, updating local state");
          gameRef.current.load(latestGame.game_state.fen);

          if (gameRef.current.isCheck()) {
            setGameState((prev) => ({ ...prev, isInCheck: true }));
          } else {
            setGameState((prev) => ({ ...prev, isInCheck: false }));
          }
        }

        // Update turn state
        if (latestGame.game_state.turn !== gameState.currentPlayer) {
          console.log(
            "Turn changed from",
            gameState.currentPlayer,
            "to",
            latestGame.game_state.turn
          );
          setGameState((prev) => ({
            ...prev,
            currentPlayer: latestGame.game_state.turn,
          }));
        }

        // Update card state
        const backendCard = latestGame.game_state.current_card;
        if (
          JSON.stringify(backendCard) !== JSON.stringify(gameState.currentCard)
        ) {
          console.log("Card changed, updating local state");
          setGameState((prev) => ({
            ...prev,
            currentCard: backendCard || null,
          }));
          if (backendCard) {
            const moves = getAnyValidMoveForSelectedCard(
              gameRef.current,
              backendCard
            );
            setGameState((prev) => ({ ...prev, fromMoveSelected: null }));
            setGameState((prev) => ({ ...prev, validMoves: moves }));
          } else {
            setGameState((prev) => ({ ...prev, validMoves: [] }));
          }
        }

        if (
          JSON.stringify(latestGame.game_state.cards_deck) !==
          JSON.stringify(gameState.deck)
        ) {
          setGameState((prev) => ({
            ...prev,
            deck: latestGame.game_state.cards_deck || [],
          }));
        }

        if (latestGame.game_state.check_attempts !== gameState.checkAttempts) {
          setGameState((prev) => ({
            ...prev,
            checkAttempts: latestGame.game_state.check_attempts || 0,
          }));
        }
      } catch (err) {
        console.error("Error polling for game updates:", err);
      }
    };

    // Poll for updates every 2 seconds (reduced from 3)
    const intervalId = setInterval(pollForUpdates, 2000);
    return () => clearInterval(intervalId);
  }, [
    gameId,
    gameState.currentPlayer,
    gameState.currentCard,
    gameState.deck,
    gameState.gameOver,
    gameState.winner,
    gameState.checkAttempts,
  ]);

  useEffect(() => {
    const canDraw =
      gameState.userColor === gameState.currentPlayer &&
      (!gameState.currentCard ||
        gameState.noValidCard) &&
      !gameState.gameOver;
    setGameState((prev) => ({ ...prev, canDrawCard: canDraw }));
  }, [
    gameState.currentPlayer,
    gameState.userColor,
    gameState.currentCard,
    gameState.noValidCard,
    gameState.isInCheck,
    gameState.gameOver,
  ]);

  const newGame = () => {
    clearGameState();
    const shuffledDeck = shuffleDeck(createDeck());
    setGameState({
      deck: shuffledDeck,
      currentCard: null,
      currentPlayer: "white",
      userColor: "white",
      checkAttempts: 0,
      gameOver: false,
      winner: null,
      fromMoveSelected: null,
      validMoves: [],
      moveHistory: [],
      noValidCard: false,
      isInCheck: false,
      canDrawCard: true,
      cardsRemaining: shuffledDeck.length,
    });
  };

  return {
    game: gameRef.current,
    gameState,
    drawCard,
    handleSquareClick,
    onDrop,
    reshuffleDeck,
    // newGame,
    isInCheck: gameRef.current.isCheck(),
  } as const;
}
