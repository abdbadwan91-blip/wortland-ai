import { useEffect, useRef } from 'react';
import { useApp } from '../modules/Auth/AppContext';
import { handleNextChallenge } from '../modules/Progression/launchNext';
import { recordPracticeDay } from '../modules/Mastery';
import { recordDailyProgress } from '../modules/Rewards/dailyMission';
import { applySessionBadges } from '../modules/Rewards/badges';
import styles from './PictureMatchResults.module.css';

interface Props {
  seen: number;
  sessionXp: number;
  total: number;
  onPlayAgain: () => void;
}

export function ClassicCardsResultsScreen({
  seen,
  sessionXp,
  total,
  onPlayAgain,
}: Props) {
  const { t, setScreen, updateProfile, profile, selectedLevel, setSelectedMode, setSelectedLevel } = useApp();
  const applied = useRef(false);
  const coins = Math.max(2, Math.floor(seen / 2));

  useEffect(() => {
    if (applied.current) return;
    applied.current = true;

    recordPracticeDay();
    recordDailyProgress({
      rounds: 1,
      correct: 0,
      xp: sessionXp,
    });
    const nextStreak = Math.max(1, profile.streak);
    applySessionBadges({ streak: nextStreak });
    updateProfile({
      xp: profile.xp + sessionXp,
      coins: profile.coins + coins,
      streak: nextStreak,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={`screen fade-in ${styles.wrap}`} data-classic-results>
      <div className={styles.hero}>
        <div className={styles.stars} aria-hidden>
          <span className={styles.starOn}>🃏</span>
        </div>
        <h1 className={styles.title}>{t('modes.classic')}</h1>
        <p className={styles.score} dir="ltr">
          {seen} / {total}
        </p>
        <div className={styles.rewards}>
          <span className={`${styles.pill} ${styles.pillXp}`} dir="ltr">
            ⭐ +{sessionXp}
          </span>
          <span className={`${styles.pill} ${styles.pillCoin}`} dir="ltr">
            🪙 +{coins}
          </span>
        </div>
        <p className={styles.mapNote}>{t('modes.classic.desc')}</p>
      </div>
      <button type="button" className="btn-primary" onClick={onPlayAgain}>
        {t('pm.playAgain')}
      </button>
      <button
        type="button"
        className="btn-blue"
        data-next-challenge
        onClick={() => handleNextChallenge({ setScreen, setSelectedMode, setSelectedLevel }, { currentMode: 'classic', level: selectedLevel || profile.level || 1, passed: true, onRetry: onPlayAgain })}
      >
        {t('pm.nextChallenge')}
      </button>
      <button
        type="button"
        className="btn-ghost"
        onClick={() => setScreen('home')}>
        {t('arena.backHome')}
      </button>
      <button type="button" className="btn-ghost" onClick={() => setScreen('gameModes')}>
        {t('cc.back')}
      </button>
    </div>
  );
}
