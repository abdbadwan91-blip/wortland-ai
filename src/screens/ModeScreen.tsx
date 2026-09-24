import { useState } from 'react';
import { useApp } from '../modules/Auth/AppContext';
import type { AppMode } from '../modules/Profile/types';
import styles from './ModeScreen.module.css';
import { OnboardingProgress } from '../components/OnboardingProgress';

export function ModeScreen() {
  const { t, updateProfile, completeOnboarding, setScreen, profile, dir } = useApp();
  const [mode, setMode] = useState<AppMode>(profile.mode || 'standard');

  const pick = (m: AppMode) => {
    setMode(m);
    updateProfile({ mode: m });
  };

  return (
    <div className="screen fade-in">
      <OnboardingProgress step={4} />
      <button type="button" className="back-chip" onClick={() => setScreen('avatar')}>
        <span aria-hidden>{dir === 'rtl' ? '→' : '←'}</span> {t('common.back')}
      </button>
      <h1 className="screen-title">{t('mode.title')}</h1>
      <p className="screen-sub">{t('mode.subtitle')}</p>

      <div className={styles.cards}>
        <button
          type="button"
          className={`${styles.card} ${styles.junior} ${mode === 'junior' ? styles.on : ''}`}
          onClick={() => pick('junior')}
          aria-pressed={mode === 'junior'}
        >
          <span className={styles.icon} aria-hidden>🌈</span>
          <span className={styles.title}>{t('mode.junior.title')}</span>
          <span className={styles.desc}>{t('mode.junior.desc')}</span>
          {mode === 'junior' && <span className={styles.badge}>✓</span>}
        </button>

        <button
          type="button"
          className={`${styles.card} ${styles.standard} ${mode === 'standard' ? styles.on : ''}`}
          onClick={() => pick('standard')}
          aria-pressed={mode === 'standard'}
        >
          <span className={styles.icon} aria-hidden>🎯</span>
          <span className={styles.title}>{t('mode.standard.title')}</span>
          <span className={styles.desc}>{t('mode.standard.desc')}</span>
          <span className={styles.recommended}>{t('mode.recommended')}</span>
          {mode === 'standard' && <span className={styles.badge}>✓</span>}
        </button>
      </div>

      <div className={styles.spacer} />
      <button
        type="button"
        className="btn-primary"
        onClick={() => {
          updateProfile({ mode });
          completeOnboarding();
        }}
      >
        {t('mode.finish')}
      </button>
    </div>
  );
}
