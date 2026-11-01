import { useEffect, useState } from "react";

/**
 * Game-screen layout mode, chosen from the space available (not from "is this a phone").
 *
 *  - "side":  landscape and roomy (laptop, desktop, landscape tablet): board + resizable side panel.
 *  - "rail":  landscape but small (landscape phone, short window): board + narrow card rail.
 *  - "stack": portrait (phone, foldable, tablet): board above, card dock below.
 *
 * KEEP IN SYNC with the media queries in src/index.css (`.game-main` section). They are written
 * out in both places on purpose: CSS decides the geometry, this hook decides which controls to render.
 */
export type LayoutMode = "stack" | "rail" | "side";

export const SIDE_QUERY = "(orientation: landscape) and (min-width: 900px) and (min-height: 500px)";
export const RAIL_QUERY = "(orientation: landscape)";

function read(): LayoutMode {
  if (typeof window === "undefined" || !window.matchMedia) return "side";
  if (window.matchMedia(SIDE_QUERY).matches) return "side";
  if (window.matchMedia(RAIL_QUERY).matches) return "rail";
  return "stack";
}

export function useLayoutMode(): LayoutMode {
  const [mode, setMode] = useState<LayoutMode>(read);

  useEffect(() => {
    if (!window.matchMedia) return;
    const lists = [window.matchMedia(SIDE_QUERY), window.matchMedia(RAIL_QUERY)];
    const update = () => setMode(read());
    lists.forEach((l) => l.addEventListener("change", update));
    update();
    return () => lists.forEach((l) => l.removeEventListener("change", update));
  }, []);

  return mode;
}
