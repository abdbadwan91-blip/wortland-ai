/** German TTS — native Capacitor plugin on Android/iOS, Web Speech API in the browser */
import { Capacitor } from '@capacitor/core';
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { loadSettings, type SpeechRate } from '../Settings/settings';

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

/** Legacy relative mode: 'slow' ≈ 0.7× the user's preferred rate. */
export type SpeakRate = 'normal' | 'slow';

function resolveRate(mode: SpeakRate = 'normal'): number {
  const settings = loadSettings();
  const base = settings.speechRate || 1;
  const scaled = mode === 'slow' ? base * 0.7 : base;
  return scaled;
}

/** Web Speech: 1.0 = normal; clamp to engine-friendly range. */
function toWebRate(rate: number): number {
  return Math.min(2, Math.max(0.1, rate));
}

/** Capacitor TTS: 1.0 = normal; plugin typically accepts ~0.5–2.0. */
function toNativeRate(rate: number): number {
  return Math.min(2, Math.max(0.5, rate));
}

async function speakNative(text: string, rate: number, volume: number): Promise<void> {
  try {
    await TextToSpeech.stop();
    await TextToSpeech.speak({
      text,
      lang: DEFAULT_LANG,
      rate: toNativeRate(rate),
      pitch: 1.0,
      volume,
      category: 'ambient',
    });
  } catch (err) {
    if (!nativeSpeechWarned) {
      nativeSpeechWarned = true;
      console.warn('[WortLand] Native German TTS unavailable:', err);
    }
  }
}

function speakWeb(text: string, rate: number, volume: number): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = DEFAULT_LANG;
  const voice = pickGermanVoice();
  if (voice) u.voice = voice;
  u.rate = toWebRate(rate);
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

  const numeric = resolveRate(rate);

  if (Capacitor.isNativePlatform()) {
    void speakNative(text, numeric, settings.volume);
    return;
  }
  speakWeb(text, numeric, settings.volume);
}

/** Speak at an explicit numeric rate (e.g. sample from the speed chip). */
export function speakGermanAtRate(text: string, rate: SpeechRate): void {
  const settings = loadSettings();
  if (!settings.speechEnabled || settings.volume <= 0) return;
  if (!text.trim()) return;
  if (Capacitor.isNativePlatform()) {
    void speakNative(text, rate, settings.volume);
    return;
  }
  speakWeb(text, rate, settings.volume);
}

export function formatSpeechRateLabel(rate: number): string {
  if (rate === 1) return '1×';
  // Trim trailing zeros: 0.5×, 1.25×
  const s = Number.isInteger(rate) ? String(rate) : String(rate);
  return `${s}×`;
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
