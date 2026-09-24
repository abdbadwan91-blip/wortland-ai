import { useCallback, useEffect, useRef, useState } from 'react';
import { useApp } from '../modules/Auth/AppContext';
import { getAvatar } from '../data/avatars';
import { PlayerAvatar, useEquippedTitleKey } from '../components/PlayerAvatar';
import { cefrColor, cefrLabelKey, levelToCefr } from '../modules/Content/cefr';
import { BottomNav } from '../components/BottomNav';
import { QuestMap } from '../components/QuestMap/QuestMap';
import { FalconTransition } from '../components/QuestMap/FalconTransition';
import {
  loadMapProgress,
  type MapProgress,
} from '../modules/MapProgress/mapProgress';
import {
  allGoalsComplete,
  BONUS_CLAIM_COINS,
  claimAllDailyRewards,
  claimDailyGoal,
  GOAL_CLAIM_COINS,
  goalProgressPct,
  isGoalComplete,
  loadDailyMission,
  type DailyGoal,
  type DailyGoalId,
  type DailyMissionState,
} from '../modules/Rewards/dailyMission';
import { getStreakStats, getWeakWordCount } from '../modules/Mastery';
import {
  getEarnedCount,
  listRecentEarned,
} from '../modules/Rewards/badges';
import { SMART_TOPIC_ID } from '../modules/FlashArena/quickPick';
import styles from './HomeScreen.module.css';
import { mapTopic } from '../modules/MapProgress/mapTopics';

const FEATURES = [
  { id: 'journey', iconSrc: `${import.meta.env.BASE_URL}ui/home/home-cards.png`, key: 'home.continueLearning', action: 'levelWheel' as const },
  { id: 'games', iconSrc: `${import.meta.env.BASE_URL}ui/home/home-games.png`, key: 'home.feature.games', action: 'games' as const },
  { id: 'daily', iconSrc: `${import.meta.env.BASE_URL}ui/home/home-daily.png`, key: 'home.feature.daily', action: 'daily' as const },
  { id: 'challenges', iconSrc: `${import.meta.env.BASE_URL}ui/home/home-challenges.png`, key: 'home.feature.challenges', action: null },
  { id: 'family', iconSrc: `${import.meta.env.BASE_URL}ui/home/home-family.png`, key: 'home.feature.family', action: 'family' as const },
  { id: 'board', iconSrc: `${import.meta.env.BASE_URL}ui/home/home-leaderboard.png`, key: 'home.feature.leaderboard', action: null },
  { id: 'stats', iconSrc: `${import.meta.env.BASE_URL}ui/home/home-stats.png`, key: 'home.feature.stats', action: 'progress' as const },
  { id: 'shop', iconSrc: `${import.meta.env.BASE_URL}ui/home/home-shop.png`, key: 'home.feature.shop', action: 'shop' as const },
];

const GOAL_ICONS: Record<DailyGoalId, string> = {
  rounds: '⚡',
  correct: '✅',
  xp: '⭐',
};

