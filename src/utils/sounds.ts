type SoundType = 'move' | 'capture' | 'check' | 'checkmate' | 'draw' | 'cardDraw';

const soundFiles: Record<SoundType, string | null> = {
  move: '/sounds/public_sound_standard_Move.mp3',
  capture: '/sounds/public_sound_standard_Capture.mp3',
  check: '/sounds/public_sound_standard_GenericNotify.mp3',
  checkmate: '/sounds/public_sound_standard_GenericNotify.mp3',
  draw: '/sounds/public_sound_standard_GenericNotify.mp3',
  cardDraw: '/sounds/Sounds_drawcard.mp3',
};

// Cache for generated audio nodes so we don't fetch repeatedly, 
// though the browser handles mp3 caching well
const audioPool: Partial<Record<SoundType, HTMLAudioElement>> = {};

if (typeof window !== 'undefined') {
  // Pre-load audio to avoid delay on first play
  (Object.keys(soundFiles) as SoundType[]).forEach((type) => {
    const src = soundFiles[type];
    if (src) {
      const audio = new Audio(src);
      audio.preload = 'auto';
      audioPool[type] = audio;
    }
  });
}

let muted = false;

export function setMuted(value: boolean) {
  muted = value;
}

export function isMuted(): boolean {
  return muted;
}

export function playSound(type: SoundType) {
  if (muted) return;

  const baseAudio = audioPool[type];
  if (!baseAudio) return;

  try {
    // Clone node so rapid sounds (like overlapping card draws) can play concurrently
    const clone = baseAudio.cloneNode(true) as HTMLAudioElement;
    clone.volume = 0.6; // Keep the volume pleasant
    clone.play().catch(() => {
      // Silently ignore audio errors, e.g., if user hasn't interacted with document
    });
  } catch (e) {
    // Ignore unexpected errors
  }
}
