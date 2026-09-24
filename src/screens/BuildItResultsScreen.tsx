import { useEffect, useRef } from 'react';
import { useApp } from '../modules/Auth/AppContext';
import { handleNextChallenge } from '../modules/Progression/launchNext';
import {
  BUILD_ROUND_SIZE,
  MAP_PASS_SCORE,
  calcBuildRewards,
} from '../modules/FlashArena/buildIt';
import {
  completeCurrentStage,
  loadMapProgress,
} from '../modules/MapProgress/mapProgress';
import { recordPracticeDay } from '../modules/Mastery';
import { recordDailyProgress } from '../modules/Rewards/dailyMission';
import { applySessionBadges } from '../modules/Rewards/badges';
import type { BuildItStats } from './BuildItScreen';
import styles from './PictureMatchResults.module.css';

interface Props {
  stats: BuildItStats;
  onPlayAgain: () => void;
}

export function BuildItResultsScreen({ stats, onPlayAgain }: Props) {
  const { t, setScreen, updateProfile, profile, selectedLevel, setSelectedMode, setSelectedLevel } = useApp();
  const applied = useRef(false);
  const total = stats.total || BUILD_ROUND_SIZE;
  const rewards = calcBuildRewards(stats.correct, total);
  const totalXpGain = Math.max(rewards.xp, stats.sessionXp);

  useEffect(() => {
    if (applied.current) return;
    applied.current = true;

    recordPracticeDay();
    recordDailyProgress({
      rounds: 1,
      correct: stats.correct,
      xp: totalXpGain,
    });

    let showFalcon = false;
    if (rewards.mapAdvance) {
      const progress = loadMapProgress();
      const result = completeCurrentStage(progress);
      showFalcon = result.showFalcon;
    }

    const nextMap = loadMapProgress();
    const nextStreak = Math.max(
      1,
      profile.streak + (stats.correct >= MAP_PASS_SCORE ? 1 : 0),
    );
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stars = [0, 1, 2].map((i) => i < rewards.stars);

  return (
    <div className={`screen fade-in ${styles.wrap}`} data-build-results>
      <div className={styles.hero}>
        <div
          className={styles.stars}
          aria-label={t('bi.stars', { n: rewards.stars })}
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
        <h1 className={styles.title}>{t('bi.resultsTitle')}</h1>
        <p className={styles.score}>
          {t('bi.score', { correct: stats.correct, total })}
        </p>
        <div className={styles.rewards}>
          <span className={`${styles.pill} ${styles.pillXp}`}>
            ⭐ +{totalXpGain} {t('home.xp')}
          </span>
          <span className={`${styles.pill} ${styles.pillCoin}`}>
            🪙 +{rewards.coins} {t('home.coins')}
          </span>
        </div>
        {rewards.badgeId && (
          <div className={styles.badge} data-badge="satzbauer">
            🧩 {t('bi.badge')}
          </div>
        )}
        <p
          className={
            rewards.mapAdvance
              ? styles.mapNote
              : `${styles.mapNote} ${styles.mapNoteMiss}`
          }
        >
          {rewards.mapAdvance
            ? t('bi.mapAdvanced')
            : t('bi.mapNeedMore', { n: MAP_PASS_SCORE })}
        </p>
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          className="btn-primary"
          onClick={onPlayAgain}
          data-play-again
        >
          {t('bi.playAgain')}
        </button>
        <button
          type="button"
          className="btn-blue"
          onClick={() => handleNextChallenge({ setScreen, setSelectedMode, setSelectedLevel }, { currentMode: 'build', level: selectedLevel || profile.level || 1, passed: Boolean(rewards?.mapAdvance), onRetry: onPlayAgain })}
          data-next-challenge
        >
          {t('bi.nextChallenge')}
        </button>
        <button
          type="button"
          className="btn-ghost"
          onClick={() => setScreen('home')}
          data-home
        >
          {t('bi.home')}
        </button>
      </div>
    </div>
  );
}
