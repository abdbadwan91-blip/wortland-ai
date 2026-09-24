import { useCallback, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { useApp } from '../modules/Auth/AppContext';
import { LANGUAGES } from '../modules/Localization/languages';
import type { AppLanguage, AppMode } from '../modules/Profile/types';
import {
  checkAndDownloadOta,
  getEmbeddedAppVersion,
  getEmbeddedBundleVersion,
  getEmbeddedNativeVersionCode,
} from '../modules/Ota/liveUpdate';
import { SPEECH_RATES, type SpeechRate } from '../modules/Settings/settings';
import { formatSpeechRateLabel, speakGermanAtRate } from '../modules/Audio/speech';
import styles from './SettingsScreen.module.css';

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      className={`${styles.toggle} ${checked ? styles.toggleOn : ''}`}
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
    >
      <span className={styles.toggleThumb} />
    </button>
  );
}

function SettingRow({
  icon,
  title,
  description,
  children,
}: {
  icon: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.row}>
      <span className={styles.rowIcon} aria-hidden>{icon}</span>
      <span className={styles.rowCopy}>
        <strong>{title}</strong>
        {description && <small>{description}</small>}
      </span>
      <span className={styles.rowControl}>{children}</span>
    </div>
  );
}

export function SettingsScreen() {
  const { t, profile, settings, updateProfile, updateSettings, setScreen } = useApp();
  const currentLanguage = LANGUAGES.find((language) => language.code === profile.appLanguage);
  const isNative = Capacitor.isNativePlatform();
  const [updateStatus, setUpdateStatus] = useState<string>('');
  const [checking, setChecking] = useState(false);

  const onCheckUpdates = useCallback(async () => {
    if (!isNative || checking) return;
    setChecking(true);
    setUpdateStatus(t('settings.updateChecking'));
    const toastByLang: Record<string, string> = {
      ar: t('settings.updateReadyToast'),
      de: t('settings.updateReadyToast'),
      en: t('settings.updateReadyToast'),
    };
    const result = await checkAndDownloadOta({
      showToast: true,
      toastMessage: toastByLang[profile.appLanguage] || t('settings.updateReadyToast'),
    });
    setChecking(false);
    if (result.status === 'downloaded') {
      setUpdateStatus(t('settings.updateDownloaded'));
    } else if (result.status === 'up-to-date') {
      setUpdateStatus(t('settings.updateUpToDate'));
    } else if (result.status === 'native-too-old') {
      setUpdateStatus(t('settings.updateNeedApk'));
    } else if (result.status === 'error') {
      setUpdateStatus(t('settings.updateError'));
    } else {
      setUpdateStatus(t('settings.updateSkipped'));
    }
  }, [checking, isNative, profile.appLanguage, t]);

  return (
    <div className="screen with-nav fade-in">
      <div className={styles.header}>
        <button type="button" className="back-chip" aria-label={t('a11y.back')} onClick={() => setScreen('profile')}>
          ← {t('common.back')}
        </button>
        <div>
          <p className={styles.eyebrow}>{t('settings.eyebrow')}</p>
          <h1 className="screen-title">{t('settings.title')}</h1>
          <p className="screen-sub">{t('settings.subtitle')}</p>
        </div>
        <span className={styles.headerIcon} aria-hidden>⚙️</span>
      </div>

      <section className={styles.group} aria-labelledby="settings-language">
        <h2 id="settings-language" className={styles.groupTitle}><span aria-hidden>🌐</span>{t('settings.language')}</h2>
        <div className={styles.groupBody}>
          <label className={styles.selectRow}>
            <span className={styles.rowIcon} aria-hidden>🗣️</span>
            <span className={styles.rowCopy}>
              <strong>{t('settings.appLanguage')}</strong>
              <small>{t('settings.appLanguageDesc')}</small>
            </span>
            <select
              className={styles.select}
              value={profile.appLanguage}
              aria-label={t('settings.appLanguage')}
              onChange={(event) => {
                const language = event.target.value as AppLanguage;
                updateProfile({ appLanguage: language, translationLanguage: language });
              }}
            >
              {LANGUAGES.filter((language) => ['ar', 'en', 'de'].includes(language.code)).map((language) => (
                <option key={language.code} value={language.code}>{language.flag} {language.nativeName}</option>
              ))}
            </select>
          </label>
          <p className={styles.currentLanguage}>{currentLanguage?.flag} {t('settings.languageSelected', { language: currentLanguage?.nativeName || 'English' })}</p>
        </div>
      </section>

      <section className={styles.group} aria-labelledby="settings-sound">
        <h2 id="settings-sound" className={styles.groupTitle}><span aria-hidden>🔊</span>{t('settings.sound')}</h2>
        <div className={styles.groupBody}>
          <SettingRow icon="🎙️" title={t('settings.speech')} description={t('settings.speechDesc')}>
            <Toggle checked={settings.speechEnabled} onChange={() => updateSettings({ speechEnabled: !settings.speechEnabled })} label={t('settings.speech')} />
          </SettingRow>
          <div className={styles.volumeRow}>
            <span className={styles.rowIcon} aria-hidden>🔈</span>
            <span className={styles.rowCopy}><strong>{t('settings.volume')}</strong><small>{t('settings.volumeDesc')}</small></span>
            <output className={styles.volumeValue}>{Math.round(settings.volume * 100)}%</output>
          </div>
          <input
            className={styles.range}
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={settings.volume}
            aria-label={t('settings.volume')}
            onChange={(event) => updateSettings({ volume: Number(event.target.value) })}
          />
          <div className={styles.rateBlock}>
            <span className={styles.rowIcon} aria-hidden>🔊</span>
            <span className={styles.rowCopy}>
              <strong>{t('settings.speechRate')}</strong>
              <small>{t('settings.speechRateDesc')}</small>
            </span>
          </div>
          <div className={styles.rateChoices} role="radiogroup" aria-label={t('settings.speechRate')}>
            {SPEECH_RATES.map((rate) => (
              <button
                type="button"
                key={rate}
                className={`${styles.rateChoice} ${settings.speechRate === rate ? styles.rateChoiceOn : ''}`}
                role="radio"
                aria-checked={settings.speechRate === rate}
                onClick={() => {
                  updateSettings({ speechRate: rate as SpeechRate });
                  speakGermanAtRate('Hallo', rate as SpeechRate);
                }}
              >
                {formatSpeechRateLabel(rate)}
                {rate === 1 ? <small>{t('settings.speechRateNormal')}</small> : null}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.group} aria-labelledby="settings-appearance">
        <h2 id="settings-appearance" className={styles.groupTitle}><span aria-hidden>✨</span>{t('settings.appearance')}</h2>
        <div className={styles.groupBody}>
          <SettingRow icon="🌙" title={t('settings.reducedMotion')} description={t('settings.reducedMotionDesc')}>
            <Toggle checked={settings.reducedMotion} onChange={() => updateSettings({ reducedMotion: !settings.reducedMotion })} label={t('settings.reducedMotion')} />
          </SettingRow>
          <SettingRow icon="◐" title={t('settings.highContrast')} description={t('settings.highContrastDesc')}>
            <Toggle checked={settings.highContrast} onChange={() => updateSettings({ highContrast: !settings.highContrast })} label={t('settings.highContrast')} />
          </SettingRow>
        </div>
      </section>

      <section className={styles.group} aria-labelledby="settings-learning">
        <h2 id="settings-learning" className={styles.groupTitle}><span aria-hidden>🎯</span>{t('settings.learning')}</h2>
        <div className={styles.groupBody}>
          <div className={styles.modeChoices} role="radiogroup" aria-label={t('settings.learningMode')}>
            {(['junior', 'standard'] as AppMode[]).map((mode) => (
              <button
                type="button"
                key={mode}
                className={`${styles.modeChoice} ${profile.mode === mode ? styles.modeChoiceOn : ''}`}
                role="radio"
                aria-checked={profile.mode === mode}
                onClick={() => updateProfile({ mode })}
              >
                <span aria-hidden>{mode === 'junior' ? '🌈' : '🎯'}</span>
                <span>{t(`mode.${mode}.title`)}</span>
                {profile.mode === mode && <b aria-hidden>✓</b>}
              </button>
            ))}
          </div>
          <p className={styles.helper}>{t('settings.learningModeDesc')}</p>
        </div>
      </section>

      <section className={styles.group} aria-labelledby="settings-account">
        <h2 id="settings-account" className={styles.groupTitle}><span aria-hidden>👤</span>{t('settings.account')}</h2>
        <div className={styles.groupBody}>
          <div className={styles.accountNote}>
            <span className={styles.accountAvatar} aria-hidden>{profile.email ? '✉️' : '🧭'}</span>
            <span className={styles.rowCopy}><strong>{profile.email || t('profile.guest')}</strong><small>{profile.email ? t('settings.accountConnected') : t('settings.guestDesc')}</small></span>
            <button type="button" className={styles.linkButton} onClick={() => setScreen('email')}>{profile.email ? t('settings.manage') : t('settings.addEmail')}</button>
          </div>
        </div>
      </section>

      <section className={styles.group} aria-labelledby="settings-privacy">
        <h2 id="settings-privacy" className={styles.groupTitle}><span aria-hidden>🛡️</span>{t('settings.privacy')}</h2>
        <div className={styles.groupBody}>
          <div className={styles.privacyNote}>
            <span aria-hidden>💛</span>
            <span className={styles.rowCopy}><strong>{t('settings.familyPrivacy')}</strong><small>{t('settings.familyPrivacyDesc')}</small></span>
            <button type="button" className={styles.linkButton} onClick={() => setScreen('family')}>{t('settings.openFamily')}</button>
          </div>
        </div>
      </section>

      <section className={styles.group} aria-labelledby="settings-about">
        <h2 id="settings-about" className={styles.groupTitle}><span aria-hidden>ℹ️</span>{t('settings.about')}</h2>
        <div className={styles.groupBody}>
          <div className={styles.versionBlock}>
            <span className={styles.rowIcon} aria-hidden>📦</span>
            <span className={styles.rowCopy}>
              <strong>{t('settings.appVersion')}</strong>
              <small>
                {getEmbeddedAppVersion()}
                {isNative ? ` · native ${getEmbeddedNativeVersionCode()}` : ''}
              </small>
            </span>
          </div>
          <div className={styles.versionBlock}>
            <span className={styles.rowIcon} aria-hidden>🧩</span>
            <span className={styles.rowCopy}>
              <strong>{t('settings.bundleVersion')}</strong>
              <small>{getEmbeddedBundleVersion()}</small>
            </span>
          </div>
          {isNative && (
            <>
              <button
                type="button"
                className={styles.checkButton}
                disabled={checking}
                onClick={() => { void onCheckUpdates(); }}
              >
                {checking ? t('settings.updateChecking') : t('settings.checkUpdates')}
              </button>
              {updateStatus && <p className={styles.updateStatus}>{updateStatus}</p>}
              <p className={styles.helper}>{t('settings.otaHint')}</p>
            </>
          )}
        </div>
      </section>

      <p className={styles.footerNote}>{t('settings.savedLocally')}</p>
    </div>
  );
}
