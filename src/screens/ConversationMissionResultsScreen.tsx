import { useEffect, useRef } from 'react';
import { useApp } from '../modules/Auth/AppContext';
import { calcRoundRewards } from '../modules/Rewards/rewards';
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
  total: number;
  onPlayAgain: () => void;
}

export function ConversationMissionResultsScreen({
  correct,
  sessionXp,
  total,
  onPlayAgain,
}: Props) {
  const { t, setScreen, updateProfile, profile } = useApp();
  const applied = useRef(false);
  const roundSize = Math.max(1, total);
  const base = calcRoundRewards(correct, roundSize, { badgeId: 'gespraechsstern' });
  const ratio = correct / roundSize;
  /** Short scripted missions (5–8 beats) — scale pass/badge vs classic /10 thresholds */
  const rewards = {
    ...base,
    badgeId: ratio >= 0.8 ? 'gespraechsstern' : null,
    mapAdvance: ratio >= 0.7,
  };
  const totalXpGain = Math.max(rewards.xp, sessionXp);
  const passThreshold = Math.ceil(roundSize * 0.7);

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
      profile.streak + (correct >= passThreshold ? 1 : 0),
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
    <div className={`screen fade-in ${styles.wrap}`} data-conversation-results>
      <div className={styles.hero}>
        <div
          className={styles.stars}
          aria-label={t('cm.stars', { n: rewards.stars })}
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
        <h1 className={styles.title}>{t('cm.resultsTitle')}</h1>
        <p className={styles.score}>
          {t('cm.score', { correct, total: roundSize })}
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
          <div className={styles.badge} data-badge="gespraechsstern">
            💬 {t('cm.badge.gespraechsstern')}
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
            ? t('cm.mapAdvanced')
            : t('cm.mapNeedMore', { n: passThreshold })}
        </p>
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          className="btn-primary"
          onClick={onPlayAgain}
          data-play-again
        >
          {t('cm.playAgain')}
        </button>
        <button
          type="button"
          className="btn-blue"
          onClick={() => setScreen('levelWheel')}
          data-next-challenge
        >
          {t('cm.nextChallenge')}
        </button>
        <button
          type="button"
          className="btn-ghost"
          onClick={() => setScreen('home')}
          data-home
        >
          {t('cm.home')}
        </button>
      </div>
    </div>
  );
}
