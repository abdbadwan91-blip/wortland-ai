/** German TTS — native Capacitor plugin on Android/iOS, Web Speech API in the browser */
import { Capacitor } from '@capacitor/core';
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { loadSettings } from '../Settings/settings';

const DEFAULT_LANG = 'de-DE';

let preferredVoice: SpeechSynthesisVoice | null = null;
let nativeSpeechWarned = false;

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

/** Warm voices list (Chrome loads async). No-op on native. */
export function warmSpeechVoices(): void {
  if (Capacitor.isNativePlatform()) return;
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  pickGermanVoice();
  window.speechSynthesis.onvoiceschanged = () => {
    pickGermanVoice();
  };
}

export type SpeakRate = 'normal' | 'slow';

function rateToNumber(rate: SpeakRate): number {
  // Web Speech uses ~0.65 / 0.95; Capacitor TTS rate is typically 0.5–2.0 (1.0 = normal).
  return rate === 'slow' ? 0.7 : 1.0;
}

async function speakNative(text: string, rate: SpeakRate, volume: number): Promise<void> {
  try {
    await TextToSpeech.stop();
    await TextToSpeech.speak({
      text,
      lang: DEFAULT_LANG,
      rate: rateToNumber(rate),
      pitch: 1.0,
      volume,
      category: 'ambient',
    });
  } catch (err) {
    // Missing German voice pack, TTS engine error, etc. — fail quietly.
    if (!nativeSpeechWarned) {
      nativeSpeechWarned = true;
      console.warn('[WortLand] Native German TTS unavailable:', err);
    }
  }
}

function speakWeb(text: string, rate: SpeakRate, volume: number): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = DEFAULT_LANG;
  const voice = pickGermanVoice();
  if (voice) u.voice = voice;
  u.rate = rate === 'slow' ? 0.65 : 0.95;
  u.pitch = 1;
  u.volume = volume;
  window.speechSynthesis.speak(u);
}

export function speakGerman(
  text: string,
  rate: SpeakRate = 'normal',
): void {
  const settings = loadSettings();
  if (!settings.speechEnabled || settings.volume <= 0) return;
  if (!text.trim()) return;

  if (Capacitor.isNativePlatform()) {
    void speakNative(text, rate, settings.volume);
    return;
  }
  speakWeb(text, rate, settings.volume);
}

export function stopSpeech(): void {
  if (Capacitor.isNativePlatform()) {
    void TextToSpeech.stop().catch(() => {
      /* ignore */
    });
    return;
  }
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
}

export function canSpeak(): boolean {
  if (Capacitor.isNativePlatform()) return true;
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}
