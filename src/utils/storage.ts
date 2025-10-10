import { PlayingCard } from "../types/game";
import { MoveHistory } from "./deckUtils";

export const GAME_STATE_KEY = 'card_chess_game_state';

type StoredGameState = {
  fen: string;
  deck: PlayingCard[];
  currentPlayer: 'white' | 'black';
  checkAttempts: number;
  currentCard: PlayingCard | null;
  moveHistory: MoveHistory[];
};

export const saveGameState = (
  fen: string,
  deck: PlayingCard[],
  currentPlayer: 'white' | 'black',
  currentCard: PlayingCard | null,
  checkAttempts: number,
  moveHistory: MoveHistory[]
) => {
  const gameState: StoredGameState = {
    fen,
    deck: deck,
    currentPlayer,
    currentCard,
    checkAttempts,
    moveHistory
  };
  localStorage.setItem(GAME_STATE_KEY, JSON.stringify(gameState));};

export const loadGameState = (): StoredGameState | null => {
  const saved = localStorage.getItem(GAME_STATE_KEY);
  return saved ? JSON.parse(saved) : null;
};

export const clearGameState = () => {
  localStorage.removeItem(GAME_STATE_KEY);
};
