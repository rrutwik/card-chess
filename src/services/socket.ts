// services/socket.ts
import { io, Socket } from "socket.io-client";
import { ChessGame } from "./api";

const API_BASE_URL =
  (import.meta as any).env?.VITE_API_BASE_URL ||
  "https://backend-api.techkarmic.com";

export class ChessSocket {
  private socket: Socket;

  constructor(token?: string, guestToken?: string) {
    console.log("🔌 Initializing ChessSocket with:", 
        token ? { token: "****" } : undefined, 
        guestToken ? { guestToken: "****" } : undefined);
    this.socket = io(API_BASE_URL, {
      auth: { "x-guest-token": `${guestToken}`, "Authorization": `Bearer ${token}` },
      extraHeaders: { "x-guest-token": `${guestToken}`, "Authorization": `Bearer ${token}` },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      autoConnect: false,
    });
    
    this.socket.on("connect", () => {
      console.log("✅ Socket connected:", this.socket.id);
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
    this.socket.emit("join_game", { gameId });
  }

  leaveGame(gameId: string) {
    this.socket.emit("leave_game", { gameId });
  }

  onGameState(callback: (data: ChessGame) => void) {
    this.socket.on("game_updated", (data: {gameId: string, data: ChessGame}) => {
      console.log(`📨 Received game update for gameId ${data.gameId}:`, data.data);
      callback(data.data);
    });
  }

  offGameState(callback: (data: ChessGame) => void) {
    this.socket.off("game_updated", callback);
  }

  reconnectJoin(gameId: string) {
    this.socket.on("connect", () => {
      this.joinGame(gameId);
    });
  }

  disconnect() {
    if (!this.socket.disconnected) {
        this.socket.disconnect();
    }
  }
}