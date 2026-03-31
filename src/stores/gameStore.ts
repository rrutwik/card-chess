import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { ChessGame } from '../services/api';

interface GameState {
  // Current game data
  currentGame: ChessGame | null;

  // UI state
  showMoves: boolean;

  // Loading and error states
  isLoading: boolean;
  error: string | null;

  // Actions
  setCurrentGame: (game: ChessGame | null) => void;
  setShowMoves: (show: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  resetGameState: () => void;
}

export const useGameStore = create<GameState>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
        currentGame: null,
        showMoves: false,
        isLoading: false,
        error: null,

        // Actions
        setCurrentGame: (game: ChessGame | null) => {
          set({ currentGame: game }, false, 'setCurrentGame');
        },

        setShowMoves: (show: boolean) => {
          set({ showMoves: show }, false, 'setShowMoves');
        },

        setLoading: (loading: boolean) => {
          set({ isLoading: loading }, false, 'setLoading');
        },

        setError: (error: string | null) => {
          set({ error }, false, 'setError');
        },

        resetGameState: () => {
          set({
            currentGame: null,
            showMoves: false,
            isLoading: false,
            error: null,
          }, false, 'resetGameState');
        },
      }),
      {
        name: 'card-chess-game-state',
        partialize: (state) => ({
          // Don't persist UI state, only game data if needed
          showMoves: state.showMoves,
        }),
      }
    ),
    { name: 'GameStore' }
  )
);
