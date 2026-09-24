import { useApp } from '../modules/Auth/AppContext';
import {
  completeCurrentStage,
  loadMapProgress,
} from '../modules/MapProgress/mapProgress';
import styles from './ArenaStubScreen.module.css';

export function ArenaStubScreen() {
  const { t, setScreen, selectedLevel, selectedTopic, selectedMode, updateProfile, profile } =
    useApp();
  const topicName = t(`topic.${selectedTopic}`);
  const modeName = t(`modes.${selectedMode}`);

  const finishAndGoHome = () => {
    const progress = loadMapProgress();
    // Advance world map only when finishing the current unlocked stage
    if (selectedLevel === progress.unlockedStage) {
      const { showFalcon } = completeCurrentStage(progress);
      updateProfile({
        xp: profile.xp + 25,
        coins: profile.coins + 10,
        streak: Math.max(1, profile.streak),
        level: Math.max(profile.level, Math.min(20, progress.unlockedStage + 1)),
      });
      if (showFalcon) {
        window.dispatchEvent(new CustomEvent('wortland:falcon'));
      }
    }
    setScreen('home');
  };

  return (
    <div className={`screen fade-in ${styles.wrap}`}>
      <div className={styles.card}>
        <div className={styles.badge} aria-hidden>
          ⚡
        </div>
        <h1 className={styles.title}>{t('arena.coming', { n: selectedLevel })}</h1>
        <p className={styles.desc}>
          {t('arena.coming.desc', { mode: modeName, topic: topicName })}
        </p>
        <div className={styles.preview} aria-hidden>
          <span>🐶</span>
          <span>🐱</span>
          <span>🦊</span>
          <span>🐻</span>
        </div>
        <p className={styles.deHint}>Hund · Katze · Fuchs · Bär</p>
      </div>
      <button type="button" className="btn-primary" onClick={finishAndGoHome}>
        {t('arena.backHome')}
      </button>
      <button type="button" className="btn-ghost" onClick={() => setScreen('levelWheel')}>
        {t('arena.tryAgain')}
      </button>
    </div>
  );
}
