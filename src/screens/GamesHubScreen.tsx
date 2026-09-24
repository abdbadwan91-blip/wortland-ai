import { useMemo } from 'react';
import { BottomNav } from '../components/BottomNav';
import { useApp, type Screen } from '../modules/Auth/AppContext';
import { getGameModes, type GameModeId } from '../modules/Content/cefr';
import styles from './GamesHubScreen.module.css';
import { assetUrl } from '../modules/Content/assetUrl';

const COMING_SOON = [
  { id: 'conversation', icon: '💬', tone: 'coral' },
  { id: 'sentenceRace', icon: '🏁', tone: 'violet' },
] as const;

type PlayableScreen = Extract<
  Screen,
  | 'pictureMatch'
  | 'quickPick'
  | 'articlePick'
  | 'classicCards'
  | 'memoryFlip'
  | 'buildIt'
  | 'masterChallenge'
  | 'listeningHunt'
  | 'speedRound'
  | 'wordPuzzle'
  | 'conversationMission'
>;

function screenForMode(mode: GameModeId): PlayableScreen {
  const screens: Record<GameModeId, PlayableScreen> = {
    picture: 'pictureMatch',
    quick: 'quickPick',
    article: 'articlePick',
    classic: 'classicCards',
    memory: 'memoryFlip',
    build: 'buildIt',
    master: 'masterChallenge',
    listen: 'listeningHunt',
    speed: 'speedRound',
    puzzle: 'wordPuzzle',
    conversation: 'conversationMission',
  };
  return screens[mode];
}

