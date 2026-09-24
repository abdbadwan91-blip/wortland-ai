import { useEffect, useRef } from 'react';
import { useApp } from '../modules/Auth/AppContext';
import {
  calcMasterRewards,
  MASTER_ROUND_SIZE,
  MASTER_MAP_PASS_RATIO,
} from '../modules/Rewards/rewards';
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

export function MasterChallengeResultsScreen({
  correct,
  sessionXp,
  onPlayAgain,
}: Props) {
  const { t, setScreen, updateProfile, profile } = useApp();
  const applied = useRef(false);
  const rewards = calcMasterRewards(correct);
  const totalXpGain = Math.max(rewards.xp, sessionXp);
  const passNeed = Math.ceil(MASTER_ROUND_SIZE * MASTER_MAP_PASS_RATIO);

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
      profile.streak + (rewards.mapAdvance ? 1 : 0),
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
    <div className={`screen fade-in ${styles.wrap}`} data-master-results>
      <div className={styles.hero}>
        <div className={styles.trophy} aria-hidden style={{ fontSize: '2.4rem', marginBottom: 4 }}>
          🏆
        </div>
        <div
          className={styles.stars}
          aria-label={t('mc.stars', { n: rewards.stars })}
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
        <h1 className={styles.title}>{t('mc.resultsTitle')}</h1>
        <p className={styles.score}>
          {t('mc.score', { correct, total: MASTER_ROUND_SIZE })}
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
          <div className={styles.badge} data-badge="meister">
            🏆 {t('mc.badge.meister')}
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
            ? t('mc.mapAdvanced')
            : t('mc.mapNeedMore', { n: passNeed })}
        </p>
        <p className={styles.mapNote} style={{ color: 'var(--gold)', marginTop: 6 }}>
          {t('mc.bonusNote')}
        </p>
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          className="btn-primary"
          onClick={onPlayAgain}
          data-play-again
        >
          {t('mc.playAgain')}
        </button>
        <button
          type="button"
          className="btn-blue"
          onClick={() => setScreen('levelWheel')}
          data-next-challenge
        >
          {t('mc.nextChallenge')}
        </button>
        <button
          type="button"
          className="btn-ghost"
          onClick={() => setScreen('home')}
          data-home
        >
          {t('mc.home')}
        </button>
      </div>
    </div>
  );
}
