import { useEffect, useRef } from "react";
import { ChessSocket } from "../services/socket";
import { getGuestToken } from "../utils/sessionIdentity";
import { ChessGame } from "../services/api";

interface Props {
  gameId?: string;
  onGameUpdate: (game: ChessGame) => void;
}

export function useChessSocket({ gameId, onGameUpdate }: Props) {
  const socketRef = useRef<ChessSocket | null>(null);
  const callbackRef = useRef(onGameUpdate);

  // Always keep latest callback (prevents stale closure)
  useEffect(() => {
    callbackRef.current = onGameUpdate;
  }, [onGameUpdate]);

  useEffect(() => {
    if (!gameId) return;

    const token = localStorage.getItem("authToken");
    const guestToken = getGuestToken();

    const socket = new ChessSocket(token ?? undefined, guestToken ?? undefined);
    socketRef.current = socket;

    socket.joinGame(gameId);

    socket.onGameState((data) => {
      callbackRef.current(data);
    });

    return () => {
      socket.leaveGame(gameId);
      socket.offGameState();
      socket.disconnect();
      socketRef.current = null;
    };
  }, [gameId]);

  return socketRef.current;
}