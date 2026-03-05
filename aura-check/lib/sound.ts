let audioCtx: AudioContext | null = null;
let muted = false;

export function setMuted(v: boolean) { muted = v; }
export function isMuted() { return muted; }

export function playRevealSound() {
  if (muted) return;
  try {
    audioCtx = audioCtx || new AudioContext();
    const ctx = audioCtx;
    const now = ctx.currentTime;

    // Mystical ascending chime sequence
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5]; // C5, E5, G5, C6, E6
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.15, now);
    masterGain.gain.linearRampToValueAtTime(0, now + 2.0);
    masterGain.connect(ctx.destination);

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0, now + i * 0.15);
      gain.gain.linearRampToValueAtTime(0.3, now + i * 0.15 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.8);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now + i * 0.15);
      osc.stop(now + i * 0.15 + 1.0);
    });

    // Shimmer/whoosh layer
    const noise = ctx.createOscillator();
    noise.type = 'sine';
    noise.frequency.setValueAtTime(200, now);
    noise.frequency.exponentialRampToValueAtTime(2000, now + 1.5);
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.02, now);
    noiseGain.gain.linearRampToValueAtTime(0.06, now + 0.5);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);
    noise.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start(now);
    noise.stop(now + 2.0);
  } catch {}
}
