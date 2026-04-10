import { useCallback, useEffect, useRef, useState } from "react";
import { Chess, Move, Square } from "chess.js";
import { MoveHistory, PlayingCard } from "../types/game";
import { createDeck, shuffleDeck } from "../utils/deckUtils";
import { CardChessMap } from "../constants/chess";
import { ChessAPI, ChessGame } from "../services/api";
import { useChessSocket } from "./useChessSocket";
import { CardChessMove, getBestMove } from "../utils/bot";

export const MAX_CHECK_ATTEMPTS = 5;

const DEFAULT_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export interface GameState {
  deck: PlayingCard[];
  currentCards: PlayingCard[]; // Array of multiple cards
  cardsToDrawCount: number; // How many cards to draw (1-5)
  currentPlayer: "white" | "black";
  userColor: "white" | "black";
  isPlayerInGame: boolean;
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
  gameStatus?: "active" | "completed" | "abandoned" | "waiting_for_opponent";
  version: number;
  pendingPromotion: {
    fromSquare: Square;
    toSquare: Square;
    card: PlayingCard;
  } | null;
}

interface UseCardChessOptions {
  userId?: string;
  onGameUpdate?: (
    fen: string,
    currentPlayer: string,
    currentCard: PlayingCard | null
  ) => void;
  onGameStateChanged: (game: ChessGame) => void;
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
    const file = fromSquare[0] as keyof typeof CardChessMap;
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

function getValidMovesForMultipleCards(game: Chess, cards: PlayingCard[]): CardChessMove[] {
  if (!cards || cards.length === 0) return [];
  const allMoves = game.moves({ verbose: true }) as Move[];
  const validMovesMap = new Map<string, CardChessMove>();
  for (const card of cards) {
    const movesForCard = allMoves.filter((move) => {
      if (!move) return false;
      const sideToMove = game.turn();
      if (move.color !== sideToMove) return false;
      return checkMove(move, card);
    });
    movesForCard.forEach((move) => {
      const botMove = { ...move, card } as CardChessMove;
      validMovesMap.set(`${move.from}${move.to}`, botMove);
    });
  }
  return Array.from(validMovesMap.values());
}

export function useCardChess(
  game: ChessGame | null,
  options: UseCardChessOptions
) {
  const { userId } = options;
  const gameId = game?.game_id;

  const gameRef = useRef(new Chess(game?.game_state?.fen || undefined));
  // Ref to track version without depending on full gameState in callbacks
  const versionRef = useRef(game?.version || 0);
  const [gameState, setGameState] = useState<GameState>(() => ({
    deck: game?.game_state?.cards_deck || createDeck(),
    currentCards: game?.game_state?.current_cards || [],
    cardsToDrawCount: game?.cards_to_draw || 1,
    currentPlayer: "white",
    userColor: "white",
    isPlayerInGame: game
      ? game.player_white === userId || game.player_black === userId
      : false,
    checkAttempts: 0,
    gameOver: false,
    winner: null,
    fromMoveSelected: null,
    validMoves: [],
    moveHistory: [],
    noValidCard: false,
    isInCheck: false,
    canDrawCard: game?.game_state?.status === "active",
    gameStatus: game?.game_state?.status || "active",
    cardsRemaining: (game?.game_state?.cards_deck || createDeck()).length,
    version: game?.version || 0,
    pendingPromotion: null,
  }));

  useEffect(() => {
    if (game) {
      const newGameVersion = game.version;

      gameRef.current.load(game.game_state.fen);
      const isPlayerInGame =
        game.player_white === userId || game.player_black === userId;
      const isInCheck = gameRef.current.inCheck();
      let moves: Move[] = [];
      if (game.game_state.current_cards && game.game_state.current_cards.length > 0) {
        // Get valid moves for ANY of the current cards
        moves = getValidMovesForMultipleCards(
          gameRef.current,
          game.game_state.current_cards
        );
      }
      setGameState((prev) => ({
        ...prev,
        currentPlayer: game.game_state.turn,
        deck: game.game_state.cards_deck || [],
        moveHistory: game.game_state.moves || [],
        gameOver: game.game_state.status === "completed",
        winner: game.game_state.winner || null,
        checkAttempts: game.game_state.check_attempts || 0,
        fromMoveSelected: null,
        isInCheck: isInCheck,
        gameStatus: game.game_state.status,
        version: newGameVersion,
        userColor: game.player_white === userId ? "white" : "black",
        isPlayerInGame,
        currentCards: game.game_state.current_cards || [],
        cardsToDrawCount: game.cards_to_draw || 1,
        cardsRemaining: (game.game_state.cards_deck || []).length,
        validMoves: moves,
        pendingPromotion: null,
      }));
      versionRef.current = newGameVersion;
    }
  }, [game, userId]);

  // Sync game state with backend
  const syncWithBackend = useCallback(
    async (
      fen: string,
      turn: "white" | "black",
      current_cards: PlayingCard[] | null,
      cards_deck: PlayingCard[] | null,
      check_attempts: number,
      moves: MoveHistory[],
      currentVersion: number,
      status: "active" | "completed" | "abandoned",
      winner: "white" | "black" | "draw" | undefined = undefined
    ): Promise<void> => {
      if (!gameId || !userId) return;

      try {
        const response = await ChessAPI.updateGameState(
          gameId,
          {
            fen,
            turn,
            current_cards,
            cards_deck: cards_deck == null ? undefined : cards_deck,
            check_attempts,
            moves,
            status,
            winner,
          },
          currentVersion
        );
        const responseGame = response.data.data;
        if (responseGame.version > versionRef.current) {
          console.log("Sync with backend", responseGame.version, versionRef.current);
          versionRef.current = responseGame.version;
          const backendCards = responseGame.game_state.current_cards || [];
          gameRef.current.load(responseGame.game_state.fen);
          let moves = [] as Move[];
          if (backendCards.length > 0) {
            moves = getValidMovesForMultipleCards(
              gameRef.current,
              backendCards
            );
          }
          setGameState((prev) => ({
            ...prev,
            version: responseGame.version,
            isInCheck: gameRef.current.inCheck(),
            currentPlayer: responseGame.game_state.turn,
            moveHistory: responseGame.game_state.moves || [],
            currentCards: backendCards,
            fromMoveSelected: null,
            validMoves: moves,
            deck: responseGame.game_state.cards_deck || [],
            cardsRemaining: (responseGame.game_state.cards_deck || []).length,
            checkAttempts: responseGame.game_state.check_attempts || 0,
            gameStatus: responseGame.game_state.status,
            gameOver: responseGame.game_state.status === "completed",
            pendingPromotion: null,
          }));
        }
      } catch (error) {
        console.error("Failed to sync with backend:", error);
      }
    },
    [gameId, userId]
  );

  useEffect(() => {
    if (
      gameState.currentCards && gameState.currentCards.length > 0
    ) {
      const moves = getValidMovesForMultipleCards(
        gameRef.current,
        gameState.currentCards
      );
      setGameState((prev) => ({
        ...prev,
        validMoves: moves,
        noValidCard: moves.length === 0,
      }));
    }
  }, [gameState.currentCards, gameState.userColor, gameState.currentPlayer]);

  useEffect(() => {
    if (gameState.deck.length < 10) {
      const shuffled = shuffleDeck(createDeck());
      setGameState((prev) => ({ ...prev, deck: [...prev.deck, ...shuffled] }));
    }
  }, [gameState.deck]);

  // Helper function to check if any of the drawn cards allow valid moves
  const checkForValidMoves = useCallback(
    (cards: PlayingCard[], player: "white" | "black") => {
      const game = gameRef.current;
      const pieces = game
        .board()
        .flat()
        .filter(
          (piece) => piece && piece.color === (player === "white" ? "w" : "b")
        );

      // Check if ANY piece can make a move with ANY of the cards
      for (const piece of pieces) {
        if (piece && piece.square) {
          for (const card of cards) {
            const moves = getValidMovesForCard(game, piece.square, card, player);
            if (moves.length > 0) {
              return true;
            }
          }
        }
      }
      return false;
    },
    []
  );

  const drawCard = useCallback(() => {
    if (gameState.gameOver) return;
    if (gameState.deck.length < gameState.cardsToDrawCount) return;

    const newDeck = [...gameState.deck];
    const drawnCards: PlayingCard[] = [];

    // Draw X cards
    for (let i = 0; i < gameState.cardsToDrawCount; i++) {
      const card = newDeck.pop();
      if (card) {
        drawnCards.push(card);
      }
    }

    if (drawnCards.length > 0) {
      setGameState((prev) => ({ ...prev, currentCards: drawnCards, deck: newDeck, cardsRemaining: newDeck.length }));

      const hasValidMoves = checkForValidMoves(drawnCards, gameState.currentPlayer);
      let newAttempts = gameState.checkAttempts;
      let newMoveHistory = [...gameState.moveHistory];
      let winner: "white" | "black" | "draw" | null = null;

      if (!hasValidMoves) {
        setGameState((prev) => ({ ...prev, noValidCard: true }));
        newMoveHistory = [
          ...newMoveHistory,
          {
            cards: drawnCards,
            usedCard: drawnCards[0],
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
        drawnCards,
        newDeck,
        newAttempts,
        newMoveHistory,
        gameState.version,
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
    gameState.version,
    gameState.cardsToDrawCount,
    syncWithBackend,
    checkForValidMoves,
  ]);

  const reshuffleDeck = useCallback(() => {
    const newDeck = shuffleDeck(createDeck());
    setGameState((prev) => ({ ...prev, deck: newDeck, cardsRemaining: newDeck.length, checkAttempts: 0 }));
  }, []);

  const updateMove = useCallback(
    (usedCard: PlayingCard, move: Move) => {
      if (gameState.gameOver) return;

      const newMoveHistory = [
        ...gameState.moveHistory,
        {
          move: {
            from: move.from,
            to: move.to,
            piece: move.piece,
          },
          cards: gameState.currentCards,
          usedCard: usedCard,
          player: gameState.currentPlayer,
        },
      ];

      const nextPlayer = gameRef.current.turn() === "w" ? "white" : "black";
      const opponentInCheck = gameRef.current.inCheck();
      let gameOver = false;
      let winner: "white" | "black" | "draw" | null = null;

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

      // Single batched state update
      setGameState((prev) => ({
        ...prev,
        checkAttempts: 0,
        fromMoveSelected: null,
        validMoves: [],
        currentCards: [],
        moveHistory: newMoveHistory,
        isInCheck: opponentInCheck,
        currentPlayer: nextPlayer,
        gameOver,
        winner,
        pendingPromotion: null,
      }));

      syncWithBackend(
        gameRef.current.fen(),
        nextPlayer,
        null,
        null,
        0,
        newMoveHistory,
        gameState.version,
        gameOver ? "completed" : "active",
        winner || undefined
      );
    },
    [
      gameState.currentPlayer,
      gameState.gameOver,
      gameState.version,
      gameState.moveHistory,
      syncWithBackend,
    ]
  );

  const chessMakeMove = useCallback(
    (fromSquare: Square, toSquare: Square, promotion: string, usedCard: PlayingCard) => {
      try {
        const mv = gameRef.current.move({
          from: fromSquare,
          to: toSquare,
          promotion,
        });

        if (!gameState.currentCards || gameState.currentCards.length === 0) {
          console.error("No current cards selected");
          return false;
        }

        updateMove(usedCard, mv);
        return true;
      } catch (e) {
        console.error("Invalid move attempt:", e);
        return false;
      }
    },
    [gameState.currentCards, updateMove, gameState.isInCheck]
  );

  const handleSquareClick = useCallback(
    (square: Square, piece: any | null) => {
      if (gameState.gameOver || !gameState.currentCards || gameState.currentCards.length === 0) return;

      if (gameState.fromMoveSelected) {
        // Find which card allows this move
        let validCard: PlayingCard | null = null;
        let selectedMoves: Move[] = [];

        for (const card of gameState.currentCards) {
          const validMovesForSelection = getValidMovesForCard(
            gameRef.current,
            gameState.fromMoveSelected,
            card,
            gameState.currentPlayer
          );

          const found = validMovesForSelection.some(
            (m) => m.from === gameState.fromMoveSelected && m.to === square
          );
          if (found) {
            validCard = card;
            selectedMoves = validMovesForSelection;
            break;
          }
        }

        if (validCard) {
          const isPromotion = selectedMoves.some(
            (m) => m.from === gameState.fromMoveSelected && m.to === square && m.promotion
          );
          if (isPromotion) {
            setGameState((prev) => ({
              ...prev,
              pendingPromotion: {
                fromSquare: gameState.fromMoveSelected as Square,
                toSquare: square as Square,
                card: validCard as PlayingCard,
              },
            }));
            return;
          }
          chessMakeMove(gameState.fromMoveSelected, square, "q", validCard);
          return;
        } else {
          const moves = getValidMovesForMultipleCards(
            gameRef.current,
            gameState.currentCards
          );
          setGameState((prev) => ({
            ...prev,
            fromMoveSelected: null,
            validMoves: moves,
          }));
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
        const moves = getValidMovesForMultipleCards(
          gameRef.current,
          gameState.currentCards
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
      gameState.currentCards,
      gameState.currentPlayer,
      gameState.gameOver,
      chessMakeMove,
    ]
  );

  const onDrop = useCallback(
    (fromSquare: Square, toSquare: Square) => {
      if (!gameState.currentCards || gameState.currentCards.length === 0 || gameState.gameOver) return false;

      try {
        // Find which card allows this move
        for (const card of gameState.currentCards) {
          const validMovesForSelection = getValidMovesForCard(
            gameRef.current,
            fromSquare,
            card,
            gameState.currentPlayer
          );

          const found = validMovesForSelection.some(
            (m) => m.from === fromSquare && m.to === toSquare
          );

          if (found) {
            const isPromotion = validMovesForSelection.some(
              (m) => m.from === fromSquare && m.to === toSquare && m.promotion
            );
            if (isPromotion) {
              setGameState((prev) => ({
                ...prev,
                pendingPromotion: {
                  fromSquare,
                  toSquare,
                  card,
                },
              }));
              return true;
            }
            return chessMakeMove(fromSquare, toSquare, "q", card);
          }
        }

        return false;
      } catch (err) {
        console.error("Invalid drop move:", err);
        return false;
      }
    },
    [
      gameState.currentCards,
      gameState.gameOver,
      chessMakeMove,
      gameState.currentPlayer,
    ]
  );

  const playSmartValidMove = useCallback(async (possibleMoves: CardChessMove[]) => {
    if (
      !gameState.currentCards ||
      gameState.currentCards.length === 0 ||
      gameState.gameOver
    ) return false;

    if (!possibleMoves.length) return false;

    const bestMove = getBestMove(gameRef.current, possibleMoves);

    if (bestMove) {
      return chessMakeMove(bestMove.from, bestMove.to, bestMove.promotion || "q", bestMove.card);
    }
    return false;
  }, [
    gameState.currentCards,
    gameState.gameOver,
    gameState.currentPlayer,
    chessMakeMove,
  ]);

  const playRandomValidMove = useCallback(async () => {
    if (!gameState.currentCards || gameState.currentCards.length === 0 || gameState.gameOver) return false;

    const possibleMoves = getValidMovesForMultipleCards(
      gameRef.current,
      gameState.currentCards
    );

    if (possibleMoves.length === 0) return false;

    const isMoved = await playSmartValidMove(possibleMoves);
    if (isMoved) return true;
    const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];

    if (!randomMove.card) return false;
    return chessMakeMove(randomMove.from as Square, randomMove.to as Square, randomMove.promotion || "q", randomMove.card);
  }, [gameState.currentCards, gameState.gameOver, chessMakeMove, gameState.currentPlayer, playSmartValidMove]);

  const resolvePromotion = useCallback((piece: string) => {
    if (!gameState.pendingPromotion) return;
    const { fromSquare, toSquare, card } = gameState.pendingPromotion;
    chessMakeMove(fromSquare, toSquare, piece, card);
    setGameState((prev) => ({ ...prev, pendingPromotion: null, validMoves: [], fromMoveSelected: null }));
  }, [gameState.pendingPromotion, chessMakeMove]);

  const cancelPromotion = useCallback(() => {
    setGameState((prev) => ({ ...prev, pendingPromotion: null, fromMoveSelected: null }));
  }, []);

  const handleSocketUpdate = useCallback((updatedGame: ChessGame) => {
    const statusChanged = gameState.gameStatus !== updatedGame.game_state.status;
    if (updatedGame.version <= versionRef.current && !statusChanged) return;
    console.log("Socket Update", updatedGame.version, versionRef.current);
    versionRef.current = updatedGame.version;

    const backendCards = updatedGame.game_state.current_cards || [];

    gameRef.current.load(updatedGame.game_state.fen);

    let moves: Move[] = [];
    if (backendCards.length > 0) {
      moves = getValidMovesForMultipleCards(
        gameRef.current,
        backendCards
      );
    }

    setGameState((prev) => ({
      ...prev,
      version: updatedGame.version,
      isInCheck: gameRef.current.inCheck(),
      currentPlayer: updatedGame.game_state.turn,
      moveHistory: updatedGame.game_state.moves || [],
      currentCards: backendCards,
      fromMoveSelected: null,
      validMoves: moves,
      deck: updatedGame.game_state.cards_deck || [],
      cardsRemaining: (updatedGame.game_state.cards_deck || []).length,
      checkAttempts: updatedGame.game_state.check_attempts || 0,
      gameStatus: updatedGame.game_state.status,
      gameOver: updatedGame.game_state.status === "completed",
      winner: updatedGame.game_state.winner || null,
      pendingPromotion: null,
    }));

    options.onGameStateChanged?.(updatedGame);
  }, [options, gameState.gameStatus]);


  const chessSocket = useChessSocket({
    gameId,
    onGameUpdate: handleSocketUpdate
  });
  // useEffect(() => {
  //   if (!gameId || !userId) return;

  //   const pollForUpdates = async () => {
  //     try {
  //       const response = await ChessAPI.getGame(gameId);
  //       const latestGame = response.data.data;

  //       // Only update if version changed OR status changed
  //       const versionChanged = latestGame.version > versionRef.current;
  //       const statusChanged = gameState.gameStatus !== latestGame.game_state.status;

  //       if (versionChanged || statusChanged) {
  //         versionRef.current = latestGame.version;
  //         const backendCards = latestGame.game_state.current_cards || [];

  //         gameRef.current.load(latestGame.game_state.fen);
  //         let moves = [] as Move[];
  //         if (backendCards.length > 0) {
  //           moves = getValidMovesForMultipleCards(
  //             gameRef.current,
  //             backendCards
  //           );
  //         }

  //         // Update game state
  //         setGameState((prev) => ({
  //           ...prev,
  //           version: latestGame.version,
  //           isInCheck: gameRef.current.inCheck(),
  //           currentPlayer: latestGame.game_state.turn,
  //           moveHistory: latestGame.game_state.moves || [],
  //           currentCards: backendCards,
  //           fromMoveSelected: null,
  //           validMoves: moves,
  //           deck: latestGame.game_state.cards_deck || [],
  //           cardsRemaining: (latestGame.game_state.cards_deck || []).length,
  //           checkAttempts: latestGame.game_state.check_attempts || 0,
  //           gameStatus: latestGame.game_state.status,
  //           gameOver: latestGame.game_state.status === "completed",
  //         }));

  //         // Notify parent component if status changed (e.g., opponent joined)
  //         if (statusChanged) {
  //           options.onGameStateChanged(latestGame);
  //         }
  //       }
  //     } catch (error) {
  //       console.error("Error polling for game updates:", error);
  //     }
  //   };

  //   let intervalId = null as unknown as NodeJS.Timeout;
  //   if (gameState.gameStatus === "waiting_for_opponent" || gameState.gameStatus === "active") {
  //     intervalId = setInterval(pollForUpdates, 2000);
  //   }
  //   return () => {
  //     if (intervalId) {
  //       clearInterval(intervalId);
  //     }
  //   };
  // }, [gameId, userId, gameState.gameStatus, options]);

  useEffect(() => {
    const canDraw =
      gameState.isPlayerInGame &&
      gameState.userColor === gameState.currentPlayer &&
      (gameState.currentCards.length === 0 || gameState.noValidCard) &&
      !gameState.gameOver &&
      gameState.gameStatus === "active";
    setGameState((prev) => ({ ...prev, canDrawCard: canDraw }));
  }, [
    gameState.currentPlayer,
    gameState.userColor,
    gameState.isPlayerInGame,
    gameState.currentCards,
    gameState.noValidCard,
    gameState.gameOver,
    gameState.gameStatus,
  ]);

  return {
    game: gameRef.current,
    gameState,
    drawCard,
    handleSquareClick,
    onDrop,
    playRandomValidMove,
    reshuffleDeck,
    // newGame,
    isInCheck: gameRef.current.inCheck(),
    resolvePromotion,
    cancelPromotion
  } as const;
}
