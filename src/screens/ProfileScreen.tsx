import { useMemo } from 'react';
import { useApp } from '../modules/Auth/AppContext';
import { getAvatar } from '../data/avatars';
import { LANGUAGES } from '../modules/Localization/languages';
import { BottomNav } from '../components/BottomNav';
import { clearMapProgress } from '../modules/MapProgress/mapProgress';
import { clearMastery, getMasterySummary } from '../modules/Mastery';
import {
  clearBadges,
  getCurrentTitle,
  listBadgeViews,
  TITLE_LADDER,
} from '../modules/Rewards/badges';
import styles from './ProfileScreen.module.css';

export function ProfileScreen() {
  const { t, profile, resetOnboarding, setScreen } = useApp();
  const avatar = getAvatar(profile.avatarId);
  const lang = LANGUAGES.find((l) => l.code === profile.appLanguage);
  const mastery = useMemo(() => getMasterySummary(), []);
  const badgeViews = useMemo(() => listBadgeViews(), []);
  const currentTitle = useMemo(() => getCurrentTitle(), []);
  const earnedCount = badgeViews.filter((b) => b.unlocked).length;

  return (
    <div className="screen with-nav fade-in">
      <div className={styles.titleRow}>
        <h1 className="screen-title">{t('profile.title')}</h1>
        <button
          type="button"
          className={styles.settingsButton}
          onClick={() => setScreen('settings')}
          aria-label={t('settings.open')}
          data-settings
        >
          <span aria-hidden>⚙️</span>
        </button>
      </div>
      <div className={styles.card}>
        <div
          className={styles.avatar}
          style={{ background: avatar?.bg || '#334155' }}
          aria-hidden
        >
          {avatar?.emoji || '🧒'}
        </div>
        <strong className={styles.name}>{profile.name || '—'}</strong>
        <p className={styles.titlePill} data-title={currentTitle.id}>
          <span aria-hidden>🎖️</span> {t(currentTitle.nameKey)}
        </p>
        <p className={styles.row}>
          <span>{t('profile.language')}</span>
          <span>
            {lang?.flag} {lang?.nativeName}
          </span>
        </p>
        <p className={styles.row}>
          <span>{t('profile.mode')}</span>
          <span>{profile.mode}</span>
        </p>
        <p className={styles.row}>
          <span>{t('profile.email')}</span>
          <span>{profile.email || t('profile.guest')}</span>
        </p>
      </div>

      <section className={styles.badges} aria-label={t('badge.section')} data-badges>
        <div className={styles.badgesHead}>
          <h2 className={styles.masteryTitle}>{t('badge.section')}</h2>
          <span className={styles.badgeCount} dir="ltr">
            {earnedCount}/{badgeViews.length}
          </span>
        </div>

        <div className={styles.titlesStrip} aria-label={t('title.section')}>
          {TITLE_LADDER.map((title) => {
            const active = title.id === currentTitle.id;
            const unlocked = earnedCount >= title.minBadges;
            return (
              <span
                key={title.id}
                className={`${styles.titleChip} ${active ? styles.titleActive : ''} ${
                  unlocked ? '' : styles.titleLocked
                }`}
                data-title-chip={title.id}
              >
                {t(title.nameKey)}
              </span>
            );
          })}
        </div>

        <div className={styles.badgeGrid}>
          {badgeViews.map(({ def, unlocked }) => (
            <div
              key={def.id}
              className={`${styles.badgeCell} ${unlocked ? styles.badgeOn : styles.badgeOff}`}
              data-badge={def.id}
              data-unlocked={unlocked ? '1' : '0'}
              title={t(def.nameKey)}
            >
              <span className={styles.badgeEmoji} aria-hidden>
                {unlocked ? def.emoji : '🔒'}
              </span>
              <span className={styles.badgeName}>{t(def.nameKey)}</span>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.mastery} aria-label={t('mastery.title')}>
        <h2 className={styles.masteryTitle}>{t('mastery.title')}</h2>
        {mastery.tracked === 0 ? (
          <p className={styles.masteryEmpty}>{t('mastery.empty')}</p>
        ) : (
          <div className={styles.masteryGrid}>
            <div className={styles.masteryStat}>
              <span className={styles.masteryNum}>{mastery.tracked}</span>
              <span className={styles.masteryLabel}>{t('mastery.tracked')}</span>
            </div>
            <div className={`${styles.masteryStat} ${styles.weak}`}>
              <span className={styles.masteryNum}>{mastery.weak}</span>
              <span className={styles.masteryLabel}>{t('mastery.weak')}</span>
            </div>
            <div className={`${styles.masteryStat} ${styles.due}`}>
              <span className={styles.masteryNum}>{mastery.due}</span>
              <span className={styles.masteryLabel}>{t('mastery.due')}</span>
            </div>
          </div>
        )}
      </section>

      <button
        type="button"
        className="btn-ghost"
        onClick={() => {
          clearMapProgress();
          clearMastery();
          clearBadges();
          resetOnboarding();
        }}
      >
        {t('profile.reset')}
      </button>
      <BottomNav />
    </div>
  );
}
