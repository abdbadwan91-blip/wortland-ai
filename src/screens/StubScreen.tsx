import { useMemo } from 'react';
import { useApp, type Screen } from '../modules/Auth/AppContext';
import { BottomNav } from '../components/BottomNav';
import { getMasterySummary } from '../modules/Mastery';
import styles from './StubScreen.module.css';

const KEYS: Record<string, string> = {
  learn: 'stub.learn',
  games: 'stub.games',
  progress: 'stub.progress',
};

export function StubScreen({
  which,
}: {
  which: Extract<Screen, 'learn' | 'games' | 'progress'>;
}) {
  const { t } = useApp();
  const mastery = useMemo(
    () => (which === 'progress' ? getMasterySummary() : null),
    [which],
  );

  return (
    <div className="screen with-nav fade-in">
      <div className={styles.box}>
        <span aria-hidden>🚧</span>
        <p>{t(KEYS[which])}</p>
        {mastery && (
          <div className={styles.masteryRow} aria-label={t('mastery.title')}>
            <span className={styles.chip}>
              📚 {t('mastery.tracked')}: {mastery.tracked}
            </span>
            <span className={`${styles.chip} ${styles.weak}`}>
              📉 {t('mastery.weak')}: {mastery.weak}
            </span>
            <span className={`${styles.chip} ${styles.due}`}>
              ⏰ {t('mastery.due')}: {mastery.due}
            </span>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