export function HomeScreen() {
  const {
    t,
    profile,
    setScreen,
    setSelectedLevel,
    setSelectedTopic,
    setSelectedMode,
    updateProfile,
  } = useApp();
  const avatar = getAvatar(profile.avatarId);
  const equippedTitle = useEquippedTitleKey();
  const level = profile.level || 1;
  const cefr = levelToCefr(level);
  const xpPct = Math.min(100, profile.xp % 100);
  const streak = getStreakStats().current;

  const [mapProgress, setMapProgress] = useState<MapProgress>(() => loadMapProgress());
  const [showFalcon, setShowFalcon] = useState(false);
  const [scrollZone, setScrollZone] = useState<'mountain' | 'forest' | undefined>();
  const [daily, setDaily] = useState<DailyMissionState>(() => loadDailyMission());
  const [weakCount, setWeakCount] = useState(() => getWeakWordCount());
  const [recentBadges, setRecentBadges] = useState(() => listRecentEarned(4));
  const [badgeCount, setBadgeCount] = useState(() => getEarnedCount());
  const [missionExpanded, setMissionExpanded] = useState(true);
  const missionRef = useRef<HTMLElement | null>(null);

  const refreshDaily = useCallback(() => {
    setDaily(loadDailyMission());
    setWeakCount(getWeakWordCount());
    setRecentBadges(listRecentEarned(4));
    setBadgeCount(getEarnedCount());
  }, []);

  useEffect(() => {
    setMapProgress(loadMapProgress());
    refreshDaily();
    // Keep header visible — avoid residual scroll from prior screens
    const screen = document.querySelector('.screen');
    if (screen) screen.scrollTop = 0;
  }, [refreshDaily]);

  useEffect(() => {
    const onFalcon = () => {
      setMapProgress(loadMapProgress());
      setShowFalcon(true);
      setScrollZone('forest');
    };
    window.addEventListener('wortland:falcon', onFalcon);
    return () => window.removeEventListener('wortland:falcon', onFalcon);
  }, []);

  useEffect(() => {
    const onDaily = () => refreshDaily();
    window.addEventListener('wortland:daily', onDaily);
    return () => window.removeEventListener('wortland:daily', onDaily);
  }, [refreshDaily]);

  const openStage = useCallback(
    (stage: number) => {
      const wheelLevel = ((stage - 1) % 20) + 1;
      setSelectedLevel(wheelLevel);
      setSelectedTopic(mapTopic(stage).id);
      setScreen('journeyStage');
    },
    [setScreen, setSelectedLevel, setSelectedTopic],
  );

  const continueLearning = () => {
    openStage(mapProgress.unlockedStage);
  };

  const scrollToMission = useCallback(() => {
    setMissionExpanded(true);
    requestAnimationFrame(() => {
      missionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, []);

  const onFeatureClick = (f: (typeof FEATURES)[number]) => {
    if (f.action === 'shop') {
      setScreen('shop');
      return;
    }
    if (f.action === 'daily') {
      scrollToMission();
      return;
    }
    if (f.action) setScreen(f.action);
  };

  const handleClaimGoal = (id: DailyGoalId) => {
    const { coins, state } = claimDailyGoal(id);
    setDaily(state);
    if (coins > 0) {
      updateProfile({ coins: profile.coins + coins });
    }
  };

  const handleClaimBonus = () => {
    const { coins, state } = claimAllDailyRewards();
    setDaily(state);
    if (coins > 0) {
      updateProfile({ coins: profile.coins + coins });
    }
  };

  const startSmartTraining = useCallback(() => {
    if (weakCount <= 0) return;
    setSelectedTopic(SMART_TOPIC_ID);
    setSelectedMode('quick');
    setSelectedLevel(Math.max(2, profile.level || 2));
    setScreen('quickPick');
  }, [
    weakCount,
    setSelectedTopic,
    setSelectedMode,
    setSelectedLevel,
    setScreen,
    profile.level,
  ]);

  const goalsDone = allGoalsComplete(daily);
  const bonusReady = goalsDone && !daily.bonusClaimed;
  const journeyStage = mapProgress.unlockedStage;
  const journeyLevel = ((journeyStage - 1) % 20) + 1;
  const journeyCefr = levelToCefr(journeyLevel);

  return (
    <div className="screen with-nav fade-in">
      <header className={styles.top}>
        <div className={styles.row1}>
          <div className={styles.identity}>
            <button
              type="button"
              className={styles.avatarBtn}
              onClick={() => setScreen('shop')}
              aria-label={t('shop.title')}
              data-open-shop-avatar
            >
              <PlayerAvatar avatarId={profile.avatarId} size={52} showBadge showSticker />
            </button>
            <div>
              <p className={styles.greet}>{profile.name || '—'}</p>
              {equippedTitle && (
                <p className={styles.shopTitle} data-equipped-title>{t(equippedTitle)}</p>
              )}
              <p className={styles.meta}>
                <span
                  className={styles.cefrPill}
                  style={{ background: cefrColor(cefr) }}
                >
                  {t('home.level', { n: level })} · {t(cefrLabelKey(cefr))}
                </span>
              </p>
            </div>
          </div>
          <div className={styles.stats}>
            <span className={styles.stat} title={t('home.streak')} aria-label={`${t('home.streak')}: ${streak}`}>🔥 {streak}</span>
            <button type="button" className={styles.stat} onClick={() => setScreen('shop')} data-open-shop-coins aria-label={t('shop.title')}>
              🪙 {profile.coins}
            </button>
          </div>
        </div>
        <div className={styles.xpRow}>
          <span>⭐ {profile.xp} XP</span>
          <div className={styles.xpTrack}>
            <div className={styles.xpFill} style={{ width: `${xpPct}%` }} />
          </div>
        </div>
      </header>

      <section className={styles.journeyIntro} aria-label={t('home.map.title')}>
        <div className={styles.journeyCopy}>
          <span className={styles.journeyKicker}>WortLand AI</span>
          <h2 className={styles.journeyTitle}>{t('home.map.title')}</h2>
          <p className={styles.journeyMeta}>
            {t('map.stage', { n: journeyStage })} · {t('home.level', { n: journeyLevel })} · {t(cefrLabelKey(journeyCefr))}
          </p>
          <div className={styles.journeyStatus}>
            <span className={styles.readyDot} aria-hidden />
            <span>{t('home.continueLearning')}</span>
          </div>
        </div>
        <button type="button" className={styles.journeyPlay} onClick={continueLearning}>
          ▶
        </button>
      </section>

      <section className={styles.mapSection} aria-label={t('home.map.title')}>
        <QuestMap
          progress={mapProgress}
          mountainTitle={t('map.zone.mountain')}
          forestTitle={t('map.zone.forest')}
          stageLabel={(n) => t('map.stage', { n })}
          forestStageLabel={(n) => t('map.forest.stage', { n })}
          lockedLabel={t('map.locked')}
          onSelect={openStage}
          scrollToZone={scrollZone}
          language={profile.appLanguage}
        />
        <button
          type="button"
          className={`btn-primary ${styles.continueBtn}`}
          onClick={continueLearning}
        >
          {t('home.continueLearning')}
        </button>
      </section>

      <section
        ref={missionRef}
        className={styles.mission}
        data-daily-mission
        aria-label={t('daily.title')}
      >
        <button
          type="button"
          className={styles.missionHead}
          onClick={() => setMissionExpanded((v) => !v)}
          aria-expanded={missionExpanded}
        >
          <span className={styles.missionIcon} aria-hidden>
            <img src={`${import.meta.env.BASE_URL}ui/home/home-daily.png`} alt="" width={44} height={44} />
          </span>
          <div className={styles.missionTitles}>
            <strong>{t('daily.title')}</strong>
            <span className={styles.missionSub}>{t('daily.subtitle')}</span>
          </div>
          <span className={styles.missionChevron} aria-hidden>
            {missionExpanded ? '▾' : '▸'}
          </span>
        </button>

        {missionExpanded && (
          <div className={styles.missionBody}>
            {daily.goals.map((goal) => (
              <GoalRow
                key={goal.id}
                goal={goal}
                label={t(`daily.goal.${goal.id}`, {
                  n: goal.target,
                })}
                claimLabel={t('daily.claim', { n: GOAL_CLAIM_COINS[goal.id] })}
                claimedLabel={t('daily.claimed')}
                onClaim={() => handleClaimGoal(goal.id)}
              />
            ))}

            <div className={styles.bonusRow}>
              <div className={styles.bonusText}>
                <span aria-hidden>🎁</span>
                <div>
                  <strong>{t('daily.bonus')}</strong>
                  <span className={styles.missionSub}>
                    {t('daily.bonus.hint', { n: BONUS_CLAIM_COINS })}
                  </span>
                </div>
              </div>
              {daily.bonusClaimed ? (
                <span className={styles.claimedPill}>{t('daily.claimed')}</span>
              ) : bonusReady ? (
                <button
                  type="button"
                  className={styles.claimBtn}
                  onClick={handleClaimBonus}
                  data-claim-bonus
                >
                  {t('daily.claimAll', { n: BONUS_CLAIM_COINS })}
                </button>
              ) : (
                <span className={styles.bonusLocked}>{t('daily.bonus.locked')}</span>
              )}
            </div>
          </div>
        )}
      </section>


      <section
        className={`${styles.smartCard} ${weakCount <= 0 ? styles.smartEmpty : ''}`}
        aria-label={t('smart.title')}
        data-smart-training
      >
        <div className={styles.smartIcon} aria-hidden>
          🧠
        </div>
        <div className={styles.smartBody}>
          <strong className={styles.smartTitle}>{t('smart.title')}</strong>
          <span className={styles.smartDesc}>
            {weakCount > 0
              ? t('smart.desc', { n: weakCount })
              : t('smart.empty')}
          </span>
        </div>
        <button
          type="button"
          className={styles.smartBtn}
          onClick={startSmartTraining}
          disabled={weakCount <= 0}
          data-smart-start
        >
          {t('smart.start')}
        </button>
      </section>

      <button
        type="button"
        className={styles.badgesTeaser}
        onClick={() => setScreen('profile')}
        data-badges-teaser
        aria-label={t('home.badges.teaser')}
      >
        <span className={styles.badgesTeaserLabel}>{t('home.badges.teaser')}</span>
        <span className={styles.badgesTeaserIcons} aria-hidden>
          {recentBadges.length > 0 ? (
            <>
              {recentBadges.map((b) => (
                <span key={b.id} className={styles.badgesTeaserEmoji}>
                  {b.emoji}
                </span>
              ))}
              {badgeCount > recentBadges.length && (
                <span className={styles.badgesTeaserMore}>
                  {t('home.badges.more', { n: badgeCount - recentBadges.length })}
                </span>
              )}
            </>
          ) : (
            <span className={styles.badgesTeaserEmpty}>{t('home.badges.empty')}</span>
          )}
        </span>
        <span className={styles.badgesTeaserChevron} aria-hidden>
          ›
        </span>
      </button>

      <section className={styles.features}>
        {FEATURES.map((f) => (
          <button
            key={f.id}
            type="button"
            className={styles.feature}
            onClick={() => onFeatureClick(f)}
            data-feature={f.id}
          >
            <span className={styles.fIcon} aria-hidden>
              <img src={f.iconSrc} alt="" width={56} height={56} />
            </span>
            <span className={styles.fLabel}>{t(f.key)}</span>
            {!f.action && <span className={styles.soon}>{t('home.feature.soon')}</span>}
          </button>
        ))}
      </section>

      <BottomNav />

      {showFalcon && (
        <FalconTransition
          avatarEmoji={avatar?.emoji || '🧒'}
          title={t('map.falcon.title')}
          skipLabel={t('map.falcon.skip')}
          onDone={() => setShowFalcon(false)}
        />
      )}
    </div>
  );
}

function GoalRow({
  goal,
  label,
  claimLabel,
  claimedLabel,
  onClaim,
}: {
  goal: DailyGoal;
  label: string;
  claimLabel: string;
  claimedLabel: string;
  onClaim: () => void;
}) {
  const pct = goalProgressPct(goal);
  const done = isGoalComplete(goal);
  const shown = Math.min(goal.progress, goal.target);

  return (
    <div
      className={`${styles.goalRow} ${done ? styles.goalDone : ''}`}
      data-goal={goal.id}
      data-complete={done ? '1' : '0'}
    >
      <div className={styles.goalTop}>
        <span className={styles.goalIcon} aria-hidden>
          {GOAL_ICONS[goal.id]}
        </span>
        <div className={styles.goalMeta}>
          <span className={styles.goalLabel}>{label}</span>
          <span className={styles.goalCount} dir="ltr">
            {shown}/{goal.target}
          </span>
        </div>
        {goal.claimed ? (
          <span className={styles.claimedPill}>{claimedLabel}</span>
        ) : done ? (
          <button
            type="button"
            className={styles.claimBtn}
            onClick={onClaim}
            data-claim={goal.id}
          >
            {claimLabel}
          </button>
        ) : null}
      </div>
      <div className={styles.goalTrack} aria-hidden>
        <div
          className={styles.goalFill}
          style={{ width: `${pct}%` }}
          data-fill={goal.id}
        />
      </div>
    </div>
  );
}
