import { useEffect, useRef } from 'react';
import { useApp } from '../modules/Auth/AppContext';
import {
  calcRoundRewards,
  MAP_PASS_SCORE,
} from '../modules/Rewards/rewards';
import { getLevelParams } from '../modules/Content/levelDifficulty';
import {
  completeCurrentStage,
  loadMapProgress,
} from '../modules/MapProgress/mapProgress';
import { recordPracticeDay } from '../modules/Mastery';
import { recordDailyProgress } from '../modules/Rewards/dailyMission';
import { applySessionBadges } from '../modules/Rewards/badges';
import styles from './PictureMatchResults.module.css';

interface Props {
  correct: number;
  sessionXp: number;
  onPlayAgain: () => void;
}

export function ArticlePickResultsScreen({
  correct,
  sessionXp,
  onPlayAgain,
}: Props) {
  const { t, setScreen, updateProfile, profile, selectedLevel } = useApp();
  const applied = useRef(false);
  const roundSize = getLevelParams(selectedLevel).roundSize;
  const rewards = calcRoundRewards(correct, roundSize);
  const totalXpGain = Math.max(rewards.xp, sessionXp);

  useEffect(() => {
    if (applied.current) return;
    applied.current = true;

    recordPracticeDay();
    recordDailyProgress({
      rounds: 1,
      correct,
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
      profile.streak + (correct >= MAP_PASS_SCORE ? 1 : 0),
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
    <div className={`screen fade-in ${styles.wrap}`} data-article-results>
      <div className={styles.hero}>
        <div
          className={styles.stars}
          aria-label={t('ap.stars', { n: rewards.stars })}
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
        <h1 className={styles.title}>{t('ap.resultsTitle')}</h1>
        <p className={styles.score}>
          {t('ap.score', { correct, total: roundSize })}
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
          <div className={styles.badge} data-badge="tierfreund">
            🐾 {t('ap.badge.tierfreund')}
          </div>
        )}
        <p
          className={
            rewards.mapAdvance ? styles.mapNote : `${styles.mapNote} ${styles.mapNoteMiss}`
          }
        >
          {rewards.mapAdvance
            ? t('ap.mapAdvanced')
            : t('ap.mapNeedMore', { n: MAP_PASS_SCORE })}
        </p>
      </div>

      <div className={styles.actions}>
        <button type="button" className="btn-primary" onClick={onPlayAgain} data-play-again>
          {t('ap.playAgain')}
        </button>
        <button
          type="button"
          className="btn-blue"
          onClick={() => setScreen('levelWheel')}
          data-next-challenge
        >
          {t('ap.nextChallenge')}
        </button>
        <button
          type="button"
          className="btn-ghost"
          onClick={() => setScreen('home')}
          data-home
        >
          {t('ap.home')}
        </button>
      </div>
    </div>
  );
}
