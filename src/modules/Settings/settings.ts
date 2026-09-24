export interface WortlandSettings {
  speechEnabled: boolean;
  volume: number;
  reducedMotion: boolean;
  highContrast: boolean;
}

export const SETTINGS_STORAGE_KEY = 'wortland.settings.v1';

export const defaultSettings = (): WortlandSettings => ({
  speechEnabled: true,
  volume: 0.8,
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
