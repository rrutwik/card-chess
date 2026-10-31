import { io, Socket } from "socket.io-client";
import { ChessGame, UpdateGameStateRequest } from "./api";

const API_BASE_URL =
  (import.meta as unknown as { env?: { VITE_API_BASE_URL?: string } }).env?.VITE_API_BASE_URL ||
  "https://backend-api.techkarmic.com";

export class ChessSocket {
  private socket: Socket;
  private gameUpdateHandler?: (data: { gameId: string; data: ChessGame }) => void;
  private currentGameId?: string;
  private errorHandler?: (err: { message: string; gameId?: string }) => void;
  // Remember intent so we can restore it after a reconnect (a new connection is a new socket id
  // on the server: it has no queue entry and is not subscribed to the matchmaking count).
  private hasConnectedOnce = false;
  private wantsMatchmaking = false;
  private wantsMatchmakingCount = false;

  constructor(token?: string, guestToken?: string) {
    const authHeaders: Record<string, string> = {};
    if (guestToken && guestToken !== "null" && guestToken !== "undefined") {
      authHeaders["x-guest-token"] = guestToken;
    }
    if (token && token !== "null" && token !== "undefined") {
      authHeaders["Authorization"] = `Bearer ${token}`;
    }

    this.socket = io(API_BASE_URL, {
      auth: authHeaders,
      extraHeaders: authHeaders,
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      autoConnect: false,
    });

    this.socket.on("connect", () => {
      console.log("✅ Socket connected:", this.socket.id);
      if (this.currentGameId) {
        this.joinGame(this.currentGameId);
      }
      if (this.hasConnectedOnce) {
        if (this.wantsMatchmakingCount) this.socket.emit("get_matchmaking_count");
        if (this.wantsMatchmaking) this.socket.emit("join_matchmaking");
      }
      this.hasConnectedOnce = true;
    });

    this.socket.on("disconnect", (reason) => {
      console.log("❌ Socket disconnected:", reason);
    });

    this.socket.on("connect_error", (err) => {
      console.error("🚨 Socket error:", err.message);
    });

    this.socket.connect();
  }

  // ── Game ──────────────────────────────────────────────────────────────────

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

  /** Emit to backend — backend pops cards from its deck, saves, and broadcasts game_updated to the room */
  drawCard(gameId: string) {
    this.socket.emit("draw_card", { gameId });
  }

  /** Server rejected an action (stale version, illegal move, not your turn...). */
  onError(callback: (err: { message: string; gameId?: string }) => void) {
    this.errorHandler = callback;
    this.socket.on("error", callback);
  }

  offError() {
    if (this.errorHandler) {
      this.socket.off("error", this.errorHandler);
      this.errorHandler = undefined;
    }
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

  // ── Matchmaking ───────────────────────────────────────────────────────────

  joinMatchmaking() {
    this.wantsMatchmaking = true;
    this.socket.emit("join_matchmaking");
  }

  leaveMatchmaking() {
    this.wantsMatchmaking = false;
    this.socket.emit("leave_matchmaking");
  }

  requestMatchmakingCount() {
    this.wantsMatchmakingCount = true;
    this.socket.emit("get_matchmaking_count");
  }

  onMatchmakingFound(callback: (data: { gameId: string; color: "white" | "black" }) => void) {
    this.socket.on("matchmaking_found", (data) => {
      this.wantsMatchmaking = false;
      callback(data);
    });
  }

  onMatchmakingCount(callback: (data: { count: number }) => void) {
    this.socket.on("matchmaking_count", callback);
  }

  onMatchmakingQueued(callback: (data: { message: string }) => void) {
    this.socket.on("matchmaking_queued", callback);
  }

  onMatchmakingTimeout(callback: (data: { message: string }) => void) {
    this.socket.on("matchmaking_timeout", (data) => {
      this.wantsMatchmaking = false;
      callback(data);
    });
  }

  onMatchmakingCancelled(callback: () => void) {
    this.socket.on("matchmaking_cancelled", callback);
  }

  offMatchmaking() {
    this.socket.off("matchmaking_found");
    this.socket.off("matchmaking_count");
    this.socket.off("matchmaking_queued");
    this.socket.off("matchmaking_timeout");
    this.socket.off("matchmaking_cancelled");
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  disconnect() {
    this.socket.removeAllListeners();
    if (!this.socket.disconnected) {
      this.socket.disconnect();
    }
  }
}