import { useState } from 'react';
import { useApp } from '../modules/Auth/AppContext';
import styles from './EmailScreen.module.css';

export function EmailScreen() {
  const { t, updateProfile, completeOnboarding, setScreen, dir } = useApp();
  const [email, setEmail] = useState('');

  const finish = (withEmail?: string) => {
    updateProfile({ email: withEmail || undefined });
    completeOnboarding();
  };

  return (
    <div className="screen fade-in">
      <button type="button" className="back-chip" onClick={() => setScreen('mode')}>
        <span aria-hidden>{dir === 'rtl' ? '→' : '←'}</span> {t('common.back')}
      </button>
      <div className={styles.hero} aria-hidden>
        <span>✉️</span>
        <span className={styles.star}>✨</span>
      </div>
      <h1 className="screen-title">{t('email.title')}</h1>
      <p className="screen-sub">{t('email.subtitle')}</p>

      <input
        className="field"
        type="email"
        inputMode="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t('email.placeholder')}
        aria-label={t('email.placeholder')}
      />

      <ul className={styles.benefits}>
        <li>🔄 {t('email.benefit.sync')}</li>
        <li>👨‍👩‍👧 {t('email.benefit.family')}</li>
        <li>☁️ {t('email.benefit.backup')}</li>
      </ul>

      <div className={styles.spacer} />

      <button
        type="button"
        className="btn-blue"
        disabled={!email.trim().includes('@')}
        onClick={() => finish(email.trim())}
      >
        {t('email.connect')}
      </button>
      <button type="button" className="btn-ghost" onClick={() => finish()}>
        {t('email.skip')}
      </button>
    </div>
  );
}
