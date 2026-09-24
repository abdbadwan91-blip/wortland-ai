import { useEffect, useRef } from 'react';
import { useApp } from '../modules/Auth/AppContext';
import { handleNextChallenge } from '../modules/Progression/launchNext';
import { calcMemoryRewards } from '../modules/FlashArena/memoryFlip';
import {
  completeCurrentStage,
  loadMapProgress,
} from '../modules/MapProgress/mapProgress';
import { recordPracticeDay } from '../modules/Mastery';
import { recordDailyProgress } from '../modules/Rewards/dailyMission';
import { applySessionBadges } from '../modules/Rewards/badges';
import type { MemoryFlipStats } from './MemoryFlipScreen';
import styles from './PictureMatchResults.module.css';

interface Props {
  stats: MemoryFlipStats;
  onPlayAgain: () => void;
}

function formatTime(ms: number): string {
  const secs = Math.floor(ms / 1000);
  return `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`;
}

export function MemoryFlipResultsScreen({ stats, onPlayAgain }: Props) {
  const { t, setScreen, updateProfile, profile, selectedLevel, setSelectedMode, setSelectedLevel } = useApp();
  const applied = useRef(false);
  const rewards = calcMemoryRewards(stats.moves, stats.pairCount);
  const totalXpGain = Math.max(rewards.xp, stats.sessionXp);

  useEffect(() => {
    if (applied.current) return;
    applied.current = true;

    recordPracticeDay();
    recordDailyProgress({
      rounds: 1,
      correct: stats.matched,
      xp: totalXpGain,
    });

    let showFalcon = false;
    if (rewards.mapAdvance) {
      const progress = loadMapProgress();
      const result = completeCurrentStage(progress, selectedLevel);
      showFalcon = result.showFalcon;
    }

    const nextMap = loadMapProgress();
    const nextStreak = Math.max(1, profile.streak + (rewards.stars >= 2 ? 1 : 0));
    applySessionBadges({ badgeId: rewards.badgeId, streak: nextStreak });
    updateProfile({
      xp: profile.xp + totalXpGain,
      coins: profile.coins + rewards.coins,
      streak: nextStreak,
      level: Math.max(
        profile.level,
        rewards.mapAdvance ? Math.min(20, nextMap.unlockedStage) : profile.level,
      ),
    });

    if (showFalcon) {
      window.dispatchEvent(new CustomEvent('wortland:falcon'));
    }
    // Apply rewards once when results mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stars = [0, 1, 2].map((i) => i < rewards.stars);

  return (
    <div className={`screen fade-in ${styles.wrap}`} data-memory-results>
      <div className={styles.hero}>
        <div
          className={styles.stars}
          aria-label={t('mf.stars', { n: rewards.stars })}
        >
          {stars.map((on, i) => (
            <span
              key={i}
              className={on ? styles.starOn : styles.starOff}
              aria-hidden
            >
              ⭐
            </span>
          ))}
        </div>
        <h1 className={styles.title}>{t('mf.resultsTitle')}</h1>
        <p className={styles.score}>
          {t('mf.score', {
            matched: stats.matched,
            total: stats.pairCount,
          })}
        </p>
        <div className={styles.rewards}>
          <span className={`${styles.pill} ${styles.pillXp}`}>
            ⭐ +{totalXpGain} {t('home.xp')}
          </span>
          <span className={`${styles.pill} ${styles.pillCoin}`}>
            🪙 +{rewards.coins} {t('home.coins')}
          </span>
        </div>
        <p className={styles.score} dir="ltr" style={{ marginTop: 4 }}>
          🔄 {t('mf.moves', { n: stats.moves })} · ⏱️ {formatTime(stats.elapsedMs)}
        </p>
        {rewards.badgeId && (
          <div className={styles.badge} data-badge="memory-champ">
            🧠 {t('mf.badge')}
          </div>
        )}
        <p
          className={
            rewards.mapAdvance
              ? styles.mapNote
              : `${styles.mapNote} ${styles.mapNoteMiss}`
          }
        >
          {rewards.mapAdvance ? t('mf.mapAdvanced') : t('mf.mapNeedMore')}
        </p>
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          className="btn-primary"
          onClick={onPlayAgain}
          data-play-again
        >
          {t('mf.playAgain')}
        </button>
        <button
          type="button"
          className="btn-blue"
          onClick={() => handleNextChallenge({ setScreen, setSelectedMode, setSelectedLevel }, { currentMode: 'memory', level: selectedLevel || profile.level || 1, passed: Boolean(rewards?.mapAdvance), onRetry: onPlayAgain })}
          data-next-challenge
        >
          {t('mf.nextChallenge')}
        </button>
        <button
          type="button"
          className="btn-ghost"
          onClick={() => setScreen('home')}
          data-home
        >
          {t('mf.home')}
        </button>
      </div>
    </div>
  );
}
