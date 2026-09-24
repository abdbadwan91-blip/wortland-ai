import { useState } from 'react';
import { useApp } from '../modules/Auth/AppContext';
import { LANGUAGES } from '../modules/Localization/languages';
import type { AppLanguage } from '../modules/Profile/types';
import styles from './SplashScreen.module.css';

function SplashScenery() {
  return (
    <svg className={styles.scenery} viewBox="0 0 400 320" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs>
        <linearGradient id="spSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7ec8ff" />
          <stop offset="55%" stopColor="#3a7fd4" />
          <stop offset="100%" stopColor="#1a4a8a" />
        </linearGradient>
        <linearGradient id="spHill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3cb371" />
          <stop offset="100%" stopColor="#1a5c32" />
        </linearGradient>
        <radialGradient id="spSun" cx="78%" cy="18%" r="20%">
          <stop offset="0%" stopColor="#ffe9a8" stopOpacity="1" />
          <stop offset="100%" stopColor="#ffe9a8" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="320" fill="url(#spSky)" />
      <circle cx="310" cy="55" r="70" fill="url(#spSun)" />
      <circle cx="315" cy="58" r="24" fill="#fff0b0" />

      {/* distant mountains */}
      <path d="M0 150 L60 90 L100 120 L150 70 L200 115 L260 65 L320 110 L400 80 L400 200 L0 200 Z" fill="#5a8ab8" opacity="0.55" />
      <path d="M150 70 L162 82 L138 82 Z" fill="#f5fbff" opacity="0.9" />
      <path d="M260 65 L271 76 L249 76 Z" fill="#f5fbff" opacity="0.85" />

      {/* mid forest ridge */}
      <path d="M0 190 Q80 160 160 185 T320 170 T400 190 L400 260 L0 260 Z" fill="#2d7a45" />
      <ellipse cx="40" cy="195" rx="22" ry="32" fill="#1f6b38" />
      <ellipse cx="90" cy="188" rx="26" ry="38" fill="#268a48" />
      <ellipse cx="340" cy="192" rx="28" ry="40" fill="#1f6b38" />
      <ellipse cx="380" cy="200" rx="20" ry="30" fill="#2d8a48" />

      {/* foreground hills */}
      <path d="M0 240 Q100 210 200 235 T400 225 L400 320 L0 320 Z" fill="url(#spHill)" />

      {/* original watchtower landmark */}
      <g transform="translate(175,145)">
        <rect x="10" y="20" width="40" height="48" rx="3" fill="#c4a574" stroke="#8b6914" strokeWidth="2" />
        <rect x="2" y="14" width="56" height="10" rx="2" fill="#d4b896" />
        <polygon points="30,-6 58,16 2,16" fill="#e8c878" stroke="#b8860b" strokeWidth="1.5" />
        <rect x="20" y="32" width="8" height="12" rx="1" fill="#3b5a8a" />
        <rect x="34" y="32" width="8" height="12" rx="1" fill="#3b5a8a" />
        <circle cx="30" cy="-12" r="5" fill="#ff7a2f" />
      </g>

      {/* path */}
      <path d="M200 220 C 210 240, 180 260, 200 280 S 230 300, 200 320" fill="none" stroke="#d4b896" strokeWidth="10" strokeLinecap="round" opacity="0.7" />

      {/* characters — original emoji placeholders */}
      <text x="120" y="275" fontSize="36">👦</text>
      <text x="175" y="268" fontSize="28">🦉</text>
      <text x="230" y="275" fontSize="36">👧</text>
    </svg>
  );
}

export function SplashScreen() {
  const { t, setScreen, updateProfile, profile } = useApp();
  const [langOpen, setLangOpen] = useState(false);
  const current = LANGUAGES.find((l) => l.code === profile.appLanguage) || LANGUAGES[1];

  const pickLang = (code: AppLanguage) => {
    updateProfile({ appLanguage: code, translationLanguage: code });
    setLangOpen(false);
  };

  return (
    <div className={`screen ${styles.splash}`}>
      <div className={styles.artWrap}>
        <SplashScenery />
      </div>

      <div className={styles.brandLockup}>
        <span className={styles.brandPill}><span aria-hidden>✦</span> {t('app.eyebrow')}</span>
        <h1 className={styles.wordmark}>{t('app.name')}</h1>
        <p className={styles.tagline}>{t('app.tagline')}</p>
        <p className={styles.description}>{t('splash.description')}</p>
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          className="btn-primary"
          onClick={() => setScreen(profile.onboardingComplete ? 'home' : 'language')}
        >
          {t('splash.start')}
        </button>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => setScreen(profile.onboardingComplete ? 'home' : 'language')}
        >
          {t('splash.existing')}
        </button>
      </div>

      <div className={styles.langWrap}>
        <button
          type="button"
          className={styles.langBtn}
          onClick={() => setLangOpen((v) => !v)}
          aria-expanded={langOpen}
        >
          <span aria-hidden>{current.flag}</span>
          <span>{current.nativeName}</span>
          <span aria-hidden>▾</span>
        </button>
        {langOpen && (
          <div className={styles.langMenu} role="listbox">
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                type="button"
                role="option"
                aria-selected={l.code === profile.appLanguage}
                className={styles.langItem}
                dir={l.dir}
                onClick={() => pickLang(l.code)}
              >
                <span>{l.flag}</span> {l.nativeName}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
