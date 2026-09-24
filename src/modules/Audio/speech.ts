/** German TTS via Web Speech API — no fake audio files */
import { loadSettings } from '../Settings/settings';

const DEFAULT_LANG = 'de-DE';

let preferredVoice: SpeechSynthesisVoice | null = null;

function pickGermanVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return preferredVoice;
  const de =
    voices.find((v) => v.lang === 'de-DE') ||
    voices.find((v) => v.lang.toLowerCase().startsWith('de')) ||
    null;
  preferredVoice = de;
  return de;
}

/** Warm voices list (Chrome loads async) */
export function warmSpeechVoices(): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  pickGermanVoice();
  window.speechSynthesis.onvoiceschanged = () => {
    pickGermanVoice();
  };
}

export type SpeakRate = 'normal' | 'slow';

export function speakGerman(
  text: string,
  rate: SpeakRate = 'normal',
): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  const settings = loadSettings();
  if (!settings.speechEnabled || settings.volume <= 0) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = DEFAULT_LANG;
  const voice = pickGermanVoice();
  if (voice) u.voice = voice;
  u.rate = rate === 'slow' ? 0.65 : 0.95;
  u.pitch = 1;
  u.volume = settings.volume;
  window.speechSynthesis.speak(u);
}

export function stopSpeech(): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
}

export function canSpeak(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}
