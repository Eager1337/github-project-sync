/** Tiny WebAudio chime used when a new alert arrives — no asset download needed. */
let ctx: AudioContext | null = null;

const SOUND_KEY = 'haamkay-alert-sound';

export const soundEnabled = () =>
  typeof window === 'undefined' ? false : localStorage.getItem(SOUND_KEY) !== 'off';

export const setSoundEnabled = (on: boolean) => {
  localStorage.setItem(SOUND_KEY, on ? 'on' : 'off');
};

export function playAlertChime() {
  if (typeof window === 'undefined' || !soundEnabled()) return;
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = ctx ?? new AC();
    if (ctx.state === 'suspended') void ctx.resume();

    const now = ctx.currentTime;
    // Two-note sparkle: G5 -> C6
    [
      { freq: 783.99, at: 0 },
      { freq: 1046.5, at: 0.13 },
    ].forEach(({ freq, at }) => {
      const osc = ctx!.createOscillator();
      const gain = ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + at);
      gain.gain.setValueAtTime(0.0001, now + at);
      gain.gain.exponentialRampToValueAtTime(0.22, now + at + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + at + 0.45);
      osc.connect(gain).connect(ctx!.destination);
      osc.start(now + at);
      osc.stop(now + at + 0.5);
    });
  } catch {
    /* audio blocked until first interaction — silently ignore */
  }
}

/** Short haptic buzz on phones that support it. */
export function vibrateAlert() {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try { navigator.vibrate([18, 60, 28]); } catch { /* ignore */ }
  }
}
