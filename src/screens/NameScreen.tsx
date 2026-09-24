import { useState } from 'react';
import { useApp } from '../modules/Auth/AppContext';
import styles from './NameScreen.module.css';
import { OnboardingProgress } from '../components/OnboardingProgress';

export function NameScreen() {
  const { t, updateProfile, setScreen, profile, dir } = useApp();
  const [name, setName] = useState(profile.name);

  const valid = name.trim().length > 0;

  return (
    <div className="screen fade-in">
      <OnboardingProgress step={2} />
      <button type="button" className="back-chip" onClick={() => setScreen('language')}>
        <span aria-hidden>{dir === 'rtl' ? '→' : '←'}</span> {t('common.back')}
      </button>
      <div className={styles.hero} aria-hidden>👋</div>
      <h1 className="screen-title">{t('name.title')}</h1>
      <p className="screen-sub">{t('name.subtitle')}</p>
      <input
        className={`field ${styles.input}`}
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={t('name.placeholder')}
        autoFocus
        maxLength={32}
        aria-label={t('name.placeholder')}
      />
      <div className={styles.spacer} />
      <button
        type="button"
        className="btn-primary"
        disabled={!valid}
        onClick={() => {
          updateProfile({ name: name.trim() });
          setScreen('avatar');
        }}
      >
        {t('name.continue')}
      </button>
    </div>
  );
}
