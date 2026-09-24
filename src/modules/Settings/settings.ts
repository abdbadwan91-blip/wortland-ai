export const SPEECH_RATES = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2] as const;
export type SpeechRate = (typeof SPEECH_RATES)[number];

export interface WortlandSettings {
  speechEnabled: boolean;
  volume: number;
  /** Playback rate for German TTS (1 = normal). */
  speechRate: SpeechRate;
  reducedMotion: boolean;
  highContrast: boolean;
}

export const SETTINGS_STORAGE_KEY = 'wortland.settings.v1';

function clampSpeechRate(value: unknown): SpeechRate {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return 1;
  let best: SpeechRate = 1;
  let bestDist = Infinity;
  for (const r of SPEECH_RATES) {
    const d = Math.abs(r - n);
    if (d < bestDist) {
      bestDist = d;
      best = r;
    }
  }
  return best;
}

export const defaultSettings = (): WortlandSettings => ({
  speechEnabled: true,
  volume: 0.8,
  speechRate: 1,
  reducedMotion: false,
  highContrast: false,
});

export function loadSettings(): WortlandSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return defaultSettings();
    const parsed = JSON.parse(raw) as Partial<WortlandSettings>;
    return {
      ...defaultSettings(),
      ...parsed,
      volume: typeof parsed.volume === 'number' ? Math.min(1, Math.max(0, parsed.volume)) : 0.8,
      speechRate: clampSpeechRate(parsed.speechRate),
    };
  } catch {
    return defaultSettings();
  }
}

export function saveSettings(settings: WortlandSettings): void {
  localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
}

/** Keep global accessibility preferences in sync with the current settings. */
export function applySettings(settings: WortlandSettings): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.classList.toggle('reduced-motion', settings.reducedMotion);
  root.dataset.reducedMotion = settings.reducedMotion ? 'true' : 'false';
  root.dataset.highContrast = settings.highContrast ? 'true' : 'false';
}