export function GamesHubScreen() {
  const {
    t,
    profile,
    selectedTopic,
    setScreen,
    setSelectedLevel,
    setSelectedMode,
  } = useApp();
  const level = profile.level || 1;
  const modes = useMemo(() => getGameModes(level), [level]);
  const playableModes = modes.filter((mode) => !mode.locked);
  const lockedModes = modes.filter((mode) => mode.locked).slice(0, 3);

  const openArena = () => {
    setSelectedLevel(level);
    setScreen('gameModes');
  };

  const openMode = (mode: GameModeId) => {
    setSelectedLevel(level);
    setSelectedMode(mode);
    setScreen(screenForMode(mode));
  };

  return (
    <div className={`screen with-nav fade-in ${styles.page}`} data-games-hub>
      <header className={styles.header}>
        <button type="button" className="back-chip" onClick={() => setScreen('home')}>
          ← {t('gamesHub.back')}
        </button>
        <div className={styles.kicker}>
          <span className={styles.kickerDot} aria-hidden>✦</span>
          {t('gamesHub.kicker')}
        </div>
        <div className={styles.titleRow}>
          <div>
            <h1 className={styles.title}>{t('gamesHub.title')}</h1>
            <p className={styles.subtitle}>{t('gamesHub.subtitle')}</p>
          </div>
          <div className={styles.levelBadge}>
            <span aria-hidden>🧭</span>
            <span>{t('gamesHub.level', { n: level })}</span>
          </div>
        </div>
      </header>

      <section className={styles.hero} aria-label={t('gamesHub.hero.title')}>
        <div className={styles.heroCopy}>
          <span className={styles.heroEyebrow}>{t('gamesHub.hero.eyebrow')}</span>
          <h2>{t('gamesHub.hero.title')}</h2>
          <p>{t('gamesHub.hero.desc')}</p>
          <button type="button" className={styles.heroButton} onClick={openArena}>
            {t('gamesHub.hero.cta')} <span aria-hidden>→</span>
          </button>
        </div>
        <div className={styles.heroArt} aria-hidden>
          <span className={styles.sun}>☀</span>
          <span className={`${styles.cloud} ${styles.cloudOne}`}>☁</span>
          <span className={`${styles.cloud} ${styles.cloudTwo}`}>☁</span>
          <span className={styles.heroMascot}>🎮</span>
          <span className={`${styles.sparkle} ${styles.sparkleOne}`}>✦</span>
          <span className={`${styles.sparkle} ${styles.sparkleTwo}`}>✧</span>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="games-play-now">
        <div className={styles.sectionHead}>
          <div>
            <span className={styles.sectionEyebrow}>{t('gamesHub.liveEyebrow')}</span>
            <h2 id="games-play-now">{t('gamesHub.playNow')}</h2>
          </div>
          <span className={styles.countPill}>{playableModes.length}</span>
        </div>
        <p className={styles.sectionIntro}>{t('gamesHub.playNowDesc', { n: level })}</p>

        <div className={styles.modeGrid}>
          {playableModes.map((mode) => (
            <button
              type="button"
              key={mode.id}
              className={styles.modeCard}
              style={{ ['--mode-color' as string]: mode.color }}
              onClick={() => openMode(mode.id)}
              data-game-mode={mode.id}
            >
              <span className={styles.modeIcon} aria-hidden>
                {mode.icon.includes('/') ? (
                  <img src={assetUrl(mode.icon)} alt="" draggable={false} />
                ) : mode.icon}
              </span>
              <span className={styles.modeBody}>
                <span className={styles.modeTopline}>
                  <span className={styles.liveLabel}>{t('gamesHub.live')}</span>
                  <span className={styles.arrow} aria-hidden>↗</span>
                </span>
                <strong>{mode.id === 'speed' ? t('gamesHub.wordRace') : t(`modes.${mode.id}`)}</strong>
                <small>{t(`modes.${mode.id}.desc`)}</small>
              </span>
            </button>
          ))}
        </div>

        {playableModes.length === 0 && (
          <div className={styles.emptyLive}>
            <span aria-hidden>🌱</span>
            <p>{t('gamesHub.emptyLive')}</p>
          </div>
        )}
      </section>

      <section className={`${styles.section} ${styles.comingSection}`} aria-labelledby="games-coming-soon">
        <div className={styles.sectionHead}>
          <div>
            <span className={styles.sectionEyebrow}>{t('gamesHub.nextEyebrow')}</span>
            <h2 id="games-coming-soon">{t('gamesHub.comingSoon')}</h2>
          </div>
          <span className={styles.compass} aria-hidden>✦</span>
        </div>
        <p className={styles.sectionIntro}>{t('gamesHub.comingDesc')}</p>

        <div className={styles.comingGrid}>
          {lockedModes.map((mode) => (
            <div
              key={mode.id}
              className={`${styles.comingCard} ${styles.lockedCard}`}
              style={{ ['--mode-color' as string]: mode.color }}
              data-coming-mode={mode.id}
            >
              <span className={styles.comingIcon} aria-hidden>{mode.icon}</span>
              <div className={styles.comingBody}>
                <span className={styles.lockLabel}>🔒 {t('gamesHub.unlockAt', { n: mode.minLevel })}</span>
                <strong>{mode.id === 'speed' ? t('gamesHub.wordRace') : t(`modes.${mode.id}`)}</strong>
                <small>{t(`modes.${mode.id}.desc`)}</small>
              </div>
            </div>
          ))}
          {COMING_SOON.map((item) => (
            <div
              key={item.id}
              className={`${styles.comingCard} ${styles.futureCard} ${styles[item.tone]}`}
              data-coming-mode={item.id}
            >
              <span className={styles.comingIcon} aria-hidden>{item.icon}</span>
              <div className={styles.comingBody}>
                <span className={styles.lockLabel}>🔒 {t('gamesHub.soon')}</span>
                <strong>{t(`gamesHub.coming.${item.id}.title`)}</strong>
                <small>{t(`gamesHub.coming.${item.id}.desc`)}</small>
              </div>
            </div>
          ))}
        </div>
      </section>

      <aside className={styles.footerNote}>
        <span aria-hidden>🌟</span>
        <span>{t('gamesHub.footer', { topic: t(`topic.${selectedTopic}`) })}</span>
      </aside>

      <BottomNav />
    </div>
  );
}
