/**
 * Comet Warden - Procedural WebAudio Synthesizer
 * 100% synthesized sound effects: pluck, chime, crash, victory chord, menu click, and repulsor.
 * Audio starts strictly upon first user gesture.
 */

let audioCtx = null;
let masterGain = null;
let muted = false;

function ensureAudio() {
  if (!audioCtx && typeof window !== 'undefined') {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      try {
        audioCtx = new AudioContextClass();
        masterGain = audioCtx.createGain();
        masterGain.gain.setValueAtTime(muted ? 0 : 0.65, audioCtx.currentTime);
        masterGain.connect(audioCtx.destination);
      } catch {
        // Audio unavailable or blocked
      }
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function toggleMute() {
  muted = !muted;
  if (masterGain && audioCtx) {
    masterGain.gain.setValueAtTime(muted ? 0 : 0.65, audioCtx.currentTime);
  }
  return muted;
}

export function isMuted() {
  return muted;
}

/**
 * Soft warm pluck when a gravitational well is placed.
 */
export function playWellPlace(chargeRatio = 0) {
  const ctx = ensureAudio();
  if (!ctx || muted) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  // Pitch deepens slightly with heavier well mass
  const baseFreq = 220 - chargeRatio * 60;
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(baseFreq * 1.5, now);
  osc.frequency.exponentialRampToValueAtTime(baseFreq, now + 0.08);

  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(0.4, now + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

  osc.connect(gain);
  gain.connect(masterGain);

  osc.start(now);
  osc.stop(now + 0.46);
}

/**
 * Ascending crystal chime when Ember passes through an active star gate.
 */
export function playGatePass(gateIndex = 0) {
  const ctx = ensureAudio();
  if (!ctx || muted) return;

  const now = ctx.currentTime;
  // Celestial pentatonic frequencies
  const scale = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5];
  const rootIndex = gateIndex % (scale.length - 2);

  const freqs = [
    scale[rootIndex],
    scale[rootIndex + 1],
    scale[rootIndex + 2],
  ];

  freqs.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const noteStart = now + idx * 0.07;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, noteStart);

    gain.gain.setValueAtTime(0.001, noteStart);
    gain.gain.linearRampToValueAtTime(0.28, noteStart + 0.018);
    gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + 0.75);

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start(noteStart);
    osc.stop(noteStart + 0.76);
  });
}

/**
 * Deep seismic thud and filtered noise burst upon asteroid collision.
 */
export function playCrash() {
  const ctx = ensureAudio();
  if (!ctx || muted) return;

  const now = ctx.currentTime;

  // Sub-bass sine drop
  const osc = ctx.createOscillator();
  const oscGain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(95, now);
  osc.frequency.exponentialRampToValueAtTime(32, now + 0.55);

  oscGain.gain.setValueAtTime(0.65, now);
  oscGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.56);

  osc.connect(oscGain);
  oscGain.connect(masterGain);
  osc.start(now);
  osc.stop(now + 0.58);

  // Filtered white noise impact
  const bufferSize = Math.floor(ctx.sampleRate * 0.4);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const noiseSource = ctx.createBufferSource();
  noiseSource.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(380, now);
  filter.frequency.exponentialRampToValueAtTime(60, now + 0.38);

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.55, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.39);

  noiseSource.connect(filter);
  filter.connect(noiseGain);
  noiseGain.connect(masterGain);

  noiseSource.start(now);
  noiseSource.stop(now + 0.4);
}

/**
 * Triumphant celestial chord upon sealing all sectors.
 */
export function playVictory() {
  const ctx = ensureAudio();
  if (!ctx || muted) return;

  const now = ctx.currentTime;
  // Major 9th chord (C4, G4, C5, E5, B5)
  const chord = [261.63, 392.0, 523.25, 659.25, 987.77];

  chord.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const startTime = now + idx * 0.05;

    osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.linearRampToValueAtTime(0.22, startTime + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.6);

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start(startTime);
    osc.stop(startTime + 1.65);
  });
}

/**
 * Subtle tactile click for UI button interactions.
 */
export function playMenuClick() {
  const ctx = ensureAudio();
  if (!ctx || muted) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(1100, now);
  osc.frequency.exponentialRampToValueAtTime(450, now + 0.035);

  gain.gain.setValueAtTime(0.2, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

  osc.connect(gain);
  gain.connect(masterGain);

  osc.start(now);
  osc.stop(now + 0.04);
}

/**
 * Sparkling ping when collecting stardust motes.
 */
export function playStardust() {
  const ctx = ensureAudio();
  if (!ctx || muted) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(880, now);
  osc.frequency.linearRampToValueAtTime(1320, now + 0.08);

  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(0.18, now + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);

  osc.connect(gain);
  gain.connect(masterGain);

  osc.start(now);
  osc.stop(now + 0.31);
}

/**
 * Heavy resonant sweep for the repulsor pulse.
 */
export function playRepulsor() {
  const ctx = ensureAudio();
  if (!ctx || muted) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(320, now);
  osc.frequency.exponentialRampToValueAtTime(80, now + 0.35);

  gain.gain.setValueAtTime(0.45, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.36);

  osc.connect(gain);
  gain.connect(masterGain);

  osc.start(now);
  osc.stop(now + 0.38);
}
