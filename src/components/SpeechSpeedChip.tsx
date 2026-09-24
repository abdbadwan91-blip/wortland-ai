import { useEffect, useId, useRef, useState } from 'react';
import { useApp } from '../modules/Auth/AppContext';
import { SPEECH_RATES, type SpeechRate } from '../modules/Settings/settings';
import { formatSpeechRateLabel, speakGermanAtRate } from '../modules/Audio/speech';
import styles from './SpeechSpeedChip.module.css';

const SAMPLE_WORD = 'Hallo';

function SpeakerIcon() {
  return (
    <svg className={styles.chipSvg} viewBox="0 0 24 24" aria-hidden fill="none">
      <path
        d="M4 9.5v5h3.2L12 19V5L7.2 9.5H4z"
        fill="currentColor"
        opacity="0.95"
      />
      <path
        d="M15.2 8.8a3.6 3.6 0 0 1 0 6.4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M17.4 6.2a6.4 6.4 0 0 1 0 11.6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.75"
      />
    </svg>
  );
}

/** Floating speech-speed control for game screens (RTL-aware top corner). */
export function SpeechSpeedChip() {
  const { t, settings, updateSettings } = useApp();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  useEffect(() => {
    if (!open) return;
    const onDoc = (event: MouseEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const rate = settings.speechRate;

  const pick = (next: SpeechRate) => {
    updateSettings({ speechRate: next });
    speakGermanAtRate(SAMPLE_WORD, next);
    setOpen(false);
  };

  return (
    <div className={styles.wrap} ref={wrapRef} data-speech-speed-chip>
      <button
        type="button"
        className={styles.chip}
        aria-expanded={open}
        aria-controls={listId}
        aria-label={t('settings.speechRate')}
        onClick={() => setOpen((v) => !v)}
      >
        <SpeakerIcon />
        <span>{formatSpeechRateLabel(rate)}</span>
      </button>
      {open && (
        <div className={styles.popover} id={listId} role="listbox" aria-label={t('settings.speechRate')}>
          <p className={styles.title}>{t('settings.speechRate')}</p>
          {SPEECH_RATES.map((r) => (
            <button
              key={r}
              type="button"
              role="option"
              aria-selected={r === rate}
              className={`${styles.option} ${r === rate ? styles.optionOn : ''}`}
              onClick={() => pick(r)}
            >
              <span>{formatSpeechRateLabel(r)}</span>
              {r === 1 && <span className={styles.normalTag}>{t('settings.speechRateNormal')}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
