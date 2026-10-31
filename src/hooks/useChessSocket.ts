import { useEffect, useRef } from "react";
import { ChessSocket } from "../services/socket";
import { getGuestToken } from "../utils/sessionIdentity";
import { ChessGame } from "../services/api";

interface Props {
  gameId?: string;
  onGameUpdate: (game: ChessGame) => void;
  /** Called when the server rejects an action, so the UI can re-sync with the real game state. */
  onError?: (err: { message: string; gameId?: string }) => void;
}

export function useChessSocket({ gameId, onGameUpdate, onError }: Props): ChessSocket | null {
  const socketRef = useRef<ChessSocket>(null);
  const callbackRef = useRef(onGameUpdate);
  const errorRef = useRef(onError);

  // Always keep latest callback (prevents stale closure)
  useEffect(() => {
    callbackRef.current = onGameUpdate;
  }, [onGameUpdate]);

  useEffect(() => {
    errorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    if (!gameId) return;

    const token = localStorage.getItem("authToken");
    const guestToken = getGuestToken();

    if (!token && !guestToken) return;

    const socket = new ChessSocket(token ?? undefined, guestToken ?? undefined);
    socketRef.current = socket;

    socket.joinGame(gameId);

    socket.onGameState((data) => {
      callbackRef.current(data);
    });

    socket.onError((err) => {
      errorRef.current?.(err);
    });

    return () => {
      socket.leaveGame(gameId);
      socket.offGameState();
      socket.offError();
      socket.disconnect();
      socketRef.current = null;
    };
  }, [gameId]);

  return socketRef.current;
}