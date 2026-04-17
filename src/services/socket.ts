import { io, Socket } from "socket.io-client";
import { ChessGame, UpdateGameStateRequest } from "./api";

const API_BASE_URL =
  (import.meta as unknown as { env?: { VITE_API_BASE_URL?: string } }).env?.VITE_API_BASE_URL ||
  "https://backend-api.techkarmic.com";

export class ChessSocket {
  private socket: Socket;
  private gameUpdateHandler?: (data: { gameId: string; data: ChessGame }) => void;
  private currentGameId?: string;

  constructor(token?: string, guestToken?: string) {
    this.socket = io(API_BASE_URL, {
      auth: {
        "x-guest-token": `${guestToken}`,
        Authorization: `Bearer ${token}`,
      },
      extraHeaders: {
        "x-guest-token": `${guestToken}`,
        Authorization: `Bearer ${token}`,
      },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      autoConnect: false,
    });

    this.socket.on("connect", () => {
      console.log("✅ Socket connected:", this.socket.id);

      // Rejoin automatically on reconnect
      if (this.currentGameId) {
        this.joinGame(this.currentGameId);
      }
    });

    this.socket.on("disconnect", (reason) => {
      console.log("❌ Socket disconnected:", reason);
    });

    this.socket.on("connect_error", (err) => {
      console.error("🚨 Socket error:", err.message);
    });

    this.socket.connect();
  }

  joinGame(gameId: string) {
    this.currentGameId = gameId;
    this.socket.emit("join_game", { gameId });
  }

  leaveGame(gameId: string) {
    this.socket.emit("leave_game", { gameId });
    this.currentGameId = undefined;
  }

  updateGameState(gameId: string, version: number, gameState: UpdateGameStateRequest) {
    this.socket.emit("update_game_state", { gameId, version, game_state: gameState });
  }

  onGameState(callback: (data: ChessGame) => void) {
    this.gameUpdateHandler = (data: { gameId: string; data: ChessGame }) => {
      callback(data.data);
    };

    this.socket.on("game_updated", this.gameUpdateHandler);
  }

  offGameState() {
    if (this.gameUpdateHandler) {
      this.socket.off("game_updated", this.gameUpdateHandler);
      this.gameUpdateHandler = undefined;
    }
  }

  disconnect() {
    this.socket.removeAllListeners(); // 🔥 prevents ghost listeners
    if (!this.socket.disconnected) {
      this.socket.disconnect();
    }
  }
}