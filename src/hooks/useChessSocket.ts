// hooks/useChessSocket.ts
import { useEffect, useRef } from "react";
import { ChessSocket } from "../services/socket";
import { getGuestToken } from "../utils/sessionIdentity";
import { ChessGame } from "../services/api";

interface Props {
  gameId?: string;
  onGameUpdate: (game: ChessGame) => void;
}

export function useChessSocket({
  gameId,
  onGameUpdate
}: Props) {
    
  const socketRef = useRef<ChessSocket | null>(null);

  useEffect(() => {
    if (!gameId || socketRef.current != null) return;
    const token = localStorage.getItem("authToken");
    const guestToken = getGuestToken();
    const socket = new ChessSocket(token ?? undefined, guestToken ?? undefined);
    socketRef.current = socket;

    // Join room
    socket.joinGame(gameId);

    // Rejoin on reconnect
    socket.reconnectJoin(gameId);

    // Listen for game updates
    socket.onGameState(onGameUpdate);

    return () => {
      socket.leaveGame(gameId);
      socket.offGameState(onGameUpdate);
      socket.disconnect();
    };
  }, [gameId, onGameUpdate]);

  return socketRef.current;
}