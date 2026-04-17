type SoundType = 'move' | 'capture' | 'check' | 'checkmate' | 'draw' | 'cardDraw';

const soundFiles: Record<SoundType, string | null> = {
  move: '/sounds/public_sound_standard_Move.mp3',
  capture: '/sounds/public_sound_standard_Capture.mp3',
  check: '/sounds/public_sound_standard_GenericNotify.mp3',
  checkmate: '/sounds/public_sound_standard_GenericNotify.mp3',
  draw: '/sounds/public_sound_standard_GenericNotify.mp3',
  cardDraw: '/sounds/Sounds_drawcard.mp3',
};

// Use Web Audio API for zero network requests on playback
let audioContext: AudioContext | null = null;
const audioBuffers: Partial<Record<SoundType, AudioBuffer>> = {};

if (typeof window !== 'undefined') {
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  if (AudioContextClass) {
    audioContext = new AudioContextClass();

    // Pre-fetch and decode all sounds
    (Object.keys(soundFiles) as SoundType[]).forEach(async (type) => {
      const src = soundFiles[type];
      if (src && audioContext) {
        try {
          const response = await fetch(src);
          const arrayBuffer = await response.arrayBuffer();
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          audioBuffers[type] = audioBuffer;
        } catch (err) {
          console.warn("Failed to load sound:", src, err);
        }
      }
    });
  }
}

let muted = false;

export function setMuted(value: boolean) {
  muted = value;
}

export function isMuted(): boolean {
  return muted;
}

export function playSound(type: SoundType) {
  if (muted || !audioContext) return;

  const buffer = audioBuffers[type];
  if (!buffer) return;

  try {
    // Resume context if suspended (browsers suspend AudioContext until user interaction)
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }

    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    
    // Add volume control
    const gainNode = audioContext.createGain();
    gainNode.gain.value = 0.6; // Keep the volume pleasant
    
    source.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    source.start(0);
  } catch (e) {
    // Ignore unexpected errors
  }
}
