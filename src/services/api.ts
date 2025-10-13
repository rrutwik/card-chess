import axios, { AxiosResponse, AxiosError } from 'axios';
import type { User } from '../contexts/AuthContext';
import { useAppStore } from '../stores/appStore';
import { MoveHistory, PlayingCard } from '../types/game';

export interface LoginResponse {
  sessionToken: string;
  refreshToken: string;
  user: User;
}

export interface GoogleLoginRequest {
  credential: string;
  language?: string;
}

// Chess API Types
export interface ApiResponse<T = any> {
  message: string;
  data: T;
}

export interface ChessGame {
  _id?: string;
  game_id: string;
  player_white: string;
  player_black: string;
  game_state: {
    fen: string;
    pgn?: string;
    turn: 'white' | 'black';
    status: 'active' | 'completed' | 'abandoned';
    winner?: 'white' | 'black' | 'draw';
    moves: MoveHistory[];
    check_attempts?: number;
    current_card?: PlayingCard;
    cards_deck?: PlayingCard[];
  };
  created_at?: string;
  updated_at?: string;
  completed_at?: string;
}

export interface CreateGameRequest {
  opponentId: string;
}

export interface UpdateGameStateRequest {
  fen?: string;
  pgn?: string;
  turn?: 'white' | 'black';
  status?: 'active' | 'completed' | 'abandoned';
  winner?: 'white' | 'black' | 'draw';
  moves?: MoveHistory[];
  current_card: PlayingCard | null;
  cards_deck?: PlayingCard[];
  check_attempts?: number;
  is_in_check?: boolean;
  player_black?: string;
}

export interface EndGameRequest {
  winner: 'white' | 'black' | 'draw';
}

// Enhanced error class for better error handling
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Extend AxiosRequestConfig to include retry count
declare module 'axios' {
  interface AxiosRequestConfig {
    retryCount?: number;
  }
}

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000,
  retryableStatuses: [408, 429, 500, 502, 503, 504],
};

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 2000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors and retries
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const { config, response } = error;

    // Don't retry if request was cancelled or if it's not a retryable error
    if (!config || axios.isCancel(error) || !response) {
      return Promise.reject(error);
    }

    const { status } = response;
    const isRetryable = RETRY_CONFIG.retryableStatuses.includes(status);

    // If it's a retryable error and we haven't exceeded max retries
    if (isRetryable && (config.retryCount || 0) < RETRY_CONFIG.maxRetries) {
      config.retryCount = (config.retryCount || 0) + 1;

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, RETRY_CONFIG.retryDelay * (config.retryCount || 1)));

      return api(config);
    }

    // Handle unauthorized access - redirect to login or clear token
    if (status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');

      // Show notification about authentication error
      const appStore = useAppStore.getState();
      appStore.addNotification({
        type: 'error',
        title: 'Authentication Error',
        message: 'Your session has expired. Please log in again.',
        duration: 5000,
      });

      console.warn('Unauthorized access - token cleared');
    }

    // Convert to custom ApiError
    const apiError = new ApiError(
      (response.data as any)?.message || error.message || 'An unexpected error occurred',
      status,
      (response.data as any)?.code,
      response.data
    );

    return Promise.reject(apiError);
  }
);

// Helper function to add retry count to config
const withRetryConfig = (config: any) => ({
  ...config,
  retryCount: 0,
});

// Authentication API functions with enhanced error handling
export const loginWithGoogle = async (data: GoogleLoginRequest): Promise<AxiosResponse<{ data: LoginResponse }>> => {
  try {
    const response = await api.post<{ data: LoginResponse }>('/auth/google_login', data);

    // Store token in localStorage
    if (response.data?.data?.sessionToken) {
      localStorage.setItem('authToken', response.data.data.sessionToken);
      localStorage.setItem('refreshToken', response.data.data.refreshToken);
      localStorage.setItem('userData', JSON.stringify(response.data.data.user));
    }

    return response;
  } catch (error) {
    console.error('Google login failed:', error);
    throw error;
  }
};

export const getUserDetails = async (includeProfile: boolean = false): Promise<User> => {
  try {
    const response = await api.get<{data: User}>(`/auth/me${includeProfile ? '?includeProfile=true' : ''}`);
    return response.data.data;
  } catch (error) {
    console.error('Failed to get user details:', error);
    throw error;
  }
};

// Chess API functions with enhanced error handling and loading states
export class ChessAPI {
  // Create a new chess game
  static async createGame(color: string): Promise<AxiosResponse<ApiResponse<ChessGame>>> {
    try {
      const appStore = useAppStore.getState();
      appStore.setLoading(true, 'Creating game...');

      const response = await api.post<ApiResponse<ChessGame>>('/chess/create', { color });

      appStore.setLoading(false);
      appStore.addNotification({
        type: 'success',
        title: 'Game Created',
        message: 'New game created successfully!',
        duration: 3000,
      });

      return response;
    } catch (error) {
      const appStore = useAppStore.getState();
      appStore.setLoading(false);

      if (error instanceof ApiError) {
        appStore.addNotification({
          type: 'error',
          title: 'Failed to create game',
          message: error.message,
          duration: 5000,
        });
      }

      throw error;
    }
  }

