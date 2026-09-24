import { useState } from 'react';
import { useApp } from '../modules/Auth/AppContext';
import { LANGUAGES } from '../modules/Localization/languages';
import type { AppLanguage } from '../modules/Profile/types';
import styles from './LanguageScreen.module.css';
import { OnboardingProgress } from '../components/OnboardingProgress';

export function LanguageScreen() {
  const { t, updateProfile, setScreen, profile } = useApp();
  const [selected, setSelected] = useState<AppLanguage>(
    profile.appLanguage || 'en',
  );

  const onContinue = () => {
    updateProfile({
      appLanguage: selected,
      translationLanguage: selected,
    });
    setScreen('name');
  };

  return (
    <div className="screen fade-in">
      <OnboardingProgress step={1} />
      <h1 className="screen-title">{t('lang.title')}</h1>
      <p className="screen-sub">{t('lang.subtitle')}</p>
      <div className={styles.list} role="listbox" aria-label={t('lang.title')}>
        {LANGUAGES.map((lang) => {
          const active = selected === lang.code;
          return (
            <button
              key={lang.code}
              type="button"
              role="option"
              aria-selected={active}
              className={`${styles.row} ${active ? styles.active : ''}`}
              onClick={() => {
                setSelected(lang.code);
                updateProfile({
                  appLanguage: lang.code,
                  translationLanguage: lang.code,
                });
              }}
              dir={lang.dir}
            >
              <span className={styles.flag} aria-hidden>{lang.flag}</span>
              <span className={styles.name}>{lang.nativeName}</span>
              {active && <span className={styles.check} aria-hidden>✓</span>}
            </button>
          );
        })}
      </div>
      <div className={styles.footer}>
        <button type="button" className="btn-primary" onClick={onContinue}>
          {t('lang.continue')}
        </button>
      </div>
    </div>
  );
}
