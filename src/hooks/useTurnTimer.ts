import { useEffect, useMemo, useState } from "react";
import { ChessGame } from "../services/api";

/**
 * Seconds left before the server's idle timeout ends the game for the player to move, or null when
 * the server did not send a deadline (older backend, or the game is not active).
 *
 * The deadline is in server time. `server_now` (the server clock when the payload was built) is
 * compared with this device's clock at the moment the game arrives, so a wrong phone clock does not
 * make the countdown wrong. Any new game payload (move, draw, re-sync) restarts the countdown.
 */
export function useTurnTimer(game: ChessGame | null | undefined): number | null {
  const deadline = game?.turn_deadline_at;
  const serverNow = game?.server_now;
  const version = game?.version;

  const localDeadline = useMemo(() => {
    if (!deadline) return null;
    const deadlineMs = Date.parse(deadline);
    if (!Number.isFinite(deadlineMs)) return null;
    const serverMs = serverNow ? Date.parse(serverNow) : NaN;
    const skew = Number.isFinite(serverMs) ? serverMs - Date.now() : 0; // server minus device clock
    return deadlineMs - skew;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deadline, serverNow, version]);

  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (localDeadline === null) return;
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [localDeadline]);

  if (localDeadline === null) return null;
  return Math.max(0, Math.ceil((localDeadline - now) / 1000));
}