  // Get a specific game
  static async getGame(gameId: string): Promise<AxiosResponse<ApiResponse<ChessGame>>> {
    try {
      const appStore = useAppStore.getState();
      appStore.setLoading(true, 'Loading game...');

      const response = await api.get<ApiResponse<ChessGame>>(`/chess/game/${gameId}`);

      appStore.setLoading(false);
      return response;
    } catch (error) {
      const appStore = useAppStore.getState();
      appStore.setLoading(false);

      if (error instanceof ApiError) {
        appStore.addNotification({
          type: 'error',
          title: 'Failed to load game',
          message: error.message,
          duration: 5000,
        });
      }

      throw error;
    }
  }

  // Get all active games for the current player
  static async getActiveGames(): Promise<AxiosResponse<ApiResponse<ChessGame[]>>> {
    try {
      const appStore = useAppStore.getState();
      appStore.setLoading(true, 'Loading games...');

      const response = await api.get<ApiResponse<ChessGame[]>>('/chess/active');

      appStore.setLoading(false);
      return response;
    } catch (error) {
      const appStore = useAppStore.getState();
      appStore.setLoading(false);

      if (error instanceof ApiError) {
        appStore.addNotification({
          type: 'error',
          title: 'Failed to load games',
          message: error.message,
          duration: 5000,
        });
      }

      throw error;
    }
  }

  static async joinGame(gameId: string): Promise<AxiosResponse<ApiResponse<ChessGame>>> {
    try {
      const appStore = useAppStore.getState();
      appStore.setLoading(true, 'Joining game...');

      const response = await api.put<ApiResponse<ChessGame>>(`/chess/game/${gameId}/join`);

      appStore.setLoading(false);
      return response;
    } catch (error) {
      const appStore = useAppStore.getState();
      appStore.setLoading(false);

      if (error instanceof ApiError) {
        appStore.addNotification({
          type: 'error',
          title: 'Failed to join game',
          message: error.message,
          duration: 5000,
        });
      }

      throw error;
    }
  }

  static async updateGameState(gameId: string, gameState: UpdateGameStateRequest): Promise<AxiosResponse<ApiResponse<ChessGame>>> {
    try {
      const response = await api.put<ApiResponse<ChessGame>>(`/chess/game/${gameId}/state`, gameState);
      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        const appStore = useAppStore.getState();
        appStore.addNotification({
          type: 'error',
          title: 'Failed to update game',
          message: error.message,
          duration: 3000,
        });
      }
      throw error;
    }
  }

  // End a game
  static async endGame(gameId: string, winner: 'white' | 'black' | 'draw'): Promise<AxiosResponse<ApiResponse<ChessGame>>> {
    try {
      const appStore = useAppStore.getState();
      appStore.setLoading(true, 'Ending game...');

      const response = await api.put<ApiResponse<ChessGame>>(`/chess/game/${gameId}/end`, { winner });

      appStore.setLoading(false);
      appStore.addNotification({
        type: 'success',
        title: 'Game Ended',
        message: 'Game completed successfully!',
        duration: 3000,
      });

      return response;
    } catch (error) {
      const appStore = useAppStore.getState();
      appStore.setLoading(false);

      if (error instanceof ApiError) {
        appStore.addNotification({
          type: 'error',
          title: 'Failed to end game',
          message: error.message,
          duration: 5000,
        });
      }

      throw error;
    }
  }

  // Abandon a game
  static async abandonGame(gameId: string): Promise<AxiosResponse<ApiResponse<ChessGame>>> {
    try {
      const appStore = useAppStore.getState();
      appStore.setLoading(true, 'Abandoning game...');

      const response = await api.put<ApiResponse<ChessGame>>(`/chess/game/${gameId}/abandon`);

      appStore.setLoading(false);
      appStore.addNotification({
        type: 'success',
        title: 'Game Abandoned',
        message: 'Game abandoned successfully',
        duration: 3000,
      });

      return response;
    } catch (error) {
      const appStore = useAppStore.getState();
      appStore.setLoading(false);

      if (error instanceof ApiError) {
        appStore.addNotification({
          type: 'error',
          title: 'Failed to abandon game',
          message: error.message,
          duration: 5000,
        });
      }

      throw error;
    }
  }

  // Get game history for the current player
  static async getGameHistory(limit: number = 10): Promise<AxiosResponse<ApiResponse<ChessGame[]>>> {
    try {
      const appStore = useAppStore.getState();
      appStore.setLoading(true, 'Loading history...');

      const response = await api.get<ApiResponse<ChessGame[]>>(`/chess/history?limit=${limit}`);

      appStore.setLoading(false);
      return response;
    } catch (error) {
      const appStore = useAppStore.getState();
      appStore.setLoading(false);

      if (error instanceof ApiError) {
        appStore.addNotification({
          type: 'error',
          title: 'Failed to load history',
          message: error.message,
          duration: 5000,
        });
      }

      throw error;
    }
  }
}

// Export the configured axios instance for custom requests
export { api };
